import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  SquarePen, ChevronRight, Pencil, CalendarClock, Eye, X, Plus, Trash2,
  Loader2, AlertCircle, Image as ImageIcon, ExternalLink, Copy
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';
import RichTextEditor from '../../components/admin/RichTextEditor';

/* ═══════════════════════════════════════════════════════════════════
   BLOG POST EDITOR
   Shopify's article screen: what the post says on the left, how it is
   published on the right. Every field here maps to something the
   storefront blog actually renders.
═══════════════════════════════════════════════════════════════════ */
const STORE_DOMAIN = 'thenuva.com';

const THEME_TEMPLATES = ['Default blog post', 'Recipe', 'Long read', 'Farmer story'];

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

const slugify = (text) =>
  (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const Card = ({ title, action, children, className = '' }) => (
  <section className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        {title && <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h2>}
        {action}
      </div>
    )}
    <div className="px-4 pb-4 pt-1">{children}</div>
  </section>
);

const IconButton = ({ onClick, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors ${className}`}
  >
    {children}
  </button>
);

const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-40 disabled:active:scale-100 ${className}`}
  >
    {children}
  </button>
);

const Radio = ({ checked, onChange, label, children }) => (
  <label className="flex items-start gap-2.5 py-1 cursor-pointer group">
    <span
      onClick={onChange}
      className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
        checked ? 'border-[#1a1a1a] dark:border-white' : 'border-neutral-400 group-hover:border-neutral-600'
      }`}
    >
      {checked && <span className="h-2 w-2 rounded-full bg-[#1a1a1a] dark:bg-white" />}
    </span>
    <span className="min-w-0">
      <span className="block text-xs text-neutral-800 dark:text-neutral-200">{label}</span>
      {checked && children}
    </span>
  </label>
);

const blankPost = () => ({
  title: '',
  content: '',
  excerpt: '',
  status: 'Draft',
  author: 'Nuva Nutrition',
  category: '',
  tags: [],
  bannerImage: '',
  themeTemplate: THEME_TEMPLATES[0],
  publishedAt: new Date().toISOString(),
  seo: { title: '', description: '', handle: '' }
});

const AdminBlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [post, setPost] = useState(blankPost());
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [editingExcerpt, setEditingExcerpt] = useState(false);
  const [editingSeo, setEditingSeo] = useState(false);
  const [tagDraft, setTagDraft] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const set = (patch) => {
    setPost((p) => ({ ...p, ...patch }));
    setDirty(true);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/blogs/publications');
        const list = data.publications || [];
        setPublications(list);
        if (isNew && list.length > 0) {
          setPost((p) => (p.category ? p : { ...p, category: list[0].title }));
        }
      } catch (e) { /* the blog select falls back to a free-text value */ }

      if (isNew) return;

      try {
        const { data } = await API.get(`/blogs/${id}`);
        if (data.success) {
          setPost({ ...blankPost(), ...data.blog, seo: { ...blankPost().seo, ...(data.blog.seo || {}) } });
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Could not load that post.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isNew]);

  const handle = post.seo?.handle || post.slug || slugify(post.title);
  const seoTitle = post.seo?.title || post.title;
  const seoDescription = post.seo?.description || post.excerpt || stripHtml(post.content).slice(0, 160);

  const readTime = useMemo(() => {
    const words = stripHtml(post.content).split(/\s+/).filter(Boolean).length;
    return words === 0 ? '' : `${Math.max(1, Math.round(words / 200))} min read · ${words} words`;
  }, [post.content]);

  const handleImageFile = (file) => {
    if (!file || !file.type?.startsWith('image/')) return;
    const reader = new FileReader();
    // Stored inline, the same way the product editor keeps its uploads —
    // no media host to depend on.
    reader.onload = () => set({ bannerImage: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const value = tagDraft.trim();
    if (!value) return;
    if (!post.tags.includes(value)) set({ tags: [...post.tags, value] });
    setTagDraft('');
  };

  const save = async () => {
    if (!post.title.trim()) {
      setError('Give the post a title before saving.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      ...post,
      title: post.title.trim(),
      category: post.category || publications[0]?.title || 'News',
      seo: { ...post.seo, handle }
    };

    try {
      if (isNew) {
        const { data } = await API.post('/blogs', payload);
        publishStoreChange(STORE_TOPICS.BLOGS);
        navigate(`/admin/blogs/${data.blog?._id || ''}`, { replace: true });
      } else {
        await API.put(`/blogs/${id}`, payload);
        publishStoreChange(STORE_TOPICS.BLOGS);
        setDirty(false);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save this post.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await API.delete(`/blogs/${id}`);
      publishStoreChange(STORE_TOPICS.BLOGS);
      navigate('/admin/blogs');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete this post.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-neutral-500 font-sans">
        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading post…</p>
      </div>
    );
  }

  const visible = post.status === 'Published';

  return (
    <div className="font-sans text-[#1a1a1a] dark:text-[#e3e3e3] pb-24">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <Link
            to="/admin/blogs"
            title="Back to blog posts"
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <SquarePen className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <h1 className="text-lg font-bold tracking-tight truncate">
            {isNew ? 'Add blog post' : post.title || 'Untitled post'}
          </h1>
        </div>

        {!isNew && (
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/blog?post=${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
              title="View on the storefront"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <IconButton onClick={remove} title="Delete post">
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">

        {/* ═══════════════════════════════════════════════════════
            LEFT: what the post says
        ═══════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <Card>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Title</label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="e.g., Blog about your latest products or deals"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Content</label>
                  {readTime && <span className="text-[11px] text-neutral-500">{readTime}</span>}
                </div>
                <RichTextEditor
                  value={post.content}
                  onChange={(html) => set({ content: html })}
                  placeholder="Write the post…"
                  minHeight={280}
                />
              </div>
            </div>
          </Card>

          {/* Excerpt */}
          <Card
            title="Excerpt"
            action={
              !editingExcerpt && (
                <IconButton onClick={() => setEditingExcerpt(true)} title="Edit excerpt">
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
              )
            }
          >
            {editingExcerpt ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  autoFocus
                  value={post.excerpt}
                  onChange={(e) => set({ excerpt: e.target.value })}
                  placeholder="A short summary shown on the blog index and home page"
                  className={inputClass}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">{post.excerpt.length} characters</span>
                  <SecondaryButton onClick={() => setEditingExcerpt(false)}>Done</SecondaryButton>
                </div>
              </div>
            ) : (
              <p className={`text-xs leading-relaxed ${post.excerpt ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-500'}`}>
                {post.excerpt || 'Add a summary of the post to appear on your home page or blog.'}
              </p>
            )}
          </Card>

          {/* SEO */}
          <Card
            title="Search engine listing"
            action={
              !editingSeo && (
                <IconButton onClick={() => setEditingSeo(true)} title="Edit listing">
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
              )
            }
          >
            {editingSeo ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Page title</label>
                    <span className="text-[11px] text-neutral-500">{seoTitle.length} of 70</span>
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={post.seo.title}
                    onChange={(e) => set({ seo: { ...post.seo, title: e.target.value } })}
                    placeholder={post.title || 'Page title'}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Meta description</label>
                    <span className="text-[11px] text-neutral-500">{seoDescription.length} of 160</span>
                  </div>
                  <textarea
                    rows={3}
                    value={post.seo.description}
                    onChange={(e) => set({ seo: { ...post.seo, description: e.target.value } })}
                    placeholder="What a reader sees under the link in search results"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">URL handle</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-500 shrink-0">{STORE_DOMAIN}/blog/</span>
                    <input
                      type="text"
                      value={post.seo.handle || slugify(post.title)}
                      onChange={(e) => set({ seo: { ...post.seo, handle: slugify(e.target.value) } })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <SecondaryButton onClick={() => setEditingSeo(false)}>Done</SecondaryButton>
                </div>
              </div>
            ) : seoTitle ? (
              /* The preview only appears once there's something to preview. */
              <div className="space-y-0.5">
                <p className="text-[13px] text-[#1a0dab] dark:text-blue-400 truncate">{seoTitle}</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-500 truncate">
                  {STORE_DOMAIN}/blog/{handle}
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {seoDescription || 'No description yet.'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                Add a title and description to see how this blog post might appear in a search engine listing
              </p>
            )}
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════
            RIGHT: how it is published
        ═══════════════════════════════════════════════════════ */}
        <div className="space-y-4">

          {/* Visibility */}
          <Card
            title="Visibility"
            action={
              <span title="Publish date" className="p-1.5 text-neutral-500">
                <CalendarClock className="h-3.5 w-3.5" />
              </span>
            }
          >
            <div className="space-y-1">
              <Radio
                checked={visible}
                onChange={() => set({ status: 'Published' })}
                label="Visible"
              >
                <span className="block mt-1.5">
                  <input
                    type="datetime-local"
                    value={new Date(post.publishedAt || Date.now()).toISOString().slice(0, 16)}
                    onChange={(e) => set({ publishedAt: new Date(e.target.value).toISOString() })}
                    className={inputClass}
                  />
                  <span className="block text-[11px] text-neutral-500 mt-1">
                    {new Date(post.publishedAt) > new Date()
                      ? 'Scheduled — the storefront shows it from this date'
                      : 'Live on the storefront'}
                  </span>
                </span>
              </Radio>

              <Radio
                checked={!visible}
                onChange={() => set({ status: 'Draft' })}
                label="Hidden"
              >
                <span className="block text-[11px] text-neutral-500 mt-0.5">
                  Kept out of the blog and its feeds
                </span>
              </Radio>
            </div>
          </Card>

          {/* Image */}
          <Card title="Image">
            {post.bannerImage ? (
              <div className="relative group">
                <img
                  src={post.bannerImage}
                  alt=""
                  className="w-full h-40 object-cover rounded-xl border border-[#e1e1e1] dark:border-neutral-800"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-black/40 rounded-xl transition-opacity">
                  <SecondaryButton onClick={() => fileRef.current?.click()}>Replace</SecondaryButton>
                  <SecondaryButton onClick={() => set({ bannerImage: '' })} className="text-rose-600">
                    Remove
                  </SecondaryButton>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleImageFile(e.dataTransfer.files?.[0]);
                }}
                className={`rounded-xl border-2 border-dashed py-8 px-4 text-center transition-colors ${
                  dragging
                    ? 'border-[#005bd3] bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              >
                <SecondaryButton onClick={() => fileRef.current?.click()}>Add image</SecondaryButton>
                <p className="text-[11px] text-[#005bd3] dark:text-blue-400 mt-2">or drop an image to upload</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { handleImageFile(e.target.files?.[0]); e.target.value = ''; }}
            />
          </Card>

          {/* Organization */}
          <Card title="Organization">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Author</label>
                <input
                  type="text"
                  value={post.author}
                  onChange={(e) => set({ author: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Blog</label>
                <select
                  value={post.category}
                  onChange={(e) => set({ category: e.target.value })}
                  className={inputClass}
                >
                  {publications.length === 0 && <option value="">No blogs yet</option>}
                  {publications.map((p) => (
                    <option key={p._id} value={p.title}>{p.title}</option>
                  ))}
                  {/* A post filed under a blog that has since been removed keeps
                      its own value rather than silently jumping to another. */}
                  {post.category && !publications.some((p) => p.title === post.category) && (
                    <option value={post.category}>{post.category}</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Tags</label>
                <input
                  type="text"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
                  }}
                  onBlur={addTag}
                  className={inputClass}
                />
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        {t}
                        <button type="button" onClick={() => set({ tags: post.tags.filter((x) => x !== t) })}>
                          <X className="h-3 w-3 hover:text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Theme template */}
          <Card
            title="Theme template"
            action={<span className="p-1.5 text-neutral-500"><Eye className="h-3.5 w-3.5" /></span>}
          >
            <select
              value={post.themeTemplate}
              onChange={(e) => set({ themeTemplate: e.target.value })}
              className={inputClass}
            >
              {THEME_TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Card>
        </div>
      </div>

      {/* ── Sticky action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#d8d8d8] dark:border-neutral-800 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur px-4 py-2.5 flex items-center justify-end gap-2">
        {dirty && <span className="mr-auto text-xs text-neutral-500">Unsaved changes</span>}
        <SecondaryButton onClick={() => navigate('/admin/blogs')} disabled={saving}>
          {dirty ? 'Discard' : 'Back'}
        </SecondaryButton>
        <PrimaryButton onClick={save} disabled={saving || !post.title.trim()} className="flex items-center gap-1.5">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? 'Saving…' : isNew ? 'Save post' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default AdminBlogEditor;
