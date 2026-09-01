import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, ArrowUpDown, SlidersHorizontal, ChevronLeft, ChevronRight,
  Download, Loader2, AlertCircle, X, Mail
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { toCsv, downloadCsv } from '../../lib/csv';

/* ═══════════════════════════════════════════════════════════════════
   CUSTOMERS
   Shopify's customer list. Orders and amount spent are summed from the
   order records themselves, so the two numbers this screen exists to
   show can never drift from what the store actually sold.
═══════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 12;

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const SEGMENTS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'returning', label: 'Returning' },
  { key: 'subscribed', label: 'Email subscribers' },
  { key: 'no-orders', label: 'No orders' }
];

const SORTS = [
  { key: 'spent', label: 'Amount spent' },
  { key: 'orders', label: 'Orders' },
  { key: 'name', label: 'Name' },
  { key: 'created', label: 'Date added' }
];

const initials = (name) =>
  (name || 'C')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

const AdminCustomers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [segment, setSegment] = useState('all');
  const [sortKey, setSortKey] = useState('spent');
  const [sortDesc, setSortDesc] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const sortRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/customers');
      setCustomers(data.customers || []);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onClick = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers
      .filter((c) => {
        if (segment === 'new') return (c.totalOrders || 0) === 1;
        if (segment === 'returning') return (c.totalOrders || 0) > 1;
        if (segment === 'subscribed') return c.emailSubscribed;
        if (segment === 'no-orders') return (c.totalOrders || 0) === 0;
        return true;
      })
      .filter((c) =>
        !q ||
        [c.name, c.email, c.phone, c.city, c.state].some((f) =>
          String(f || '').toLowerCase().includes(q)
        )
      )
      .sort((a, b) => {
        const dir = sortDesc ? 1 : -1;
        if (sortKey === 'name') return dir * String(b.name || '').localeCompare(String(a.name || ''));
        if (sortKey === 'orders') return dir * ((b.totalOrders || 0) - (a.totalOrders || 0));
        if (sortKey === 'created') return dir * (new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return dir * ((b.lifetimeValue || 0) - (a.lifetimeValue || 0));
      });
  }, [customers, segment, search, sortKey, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); setSelected([]); }, [segment, search]);

  const toggleAll = (e) => setSelected(e.target.checked ? pageRows.map((c) => c._id) : []);
  const toggleOne = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleExport = (rows) => {
    if (rows.length === 0) return;
    downloadCsv(
      `nuva_customers_${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows, [
        { header: 'Name', write: (c) => c.name || '' },
        { header: 'Email', write: (c) => c.email || '' },
        { header: 'Phone', write: (c) => c.phone || '' },
        { header: 'Email subscription', write: (c) => (c.emailSubscribed ? 'Subscribed' : 'Not subscribed') },
        { header: 'Location', write: (c) => [c.city, c.state].filter(Boolean).join(', ') },
        { header: 'Orders', write: (c) => c.totalOrders || 0 },
        { header: 'Amount spent', write: (c) => c.lifetimeValue || 0 },
        { header: 'Date added', write: (c) => (c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '') }
      ])
    );
  };

  const totals = useMemo(() => ({
    customers: customers.length,
    orders: customers.reduce((n, c) => n + (c.totalOrders || 0), 0),
    spent: customers.reduce((n, c) => n + (c.lifetimeValue || 0), 0),
    subscribed: customers.filter((c) => c.emailSubscribed).length
  }), [customers]);

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">Customers</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport(filtered)}
            disabled={filtered.length === 0}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* ── Summary ── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 dark:divide-neutral-800 gap-3 lg:gap-0">
        {[
          { label: 'Customers', value: totals.customers.toLocaleString('en-IN') },
          { label: 'Orders placed', value: totals.orders.toLocaleString('en-IN') },
          { label: 'Amount spent', value: money(totals.spent) },
          { label: 'Email subscribers', value: totals.subscribed.toLocaleString('en-IN') }
        ].map((s, i) => (
          <div key={s.label} className={i === 0 ? 'lg:pr-4' : 'lg:px-4'}>
            <p className="text-[11px] font-medium text-neutral-500">{s.label}</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white tabular-nums mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">

        {/* ── Segment tabs + tools ── */}
        <div className="px-3 py-2 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 min-w-0 overflow-x-auto">
            {SEGMENTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSegment(s.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  segment === s.key
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {showSearch ? (
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => !search && setShowSearch(false)}
                placeholder="Search customers"
                className="w-48 px-2.5 py-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] outline-none focus:border-[#005bd3]"
              />
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                title="Search and filter"
                className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            )}

            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen((v) => !v)}
                title="Sort"
                className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 z-30 mt-1 w-44 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => { setSortKey(s.key); setSortOpen(false); }}
                      className={`w-full px-3 py-2 text-xs text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800 last:border-0 ${
                        sortKey === s.key ? 'font-bold text-neutral-900 dark:text-white' : ''
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setSortDesc((v) => !v); setSortOpen(false); }}
                    className="w-full px-3 py-2 text-xs text-left font-semibold text-[#005bd3] dark:text-blue-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-800"
                  >
                    {sortDesc ? 'Highest first' : 'Lowest first'}
                  </button>
                </div>
              )}
            </div>

            <button
              title="Columns"
              className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Bulk bar ── */}
        {selected.length > 0 && (
          <div className="px-3 py-2 border-b border-[#e1e1e1] dark:border-neutral-800 bg-[#f7f7f7] dark:bg-[#161616] flex items-center gap-3">
            <span className="text-xs font-semibold">{selected.length} selected</span>
            <button
              onClick={() => handleExport(customers.filter((c) => selected.includes(c._id)))}
              className="text-xs font-semibold px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export selected
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                <th className="py-2.5 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={toggleAll}
                    checked={selected.length === pageRows.length && pageRows.length > 0}
                    className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">Customer name</th>
                <th className="py-2.5 px-3">Email subscription</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">Orders</th>
                <th className="py-2.5 px-4 text-right">Amount spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading customers…
                  </td>
                </tr>
              )}

              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {search || segment !== 'all' ? 'No customers match those filters' : 'No customers yet'}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Customers appear here once someone registers or places an order.
                    </p>
                  </td>
                </tr>
              )}

              {!loading && pageRows.map((c) => {
                const isSelected = selected.includes(c._id);
                return (
                  <tr
                    key={c._id || c.email}
                    onClick={() => navigate(`/admin/customers/${c._id}`)}
                    className={`cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors ${
                      isSelected ? 'bg-neutral-50 dark:bg-neutral-800/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(c._id)}
                        className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {initials(c.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-[#1a1a1a] dark:text-white hover:underline truncate">
                            {c.name || 'Guest customer'}
                          </span>
                          <span className="block text-[11px] text-neutral-500 truncate">{c.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.emailSubscribed
                          ? 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}>
                        <Mail className="h-2.5 w-2.5" />
                        {c.emailSubscribed ? 'Subscribed' : 'Not subscribed'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                      {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-700 dark:text-neutral-300 tabular-nums">
                      {c.totalOrders || 0} {(c.totalOrders || 0) === 1 ? 'order' : 'orders'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-neutral-900 dark:text-white tabular-nums">
                      {money(c.lifetimeValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="p-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center gap-1 text-xs text-neutral-500">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <span className="ml-2 font-medium">
            {filtered.length === 0
              ? '0'
              : `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
