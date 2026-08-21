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

const bannerPath = 'C:\\Users\\MAYAN\\.gemini\\antigravity-ide\\brain\\a7c683ae-601a-488d-afcf-d7510cfb333b\\summer_promo_banner_1787293240813.jpg';

async function run() {
  console.log('Uploading Summer Deals Banner to Cloudinary...');
  const res = await cloudinary.uploader.upload(bannerPath, {
    folder: 'quick-commerce/ads',
    resource_type: 'image',
    overwrite: true,
    timeout: 60000,
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
  });

  console.log('Uploaded =>', res.secure_url);

  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const collection = mongoose.connection.db.collection('quickads');
  const updateRes = await collection.updateMany(
    {},
    {
      $set: {
        title: 'SUMMER 50% OFF',
        imageUrl: res.secure_url,
        isActive: true,
        updatedAt: new Date()
      }
    }
  );

  console.log('Updated quickads in MongoDB:', updateRes.modifiedCount);

  const docs = await collection.find().toArray();
  console.log('All ads in DB:', docs);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
