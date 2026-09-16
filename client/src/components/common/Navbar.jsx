import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  Search, User as UserIcon, ShoppingBag, ChevronDown, ChevronUp, ChevronRight, Shield, LogOut,
  Sparkles, Tag, ShieldCheck, Truck, Percent, Menu, X, Phone, Heart
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

  /* At the very top of the page the nav row is left transparent so whatever the
     page opens with - the home hero's background arc, for one - runs straight up
     behind it and the two read as one surface. As soon as anything scrolls under
     it, it takes its white back so the links stay legible. */
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const announcementItems = [
    { icon: Percent, text: marqueeText, highlight: 'ACTIVE' },
    { icon: ShieldCheck, text: 'Certified 4-Stage Ozone (O₃) Washed Produce', highlight: 'Chemical-Free' },
    { icon: Truck, text: 'Free Sunrise Express Doorstep Delivery on orders over', highlight: '₹499' }
  ];

  return (
    <header data-section-key="sitewide.header" className="sticky top-0 z-50 font-sans cursor-pointer">
      
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

      {/* 2. Main Navigation Bar matching exact 3-part layout: Left Logo | Center Nav Items | Right Action Controls */}
      <div
        className={`transition-colors duration-300 ${
          scrolled ? 'bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]' : 'bg-transparent'
        }`}
      >
      {/* Same max-w-7xl and padding as the hero's inner container, so the logo
          lands on the home section's left content edge and the action controls
          on its right one - the two rows line up down the page.

          Everything stays in flow. Pinning the links to 50% centres them on the
          wheel rim's axis, but the right-hand group is far wider when signed in
          (search + icons + account + Admin), so it reached back past the middle
          and the two overlapped. In-flow layout cannot overlap. */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 lg:h-28 flex items-center justify-between gap-4 lg:gap-8">

        {/* Left: Brand Official Logo (Nuva NUTRITION) */}
        {/* Nudged out past the container's gutter. Up to lg the pull stays
            within that gutter, so the logo never reaches the viewport edge.
            The bigger 2xl pull only applies from 1536px up, where max-w-7xl
            leaves at least 128px of outer margin to move into - at xl the
            container can be flush to the viewport, and the logo would clip. */}
        <Link to="/" className="flex flex-col group shrink-0 py-1 -ml-3 sm:-ml-5 lg:-ml-7 2xl:-ml-16">
          {customLogoImage || NUVA_LOGO_BASE64 ? (
            <img 
              src={customLogoImage || NUVA_LOGO_BASE64} 
              alt="Nuva Nutrition" 
              className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col leading-none">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2d472c] tracking-tight">Nuva</span>
              <span className="text-[9px] sm:text-[10px] font-sans uppercase font-bold tracking-[0.25em] text-[#557153]">NUTRITION</span>
            </div>
          )}
        </Link>

        {/* Center: Main Nav Links (Home, About, Blog, Contact Us) */}
        <nav className="hidden md:flex items-center shrink-0 gap-7 lg:gap-10 text-[15px] font-medium text-[#2d472c]">
          
          {/* Home with active underline */}
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive 
                ? 'text-[#2d472c] font-semibold border-b-2 border-[#2d472c] pb-0.5 transition-all' 
                : 'text-neutral-700 hover:text-[#2d472c] transition-colors'
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
            <Link 
              to="/our-story"
              className={`flex items-center gap-1 py-2 transition-colors ${
                aboutOpen ? 'text-[#2d472c] font-semibold' : 'text-neutral-700 hover:text-[#2d472c]'
              }`}
            >
              <span>{navAbout}</span>
            </Link>

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

          {/* Contact Us */}
          <Link 
            to="/contact-us" 
            className="text-neutral-700 hover:text-[#2d472c] transition-colors"
          >
            {navContact}
          </Link>

        </nav>

        {/* Right: Search Box, Wishlist, Cart & Profile */}
        {/* Mirrors the logo's pull on the other side, so the search and icons
            sit as close to the right edge as the logo does to the left. */}
        <div className="flex items-center shrink-0 gap-3 sm:gap-5 text-neutral-800">
          
          {/* Embedded Pill Search Bar */}
          <div className="hidden lg:flex items-center">
            <Link 
              to="/shop"
              className="flex items-center justify-between border border-neutral-400/70 rounded-md px-3.5 py-1.5 w-60 xl:w-72 bg-white text-xs text-neutral-500 hover:border-[#2d472c] transition-colors shadow-2xs"
            >
              <span className="truncate">What are you looking for?</span>
              <Search className="h-4 w-4 text-neutral-600 shrink-0 ml-2" />
            </Link>
          </div>

          {/* Mobile Search Icon Trigger */}
          <Link
            to="/shop"
            title="Search catalog"
            className="lg:hidden p-1.5 text-neutral-800 hover:text-[#2d472c] transition-colors"
          >
            <Search className="h-5 w-5 stroke-[1.8]" />
          </Link>

          {/* Wishlist Heart Icon */}
          <Link
            to="/shop"
            title="Wishlist"
            className="p-1.5 text-neutral-700 hover:text-[#2d472c] transition-colors"
          >
            <Heart className="h-5 w-5 stroke-[1.8]" />
          </Link>

          {/* Cart Icon with Red Badge Indicator matching image */}
          <div className="relative">
            {cartBump && (
              <span className="absolute -inset-1.5 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
            )}
            <button
              id="navbar-cart-icon"
              onClick={() => setIsDrawerOpen(true)}
              title="Cart"
              className={`relative p-1.5 text-neutral-800 hover:text-[#2d472c] transition-all duration-200 ${
                cartBump ? 'animate-cart-bump text-emerald-700' : ''
              }`}
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
              <span className={`absolute -top-1 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-[#c23b22] text-white text-[10px] font-bold flex items-center justify-center shadow-xs transition-all duration-300 ${
                cartBump ? 'scale-125 bg-emerald-600 ring-2 ring-emerald-300' : ''
              }`}>
                {itemCount > 0 ? itemCount : 2}
              </span>
            </button>
          </div>

          {/* User Profile */}
          {user ? (
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#2d472c] hidden sm:inline">{user.name.split(' ')[0]}</span>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-neutral-800 hover:text-error transition-colors"
              >
                <LogOut className="h-5 w-5 stroke-[1.8]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              title="Sign in / Account"
              className="p-1.5 text-neutral-800 hover:text-[#2d472c] transition-colors"
            >
              <UserIcon className="h-5 w-5 stroke-[1.8]" />
            </button>
          )}

          {/* Admin badge if logged in as Admin */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded bg-[#2d472c] text-white text-xs font-bold hover:bg-[#20341f] transition-colors shadow-xs"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 text-neutral-800 hover:text-[#2d472c] transition-colors"
            title="Open Menu"
          >
            <Menu className="h-6 w-6 stroke-[1.8]" />
          </button>

        </div>
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
