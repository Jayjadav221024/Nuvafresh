import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SquarePen, Plus, Search, Trash2, ArrowUpDown, SlidersHorizontal,
  ChevronLeft, ChevronRight, X, Loader2, AlertCircle, Image as ImageIcon
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';

/* ═══════════════════════════════════════════════════════════════════
   BLOG POSTS
   Shopify's article list: the post, whether the storefront can see it,
   who wrote it, which blog it's filed under, and when it last moved.
═══════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 10;

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true
  }).replace(',', ' at');
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const SecondaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 ${className}`}
  >
    {children}
  </button>
);

/* ── Manage blogs: the publications a post can be filed under ── */
const ManageBlogsModal = ({ publications, onClose, onChanged }) => {
  const [rows, setRows] = useState(publications);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      const { data } = await API.get('/blogs/publications');
      setRows(data.publications || []);
      onChanged(data.publications || []);
    } catch (e) { /* the list on screen stays as it is */ }
  };

  const add = async () => {
    const title = draft.trim();
    if (!title) return;
    setBusy(true);
    setError('');
    try {
      await API.post('/blogs/publications', { title });
      setDraft('');
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not create that blog.');
    } finally {
      setBusy(false);
    }
  };

  const rename = async (row, title) => {
    if (!title.trim() || title === row.title) return;
    try {
      await API.put(`/blogs/publications/${row._id}`, { title: title.trim() });
      await refresh();
      publishStoreChange(STORE_TOPICS.BLOGS);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not rename that blog.');
    }
  };

  const remove = async (row) => {
    setError('');
    try {
      await API.delete(`/blogs/publications/${row._id}`);
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete that blog.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#e1e1e1] dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Manage blogs</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="Add a blog, e.g. Recipes"
              className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]"
            />
            <SecondaryButton onClick={add} disabled={busy || !draft.trim()}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </SecondaryButton>
          </div>

          {error && (
            <p className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
            </p>
          )}

          <div className="rounded-xl border border-[#e1e1e1] dark:border-neutral-800 divide-y divide-[#e1e1e1] dark:divide-neutral-800">
            {rows.length === 0 ? (
              <p className="px-3 py-4 text-xs text-neutral-500 text-center">No blogs yet</p>
            ) : (
              rows.map((row) => (
                <div key={row._id} className="flex items-center gap-2 px-3 py-2">
                  <input
                    defaultValue={row.title}
                    onBlur={(e) => rename(row, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-neutral-900 dark:text-white outline-none border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-[#005bd3] rounded-md px-2 py-1"
                  />
                  <span className="text-[11px] text-neutral-500 shrink-0">
                    {row.postCount} {row.postCount === 1 ? 'post' : 'posts'}
                  </span>
                  <button
                    onClick={() => remove(row)}
                    title={row.postCount > 0 ? 'Move its posts first' : 'Delete blog'}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40"
                    disabled={row.postCount > 0}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Renaming a blog refiles every post in it. A blog that still holds posts can't be
            deleted — move them somewhere else first.
          </p>
        </div>

        <div className="px-4 py-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex justify-end">
          <SecondaryButton onClick={onClose}>Done</SecondaryButton>
        </div>
      </div>
    </div>
  );
};

const AdminBlogs = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [tab, setTab] = useState('All');
  const [sortDesc, setSortDesc] = useState(true);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [manageOpen, setManageOpen] = useState(false);
  const searchRef = useRef(null);

  const load = async () => {
    try {
      const [posts, pubs] = await Promise.all([
        API.get('/blogs?includeHidden=true'),
        API.get('/blogs/publications').catch(() => ({ data: { publications: [] } }))
      ]);
      setBlogs(posts.data.blogs || []);
      setPublications(pubs.data.publications || []);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const tabs = useMemo(
    () => ['All', ...publications.map((p) => p.title)],
    [publications]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs
      .filter((b) => tab === 'All' || b.category === tab)
      .filter((b) =>
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        const at = new Date(a.updatedAt || a.publishedAt || 0);
        const bt = new Date(b.updatedAt || b.publishedAt || 0);
        return sortDesc ? bt - at : at - bt;
      });
  }, [blogs, tab, search, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [tab, search]);

  const toggleAll = (e) => setSelected(e.target.checked ? pageRows.map((b) => b._id) : []);
  const toggleOne = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} post${selected.length === 1 ? '' : 's'}?`)) return;
    const previous = blogs;
    setBlogs(blogs.filter((b) => !selected.includes(b._id)));
    setSelected([]);
    try {
      await Promise.all(selected.map((id) => API.delete(`/blogs/${id}`)));
      publishStoreChange(STORE_TOPICS.BLOGS);
      load();
    } catch (e) {
      setBlogs(previous);
      setError(e?.response?.data?.message || 'Could not delete those posts.');
    }
  };

  const setVisibility = async (blog, status) => {
    const previous = blogs;
    setBlogs(blogs.map((b) => (b._id === blog._id ? { ...b, status } : b)));
    try {
      await API.put(`/blogs/${blog._id}`, { status });
      publishStoreChange(STORE_TOPICS.BLOGS);
    } catch (e) {
      setBlogs(previous);
      setError(e?.response?.data?.message || 'Could not change visibility.');
    }
  };

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SquarePen className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">Blog posts</h1>
        </div>

        <div className="flex items-center gap-2">
          <SecondaryButton onClick={() => setManageOpen(true)}>
            <SquarePen className="h-3.5 w-3.5" />
            Manage blogs
          </SecondaryButton>
          <button
            onClick={() => navigate('/admin/blogs/new')}
            className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95"
          >
            Add blog post
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

      <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">

        {/* ── Tabs + search ── */}
        <div className="px-3 py-2 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 min-w-0 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  tab === t
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => setManageOpen(true)}
              title="Add a blog"
              className="p-1 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {showSearch ? (
              <input
                ref={searchRef}
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => !search && setShowSearch(false)}
                placeholder="Search posts"
                className="w-44 px-2.5 py-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] outline-none focus:border-[#005bd3]"
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
            <button
              title="Columns"
              className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setSortDesc((v) => !v)}
              title={sortDesc ? 'Newest first' : 'Oldest first'}
              className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Bulk bar ── */}
        {selected.length > 0 && (
          <div className="px-3 py-2 border-b border-[#e1e1e1] dark:border-neutral-800 bg-[#f7f7f7] dark:bg-[#161616] flex items-center gap-3">
            <span className="text-xs font-semibold">{selected.length} selected</span>
            <button
              onClick={bulkDelete}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
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
                <th className="py-2.5 px-2 w-14" />
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Visibility</th>
                <th className="py-2.5 px-3">Author</th>
                <th className="py-2.5 px-3">Blog</th>
                <th className="py-2.5 px-3">
                  <button
                    onClick={() => setSortDesc((v) => !v)}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Updated <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-2.5 px-4 text-right">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading posts…
                  </td>
                </tr>
              )}

              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <SquarePen className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {search || tab !== 'All' ? 'No posts match those filters' : 'No blog posts yet'}
                    </p>
                    {!search && tab === 'All' && (
                      <button
                        onClick={() => navigate('/admin/blogs/new')}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#202223] dark:bg-white text-white dark:text-black text-xs font-bold"
                      >
                        Add blog post
                      </button>
                    )}
                  </td>
                </tr>
              )}

              {!loading && pageRows.map((b) => {
                const isSelected = selected.includes(b._id);
                const visible = (b.status || 'Published') === 'Published';
                return (
                  <tr
                    key={b._id}
                    onClick={() => navigate(`/admin/blogs/${b._id}`)}
                    className={`cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors ${
                      isSelected ? 'bg-neutral-50 dark:bg-neutral-800/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(b._id)}
                        className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <div className="h-9 w-12 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                        {b.bannerImage ? (
                          <img src={b.bannerImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5 text-neutral-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-[280px]">
                      <span className="font-semibold text-[#1a1a1a] dark:text-white hover:underline line-clamp-2">
                        {b.title}
                      </span>
                    </td>
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setVisibility(b, visible ? 'Draft' : 'Published')}
                        title={visible ? 'Hide from the storefront' : 'Show on the storefront'}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                          visible
                            ? 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300 hover:bg-[#b6efb3]'
                            : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-300'
                        }`}
                      >
                        {visible ? 'Visible' : 'Hidden'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                      {b.author || 'Nuva Nutrition'}
                    </td>
                    <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                      {b.category || '—'}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                      {formatDateTime(b.updatedAt || b.publishedAt)}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-600 dark:text-neutral-400">
                      {visible ? formatDate(b.publishedAt) : '—'}
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

      {manageOpen && (
        <ManageBlogsModal
          publications={publications}
          onClose={() => { setManageOpen(false); load(); }}
          onChanged={setPublications}
        />
      )}
    </div>
  );
};

export default AdminBlogs;
