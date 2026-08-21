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

async function uploadFile(filePath, folder) {
  return await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    overwrite: true,
    timeout: 60000,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  });
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;

  // 1. Upload Brand Logo
  console.log('Uploading Brand Logo...');
  const logoPath = path.join(brainDir, 'luxury_aetmad_logo_1787294997838.jpg');
  const resLogo = await uploadFile(logoPath, 'business/logos');
  console.log('Logo uploaded =>', resLogo.secure_url);

  // 2. Upload Cold Drinks Image
  console.log('Uploading Cold Drinks...');
  const coldDrinksPath = path.join(brainDir, 'luxury_cold_drinks_1787295013677.jpg');
  const resDrinks = await uploadFile(coldDrinksPath, 'quick-commerce/categories');
  console.log('Cold Drinks uploaded =>', resDrinks.secure_url);

  // 3. Update common_global_settings
  console.log('Updating common_global_settings...');
  const logoObj = { url: resLogo.secure_url, publicId: resLogo.public_id };
  await db.collection('common_global_settings').updateMany(
    {},
    {
      $set: {
        logo: logoObj,
        favicon: logoObj,
        'moduleThemes.food.logo': logoObj,
        'moduleThemes.quickCommerce.logo': logoObj,
        'portals.delivery.logo': logoObj,
        'portals.restaurant.logo': logoObj,
        'portals.seller.logo': logoObj,
        'portals.user.logo': logoObj,
        updatedAt: new Date()
      }
    }
  );
  console.log('Global settings updated with official Aetmad luxury logo.');

  // 4. Update remaining quick_categories
  console.log('Updating quick_categories...');
  await db.collection('quick_categories').updateOne(
    { name: { $regex: 'cold drinks|juice|beverage', $options: 'i' } },
    { $set: { image: resDrinks.secure_url } }
  );
  
  const vegUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787293567/quick-commerce/categories/nexhkpdpscewwgqvsf0p.jpg';
  const fruitUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787293572/quick-commerce/categories/nbwgwca7mnrfp5sqh9lc.jpg';
  const dairyUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787293580/quick-commerce/categories/vysl1ecvl38hhnl8rqud.jpg';
  const snacksUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787292404/food/explore-icons/uzvhgonhburz23lbr6cs.jpg';
  const instantFoodUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787292591/food/items/ejn9ojmm7w7kcxzs35c5.jpg';

  await db.collection('quick_categories').updateOne(
    { name: { $regex: 'snack|munch', $options: 'i' } },
    { $set: { image: snacksUrl } }
  );
  await db.collection('quick_categories').updateOne(
    { name: { $regex: 'bakery|biscuit', $options: 'i' } },
    { $set: { image: dairyUrl } }
  );
  await db.collection('quick_categories').updateOne(
    { name: { $regex: 'instant|frozen', $options: 'i' } },
    { $set: { image: instantFoodUrl } }
  );

  // 5. Sweep any remaining grofers or dpojoqfyj in DB
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const coll = db.collection(c.name);
    
    // Replace dpojoqfyj
    await coll.updateMany(
      { image: { $regex: 'dpojoqfyj' } },
      { $set: { image: vegUrl } }
    );
    await coll.updateMany(
      { imageUrl: { $regex: 'dpojoqfyj' } },
      { $set: { imageUrl: vegUrl } }
    );
    await coll.updateMany(
      { logo: { $regex: 'dpojoqfyj' } },
      { $set: { logo: resLogo.secure_url } }
    );

    // Replace grofers
    await coll.updateMany(
      { image: { $regex: 'grofers' } },
      { $set: { image: vegUrl } }
    );
  }

  console.log('All images across MongoDB updated to active Cloudinary account!');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
