import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, Plus, X, Search, Pencil, Globe, Share2, Info, Trash2,
  Loader2, AlertCircle, FileText, Check, User, Package
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';
import CSV_PRODUCTS from '../../data/csvProducts.json';

/* ═══════════════════════════════════════════════════════════════════
   CREATE ORDER
   Shopify's draft order screen: line items and payment on the left, the
   customer and order attributes on the right. Nothing here is decorative —
   every control feeds the payload POSTed to /orders, and the totals are
   the same GST-inclusive arithmetic the checkout and order detail use.
═══════════════════════════════════════════════════════════════════ */
const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const TAX_RATE = 0.05;

const SHIPPING_PRESETS = [
  { label: 'Free shipping', price: 0 },
  { label: 'Local delivery', price: 49 },
  { label: 'Standard shipping', price: 99 },
  { label: 'Express shipping', price: 199 }
];

const PAID_METHODS = ['UPI Instant QR Pay', 'Cash', 'Bank Transfer', 'Credit / Debit card'];

const CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (INR ₹)' },
  { code: 'USD', label: 'US Dollar (USD $)' },
  { code: 'AED', label: 'UAE Dirham (AED د.إ)' }
];

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

const Card = ({ title, action, children, className = '' }) => (
  <section className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        {title && <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h2>}
        {action}
      </div>
    )}
    <div className="px-4 pb-4 pt-1">{children}</div>
  </section>
);

