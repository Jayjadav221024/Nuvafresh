import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Boxes, ChevronRight, ChevronDown, ChevronUp, Plus, Trash2, GripVertical,
  Asterisk, Loader2, AlertCircle, X, Info, Check
} from 'lucide-react';
import API from '../../api/axiosInstance';

/* ═══════════════════════════════════════════════════════════════════
   METAOBJECT DEFINITION
   Shopify's "Add metaobject definition" screen, carrying only the
   options this store can actually honour. Shopify also offers
   Translations and Customer Account API access; neither exists here, and
   a toggle that changes nothing is worse than no toggle at all.
═══════════════════════════════════════════════════════════════════ */
const FIELD_TYPES = [
  { value: 'single_line_text', label: 'Single line text' },
  { value: 'multi_line_text', label: 'Multi-line text' },
  { value: 'rich_text', label: 'Rich text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'True or false' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'file_reference', label: 'File' },
  { value: 'product_reference', label: 'Product' }
];

/* A boolean is one value or nothing — a "list of true/false" is not a
   thing anyone means, so the one/list selector is hidden for it. */
const LIST_CAPABLE = (type) => type !== 'boolean';

const OPTIONS = [
  {
    key: 'activeDraftStatus',
    label: 'Active-draft status',
    help: 'Entries carry Active or Draft. Drafts stay off the storefront.'
  },
  {
    key: 'publishAsWebPage',
    label: 'Publish entries as web pages',
    help: 'Each entry gets a storefront URL at /c/<type>/<entry handle>.'
  },
  {
    key: 'storefrontApiAccess',
    label: 'Storefront API access',
    help: 'The shop can read these entries. Turn off to keep them admin-only.'
  }
];

/* Width is deliberately NOT in here. Tailwind emits `w-full` after the
   numeric widths, so `${controlBase} w-full w-20` would resolve to w-full and
   blow the control out of its row — the fixed-width controls compose off the
   base and add their own width instead. */
const controlBase =
  'px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

const inputClass = `w-full ${controlBase}`;

const handleize = (text) =>
  (text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const Card = ({ children, className = '' }) => (
  <section className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-sm ${className}`}>
    {children}
  </section>
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

/* The knob is anchored with an explicit `left-0.5` and moved by transform.
   Without a left it falls back to its static position — and a button centres
   its content, so the knob started mid-track and the transform pushed it out
   past the right edge. Track 36px − knob 16px − 2px inset = 18px of travel. */
const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-9 rounded-full shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005bd3] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1a1a1a] ${
      checked ? 'bg-[#303030] dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-700'
    }`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-0.5 top-0.5 block h-4 w-4 rounded-full shadow transition-transform duration-150 ${
        checked ? 'translate-x-4' : 'translate-x-0'
      } ${
        /* The knob has to contrast with the track it sits on, and the track
           inverts in dark mode — a white knob on a white "on" track would
           vanish. */
        checked ? 'bg-white dark:bg-[#1a1a1a]' : 'bg-white dark:bg-neutral-300'
      }`}
    />
  </button>
);

const AdminMetaobjectDefinition = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [fields, setFields] = useState([
    { label: '', type: 'single_line_text', list: false, required: false, description: '' }
  ]);
  const [displayField, setDisplayField] = useState('');
  const [options, setOptions] = useState({
    activeDraftStatus: true,
    publishAsWebPage: false,
    storefrontApiAccess: true
  });
  const [expanded, setExpanded] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [existingHandle, setExistingHandle] = useState('');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    const load = async () => {
      try {
        const { data } = await API.get('/content/metaobjects');
        const found = (data.definitions || []).find((d) => d._id === id);
        if (!found) {
          setError('That type no longer exists.');
          return;
        }
        setName(found.name);
        setDescription(found.description || '');
        setShowDescription(Boolean(found.description));
        setFields(found.fields.map((f) => ({ ...f })));
        setDisplayField(found.displayField || '');
        setOptions({
          activeDraftStatus: found.options?.activeDraftStatus !== false,
          publishAsWebPage: Boolean(found.options?.publishAsWebPage),
          storefrontApiAccess: found.options?.storefrontApiAccess !== false
        });
        setExistingHandle(found.handle);
      } catch (e) {
        setError(e?.response?.data?.message || 'Could not load that type.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isNew]);

  const type = existingHandle || handleize(name);
  const usable = useMemo(() => fields.filter((f) => f.label.trim()), [fields]);

  const patchField = (index, patch) =>
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));

  const moveField = (index, delta) =>
    setFields((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = async () => {
    if (!name.trim()) return setError('Give the type a name.');
    if (usable.length === 0) return setError('Add at least one field.');

    setSaving(true);
    setError('');
    const payload = { name: name.trim(), description, fields: usable, displayField, options };

    try {
      if (isNew) {
        await API.post('/content/metaobjects', payload);
      } else {
        await API.put(`/content/metaobjects/${id}`, payload);
      }
      navigate('/admin/metaobjects');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save that type.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-neutral-500 font-sans">
        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading type…</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#1a1a1a] dark:text-[#e3e3e3] pb-24">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 mb-4">
        <Link
          to="/admin/metaobjects"
          title="Back to metaobjects"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
        >
          <Boxes className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
        <h1 className="text-lg font-bold tracking-tight">
          {isNew ? 'Add metaobject definition' : name || 'Metaobject definition'}
        </h1>
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="max-w-3xl space-y-4">

        {/* ── Name ── */}
        <Card className="p-4 space-y-2">
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">Name</label>
          <input
            type="text"
            autoFocus={isNew}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Examples: Partner farm, Certification, Recipe"
            className={inputClass}
          />
          <p className="text-[11px] text-neutral-500">
            Type: <code className="font-mono text-neutral-700 dark:text-neutral-300">{type || '—'}</code>
            {!isNew && <span className="ml-1">· the handle can't change once entries exist</span>}
          </p>

          {showDescription ? (
            <div className="pt-1">
              <input
                type="text"
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this type is for"
                className={inputClass}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="text-xs font-medium text-[#005bd3] dark:text-blue-400 hover:underline"
            >
              Add description
            </button>
          )}
        </Card>

        {/* ── Fields ── */}
        <Card>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white px-4 pt-4 pb-2">Fields</h2>

          <div className="divide-y divide-[#e1e1e1] dark:divide-neutral-800 border-t border-[#e1e1e1] dark:border-neutral-800">
            {fields.map((f, i) => (
              <div key={i}>
                {/* Wraps rather than overflowing: on a narrow admin pane the
                    label takes the first line and the selectors drop below. */}
                <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                  <span className="flex flex-col shrink-0 text-neutral-400">
                    <button
                      onClick={() => moveField(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                      className="hover:text-neutral-800 dark:hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => moveField(i, 1)}
                      disabled={i === fields.length - 1}
                      title="Move down"
                      className="hover:text-neutral-800 dark:hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </span>
                  <GripVertical className="h-3.5 w-3.5 text-neutral-400 shrink-0" />

                  <div className="relative flex-1 min-w-[160px]">
                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) => patchField(i, { label: e.target.value })}
                      placeholder="Field label"
                      className={`${inputClass} pr-8`}
                    />
                    <button
                      type="button"
                      onClick={() => patchField(i, { required: !f.required })}
                      title={f.required ? 'Required — click to make optional' : 'Optional — click to make required'}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors ${
                        f.required
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'
                      }`}
                    >
                      <Asterisk className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {LIST_CAPABLE(f.type) ? (
                    <select
                      value={f.list ? 'list' : 'one'}
                      onChange={(e) => patchField(i, { list: e.target.value === 'list' })}
                      title="One value or a list of values"
                      className={`${controlBase} w-[76px] shrink-0`}
                    >
                      <option value="one">One</option>
                      <option value="list">List</option>
                    </select>
                  ) : (
                    <span className="w-[76px] shrink-0 text-center text-[11px] text-neutral-400">One</span>
                  )}

                  <select
                    value={f.type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      patchField(i, { type: nextType, list: LIST_CAPABLE(nextType) ? f.list : false });
                    }}
                    className={`${controlBase} w-[168px] shrink-0`}
                  >
                    {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>

                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    title="More options"
                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={() => setFields(fields.filter((_, j) => j !== i))}
                    disabled={fields.length === 1}
                    title="Remove field"
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {expanded === i && (
                  <div className="px-3 pb-3 pl-14 space-y-2 bg-[#fbfbfa] dark:bg-[#161616]">
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Help text <span className="font-normal text-neutral-500">(shown under the field)</span>
                      </label>
                      <input
                        type="text"
                        value={f.description || ''}
                        onChange={(e) => patchField(i, { description: e.target.value })}
                        placeholder="e.g. The district the farm is in"
                        className={inputClass}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Key <code className="font-mono">{handleize(f.label) || '—'}</code> — how the storefront reads this field.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-3 py-2.5 border-t border-[#e1e1e1] dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setFields([...fields, { label: '', type: 'single_line_text', list: false, required: false, description: '' }])}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#005bd3] dark:text-blue-400 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add field
            </button>
          </div>

          {usable.length > 0 && (
            <div className="px-4 py-3 border-t border-[#e1e1e1] dark:border-neutral-800 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">List entries by</label>
              <select
                value={displayField}
                onChange={(e) => setDisplayField(e.target.value)}
                className={`${inputClass} max-w-xs`}
              >
                <option value="">First field</option>
                {usable.map((f) => (
                  <option key={f.label} value={f.key || handleize(f.label)}>{f.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-500">
                Which field names an entry in lists. Without one they read as “Entry 1”, “Entry 2”.
              </p>
            </div>
          )}
        </Card>

        {/* ── Options ── */}
        <Card>
          <button
            type="button"
            onClick={() => setOptionsOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3"
          >
            <span className="flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-white">
              Metaobject options
              <span title="Only the options this store can actually honour are listed.">
                <Info className="h-3.5 w-3.5 text-neutral-500" />
              </span>
            </span>
            <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform ${optionsOpen ? 'rotate-180' : ''}`} />
          </button>

          {optionsOpen && (
            <div className="divide-y divide-[#e1e1e1] dark:divide-neutral-800 border-t border-[#e1e1e1] dark:border-neutral-800">
              {OPTIONS.map((o) => (
                <div key={o.key} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{o.label}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{o.help}</p>
                    {o.key === 'publishAsWebPage' && options.publishAsWebPage && type && (
                      <p className="text-[11px] text-[#005bd3] dark:text-blue-400 mt-1 font-mono">
                        /c/{type}/&lt;entry&gt;
                      </p>
                    )}
                  </div>
                  <Toggle
                    checked={options[o.key]}
                    label={o.label}
                    onChange={(v) => setOptions({ ...options, [o.key]: v })}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Sticky action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#d8d8d8] dark:border-neutral-800 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur px-4 py-2.5 flex items-center justify-end gap-2">
        <SecondaryButton onClick={() => navigate('/admin/metaobjects')} disabled={saving}>
          Cancel
        </SecondaryButton>
        <button
          onClick={save}
          disabled={saving || !name.trim() || usable.length === 0}
          className="px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default AdminMetaobjectDefinition;
