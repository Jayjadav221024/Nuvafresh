import mongoose from 'mongoose';
import slugify from 'slugify';

/* ═══════════════════════════════════════════════════════════════════
   METAOBJECTS
   Custom content types. A definition says what shape an entry has —
   "Farm" has a name, a district and a photo — and each entry fills that
   shape in. It's how a store adds structured content the built-in
   models don't cover, without a schema change every time.
═══════════════════════════════════════════════════════════════════ */
export const FIELD_TYPES = [
  'single_line_text',
  'multi_line_text',
  'rich_text',
  'number',
  'boolean',
  'date',
  'url',
  'file_reference',
  'product_reference'
];

const fieldDefinitionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, enum: FIELD_TYPES, default: 'single_line_text' },
    // "One" or a list of values — Shopify's one/list selector.
    list: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const definitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    handle: { type: String, unique: true, index: true },
    description: { type: String, default: '' },
    /* Which field an entry is listed by — without one, entries show as
       "Entry 1", "Entry 2" and nobody can find anything. */
    displayField: { type: String, default: '' },
    fields: [fieldDefinitionSchema],

    /* ── Options ──
       Only the three this store can actually honour. Shopify also offers
       Translations and Customer Account API access; neither exists here,
       and a toggle that changes nothing is worse than no toggle. */
    options: {
      // Entries carry Active/Draft, and drafts stay off the storefront.
      activeDraftStatus: { type: Boolean, default: true },
      // Each entry gets a storefront URL at /c/<type>/<entry handle>.
      publishAsWebPage: { type: Boolean, default: false },
      // Entries are readable without an admin token.
      storefrontApiAccess: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

definitionSchema.pre('validate', function (next) {
  if (!this.handle && this.name) {
    this.handle = slugify(this.name, { lower: true, strict: true }).replace(/-/g, '_');
  }
  next();
});

const entrySchema = new mongoose.Schema(
  {
    definitionHandle: { type: String, required: true, index: true },
    handle: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Draft'], default: 'Active', index: true },
    /* Values keyed by the definition's field keys. Mixed because the shape
       is whatever the merchant defined. */
    fields: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

entrySchema.index({ definitionHandle: 1, handle: 1 }, { unique: true });

export const MetaobjectDefinition = mongoose.model('MetaobjectDefinition', definitionSchema);
export const MetaobjectEntry = mongoose.model('MetaobjectEntry', entrySchema);
