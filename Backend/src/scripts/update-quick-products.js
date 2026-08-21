import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const vegUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787293567/quick-commerce/categories/nexhkpdpscewwgqvsf0p.jpg';
const fruitUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787293572/quick-commerce/categories/nbwgwca7mnrfp5sqh9lc.jpg';
const dairyUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787293580/quick-commerce/categories/vysl1ecvl38hhnl8rqud.jpg';
const snackUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787292404/food/explore-icons/uzvhgonhburz23lbr6cs.jpg';

async function updateProducts() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  const db = mongoose.connection.db;

  // Replace Grofers / broken URLs in quick_products
  await db.collection('quick_products').updateMany(
    { name: { $regex: 'tomato|onion|coriander|potato|vegetable|veg|peas', $options: 'i' } },
    { $set: { image: vegUrl, images: [vegUrl], mainImage: vegUrl } }
  );

  await db.collection('quick_products').updateMany(
    { name: { $regex: 'butter|dahi|milk|cheese|egg|curd', $options: 'i' } },
    { $set: { image: dairyUrl, images: [dairyUrl], mainImage: dairyUrl } }
  );

  await db.collection('quick_products').updateMany(
    { name: { $regex: 'biscuit|oreo|popcorn|kurkure|chipps|snack|munch', $options: 'i' } },
    { $set: { image: snackUrl, images: [snackUrl], mainImage: snackUrl } }
  );

  await db.collection('quick_products').updateMany(
    { image: { $regex: 'grofers' } },
    { $set: { image: vegUrl, images: [vegUrl], mainImage: vegUrl } }
  );

  console.log('Updated quick_products.');
  await mongoose.disconnect();
}

updateProducts().catch(console.error);
