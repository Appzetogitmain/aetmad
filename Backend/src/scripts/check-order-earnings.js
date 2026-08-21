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

  const order = await mongoose.connection.db.collection('food_orders').findOne({
    $or: [
      { orderId: /6SQ2LQ/i },
      { displayOrderId: /6SQ2LQ/i },
      { orderCode: /6SQ2LQ/i }
    ]
  });

  if (order) {
    console.log('Order keys:', Object.keys(order));
    console.log('Earnings / Delivery related fields:', {
      orderId: order.orderId,
      displayOrderId: order.displayOrderId,
      pricing: order.pricing,
      deliveryFee: order.deliveryFee,
      deliveryCharge: order.deliveryCharge,
      deliveryCharges: order.deliveryCharges,
      riderEarning: order.riderEarning,
      riderEarnings: order.riderEarnings,
      deliveryFeeEarnings: order.deliveryFeeEarnings,
      earnings: order.earnings,
      driverEarnings: order.driverEarnings,
      orderTotal: order.orderTotal,
      grandTotal: order.grandTotal,
      totalAmount: order.totalAmount,
      total: order.total,
      delivery: order.delivery
    });
  } else {
    console.log('Order not found. Showing latest 3 orders:');
    const recent = await mongoose.connection.db.collection('food_orders').find().sort({ createdAt: -1 }).limit(3).toArray();
    recent.forEach(r => console.log({
      orderId: r.orderId,
      displayOrderId: r.displayOrderId,
      pricing: r.pricing,
      riderEarning: r.riderEarning,
      delivery: r.delivery
    }));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
