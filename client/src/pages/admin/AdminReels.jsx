import React, { useState, useEffect, useMemo } from 'react';
import { Film, Plus, Search, Pencil, Trash2, Loader2, Play } from 'lucide-react';
import API from '../../api/axiosInstance';
import {
  PageHeader, PrimaryButton, SecondaryButton, IconButton, ErrorBanner,
  TabBar, TableCard, LoadingRow, EmptyRow, Pagination, Modal, Field,
  inputClass, controlBase
} from '../../components/admin/ui';

/* ═══════════════════════════════════════════════════════════════════
   VIDEO REELS
   The shoppable 9:16 clips the homepage feed plays. Same table chrome as
   the rest of the Content section, with a poster thumbnail standing in
   for the video so the list stays quick.
═══════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 10;

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const blankForm = () => ({
  title: '',
  videoUrl: '',
  productTitle: '',
  productPrice: '',
  poster: ''
});

const AdminReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const load = async () => {
    try {
      const { data } = await API.get('/reels');
      if (data.success && data.reels) setReels(data.reels);
      setError('');
    } catch (e) {
      setError('Could not load reels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [search]);

  const open = (reel) => {
    setEditing(reel || 'new');
    setForm(reel ? { ...blankForm(), ...reel } : blankForm());
  };

  const save = async () => {
    if (!form.title.trim() || !form.videoUrl.trim()) {
      setError('A reel needs a title and a video URL.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      productPrice: Number(form.productPrice) || 0,
      isFeatured: true
    };

    try {
      if (editing === 'new') {
        const { data } = await API.post('/reels', payload);
        setReels([data?.reel || { _id: `reel-${Date.now()}`, ...payload }, ...reels]);
      } else {
        const { data } = await API.put(`/reels/${editing._id}`, payload);
        setReels(reels.map((r) => (r._id === editing._id ? (data?.reel || { ...r, ...payload }) : r)));
      }
      setEditing(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save that reel.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (reel) => {
    if (!window.confirm(`Delete "${reel.title}" from the storefront feed?`)) return;
    const previous = reels;
    setReels(reels.filter((r) => r._id !== reel._id));
    try {
      await API.delete(`/reels/${reel._id}`);
    } catch (e) {
      setReels(previous);
      setError(e.response?.data?.message || 'Could not delete that reel.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reels.filter((r) =>
      !q || [r.title, r.productTitle].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [reels, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">
      <PageHeader icon={Film} title="Video reels" count={reels.length}>
        <PrimaryButton onClick={() => open(null)}>
          <Plus className="h-3.5 w-3.5" />
          Add reel
        </PrimaryButton>
      </PageHeader>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <TableCard>
        <TabBar tabs={[{ key: 'all', label: 'All' }]} active="all" onChange={() => {}}>
          {showSearch ? (
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => !search && setShowSearch(false)}
              placeholder="Search reels"
              className={`${controlBase} w-48 py-1`}
            />
          ) : (
            <IconButton onClick={() => setShowSearch(true)} title="Search">
              <Search className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </TabBar>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                <th className="py-2.5 px-4 w-16" />
                <th className="py-2.5 px-3">Reel</th>
                <th className="py-2.5 px-3">Linked product</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {loading && <LoadingRow colSpan={5} label="Loading reels…" />}

              {!loading && rows.length === 0 && (
                <EmptyRow
                  colSpan={5}
                  icon={Film}
                  title={search ? 'No reels match that search' : 'No reels yet'}
                  hint="Vertical 9:16 clips added here play in the homepage shoppable feed."
                  action={
                    !search && (
                      <PrimaryButton onClick={() => open(null)}>
                        <Plus className="h-3.5 w-3.5" />
                        Add reel
                      </PrimaryButton>
                    )
                  }
                />
              )}

              {!loading && rows.map((reel) => (
                <tr
                  key={reel._id}
                  onClick={() => open(reel)}
                  className="cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="py-2 px-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setPreview(reel)}
                      title="Play preview"
                      className="relative h-12 w-9 rounded-md overflow-hidden bg-neutral-900 border border-neutral-200 dark:border-neutral-700 group"
                    >
                      {reel.poster ? (
                        <img src={reel.poster} alt="" className="h-full w-full object-cover opacity-80" />
                      ) : (
                        <span className="absolute inset-0 bg-neutral-800" />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-3.5 w-3.5 text-white fill-white/80 group-hover:scale-110 transition-transform" />
                      </span>
                    </button>
                  </td>
                  <td className="py-3 px-3 max-w-[320px]">
                    <span className="block font-semibold text-[#1a1a1a] dark:text-white truncate">
                      {reel.title}
                    </span>
                    <span className="block text-[11px] text-neutral-500 truncate">{reel.videoUrl}</span>
                  </td>
                  <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                    {reel.productTitle || '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-neutral-900 dark:text-white tabular-nums">
                    {reel.productPrice ? money(reel.productPrice) : '—'}
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <IconButton onClick={() => open(reel)} title="Edit"><Pencil className="h-3.5 w-3.5" /></IconButton>
                      <IconButton onClick={() => remove(reel)} title="Delete" danger><Trash2 className="h-3.5 w-3.5" /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
          unit="reels"
        />
      </TableCard>

      {/* ── Editor ── */}
      {editing && (
        <Modal
          title={editing === 'new' ? 'Add video reel' : 'Edit video reel'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <SecondaryButton onClick={() => setEditing(null)} disabled={saving}>Cancel</SecondaryButton>
              <PrimaryButton onClick={save} disabled={saving || !form.title.trim() || !form.videoUrl.trim()}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save reel'}
              </PrimaryButton>
            </>
          }
        >
          <div className="space-y-3">
            <Field label="Headline" required>
              <input
                type="text"
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Dawn hydro spinach harvesting"
                className={inputClass}
              />
            </Field>

            <Field label="Video URL" required hint="MP4 or WebM. Paste a link from Files, or any hosted stream.">
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://…/video.mp4"
                className={inputClass}
              />
            </Field>

            <Field label="Poster image" hint="Shown before the clip plays. Optional.">
              <input
                type="url"
                value={form.poster}
                onChange={(e) => setForm({ ...form, poster: e.target.value })}
                placeholder="https://…/poster.jpg"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Linked product">
                <input
                  type="text"
                  value={form.productTitle}
                  onChange={(e) => setForm({ ...form, productTitle: e.target.value })}
                  placeholder="e.g. Hydro-cleaned baby spinach"
                  className={inputClass}
                />
              </Field>
              <Field label="Price (₹)">
                <input
                  type="number"
                  min="0"
                  value={form.productPrice}
                  onChange={(e) => setForm({ ...form, productPrice: e.target.value })}
                  placeholder="79"
                  className={inputClass}
                />
              </Field>
            </div>

            {form.videoUrl && (
              <div className="pt-1">
                <p className="text-[11px] text-neutral-500 mb-1.5">Preview</p>
                <video
                  key={form.videoUrl}
                  src={form.videoUrl}
                  poster={form.poster || undefined}
                  controls
                  muted
                  playsInline
                  className="w-32 aspect-[9/16] object-cover rounded-xl border border-[#e1e1e1] dark:border-neutral-800 bg-neutral-900"
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Play preview from the list ── */}
      {preview && (
        <Modal title={preview.title} onClose={() => setPreview(null)} width="max-w-sm">
          <video
            src={preview.videoUrl}
            poster={preview.poster || undefined}
            controls
            autoPlay
            playsInline
            className="w-full aspect-[9/16] object-cover rounded-xl bg-neutral-900"
          />
          {preview.productTitle && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3">
              {preview.productTitle}
              {preview.productPrice ? ` · ${money(preview.productPrice)}` : ''}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
};

export default AdminReels;
