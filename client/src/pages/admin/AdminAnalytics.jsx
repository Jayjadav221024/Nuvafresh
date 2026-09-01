import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  BarChart3, Download, ArrowUpRight, ArrowDownRight, Minus,
  Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { toCsv, downloadCsv } from '../../lib/csv';

/* ═══════════════════════════════════════════════════════════════════
   ANALYTICS
   Shopify's report grid, built entirely from this store's own data:
   sessions recorded by the storefront tracker, orders from the order
   collection, stock from the catalogue. Nothing here is sampled,
   estimated or seeded — a card with no data says so.
═══════════════════════════════════════════════════════════════════ */
const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' }
];

/* Channel → categorical slot, assigned in fixed order and never cycled, so a
   channel keeps its colour when the set of channels changes. */
const CHANNEL_SLOT = {
  Organic: 1,
  Social: 2,
  Direct: 3,
  Referral: 4,
  Email: 5,
  Unknown: 6
};

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const count = (n) => Number(n || 0).toLocaleString('en-IN');
const percent = (n) => `${Number(n || 0).toFixed(1)}%`;

/* ═══════════════════════════════════════════════════════════════════
   CHROME
═══════════════════════════════════════════════════════════════════ */
const ReportCard = ({ title, subtitle, children, className = '' }) => (
  <section className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs flex flex-col ${className}`}>
    <div className="px-4 pt-4 pb-3">
      <h2 className="text-sm font-bold text-neutral-900 dark:text-white decoration-neutral-300 dark:decoration-neutral-600 underline underline-offset-4 decoration-1">
        {title}
      </h2>
      {subtitle && <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex-1 px-4 pb-4 min-h-[180px] flex flex-col">{children}</div>
  </section>
);

const EmptyState = ({ message = 'No data for this date range' }) => (
  <div className="flex-1 flex items-center justify-center">
    <p className="text-xs text-neutral-500">{message}</p>
  </div>
);

const Delta = ({ value, invert = false }) => {
  const n = Number(value) || 0;
  const good = invert ? n < 0 : n > 0;
  const Icon = n === 0 ? Minus : n > 0 ? ArrowUpRight : ArrowDownRight;
  const tone = n === 0
    ? 'text-neutral-500'
    : good
      ? 'text-emerald-700 dark:text-emerald-400'
      : 'text-rose-700 dark:text-rose-400';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${tone}`}>
      <Icon className="h-3 w-3" />
      {n === 0 ? 'No change' : `${Math.abs(n)}%`}
    </span>
  );
};

