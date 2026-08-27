import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    category: {
      type: String,
      required: true,
      index: true
    },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String, required: true }],
    isOzoneWashed: { type: Boolean, default: true },
    ozoneBatchNumber: { type: String, default: () => `O3-${Date.now().toString().slice(-6)}` },
    harvestDate: { type: Date, default: Date.now },
    unit: { type: String, required: true, default: '500g' },
    description: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false }
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

productSchema.index({ title: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);
