import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Copy, MoreHorizontal, Megaphone, Check, X, Plus, Trash2,
  Loader2, AlertCircle, Info, Calendar, Clock, Tag as TagIcon, Percent,
  AtSign, Hash, Link2, Smile, Settings
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';

/* ═══════════════════════════════════════════════════════════════════
   DISCOUNT EDITOR
   The Shopify "Amount off order" screen: the configuration form on the
   left, a live summary of what the discount actually does on the right.
   Every control here maps to a field the checkout validator reads.
═══════════════════════════════════════════════════════════════════ */
const SALES_CHANNELS = ['Online Store', 'B2B Wholesale', 'Point of Sale'];

const DISCOUNT_CLASSES = {
  order: { label: 'Amount off order', summary: 'Order discount' },
  product: { label: 'Amount off products', summary: 'Product discount' },
  shipping: { label: 'Free shipping', summary: 'Shipping discount' }
};

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

const Card = ({ title, action, children }) => (
  <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm p-4 space-y-3">
    {(title || action) && (
      <div className="flex items-center justify-between gap-2">
        {title && <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);

const Radio = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
    <span
      onClick={onChange}
      className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
        checked ? 'border-[#1a1a1a] dark:border-white' : 'border-neutral-400 group-hover:border-neutral-600'
      }`}
    >
      {checked && <span className="h-2 w-2 rounded-full bg-[#1a1a1a] dark:bg-white" />}
    </span>
    <span className="text-xs text-neutral-800 dark:text-neutral-200">{label}</span>
  </label>
);

const Checkbox = ({ checked, onChange, label }) => (
  <label className="flex items-start gap-2.5 py-1 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-0.5 rounded border-neutral-400 text-[#1a1a1a] focus:ring-0 cursor-pointer shrink-0"
    />
    <span className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">{label}</span>
  </label>
);

const randomCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 10 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
};

const toDateInput = (value) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
};

const toTimeInput = (value) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return '00:00';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const combineDateTime = (date, time) => {
  const iso = new Date(`${date}T${time || '00:00'}`);
  return Number.isNaN(iso.getTime()) ? new Date() : iso;
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const blankDiscount = () => ({
  code: '',
  title: '',
  method: 'code',
  discountClass: 'order',
  type: 'percentage',
  value: 10,
  eligibility: 'all',
  minimumRequirement: 'none',
  minOrderValue: 0,
  minQuantity: 0,
  limitTotalUses: false,
  usageLimit: 1000,
  limitOnePerCustomer: false,
  usedCount: 0,
  combinesWith: { product: false, order: false, shipping: false },
  validFrom: new Date().toISOString(),
  validTo: '',
  hasEndDate: false,
  salesChannels: ['Online Store'],
  restrictToChannels: false,
  tags: [],
  timeline: [],
  status: 'Active'
});

const AdminDiscountEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [discount, setDiscount] = useState(blankDiscount);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [tagDraft, setTagDraft] = useState('');
  const [comment, setComment] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);

  const moreRef = useRef(null);
  const promoteRef = useRef(null);

  const [startDate, setStartDate] = useState(toDateInput());
  const [startTime, setStartTime] = useState(toTimeInput());
  const [endDate, setEndDate] = useState(toDateInput());
  const [endTime, setEndTime] = useState('23:59');

  /* ── Load ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    if (isNew) {
      const seeded = { ...blankDiscount(), code: randomCode() };
      setDiscount(seeded);
      setOriginal(JSON.stringify(seeded));
      setLoading(false);
      return;
    }

    API.get(`/admin/coupons/${id}`)
      .then(({ data }) => {
        if (cancelled || !data?.success) return;
        const merged = { ...blankDiscount(), ...data.coupon };
        merged.combinesWith = { ...blankDiscount().combinesWith, ...(data.coupon.combinesWith || {}) };
        merged.tags = data.coupon.tags || [];
        merged.timeline = data.coupon.timeline || [];
        merged.salesChannels = data.coupon.salesChannels?.length ? data.coupon.salesChannels : ['Online Store'];

        setDiscount(merged);
        setOriginal(JSON.stringify(merged));
        setStartDate(toDateInput(merged.validFrom));
        setStartTime(toTimeInput(merged.validFrom));
        if (merged.validTo) {
          setEndDate(toDateInput(merged.validTo));
          setEndTime(toTimeInput(merged.validTo));
        }
      })
      .catch(() => !cancelled && showToast('error', 'Could not load this discount'))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [id, isNew]);

  useEffect(() => {
    const onDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (promoteRef.current && !promoteRef.current.contains(e.target)) setPromoteOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const set = (patch) => setDiscount((prev) => ({ ...prev, ...patch }));

  const dirty = original !== null && JSON.stringify(discount) !== original;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Derived summary, mirroring what checkout will enforce ────── */
  const valueLabel = discount.type === 'percentage'
    ? `${discount.value}% off entire order`
    : `₹${discount.value} off entire order`;

  const combinationLabel = useMemo(() => {
    const on = Object.entries(discount.combinesWith).filter(([, v]) => v).map(([k]) => k);
    if (on.length === 0) return null;
    return `Combines with ${on.join(', ')} discounts`;
  }, [discount.combinesWith]);

  const summaryDetails = useMemo(() => {
    const details = [];
    details.push(
      discount.eligibility === 'all'
        ? 'All customers'
        : discount.eligibility === 'subscribers'
          ? 'Newsletter subscribers'
          : 'Specific customers'
    );
    details.push(
      discount.restrictToChannels && discount.salesChannels.length
        ? `For ${discount.salesChannels.join(', ')}`
        : 'For Online Store'
    );
    details.push(valueLabel);

    if (discount.minimumRequirement === 'amount') {
      details.push(`Minimum purchase of ₹${discount.minOrderValue || 0}`);
    } else if (discount.minimumRequirement === 'quantity') {
      details.push(`Minimum of ${discount.minQuantity || 0} items`);
    } else {
      details.push('No minimum purchase requirement');
    }

    const limits = [];
    if (discount.limitTotalUses) limits.push(`${discount.usageLimit} total uses`);
    if (discount.limitOnePerCustomer) limits.push('one use per customer');
    details.push(limits.length ? `Limited to ${limits.join(' and ')}` : 'No usage limits');

    details.push(combinationLabel || "Can't combine with other discounts");
    details.push(
      discount.hasEndDate
        ? `Active from ${formatDate(combineDateTime(startDate, startTime))} to ${formatDate(combineDateTime(endDate, endTime))}`
        : `Active from ${formatDate(combineDateTime(startDate, startTime))}`
    );

    return details;
  }, [discount, valueLabel, combinationLabel, startDate, startTime, endDate, endTime]);

  /* ── Persistence ──────────────────────────────────────────────── */
  const buildPayload = () => ({
    ...discount,
    code: discount.code.toUpperCase().trim(),
    value: Number(discount.value) || 0,
    minOrderValue: discount.minimumRequirement === 'amount' ? Number(discount.minOrderValue) || 0 : 0,
    minQuantity: discount.minimumRequirement === 'quantity' ? Number(discount.minQuantity) || 0 : 0,
    usageLimit: discount.limitTotalUses ? Number(discount.usageLimit) || 0 : 0,
    validFrom: combineDateTime(startDate, startTime),
    validTo: discount.hasEndDate ? combineDateTime(endDate, endTime) : null
  });

  const handleSave = async () => {
    if (!discount.code.trim()) {
      showToast('error', 'A discount code is required');
      return;
    }
    if (saving) return;

    setSaving(true);
    const payload = buildPayload();

    try {
      let saved = payload;

      if (isNew) {
        const { data } = await API.post('/admin/coupons', payload);
        setSaving(false);
        if (data?.coupon?._id) {
          navigate(`/admin/discounts/${data.coupon._id}`, { replace: true });
          return;
        }
      } else {
        const { data } = await API.put(`/admin/coupons/${id}`, payload);
        setSaving(false);
        // The server derives status from the active dates — take its answer
        // rather than keeping a stale local guess.
        if (data?.coupon) saved = { ...payload, status: data.coupon.status };
      }

      setDiscount(saved);
      setOriginal(JSON.stringify(saved));
      // The cart validates codes against this — a disable takes effect at once.
      publishStoreChange(STORE_TOPICS.DISCOUNTS);
      showToast('success', isNew ? 'Discount created' : 'Discount saved');
    } catch (e) {
      setSaving(false);
      showToast('error', e?.response?.data?.message || 'Could not save this discount');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the discount ${discount.code}?`)) return;
    try {
      await API.delete(`/admin/coupons/${id}`);
      publishStoreChange(STORE_TOPICS.DISCOUNTS);
    } catch (e) { /* the list refetches regardless */ }
    navigate('/admin/discounts');
  };

  const handleDuplicate = async () => {
    const copy = { ...buildPayload(), code: `${discount.code}-COPY`, usedCount: 0, timeline: [] };
    delete copy._id;
    try {
      const { data } = await API.post('/admin/coupons', copy);
      if (data?.coupon?._id) {
        navigate(`/admin/discounts/${data.coupon._id}`);
        showToast('success', 'Duplicate created');
        return;
      }
    } catch (e) { /* fall through */ }
    showToast('error', 'Could not duplicate this discount');
  };

  const handleComment = async () => {
    const message = comment.trim();
    if (!message || isNew) return;
    setComment('');
    try {
      const { data } = await API.post(`/admin/coupons/${id}/timeline`, { message });
      if (data?.success) {
        const next = { ...discount, timeline: data.coupon.timeline || [] };
        setDiscount(next);
        setOriginal(JSON.stringify(next));
      }
    } catch (e) {
      showToast('error', 'Could not post the comment');
    }
  };

  const addTag = (raw) => {
    const clean = (raw || '').trim().replace(/,$/, '');
    if (!clean || discount.tags.includes(clean)) return;
    set({ tags: [...discount.tags, clean] });
    setTagDraft('');
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-xs text-neutral-400 gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading discount…
      </div>
    );
  }

  const statusStyles = {
    Active: 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300',
    Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    Expired: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    Disabled: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
  };

  return (
    <div className="font-sans text-[#1a1a1a] dark:text-[#e3e3e3] pb-24 max-w-[1000px] mx-auto space-y-4">

      {/* ══ HEADER ══ */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/admin/discounts"
            className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            title="Back to discounts"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Settings className="h-4 w-4 text-neutral-400 shrink-0" />
          <span className="text-neutral-300">›</span>
          <h1 className="text-lg font-bold tracking-tight truncate font-mono">
            {discount.code || 'New discount'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDuplicate}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </button>
          )}

          <div className="relative" ref={promoteRef}>
            <button
              onClick={() => setPromoteOpen((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Megaphone className="h-3.5 w-3.5" /> Promote
            </button>
            {promoteOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#242424] shadow-xl py-1 z-30">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://thenuva.com/shop?discount=${discount.code}`);
                    setPromoteOpen(false);
                    showToast('success', 'Shareable discount link copied');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Link2 className="h-3.5 w-3.5 text-neutral-400" /> Copy shareable link
                </button>
                <Link
                  to="/admin/newsletter"
                  onClick={() => setPromoteOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <AtSign className="h-3.5 w-3.5 text-neutral-400" /> Email to subscribers
                </Link>
                <Link
                  to="/admin/editor"
                  onClick={() => setPromoteOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Megaphone className="h-3.5 w-3.5 text-neutral-400" /> Add to announcement bar
                </Link>
              </div>
            )}
          </div>

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <MoreHorizontal className="h-3.5 w-3.5" /> More actions
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#242424] shadow-xl py-1 z-30">
                <button
                  onClick={() => {
                    set({ status: discount.status === 'Disabled' ? 'Active' : 'Disabled' });
                    setMoreOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="h-3.5 w-3.5 text-neutral-400" />
                  {discount.status === 'Disabled' ? 'Activate discount' : 'Deactivate discount'}
                </button>
                <div className="border-t border-neutral-200/70 dark:border-neutral-700 my-1" />
                <button
                  onClick={() => { setMoreOpen(false); handleDelete(); }}
                  disabled={isNew}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete discount
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ─────────── LEFT ─────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Discount code */}
          <Card
            title={DISCOUNT_CLASSES[discount.discountClass].label}
            action={
              <button
                onClick={() => set({ code: randomCode() })}
                className="text-[11px] font-bold text-[#005bd3] hover:underline"
              >
                Generate random code
              </button>
            }
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Discount code</label>
              <input
                value={discount.code}
                onChange={(e) => set({ code: e.target.value.toUpperCase() })}
                placeholder="SUMMERSALE"
                className={`${inputClass} font-mono font-semibold tracking-wide`}
              />
              <p className="text-[11px] text-neutral-400">Customers must enter this code at checkout.</p>
            </div>
          </Card>

          {/* Discount value */}
          <Card title="Discount value">
            <div className="flex items-stretch gap-2">
              <select
                value={discount.type}
                onChange={(e) => set({ type: e.target.value })}
                className={`${inputClass} flex-1`}
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Fixed amount</option>
              </select>
              <div className="relative flex-1">
                {discount.type === 'flat' && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">₹</span>
                )}
                <input
                  type="number"
                  min="0"
                  value={discount.value}
                  onChange={(e) => set({ value: Number(e.target.value) })}
                  className={`${inputClass} ${discount.type === 'flat' ? 'pl-6' : 'pr-7'}`}
                />
                {discount.type === 'percentage' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">%</span>
                )}
              </div>
            </div>
          </Card>

          {/* Eligibility */}
          <Card title="Eligibility">
            <select
              value={discount.eligibility}
              onChange={(e) => set({ eligibility: e.target.value })}
              className={inputClass}
            >
              <option value="all">All customers</option>
              <option value="subscribers">Newsletter subscribers</option>
              <option value="specific_customers">Specific customers</option>
            </select>
          </Card>

          {/* Minimum purchase requirements */}
          <Card title="Minimum purchase requirements">
            <div className="space-y-0.5">
              <Radio
                checked={discount.minimumRequirement === 'none'}
                onChange={() => set({ minimumRequirement: 'none' })}
                label="No minimum requirements"
              />
              <Radio
                checked={discount.minimumRequirement === 'amount'}
                onChange={() => set({ minimumRequirement: 'amount' })}
                label="Minimum purchase amount (₹)"
              />
              {discount.minimumRequirement === 'amount' && (
                <div className="pl-6 py-1.5">
                  <input
                    type="number"
                    min="0"
                    value={discount.minOrderValue}
                    onChange={(e) => set({ minOrderValue: Number(e.target.value) })}
                    className={`${inputClass} max-w-[200px]`}
                  />
                </div>
              )}
              <Radio
                checked={discount.minimumRequirement === 'quantity'}
                onChange={() => set({ minimumRequirement: 'quantity' })}
                label="Minimum quantity of items"
              />
              {discount.minimumRequirement === 'quantity' && (
                <div className="pl-6 py-1.5">
                  <input
                    type="number"
                    min="0"
                    value={discount.minQuantity}
                    onChange={(e) => set({ minQuantity: Number(e.target.value) })}
                    className={`${inputClass} max-w-[200px]`}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Maximum discount uses */}
          <Card title="Maximum discount uses">
            <div className="space-y-0.5">
              <Checkbox
                checked={discount.limitTotalUses}
                onChange={() => set({ limitTotalUses: !discount.limitTotalUses })}
                label="Limit number of times this discount can be used in total"
              />
              {discount.limitTotalUses && (
                <div className="pl-6 py-1.5">
                  <input
                    type="number"
                    min="1"
                    value={discount.usageLimit}
                    onChange={(e) => set({ usageLimit: Number(e.target.value) })}
                    className={`${inputClass} max-w-[200px]`}
                  />
                </div>
              )}
              <Checkbox
                checked={discount.limitOnePerCustomer}
                onChange={() => set({ limitOnePerCustomer: !discount.limitOnePerCustomer })}
                label="Limit to one use per customer"
              />
            </div>
          </Card>

          {/* Combinations */}
          <Card
            title="Combinations"
            action={<Plus className="h-4 w-4 text-neutral-400" />}
          >
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <span className="font-bold font-mono">{discount.code || 'This discount'}</span>{' '}
              {combinationLabel
                ? `combines with ${Object.entries(discount.combinesWith).filter(([, v]) => v).map(([k]) => k).join(', ')} discounts in the customer's cart.`
                : "won't combine with other product, order, or shipping discounts in the customer's cart."}
            </p>
            <div className="space-y-0.5 pt-1">
              {[
                { key: 'product', label: 'Product discounts' },
                { key: 'order', label: 'Order discounts' },
                { key: 'shipping', label: 'Shipping discounts' }
              ].map((c) => (
                <Checkbox
                  key={c.key}
                  checked={discount.combinesWith[c.key]}
                  onChange={() =>
                    set({ combinesWith: { ...discount.combinesWith, [c.key]: !discount.combinesWith[c.key] } })
                  }
                  label={c.label}
                />
              ))}
            </div>
          </Card>

          {/* Active dates */}
          <Card title="Active dates">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Start date</label>
                <div className="relative">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Start time (IST)</label>
                <div className="relative">
                  <Clock className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
            </div>

            <Checkbox
              checked={discount.hasEndDate}
              onChange={() => set({ hasEndDate: !discount.hasEndDate })}
              label="Set end date"
            />

            {discount.hasEndDate && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">End date</label>
                  <div className="relative">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">End time (IST)</label>
                  <div className="relative">
                    <Clock className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Timeline */}
          {!isNew && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold px-1">Timeline</h2>

              <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="flex items-start gap-2.5 p-3">
                  <div className="h-8 w-8 rounded-full bg-pink-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    NN
                  </div>
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Leave a comment..."
                    className="flex-1 bg-transparent text-xs outline-none resize-none py-1.5 placeholder:text-neutral-400"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2.5 text-neutral-400">
                    <Smile className="h-3.5 w-3.5" />
                    <AtSign className="h-3.5 w-3.5" />
                    <Hash className="h-3.5 w-3.5" />
                    <Link2 className="h-3.5 w-3.5" />
                  </div>
                  <button
                    onClick={handleComment}
                    disabled={!comment.trim()}
                    className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 enabled:bg-[#1a1a1a] enabled:text-white disabled:text-neutral-400 text-xs font-bold disabled:cursor-not-allowed transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 px-1">Only you and other staff can see comments.</p>

              {discount.timeline.length > 0 && (
                <div className="space-y-2 pt-1">
                  {discount.timeline.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 px-1">
                      <div className="h-6 w-6 rounded-full bg-neutral-300 dark:bg-neutral-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {(entry.author || 'A').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">{entry.message}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {entry.author} · {new Date(entry.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─────────── RIGHT: SUMMARY ─────────── */}
        <div className="space-y-4">

          <Card>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold font-mono truncate">{discount.code || 'New discount'}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(discount.code);
                      showToast('success', 'Code copied');
                    }}
                    className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white shrink-0"
                    title="Copy code"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 capitalize">{discount.method}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusStyles[discount.status] || statusStyles.Active}`}>
                {discount.status}
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
              <p className="text-xs font-bold">Type</p>
              <p className="text-xs text-neutral-700 dark:text-neutral-300">
                {DISCOUNT_CLASSES[discount.discountClass].label}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Percent className="h-3 w-3" />
                {DISCOUNT_CLASSES[discount.discountClass].summary}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
              <p className="text-xs font-bold">Details</p>
              <ul className="space-y-1">
                {summaryDetails.map((detail, idx) => (
                  <li key={idx} className="flex gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 leading-snug">
                    <span className="text-neutral-400 shrink-0">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
              <p className="text-xs font-bold">Performance</p>
              <p className="flex gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                <span className="text-neutral-400">•</span>
                <span>{discount.usedCount || 0} used</span>
              </p>
              <Link to="/admin/analytics" className="text-[11px] font-bold text-[#005bd3] hover:underline inline-block">
                View the sales by discount report
              </Link>
            </div>
          </Card>

          {/* Sales channel access */}
          <Card title="Sales channel access">
            <Checkbox
              checked={discount.restrictToChannels}
              onChange={() => set({ restrictToChannels: !discount.restrictToChannels })}
              label="Allow discount to be featured on selected channels"
            />
            {discount.restrictToChannels && (
              <div className="space-y-0.5 pl-6 pt-1">
                {SALES_CHANNELS.map((channel) => (
                  <Checkbox
                    key={channel}
                    checked={discount.salesChannels.includes(channel)}
                    onChange={() =>
                      set({
                        salesChannels: discount.salesChannels.includes(channel)
                          ? discount.salesChannels.filter((c) => c !== channel)
                          : [...discount.salesChannels, channel]
                      })
                    }
                    label={channel}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Tags */}
          <Card title="Tags">
            <div className="space-y-2">
              {discount.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {discount.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      <TagIcon className="h-3 w-3 text-neutral-400" />
                      {t}
                      <button
                        onClick={() => set({ tags: discount.tags.filter((x) => x !== t) })}
                        className="text-neutral-400 hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(tagDraft);
                  }
                }}
                onBlur={() => addTag(tagDraft)}
                placeholder="Add tags"
                className={inputClass}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ══ STICKY SAVE BAR ══ */}
      {(dirty || saving) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 pl-4 pr-2 py-2 rounded-xl bg-[#1a1a1a] text-white shadow-2xl border border-neutral-700">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <Info className="h-3.5 w-3.5 text-amber-300" /> Unsaved changes
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => original && setDiscount(JSON.parse(original))}
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

      {toast && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#1a1a1a] text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-400" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminDiscountEditor;
