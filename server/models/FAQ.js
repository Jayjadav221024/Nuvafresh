import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, default: 'General' },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('FAQ', faqSchema);
