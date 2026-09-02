import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import API from '../../api/axiosInstance';
import {
  PrimaryButton, SecondaryButton, IconButton, ErrorBanner,
  Modal, Field, inputClass, controlBase
} from '../../components/admin/ui';

/* ═══════════════════════════════════════════════════════════════════
   ROLES & PERMISSIONS (RBAC)
   Each card is a permission scope. Editing happens in a modal so the
   grid stays readable, and the screen list is picked from the admin's
   own navigation rather than typed from memory.
═══════════════════════════════════════════════════════════════════ */

/* The screens a role can be granted — mirrors the admin sidebar, plus the
   view-only variants support staff are usually limited to. */
const AVAILABLE_SCREENS = [
  'All Modules',
  'Orders', 'Orders (View Only)', 'Orders & Refunds', 'Drafts', 'Abandoned Checkouts',
  'Products', 'Collections', 'Inventory', 'Transfers',
  'Customers', 'Reviews', 'Reviews (View Only)', 'Inquiries', 'Newsletter',
  'Discounts', 'Coupons',
  'Website Editor', 'Metaobjects', 'Files', 'Menus', 'Blogs', 'Reels', 'Testimonials', 'FAQs',
  'Analytics', 'Financial Analytics', 'Reports', 'Live View',
  'Staff & Permissions', 'Email Setup', 'Email Templates', 'Audit Logs'
];

const SEED_ROLES = [
  { _id: 'role-1', name: 'Super Administrator', usersCount: 2, desc: 'Full unrestricted access across all 18 screens and database controls.', screens: ['All Modules', 'Website Editor', 'Financial Analytics', 'Orders & Refunds', 'Audit Logs'] },
  { _id: 'role-2', name: 'Operations & Dispatch Lead', usersCount: 4, desc: 'Manages live packaging, O3 batch logs, orders, and inventory thresholds.', screens: ['Orders', 'Inventory', 'Products', 'Inquiries'] },
  { _id: 'role-3', name: 'Marketing & Content Editor', usersCount: 3, desc: 'Visual Website Editor, Blogs, Coupons, Newsletter and Customer Reviews.', screens: ['Website Editor', 'Coupons', 'Reviews', 'Newsletter', 'Blogs'] },
  { _id: 'role-4', name: 'Customer Support Representative', usersCount: 2, desc: 'View customer inquiries, respond to tickets, and track order states.', screens: ['Inquiries', 'Orders (View Only)', 'Reviews (View Only)'] }
];

const blankForm = () => ({ name: '', desc: '', usersCount: 0, screens: [] });

