import Collection from '../models/Collection.js';
import Product from '../models/Product.js';

/* ═══════════════════════════════════════════════════════════════════
   MEMBERSHIP
   One shared matcher so the storefront, the admin product counts and
   the collection page can never disagree about what is in a collection.
═══════════════════════════════════════════════════════════════════ */
const norm = (v) => String(v ?? '').trim().toLowerCase();

const matchesRule = (product, rule) => {
  const raw = rule.value ?? '';

  if (rule.field === 'price') {
    const price = Number(product.price) || 0;
    const target = Number(raw) || 0;
    switch (rule.operator) {
      case 'greaterThan': return price > target;
      case 'lessThan': return price < target;
      case 'notEquals': return price !== target;
      default: return price === target;
    }
  }

  if (rule.field === 'tag') {
    const tags = (product.tags || []).map(norm);
    const target = norm(raw);
    switch (rule.operator) {
      case 'notEquals': return !tags.includes(target);
      case 'contains': return tags.some((t) => t.includes(target));
      case 'notContains': return !tags.some((t) => t.includes(target));
      default: return tags.includes(target);
    }
  }

  const field = norm(product[rule.field]);
  const target = norm(raw);
  switch (rule.operator) {
    case 'notEquals': return field !== target;
    case 'contains': return field.includes(target);
    case 'notContains': return !field.includes(target);
    default: return field === target;
  }
};

export const productInCollection = (product, collection) => {
  if (!product || !collection) return false;

  if (collection.type === 'automated') {
    const rules = (collection.rules || []).filter((r) => r.value !== '' && r.value !== undefined);
    if (rules.length === 0) return false;
    return collection.ruleMatch === 'any'
      ? rules.some((r) => matchesRule(product, r))
      : rules.every((r) => matchesRule(product, r));
  }

  // Manual: either side of the relationship counts, so a product added
  // from the product editor shows up without touching the collection.
  const id = String(product._id);
  if ((collection.productIds || []).map(String).includes(id)) return true;

  const memberships = (product.collections || []).map(norm);
  return memberships.includes(norm(collection.handle)) || memberships.includes(norm(collection.title));
};

const sortProducts = (products, sortOrder) => {
  const list = [...products];
  switch (sortOrder) {
    case 'title-asc': return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'title-desc': return list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    case 'price-asc': return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-desc': return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'newest': return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    default: return list;
  }
};

/* Storefront reads must never surface an unpublished product — not in a
   collection page and not in the product count beside a collection's name.
   The admin passes `includeDrafts` to see its whole catalogue. */
const loadProducts = async (includeDrafts = false) => {
  try {
    const query = includeDrafts ? {} : { status: { $nin: ['draft', 'archived'] } };
    return await Product.find(query).lean();
  } catch (e) {
    return [];
  }
};

/* ═══════════════════════════════════════════════════════════════════
   FIRST-RUN SEED
   A brand new store would otherwise show an empty Collections screen.
   These mirror the six storefront categories as automated collections,
   so they populate themselves from the existing catalogue, plus one
   manual collection for hand-picked bestsellers.
═══════════════════════════════════════════════════════════════════ */
const DEFAULT_COLLECTIONS = [
  {
    title: 'Nuva Bestsellers',
    handle: 'nuva-bestsellers',
    description: 'Hand-picked staples our customers reorder the most.',
    type: 'manual',
    sortOrder: 'manual',
    orderIndex: 0
  },
  ...[
    ['Fresh Produce', 'Ozone-washed fruits and vegetables, harvested at sunrise.'],
    ['Pulses & Lentils', 'Unpolished dals and legumes from partner farms.'],
    ['Grains & Staples', 'Stone-ground flours and ancient grains.'],
    ['Spices & Seasonings', 'Sun-dried whole and ground spices.'],
    ['Oils & Ghee', 'Wood cold-pressed oils and A2 bilona ghee.'],
    ['Healthy Sweeteners', 'Unrefined, low-glycemic natural sweeteners.']
  ].map(([title, description], i) => ({
    title,
    handle: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description,
    type: 'automated',
    ruleMatch: 'all',
    rules: [{ field: 'category', operator: 'equals', value: title }],
    sortOrder: 'title-asc',
    orderIndex: i + 1
  }))
];

