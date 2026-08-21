import { FoodRestaurant } from '../../restaurant/models/restaurant.model.js';
import { FoodItem } from '../../admin/models/food.model.js';
import { FoodCategory } from '../../admin/models/category.model.js';
import { FoodZone } from '../../admin/models/zone.model.js';
import mongoose from 'mongoose';

const zoneToPolygon = (zoneDoc) => {
    const coords = Array.isArray(zoneDoc?.coordinates) ? zoneDoc.coordinates : [];
    if (coords.length < 3) return null;

    const ring = coords
        .map((coord) => [Number(coord.longitude), Number(coord.latitude)])
        .filter((pair) => pair.every((value) => Number.isFinite(value)));

    if (ring.length < 3) return null;

    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push(first);
    }

    return { type: 'Polygon', coordinates: [ring] };
};

const buildZoneRestaurantConstraint = async (zoneIdRaw) => {
    const trimmedZoneId = String(zoneIdRaw || '').trim();
    if (!trimmedZoneId || !mongoose.Types.ObjectId.isValid(trimmedZoneId)) {
        return null;
    }

    const zoneClauses = [{ zoneId: new mongoose.Types.ObjectId(trimmedZoneId) }];
    const zoneDoc = await FoodZone.findOne({ _id: trimmedZoneId, isActive: true }).lean();
    const polygon = zoneToPolygon(zoneDoc);
    if (polygon) {
        zoneClauses.push({ location: { $geoWithin: { $geometry: polygon } } });
    }

    return { $or: zoneClauses };
};

/**
 * Unified Search Service
 * Searches for restaurants by name and also searches for food items, 
 * returning matched restaurants with potential dish highlights.
 */
