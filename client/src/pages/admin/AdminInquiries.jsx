import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader2, AlertCircle, Inbox } from 'lucide-react';
import API from '../../api/axiosInstance';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await API.get('/admin/inquiries');
      if (data.success) setInquiries(data.inquiries || []);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Marking an inquiry replied has to persist, or the next person to open this
  // screen sees an inbox that has forgotten every reply already sent.
  const toggleStatus = async (id, newStatus) => {
    const previous = inquiries;
    setInquiries(inquiries.map(i => i._id === id ? { ...i, status: newStatus } : i));

    try {
      await API.patch(`/admin/inquiries/${id}/status`, { status: newStatus });
    } catch (e) {
      setInquiries(previous);
      setError(e?.response?.data?.message || 'Could not update that inquiry.');
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Customer Inquiries (Contact Form)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Incoming inquiries from the Contact Us page, questions regarding processing units, and B2B partnership requests.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {/* Inquiries Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-extrabold bg-neutral-100/70 dark:bg-neutral-800/60">
                <th className="py-3 px-3">Sender Name</th>
                <th className="py-3 px-3">Contact Details</th>
                <th className="py-3 px-3">Inquiry Message</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading inquiries…
                  </td>
                </tr>
              )}

              {!loading && inquiries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <Inbox className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">No inquiries yet</p>
                    <p className="text-[11px] mt-1">
                      Messages from the Contact and B2B forms arrive here.
                    </p>
                  </td>
                </tr>
              )}

              {!loading && inquiries.map((inq) => (
                <tr key={inq._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="py-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#2d472c] dark:text-emerald-400 shrink-0" />
                    <span>{inq.name}</span>
                  </td>
                  <td className="py-4 text-neutral-600 dark:text-neutral-400">
                    <div>{inq.email}</div>
                    <div className="text-[10px] text-neutral-400">{inq.phone}</div>
                  </td>
                  <td className="py-4 max-w-[320px] text-neutral-700 dark:text-neutral-300">
                    <p className="line-clamp-2 leading-relaxed">{inq.message}</p>
                  </td>
                  <td className="py-4 text-neutral-500 font-mono text-[11px]">
                    {formatDate(inq.createdAt)}
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inq.status === 'Unread' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : inq.status === 'Replied' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {inq.status}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-1.5">
                    <a
                      href={`mailto:${inq.email}?subject=Response from Nuva Nutrition`}
                      onClick={() => toggleStatus(inq._id, 'Replied')}
                      className="inline-block px-3 py-1 rounded-lg bg-[#2d472c] hover:bg-[#20341f] text-white text-[11px] font-bold shadow-sm"
                    >
                      Reply via Email
                    </a>
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

export default AdminInquiries;
