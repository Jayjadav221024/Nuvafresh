import React, { useState, useEffect, useMemo } from 'react';
import { 
  Laptop, Tablet, Smartphone, RefreshCw, ExternalLink, Edit2, Eye, RotateCcw, 
  Check, Sparkles, AlertCircle, Save, Plus, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown, X,
  MousePointer, Sliders, Layers, Sparkle, Undo2, Search, Zap, CheckCircle, Globe, Filter,
  ArrowRight, ShieldCheck, SparkleIcon
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { MASTER_CMS_SECTIONS } from '../../data/defaultMasterSections';

const TABS = [
  { id: 'HOME PAGE', label: 'Home Page', desc: 'Hero video, bestsellers, regenerative pillars, reels, certifications & blogs.' },
  { id: 'SITE-WIDE', label: 'Site-Wide', desc: 'Announcement ticker, global promo banners, and trust badges.' },
  { id: 'ABOUT US', label: 'About Us', desc: 'Founder Aanshi Patel story, hygiene facility, and packaging mission.' },
  { id: 'B2B', label: 'B2B Commercial', desc: 'Commercial hero value proposition, product procurement offerings, and facility hubs.' },
  { id: 'BLOG', label: 'Blog & Articles', desc: 'Food & Health header, breadcrumb banner, and category filter pills.' },
  { id: 'SHOP', label: 'Shop Catalog', desc: 'Catalog header, filter tags, and harvest statements.' },
  { id: 'PRODUCT DETAIL', label: 'Product Detail', desc: 'Welcome discount banner, guarantees, and delivery copy.' },
  { id: 'CSR INITIATIVES', label: 'CSR Initiatives', desc: '₹1 farmer empowerment pledge and agricultural fund statements.' },
  { id: 'OZONE SHIELD', label: 'Ozone Shield', desc: 'Aqueous Ozone technology stats and purification metrics.' },
  { id: 'CONTACT', label: 'Contact Us', desc: 'Head office and facility processing unit addresses.' },
  { id: 'CART & CHECKOUT', label: 'Cart & Checkout', desc: 'Free shipping threshold and order guarantees.' },
  { id: 'FOOTER', label: 'Footer', desc: 'Footer links, address, and legal copyright.' }
];

const PREVIEW_ROUTES = {
  'HOME PAGE': '/',
  'ABOUT US': '/our-story',
  'B2B': '/b2b',
  'B2B (WHOLESALE)': '/b2b',
  'BLOG': '/blogs',
  'SHOP': '/shop',
  'PRODUCT DETAIL': '/products/p-1',
  'CSR INITIATIVES': '/csr-initiatives',
  'OZONE SHIELD': '/ozone-shield',
  'CONTACT': '/contact-us',
  'SITE-WIDE': '/',
  'CART & CHECKOUT': '/cart',
  'FOOTER': '/'
};

const WebsiteEditor = () => {
  const [activeTab, setActiveTab] = useState('HOME PAGE');
  const [deviceView, setDeviceView] = useState('desktop'); // desktop | tablet | mobile
  const [previewKey, setPreviewKey] = useState(Date.now());
  const [sections, setSections] = useState(MASTER_CMS_SECTIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Active Section & Live Form State
  const [selectedSection, setSelectedSection] = useState(null);
  const [formFields, setFormFields] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchSections = async () => {
    try {
      const { data } = await API.get('/admin/content/sections');
      if (data.success && data.sections && data.sections.length > 0) {
        setSections(data.sections);
        const tabSecs = data.sections.filter(s => s.page === activeTab || (activeTab === 'B2B' && (s.page === 'B2B' || s.page === 'B2B (WHOLESALE)')));
        if (tabSecs.length > 0) {
          loadSectionData(tabSecs[0]);
        }
      } else {
        setSections(MASTER_CMS_SECTIONS);
        const tabSecs = MASTER_CMS_SECTIONS.filter(s => s.page === activeTab || (activeTab === 'B2B' && (s.page === 'B2B' || s.page === 'B2B (WHOLESALE)')));
        if (tabSecs.length > 0) {
          loadSectionData(tabSecs[0]);
        }
      }
    } catch (e) {
      console.warn('Sections API notice - using full master sections catalogue:', e.message);
      setSections(MASTER_CMS_SECTIONS);
      const tabSecs = MASTER_CMS_SECTIONS.filter(s => s.page === activeTab || (activeTab === 'B2B' && (s.page === 'B2B' || s.page === 'B2B (WHOLESALE)')));
      if (tabSecs.length > 0) {
        loadSectionData(tabSecs[0]);
      }
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const loadSectionData = (sec) => {
    setSelectedSection(sec);
    setFormFields(JSON.parse(JSON.stringify(sec.fields || sec.defaultFields || {})));
    setSaveSuccess(false);
    setHasUnsavedChanges(false);
  };

  // Filtered sections for left list
  const currentSections = useMemo(() => {
    return sections.filter((s) => {
      const matchTab = (s.page === activeTab) || (activeTab === 'B2B' && (s.page === 'B2B' || s.page === 'B2B (WHOLESALE)'));
      if (searchQuery.trim() === '') return matchTab;
      const query = searchQuery.toLowerCase();
      const matchSearch = s.title?.toLowerCase().includes(query) || 
                          s.subtitle?.toLowerCase().includes(query) || 
                          s.sectionKey?.toLowerCase().includes(query);
      return matchTab && matchSearch;
    });
  }, [sections, activeTab, searchQuery]);

  // When tab changes, automatically select the first section in that tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
    const tabSecs = sections.filter(s => s.page === tabId || (tabId === 'B2B' && (s.page === 'B2B' || s.page === 'B2B (WHOLESALE)')));
    if (tabSecs.length > 0) {
      loadSectionData(tabSecs[0]);
    }
  };

  // PostMessage Bridge: Click any section in live website iframe to instantly load its data
  useEffect(() => {
    const handleMessage = async (e) => {
      if (e.data && e.data.type === 'NUVA_SECTION_CLICKED' && e.data.sectionKey) {
        const secKey = e.data.sectionKey;
        const found = sections.find(s => s.sectionKey === secKey);
        if (found) {
          loadSectionData(found);
          if (found.page) setActiveTab(found.page === 'B2B (WHOLESALE)' ? 'B2B' : found.page);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sections]);

  // Save changes live to MongoDB and refresh preview
  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSection) return;
    try {
      setSaving(true);
      const { data } = await API.patch(`/admin/content/${selectedSection.sectionKey}`, {
        fields: formFields
      });
      if (data.success) {
        setSaveSuccess(true);
        setHasUnsavedChanges(false);
        // Refresh local sections state
        setSections(sections.map(s => s.sectionKey === selectedSection.sectionKey ? { ...s, fields: formFields, isEdited: true, updatedAt: new Date() } : s));
        // Soft reload preview iframe
        setPreviewKey(Date.now());
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = async (sec) => {
    if (window.confirm(`Undo custom changes for "${sec.title}" and restore defaults?`)) {
      try {
        const { data } = await API.post(`/admin/content/${sec.sectionKey}/undo`);
        if (data.success) {
          setSections(sections.map(s => s.sectionKey === sec.sectionKey ? { ...s, fields: s.defaultFields, isEdited: false } : s));
          if (selectedSection?.sectionKey === sec.sectionKey) {
            setFormFields(JSON.parse(JSON.stringify(sec.defaultFields || {})));
            setHasUnsavedChanges(false);
          }
          setPreviewKey(Date.now());
        }
      } catch (err) {
        console.error('Undo failed', err);
      }
    }
  };

  const updateField = (fieldName, value) => {
    setFormFields(prev => ({ ...prev, [fieldName]: value }));
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  // Repeatable Group Handlers
  const handleAddRepeatableItem = (groupName, subFields) => {
    const list = formFields[groupName] ? [...formFields[groupName]] : [];
    const newItem = {};
    subFields.forEach((sf) => {
      newItem[sf.name] = '';
    });
    list.push(newItem);
    setFormFields({ ...formFields, [groupName]: list });
    setHasUnsavedChanges(true);
  };

  const handleRemoveRepeatableItem = (groupName, index) => {
    const list = [...formFields[groupName]];
    list.splice(index, 1);
    setFormFields({ ...formFields, [groupName]: list });
    setHasUnsavedChanges(true);
  };

  const handleRepeatableFieldChange = (groupName, index, fieldName, value) => {
    const list = [...formFields[groupName]];
    list[index] = { ...list[index], [fieldName]: value };
    setFormFields({ ...formFields, [groupName]: list });
    setHasUnsavedChanges(true);
  };

  const getIframeWidth = () => {
    if (deviceView === 'mobile') return '390px';
    if (deviceView === 'tablet') return '768px';
    return '100%';
  };

  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0];
  const iframeSrc = PREVIEW_ROUTES[activeTab] || '/';

  return (
    <div className="space-y-5 font-sans pb-10">
      
      {/* 1. TOP HEADER & QUICK STATS BAR */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-[#2d472c] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display tracking-tight flex items-center gap-2">
                <span>Visual Website Editor</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#2d472c] dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Live CMS
                </span>
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Select any page tab below, click a section card, edit texts or images, and hit <strong>Publish</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => setPreviewKey(Date.now())}
            className="px-3.5 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Refresh Live Preview"
          >
            <RefreshCw className="h-3.5 w-3.5 text-neutral-500" />
            <span>Reload Preview</span>
          </button>

          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-2xl bg-[#2d472c] hover:bg-[#1e321d] text-white text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-2"
          >
            <span>Open Current Page</span>
            <ExternalLink className="h-3.5 w-3.5 text-emerald-300" />
          </a>
        </div>
      </div>

      {/* 2. MODERN CLEAN PAGE TABS BAR */}
      <div className="bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = sections.filter(s => s.page === tab.id || (tab.id === 'B2B' && (s.page === 'B2B' || s.page === 'B2B (WHOLESALE)'))).length;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-[#2d472c] text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive 
                      ? 'bg-emerald-900/80 text-emerald-200' 
                      : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. THREE-COLUMN WORKSPACE:
          [Left: Sections Tree 25%]  |  [Middle: Live Preview 45%]  |  [Right: Instant Editor 30%]
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* === COLUMN 1: SECTIONS SELECTOR (3 Cols) === */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 shadow-xs space-y-3">
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#2d472c]" />
                <span>{currentTabObj.label} Sections</span>
              </span>
              <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                {currentSections.length}
              </span>
            </div>

            {/* Quick Search in Current Tab */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter section names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs bg-neutral-50/70 dark:bg-neutral-800 focus:bg-white text-neutral-900 dark:text-white outline-none focus:ring-1 focus:ring-[#2d472c]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Sections Scrollable List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-8 text-center text-xs text-neutral-400">Loading sections...</div>
              ) : currentSections.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  {searchQuery ? 'No matching sections found.' : 'No sections for this page.'}
                </div>
              ) : (
                currentSections.map((sec) => {
                  const isSelected = selectedSection?.sectionKey === sec.sectionKey;
                  return (
                    <div
                      key={sec.sectionKey}
                      onClick={() => loadSectionData(sec)}
                      className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#2d472c] text-white border-[#2d472c] shadow-md -translate-y-0.5'
                          : 'bg-white dark:bg-neutral-800/40 border-neutral-200/80 dark:border-neutral-700/80 hover:border-neutral-300 hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-neutral-800 dark:text-neutral-200'}`}>
                          {sec.title}
                        </h3>
                        {sec.isEdited && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                            isSelected 
                              ? 'bg-white/20 text-emerald-200' 
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}>
                            EDITED
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] line-clamp-1 mt-1 ${isSelected ? 'text-emerald-100/80' : 'text-neutral-500'}`}>
                        {sec.subtitle || sec.sectionKey}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* === COLUMN 2: LIVE INTERACTIVE STOREFRONT PREVIEW (5 Cols) === */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Viewport Toolbar */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-2 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${deviceView === 'desktop' ? 'bg-white dark:bg-neutral-700 text-[#2d472c] dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                title="Desktop View"
              >
                <Laptop className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeviceView('tablet')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${deviceView === 'tablet' ? 'bg-white dark:bg-neutral-700 text-[#2d472c] dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                title="Tablet View"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${deviceView === 'mobile' ? 'bg-white dark:bg-neutral-700 text-[#2d472c] dark:text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-900'}`}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <MousePointer className="h-3 w-3 text-emerald-600 animate-pulse" />
              <span>Live Visual Canvas</span>
            </div>
          </div>

          {/* Iframe Viewport Frame */}
          <div className="w-full flex justify-center bg-neutral-200/50 dark:bg-neutral-950 p-3 sm:p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-inner">
            <div 
              style={{ width: getIframeWidth() }} 
              className="h-[620px] rounded-2xl overflow-hidden shadow-2xl border-4 border-neutral-800 bg-white transition-all duration-300 relative"
            >
              <iframe
                id="preview-iframe"
                key={`${previewKey}-${activeTab}`}
                src={iframeSrc}
                title="Live Storefront Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>

        </div>

        {/* === COLUMN 3: FAST INSTANT UPDATE FORM (4 Cols) === */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-sm space-y-4">
          
          {selectedSection ? (
            <>
              {/* Card Header & Controls */}
              <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-[#2d472c]" />
                    <span className="text-[10px] font-extrabold text-[#2d472c] dark:text-emerald-400 uppercase tracking-widest">
                      Live Editor
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display mt-0.5 leading-snug">
                    {selectedSection.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                    {selectedSection.subtitle || `Key: ${selectedSection.sectionKey}`}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {selectedSection.isEdited && (
                    <button
                      onClick={() => handleUndo(selectedSection)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-neutral-800 transition-colors"
                      title="Restore original text"
                    >
                      <Undo2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Success Notification Alert */}
              {saveSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Changes published to live website!</span>
                </div>
              )}

              {/* Dynamic Edit Form */}
              <form onSubmit={handlePublish} className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                {selectedSection.fieldsSchema?.map((field) => {
                  
                  // Text Input
                  if (field.type === 'text') {
                    return (
                      <div key={field.name} className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                          <span>{field.label}</span>
                          {field.helperText && <span className="text-[9px] text-neutral-400 font-normal">{field.helperText}</span>}
                        </label>
                        <input
                          type="text"
                          value={formFields[field.name] ?? ''}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs bg-neutral-50/70 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:bg-white focus:ring-1 focus:ring-[#2d472c] transition-colors"
                        />
                      </div>
                    );
                  }

                  // Textarea Input
                  if (field.type === 'textarea') {
                    return (
                      <div key={field.name} className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                          <span>{field.label}</span>
                          {field.helperText && <span className="text-[9px] text-neutral-400 font-normal">{field.helperText}</span>}
                        </label>
                        <textarea
                          rows={3}
                          value={formFields[field.name] ?? ''}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs bg-neutral-50/70 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:bg-white focus:ring-1 focus:ring-[#2d472c] transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    );
                  }

                  // Image Input with Instant Thumbnail Preview
                  if (field.type === 'image') {
                    const imgUrl = formFields[field.name] || '';
                    return (
                      <div key={field.name} className="space-y-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                        <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
                          {field.label}
                        </label>
                        <div className="flex items-center gap-2.5">
                          <div className="h-12 w-12 rounded-xl border border-neutral-300 bg-white overflow-hidden shrink-0 shadow-2xs">
                            {imgUrl ? (
                              <img src={imgUrl} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full flex items-center justify-center text-[9px] text-neutral-400">No Img</div>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="https://... image URL"
                            value={imgUrl}
                            onChange={(e) => updateField(field.name, e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-1 focus:ring-[#2d472c]"
                          />
                        </div>
                      </div>
                    );
                  }

                  // Video Input
                  if (field.type === 'video') {
                    return (
                      <div key={field.name} className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          placeholder="YouTube or MP4 Video URL"
                          value={formFields[field.name] ?? ''}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs bg-neutral-50/70 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:bg-white focus:ring-1 focus:ring-[#2d472c]"
                        />
                      </div>
                    );
                  }

                  // Repeatable Group (Items / Sub-items)
                  if (field.type === 'repeatable-group') {
                    const items = formFields[field.name] || [];
                    return (
                      <div key={field.name} className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                            {field.label} ({items.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddRepeatableItem(field.name, field.subFields || [])}
                            className="px-3 py-1.5 rounded-lg bg-[#2d472c] hover:bg-[#1f3320] text-white text-[11px] font-bold shadow-xs transition-colors"
                          >
                            + Add Item
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {items.map((item, idx) => (
                            <div 
                              key={idx} 
                              className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2.5"
                            >
                              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200/80 dark:border-neutral-700">
                                <span className="text-[11px] font-extrabold text-neutral-700 dark:text-neutral-300">
                                  Item #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRepeatableItem(field.name, idx)}
                                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-neutral-700 p-1 rounded-md transition-colors"
                                  title="Delete item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="space-y-2">
                                {field.subFields?.map((sf) => (
                                  <div key={sf.name} className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 block">
                                      {sf.label}
                                    </label>
                                    <input
                                      type="text"
                                      value={item[sf.name] || ''}
                                      onChange={(e) => handleRepeatableFieldChange(field.name, idx, sf.name, e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-1 focus:ring-[#2d472c] outline-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}

                {/* Publish to Live Website Action Button */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`w-full py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all duration-200 ${
                      hasUnsavedChanges
                        ? 'bg-[#2d472c] hover:bg-[#1f3320] text-white animate-pulse'
                        : 'bg-[#2d472c] hover:bg-[#1f3320] text-white'
                    } disabled:opacity-50 active:scale-98`}
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Publishing...' : hasUnsavedChanges ? 'Publish Unsaved Changes' : 'Publish to Live Website'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400 space-y-2 p-6">
              <MousePointer className="h-8 w-8 text-neutral-300 animate-bounce" />
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Select any section on the left</p>
              <p className="text-[11px] text-neutral-400">Or click directly on any element in the live website preview</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default WebsiteEditor;
