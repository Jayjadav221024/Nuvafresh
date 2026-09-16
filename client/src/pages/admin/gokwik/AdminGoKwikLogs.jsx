import React, { useState, useEffect } from 'react';
import {
  FileText, RefreshCw, CheckCircle2, AlertCircle, Info, ShieldCheck, ShieldAlert
} from 'lucide-react';
import API from '../../../api/axiosInstance';
import { TableCard, Badge, SecondaryButton, LoadingRow, EmptyRow } from '../../../components/admin/ui';

const AdminGoKwikLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async (type = filterType) => {
    try {
      const url = type === 'all' ? '/gokwik/logs?limit=50' : `/gokwik/logs?limit=50&type=${type}`;
      const res = await API.get(url);
      if (res.data?.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch GoKwik activity logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(filterType);
  }, [filterType]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs(filterType);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            GoKwik Integration & Activity Logs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Real-time audit log of API communications, webhook triggers, connection tests, and setting changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
          >
            <option value="all">All Events</option>
            <option value="API_REQUEST">API Requests</option>
            <option value="WEBHOOK">Webhooks</option>
            <option value="CONFIG_CHANGE">Config Changes</option>
            <option value="CONNECTION_TEST">Connection Tests</option>
            <option value="ERROR">Errors</option>
          </select>

          <SecondaryButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </SecondaryButton>
        </div>
      </div>

      {/* Logs Table */}
      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 bg-[#f7f7f7] dark:bg-[#202020] text-neutral-600 dark:text-neutral-400 font-semibold">
                <th className="py-2.5 px-4">Event</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Reference ID</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4">Author</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {loading ? (
                <LoadingRow colSpan={7} label="Loading activity logs..." />
              ) : logs.length === 0 ? (
                <EmptyRow
                  colSpan={7}
                  icon={FileText}
                  title="No activity logs recorded yet"
                  hint="Events will automatically populate as GoKwik APIs, settings, and webhooks are triggered."
                />
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                      {log.event}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 'Success' ? (
                        <Badge tone="success">Success</Badge>
                      ) : log.status === 'Failed' ? (
                        <Badge tone="warning">Failed</Badge>
                      ) : (
                        <Badge tone="neutral">{log.status}</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400 text-[11px]">
                      {log.referenceId || '—'}
                    </td>
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 max-w-md truncate">
                      {log.details || '—'}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 font-medium">
                      {log.author || 'System'}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableCard>
    </div>
  );
};

export default AdminGoKwikLogs;
