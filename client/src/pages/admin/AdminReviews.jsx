import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const { data } = await API.get('/admin/reviews');
      if (data.success) setReviews(data.reviews || []);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* Approving here publishes the review onto the product page, so the
     storefront is told to refetch as soon as the write lands. */
  const handleStatusChange = async (id, newStatus) => {
    const previous = reviews;
    setBusyId(id);
    setReviews(reviews.map(r => r._id === id ? { ...r, status: newStatus } : r));

    try {
      await API.patch(`/admin/reviews/${id}/status`, { status: newStatus });
      publishStoreChange(STORE_TOPICS.REVIEWS);
    } catch (e) {
      setReviews(previous);
      setError(e?.response?.data?.message || 'Could not update that review.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (rev) => {
    if (!window.confirm(`Delete the review from ${rev.customerName}? This cannot be undone.`)) return;

    const previous = reviews;
    setBusyId(rev._id);
    setReviews(reviews.filter(r => r._id !== rev._id));

    try {
      await API.delete(`/admin/reviews/${rev._id}`);
      publishStoreChange(STORE_TOPICS.REVIEWS);
    } catch (e) {
      setReviews(previous);
      setError(e?.response?.data?.message || 'Could not delete that review.');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = filter === 'All' ? reviews : reviews.filter(r => r.status === filter);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Customer Reviews & UGC Moderation
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review and moderate verified customer feedback before publishing to live product landing pages.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl">
          {['All', 'Approved', 'Pending', 'Hidden'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab ? 'bg-[#2d472c] text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {/* Reviews Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-extrabold bg-neutral-100/70 dark:bg-neutral-800/60">
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Review Feedback</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading reviews…
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <ShieldCheck className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {filter === 'All' ? 'No customer reviews yet' : `No ${filter.toLowerCase()} reviews`}
                    </p>
                    <p className="text-[11px] mt-1">
                      Reviews submitted on a product page land here for moderation.
                    </p>
                  </td>
                </tr>
              )}

              {!loading && filtered.map((rev) => (
                <tr key={rev._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="py-4 font-bold text-neutral-900 dark:text-white max-w-[180px] truncate">
                    {rev.productTitle}
                  </td>
                  <td className="py-4 text-neutral-700 dark:text-neutral-300 font-medium">
                    {rev.customerName}
                  </td>
                  <td className="py-4">
                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 max-w-[280px]">
                    <p className="font-bold text-neutral-900 dark:text-white line-clamp-1">{rev.title}</p>
                    <p className="text-neutral-500 text-[11px] line-clamp-2 mt-0.5">{rev.comment}</p>
                  </td>
                  <td className="py-4 text-neutral-400 font-mono text-[11px]">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      rev.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : rev.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {rev.status}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-1.5">
                    {rev.status !== 'Approved' && (
                      <button
                        onClick={() => handleStatusChange(rev._id, 'Approved')}
                        disabled={busyId === rev._id}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== 'Hidden' && (
                      <button
                        onClick={() => handleStatusChange(rev._id, 'Hidden')}
                        disabled={busyId === rev._id}
                        className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium disabled:opacity-50"
                      >
                        Hide
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(rev)}
                      disabled={busyId === rev._id}
                      className="px-2.5 py-1 rounded-lg text-neutral-400 hover:text-rose-600 text-[11px] font-medium disabled:opacity-50"
                      title="Delete permanently"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminReviews;
