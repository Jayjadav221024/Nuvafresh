import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  Search, User as UserIcon, ShoppingBag, ChevronDown, ChevronUp, ChevronRight, Shield, LogOut,
  Sparkles, Tag, ShieldCheck, Truck, Percent, Menu, X, Phone
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useContent } from '../../context/ContentContext';
import { NUVA_LOGO_BASE64 } from '../../assets/logoBase64';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, subscribeToStoreChanges } from '../../lib/storeSync';

/* The menu is built from the categories the merchant actually maintains in
   the admin, so adding, renaming or removing one changes the storefront nav.
   These names are only the pre-fetch placeholder — they match the seeded
   categories so the first paint is never empty. */
const FALLBACK_CATEGORY_NAMES = [
  'Fresh Produce',
  'Grains & Staples',
  'Pulses & Lentils',
  'Spices & Seasonings',
  'Oils & Ghee',
  'Healthy Sweeteners'
];

const SHOP_BY_COLLECTION = {
  id: 'collections',
  name: 'Shop by collection',
  hasSubmenu: false,
  path: '/collections'
};

/* A category link has to carry the category's exact name. The old menu linked
   to invented slugs (`fruits`, `ghee-oils`) that matched no product, so every
   one of these entries opened an empty Shop page. */
const toMenuEntry = (name) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name,
  hasSubmenu: false,
  path: `/shop?category=${encodeURIComponent(name)}`
});

const buildCategoriesMenu = (names) => [...names.map(toMenuEntry), SHOP_BY_COLLECTION];

