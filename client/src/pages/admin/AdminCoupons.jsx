import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import API from '../../api/axiosInstance';

const SEED_COUPONS = [
  { _id: 'c-1', code: 'WELCOME10', type: 'percentage', value: 10, minOrderValue: 299, usageLimit: 5000, usedCount: 342, status: 'Active', validTo: '2026-12-31' },
  { _id: 'c-2', code: 'OZONEPURITY', type: 'flat', value: 100, minOrderValue: 999, usageLimit: 1000, usedCount: 189, status: 'Active', validTo: '2026-10-15' },
  { _id: 'c-3', code: 'FREESHIP500', type: 'flat', value: 50, minOrderValue: 499, usageLimit: 2000, usedCount: 612, status: 'Active', validTo: '2026-11-30' },
  { _id: 'c-4', code: 'FARMFRESH15', type: 'percentage', value: 15, minOrderValue: 1499, usageLimit: 500, usedCount: 500, status: 'Expired', validTo: '2026-07-31' },
];

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState(SEED_COUPONS);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    minOrderValue: 499,
    usageLimit: 1000,
    validTo: '2026-12-31'
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/coupons');
      if (data.success && data.coupons && data.coupons.length > 0) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.warn('Coupon fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      ...newCoupon,
      code: newCoupon.code.toUpperCase().trim(),
      value: Number(newCoupon.value),
      minOrderValue: Number(newCoupon.minOrderValue) || 0,
      usageLimit: Number(newCoupon.usageLimit) || 1000,
      status: 'Active'
    };

    try {
      const { data } = await API.post('/admin/coupons', payload);
      if (data.success && data.coupon) {
        setCoupons([data.coupon, ...coupons]);
      } else {
        setCoupons([{ _id: `c-${Date.now()}`, ...payload, usedCount: 0 }, ...coupons]);
      }
    } catch (err) {
      setCoupons([{ _id: `c-${Date.now()}`, ...payload, usedCount: 0 }, ...coupons]);
    }
    setShowModal(false);
    setNewCoupon({ code: '', type: 'percentage', value: 10, minOrderValue: 499, usageLimit: 1000, validTo: '2026-12-31' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this coupon?')) {
      try {
        await API.delete(`/admin/coupons/${id}`);
        setCoupons(coupons.filter(c => c._id !== id && c.id !== id));
      } catch (e) {
        setCoupons(coupons.filter(c => c._id !== id && c.id !== id));
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Coupons & Discounts
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage promotional coupon codes, percentage discounts, minimum cart value requirements, and usage limits.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-extrabold bg-neutral-100/70 dark:bg-neutral-800/60">
                <th className="py-3 px-3">Coupon Code</th>
                <th className="py-3 px-3">Type & Discount</th>
                <th className="py-3 px-3">Min Order Value</th>
                <th className="py-3 px-3">Usage Progress</th>
                <th className="py-3 px-3">Valid Until</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {coupons.map((c) => (
                <tr key={c._id || c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="py-4 font-black text-sm text-[#2d472c] dark:text-emerald-400 font-mono flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    <span>{c.code}</span>
                  </td>
                  <td className="py-4 font-semibold text-neutral-800 dark:text-neutral-200">
                    {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} Flat OFF`}
                  </td>
                  <td className="py-4 text-neutral-600 dark:text-neutral-400 font-medium">
                    ₹{c.minOrderValue}
                  </td>
                  <td className="py-4 text-neutral-700 dark:text-neutral-300">
                    <span className="font-bold">{c.usedCount || 0}</span> / {c.usageLimit || 1000} uses
                  </td>
                  <td className="py-4 text-neutral-500 font-mono">
                    {c.validTo ? new Date(c.validTo).toLocaleDateString() : (c.validTill || 'Lifetime')}
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDelete(c._id || c.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display">Create Promotional Coupon</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Coupon Code (Uppercase):</label>
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-mono uppercase bg-white dark:bg-neutral-800 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Discount Type:</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-800 mt-1"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Discount Value:</label>
                  <input
                    type="number"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-800 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Min Cart Value (₹):</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-800 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Max Usage Limit:</label>
                  <input
                    type="number"
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-800 mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCoupons;