const seedIfEmpty = async () => {
  try {
    if ((await Collection.estimatedDocumentCount()) > 0) return;
    await Collection.insertMany(DEFAULT_COLLECTIONS, { ordered: false });
  } catch (e) {
    // A concurrent request may have seeded first — harmless.
  }
};

/* ═══════════════════════════════════════════════════════════════════
   READ
═══════════════════════════════════════════════════════════════════ */

// GET /api/collections  → every collection with a live product count.
// ?storefront=true limits it to what the shop should display.
export const getCollections = async (req, res) => {
  try {
    await seedIfEmpty();

    const storefrontOnly = req.query.storefront === 'true';
    const query = storefrontOnly ? { status: 'active', showOnStorefront: true } : {};

    const [collections, products] = await Promise.all([
      Collection.find(query).sort({ orderIndex: 1, createdAt: -1 }).lean(),
      loadProducts(!storefrontOnly)
    ]);

    const withCounts = collections.map((c) => ({
      ...c,
      productsCount: products.filter((p) => productInCollection(p, c)).length
    }));

    res.json({ success: true, count: withCounts.length, collections: withCounts });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/collections/:handle → the collection plus its resolved products.
export const getCollectionByHandle = async (req, res) => {
  try {
    const { handle } = req.params;
    // Accept either the URL handle or a raw id, so admin links work too.
    const query = /^[0-9a-fA-F]{24}$/.test(handle)
      ? { $or: [{ handle }, { _id: handle }] }
      : { handle };
    const collection = await Collection.findOne(query).lean();

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const includeDrafts = req.query.includeDrafts === 'true';
    const products = (await loadProducts(includeDrafts)).filter((p) => productInCollection(p, collection));

    res.json({
      success: true,
      collection: { ...collection, productsCount: products.length },
      products: sortProducts(products, collection.sortOrder)
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   WRITE
═══════════════════════════════════════════════════════════════════ */

// Keep product.collections in step with collection.productIds so both
// screens agree, whichever one the merchant edited.
const syncProductMembership = async (collection, previousIds = []) => {
  if (collection.type !== 'manual') return;

  const nextIds = (collection.productIds || []).map(String);
  const added = nextIds.filter((id) => !previousIds.includes(id));
  const removed = previousIds.filter((id) => !nextIds.includes(id));

  await Promise.all([
    ...added.map((id) =>
      Product.updateOne({ _id: id }, { $addToSet: { collections: collection.handle } }).catch(() => {})
    ),
    ...removed.map((id) =>
      Product.updateOne({ _id: id }, { $pull: { collections: collection.handle } }).catch(() => {})
    )
  ]);
};

export const createCollection = async (req, res) => {
  try {
    const collection = await Collection.create(req.body);
    await syncProductMembership(collection, []);
    res.status(201).json({ success: true, collection });
  } catch (e) {
    const message = e.code === 11000 ? 'A collection with that handle already exists' : e.message;
    res.status(400).json({ success: false, message });
  }
};

export const updateCollection = async (req, res) => {
  try {
    const existing = await Collection.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Collection not found' });

    const previousIds = (existing.productIds || []).map(String);
    Object.assign(existing, req.body);
    await existing.save();
    await syncProductMembership(existing, previousIds);

    res.json({ success: true, collection: existing });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (collection) {
      await Product.updateMany(
        { collections: collection.handle },
        { $pull: { collections: collection.handle } }
      ).catch(() => {});
      await collection.deleteOne();
    }
    res.json({ success: true, message: 'Collection removed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/collections/:id/products  { productIds: [], action: 'add' | 'remove' }
export const updateCollectionProducts = async (req, res) => {
  try {
    const { productIds = [], action = 'add' } = req.body;
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    if (collection.type !== 'manual') {
      return res.status(400).json({ success: false, message: 'Automated collections use rules, not a product list' });
    }

    const previousIds = (collection.productIds || []).map(String);
    const ids = productIds.map(String);

    collection.productIds = action === 'remove'
      ? previousIds.filter((id) => !ids.includes(id))
      : Array.from(new Set([...previousIds, ...ids]));

    await collection.save();
    await syncProductMembership(collection, previousIds);

    res.json({ success: true, collection });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
