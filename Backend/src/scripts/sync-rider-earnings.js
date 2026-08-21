import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  const orders = await mongoose.connection.db.collection('food_orders').find().toArray();
  let updated = 0;

  for (const order of orders) {
    if (order.orderType !== 'takeaway') {
      const fee = order.pricing?.deliveryFee || 25;
      await mongoose.connection.db.collection('food_orders').updateOne(
        { _id: order._id },
        {
          $set: {
            riderEarning: fee,
            earnings: fee
          }
        }
      );
      updated++;
    }
  }

  console.log(`Updated rider earnings on ${updated} delivery orders.`);
  await mongoose.disconnect();
}

run().catch(console.error);
