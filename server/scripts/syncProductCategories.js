/* ═══════════════════════════════════════════════════════════════════
   SYNC PRODUCT CATEGORIES

   The catalogue was recategorised onto six storefront categories, but only
   the client's copy of csvProducts.json was updated. The server's copy — the
   one that seeds MongoDB and backs the products API — kept the original four
   ("Ozone Washed Vegetables", "Organic Atta", "Stone Pressed Oils",
   "A2 Ghee"). The admin category list, the navbar and the shop filters all
   use the six new names, so every category filter matched nothing.

   This brings the server's copy, the Product documents and the Category
   collection onto the same six names.

     node scripts/syncProductCategories.js            # apply
     node scripts/syncProductCategories.js --dry-run  # report only
═══════════════════════════════════════════════════════════════════ */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_JSON = path.resolve(__dirname, '../data/csvProducts.json');
const CLIENT_JSON = path.resolve(__dirname, '../../client/src/data/csvProducts.json');

const dryRun = process.argv.includes('--dry-run');

// The canonical storefront taxonomy, in the order the shop shows it.
const CANONICAL_CATEGORIES = [
  { name: 'Fresh Produce', badgeTag: 'Ozone Washed · Harvested at Sunrise' },
  { name: 'Pulses & Lentils', badgeTag: 'Unpolished · Chemical Free' },
  { name: 'Grains & Staples', badgeTag: 'Stone Ground · Ancient Grains' },
  { name: 'Spices & Seasonings', badgeTag: 'Sun Dried · Single Origin' },
  { name: 'Oils & Ghee', badgeTag: 'Wood Cold-Pressed · A2 Bilona' },
  { name: 'Healthy Sweeteners', badgeTag: 'Unrefined · Low Glycemic' }
];

const slugify = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const normaliseTitle = (title) => String(title || '').trim().toLowerCase().replace(/\s+/g, ' ');

const summarise = (products) => {
  const counts = {};
  for (const p of products) counts[p.category] = (counts[p.category] || 0) + 1;
  return counts;
};

const report = (label, counts) => {
  console.log(`\n${label}`);
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => console.log(`  ${String(count).padStart(4)}  ${name}`));
};

const run = async () => {
  const serverProducts = readJson(SERVER_JSON);
  const clientProducts = readJson(CLIENT_JSON);

  report('Before — server/data/csvProducts.json', summarise(serverProducts));

  // The client copy already carries the intended category for every product,
  // and both files share the same ids, so it is the source of truth here.
  const categoryById = new Map(clientProducts.map((p) => [String(p._id), p.category]));

  const changes = [];
  const migrated = serverProducts.map((product) => {
    const next = categoryById.get(String(product._id));
    if (!next || next === product.category) return product;

    changes.push({ id: String(product._id), title: product.title, from: product.category, to: next });
    return { ...product, category: next };
  });

  const unmapped = serverProducts.filter((p) => !categoryById.has(String(p._id)));
  if (unmapped.length > 0) {
    console.log(`\n⚠  ${unmapped.length} product(s) have no entry in the client catalogue and were left as-is.`);
  }

  report('After', summarise(migrated));
  console.log(`\n${changes.length} of ${serverProducts.length} products change category.`);

  if (dryRun) {
    console.log('\nDry run — nothing was written.');
    return;
  }

  fs.writeFileSync(SERVER_JSON, `${JSON.stringify(migrated, null, 2)}\n`);
  console.log(`\n✔ Rewrote ${path.relative(process.cwd(), SERVER_JSON)}`);

  // ── Database ──
  await connectDB();

  /* Documents in MongoDB were created with their own ObjectIds, so the JSON
     ids do not identify them — the title is what the two sides share. Match on
     the title, and never guess: a product this cannot place keeps the category
     it already has rather than being swept into a default. */
  const categoryByTitle = new Map(clientProducts.map((p) => [normaliseTitle(p.title), p.category]));

  const dbProducts = await Product.find().select('_id title category').lean();
  const idsByCategory = new Map();
  const unplaceable = [];

  for (const doc of dbProducts) {
    const next = categoryByTitle.get(normaliseTitle(doc.title));
    if (!next) {
      unplaceable.push(doc.title);
      continue;
    }
    if (next === doc.category) continue;

    if (!idsByCategory.has(next)) idsByCategory.set(next, []);
    idsByCategory.get(next).push(doc._id);
  }

  let updated = 0;
  for (const [category, ids] of idsByCategory) {
    const result = await Product.updateMany({ _id: { $in: ids } }, { $set: { category } });
    updated += result.modifiedCount || 0;
    console.log(`  ${String(result.modifiedCount || 0).padStart(4)}  → ${category}`);
  }
  console.log(`✔ Updated ${updated} of ${dbProducts.length} product document(s).`);

  if (unplaceable.length > 0) {
    console.log(`\n⚠  ${unplaceable.length} product document(s) are not in the catalogue and kept their existing category:`);
    unplaceable.slice(0, 10).forEach((t) => console.log(`     ${t}`));
  }

  const validNames = CANONICAL_CATEGORIES.map((c) => c.name);
  const stillInvalid = await Product.countDocuments({ category: { $nin: validNames } });
  if (stillInvalid > 0) {
    console.log(`\n⚠  ${stillInvalid} product(s) sit outside the six categories and will not appear under any shop filter.`);
  }

  // ── Categories ──
  for (const [index, category] of CANONICAL_CATEGORIES.entries()) {
    await Category.updateOne(
      { name: category.name },
      {
        $set: { slug: slugify(category.name), status: 'Active', orderIndex: index },
        $setOnInsert: { badgeTag: category.badgeTag }
      },
      { upsert: true }
    );
  }

  // Retire category records the catalogue no longer uses, so the shop filter
  // never offers a pill that returns nothing.
  const stale = await Category.deleteMany({ name: { $nin: validNames } });
  console.log(`✔ Category list normalised (${CANONICAL_CATEGORIES.length} active, ${stale.deletedCount} removed).`);

  await mongoose.connection.close();
};

run()
  .then(() => {
    console.log('\nDone.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('\nMigration failed:', e.message);
    process.exit(1);
  });
