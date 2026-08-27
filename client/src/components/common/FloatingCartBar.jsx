import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FloatingCartBar = () => {
  const { cart, itemCount, subtotal, setIsDrawerOpen, isDrawerOpen } = useCart();

  // If cart is empty or drawer is already open, do not show floating bar
  if (!cart || cart.length === 0 || isDrawerOpen) return null;

  // Show up to 2 distinct product thumbnails, with remaining count pill if more
  const displayedItems = cart.slice(0, 2);
  const remainingCount = cart.length - displayedItems.length;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div 
        onClick={() => setIsDrawerOpen(true)}
        className="cursor-pointer group flex items-center gap-3.5 sm:gap-4 bg-[#1f382a] text-white pl-2.5 pr-2 py-2 rounded-full shadow-[0_12px_36px_rgba(15,35,22,0.45)] border border-[#355842] hover:bg-[#182f23] hover:shadow-[0_16px_40px_rgba(15,35,22,0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-95 select-none"
      >
        {/* Overlapping Product Thumbnails */}
        <div className="flex items-center -space-x-2.5 pl-1">
          {displayedItems.map((item, idx) => {
            const imgSrc = item.images?.[0] || item.image || item.thumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';
            return (
              <div
                key={item._id || idx}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#1f382a] bg-white overflow-hidden shadow-sm flex items-center justify-center shrink-0"
              >
                <img
                  src={imgSrc}
                  alt={item.title || item.name || 'Product'}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}

          {remainingCount > 0 && (
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#1f382a] bg-[#34533f] text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Count & Price Information */}
        <div className="flex flex-col text-left pr-1 leading-tight">
          <span className="text-[10px] sm:text-[11px] font-medium text-emerald-200 uppercase tracking-wider">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
            ₹{subtotal.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Golden Yellow Cart Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDrawerOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 bg-[#f5c76c] hover:bg-[#fabf50] text-[#1c2e22] font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-md transition-all duration-200 group-hover:bg-[#fbd37e]"
          title="Open Cart"
        >
          <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
          <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

export default FloatingCartBar;
