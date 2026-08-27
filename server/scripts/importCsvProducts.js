import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const csvPath = path.resolve(__dirname, '../../products_export_1(in).csv');
const rawCsv = fs.readFileSync(csvPath, 'utf8');

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.some(field => field.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

function mapCategory(title, tags = [], type = '') {
  const lower = (title + ' ' + tags.join(' ') + ' ' + type).toLowerCase();
  if (lower.includes('ghee') || lower.includes('bilona') || lower.includes('butter')) {
    return 'A2 Ghee';
  }
  if (lower.includes('oil') || lower.includes('kachi ghani') || lower.includes('mustard oil') || lower.includes('groundnut oil') || lower.includes('sesame oil') || lower.includes('coconut oil')) {
    return 'Stone Pressed Oils';
  }
  if (lower.includes('flour') || lower.includes('atta') || lower.includes('wheat') || lower.includes('millet') || lower.includes('ragi') || lower.includes('rice') || lower.includes('dal') || lower.includes('pulse')) {
    return 'Organic Atta';
  }
  if (lower.includes('juice') || lower.includes('drink') || lower.includes('beverage') || lower.includes('syrup')) {
    return 'Cold-Pressed Juices';
  }
  return 'Ozone Washed Vegetables';
}

const parsedRows = parseCSV(rawCsv);
const headers = parsedRows[0];

const handleIndex = headers.indexOf('Handle');
const titleIndex = headers.indexOf('Title');
const bodyIndex = headers.indexOf('Body (HTML)');
const typeIndex = headers.indexOf('Type');
const tagsIndex = headers.indexOf('Tags');
const priceIndex = headers.indexOf('Variant Price');
const comparePriceIndex = headers.indexOf('Variant Compare At Price');
const imgIndex = headers.indexOf('Image Src');
const opt1ValIndex = headers.indexOf('Option1 Value');

const productsByHandle = new Map();

for (let i = 1; i < parsedRows.length; i++) {
  const row = parsedRows[i];
  const handle = row[handleIndex]?.trim();
  if (!handle) continue;

  const title = row[titleIndex]?.trim();
  const body = row[bodyIndex]?.trim();
  const type = row[typeIndex]?.trim();
  const tags = row[tagsIndex]?.trim();
  const price = parseFloat(row[priceIndex]) || 0;
  const comparePrice = parseFloat(row[comparePriceIndex]) || 0;
  const imgSrc = row[imgIndex]?.trim();
  const optionVal = row[opt1ValIndex]?.trim();

  if (!productsByHandle.has(handle)) {
    productsByHandle.set(handle, {
      handle,
      title: title || handle.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      body: body || '',
      type: type || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      price: price > 0 ? price : 150,
      comparePrice: comparePrice > 0 ? comparePrice : 0,
      unit: optionVal || '500g',
      images: []
    });
  }

  const existing = productsByHandle.get(handle);
  if (title && !existing.title) existing.title = title;
  if (price > 0 && existing.price === 150) existing.price = price;
  if (comparePrice > 0 && existing.comparePrice === 0) existing.comparePrice = comparePrice;
  if (optionVal && existing.unit === '500g') existing.unit = optionVal;
  if (imgSrc && !existing.images.includes(imgSrc)) {
    existing.images.push(imgSrc);
  }
}

const cleanedProducts = Array.from(productsByHandle.values()).map((p, index) => {
  const category = mapCategory(p.title, p.tags, p.type);
  const isOzoneWashed = category === 'Ozone Washed Vegetables' || category === 'Cold-Pressed Juices';
  const cleanDescription = p.body.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) || `${p.title} - 100% natural, farm-harvested produce.`;
  
  const images = p.images.length > 0 
    ? p.images 
    : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800'];

  return {
    _id: `p-${index + 1}`,
    title: p.title,
    slug: p.handle,
    category,
    price: p.price || 120,
    discountedPrice: p.comparePrice > p.price ? p.price : (p.price > 50 ? Math.round(p.price * 0.9) : p.price),
    stock: 50,
    images,
    isOzoneWashed,
    ozoneBatchNumber: isOzoneWashed ? `O3-${Math.floor(100000 + Math.random() * 900000)}` : 'N/A',
    harvestDate: new Date().toISOString(),
    unit: p.unit || '1 Unit',
    description: cleanDescription,
    isFeatured: index < 8
  };
});

console.log(`Prepared ${cleanedProducts.length} products from CSV.`);

// Write to seed JSON and update controller / MongoDB
const outputPath = path.resolve(__dirname, '../data/csvProducts.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(cleanedProducts, null, 2));
console.log(`Saved parsed products to ${outputPath}`);

async function seedMongo() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nuva_fresh_db';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB. Inserting products...');
    await Product.deleteMany({});
    for (const prod of cleanedProducts) {
      const { _id, ...mongoDoc } = prod;
      await Product.create({
        ...mongoDoc,
        slug: prod.slug + '-' + Math.floor(1000 + Math.random() * 9000)
      });
    }
    console.log(`Successfully seeded ${cleanedProducts.length} products into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.log('MongoDB not reachable locally or offline. Products will be served from seed JSON file by server.', err.message);
    process.exit(0);
  }
}

seedMongo();
