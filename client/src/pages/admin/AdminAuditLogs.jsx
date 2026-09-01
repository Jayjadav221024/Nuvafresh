import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import API from '../../api/axiosInstance';

/* This screen used to render a hard-coded list that included a fake blocked
   sign-in attempt. A security log that invents events is worse than an empty
   one, so it now shows only what the server actually recorded. */
const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/admin/audit-logs');
        if (data.success) setLogs(data.logs || []);
      } catch (e) {
        setError(e?.response?.data?.message || 'Could not load audit logs.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatTime = (value) =>
    value
      ? new Date(value).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      : '—';

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

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-extrabold bg-neutral-100/70 dark:bg-neutral-800/60">
                <th className="py-3 px-3">Admin / User</th>
                <th className="py-3 px-3">Action Performed</th>
                <th className="py-3 px-3">IP & Device</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Security Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading audit trail…
                  </td>
                </tr>
              )}

              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    <ShieldCheck className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">No recorded activity</p>
                    <p className="text-[11px] mt-1">Administrative sign-ins and actions appear here as they happen.</p>
                  </td>
                </tr>
              )}

              {!loading && logs.map((log) => (
                <tr key={log._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="py-4 font-bold text-neutral-900 dark:text-white">
                    <div>{log.adminName || 'Administrator'}</div>
                    <div className="text-[10px] text-neutral-400 font-normal">{log.adminEmail}</div>
                  </td>
                  <td className="py-4 text-neutral-700 dark:text-neutral-300 font-medium">
                    {log.action}
                  </td>
                  <td className="py-4 text-neutral-500 font-mono text-[11px]">
                    <div>{log.ipAddress || '—'}</div>
                    <div className="text-[10px] text-neutral-400 truncate max-w-[220px]">{log.userAgent}</div>
                  </td>
                  <td className="py-4 text-neutral-500 font-mono text-[11px]">
                    {formatTime(log.createdAt)}
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
