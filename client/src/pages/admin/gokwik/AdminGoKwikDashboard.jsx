import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, RefreshCw, CheckCircle2, AlertCircle, Clock, ArrowRight,
  TrendingUp, ShieldCheck, ShieldAlert, CreditCard, Banknote,
  SlidersHorizontal, Settings, FileText, Activity, ExternalLink, Loader2
} from 'lucide-react';
import API from '../../../api/axiosInstance';
import { TableCard, Badge, SecondaryButton, PrimaryButton } from '../../../components/admin/ui';

const AdminGoKwikDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await API.get('/gokwik/stats');
      if (res.data?.success) {
        setData(res.data);
      } else {
        setError('Failed to load GoKwik status.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to GoKwik management API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Connected':
        return <Badge tone="success"><CheckCircle2 className="w-3 h-3" /> Connected</Badge>;
      case 'Configuration Required':
        return <Badge tone="warning"><AlertCircle className="w-3 h-3" /> Configuration Required</Badge>;
      case 'Error':
        return <Badge tone="warning"><AlertCircle className="w-3 h-3" /> Error</Badge>;
      default:
        return <Badge tone="neutral"><Clock className="w-3 h-3" /> Not Connected</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-neutral-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-neutral-400" />
        <p className="text-xs font-semibold">Loading GoKwik data...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              GoKwik
            </h1>
            {data && getStatusBadge(data.status)}
            {data?.isCheckoutEnabled ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Checkout Active
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                Checkout Standby
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage checkout, payments, COD, RTO and GoKwik integration settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SecondaryButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </SecondaryButton>
          <Link to="/admin/gokwik/settings">
            <PrimaryButton>
              <Settings className="h-3.5 w-3.5" />
              <span>Configure Settings</span>
            </PrimaryButton>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchDashboardData} className="underline text-xs font-semibold ml-4">
            Retry
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Status */}
        <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-semibold">Integration Status</span>
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-neutral-900 dark:text-white">
              {data?.status || 'Not Connected'}
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Environment: <span className="capitalize font-semibold text-neutral-700 dark:text-neutral-300">{data?.environment || 'Sandbox'}</span>
            </p>
          </div>
        </section>

        {/* Card 2: Total Orders */}
        <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-semibold">Total Orders</span>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              {metrics.hasData ? metrics.totalOrders : 'No data available'}
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Prepaid: <span className="font-semibold">{metrics.hasData ? metrics.prepaidOrders : '—'}</span> · COD: <span className="font-semibold">{metrics.hasData ? metrics.codOrders : '—'}</span>
            </p>
          </div>
        </section>

        {/* Card 3: Success Rates */}
        <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-semibold">Payment Success</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              {metrics.paymentSuccessRate}
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              COD Conversion: <span className="font-semibold">{metrics.codConversionRate}</span>
            </p>
          </div>
        </section>

        {/* Card 4: RTO Rate */}
        <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-semibold">RTO Rate</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-neutral-900 dark:text-white">
              {metrics.rtoRate}
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Risk Protection: <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
            </p>
          </div>
        </section>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/gokwik/settings"
          className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors group flex items-start gap-3.5 shadow-xs"
        >
          <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
            <Settings className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">API & Checkout Settings</h3>
              <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Configure credentials, sandbox mode, and checkout activation.</p>
          </div>
        </Link>

        <Link
          to="/admin/gokwik/cod"
          className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors group flex items-start gap-3.5 shadow-xs"
        >
          <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
            <Banknote className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">COD Rules & Limits</h3>
              <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Set min/max cart limits, fees, prepaid discounts, and OTP verify.</p>
          </div>
        </Link>

        <Link
          to="/admin/gokwik/rto"
          className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors group flex items-start gap-3.5 shadow-xs"
        >
          <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white">RTO & Risk Controls</h3>
              <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Automated COD risk handling and fraud protection rules.</p>
          </div>
        </Link>
      </div>

      {/* Recent GoKwik Orders Table */}
      <TableCard>
        <div className="px-4 py-3.5 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Recent GoKwik Orders</h2>
            <span className="text-[11px] text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md font-semibold">
              {recentOrders.length}
            </span>
          </div>
          <Link to="/admin/gokwik/orders" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1">
            <span>View all</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 bg-[#f7f7f7] dark:bg-[#202020] text-neutral-600 dark:text-neutral-400 font-semibold">
                <th className="py-2.5 px-4">GoKwik Order ID</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Payment Status</th>
                <th className="py-2.5 px-4">Risk Status</th>
                <th className="py-2.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">No GoKwik data available.</p>
                    <p className="text-[11px] text-neutral-500 mt-1">Orders processed through GoKwik will automatically synchronize here.</p>
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord._id || ord.gokwikOrderId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-neutral-900 dark:text-white">
                      {ord.gokwikOrderId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">{ord.customer?.name || 'Customer'}</div>
                      <div className="text-[11px] text-neutral-500">{ord.customer?.phone || ord.customer?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {ord.paymentStatus === 'Paid' ? (
                        <Badge tone="success">Paid</Badge>
                      ) : ord.paymentStatus === 'Pending' ? (
                        <Badge tone="warning">Pending</Badge>
                      ) : (
                        <Badge tone="neutral">{ord.paymentStatus}</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ord.rtoRiskScore?.level === 'High'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : ord.rtoRiskScore?.level === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {ord.rtoRiskScore?.level || 'Low'} Risk
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableCard>
    </div>
  );
};

export default AdminGoKwikDashboard;
