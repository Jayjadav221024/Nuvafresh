import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes, Plus, Trash2, ChevronRight, X, Loader2, AlertCircle, Database, Pencil
} from 'lucide-react';
import API from '../../api/axiosInstance';

/* ═══════════════════════════════════════════════════════════════════
   METAOBJECTS
   Custom content types. A definition describes the shape — "Farm" has a
   name, a district, a photo — and entries fill it in. It's how the store
   adds structured content without a schema change every time.
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

/* Width stays out of the base: Tailwind emits `w-full` after the numeric
   widths, so composing the two would always resolve to w-full. */
const controlBase =
  'px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

const inputClass = `w-full ${controlBase}`;

const SecondaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 ${className}`}
  >
    {children}
  </button>
);

const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-40 flex items-center gap-1.5 ${className}`}
  >
    {children}
  </button>
);

const Modal = ({ title, onClose, children, footer, width = 'max-w-lg' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
    <div className={`w-full ${width} rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-2xl flex flex-col max-h-[85vh]`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#e1e1e1] dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-end gap-2">
          {footer}
        </div>
      )}
    </div>
  </div>
);

/* ── Create or edit one entry ── */
const blankValue = (field) => {
  if (field.list) return [''];
  return field.type === 'boolean' ? false : '';
};

const EntryModal = ({ definition, entry, onClose, onSaved }) => {
  const [values, setValues] = useState(() => {
    const base = {};
    definition.fields.forEach((f) => {
      const stored = entry?.fields?.[f.key];
      if (f.list) base[f.key] = Array.isArray(stored) && stored.length ? [...stored] : [''];
      else base[f.key] = stored ?? blankValue(f);
    });
    return base;
  });
  const [status, setStatus] = useState(entry?.status || 'Active');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const usesStatus = definition.options?.activeDraftStatus !== false;

  const setValue = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const setListItem = (key, index, value) =>
    setValues((v) => ({ ...v, [key]: v[key].map((x, i) => (i === index ? value : x)) }));

  const addListItem = (key) => setValues((v) => ({ ...v, [key]: [...v[key], ''] }));

  const removeListItem = (key, index) =>
    setValues((v) => ({ ...v, [key]: v[key].filter((_, i) => i !== index) }));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await API.post(`/content/metaobjects/${definition.handle}/entries`, {
        _id: entry?._id,
        fields: values,
        status: usesStatus ? status : 'Active'
      });
      onSaved();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save that entry.');
      setBusy(false);
    }
  };

  /* One control, whatever the field type — reused for a single value and
     for each row of a list. */
  const control = (f, value, onChange) => {
    if (f.type === 'multi_line_text' || f.type === 'rich_text') {
      return (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
    }
    if (f.type === 'boolean') {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-neutral-400 text-[#1a1a1a] focus:ring-0 cursor-pointer"
          />
          <span className="text-xs text-neutral-700 dark:text-neutral-300">
            {value ? 'True' : 'False'}
          </span>
        </label>
      );
    }
    return (
      <input
        type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          f.type === 'file_reference' ? 'Paste a file link from Files'
            : f.type === 'product_reference' ? 'Product handle or id'
            : ''
        }
        className={inputClass}
      />
    );
  };

  return (
    <Modal
      title={entry ? `Edit ${definition.name}` : `Add ${definition.name}`}
      onClose={onClose}
      footer={
        <>
          {usesStatus && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${controlBase} mr-auto w-32`}
            >
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          )}
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={save} disabled={busy}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy ? 'Saving…' : 'Save entry'}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-3">
        {definition.fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {f.label}
              {f.required && <span className="text-rose-600 ml-0.5">*</span>}
              {f.list && <span className="ml-1.5 text-[10px] font-medium text-neutral-500">list</span>}
            </label>

            {f.list ? (
              <div className="space-y-1.5">
                {values[f.key].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="flex-1 min-w-0">
                      {control(f, item, (v) => setListItem(f.key, i, v))}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeListItem(f.key, i)}
                      disabled={values[f.key].length === 1}
                      title="Remove value"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(f.key)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#005bd3] dark:text-blue-400 hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Add value
                </button>
              </div>
            ) : (
              control(f, values[f.key], (v) => setValue(f.key, v))
            )}

            {f.description && <p className="text-[11px] text-neutral-500">{f.description}</p>}
          </div>
        ))}

        {error && (
          <p className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
          </p>
        )}
      </div>
    </Modal>
  );
};

const AdminMetaobjects = () => {
  const navigate = useNavigate();
  const [definitions, setDefinitions] = useState([]);
  const [active, setActive] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  const load = async () => {
    try {
      const { data } = await API.get('/content/metaobjects');
      setDefinitions(data.definitions || []);
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load metaobject types.');
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async (definition) => {
    setActive(definition);
    try {
      const { data } = await API.get(`/content/metaobjects/${definition.handle}/entries`);
      setEntries(data.entries || []);
      // The response carries the definition, options included, so the table
      // renders against exactly what the server enforced.
      if (data.definition) setActive((a) => ({ ...a, ...data.definition }));
    } catch (e) {
      setEntries([]);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteDefinition = async (definition) => {
    setError('');
    try {
      await API.delete(`/content/metaobjects/${definition._id}`);
      if (active?._id === definition._id) { setActive(null); setEntries([]); }
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete that type.');
    }
  };

  const deleteEntry = async (entry) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await API.delete(`/content/metaobjects/entries/${entry._id}`);
      await loadEntries(active);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete that entry.');
    }
  };

  const displayOf = (entry, definition) => {
    const key = definition.displayField || definition.fields[0]?.key;
    const value = entry.fields?.[key];
    const first = Array.isArray(value) ? value[0] : value;
    return String(first || entry.handle || 'Untitled');
  };

  /* A list shows its values joined; a boolean reads as words, not "true". */
  const cellValue = (value) => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
    if (typeof value === 'boolean') return value ? 'True' : 'False';
    return String(value ?? '') || '—';
  };

  return (
    <div className="space-y-4 font-sans text-[#1a1a1a] dark:text-[#e3e3e3]">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Boxes className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h1 className="text-xl font-bold tracking-tight">Metaobjects</h1>
        </div>
        <PrimaryButton onClick={() => navigate('/admin/metaobjects/new')}>
          <Plus className="h-3.5 w-3.5" />
          Add definition
        </PrimaryButton>
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
          <p className="text-xs">Loading types…</p>
        </div>
      ) : definitions.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs py-16 px-6 text-center">
          <Database className="h-7 w-7 mx-auto mb-3 text-neutral-400" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
            Add structured content the built-in models don't cover
          </h2>
          <p className="text-xs text-neutral-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Define a type once — a partner farm, a certification, an FAQ block — then add as many
            entries as you like. Every entry is served over the API for the storefront to render.
          </p>
          <div className="mt-4">
            <PrimaryButton onClick={() => navigate('/admin/metaobjects/new')} className="mx-auto">
              <Plus className="h-3.5 w-3.5" />
              Add definition
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 items-start">

          {/* ── Definitions ── */}
          <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">
            {definitions.map((d) => (
              <div
                key={d._id}
                className={`flex items-center gap-1 px-3 py-2.5 border-b border-[#e1e1e1] dark:border-neutral-800 last:border-0 transition-colors ${
                  active?._id === d._id ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50'
                }`}
              >
                <button onClick={() => loadEntries(d)} className="flex-1 min-w-0 text-left">
                  <span className="block text-xs font-semibold text-neutral-900 dark:text-white truncate">
                    {d.name}
                  </span>
                  <span className="block text-[11px] text-neutral-500">
                    {d.fields.length} {d.fields.length === 1 ? 'field' : 'fields'} · {d.entryCount} {d.entryCount === 1 ? 'entry' : 'entries'}
                  </span>
                </button>
                <button
                  onClick={() => navigate(`/admin/metaobjects/${d._id}`)}
                  title="Edit type"
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => deleteDefinition(d)}
                  title="Delete type"
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </section>

          {/* ── Entries ── */}
          {active ? (
            <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden">
              <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{active.name}</h2>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Handle <code className="font-mono">{active.handle}</code>
                    {active.description && ` · ${active.description}`}
                  </p>
                </div>
                <SecondaryButton onClick={() => { setEditingEntry(null); setModal({ kind: 'entry' }); }}>
                  <Plus className="h-3.5 w-3.5" />
                  Add entry
                </SecondaryButton>
              </div>

              {entries.length === 0 ? (
                <p className="text-xs text-neutral-500 py-10 text-center border-t border-[#e1e1e1] dark:border-neutral-800">
                  No entries yet
                </p>
              ) : (
                <div className="overflow-x-auto border-t border-[#e1e1e1] dark:border-neutral-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e1e1e1] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold bg-[#f7f7f7] dark:bg-[#161616]">
                        <th className="py-2.5 px-4">Entry</th>
                        {active.fields.slice(0, 3).map((f) => (
                          <th key={f.key} className="py-2.5 px-3">{f.label}</th>
                        ))}
                        {active.options?.activeDraftStatus !== false && (
                          <th className="py-2.5 px-3">Status</th>
                        )}
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e1e1e1] dark:divide-neutral-800">
                      {entries.map((e) => (
                        <tr key={e._id} className="hover:bg-[#f7f7f7] dark:hover:bg-neutral-800/50">
                          <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-white">
                            {displayOf(e, active)}
                          </td>
                          {active.fields.slice(0, 3).map((f) => (
                            <td key={f.key} className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 max-w-[180px] truncate">
                              {cellValue(e.fields?.[f.key])}
                            </td>
                          ))}
                          {active.options?.activeDraftStatus !== false && (
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                e.status === 'Draft'
                                  ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                  : 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300'
                              }`}>
                                {e.status || 'Active'}
                              </span>
                            </td>
                          )}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setEditingEntry(e); setModal({ kind: 'entry' }); }}
                                title="Edit entry"
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteEntry(e)}
                                title="Delete entry"
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs py-16 text-center">
              <ChevronRight className="h-5 w-5 mx-auto mb-2 text-neutral-400" />
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Pick a type to see its entries
              </p>
            </section>
          )}
        </div>
      )}

      {modal?.kind === 'entry' && active && (
        <EntryModal
          definition={active}
          entry={editingEntry}
          onClose={() => { setModal(null); setEditingEntry(null); }}
          onSaved={async () => { setModal(null); setEditingEntry(null); await loadEntries(active); await load(); }}
        />
      )}
    </div>
  );
};

export default AdminMetaobjects;
