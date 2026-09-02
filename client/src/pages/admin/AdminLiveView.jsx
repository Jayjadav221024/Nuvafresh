import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Globe, Search, Loader2, AlertCircle, ShoppingCart, CreditCard,
  CheckCircle2, Smartphone, Monitor, Tablet
} from 'lucide-react';
import API from '../../api/axiosInstance';
import EarthGlobe from '../../components/admin/EarthGlobe';

/* ═══════════════════════════════════════════════════════════════════
   LIVE VIEW
   The shop right now. Visitors are live tabs — a browser that has sent a
   heartbeat in the last five minutes — and every other number is counted
   since midnight. Nothing on this screen is smoothed or projected.
═══════════════════════════════════════════════════════════════════ */
const POLL_MS = 10000;

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const count = (n) => Number(n || 0).toLocaleString('en-IN');

const DEVICE_ICON = { Mobile: Smartphone, Tablet: Tablet, Desktop: Monitor };

const Card = ({ title, children, className = '', action }) => (
  <section className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs ${className}`}>
    {title && (
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white underline underline-offset-4 decoration-1 decoration-neutral-300 dark:decoration-neutral-600">
          {title}
        </h2>
        {action}
      </div>
    )}
    <div className="px-4 pb-4 pt-1">{children}</div>
  </section>
);

/* ── Sparkline: one measure, no axis, no labels — it exists to show shape ── */
const Sparkline = ({ data, width = 120, height = 30 }) => {
  const values = data.map((d) => Number(d.sessions) || 0);
  const max = Math.max(...values, 1);
  if (values.length < 2) return null;

  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(height - (v / max) * (height - 4) - 2).toFixed(1)}`);

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="var(--viz-series-1)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={(values.length - 1) * step}
        cy={height - (values[values.length - 1] / max) * (height - 4) - 2}
        r="3"
        fill="var(--viz-series-1)"
        stroke="var(--viz-surface)"
        strokeWidth="2"
      />
    </svg>
  );
};

