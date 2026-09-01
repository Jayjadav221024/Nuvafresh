import mongoose from 'mongoose';
import slugify from 'slugify';

/* A collection groups products for the storefront. Membership comes from
   one of two sources:
     • manual    — an explicit product list, curated in the admin
     • automated — rules evaluated against every product (category, tag,
                   price, vendor, type, title)
   Manual membership is stored on both sides: `productIds` here and the
   collection handle inside `product.collections`, so a product added from
   either screen lands in the same collection. */
const ruleSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      enum: ['category', 'tag', 'title', 'vendor', 'productType', 'price'],
      default: 'category'
    },
    operator: {
      type: String,
      enum: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan'],
      default: 'equals'
    },
    value: { type: String, default: '' }
  },
  { _id: false }
);

const collectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    handle: { type: String, unique: true, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },

    type: { type: String, enum: ['manual', 'automated'], default: 'manual' },
    ruleMatch: { type: String, enum: ['all', 'any'], default: 'all' },
    rules: [ruleSchema],

    productIds: [{ type: String }],

    status: { type: String, enum: ['active', 'draft'], default: 'active', index: true },
    sortOrder: {
      type: String,
      enum: ['manual', 'title-asc', 'title-desc', 'price-asc', 'price-desc', 'newest'],
      default: 'manual'
    },
    orderIndex: { type: Number, default: 0 },
    showOnStorefront: { type: Boolean, default: true },

    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

collectionSchema.pre('validate', function (next) {
  if (!this.handle && this.title) {
    this.handle = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Collection', collectionSchema);
