import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw, ArrowRight, ChevronRight, AlertTriangle, Star, MessageSquare,
  Package, ShoppingBag, Edit3, Tag, Users, KeyRound, ShieldCheck, Activity,
  ExternalLink, Loader2
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';
import { TableCard } from '../../components/admin/ui';
import { VizRoot, StatTile, TrendChart, EmptyState, money, count } from '../../components/admin/viz';

/* ═══════════════════════════════════════════════════════════════════
   HOME
   Shopify's Home: a plain greeting, one metric strip, one trend, and the
   two lists a merchant opens the admin to check — what sold and what
   needs attention. No hero banner, no display type, no accent colour
   doing work the layout should do.
═══════════════════════════════════════════════════════════════════ */
const EMPTY_STATS = {
  todayRevenue: 0,
  revenueGrowth: '0%',
  todayOrders: 0,
  ordersGrowth: '0%',
  weekRevenue: 0,
  lowStockCount: 0,
  totalProducts: 0,
  totalOrders: 0,
  pendingInquiries: 0,
  pendingReviews: 0
};

const MEASURES = [
  { key: 'revenue', label: 'Total sales', format: money },
  { key: 'orders', label: 'Orders', format: count }
];

const SHORTCUTS = [
  { label: 'Website editor', hint: 'Edit live site sections', path: '/admin/editor', icon: Edit3 },
  { label: 'Products', hint: 'Catalogue & O₃ batch logs', path: '/admin/products', icon: Package },
  { label: 'Orders', hint: 'Fulfilment & delivery', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Discounts', hint: 'Codes & automatic offers', path: '/admin/discounts', icon: Tag },
  { label: 'Customers', hint: 'Accounts & segments', path: '/admin/customers', icon: Users },
  { label: 'Staff & permissions', hint: 'Roles and access scopes', path: '/admin/roles', icon: KeyRound }
];

/* The server sends growth as a signed string ("+18.4%"); the delta chip
   wants the number so it can pick its own arrow and tone. */
const toDelta = (growth) => {
  const n = parseFloat(String(growth ?? '').replace('%', ''));
  return Number.isFinite(n) ? Number(n.toFixed(1)) : 0;
};

const greetingFor = (date) => {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const customerName = (order) => {
  const u = order?.user;
  if (u && typeof u === 'object' && u.name) return u.name;
  return order?.deliveryAddress?.name || 'Guest customer';
};

const orderDate = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true
      })
    : '—';

