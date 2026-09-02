import React from 'react';

/**
 * Base shimmer block component with configurable classes.
 * `tone="admin"` swaps the warm storefront surface for the neutral grey the
 * Shopify-style admin uses.
 */
export const Skeleton = ({ className = '', rounded = 'rounded-md', tone = 'warm', ...props }) => {
  const surface = tone === 'admin'
    ? 'bg-[#dcdcdc] dark:bg-[#2a2b2c]'
    : 'bg-[#ece8dd]/80 dark:bg-neutral-800';

  return (
    <div
      className={`relative overflow-hidden ${surface} animate-pulse ${rounded} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-neutral-700/40 to-transparent" />
    </div>
  );
};

/**
 * Product Card Skeleton (exact dimension match with ProductCard.jsx)
 */
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-[#f7f5ef] p-4 flex flex-col justify-between border border-[#e5e0d3] min-h-[410px] rounded-sm relative overflow-hidden">
      {/* Top Badges Skeleton */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 items-start">
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      {/* Image Box */}
      <div className="relative w-full aspect-square bg-white border border-[#e5e0d3] p-4 flex items-center justify-center">
        <Skeleton className="w-4/5 h-4/5 rounded-lg" />
      </div>

      {/* Product Info */}
      <div className="mt-4 flex flex-col justify-between flex-1">
        {/* Rating & Unit */}
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3.5 w-14 rounded" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>

        {/* Title Lines */}
        <div className="space-y-1.5 my-2">
          <Skeleton className="h-4 w-11/12 rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>

        {/* Price & In Stock Row */}
        <div className="mt-3 pt-2.5 border-t border-[#eae5d8] flex items-baseline justify-between">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
      </div>
    </div>
  );
};

/**
 * Shop Page / Catalog Skeleton
 */
export const ShopCatalogSkeleton = ({ count = 6 }) => {
  return (
    <div className="bg-[#fbfaf6] min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title & Subtitle */}
        <div className="space-y-2">
          <Skeleton className="h-10 sm:h-12 w-64 sm:w-80 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <Skeleton className="h-11 w-full max-w-md rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-hidden pb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-xl shrink-0" />
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Product Detail Page Full Skeleton
 */
export const ProductDetailPageSkeleton = () => {
  return (
    <div className="bg-white font-sans text-neutral-900 pb-20 animate-fadeIn">
      {/* Breadcrumbs Skeleton */}
      <div className="bg-[#f7f6f2] py-3 px-4 sm:px-6 lg:px-8 border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-4" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-4" />
          <Skeleton className="h-3.5 w-36" />
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left 6 Columns: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <Skeleton className="w-full aspect-square rounded-2xl border border-neutral-200" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl border border-neutral-200 shrink-0" />
              ))}
            </div>
          </div>

          {/* Right 6 Columns: Info & Actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Certification Badge */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-8 sm:h-10 w-4/5 rounded-lg" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#fbfaf6] border border-[#e5e0d3] rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-7 w-32 rounded" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded" />
            </div>

            {/* Variant / Weight Options */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32 rounded-xl" />
                <Skeleton className="h-12 flex-1 rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Trust Assurance Strip */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/**
 * Hero Categories Skeleton
 */
export const HeroCategoriesSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4 items-start justify-center">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center text-center p-3">
            <Skeleton className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl" />
            <Skeleton className="mt-3.5 h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full Homepage Skeleton Placeholder
 */
export const HomePageSkeleton = () => {
  return (
    <div className="bg-white space-y-12 pb-12">
      {/* 1. Category Icons Skeleton */}
      <HeroCategoriesSkeleton />

      {/* 2. Bestsellers Heading Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 mt-12 mb-8">
        <Skeleton className="h-5 w-40 mx-auto rounded-full" />
        <Skeleton className="h-10 sm:h-12 w-72 sm:w-96 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-80 max-w-full mx-auto rounded" />
      </div>

      {/* 3. 4-Card Bestsellers Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* 4. Soil / Purity Banner Skeleton */}
      <div className="w-full h-80 bg-[#ede8dc] flex items-center justify-center p-6 my-10">
        <div className="max-w-xl w-full space-y-4 text-center">
          <Skeleton className="h-8 w-3/4 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 mx-auto rounded" />
        </div>
      </div>
    </div>
  );
};

/**
 * Admin Table Rows Skeleton
 */
export const AdminTableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-neutral-100 dark:border-neutral-800">
          <td className="py-4 px-6">
            <div className="flex items-center gap-3.5">
              <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          </td>
          {Array.from({ length: cols - 2 }).map((_, c) => (
            <td key={c} className="py-4 px-6">
              <Skeleton className="h-4 w-20 rounded" />
            </td>
          ))}
          <td className="py-4 px-6 text-right">
            <Skeleton className="h-8 w-16 ml-auto rounded-lg" />
          </td>
        </tr>
      ))}
    </>
  );
};

/**
 * Global Full Website Fallback Skeleton (Used for Suspense / Page transitions)
 */
export const FullWebsiteSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf6] flex flex-col font-sans">
      {/* Top Announcement Bar */}
      <div className="h-8 bg-[#2d472c]/90 flex items-center justify-center px-4">
        <Skeleton className="h-3 w-72 bg-emerald-700/50 rounded" />
      </div>

      {/* Main Navbar Skeleton */}
      <header className="h-20 bg-white border-b border-neutral-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <div className="hidden md:flex items-center gap-6">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="flex-1">
        <HomePageSkeleton />
      </main>

      {/* Footer Skeleton */}
      <footer className="bg-[#2d472c] text-white py-12 px-4 sm:px-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Skeleton className="h-8 w-32 bg-emerald-900/60 rounded" />
            <Skeleton className="h-3 w-48 bg-emerald-900/60 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 bg-emerald-900/60 rounded" />
            <Skeleton className="h-3 w-32 bg-emerald-900/60 rounded" />
            <Skeleton className="h-3 w-28 bg-emerald-900/60 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 bg-emerald-900/60 rounded" />
            <Skeleton className="h-3 w-32 bg-emerald-900/60 rounded" />
            <Skeleton className="h-3 w-28 bg-emerald-900/60 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 bg-emerald-900/60 rounded" />
            <Skeleton className="h-8 w-full bg-emerald-900/60 rounded-lg" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FullWebsiteSkeleton;
