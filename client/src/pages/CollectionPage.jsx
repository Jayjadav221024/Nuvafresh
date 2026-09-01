import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Search, Sparkles, PackageOpen } from 'lucide-react';
import ProductCard from '../components/home/ProductCard';
import API from '../api/axiosInstance';

/* Storefront view of a single collection: its banner, description and the
   products that resolved into it (manual picks or automated rules). */
const CollectionPage = () => {
  const { handle } = useParams();

  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    API.get(`/collections/${handle}`)
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.success) {
          setCollection(data.collection);
          setProducts(data.products || []);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [handle]);

  const visible = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = query
      ? products.filter((p) => p.title?.toLowerCase().includes(query))
      : [...products];

    if (sort === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === 'title-asc') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    return list;
  }, [products, search, sort]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !collection) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <PackageOpen className="h-10 w-10 text-neutral-300 mx-auto" />
        <h1 className="text-2xl font-bold text-[#2d472c] font-display">Collection not found</h1>
        <p className="text-sm text-neutral-500">
          This collection may have been renamed or unpublished.
        </p>
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#2d472c] text-white text-sm font-bold hover:bg-[#1e321d] transition-colors"
        >
          Browse all collections
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white pb-16">
      {/* Banner */}
      <div className="relative border-b border-secondary-200">
        {collection.image && (
          <div className="absolute inset-0">
            <img src={collection.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#2d472c]/70" />
          </div>
        )}
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${collection.image ? 'text-white' : ''}`}>
          <nav className={`flex items-center gap-1 text-xs font-medium mb-3 ${collection.image ? 'text-white/80' : 'text-neutral-500'}`}>
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/collections" className="hover:underline">Collections</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold">{collection.title}</span>
          </nav>

          <h1 className={`text-3xl sm:text-4xl font-bold font-display tracking-tight ${collection.image ? 'text-white' : 'text-[#2d472c]'}`}>
            {collection.title}
          </h1>

          {collection.description && (
            <p className={`mt-2 max-w-2xl text-sm leading-relaxed ${collection.image ? 'text-white/90' : 'text-neutral-600'}`}>
              {collection.description}
            </p>
          )}

          <p className={`mt-3 text-xs font-semibold ${collection.image ? 'text-emerald-200' : 'text-[#2d472c]'}`}>
            {collection.productsCount} {collection.productsCount === 1 ? 'product' : 'products'}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search in ${collection.title}`}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-sm outline-none focus:border-[#2d472c] transition-colors"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 rounded-lg border border-neutral-300 text-sm font-medium outline-none focus:border-[#2d472c] cursor-pointer"
        >
          <option value="featured">Featured</option>
          <option value="title-asc">Alphabetical, A–Z</option>
          <option value="price-asc">Price, low to high</option>
          <option value="price-desc">Price, high to low</option>
        </select>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {visible.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Sparkles className="h-8 w-8 text-neutral-300 mx-auto" />
            <p className="text-sm font-semibold text-neutral-700">
              {search ? `No products match “${search}”` : 'No products in this collection yet'}
            </p>
            <Link to="/shop" className="inline-block text-sm font-bold text-[#2d472c] hover:underline">
              Browse the full catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visible.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
