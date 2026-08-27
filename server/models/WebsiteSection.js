import mongoose from 'mongoose';

const websiteSectionSchema = new mongoose.Schema(
  {
    pageKey: { 
      type: String, 
      required: true, 
      enum: ['SITE-WIDE', 'HOME PAGE', 'ABOUT US', 'SHOP', 'PRODUCT DETAIL', 'CART & CHECKOUT', 'CONTACT', 'BLOG', 'CSR', 'OZONE SHIELD', 'FOOTER'],
      index: true
    },
    sectionKey: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    isEdited: { type: Boolean, default: false },
    lastEditedBy: { type: String, default: 'Admin' },
    lastEditedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('WebsiteSection', websiteSectionSchema);
