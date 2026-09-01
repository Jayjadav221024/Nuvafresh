import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileBarChart, Search, ChevronDown, ChevronLeft, ChevronRight,
  ArrowUpDown, Loader2, AlertCircle, Check
} from 'lucide-react';
import API from '../../api/axiosInstance';

/* ═══════════════════════════════════════════════════════════════════
   REPORTS
   The report library. Every row opens a report built from this store's
   own data — the catalogue is fixed, but "last viewed" is written when a
   report is actually opened, so the sort by recency means something.
═══════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 12;

const formatViewed = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Dropdown = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
          value
            ? 'border-neutral-800 dark:border-neutral-300 bg-neutral-100 dark:bg-neutral-800'
            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700'
        }`}
      >
        {value || label}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute z-30 left-0 mt-1 w-52 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left"
          >
            All
            {!value && <Check className="h-3 w-3" />}
          </button>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => { onChange(o); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left border-t border-neutral-100 dark:border-neutral-800"
            >
              {o}
              {value === o && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/analytics/catalogue');
        setReports(data.reports || []);
      } catch (e) {
        setError(e?.response?.data?.message || 'Could not load the report library.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(
    () => [...new Set(reports.map((r) => r.category))].sort(),
    [reports]
  );
  const authors = useMemo(
    () => [...new Set(reports.map((r) => r.createdBy))].sort(),
    [reports]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => (!category || r.category === category))
      .filter((r) => (!createdBy || r.createdBy === createdBy))
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
      .sort((a, b) => {
        // Never-viewed reports sort last in both directions — an absent date
        // is not "the oldest date".
        if (!a.lastViewedAt && !b.lastViewedAt) return a.name.localeCompare(b.name);
        if (!a.lastViewedAt) return 1;
        if (!b.lastViewedAt) return -1;
        const diff = new Date(b.lastViewedAt) - new Date(a.lastViewedAt);
        return sortDesc ? diff : -diff;
      });
  }, [reports, query, category, createdBy, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, category, createdBy]);

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">
      <div className="flex items-center gap-2">
        <FileBarChart className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        <h1 className="text-xl font-bold tracking-tight">Reports</h1>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">
        {/* Search */}
        <div className="px-3 py-2.5 border-b border-[#e1e1e1] dark:border-neutral-800">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports"
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-600 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-3 py-2 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center gap-2">
          <Dropdown label="Created by" options={authors} value={createdBy} onChange={setCreatedBy} />
          <Dropdown label="Category" options={categories} value={category} onChange={setCategory} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold bg-[#f7f7f7] dark:bg-[#161616]">
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">
                  <button
                    onClick={() => setSortDesc((v) => !v)}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Last viewed
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-2.5 px-4">Created by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-neutral-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading report library…
                  </td>
                </tr>
              )}

              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-neutral-500 text-xs">
                    No reports match those filters.
                  </td>
                </tr>
              )}

              {!loading && pageRows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/admin/reports/${r.id}`)}
                  className="cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-[#005bd3] dark:text-blue-400 hover:underline">
                    {r.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                    {formatViewed(r.lastViewedAt)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                      <span className="h-4 w-4 rounded bg-[#25d366] text-[#0a2912] text-[9px] font-black flex items-center justify-center">
                        N
                      </span>
                      {r.createdBy}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

export default AdminReports;
