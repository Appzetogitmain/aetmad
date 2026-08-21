import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const defaultRestaurantImg = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787292587/food/restaurants/bmdmcuad7mgb42lioswj.jpg';
const defaultFoodImg = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787292591/food/items/ejn9ojmm7w7kcxzs35c5.jpg';

async function cleanupOldCloudinary() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;

  // 1. Food Categories
  const catRes = await db.collection('food_categories').updateMany(
    { image: { $regex: 'dpojoqfyj' } },
    { $set: { image: defaultFoodImg } }
  );
  console.log(`Updated ${catRes.modifiedCount} food categories.`);

  // 2. Food Items
  const itemRes = await db.collection('food_items').updateMany(
    { image: { $regex: 'dpojoqfyj' } },
    { $set: { image: defaultFoodImg, images: [defaultFoodImg] } }
  );
  console.log(`Updated ${itemRes.modifiedCount} food items.`);

  // 3. Food Restaurants
  const restRes = await db.collection('food_restaurants').updateMany(
    { profileImage: { $regex: 'dpojoqfyj' } },
    {
      $set: {
        profileImage: defaultRestaurantImg,
        coverImages: [{ url: defaultRestaurantImg, label: 'Main Hall' }],
        menuImages: [{ url: defaultRestaurantImg, label: 'Ambiance' }]
      }
    }
  );
  console.log(`Updated ${restRes.modifiedCount} food restaurants.`);

  // 4. Quick Sellers
  const sellerRes = await db.collection('quick_sellers').updateMany(
    { logo: { $regex: 'dpojoqfyj' } },
    { $set: { logo: defaultRestaurantImg } }
  );
  console.log(`Updated ${sellerRes.modifiedCount} quick sellers.`);

  await mongoose.disconnect();
  console.log('Cleanup completed!');
}

cleanupOldCloudinary().catch(console.error);
