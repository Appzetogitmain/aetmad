import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, FastForward, Clock, Phone, ChefHat, ChevronDown } from 'lucide-react';
import { ActionSlider } from '@/modules/DeliveryV2/components/ui/ActionSlider';
import { useDeliveryStore } from '@/modules/DeliveryV2/store/useDeliveryStore';
import { getHaversineDistance, calculateETA } from '@/modules/DeliveryV2/utils/geo';
import { isMixedOrder, normalizePickupPoints } from '@/modules/DeliveryV2/utils/orderRouting';

/**
 * NewOrderModal - Ported to Original 1:1 Theme with Slider Accept.
 * Matches the Zomato/Swiggy style Green Header + White Card.
 */
export const NewOrderModal = ({ order, onAccept, onReject, onMinimize }) => {
  const { riderLocation } = useDeliveryStore();
  const [timeLeft, setTimeLeft] = useState(30);
  const pickupPoints = normalizePickupPoints(order);
  const primaryPickup = pickupPoints[0] || null;
  const mixedOrder = isMixedOrder(order);

  useEffect(() => {
    if (timeLeft <= 0) {
      onReject();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onReject]);

  const isReturnPickup = order?.type === 'RETURN_PICKUP';

  const { distanceKm, etaMins } = useMemo(() => {
    if (!order) return { distanceKm: null, etaMins: null };

    if (order.type === 'RETURN_PICKUP') {
      return {
        distanceKm: Number(order.pickupDistance || 0).toFixed(1),
        etaMins: 15
      };
    }

    // Get pickup (restaurant/store) location
    const rest = primaryPickup?.location || order.restaurantLocation || order.restaurantId?.location || {};
    const resLat = parseFloat(order.restaurant_lat || order.restaurantLat || rest.latitude || rest.lat);
    const resLng = parseFloat(order.restaurant_lng || order.restaurantLng || rest.longitude || rest.lng);

    // Get customer (delivery) location
    const deliveryAddress = order?.deliveryAddress || {};
    const geoCoords =
      Array.isArray(deliveryAddress?.location?.coordinates) &&
      deliveryAddress.location.coordinates.length >= 2
        ? {
            lng: deliveryAddress.location.coordinates[0],
            lat: deliveryAddress.location.coordinates[1],
          }
        : null;
    const customerLoc = order.customerLocation || order.deliveryLocation || geoCoords || null;
    const custLat = parseFloat(customerLoc?.lat);
    const custLng = parseFloat(customerLoc?.lng);

    // Calculate Restaurant to Customer distance
    if (!isNaN(resLat) && !isNaN(resLng) && !isNaN(custLat) && !isNaN(custLng)) {
      const distM = getHaversineDistance(
        resLat, resLng,
        custLat, custLng
      );
      const km = distM / 1000;
      // Assume 25km/h avg for estimate (roughly 416m/min)
      const mins = Math.ceil(distM / 416) + (order.prepTime || 5);
      
      return { 
        distanceKm: km.toFixed(1), 
        etaMins: mins 
      };
    }

    // Fallback to order provided total distance if locations are missing
    const rawDist = order.deliveryDistanceKm || order.distanceKm;
    const rawEta = order.estimatedTime || order.duration || order.eta;
    
    if (rawDist != null) {
      return { 
        distanceKm: Number(rawDist).toFixed(1), 
        etaMins: rawEta && rawEta > 0 ? Math.ceil(rawEta) : Math.ceil((rawDist * 1000) / 416) + 5
      };
    }

    return { distanceKm: '??', etaMins: order.prepTime || 15 };
  }, [order, primaryPickup]);

  if (!order) return null;

  const earnings = isReturnPickup
    ? (order.expectedEarning || 0)
    : (order.earnings || order.riderEarning || (order.orderAmount ? order.orderAmount * 0.1 : 0));
  const isQuickOrder = String(order?.orderType || order?.serviceType || order?.type || '').trim().toLowerCase() === 'quick';
  const restaurantName =
    order?.dispatchLeg?.sourceName ||
    (isQuickOrder
      ? order?.storeName || order?.sellerName || order?.seller?.shopName || order?.seller?.name || 'Seller store'
      : order?.restaurantName || order?.restaurant_name || order?.restaurantId?.restaurantName || order?.restaurantId?.name || 'Restaurant');
  const restaurantAddress =
    (isQuickOrder
      ? order?.storeAddress || order?.sellerAddress || order?.seller?.location?.address || order?.seller?.location?.formattedAddress
      : order?.restaurantAddress || order?.restaurant_address || order?.restaurantId?.location?.address) ||
    'Address not available';
  const deliveryAddress = order?.deliveryAddress || {};

  const geoCoords =
    Array.isArray(deliveryAddress?.location?.coordinates) &&
    deliveryAddress.location.coordinates.length >= 2
      ? {
          lng: deliveryAddress.location.coordinates[0],
          lat: deliveryAddress.location.coordinates[1],
        }
      : null;

  const customerLocation = order.customerLocation || order.deliveryLocation || geoCoords || null;

  const addressPartsFromSchema = [
    deliveryAddress.street,
    deliveryAddress.additionalDetails,
    deliveryAddress.city,
    deliveryAddress.state,
    deliveryAddress.zipCode,
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean);

  const customerAddress =
    order.customerAddress ||
    order.customer_address ||
    (addressPartsFromSchema.length ? addressPartsFromSchema.join(', ') : '') ||
    (customerLocation?.lat != null && customerLocation?.lng != null
      ? `Lat ${Number(customerLocation.lat).toFixed(5)}, Lng ${Number(customerLocation.lng).toFixed(5)}`
      : 'Location not available');

  const mapsLink =
    customerLocation?.lat != null && customerLocation?.lng != null
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          `${customerLocation.lat},${customerLocation.lng}`,
        )}`
      : null;

  const restaurantPhone = isQuickOrder
    ? order?.storePhone || order?.sellerPhone || order?.seller?.phone || ''
    : order?.restaurantPhone || order?.restaurant_phone || order?.restaurantId?.phone || '';

  const customerPhone = order?.customerPhone || order?.customer_phone || order?.deliveryAddress?.phone || order?.user?.phone || '';

  const pickupStops = isReturnPickup
    ? [
        {
          id: 'return:pickup',
          pickupType: 'return',
          sourceName: order.customerName || 'Customer',
          address: order.customerAddress || 'Customer Address',
          phone: customerPhone
        }
      ]
    : (pickupPoints.length
      ? pickupPoints.map(p => ({ ...p, phone: p.phone || restaurantPhone }))
      : [
          {
            id: order?.dispatchLeg?.legId || 'food:primary',
            pickupType: order?.dispatchLeg?.pickupType === 'quick' || isQuickOrder ? 'quick' : 'food',
            sourceName: order?.dispatchLeg?.sourceName || restaurantName,
            address: order?.dispatchLeg?.address || restaurantAddress,
            phone: order?.dispatchLeg?.phone || restaurantPhone
          },
        ]);

  const cleanAddressText = (text) => {
    if (!text) return 'Address not available';
    const parts = text.split(',').map((s) => s.trim()).filter(Boolean);
    const unique = [];
    for (const part of parts) {
      if (!unique.some((u) => u.toLowerCase() === part.toLowerCase())) {
        unique.push(part);
      }
    }
    return unique.join(', ');
  };

  const formattedCustomerAddress = cleanAddressText(customerAddress);
  const formattedRestaurantAddress = cleanAddressText(restaurantAddress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-end justify-center p-0"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="w-full max-w-lg bg-white dark:bg-[#121212] rounded-t-[32px] overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.4)] flex flex-col"
      >
        {/* Handle / Minimize */}
        <div className="w-full flex justify-center pt-2.5 pb-1 bg-white dark:bg-[#121212] relative z-10">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Premium Header Banner */}
        <div className="bg-gradient-to-r from-[#0B3122] via-[#0f4731] to-[#0B3122] px-6 py-4.5 flex justify-between items-center text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.15em]">
                {isReturnPickup ? 'RETURN PICKUP' : 'INCOMING REQUEST'}
              </span>
              {mixedOrder && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white uppercase tracking-wider">
                  Mixed
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
              <span>₹{Number(earnings || 0).toFixed(2)}</span>
              <span className="text-xs font-semibold text-emerald-300/80">Earning</span>
            </h2>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 text-white shadow-inner">
            <span className="text-xl sm:text-2xl font-black tabular-nums leading-none">{timeLeft}s</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200 mt-0.5">Timer</span>
          </div>
        </div>

        {/* Info Body */}
        <div className="p-5 sm:p-6 pb-8 space-y-5">
          {/* Pickup & Drop Route Section */}
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5 flex gap-3.5">
            {/* Route Track Indicator */}
            <div className="flex flex-col items-center justify-between py-1">
              <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="w-0.5 flex-1 bg-gradient-to-b from-emerald-500 via-gray-300 to-blue-500 my-1 rounded-full" />
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            {/* Addresses Details */}
            <div className="flex-1 space-y-4">
              {/* Pickup Stop */}
              {pickupStops.map((pickup, index) => {
                const isReturn = pickup.pickupType === 'return';
                const isQuickStore = pickup.pickupType === 'quick';
                const pickupLabel = isReturn ? 'Customer Pickup' : (isQuickStore ? 'Store Pickup' : 'Restaurant Pickup');
                const pickupPhone = pickup.phone || restaurantPhone;
                
                return (
                  <div key={pickup.id || `${pickup.pickupType}-${index}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <ChefHat className="w-3.5 h-3.5" />
                        {pickupStops.length > 1 ? `${pickupLabel} ${index + 1}` : pickupLabel}
                      </span>
                      {pickupPhone && (
                        <a 
                          href={`tel:${pickupPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                          title="Call Restaurant"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-gray-900 dark:text-white font-bold text-base leading-snug mt-0.5">
                      {pickup.sourceName || restaurantName}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium line-clamp-1 mt-0.5">
                      {cleanAddressText(pickup.address || formattedRestaurantAddress)}
                    </p>
                  </div>
                );
              })}

              <div className="border-t border-gray-200/60 dark:border-white/5 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {isReturnPickup ? 'Seller Drop' : 'Customer Drop'}
                  </span>
                  {customerPhone && (
                    <a 
                      href={`tel:${customerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                      title="Call Customer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-gray-900 dark:text-white font-bold text-base leading-snug mt-0.5">
                  {isReturnPickup ? (order.sellerName || 'Seller Store') : (order.customerName || 'Customer Location')}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium line-clamp-1 mt-0.5">
                  {formattedCustomerAddress}
                </p>
                {!isReturnPickup && mapsLink && (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Open in Google Maps ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Time & Distance Chips */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">Est. Time</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">{etaMins} MINS</span>
              </div>
            </div>
            
            <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">Distance</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">{distanceKm} KM</span>
              </div>
            </div>
          </div>

          {/* Action Slider & Decline */}
          <div className="space-y-3.5 pt-1">
            <ActionSlider 
              label="Slide to Accept Order" 
              onConfirm={() => onAccept(order)} 
              color="bg-[#0B3122]"
              successLabel="Order Accepted ✓"
            />

            <button 
              type="button"
              onClick={onReject}
              className="w-full text-gray-400 font-extrabold text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors py-1.5 active:scale-95"
            >
              Pass this task
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