const StatTile = ({ label, value, delta, invert }) => (
  <div className="px-4 py-3 space-y-1">
    <p className="text-[11px] font-medium text-neutral-500">{label}</p>
    <p className="text-xl font-bold text-neutral-900 dark:text-white tabular-nums">{value}</p>
    {delta !== undefined && (
      <div className="flex items-center gap-1.5">
        <Delta value={delta} invert={invert} />
        <span className="text-[11px] text-neutral-500">vs previous period</span>
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   BAR LIST
   One series, so no legend — the card title names what is plotted. Every
   value is labelled beside its bar, which is also what lets the lighter
   categorical hues be used at all (the relief rule for sub-3:1 fills).
═══════════════════════════════════════════════════════════════════ */
const BarList = ({ rows, format = count, slot = 'seq', limit = 6 }) => {
  const shown = rows.slice(0, limit);
  const max = Math.max(...shown.map((r) => Number(r.value) || 0), 1);

  return (
    <div className="flex-1 space-y-2.5">
      {shown.map((row) => {
        const width = Math.max((Number(row.value) / max) * 100, row.value > 0 ? 2 : 0);
        return (
          <div key={row.label} className="group" title={`${row.label}: ${format(row.value)}`}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate">{row.label}</span>
              <span className="text-[11px] font-semibold text-neutral-900 dark:text-white tabular-nums shrink-0">
                {format(row.value)}
              </span>
            </div>
            {/* Bar: ≤24px thick, square at the baseline, 4px rounded data-end. */}
            <div className="h-2 w-full rounded-none bg-[#f1f1f1] dark:bg-neutral-800/70 overflow-hidden">
              <div
                className="h-full transition-[width] duration-300"
                style={{
                  width: `${width}%`,
                  background: slot === 'seq' ? 'var(--viz-series-1)' : `var(--viz-series-${slot})`,
                  borderRadius: '0 4px 4px 0'
                }}
              />
            </div>
          </div>
        );
      })}
      {rows.length > limit && (
        <p className="text-[11px] text-neutral-500 pt-1">and {rows.length - limit} more</p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   CHANNEL LIST
   Several channels on one card, so identity is carried by a legend AND a
   named row — never by colour alone.
═══════════════════════════════════════════════════════════════════ */
const ChannelList = ({ rows, limit = 6 }) => {
  const shown = rows.slice(0, limit);
  const channels = [...new Set(shown.map((r) => r.channel || 'Unknown'))];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 space-y-2.5">
        {shown.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: `var(--viz-series-${CHANNEL_SLOT[row.channel] || 6})` }}
              />
              <span className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate">{row.label}</span>
            </span>
            <span className="text-[11px] font-semibold text-neutral-900 dark:text-white tabular-nums shrink-0">
              {money(row.value)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 mt-2 border-t border-[#e1e1e1] dark:border-neutral-800">
        {channels.map((c) => (
          <span key={c} className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: `var(--viz-series-${CHANNEL_SLOT[c] || 6})` }}
            />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   TREND
   One measure per chart — two measures of different scale get two charts,
   never two y-axes on one.
═══════════════════════════════════════════════════════════════════ */
const TrendChart = ({ data, valueKey, format }) => {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(560);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(240, entry.contentRect.width));
    });
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  const height = 180;
  const padX = 8;
  const padTop = 12;
  const padBottom = 22;

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const rawMax = Math.max(...values, 0);
  // Round the top gridline to a clean number so the ticks read well.
  const magnitude = rawMax > 0 ? Math.pow(10, Math.floor(Math.log10(rawMax))) : 1;
  const max = rawMax > 0 ? Math.ceil(rawMax / magnitude) * magnitude : 1;

  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const pointAt = (i) => ({
    x: padX + i * stepX,
    y: padTop + plotH - (values[i] / max) * plotH
  });

  const line = data.map((_, i) => {
    const p = pointAt(i);
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');

  const area = data.length > 0
    ? `${line} L${(padX + (data.length - 1) * stepX).toFixed(1)},${padTop + plotH} L${padX},${padTop + plotH} Z`
    : '';

  const onMove = useCallback((e) => {
    if (data.length === 0 || stepX === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - padX;
    const index = Math.max(0, Math.min(data.length - 1, Math.round(x / stepX)));
    setHover(index);
  }, [data.length, stepX]);

  if (rawMax === 0) return <EmptyState />;

  const last = data.length - 1;
  const lastPoint = pointAt(last);
  const hoverPoint = hover !== null ? pointAt(hover) : null;

  return (
    <div ref={wrapRef} className="relative flex-1">
      <svg
        width={width}
        height={height}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block overflow-visible"
        role="img"
        aria-label={`${valueKey} over time`}
      >
        {/* Gridlines: hairline, solid, recessive. */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={padTop + plotH * t}
            y2={padTop + plotH * t}
            stroke="var(--viz-grid)"
            strokeWidth="1"
          />
        ))}

        <path d={area} fill="var(--viz-series-1)" opacity="0.1" />
        <path
          d={line}
          fill="none"
          stroke="var(--viz-series-1)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* End marker: ≥8px, with a 2px surface ring so it stays legible. */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="4"
          fill="var(--viz-series-1)"
          stroke="var(--viz-surface)"
          strokeWidth="2"
        />

        {hoverPoint && (
          <>
            <line
              x1={hoverPoint.x}
              x2={hoverPoint.x}
              y1={padTop}
              y2={padTop + plotH}
              stroke="var(--viz-grid)"
              strokeWidth="1"
            />
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r="4"
              fill="var(--viz-series-1)"
              stroke="var(--viz-surface)"
              strokeWidth="2"
            />
          </>
        )}

        {/* Only the ends are labelled — a date under every point is unreadable. */}
        <text x={padX} y={height - 6} className="fill-neutral-500" fontSize="10">
          {data[0]?.label}
        </text>
        <text x={width - padX} y={height - 6} textAnchor="end" className="fill-neutral-500" fontSize="10">
          {data[last]?.label}
        </text>
      </svg>

      {/* Tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-[11px] font-semibold whitespace-nowrap shadow-lg"
          style={{
            left: Math.min(Math.max(hoverPoint.x - 40, 0), width - 90),
            top: Math.max(hoverPoint.y - 34, 0)
          }}
        >
          {data[hover].label}: {format(values[hover])}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
        <span>0</span>
        <span>peak {format(max)}</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
const AdminAnalytics = () => {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (nextRange = range) => {
    setLoading(true);
    setError('');
    try {
      const { data: payload } = await API.get(`/analytics/reports?range=${nextRange}`);
      setData(payload);
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load analytics.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(range); /* eslint-disable-next-line */ }, [range]);

  const reports = data?.reports;
  const summary = data?.summary;

  const handleExport = () => {
    if (!reports) return;
    const rows = [];
    const push = (report, label, formatValue) => {
      (reports[report] || []).forEach((r) =>
        rows.push({ report: label, label: r.label, value: formatValue(r.value) })
      );
    };
    push('sessionsByReferrer', 'Sessions by referrer', count);
    push('sessionsBySocialReferrer', 'Sessions by social referrer', count);
    push('totalSalesByReferrer', 'Total sales by referrer', money);
    push('totalSalesByCity', 'Total sales by delivery city', money);
    push('productsBySellThrough', 'Products by sell-through rate', percent);
    push('topProducts', 'Units sold by product', count);
    push('sessionsByDevice', 'Sessions by device', count);

    downloadCsv(
      `nuva_analytics_${range}_${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows, [
        { header: 'Report', write: (r) => r.report },
        { header: 'Dimension', write: (r) => r.label },
        { header: 'Value', write: (r) => r.value }
      ])
    );
  };

  const rangeLabel = useMemo(
    () => RANGES.find((r) => r.key === range)?.label.toLowerCase() || 'this period',
    [range]
  );

  return (
    <div
      className="viz-root space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]"
      /* The palette lives here as roles, so light and dark swap in one place.
         Categorical slots are the validated order; slot 1 doubles as the
         single-series sequential hue. */
      style={{
        '--viz-series-1': '#2a78d6',
        '--viz-series-2': '#eb6834',
        '--viz-series-3': '#1baf7a',
        '--viz-series-4': '#eda100',
        '--viz-series-5': '#e87ba4',
        '--viz-series-6': '#008300',
        '--viz-grid': '#e1e1e1',
        '--viz-surface': '#ffffff'
      }}
    >
      <style>{`
        .dark .viz-root {
          --viz-series-1: #3987e5;
          --viz-series-2: #d95926;
          --viz-series-3: #199e70;
          --viz-series-4: #c98500;
          --viz-series-5: #d55181;
          --viz-series-6: #008300;
          --viz-grid: #2e2e2e;
          --viz-surface: #1a1a1a;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">Analytics</h1>
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
            className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            disabled={!reports}
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

      {loading && !data ? (
        <div className="py-24 text-center text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading reports…</p>
        </div>
      ) : !summary ? null : (
        <>
          {/* ── KPI row ── */}
          <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 dark:divide-neutral-800">
            <StatTile label="Sessions" value={count(summary.sessions)} delta={summary.sessionsChange} />
            <StatTile label="Total sales" value={money(summary.grossSales)} delta={summary.grossSalesChange} />
            <StatTile label="Orders" value={count(summary.orders)} delta={summary.ordersChange} />
            <StatTile label="Average order value" value={money(summary.averageOrderValue)} />
            <StatTile label="Conversion rate" value={percent(summary.conversionRate)} />
          </div>

          {/* ── Trends: one measure per chart, never two y-axes on one ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ReportCard title="Sessions over time" subtitle={`Storefront visits, ${rangeLabel}`}>
              {reports.daily?.length ? (
                <TrendChart data={reports.daily} valueKey="sessions" format={count} />
              ) : (
                <EmptyState />
              )}
            </ReportCard>

            <ReportCard title="Total sales over time" subtitle={`Order value, ${rangeLabel}`}>
              {reports.daily?.length ? (
                <TrendChart data={reports.daily} valueKey="sales" format={money} />
              ) : (
                <EmptyState />
              )}
            </ReportCard>
          </div>

          {/* ── Report grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <ReportCard title="Sessions by social referrer">
              {reports.sessionsBySocialReferrer?.length
                ? <BarList rows={reports.sessionsBySocialReferrer} />
                : <EmptyState />}
            </ReportCard>

            <ReportCard title="Total sales by referrer">
              {reports.totalSalesByReferrer?.length
                ? <BarList rows={reports.totalSalesByReferrer} format={money} />
                : <EmptyState />}
            </ReportCard>

            <ReportCard title="Performance by referring channel">
              {reports.performanceByChannel?.length
                ? <ChannelList rows={reports.performanceByChannel} />
                : <EmptyState />}
            </ReportCard>

            <ReportCard title="Sessions by referrer" subtitle="Source · site · location">
              {reports.sessionsByReferrer?.length
                ? <BarList rows={reports.sessionsByReferrer} />
                : <EmptyState />}
            </ReportCard>

            <ReportCard title="Total sales by delivery city">
              {reports.totalSalesByCity?.length
                ? <BarList rows={reports.totalSalesByCity} format={money} />
                : <EmptyState />}
            </ReportCard>

            <ReportCard title="Products by sell-through rate" subtitle="Units sold ÷ units sold + on hand">
              {reports.productsBySellThrough?.length
                ? <BarList rows={reports.productsBySellThrough} format={percent} />
                : <EmptyState />}
            </ReportCard>

            <ReportCard title="Top products by units sold">
              {reports.topProducts?.length
                ? <BarList rows={reports.topProducts} />
                : <EmptyState />}
            </ReportCard>

            <ReportCard title="Sessions by device">
              {reports.sessionsByDevice?.length
                ? <BarList rows={reports.sessionsByDevice} />
                : <EmptyState />}
            </ReportCard>

            <ReportCard title="Total sales by channel">
              {reports.salesByChannelName?.length
                ? <BarList rows={reports.salesByChannelName} format={money} />
                : <EmptyState />}
            </ReportCard>
          </div>

          <p className="text-[11px] text-neutral-500 px-1">
            Sessions are counted once per browser tab that opens the storefront. Sales are
            credited to a referrer only when the visit that placed the order was tracked —
            untracked checkouts stay out of the acquisition reports rather than being guessed at.
          </p>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
