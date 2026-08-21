import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const papadUrl = 'https://res.cloudinary.com/e6s1knuy/image/upload/v1787292591/food/items/ejn9ojmm7w7kcxzs35c5.jpg';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  const orders = await mongoose.connection.db.collection('food_orders').find().toArray();
  console.log(`Found ${orders.length} total orders.`);

  let updatedCount = 0;
  for (const order of orders) {
    let modified = false;
    const updatedItems = (order.items || []).map(item => {
      if (item.name && item.name.toLowerCase().includes('papad')) {
        modified = true;
        return { ...item, image: papadUrl };
      }
      return item;
    });

    if (modified) {
      await mongoose.connection.db.collection('food_orders').updateOne(
        { _id: order._id },
        { $set: { items: updatedItems } }
      );
      updatedCount++;
    }
  }

  console.log(`Updated images for ${updatedCount} orders.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
