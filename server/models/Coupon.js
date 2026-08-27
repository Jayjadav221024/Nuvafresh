import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, unique: true, trim: true },
    type: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
    status: { type: String, enum: ['Active', 'Expired', 'Disabled'], default: 'Active' }
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
