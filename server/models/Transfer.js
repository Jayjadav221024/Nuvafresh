import mongoose from 'mongoose';

/* ═══════════════════════════════════════════════════════════════════
   TRANSFER
   Stock moving from one Nuva location to another — a chamber to a hub,
   a hub to a depot. Each line records how many units left the origin and
   how many have actually been counted in at the destination, so a part
   shipment is a first-class state rather than a note somebody typed.
═══════════════════════════════════════════════════════════════════ */
const transferItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
    // Kept alongside `product` because the seeded catalogue uses string ids
    // ("p-12") that are not ObjectIds.
    productId: { type: String, default: '' },
    title: { type: String, required: true },
    sku: { type: String, default: '' },
    unit: { type: String, default: '' },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    received: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    name: { type: String, default: '' }
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema({
  message: { type: String, required: true },
  author: { type: String, default: 'System' },
  createdAt: { type: Date, default: Date.now }
});

const transferSchema = new mongoose.Schema(
  {
    reference: { type: String, index: true },
    name: { type: String, default: '' },

    origin: locationSchema,
    destination: locationSchema,

    /* Draft is the only state that isn't committed stock. Everything from
       "In transit" onward counts as incoming at the destination. */
    status: {
      type: String,
      enum: ['Draft', 'In transit', 'Partially received', 'Received', 'Cancelled'],
      default: 'Draft',
      index: true
    },

    items: [transferItemSchema],

    estimatedArrival: { type: Date },
    shippingCarrier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },

    note: { type: String, default: '' },
    tags: [{ type: String }],
    purchaseOrder: { type: String, default: '' },

    timeline: [timelineSchema]
  },
  { timestamps: true }
);

transferSchema.pre('save', function (next) {
  if (!this.reference) {
    this.reference = `TR-${String(Date.now()).slice(-4)}`;
  }
  next();
});

export default mongoose.model('Transfer', transferSchema);
