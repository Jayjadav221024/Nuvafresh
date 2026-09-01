import mongoose from 'mongoose';
import slugify from 'slugify';

/* ═══════════════════════════════════════════════════════════════════
   MENU
   A navigation menu the storefront renders — the header links, the
   footer columns. One level of nesting, which is what Shopify allows
   and what the Nuva theme can actually draw.
═══════════════════════════════════════════════════════════════════ */
const menuItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, default: '/' },
    items: [
      new mongoose.Schema(
        {
          title: { type: String, required: true, trim: true },
          url: { type: String, default: '/' }
        },
        { _id: false }
      )
    ]
  },
  { _id: false }
);

const menuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    handle: { type: String, unique: true, index: true },
    items: [menuItemSchema]
  },
  { timestamps: true }
);

menuSchema.pre('validate', function (next) {
  if (!this.handle && this.title) {
    this.handle = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Menu', menuSchema);
