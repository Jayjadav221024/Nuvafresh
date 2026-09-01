import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Boxes, ArrowRight, MapPin, Plus, Trash2, PackageCheck,
  Search, ChevronDown, SlidersHorizontal, Loader2, AlertCircle
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange, subscribeToStoreChanges } from '../../lib/storeSync';

/* Transfer status → the badge tone Shopify would give it. */
const TRANSFER_TONES = {
  'Draft': 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  'In transit': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  'Partially received': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  'Received': 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300',
  'Cancelled': 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
};

const formatDay = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const AdminInventory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('view') === 'transfers' ? 'transfers' : 'inventory';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [transfersLoading, setTransfersLoading] = useState(true);
  const [receivingId, setReceivingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  /* Inventory is a view over the product catalogue, so this reads the same
     stock numbers the storefront sells against instead of a fixed list. */
  const load = async () => {
    try {
      const { data } = await API.get('/admin/inventory');
      if (data.success) setItems(data.items || []);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const loadTransfers = async () => {
    try {
      const { data } = await API.get('/transfers');
      setTransfers(data.transfers || []);
    } catch (e) {
      // Transfers are optional context on this screen; the stock table still works.
    } finally {
      setTransfersLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadTransfers();
    // A transfer created on the other screen changes what's incoming here.
    return subscribeToStoreChanges(STORE_TOPICS.INVENTORY, () => {
      load();
      loadTransfers();
    });
  }, []);

  /* Receiving counts the units in at the destination. Total on-hand doesn't
     move — the goods were always Nuva's, they were just somewhere else. */
  const handleReceive = async (transfer) => {
    setReceivingId(transfer._id);
    try {
      const { data } = await API.post(`/transfers/${transfer._id}/receive`, {});
      setTransfers((prev) => prev.map((t) => (t._id === transfer._id ? data.transfer : t)));
      publishStoreChange(STORE_TOPICS.INVENTORY);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not receive that transfer.');
    } finally {
      setReceivingId(null);
    }
  };

  const handleDeleteTransfer = async (transfer) => {
    if (!window.confirm(`Delete transfer ${transfer.reference}?`)) return;
    const previous = transfers;
    setTransfers(transfers.filter((t) => t._id !== transfer._id));
    try {
      await API.delete(`/transfers/${transfer._id}`);
      publishStoreChange(STORE_TOPICS.INVENTORY);
      load();
    } catch (e) {
      setTransfers(previous);
      setError(e?.response?.data?.message || 'Could not delete that transfer.');
    }
  };

  // Editing "On hand" writes straight through to the product's stock, which is
  // what the shop reads — so the change is live the moment it saves.
  const handleStockChange = async (item, nextValue) => {
    const onHand = Math.max(0, Number(nextValue) || 0);
    if (onHand === item.onHand) return;

    const previous = items;
    setSavingId(item._id);
    setItems(items.map((i) =>
      i._id === item._id
        ? { ...i, onHand, available: Math.max(0, onHand - i.committed) }
        : i
    ));

    try {
      await API.patch(`/admin/inventory/${item._id}`, { onHand });
      publishStoreChange([STORE_TOPICS.INVENTORY, STORE_TOPICS.PRODUCTS]);
    } catch (e) {
      setItems(previous);
      setError(e?.response?.data?.message || 'Could not update that stock level.');
    } finally {
      setSavingId(null);
    }
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredItems.map((_, i) => i));
    } else {
      setSelectedItems([]);
    }
  };

  const handleToggleSelect = (idx) => {
    if (selectedItems.includes(idx)) {
      setSelectedItems(selectedItems.filter(i => i !== idx));
    } else {
      setSelectedItems([...selectedItems, idx]);
    }
  };

  const query = searchTerm.trim().toLowerCase();
  const filteredItems = items.filter(item =>
    !query ||
    String(item.name || '').toLowerCase().includes(query) ||
    String(item.sku || '').toLowerCase().includes(query)
  );

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">
      
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER (Shopify Inventory View with Location Tag)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Boxes className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span>Inventory</span>
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-200/70 dark:bg-neutral-800 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer">
              Vadodara <ChevronDown className="h-3 w-3" />
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50">
            Export
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50">
            Import
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: TRANSFERS VIEW
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'transfers' ? (
        transfersLoading || transfers.length > 0 ? (
          /* ─────────────────────────────────────────────────────────
              TRANSFERS LIST
          ───────────────────────────────────────────────────────── */
          <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">
            <div className="p-2.5 px-3 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                All transfers
              </span>
              <button
                onClick={() => navigate('/admin/transfers/new')}
                className="px-3 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold transition-transform active:scale-95 shadow-xs flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create transfer</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                    <th className="py-2.5 px-4">Transfer</th>
                    <th className="py-2.5 px-3">Route</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Products</th>
                    <th className="py-2.5 px-3 text-right">Units</th>
                    <th className="py-2.5 px-3">Expected</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                  {transfersLoading && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Loading transfers…
                      </td>
                    </tr>
                  )}

                  {!transfersLoading && transfers.map((t) => {
                    const units = (t.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0);
                    const received = (t.items || []).reduce((s, i) => s + (Number(i.received) || 0), 0);
                    const settled = ['Received', 'Cancelled'].includes(t.status);
                    return (
                      <tr key={t._id} className="hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#1a1a1a] dark:text-white">{t.reference}</span>
                          {t.name && <span className="block text-[11px] text-neutral-500 truncate max-w-[180px]">{t.name}</span>}
                        </td>
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                            <span className="truncate max-w-[150px]">{t.origin?.name || '—'}</span>
                            <ArrowRight className="h-3 w-3 text-neutral-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{t.destination?.name || '—'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            TRANSFER_TONES[t.status] || TRANSFER_TONES.Draft
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-neutral-700 dark:text-neutral-300">
                          {(t.items || []).length}
                        </td>
                        <td className="py-3 px-3 text-right text-neutral-700 dark:text-neutral-300">
                          {received > 0 && received < units ? `${received} / ${units}` : units}
                        </td>
                        <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                          {formatDay(t.estimatedArrival)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            {!settled && (
                              <button
                                onClick={() => handleReceive(t)}
                                disabled={receivingId === t._id}
                                className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-[11px] font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-1"
                              >
                                {receivingId === t._id
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : <PackageCheck className="h-3 w-3" />}
                                Receive all
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTransfer(t)}
                              title="Delete transfer"
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-[#e1e1e1] dark:border-neutral-800 text-xs text-neutral-500 font-medium">
              {transfers.length} {transfers.length === 1 ? 'transfer' : 'transfers'}
            </div>
          </div>
        ) : (
        <div className="space-y-4">
          <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs flex flex-col items-center justify-center text-center min-h-[420px]">
            <div className="relative mb-6 flex items-center justify-center">
              <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <div className="w-20 h-24 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-between p-2 shadow-xs">
                  <div className="h-3.5 w-3.5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <MapPin className="h-2.5 w-2.5" />
                  </div>
                  <div className="w-10 h-10 rounded bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <Boxes className="h-5 w-5 text-neutral-500" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400">Hub A</span>
                </div>

                <div className="h-10 w-10 rounded-full bg-[#108043] text-white flex items-center justify-center shadow-md animate-pulse">
                  <ArrowRight className="h-5 w-5" />
                </div>

                <div className="w-20 h-24 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-between p-2 shadow-xs">
                  <div className="h-3.5 w-3.5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <MapPin className="h-2.5 w-2.5" />
                  </div>
                  <div className="w-10 h-10 rounded bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <Boxes className="h-5 w-5 text-neutral-500" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400">Hub B</span>
                </div>
              </div>
            </div>

            <h2 className="text-base font-bold text-[#1a1a1a] dark:text-white">
              Move inventory between locations
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md">
              Move and track ozone-certified vegetable produce, A2 ghee, and cold-pressed oils between your farm chambers and distribution hubs.
            </p>

            <button
              onClick={() => navigate('/admin/transfers/new')}
              className="mt-5 px-4 py-2 bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold rounded-lg transition-transform active:scale-95 shadow-xs flex items-center gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create transfer</span>
            </button>
          </div>
        </div>
        )
      ) : (
        /* ─────────────────────────────────────────────────────────────
            TAB 2: INVENTORY TABLE (Exact layout of Screenshot 2)
        ───────────────────────────────────────────────────────────── */
        <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">
          
          {/* Search & Tabs Filter Bar */}
          <div className="p-2.5 px-3 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3 bg-white dark:bg-[#1a1a1a]">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                All
              </span>
              <div className="relative flex-1 max-w-sm flex items-center">
                <Search className="h-3.5 w-3.5 absolute left-2.5 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search and filter"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-600 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 text-neutral-400">
              <button className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300" title="Columns">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold bg-white dark:bg-[#1a1a1a]">
                  <th className="py-2.5 px-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Unavailable</th>
                  <th className="py-2.5 px-3 text-right">Committed</th>
                  <th className="py-2.5 px-3 text-right">Incoming</th>
                  <th className="py-2.5 px-3 text-right">Available</th>
                  <th className="py-2.5 px-4 text-right">On hand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Loading stock levels…
                    </td>
                  </tr>
                )}

                {!loading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500">
                      <Boxes className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {searchTerm ? 'No products match that search' : 'No products to stock yet'}
                      </p>
                      <p className="text-[11px] mt-1">Every product in your catalogue appears here.</p>
                    </td>
                  </tr>
                )}

                {!loading && filteredItems.map((item, idx) => {
                  const isSelected = selectedItems.includes(idx);
                  return (
                    <tr
                      key={item._id || idx}
                      className={`hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors ${
                        isSelected ? 'bg-neutral-50 dark:bg-neutral-800/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(idx)}
                          className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <Boxes className="h-4 w-4 text-neutral-400" />
                            )}
                          </div>
                          <span className="font-semibold text-[#1a1a1a] dark:text-white hover:underline cursor-pointer">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-neutral-500 font-mono text-[11px]">
                        {item.sku}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-neutral-700 dark:text-neutral-300">
                        {item.unavailable}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-neutral-700 dark:text-neutral-300">
                        {item.committed}
                      </td>
                      <td className="py-3 px-3 text-right font-medium" title="Units on an open transfer between locations">
                        {item.incoming > 0 ? (
                          <span className="text-blue-700 dark:text-blue-400">{item.incoming}</span>
                        ) : (
                          <span className="text-neutral-500">0</span>
                        )}
                      </td>
                      <td className={`py-3 px-3 text-right font-medium ${
                        item.available === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {item.available}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {/* Editable, because an inventory screen you cannot
                            correct is only a report. */}
                        <input
                          type="number"
                          min="0"
                          defaultValue={item.onHand}
                          disabled={savingId === item._id}
                          onBlur={(e) => handleStockChange(item, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                          className="w-20 px-2 py-1 text-right rounded-lg border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-500 bg-transparent font-bold text-neutral-900 dark:text-white focus:outline-none disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">
              {filteredItems.length === 0 ? '0 products' : `${filteredItems.length} of ${items.length} products`}
            </span>
          </div>

        </div>
      )}



    </div>
  );
};

export default AdminInventory;

