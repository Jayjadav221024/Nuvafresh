import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, FolderTree, Tag, Users, Boxes,
  Edit3, BookOpen, Star, HelpCircle, Image, Mail, MailCheck, MessageSquare,
  Shield, KeyRound, FileText, Sun, Moon, LogOut, Menu, X, ShieldCheck,
  Search, ExternalLink, ChevronRight, Activity, ArrowUpRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NUVA_LOGO_BASE64 } from '../assets/logoBase64';

const NAV_GROUPS = [
  {
    heading: null,
    items: [
      { 
        label: 'Dashboard', 
        path: '/admin', 
        icon: LayoutDashboard, 
        end: true,
        group: 'OVERVIEW',
        description: 'Store performance metrics, sales, and operations overview',
        keywords: ['home', 'overview', 'metrics', 'stats', 'analytics', 'summary', 'charts']
      }
    ]
  },
  {
    heading: 'SELLING',
    items: [
      { 
        label: 'Orders', 
        path: '/admin/orders', 
        icon: ShoppingBag,
        group: 'SELLING',
        description: 'Track customer purchases and fulfillment status',
        keywords: ['purchases', 'fulfillment', 'shipment', 'tracking', 'invoices', 'sales', 'cart']
      },
      { 
        label: 'Products', 
        path: '/admin/products', 
        icon: Package,
        group: 'SELLING',
        description: 'Manage cold-pressed oil catalog, pricing, and variants',
        keywords: ['items', 'inventory', 'pricing', 'cold pressed', 'edible oils', 'catalog', 'stock']
      },
      { 
        label: 'Categories', 
        path: '/admin/categories', 
        icon: FolderTree,
        group: 'SELLING',
        description: 'Organize products into departments and collections',
        keywords: ['collections', 'taxonomies', 'departments', 'groups', 'types']
      },
      { 
        label: 'Coupons & Discounts', 
        path: '/admin/coupons', 
        icon: Tag,
        group: 'SELLING',
        description: 'Promotional voucher codes and discount rules',
        keywords: ['promo', 'vouchers', 'discount', 'offers', 'deals', 'sale', 'coupons']
      },
      { 
        label: 'Customers', 
        path: '/admin/customers', 
        icon: Users,
        group: 'SELLING',
        description: 'Customer directory, order histories, and profiles',
        keywords: ['users', 'clients', 'buyers', 'profiles', 'accounts', 'directory']
      },
      { 
        label: 'Inventory', 
        path: '/admin/inventory', 
        icon: Boxes,
        group: 'SELLING',
        description: 'Stock levels, warehouse tracking, and restock alerts',
        keywords: ['stock', 'warehouse', 'restock', 'quantities', 'supplies', 'levels']
      }
    ]
  },
  {
    heading: 'CONTENT',
    items: [
      { 
        label: 'Website Editor', 
        path: '/admin/editor', 
        icon: Edit3, 
        badge: 'Live',
        group: 'CONTENT',
        description: 'Live visual editor for homepage hero banners and layout',
        keywords: ['homepage', 'cms', 'banners', 'announcements', 'layout', 'design', 'customizer']
      },
      { 
        label: '3D Video Reels', 
        path: '/admin/reels', 
        icon: Image,
        group: 'CONTENT',
        description: 'Interactive vertical 3D reels and showcase video media',
        keywords: ['media', 'reels', 'videos', 'interactive', 'clips', 'stories', 'shorts']
      },
      { 
        label: 'Blogs', 
        path: '/admin/blogs', 
        icon: BookOpen,
        group: 'CONTENT',
        description: 'Publish wellness guides and educational health articles',
        keywords: ['articles', 'posts', 'recipes', 'wellness', 'news', 'seo', 'content']
      },
      { 
        label: 'Testimonials', 
        path: '/admin/testimonials', 
        icon: Star,
        group: 'CONTENT',
        description: 'Customer stories, video reviews, and endorsements',
        keywords: ['endorsements', 'feedback', 'stories', 'ratings', 'social proof']
      },
      { 
        label: 'FAQs', 
        path: '/admin/faqs', 
        icon: HelpCircle,
        group: 'CONTENT',
        description: 'Frequently asked questions and knowledgebase',
        keywords: ['questions', 'answers', 'help', 'support', 'knowledgebase', 'ozone']
      }
    ]
  },
  {
    heading: 'ENGAGEMENT',
    items: [
      { 
        label: 'Inquiries (Contact)', 
        path: '/admin/inquiries', 
        icon: MessageSquare,
        group: 'ENGAGEMENT',
        description: 'Inbound customer contact messages and inquiries',
        keywords: ['contact', 'messages', 'leads', 'support tickets', 'distributor', 'forms']
      },
      { 
        label: 'Newsletter Subscribers', 
        path: '/admin/newsletter', 
        icon: MailCheck,
        group: 'ENGAGEMENT',
        description: 'Email subscribers list and marketing audience',
        keywords: ['subscribers', 'mailing list', 'emails', 'leads', 'audience', 'marketing']
      },
      { 
        label: 'Reviews & Ratings', 
        path: '/admin/reviews', 
        icon: Star,
        group: 'ENGAGEMENT',
        description: 'Moderate customer reviews, star ratings, and feedback',
        keywords: ['feedback', 'stars', 'ratings', 'comments', 'moderation', 'social proof']
      }
    ]
  },
  {
    heading: 'SYSTEM',
    items: [
      { 
        label: 'Revenue & Analytics', 
        path: '/admin/analytics', 
        icon: Activity,
        group: 'SYSTEM',
        description: 'Financial reports and revenue conversion metrics',
        keywords: ['revenue', 'sales stats', 'reports', 'financial', 'graphs', 'growth', 'kpi']
      },
      { 
        label: 'Email Setup', 
        path: '/admin/email-setup', 
        icon: Mail,
        group: 'SYSTEM',
        description: 'SMTP server configuration and transactional mail',
        keywords: ['smtp', 'mail config', 'notifications', 'sendgrid', 'mailer', 'settings']
      },
      { 
        label: 'Email Templates', 
        path: '/admin/email-templates', 
        icon: FileText,
        group: 'SYSTEM',
        description: 'Customize HTML transactional email templates',
        keywords: ['templates', 'order email', 'welcome mail', 'html templates', 'branding']
      },
      { 
        label: 'Sign-in & Audit Logs', 
        path: '/admin/audit-logs', 
        icon: Shield,
        group: 'SYSTEM',
        description: 'Security access trail and admin IP audit logs',
        keywords: ['security', 'audit', 'logs', 'history', 'ip address', 'compliance', 'sessions']
      },
      { 
        label: 'User Roles & Access', 
        path: '/admin/roles', 
        icon: KeyRound,
        group: 'SYSTEM',
        description: 'Role-based access control (RBAC) and permissions',
        keywords: ['rbac', 'permissions', 'staff', 'super admin', 'access control', 'privileges']
      }
    ]
  }
];

