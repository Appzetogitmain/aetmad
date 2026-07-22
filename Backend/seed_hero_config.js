import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const quickHeroConfigSchema = new mongoose.Schema({
  pageType: { type: String, enum: ['home', 'header'], default: 'home', index: true },
  headerId: { type: mongoose.Schema.Types.ObjectId, ref: 'quick_category', default: null, index: true },
  banners: {
    items: [{
      imageUrl: { type: String, default: '' },
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      linkType: { type: String, default: 'none' },
      linkValue: { type: String, default: '' },
      status: { type: String, default: 'active' },
    }],
  },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'quick_category' }],
}, { timestamps: true });

const QuickHeroConfig = mongoose.models.quick_hero_config || mongoose.model('quick_hero_config', quickHeroConfigSchema, 'quick_hero_configs');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    let homeConfig = await QuickHeroConfig.findOne({ pageType: 'home' });
    if (!homeConfig) {
      homeConfig = new QuickHeroConfig({ pageType: 'home' });
    }

    homeConfig.banners = {
      items: [
        {
          imageUrl: "/src/assets/i_want_thiscolor_B_B_D_in_bg.mp4",
          title: "Aetmad Mart",
          subtitle: "Essentials in 10 minutes",
          linkType: "none",
          linkValue: "",
          status: "active"
        }
      ]
    };

    await homeConfig.save();
    console.log("Seeded Home Hero Config with video banner!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
