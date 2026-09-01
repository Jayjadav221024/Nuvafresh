import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Layers } from 'lucide-react';
import API from '../api/axiosInstance';

/* Storefront index of every published collection. */
const CollectionsIndexPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    API.get('/collections?storefront=true')
      .then(({ data }) => {
        if (!cancelled && data?.success) setCollections(data.collections || []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-1 text-xs font-medium text-neutral-500 mb-3">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-neutral-700">Collections</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-[#2d472c]">
          Shop by collection
        </h1>
        <p className="mt-2 text-sm text-neutral-600 max-w-2xl leading-relaxed">
          Curated groups of chemical-free staples and ozone-washed produce, straight from our partner farms.
        </p>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Layers className="h-8 w-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-700">No collections published yet</p>
              <Link to="/shop" className="inline-block text-sm font-bold text-[#2d472c] hover:underline">
                Browse the full catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((c) => (
                <Link
                  key={c._id}
                  to={`/collections/${c.handle}`}
                  className="group rounded-2xl overflow-hidden border border-secondary-200 hover:border-[#2d472c]/40 hover:shadow-xl transition-all bg-white"
                >
                  <div className="aspect-[16/9] bg-neutral-100 overflow-hidden">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#f4f7f2]">
                        <Layers className="h-8 w-8 text-[#2d472c]/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-[#2d472c] font-display text-lg group-hover:underline">
                      {c.title}
                    </h2>
                    {c.description && (
                      <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">{c.description}</p>
                    )}
                    <p className="mt-2 text-xs font-semibold text-neutral-600">
                      {c.productsCount} {c.productsCount === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionsIndexPage;
