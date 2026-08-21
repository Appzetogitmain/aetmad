import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function approveAllDishes() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const res = await mongoose.connection.db.collection('food_items').updateMany(
    {},
    {
      $set: {
        approvalStatus: 'approved',
        isAvailable: true,
        inStock: true,
        approvedAt: new Date(),
        updatedAt: new Date()
      }
    }
  );

  console.log(`Approved ${res.modifiedCount} food items in MongoDB.`);

  const items = await mongoose.connection.db.collection('food_items').find().toArray();
  console.log('All food items now:', items.map(i => ({
    name: i.name,
    restaurantId: i.restaurantId,
    approvalStatus: i.approvalStatus,
    isAvailable: i.isAvailable
  })));

  await mongoose.disconnect();
}

approveAllDishes().catch(console.error);
