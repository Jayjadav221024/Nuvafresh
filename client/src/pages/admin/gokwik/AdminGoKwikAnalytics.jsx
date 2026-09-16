import React, { useState, useEffect } from 'react';
import {
  Activity, TrendingUp, CreditCard, Banknote, ShieldAlert, RefreshCw, BarChart3
} from 'lucide-react';
import API from '../../../api/axiosInstance';
import { Card, SecondaryButton } from '../../../components/admin/ui';

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' }
];

const AdminGoKwikAnalytics = () => {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (selectedRange = range) => {
    try {
      const res = await API.get(`/gokwik/analytics?range=${selectedRange}`);
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch GoKwik analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics(range);
  };

  const summary = data?.summary || {};
  const timeline = data?.timeline || [];
  const maxOrders = Math.max(...timeline.map((t) => t.orders), 1);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            GoKwik Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Conversion performance, payment success rates, and revenue trends across GoKwik checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range picker */}
          <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  range === r.key
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-black shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <SecondaryButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </SecondaryButton>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500">GoKwik Revenue</span>
          <div className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            ₹{summary.totalRevenue || 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">AOV: ₹{summary.averageOrderValue || 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500">Total Checkouts</span>
          <div className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            {summary.totalOrders || 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Success: {summary.successfulPayments || 0} · Failed: {summary.failedPayments || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500">Payment Success Rate</span>
          <div className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            {summary.successRate || '0%'}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Verified Checkouts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500">Payment Method Mix</span>
          <div className="text-base font-bold text-neutral-900 dark:text-white mt-1">
            Prepaid: {summary.prepaidOrders || 0} · COD: {summary.codOrders || 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">Automated Risk Filter Active</p>
        </div>
      </div>

      {/* Orders Trend Chart */}
      <Card title="Order Volume Over Time">
        <div className="pt-2">
          {timeline.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No GoKwik data available for this date range.
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((item) => {
                const widthPercent = Math.max((item.orders / maxOrders) * 100, item.orders > 0 ? 5 : 0);
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">{item.label}</span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {item.orders} order{item.orders === 1 ? '' : 's'} (₹{item.revenue})
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminGoKwikAnalytics;
