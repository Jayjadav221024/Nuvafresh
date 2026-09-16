import mongoose from 'mongoose';

const goKwikOrderSchema = new mongoose.Schema(
  {
    gokwikOrderId: { type: String, required: true, unique: true, index: true },
    merchantOrderId: { type: String, index: true },
    orderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false
    },
    customer: {
      name: { type: String, default: 'Customer' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: {
        street: String,
        city: String,
        state: String,
        pincode: String
      }
    },
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    shippingAmount: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'CARD', 'NETBANKING', 'WALLET', 'OTHER'],
      default: 'UPI'
    },
    paymentStatus: {
      type: String,
      enum: ['Initiated', 'Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded'],
      default: 'Initiated'
    },
    orderStatus: {
      type: String,
      enum: ['Created', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'RTO', 'Cancelled'],
      default: 'Created'
    },
    rtoRiskScore: {
      level: { type: String, enum: ['Low', 'Medium', 'High', 'Unknown'], default: 'Low' },
      score: { type: Number, default: 0 },
      reason: { type: String, default: '' }
    },
    environment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    rawPayload: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model('GoKwikOrder', goKwikOrderSchema);
