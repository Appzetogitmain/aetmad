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
const vegImgPath = path.join(brainDir, 'luxury_vegetables_category_1787293433217.jpg');
const fruitImgPath = path.join(brainDir, 'luxury_fruits_category_1787293489863.jpg');
const storeImgPath = path.join(brainDir, 'luxury_grocery_store_1787293461061.jpg');
const dairyImgPath = path.join(brainDir, 'luxury_dairy_category_1787293516910.jpg');

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  // 1. Upload Vegetables Image
  console.log('Uploading Vegetables Image...');
  const resVeg = await cloudinary.uploader.upload(vegImgPath, {
    folder: 'quick-commerce/categories',
    resource_type: 'image',
    overwrite: true,
    timeout: 60000,
    transformation: [{ width: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
  });
  console.log('Vegetables URL:', resVeg.secure_url);

  // 2. Upload Fruits Image
  console.log('Uploading Fruits Image...');
  const resFruit = await cloudinary.uploader.upload(fruitImgPath, {
    folder: 'quick-commerce/categories',
    resource_type: 'image',
    overwrite: true,
    timeout: 60000,
    transformation: [{ width: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
  });
  console.log('Fruits URL:', resFruit.secure_url);

  // 3. Upload Store Image
  console.log('Uploading Store Image...');
  const resStore = await cloudinary.uploader.upload(storeImgPath, {
    folder: 'quick-commerce/sellers',
    resource_type: 'image',
    overwrite: true,
    timeout: 60000,
    transformation: [{ width: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
  });
  console.log('Store URL:', resStore.secure_url);

  // 4. Upload Dairy Image
  console.log('Uploading Dairy Image...');
  const resDairy = await cloudinary.uploader.upload(dairyImgPath, {
    folder: 'quick-commerce/categories',
    resource_type: 'image',
    overwrite: true,
    timeout: 60000,
    transformation: [{ width: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
  });
  console.log('Dairy URL:', resDairy.secure_url);

  const db = mongoose.connection.db;

  // Update quick_categories
  await db.collection('quick_categories').updateOne(
    { name: { $regex: 'vegetables', $options: 'i' } },
    { $set: { image: resVeg.secure_url } }
  );
  await db.collection('quick_categories').updateOne(
    { name: { $regex: '^fruits$', $options: 'i' } },
    { $set: { image: resFruit.secure_url } }
  );
  await db.collection('quick_categories').updateOne(
    { name: { $regex: 'fruits & vegetables', $options: 'i' } },
    { $set: { image: resVeg.secure_url } }
  );
  await db.collection('quick_categories').updateOne(
    { name: { $regex: 'dairy', $options: 'i' } },
    { $set: { image: resDairy.secure_url } }
  );
  console.log('Updated quick_categories in MongoDB.');

  // Update quick_sellers
  await db.collection('quick_sellers').updateMany(
    {},
    {
      $set: {
        logo: resStore.secure_url,
        image: resStore.secure_url,
        shopImage: resStore.secure_url,
        coverImage: resStore.secure_url,
        bannerImage: resStore.secure_url,
        images: [resStore.secure_url]
      }
    }
  );
  console.log('Updated quick_sellers in MongoDB.');

  await mongoose.disconnect();
  console.log('All done!');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
