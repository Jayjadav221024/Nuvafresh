import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    linkedProduct: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product'
    },
    productTitle: { type: String, default: 'Fresh Farm Produce' },
    productPrice: { type: Number, default: 99 },
    isFeatured: { type: Boolean, default: true },
    orderIndex: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Reel', reelSchema);
