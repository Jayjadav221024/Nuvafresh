import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronUp, ChevronDown, MoreHorizontal, Pencil, X, Check,
  Loader2, AlertCircle, MapPin, Package, Truck, CreditCard, Mail, Inbox,
  Smile, AtSign, Hash, Link2, ShoppingBag, ExternalLink, ShieldCheck,
  Printer, Archive
} from 'lucide-react';
import API from '../../api/axiosInstance';

/* ═══════════════════════════════════════════════════════════════════
   ORDER DETAIL
   The Shopify order screen, filled entirely from this store's own order
   record — line items, GST-inclusive totals, the local delivery slot the
   Nuva checkout collects, and a timeline of what actually happened.
═══════════════════════════════════════════════════════════════════ */
const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const formatDateTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
};

const formatDay = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const dayKey = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? 'Earlier'
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
};

const Badge = ({ tone = 'neutral', children, icon: Icon }) => {
  const tones = {
    success: 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    neutral: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${tones[tone]}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
};

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

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState(null);
  const [comment, setComment] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [fulfillOpen, setFulfillOpen] = useState(false);

  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState({});
  const [editingTags, setEditingTags] = useState(false);
  const [tagDraft, setTagDraft] = useState('');

  const moreRef = useRef(null);
  const fulfillRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Load ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    API.get(`/orders/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.success && data.order) {
          setOrder(data.order);
          setNoteDraft(data.order.staffNote || '');
          setDetailsDraft(data.order.additionalDetails || {});
        } else {
          setNotFound(true);
        }
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    API.get('/orders')
      .then(({ data }) => !cancelled && setSiblings(data?.orders || []))
      .catch(() => {});

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const onDown = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (fulfillRef.current && !fulfillRef.current.contains(e.target)) setFulfillOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  /* ── Derived values, all from the order record ────────────────── */
  const items = order?.items || [];

  const subtotal = useMemo(
    () => order?.subtotal || items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0),
    [order, items]
  );

  const itemCount = items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);

  const fulfillment = order?.fulfillments?.[0] || null;

  const customerEmail = order?.user?.email;
  const customerOrders = useMemo(
    () => siblings.filter((o) => o.user?.email && o.user.email === customerEmail),
    [siblings, customerEmail]
  );
  const customerLifetimeValue = customerOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const orderPosition = useMemo(() => {
    // Which order this is for that customer, oldest first.
    const sorted = [...customerOrders].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    const index = sorted.findIndex((o) => String(o._id) === String(id));
    return index === -1 ? customerOrders.length : index + 1;
  }, [customerOrders, id]);

  const timelineByDay = useMemo(() => {
    const groups = new Map();
    (order?.timeline || []).forEach((entry) => {
      const key = dayKey(entry.createdAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    });
    return Array.from(groups.entries());
  }, [order]);

  const siblingIndex = siblings.findIndex((o) => String(o._id) === String(id));

  /* ── Mutations ────────────────────────────────────────────────── */
  const patchOrder = async (updates, successMessage) => {
    try {
      const { data } = await API.put(`/orders/${id}`, updates);
      if (data?.success && data.order) setOrder(data.order);
      else setOrder((prev) => ({ ...prev, ...updates }));
      if (successMessage) showToast('success', successMessage);
    } catch (e) {
      setOrder((prev) => ({ ...prev, ...updates }));
      showToast('error', 'Saved locally — the server did not confirm');
    }
  };

  const handleFulfill = async (status) => {
    setFulfillOpen(false);
    try {
      const { data } = await API.post(`/orders/${id}/fulfill`, { status });
      if (data?.success && data.order) {
        setOrder(data.order);
        showToast('success', `Order marked as ${status.toLowerCase()}`);
      }
    } catch (e) {
      showToast('error', 'Could not update the fulfillment');
    }
  };

  const handleComment = async () => {
    const message = comment.trim();
    if (!message) return;
    setComment('');
    try {
      const { data } = await API.post(`/orders/${id}/timeline`, { message });
      if (data?.success && data.order) setOrder(data.order);
    } catch (e) {
      showToast('error', 'Could not post the comment');
    }
  };

  const addTag = (raw) => {
    const clean = (raw || '').trim().replace(/,$/, '');
    if (!clean) return;
    const tags = order.tags || [];
    if (tags.includes(clean)) { setTagDraft(''); return; }
    patchOrder({ tags: [...tags, clean] });
    setTagDraft('');
  };

  /* ── Render ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-xs text-neutral-400 gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading order…
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="py-24 text-center space-y-3">
        <ShoppingBag className="h-8 w-8 text-neutral-300 mx-auto" />
        <p className="text-sm font-bold">Order not found</p>
        <Link to="/admin/orders" className="text-xs font-bold text-[#005bd3] hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const isPaid = ['Paid', 'Completed'].includes(order.paymentStatus);
  const address = order.deliveryAddress || {};
  const mapQuery = encodeURIComponent(
    [address.street, address.landmark, address.city, address.state, address.postalCode].filter(Boolean).join(', ')
  );

  return (
    <div className="font-sans text-[#1a1a1a] dark:text-[#e3e3e3] pb-16 max-w-[1080px] mx-auto space-y-4">

      {/* ══ HEADER ══ */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/admin/orders"
              className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              title="Back to orders"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Inbox className="h-4 w-4 text-neutral-400 shrink-0" />
            <span className="text-neutral-300">›</span>
            <h1 className="text-lg font-bold tracking-tight">#{order.orderNumber || order._id}</h1>
            <Badge tone={isPaid ? 'success' : 'warning'}>{isPaid ? 'Paid' : order.paymentStatus}</Badge>
            <Badge tone={order.fulfillmentStatus === 'Fulfilled' ? 'success' : 'neutral'}>
              {order.fulfillmentStatus || 'Unfulfilled'}
            </Badge>
            {order.archived && <Badge tone="neutral">Archived</Badge>}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1 ml-9">
            {formatDateTime(order.createdAt)} from {order.channel || 'Online Store'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('error', 'Refunds are processed in the payment gateway dashboard')}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            Refund
          </button>

          <div className="relative" ref={fulfillRef}>
            <button
              onClick={() => setFulfillOpen((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Truck className="h-3.5 w-3.5" /> Fulfillment
            </button>
            {fulfillOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#242424] shadow-xl py-1 z-30">
                {['Ready for delivery', 'Out for delivery', 'Delivered'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleFulfill(status)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Check className="h-3.5 w-3.5 text-neutral-400" /> Mark {status.toLowerCase()}
                  </button>
                ))}
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
                  onClick={() => { setMoreOpen(false); window.print(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Printer className="h-3.5 w-3.5 text-neutral-400" /> Print packing slip
                </button>
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    patchOrder({ archived: !order.archived }, order.archived ? 'Order unarchived' : 'Order archived');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Archive className="h-3.5 w-3.5 text-neutral-400" />
                  {order.archived ? 'Unarchive order' : 'Archive order'}
                </button>
              </div>
            )}
          </div>

          {siblings.length > 1 && (
            <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-800">
              <button
                onClick={() => siblings[siblingIndex - 1] && navigate(`/admin/orders/${siblings[siblingIndex - 1]._id}`)}
                disabled={siblingIndex <= 0}
                title="Previous order"
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <span className="w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
              <button
                onClick={() => siblings[siblingIndex + 1] && navigate(`/admin/orders/${siblings[siblingIndex + 1]._id}`)}
                disabled={siblingIndex === -1 || siblingIndex >= siblings.length - 1}
                title="Next order"
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ─────────── LEFT ─────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Fulfillment & line items */}
          <Card>
            <div className="flex items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge tone={order.fulfillmentStatus === 'Fulfilled' ? 'success' : 'neutral'} icon={Package}>
                  {order.fulfillmentStatus || 'Unfulfilled'}
                </Badge>
                <Badge tone="neutral" icon={MapPin}>{fulfillment?.location || 'Vadodara'}</Badge>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                {fulfillment?.reference || `${order.orderNumber || order._id}-F1`}
              </span>
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              {fulfillment && (
                <div className="px-3 py-2.5 border-b border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <Badge tone={fulfillment.status === 'Delivered' ? 'success' : 'info'}>
                    {fulfillment.status}
                  </Badge>
                  {fulfillment.deliveredAt && (
                    <p className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <Truck className="h-3.5 w-3.5 text-neutral-400" />
                      {formatDay(fulfillment.deliveredAt)}
                    </p>
                  )}
                </div>
              )}

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {items.length === 0 && (
                  <p className="p-4 text-center text-xs text-neutral-400">This order has no line items.</p>
                )}
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3">
                    <div className="h-11 w-11 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4 text-neutral-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{item.title}</p>
                      {item.unit && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                          {item.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {money(item.price)} × <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-semibold">{item.quantity}</span>
                      </span>
                      <span className="font-semibold w-20 text-right">
                        {money((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {order.additionalDetails?.dueDate && (
                <div className="px-3 py-2.5 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-[11px] text-neutral-500 leading-snug">
                    Note: Delivery scheduled for {order.additionalDetails.dueDate}
                    {order.additionalDetails.dueTime ? ` at ${order.additionalDetails.dueTime}` : ''}.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Payment summary */}
          <Card>
            <div className="pb-3">
              <Badge tone={isPaid ? 'success' : 'warning'} icon={CreditCard}>
                {isPaid ? 'Paid' : order.paymentStatus}
              </Badge>
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden text-xs">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="font-semibold">Subtotal</span>
                  <span className="text-neutral-500 flex-1 px-4">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="font-medium">{money(subtotal)}</span>
                </div>

                {order.discountApplied > 0 && (
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="font-semibold">Discount</span>
                    <span className="text-neutral-500 flex-1 px-4 font-mono">
                      {order.discountCode || 'Applied'}
                    </span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      −{money(order.discountApplied)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="font-semibold">Shipping</span>
                  <span className="text-neutral-500 flex-1 px-4">
                    {order.shippingMethod || 'Local Delivery'}
                  </span>
                  <span className="font-medium">{money(order.shippingCost)}</span>
                </div>

                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="font-semibold">Taxes</span>
                  <span className="text-neutral-500 flex-1 px-4">
                    {money(order.taxAmount)} INR • {order.taxLabel || 'CGST/SGST 5%'}
                  </span>
                  <span className="font-medium text-neutral-500">
                    {order.taxIncluded ? 'Included' : money(order.taxAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between px-3 py-2.5 font-bold">
                  <span>Total</span>
                  <span className="flex-1" />
                  <span>{money(order.totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 font-semibold">
                <span>{isPaid ? 'Paid' : 'Balance due'}</span>
                <span>{money(isPaid ? (order.amountPaid || order.totalAmount) : order.totalAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Timeline */}
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

            {/* Event feed */}
            <div className="pt-2 space-y-5">
              {timelineByDay.length === 0 && (
                <p className="text-xs text-neutral-400 px-1">No activity recorded on this order yet.</p>
              )}

              {timelineByDay.map(([day, entries]) => (
                <div key={day} className="space-y-3">
                  <p className="text-xs font-semibold text-neutral-500 px-1">{day}</p>
                  <div className="relative pl-5 border-l border-neutral-200 dark:border-neutral-800 space-y-3.5">
                    {entries.map((entry, idx) => (
                      <div key={idx} className="relative flex items-start justify-between gap-3">
                        <span className="absolute -left-[23px] top-1 h-2 w-2 rounded-full bg-neutral-800 dark:bg-neutral-300" />
                        <div className="min-w-0">
                          <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">
                            {entry.message}
                          </p>
                          {entry.detail && (
                            <p className="text-[11px] text-neutral-400 mt-0.5">{entry.detail}</p>
                          )}
                          {entry.kind === 'comment' && (
                            <p className="text-[10px] text-neutral-400 mt-0.5">{entry.author}</p>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400 shrink-0">
                          {formatTime(entry.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────── RIGHT ─────────── */}
        <div className="space-y-4">

          {/* Notes */}
          <Card
            title="Notes"
            action={
              <button
                onClick={() => { setEditingNote((v) => !v); setNoteDraft(order.staffNote || ''); }}
                className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              >
                {editingNote ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              </button>
            }
          >
            {editingNote ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  autoFocus
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add a note about this order"
                  className={inputClass}
                />
                <button
                  onClick={() => { patchOrder({ staffNote: noteDraft }, 'Note saved'); setEditingNote(false); }}
                  className="px-3 py-1 rounded-lg bg-[#1a1a1a] dark:bg-white text-white dark:text-black text-[11px] font-bold"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 leading-relaxed">
                {order.staffNote || order.customerNote || 'No notes from customer'}
              </p>
            )}
          </Card>

          {/* Additional details — the delivery slot the checkout collects */}
          <Card
            title="Additional details"
            action={
              <button
                onClick={() => { setEditingDetails((v) => !v); setDetailsDraft(order.additionalDetails || {}); }}
                className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              >
                {editingDetails ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              </button>
            }
          >
            {editingDetails ? (
              <div className="space-y-2.5">
                {[
                  { key: 'dueDate', label: 'Order due date', placeholder: 'e.g. Thu, 27 Aug 2026' },
                  { key: 'dueTime', label: 'Order due time', placeholder: 'e.g. 10:00 AM' },
                  { key: 'fulfillmentType', label: 'Fulfillment type', placeholder: 'Pickup / Delivery' }
                ].map((f) => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">{f.label}</label>
                    <input
                      value={detailsDraft[f.key] || ''}
                      placeholder={f.placeholder}
                      onChange={(e) => setDetailsDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    patchOrder({ additionalDetails: { ...order.additionalDetails, ...detailsDraft } }, 'Details saved');
                    setEditingDetails(false);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#1a1a1a] dark:bg-white text-white dark:text-black text-[11px] font-bold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: 'Order due date', value: order.additionalDetails?.dueDate },
                  { label: 'Order due time', value: order.additionalDetails?.dueTime },
                  { label: 'Order fulfillment type', value: order.additionalDetails?.fulfillmentType },
                  { label: 'Delivery method', value: order.shippingMethod },
                  { label: 'Payment method', value: order.paymentMethod },
                  { label: 'Transaction reference', value: order.transactionId }
                ]
                  .filter((d) => d.value)
                  .map((d) => (
                    <div key={d.label}>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{d.label}</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 break-words">{d.value}</p>
                    </div>
                  ))}
                {!order.additionalDetails?.dueDate && !order.transactionId && (
                  <p className="text-xs text-neutral-400">No additional details recorded.</p>
                )}
              </div>
            )}
          </Card>

          {/* Customer */}
          <Card title="Customer">
            <div className="space-y-3">
              <div>
                <Link
                  to="/admin/customers"
                  className="text-xs font-semibold text-[#005bd3] hover:underline block truncate"
                >
                  {order.user?.name || 'Guest customer'}
                </Link>
                <p className="text-xs text-[#005bd3] mt-0.5">
                  {customerOrders.length || 1} {customerOrders.length === 1 ? 'order' : 'orders'}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
                <p className="text-xs font-bold">Contact information</p>
                {order.user?.email ? (
                  <a href={`mailto:${order.user.email}`} className="text-xs text-[#005bd3] hover:underline block truncate">
                    {order.user.email}
                  </a>
                ) : (
                  <p className="text-xs text-neutral-400">No email on file</p>
                )}
                {order.user?.phone && (
                  <a href={`tel:${order.user.phone}`} className="text-xs text-neutral-600 dark:text-neutral-400 block">
                    {order.user.phone}
                  </a>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
                <p className="text-xs font-bold">Shipping address</p>
                {address.street || address.city ? (
                  <>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {address.name && <p>{address.name}</p>}
                      {address.street && <p>{address.street}</p>}
                      {address.landmark && <p>{address.landmark}</p>}
                      <p>
                        {[address.postalCode, address.city, address.state].filter(Boolean).join(' ')}
                      </p>
                      <p>{address.country || 'India'}</p>
                      {address.phone && <p>{address.phone}</p>}
                    </div>
                    {mapQuery && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#005bd3] hover:underline inline-flex items-center gap-1"
                      >
                        View map <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-neutral-400">No shipping address recorded.</p>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
                <p className="text-xs font-bold">Billing address</p>
                <p className="text-xs text-neutral-500">
                  {order.billingSameAsShipping === false && order.billingAddress?.street
                    ? [order.billingAddress.street, order.billingAddress.city, order.billingAddress.state]
                        .filter(Boolean).join(', ')
                    : 'Same as shipping address'}
                </p>
              </div>
            </div>
          </Card>

          {/* Customer history — computed from this store's own orders */}
          <Card title="Customer history">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <ShoppingBag className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                {orderPosition <= 1
                  ? 'This is their first order'
                  : `This is their ${orderPosition}${orderPosition === 2 ? 'nd' : orderPosition === 3 ? 'rd' : 'th'} order`}
              </p>
              <p className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <CreditCard className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                {money(customerLifetimeValue)} spent with Nuva
              </p>
              <p className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <Truck className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                Ordered via {order.channel || 'Online Store'}
              </p>
              <Link to="/admin/customers" className="text-[11px] font-bold text-[#005bd3] hover:underline inline-block pt-1">
                View customer details
              </Link>
            </div>
          </Card>

          {/* Order risk */}
          <Card
            title="Order risk"
            action={<ShieldCheck className="h-4 w-4 text-neutral-400" />}
          >
            <div className="space-y-2.5">
              <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    order.riskLevel === 'High' ? 'w-full bg-rose-500'
                      : order.riskLevel === 'Medium' ? 'w-2/3 bg-amber-500'
                        : 'w-1/3 bg-emerald-600'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold">
                {['Low', 'Medium', 'High'].map((level) => (
                  <span
                    key={level}
                    className={order.riskLevel === level ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}
                  >
                    {level}
                  </span>
                ))}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {order.riskReason || 'Chargeback risk is low. You can fulfill this order.'}
              </p>
            </div>
          </Card>

          {/* Tags */}
          <Card
            title="Tags"
            action={
              <button
                onClick={() => setEditingTags((v) => !v)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              >
                {editingTags ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
              </button>
            }
          >
            <div className="space-y-2">
              {editingTags && (
                <input
                  autoFocus
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addTag(tagDraft);
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className={inputClass}
                />
              )}

              {(order.tags || []).length === 0 ? (
                <p className="text-xs text-neutral-400">No tags on this order</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {order.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      {t}
                      <button
                        onClick={() => patchOrder({ tags: order.tags.filter((x) => x !== t) })}
                        className="text-neutral-400 hover:text-rose-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
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

export default AdminOrderDetail;
