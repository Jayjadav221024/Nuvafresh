import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productTitle: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    images: [{ type: String }],
    status: { type: String, enum: ['Pending', 'Approved', 'Hidden'], default: 'Approved' },
    isVerifiedPurchase: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