const AdminRoles = () => {
  const [roles, setRoles] = useState(SEED_ROLES);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [customScreen, setCustomScreen] = useState('');
  const [saving, setSaving] = useState(false);

  const idOf = (role) => role._id || role.id;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get('/admin/roles');
        if (data.success && data.roles?.length > 0) setRoles(data.roles);
      } catch (e) {
        // The seeded scopes are what the screen falls back to anyway.
      }
    })();
  }, []);

  const open = (role) => {
    setEditing(role || 'new');
    setForm(role ? { ...blankForm(), ...role, screens: [...(role.screens || [])] } : blankForm());
    setCustomScreen('');
    setError('');
  };

  const toggleScreen = (screen) => {
    setForm((f) => ({
      ...f,
      screens: f.screens.includes(screen)
        ? f.screens.filter((s) => s !== screen)
        : [...f.screens, screen]
    }));
  };

  const addCustomScreen = () => {
    const screen = customScreen.trim();
    if (!screen || form.screens.includes(screen)) {
      setCustomScreen('');
      return;
    }
    setForm((f) => ({ ...f, screens: [...f.screens, screen] }));
    setCustomScreen('');
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError('A role needs a name.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      desc: form.desc.trim(),
      usersCount: Number(form.usersCount) || 0,
      screens: form.screens
    };

    try {
      if (editing === 'new') {
        const { data } = await API.post('/admin/roles', { ...payload, order: roles.length + 1 });
        setRoles([...roles, data?.role || { _id: `role-${Date.now()}`, ...payload }]);
      } else {
        const { data } = await API.put(`/admin/roles/${idOf(editing)}`, payload);
        setRoles(roles.map((r) => (idOf(r) === idOf(editing) ? (data?.role || { ...r, ...payload }) : r)));
      }
      setEditing(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save that role.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (role) => {
    if (!window.confirm(`Delete the "${role.name}" role? Staff assigned to it lose these permissions.`)) return;
    const previous = roles;
    setRoles(roles.filter((r) => idOf(r) !== idOf(role)));
    try {
      await API.delete(`/admin/roles/${idOf(role)}`);
    } catch (e) {
      setRoles(previous);
      setError(e.response?.data?.message || 'Could not delete that role.');
    }
  };

  return (
    <div className="space-y-6 font-sans">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            User Roles & Access Control (RBAC)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Define permission scopes, operational boundaries, and authorized screen access for staff members.
          </p>
        </div>
        <PrimaryButton onClick={() => open(null)} className="shrink-0">
          <Plus className="h-3.5 w-3.5" />
          Add role
        </PrimaryButton>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={idOf(role)} className="group p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <KeyRound className="h-4 w-4 shrink-0 text-[#2d472c] dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display truncate">
                    {role.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold">
                    {role.usersCount} Staff
                  </span>
                  {/* Revealed on hover so the grid still reads as a summary at rest. */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <IconButton onClick={() => open(role)} title="Edit role"><Pencil className="h-3.5 w-3.5" /></IconButton>
                    <IconButton onClick={() => remove(role)} title="Delete role" danger><Trash2 className="h-3.5 w-3.5" /></IconButton>
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {role.desc}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Authorized Screens:</span>
              <div className="flex flex-wrap gap-1.5">
                {(role.screens || []).length === 0 && (
                  <span className="text-[11px] text-neutral-400 italic">No screens granted yet.</span>
                )}
                {(role.screens || []).map((sc, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    {sc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Add tile keeps the grid balanced and gives the empty state somewhere to go. */}
        <button
          type="button"
          onClick={() => open(null)}
          className="p-6 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors flex flex-col items-center justify-center gap-2 min-h-[180px]"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs font-bold">Add a role</span>
          <span className="text-[11px] text-neutral-400">Define a new permission scope</span>
        </button>
      </div>

      {editing && (
        <Modal
          title={editing === 'new' ? 'Add role' : `Edit ${editing.name}`}
          onClose={() => setEditing(null)}
          width="max-w-2xl"
          footer={
            <>
              <SecondaryButton onClick={() => setEditing(null)} disabled={saving}>Cancel</SecondaryButton>
              <PrimaryButton onClick={save} disabled={saving || !form.name.trim()}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save role'}
              </PrimaryButton>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Role name" required>
              <input
                type="text"
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Operations & Dispatch Lead"
                className={inputClass}
              />
            </Field>

            <Field label="Description" hint="Shown on the role card to explain what this scope covers.">
              <textarea
                rows={3}
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="What this role is responsible for"
                className={inputClass}
              />
            </Field>

            <Field label="Staff assigned">
              <input
                type="number"
                min="0"
                value={form.usersCount}
                onChange={(e) => setForm({ ...form, usersCount: e.target.value })}
                className={`${controlBase} w-28`}
              />
            </Field>

            <Field
              label="Authorized screens"
              hint="Click a screen to grant or revoke it."
              counter={<span className="text-[11px] text-neutral-500">{form.screens.length} granted</span>}
            >
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                {AVAILABLE_SCREENS.map((screen) => {
                  const on = form.screens.includes(screen);
                  return (
                    <button
                      key={screen}
                      type="button"
                      onClick={() => toggleScreen(screen)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                        on
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                    >
                      {on && <Check className="h-3 w-3" />}
                      {screen}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Screens granted that aren't in the catalog — kept visible so they can be removed. */}
            {form.screens.some((s) => !AVAILABLE_SCREENS.includes(s)) && (
              <Field label="Custom screens">
                <div className="flex flex-wrap gap-1.5">
                  {form.screens.filter((s) => !AVAILABLE_SCREENS.includes(s)).map((screen) => (
                    <span
                      key={screen}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800"
                    >
                      {screen}
                      <button type="button" onClick={() => toggleScreen(screen)} title="Remove">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </Field>
            )}

            <Field label="Add a screen not listed">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customScreen}
                  onChange={(e) => setCustomScreen(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomScreen();
                    }
                  }}
                  placeholder="e.g. Vendor Payouts"
                  className={inputClass}
                />
                <SecondaryButton onClick={addCustomScreen} disabled={!customScreen.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </SecondaryButton>
              </div>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminRoles;
