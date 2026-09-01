import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users, ChevronRight, Mail, Phone, MapPin, Loader2, AlertCircle,
  ShoppingBag, ExternalLink, Copy, Check
} from 'lucide-react';
import API from '../../api/axiosInstance';

/* ═══════════════════════════════════════════════════════════════════
   CUSTOMER
   Shopify's customer page: what they've bought on the left, who they are
   on the right. Every figure is summed from this customer's own orders.
═══════════════════════════════════════════════════════════════════ */
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
      })
    : '—';

const initials = (name) =>
  (name || 'C').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

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

const Badge = ({ tone = 'neutral', children }) => {
  const tones = {
    success: 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    neutral: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
};

const CopyField = ({ value, icon: Icon, href }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2 group">
      <Icon className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
      {href ? (
        <a href={href} className="text-[11px] text-[#005bd3] dark:text-blue-400 hover:underline truncate">
          {value}
        </a>
      ) : (
        <span className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate">{value}</span>
      )}
      <button
        onClick={copy}
        title="Copy"
        className="ml-auto p-1 rounded opacity-0 group-hover:opacity-100 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-opacity"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
};

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get(`/admin/customers/${id}`);
        setCustomer(data.customer);
        setOrders(data.orders || []);
      } catch (e) {
        setError(e?.response?.data?.message || 'Could not load that customer.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-neutral-500 font-sans">
        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading customer…</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="font-sans space-y-3">
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error || 'Customer not found.'}</span>
        </div>
        <Link to="/admin/customers" className="text-xs font-semibold text-[#005bd3] dark:text-blue-400 hover:underline">
          Back to customers
        </Link>
      </div>
    );
  }

  const address = customer.defaultAddress;

  return (
    <div className="font-sans text-[#1a1a1a] dark:text-[#e3e3e3] space-y-4">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5">
        <Link
          to="/admin/customers"
          title="Back to customers"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
        >
          <Users className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <h1 className="text-lg font-bold tracking-tight truncate">{customer.name || 'Guest customer'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">

        {/* ── Left: what they bought ── */}
        <div className="space-y-4">
          <Card>
            <div className="grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-800">
              {[
                { label: 'Amount spent', value: money(customer.lifetimeValue) },
                { label: 'Orders', value: (customer.totalOrders || 0).toLocaleString('en-IN') },
                { label: 'Average order', value: money(customer.averageOrderValue) }
              ].map((s, i) => (
                <div key={s.label} className={i === 0 ? 'pr-4' : 'px-4'}>
                  <p className="text-[11px] font-medium text-neutral-500">{s.label}</p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white tabular-nums mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Orders"
            action={
              orders.length > 0 && (
                <span className="text-[11px] text-neutral-500">
                  Last order {formatDate(customer.lastOrderAt)}
                </span>
              )
            }
          >
            {orders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  This customer hasn't ordered yet
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Their orders will appear here as soon as they place one.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#e1e1e1] dark:border-neutral-800 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold bg-[#f7f7f7] dark:bg-[#161616]">
                      <th className="py-2 px-3">Order</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Payment</th>
                      <th className="py-2 px-3">Fulfillment</th>
                      <th className="py-2 px-3 text-right">Items</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                    {orders.map((o) => (
                      <tr
                        key={o._id}
                        onClick={() => navigate(`/admin/orders/${o._id}`)}
                        className="cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-semibold text-[#005bd3] dark:text-blue-400 hover:underline">
                          #{o.orderNumber}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                          {formatDate(o.createdAt)}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge tone={['Paid', 'Completed'].includes(o.paymentStatus) ? 'success' : 'warning'}>
                            {o.paymentStatus || 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge tone={o.fulfillmentStatus === 'Fulfilled' ? 'success' : 'neutral'}>
                            {o.fulfillmentStatus || 'Unfulfilled'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-600 dark:text-neutral-400 tabular-nums">
                          {o.itemCount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-neutral-900 dark:text-white tabular-nums">
                          {money(o.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* ── Right: who they are ── */}
        <div className="space-y-4">
          <Card title="Customer">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e1e1e1] dark:border-neutral-800">
              <span className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold flex items-center justify-center shrink-0">
                {initials(customer.name)}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {customer.name || 'Guest customer'}
                </p>
                <p className="text-[11px] text-neutral-500">
                  Customer since {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <p className="text-xs font-bold text-neutral-900 dark:text-white">Contact information</p>
              <CopyField value={customer.email} icon={Mail} href={`mailto:${customer.email}`} />
              <CopyField value={customer.phone} icon={Phone} href={`tel:${customer.phone}`} />
              {!customer.email && !customer.phone && (
                <p className="text-[11px] text-neutral-500">No contact details on file</p>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-[#e1e1e1] dark:border-neutral-800">
              <p className="text-xs font-bold text-neutral-900 dark:text-white mb-1">Email subscription</p>
              <Badge tone={customer.emailSubscribed ? 'success' : 'neutral'}>
                {customer.emailSubscribed ? 'Subscribed' : 'Not subscribed'}
              </Badge>
              <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                {customer.emailSubscribed
                  ? 'On the newsletter list and can be emailed marketing.'
                  : 'Not on the newsletter list — transactional email only.'}
              </p>
            </div>
          </Card>

          <Card title="Default address">
            {address ? (
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-neutral-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {address.name && <>{address.name}<br /></>}
                  {address.street && <>{address.street}<br /></>}
                  {address.landmark && <>{address.landmark}<br /></>}
                  {[address.city, address.state, address.postalCode].filter(Boolean).join(' ')}
                  {address.country && <><br />{address.country}</>}
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500">
                No address yet — one is recorded with their first order.
              </p>
            )}
          </Card>

          {orders.length > 0 && (
            <Card title="Last order">
              <button
                onClick={() => navigate(`/admin/orders/${orders[0]._id}`)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#005bd3] dark:text-blue-400 group-hover:underline">
                    #{orders[0].orderNumber}
                  </span>
                  <ExternalLink className="h-3 w-3 text-neutral-400" />
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {formatDateTime(orders[0].createdAt)}
                </p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white mt-1 tabular-nums">
                  {money(orders[0].totalAmount)}
                </p>
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerDetail;
