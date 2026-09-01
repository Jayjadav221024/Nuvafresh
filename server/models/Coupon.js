import mongoose from 'mongoose';

/* A discount, modelled on the Shopify discount editor.
   `type` / `value` / `minOrderValue` / `usageLimit` are kept exactly as they
   were so the existing checkout validation and cart keep working untouched;
   everything below them is additive. */
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, unique: true, trim: true },
    title: { type: String, default: '' },

    // What kind of discount this is.
    method: { type: String, enum: ['code', 'automatic'], default: 'code' },
    discountClass: {
      type: String,
      enum: ['order', 'product', 'shipping'],
      default: 'order'
    },

    type: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    value: { type: Number, required: true, min: 0 },

    // Who can use it.
    eligibility: {
      type: String,
      enum: ['all', 'specific_customers', 'subscribers'],
      default: 'all'
    },

    // Minimum purchase requirements.
    minimumRequirement: {
      type: String,
      enum: ['none', 'amount', 'quantity'],
      default: 'none'
    },
    minOrderValue: { type: Number, default: 0 },
    minQuantity: { type: Number, default: 0 },

    // Maximum discount uses.
    limitTotalUses: { type: Boolean, default: false },
    usageLimit: { type: Number, default: 1000 },
    limitOnePerCustomer: { type: Boolean, default: false },
    usedCount: { type: Number, default: 0 },

    // Combinations with other discounts.
    combinesWith: {
      product: { type: Boolean, default: false },
      order: { type: Boolean, default: false },
      shipping: { type: Boolean, default: false }
    },

    // Active dates.
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
    hasEndDate: { type: Boolean, default: false },

    // Sales channels & organisation.
    salesChannels: [{ type: String }],
    restrictToChannels: { type: Boolean, default: false },
    tags: [{ type: String }],

    // Internal timeline notes (staff-only, like Shopify's comment feed).
    timeline: [
      {
        author: { type: String, default: 'Administrator' },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    status: { type: String, enum: ['Active', 'Scheduled', 'Expired', 'Disabled'], default: 'Active' }
  },
  { timestamps: true }
);

/* Derive the status from the active dates so the list, the storefront
   validation and the badge in the editor can never disagree. */
couponSchema.pre('save', function (next) {
  if (this.status === 'Disabled') return next();

  const now = new Date();
  if (this.validFrom && new Date(this.validFrom) > now) {
    this.status = 'Scheduled';
  } else if (this.hasEndDate && this.validTo && new Date(this.validTo) < now) {
    this.status = 'Expired';
  } else {
    this.status = 'Active';
  }
  next();
});

export default mongoose.model('Coupon', couponSchema);