const Navbar = () => {
  const { user, logout, openAuthModal } = useAuth();
  const { itemCount, setIsDrawerOpen, cartBump } = useCart();
  const { getContent } = useContent();

  const [categoriesMenu, setCategoriesMenu] = useState(() => buildCategoriesMenu(FALLBACK_CATEGORY_NAMES));

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await API.get('/admin/categories/public');
        const names = (data?.categories || [])
          .filter((c) => c.status !== 'Archived' && c.status !== 'Draft')
          .map((c) => c.name)
          .filter(Boolean);

        if (names.length > 0) setCategoriesMenu(buildCategoriesMenu(names));
      } catch (e) {
        // Keep the placeholder menu — the storefront must never lose its nav.
      }
    };

    loadCategories();
    return subscribeToStoreChanges(STORE_TOPICS.CATEGORIES, loadCategories);
  }, []);

  const marqueeText = getContent('sitewide.announcement', 'marqueeText', '🚚 Free shipping on all Gujarat farm orders above ₹499 • Use code WELCOME10 for 10% OFF!');
  const customLogoImage = getContent('sitewide.header', 'logoImage', '');
  const supportPhone = getContent('sitewide.header', 'supportPhone', '+91 92277 25359');
  const navHome = getContent('sitewide.header', 'navHome', 'Home');
  const navAbout = getContent('sitewide.header', 'navAbout', 'About');
  const navBlog = getContent('sitewide.header', 'navBlog', 'Blog');
  const navProducts = getContent('sitewide.header', 'navProducts', 'Products');
  const navContact = getContent('sitewide.header', 'navContact', 'Contact us');

  const [productsOpen, setProductsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const announcementItems = [
    { icon: Percent, text: marqueeText, highlight: 'ACTIVE' },
    { icon: ShieldCheck, text: 'Certified 4-Stage Ozone (O₃) Washed Produce', highlight: 'Chemical-Free' },
    { icon: Truck, text: 'Free Sunrise Express Doorstep Delivery on orders over', highlight: '₹499' }
  ];

  return (
    <header data-section-key="sitewide.header" className="sticky top-0 z-50 bg-white font-sans border-b border-neutral-200 cursor-pointer">
      
      {/* 1. Top Announcement Smooth Marquee Bar with Icons & Zero Emojis */}
      <div data-section-key="sitewide.announcement" className="bg-[#2d472c] text-white py-2 px-4 text-[11px] font-medium overflow-hidden border-b border-[#233822] select-none">
        <div className="animate-marquee-smooth flex items-center gap-12 whitespace-nowrap">
          {/* First loop track */}
          {announcementItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={`track1-${idx}`} className="flex items-center gap-2 text-neutral-100">
                <IconComponent className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{item.text}</span>
                <span className="font-bold text-emerald-300 bg-black/20 px-1.5 py-0.5 rounded text-[10px] tracking-wide border border-emerald-500/30">
                  {item.highlight}
                </span>
                <span className="text-emerald-600/70 ml-6">✦</span>
              </div>
            );
          })}

          {/* Second identical loop track for infinite seamless flow */}
          {announcementItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={`track2-${idx}`} className="flex items-center gap-2 text-neutral-100">
                <IconComponent className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{item.text}</span>
                <span className="font-bold text-emerald-300 bg-black/20 px-1.5 py-0.5 rounded text-[10px] tracking-wide border border-emerald-500/30">
                  {item.highlight}
                </span>
                <span className="text-emerald-600/70 ml-6">✦</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Navigation Bar matching exact 3-part layout: Left Logo | Center Nav Items | Right Action Icons */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Brand Official Logo (Nuva NUTRITION) */}
        <Link to="/" className="flex items-center gap-2 group shrink-0 py-1">
          <img 
            src={customLogoImage || NUVA_LOGO_BASE64} 
            alt="Nuva Nutrition" 
            className="h-10 sm:h-14 md:h-16 lg:h-[68px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Center: Main Nav Links (Home, About ⌄, Blog, Products ⌄, Contact us) */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[14px] font-medium text-[#2d472c]">
          
          {/* Home */}
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive ? 'text-[#82977f] font-semibold' : 'text-neutral-700 hover:text-[#2d472c] transition-colors'
            }
          >
            {navHome}
          </NavLink>

          {/* About Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <button 
              className={`flex items-center gap-1 py-2 transition-colors ${
                aboutOpen ? 'text-[#2d472c] font-semibold' : 'text-neutral-700 hover:text-[#2d472c]'
              }`}
            >
              <span>{navAbout}</span>
              <ChevronDown className="h-3.5 w-3.5 stroke-[2.2] text-neutral-600" />
            </button>

            {aboutOpen && (
              <div className="absolute top-full left-0 w-52 bg-white border border-neutral-200/90 shadow-xl py-2 rounded-md z-50 animate-fadeIn">
                <Link to="/our-story" onClick={() => setAboutOpen(false)} className="block px-4 py-2 text-xs sm:text-[13px] text-neutral-700 hover:bg-neutral-50 hover:text-[#2d472c]">
                  Our Story
                </Link>
                <Link to="/csr-initiatives" onClick={() => setAboutOpen(false)} className="block px-4 py-2 text-xs sm:text-[13px] text-neutral-700 hover:bg-neutral-50 hover:text-[#2d472c]">
                  CSR Initiatives
                </Link>
                <Link to="/ozone-shield" onClick={() => setAboutOpen(false)} className="block px-4 py-2 text-xs sm:text-[13px] text-neutral-700 hover:bg-neutral-50 hover:text-[#2d472c]">
                  Ozone Shield Standard
                </Link>
              </div>
            )}
          </div>

          {/* Blog */}
          <Link 
            to="/blogs" 
            className="text-neutral-700 hover:text-[#2d472c] transition-colors"
          >
            {navBlog}
          </Link>

          {/* Products Multi-Tier Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => {
              setProductsOpen(false);
              setActiveCategory(null);
            }}
          >
            <button 
              className={`flex items-center gap-1 py-2 transition-colors ${
                productsOpen ? 'text-[#2d472c] font-semibold' : 'text-neutral-700 hover:text-[#2d472c]'
              }`}
            >
              <span>{navProducts}</span>
              {productsOpen ? (
                <ChevronUp className="h-3.5 w-3.5 stroke-[2.2] text-[#2d472c]" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 stroke-[2.2] text-neutral-600" />
              )}
            </button>

            {/* Flyout Dropdown Menu */}
            {productsOpen && (
              <div className="absolute top-full left-0 flex items-start z-50 animate-fadeIn">
                
                {/* Level 1 Categories */}
                <div className="w-56 bg-white border border-neutral-200/90 shadow-xl py-3 divide-y divide-transparent">
                  {categoriesMenu.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onMouseEnter={() => {
                          if (cat.hasSubmenu) {
                            setActiveCategory(cat.id);
                          } else {
                            setActiveCategory(null);
                          }
                        }}
                        className={`group relative flex items-center justify-between px-4 py-2.5 text-xs sm:text-[13px] cursor-pointer transition-colors ${
                          isActive 
                            ? 'text-[#2d472c] font-bold bg-neutral-50/70 border-b border-[#2d472c]/40' 
                            : 'text-neutral-700 hover:text-[#2d472c] hover:bg-neutral-50'
                        }`}
                      >
                        {cat.hasSubmenu ? (
                          <span className={`w-full flex items-center justify-between ${isActive ? 'underline underline-offset-4 decoration-[#2d472c]' : ''}`}>
                            <span>{cat.name}</span>
                            <ChevronRight className="h-3.5 w-3.5 stroke-[2] text-neutral-500 group-hover:text-[#2d472c]" />
                          </span>
                        ) : (
                          <Link 
                            to={cat.path} 
                            className="w-full block"
                            onClick={() => setProductsOpen(false)}
                          >
                            {cat.name}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Level 2 Sub-Categories Flyout */}
                {activeCategory && (
                  <div className="w-48 bg-white border border-neutral-200/90 border-l-0 shadow-xl py-3 pl-6 pr-4 space-y-3 min-h-[140px] animate-fadeIn">
                    {categoriesMenu.find((c) => c.id === activeCategory)?.subcategories?.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        onClick={() => {
                          setProductsOpen(false);
                          setActiveCategory(null);
                        }}
                        className="block text-xs sm:text-[13px] font-semibold text-[#1e40af] hover:text-[#1d4ed8] hover:translate-x-1 transition-all"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>

          {/* B2B / Partnerships */}
          <NavLink 
            to="/b2b" 
            className={({ isActive }) => 
              isActive ? 'text-[#82977f] font-semibold' : 'text-neutral-700 hover:text-[#2d472c] transition-colors'
            }
          >
            B2B / Wholesale
          </NavLink>

          {/* Track Order */}
          <NavLink 
            to="/track-order" 
            className={({ isActive }) => 
              isActive ? 'text-[#2d472c] font-bold' : 'text-neutral-700 hover:text-[#2d472c] transition-colors'
            }
          >
            Track Order
          </NavLink>

          {/* Contact us */}
          <Link 
            to="/contact-us" 
            className="text-neutral-700 hover:text-[#2d472c] transition-colors"
          >
            {navContact}
          </Link>
        </nav>

        {/* Right: Action Icons (Search, User, Cart, Hamburger) */}
        <div className="flex items-center gap-2 sm:gap-5 text-neutral-800">
          
          {/* Admin badge if logged in as Admin */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-md bg-[#2d472c] text-white text-xs font-bold hover:bg-[#20341f] transition-colors shadow-sm"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {/* Search Trigger */}
          <Link
            to="/shop"
            title="Search catalog"
            className="p-1 sm:p-1.5 text-neutral-800 hover:text-[#2d472c] transition-colors"
          >
            <Search className="h-4 sm:h-5 w-4 sm:w-5 stroke-[1.8]" />
          </Link>

          {/* User Profile */}
          {user ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#2d472c] hidden sm:inline">{user.name.split(' ')[0]}</span>
              <button
                onClick={logout}
                title="Logout"
                className="p-1 sm:p-1.5 text-neutral-800 hover:text-error transition-colors"
              >
                <LogOut className="h-4 sm:h-5 w-4 sm:w-5 stroke-[1.8]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              title="Sign in / Account"
              className="p-1 sm:p-1.5 text-neutral-800 hover:text-[#2d472c] transition-colors"
            >
              <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 stroke-[1.8]" />
            </button>
          )}

          {/* Cart Icon with Fly-to-Cart destination target, shockwave ripple & bump animation */}
          <div className="relative">
            {cartBump && (
              <span className="absolute -inset-1.5 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
            )}
            <button
              id="navbar-cart-icon"
              onClick={() => setIsDrawerOpen(true)}
              title="Cart"
              className={`relative p-1 sm:p-1.5 text-neutral-800 hover:text-[#2d472c] transition-all duration-200 ${
                cartBump ? 'animate-cart-bump text-emerald-700' : ''
              }`}
            >
              <ShoppingBag className="h-4 sm:h-5 w-4 sm:w-5 stroke-[1.8]" />
              {itemCount > 0 && (
                <span className={`absolute top-0 right-0 h-4 min-w-4 px-1 rounded-full bg-[#2d472c] text-white text-[10px] font-bold flex items-center justify-center transition-all duration-300 ${
                  cartBump ? 'scale-125 bg-emerald-600 ring-2 ring-emerald-300 shadow-md' : ''
                }`}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1 sm:p-1.5 text-neutral-800 hover:text-[#2d472c] transition-colors"
            title="Open Menu"
          >
            <Menu className="h-5 sm:h-6 w-5 sm:w-6 stroke-[1.8]" />
          </button>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-fadeIn shadow-lg">
          
          <div className="flex flex-col gap-1 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-bold text-[#2d472c] hover:bg-neutral-50"
            >
              Home
            </Link>

            {/* About Accordion */}
            <div>
              <button
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-neutral-800 hover:bg-neutral-50 hover:text-[#2d472c]"
              >
                <span>About</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileAboutOpen ? 'rotate-180 text-[#2d472c]' : ''}`} />
              </button>

              {mobileAboutOpen && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-neutral-50/70 rounded-lg my-1">
                  <Link
                    to="/our-story"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-neutral-700 hover:text-[#2d472c]"
                  >
                    Our Story
                  </Link>
                  <Link
                    to="/csr-initiatives"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-neutral-700 hover:text-[#2d472c]"
                  >
                    CSR Initiatives
                  </Link>
                  <Link
                    to="/ozone-shield"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-neutral-700 hover:text-[#2d472c]"
                  >
                    Ozone Shield Standard
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium text-neutral-800 hover:bg-neutral-50 hover:text-[#2d472c]"
            >
              Blog
            </Link>

            <Link
              to="/b2b"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium text-neutral-800 hover:bg-neutral-50 hover:text-[#2d472c]"
            >
              B2B / Wholesale
            </Link>

            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-bold text-[#2d472c] hover:bg-emerald-50"
            >
              🚚 Track Live Order
            </Link>

            <Link
              to="/contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium text-neutral-800 hover:bg-neutral-50 hover:text-[#2d472c]"
            >
              {navContact}
            </Link>

            {/* Products Accordion */}
            <div>
              <button
                onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-neutral-800 hover:bg-neutral-50 hover:text-[#2d472c]"
              >
                <span>Products</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileProductsOpen ? 'rotate-180 text-[#2d472c]' : ''}`} />
              </button>

              {mobileProductsOpen && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-neutral-50/70 rounded-lg my-1">
                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-bold text-[#2d472c] hover:underline"
                  >
                    View All Products
                  </Link>
                  {/* Every entry is a link. Previously a category with no
                      subcategories rendered as a plain label, which left most
                      of the catalogue unreachable on mobile. */}
                  {categoriesMenu.map((cat) => (
                    <Link
                      key={cat.id}
                      to={cat.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-[#2d472c]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium text-neutral-800 hover:bg-neutral-50 hover:text-[#2d472c]"
            >
              Contact Us
            </Link>
          </div>

          {/* Account Quick Access on Mobile */}
          <div className="pt-3">
            {user ? (
              <div className="space-y-2 px-3">
                <p className="text-xs text-neutral-500">Signed in as <strong className="text-neutral-800">{user.name}</strong></p>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2 rounded-lg bg-[#2d472c] text-white text-xs font-bold"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="block w-full text-center py-2.5 rounded-lg bg-[#2d472c] text-white text-xs font-bold shadow-sm"
              >
                Sign In / Register
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
};

export default Navbar;
