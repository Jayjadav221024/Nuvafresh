import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Filter, Truck, CheckCircle2, Clock, 
  MapPin, Edit3, X, RefreshCw, ExternalLink, ShieldCheck, 
  ChevronRight, AlertCircle, Phone, Mail, FileText, Trash2,
  SlidersHorizontal, ChevronDown, User, ArrowUpDown
} from 'lucide-react';
import API from '../../api/axiosInstance';

const SEED_ABANDONED_CHECKOUTS = [
  { id: '#31163991851098', created: 'Friday at 2:04 pm', customer: 'Sunil Sunil', email: 'sunilsunil@gmail.com', region: 'India', status: 'Not recovered', price: 600 },
  { id: '#31158577430618', created: 'Thursday at 1:16 pm', customer: 'Jay Jadav', email: 'jayjadav9313@gmail.com', region: 'India', status: 'Not recovered', price: 120 },
  { id: '#31113876537434', created: 'Aug 19 at 5:59 pm', customer: 'Pushpa Jain', email: 'pushpajain@gmail.com', region: 'India', status: 'Not recovered', price: 120 },
  { id: '#31113865199706', created: 'Aug 19 at 5:57 pm', customer: 'Pushpa Jain', email: 'pushpajain@gmail.com', region: 'India', status: 'Not recovered', price: 70 },
  { id: '#31065053921370', created: 'Aug 10 at 11:58 am', customer: 'Puja Kothari', email: 'pujakothari83@gmail.com', region: 'India', status: 'Not recovered', price: 848 },
  { id: '#31061990965338', created: 'Aug 10 at 12:04 am', customer: 'Raj Manshani', email: 'rajmanshani@gmail.com', region: 'India', status: 'Not recovered', price: 280 },
  { id: '#31026509807706', created: 'Aug 3 at 12:09 am', customer: 'Aziza Syeda', email: 'azizasyeda@gmail.com', region: 'India', status: 'Not recovered', price: 60 },
  { id: '#31015679590490', created: 'Aug 1 at 4:33 am', customer: 'Prajnya Baliga', email: 'prajnyabaliga3186@gmail.com', region: 'India', status: 'Not recovered', price: 788 },
  { id: '#31009999585370', created: 'Jul 31 at 12:26 am', customer: 'Balaram Behera', email: 'balarambehera@gmail.com', region: 'India', status: 'Not recovered', price: 498 },
  { id: '#31007881789530', created: 'Jul 30 at 3:21 pm', customer: 'Ayushi Sen', email: 'ayushisen@gmail.com', region: 'India', status: 'Not recovered', price: 30 },
  { id: '#30991274180698', created: 'Jul 28 at 8:48 pm', customer: 'Tanvi Shah', email: 'tanvishah@gmail.com', region: 'India', status: 'Not recovered', price: 800 },
  { id: '#30981072814170', created: 'Jul 26 at 3:56 pm', customer: 'Purvi Parikh', email: 'purviparikh@gmail.com', region: 'India', status: 'Not recovered', price: 229 },
  { id: '#30967414390874', created: 'Jul 23 at 8:57 pm', customer: 'Tapas Debnath', email: 'tapasdebnath@gmail.com', region: 'India', status: 'Not recovered', price: 1200 },
];

