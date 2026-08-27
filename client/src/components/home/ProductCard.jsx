import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Flame, Check, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const isInCart = cart.some((item) => item._id === product._id);

  return (
    <div 
      className="bg-[#f7f5ef] hover:bg-white p-4 flex flex-col justify-between border border-[#e5e0d3] hover:border-[#2d472c]/40 shadow-xs hover:shadow-xl transition-all duration-300 relative group min-h-[410px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Badges: Hot Deal / Organic Farm */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1.5 items-start pointer-events-none">
        {product.isHotDeal && (
          <span className="inline-flex items-center gap-1 bg-[#b91c1c] text-white text-[11px] font-bold px-2.5 py-0.5 shadow-xs">
            <Flame className="h-3 w-3 fill-current" />
            <span>Hot Deal</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1 bg-[#2d472c]/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 shadow-xs">
          <Sparkles className="h-2.5 w-2.5 text-emerald-300" />
          <span>100% Pure</span>
        </span>
      </div>

      {/* 2. Top Image Container - Crisp Clean Square Box */}
      <Link 
        to={`/products/${product._id || product.slug || 'p-1'}`} 
        className="relative w-full aspect-square bg-white overflow-hidden flex items-center justify-center p-3 border border-[#e5e0d3] group-hover:border-[#2d472c]/40 transition-all shadow-xs"
      >
        <img
          src={product.images?.[0]}
          alt={product.title}
          className="w-full h-full object-contain p-1 group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Quick View Search Magnifier */}
        <div 
          className="absolute top-3 right-3 z-20 h-8 w-8 bg-[#f4f2ea] hover:bg-[#2d472c] hover:text-white text-[#2d472c] hidden sm:flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Quick View"
        >
          <Search className="h-4 w-4 stroke-[2.2]" />
        </div>

        {/* "Add to Cart" Button: Visible on Mobile Touch Screens, Hover Reveal on Desktop */}
        <div className={`absolute inset-x-3 bottom-3 z-10 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-100 sm:opacity-0 translate-y-0 sm:translate-y-3'}`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1, e);
            }}
            className={`w-full py-2.5 px-3 sm:px-4 text-xs font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 rounded-sm ${
              isInCart 
                ? 'bg-emerald-700 text-white' 
                : 'bg-[#2d472c] hover:bg-[#3d5a3c] text-white active:scale-95'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-200" />
                <span>Added in Basket</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5 text-emerald-300" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* 3. Product Info Block */}
      <div className="mt-4 flex flex-col justify-between flex-1">
        {/* Rating Stars & Unit */}
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-[11px] text-neutral-700">4.9</span>
            <span className="text-[10px] text-neutral-400">(48)</span>
          </div>
          {product.unit && (
            <span className="text-[11px] font-medium bg-[#eae6dc] text-[#3e563b] px-2 py-0.5 rounded-md">
              {product.unit}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/products/${product._id || product.slug || 'p-1'}`}>
          <h3 className="text-[14px] font-bold text-[#2d472c] font-sans leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Pricing Layout */}
        <div className="mt-3 pt-2.5 border-t border-[#eae5d8] flex items-baseline justify-between">
          <div>
            {product.fromPrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-neutral-500 uppercase font-semibold">From</span>
                <span className="text-base font-black text-[#2d472c]">
                  ₹{product.fromPrice.toFixed(0)}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  - ₹{product.toPrice.toFixed(0)}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black text-[#2d472c]">
                  ₹{(product.discountedPrice || product.price).toFixed(0)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-neutral-400 line-through">
                    ₹{product.originalPrice.toFixed(0)}
                  </span>
                )}
              </div>
            )}
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            In Stock
          </span>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
