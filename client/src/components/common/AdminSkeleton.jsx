import React from 'react';
import { Skeleton } from './Skeleton';

/* ═══════════════════════════════════════════════════════════════════
   ADMIN LOADING SCREEN (Shopify-style)

   Shopify never shows a spinner between admin screens — it paints the
   chrome it already knows about (top bar, sidebar, card grid) and fills
   the unknown parts with grey blocks, so the layout does not jump once
   the real screen arrives. This mirrors AdminLayout's frame: a 56px dark
   top bar, a 240px light sidebar, and a card grid on #f1f1f1.
═══════════════════════════════════════════════════════════════════ */

// AdminLayout owns the theme, but it is not mounted yet while this renders,
// so the preference is read straight from where the toggle stores it.
const prefersDarkAdmin = () => {
  try {
    return localStorage.getItem('nuva_admin_theme') === 'dark';
  } catch (e) {
    return false;
  }
};

const Card = ({ className = '', children }) => (
  <div
    className={`rounded-xl border border-[#e1e1e1] dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-xs p-5 ${className}`}
  >
    {children}
  </div>
);

const NAV_ROWS = ['w-24', 'w-20', 'w-28', 'w-16', 'w-24', 'w-20', 'w-32', 'w-24'];

const AdminSkeleton = () => (
  <div className={prefersDarkAdmin() ? 'dark' : ''}>
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f1f1f1] dark:bg-[#111213] font-sans select-none">

      {/* ── Top bar ── */}
      <div className="relative h-14 shrink-0 bg-[#1a1a1a] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-white/10 animate-pulse" />
          <div className="hidden sm:block h-3.5 w-20 rounded bg-white/10 animate-pulse" />
        </div>

        <div className="flex-1 max-w-[480px] mx-4">
          <div className="h-9 w-full rounded-lg bg-white/[0.07] animate-pulse" />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block h-7 w-20 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-7 w-7 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-7 w-7 rounded-lg bg-white/10 animate-pulse" />
        </div>

        {/* Indeterminate progress sliver, as the admin shows mid-navigation */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-white/5">
          <div className="h-full w-1/4 bg-[#25d366]/70 animate-[admin-progress_1.4s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* ── Sidebar + content ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-[#d8d8d8] dark:border-neutral-800 bg-[#ebebeb] dark:bg-[#1a1a1a] px-3 py-3">
          <div className="space-y-1.5">
            {NAV_ROWS.map((width, idx) => (
              <div key={idx} className="flex items-center gap-2.5 px-2 py-1.5">
                <Skeleton tone="admin" className="h-4 w-4 shrink-0" rounded="rounded" />
                <Skeleton tone="admin" className={`h-3 ${width}`} rounded="rounded" />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#d0d0d0] dark:border-neutral-800 space-y-1.5">
            <Skeleton tone="admin" className="h-2.5 w-24 ml-2" rounded="rounded" />
            {['w-28', 'w-20'].map((width, idx) => (
              <div key={idx} className="flex items-center gap-2.5 px-2 py-1.5">
                <Skeleton tone="admin" className="h-4 w-4 shrink-0" rounded="rounded" />
                <Skeleton tone="admin" className={`h-3 ${width}`} rounded="rounded" />
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-hidden p-4 sm:p-6">
          <div className="max-w-[1400px] mx-auto space-y-5">

            {/* Page header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton tone="admin" className="h-8 w-8 shrink-0" rounded="rounded-lg" />
                <Skeleton tone="admin" className="h-5 w-40 sm:w-56" rounded="rounded-md" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Skeleton tone="admin" className="h-8 w-20 hidden sm:block" rounded="rounded-lg" />
                <Skeleton tone="admin" className="h-8 w-24" rounded="rounded-lg" />
              </div>
            </div>

            {/* Metric row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <Card key={i} className="space-y-3">
                  <Skeleton tone="admin" className="h-2.5 w-20" rounded="rounded" />
                  <Skeleton tone="admin" className="h-6 w-24" rounded="rounded-md" />
                  <Skeleton tone="admin" className="h-2.5 w-16" rounded="rounded" />
                </Card>
              ))}
            </div>

            {/* Primary card + side column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton tone="admin" className="h-3.5 w-32" rounded="rounded" />
                  <Skeleton tone="admin" className="h-3 w-16" rounded="rounded" />
                </div>
                <div className="space-y-3 pt-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton tone="admin" className="h-9 w-9 shrink-0" rounded="rounded-lg" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton tone="admin" className="h-3 w-2/5" rounded="rounded" />
                        <Skeleton tone="admin" className="h-2.5 w-1/4" rounded="rounded" />
                      </div>
                      <Skeleton tone="admin" className="h-3 w-14 shrink-0" rounded="rounded" />
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-5">
                <Card className="space-y-3">
                  <Skeleton tone="admin" className="h-3.5 w-24" rounded="rounded" />
                  <Skeleton tone="admin" className="h-28 w-full" rounded="rounded-lg" />
                </Card>
                <Card className="space-y-3">
                  <Skeleton tone="admin" className="h-3.5 w-28" rounded="rounded" />
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} tone="admin" className="h-3 w-full" rounded="rounded" />
                  ))}
                </Card>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  </div>
);

export default AdminSkeleton;
