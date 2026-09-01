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
    isBestseller: { type: Boolean, default: false },

    /* ── Storefront publishing & organization ── */
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active', index: true },
    vendor: { type: String, default: 'Nuva Nutrition' },
    productType: { type: String, default: '' },
    tags: [{ type: String }],
    collections: [{ type: String }],
    salesChannels: [{ type: String }],
    themeTemplate: { type: String, default: 'Default product' },

    /* ── Options & variants (Measure Unit → 500g / 1 KG / 2 KG …) ── */
    options: [
      {
        name: { type: String, default: 'Measure Unit' },
        values: [{ type: String }]
      }
    ],
    variants: [
      {
        title: { type: String },
        optionValues: [{ type: String }],
        price: { type: Number, default: 0 },
        compareAtPrice: { type: Number, default: 0 },
        sku: { type: String, default: '' },
        barcode: { type: String, default: '' },
        stock: { type: Number, default: 0 },
        image: { type: String, default: '' }
      }
    ],

    /* ── Search engine listing ── */
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      handle: { type: String, default: '' }
    },

    /* ── Metafields: category-driven (allergens, storage…) and custom ── */
    categoryMetafields: { type: mongoose.Schema.Types.Mixed, default: {} },
    metafields: { type: mongoose.Schema.Types.Mixed, default: {} }
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
