import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Home, ShoppingBag, Package, Tag, Users, Sun, Moon, LogOut, Menu, X,
  KeyRound, FileText, ShieldCheck, Search, ExternalLink, ChevronRight,
  ChevronDown, Activity, Bell, Settings, Globe, Layers, CornerDownRight,
  MailCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/* ═══════════════════════════════════════════════════════════════════
   ADMIN NAVIGATION
   Shopify's information architecture, mapped one-to-one onto the pages
   this admin actually has. Every entry below resolves to a real route —
   no placeholder destinations.
═══════════════════════════════════════════════════════════════════ */
const NAV_STRUCTURE = [
  {
    type: 'link',
    label: 'Home',
    path: '/admin',
    icon: Home,
    end: true,
    keywords: ['home', 'dashboard', 'overview', 'metrics', 'stats']
  },
  {
    type: 'group',
    label: 'Orders',
    icon: ShoppingBag,
    children: [
      { label: 'All orders', path: '/admin/orders', keywords: ['orders', 'sales', 'fulfillment', 'shipping'] },
      { label: 'Drafts', path: '/admin/orders?view=drafts', keywords: ['drafts', 'pending', 'quotes'] },
      { label: 'Abandoned checkouts', path: '/admin/orders?view=abandoned', keywords: ['abandoned', 'cart', 'recovery'] }
    ]
  },
  {
    type: 'group',
    label: 'Products',
    icon: Package,
    children: [
      { label: 'All products', path: '/admin/products', keywords: ['products', 'catalog', 'produce', 'staples'] },
      { label: 'Collections', path: '/admin/categories', keywords: ['collections', 'categories', 'departments'] },
      { label: 'Inventory', path: '/admin/inventory', keywords: ['inventory', 'stock', 'warehouse', 'restock'] },
      { label: 'Transfers', path: '/admin/inventory?view=transfers', keywords: ['transfers', 'locations', 'logistics'] }
    ]
  },
  {
    type: 'group',
    label: 'Customers',
    icon: Users,
    children: [
      { label: 'All customers', path: '/admin/customers', keywords: ['customers', 'buyers', 'accounts', 'directory'] },
      { label: 'Reviews & ratings', path: '/admin/reviews', keywords: ['reviews', 'ratings', 'stars', 'feedback'] },
      { label: 'Inquiries', path: '/admin/inquiries', keywords: ['inquiries', 'contact', 'leads', 'messages'] },
      { label: 'Newsletter', path: '/admin/newsletter', keywords: ['newsletter', 'subscribers', 'mailing list'] }
    ]
  },
  {
    type: 'link',
    label: 'Discounts',
    path: '/admin/discounts',
    icon: Tag,
    keywords: ['discounts', 'coupons', 'vouchers', 'promo', 'deals', 'codes']
  },
  {
    type: 'group',
    label: 'Content',
    icon: Layers,
    children: [
      { label: 'Website Editor', path: '/admin/editor', badge: 'Live', keywords: ['editor', 'homepage', 'cms', 'sections', 'layout'] },
      { label: 'Metaobjects', path: '/admin/metaobjects', keywords: ['metaobjects', 'custom content', 'definitions', 'entries', 'structured'] },
      { label: 'Files', path: '/admin/files', keywords: ['files', 'media', 'images', 'uploads', 'library', 'assets'] },
      { label: 'Menus', path: '/admin/menus', keywords: ['menus', 'navigation', 'links', 'header', 'footer'] },
      { label: 'Blog posts', path: '/admin/blogs', keywords: ['blogs', 'articles', 'posts', 'journal'] },
      { label: '3D Video Reels', path: '/admin/reels', keywords: ['reels', 'videos', 'clips', 'shorts'] },
      { label: 'Testimonials', path: '/admin/testimonials', keywords: ['testimonials', 'stories', 'social proof'] },
      { label: 'FAQs & Help', path: '/admin/faqs', keywords: ['faqs', 'questions', 'help', 'support'] }
    ]
  },
  {
    type: 'group',
    label: 'Analytics',
    icon: Activity,
    children: [
      { label: 'Overview', path: '/admin/analytics', keywords: ['analytics', 'revenue', 'growth', 'kpi', 'dashboard'] },
      { label: 'Reports', path: '/admin/reports', keywords: ['reports', 'library', 'sessions', 'sales', 'acquisition'] },
      { label: 'Live View', path: '/admin/live-view', keywords: ['live', 'realtime', 'right now', 'visitors', 'globe'] }
    ]
  }
];

// Shopify's "Sales channels" block. Only the storefront is a real channel here.
const SALES_CHANNELS = [
  { label: 'Online Store', icon: Globe, path: '/', external: true }
];

