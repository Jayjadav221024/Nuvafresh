import React, { useState } from 'react';
import { MailCheck, Download, Trash2, Calendar, ShieldCheck } from 'lucide-react';

const SEED_SUBSCRIBERS = [
  { id: 'sub-1', email: 'ananya.sharma@gmail.com', source: 'Footer Newsletter', date: 'Today, 08:30 AM', status: 'Subscribed' },
  { id: 'sub-2', email: 'harsh.shah@yahoo.com', source: 'Homepage Popover', date: 'Yesterday', status: 'Subscribed' },
  { id: 'sub-3', email: 'priya.nair@hotmail.com', source: 'Checkout Opt-in', date: 'Aug 23, 2026', status: 'Subscribed' },
  { id: 'sub-4', email: 'deepak.patel@gmail.com', source: 'Footer Newsletter', date: 'Aug 20, 2026', status: 'Subscribed' },
  { id: 'sub-5', email: 'sanjana.desai@outlook.com', source: 'Blog Post Sidebar', date: 'Aug 17, 2026', status: 'Subscribed' },
];

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState(SEED_SUBSCRIBERS);

  const handleUnsubscribe = (id) => {
    setSubscribers(subscribers.filter(s => s.id !== id));
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Email,Source,Subscribed Date,Status"].concat(subscribers.map(s => `${s.email},${s.source},${s.date},${s.status}`)).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nuva_newsletter_subscribers.csv");
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
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="py-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <MailCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{sub.email}</span>
                  </td>
                  <td className="py-4 text-neutral-600 dark:text-neutral-400 font-medium">
                    {sub.source}
                  </td>
                  <td className="py-4 text-neutral-500 font-mono text-[11px]">
                    {sub.date}
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleUnsubscribe(sub.id)}
                      className="text-xs text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Remove Subscriber"
                    >
                      Unsubscribe
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

export default AdminNewsletter;
