import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, ChevronDown, ArrowRight, Truck, MapPin, Search, Download,
  ScanLine, Calendar, FileSignature, StickyNote, Hash, ReceiptText, X,
  Loader2, AlertCircle, Package, Trash2
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';
import { parseCsv, downloadCsv, toCsv, readFileAsText } from '../../lib/csv';
import CSV_PRODUCTS from '../../data/csvProducts.json';

/* ═══════════════════════════════════════════════════════════════════
   CREATE TRANSFER
   Shopify's transfer screen: the route across the top, the products
   travelling it below, and the paperwork — arrival date, reference, note,
   tags, purchase order — as a list of fields that stay out of the way
   until you need them.
═══════════════════════════════════════════════════════════════════ */
const FALLBACK_LOCATIONS = [
  { id: 'vadodara-chamber', name: 'Vadodara Bio-Purification Chamber', city: 'Vadodara, Gujarat' },
  { id: 'ahmedabad-hub', name: 'Ahmedabad Express Fulfillment Hub', city: 'Ahmedabad, Gujarat' },
  { id: 'surat-coldpress', name: 'Surat Cold-Press Unit #2', city: 'Surat, Gujarat' },
  { id: 'mumbai-depot', name: 'Mumbai Metro Distribution Depot', city: 'Mumbai, Maharashtra' },
  { id: 'anand-farm', name: 'Anand Partner Farm Collection Point', city: 'Anand, Gujarat' }
];

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

const formatDay = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

const inTwoWeeks = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
};

const Card = ({ children, className = '' }) => (
  <section className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm ${className}`}>
    {children}
  </section>
);

const SecondaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
  >
    {children}
  </button>
);

const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${className}`}
  >
    {children}
  </button>
);

