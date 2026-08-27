import React, { useState } from 'react';
import ProductCard from '../components/home/ProductCard';
import { Search, Sparkles } from 'lucide-react';
import API from '../api/axiosInstance';
import { ShopCatalogSkeleton } from '../components/common/Skeleton';

const DEFAULT_CATEGORIES = [
  'All',
  'Ozone Washed Vegetables',
  'A2 Ghee',
  'Stone Pressed Oils',
  'Organic Atta',
  'Cold-Pressed Juices'
];

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [ozoneOnly, setOzoneOnly] = useState(false);

  React.useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.allSettled([
          API.get('/products'),
          API.get('/admin/categories/public')
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data.success) {
          setProducts(prodRes.value.data.products);
        }

        if (catRes.status === 'fulfilled' && catRes.value.data.success && catRes.value.data.categories?.length > 0) {
          const names = ['All', ...catRes.value.data.categories.map(c => c.name)];
          setCategories(names);
        }
      } catch (e) {
        console.error('Catalog fetch fallback');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
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
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#2d472c] font-display tracking-tight">Pure Farm Catalog</h1>
          <p className="text-xs sm:text-sm text-neutral-600">Filter 100% chemical-free staples & ozone sanitized harvest batches.</p>
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
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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