// Flatten all navigation items for instant search filtering
const ALL_ADMIN_NAV_ITEMS = NAV_GROUPS.flatMap(group => group.items);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchInputRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Global keyboard shortcut (Ctrl+K or /) to focus the Sidebar Search Bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSidebarOpen(true);
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setSidebarOpen(true);
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter items matching the search query
  const filteredNavItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null; // When empty, show normal full grouped navigation
    return ALL_ADMIN_NAV_ITEMS.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchGroup = item.group?.toLowerCase().includes(q);
      const matchPath = item.path.toLowerCase().includes(q);
      const matchDescription = item.description?.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some(k => k.toLowerCase().includes(q));
      return matchLabel || matchGroup || matchPath || matchDescription || matchKeywords;
    });
  }, [searchQuery]);

  return (
    <div className={`flex h-screen font-sans antialiased overflow-hidden ${isDarkMode ? 'dark admin-theme-dark bg-neutral-950 text-neutral-100' : 'admin-theme-light bg-[#f7f6f2] text-neutral-900'}`}>
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Fixed left with full RBAC & Grouped Architecture) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out border-r ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className={`h-20 flex items-center justify-between px-6 border-b shrink-0 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <div className="flex items-center gap-3">
            <img 
              src={NUVA_LOGO_BASE64} 
              alt="Nuva Nutrition Admin" 
              className="h-9 w-auto object-contain bg-white dark:bg-neutral-800 p-1 rounded-lg"
            />
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              Admin
            </span>
          </div>
          <button 
            className="lg:hidden text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar section (Located directly before the Dashboard button) */}
        <div className={`p-3 pb-2 border-b shrink-0 ${isDarkMode ? 'border-neutral-800/80 bg-neutral-900/60' : 'border-neutral-100 bg-[#fbfaf7]'}`}>
          <div className={`relative flex items-center rounded-xl border transition-all duration-150 ${
            searchQuery
              ? isDarkMode
                ? 'bg-neutral-800 border-emerald-500 ring-1 ring-emerald-500/20'
                : 'bg-white border-[#2d472c] ring-1 ring-[#2d472c]/20 shadow-xs'
              : isDarkMode 
                ? 'bg-neutral-800/60 border-neutral-700/80 hover:border-neutral-600 focus-within:border-emerald-500' 
                : 'bg-neutral-100/90 border-neutral-200 hover:border-neutral-300 focus-within:border-[#2d472c] focus-within:bg-white'
          }`}>
            <Search className="h-3.5 w-3.5 ml-3 mr-2 text-neutral-400 shrink-0 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search navbar details..."
              className="w-full py-2 bg-transparent text-xs font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
            />
            <div className="pr-2 flex items-center shrink-0">
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 rounded border border-neutral-300/80 dark:border-neutral-700/80 bg-neutral-200/50 dark:bg-neutral-800 text-[9px] font-mono text-neutral-400">
                  <span>Ctrl</span>
                  <span>K</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items (Real-time Filtered or Full Grouped Navigation) */}
        <nav className="flex-1 px-3 py-3 space-y-6 overflow-y-auto custom-scrollbar">
          {filteredNavItems !== null ? (
            /* Search Results Mode */
            <div className="space-y-1">
              <div className="px-3 pb-1 flex items-center justify-between text-[11px] font-extrabold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase font-display">
                <span>Matching Details ({filteredNavItems.length})</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] lowercase font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    reset
                  </button>
                )}
              </div>

              {filteredNavItems.length > 0 ? (
                filteredNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => {
                      setSidebarOpen(false);
                      setSearchQuery('');
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#2d472c] text-white shadow-sm font-extrabold'
                          : isDarkMode
                          ? 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                          : 'text-neutral-800 hover:bg-[#f1eee7] hover:text-[#2d472c]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon className="h-4 w-4 stroke-[2.2] shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <span>{item.label}</span>
                          {item.group && (
                            <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              isDarkMode 
                                ? 'bg-neutral-800 border-neutral-700 text-neutral-300' 
                                : 'bg-white border-neutral-300 text-neutral-700 font-bold'
                            }`}>
                              {item.group}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))
              ) : (
                <div className="p-4 text-center">
                  <Search className="h-6 w-6 text-neutral-400 dark:text-neutral-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    No navbar details found
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    No admin section matches "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Default Grouped Navigation (Starts with Dashboard Button) */
            NAV_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {group.heading && (
                  <div className="px-3 pb-1 text-[11px] font-extrabold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase font-display">
                    {group.heading}
                  </div>
                )}
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#2d472c] text-white shadow-sm font-extrabold'
                          : isDarkMode
                          ? 'text-neutral-200 hover:bg-neutral-800 hover:text-white'
                          : 'text-neutral-800 hover:bg-[#f1eee7] hover:text-[#2d472c]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 stroke-[2.2]" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))
          )}
        </nav>

        {/* Account Footer with Dark Mode Switcher & Session State */}
        <div className={`p-4 border-t shrink-0 ${isDarkMode ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-[#faf9f5]'}`}>
          {/* User Profile Card */}
          <div className={`flex items-center gap-3 px-3 py-2.5 mb-3 rounded-xl border ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'} shadow-sm`}>
            <div className="h-8 w-8 rounded-full bg-[#2d472c] text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-neutral-900 dark:text-white">{user?.name || 'Nuva Lead Officer'}</p>
              <p className="text-[10px] text-neutral-500 truncate">{user?.role === 'admin' ? 'Super Administrator' : 'Staff Admin'}</p>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>

          {/* Controls: Theme & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                isDarkMode ? 'border-neutral-700 hover:bg-neutral-800 text-amber-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar Header */}
        <header className={`h-20 border-b flex items-center justify-between px-6 lg:px-8 shrink-0 ${
          isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white/80 border-neutral-200'
        } backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-extrabold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest hidden sm:inline font-display">
              NUVA · Admin Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Storefront Quick Link */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <span>Open Live Store</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {/* O3 Chamber Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Aqueous O₃ System Active</span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route View */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;

