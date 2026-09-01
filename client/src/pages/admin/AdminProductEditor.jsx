import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronUp, ChevronDown, Plus, X, Trash2, GripVertical,
  Pencil, Upload, Image as ImageIcon, Copy, Archive, Share2,
  MoreHorizontal, Search, Info, Loader2, Check, AlertCircle,
  Tag as TagIcon, Eye, Star
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';
import CSV_PRODUCTS from '../../data/csvProducts.json';
import RichTextEditor from '../../components/admin/RichTextEditor';

/* ═══════════════════════════════════════════════════════════════════
   REFERENCE DATA
   Categories, collections and metafield definitions come from what the
   Nuva storefront actually uses, so the editor never offers a value the
   shop can't filter or render.
═══════════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  'Fresh Produce',
  'Pulses & Lentils',
  'Grains & Staples',
  'Spices & Seasonings',
  'Oils & Ghee',
  'Healthy Sweeteners'
];

const PRODUCT_TYPES = [
  'None', 'Fresh Fruit', 'Fresh Vegetable', 'Exotic Produce', 'Flour',
  'Whole Grain', 'Lentil', 'Whole Spice', 'Ground Spice', 'Edible Oil',
  'Ghee', 'Natural Sweetener'
];

const SALES_CHANNELS = ['Online Store', 'B2B Wholesale', 'Point of Sale'];

const THEME_TEMPLATES = ['Default product', 'Fresh produce', 'Staples & grains', 'Gift hamper'];

const MEASURE_PRESETS = ['100g', '250g', '500g', '1 KG', '2 KG', '5 KG', '250ml', '500ml', '1 L'];

/* Category-driven metafields — the food attributes Shopify surfaces for a
   produce category, kept relevant to what Nuva sells. */
const CATEGORY_METAFIELDS = {
  common: [
    { name: 'allergenInformation', label: 'Allergen information', type: 'text', placeholder: 'e.g. May contain traces of nuts' },
    { name: 'dietaryPreferences', label: 'Dietary preferences', type: 'text', placeholder: 'e.g. Vegan, Gluten-free, Sattvic' },
    { name: 'foodProductForm', label: 'Food product form', type: 'text', placeholder: 'e.g. Whole, Powder, Cold-pressed' }
  ],
  suggested: {
    'Fresh Produce': [
      { name: 'fruitCutStyle', label: 'Fruit cut style', type: 'text', placeholder: 'e.g. Whole, Sliced, Diced' },
      { name: 'storageRequirements', label: 'Storage requirements', type: 'text', placeholder: 'e.g. Refrigerate at 4–8°C' },
      { name: 'shelfLife', label: 'Shelf life', type: 'text', placeholder: 'e.g. 5–7 days refrigerated' },
      { name: 'originFarm', label: 'Origin farm', type: 'text', placeholder: 'e.g. Anand, Gujarat' }
    ],
    'Pulses & Lentils': [
      { name: 'storageRequirements', label: 'Storage requirements', type: 'text', placeholder: 'e.g. Cool, dry place' },
      { name: 'polishStatus', label: 'Polish status', type: 'text', placeholder: 'e.g. Unpolished' },
      { name: 'shelfLife', label: 'Shelf life', type: 'text', placeholder: 'e.g. 12 months' }
    ],
    'Grains & Staples': [
      { name: 'grindType', label: 'Grind type', type: 'text', placeholder: 'e.g. Stone-ground' },
      { name: 'storageRequirements', label: 'Storage requirements', type: 'text', placeholder: 'e.g. Airtight container' },
      { name: 'shelfLife', label: 'Shelf life', type: 'text', placeholder: 'e.g. 6 months' }
    ],
    'Spices & Seasonings': [
      { name: 'curcuminContent', label: 'Active compound content', type: 'text', placeholder: 'e.g. 7–9% curcumin' },
      { name: 'processingMethod', label: 'Processing method', type: 'text', placeholder: 'e.g. Sun-dried, stone-ground' },
      { name: 'storageRequirements', label: 'Storage requirements', type: 'text', placeholder: 'e.g. Away from sunlight' }
    ],
    'Oils & Ghee': [
      { name: 'extractionMethod', label: 'Extraction method', type: 'text', placeholder: 'e.g. Wood cold-pressed, Bilona' },
      { name: 'smokePoint', label: 'Smoke point', type: 'text', placeholder: 'e.g. 250°C' },
      { name: 'storageRequirements', label: 'Storage requirements', type: 'text', placeholder: 'e.g. Cool, dark place' }
    ],
    'Healthy Sweeteners': [
      { name: 'sourcePlant', label: 'Source', type: 'text', placeholder: 'e.g. Sugarcane, Palm, Wild forest' },
      { name: 'glycemicIndex', label: 'Glycemic index', type: 'text', placeholder: 'e.g. Low (GI 35)' },
      { name: 'storageRequirements', label: 'Storage requirements', type: 'text', placeholder: 'e.g. Airtight, moisture-free' }
    ]
  }
};

