import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ['Unread', 'Read', 'Replied'], default: 'Unread' },
    repliedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Inquiry', inquirySchema);
