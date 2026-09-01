import React, { useState, useEffect } from 'react';
import { MailCheck, Download, Loader2, AlertCircle } from 'lucide-react';
import API from '../../api/axiosInstance';

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await API.get('/admin/newsletter');
      if (data.success) setSubscribers(data.subscribers || []);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load subscribers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  /* Opting someone out has to reach the database. Dropping the row from local
     state alone meant the address stayed subscribed on the server. */
  const handleUnsubscribe = async (subscriber) => {
    if (!window.confirm(`Unsubscribe ${subscriber.email}?`)) return;

    const previous = subscribers;
    setSubscribers(subscribers.map(s =>
      s._id === subscriber._id ? { ...s, status: 'Unsubscribed' } : s
    ));

    try {
      await API.patch(`/admin/newsletter/${subscriber._id}/status`, { status: 'Unsubscribed' });
    } catch (e) {
      setSubscribers(previous);
      setError(e?.response?.data?.message || 'Could not update that subscriber.');
    }
  };

  const handleExportCSV = () => {
    const rows = subscribers.map(s =>
      [s.email, s.source || 'Footer', formatDate(s.createdAt), s.status].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,'
      + ['Email,Source,Subscribed Date,Status', ...rows].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'nuva_newsletter_subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Opted-in email subscribers for farm harvest updates, weekly combo promos, and new season alerts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Export Audience CSV</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-extrabold bg-neutral-100/70 dark:bg-neutral-800/60">
                <th className="py-3 px-3">Subscriber Email</th>
                <th className="py-3 px-3">Signup Source</th>
                <th className="py-3 px-3">Opt-in Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading subscribers…
                  </td>
                </tr>
              )}

              {!loading && subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    <MailCheck className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">No subscribers yet</p>
                    <p className="text-[11px] mt-1">Footer and checkout opt-ins land here.</p>
                  </td>
                </tr>
              )}

              {!loading && subscribers.map((sub) => {
                const active = sub.status === 'Subscribed';
                return (
                  <tr key={sub._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="py-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <MailCheck className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-600' : 'text-neutral-400'}`} />
                      <span>{sub.email}</span>
                    </td>
                    <td className="py-4 text-neutral-600 dark:text-neutral-400 font-medium">
                      {sub.source || 'Footer'}
                    </td>
                    <td className="py-4 text-neutral-500 font-mono text-[11px]">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {active && (
                        <button
                          onClick={() => handleUnsubscribe(sub)}
                          className="text-xs text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Opt this address out"
                        >
                          Unsubscribe
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminNewsletter;