const SEED_ORDERS = [
  { _id: 'NUVA1123', createdAt: 'Wednesday at 8:11 pm', user: { name: 'Ayushi Patel', email: 'ayushi@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 378, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '1 item', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '10:00 AM' },
  { _id: 'NUVA1122', createdAt: 'Aug 6 at 8:25 am', user: { name: 'Anant Patel', email: 'anant@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 2845, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '23 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '10:00 AM' },
  { _id: 'NUVA1121', createdAt: 'Aug 2 at 3:49 pm', user: { name: 'Purvi Parikh', email: 'purviparikh@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 369, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '3 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '2 Aug 2026' },
  { _id: 'NUVA1120', createdAt: 'Jul 24 at 6:31 pm', user: { name: 'Het Dholu', email: 'hetdholu@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 1118, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '5 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '24 Jul 2026' },
  { _id: 'NUVA1119', createdAt: 'Jul 24 at 3:56 pm', user: { name: 'Purvi Parikh', email: 'purviparikh@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 647, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '4 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '24 Jul 2026' },
  { _id: 'NUVA1118', createdAt: 'Jul 21 at 10:29 pm', user: { name: 'Het Dholu', email: 'hetdholu@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 608, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '3 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '10:00 AM' },
  { _id: 'NUVA1117', createdAt: 'Jul 19 at 3:43 pm', user: { name: 'Malvika Jha', email: 'malvikajha.moa@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 1696, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '14 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '19 Jul 2026' },
  { _id: 'NUVA1116', createdAt: 'Jul 16 at 11:00 am', user: { name: 'Malvika Jha', email: 'malvikajha.moa@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 249, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '1 item', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '16 Jul 2026' },
  { _id: 'NUVA1115', createdAt: 'Jul 16 at 7:02 pm', user: { name: 'Tanvi Shah', email: 'tanvi@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 1488.60, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '6 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '17 Jul 2026' },
  { _id: 'NUVA1114', createdAt: 'Jul 8 at 10:18 am', user: { name: 'Sunil Sunil', email: 'sunil@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 770, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '2 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '1:00 PM' },
  { _id: 'NUVA1113', createdAt: 'Jun 7 at 10:01 am', user: { name: 'Malvika Jha', email: 'malvikajha.moa@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 993, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '6 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '12:00 PM' },
  { _id: 'NUVA1112', createdAt: 'Jun 2 at 12:40 pm', user: { name: 'Malvika Jha', email: 'malvikajha.moa@gmail.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 1478, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '6 items', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '2 Jun 2026' },
  { _id: 'NUVA1111', createdAt: 'May 26 at 7:10 pm', user: { name: 'Parth Nuva', email: 'parth@thenuva.com', city: 'Vadodara GJ, India' }, channel: 'Online Store', totalPrice: 95, isPaid: true, fulfillmentStatus: 'Fulfilled', itemsCount: '1 item', deliveryStatus: 'Delivered', deliveryMethod: 'Local delivery', tag: '10:00 AM' },
];

const AdminOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'orders'; // 'orders', 'drafts', 'abandoned'

  const [orders, setOrders] = useState(SEED_ORDERS);
  const [abandoned, setAbandoned] = useState(SEED_ABANDONED_CHECKOUTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [hoveredCustomer, setHoveredCustomer] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders');
      if (res.data?.orders && res.data.orders.length > 0) {
        // Keep the real _id — the row links to /admin/orders/:id — and read
        // each column off the order record instead of inventing a value.
        const formatted = res.data.orders.map((o) => {
          const count = (o.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
          return {
            _id: o._id,
            orderNumber: o.orderNumber || o._id,
            createdAt: o.createdAt
              ? new Date(o.createdAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true
                })
              : '—',
            user: o.user || { name: 'Guest customer', email: '', city: '' },
            channel: o.channel || 'Online Store',
            totalPrice: o.totalAmount ?? 0,
            isPaid: ['Paid', 'Completed'].includes(o.paymentStatus),
            fulfillmentStatus: o.fulfillmentStatus || 'Unfulfilled',
            itemsCount: `${count} ${count === 1 ? 'item' : 'items'}`,
            deliveryStatus: o.orderStatus || 'Placed',
            deliveryMethod: o.shippingMethod || 'Local delivery',
            tag: o.tags?.[0] || o.additionalDetails?.dueTime || ''
          };
        });
        setOrders(formatted);
      }
    } catch (e) {
      console.log('Using seed orders dataset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(o => o._id || o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(item => item !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(search.toLowerCase()) ||
    (o.user?.name && o.user.name.toLowerCase().includes(search.toLowerCase())) ||
    (o.user?.email && o.user.email.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredAbandoned = abandoned.filter(a =>
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">
      
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER (Shopify Orders / Abandoned View)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            {activeView === 'abandoned' ? (
              <span>Abandoned checkouts</span>
            ) : (
              <>
                <span>Orders</span>
                <span className="text-xs font-normal text-neutral-500 bg-neutral-200/70 dark:bg-neutral-800 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer">
                  All locations <ChevronDown className="h-3 w-3" />
                </span>
              </>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50">
            Export
          </button>
          {activeView !== 'abandoned' && (
            <>
              <button className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50">
                More actions
              </button>
              <button
                onClick={() => navigate('/admin/orders/new')}
                className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold transition-transform active:scale-95 shadow-xs flex items-center gap-1.5"
              >
                <span>Create order</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP KPI STATS BAR (Orders View Only)
      ───────────────────────────────────────────────────────────── */}
      {activeView !== 'abandoned' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800 gap-3 sm:gap-0">
          
          <div className="px-3 space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span>Orders</span>
              <span className="text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">Today</span>
            </div>
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              0 <span className="text-neutral-400 font-normal">—</span>
            </div>
          </div>

          <div className="px-3 space-y-1">
            <div className="text-xs text-neutral-500 font-medium">Items ordered</div>
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              0 <span className="text-neutral-400 font-normal">—</span>
            </div>
          </div>

          <div className="px-3 space-y-1">
            <div className="text-xs text-neutral-500 font-medium">Sales reversals</div>
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              ₹0 <span className="text-neutral-400 font-normal">—</span>
            </div>
          </div>

          <div className="px-3 space-y-1">
            <div className="text-xs text-neutral-500 font-medium">Orders fulfilled</div>
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              0 <span className="text-neutral-400 font-normal">—</span>
            </div>
          </div>

          <div className="px-3 space-y-1">
            <div className="text-xs text-neutral-500 font-medium">Orders delivered</div>
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              0 <span className="text-neutral-400 font-normal">—</span>
            </div>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MAIN ORDERS / ABANDONED TABLE CARD
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">
        
        {/* Search & Tabs Filter Bar */}
        <div className="p-2.5 px-3 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3 bg-white dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md">
              All
            </span>
            <div className="relative flex-1 max-w-sm flex items-center">
              <Search className="h-3.5 w-3.5 absolute left-2.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search and filter"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-600 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-neutral-400">
            <button className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300" title="Columns">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* VIEW 1: REGULAR ORDERS TABLE */}
        {activeView !== 'abandoned' ? (
          <div className="overflow-x-auto relative">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold bg-white dark:bg-[#1a1a1a]">
                  <th className="py-2.5 px-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Date ↓</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3">Payment status</th>
                  <th className="py-2.5 px-3">Fulfillment status</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Delivery status</th>
                  <th className="py-2.5 px-3">Delivery method</th>
                  <th className="py-2.5 px-4">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                {filteredOrders.map((ord) => {
                  const isSelected = selectedOrders.includes(ord._id);
                  return (
                    <tr
                      key={ord._id}
                      onClick={() => navigate(`/admin/orders/${ord._id}`)}
                      className={`cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors ${
                        isSelected ? 'bg-neutral-50 dark:bg-neutral-800/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(ord._id)}
                          className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#1a1a1a] dark:text-white hover:underline">
                        #{String(ord.orderNumber || ord._id).replace(/^#/, '')}
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                        {ord.createdAt}
                      </td>
                      <td className="py-3 px-3 relative">
                        <span 
                          onMouseEnter={() => setHoveredCustomer(ord)}
                          onMouseLeave={() => setHoveredCustomer(null)}
                          className="font-medium text-neutral-800 dark:text-neutral-200 hover:underline cursor-pointer"
                        >
                          {ord.user?.name || 'Nuva Customer'}
                        </span>

                        {/* Customer Detail Popover Hover Card (As seen in screenshot) */}
                        {hoveredCustomer?._id === ord._id && (
                          <div className="absolute left-0 top-8 z-50 w-56 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-3 text-left animate-in fade-in">
                            <p className="font-bold text-neutral-900 dark:text-white text-xs">{ord.user?.name}</p>
                            <p className="text-[11px] text-neutral-500">{ord.user?.city || 'Vadodara GJ, India'}</p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">1 order</p>
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate mt-1">
                              {ord.user?.email || 'customer@gmail.com'}
                            </p>
                            <button className="w-full mt-2.5 py-1 px-2 text-[11px] font-bold rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-center">
                              View customer
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                        {ord.channel}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-neutral-900 dark:text-white">
                        ₹{Number(ord.totalPrice).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-500"></span>
                          <span>Paid</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-500"></span>
                          <span>{ord.fulfillmentStatus}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                        {ord.itemsCount}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-500"></span>
                          <span>{ord.deliveryStatus}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                        {ord.deliveryMethod}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 text-[11px]">
                        {ord.tag}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* VIEW 2: ABANDONED CHECKOUTS TABLE (Screenshot 4) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold bg-white dark:bg-[#1a1a1a]">
                  <th className="py-2.5 px-4 w-10">
                    <input type="checkbox" className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer" />
                  </th>
                  <th className="py-2.5 px-3">Checkout</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3">Customer name</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Recovery status</th>
                  <th className="py-2.5 px-4 text-right">Total price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                {filteredAbandoned.map((ab) => (
                  <tr key={ab.id} className="hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer" />
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-neutral-900 dark:text-white">
                      {ab.id}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      {ab.created}
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                      {ab.customer}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      {ab.region}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#fedcb8] text-[#8a4200] dark:bg-amber-950 dark:text-amber-300">
                        {ab.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-neutral-900 dark:text-white">
                      ₹{ab.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminOrders;