const AdminLiveView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const timerRef = useRef(null);

  const load = async () => {
    try {
      const { data: payload } = await API.get('/analytics/live');
      setData(payload);
      setUpdatedAt(new Date());
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load live data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  const locations = useMemo(() => {
    const rows = data?.sessionsByLocation || [];
    const q = locationQuery.trim().toLowerCase();
    return q ? rows.filter((r) => r.label.toLowerCase().includes(q)) : rows;
  }, [data, locationQuery]);

  const maxLocation = Math.max(...locations.map((l) => l.value), 1);
  const located = useMemo(() => locations.filter((l) => typeof l.lat === 'number'), [locations]);
  const locatedCount = located.length;
  const exactCount = located.filter((l) => l.precision === 'address').length;

  // Narrow the search to one place and the globe turns to face it.
  const focus = locatedCount === 1 && locationQuery.trim() ? located[0] : null;

  const freshness = useMemo(() => {
    if (!updatedAt) return '';
    const seconds = Math.round((Date.now() - updatedAt.getTime()) / 1000);
    return seconds < 15 ? 'Just now' : `${seconds}s ago`;
  }, [updatedAt, data]);

  return (
    <div
      className="viz-root space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]"
      style={{
        '--viz-series-1': '#2a78d6',
        '--viz-series-5': '#e8618f', // matches the globe's session pins
        '--viz-surface': '#ffffff'
      }}
    >
      <style>{`
        .dark .viz-root {
          --viz-series-1: #3987e5;
          --viz-series-5: #ff7ba6;
          --viz-surface: #1a1a1a;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">Live View</h1>
          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005bd3] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005bd3]" />
            </span>
            {freshness}
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            placeholder="Search location"
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className="py-24 text-center text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
          <p className="text-xs">Connecting to the storefront…</p>
        </div>
      ) : !data ? null : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,520px)] gap-4 items-start">

          {/* ── Left column: the numbers ── */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <p className="text-[11px] font-medium text-neutral-500">Visitors right now</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white tabular-nums mt-1">
                  {count(data.visitorsRightNow)}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">Tabs active in the last 5 minutes</p>
              </Card>

              <Card>
                <p className="text-[11px] font-medium text-neutral-500">Total sales</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white tabular-nums mt-1">
                  {money(data.sinceMidnight.totalSales)}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">Since midnight</p>
              </Card>

              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-neutral-500">Sessions</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums mt-1">
                      {count(data.sinceMidnight.sessions)}
                    </p>
                  </div>
                  <div className="pt-3">
                    <Sparkline data={data.sessionsPerMinute} />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Since midnight · last hour shown</p>
              </Card>

              <Card>
                <p className="text-[11px] font-medium text-neutral-500">Orders</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums mt-1">
                  {count(data.sinceMidnight.orders)}
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">Since midnight</p>
              </Card>
            </div>

            {/* Customer behaviour */}
            <Card title="Customer behavior">
              <div className="grid grid-cols-3 divide-x divide-neutral-200 dark:divide-neutral-800">
                {[
                  { label: 'Active carts', value: data.behavior.activeCarts, icon: ShoppingCart },
                  { label: 'Checking out', value: data.behavior.checkingOut, icon: CreditCard },
                  { label: 'Purchased', value: data.behavior.purchased, icon: CheckCircle2 }
                ].map((b, i) => (
                  <div key={b.label} className={i === 0 ? 'pr-4' : 'px-4'}>
                    <p className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                      <b.icon className="h-3.5 w-3.5" />
                      {b.label}
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums mt-1">
                      {count(b.value)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sessions by location */}
            <Card title="Sessions by location">
              {locations.length === 0 ? (
                <p className="text-xs text-neutral-500 py-6 text-center">
                  {locationQuery ? `No location matches “${locationQuery}”.` : 'No sessions yet today'}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {locations.slice(0, 8).map((loc) => (
                    <div key={loc.label}>
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <span className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate">{loc.label}</span>
                        <span className="text-[11px] font-semibold text-neutral-900 dark:text-white tabular-nums shrink-0">
                          {loc.value}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#f1f1f1] dark:bg-neutral-800/70 overflow-hidden">
                        <div
                          className="h-full transition-[width] duration-500"
                          style={{
                            width: `${Math.max((loc.value / maxLocation) * 100, 2)}%`,
                            background: 'var(--viz-series-1)',
                            borderRadius: '0 4px 4px 0'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Live visitor feed */}
            <Card title="Visitors right now">
              {data.liveVisitors.length === 0 ? (
                <p className="text-xs text-neutral-500 py-6 text-center">Nobody is on the store right now</p>
              ) : (
                <div className="divide-y divide-[#e1e1e1] dark:divide-neutral-800 -mx-1">
                  {data.liveVisitors.slice(0, 10).map((v) => {
                    const Icon = DEVICE_ICON[v.device] || Monitor;
                    return (
                      <div key={v.sessionId} className="flex items-center gap-3 px-1 py-2">
                        <Icon className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">
                            {[v.city, v.country].filter(Boolean).join(', ') || 'Unknown location'}
                          </p>
                          <p className="text-[11px] text-neutral-500 truncate">
                            {v.source} · {v.host}
                          </p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          v.activity === 'Purchased'
                            ? 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300'
                            : v.activity === 'Checkout'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : v.activity === 'Cart'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}>
                          {v.activity}
                          {v.cartValue > 0 && v.activity !== 'Purchased' ? ` · ${money(v.cartValue)}` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* ── Right column: globe + today's orders ── */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="py-2">
                <EarthGlobe locations={locations} focus={focus} />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 border-t border-[#e1e1e1] dark:border-neutral-800">
                <span className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                  <span className="h-2 w-2 rounded-full" style={{ background: 'var(--viz-series-5)' }} />
                  Exact ({exactCount})
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
                  <span
                    className="h-2 w-2 rounded-full border"
                    style={{ borderColor: 'var(--viz-series-5)' }}
                  />
                  Approximate ({locatedCount - exactCount})
                </span>
                <span className="text-[11px] text-neutral-500">drag to spin</span>
              </div>
            </Card>

            <Card title="Orders today">
              {data.recentOrders.length === 0 ? (
                <p className="text-xs text-neutral-500 py-6 text-center">No orders yet today</p>
              ) : (
                <div className="divide-y divide-[#e1e1e1] dark:divide-neutral-800 -mx-1">
                  {data.recentOrders.map((o) => (
                    <div key={o._id} className="flex items-center justify-between gap-3 px-1 py-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate">
                          #{o.orderNumber} · {o.customer}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {o.city || 'No city'} · {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-neutral-900 dark:text-white tabular-nums shrink-0">
                        {money(o.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      <p className="text-[11px] text-neutral-500 px-1">
        A visitor is a storefront tab that reported in within the last five minutes; a
        backgrounded tab stops counting. Location comes from the visitor's device timezone —
        which names a country, not a city, and involves no IP lookup — so those pins sit at the
        centre of that country and are drawn as open rings. A pin fills in only once an order
        gives us a real delivery city. Visitors whose browser reports no usable zone are counted
        but not plotted.
      </p>
    </div>
  );
};

export default AdminLiveView;
