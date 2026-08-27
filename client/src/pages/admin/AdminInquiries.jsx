import React, { useState } from 'react';
import { MessageSquare, Mail, Phone, Calendar, CheckCircle2, Clock } from 'lucide-react';

const SEED_INQUIRIES = [
  { _id: 'inq-1', name: 'Dr. Sameer Joshi', email: 'dr.sameer@gmail.com', phone: '+91 98251 90890', message: 'Do you deliver cold-pressed oils and A2 ghee bulk orders to medical wellness centers in Ahmedabad?', status: 'Unread', createdAt: 'Today, 10:15 AM' },
  { _id: 'inq-2', name: 'Meera Trivedi', email: 'meera.t@gmail.com', phone: '+91 94280 44556', message: 'Wanted to inquire about your ozone washing machinery for farm produce visit in Anand unit.', status: 'Replied', createdAt: 'Yesterday' },
  { _id: 'inq-3', name: 'Rajesh Solanki', email: 'rajesh.organic@hotmail.com', phone: '+91 98790 11223', message: 'Interested in partnering as a certified regenerative farmer for Khapli wheat supply.', status: 'Read', createdAt: 'Aug 22, 2026' }
];

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState(SEED_INQUIRIES);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const toggleStatus = (id, newStatus) => {
    setInquiries(inquiries.map(i => i._id === id ? { ...i, status: newStatus } : i));
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
              {inquiries.map((inq) => (
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
                    {inq.createdAt}
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
