import React, { useState, useEffect } from 'react';
import {
  Menu as MenuIcon, Plus, Trash2, ChevronRight, GripVertical, X,
  Loader2, AlertCircle, CornerDownRight, Check
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';

/* ═══════════════════════════════════════════════════════════════════
   MENUS
   The navigation the storefront renders. One level of nesting, matching
   what the Nuva theme can draw — anything deeper would be data the shop
   silently ignores.
═══════════════════════════════════════════════════════════════════ */
const inputClass =
  'w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

/* The routes this storefront actually serves, so a menu can't be pointed
   at a page that doesn't exist. */
const KNOWN_ROUTES = [
  '/', '/shop', '/collections', '/our-story', '/ozone-shield', '/csr-initiatives',
  '/b2b', '/blog', '/blogs', '/faqs', '/contact-us', '/track-order', '/login', '/register'
];

const SecondaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 ${className}`}
  >
    {children}
  </button>
);

const AdminMenus = () => {
  const [menus, setMenus] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = async () => {
    try {
      const { data } = await API.get('/content/menus');
      const list = data.menus || [];
      setMenus(list);
      if (list.length > 0) {
        setActiveId((id) => id || list[0]._id);
        setDraft((d) => d || JSON.parse(JSON.stringify(list[0])));
      }
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load menus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const select = (menu) => {
    if (dirty && !window.confirm('Discard unsaved changes to this menu?')) return;
    setActiveId(menu._id);
    setDraft(JSON.parse(JSON.stringify(menu)));
    setDirty(false);
  };

  const edit = (mutate) => {
    setDraft((d) => {
      const next = JSON.parse(JSON.stringify(d));
      mutate(next);
      return next;
    });
    setDirty(true);
  };

  const addItem = () => edit((d) => d.items.push({ title: '', url: '/', items: [] }));
  const addChild = (index) => edit((d) => {
    d.items[index].items = d.items[index].items || [];
    d.items[index].items.push({ title: '', url: '/' });
  });

  const move = (index, delta) => edit((d) => {
    const target = index + delta;
    if (target < 0 || target >= d.items.length) return;
    [d.items[index], d.items[target]] = [d.items[target], d.items[index]];
  });

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await API.put(`/content/menus/${draft._id}`, { title: draft.title, items: draft.items });
      publishStoreChange(STORE_TOPICS.CONTENT);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save this menu.');
    } finally {
      setSaving(false);
    }
  };

  const createMenu = async () => {
    const title = window.prompt('Name the new menu');
    if (!title?.trim()) return;
    try {
      const { data } = await API.post('/content/menus', { title: title.trim(), items: [] });
      await load();
      setActiveId(data.menu._id);
      setDraft(JSON.parse(JSON.stringify(data.menu)));
      setDirty(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not create that menu.');
    }
  };

  const deleteMenu = async () => {
    if (!window.confirm(`Delete "${draft.title}"? Anywhere the storefront reads it will fall back to its built-in links.`)) return;
    try {
      await API.delete(`/content/menus/${draft._id}`);
      publishStoreChange(STORE_TOPICS.CONTENT);
      setDraft(null);
      setActiveId(null);
      setDirty(false);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete that menu.');
    }
  };

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MenuIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">Menus</h1>
        </div>
        <SecondaryButton onClick={createMenu}>
          <Plus className="h-3.5 w-3.5" />
          Add menu
        </SecondaryButton>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading menus…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-4 items-start">

          {/* ── Menu list ── */}
          <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">
            {menus.length === 0 ? (
              <p className="px-4 py-6 text-xs text-neutral-500 text-center">No menus yet</p>
            ) : (
              menus.map((m) => (
                <button
                  key={m._id}
                  onClick={() => select(m)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left border-b border-[#e1e1e1] dark:border-neutral-800 last:border-0 transition-colors ${
                    activeId === m._id
                      ? 'bg-neutral-100 dark:bg-neutral-800'
                      : 'hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {m.title}
                    </span>
                    <span className="block text-[11px] text-neutral-500">
                      {m.items?.length || 0} {m.items?.length === 1 ? 'item' : 'items'}
                    </span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                </button>
              ))
            )}
          </section>

          {/* ── Menu editor ── */}
          {draft ? (
            <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs">
              <div className="px-4 pt-4 pb-3 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-end justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Title</label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => edit((d) => { d.title = e.target.value; })}
                    className={inputClass}
                  />
                  <p className="text-[11px] text-neutral-500">
                    Handle <code className="font-mono">{draft.handle}</code> — how the storefront asks for this menu.
                  </p>
                </div>
                <button
                  onClick={deleteMenu}
                  title="Delete menu"
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                {draft.items.length === 0 && (
                  <p className="text-xs text-neutral-500 py-6 text-center">
                    No links yet — add the first one below.
                  </p>
                )}

                {draft.items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[#e1e1e1] dark:border-neutral-800 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-2 bg-[#fbfbfa] dark:bg-[#161616]">
                      <span className="flex flex-col shrink-0">
                        <button
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          title="Move up"
                          className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white disabled:opacity-30 leading-none text-[10px]"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => move(i, 1)}
                          disabled={i === draft.items.length - 1}
                          title="Move down"
                          className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white disabled:opacity-30 leading-none text-[10px]"
                        >
                          ▼
                        </button>
                      </span>
                      <GripVertical className="h-3.5 w-3.5 text-neutral-400 shrink-0" />

                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => edit((d) => { d.items[i].title = e.target.value; })}
                        placeholder="Link title"
                        className={`${inputClass} flex-1`}
                      />
                      <input
                        type="text"
                        list="nuva-routes"
                        value={item.url}
                        onChange={(e) => edit((d) => { d.items[i].url = e.target.value; })}
                        placeholder="/shop"
                        className={`${inputClass} flex-1`}
                      />

                      <button
                        onClick={() => addChild(i)}
                        title="Add a sub-link"
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                      >
                        <CornerDownRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => edit((d) => d.items.splice(i, 1))}
                        title="Remove link"
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {(item.items || []).length > 0 && (
                      <div className="pl-8 pr-2 py-2 space-y-2">
                        {item.items.map((child, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <CornerDownRight className="h-3 w-3 text-neutral-400 shrink-0" />
                            <input
                              type="text"
                              value={child.title}
                              onChange={(e) => edit((d) => { d.items[i].items[j].title = e.target.value; })}
                              placeholder="Sub-link title"
                              className={`${inputClass} flex-1`}
                            />
                            <input
                              type="text"
                              list="nuva-routes"
                              value={child.url}
                              onChange={(e) => edit((d) => { d.items[i].items[j].url = e.target.value; })}
                              placeholder="/our-story"
                              className={`${inputClass} flex-1`}
                            />
                            <button
                              onClick={() => edit((d) => d.items[i].items.splice(j, 1))}
                              title="Remove sub-link"
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <datalist id="nuva-routes">
                  {KNOWN_ROUTES.map((r) => <option key={r} value={r} />)}
                </datalist>

                <SecondaryButton onClick={addItem} className="mt-1">
                  <Plus className="h-3.5 w-3.5" />
                  Add menu item
                </SecondaryButton>
              </div>

              <div className="px-4 py-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-end gap-2">
                {saved && (
                  <span className="mr-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
                {dirty && !saved && <span className="mr-auto text-xs text-neutral-500">Unsaved changes</span>}
                <SecondaryButton
                  onClick={() => { const m = menus.find((x) => x._id === activeId); if (m) select(m); }}
                  disabled={!dirty || saving}
                >
                  Discard
                </SecondaryButton>
                <button
                  onClick={save}
                  disabled={saving || !dirty}
                  className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs py-16 text-center">
              <MenuIcon className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Pick a menu to edit
              </p>
            </section>
          )}
        </div>
      )}

      <p className="text-[11px] text-neutral-500 px-1">
        The storefront footer reads the <code className="font-mono">footer-pages</code> menu. Other menus
        are stored and served over the API, ready for the theme to read — the header's dropdowns are
        still coded into the theme and aren't driven by a menu yet.
      </p>
    </div>
  );
};

export default AdminMenus;
