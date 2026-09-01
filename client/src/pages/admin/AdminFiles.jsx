import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FolderOpen, Upload, Search, Trash2, Copy, Check, Loader2, AlertCircle,
  X, Image as ImageIcon, Film, LayoutGrid, List
} from 'lucide-react';
import API from '../../api/axiosInstance';

/* ═══════════════════════════════════════════════════════════════════
   FILES
   Shopify's file library over this store's media collection — every
   image the product editor, blog editor and website editor upload lands
   here, and every URL here is one those screens can paste back.
═══════════════════════════════════════════════════════════════════ */
const money = (bytes) => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

/* A data: URI carries its own byte count; a hosted file doesn't tell us
   without fetching it, so it reads "—" rather than a made-up size. */
const sizeOf = (item) => {
  if (item.size) return item.size;
  if (item.url?.startsWith('data:')) {
    const base64 = item.url.split(',')[1] || '';
    return money(Math.round((base64.length * 3) / 4));
  }
  return '—';
};

const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title="Copy link"
      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

const AdminFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState([]);
  const inputRef = useRef(null);

  const load = async () => {
    try {
      const { data } = await API.get('/admin/media');
      setFiles(data.media || []);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const upload = async (fileList) => {
    const chosen = [...(fileList || [])].filter((f) => /^(image|video)\//.test(f.type));
    if (chosen.length === 0) {
      setError('Only images and videos can be uploaded here.');
      return;
    }
    setUploading(true);
    setError('');

    for (const file of chosen) {
      try {
        const url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error(`${file.name} could not be read.`));
          reader.readAsDataURL(file);
        });

        await API.post('/admin/media', {
          name: file.name,
          url,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          size: money(file.size),
          category: 'Uploads'
        });
      } catch (e) {
        setError(e.response?.data?.message || e.message || `${file.name} failed to upload.`);
      }
    }

    setUploading(false);
    load();
  };

  const remove = async (ids) => {
    if (!window.confirm(`Delete ${ids.length} file${ids.length === 1 ? '' : 's'}? Anything using them will lose the image.`)) return;
    const previous = files;
    setFiles(files.filter((f) => !ids.includes(f._id)));
    setSelected([]);
    try {
      await Promise.all(ids.map((id) => API.delete(`/admin/media/${id}`)));
    } catch (e) {
      setFiles(previous);
      setError(e?.response?.data?.message || 'Could not delete those files.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return files.filter((f) =>
      !q || [f.name, f.altText, f.category].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [files, search]);

  const toggleOne = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">Files</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            {[['grid', LayoutGrid], ['list', List]].map(([key, Icon]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                title={key === 'grid' ? 'Grid view' : 'List view'}
                className={`p-1.5 rounded-md transition-colors ${
                  view === key
                    ? 'bg-[#202223] text-white dark:bg-white dark:text-black'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? 'Uploading…' : 'Upload files'}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => { upload(e.target.files); e.target.value = ''; }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
        className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border shadow-xs overflow-hidden transition-colors ${
          dragging
            ? 'border-[#005bd3] border-2 border-dashed'
            : 'border-[#d8d8d8] dark:border-neutral-800'
        }`}
      >
        {/* ── Toolbar ── */}
        <div className="px-3 py-2 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files"
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-600 bg-transparent focus:outline-none"
            />
          </div>

          {selected.length > 0 && (
            <button
              onClick={() => remove(selected)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selected.length})
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading files…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FolderOpen className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {search ? 'No files match that search' : 'No files yet'}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Drop images here, or upload them — then paste the link anywhere in the admin.
            </p>
          </div>
        ) : view === 'grid' ? (
          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {filtered.map((f) => {
              const isSelected = selected.includes(f._id);
              return (
                <div
                  key={f._id}
                  onClick={() => toggleOne(f._id)}
                  className={`group rounded-xl border overflow-hidden cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-[#005bd3] ring-1 ring-[#005bd3]'
                      : 'border-[#e1e1e1] dark:border-neutral-800 hover:border-neutral-400'
                  }`}
                >
                  <div className="aspect-square bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {f.type === 'video' ? (
                      <Film className="h-6 w-6 text-neutral-400" />
                    ) : f.url ? (
                      <img src={f.url} alt={f.altText || f.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-neutral-400" />
                    )}
                  </div>
                  <div className="px-2 py-1.5 flex items-center gap-1">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold text-neutral-900 dark:text-white truncate">
                        {f.name}
                      </span>
                      <span className="block text-[10px] text-neutral-500">{sizeOf(f)}</span>
                    </span>
                    <CopyButton value={f.url} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                  <th className="py-2.5 px-4 w-10" />
                  <th className="py-2.5 px-2 w-14" />
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Date added</th>
                  <th className="py-2.5 px-4 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                {filtered.map((f) => (
                  <tr key={f._id} className="hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50">
                    <td className="py-2 px-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(f._id)}
                        onChange={() => toggleOne(f._id)}
                        className="rounded border-neutral-300 text-[#1a1a1a] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <div className="h-9 w-9 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                        {f.type === 'video' ? (
                          <Film className="h-3.5 w-3.5 text-neutral-400" />
                        ) : f.url ? (
                          <img src={f.url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5 text-neutral-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-white max-w-[220px] truncate">
                      {f.name}
                    </td>
                    <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400 capitalize">{f.type}</td>
                    <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">{sizeOf(f)}</td>
                    <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">{formatDate(f.createdAt)}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <CopyButton value={f.url} />
                        <button
                          onClick={() => remove([f._id])}
                          title="Delete"
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 border-t border-[#e1e1e1] dark:border-neutral-800 text-xs text-neutral-500 font-medium">
          {filtered.length} of {files.length} {files.length === 1 ? 'file' : 'files'}
        </div>
      </div>
    </div>
  );
};

export default AdminFiles;
