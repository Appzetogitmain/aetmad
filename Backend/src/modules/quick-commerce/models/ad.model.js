import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const QuickAd = mongoose.model('QuickAd', adSchema);
