import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Trash2, SlidersHorizontal, ChevronLeft, ChevronRight, Package,
  X, Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';
import { toCsv, parseCsv, downloadCsv, readFileAsText } from '../../lib/csv';
import CSV_PRODUCTS from '../../data/csvProducts.json';

/* ═══════════════════════════════════════════════════════════════════
   SPREADSHEET COLUMNS
   One definition drives both directions: `write` renders a product to a
   cell, `read` turns a cell back into the field the Product model wants.
   Handle is the match key on import, the way Shopify uses it.
═══════════════════════════════════════════════════════════════════ */
const slugify = (text) =>
  (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const list = (value) =>
  String(value || '')
    .split(/[;|\n]/)
    .map((v) => v.trim())
    .filter(Boolean);

const bool = (value, fallback = false) => {
  const text = String(value || '').trim().toLowerCase();
  if (!text) return fallback;
  return ['true', 'yes', 'y', '1'].includes(text);
};

const PRODUCT_COLUMNS = [
  { header: 'Handle', write: (p) => p.slug || slugify(p.title) },
  { header: 'Title', write: (p) => p.title || '' },
  { header: 'Category', write: (p) => p.category || '' },
  { header: 'Product Type', write: (p) => p.productType || '' },
  { header: 'Vendor', write: (p) => p.vendor || 'Nuva Nutrition' },
  { header: 'Tags', write: (p) => (p.tags || []).join('; ') },
  { header: 'Status', write: (p) => p.status || 'active' },
  { header: 'Description', write: (p) => p.description || '' },
  { header: 'Price', write: (p) => Number(p.price) || 0 },
  { header: 'Discounted Price', write: (p) => Number(p.discountedPrice) || 0 },
  { header: 'Stock', write: (p) => Number(p.stock) || 0 },
  { header: 'Unit', write: (p) => p.unit || '' },
  { header: 'Image Src', write: (p) => (p.images || []).join('; ') },
  { header: 'Featured', write: (p) => (p.isFeatured ? 'TRUE' : 'FALSE') },
  { header: 'Bestseller', write: (p) => (p.isBestseller ? 'TRUE' : 'FALSE') },
  { header: 'Ozone Washed', write: (p) => (p.isOzoneWashed === false ? 'FALSE' : 'TRUE') },
  { header: 'Ozone Batch', write: (p) => p.ozoneBatchNumber || '' },
  { header: 'Harvest Date', write: (p) => (p.harvestDate ? String(p.harvestDate).slice(0, 10) : '') },
  { header: 'Collections', write: (p) => (p.collections || []).join('; ') },
  { header: 'Sales Channels', write: (p) => (p.salesChannels || []).join('; ') },
  { header: 'SEO Title', write: (p) => p.seo?.title || '' },
  { header: 'SEO Description', write: (p) => p.seo?.description || '' }
];

const SAMPLE_ROW = {
  title: 'Alphonso Mango',
  slug: 'alphonso-mango',
  category: 'Fresh Produce',
  productType: 'Fresh Fruit',
  vendor: 'Nuva Nutrition',
  tags: ['seasonal', 'ozone washed'],
  status: 'active',
  description: 'Hand-picked Devgad Alphonso, ozone washed and packed the same day.',
  price: 599,
  discountedPrice: 549,
  stock: 40,
  unit: '1 KG',
  images: ['https://cdn.example.com/alphonso.png'],
  isFeatured: true,
  isBestseller: false,
  isOzoneWashed: true,
  ozoneBatchNumber: 'O3-100234',
  harvestDate: '2026-04-18',
  collections: ['Summer Fruits'],
  salesChannels: ['Online Store'],
  seo: { title: 'Alphonso Mango', description: 'Buy ozone-washed Alphonso mangoes online.' }
};

/* Turn one spreadsheet row into a create/update payload. Header lookup is
   case-insensitive so a sheet edited by hand still imports. */
const rowToProduct = (row) => {
  const cells = {};
  Object.entries(row).forEach(([key, value]) => { cells[key.trim().toLowerCase()] = value; });
  const cell = (name) => cells[name.toLowerCase()] ?? '';

  const title = String(cell('Title')).trim();
  const category = String(cell('Category')).trim();
  const price = Number(cell('Price'));

  const payload = {
    title,
    category,
    price: Number.isFinite(price) ? price : 0,
    discountedPrice: Number(cell('Discounted Price')) || 0,
    stock: Number(cell('Stock')) || 0,
    unit: String(cell('Unit')).trim() || '500g',
    description: String(cell('Description')),
    images: list(cell('Image Src')),
    vendor: String(cell('Vendor')).trim() || 'Nuva Nutrition',
    productType: String(cell('Product Type')).trim(),
    tags: list(cell('Tags')),
    collections: list(cell('Collections')),
    salesChannels: list(cell('Sales Channels')),
    isFeatured: bool(cell('Featured')),
    isBestseller: bool(cell('Bestseller')),
    isOzoneWashed: bool(cell('Ozone Washed'), true),
    seo: {
      title: String(cell('SEO Title')),
      description: String(cell('SEO Description')),
      handle: String(cell('Handle')).trim()
    }
  };

  const status = String(cell('Status')).trim().toLowerCase();
  if (['active', 'draft', 'archived'].includes(status)) payload.status = status;

  const batch = String(cell('Ozone Batch')).trim();
  if (batch) payload.ozoneBatchNumber = batch;

  const harvest = String(cell('Harvest Date')).trim();
  if (harvest && !Number.isNaN(new Date(harvest).getTime())) payload.harvestDate = harvest;

  return { handle: String(cell('Handle')).trim() || slugify(title), payload };
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(CSV_PRODUCTS || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Import / Export
  const [modal, setModal] = useState(null);          // 'export' | 'import'
  const [exportScope, setExportScope] = useState('all');
  const [importFile, setImportFile] = useState(null);
  const [importRows, setImportRows] = useState([]);
  const [importError, setImportError] = useState('');
  const [overwrite, setOverwrite] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      // The catalogue list must show drafts and archived products too — they
      // are hidden from the storefront, not from the merchant.
      const { data } = await API.get('/products?limit=all&includeDrafts=true');
      if (data.success && data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (e) {
      if (CSV_PRODUCTS && CSV_PRODUCTS.length > 0) {
        setProducts(CSV_PRODUCTS);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(paginatedProducts.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(item => item !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedProducts.length} selected product(s)?`)) return;
    await Promise.all(
      selectedProducts.map((id) => API.delete(`/products/${id}`).catch(() => {}))
    );
    setProducts(products.filter((p) => !selectedProducts.includes(p._id)));
    setSelectedProducts([]);
    publishStoreChange([STORE_TOPICS.PRODUCTS, STORE_TOPICS.COLLECTIONS]);
  };

  const filteredProducts = products.filter(p => {
    return p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (p.slug && p.slug.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* ═══════════════════════════════════════════════════════════════
     EXPORT
     Four scopes, the way Shopify offers them; the ones that would be
     empty simply aren't offered.
  ═══════════════════════════════════════════════════════════════ */
  const exportScopes = useMemo(() => {
    const scopes = [{ key: 'all', label: 'All products', rows: products }];
    if (selectedProducts.length > 0) {
      scopes.push({
        key: 'selected',
        label: `Selected: ${selectedProducts.length} ${selectedProducts.length === 1 ? 'product' : 'products'}`,
        rows: products.filter((p) => selectedProducts.includes(p._id))
      });
    }
    if (searchTerm.trim()) {
      scopes.push({ key: 'search', label: 'Products matching your search', rows: filteredProducts });
    }
    if (totalPages > 1) {
      scopes.push({ key: 'page', label: `Current page (${currentPage} of ${totalPages})`, rows: paginatedProducts });
    }
    return scopes;
  }, [products, selectedProducts, searchTerm, filteredProducts, paginatedProducts, currentPage, totalPages]);

  const activeScope = exportScopes.find((s) => s.key === exportScope) || exportScopes[0];

  const handleExport = () => {
    const rows = activeScope.rows;
    if (rows.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`nuva_products_${stamp}.csv`, toCsv(rows, PRODUCT_COLUMNS));
    setModal(null);
  };

  const handleDownloadTemplate = () => {
    downloadCsv('nuva_products_template.csv', toCsv([SAMPLE_ROW], PRODUCT_COLUMNS));
  };

  /* ═══════════════════════════════════════════════════════════════
     IMPORT
     The file is parsed and checked in the browser first, so the merchant
     sees what will happen before a single product is written.
  ═══════════════════════════════════════════════════════════════ */
  const resetImport = () => {
    setImportFile(null);
    setImportRows([]);
    setImportError('');
    setImportResult(null);
    setImportProgress(0);
  };

  const handleFilePicked = async (file) => {
    if (!file) return;
    resetImport();
    setImportFile(file);

    if (!/\.csv$/i.test(file.name)) {
      setImportError('Please choose a .csv file. Export a product first to see the expected columns.');
      return;
    }

    try {
      const { headers, rows } = parseCsv(await readFileAsText(file));
      const lower = headers.map((h) => h.toLowerCase());
      if (!lower.includes('title')) {
        setImportError('This file has no "Title" column, so there is nothing to import.');
        return;
      }
      if (rows.length === 0) {
        setImportError('This file has a header row but no products.');
        return;
      }
      setImportRows(rows.map(rowToProduct));
    } catch (e) {
      setImportError(e.message || 'That file could not be read.');
    }
  };

  const validRows = importRows.filter((r) => r.payload.title && r.payload.category);
  const invalidRows = importRows.filter((r) => !r.payload.title || !r.payload.category);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setImportProgress(0);

    // Match on handle the way Shopify does, falling back to the title so a
    // hand-written sheet without handles still updates the right product.
    const byHandle = new Map();
    products.forEach((p) => {
      if (p.slug) byHandle.set(p.slug.toLowerCase(), p);
      if (p.title) byHandle.set(slugify(p.title), p);
    });

    let created = 0;
    let updated = 0;
    let skippedExisting = 0;
    const failures = [];

    for (let i = 0; i < validRows.length; i += 1) {
      const { handle, payload } = validRows[i];
      const existing = byHandle.get(handle.toLowerCase()) || byHandle.get(slugify(payload.title));

      try {
        if (existing && overwrite) {
          await API.put(`/products/${existing._id}`, payload);
          updated += 1;
        } else if (existing && !overwrite) {
          // Left alone on purpose — counted so the summary adds up.
          skippedExisting += 1;
        } else {
          await API.post('/products', payload);
          created += 1;
        }
      } catch (e) {
        failures.push({
          title: payload.title,
          message: e.response?.data?.message || e.message || 'Request failed'
        });
      }
      setImportProgress(i + 1);
    }

    await fetchProducts();
    publishStoreChange([STORE_TOPICS.PRODUCTS, STORE_TOPICS.COLLECTIONS, STORE_TOPICS.INVENTORY]);

    setImporting(false);
    setImportResult({
      created,
      updated,
      skipped: invalidRows.length + skippedExisting,
      failures
    });
  };

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">
      
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER & ACTIONS (Shopify Style)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">
            Products
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setExportScope(selectedProducts.length > 0 ? 'selected' : 'all'); setModal('export'); }}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50"
          >
            Export
          </button>
          <button
            onClick={() => { resetImport(); setModal('import'); }}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50"
          >
            Import
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50">
            More actions
          </button>
          <Link
            to="/admin/products/new"
            className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold transition-transform active:scale-95 shadow-sm flex items-center gap-1.5"
          >
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP KPI METRICS BAR (Shopify 3-Column Metrics Card)
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 gap-4 md:gap-0">
        
        {/* Metric 1 */}
        <div className="px-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Average sell-through rate</span>
            <span className="text-[11px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">30 days</span>
          </div>
          <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            0.1% <span className="text-neutral-400 font-normal">—</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="px-3 space-y-1">
          <div className="text-xs text-neutral-500 font-medium">
            Products by days of inventory remaining
          </div>
          <div className="text-xs text-neutral-400">
            No data
          </div>
        </div>

        {/* Metric 3 */}
        <div className="px-3 space-y-1">
          <div className="text-xs text-neutral-500 font-medium">
            ABC product analysis
          </div>
          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            ₹0.00 A &nbsp; ₹0.00 B &nbsp; ₹0.00 C
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN PRODUCTS TABLE (Shopify Table Theme)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">
        
        {/* Search & Tabs Filter Bar */}
        <div className="p-2.5 px-3 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3 bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md">
              All
            </span>
            <div className="relative flex-1 max-w-sm flex items-center">
              <Search className="h-3.5 w-3.5 absolute left-2.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search and filter"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-600 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedProducts.length})
            </button>
          )}

          <div className="flex items-center gap-1 text-neutral-400">
            <button className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300" title="Columns">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold bg-white dark:bg-[#1a1a1a]">
                <th className="py-2.5 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                    className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Inventory</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Channels</th>
                <th className="py-2.5 px-3">Catalogs</th>
                <th className="py-2.5 px-3">Product type</th>
                <th className="py-2.5 px-4">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {paginatedProducts.map((p) => {
                const isSelected = selectedProducts.includes(p._id);
                const variantCount = p.variants?.length || 1;
                const stockCount = p.variants?.length
                  ? p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
                  : (p.stock ?? 0);
                const status = p.status || 'active';

                return (
                  <tr
                    key={p._id}
                    onClick={() => navigate(`/admin/products/${p._id}`)}
                    className={`cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors ${
                      isSelected ? 'bg-neutral-50 dark:bg-neutral-800/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(p._id)}
                        className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-neutral-400" />
                          )}
                        </div>
                        <Link
                          to={`/admin/products/${p._id}`}
                          className="font-semibold text-[#1a1a1a] dark:text-white hover:underline cursor-pointer"
                        >
                          {p.title}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        status === 'active'
                          ? 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300'
                          : status === 'draft'
                            ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {stockCount === 0 ? (
                        <span className="text-[#d82c0d] font-semibold">
                          0 in stock for {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
                        </span>
                      ) : (
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {stockCount} in stock for {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      {p.category || 'Produce'}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      {p.salesChannels?.length ?? 1}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      {p.collections?.length ?? 0}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 dark:text-neutral-400">
                      {p.productType && p.productType !== 'None' ? p.productType : (p.unit || 'Standard')}
                    </td>
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      {p.vendor || 'Nuva Nutrition'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded border border-neutral-300 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-neutral-300 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <span className="ml-2 font-medium">
              1-{Math.min(filteredProducts.length, itemsPerPage)} of {filteredProducts.length}
            </span>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          EXPORT PRODUCTS
      ───────────────────────────────────────────────────────────── */}
      {modal === 'export' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#e1e1e1] dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Export products</h3>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-1">
              {exportScopes.map((scope) => (
                <label
                  key={scope.key}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/40"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      checked={activeScope.key === scope.key}
                      onChange={() => setExportScope(scope.key)}
                      className="text-[#1a1a1a] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-800 dark:text-neutral-200">{scope.label}</span>
                  </span>
                  <span className="text-[11px] text-neutral-500">{scope.rows.length}</span>
                </label>
              ))}

              <p className="pt-3 text-[11px] text-neutral-500 leading-relaxed">
                Downloads a UTF-8 CSV with {PRODUCT_COLUMNS.length} columns — handle, pricing,
                stock, images and SEO. Edit it in Excel or Sheets and import it back to update
                these products.
              </p>
            </div>

            <div className="px-4 py-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="mr-auto text-xs font-semibold text-[#005bd3] dark:text-blue-400 hover:underline"
              >
                Download sample template
              </button>
              <button
                onClick={() => setModal(null)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={activeScope.rows.length === 0}
                className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-40"
              >
                Export products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          IMPORT PRODUCTS
      ───────────────────────────────────────────────────────────── */}
      {modal === 'import' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#e1e1e1] dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Import products by CSV</h3>
              <button
                onClick={() => { setModal(null); resetImport(); }}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {importResult ? (
                /* ── Finished ── */
                <div className="space-y-3">
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="text-xs text-emerald-800 dark:text-emerald-300">
                      <p className="font-bold">Import finished</p>
                      <p className="mt-0.5">
                        {importResult.created} created · {importResult.updated} updated
                        {importResult.skipped > 0 && ` · ${importResult.skipped} skipped`}
                      </p>
                    </div>
                  </div>

                  {importResult.failures.length > 0 && (
                    <div className="rounded-xl border border-red-200 dark:border-red-900 overflow-hidden">
                      <p className="px-3 py-2 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40">
                        {importResult.failures.length} {importResult.failures.length === 1 ? 'row' : 'rows'} failed
                      </p>
                      <ul className="divide-y divide-red-100 dark:divide-red-950 max-h-40 overflow-y-auto">
                        {importResult.failures.map((f, i) => (
                          <li key={i} className="px-3 py-2 text-[11px] text-neutral-700 dark:text-neutral-300">
                            <span className="font-semibold">{f.title}</span> — {f.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* ── File picker ── */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFilePicked(e.dataTransfer.files?.[0]); }}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 p-6 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="h-6 w-6 mx-auto text-neutral-400" />
                    <p className="mt-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {importFile ? importFile.name : 'Add a CSV file'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      {importFile ? 'Click to choose a different file' : 'Drop it here, or click to browse'}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => { handleFilePicked(e.target.files?.[0]); e.target.value = ''; }}
                    />
                  </div>

                  {importError && (
                    <p className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {importError}
                    </p>
                  )}

                  {/* ── What the file contains ── */}
                  {importRows.length > 0 && (
                    <div className="rounded-xl border border-[#e1e1e1] dark:border-neutral-800 overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#f7f7f7] dark:bg-[#161616] border-b border-[#e1e1e1] dark:border-neutral-800">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-neutral-500" />
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {validRows.length} {validRows.length === 1 ? 'product' : 'products'} ready
                        </span>
                        {invalidRows.length > 0 && (
                          <span className="text-[11px] text-amber-700 dark:text-amber-400">
                            · {invalidRows.length} skipped (missing title or category)
                          </span>
                        )}
                      </div>
                      <ul className="divide-y divide-[#e1e1e1] dark:divide-neutral-800 max-h-44 overflow-y-auto">
                        {validRows.slice(0, 8).map((r, i) => (
                          <li key={i} className="flex items-center justify-between gap-3 px-3 py-2">
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate">
                                {r.payload.title}
                              </span>
                              <span className="block text-[11px] text-neutral-500 truncate">
                                {r.payload.category} · {r.payload.unit} · {r.payload.stock} in stock
                              </span>
                            </span>
                            <span className="text-xs font-semibold text-neutral-900 dark:text-white shrink-0">
                              ₹{Number(r.payload.price).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {validRows.length > 8 && (
                        <p className="px-3 py-2 text-[11px] text-neutral-500 border-t border-[#e1e1e1] dark:border-neutral-800">
                          and {validRows.length - 8} more…
                        </p>
                      )}
                    </div>
                  )}

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overwrite}
                      onChange={(e) => setOverwrite(e.target.checked)}
                      className="mt-0.5 rounded border-neutral-400 text-[#1a1a1a] focus:ring-0 cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">
                      Overwrite products with the same handle
                      <span className="block text-[11px] text-neutral-500">
                        Leave this off to add only products that don't exist yet.
                      </span>
                    </span>
                  </label>

                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Use the columns produced by Export — Title and Category are required.
                    Tags, collections and multiple image URLs are separated by a semicolon.
                  </p>
                </>
              )}
            </div>

            <div className="px-4 py-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-end gap-2">
              {importing && (
                <span className="mr-auto text-xs text-neutral-500">
                  Importing {importProgress} of {validRows.length}…
                </span>
              )}
              {importResult ? (
                <button
                  onClick={() => { setModal(null); resetImport(); }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95"
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setModal(null); resetImport(); }}
                    disabled={importing}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || validRows.length === 0}
                    className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-40 disabled:active:scale-100 flex items-center gap-1.5"
                  >
                    {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {importing ? 'Importing…' : 'Upload and import'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
