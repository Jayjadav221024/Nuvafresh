import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.resolve(__dirname, '../../products_export_1(in).csv');
const rawCsv = fs.readFileSync(csvPath, 'utf8');

// Basic CSV row parser handling quoted multi-line values
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
        i++; // skip escaped quote
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

const parsedRows = parseCSV(rawCsv);
const headers = parsedRows[0];
console.log('Total rows:', parsedRows.length);
console.log('Headers count:', headers.length);

const handleIndex = headers.indexOf('Handle');
const titleIndex = headers.indexOf('Title');
const bodyIndex = headers.indexOf('Body (HTML)');
const typeIndex = headers.indexOf('Type');
const tagsIndex = headers.indexOf('Tags');
const priceIndex = headers.indexOf('Variant Price');
const comparePriceIndex = headers.indexOf('Variant Compare At Price');
const imgIndex = headers.indexOf('Image Src');
const opt1ValIndex = headers.indexOf('Option1 Value');

console.log({
  handleIndex, titleIndex, bodyIndex, typeIndex, tagsIndex, priceIndex, comparePriceIndex, imgIndex, opt1ValIndex
});

// Group by Handle to aggregate images & options
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
      title: title || handle.replace(/-/g, ' '),
      body: body || '',
      type: type || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      price: price > 0 ? price : 0,
      comparePrice: comparePrice > 0 ? comparePrice : 0,
      unit: optionVal || '1 Unit',
      images: []
    });
  }

  const existing = productsByHandle.get(handle);
  if (title && !existing.title) existing.title = title;
  if (price > 0 && existing.price === 0) existing.price = price;
  if (comparePrice > 0 && existing.comparePrice === 0) existing.comparePrice = comparePrice;
  if (optionVal && existing.unit === '1 Unit') existing.unit = optionVal;
  if (imgSrc && !existing.images.includes(imgSrc)) {
    existing.images.push(imgSrc);
  }
}

console.log('Unique products extracted:', productsByHandle.size);

const sample = Array.from(productsByHandle.values()).slice(0, 5);
console.log('Sample parsed product:', JSON.stringify(sample, null, 2));
