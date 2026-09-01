import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import API from '../../api/axiosInstance';
import { toCsv, downloadCsv } from '../../lib/csv';
import {
  VizRoot, StatTile, TrendChart, EmptyState, money, count, percent
} from '../../components/admin/viz';

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
    <VizRoot className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">
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
    </VizRoot>
  );
};

export default AdminAnalytics;