/* ── The origin / destination picker at both ends of the route ── */
const LocationPicker = ({ label, value, locations, exclude, onChange }) => {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selected = locations.find((l) => l.id === value);

  return (
    <div className="relative min-w-0" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 max-w-full px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
        <span className={`text-xs font-semibold truncate ${selected ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
          {selected ? selected.name : label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 left-0 mt-1 w-72 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {locations.map((loc) => {
            const disabled = loc.id === exclude;
            return (
              <button
                key={loc.id}
                type="button"
                disabled={disabled}
                onClick={() => { onChange(loc.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0 transition-colors ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                } ${loc.id === value ? 'bg-neutral-50 dark:bg-neutral-800/60' : ''}`}
              >
                <span className="block text-xs font-semibold text-neutral-900 dark:text-white">{loc.name}</span>
                <span className="block text-[11px] text-neutral-500">
                  {disabled ? 'Already used on this transfer' : loc.city}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── One row of the paperwork list: a link until it's opened ── */
const DetailRow = ({ icon: Icon, label, filled, open, onOpen, children }) => (
  <div className="flex items-start gap-3 px-4 py-2">
    <Icon className="h-3.5 w-3.5 text-neutral-500 mt-1.5 shrink-0" />
    <div className="flex-1 min-w-0">
      {open ? (
        children
      ) : filled ? (
        <button
          type="button"
          onClick={onOpen}
          className="text-xs text-neutral-900 dark:text-white font-medium text-left hover:underline py-1"
        >
          {filled}
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="text-xs font-medium text-[#005bd3] dark:text-blue-400 hover:underline py-1"
        >
          {label}
        </button>
      )}
    </div>
  </div>
);

const AdminTransferCreate = () => {
  const navigate = useNavigate();

  const [locations, setLocations] = useState(FALLBACK_LOCATIONS);
  const [catalogue, setCatalogue] = useState(CSV_PRODUCTS || []);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [items, setItems] = useState([]);

  const [estimatedArrival, setEstimatedArrival] = useState(inTwoWeeks());
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [openField, setOpenField] = useState(null);

  const [query, setQuery] = useState('');
  const [resultsOpen, setResultsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const searchBoxRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/transfers/locations');
        if (data?.locations?.length) setLocations(data.locations);
      } catch (e) { /* the built-in site list still works */ }

      try {
        const { data } = await API.get('/products?limit=all&includeDrafts=true');
        if (data?.success && data.products?.length) setCatalogue(data.products);
      } catch (e) { /* CSV catalogue already seeded */ }
    };
    load();
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setResultsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const totalUnits = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.quantity), 0),
    [items]
  );

  const skuOf = (p) => p.variants?.[0]?.sku || p.ozoneBatchNumber || '';

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const chosen = new Set(items.map((i) => i.productId));
    return catalogue
      .filter((p) => !chosen.has(p._id))
      .filter((p) =>
        [p.title, p.category, skuOf(p)].some((f) => String(f || '').toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, catalogue, items]);

  const addProduct = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          title: product.title,
          sku: skuOf(product),
          unit: product.unit || '',
          image: product.images?.[0] || '',
          onHand: Number(product.stock) || 0,
          quantity
        }
      ];
    });
    setQuery('');
    setResultsOpen(false);
  };

  const setQuantity = (productId, next) => {
    const qty = Math.max(1, Math.min(9999, Number(next) || 1));
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
  };

  const removeItem = (productId) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  /* ── Bulk add by CSV ──
     The same two columns the download hands back, so a warehouse can fill a
     sheet on the floor and load it here. */
  const handleImport = async (file) => {
    if (!file) return;
    setError('');
    try {
      const { rows } = parseCsv(await readFileAsText(file));
      let added = 0;
      const missing = [];

      rows.forEach((row) => {
        const cells = {};
        Object.entries(row).forEach(([k, v]) => { cells[k.trim().toLowerCase()] = v; });
        const key = String(cells.sku || cells.handle || cells.title || '').trim().toLowerCase();
        const quantity = Math.max(1, Number(cells.quantity) || 1);
        if (!key) return;

        const product = catalogue.find((p) =>
          [skuOf(p), p.slug, p.title].some((f) => String(f || '').trim().toLowerCase() === key)
        );
        if (product) {
          addProduct(product, quantity);
          added += 1;
        } else {
          missing.push(key);
        }
      });

      if (added === 0) {
        setError('Nothing in that file matched a product. Use a SKU, handle or title column.');
      } else if (missing.length > 0) {
        setError(`Added ${added}. No product matched: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`);
      }
    } catch (e) {
      setError(e.message || 'That file could not be read.');
    }
  };

  const handleExport = () => {
    if (items.length === 0) return;
    downloadCsv(
      `nuva_transfer_draft_${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(items, [
        { header: 'SKU', write: (i) => i.sku },
        { header: 'Title', write: (i) => i.title },
        { header: 'Unit', write: (i) => i.unit },
        { header: 'Quantity', write: (i) => i.quantity }
      ])
    );
  };

  /* Scanning is a keyboard-wedge barcode field: the gun types the SKU and
     presses Enter, which is exactly what a text input already handles. */
  const handleScan = (code) => {
    const key = code.trim().toLowerCase();
    if (!key) return;
    const product = catalogue.find((p) =>
      [skuOf(p), p.slug, p.title].some((f) => String(f || '').trim().toLowerCase() === key)
    );
    if (product) {
      addProduct(product, 1);
      setError('');
    } else {
      setError(`No product carries the code "${code}".`);
    }
  };

  const addTag = () => {
    const value = tagDraft.trim();
    if (!value) return;
    if (!tags.includes(value)) setTags([...tags, value]);
    setTagDraft('');
  };

  const submit = async (status) => {
    if (items.length === 0) return setError('Add at least one product to transfer.');
    if (!origin || !destination) return setError('Choose both an origin and a destination.');

    setSaving(true);
    setError('');

    try {
      await API.post('/transfers', {
        status,
        origin,
        destination,
        name,
        note,
        tags,
        purchaseOrder,
        estimatedArrival,
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          sku: i.sku,
          unit: i.unit,
          image: i.image,
          quantity: i.quantity
        }))
      });
      publishStoreChange([STORE_TOPICS.INVENTORY]);
      navigate('/admin/inventory?view=transfers');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save this transfer. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="font-sans text-[#1a1a1a] dark:text-[#e3e3e3] pb-24">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 mb-4">
        <Link
          to="/admin/inventory?view=transfers"
          title="Back to transfers"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
        >
          <Truck className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <h1 className="text-lg font-bold tracking-tight">Create transfer</h1>
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="max-w-3xl space-y-4">

        {/* ═══════════════════════════════════════════════════════
            ROUTE + PRODUCT SEARCH
        ═══════════════════════════════════════════════════════ */}
        <Card>
          {/* Origin → status → destination */}
          <div className="flex items-center gap-2 px-3 py-2.5 flex-wrap">
            <LocationPicker
              label="Select origin"
              value={origin}
              exclude={destination}
              locations={locations}
              onChange={setOrigin}
            />

            <ArrowRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />

            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              <Truck className="h-3.5 w-3.5 text-neutral-500" />
              In transit
            </span>

            <ArrowRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />

            <LocationPicker
              label="Select destination"
              value={destination}
              exclude={origin}
              locations={locations}
              onChange={setDestination}
            />
          </div>

          {/* Search / import / scan */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1" ref={searchBoxRef}>
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setResultsOpen(true); }}
                  onFocus={() => setResultsOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && results.length > 0) {
                      e.preventDefault();
                      addProduct(results[0]);
                    }
                  }}
                  placeholder="Search products to add"
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#f1f1f1] dark:bg-[#242424] border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] text-xs outline-none transition-colors"
                />

                {resultsOpen && query.trim() && (
                  <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                    {results.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-neutral-500">No products match “{query}”.</p>
                    ) : (
                      results.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => addProduct(p)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                        >
                          <span className="h-8 w-8 rounded-lg border border-[#e1e1e1] dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-neutral-400" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate">{p.title}</span>
                            <span className="block text-[11px] text-neutral-500 truncate">
                              {[p.unit, skuOf(p)].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                          <span className="text-[11px] text-neutral-500 shrink-0">
                            {Number(p.stock) || 0} on hand
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => importRef.current?.click()}
                title="Add products from a CSV"
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
              <input
                ref={importRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => { handleImport(e.target.files?.[0]); e.target.value = ''; }}
              />

              <button
                type="button"
                onClick={() => setScanning((v) => !v)}
                title="Scan a barcode"
                className={`p-2 rounded-lg transition-colors ${
                  scanning
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <ScanLine className="h-4 w-4" />
              </button>
            </div>

            {scanning && (
              <div className="mt-2 flex items-center gap-2">
                <ScanLine className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Scan or type a barcode, then press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleScan(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {/* Line items */}
          {items.length > 0 && (
            <div className="border-t border-[#e1e1e1] dark:border-neutral-800">
              <div className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-neutral-500 border-b border-[#e1e1e1] dark:border-neutral-800">
                <span>{items.length} {items.length === 1 ? 'product' : 'products'}</span>
                <span>{totalUnits} {totalUnits === 1 ? 'unit' : 'units'}</span>
              </div>

              <div className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="h-9 w-9 rounded-lg border border-[#e1e1e1] dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4 text-neutral-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {[item.unit, item.sku].filter(Boolean).join(' · ') || 'No SKU'}
                      </p>
                    </div>

                    <span className="text-[11px] text-neutral-500 shrink-0 hidden sm:block">
                      {item.onHand} on hand
                    </span>

                    <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => setQuantity(item.productId, e.target.value)}
                        className="w-12 text-center text-xs bg-transparent outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      title="Remove"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-[#e1e1e1] dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleExport}
                  className="text-[11px] font-semibold text-[#005bd3] dark:text-blue-400 hover:underline"
                >
                  Download this list as CSV
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ═══════════════════════════════════════════════════════
            SHIPMENT DETAILS
        ═══════════════════════════════════════════════════════ */}
        <Card className="py-2">
          {/* Estimated arrival */}
          <DetailRow
            icon={Calendar}
            label="Add estimated arrival"
            open={openField === 'date'}
            filled={
              estimatedArrival && (
                <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs">
                  {formatDay(estimatedArrival)}
                </span>
              )
            }
            onOpen={() => setOpenField('date')}
          >
            <div className="flex items-center gap-2">
              <input
                type="date"
                autoFocus
                value={estimatedArrival}
                onChange={(e) => setEstimatedArrival(e.target.value)}
                className={inputClass}
              />
              <SecondaryButton onClick={() => setOpenField(null)}>Done</SecondaryButton>
            </div>
          </DetailRow>

          {/* Reference name */}
          <DetailRow
            icon={FileSignature}
            label="Add reference name"
            open={openField === 'name'}
            filled={name}
            onOpen={() => setOpenField('name')}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setOpenField(null)}
                placeholder="e.g. Week 36 chamber restock"
                className={inputClass}
              />
              <SecondaryButton onClick={() => setOpenField(null)}>Done</SecondaryButton>
            </div>
          </DetailRow>

          {/* Note */}
          <DetailRow
            icon={StickyNote}
            label="Add note"
            open={openField === 'note'}
            filled={note}
            onOpen={() => setOpenField('note')}
          >
            <div className="space-y-2">
              <textarea
                rows={3}
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything the receiving team should know"
                className={inputClass}
              />
              <div className="flex justify-end">
                <SecondaryButton onClick={() => setOpenField(null)}>Done</SecondaryButton>
              </div>
            </div>
          </DetailRow>

          {/* Tags */}
          <DetailRow
            icon={Hash}
            label="Add tags"
            open={openField === 'tags'}
            filled={
              tags.length > 0 && (
                <span className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium">
                      {t}
                    </span>
                  ))}
                </span>
              )
            }
            onOpen={() => setOpenField('tags')}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
                  }}
                  onBlur={addTag}
                  placeholder="Add a tag and press Enter"
                  className={inputClass}
                />
                <SecondaryButton onClick={() => { addTag(); setOpenField(null); }}>Done</SecondaryButton>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium"
                    >
                      {t}
                      <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                        <X className="h-3 w-3 hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </DetailRow>

          {/* Purchase order */}
          <DetailRow
            icon={ReceiptText}
            label="Link purchase order"
            open={openField === 'po'}
            filled={purchaseOrder}
            onOpen={() => setOpenField('po')}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={purchaseOrder}
                onChange={(e) => setPurchaseOrder(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setOpenField(null)}
                placeholder="e.g. PO-2026-0148"
                className={inputClass}
              />
              <SecondaryButton onClick={() => setOpenField(null)}>Done</SecondaryButton>
            </div>
          </DetailRow>
        </Card>
      </div>

      {/* ── Sticky action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#d8d8d8] dark:border-neutral-800 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur px-4 py-2.5 flex items-center justify-end gap-2">
        {items.length > 0 && (
          <span className="mr-auto text-xs text-neutral-500">
            {totalUnits} {totalUnits === 1 ? 'unit' : 'units'} across {items.length} {items.length === 1 ? 'product' : 'products'}
          </span>
        )}
        <SecondaryButton onClick={() => navigate('/admin/inventory?view=transfers')} disabled={saving}>
          Discard
        </SecondaryButton>
        <SecondaryButton onClick={() => submit('Draft')} disabled={saving || items.length === 0}>
          Save as draft
        </SecondaryButton>
        <PrimaryButton
          onClick={() => submit('In transit')}
          disabled={saving || items.length === 0 || !origin || !destination}
          className="flex items-center gap-1.5"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? 'Saving…' : 'Create transfer'}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default AdminTransferCreate;
