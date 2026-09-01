import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, FileBarChart, Download, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { toCsv, downloadCsv } from '../../lib/csv';

/* ═══════════════════════════════════════════════════════════════════
   REPORT DETAIL
   One report from the library, rendered from the same endpoint the
   Analytics overview reads. Opening it is what stamps "last viewed" on
   the row in the library.
═══════════════════════════════════════════════════════════════════ */
const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' }
];

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const count = (n) => Number(n || 0).toLocaleString('en-IN');
const percent = (n) => `${Number(n || 0).toFixed(1)}%`;
const hours = (n) => `${Number(n || 0).toFixed(1)} h`;

const FORMATTERS = { money, count, percent, hours };

/* The catalogue's shape, mirrored on the client so a report knows which
   slice of the payload it draws and how to label it. Kept in sync with
   REPORT_CATALOGUE on the server. */
const REPORTS = {
  'orders-over-time': { name: 'Orders over time', category: 'Orders', source: 'daily', measure: 'orders', format: 'count', dimension: 'Day' },
  'total-sales-over-time': { name: 'Total sales over time', category: 'Sales', source: 'daily', measure: 'sales', format: 'money', dimension: 'Day' },
  'sessions-over-time': { name: 'Sessions over time', category: 'Acquisition', source: 'daily', measure: 'sessions', format: 'count', dimension: 'Day' },
  'products-by-sell-through-rate': { name: 'Products by sell-through rate', category: 'Inventory', source: 'productsBySellThrough', format: 'percent', dimension: 'Product' },
  'sessions-by-location': { name: 'Sessions by location', category: 'Acquisition', source: 'sessionsByLocation', format: 'count', dimension: 'Location' },
  'sessions-by-referrer': { name: 'Sessions by referrer', category: 'Acquisition', source: 'sessionsByReferrer', format: 'count', dimension: 'Referrer' },
  'sessions-by-social-referrer': { name: 'Sessions by social referrer', category: 'Acquisition', source: 'sessionsBySocialReferrer', format: 'count', dimension: 'Network' },
  'sessions-by-device': { name: 'Sessions by device', category: 'Acquisition', source: 'sessionsByDevice', format: 'count', dimension: 'Device' },
  'total-sales-by-referrer': { name: 'Total sales by referrer', category: 'Sales', source: 'totalSalesByReferrer', format: 'money', dimension: 'Referrer' },
  'total-sales-by-channel': { name: 'Total sales by channel', category: 'Sales', source: 'salesByChannelName', format: 'money', dimension: 'Channel' },
  'total-sales-by-delivery-city': { name: 'Total sales by delivery city', category: 'Sales', source: 'totalSalesByCity', format: 'money', dimension: 'City' },
  'top-products-by-units-sold': { name: 'Top products by units sold', category: 'Sales', source: 'topProducts', format: 'count', dimension: 'Product' },
  'net-payments-by-gateway': { name: 'Net payments by gateway', category: 'Finances', source: 'paymentsByGateway', format: 'money', dimension: 'Gateway' },
  'orders-by-fulfillment-status': { name: 'Orders by fulfillment status', category: 'Orders', source: 'ordersByFulfillment', format: 'count', dimension: 'Status' },
  'order-to-fulfillment-time': { name: 'Order to fulfillment time', category: 'Orders', source: 'fulfillmentTime', format: 'hours', dimension: 'Bucket' },
  'new-vs-returning-customers': { name: 'New vs returning customers', category: 'Customers', source: 'newVsReturning', format: 'count', dimension: 'Customer type' },
  'top-customers-by-spend': { name: 'Top customers by spend', category: 'Customers', source: 'topCustomers', format: 'money', dimension: 'Customer' },
  'checkout-conversion-funnel': { name: 'Checkout conversion funnel', category: 'Behavior', source: 'conversionFunnel', format: 'count', dimension: 'Step' },
  'inventory-on-hand-by-product': { name: 'Inventory on hand by product', category: 'Inventory', source: 'inventoryOnHand', format: 'count', dimension: 'Product' },
  'discount-usage-by-code': { name: 'Discount usage by code', category: 'Marketing', source: 'discountUsage', format: 'money', dimension: 'Code' }
};

/* ── Column chart for the over-time reports ── */
const ColumnChart = ({ rows, format }) => {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  const height = 260;
  const padTop = 16;
  const padBottom = 28;
  const plotH = height - padTop - padBottom;

  const values = rows.map((r) => Number(r.value) || 0);
  const rawMax = Math.max(...values, 0);
  const magnitude = rawMax > 0 ? Math.pow(10, Math.floor(Math.log10(rawMax))) : 1;
  const max = rawMax > 0 ? Math.ceil(rawMax / magnitude) * magnitude : 1;

  const slot = width / Math.max(rows.length, 1);
  // Bars cap at 24px — the leftover in the slot is deliberate air.
  const barW = Math.min(24, Math.max(3, slot - 6));

  if (rawMax === 0) {
    return <p className="text-xs text-neutral-500 py-16 text-center">No data for this date range</p>;
  }

  return (
    <div ref={wrapRef} className="relative">
      <svg width={width} height={height} role="img" aria-label="Report chart">
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={0}
            x2={width}
            y1={padTop + plotH * t}
            y2={padTop + plotH * t}
            stroke="var(--viz-grid)"
            strokeWidth="1"
          />
        ))}

        {rows.map((row, i) => {
          const v = Number(row.value) || 0;
          const h = (v / max) * plotH;
          const x = i * slot + (slot - barW) / 2;
          return (
            <g
              key={row.label + i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {/* Generous hit target, independent of the bar's own width. */}
              <rect x={i * slot} y={padTop} width={slot} height={plotH} fill="transparent" />
              <rect
                x={x}
                y={padTop + plotH - h}
                width={barW}
                height={Math.max(h, v > 0 ? 2 : 0)}
                fill="var(--viz-series-1)"
                opacity={hover === null || hover === i ? 1 : 0.55}
                rx="4"
                ry="4"
                style={{ transition: 'opacity 120ms' }}
              />
              {/* Square the bar off at the baseline — only the data-end is round. */}
              <rect
                x={x}
                y={padTop + plotH - Math.min(h, 4)}
                width={barW}
                height={Math.min(h, 4)}
                fill="var(--viz-series-1)"
                opacity={hover === null || hover === i ? 1 : 0.55}
              />
            </g>
          );
        })}

        <text x={0} y={height - 8} className="fill-neutral-500" fontSize="10">{rows[0]?.label}</text>
        <text x={width} y={height - 8} textAnchor="end" className="fill-neutral-500" fontSize="10">
          {rows[rows.length - 1]?.label}
        </text>
        <text x={0} y={padTop - 5} className="fill-neutral-500" fontSize="10">{format(max)}</text>
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-[11px] font-semibold whitespace-nowrap shadow-lg"
          style={{
            left: Math.min(Math.max(hover * slot - 30, 0), width - 120),
            top: 0
          }}
        >
          {rows[hover].label}: {format(rows[hover].value)}
        </div>
      )}
    </div>
  );
};

