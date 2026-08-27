import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  title: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: false,
      index: true 
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    paymentStatus: { 
      type: String, 
      enum: ['Pending', 'Completed', 'Paid', 'Failed'], 
      default: 'Pending' 
    },
    paymentMethod: { 
      type: String, 
      default: 'UPI QR Pay' 
    },
    orderStatus: { 
      type: String, 
      enum: ['Placed', 'Pending', 'Ozone Washing', 'Ozone Purifying', 'Quality Inspected', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'], 
      default: 'Placed' 
    },
    currentStage: { type: Number, default: 1 },
    tracking: { type: mongoose.Schema.Types.Mixed, default: {} },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