// Shopify's bottom "Settings" popover, filled with this admin's system pages.
const SETTINGS_ITEMS = [
  { label: 'Staff & permissions', path: '/admin/roles', icon: KeyRound, keywords: ['roles', 'staff', 'permissions', 'rbac'] },
  { label: 'Email setup (SMTP)', path: '/admin/email-setup', icon: MailCheck, keywords: ['email', 'smtp', 'mail config'] },
  { label: 'Email templates', path: '/admin/email-templates', icon: FileText, keywords: ['templates', 'order email', 'html'] },
  { label: 'Security audit logs', path: '/admin/audit-logs', icon: ShieldCheck, keywords: ['audit', 'logs', 'security', 'sign-in'] }
];

// Flattened index powering the Ctrl+K command search.
const ALL_SEARCHABLE_ITEMS = [
  ...NAV_STRUCTURE.flatMap((item) =>
    item.type === 'group'
      ? item.children.map((c) => ({ ...c, group: item.label }))
      : [{ label: item.label, path: item.path, keywords: item.keywords, group: 'General' }]
  ),
  ...SETTINGS_ITEMS.map((s) => ({ ...s, group: 'Settings' }))
];


const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('nuva_admin_theme') === 'dark';
    } catch (e) {
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const searchInputRef = useRef(null);
  const userDropdownRef = useRef(null);
  const settingsMenuRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    try {
      localStorage.setItem('nuva_admin_theme', nextMode ? 'dark' : 'light');
    } catch (e) {}
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  /* `.dark` drives every dark: utility in the app now, so leaving it behind
     when the merchant clicks through to the storefront would darken a shop
     that has no dark theme. */
  useEffect(() => () => document.documentElement.classList.remove('dark'), []);

  // Global keyboard shortcut (Ctrl+K or /) to focus top Search Bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSearchQuery('');
        setIsSearchFocused(false);
        setUserDropdownOpen(false);
        setSettingsOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close the user dropdown and the settings popover when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Filter items matching the search query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_SEARCHABLE_ITEMS.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchGroup = item.group?.toLowerCase().includes(q);
      const matchPath = item.path.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some(k => k.toLowerCase().includes(q));
      return matchLabel || matchGroup || matchPath || matchKeywords;
    });
  }, [searchQuery]);

  /* ── Active-route matching ─────────────────────────────────────
     Several children share a pathname and differ only by ?view=
     (All orders / Drafts / Abandoned checkouts). NavLink ignores the
     query string, so it would light all three up at once — this
     compares the view param too.
  ─────────────────────────────────────────────────────────────── */
  const isNavActive = (to) => {
    const [path, search] = to.split('?');
    if (location.pathname !== path) return false;
    const wanted = new URLSearchParams(search || '').get('view');
    const current = new URLSearchParams(location.search).get('view');
    return (wanted || null) === (current || null);
  };

  const groupHasActiveChild = (group) => group.children.some((c) => isNavActive(c.path));

  const isSettingsRouteActive = SETTINGS_ITEMS.some((s) => location.pathname === s.path);

  // Shopify keeps the group containing the current page open.
  useEffect(() => {
    const owner = NAV_STRUCTURE.find(
      (item) => item.type === 'group' && item.children.some((c) => c.path.split('?')[0] === location.pathname)
    );
    if (owner) setExpandedGroups((prev) => (prev[owner.label] ? prev : { ...prev, [owner.label]: true }));
  }, [location.pathname]);

  // Shared item chrome so top-level links, children and channels match.
  const itemClass = (active) =>
    `flex items-center gap-2.5 px-3 py-[7px] rounded-lg transition-colors duration-150 ${
      active
        ? isDarkMode
          ? 'bg-[#2b2b2b] text-white font-bold'
          : 'bg-white text-[#1a1a1a] font-bold shadow-sm'
        : isDarkMode
          ? 'text-neutral-400 hover:text-white hover:bg-[#242424]'
          : 'text-[#474747] hover:text-[#1a1a1a] hover:bg-[#dedede]'
    }`;

  return (
    <div className={`admin-shell fixed inset-0 flex flex-col h-screen max-h-screen antialiased overflow-hidden ${
      isDarkMode ? 'dark bg-[#111213] text-[#e3e3e3]' : 'bg-[#ebebeb] text-[#1a1a1a]'
    }`}>
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BLACK NAVIGATION BAR (Shopify Admin Style)
      ───────────────────────────────────────────────────────────── */}
      <header className="h-14 bg-[#1a1a1a] text-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 select-none shadow-sm">
        
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3 w-64 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/admin" className="flex items-center gap-2 group">
            {/* Nuva Brand Badge & Title in Shopify Style */}
            <div className="h-7 w-7 rounded-lg bg-[#25d366] flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="text-xs font-black tracking-tight text-[#0a2912]">NV</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="brand-wordmark font-extrabold text-[15px] tracking-tight text-white">
                nuva
              </span>
              <span className="text-[11px] font-semibold text-neutral-400">
                admin
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar with CTRL K badge */}
        <div className="flex-1 max-w-xl mx-4 relative">
          <div className="relative flex items-center">
            <Search className="h-4 w-4 absolute left-3.5 text-neutral-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search in Nuva admin..."
              className="w-full h-9 pl-9 pr-16 bg-[#303030] hover:bg-[#383838] focus:bg-[#303030] text-white placeholder-neutral-400 text-xs font-medium rounded-lg border border-transparent focus:border-neutral-500 focus:outline-none transition-all duration-150"
            />
            <div className="absolute right-2.5 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#424242] text-[10px] font-mono text-neutral-300 font-semibold border border-neutral-600">
                  <span>CTRL</span>
                  <span>K</span>
                </kbd>
              )}
            </div>
          </div>

          {/* Quick Search Dropdown Modal */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-11 left-0 right-0 bg-[#242424] border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2 border-b border-neutral-700/60 flex items-center justify-between text-[11px] text-neutral-400 font-bold px-3">
                <span>RESULTS FOR "{searchQuery}"</span>
                <button
                  onClick={() => {
                    setIsSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Esc to close
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        navigate(item.path);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs text-neutral-200 hover:bg-[#333333] hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Search className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
                        {item.group}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-neutral-400 text-xs">
                    No matching admin sections or pages found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Tools, Live Store, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Live Storefront link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#303030] hover:bg-[#3d3d3d] text-neutral-200 hover:text-white text-xs font-medium transition-colors"
            title="Open Live Store"
          >
            <span>Live Store</span>
            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
          </a>

          {/* O3 Chamber status badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b3823] border border-[#25d366]/40 text-[#25d366] text-[11px] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25d366]"></span>
            </span>
            <span>O₃ Active</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#303030] transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Icon */}
          <button 
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#303030] transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500"></span>
          </button>

          {/* User Account Button (Green Avatar NN Nuva Nutrition style) */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#303030] transition-colors group"
            >
              {/* Green Rounded Square Avatar */}
              <div className="h-7 w-7 rounded-lg bg-[#25d366] text-[#0d351c] font-black text-xs flex items-center justify-center shadow-xs">
                NN
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-neutral-200 group-hover:text-white max-w-[110px] truncate">
                {user?.name || 'Nuva Nutrition'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition-transform" />
            </button>

            {/* User Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#242424] border border-neutral-700 rounded-xl shadow-xl py-2 z-50 animate-in fade-in">
                <div className="px-3.5 py-2 border-b border-neutral-700/60">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Nuva Nutrition'}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{user?.email || 'admin@nuvanutrition.com'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold">
                    Super Administrator
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/admin/roles"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-neutral-200 hover:bg-[#333333] hover:text-white"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Manage Staff & Access</span>
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-neutral-200 hover:bg-[#333333] hover:text-white"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Security Audit Logs</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-neutral-700/60">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN BODY WRAPPER: SIDEBAR + MAIN CONTENT CANVAS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-neutral-950/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar (Light Gray Shopify Navigation) */}
        <aside
          className={`admin-surface fixed lg:static inset-y-14 lg:inset-y-auto left-0 z-40 w-60 flex flex-col min-h-0 shrink-0 transition-transform duration-200 ease-in-out select-none border-r ${
            isDarkMode 
              ? 'bg-[#1a1a1a] border-neutral-800 text-neutral-300' 
              : 'bg-[#ebebeb] border-[#d8d8d8] text-[#303030]'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* ── Main navigation (Shopify information architecture) ── */}
          <nav className="flex-1 min-h-0 px-3 py-3 overflow-y-auto overscroll-contain space-y-0.5 text-xs font-semibold custom-scrollbar">

            {NAV_STRUCTURE.map((item) => {
              /* Plain top-level destination */
              if (item.type === 'link') {
                const active = isNavActive(item.path) || (!item.end && location.pathname.startsWith(`${item.path}/`));
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={itemClass(item.end ? location.pathname === item.path : active)}
                  >
                    <item.icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              /* Expandable group with a child list */
              const isExpanded = !!expandedGroups[item.label];
              const hasActiveChild = groupHasActiveChild(item);

              return (
                <div key={item.label} className="space-y-0.5">
                  <button
                    onClick={() => toggleGroup(item.label)}
                    aria-expanded={isExpanded}
                    className={`w-full justify-between ${itemClass(hasActiveChild && !isExpanded)}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Child list with the vertical tree connector */}
                  {isExpanded && (
                    <div className="relative pl-[26px] py-0.5 space-y-0.5">
                      <div
                        className={`absolute left-[15px] top-1 bottom-2 w-px ${
                          isDarkMode ? 'bg-neutral-800' : 'bg-[#d0d0d0]'
                        }`}
                      />

                      {item.children.map((sub) => {
                        const active = isNavActive(sub.path);
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`group/sub relative flex items-center justify-between gap-1.5 pl-2 pr-2.5 py-[7px] rounded-lg text-xs transition-colors duration-150 ${
                              active
                                ? isDarkMode
                                  ? 'bg-[#2b2b2b] text-white font-bold'
                                  : 'bg-white text-[#1a1a1a] font-bold shadow-sm'
                                : isDarkMode
                                  ? 'text-neutral-400 hover:text-white hover:bg-[#242424]'
                                  : 'text-[#595959] hover:text-[#1a1a1a] hover:bg-[#dedede]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 min-w-0">
                              {/* The ↳ marker Shopify shows on the active / hovered child */}
                              <CornerDownRight
                                className={`h-3 w-3 shrink-0 transition-opacity ${
                                  active
                                    ? 'opacity-100 text-neutral-500'
                                    : 'opacity-0 group-hover/sub:opacity-100 text-neutral-400'
                                }`}
                              />
                              <span className="truncate">{sub.label}</span>
                            </span>
                            {sub.badge && (
                              <span className="shrink-0 text-[9px] font-bold bg-[#25d366] text-[#0d351c] px-1.5 py-px rounded">
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Sales channels ── */}
            <div className="pt-4">
              <button
                onClick={() => setChannelsOpen((v) => !v)}
                aria-expanded={channelsOpen}
                className="w-full px-3 pb-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center justify-between hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                <span>Sales channels</span>
                <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${channelsOpen ? 'rotate-90' : ''}`} />
              </button>

              {channelsOpen && (
                <div className="space-y-0.5">
                  {SALES_CHANNELS.map((chan) => (
                    <a
                      key={chan.label}
                      href={chan.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${itemClass(false)} justify-between`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <chan.icon className="h-4 w-4 shrink-0 text-neutral-500" />
                        <span className="truncate">{chan.label}</span>
                      </span>
                      <ExternalLink className="h-3 w-3 text-neutral-400 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>

          </nav>

          {/* ── Bottom pinned Settings (opens the system pages) ── */}
          <div
            ref={settingsMenuRef}
            className={`relative p-2 border-t shrink-0 ${
              isDarkMode ? 'border-neutral-800 bg-[#161616]' : 'border-[#d8d8d8] bg-[#e4e4e4]'
            }`}
          >
            {settingsOpen && (
              <div
                className={`absolute bottom-full left-2 right-2 mb-2 rounded-xl border shadow-xl overflow-hidden py-1 ${
                  isDarkMode ? 'bg-[#242424] border-neutral-700' : 'bg-white border-[#d8d8d8]'
                }`}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-200/60 dark:border-neutral-700">
                  Store settings
                </div>
                {SETTINGS_ITEMS.map((s) => (
                  <Link
                    key={s.path}
                    to={s.path}
                    onClick={() => { setSettingsOpen(false); setSidebarOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors ${
                      location.pathname === s.path
                        ? isDarkMode ? 'bg-[#333333] text-white' : 'bg-[#f1f1f1] text-[#1a1a1a]'
                        : isDarkMode
                          ? 'text-neutral-300 hover:bg-[#333333] hover:text-white'
                          : 'text-[#474747] hover:bg-[#f1f1f1] hover:text-[#1a1a1a]'
                    }`}
                  >
                    <s.icon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span className="truncate">{s.label}</span>
                  </Link>
                ))}
              </div>
            )}

            <button
              onClick={() => setSettingsOpen((v) => !v)}
              aria-expanded={settingsOpen}
              className={`w-full justify-between ${itemClass(isSettingsRouteActive)}`}
            >
              <span className="flex items-center gap-2.5">
                <Settings className="h-4 w-4 shrink-0 stroke-[1.75]" />
                <span>Settings</span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

        </aside>

        {/* ─────────────────────────────────────────────────────────────
            3. MAIN CONTENT CANVAS (Full bleed for Website Editor, padded card for other pages)
        ───────────────────────────────────────────────────────────── */}
        <main className={`admin-surface flex-1 min-w-0 min-h-0 ${
          location.pathname === '/admin/editor'
            ? 'p-0 overflow-hidden'
            : 'p-3 sm:p-5 lg:p-6 overflow-y-auto overscroll-contain custom-scrollbar'
        } ${
          isDarkMode ? 'bg-[#111213]' : 'bg-[#ebebeb]'
        }`}>
          <div className={location.pathname === '/admin/editor' ? 'w-full h-full min-h-0' : 'max-w-[1400px] mx-auto pb-12'}>
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;


