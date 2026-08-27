import React from 'react';
import { Search } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

const PROMO_HARVEST_ITEMS = [
  {
    id: 'promo-1',
    headline: 'to your',
    boldHeadline: 'SOUL',
    bgImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    title: 'Ozone Washed - Tomato',
    originalPrice: 50.00,
    fromPrice: 40.00,
    price: 40.00,
    thumb: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150&auto=format&fit=crop&q=80',
    unit: '500g'
  },
  {
    id: 'promo-2',
    headline: 'Rich in nutrients.',
    subHeadline: 'Rich i',
    bgImage: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=800&auto=format&fit=crop&q=80',
    title: 'Ozone Washed - Beetroot',
    originalPrice: 50.00,
    price: 40.00,
    thumb: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=150&auto=format&fit=crop&q=80',
    unit: '500g'
  },
  {
    id: 'promo-3',
    headline: '&',
    boldHeadline: 'full of goodness',
    bgImage: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop&q=80',
    title: 'Desi Orange',
    originalPrice: 99.00,
    fromPrice: 80.00,
    price: 80.00,
    thumb: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=150&auto=format&fit=crop&q=80',
    unit: '1 Kg'
  },
  {
    id: 'promo-4',
    headline: '',
    boldHeadline: '',
    bgImage: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    title: 'Ozone Washed - Potato',
    originalPrice: 50.00,
    price: 40.00,
    thumb: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150&auto=format&fit=crop&q=80',
    unit: '1 Kg'
  }
];

const VisualStoriesSection = () => {
  const { addToCart } = useCart();

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {PROMO_HARVEST_ITEMS.map((item) => (
          <div key={item.id} className="flex flex-col space-y-3 group">
            
            {/* 1. Top Tall Atmospheric Visual Poster */}
            <div className="relative w-full aspect-[9/14] rounded-2xl overflow-hidden shadow-md bg-neutral-900">
              <img
                src={item.bgImage}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Bottom Gradient Overlay for typography readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

              {/* Typography Overlay at bottom */}
              {(item.headline || item.boldHeadline) && (
                <div className="absolute bottom-6 left-5 right-5 z-10 text-left">
                  {item.headline && (
                    <p className="text-sm sm:text-base text-white/90 font-serif italic leading-none">
                      {item.headline}
                    </p>
                  )}
                  {item.boldHeadline && (
                    <p className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-tight ${item.boldHeadline.includes('goodness') ? 'text-amber-400 font-serif italic normal-case text-xl' : 'text-white font-sans'}`}>
                      {item.boldHeadline}
                    </p>
                  )}
                  {item.subHeadline && (
                    <p className="text-xs text-white/75 mt-0.5">
                      {item.subHeadline}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 2. Bottom Mini Product Bar (Beige Box matching screenshot) */}
            <div className="bg-[#e7e4dc] rounded-xl p-3 flex items-center justify-between shadow-sm border border-[#dad4c7]">
              
              {/* Thumbnail Container */}
              <div className="h-11 w-11 rounded-lg bg-white p-1 overflow-hidden shadow-inner shrink-0 flex items-center justify-center">
                <img
                  src={item.thumb}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Title & Price */}
              <div className="flex-1 min-w-0 mx-2.5 text-left">
                <h4 className="text-xs font-bold text-[#2d472c] truncate">
                  {item.title}
                </h4>
                <div className="text-[11px] font-sans mt-0.5">
                  <span className="text-neutral-500 line-through mr-1">
                    Rs. {item.originalPrice.toFixed(2)}
                  </span>
                  {item.fromPrice ? (
                    <span className="text-[#b91c1c] font-bold">
                      From Rs. {item.fromPrice.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[#b91c1c] font-bold">
                      Rs. {item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick View Add Button */}
              <button
                onClick={(e) => addToCart({
                  _id: item.id,
                  title: item.title,
                  price: item.price,
                  discountedPrice: item.price,
                  images: [item.thumb],
                  unit: item.unit
                }, 1, e)}
                className="h-7 w-7 rounded-md bg-[#2d3a2b] text-white flex items-center justify-center shadow hover:bg-neutral-800 transition-colors shrink-0"
                title="Quick Add to Basket"
              >
                <Search className="h-3.5 w-3.5 stroke-[2.2]" />
              </button>

            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default VisualStoriesSection;
