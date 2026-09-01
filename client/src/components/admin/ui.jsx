import React from 'react';
import { X, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   ADMIN UI
   The chrome every Shopify-style admin screen shares — one definition,
   so a card on Files and a card on Testimonials are the same card and
   the Content section reads as one product rather than eight.
═══════════════════════════════════════════════════════════════════ */
export const controlBase =
  'px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors';

/* Width lives on the caller, never in the base: Tailwind emits `w-full`
   after the numeric widths, so baking it in makes every fixed width lose. */
export const inputClass = `w-full ${controlBase}`;

export const PageHeader = ({ icon: Icon, title, count, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />}
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {count !== undefined && (
        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-200/70 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
          {count}
        </span>
      )}
    </div>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
);

export const SecondaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 ${className}`}
  >
    {children}
  </button>
);

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-3.5 py-1.5 rounded-lg bg-[#202223] hover:bg-[#303030] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-1.5 ${className}`}
  >
    {children}
  </button>
);

export const IconButton = ({ onClick, title, danger, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
      danger
        ? 'text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
    }`}
  >
    {children}
  </button>
);

export const Card = ({ title, action, children, className = '', padded = true }) => (
  <section className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        {title && <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h2>}
        {action}
      </div>
    )}
    <div className={padded ? 'px-4 pb-4 pt-1' : ''}>{children}</div>
  </section>
);

const TONES = {
  success: 'bg-[#cbf4c9] text-[#0e621d] dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  neutral: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
};

export const Badge = ({ tone = 'neutral', children, onClick, title }) => {
  const className = `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${TONES[tone]}`;
  return onClick ? (
    <button type="button" onClick={onClick} title={title} className={`${className} hover:opacity-80 transition-opacity`}>
      {children}
    </button>
  ) : (
    <span className={className}>{children}</span>
  );
};

export const ErrorBanner = ({ message, onDismiss }) =>
  message ? (
    <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
      <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss}><X className="h-3.5 w-3.5" /></button>
      )}
    </div>
  ) : null;

/* The tab strip above a table — Shopify's "All / …" segment row. */
export const TabBar = ({ tabs, active, onChange, children }) => (
  <div className="px-3 py-2 border-b border-[#e1e1e1] dark:border-neutral-800 flex items-center justify-between gap-3">
    <div className="flex items-center gap-1 min-w-0 overflow-x-auto">
      {tabs.map((t) => {
        const key = typeof t === 'string' ? t : t.key;
        const label = typeof t === 'string' ? t : t.label;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              active === key
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
    {children && <div className="flex items-center gap-1 shrink-0">{children}</div>}
  </div>
);

export const TableCard = ({ children, className = '' }) => (
  <div className={`rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-xs overflow-hidden ${className}`}>
    {children}
  </div>
);

export const LoadingRow = ({ colSpan, label = 'Loading…' }) => (
  <tr>
    <td colSpan={colSpan} className="py-12 text-center text-neutral-500">
      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
      <span className="text-xs">{label}</span>
    </td>
  </tr>
);

export const EmptyRow = ({ colSpan, icon: Icon, title, hint, action }) => (
  <tr>
    <td colSpan={colSpan} className="py-14 text-center">
      {Icon && <Icon className="h-6 w-6 mx-auto mb-2 text-neutral-400" />}
      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{title}</p>
      {hint && <p className="text-[11px] text-neutral-500 mt-1">{hint}</p>}
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </td>
  </tr>
);

export const Pagination = ({ page, totalPages, total, pageSize, onChange, unit = 'items' }) => (
  <div className="p-3 border-t border-[#e1e1e1] dark:border-neutral-800 flex items-center gap-1 text-xs text-neutral-500">
    <button
      disabled={page === 1}
      onClick={() => onChange(Math.max(1, page - 1))}
      className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
    >
      <ChevronLeft className="h-3.5 w-3.5" />
    </button>
    <button
      disabled={page >= totalPages}
      onClick={() => onChange(Math.min(totalPages, page + 1))}
      className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-40"
    >
      <ChevronRight className="h-3.5 w-3.5" />
    </button>
    <span className="ml-2 font-medium">
      {total === 0
        ? `0 ${unit}`
        : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} of ${total} ${unit}`}
    </span>
  </div>
);

export const Modal = ({ title, onClose, children, footer, width = 'max-w-lg' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
    <div className={`w-full ${width} rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#d8d8d8] dark:border-neutral-800 shadow-2xl flex flex-col max-h-[85vh]`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#e1e1e1] dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h3>
        <IconButton onClick={onClose} title="Close"><X className="h-4 w-4" /></IconButton>
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

export const Field = ({ label, hint, required, children, counter }) => (
  <div className="space-y-1.5">
    {label && (
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          {label}
          {required && <span className="text-rose-600 ml-0.5">*</span>}
        </label>
        {counter}
      </div>
    )}
    {children}
    {hint && <p className="text-[11px] text-neutral-500">{hint}</p>}
  </div>
);
