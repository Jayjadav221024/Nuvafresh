import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Search, Trash2, Layers, ChevronLeft, ChevronRight, X, Check,
  Loader2, ExternalLink, Upload, Image as ImageIcon, AlertCircle, Package,
  SlidersHorizontal
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';

/* ═══════════════════════════════════════════════════════════════════
   COLLECTIONS
   Real collections stored in the database. A manual collection holds a
   curated product list; an automated one holds rules the server
   evaluates. Either way the storefront reads the same membership, so
   what you see here is what /collections/:handle shows.
═══════════════════════════════════════════════════════════════════ */
const RULE_FIELDS = [
  { value: 'category', label: 'Product category' },
  { value: 'tag', label: 'Product tag' },
  { value: 'title', label: 'Product title' },
  { value: 'productType', label: 'Product type' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'price', label: 'Price' }
];

const RULE_OPERATORS = [
  { value: 'equals', label: 'is equal to' },
  { value: 'notEquals', label: 'is not equal to' },
  { value: 'contains', label: 'contains' },
  { value: 'notContains', label: 'does not contain' },
  { value: 'greaterThan', label: 'is greater than' },
  { value: 'lessThan', label: 'is less than' }
];

const SORT_ORDERS = [
  { value: 'manual', label: 'Manual' },
  { value: 'title-asc', label: 'Alphabetical, A–Z' },
  { value: 'title-desc', label: 'Alphabetical, Z–A' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'newest', label: 'Newest first' }
];

