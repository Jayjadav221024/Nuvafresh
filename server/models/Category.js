import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true },
    badgeTag: { type: String, default: '100% Pure · Chemical Free' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600' },
    status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active' },
    orderIndex: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
