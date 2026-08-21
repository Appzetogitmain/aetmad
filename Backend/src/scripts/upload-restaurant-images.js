import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const brainDir = 'C:\\Users\\MAYAN\\.gemini\\antigravity-ide\\brain\\a7c683ae-601a-488d-afcf-d7510cfb333b';
const restaurantImgPath = path.join(brainDir, 'luxury_restaurant_cover_1787292538652.jpg');
const foodImgPath = path.join(brainDir, 'luxury_masala_papad_1787292561171.jpg');

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  // 1. Upload Restaurant Image
  console.log('Uploading Luxury Restaurant Cover Image to Cloudinary...');
  const resRestaurant = await cloudinary.uploader.upload(restaurantImgPath, {
    folder: 'food/restaurants',
    resource_type: 'image',
    overwrite: true,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  });
  console.log('Restaurant Cover Uploaded:', resRestaurant.secure_url);

  // 2. Upload Food Dish Image
  console.log('Uploading Luxury Masala Papad Image to Cloudinary...');
  const resFood = await cloudinary.uploader.upload(foodImgPath, {
    folder: 'food/items',
    resource_type: 'image',
    overwrite: true,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  });
  console.log('Food Dish Uploaded:', resFood.secure_url);

  // 3. Update Restaurant in MongoDB
  const restColl = mongoose.connection.db.collection('food_restaurants');
  await restColl.updateMany(
    {},
    {
      $set: {
        profileImage: resRestaurant.secure_url,
        logo: resRestaurant.secure_url,
        banner: resRestaurant.secure_url,
        image: resRestaurant.secure_url,
        coverImages: [
          { url: resRestaurant.secure_url, label: 'Main Dining Hall', publicId: resRestaurant.public_id }
        ],
        menuImages: [
          { url: resRestaurant.secure_url, label: 'Ambiance', publicId: resRestaurant.public_id }
        ],
        updatedAt: new Date()
      }
    }
  );
  console.log('Updated restaurant documents in MongoDB.');

  // 4. Update Food Items
  const itemsColl = mongoose.connection.db.collection('food_items');
  await itemsColl.updateMany(
    {},
    {
      $set: {
        image: resFood.secure_url,
        images: [resFood.secure_url],
        updatedAt: new Date()
      }
    }
  );
  console.log('Updated food items in MongoDB.');

  // 5. Update Categories
  const catColl = mongoose.connection.db.collection('food_categories');
  await catColl.updateMany(
    {},
    {
      $set: {
        image: resFood.secure_url,
        icon: resFood.secure_url,
        updatedAt: new Date()
      }
    }
  );
  console.log('Updated food categories in MongoDB.');

  await mongoose.disconnect();
  console.log('All restaurant and food images successfully uploaded and synced!');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
