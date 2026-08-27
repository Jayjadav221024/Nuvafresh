import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    altText: { type: String, default: '' },
    caption: { type: String, default: '' },
    category: { type: String, default: 'General' },
    size: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Media', mediaSchema);
