import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    city: { type: String, required: true },
    quote: { type: String, required: true },
    avatar: { type: String },
    rating: { type: Number, default: 5 },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Testimonial', testimonialSchema);
