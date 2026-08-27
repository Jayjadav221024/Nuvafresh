import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingCart, Shield, AlertTriangle, ArrowRight, Activity, 
  Package, Edit3, Users, MessageSquare, KeyRound, ExternalLink, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../../api/axiosInstance';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    todayRevenue: 98450,
    revenueGrowth: '+18.4%',
    todayOrders: 81,
    ordersGrowth: '+12.6%',
    accessScope: '18 screens authorized',
    lowStockCount: 6,
    totalProducts: 335,
    totalOrders: 1420,
    pendingInquiries: 3,
    pendingReviews: 2
  });

  const [chartData, setChartData] = useState([
    { day: 'Mon', revenue: 42000, orders: 34 },
    { day: 'Tue', revenue: 58000, orders: 48 },
    { day: 'Wed', revenue: 51000, orders: 41 },
    { day: 'Thu', revenue: 76000, orders: 62 },
    { day: 'Fri', revenue: 89000, orders: 74 },
    { day: 'Sat', revenue: 112000, orders: 95 },
    { day: 'Sun', revenue: 98450, orders: 81 },
  ]);

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const { data } = await API.get('/admin/dashboard-kpis');
        if (data.success) {
          if (data.stats) setStats(data.stats);
          if (data.chartData) setChartData(data.chartData);
          if (data.recentOrders) setRecentOrders(data.recentOrders);
        }
      } catch (e) {
        console.error('KPI fetch fallback');
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  const QUICK_TILES = [
    { title: 'Website Editor', desc: 'Live visual editor for 12 site pages', path: '/admin/editor', icon: Edit3 },
    { title: 'Orders & Shipments', desc: 'Manage live batches & deliveries', path: '/admin/orders', icon: ShoppingCart },
    { title: 'Product Catalog', desc: '335+ products & O₃ batch logs', path: '/admin/products', icon: Package },
    { title: 'Revenue & Analytics', desc: 'Deep financial & payment metrics', path: '/admin/analytics', icon: Activity },
    { title: 'User Roles & Access', desc: 'RBAC permissions & staff scopes', path: '/admin/roles', icon: KeyRound },
    { title: 'Inquiries & Contact', desc: 'Customer questions & feedback', path: '/admin/inquiries', icon: MessageSquare },
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#2d472c] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              NUVA · Admin Console
            </span>
            <span className="text-xs text-emerald-300">● Live Operations</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-display tracking-tight text-white">
            Welcome back, Administrator
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Real-time control deck for farm-to-table logistics, Ozone batch certifications, and customer commerce.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/admin/editor"
            className="px-5 py-2.5 rounded-xl bg-white text-[#2d472c] text-xs font-bold hover:bg-neutral-100 transition-transform active:scale-95 shadow-md flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>Open Website Editor</span>
          </Link>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-emerald-800/30 to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Row KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Today's Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-display">
              ₹{stats.todayRevenue.toLocaleString()}
            </span>
            <p className="text-xs text-emerald-600 font-bold mt-1">
              {stats.revenueGrowth} vs. yesterday
            </p>
          </div>
        </div>

        {/* Card 2: Orders Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Orders Today</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-display">
              {stats.todayOrders}
            </span>
            <p className="text-xs text-emerald-600 font-bold mt-1">
              {stats.ordersGrowth} vs. yesterday
            </p>
          </div>
        </div>

        {/* Card 3: Access Scope */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Access Scope</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
              18 Screens
            </span>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-1">
              Full SuperAdmin Authorization
            </p>
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Low Stock Alerts</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-display">
              {stats.lowStockCount} SKUs
            </span>
            <p className="text-xs text-amber-600 font-bold mt-1">
              Threshold &lt; 10 units
            </p>
          </div>
        </div>

      </div>

      {/* 3. 7-Day Revenue Sparkline & Snapshot Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
              7-Day Revenue Snapshot
            </h2>
            <p className="text-xs text-neutral-500">Weekly sales trajectory across online store</p>
          </div>
          <Link
            to="/admin/analytics"
            className="text-xs font-bold text-[#2d472c] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View Full Revenue Analytics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 7-Day Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 pt-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          {chartData.map((item, i) => {
            const heightPercent = Math.round((item.revenue / 120000) * 100);
            return (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-bold text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{(item.revenue / 1000).toFixed(0)}k
                </div>
                <div
                  style={{ height: `${Math.max(15, heightPercent)}%` }}
                  className="w-full max-w-[48px] rounded-t-xl bg-[#2d472c] group-hover:bg-emerald-600 transition-colors shadow-sm"
                />
                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Quick Access Grid (6 Shortcut Tiles) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
          Quick Access Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_TILES.map((tile, i) => (
            <Link
              key={i}
              to={tile.path}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-[#2d472c] transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-[#f1eee7] dark:bg-neutral-800 text-[#2d472c] dark:text-emerald-400 flex items-center justify-center group-hover:bg-[#2d472c] group-hover:text-white transition-colors">
                  <tile.icon className="h-5 w-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#2d472c] dark:group-hover:text-emerald-400 transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-neutral-500">{tile.desc}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-[#2d472c] transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* 5. Security & Sign-In Auditing Card */}
      <div className="p-6 rounded-3xl bg-[#faf9f5] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#2d472c] dark:text-emerald-400" />
            <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Role-Based Access Control & Auditing
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Every administrative action and session is audited server-side against your permission scope.
          </p>
        </div>

        <Link
          to="/admin/audit-logs"
          className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 transition-colors shrink-0 shadow-sm"
        >
          Inspect Sign-In Logs
        </Link>
      </div>

    </div>
  );
};

export default AdminDashboard;
