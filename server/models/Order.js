import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  title: String,
  unit: String,
  image: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const addressSchema = new mongoose.Schema(
  {
    name: String,
    street: String,
    landmark: String,
    city: String,
    state: String,
    postalCode: String,
    country: { type: String, default: 'India' },
    phone: String
  },
  { _id: false }
);

/* One shipment out of the warehouse. An order can be fulfilled in parts,
   so each fulfillment carries its own location, status and line items. */
const fulfillmentSchema = new mongoose.Schema({
  reference: String,
  location: { type: String, default: 'Vadodara' },
  status: {
    type: String,
    enum: ['Unfulfilled', 'Ready for delivery', 'Out for delivery', 'Delivered'],
    default: 'Unfulfilled'
  },
  deliveredAt: Date,
  carrier: String,
  trackingNumber: String,
  note: String,
  itemIndexes: [{ type: Number }]
});

const timelineSchema = new mongoose.Schema({
  kind: {
    type: String,
    enum: ['system', 'comment', 'payment', 'email', 'fulfillment'],
    default: 'system'
  },
  message: { type: String, required: true },
  detail: String,
  author: { type: String, default: 'System' },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, index: true },

    user: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      index: true
    },
    items: [orderItemSchema],

    /* ── Money ──
       Kept alongside the original totalAmount so existing screens and the
       checkout keep working; these break the total into its parts the way
       the order summary needs to show it. */
    totalAmount: { type: Number, required: true },
    subtotal: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    shippingMethod: { type: String, default: 'Local Delivery' },
    taxAmount: { type: Number, default: 0 },
    taxLabel: { type: String, default: 'CGST/SGST 5%' },
    taxIncluded: { type: Boolean, default: true },
    discountApplied: { type: Number, default: 0 },
    discountCode: { type: String, default: '' },
    amountPaid: { type: Number, default: 0 },
    amountRefunded: { type: Number, default: 0 },

    /* ── Status ── */
    channel: { type: String, default: 'Online Store' },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Paid', 'Failed', 'Refunded', 'Partially refunded'],
      default: 'Pending'
    },
    paymentMethod: { type: String, default: 'UPI QR Pay' },
    transactionId: String,
    fulfillmentStatus: {
      type: String,
      enum: ['Unfulfilled', 'Partially fulfilled', 'Fulfilled'],
      default: 'Unfulfilled'
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Pending', 'Ozone Washing', 'Ozone Purifying', 'Quality Inspected', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed'
    },
    archived: { type: Boolean, default: false },
    currentStage: { type: Number, default: 1 },
    tracking: { type: mongoose.Schema.Types.Mixed, default: {} },

    fulfillments: [fulfillmentSchema],

    /* ── Addresses ── */
    deliveryAddress: addressSchema,
    billingSameAsShipping: { type: Boolean, default: true },
    billingAddress: addressSchema,

    /* ── Merchant-side annotations ── */
    customerNote: { type: String, default: '' },
    staffNote: { type: String, default: '' },
    tags: [{ type: String }],

    // The slot fields the Nuva checkout collects for local delivery.
    additionalDetails: {
      dueDate: String,
      dueTime: String,
      fulfillmentType: { type: String, default: 'Pickup / Delivery' },
      slotBookedAt: Date
    },

    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    riskReason: { type: String, default: '' },

    timeline: [timelineSchema]
  },
  { timestamps: true }
);

/* Give every order a human-readable number the way the storefront shows it. */
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const suffix = String(Date.now()).slice(-4);
    this.orderNumber = `NUVA${suffix}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
