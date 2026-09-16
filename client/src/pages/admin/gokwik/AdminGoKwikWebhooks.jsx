import React, { useState, useEffect } from 'react';
import {
  Webhook, RefreshCw, CheckCircle2, AlertCircle, Copy, Check, Eye, Code, ExternalLink, ShieldCheck
} from 'lucide-react';
import API from '../../../api/axiosInstance';
import { TableCard, Badge, SecondaryButton, Modal, EmptyRow, LoadingRow, Pagination } from '../../../components/admin/ui';

const AdminGoKwikWebhooks = () => {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const webhookEndpoint = `${window.location.origin}/api/gokwik/webhook`;

  const fetchWebhooks = async (pageNum = 1) => {
    try {
      const res = await API.get(`/gokwik/webhooks?page=${pageNum}&limit=10`);
      if (res.data?.success) {
        setEvents(res.data.events || []);
        setTotal(res.data.total || 0);
        setMeta(res.data.meta || {});
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWebhooks(1);
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(webhookEndpoint);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWebhooks(page);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Webhook Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Real-time webhook callback listener, HMAC authentication, payload inspector, and event status.
          </p>
        </div>

        <SecondaryButton onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </SecondaryButton>
      </div>

      {/* Webhook Endpoint Banner */}
      <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-neutral-900 dark:text-white">Inbound Webhook URL</span>
          </div>
          <Badge tone="success">Active & Listening</Badge>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={webhookEndpoint}
            className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs font-mono text-neutral-800 dark:text-neutral-200 select-all"
          />
          <SecondaryButton onClick={handleCopyUrl}>
            {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
          </SecondaryButton>
        </div>
        <p className="text-[11px] text-neutral-500">
          Paste this endpoint inside your GoKwik Merchant Dashboard under <span className="font-semibold text-neutral-700 dark:text-neutral-300">Settings → Webhooks</span>.
        </p>
      </section>

      {/* Status Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500">Total Events Received</span>
          <div className="text-lg font-bold text-neutral-900 dark:text-white mt-1">{total}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500">Last Event Name</span>
          <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white mt-1 truncate">
            {meta.lastEventName || 'None'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500">Last Successful Callback</span>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {meta.lastSuccessAt ? new Date(meta.lastSuccessAt).toLocaleTimeString('en-IN') : 'No events yet'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500">Last Failed Callback</span>
          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
            {meta.lastFailedAt ? new Date(meta.lastFailedAt).toLocaleTimeString('en-IN') : 'None'}
          </div>
        </div>
      </div>

      {/* Webhooks History Table */}
      <TableCard>
        <div className="px-4 py-3.5 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Webhook Delivery Log</h2>
          <span className="text-[11px] font-semibold text-neutral-500">{total} total events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 bg-[#f7f7f7] dark:bg-[#202020] text-neutral-600 dark:text-neutral-400 font-semibold">
                <th className="py-2.5 px-4">Event ID</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">GoKwik Order ID</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {loading ? (
                <LoadingRow colSpan={6} label="Loading webhook logs..." />
              ) : events.length === 0 ? (
                <EmptyRow
                  colSpan={6}
                  icon={Webhook}
                  title="No webhook events recorded yet"
                  hint="When GoKwik fires payment or status callbacks, verified events will appear here."
                />
              ) : (
                events.map((evt) => (
                  <tr key={evt._id || evt.eventId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[150px]">
                      {evt.eventId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold">
                        {evt.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                      {evt.gokwikOrderId || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {evt.status === 'Success' ? (
                        <Badge tone="success">Success</Badge>
                      ) : evt.status === 'Failed' ? (
                        <Badge tone="warning">Failed</Badge>
                      ) : (
                        <Badge tone="neutral">{evt.status}</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-[11px]">
                      {new Date(evt.createdAt || evt.processedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View JSON</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 10 && (
          <Pagination
            page={page}
            pageSize={10}
            total={total}
            totalPages={Math.ceil(total / 10)}
            onChange={(newPage) => fetchWebhooks(newPage)}
            unit="events"
          />
        )}
      </TableCard>

      {/* Payload Inspector Modal */}
      {selectedEvent && (
        <Modal
          title={`Webhook Event: ${selectedEvent.eventType}`}
          onClose={() => setSelectedEvent(null)}
          width="max-w-2xl"
          footer={
            <SecondaryButton onClick={() => setSelectedEvent(null)}>
              Close
            </SecondaryButton>
          }
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-neutral-500 block">Event ID</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{selectedEvent.eventId}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">GoKwik Order ID</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{selectedEvent.gokwikOrderId || '—'}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Raw Payload</span>
              <pre className="p-3.5 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto max-h-72 border border-neutral-800">
                {JSON.stringify(selectedEvent.payload, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminGoKwikWebhooks;
