import React, { useState, useEffect } from 'react';
import {
  Search, Filter, ShoppingBag, Eye, RefreshCw, X, ShieldAlert, ShieldCheck, Download
} from 'lucide-react';
import API from '../../../api/axiosInstance';
import {
  TableCard, Badge, SecondaryButton, PrimaryButton, Modal, LoadingRow, EmptyRow, Pagination
} from '../../../components/admin/ui';

const AdminGoKwikOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (pageNum = 1) => {
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 15,
        search,
        paymentStatus,
        paymentMethod,
        riskLevel
      });
      const res = await API.get(`/gokwik/orders?${params.toString()}`);
      if (res.data?.success) {
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch GoKwik orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [paymentStatus, paymentMethod, riskLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(page);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            GoKwik Orders
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Real orders captured and synchronized through the GoKwik checkout engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SecondaryButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </SecondaryButton>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, buyer, phone..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] text-xs outline-none focus:border-[#005bd3]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
          >
            <option value="all">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
          >
            <option value="all">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="COD">COD</option>
            <option value="CARD">Card</option>
            <option value="NETBANKING">NetBanking</option>
          </select>

          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 bg-[#f7f7f7] dark:bg-[#202020] text-neutral-600 dark:text-neutral-400 font-semibold">
                <th className="py-2.5 px-4">GoKwik Order ID</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Payment</th>
                <th className="py-2.5 px-4">RTO Risk</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {loading ? (
                <LoadingRow colSpan={8} label="Loading GoKwik orders..." />
              ) : orders.length === 0 ? (
                <EmptyRow
                  colSpan={8}
                  icon={ShoppingBag}
                  title="No GoKwik orders found"
                  hint="Try altering your search query or filter selections."
                />
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id || ord.gokwikOrderId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                      {ord.gokwikOrderId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">{ord.customer?.name || 'Customer'}</div>
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
                        {ord.rtoRiskScore?.level || 'Low'}
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
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 15 && (
          <Pagination
            page={page}
            pageSize={15}
            total={total}
            totalPages={Math.ceil(total / 15)}
            onChange={(newPage) => fetchOrders(newPage)}
            unit="orders"
          />
        )}
      </TableCard>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          title={`Order: ${selectedOrder.gokwikOrderId}`}
          onClose={() => setSelectedOrder(null)}
          width="max-w-2xl"
          footer={
            <SecondaryButton onClick={() => setSelectedOrder(null)}>
              Close
            </SecondaryButton>
          }
        >
          <div className="space-y-4 text-xs font-sans">
            {/* Customer Details */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Customer</h4>
              <div className="grid grid-cols-2 gap-2 text-neutral-700 dark:text-neutral-300">
                <div><span className="text-neutral-400">Name:</span> {selectedOrder.customer?.name}</div>
                <div><span className="text-neutral-400">Phone:</span> {selectedOrder.customer?.phone || '—'}</div>
                <div><span className="text-neutral-400">Email:</span> {selectedOrder.customer?.email || '—'}</div>
                <div><span className="text-neutral-400">City:</span> {selectedOrder.customer?.address?.city || '—'}</div>
              </div>
            </div>

            {/* Payment & Risk Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Payment</h4>
                <div><span className="text-neutral-400">Method:</span> <span className="font-semibold">{selectedOrder.paymentMethod}</span></div>
                <div><span className="text-neutral-400">Status:</span> <span className="font-semibold">{selectedOrder.paymentStatus}</span></div>
                <div><span className="text-neutral-400">Total:</span> <span className="font-bold text-neutral-900 dark:text-white">₹{selectedOrder.totalAmount}</span></div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">RTO Risk</h4>
                <div><span className="text-neutral-400">Risk Tier:</span> <span className="font-bold">{selectedOrder.rtoRiskScore?.level || 'Low'}</span></div>
                <div><span className="text-neutral-400">Reason:</span> <span className="text-[11px]">{selectedOrder.rtoRiskScore?.reason || 'Verified'}</span></div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminGoKwikOrders;