const IconButton = ({ onClick, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
  >
    {children}
  </button>
);

const Modal = ({ title, onClose, children, footer, width = 'max-w-lg' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
    <div className={`w-full ${width} rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-2xl flex flex-col max-h-[85vh]`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#e1e1e1] dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h3>
        <IconButton onClick={onClose} title="Close"><X className="h-4 w-4" /></IconButton>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-end gap-2">
          {footer}
        </div>
      )}
    </div>
  </div>
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

const blankCustomer = () => ({
  name: '',
  email: '',
  phone: '',
  street: '',
  landmark: '',
  city: '',
  state: 'Gujarat',
  postalCode: '',
  country: 'India'
});

const AdminOrderCreate = () => {
  const navigate = useNavigate();

  /* ── Order being built ── */
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(null);      // { kind, type, value, reason, code, amount }
  const [shipping, setShipping] = useState(null);      // { label, price }
  const [customer, setCustomer] = useState(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [currency, setCurrency] = useState('INR');
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAID_METHODS[0]);

  /* ── Catalogue for the product picker ── */
  const [catalogue, setCatalogue] = useState(CSV_PRODUCTS || []);
  const [customers, setCustomers] = useState([]);

  /* ── UI ── */
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerOpen, setCustomerOpen] = useState(false);
  const [marketsOpen, setMarketsOpen] = useState(false);
  const customerBoxRef = useRef(null);
  const tagInputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/products?limit=all&includeDrafts=true');
        if (data?.success && data.products?.length) setCatalogue(data.products);
      } catch (e) { /* CSV catalogue already seeded */ }

      try {
        const { data } = await API.get('/admin/customers');
        if (data?.customers?.length) setCustomers(data.customers);
      } catch (e) { /* search still allows creating a new customer */ }
    };
    load();
  }, []);

  // Clicking anywhere outside the customer field closes its results list.
  useEffect(() => {
    const onClick = (e) => {
      if (customerBoxRef.current && !customerBoxRef.current.contains(e.target)) {
        setCustomerOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     TOTALS
     Discount comes off the subtotal, shipping is added after it, and
     GST is backed out of the total because Nuva prices are inclusive —
     the same order the server recomputes them in.
  ═══════════════════════════════════════════════════════════════ */
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.quantity), 0),
    [items]
  );

  const discountAmount = useMemo(() => {
    if (!discount || subtotal === 0) return 0;
    const raw = discount.type === 'percentage'
      ? (subtotal * Number(discount.value)) / 100
      : Number(discount.value);
    return Math.min(Math.max(raw, 0), subtotal);
  }, [discount, subtotal]);

  const shippingCost = Number(shipping?.price) || 0;
  const total = Math.max(subtotal - discountAmount + shippingCost, 0);
  const taxAmount = Math.round((total * TAX_RATE / (1 + TAX_RATE)) * 100) / 100;
  const hasItems = items.length > 0;

  /* ═══════════════════════════════════════════════════════════════
     LINE ITEMS
  ═══════════════════════════════════════════════════════════════ */
  const setQuantity = (key, quantity) => {
    const qty = Math.max(1, Math.min(999, Number(quantity) || 1));
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: qty } : i)));
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

  /* Reconcile the picker's selection with what is already on the order:
     unchecked catalogue lines drop off, checked ones keep the quantity the
     merchant already typed, and custom items are never touched. */
  const applyProductSelection = (selectedIds) => {
    setItems((prev) => {
      const kept = prev.filter((i) => i.custom || selectedIds.includes(i.productId));
      const existing = new Set(kept.filter((i) => !i.custom).map((i) => i.productId));
      const added = selectedIds
        .filter((id) => !existing.has(id))
        .map((id) => {
          const p = catalogue.find((c) => c._id === id);
          if (!p) return null;
          return {
            key: `p-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            productId: id,
            title: p.title,
            unit: p.unit || '',
            image: p.images?.[0] || '',
            price: Number(p.discountedPrice ?? p.price) || 0,
            quantity: 1,
            stock: Number(p.stock) || 0,
            custom: false
          };
        })
        .filter(Boolean);
      return [...kept, ...added];
    });
    setModal(null);
  };

  const addCustomItem = (draft) => {
    setItems((prev) => [
      ...prev,
      {
        key: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: null,
        title: draft.title || 'Custom item',
        unit: draft.unit || 'Custom item',
        image: '',
        price: Number(draft.price) || 0,
        quantity: Math.max(1, Number(draft.quantity) || 1),
        custom: true
      }
    ]);
    setModal(null);
  };

  /* ═══════════════════════════════════════════════════════════════
     TAGS & NOTES
  ═══════════════════════════════════════════════════════════════ */
  const addTag = () => {
    const value = tagDraft.trim();
    if (!value) return;
    if (!tags.includes(value)) setTags([...tags, value]);
    setTagDraft('');
  };

  /* ═══════════════════════════════════════════════════════════════
     SUBMIT
  ═══════════════════════════════════════════════════════════════ */
  const handleCreate = async () => {
    if (!hasItems) {
      setError('Add at least one product before creating this order.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      items: items.map((i) => ({
        product: i.productId || undefined,
        title: i.title,
        unit: i.unit,
        image: i.image,
        quantity: i.quantity,
        price: i.price
      })),
      subtotal,
      shippingCost,
      shippingMethod: shipping?.label || 'Local Delivery',
      totalAmount: total,
      discountApplied: discountAmount,
      discountCode: discount?.code || '',
      channel: 'Draft Orders',
      paymentMethod: markAsPaid ? paymentMethod : 'COD',
      customerNote: note,
      tags,
      deliveryAddress: customer
        ? {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            street: customer.street,
            landmark: customer.landmark,
            city: customer.city,
            state: customer.state,
            postalCode: customer.postalCode,
            country: customer.country || 'India'
          }
        : undefined
    };

    try {
      const { data } = await API.post('/orders', payload);
      publishStoreChange([STORE_TOPICS.ORDERS, STORE_TOPICS.INVENTORY]);
      const id = data?.order?._id;
      navigate(id ? `/admin/orders/${id}` : '/admin/orders');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not create this order. Please try again.');
      setSaving(false);
    }
  };

  const discountLabel = discount
    ? discount.code
      ? `${discount.code}`
      : discount.type === 'percentage'
        ? `${discount.value}% off${discount.reason ? ` · ${discount.reason}` : ''}`
        : `${money(discount.value)} off${discount.reason ? ` · ${discount.reason}` : ''}`
    : '—';

  const customerMatches = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers.slice(0, 6);
    return customers
      .filter((c) =>
        [c.name, c.email, c.phone].some((f) => String(f || '').toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [customerQuery, customers]);

  return (
    <div className="font-sans text-[#1a1a1a] dark:text-[#e3e3e3] pb-24">

      {/* ─────────────────────────────────────────────────────────
          BREADCRUMB HEADER
      ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-4">
        <Link
          to="/admin/orders"
          title="Back to orders"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
        >
          <FileText className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <h1 className="text-lg font-bold tracking-tight">Create order</h1>
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">

        {/* ═══════════════════════════════════════════════════════
            LEFT COLUMN
        ═══════════════════════════════════════════════════════ */}
        <div className="space-y-4">

          {/* PRODUCTS */}
          <Card
            title="Products"
            action={
              <div className="flex items-center gap-2">
                <SecondaryButton onClick={() => setModal('product')} className="flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add product
                </SecondaryButton>
                <SecondaryButton onClick={() => setModal('custom')} className="flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add custom item
                </SecondaryButton>
              </div>
            }
          >
            {!hasItems ? (
              <div className="h-6" />
            ) : (
              <div className="divide-y divide-[#e1e1e1] dark:divide-neutral-800 border border-[#e1e1e1] dark:border-neutral-800 rounded-xl overflow-hidden">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a1a]">
                    <div className="h-10 w-10 rounded-lg border border-[#e1e1e1] dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4 text-neutral-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-neutral-500">
                        {item.unit || 'Custom item'} · {money(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                        className="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => setQuantity(item.key, e.target.value)}
                        className="w-10 text-center text-xs bg-transparent outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                        className="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-20 text-right text-xs font-semibold text-neutral-900 dark:text-white shrink-0">
                      {money(item.price * item.quantity)}
                    </div>

                    <IconButton onClick={() => removeItem(item.key)} title="Remove item">
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* PAYMENT */}
          <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm overflow-hidden">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white px-4 pt-4 pb-2">Payment</h2>

            <div className="mx-4 mb-4 rounded-xl border border-[#e1e1e1] dark:border-neutral-800 divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {/* Subtotal */}
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2.5">
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">Subtotal</span>
                <span className="text-xs text-neutral-500">
                  {hasItems ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'}` : ''}
                </span>
                <span className="text-xs text-neutral-900 dark:text-white text-right w-24">{money(subtotal)}</span>
              </div>

              {/* Discount */}
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2.5">
                <button
                  type="button"
                  disabled={!hasItems}
                  onClick={() => setModal('discount')}
                  className={`text-xs font-medium text-left ${
                    hasItems
                      ? 'text-[#005bd3] dark:text-blue-400 hover:underline'
                      : 'text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {discount ? 'Edit discount' : 'Add discount'}
                </button>
                <span className="text-xs text-neutral-500 truncate max-w-[220px]">{discountLabel}</span>
                <span className="text-xs text-neutral-900 dark:text-white text-right w-24">
                  {discountAmount > 0 ? `−${money(discountAmount)}` : money(0)}
                </span>
              </div>

              {/* Shipping */}
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2.5">
                <button
                  type="button"
                  disabled={!hasItems}
                  onClick={() => setModal('shipping')}
                  className={`text-xs font-medium text-left ${
                    hasItems
                      ? 'text-[#005bd3] dark:text-blue-400 hover:underline'
                      : 'text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {shipping ? 'Edit shipping or delivery' : 'Add shipping or delivery'}
                </button>
                <span className="text-xs text-neutral-500">{shipping?.label || '—'}</span>
                <span className="text-xs text-neutral-900 dark:text-white text-right w-24">{money(shippingCost)}</span>
              </div>

              {/* Tax */}
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2.5">
                <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                  Estimated tax
                  <span title="CGST/SGST at 5%, already included in the listed price." className="cursor-help">
                    <Info className="h-3 w-3" />
                  </span>
                </span>
                <span className="text-xs text-neutral-500">
                  {hasItems ? 'CGST/SGST 5% (incl.)' : 'Not calculated'}
                </span>
                <span className="text-xs text-neutral-900 dark:text-white text-right w-24">
                  {hasItems ? money(taxAmount) : ''}
                </span>
              </div>

              {/* Total */}
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2.5">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Total</span>
                <span />
                <span className="text-xs font-bold text-neutral-900 dark:text-white text-right w-24">
                  {money(total)} {currency}
                </span>
              </div>
            </div>

            {/* Payment options footer */}
            <div className="px-4 py-3 border-t border-[#e1e1e1] dark:border-neutral-800 bg-[#f7f7f7] dark:bg-[#161616]">
              {!hasItems ? (
                <p className="text-xs text-neutral-500">
                  Add a product to calculate total and view payment options
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!markAsPaid}
                        onChange={() => setMarkAsPaid(false)}
                        className="text-[#1a1a1a] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-neutral-800 dark:text-neutral-200">Payment due later</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={markAsPaid}
                        onChange={() => setMarkAsPaid(true)}
                        className="text-[#1a1a1a] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-neutral-800 dark:text-neutral-200">Mark as paid</span>
                    </label>
                  </div>

                  {markAsPaid && (
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={`${inputClass} sm:w-52 py-1.5`}
                    >
                      {PAID_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════
            RIGHT COLUMN
        ═══════════════════════════════════════════════════════ */}
        <div className="space-y-4">

          {/* NOTES */}
          <Card
            title="Notes"
            action={
              !editingNote && (
                <IconButton
                  title="Edit note"
                  onClick={() => { setNoteDraft(note); setEditingNote(true); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
              )
            }
          >
            {editingNote ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  autoFocus
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add a note for this order"
                  className={inputClass}
                />
                <div className="flex items-center justify-end gap-2">
                  <SecondaryButton onClick={() => setEditingNote(false)}>Cancel</SecondaryButton>
                  <PrimaryButton onClick={() => { setNote(noteDraft.trim()); setEditingNote(false); }}>
                    Save
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <p className={`text-xs ${note ? 'text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap' : 'text-neutral-500'}`}>
                {note || 'No notes'}
              </p>
            )}
          </Card>

          {/* CUSTOMER */}
          <Card
            title="Customer"
            action={
              customer && (
                <IconButton title="Remove customer" onClick={() => setCustomer(null)}>
                  <X className="h-3.5 w-3.5" />
                </IconButton>
              )
            }
          >
            {!customer ? (
              <div className="relative" ref={customerBoxRef}>
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={customerQuery}
                  onChange={(e) => { setCustomerQuery(e.target.value); setCustomerOpen(true); }}
                  onFocus={() => setCustomerOpen(true)}
                  placeholder="Search or create a customer"
                  className={`${inputClass} pl-8`}
                />

                {customerOpen && (
                  <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => { setCustomerOpen(false); setModal('customer'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#005bd3] dark:text-blue-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left"
                    >
                      <Plus className="h-3.5 w-3.5" /> Create a new customer
                    </button>

                    {customerMatches.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-neutral-500">No customers found</p>
                    ) : (
                      customerMatches.map((c) => (
                        <button
                          key={c._id || c.email}
                          type="button"
                          onClick={() => {
                            setCustomer({
                              ...blankCustomer(),
                              name: c.name || 'Customer',
                              email: c.email || '',
                              phone: c.phone || '',
                              city: c.city || '',
                              state: c.state || 'Gujarat',
                              totalOrders: c.totalOrders
                            });
                            setCustomerOpen(false);
                            setCustomerQuery('');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left border-t border-neutral-100 dark:border-neutral-800"
                        >
                          <span className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-neutral-600 dark:text-neutral-300" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate">{c.name}</span>
                            <span className="block text-[11px] text-neutral-500 truncate">{c.email}</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-[#005bd3] dark:text-blue-400">{customer.name}</p>
                  <p className="text-[11px] text-neutral-500">
                    {customer.totalOrders ? `${customer.totalOrders} orders` : 'No previous orders'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e1e1e1] dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">Contact information</p>
                    <IconButton title="Edit contact" onClick={() => setModal('customer')}>
                      <Pencil className="h-3 w-3" />
                    </IconButton>
                  </div>
                  <p className="text-[11px] text-[#005bd3] dark:text-blue-400 truncate">
                    {customer.email || 'No email provided'}
                  </p>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    {customer.phone || 'No phone number'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e1e1e1] dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">Shipping address</p>
                    <IconButton title="Edit address" onClick={() => setModal('customer')}>
                      <Pencil className="h-3 w-3" />
                    </IconButton>
                  </div>
                  {customer.street ? (
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {customer.street}{customer.landmark ? `, ${customer.landmark}` : ''}<br />
                      {[customer.city, customer.state, customer.postalCode].filter(Boolean).join(' ')}<br />
                      {customer.country}
                    </p>
                  ) : (
                    <p className="text-[11px] text-neutral-500">No shipping address</p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* MARKETS */}
          <Card
            title="Markets"
            action={
              <IconButton title="Market details" onClick={() => setMarketsOpen((v) => !v)}>
                <Share2 className="h-3.5 w-3.5" />
              </IconButton>
            }
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                <Globe className="h-3.5 w-3.5 text-neutral-500" /> India
              </span>

              {marketsOpen && (
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  This order is placed in the India market. Prices are GST-inclusive and
                  delivery is fulfilled from the Vadodara location.
                </p>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputClass}
                >
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* TAGS */}
          <Card
            title="Tags"
            action={
              <IconButton title="Edit tags" onClick={() => tagInputRef.current?.focus()}>
                <Pencil className="h-3.5 w-3.5" />
              </IconButton>
            }
          >
            <div className="space-y-2">
              <input
                type="text"
                ref={tagInputRef}
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
                }}
                onBlur={addTag}
                placeholder="Add tags and press Enter"
                className={inputClass}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
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
          </Card>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          STICKY ACTION BAR
      ───────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#d8d8d8] dark:border-neutral-800 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur px-4 py-2.5 flex items-center justify-end gap-2">
        <SecondaryButton onClick={() => navigate('/admin/orders')} disabled={saving}>
          Discard
        </SecondaryButton>
        <PrimaryButton onClick={handleCreate} disabled={saving || !hasItems} className="flex items-center gap-1.5">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? 'Creating…' : 'Create order'}
        </PrimaryButton>
      </div>

      {/* ─────────────────────────────────────────────────────────
          MODALS
      ───────────────────────────────────────────────────────── */}
      {modal === 'product' && (
        <ProductPickerModal
          catalogue={catalogue}
          initialSelected={items.filter((i) => !i.custom).map((i) => i.productId)}
          onClose={() => setModal(null)}
          onApply={applyProductSelection}
        />
      )}

      {modal === 'custom' && (
        <CustomItemModal onClose={() => setModal(null)} onAdd={addCustomItem} />
      )}

      {modal === 'discount' && (
        <DiscountModal
          discount={discount}
          subtotal={subtotal}
          itemCount={itemCount}
          onClose={() => setModal(null)}
          onApply={(d) => { setDiscount(d); setModal(null); }}
          onRemove={() => { setDiscount(null); setModal(null); }}
        />
      )}

      {modal === 'shipping' && (
        <ShippingModal
          shipping={shipping}
          onClose={() => setModal(null)}
          onApply={(s) => { setShipping(s); setModal(null); }}
          onRemove={() => { setShipping(null); setModal(null); }}
        />
      )}

      {modal === 'customer' && (
        <CustomerModal
          customer={customer}
          onClose={() => setModal(null)}
          onSave={(c) => { setCustomer(c); setModal(null); }}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PRODUCT PICKER
   Checkboxes over the live catalogue, exactly like Shopify's browser:
   what stays checked when you press Add is what the order carries.
═══════════════════════════════════════════════════════════════════ */
const ProductPickerModal = ({ catalogue, initialSelected, onClose, onApply }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(initialSelected);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? catalogue.filter((p) =>
          [p.title, p.category, p.slug].some((f) => String(f || '').toLowerCase().includes(q))
        )
      : catalogue;
    return list.slice(0, 150);
  }, [query, catalogue]);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Modal
      title="Add products"
      onClose={onClose}
      width="max-w-2xl"
      footer={
        <>
          <span className="mr-auto text-xs text-neutral-500">
            {selected.length} {selected.length === 1 ? 'product' : 'products'} selected
          </span>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => onApply(selected)}>Add</PrimaryButton>
        </>
      }
    >
      <div className="p-3 border-b border-[#e1e1e1] dark:border-neutral-800 sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className={`${inputClass} pl-8`}
          />
        </div>
      </div>

      {results.length === 0 ? (
        <p className="px-4 py-6 text-xs text-neutral-500 text-center">No products match “{query}”.</p>
      ) : (
        <div className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
          {results.map((p) => {
            const isChecked = selected.includes(p._id);
            const price = Number(p.discountedPrice ?? p.price) || 0;
            return (
              <label
                key={p._id}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  isChecked ? 'bg-neutral-50 dark:bg-neutral-800/40' : 'hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(p._id)}
                  className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer shrink-0"
                />
                <div className="h-9 w-9 rounded-lg border border-[#e1e1e1] dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-4 w-4 text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{p.title}</p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {[p.unit, p.category].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="text-[11px] text-neutral-500 shrink-0 w-20 text-right">
                  {Number(p.stock) > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </span>
                <span className="text-xs font-semibold text-neutral-900 dark:text-white shrink-0 w-16 text-right">
                  {money(price)}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CUSTOM ITEM
═══════════════════════════════════════════════════════════════════ */
const CustomItemModal = ({ onClose, onAdd }) => {
  const [draft, setDraft] = useState({ title: '', price: '', quantity: 1, unit: '' });
  const valid = draft.title.trim() && Number(draft.price) >= 0 && draft.price !== '';

  return (
    <Modal
      title="Add custom item"
      onClose={onClose}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => onAdd(draft)} disabled={!valid}>Add item</PrimaryButton>
        </>
      }
    >
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Item name</label>
          <input
            type="text"
            autoFocus
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="e.g. Gift hamper packing"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              placeholder="0.00"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Quantity</label>
            <input
              type="number"
              min="1"
              value={draft.quantity}
              onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Unit <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <input
            type="text"
            value={draft.unit}
            onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
            placeholder="e.g. 1 KG, per box"
            className={inputClass}
          />
        </div>
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   DISCOUNT
   A merchant either types a manual amount or reuses a code the store
   already issued — the code path runs through the same validator the
   storefront checkout uses, so an expired code is refused here too.
═══════════════════════════════════════════════════════════════════ */
const DiscountModal = ({ discount, subtotal, itemCount, onClose, onApply, onRemove }) => {
  const [tab, setTab] = useState(discount?.code ? 'code' : 'custom');
  const [type, setType] = useState(discount?.type || 'amount');
  const [value, setValue] = useState(discount?.value ?? '');
  const [reason, setReason] = useState(discount?.reason || '');
  const [code, setCode] = useState(discount?.code || '');
  const [checking, setChecking] = useState(false);
  const [codeError, setCodeError] = useState('');

  const preview = type === 'percentage'
    ? Math.min((subtotal * Number(value || 0)) / 100, subtotal)
    : Math.min(Number(value || 0), subtotal);

  const applyCode = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setChecking(true);
    setCodeError('');
    try {
      const { data } = await API.post('/admin/coupons/validate', {
        code: trimmed,
        cartTotal: subtotal,
        cartQuantity: itemCount
      });
      onApply({
        kind: 'code',
        code: data.coupon.code,
        type: data.coupon.type,
        value: data.coupon.value,
        reason: ''
      });
    } catch (e) {
      setCodeError(e.response?.data?.message || 'That discount code could not be applied.');
      setChecking(false);
    }
  };

  return (
    <Modal
      title="Add discount"
      onClose={onClose}
      footer={
        <>
          {discount && (
            <SecondaryButton onClick={onRemove} className="mr-auto text-red-600 dark:text-red-400">
              Remove discount
            </SecondaryButton>
          )}
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          {tab === 'custom' ? (
            <PrimaryButton
              onClick={() => onApply({ kind: 'custom', type, value: Number(value) || 0, reason: reason.trim(), code: '' })}
              disabled={!value || Number(value) <= 0}
            >
              Apply
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={applyCode} disabled={!code.trim() || checking} className="flex items-center gap-1.5">
              {checking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {checking ? 'Checking…' : 'Apply code'}
            </PrimaryButton>
          )}
        </>
      }
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 w-fit">
          {[['custom', 'Custom discount'], ['code', 'Discount code']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                tab === key
                  ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'custom' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 w-fit">
              {[['amount', 'Amount'], ['percentage', 'Percentage']].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    type === key
                      ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {type === 'percentage' ? 'Discount percentage' : 'Discount amount'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  {type === 'percentage' ? '%' : '₹'}
                </span>
                <input
                  type="number"
                  autoFocus
                  min="0"
                  step={type === 'percentage' ? '1' : '0.01'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Reason <span className="font-normal text-neutral-500">(shown to the customer)</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Loyal customer, Damaged packaging"
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">Comes off {money(subtotal)} subtotal</span>
              <span className="font-bold text-neutral-900 dark:text-white">−{money(preview)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Discount code</label>
              <input
                type="text"
                autoFocus
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') applyCode(); }}
                placeholder="e.g. NUVA10"
                className={`${inputClass} uppercase tracking-wide`}
              />
            </div>
            {codeError && (
              <p className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {codeError}
              </p>
            )}
            <p className="text-[11px] text-neutral-500">
              The code is checked against this store's active discounts, including its dates,
              usage limits and minimum order value.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SHIPPING
═══════════════════════════════════════════════════════════════════ */
const ShippingModal = ({ shipping, onClose, onApply, onRemove }) => {
  const presetMatch = SHIPPING_PRESETS.find((p) => p.label === shipping?.label);
  const [mode, setMode] = useState(shipping && !presetMatch ? 'custom' : (shipping?.label || SHIPPING_PRESETS[0].label));
  const [customLabel, setCustomLabel] = useState(presetMatch ? '' : (shipping?.label || ''));
  const [customPrice, setCustomPrice] = useState(presetMatch ? '' : (shipping?.price ?? ''));

  const submit = () => {
    if (mode === 'custom') {
      onApply({ label: customLabel.trim() || 'Custom shipping', price: Number(customPrice) || 0 });
      return;
    }
    const preset = SHIPPING_PRESETS.find((p) => p.label === mode);
    onApply({ label: preset.label, price: preset.price });
  };

  return (
    <Modal
      title="Add shipping or delivery"
      onClose={onClose}
      footer={
        <>
          {shipping && (
            <SecondaryButton onClick={onRemove} className="mr-auto text-red-600 dark:text-red-400">
              Remove
            </SecondaryButton>
          )}
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submit}>Apply</PrimaryButton>
        </>
      }
    >
      <div className="p-4 space-y-1">
        {SHIPPING_PRESETS.map((p) => (
          <label
            key={p.label}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/40"
          >
            <span className="flex items-center gap-2.5">
              <input
                type="radio"
                checked={mode === p.label}
                onChange={() => setMode(p.label)}
                className="text-[#1a1a1a] focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-neutral-800 dark:text-neutral-200">{p.label}</span>
            </span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-white">{money(p.price)}</span>
          </label>
        ))}

        <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/40">
          <input
            type="radio"
            checked={mode === 'custom'}
            onChange={() => setMode('custom')}
            className="text-[#1a1a1a] focus:ring-0 cursor-pointer"
          />
          <span className="text-xs text-neutral-800 dark:text-neutral-200">Custom rate</span>
        </label>

        {mode === 'custom' && (
          <div className="grid grid-cols-2 gap-3 px-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Rate name</label>
              <input
                type="text"
                autoFocus
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g. Same-day delivery"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CUSTOMER
═══════════════════════════════════════════════════════════════════ */
const CustomerModal = ({ customer, onClose, onSave }) => {
  const [form, setForm] = useState({ ...blankCustomer(), ...(customer || {}) });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const valid = form.name.trim().length > 0;

  return (
    <Modal
      title={customer ? 'Edit customer' : 'Create a new customer'}
      onClose={onClose}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={() => onSave({ ...form, name: form.name.trim() })} disabled={!valid}>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> Save customer
            </span>
          </PrimaryButton>
        </>
      }
    >
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Name</label>
            <input type="text" autoFocus value={form.name} onChange={set('name')} placeholder="Full name" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="customer@example.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Phone</label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98250 12345" className={inputClass} />
          </div>
        </div>

        <div className="pt-2 border-t border-[#e1e1e1] dark:border-neutral-800 space-y-3">
          <p className="text-xs font-bold text-neutral-900 dark:text-white pt-1">Shipping address</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Address</label>
              <input type="text" value={form.street} onChange={set('street')} placeholder="House / flat, street" className={inputClass} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Landmark</label>
              <input type="text" value={form.landmark} onChange={set('landmark')} placeholder="Nearby landmark" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">City</label>
              <input type="text" value={form.city} onChange={set('city')} placeholder="Vadodara" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">State</label>
              <input type="text" value={form.state} onChange={set('state')} placeholder="Gujarat" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">PIN code</label>
              <input type="text" value={form.postalCode} onChange={set('postalCode')} placeholder="390001" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Country</label>
              <input type="text" value={form.country} onChange={set('country')} className={inputClass} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AdminOrderCreate;
