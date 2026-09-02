import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown, ChevronRight, Search, Eye, EyeOff, Smartphone, Tablet, Laptop,
  Plus, ArrowLeft, Save, Check, X, Layers, Sparkles, ExternalLink, Undo2,
  SlidersHorizontal, Trash2, GripVertical, Type, Image as ImageIcon, Video,
  Shield, Star, Columns, Upload, FileText, Package, LayoutGrid, Megaphone,
  PanelTop, PanelBottom, Award, Instagram, PlayCircle, Store, Phone, Users,
  ArrowUp, ArrowDown, Loader2, MousePointerClick, AlertCircle
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, publishStoreChange } from '../../lib/storeSync';
import { MASTER_CMS_SECTIONS } from '../../data/defaultMasterSections';
import { ContentContext, useContent } from '../../context/ContentContext';
import { Skeleton } from '../../components/common/Skeleton';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import HeroBanner from '../../components/home/HeroBanner';
import WherePurityGrowsSection from '../../components/home/WherePurityGrowsSection';
import FarmersWayOfLifeSection from '../../components/home/FarmersWayOfLifeSection';
import RegenerativeFarmingSection from '../../components/home/RegenerativeFarmingSection';
import RegenerativeVideoSection from '../../components/home/RegenerativeVideoSection';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import Reel3DSection from '../../components/home/Reel3DSection';
import UVOzonePurificationSection from '../../components/home/UVOzonePurificationSection';
import CertificationsSection from '../../components/home/CertificationsSection';
import BlogSection from '../../components/home/BlogSection';
import InstagramFollowSection from '../../components/home/InstagramFollowSection';
import ProductCard from '../../components/home/ProductCard';
import OurStoryPage from '../OurStoryPage';
import ShopPage from '../ShopPage';
import ProductDetailPage from '../ProductDetailPage';
import ContactPage from '../ContactPage';
import B2BPage from '../B2BPage';
import BlogPage from '../BlogPage';

/* ═══════════════════════════════════════════════════════════════════
   EDITOR PAGE MAP
   Each editor "page" pulls its section catalogue straight out of the
   CMS schema (page property), so a new seeded section shows up in the
   tree and gets a full edit form with zero extra code here.
═══════════════════════════════════════════════════════════════════ */
const EDITOR_PAGES = [
  { id: 'home', label: 'Home page', cmsPages: ['HOME PAGE'], route: '/' },
  { id: 'about', label: 'About us', cmsPages: ['ABOUT US'], route: '/our-story' },
  { id: 'shop', label: 'Products / Shop', cmsPages: ['SHOP'], route: '/shop' },
  { id: 'product', label: 'Product page', cmsPages: ['PRODUCT DETAIL'], route: '/shop' },
  { id: 'b2b', label: 'B2B / B2C Partner', cmsPages: ['B2B', 'B2B (WHOLESALE)'], route: '/b2b' },
  { id: 'contact', label: 'Contact us', cmsPages: ['CONTACT'], route: '/contact-us' },
  { id: 'blog', label: 'Blog', cmsPages: ['BLOG'], route: '/blogs' }
];

// Preferred visual order — matches top-to-bottom order on the real storefront.
// Any section not listed here is appended after these, so nothing is ever lost.
const SECTION_ORDER = [
  'sitewide.announcement', 'sitewide.header',
  'home.hero', 'home.purity', 'home.farmers', 'home.regenerative', 'home.video',
  'home.testimonials', 'home.video_shopping', 'home.uv_ozone', 'home.certifications',
  'home.blog', 'home.instagram',
  'about.hero', 'about.story', 'about.facilities', 'about.ozone_usp', 'about.sustainable_packaging',
  'about.fresh_field', 'about.farmers_support', 'about.cta',
  'shop.header',
  'pdp.hero', 'pdp.promo', 'pdp.pillars', 'pdp.comparison', 'pdp.faq', 'pdp.reviews',
  'b2b.hero', 'b2b.process', 'b2b.catalogue', 'b2b.brands', 'b2b.certifications', 'b2b.hubs', 'b2b.thankyou',
  'contact.form', 'contact.info', 'contact.features',
  'blog.hero',
  'footer.contact'
];

const SECTION_ICONS = {
  'sitewide.announcement': Megaphone,
  'sitewide.header': PanelTop,
  'home.hero': LayoutGrid,
  'home.purity': Type,
  'home.farmers': ImageIcon,
  'home.regenerative': Columns,
  'home.video': Video,
  'home.uv_ozone': Shield,
  'home.testimonials': Star,
  'home.video_shopping': PlayCircle,
  'home.certifications': Award,
  'home.blog': FileText,
  'home.instagram': Instagram,
  'about.hero': Sparkles,
  'about.story': Users,
  'about.facilities': Store,
  'about.ozone_usp': Shield,
  'about.sustainable_packaging': Package,
  'about.fresh_field': Video,
  'about.farmers_support': Users,
  'about.cta': Megaphone,
  'b2b.catalogue': LayoutGrid,
  'b2b.brands': Award,
  'b2b.certifications': Shield,
  'b2b.hubs': Store,
  'b2b.thankyou': Megaphone,
  'contact.form': Type,
  'contact.features': Columns,
  'shop.header': Store,
  'pdp.hero': Package,
  'pdp.promo': Megaphone,
  'pdp.pillars': Shield,
  'pdp.comparison': Columns,
  'pdp.faq': FileText,
  'pdp.reviews': Star,
  'contact.info': Phone,
  'footer.contact': PanelBottom
};

/* Real device viewports. The preview frame keeps its height rather than growing
   to fit its content: it makes `100vh` inside the storefront mean what it means
   on the device, and it stops a `min-h-screen` section from feeding its own
   height back into the frame. */
const VIEWPORTS = {
  desktop: { width: '100%', height: 900, label: 'Desktop', icon: Laptop },
  tablet: { width: '820px', height: 1100, label: 'Tablet', icon: Tablet },
  mobile: { width: '390px', height: 844, label: 'Mobile', icon: Smartphone }
};

const deepClone = (value) => JSON.parse(JSON.stringify(value ?? {}));

