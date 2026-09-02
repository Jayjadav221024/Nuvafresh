import React, { useState } from 'react';
import ProductCard from '../components/home/ProductCard';
import { Search, Sparkles } from 'lucide-react';
import API from '../api/axiosInstance';
import { ShopCatalogSkeleton } from '../components/common/Skeleton';
import { useSearchParams } from 'react-router-dom';
import rawCsvProducts from '../data/csvProducts.json';
import { STORE_TOPICS, subscribeToStoreChanges } from '../lib/storeSync';
import { useContent } from '../context/ContentContext';

// Shown only until the live category list arrives, so the filter bar is never
// empty on first paint. The admin's categories replace these outright — they
// are not merged in, or a deleted category would linger on the storefront.
const PLACEHOLDER_CATEGORIES = [
  'All',
  'Fresh Produce',
  'Pulses & Lentils',
  'Grains & Staples',
  'Spices & Seasonings',
  'Oils & Ghee',
  'Healthy Sweeteners'
];

const norm = (value) => String(value ?? '').trim().toLowerCase();

const ShopPage = () => {
  const { getContent } = useContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState(rawCsvProducts || []);
  const [categories, setCategories] = useState(PLACEHOLDER_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [ozoneOnly, setOzoneOnly] = useState(false);

  React.useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const fetchCatalog = React.useCallback(async () => {
    const [prodRes, catRes] = await Promise.allSettled([
      API.get('/products'),
      API.get('/admin/categories/public')
    ]);

    if (prodRes.status === 'fulfilled' && prodRes.value.data?.success && prodRes.value.data.products?.length > 0) {
      setProducts(prodRes.value.data.products);
    }

    if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
      const names = (catRes.value.data.categories || [])
        .filter((c) => c.status !== 'Archived' && c.status !== 'Draft')
        .map((c) => c.name)
        .filter(Boolean);

      if (names.length > 0) setCategories(['All', ...Array.from(new Set(names))]);
    }
  }, []);

  React.useEffect(() => {
    fetchCatalog();
    return subscribeToStoreChanges(
      [STORE_TOPICS.PRODUCTS, STORE_TOPICS.CATEGORIES, STORE_TOPICS.INVENTORY],
      fetchCatalog
    );
  }, [fetchCatalog]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const filtered = products.filter((p) => {
    // Compare loosely: a link may arrive with different casing or spacing than
    // the category is stored with, and an exact match would show nothing.
    const matchesCategory = selectedCategory === 'All' || norm(p.category) === norm(selectedCategory);
    const query = norm(search);
    const matchesSearch =
      !query || norm(p.title).includes(query) || norm(p.category).includes(query);
    const matchesOzone = !ozoneOnly || p.isOzoneWashed;
    return matchesCategory && matchesSearch && matchesOzone;
  });

  if (loading) {
    return <ShopCatalogSkeleton count={6} />;
  }

  return (
    <div className="bg-[#fbfaf6] min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div data-section-key="shop.header" className="space-y-1.5">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#2d472c] font-display tracking-tight">
            {getContent('shop.header', 'title', 'Pure Farm Catalog')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            {getContent('shop.header', 'subtitle', 'Filter 100% chemical-free staples & ozone sanitized harvest batches.')}
          </p>
        </div>

        {/* Control Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-4 top-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search farm harvest, ghee, cold-pressed oils..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2d472c] focus:ring-1 focus:ring-[#2d472c] shadow-xs"
            />
          </div>

          {/* Ozone Only Toggle */}
          <button
            onClick={() => setOzoneOnly(!ozoneOnly)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              ozoneOnly
                ? 'bg-[#2d472c] text-white border border-[#2d472c]'
                : 'bg-white text-[#2d472c] border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Ozone Certified Only</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2d472c] text-white shadow-md'
                  : 'bg-white text-secondary-800 border border-secondary-300 hover:border-primary-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-base font-semibold text-neutral-700">No produce matching your criteria</p>
          <p className="text-xs mt-1">Try changing category or clearing the search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      </div>
    </div>
  );
};

export default ShopPage;