/* Store-level custom metafield definitions available to pin on a product. */
const PRODUCT_METAFIELD_DEFINITIONS = [
  { name: 'disclosures', label: 'Disclosures', type: 'textarea', placeholder: 'FSSAI licence, batch disclaimers, legal notes' },
  { name: 'ozoneBatch', label: 'Ozone wash batch', type: 'text', placeholder: 'e.g. O3-482910' },
  { name: 'harvestWindow', label: 'Harvest window', type: 'text', placeholder: 'e.g. March – May' },
  { name: 'certifications', label: 'Certifications', type: 'text', placeholder: 'e.g. FSSAI, HACCP, ISO 9001' },
  { name: 'farmerStory', label: 'Farmer story', type: 'textarea', placeholder: 'Who grew it, and how' }
];

const STORE_DOMAIN = 'thenuva.com';
const STORE_NAME = 'Nuva Nutrition';

const slugify = (text) =>
  (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const formatMoney = (n) => `₹${Number(n || 0).toFixed(2)}`;

/* ═══════════════════════════════════════════════════════════════════
   SHARED CARD CHROME
═══════════════════════════════════════════════════════════════════ */
const Card = ({ title, action, children, className = '', padded = true }) => (
  <section className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm ${className}`}>
    {(title || action) && (
      <div className={`flex items-center justify-between gap-2 ${padded ? 'px-4 pt-4 pb-2' : 'p-4'}`}>
        {title && <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h2>}
        {action}
      </div>
    )}
    <div className={padded ? 'px-4 pb-4 pt-1' : ''}>{children}</div>
  </section>
);

const Field = ({ label, hint, children, counter }) => (
  <div className="space-y-1.5">
    {label && (
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{label}</label>
        {counter}
      </div>
    )}
    {children}
    {hint && <p className="text-[11px] text-neutral-400 leading-snug">{hint}</p>}
  </div>
);

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

const Chip = ({ children, onClick, icon: Icon = Plus }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
  >
    <Icon className="h-3 w-3" />
    <span>{children}</span>
  </button>
);

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT EDITOR
═══════════════════════════════════════════════════════════════════ */
const blankProduct = () => ({
  title: '',
  description: '',
  category: 'Fresh Produce',
  price: '',
  discountedPrice: '',
  stock: 0,
  unit: '1 KG',
  images: [],
  status: 'active',
  vendor: STORE_NAME,
  productType: 'None',
  tags: [],
  collections: [],
  salesChannels: ['Online Store'],
  themeTemplate: 'Default product',
  isOzoneWashed: true,
  isBestseller: false,
  isFeatured: false,
  options: [],
  variants: [],
  seo: { title: '', description: '', handle: '' },
  categoryMetafields: {},
  metafields: {}
});

const AdminProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [product, setProduct] = useState(blankProduct);
  const [original, setOriginal] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingSeo, setEditingSeo] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [collectionSearch, setCollectionSearch] = useState('');
  const [pinnedMetafields, setPinnedMetafields] = useState([]);
  const [pinnedCategoryFields, setPinnedCategoryFields] = useState([]);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [storeCollections, setStoreCollections] = useState([]);

  const moreRef = useRef(null);
  const mediaInputRef = useRef(null);

  /* ── Load ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    const hydrate = (raw) => {
      if (cancelled || !raw) return;
      const merged = { ...blankProduct(), ...raw };
      merged.seo = { ...blankProduct().seo, ...(raw.seo || {}) };
      merged.categoryMetafields = raw.categoryMetafields || {};
      merged.metafields = raw.metafields || {};
      merged.tags = raw.tags || [];
      merged.collections = raw.collections || [];
      merged.salesChannels = raw.salesChannels?.length ? raw.salesChannels : ['Online Store'];
      merged.images = raw.images || [];
      // A product with no declared options still has one implicit variant,
      // exactly like Shopify's default "Title / Default title".
      merged.options = raw.options?.length ? raw.options : (raw.unit ? [{ name: 'Measure Unit', values: [raw.unit] }] : []);
      merged.variants = raw.variants?.length
        ? raw.variants
        : (raw.unit ? [{ title: raw.unit, optionValues: [raw.unit], price: raw.price || 0, compareAtPrice: raw.discountedPrice || 0, sku: '', stock: raw.stock ?? 0, image: '' }] : []);

      setProduct(merged);
      setOriginal(JSON.stringify(merged));
      setPinnedCategoryFields(Object.keys(merged.categoryMetafields || {}));
      setPinnedMetafields(Object.keys(merged.metafields || {}));
      setLoading(false);
    };

    if (isNew) {
      setOriginal(JSON.stringify(blankProduct()));
      setLoading(false);
    } else {
      // includeDrafts, or the editor could not open an unpublished product —
      // the storefront now hides those behind a 404.
      API.get(`/products/${id}?includeDrafts=true`)
        .then(({ data }) => {
          if (data?.success && data.product) hydrate(data.product);
          else hydrate(CSV_PRODUCTS.find((p) => p._id === id || p.slug === id));
        })
        .catch(() => hydrate(CSV_PRODUCTS.find((p) => p._id === id || p.slug === id)));
    }

    // Sibling list powers the ↑ / ↓ "previous / next product" buttons.
    API.get('/products?limit=all&includeDrafts=true')
      .then(({ data }) => {
        if (cancelled) return;
        setSiblings(data?.success && data.products?.length ? data.products : CSV_PRODUCTS);
      })
      .catch(() => !cancelled && setSiblings(CSV_PRODUCTS));

    return () => { cancelled = true; };
  }, [id, isNew]);

  // Real collections from Products → Collections. Manual collections are the
  // ones a product can be added to by hand; automated ones pick their own
  // members from rules, so they are shown but not toggleable.
  useEffect(() => {
    let cancelled = false;
    API.get('/collections')
      .then(({ data }) => {
        if (!cancelled && data?.success) setStoreCollections(data.collections || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onDown = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreActionsOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const dirty = original !== null && JSON.stringify(product) !== original;

  const set = useCallback((patch) => setProduct((prev) => ({ ...prev, ...patch })), []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Options & variants ───────────────────────────────────────── */
  const addOption = () => {
    if (product.options.length >= 3) return;
    set({ options: [...product.options, { name: product.options.length ? '' : 'Measure Unit', values: [] }] });
  };

  const updateOption = (index, patch) => {
    const options = product.options.map((o, i) => (i === index ? { ...o, ...patch } : o));
    set({ options, variants: rebuildVariants(options, product.variants) });
  };

  const removeOption = (index) => {
    const options = product.options.filter((_, i) => i !== index);
    set({ options, variants: rebuildVariants(options, product.variants) });
  };

  const addOptionValue = (index, value) => {
    const clean = (value || '').trim();
    if (!clean) return;
    const option = product.options[index];
    if (option.values.includes(clean)) return;
    updateOption(index, { values: [...option.values, clean] });
  };

  const removeOptionValue = (index, value) => {
    const option = product.options[index];
    updateOption(index, { values: option.values.filter((v) => v !== value) });
  };

  // Cartesian product of every option's values, carrying over the price /
  // stock / SKU already entered for any combination that still exists.
  function rebuildVariants(options, existing = []) {
    const usable = options.filter((o) => o.values.length > 0);
    if (usable.length === 0) return [];

    const combos = usable.reduce(
      (acc, option) => acc.flatMap((row) => option.values.map((v) => [...row, v])),
      [[]]
    );

    return combos.map((optionValues) => {
      const key = optionValues.join(' / ');
      const prior = existing.find((v) => (v.optionValues || []).join(' / ') === key);
      return {
        title: key,
        optionValues,
        price: prior?.price ?? (Number(product.price) || 0),
        compareAtPrice: prior?.compareAtPrice ?? 0,
        sku: prior?.sku ?? '',
        barcode: prior?.barcode ?? '',
        stock: prior?.stock ?? 0,
        image: prior?.image ?? ''
      };
    });
  }

  const updateVariant = (index, patch) =>
    set({ variants: product.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)) });

  const totalInventory = useMemo(
    () => (product.variants.length
      ? product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      : Number(product.stock) || 0),
    [product.variants, product.stock]
  );

  /* ── Media ────────────────────────────────────────────────────── */
  const addMediaFiles = (files) => {
    Array.from(files || []).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setProduct((prev) => ({ ...prev, images: [...prev.images, reader.result] }));
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => set({ images: product.images.filter((_, i) => i !== index) });

  const makePrimaryMedia = (index) => {
    const images = [...product.images];
    const [picked] = images.splice(index, 1);
    set({ images: [picked, ...images] });
  };

  /* ── Tags & collections ───────────────────────────────────────── */
  const addTag = (raw) => {
    const clean = (raw || '').trim().replace(/,$/, '');
    if (!clean || product.tags.includes(clean)) return;
    set({ tags: [...product.tags, clean] });
    setTagDraft('');
  };

  const toggleFromList = (key, value) =>
    set({ [key]: product[key].includes(value) ? product[key].filter((v) => v !== value) : [...product[key], value] });

  /* ── Metafields ───────────────────────────────────────────────── */
  const categoryFieldDefs = useMemo(() => {
    const suggested = CATEGORY_METAFIELDS.suggested[product.category] || [];
    return { common: CATEGORY_METAFIELDS.common, suggested };
  }, [product.category]);

  const visibleCategoryFields = useMemo(() => {
    const extra = categoryFieldDefs.suggested.filter((f) => pinnedCategoryFields.includes(f.name));
    return [...categoryFieldDefs.common, ...extra];
  }, [categoryFieldDefs, pinnedCategoryFields]);

  const setCategoryMetafield = (name, value) =>
    set({ categoryMetafields: { ...product.categoryMetafields, [name]: value } });

  const setMetafield = (name, value) => set({ metafields: { ...product.metafields, [name]: value } });

  /* ── SEO preview ──────────────────────────────────────────────── */
  const seoHandle = product.seo.handle || product.slug || slugify(product.title) || 'new-product';
  const seoTitle = product.seo.title || (product.title ? `${product.title} | ${STORE_NAME}` : 'Product title');
  const seoDescription =
    product.seo.description || stripHtml(product.description).slice(0, 320) || 'Add a description to preview it here.';

  /* ── Persistence ──────────────────────────────────────────────── */
  const buildPayload = () => {
    const primaryVariant = product.variants[0];
    return {
      ...product,
      // Keep the flat storefront fields in sync with the variant table so the
      // shop grid, cart and bestsellers keep working unchanged.
      price: Number(primaryVariant?.price ?? product.price) || 0,
      discountedPrice: Number(primaryVariant?.compareAtPrice ?? product.discountedPrice) || 0,
      stock: totalInventory,
      unit: primaryVariant?.title || product.unit || '1 KG',
      images: product.images.length ? product.images : ['/bestseller-khapli.jpg'],
      seo: { ...product.seo, handle: seoHandle }
    };
  };

  const handleSave = async () => {
    if (!product.title.trim()) {
      showToast('error', 'A product title is required');
      return;
    }
    if (saving) return;
    setSaving(true);
    const payload = buildPayload();

    try {
      if (isNew) {
        const { data } = await API.post('/products', payload);
        setSaving(false);
        publishStoreChange([STORE_TOPICS.PRODUCTS, STORE_TOPICS.COLLECTIONS]);
        showToast('success', 'Product created');
        if (data?.product?._id) {
          navigate(`/admin/products/${data.product._id}`, { replace: true });
          return;
        }
      } else {
        await API.put(`/products/${id}`, payload);
        setSaving(false);
        // Price, images, status and collection membership all change what the
        // shop renders, so ask any open storefront tab to refetch.
        publishStoreChange([STORE_TOPICS.PRODUCTS, STORE_TOPICS.COLLECTIONS]);
        showToast('success', 'Product saved');
      }
      setProduct(payload);
      setOriginal(JSON.stringify(payload));
    } catch (e) {
      setSaving(false);
      showToast('error', e?.response?.data?.message || 'Could not save — check your connection');
    }
  };

  const handleDiscard = () => {
    if (original) setProduct(JSON.parse(original));
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/products/${id}`);
      publishStoreChange([STORE_TOPICS.PRODUCTS, STORE_TOPICS.COLLECTIONS]);
    } catch (e) { /* fall through — the list refetches anyway */ }
    navigate('/admin/products');
  };

  const handleDuplicate = async () => {
    const copy = { ...buildPayload(), title: `${product.title} (copy)`, status: 'draft' };
    delete copy._id;
    delete copy.slug;
    try {
      const { data } = await API.post('/products', copy);
      if (data?.product?._id) {
        navigate(`/admin/products/${data.product._id}`);
        showToast('success', 'Duplicate created as a draft');
        return;
      }
    } catch (e) { /* ignore */ }
    showToast('error', 'Could not duplicate this product');
  };

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* ── Prev / next product ──────────────────────────────────────── */
  const siblingIndex = siblings.findIndex((p) => p._id === id);
  const goSibling = (delta) => {
    const next = siblings[siblingIndex + delta];
    if (next) navigate(`/admin/products/${next._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-xs text-neutral-400 gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading product…
      </div>
    );
  }

  const statusStyles = {
    active: 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300',
    draft: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    archived: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  };

  return (
    <div className="font-sans text-[#1a1a1a] dark:text-[#e3e3e3] pb-24 max-w-[1000px] mx-auto space-y-4">

      {/* ══ HEADER ══ */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/admin/products"
            className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            title="Back to products"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight truncate max-w-[420px]">
            {product.title || 'New product'}
          </h1>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusStyles[product.status]}`}>
            {product.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <a
              href={`/products/${product._id || id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </a>
          )}

          <button
            onClick={() => {
              const url = `https://${STORE_DOMAIN}/products/${seoHandle}`;
              navigator.clipboard?.writeText(url);
              showToast('success', 'Product link copied');
            }}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreActionsOpen((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <MoreHorizontal className="h-3.5 w-3.5" /> More actions
            </button>
            {moreActionsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#242424] shadow-xl py-1 z-30">
                <button
                  onClick={() => { setMoreActionsOpen(false); handleDuplicate(); }}
                  disabled={isNew}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40"
                >
                  <Copy className="h-3.5 w-3.5 text-neutral-400" /> Duplicate
                </button>
                <button
                  onClick={() => { setMoreActionsOpen(false); set({ status: 'archived' }); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Archive className="h-3.5 w-3.5 text-neutral-400" /> Archive product
                </button>
                <div className="border-t border-neutral-200/70 dark:border-neutral-700 my-1" />
                <button
                  onClick={() => { setMoreActionsOpen(false); handleDelete(); }}
                  disabled={isNew}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete product
                </button>
              </div>
            )}
          </div>

          {!isNew && siblings.length > 1 && (
            <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-800">
              <button
                onClick={() => goSibling(-1)}
                disabled={siblingIndex <= 0}
                title="Previous product"
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <span className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
              <button
                onClick={() => goSibling(1)}
                disabled={siblingIndex === -1 || siblingIndex >= siblings.length - 1}
                title="Next product"
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ TWO-COLUMN BODY ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ─────────── LEFT COLUMN ─────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Title & description */}
          <Card>
            <div className="space-y-4">
              <Field label="Title">
                <input
                  type="text"
                  value={product.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="Short sleeve t-shirt"
                  className={`${inputClass} font-semibold`}
                />
              </Field>

              <Field label="Description">
                <RichTextEditor
                  value={product.description}
                  onChange={(html) => set({ description: html })}
                  placeholder="Describe the product, its origin, and how it is grown or processed…"
                />
              </Field>
            </div>
          </Card>

          {/* Media */}
          <Card
            title="Media"
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => mediaInputRef.current?.click()}
                  className="text-[11px] font-bold text-[#005bd3] hover:underline"
                >
                  Upload new
                </button>
                <button
                  onClick={() => {
                    const url = window.prompt('Image URL');
                    if (url) set({ images: [...product.images, url] });
                  }}
                  className="text-[11px] font-bold text-[#005bd3] hover:underline"
                >
                  Add from URL
                </button>
              </div>
            }
          >
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { addMediaFiles(e.target.files); e.target.value = ''; }}
            />

            {product.images.length === 0 ? (
              <button
                onClick={() => mediaInputRef.current?.click()}
                className="w-full py-10 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#005bd3] hover:bg-blue-50/30 dark:hover:bg-neutral-800 transition-colors flex flex-col items-center gap-2"
              >
                <Upload className="h-5 w-5 text-neutral-400" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Upload new</span>
                <span className="text-[11px] text-neutral-400">Accepts images. The first one is the product thumbnail.</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {product.images.map((src, idx) => (
                  <div
                    key={`${src.slice(0, 24)}-${idx}`}
                    className={`group relative aspect-square rounded-xl overflow-hidden border ${
                      idx === 0
                        ? 'border-[#005bd3] ring-1 ring-[#005bd3]'
                        : 'border-neutral-200 dark:border-neutral-700'
                    } bg-neutral-50 dark:bg-neutral-900`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute left-1 top-1 px-1.5 py-0.5 rounded bg-[#005bd3] text-white text-[9px] font-bold">
                        Thumbnail
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-1 flex items-center justify-center gap-1 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity">
                      {idx !== 0 && (
                        <button
                          onClick={() => makePrimaryMedia(idx)}
                          title="Use as thumbnail"
                          className="p-1 rounded text-white hover:bg-white/20"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => removeMedia(idx)}
                        title="Remove"
                        className="p-1 rounded text-white hover:bg-white/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => mediaInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#005bd3] flex items-center justify-center text-neutral-400 hover:text-[#005bd3] transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
          </Card>

          {/* Category */}
          <Card
            title="Category"
            action={
              <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                {visibleCategoryFields.length} metafields
              </span>
            }
          >
            <select
              value={product.category}
              onChange={(e) => set({ category: e.target.value })}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-400 mt-1.5 leading-snug">
              Determines storefront filters and adds metafields to improve search, filters, and cross-channel sales.
            </p>
          </Card>

          {/* Variants */}
          <Card
            title="Variants"
            action={
              product.options.length === 0 ? (
                <button
                  onClick={addOption}
                  className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[11px] font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add variant
                </button>
              ) : null
            }
          >
            {product.options.length === 0 ? (
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                This product has a single price of {formatMoney(product.price)} and {product.stock || 0} in stock.
                Add an option — like Measure Unit — to sell it in several pack sizes.
              </p>
            ) : (
              <div className="space-y-3">
                {/* Option editors */}
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700 overflow-hidden">
                  {product.options.map((option, oIdx) => (
                    <div key={oIdx} className="p-3 flex gap-2.5">
                      <GripVertical className="h-4 w-4 text-neutral-300 shrink-0 mt-1.5" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => updateOption(oIdx, { name: e.target.value })}
                            placeholder="Option name (e.g. Measure Unit)"
                            className={`${inputClass} font-semibold`}
                          />
                          <button
                            onClick={() => removeOption(oIdx)}
                            title="Remove option"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {option.values.map((v) => (
                            <span
                              key={v}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"
                            >
                              {v}
                              <button
                                onClick={() => removeOptionValue(oIdx, v)}
                                className="text-neutral-400 hover:text-rose-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            placeholder="Add value + Enter"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                addOptionValue(oIdx, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="px-2 py-1 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 bg-transparent text-[11px] w-40 outline-none focus:border-[#005bd3]"
                          />
                        </div>

                        {oIdx === 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {MEASURE_PRESETS.filter((p) => !option.values.includes(p)).slice(0, 6).map((p) => (
                              <button
                                key={p}
                                onClick={() => addOptionValue(oIdx, p)}
                                className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-[10px] font-semibold text-neutral-500 hover:border-[#005bd3] hover:text-[#005bd3] transition-colors"
                              >
                                + {p}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {product.options.length < 3 && (
                    <button
                      onClick={addOption}
                      className="w-full p-3 flex items-center gap-2 text-xs font-bold text-[#005bd3] hover:bg-blue-50/40 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add another option
                    </button>
                  )}
                </div>

                {/* Variant table */}
                {product.variants.length > 0 && (
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-left">
                          <th className="py-2 px-3 font-semibold">Variant</th>
                          <th className="py-2 px-3 font-semibold w-32">Price</th>
                          <th className="py-2 px-3 font-semibold w-28">SKU</th>
                          <th className="py-2 px-3 font-semibold w-24">Available</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {product.variants.map((variant, vIdx) => (
                          <tr key={variant.title || vIdx} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                                  {variant.image || product.images[0] ? (
                                    <img src={variant.image || product.images[0]} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <ImageIcon className="h-3.5 w-3.5 text-neutral-300" />
                                  )}
                                </div>
                                <span className="font-semibold">{variant.title}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-[11px]">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(vIdx, { price: Number(e.target.value) })}
                                  className={`${inputClass} pl-5 py-1.5`}
                                />
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={variant.sku}
                                placeholder="SKU"
                                onChange={(e) => updateVariant(vIdx, { sku: e.target.value })}
                                className={`${inputClass} py-1.5`}
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                value={variant.stock}
                                onChange={(e) => updateVariant(vIdx, { stock: Number(e.target.value) })}
                                className={`${inputClass} py-1.5`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                      Total inventory across all locations: {totalInventory} available
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Category metafields */}
          <Card
            title="Category metafields"
            action={
              <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                {product.category}
              </span>
            }
          >
            <div className="space-y-3">
              {visibleCategoryFields.map((field) => (
                <div key={field.name} className="grid grid-cols-3 gap-3 items-center">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 col-span-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={product.categoryMetafields[field.name] || ''}
                    placeholder={field.placeholder}
                    onChange={(e) => setCategoryMetafield(field.name, e.target.value)}
                    className={`${inputClass} col-span-2`}
                  />
                </div>
              ))}
            </div>

            {categoryFieldDefs.suggested.some((f) => !pinnedCategoryFields.includes(f.name)) && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                {categoryFieldDefs.suggested
                  .filter((f) => !pinnedCategoryFields.includes(f.name))
                  .map((f) => (
                    <Chip key={f.name} onClick={() => setPinnedCategoryFields((prev) => [...prev, f.name])}>
                      {f.label}
                    </Chip>
                  ))}
              </div>
            )}
          </Card>

          {/* Product metafields */}
          <Card
            title="Product metafields"
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPinnedMetafields(PRODUCT_METAFIELD_DEFINITIONS.map((d) => d.name))}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  View all
                </button>
                <button
                  onClick={() => {
                    const name = window.prompt('New metafield name (e.g. Farm certification)');
                    if (!name) return;
                    const key = slugify(name).replace(/-/g, '_');
                    setPinnedMetafields((prev) => (prev.includes(key) ? prev : [...prev, key]));
                    setMetafield(key, '');
                  }}
                  className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[11px] font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Add definition
                </button>
              </div>
            }
          >
            {pinnedMetafields.length === 0 ? (
              <p className="text-xs text-neutral-400">No metafields pinned</p>
            ) : (
              <div className="space-y-3">
                {pinnedMetafields.map((key) => {
                  const def = PRODUCT_METAFIELD_DEFINITIONS.find((d) => d.name === key) || {
                    name: key,
                    label: key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
                    type: 'text'
                  };
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{def.label}</label>
                        <button
                          onClick={() => setPinnedMetafields((prev) => prev.filter((k) => k !== key))}
                          className="text-neutral-300 hover:text-rose-600"
                          title="Unpin"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {def.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={product.metafields[key] || ''}
                          placeholder={def.placeholder}
                          onChange={(e) => setMetafield(key, e.target.value)}
                          className={inputClass}
                        />
                      ) : (
                        <input
                          type="text"
                          value={product.metafields[key] || ''}
                          placeholder={def.placeholder}
                          onChange={(e) => setMetafield(key, e.target.value)}
                          className={inputClass}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {PRODUCT_METAFIELD_DEFINITIONS.some((d) => !pinnedMetafields.includes(d.name)) && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                {PRODUCT_METAFIELD_DEFINITIONS
                  .filter((d) => !pinnedMetafields.includes(d.name))
                  .map((d) => (
                    <Chip key={d.name} onClick={() => setPinnedMetafields((prev) => [...prev, d.name])}>
                      {d.label}
                    </Chip>
                  ))}
              </div>
            )}
          </Card>

          {/* Search engine listing */}
          <Card
            title="Search engine listing"
            action={
              <button
                onClick={() => setEditingSeo((v) => !v)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title={editingSeo ? 'Close' : 'Edit search engine listing'}
              >
                {editingSeo ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </button>
            }
          >
            {/* Google-style preview */}
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{STORE_NAME}</p>
              <p className="text-[11px] text-neutral-500">
                https://{STORE_DOMAIN} › products › {seoHandle}
              </p>
              <p className="text-base text-[#1a0dab] dark:text-[#8ab4f8] leading-snug line-clamp-2 hover:underline cursor-pointer">
                {seoTitle}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                {seoDescription}
              </p>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 pt-1">
                {formatMoney(product.variants[0]?.price ?? product.price)} INR
              </p>
            </div>

            {editingSeo && (
              <div className="space-y-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <Field
                  label="Page title"
                  counter={
                    <span className={`text-[10px] font-semibold ${(product.seo.title || '').length > 70 ? 'text-amber-600' : 'text-neutral-400'}`}>
                      {(product.seo.title || '').length} of 70
                    </span>
                  }
                >
                  <input
                    type="text"
                    value={product.seo.title}
                    placeholder={seoTitle}
                    onChange={(e) => set({ seo: { ...product.seo, title: e.target.value } })}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Meta description"
                  counter={
                    <span className={`text-[10px] font-semibold ${(product.seo.description || '').length > 160 ? 'text-amber-600' : 'text-neutral-400'}`}>
                      {(product.seo.description || '').length} of 160
                    </span>
                  }
                >
                  <textarea
                    rows={3}
                    value={product.seo.description}
                    placeholder={stripHtml(product.description).slice(0, 160)}
                    onChange={(e) => set({ seo: { ...product.seo, description: e.target.value } })}
                    className={inputClass}
                  />
                </Field>

                <Field label="URL handle" hint={`https://${STORE_DOMAIN}/products/${seoHandle}`}>
                  <input
                    type="text"
                    value={product.seo.handle}
                    placeholder={slugify(product.title)}
                    onChange={(e) => set({ seo: { ...product.seo, handle: slugify(e.target.value) } })}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </Card>
        </div>

        {/* ─────────── RIGHT COLUMN ─────────── */}
        <div className="space-y-4">

          {/* Status */}
          <Card title="Status">
            <select
              value={product.status}
              onChange={(e) => set({ status: e.target.value })}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <p className="text-[11px] text-neutral-400 mt-1.5 leading-snug">
              {product.status === 'active'
                ? 'Visible in the shop and searchable by customers.'
                : product.status === 'draft'
                  ? 'Hidden from the storefront until you set it Active.'
                  : 'Archived products stay in reports but leave the catalog.'}
            </p>
          </Card>

          {/* Publishing */}
          <Card title="Publishing">
            <div className="space-y-1.5">
              {SALES_CHANNELS.map((channel) => {
                const on = product.salesChannels.includes(channel);
                return (
                  <label
                    key={channel}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleFromList('salesChannels', channel)}
                        className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                      />
                      {channel}
                    </span>
                    {on && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </label>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-400 mt-2 leading-snug">
              {product.salesChannels.length} of {SALES_CHANNELS.length} channels selected.
            </p>
          </Card>

          {/* Product organization */}
          <Card title="Product organization">
            <div className="space-y-3.5">
              <Field label="Type">
                <select
                  value={product.productType || 'None'}
                  onChange={(e) => set({ productType: e.target.value })}
                  className={inputClass}
                >
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>

              <Field label="Vendor">
                <input
                  type="text"
                  value={product.vendor}
                  onChange={(e) => set({ vendor: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Collections">
                <div className="space-y-2">
                  {product.collections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.collections.map((handle) => {
                        const meta = storeCollections.find((c) => c.handle === handle || c.title === handle);
                        return (
                          <span
                            key={handle}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"
                          >
                            {meta?.title || handle}
                            <button onClick={() => toggleFromList('collections', handle)} className="text-neutral-400 hover:text-rose-600">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={collectionSearch}
                      onChange={(e) => setCollectionSearch(e.target.value)}
                      placeholder="Search collections"
                      className={`${inputClass} pl-8`}
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto custom-scrollbar rounded-lg border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-100 dark:divide-neutral-800">
                    {storeCollections.length === 0 && (
                      <p className="px-2.5 py-3 text-[11px] text-neutral-400 text-center">
                        No collections yet —{' '}
                        <Link to="/admin/categories" className="font-bold text-[#005bd3] hover:underline">create one</Link>.
                      </p>
                    )}
                    {storeCollections
                      .filter((c) => c.title.toLowerCase().includes(collectionSearch.toLowerCase()))
                      .map((c) => {
                        const on = product.collections.includes(c.handle) || product.collections.includes(c.title);
                        const automated = c.type === 'automated';
                        return (
                          <button
                            key={c._id}
                            disabled={automated}
                            title={automated ? 'Automated collection — membership comes from its rules' : undefined}
                            onClick={() => toggleFromList('collections', c.handle)}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="truncate">{c.title}</span>
                            <span className="flex items-center gap-1.5 shrink-0">
                              {automated && (
                                <span className="text-[9px] font-bold uppercase text-neutral-400">Automated</span>
                              )}
                              {on && <Check className="h-3 w-3 text-emerald-600" />}
                            </span>
                          </button>
                        );
                      })}
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Products added here appear on that collection's page on the website.
                  </p>
                </div>
              </Field>

              <Field label="Tags">
                <div className="space-y-2">
                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"
                        >
                          <TagIcon className="h-3 w-3 text-neutral-400" />
                          {t}
                          <button onClick={() => toggleFromList('tags', t)} className="text-neutral-400 hover:text-rose-600">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag(tagDraft);
                      }
                    }}
                    onBlur={() => addTag(tagDraft)}
                    placeholder="Add tags, separated by Enter"
                    className={inputClass}
                  />
                </div>
              </Field>
            </div>
          </Card>

          {/* Storefront flags — the real merchandising switches this shop uses */}
          <Card title="Storefront placement">
            <div className="space-y-1">
              {[
                { key: 'isBestseller', label: 'Show in Nuva Bestsellers' },
                { key: 'isFeatured', label: 'Feature on the home page' },
                { key: 'isOzoneWashed', label: 'Ozone-washed badge' }
              ].map((flag) => (
                <label
                  key={flag.key}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                >
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{flag.label}</span>
                  <button
                    type="button"
                    onClick={() => set({ [flag.key]: !product[flag.key] })}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                      product[flag.key] ? 'bg-[#1a1a1a] dark:bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                        product[flag.key] ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </Card>

          {/* Theme template */}
          <Card title="Theme template">
            <select
              value={product.themeTemplate}
              onChange={(e) => set({ themeTemplate: e.target.value })}
              className={inputClass}
            >
              {THEME_TEMPLATES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Card>

          {/* Sales */}
          {!isNew && (
            <Card title="Sales">
              <p className="text-xs text-neutral-400">No recent sales of this product</p>
              <Link to="/admin/analytics" className="text-[11px] font-bold text-[#005bd3] hover:underline mt-1 inline-block">
                View details
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* ══ STICKY SAVE BAR ══ */}
      {(dirty || saving) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 pl-4 pr-2 py-2 rounded-xl bg-[#1a1a1a] text-white shadow-2xl border border-neutral-700">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <Info className="h-3.5 w-3.5 text-amber-300" />
            Unsaved changes
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDiscard}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg border border-neutral-600 text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold flex items-center gap-1.5 disabled:opacity-60 transition-colors"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (
        <div
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#1a1a1a] text-white'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default AdminProductEditor;