// Best-effort human label for a repeatable-group item shown in the section tree.
const blockLabel = (item, index) => {
  if (!item || typeof item !== 'object') return `Block ${index + 1}`;
  const candidate = item.title || item.name || item.heading || item.label || item.caption || item.question;
  const text = typeof candidate === 'string' ? candidate.trim() : '';
  return text ? text : `Block ${index + 1}`;
};

/* ═══════════════════════════════════════════════════════════════════
   FIELD CONTROLS (rendered from the CMS fieldsSchema)
═══════════════════════════════════════════════════════════════════ */
const FieldLabel = ({ field }) => (
  <div className="space-y-0.5">
    <label className="text-[11px] font-semibold text-neutral-800 block leading-tight">
      {field.label || field.name}
    </label>
    {field.helperText && (
      <p className="text-[10px] text-neutral-400 leading-snug line-clamp-2">{field.helperText}</p>
    )}
  </div>
);

const TextControl = ({ field, value, onChange, multiline }) => (
  <div className="space-y-1.5">
    <FieldLabel field={field} />
    {multiline ? (
      <textarea
        rows={4}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs leading-relaxed text-neutral-900 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors"
      />
    ) : (
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-900 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] transition-colors"
      />
    )}
  </div>
);

const ImageControl = ({ field, value, onChange }) => {
  const inputId = `img-${field.name}-${Math.random().toString(36).slice(2, 8)}`;

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <FieldLabel field={field} />
      <div className="flex items-center gap-2">
        <div className="h-11 w-11 shrink-0 rounded-lg border border-neutral-300 bg-neutral-50 overflow-hidden flex items-center justify-center">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-4 w-4 text-neutral-300" />
          )}
        </div>
        <label
          htmlFor={inputId}
          className="flex-1 cursor-pointer px-3 py-2 rounded-lg border border-dashed border-neutral-300 hover:border-[#005bd3] hover:bg-blue-50/40 text-center text-[11px] font-semibold text-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Upload className="h-3.5 w-3.5 text-neutral-500" />
          <span>Upload image</span>
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          placeholder="…or paste an image URL"
          value={typeof value === 'string' && value.startsWith('data:') ? '' : (value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-[11px] outline-none focus:border-[#005bd3]"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Clear image"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

/* Mirrors the bestsellers grid that HomePage renders under the hero, so the
   canvas is a faithful copy of the live page rather than an approximation. */
const HOME_FALLBACK_BESTSELLERS = [
  { _id: 'bs-1', title: 'Khapli Wheat Flour', isHotDeal: true, originalPrice: 305, fromPrice: 200, toPrice: 328, price: 200, unit: '1 Kg / 2 Kg', images: ['/bestseller-khapli.jpg'] },
  { _id: 'bs-2', title: 'Lakadong Turmeric Powder (7-9% curcumin)', price: 500, unit: '250g', images: ['/bestseller-turmeric.png'] },
  { _id: 'bs-3', title: 'A2 Cow Ghee (Machine Made)', fromPrice: 600, toPrice: 2000, price: 600, unit: '500ml / 1L', images: ['/bestseller-ghee.jpg'] },
  { _id: 'bs-4', title: 'Cinnamon Powder (Taj Powder)', price: 200, unit: '100g', images: ['/bestseller-cinnamon.jpg'] }
];

const BestsellerGrid = ({ products }) => (
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════════
   PREVIEW FRAME
   The storefront is rendered inside an iframe rather than a plain div.
   Tailwind's breakpoints key off the viewport, so a 390px-wide div still
   lays the page out as desktop — full nav links, clipped announcement
   bar, squeezed grids. An iframe gives the preview a real viewport of
   the chosen device width, so `sm:` / `md:` / `lg:` resolve the way they
   do on a phone.

   Children are portalled in, so React context (the unsaved-draft content
   provider) still reaches them. React's synthetic events do not cross
   into another document, which is why the editor listens on the frame's
   own document below — and why the storefront's own click handlers stay
   inert inside the canvas.
═══════════════════════════════════════════════════════════════════ */
const PREVIEW_HTML =
  '<!doctype html><html><head><base href="/"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body class="editor-canvas-frame"></body></html>';

// Cheap fingerprint of the admin's stylesheets, so they are only re-cloned
// into the frame when Vite actually swaps one out.
const styleSignature = () =>
  Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => (node.tagName === 'LINK' ? node.href : node.textContent.length))
    .join('|');

const PreviewFrame = ({ onDocument, height, children }) => {
  const frameRef = useRef(null);
  const signatureRef = useRef('');
  const [body, setBody] = useState(null);

  useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) return undefined;

    let headObserver;

    const syncStyles = (doc) => {
      const signature = styleSignature();
      if (signature === signatureRef.current) return;
      signatureRef.current = signature;
      doc.head.querySelectorAll('[data-editor-style]').forEach((n) => n.remove());
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        const clone = node.cloneNode(true);
        clone.setAttribute('data-editor-style', '');
        doc.head.appendChild(clone);
      });
    };

    const attach = () => {
      const doc = iframe.contentDocument;
      // Every frame starts life as about:blank before srcDoc lands. Only the
      // real document carries this class, and mounting the storefront into the
      // blank one would just be thrown away a tick later.
      if (!doc?.body?.classList.contains('editor-canvas-frame')) return;

      headObserver?.disconnect();
      signatureRef.current = '';
      syncStyles(doc);
      setBody(doc.body);
      onDocument(doc);

      headObserver = new MutationObserver(() => syncStyles(doc));
      headObserver.observe(document.head, { childList: true, subtree: true });
    };

    if (iframe.contentDocument?.readyState === 'complete') attach();
    iframe.addEventListener('load', attach);

    return () => {
      iframe.removeEventListener('load', attach);
      headObserver?.disconnect();
      onDocument(null);
    };
  }, [onDocument]);

  return (
    <>
      <iframe
        ref={frameRef}
        srcDoc={PREVIEW_HTML}
        title="Storefront preview"
        className="block w-full border-0 bg-white"
        style={{ height: `${height}px` }}
        scrolling="yes"
      />
      {body && createPortal(children, body)}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   LOADING STATES
   The editor paints the shape of the tree and the page it is about to
   show rather than a spinner, so nothing shifts once content lands.
═══════════════════════════════════════════════════════════════════ */
const SectionTreeSkeleton = () => (
  <div className="space-y-4">
    {[4, 6].map((rows, groupIdx) => (
      <div key={groupIdx} className="space-y-1">
        <div className="px-2 py-1">
          <Skeleton tone="admin" className="h-2.5 w-24" rounded="rounded" />
        </div>
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-2 px-2 py-1.5">
            <span className="w-4 shrink-0" />
            <Skeleton tone="admin" className="h-3.5 w-3.5 shrink-0" rounded="rounded" />
            <Skeleton
              tone="admin"
              className={`h-3 ${['w-28', 'w-20', 'w-32', 'w-24'][idx % 4]}`}
              rounded="rounded"
            />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const CanvasSkeleton = () => (
  <div className="p-6 space-y-8">
    <div className="flex items-center justify-between gap-6">
      <Skeleton tone="admin" className="h-6 w-32" rounded="rounded-md" />
      <div className="hidden sm:flex items-center gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} tone="admin" className="h-3 w-16" rounded="rounded" />
        ))}
      </div>
    </div>

    <Skeleton tone="admin" className="h-64 w-full" rounded="rounded-2xl" />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton tone="admin" className="aspect-square w-full" rounded="rounded-xl" />
          <Skeleton tone="admin" className="h-3 w-3/4" rounded="rounded" />
          <Skeleton tone="admin" className="h-3 w-1/2" rounded="rounded" />
        </div>
      ))}
    </div>

    <div className="space-y-3">
      <Skeleton tone="admin" className="h-5 w-56 mx-auto" rounded="rounded-md" />
      <Skeleton tone="admin" className="h-3 w-80 max-w-full mx-auto" rounded="rounded" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   CANVAS SECTION FRAME
   Declared at module scope on purpose: an inline component would get a
   fresh identity on every keystroke and remount the whole storefront
   section underneath it (killing videos, carousels and scroll position).
