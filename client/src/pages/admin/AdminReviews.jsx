import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, EyeOff, ShieldCheck, Search, Filter } from 'lucide-react';
import API from '../../api/axiosInstance';

const SEED_REVIEWS = [
  { _id: 'r-1', productTitle: 'Desi Gir Cow A2 Bilona Cultured Ghee (500ml)', customerName: 'Aarav Mehta', rating: 5, title: 'Incredible aroma and pure golden granulations!', comment: 'The aroma when opening the jar is authentic Vedic bilona. Nothing like store bought ghee.', status: 'Approved', createdAt: '2026-08-24' },
  { _id: 'r-2', productTitle: 'Hydro-Cleaned Crisp Baby Spinach', customerName: 'Pooja Sharma', rating: 5, title: 'Super fresh, zero dirt or pesticides', comment: 'Leaves were crisp and completely ready to eat. Very happy with the ozone wash purity.', status: 'Approved', createdAt: '2026-08-23' },
  { _id: 'r-3', productTitle: 'Wood Cold-Pressed Mustard Oil', customerName: 'Ramesh Patel', rating: 4, title: 'Great strong aroma for pickles', comment: 'Authentic kachi ghani pungency. Delivered in glass bottle nicely packed.', status: 'Pending', createdAt: '2026-08-25' },
  { _id: 'r-4', productTitle: 'Ancient Emmer Khapli Wheat Atta', customerName: 'Neha Dave', rating: 5, title: 'Rotis stay soft for hours', comment: 'Extremely easy to digest. Great for diabetic diet.', status: 'Approved', createdAt: '2026-08-21' },
];

const AdminReviews = () => {
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [filter, setFilter] = useState('All');

  const handleStatusChange = (id, newStatus) => {
    setReviews(reviews.map(r => r._id === id ? { ...r, status: newStatus } : r));
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
              {filtered.map((rev) => (
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
                    {rev.createdAt}
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
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== 'Hidden' && (
                      <button
                        onClick={() => handleStatusChange(rev._id, 'Hidden')}
                        className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium"
                      >
                        Hide
                      </button>
                    )}
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