/* Shopify's status pill: a filled dot plus a word, never colour alone. */
const StatusPill = ({ tone, children }) => {
  const tones = {
    success: 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300',
    warning: 'bg-[#ffd79d] text-[#7e5700] dark:bg-amber-950 dark:text-amber-300',
    neutral: 'bg-[#e3e3e3] text-[#4a4a4a] dark:bg-neutral-800 dark:text-neutral-300'
  };
  const dots = {
    success: 'bg-[#0e621d] dark:bg-emerald-400',
    warning: 'bg-[#b98900] dark:bg-amber-400',
    neutral: 'bg-[#8a8a8a]'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${tones[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]}`} />
      {children}
    </span>
  );
};

const Card = ({ title, action, children, className = '', padded = true }) => (
  <section className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs flex flex-col ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h2>
        {action}
      </div>
    )}
    <div className={padded ? 'px-4 pb-4 flex-1 flex flex-col' : 'flex-1 flex flex-col'}>{children}</div>
  </section>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [measure, setMeasure] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/admin/dashboard-kpis');
      if (!data?.success) throw new Error(data?.message || 'Could not load store metrics.');
      setStats({ ...EMPTY_STATS, ...(data.stats || {}) });
      setChartData(data.chartData || []);
      setRecentOrders(data.recentOrders || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Could not load store metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const now = new Date();
  const storeName = user?.name || 'Nuva Nutrition';

  const series = useMemo(
    () => chartData.map((d) => ({ label: d.day, revenue: d.revenue, orders: d.orders })),
    [chartData]
  );

  const activeMeasure = MEASURES.find((m) => m.key === measure) || MEASURES[0];

  /* The right-hand list only carries rows that actually need a decision —
     a zero count is not a task, so it drops out rather than showing "0". */
  const attention = [
    {
      label: 'Low stock products',
      value: stats.lowStockCount,
      hint: '10 units or fewer on hand',
      path: '/admin/inventory',
      icon: AlertTriangle
    },
    {
      label: 'Reviews awaiting approval',
      value: stats.pendingReviews,
      hint: 'Not yet visible on the storefront',
      path: '/admin/reviews',
      icon: Star
    },
    {
      label: 'Unread inquiries',
      value: stats.pendingInquiries,
      hint: 'Customer questions and contact forms',
      path: '/admin/inquiries',
      icon: MessageSquare
    }
  ].filter((row) => Number(row.value) > 0);

  return (
    <VizRoot className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">
            {greetingFor(now)}, {storeName}
          </h1>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={load}
            title="Refresh"
            className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/admin/analytics"
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <Activity className="h-3.5 w-3.5" />
            View analytics
          </Link>

          <Link
            to="/admin/editor"
            className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Website editor
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Metric strip: the two live measures are selectable and drive the chart ── */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
        <StatTile
          label="Total sales today"
          value={money(stats.todayRevenue)}
          delta={toDelta(stats.revenueGrowth)}
          caption="vs yesterday"
          selected={measure === 'revenue'}
          onSelect={() => setMeasure('revenue')}
        />
        <StatTile
          label="Orders today"
          value={count(stats.todayOrders)}
          delta={toDelta(stats.ordersGrowth)}
          caption="vs yesterday"
          selected={measure === 'orders'}
          onSelect={() => setMeasure('orders')}
        />
        <StatTile
          label="Sales last 7 days"
          value={money(stats.weekRevenue)}
          hint="Rolling week to date"
        />
        <StatTile
          label="Products"
          value={count(stats.totalProducts)}
          hint={`${count(stats.totalOrders)} orders all time`}
        />
        <StatTile
          label="Low stock"
          value={`${count(stats.lowStockCount)} SKUs`}
          hint="10 units or fewer"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ── Left column: trend + recent orders ── */}
        <div className="lg:col-span-2 space-y-4">

          <Card
            title={`${activeMeasure.label} over time`}
            action={
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                {MEASURES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMeasure(m.key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      measure === m.key
                        ? 'bg-[#202223] text-white dark:bg-white dark:text-black'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            }
          >
            {loading && series.length === 0 ? (
              <div className="py-16 text-center text-neutral-500">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading store metrics…</p>
              </div>
            ) : series.length ? (
              <TrendChart data={series} valueKey={activeMeasure.key} format={activeMeasure.format} />
            ) : (
              <EmptyState message="No orders in the last 7 days" />
            )}
          </Card>

          <TableCard>
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#e1e1e1] dark:border-neutral-800">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Recent orders</h2>
              <Link
                to="/admin/orders"
                className="text-xs font-semibold text-[#005bd3] dark:text-[#7bb0f7] hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                    <th className="py-2.5 px-4">Order</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Fulfilment</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                  {loading && recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        <span className="text-xs">Loading orders…</span>
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">No orders yet</p>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Orders placed on the storefront appear here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => {
                      const paid = ['Paid', 'Completed'].includes(order.paymentStatus);
                      const fulfilled = order.fulfillmentStatus === 'Fulfilled';
                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-[#fafafa] dark:hover:bg-[#1e1e1e] transition-colors"
                        >
                          <td className="py-2.5 px-4">
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="font-semibold text-[#005bd3] dark:text-[#7bb0f7] hover:underline"
                            >
                              {order.orderNumber || `#${String(order._id).slice(-6)}`}
                            </Link>
                          </td>
                          <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                            {orderDate(order.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-800 dark:text-neutral-200 truncate max-w-[160px]">
                            {customerName(order)}
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusPill tone={paid ? 'success' : 'warning'}>
                              {paid ? 'Paid' : order.paymentStatus || 'Pending'}
                            </StatusPill>
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusPill tone={fulfilled ? 'success' : 'neutral'}>
                              {order.fulfillmentStatus || 'Unfulfilled'}
                            </StatusPill>
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold tabular-nums whitespace-nowrap">
                            {money(order.totalAmount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TableCard>
        </div>

        {/* ── Right column: what needs a decision, then where to go ── */}
        <div className="space-y-4">

          <Card title="Needs attention" padded={false}>
            {attention.length === 0 ? (
              <p className="px-4 pb-4 text-xs text-neutral-500">
                {loading ? 'Checking your store…' : 'Nothing needs your attention right now.'}
              </p>
            ) : (
              <div className="divide-y divide-[#e1e1e1] dark:divide-neutral-800 border-t border-[#e1e1e1] dark:border-neutral-800">
                {attention.map((row) => (
                  <Link
                    key={row.label}
                    to={row.path}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] dark:hover:bg-[#1e1e1e] transition-colors group"
                  >
                    <row.icon className="h-4 w-4 shrink-0 text-neutral-500" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate">
                        {row.label}
                      </span>
                      <span className="block text-[11px] text-neutral-500 truncate">{row.hint}</span>
                    </span>
                    <span className="text-xs font-bold tabular-nums text-neutral-900 dark:text-white">
                      {count(row.value)}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card title="Shortcuts" padded={false}>
            <div className="divide-y divide-[#e1e1e1] dark:divide-neutral-800 border-t border-[#e1e1e1] dark:border-neutral-800">
              {SHORTCUTS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] dark:hover:bg-[#1e1e1e] transition-colors group"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-neutral-500" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-neutral-500 truncate">{item.hint}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0" />
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Store security">
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every staff action and sign-in is recorded server-side and checked against the
              permission scope of the account that made it.
            </p>
            <div className="flex items-center gap-2 pt-3">
              <Link
                to="/admin/audit-logs"
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Sign-in logs
              </Link>
              <Link
                to="/admin/roles"
                className="text-xs font-semibold text-[#005bd3] dark:text-[#7bb0f7] hover:underline"
              >
                Staff & permissions
              </Link>
            </div>
          </Card>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border border-dashed border-[#c9c9c9] dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <span>View your online store</span>
            <ExternalLink className="h-3.5 w-3.5 text-neutral-500" />
          </a>
        </div>
      </div>
    </VizRoot>
  );
};

export default AdminDashboard;
