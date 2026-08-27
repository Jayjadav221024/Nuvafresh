import React, { useState } from 'react';
import { Shield, CheckCircle2, Clock, MapPin, User, Laptop } from 'lucide-react';

const SEED_LOGS = [
  { id: 'log-1', admin: 'Aanshi Patel (Founder)', email: 'aanshi@nuvanutrition.com', action: 'Modified Hero Category Banner copy', ip: '103.212.145.22', location: 'Vadodara, India', time: 'Today, 11:20 AM', status: 'Success' },
  { id: 'log-2', admin: 'Jay Jadav (SuperAdmin)', email: 'admin@thenuva.com', action: 'Batch imported 335 CSV product SKUs & O3 tags', ip: '127.0.0.1', location: 'Local Workspace', time: 'Today, 11:37 AM', status: 'Success' },
  { id: 'log-3', admin: 'Jay Jadav (SuperAdmin)', email: 'admin@thenuva.com', action: 'Approved 2 customer product UGC reviews', ip: '127.0.0.1', location: 'Local Workspace', time: 'Today, 11:51 AM', status: 'Success' },
  { id: 'log-4', admin: 'Operations Staff', email: 'ops@nuvanutrition.com', action: 'Updated shipment tracking for Order #NV-88291', ip: '49.36.120.89', location: 'Anand Unit, India', time: 'Yesterday, 04:15 PM', status: 'Success' },
  { id: 'log-5', admin: 'Unknown Session', email: 'unknown@external.net', action: 'Failed password attempt on /admin/login', ip: '185.220.101.5', location: 'Frankfurt, DE', time: 'Aug 23, 02:40 AM', status: 'Blocked (401)' }
];

const AdminAuditLogs = () => {
  const [logs] = useState(SEED_LOGS);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
          Sign-In & System Audit Logs
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Immutable server-side audit logs capturing administrative actions, IP addresses, and session authenticity.
        </p>
      </div>

      {/* Audit Logs Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-extrabold bg-neutral-100/70 dark:bg-neutral-800/60">
                <th className="py-3 px-3">Admin / User</th>
                <th className="py-3 px-3">Action Performed</th>
                <th className="py-3 px-3">IP & Location</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Security Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="py-4 font-bold text-neutral-900 dark:text-white">
                    <div>{log.admin}</div>
                    <div className="text-[10px] text-neutral-400 font-normal">{log.email}</div>
                  </td>
                  <td className="py-4 text-neutral-700 dark:text-neutral-300 font-medium">
                    {log.action}
                  </td>
                  <td className="py-4 text-neutral-500 font-mono text-[11px]">
                    <div>{log.ip}</div>
                    <div className="text-[10px] text-neutral-400">{log.location}</div>
                  </td>
                  <td className="py-4 text-neutral-500 font-mono text-[11px]">
                    {log.time}
                  </td>
                  <td className="py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      log.status === 'Success'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {log.status}
                    </span>
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

export default AdminAuditLogs;