═══════════════════════════════════════════════════════════════════ */
// The hovered section is named by the floating "Edit …" badge the canvas
// draws over it, so the frame itself only carries the outline.
const SectionFrame = ({ sectionKey, isActive, isHover, nodesRef, children }) => (
  <div
    data-editor-section={sectionKey}
    ref={(el) => { nodesRef.current[sectionKey] = el; }}
    className={`relative cursor-pointer ${
      isActive
        ? 'outline outline-2 -outline-offset-2 outline-[#005bd3] z-10'
        : isHover
          ? 'outline outline-2 -outline-offset-2 outline-[#005bd3]/40'
          : ''
    }`}
  >
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   WEBSITE EDITOR
═══════════════════════════════════════════════════════════════════ */
const WebsiteEditor = () => {
  const { refreshContent } = useContent();

  const [catalog, setCatalog] = useState(MASTER_CMS_SECTIONS);
  const [draft, setDraft] = useState({});
  const [dirtyKeys, setDirtyKeys] = useState([]);
  const [hiddenKeys, setHiddenKeys] = useState([]);

  const [pageId, setPageId] = useState('home');
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [viewport, setViewport] = useState('desktop');
  const [query, setQuery] = useState('');

  const [selection, setSelection] = useState({ sectionKey: 'home.hero', group: null, index: null });
  const [hoverKey, setHoverKey] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState(['home.hero']);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bestsellers, setBestsellers] = useState(HOME_FALLBACK_BESTSELLERS);
  const [previewProductId, setPreviewProductId] = useState(null);

  const [hoverBox, setHoverBox] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const deviceFrameRef = useRef(null);
  const inspectorRef = useRef(null);
  const sectionNodes = useRef({});
  const treeNodes = useRef({});
  const pageMenuRef = useRef(null);

  const activePage = EDITOR_PAGES.find((p) => p.id === pageId) || EDITOR_PAGES[0];

  // The product page has no single URL — point at the product the canvas shows.
  const livePageRoute = pageId === 'product' && previewProductId
    ? `/products/${previewProductId}`
    : activePage.route;

  /* ── Load the section catalogue + seed the draft ─────────────── */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let merged = MASTER_CMS_SECTIONS;
      try {
        const { data } = await API.get('/admin/content/sections');
        if (data?.success && Array.isArray(data.sections) && data.sections.length > 0) {
          const byKey = new Map(MASTER_CMS_SECTIONS.map((s) => [s.sectionKey, s]));
          data.sections.forEach((remote) => {
            const local = byKey.get(remote.sectionKey);
            byKey.set(remote.sectionKey, {
              ...local,
              ...remote,
              // The bundled master catalogue is the source of truth for the form
              // schema; the database only owns the saved values.
              fieldsSchema: (remote.fieldsSchema?.length ? remote.fieldsSchema : local?.fieldsSchema) || [],
              defaultFields: local?.defaultFields || remote.defaultFields,
              // A field the database has never stored falls back to the bundled
              // default — which is the copy the live page is showing — so a new
              // control is never presented as an empty box.
              fields: { ...(local?.defaultFields || {}), ...(remote.fields || {}) }
            });
          });
          merged = Array.from(byKey.values());
        }
      } catch (e) {
        console.warn('Website editor: falling back to the bundled section catalogue.');
      }

      if (cancelled) return;
      setCatalog(merged);
      const seed = {};
      merged.forEach((s) => {
        seed[s.sectionKey] = deepClone(s.fields && Object.keys(s.fields).length ? s.fields : s.defaultFields);
      });
      setDraft(seed);
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  /* ── Same bestsellers the live home page shows under the hero ── */
  useEffect(() => {
    let cancelled = false;
    API.get('/products?bestseller=true&limit=4')
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.success && data.products?.length > 0) setBestsellers(data.products.slice(0, 4));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  /* ── The product the canvas previews, so "open live" lands on it ─ */
  useEffect(() => {
    let cancelled = false;
    API.get('/products?limit=1')
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.success && data.products?.length > 0) setPreviewProductId(data.products[0]._id);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  /* ── Close the page dropdown on outside click ────────────────── */
  useEffect(() => {
    const onDown = (e) => {
      if (pageMenuRef.current && !pageMenuRef.current.contains(e.target)) setIsPageMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const catalogMap = useMemo(() => {
    const map = {};
    catalog.forEach((s) => { map[s.sectionKey] = s; });
    return map;
  }, [catalog]);

  const orderOf = useCallback((key) => {
    const idx = SECTION_ORDER.indexOf(key);
    return idx === -1 ? SECTION_ORDER.length + 1 : idx;
  }, []);

  /* ── Section tree for the active page ────────────────────────── */
  const groups = useMemo(() => {
    const pick = (predicate) =>
      catalog.filter(predicate).sort((a, b) => orderOf(a.sectionKey) - orderOf(b.sectionKey));

    const build = [
      { id: 'header', name: 'Header & Navigation', items: pick((s) => s.page === 'SITE-WIDE') },
      {
        id: 'body',
        name: `${activePage.label} Sections`,
        items: pick((s) => activePage.cmsPages.includes(s.page))
      },
      { id: 'footer', name: 'Footer', items: pick((s) => s.page === 'FOOTER') }
    ];

    const q = query.trim().toLowerCase();
    if (!q) return build.filter((g) => g.items.length > 0);

    return build
      .map((g) => ({
        ...g,
        items: g.items.filter((s) =>
          [s.title, s.subtitle, s.sectionKey].some((v) => (v || '').toLowerCase().includes(q))
        )
      }))
      .filter((g) => g.items.length > 0);
  }, [catalog, activePage, query, orderOf]);

  /* ── Live preview content provider (unsaved draft included) ──── */
  const previewContent = useMemo(() => ({
    sections: draft,
    loading: false,
    refreshContent: () => {},
    getContent: (sectionKey, fieldName, fallback) => {
      const value = draft?.[sectionKey]?.[fieldName];
      return value === undefined || value === '' ? fallback : value;
    },
    getSection: (sectionKey, fallback = {}) => draft?.[sectionKey] || fallback
  }), [draft]);

  const activeSection = catalogMap[selection.sectionKey] || null;
  const isHidden = (key) => hiddenKeys.includes(key);
  const isDirty = (key) => dirtyKeys.includes(key);

  /* ── Selection & canvas scrolling ────────────────────────────── */
  // Sections nested inside a bigger component (the announcement bar inside the
  // navbar, for example) have no frame of their own — fall back to the
  // data-section-key marker the storefront components already carry.
  const findCanvasNode = useCallback((sectionKey) => {
    const framed = sectionNodes.current[sectionKey];
    if (framed) return framed;
    try {
      return previewDoc?.querySelector(`[data-section-key="${CSS.escape(sectionKey)}"]`) || null;
    } catch (e) {
      return null;
    }
  }, [previewDoc]);

  // A node's position inside the frame, expressed in the canvas pane's own
  // coordinates. The frame never scrolls internally, so its rect plus the
  // node's rect is the whole story.
  const canvasOffsetOf = useCallback((node) => {
    const frameEl = previewDoc?.defaultView?.frameElement;
    if (!node || !frameEl) return null;
    const frameBox = frameEl.getBoundingClientRect();
    const nodeBox = node.getBoundingClientRect();
    return {
      top: frameBox.top + nodeBox.top,
      left: frameBox.left + nodeBox.left,
      width: nodeBox.width,
      height: nodeBox.height
    };
  }, [previewDoc]);

  // The frame is a device viewport that scrolls on its own, so bringing a
  // section into view means scrolling inside it, not the admin pane.
  const scrollCanvasTo = useCallback((sectionKey) => {
    const win = previewDoc?.defaultView;
    const node = findCanvasNode(sectionKey);
    if (!win || !node) return;
    const top = win.scrollY + node.getBoundingClientRect().top - 12;
    win.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, [previewDoc, findCanvasNode]);

  // Nested (frameless) sections — the announcement bar inside the navbar, every
  // block of the product page — get the same selection, hover and hide
  // treatment as framed ones, driven by class names instead of a wrapper.
  useEffect(() => {
    const root = previewDoc?.body;
    if (!root) return;

    const MARKS = ['nuva-editor-selected', 'nuva-editor-hover', 'nuva-editor-hidden'];
    MARKS.forEach((cls) => root.querySelectorAll(`.${cls}`).forEach((n) => n.classList.remove(cls)));

    const mark = (sectionKey, cls) => {
      const node = sectionKey ? findCanvasNode(sectionKey) : null;
      if (node && !node.hasAttribute('data-editor-section')) node.classList.add(cls);
    };

    hiddenKeys.forEach((key) => mark(key, 'nuva-editor-hidden'));
    mark(selection.sectionKey, 'nuva-editor-selected');
    if (hoverKey && hoverKey !== selection.sectionKey) mark(hoverKey, 'nuva-editor-hover');
  }, [previewDoc, selection.sectionKey, hoverKey, findCanvasNode, pageId, draft, hiddenKeys]);

  /* The "Edit section" badge that tracks the hovered section, the way the
     Shopify theme editor labels whatever the pointer is over. It is drawn in
     the admin document, over the frame, so it stays crisp at every viewport. */
  useEffect(() => {
    const host = deviceFrameRef.current;
    const win = previewDoc?.defaultView;

    const place = () => {
      const position = hoverKey ? canvasOffsetOf(findCanvasNode(hoverKey)) : null;
      if (!host || !position) {
        setHoverBox(null);
        return;
      }
      const hostBox = host.getBoundingClientRect();
      setHoverBox({
        top: position.top - hostBox.top,
        left: position.left - hostBox.left,
        width: position.width,
        height: position.height
      });
    };

    place();
    if (!win || !hoverKey) return undefined;

    // Scrolling inside the frame moves the section under the badge.
    let queued = 0;
    const onScroll = () => {
      if (queued) return;
      queued = win.requestAnimationFrame(() => { queued = 0; place(); });
    };
    win.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      win.cancelAnimationFrame(queued);
      win.removeEventListener('scroll', onScroll);
    };
  }, [previewDoc, hoverKey, findCanvasNode, canvasOffsetOf, pageId, viewport, draft, hiddenKeys]);

  // Every new selection starts the edit form at the top rather than wherever
  // the previous section had been scrolled to.
  useEffect(() => {
    inspectorRef.current?.scrollTo({ top: 0 });
  }, [selection.sectionKey, selection.group, selection.index]);

  const selectSection = useCallback((sectionKey, options = {}) => {
    if (!sectionKey) return;
    setSelection({ sectionKey, group: options.group ?? null, index: options.index ?? null });
    setExpandedKeys((prev) => (prev.includes(sectionKey) ? prev : [...prev, sectionKey]));
    if (options.scroll !== false) {
      window.requestAnimationFrame(() => scrollCanvasTo(sectionKey));
    }
    treeNodes.current[sectionKey]?.scrollIntoView({ block: 'nearest' });
  }, [scrollCanvasTo]);

  const handleSelectPage = (nextPageId) => {
    setPageId(nextPageId);
    setIsPageMenuOpen(false);
    setQuery('');
    const next = EDITOR_PAGES.find((p) => p.id === nextPageId) || EDITOR_PAGES[0];
    const first = catalog
      .filter((s) => next.cmsPages.includes(s.page))
      .sort((a, b) => orderOf(a.sectionKey) - orderOf(b.sectionKey))[0];
    setSelection({ sectionKey: first?.sectionKey || 'sitewide.header', group: null, index: null });
    previewDoc?.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Draft mutations ─────────────────────────────────────────── */
  const markDirty = (sectionKey) =>
    setDirtyKeys((prev) => (prev.includes(sectionKey) ? prev : [...prev, sectionKey]));

  const updateField = (sectionKey, fieldName, value) => {
    setDraft((prev) => ({ ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [fieldName]: value } }));
    markDirty(sectionKey);
  };

  const updateGroupItem = (sectionKey, groupName, index, fieldName, value) => {
    setDraft((prev) => {
      const list = [...((prev[sectionKey] || {})[groupName] || [])];
      list[index] = { ...(list[index] || {}), [fieldName]: value };
      return { ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [groupName]: list } };
    });
    markDirty(sectionKey);
  };

  const addGroupItem = (sectionKey, groupName, subFields = []) => {
    const blank = {};
    subFields.forEach((sf) => { blank[sf.name] = ''; });
    setDraft((prev) => {
      const list = [...((prev[sectionKey] || {})[groupName] || []), blank];
      return { ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [groupName]: list } };
    });
    markDirty(sectionKey);
  };

  const removeGroupItem = (sectionKey, groupName, index) => {
    setDraft((prev) => {
      const list = [...((prev[sectionKey] || {})[groupName] || [])];
      list.splice(index, 1);
      return { ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [groupName]: list } };
    });
    markDirty(sectionKey);
    setSelection((prev) =>
      prev.sectionKey === sectionKey && prev.group === groupName && prev.index === index
        ? { sectionKey, group: null, index: null }
        : prev
    );
  };

  const moveGroupItem = (sectionKey, groupName, index, direction) => {
    const target = index + direction;
    setDraft((prev) => {
      const list = [...((prev[sectionKey] || {})[groupName] || [])];
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [groupName]: list } };
    });
    markDirty(sectionKey);
    setSelection((prev) =>
      prev.sectionKey === sectionKey && prev.group === groupName && prev.index === index
        ? { ...prev, index: Math.max(0, target) }
        : prev
    );
  };

  const toggleVisibility = (sectionKey, e) => {
    e.stopPropagation();
    setHiddenKeys((prev) =>
      prev.includes(sectionKey) ? prev.filter((k) => k !== sectionKey) : [...prev, sectionKey]
    );
  };

  const toggleExpanded = (sectionKey, e) => {
    e.stopPropagation();
    setExpandedKeys((prev) =>
      prev.includes(sectionKey) ? prev.filter((k) => k !== sectionKey) : [...prev, sectionKey]
    );
  };

  /* ── Persistence ─────────────────────────────────────────────── */
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const handleSave = useCallback(async () => {
    if (saving || dirtyKeys.length === 0) return;
    setSaving(true);

    const failedKeys = [];
    for (const key of dirtyKeys) {
      const meta = catalogMap[key];
      try {
        await API.patch(`/admin/content/${key}`, {
          fields: draft[key] || {},
          page: meta?.page,
          title: meta?.title,
          subtitle: meta?.subtitle,
          fieldsSchema: meta?.fieldsSchema
        });
      } catch (e) {
        failedKeys.push(key);
      }
    }

    const savedKeys = dirtyKeys.filter((k) => !failedKeys.includes(k));
    setCatalog((prev) =>
      prev.map((s) => (savedKeys.includes(s.sectionKey)
        ? { ...s, fields: deepClone(draft[s.sectionKey]), isEdited: true }
        : s))
    );
    setDirtyKeys(failedKeys);

    if (refreshContent) refreshContent();
    // Reaches the live store in this window and in any other open tab.
    publishStoreChange(STORE_TOPICS.CONTENT);

    setSaving(false);
    if (failedKeys.length) {
      showToast('error', `Could not save: ${failedKeys.map((k) => catalogMap[k]?.title || k).join(', ')}`);
    } else {
      showToast('success', 'Published to the live website');
    }
  }, [saving, dirtyKeys, draft, catalogMap, refreshContent]);

  const handleResetSection = async (sectionKey) => {
    const meta = catalogMap[sectionKey];
    if (!meta) return;
    if (!window.confirm(`Reset "${meta.title}" back to its original content?`)) return;

    setDraft((prev) => ({ ...prev, [sectionKey]: deepClone(meta.defaultFields) }));
    try {
      await API.post(`/admin/content/${sectionKey}/undo`);
      setCatalog((prev) =>
        prev.map((s) => (s.sectionKey === sectionKey
          ? { ...s, fields: deepClone(s.defaultFields), isEdited: false }
          : s))
      );
      setDirtyKeys((prev) => prev.filter((k) => k !== sectionKey));
      if (refreshContent) refreshContent();
      publishStoreChange(STORE_TOPICS.CONTENT);
      showToast('success', 'Section restored to default');
    } catch (e) {
      // The local draft is already reverted; it just needs a Save to persist.
      markDirty(sectionKey);
      showToast('success', 'Reverted locally — press Save to publish');
    }
  };

  // Ctrl/Cmd + S publishes.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSave]);

  /* ── Canvas interaction: click / hover any section to edit ─────
     Listeners live on the preview frame's own document. React's synthetic
     events never reach across the frame boundary, and going native also
     lets the capture phase swallow the storefront's own handlers. */
  const resolveSectionKey = useCallback((target) => {
    if (!target || typeof target.closest !== 'function') return null;
    const explicit = target.closest('[data-section-key]');
    const explicitKey = explicit?.getAttribute('data-section-key');
    if (explicitKey && catalogMap[explicitKey]) return explicitKey;
    return target.closest('[data-editor-section]')?.getAttribute('data-editor-section') || null;
  }, [catalogMap]);

  useEffect(() => {
    if (!previewDoc) return undefined;

    const onClick = (e) => {
      // The frame renders real storefront components — never let their links
      // or forms navigate the preview away from the page being edited.
      const anchor = typeof e.target?.closest === 'function' ? e.target.closest('a') : null;
      if (anchor) e.preventDefault();

      const key = resolveSectionKey(e.target);
      if (key) {
        e.stopPropagation();
        selectSection(key, { scroll: false });
      }
    };

    const onOver = (e) => setHoverKey(resolveSectionKey(e.target));

    previewDoc.addEventListener('click', onClick, true);
    previewDoc.addEventListener('mouseover', onOver);
    return () => {
      previewDoc.removeEventListener('click', onClick, true);
      previewDoc.removeEventListener('mouseover', onOver);
    };
  }, [previewDoc, resolveSectionKey, selectSection]);

  /* ── Canvas frame wrapper ────────────────────────────────────── */
  const frame = (sectionKey, children) => {
    if (isHidden(sectionKey)) return null;
    const isActive = selection.sectionKey === sectionKey;
    return (
      <SectionFrame
        key={sectionKey}
        sectionKey={sectionKey}
        isActive={isActive}
        isHover={hoverKey === sectionKey && !isActive}
        nodesRef={sectionNodes}
      >
        {children}
      </SectionFrame>
    );
  };

  /* ── Canvas body per page ────────────────────────────────────── */
  const renderCanvasBody = () => {
    if (pageId === 'home') {
      return (
        <>
          {frame('home.hero', (
            <>
              <HeroBanner />
              <BestsellerGrid products={bestsellers} />
            </>
          ))}
          {frame('home.purity', <WherePurityGrowsSection />)}
          {frame('home.farmers', <FarmersWayOfLifeSection />)}
          {frame('home.regenerative', <RegenerativeFarmingSection />)}
          {frame('home.video', <RegenerativeVideoSection />)}
          {frame('home.testimonials', <TestimonialsSection />)}
          {frame('home.video_shopping', <Reel3DSection />)}
          {frame('home.uv_ozone', <UVOzonePurificationSection />)}
          {frame('home.certifications', <CertificationsSection />)}
          {frame('home.blog', <BlogSection />)}
          {frame('home.instagram', <InstagramFollowSection />)}
        </>
      );
    }

    // Every other page marks its own blocks with data-section-key, so they
    // render unframed and each block stays individually selectable — one outer
    // frame would instead make the whole page a single click target.
    const PageComponent = {
      about: OurStoryPage,
      shop: ShopPage,
      product: ProductDetailPage,
      b2b: B2BPage,
      contact: ContactPage,
      blog: BlogPage
    }[pageId];

    return PageComponent ? <PageComponent /> : null;
  };

  /* ── Inspector: one field control per schema entry ───────────── */
  const renderField = (sectionKey, field) => {
    const value = (draft[sectionKey] || {})[field.name];

    if (field.type === 'textarea') {
      return (
        <TextControl
          key={field.name}
          field={field}
          value={value}
          multiline
          onChange={(v) => updateField(sectionKey, field.name, v)}
        />
      );
    }

    if (field.type === 'image') {
      return (
        <ImageControl
          key={field.name}
          field={field}
          value={value}
          onChange={(v) => updateField(sectionKey, field.name, v)}
        />
      );
    }

    if (field.type === 'video') {
      return (
        <TextControl
          key={field.name}
          field={{ ...field, helperText: field.helperText || 'YouTube embed link or direct .mp4 URL' }}
          value={value}
          onChange={(v) => updateField(sectionKey, field.name, v)}
        />
      );
    }

    if (field.type === 'repeatable-group') {
      const items = Array.isArray(value) ? value : [];
      return (
        <div key={field.name} className="space-y-2 pt-3 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-800">
              {field.label} <span className="text-neutral-400 font-semibold">({items.length})</span>
            </span>
            <button
              type="button"
              onClick={() => addGroupItem(sectionKey, field.name, field.subFields || [])}
              className="flex items-center gap-1 text-[11px] font-bold text-[#005bd3] hover:underline"
            >
              <Plus className="h-3 w-3" /> Add block
            </button>
          </div>

          <div className="space-y-1">
            {items.length === 0 && (
              <p className="text-[11px] text-neutral-400 py-2">No blocks yet — add one to get started.</p>
            )}
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSection(sectionKey, { group: field.name, index: idx, scroll: false })}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-neutral-200 hover:border-[#005bd3] hover:bg-blue-50/40 text-left transition-colors"
              >
                <GripVertical className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                <span className="flex-1 truncate text-[11px] font-semibold text-neutral-800">
                  {blockLabel(item, idx)}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <TextControl
        key={field.name}
        field={field}
        value={value}
        onChange={(v) => updateField(sectionKey, field.name, v)}
      />
    );
  };

  // A section with no declared schema still gets a usable form, derived from
  // whatever values it holds — the inspector is never blank.
  const schemaFor = (section) => {
    if (section?.fieldsSchema?.length) return section.fieldsSchema;
    const source = draft[section?.sectionKey] || section?.defaultFields || {};
    return Object.keys(source).map((name) => ({
      name,
      label: name.replace(/([A-Z])/g, ' $1').replace(/[_.]/g, ' ').replace(/^./, (c) => c.toUpperCase()),
      type: Array.isArray(source[name])
        ? 'repeatable-group'
        : (typeof source[name] === 'string' && source[name].length > 90 ? 'textarea' : 'text'),
      subFields: Array.isArray(source[name]) && source[name][0]
        ? Object.keys(source[name][0]).map((sub) => ({ name: sub, label: sub, type: 'text' }))
        : []
    }));
  };

  const renderInspector = () => {
    if (loading) {
      return (
        <div className="p-4 space-y-5">
          <div className="pb-3 border-b border-neutral-100 space-y-2">
            <Skeleton tone="admin" className="h-4 w-40" rounded="rounded-md" />
            <Skeleton tone="admin" className="h-2.5 w-52" rounded="rounded" />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton tone="admin" className="h-2.5 w-24" rounded="rounded" />
              <Skeleton tone="admin" className="h-9 w-full" rounded="rounded-lg" />
            </div>
          ))}
        </div>
      );
    }

    if (!activeSection) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12 gap-2">
          <MousePointerClick className="h-7 w-7 text-neutral-300" />
          <p className="text-xs font-bold text-neutral-700">Select a section</p>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Pick one from the list on the left, or click any part of the live preview.
          </p>
        </div>
      );
    }

    const schema = schemaFor(activeSection);

    // ── Block-level inspector (a single repeatable-group item) ──
    if (selection.group !== null && selection.index !== null) {
      const groupField = schema.find((f) => f.name === selection.group);
      const items = (draft[selection.sectionKey] || {})[selection.group] || [];
      const item = items[selection.index];

      if (!groupField || !item) {
        return (
          <div className="p-4 text-[11px] text-neutral-400">This block no longer exists.</div>
        );
      }

      const subFields = groupField.subFields?.length
        ? groupField.subFields
        : Object.keys(item).map((n) => ({ name: n, label: n, type: 'text' }));

      return (
        <div className="p-4 space-y-4">
          <button
            type="button"
            onClick={() => selectSection(selection.sectionKey, { scroll: false })}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#005bd3] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="truncate">Back to {activeSection.title}</span>
          </button>

          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 min-w-0">
              <Package className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-sm font-bold text-neutral-900 truncate">
                {blockLabel(item, selection.index)}
              </span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                title="Move up"
                disabled={selection.index === 0}
                onClick={() => moveGroupItem(selection.sectionKey, selection.group, selection.index, -1)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-400"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Move down"
                disabled={selection.index === items.length - 1}
                onClick={() => moveGroupItem(selection.sectionKey, selection.group, selection.index, 1)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-400"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {subFields.map((sf) => {
              const looksLikeImage = sf.type === 'image' || /image|icon|photo|logo|avatar|thumb/i.test(sf.name);
              const control = looksLikeImage ? ImageControl : TextControl;
              return React.createElement(control, {
                key: sf.name,
                field: sf,
                value: item[sf.name],
                multiline: sf.type === 'textarea',
                onChange: (v) => updateGroupItem(selection.sectionKey, selection.group, selection.index, sf.name, v)
              });
            })}
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => removeGroupItem(selection.sectionKey, selection.group, selection.index)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove block</span>
            </button>
          </div>
        </div>
      );
    }

    // ── Section-level inspector ──
    return (
      <div className="p-4 space-y-4">
        <div className="pb-3 border-b border-neutral-100 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <SlidersHorizontal className="h-4 w-4 text-neutral-600 shrink-0" />
              <h3 className="text-sm font-bold text-neutral-900 truncate">{activeSection.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => handleResetSection(activeSection.sectionKey)}
              title="Restore original content"
              className="p-1 rounded text-neutral-400 hover:text-amber-600 hover:bg-amber-50 transition-colors shrink-0"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {activeSection.subtitle && (
            <p className="text-[11px] text-neutral-400 leading-snug">{activeSection.subtitle}</p>
          )}
          {isDirty(activeSection.sectionKey) && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              <AlertCircle className="h-3 w-3" /> Unsaved changes
            </span>
          )}
        </div>

        <div className="space-y-4">
          {schema.map((field) => renderField(activeSection.sectionKey, field))}
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-[10px] text-neutral-400">
          <Layers className="h-3 w-3" />
          <span className="font-mono truncate">{activeSection.sectionKey}</span>
        </div>
      </div>
    );
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="w-full h-full min-h-0 flex flex-col font-sans bg-[#f1f1f1] text-[#1a1a1a] overflow-hidden">

      {/* ══ TOP BAR ══ */}
      <div className="h-12 shrink-0 bg-[#1a1a1a] text-white px-3 sm:px-4 flex items-center justify-between border-b border-neutral-800 z-30">

        <div className="relative" ref={pageMenuRef}>
          <button
            onClick={() => setIsPageMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold transition-colors"
          >
            <span>{activePage.label}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${isPageMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPageMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-60 bg-[#242424] border border-neutral-700 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                Select website page
              </div>
              {EDITOR_PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(page.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-700/70 transition-colors ${
                    pageId === page.id ? 'text-emerald-400 font-bold bg-neutral-800' : 'text-neutral-200 font-medium'
                  }`}
                >
                  <span>{page.label}</span>
                  {pageId === page.id && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          {Object.entries(VIEWPORTS).map(([key, v]) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              title={`${v.label} view`}
              className={`p-1.5 rounded-md transition-all ${
                viewport === key ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <v.icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {dirtyKeys.length > 0 && !saving && (
            <span className="hidden sm:inline text-[11px] font-semibold text-amber-300">
              {dirtyKeys.length} unsaved {dirtyKeys.length === 1 ? 'section' : 'sections'}
            </span>
          )}
          <a
            href={livePageRoute}
            target="_blank"
            rel="noopener noreferrer"
            title="Open this page on the live website"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={handleSave}
            disabled={saving || dirtyKeys.length === 0}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Saving…' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* ══ 3-PANE WORKSPACE ══ */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ── PANE 1: SECTION TREE ── */}
        <div className="w-64 shrink-0 bg-white border-r border-[#d8d8d8] flex flex-col min-h-0 z-20">
          <div className="shrink-0 p-3 border-b border-[#ebebeb] space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-neutral-900 truncate">{activePage.label}</h2>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Nuva website</span>
            </div>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter sections…"
                className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-neutral-300 bg-neutral-50 focus:bg-white text-[11px] outline-none focus:border-[#005bd3] transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar p-2 space-y-4">
            {loading && <SectionTreeSkeleton />}

            {!loading && groups.length === 0 && (
              <p className="px-2 py-4 text-[11px] text-neutral-400">No sections match “{query}”.</p>
            )}

            {groups.map((group) => (
              <div key={group.id} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  {group.name}
                </div>

                <div className="space-y-0.5">
                  {group.items.map((section) => {
                    const Icon = SECTION_ICONS[section.sectionKey] || Layers;
                    const isSelected = selection.sectionKey === section.sectionKey && selection.group === null;
                    const hidden = isHidden(section.sectionKey);
                    const schema = schemaFor(section);
                    const blockGroups = schema.filter((f) => f.type === 'repeatable-group');
                    const hasBlocks = blockGroups.length > 0;
                    const expanded = expandedKeys.includes(section.sectionKey);

                    return (
                      <div key={section.sectionKey} ref={(el) => { treeNodes.current[section.sectionKey] = el; }}>
                        <div
                          onClick={() => selectSection(section.sectionKey)}
                          className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#005bd3] text-white font-bold'
                              : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                          } ${hidden ? 'opacity-50' : ''}`}
                        >
                          {hasBlocks ? (
                            <button
                              onClick={(e) => toggleExpanded(section.sectionKey, e)}
                              className={`p-0.5 rounded shrink-0 ${isSelected ? 'text-white/80 hover:text-white' : 'text-neutral-400 hover:text-neutral-800'}`}
                            >
                              <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                            </button>
                          ) : (
                            <span className="w-4 shrink-0" />
                          )}

                          <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                          <span className="flex-1 truncate text-[11px]">{section.title}</span>

                          {isDirty(section.sectionKey) && (
                            <span
                              title="Unsaved changes"
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`}
                            />
                          )}

                          <button
                            onClick={(e) => toggleVisibility(section.sectionKey, e)}
                            title={hidden ? 'Show section in preview' : 'Hide section in preview'}
                            className={`p-0.5 rounded shrink-0 ${
                              isSelected ? 'text-white/80 hover:text-white' : 'text-neutral-400 hover:text-neutral-800'
                            }`}
                          >
                            {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>

                        {hasBlocks && expanded && (
                          <div className="ml-4 pl-2 border-l border-neutral-200 py-1 space-y-0.5">
                            {blockGroups.map((groupField) => {
                              const items = (draft[section.sectionKey] || {})[groupField.name] || [];
                              return (
                                <React.Fragment key={groupField.name}>
                                  {items.map((item, idx) => {
                                    const isBlockSelected =
                                      selection.sectionKey === section.sectionKey &&
                                      selection.group === groupField.name &&
                                      selection.index === idx;
                                    return (
                                      <div
                                        key={`${groupField.name}-${idx}`}
                                        onClick={() =>
                                          selectSection(section.sectionKey, { group: groupField.name, index: idx })
                                        }
                                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-[11px] transition-colors ${
                                          isBlockSelected
                                            ? 'bg-[#005bd3] text-white font-bold'
                                            : 'text-neutral-600 hover:bg-neutral-100 font-medium'
                                        }`}
                                      >
                                        <Package className={`h-3 w-3 shrink-0 ${isBlockSelected ? 'text-white' : 'text-neutral-400'}`} />
                                        <span className="truncate">{blockLabel(item, idx)}</span>
                                      </div>
                                    );
                                  })}
                                  <button
                                    onClick={() => {
                                      addGroupItem(section.sectionKey, groupField.name, groupField.subFields || []);
                                      selectSection(section.sectionKey, {
                                        group: groupField.name,
                                        index: items.length,
                                        scroll: false
                                      });
                                    }}
                                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-bold text-[#005bd3] hover:bg-blue-50 transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                    <span className="truncate">Add block</span>
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PANE 2: INSPECTOR ── */}
        <div className="w-80 shrink-0 bg-white border-r border-[#d8d8d8] flex flex-col min-h-0 z-10">
          <div ref={inspectorRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
            {renderInspector()}
          </div>

          <div className="shrink-0 border-t border-[#ebebeb] p-3 bg-neutral-50">
            <button
              onClick={handleSave}
              disabled={saving || dirtyKeys.length === 0}
              className="w-full py-2 rounded-lg bg-[#1a1a1a] hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>
                {saving
                  ? 'Publishing…'
                  : dirtyKeys.length > 0
                    ? `Publish ${dirtyKeys.length} change${dirtyKeys.length === 1 ? '' : 's'}`
                    : 'All changes published'}
              </span>
            </button>
          </div>
        </div>

        {/* ── PANE 3: LIVE CANVAS ── */}
        <div className="flex-1 min-w-0 min-h-0 bg-[#eaeaea] overflow-y-auto overscroll-contain custom-scrollbar">
          <div className="flex justify-center p-3 sm:p-6">
            <div
              ref={deviceFrameRef}
              style={{ width: VIEWPORTS[viewport].width, maxWidth: '1360px' }}
              onMouseLeave={() => setHoverKey(null)}
              className="relative bg-white shadow-2xl border border-neutral-300 rounded-md overflow-hidden transition-[width] duration-300 text-neutral-900"
            >
              {/* Hovering any part of the preview names the section under the
                  pointer and offers to open its settings — clicking anywhere
                  inside it does the same thing. */}
              {hoverBox && hoverKey && catalogMap[hoverKey] && (
                <div
                  className="absolute z-40 pointer-events-none"
                  style={{
                    top: `${hoverBox.top}px`,
                    left: `${hoverBox.left}px`,
                    width: `${hoverBox.width}px`,
                    height: `${hoverBox.height}px`
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); selectSection(hoverKey, { scroll: false }); }}
                    className="pointer-events-auto absolute top-0 left-0 flex items-center gap-1.5 px-2.5 py-1 rounded-br-lg bg-[#005bd3] hover:bg-[#004bb0] text-white text-[10px] font-bold shadow-md transition-colors"
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    <span className="max-w-[180px] truncate">
                      Edit {catalogMap[hoverKey].title}
                    </span>
                  </button>
                </div>
              )}

              {loading ? (
                <CanvasSkeleton />
              ) : (
                <PreviewFrame onDocument={setPreviewDoc} height={VIEWPORTS[viewport].height}>
                  <ContentContext.Provider value={previewContent}>
                    {frame('sitewide.header', <Navbar />)}
                    {renderCanvasBody()}
                    {frame('footer.contact', <Footer />)}
                  </ContentContext.Provider>
                </PreviewFrame>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ TOAST ══ */}
      {toast && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-[#1a1a1a] text-white'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default WebsiteEditor;
