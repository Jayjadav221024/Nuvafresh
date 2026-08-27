import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let MOCK_PRODUCTS = [];
try {
  const jsonPath = path.resolve(__dirname, '../data/csvProducts.json');
  if (fs.existsSync(jsonPath)) {
    MOCK_PRODUCTS = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
} catch (e) {
  console.error('Could not load csvProducts.json', e.message);
}

if (MOCK_PRODUCTS.length === 0) {
  MOCK_PRODUCTS = [
    {
      _id: 'p-1',
      title: 'Hydro-Cleaned Crisp Baby Spinach',
      slug: 'hydro-cleaned-crisp-baby-spinach-101',
      category: 'Ozone Washed Vegetables',
      price: 99,
      discountedPrice: 79,
      stock: 48,
      images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80'],
      isOzoneWashed: true,
      ozoneBatchNumber: 'O3-882910',
      harvestDate: new Date().toISOString(),
      unit: '250g',
      description: 'Triple-washed in micro-bubbled ozone water to eliminate 99.9% pesticides and contaminants.',
      isFeatured: true
    }
  ];
}

export const getProducts = async (req, res) => {
  try {
    const { category, search, ozoneOnly, bestseller, page = 1 } = req.query;
    const limitNum = req.query.limit === 'all' || !req.query.limit ? 1000 : Number(req.query.limit);

    try {
      let query = {};
      if (category && category !== 'All') query.category = category;
      if (ozoneOnly === 'true') query.isOzoneWashed = true;
      if (bestseller === 'true') query.isBestseller = true;
      if (search) {
        query.$text = { $search: search };
      }

      let sortOption = { createdAt: -1 };
      if (bestseller === 'true') {
        sortOption = { isBestseller: -1, updatedAt: -1 };
      }

      const products = await Product.find(query)
        .sort(sortOption)
        .skip((page - 1) * (limitNum > 1000 ? 0 : limitNum))
        .limit(limitNum)
        .lean();

      if (products.length > 0) {
        return res.json({ success: true, count: products.length, products });
      }
    } catch (e) {
      // fallback to mock
    }

    let filtered = [...MOCK_PRODUCTS];
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (ozoneOnly === 'true') {
      filtered = filtered.filter(p => p.isOzoneWashed);
    }
    if (search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    return res.json({ success: true, count: filtered.length, products: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    try {
      const product = await Product.findById(req.params.id).lean();
      if (product) return res.json({ success: true, product });
    } catch (e) {}

    const found = MOCK_PRODUCTS.find(p => p._id === req.params.id || p.slug === req.params.id);
    if (found) return res.json({ success: true, product: found });

    res.status(404).json({ success: false, message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const newProduct = {
      _id: `p-${Date.now()}`,
      ...req.body,
      ozoneBatchNumber: req.body.isOzoneWashed ? `O3-${Math.floor(100000 + Math.random() * 900000)}` : 'N/A',
      images: req.body.images || ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800']
    };

    try {
      const created = await Product.create(newProduct);
      return res.status(201).json({ success: true, product: created });
    } catch (e) {
      MOCK_PRODUCTS.unshift(newProduct);
      return res.status(201).json({ success: true, product: newProduct });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    try {
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (updated) return res.json({ success: true, product: updated });
    } catch (e) {}

    MOCK_PRODUCTS = MOCK_PRODUCTS.map(p => p._id === req.params.id ? { ...p, ...req.body } : p);
    const updatedMock = MOCK_PRODUCTS.find(p => p._id === req.params.id);
    res.json({ success: true, product: updatedMock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    try {
      await Product.findByIdAndDelete(req.params.id);
    } catch (e) {}

    MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p._id !== req.params.id);
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
