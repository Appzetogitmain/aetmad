import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
const assetsDir = path.resolve(__dirname, '../../../Frontend/src/modules/Food/assets/explore more icons');

const files = [
  { 
    label: 'Offers', 
    src: path.join(brainDir, 'luxury_offers_icon_1787292335919.jpg'), 
    destName: 'offers.jpg', 
    targetPath: '/food/user/offers' 
  },
  { 
    label: 'Gourmet', 
    src: path.join(brainDir, 'luxury_gourmet_icon_1787292354127.jpg'), 
    destName: 'gourmet.jpg', 
    targetPath: '/food/user/gourmet' 
  },
  { 
    label: 'Collections', 
    src: path.join(brainDir, 'luxury_collections_icon_1787292374583.jpg'), 
    destName: 'collection.jpg', 
    targetPath: '/food/user/collections' 
  }
];

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  const collection = mongoose.connection.db.collection('food_explore_icons');

  for (const item of files) {
    if (fs.existsSync(item.src)) {
      // Copy to assets folder as backup
      fs.copyFileSync(item.src, path.join(assetsDir, item.destName));
      console.log('Copied to local assets:', item.destName);
    }

    console.log(`Uploading ${item.label} to Cloudinary...`);
    const uploadRes = await cloudinary.uploader.upload(item.src, {
      folder: 'food/explore-icons',
      resource_type: 'image',
      overwrite: true,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    console.log(`Uploaded ${item.label} => ${uploadRes.secure_url}`);

    await collection.updateOne(
      { label: item.label },
      {
        $set: {
          label: item.label,
          iconUrl: uploadRes.secure_url,
          publicId: uploadRes.public_id,
          targetPath: item.targetPath,
          isActive: true,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`Updated DB document for ${item.label}`);
  }

  const all = await collection.find().toArray();
  console.log('Explore Icons in DB:', JSON.stringify(all, null, 2));

  await mongoose.disconnect();
  console.log('All luxury images successfully uploaded and synced!');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
