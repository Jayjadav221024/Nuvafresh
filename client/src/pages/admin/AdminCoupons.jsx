import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Tag, Plus, Trash2, Search, Loader2, Check, AlertCircle, SlidersHorizontal,
  ChevronLeft, ChevronRight, Percent
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';

const STATUS_TABS = ['All', 'Active', 'Scheduled', 'Expired'];

const statusStyles = {
  Active: 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300',
  Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  Expired: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Disabled: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
};

/* Same sentence the editor's summary shows, so the list and the detail
   page describe a discount identically. */
const describe = (c) => {
  const value = c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`;
  const scope = c.discountClass === 'shipping'
    ? 'shipping'
    : c.discountClass === 'product'
      ? 'products'
      : 'entire order';

  const min = c.minimumRequirement === 'amount' && c.minOrderValue
    ? ` · min ₹${c.minOrderValue}`
    : c.minimumRequirement === 'quantity' && c.minQuantity
      ? ` · min ${c.minQuantity} items`
      : '';

  return `${value} ${scope}${min}`;
};

const AdminCoupons = () => {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('All');
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const { data } = await API.get('/admin/coupons');
      if (data?.success) setCoupons(data.coupons || []);
    } catch (e) {
      showToast('error', 'Could not load discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} discount(s)?`)) return;
    await Promise.all(selected.map((id) => API.delete(`/admin/coupons/${id}`).catch(() => {})));
    publishStoreChange(STORE_TOPICS.DISCOUNTS);
    setSelected([]);
    await load();
    showToast('success', 'Discounts deleted');
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return coupons.filter((c) => {
      const matchTab = tab === 'All' || c.status === tab;
      const matchSearch = !q || c.code?.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [coupons, tab, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const activeCount = coupons.filter((c) => c.status === 'Active').length;

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">Discounts</h1>
        </div>

        <Link
          to="/admin/discounts/new"
          className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Create discount
        </Link>
      </div>

      {/* Metrics */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 gap-4 md:gap-0">
        <div className="px-3 space-y-1">
          <p className="text-xs text-neutral-500 font-medium">Active discounts</p>
          <p className="text-sm font-bold">{activeCount}</p>
        </div>
        <div className="px-3 space-y-1">
          <p className="text-xs text-neutral-500 font-medium">Total redemptions</p>
          <p className="text-sm font-bold">{totalRedemptions}</p>
        </div>
        <div className="px-3 space-y-1">
          <p className="text-xs text-neutral-500 font-medium">All discounts</p>
          <p className="text-sm font-bold">{coupons.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-2.5 px-3 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {STATUS_TABS.map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setCurrentPage(1); }}
                className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${
                  tab === t
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}

            <div className="relative flex-1 max-w-sm flex items-center ml-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 text-neutral-400 pointer-events-none" />
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search discounts"
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete ({selected.length})
            </button>
          )}

          <button className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0" title="Columns">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-xs text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading discounts…
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Percent className="h-8 w-8 text-neutral-300 mx-auto" />
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {searchTerm || tab !== 'All' ? 'No discounts match this filter' : 'No discounts yet'}
            </p>
            {!searchTerm && tab === 'All' && (
              <Link to="/admin/discounts/new" className="text-xs font-bold text-[#005bd3] hover:underline">
                Create your first discount
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                  <th className="py-2.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={(e) => setSelected(e.target.checked ? paginated.map((c) => c._id) : [])}
                      className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-4">Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                {paginated.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/admin/discounts/${c._id}`)}
                    className="cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(c._id)}
                        onChange={() =>
                          setSelected((prev) =>
                            prev.includes(c._id) ? prev.filter((i) => i !== c._id) : [...prev, c._id]
                          )
                        }
                        className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold font-mono text-[#1a1a1a] dark:text-white hover:underline">
                        {c.code}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{describe(c)}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyles[c.status] || statusStyles.Active}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400 capitalize">
                      {c.method === 'automatic' ? 'Automatic' : 'Code'}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      {c.discountClass === 'shipping'
                        ? 'Shipping discount'
                        : c.discountClass === 'product'
                          ? 'Product discount'
                          : 'Order discount'}
                    </td>
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 font-medium">
                      {c.usedCount || 0}
                      {c.limitTotalUses && c.usageLimit ? ` / ${c.usageLimit}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > itemsPerPage && (
          <div className="p-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center gap-1 text-xs text-neutral-500">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <span className="ml-2 font-medium">
              {(currentPage - 1) * itemsPerPage + 1}–{Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length}
            </span>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#1a1a1a] text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-400" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
