import React, { useState } from 'react';
import { KeyRound, Shield, Check, Plus, Users, Lock } from 'lucide-react';

const SEED_ROLES = [
  { id: 'role-1', name: 'Super Administrator', usersCount: 2, desc: 'Full unrestricted access across all 18 screens and database controls.', screens: ['All Modules', 'Website Editor', 'Financial Analytics', 'Orders & Refunds', 'Audit Logs'] },
  { id: 'role-2', name: 'Operations & Dispatch Lead', usersCount: 4, desc: 'Manages live packaging, O3 batch logs, orders, and inventory thresholds.', screens: ['Orders', 'Inventory', 'Products', 'Inquiries'] },
  { id: 'role-3', name: 'Marketing & Content Editor', usersCount: 3, desc: 'Visual Website Editor, Blogs, Coupons, Newsletter and Customer Reviews.', screens: ['Website Editor', 'Coupons', 'Reviews', 'Newsletter', 'Blogs'] },
  { id: 'role-4', name: 'Customer Support Representative', usersCount: 2, desc: 'View customer inquiries, respond to tickets, and track order states.', screens: ['Inquiries', 'Orders (View Only)', 'Reviews (View Only)'] }
];

const AdminRoles = () => {
  const [roles] = useState(SEED_ROLES);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
          User Roles & Access Control (RBAC)
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Define permission scopes, operational boundaries, and authorized screen access for staff members.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#2d472c] dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display">
                    {role.name}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold">
                  {role.usersCount} Staff
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {role.desc}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Authorized Screens:</span>
              <div className="flex flex-wrap gap-1.5">
                {role.screens.map((sc, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    {sc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminRoles;