export const searchUnified = async (query = {}, options = {}) => {
    const { 
        q, 
        lat, 
        lng, 
        radiusKm = 20, 
        categoryId, 
        minRating, 
        maxDeliveryTime, 
        isVeg,
        page = 1,
        limit = 20,
        zoneId
    } = query;

    const skip = (page - 1) * limit;
    const term = String(q || '').trim();
    const regex = term ? new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

    // 1. Initial Filter (approved status and basic conditions)
    const restaurantFilter = { status: 'approved' };
    
    console.log(`[Search-Service] Querying with term: "${term}", categoryId: "${categoryId}", zoneId: "${zoneId}"`);

    const zoneConstraint = await buildZoneRestaurantConstraint(zoneId);
    if (zoneConstraint) {
        restaurantFilter.$and = [...(restaurantFilter.$and || []), zoneConstraint];
    }

    if (isVeg === 'true') {
        restaurantFilter.pureVegRestaurant = true;
    }

    if (minRating) {
        restaurantFilter.rating = { $gte: parseFloat(minRating) };
    }

    if (maxDeliveryTime) {
        restaurantFilter.estimatedDeliveryTimeMinutes = { $lte: parseInt(maxDeliveryTime) };
    }
    
    console.log(`[Search-Service] Final Restaurant Filter:`, JSON.stringify(restaurantFilter));

    let restaurantIds = new Set();
    let restaurantDetailsMap = new Map();

    // 2. Handle Category Filtering (Restaurants don't have categoryId, FoodItems do)
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
        const catFoodItems = await FoodItem.find({ 
            categoryId: new mongoose.Types.ObjectId(categoryId),
            approvalStatus: 'approved' 
        }).select('restaurantId').lean();
        
        const catRestaurantIds = [...new Set(catFoodItems.map(f => f.restaurantId.toString()))];
        if (catRestaurantIds.length > 0) {
            restaurantFilter._id = { $in: catRestaurantIds.map(id => new mongoose.Types.ObjectId(id)) };
        } else {
            // No food items in this category -> No restaurants
            return {
                success: true,
                data: { restaurants: [], total: 0, page: parseInt(page), limit: parseInt(limit) }
            };
        }
    }

    // 3. Search Matching
    let matchedDishesList = [];

    if (regex) {
        // A. Search by Restaurant Name / Cuisine / City / Tags
        const matchedRestaurants = await FoodRestaurant.find({
            ...restaurantFilter,
            $or: [
                { restaurantName: { $regex: regex } },
                { name: { $regex: regex } },
                { cuisines: { $regex: regex } },
                { 'location.address': { $regex: regex } },
                { 'location.city': { $regex: regex } },
                { tags: { $regex: regex } }
            ]
        }).limit(limit * 2).lean();

        matchedRestaurants.forEach(r => {
            restaurantIds.add(r._id.toString());
            restaurantDetailsMap.set(r._id.toString(), { 
                ...r, 
                id: r._id.toString(),
                name: r.restaurantName || r.name,
                matchType: 'restaurant' 
            });
        });

        // B. Search by Food Item Name / Description / Category
        const foodFilters = { approvalStatus: 'approved', isAvailable: { $ne: false } };
        if (isVeg === 'true') foodFilters.foodType = 'Veg';
        
        const matchedFoods = await FoodItem.find({
            ...foodFilters,
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } },
                { categoryName: { $regex: regex } },
                { category: { $regex: regex } }
            ]
        }).limit(limit * 3).lean();

        // Fetch associated restaurants for matched dishes
        const foodRestaurantIds = [...new Set(matchedFoods.map(f => f.restaurantId ? f.restaurantId.toString() : '').filter(Boolean))];
        let dishRestaurantsMap = new Map();
        
        if (foodRestaurantIds.length > 0) {
            const dishRestaurants = await FoodRestaurant.find({
                status: 'approved',
                _id: { $in: foodRestaurantIds.map(id => new mongoose.Types.ObjectId(id)) }
            }).lean();

            dishRestaurants.forEach(r => {
                dishRestaurantsMap.set(r._id.toString(), r);
                // Also add to restaurants set if not already present
                if (!restaurantIds.has(r._id.toString())) {
                    restaurantIds.add(r._id.toString());
                    restaurantDetailsMap.set(r._id.toString(), {
                        ...r,
                        id: r._id.toString(),
                        name: r.restaurantName || r.name,
                        matchType: 'food'
                    });
                }
            });
        }

        matchedDishesList = matchedFoods.map(food => {
            const rest = dishRestaurantsMap.get(food.restaurantId?.toString()) || restaurantDetailsMap.get(food.restaurantId?.toString()) || {};
            const price = Number(food.price || food.displayPrice || (food.variants && food.variants[0]?.price) || 0);
            return {
                _id: food._id,
                id: food._id.toString(),
                name: food.name,
                description: food.description || '',
                price: price,
                image: food.image || '',
                foodType: food.foodType || 'Veg',
                isVeg: String(food.foodType || '').toLowerCase() === 'veg',
                isAvailable: food.isAvailable !== false,
                rating: food.rating || 4.5,
                preparationTime: food.preparationTime || rest.estimatedDeliveryTimeMinutes ? `${rest.estimatedDeliveryTimeMinutes} mins` : '20-25 mins',
                restaurantId: rest._id ? rest._id.toString() : food.restaurantId?.toString(),
                restaurantName: rest.restaurantName || rest.name || 'Restaurant',
                restaurantImage: rest.profileImage || rest.image || rest.logo || '',
                restaurantSlug: rest.slug || (rest.restaurantName || rest.name || '').toLowerCase().replace(/\s+/g, '-'),
                deliveryTime: rest.estimatedDeliveryTimeMinutes ? `${rest.estimatedDeliveryTimeMinutes} mins` : '25-30 mins'
            };
        });
    } else {
        // No search text -> List all restaurants matching filters (category/zone)
        const allMatching = await FoodRestaurant.find(restaurantFilter)
            .sort({ rating: -1, createdAt: -1 })
            .limit(limit * 2)
            .lean();
            
        allMatching.forEach(r => {
            restaurantIds.add(r._id.toString());
            restaurantDetailsMap.set(r._id.toString(), {
                ...r,
                id: r._id.toString(),
                name: r.restaurantName || r.name
            });
        });
    }

    // 4. Final Result Formatting
    let results = Array.from(restaurantDetailsMap.values());

    // Simple distance sorting if lat/lng are provided
    if (lat && lng && results.length > 0) {
        results.forEach(res => {
            if (res.location && res.location.latitude && res.location.longitude) {
                const dLat = (res.location.latitude - lat) * Math.PI / 180;
                const dLon = (res.location.longitude - lng) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                          Math.cos(lat * Math.PI / 180) * Math.cos(res.location.latitude * Math.PI / 180) *
                          Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                res.distanceScore = 6371 * c; // Km
            } else {
                res.distanceScore = 999;
            }
        });
        results.sort((a, b) => (a.distanceScore || 999) - (b.distanceScore || 999));
    }

    const finalResult = {
        success: true,
        data: {
            restaurants: results.slice(skip, skip + limit),
            dishes: matchedDishesList,
            totalRestaurants: results.length,
            totalDishes: matchedDishesList.length,
            total: results.length + matchedDishesList.length,
            page: parseInt(page),
            limit: parseInt(limit),
            zoneFiltered: !!(zoneId && mongoose.Types.ObjectId.isValid(zoneId))
        }
    };

    return finalResult;
};

/**
 * Fetch Admin-only categories
 */
export const getAdminCategories = async (query = {}) => {
    const filter = { 
        isActive: true, 
        isApproved: true,
        $or: [
            { restaurantId: { $exists: false } },
            { restaurantId: null },
            { restaurantId: { $eq: undefined } }
        ]
    };

    if (query.zoneId && mongoose.Types.ObjectId.isValid(query.zoneId)) {
        filter.$or = [
            { zoneId: new mongoose.Types.ObjectId(query.zoneId) },
            { zoneId: { $exists: false } },
            { zoneId: null }
        ];
    }

    const categories = await FoodCategory.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
    return categories;
};
