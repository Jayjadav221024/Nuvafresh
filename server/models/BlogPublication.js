import mongoose from 'mongoose';
import slugify from 'slugify';

/* ═══════════════════════════════════════════════════════════════════
   BLOG PUBLICATION
   The blog a post is filed under — "News", "Food & Health". Shopify calls
   the post an article and this the blog; the two are separate so a store
   can run several with their own comment policy and SEO listing.
═══════════════════════════════════════════════════════════════════ */
const blogPublicationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    handle: { type: String, unique: true, index: true },
    commentsPolicy: {
      type: String,
      enum: ['Disabled', 'Moderated', 'Automatic'],
      default: 'Disabled'
    },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

blogPublicationSchema.pre('validate', function (next) {
  if (!this.handle && this.title) {
    this.handle = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('BlogPublication', blogPublicationSchema);
