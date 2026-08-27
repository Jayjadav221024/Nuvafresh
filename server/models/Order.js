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
      required: true,
      index: true 
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    paymentStatus: { 
      type: String, 
      enum: ['Pending', 'Completed', 'Failed'], 
      default: 'Pending' 
    },
    paymentMethod: { 
      type: String, 
      enum: ['COD', 'Online'], 
      default: 'COD' 
    },
    orderStatus: { 
      type: String, 
      enum: ['Pending', 'Ozone Purifying', 'Out for Delivery', 'Delivered', 'Cancelled'], 
      default: 'Pending' 
    },
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