const slugify = (text) =>
  (text || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const blankCollection = () => ({
  title: '',
  handle: '',
  description: '',
  image: '',
  type: 'manual',
  ruleMatch: 'all',
  rules: [{ field: 'category', operator: 'equals', value: '' }],
  productIds: [],
  status: 'active',
  sortOrder: 'manual',
  showOnStorefront: true,
  seo: { title: '', description: '' }
});

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

/* ── Client-side mirror of the server matcher, so the editor can show a
      live product count while you build the rules. ── */
const norm = (v) => String(v ?? '').trim().toLowerCase();

const matchesRule = (product, rule) => {
  if (rule.field === 'price') {
    const price = Number(product.price) || 0;
    const target = Number(rule.value) || 0;
    if (rule.operator === 'greaterThan') return price > target;
    if (rule.operator === 'lessThan') return price < target;
    if (rule.operator === 'notEquals') return price !== target;
    return price === target;
  }
  if (rule.field === 'tag') {
    const tags = (product.tags || []).map(norm);
    const target = norm(rule.value);
    if (rule.operator === 'notEquals') return !tags.includes(target);
    if (rule.operator === 'contains') return tags.some((t) => t.includes(target));
    if (rule.operator === 'notContains') return !tags.some((t) => t.includes(target));
    return tags.includes(target);
  }
  const field = norm(product[rule.field]);
  const target = norm(rule.value);
  if (rule.operator === 'notEquals') return field !== target;
  if (rule.operator === 'contains') return field.includes(target);
  if (rule.operator === 'notContains') return !field.includes(target);
  return field === target;
};

const resolveMembers = (collection, products) => {
  if (!collection) return [];
  if (collection.type === 'automated') {
    const rules = (collection.rules || []).filter((r) => r.value !== '');
    if (rules.length === 0) return [];
    return products.filter((p) =>
      collection.ruleMatch === 'any' ? rules.some((r) => matchesRule(p, r)) : rules.every((r) => matchesRule(p, r))
    );
  }
  const ids = (collection.productIds || []).map(String);
  const handle = norm(collection.handle);
  const title = norm(collection.title);
  return products.filter((p) => {
    if (ids.includes(String(p._id))) return true;
    const memberships = (p.collections || []).map(norm);
    return memberships.includes(handle) || memberships.includes(title);
  });
};

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT PICKER
═══════════════════════════════════════════════════════════════════ */
const ProductPicker = ({ products, selectedIds, onToggle, onClose }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? products.filter((p) => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
      : products;
    return list.slice(0, 200);
  }, [products, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-700 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold">Add products</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-neutral-100 dark:divide-neutral-800">
          {results.length === 0 && (
            <p className="p-6 text-center text-xs text-neutral-400">No products match “{query}”.</p>
          )}
          {results.map((p) => {
            const on = selectedIds.includes(String(p._id));
            return (
              <button
                key={p._id}
                onClick={() => onToggle(String(p._id))}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors"
              >
                <input type="checkbox" readOnly checked={on} className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 pointer-events-none" />
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 flex items-center justify-center">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-3.5 w-3.5 text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{p.title}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{p.category}</p>
                </div>
                <span className="text-[11px] font-mono text-neutral-500 shrink-0">₹{Number(p.price || 0).toFixed(0)}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-neutral-500">{selectedIds.length} selected</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1a1a1a] dark:bg-white text-white dark:text-black text-xs font-bold hover:bg-neutral-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   COLLECTION EDITOR
═══════════════════════════════════════════════════════════════════ */
const CollectionEditor = ({ initial, products, onSave, onCancel, onDelete, saving }) => {
  const [draft, setDraft] = useState(initial);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileRef = useRef(null);

  const set = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const members = useMemo(() => resolveMembers(draft, products), [draft, products]);

  const setRule = (index, patch) =>
    set({ rules: draft.rules.map((r, i) => (i === index ? { ...r, ...patch } : r)) });

  const toggleProduct = (id) =>
    set({
      productIds: draft.productIds.includes(id)
        ? draft.productIds.filter((p) => p !== id)
        : [...draft.productIds, id]
    });

  const handleImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set({ image: reader.result });
    reader.readAsDataURL(file);
  };

  const handle = draft.handle || slugify(draft.title);

  return (
    <div className="space-y-4 max-w-[900px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-bold tracking-tight truncate">
            {draft._id ? draft.title : 'Create collection'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {draft._id && (
            <>
              <a
                href={`/collections/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View on site
              </a>
              <button
                onClick={() => onDelete(draft)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
          <button
            onClick={() => onSave({ ...draft, handle })}
            disabled={saving || !draft.title.trim()}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm p-4 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Title</label>
              <input
                value={draft.title}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="e.g. Nuva Bestsellers"
                className={`${inputClass} font-semibold`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Description</label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="Shown at the top of the collection page on the website."
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">URL handle</label>
              <input
                value={draft.handle}
                onChange={(e) => set({ handle: slugify(e.target.value) })}
                placeholder={slugify(draft.title)}
                className={inputClass}
              />
              <p className="text-[11px] text-neutral-400">https://thenuva.com/collections/{handle || 'handle'}</p>
            </div>
          </section>

          {/* Membership */}
          <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm p-4 space-y-3.5">
            <h2 className="text-sm font-bold">Products</h2>

            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'manual', label: 'Manual', hint: 'Pick products yourself' },
                { value: 'automated', label: 'Automated', hint: 'Match products by rules' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => set({ type: option.value })}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    draft.type === option.value
                      ? 'border-[#005bd3] bg-blue-50/50 dark:bg-neutral-800'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs font-bold">
                    {draft.type === option.value && <Check className="h-3.5 w-3.5 text-[#005bd3]" />}
                    {option.label}
                  </span>
                  <span className="block text-[11px] text-neutral-500 mt-0.5">{option.hint}</span>
                </button>
              ))}
            </div>

            {draft.type === 'automated' ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold">Products must match</span>
                  <select
                    value={draft.ruleMatch}
                    onChange={(e) => set({ ruleMatch: e.target.value })}
                    className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-semibold outline-none"
                  >
                    <option value="all">all conditions</option>
                    <option value="any">any condition</option>
                  </select>
                </div>

                {draft.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <select
                      value={rule.field}
                      onChange={(e) => setRule(idx, { field: e.target.value })}
                      className={`${inputClass} flex-1`}
                    >
                      {RULE_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <select
                      value={rule.operator}
                      onChange={(e) => setRule(idx, { operator: e.target.value })}
                      className={`${inputClass} flex-1`}
                    >
                      {RULE_OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <input
                      value={rule.value}
                      onChange={(e) => setRule(idx, { value: e.target.value })}
                      placeholder="Value"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      onClick={() => set({ rules: draft.rules.filter((_, i) => i !== idx) })}
                      disabled={draft.rules.length === 1}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 disabled:opacity-30 shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => set({ rules: [...draft.rules, { field: 'category', operator: 'equals', value: '' }] })}
                  className="text-[11px] font-bold text-[#005bd3] hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add another condition
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPickerOpen(true)}
                className="w-full py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-[#005bd3] text-xs font-bold text-[#005bd3] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add products
              </button>
            )}

            {/* Live membership preview */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                  {members.length} {members.length === 1 ? 'product' : 'products'} in this collection
                </span>
                <select
                  value={draft.sortOrder}
                  onChange={(e) => set({ sortOrder: e.target.value })}
                  className="text-[11px] font-semibold bg-transparent outline-none cursor-pointer"
                >
                  {SORT_ORDERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-neutral-100 dark:divide-neutral-800">
                {members.length === 0 ? (
                  <p className="p-6 text-center text-[11px] text-neutral-400">
                    {draft.type === 'automated'
                      ? 'No products match these conditions yet.'
                      : 'No products added yet.'}
                  </p>
                ) : (
                  members.map((p) => (
                    <div key={p._id} className="flex items-center gap-3 px-3 py-2">
                      <div className="h-8 w-8 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 flex items-center justify-center">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-3.5 w-3.5 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{p.title}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{p.category}</p>
                      </div>
                      {draft.type === 'manual' && (
                        <button
                          onClick={() => toggleProduct(String(p._id))}
                          title="Remove from collection"
                          className="p-1 rounded text-neutral-400 hover:text-rose-600 shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* SEO */}
          <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-bold">Search engine listing</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Page title</label>
              <input
                value={draft.seo?.title || ''}
                onChange={(e) => set({ seo: { ...draft.seo, title: e.target.value } })}
                placeholder={draft.title}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Meta description</label>
              <textarea
                rows={2}
                value={draft.seo?.description || ''}
                onChange={(e) => set({ seo: { ...draft.seo, description: e.target.value } })}
                placeholder={draft.description}
                className={inputClass}
              />
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm p-4 space-y-2.5">
            <h2 className="text-sm font-bold">Status</h2>
            <select value={draft.status} onChange={(e) => set({ status: e.target.value })} className={inputClass}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <label className="flex items-center justify-between gap-2 pt-1 cursor-pointer">
              <span className="text-xs font-medium">Show on the website</span>
              <button
                type="button"
                onClick={() => set({ showOnStorefront: !draft.showOnStorefront })}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                  draft.showOnStorefront ? 'bg-[#1a1a1a] dark:bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                  draft.showOnStorefront ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </label>
          </section>

          <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm p-4 space-y-2.5">
            <h2 className="text-sm font-bold">Collection image</h2>
            <div className="aspect-[16/9] rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
              {draft.image ? (
                <img src={draft.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-6 w-6 text-neutral-300" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[11px] font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="h-3 w-3" /> Upload
              </button>
              {draft.image && (
                <button
                  onClick={() => set({ image: '' })}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <input
              value={draft.image?.startsWith('data:') ? '' : draft.image}
              onChange={(e) => set({ image: e.target.value })}
              placeholder="…or paste an image URL"
              className={inputClass}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { handleImage(e.target.files?.[0]); e.target.value = ''; }}
            />
          </section>
        </div>
      </div>

      {pickerOpen && (
        <ProductPicker
          products={products}
          selectedIds={draft.productIds.map(String)}
          onToggle={toggleProduct}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
const AdminCategories = () => {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    const [colRes, prodRes] = await Promise.allSettled([
      API.get('/collections'),
      // The admin curates drafts too, so it asks for the whole catalogue.
      API.get('/products?limit=all&includeDrafts=true')
    ]);

    if (colRes.status === 'fulfilled' && colRes.value.data?.success) {
      setCollections(colRes.value.data.collections || []);
    }
    if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
      setProducts(prodRes.value.data.products || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (draft) => {
    setSaving(true);
    try {
      if (draft._id) {
        await API.put(`/collections/${draft._id}`, draft);
      } else {
        await API.post('/collections', draft);
      }
      await load();
      // The storefront collection index and menu read this — tell them.
      publishStoreChange([STORE_TOPICS.COLLECTIONS, STORE_TOPICS.PRODUCTS]);
      setEditing(null);
      showToast('success', draft._id ? 'Collection saved' : 'Collection created');
    } catch (e) {
      showToast('error', e?.response?.data?.message || 'Could not save the collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (collection) => {
    if (!window.confirm(`Delete "${collection.title}"? Products stay in the catalogue.`)) return;
    try {
      await API.delete(`/collections/${collection._id}`);
      await load();
      publishStoreChange([STORE_TOPICS.COLLECTIONS, STORE_TOPICS.PRODUCTS]);
      setEditing(null);
      showToast('success', 'Collection deleted');
    } catch (e) {
      showToast('error', 'Could not delete the collection');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} collection(s)?`)) return;
    await Promise.all(selected.map((id) => API.delete(`/collections/${id}`).catch(() => {})));
    setSelected([]);
    await load();
    publishStoreChange([STORE_TOPICS.COLLECTIONS, STORE_TOPICS.PRODUCTS]);
    showToast('success', 'Collections deleted');
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) => c.title?.toLowerCase().includes(q) || c.handle?.toLowerCase().includes(q)
    );
  }, [collections, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (editing) {
    return (
      <div className="font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">
        <CollectionEditor
          initial={editing}
          products={products}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={handleDelete}
        />
        {toast && (
          <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#1a1a1a] text-white'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-400" />}
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">Collections</h1>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/collections"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View on site
          </a>
          <button
            onClick={() => setEditing(blankCollection())}
            className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Create collection
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-2.5 px-3 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md">All</span>
            <div className="relative flex-1 max-w-sm flex items-center">
              <Search className="h-3.5 w-3.5 absolute left-2.5 text-neutral-400 pointer-events-none" />
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search collections"
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete ({selected.length})
            </button>
          )}

          <button className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300" title="Columns">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-xs text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading collections…
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Layers className="h-8 w-8 text-neutral-300 mx-auto" />
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {searchTerm ? `No collections match “${searchTerm}”` : 'No collections yet'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setEditing(blankCollection())}
                className="text-xs font-bold text-[#005bd3] hover:underline"
              >
                Create your first collection
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                  <th className="py-2.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={(e) => setSelected(e.target.checked ? paginated.map((c) => c._id) : [])}
                      className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Products</th>
                  <th className="py-2.5 px-3">Product conditions</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                {paginated.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => setEditing({ ...blankCollection(), ...c, rules: c.rules?.length ? c.rules : blankCollection().rules })}
                    className="cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(c._id)}
                        onChange={() =>
                          setSelected((prev) => prev.includes(c._id) ? prev.filter((i) => i !== c._id) : [...prev, c._id])
                        }
                        className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                          {c.image ? (
                            <img src={c.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Layers className="h-4 w-4 text-neutral-400" />
                          )}
                        </div>
                        <span className="font-semibold text-[#1a1a1a] dark:text-white hover:underline">{c.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300 font-medium">
                      {c.productsCount ?? 0}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 dark:text-neutral-400">
                      {c.type === 'automated'
                        ? (c.rules || [])
                            .filter((r) => r.value)
                            .map((r) => `${r.field} ${r.operator} ${r.value}`)
                            .join(c.ruleMatch === 'any' ? ' or ' : ' and ') || 'No conditions set'
                        : 'Manually selected'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        c.status === 'active'
                          ? 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > itemsPerPage && (
          <div className="p-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center gap-1 text-xs text-neutral-500">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <span className="ml-2 font-medium">
              {(currentPage - 1) * itemsPerPage + 1}–{Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length}
            </span>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#1a1a1a] text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-400" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