/* ── Horizontal bars for the by-dimension reports ── */
const BarRows = ({ rows, format }) => {
  const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1);
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate">{row.label}</span>
            <span className="text-xs font-semibold text-neutral-900 dark:text-white tabular-nums shrink-0">
              {format(row.value)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#f1f1f1] dark:bg-neutral-800/70 overflow-hidden">
            <div
              className="h-full transition-[width] duration-300"
              style={{
                width: `${Math.max((Number(row.value) / max) * 100, row.value > 0 ? 2 : 0)}%`,
                background: 'var(--viz-series-1)',
                borderRadius: '0 4px 4px 0'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const definition = REPORTS[id];

  const [range, setRange] = useState('30d');
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (nextRange) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/analytics/reports?range=${nextRange}`);
      setPayload(data);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load this report.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(range); }, [range, load]);

  // Stamp the library row — once per visit, not once per range change.
  useEffect(() => {
    if (!definition) return;
    API.post(`/analytics/catalogue/${id}/viewed`).catch(() => {});
  }, [id, definition]);

  const rows = useMemo(() => {
    if (!payload || !definition) return [];
    const source = payload.reports?.[definition.source] || [];
    if (definition.measure) {
      return source.map((d) => ({ label: d.label, value: Number(d[definition.measure]) || 0 }));
    }
    return source;
  }, [payload, definition]);

  const format = FORMATTERS[definition?.format] || count;
  const total = rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
  const isOverTime = Boolean(definition?.measure);

  if (!definition) {
    return (
      <div className="font-sans text-sm text-neutral-600 dark:text-neutral-300">
        <p className="mb-3">That report doesn't exist.</p>
        <Link to="/admin/reports" className="text-[#005bd3] dark:text-blue-400 font-semibold hover:underline">
          Back to reports
        </Link>
      </div>
    );
  }

  const handleExport = () => {
    downloadCsv(
      `nuva_${id}_${range}.csv`,
      toCsv(rows, [
        { header: definition.dimension, write: (r) => r.label },
        { header: definition.name, write: (r) => r.value }
      ])
    );
  };

  return (
    <div
      className="viz-root space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]"
      style={{ '--viz-series-1': '#2a78d6', '--viz-grid': '#e1e1e1', '--viz-surface': '#ffffff' }}
    >
      <style>{`
        .dark .viz-root {
          --viz-series-1: #3987e5;
          --viz-grid: #2e2e2e;
          --viz-surface: #1a1a1a;
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Link
            to="/admin/reports"
            title="Back to reports"
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <FileBarChart className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
          <h1 className="text-lg font-bold tracking-tight">{definition.name}</h1>
          <span className="ml-1 px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
            {definition.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  range === r.key
                    ? 'bg-[#202223] text-white dark:bg-white dark:text-black'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => load(range)}
            title="Refresh"
            className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            disabled={rows.length === 0}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {/* Chart */}
      <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs p-4">
        {loading && !payload ? (
          <div className="py-20 text-center text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
            <p className="text-xs">Building report…</p>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-neutral-500 py-16 text-center">No data for this date range</p>
        ) : (
          <>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
                {definition.format === 'percent' || definition.format === 'hours'
                  ? format(total / rows.length)
                  : format(total)}
              </span>
              <span className="text-[11px] text-neutral-500">
                {definition.format === 'percent' || definition.format === 'hours' ? 'average' : 'total'}
                {' · '}{rows.length} {rows.length === 1 ? 'row' : 'rows'}
              </span>
            </div>

            {isOverTime
              ? <ColumnChart rows={rows} format={format} />
              : <BarRows rows={rows} format={format} />}
          </>
        )}
      </section>

      {/* Table view — the accessible counterpart to every chart above. */}
      {rows.length > 0 && (
        <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold bg-[#f7f7f7] dark:bg-[#161616]">
                  <th className="py-2.5 px-4">{definition.dimension}</th>
                  <th className="py-2.5 px-4 text-right">{definition.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                {rows.map((row) => (
                  <tr key={row.label} className="hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50">
                    <td className="py-2.5 px-4 text-neutral-800 dark:text-neutral-200">{row.label}</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-neutral-900 dark:text-white tabular-nums">
                      {format(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminReportDetail;
