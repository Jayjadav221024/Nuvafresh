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
    /* Not required: Shopify lets a post be saved with only a title, and a
       hidden draft with no cover image yet is a normal state to be in. */
    bannerImage: { type: String, default: '' },
    images: {
      left: { type: String },
      right: { type: String }
    },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    publishedAt: { type: Date, default: Date.now },

    /* ── Search engine listing ── */
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      handle: { type: String, default: '' }
    },

    themeTemplate: { type: String, default: 'Default blog post' }
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
