import React, { useState, useEffect, useMemo } from 'react';
import {
  Quote, Plus, Trash2, Pencil, Star, Search, User, Loader2, MessageSquare
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';
import { TESTIMONIAL_AMIT_BASE64 } from '../../assets/testimonialAmitBase64';
import { TESTIMONIAL_MINAL_BASE64 } from '../../assets/testimonialMinalBase64';
import { TESTIMONIAL_SHIRALI_BASE64 } from '../../assets/testimonialShiraliBase64';
import {
  PageHeader, PrimaryButton, SecondaryButton, IconButton, Badge, ErrorBanner,
  TabBar, TableCard, LoadingRow, EmptyRow, Pagination, Modal, Field,
  inputClass, controlBase
} from '../../components/admin/ui';

/* ═══════════════════════════════════════════════════════════════════
   TESTIMONIALS
   The customer quotes the homepage strip renders. Same table chrome as
   the rest of the Content section: visibility as a live badge, the row
   opens the editor, the storefront hears about every save.
═══════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 10;

const DEFAULT_TESTIMONIALS = [
  {
    _id: 't-1',
    author: 'Minal Kapasi',
    city: 'Vadodara',
    quote: 'Hello Nuva team, I ordered organic fruits and veggies from the app — all farm-fresh, natural, and spoilage-free. The Golden Kiwi, Bhindi, and Khapli flour bhakhri were excellent. Loved the seasonal variety, eco-friendly packaging, and sustainable approach. Keep it up, Aanshi!',
    rating: 5,
    status: 'Published',
    avatar: TESTIMONIAL_MINAL_BASE64,
    order: 1
  },
  {
    _id: 't-2',
    author: 'Amit',
    city: 'Vadodara',
    quote: 'The A2 Bilona ghee and cold-pressed mustard oil took me back to my village roots in Gujarat. Truly chemical-free with an unmistakable authentic aroma. Clean delivery with zero plastic waste!',
    rating: 5,
    status: 'Published',
    avatar: TESTIMONIAL_AMIT_BASE64,
    order: 2
  },
  {
    _id: 't-3',
    author: 'Shirali Parikh',
    city: 'Mumbai',
    quote: 'Ever since switching to Nuva’s ozone-washed leafy greens, our family has experienced noticeably crisper salads with zero chemical or fertilizer smell. Remarkable quality standards.',
    rating: 5,
    status: 'Published',
    avatar: TESTIMONIAL_SHIRALI_BASE64,
    order: 3
  },
  {
    _id: 't-4',
    author: 'Dr. Rajesh Dave',
    city: 'Ahmedabad',
    quote: 'The Lakadong turmeric has an extraordinary rich golden hue and high curcumin level. The transparency in sourcing and HPLC lab test QR code on every dispatch gives complete peace of mind.',
    rating: 5,
    status: 'Published',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
    order: 4
  }
];

const blankForm = () => ({
  author: '',
  city: '',
  quote: '',
  rating: 5,
  avatar: '',
  status: 'Published'
});

const Stars = ({ value }) => (
  <span className="flex items-center gap-0.5" title={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`h-3 w-3 ${
          n <= value ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-600'
        }`}
      />
    ))}
  </span>
);

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);   // the row being edited, or 'new'
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await API.get('/admin/testimonials');
      if (data.success && data.testimonials?.length > 0) setTestimonials(data.testimonials);
      setError('');
    } catch (e) {
      // The seeded set is what the homepage shows anyway.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [tab, search]);

  const open = (item) => {
    setEditing(item || 'new');
    setForm(item ? { ...blankForm(), ...item } : blankForm());
  };

  const save = async () => {
    if (!form.author.trim() || !form.quote.trim()) {
      setError('A testimonial needs an author and a quote.');
      return;
    }
    setSaving(true);
    setError('');

    const isNew = editing === 'new';
    try {
      if (isNew) {
        const payload = { _id: `t-${Date.now()}`, ...form };
        const { data } = await API.post('/admin/testimonials', payload);
        setTestimonials([data?.testimonial || payload, ...testimonials]);
      } else {
        await API.put(`/admin/testimonials/${editing._id}`, form);
        setTestimonials(testimonials.map((t) => (t._id === editing._id ? { ...t, ...form } : t)));
      }
      publishStoreChange(STORE_TOPICS.TESTIMONIALS);
      setEditing(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save that testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Remove the testimonial from ${item.author}?`)) return;
    const previous = testimonials;
    setTestimonials(testimonials.filter((t) => t._id !== item._id));
    try {
      await API.delete(`/admin/testimonials/${item._id}`);
      publishStoreChange(STORE_TOPICS.TESTIMONIALS);
    } catch (e) {
      setTestimonials(previous);
      setError(e.response?.data?.message || 'Could not remove that testimonial.');
    }
  };

  const toggleStatus = async (item) => {
    const status = item.status === 'Published' ? 'Draft' : 'Published';
    const previous = testimonials;
    setTestimonials(testimonials.map((t) => (t._id === item._id ? { ...t, status } : t)));
    try {
      await API.put(`/admin/testimonials/${item._id}`, { status });
      // Publishing changes the homepage strip, so the shop refetches.
      publishStoreChange(STORE_TOPICS.TESTIMONIALS);
    } catch (e) {
      setTestimonials(previous);
      setError(e.response?.data?.message || 'Could not change visibility.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return testimonials
      .filter((t) => tab === 'All' || t.status === tab)
      .filter((t) =>
        !q || [t.author, t.city, t.quote].some((v) => String(v || '').toLowerCase().includes(q))
      );
  }, [testimonials, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">
      <PageHeader icon={Quote} title="Testimonials" count={testimonials.length}>
        <PrimaryButton onClick={() => open(null)}>
          <Plus className="h-3.5 w-3.5" />
          Add testimonial
        </PrimaryButton>
      </PageHeader>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <TableCard>
        <TabBar tabs={['All', 'Published', 'Draft']} active={tab} onChange={setTab}>
          {showSearch ? (
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => !search && setShowSearch(false)}
              placeholder="Search testimonials"
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
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-3">Quote</th>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3">Visibility</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
              {loading && <LoadingRow colSpan={5} label="Loading testimonials…" />}

              {!loading && rows.length === 0 && (
                <EmptyRow
                  colSpan={5}
                  icon={MessageSquare}
                  title={search || tab !== 'All' ? 'No testimonials match those filters' : 'No testimonials yet'}
                  hint="Quotes added here appear in the homepage testimonials strip."
                  action={
                    !search && tab === 'All' && (
                      <PrimaryButton onClick={() => open(null)}>
                        <Plus className="h-3.5 w-3.5" />
                        Add testimonial
                      </PrimaryButton>
                    )
                  }
                />
              )}

              {!loading && rows.map((t) => (
                <tr
                  key={t._id}
                  onClick={() => open(t)}
                  className="cursor-pointer hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="h-8 w-8 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 shrink-0 flex items-center justify-center">
                        {t.avatar ? (
                          <img src={t.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-neutral-500" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-[#1a1a1a] dark:text-white truncate">
                          {t.author}
                        </span>
                        <span className="block text-[11px] text-neutral-500 truncate">{t.city || '—'}</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400 max-w-[420px]">
                    <span className="line-clamp-2">{t.quote}</span>
                  </td>
                  <td className="py-3 px-3"><Stars value={Number(t.rating) || 0} /></td>
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <Badge
                      tone={t.status === 'Published' ? 'success' : 'neutral'}
                      onClick={() => toggleStatus(t)}
                      title={t.status === 'Published' ? 'Hide from the homepage' : 'Show on the homepage'}
                    >
                      {t.status === 'Published' ? 'Visible' : 'Hidden'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <IconButton onClick={() => open(t)} title="Edit"><Pencil className="h-3.5 w-3.5" /></IconButton>
                      <IconButton onClick={() => remove(t)} title="Remove" danger><Trash2 className="h-3.5 w-3.5" /></IconButton>
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
          unit="testimonials"
        />
      </TableCard>

      {editing && (
        <Modal
          title={editing === 'new' ? 'Add testimonial' : `Edit ${editing.author}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <SecondaryButton onClick={() => setEditing(null)} disabled={saving}>Cancel</SecondaryButton>
              <PrimaryButton onClick={save} disabled={saving || !form.author.trim() || !form.quote.trim()}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save'}
              </PrimaryButton>
            </>
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Author" required>
                <input
                  type="text"
                  autoFocus
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Customer name"
                  className={inputClass}
                />
              </Field>
              <Field label="City">
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Vadodara"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label="Quote"
              required
              counter={<span className="text-[11px] text-neutral-500">{form.quote.length} characters</span>}
            >
              <textarea
                rows={5}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                placeholder="What the customer said"
                className={inputClass}
              />
            </Field>

            <Field label="Avatar image URL" hint="Paste a link from Files, or leave blank for an initial.">
              <input
                type="text"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://…"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating">
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className={inputClass}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>
                  ))}
                </select>
              </Field>
              <Field label="Visibility">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputClass}
                >
                  <option value="Published">Visible</option>
                  <option value="Draft">Hidden</option>
                </select>
              </Field>
            </div>

            {form.avatar && (
              <div className="flex items-center gap-2.5 pt-1">
                <span className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 shrink-0">
                  <img src={form.avatar} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="text-[11px] text-neutral-500">Preview</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminTestimonials;
