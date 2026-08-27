import mongoose from 'mongoose';
import slugify from 'slugify';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    category: { type: String, required: true, default: 'Food & Health' },
    author: { type: String, default: 'Nuva Nutrition' },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    bannerImage: { type: String, required: true },
    images: {
      left: { type: String },
      right: { type: String }
    },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    publishedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

blogSchema.index({ title: 'text', content: 'text', category: 'text' });

export default mongoose.model('Blog', blogSchema);
