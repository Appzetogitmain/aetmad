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

async function scan() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('MongoDB connected.');
  const collections = await mongoose.connection.db.listCollections().toArray();

  const report = {};

  for (const col of collections) {
    const docs = await mongoose.connection.db.collection(col.name).find().toArray();
    docs.forEach(doc => {
      const keys = ['image', 'images', 'imageUrl', 'profileImage', 'coverImages', 'menuImages', 'logo', 'banner', 'bannerImage', 'shopImage', 'icon', 'upiQrImage', 'shopLicenseImage'];
      keys.forEach(k => {
        if (doc[k]) {
          if (!report[col.name]) report[col.name] = [];
          report[col.name].push({
            id: doc._id,
            field: k,
            value: doc[k]
          });
        }
      });
    });
  }

  console.log('=== ALL IMAGE FIELDS IN DATABASE ===');
  for (const [col, items] of Object.entries(report)) {
    console.log(`\nCollection: ${col} (${items.length} image fields)`);
    items.slice(0, 15).forEach(item => {
      console.log(`  - [${item.field}]`, item.value);
    });
    if (items.length > 15) {
      console.log(`  ... and ${items.length - 15} more`);
    }
  }

  await mongoose.disconnect();
}

scan().catch(console.error);
