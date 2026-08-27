import React, { useState } from 'react';
import { 
  TrendingUp, ShoppingBag, CreditCard, DollarSign, Calendar, Download, 
  ArrowUpRight, ArrowDownRight, Tag, ShieldCheck, PieChart, BarChart3
} from 'lucide-react';

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState('7d');

  const KPIS = [
    { label: 'Total Revenue', value: '₹5,74,450', change: '+18.4%', isPositive: true, icon: DollarSign },
    { label: 'Total Orders', value: '1,420', change: '+12.6%', isPositive: true, icon: ShoppingBag },
    { label: 'Average Order Value (AOV)', value: '₹404.50', change: '+4.2%', isPositive: true, icon: TrendingUp },
    { label: 'Refund / Return Rate', value: '0.14%', change: '-0.08%', isPositive: true, icon: ShieldCheck },
  ];

  const TOP_PRODUCTS = [
    { name: 'Desi Gir Cow A2 Bilona Cultured Ghee (500ml)', units: 480, revenue: '₹6,96,000', category: 'A2 Ghee' },
    { name: 'Khapli Wheat Organic Ancient Atta (5 Kg)', units: 395, revenue: '₹1,50,100', category: 'Organic Atta' },
    { name: 'Wood Cold-Pressed Mustard Oil (1 Litre)', units: 310, revenue: '₹92,690', category: 'Stone Pressed Oils' },
    { name: 'Hydro-Cleaned Crisp Baby Spinach (250g)', units: 280, revenue: '₹22,120', category: 'Ozone Washed Produce' },
  ];

  const PAYMENT_SPLIT = [
    { method: 'UPI (GPay / PhonePe / Paytm)', share: '68%', count: 965, color: 'bg-emerald-500' },
    { method: 'Credit & Debit Cards (Razorpay)', share: '21%', count: 298, color: 'bg-blue-500' },
    { method: 'Net Banking & Corporate Accounts', share: '8%', count: 114, color: 'bg-purple-500' },
    { method: 'Cash On Delivery (Verified OTP)', share: '3%', count: 43, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Header with Date Filter & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Revenue & Sales Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time financial telemetry, payment gateways breakdown, and product performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl shadow-sm">
            {['today', '7d', '30d', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  dateRange === range
                    ? 'bg-[#2d472c] text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {range === 'today' ? 'Today' : range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Custom'}
              </button>
            ))}
          </div>

          {/* Export Report Button */}
          <button
            onClick={() => alert('Generating financial revenue export CSV...')}
            className="px-4 py-2 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPIS.map((kpi, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{kpi.label}</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <kpi.icon className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-display">
                {kpi.value}
              </span>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{kpi.change} vs. previous period</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Section: Top Selling Products (60%) & Payment Split (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Selling Products Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white font-display">
              Top Selling Products
            </h2>
            <span className="text-xs text-neutral-400 font-semibold">Ranked by gross sales</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Product Name</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold text-right">Units Sold</th>
                  <th className="pb-3 font-bold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {TOP_PRODUCTS.map((p, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="py-3.5 font-bold text-neutral-900 dark:text-white max-w-[200px] truncate">
                      {p.name}
                    </td>
                    <td className="py-3.5 text-neutral-500">
                      {p.category}
                    </td>
                    <td className="py-3.5 font-semibold text-right text-neutral-700 dark:text-neutral-300">
                      {p.units}
                    </td>
                    <td className="py-3.5 font-black text-right text-emerald-700 dark:text-emerald-400">
                      {p.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Razorpay Payment Gateways Split */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white font-display">
              Payment Gateway Breakdown (Razorpay)
            </h2>
            <p className="text-xs text-neutral-500">Distribution of customer checkout settlement methods</p>
          </div>

          <div className="space-y-3">
            {PAYMENT_SPLIT.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.method}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{item.share} ({item.count} orders)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: item.share }} />
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Impact Card */}
          <div className="p-4 rounded-2xl bg-[#faf9f5] dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#2d472c] dark:text-emerald-400" />
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Coupon Impact (`WELCOME10`)
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              248 orders used promotional coupons, generating <strong>₹98,400</strong> in net incremental first-time buyer revenue.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminAnalytics;
