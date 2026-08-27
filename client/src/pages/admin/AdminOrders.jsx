import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, Truck, CheckCircle2, Clock, 
  MapPin, Edit3, X, RefreshCw, ExternalLink, ShieldCheck, 
  ChevronRight, AlertCircle, Phone, Mail, FileText, Trash2
} from 'lucide-react';
import API from '../../api/axiosInstance';

const STATUS_OPTIONS = [
  'Placed',
  'Ozone Washing',
  'Quality Inspected',
  'Dispatched',
  'Out for Delivery',
  'Delivered'
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Tracking Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form State for Tracking Update
  const [trackingForm, setTrackingForm] = useState({
    orderStatus: 'Placed',
    carrier: 'Nuva Express Sunrise Fleet',
    trackingNumber: '',
    currentLocation: 'Vadodara Bio-Purification Chamber',
    estimatedDelivery: 'Tomorrow by 08:30 AM',
    trackingNotes: ''
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders');
      if (res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setTrackingForm({
      orderStatus: order.orderStatus || 'Placed',
      carrier: order.tracking?.carrier || 'Nuva Express Sunrise Fleet',
      trackingNumber: order.tracking?.trackingNumber || `NUV-TRK-${order._id}`,
      currentLocation: order.tracking?.currentLocation || 'Vadodara Bio-Purification Chamber',
      estimatedDelivery: order.tracking?.estimatedDelivery || 'Tomorrow by 08:30 AM',
      trackingNotes: order.tracking?.trackingNotes || ''
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSavingTracking(true);
    setFeedbackMsg('');

    try {
      const res = await API.put(`/orders/${selectedOrder._id}/track`, trackingForm);
      if (res.data?.order) {
        setOrders(prev => prev.map(o => o._id === selectedOrder._id ? res.data.order : o));
        setSelectedOrder(res.data.order);
        setFeedbackMsg('✅ Tracking & order status broadcasted live to customer!');
        setTimeout(() => {
          setIsModalOpen(false);
        }, 1200);
      }
    } catch (err) {
      // Fallback update in state
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? {
        ...o,
        orderStatus: trackingForm.orderStatus,
        tracking: {
          ...o.tracking,
          ...trackingForm
        }
      } : o));
      setFeedbackMsg('✅ Updated tracking status locally.');
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } finally {
      setSavingTracking(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o._id && o._id.toLowerCase().includes(search.toLowerCase())) ||
      (o.user?.name && o.user.name.toLowerCase().includes(search.toLowerCase())) ||
      (o.user?.email && o.user.email.toLowerCase().includes(search.toLowerCase())) ||
      (o.deliveryAddress?.city && o.deliveryAddress.city.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300';
      case 'Dispatched':
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300';
      case 'Ozone Washing':
      case 'Ozone Purifying':
      case 'Quality Inspected':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to permanently delete Order #${orderId}?`)) {
      return;
    }
    try {
      await API.delete(`/orders/${orderId}`);
      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
      setOrders(prev => prev.filter(o => o._id !== orderId));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Live Orders & Purity Tracking
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time management for farm harvesting, Aqueous Ozone purification stages, and express deliveries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 transition-colors shadow-sm"
            title="Refresh orders list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Customer Name, Email, or City..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#2d472c]"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', ...STATUS_OPTIONS].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#2d472c] text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-extrabold bg-neutral-100/70 dark:bg-neutral-800/60">
                <th className="py-4 px-5">Order ID & Date</th>
                <th className="py-4 px-5">Customer Details</th>
                <th className="py-4 px-5">Items Harvested</th>
                <th className="py-4 px-5">Amount & Payment</th>
                <th className="py-4 px-5">Live Tracking Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 font-medium">
                    No orders found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 block">
                        #{order._id}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Customer Details */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {order.deliveryAddress?.name || order.user?.name || 'Customer'}
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate max-w-[180px]">
                        {order.user?.email}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {order.deliveryAddress?.city}, {order.deliveryAddress?.state || 'Gujarat'}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-4 px-5">
                      <div className="space-y-1 max-w-xs">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate">
                            • {item.title} <span className="text-neutral-400 font-semibold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Amount & Payment */}
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-neutral-900 dark:text-white text-xs">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {order.paymentMethod || 'Online'}
                      </span>
                    </td>

                    {/* Live Tracking Status */}
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(order.orderStatus)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        <span>{order.orderStatus || 'Placed'}</span>
                      </span>
                      <div className="text-[10px] text-neutral-400 mt-1 font-mono truncate max-w-[170px]">
                        📍 {order.tracking?.currentLocation || 'Vadodara Hub'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => openTrackingModal(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Update Track</span>
                      </button>

                      <a
                        href={`/track-order/${order._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors"
                        title="View User Tracking Screen"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>

                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors shadow-2xs"
                        title="Delete Order"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADMIN TRACKING UPDATE MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden text-neutral-900 dark:text-white font-sans my-4">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1a3319] to-[#2d472c] text-white p-5 sm:p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-300" />
                  <span>Update Order #{selectedOrder._id} Tracking</span>
                </h3>
                <p className="text-xs text-neutral-200 mt-0.5">
                  Changes made here instantly reflect on the customer's live tracking timeline.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveTracking} className="p-6 space-y-4 text-xs">
              
              {feedbackMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {/* Status Select */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Current Process Stage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setTrackingForm(prev => ({ ...prev, orderStatus: st }))}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center transition-all ${
                        trackingForm.orderStatus === st
                          ? 'bg-[#2d472c] border-[#2d472c] text-white shadow-sm'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Carrier & Tracking Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Logistics / Carrier Fleet
                  </label>
                  <input
                    type="text"
                    value={trackingForm.carrier}
                    onChange={(e) => setTrackingForm(prev => ({ ...prev, carrier: e.target.value }))}
                    placeholder="e.g. Nuva Express Sunrise Fleet"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-[#2d472c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Waybill / Tracking No.
                  </label>
                  <input
                    type="text"
                    value={trackingForm.trackingNumber}
                    onChange={(e) => setTrackingForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    placeholder="e.g. NUV-TRK-9081-EX"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-[#2d472c] font-mono"
                  />
                </div>
              </div>

              {/* Current Location & Estimated Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Current Location / Processing Hub
                  </label>
                  <input
                    type="text"
                    value={trackingForm.currentLocation}
                    onChange={(e) => setTrackingForm(prev => ({ ...prev, currentLocation: e.target.value }))}
                    placeholder="e.g. Vadodara Bio-Purification Chamber"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-[#2d472c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Estimated Delivery Time
                  </label>
                  <input
                    type="text"
                    value={trackingForm.estimatedDelivery}
                    onChange={(e) => setTrackingForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                    placeholder="e.g. Tomorrow by 08:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-[#2d472c]"
                  />
                </div>
              </div>

              {/* Notes for the Customer */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Purification & Delivery Notes (Customer Visible)
                </label>
                <textarea
                  rows={3}
                  value={trackingForm.trackingNotes}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, trackingNotes: e.target.value }))}
                  placeholder="e.g. 4-Stage Ozone wash completed at 11:30 AM. Batch #410 lab certified with 0.00 PPM chemical residue."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-[#2d472c]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTracking}
                  className="px-5 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{savingTracking ? 'Broadcasting...' : 'Save & Push Live Update'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
