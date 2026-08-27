import React, { useState } from 'react';
import { ShoppingCart, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useContent } from '../../context/ContentContext';
import API from '../../api/axiosInstance';

const REELS_DATA = [
  {
    id: 1,
    title: 'Ozone-Washing Pure Green Harvest',
    crop: 'Farm Fresh Greens (O3 Cleaned)',
    price: 79,
    unit: '250g',
    poster: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800',
    videoUrl: '/reel-ozone-wash-1.mp4',
    product: {
      _id: 'p-1',
      title: 'Hydro-Cleaned Crisp Baby Spinach',
      price: 99,
      discountedPrice: 79,
      unit: '250g',
      images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800']
    }
  },
  {
    id: 2,
    title: 'Ozone Sanitization & Safe Produce',
    crop: 'Ozone-Washed Fruits & Veggies',
    price: 1350,
    unit: '500ml',
    poster: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800',
    videoUrl: '/reel-ozone-wash-2.mp4',
    product: {
      _id: 'p-2',
      title: 'Desi Gir Cow A2 Bilona Ghee',
      price: 1450,
      discountedPrice: 1350,
      unit: '500ml',
      images: ['https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800']
    }
  },
  {
    id: 3,
    title: 'Vadodara Facility Live Sorting',
    crop: 'Naturally Grown Produce',
    price: 160,
    unit: '300ml',
    poster: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800',
    videoUrl: '/reel-ozone-wash-3.mp4',
    product: {
      _id: 'p-5',
      title: 'Cold-Pressed Valencia Sweet Orange Juice',
      price: 180,
      discountedPrice: 160,
      unit: '300ml',
      images: ['https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800']
    }
  },
  {
    id: 4,
    title: 'Daily Sunrise Ozone Wash Dispatch',
    crop: 'Chemical-Free Crisp Harvest',
    price: 65,
    unit: '1 Kg',
    poster: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
    videoUrl: '/reel-ozone-wash-4.mp4',
    product: {
      _id: 'p-3',
      title: 'Naturally Ripened Vine Tomatoes',
      price: 85,
      discountedPrice: 65,
      unit: '1 Kg',
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800']
    }
  }
];

const Reel3DSection = () => {
  const [reels, setReels] = useState(REELS_DATA);
  const [isMuted, setIsMuted] = useState(true);
  const { addToCart } = useCart();

  React.useEffect(() => {
    const fetchLiveReels = async () => {
      try {
        const { data } = await API.get('/reels');
        if (data.success && data.reels && data.reels.length > 0) {
          // Map backend reels to match 3D section format
          const formatted = data.reels.map((r, i) => ({
            id: r._id || i,
            title: r.title,
            crop: r.productTitle || 'Fresh Harvest',
            price: r.productPrice || 99,
            unit: '500g',
            poster: r.poster || REELS_DATA[i % REELS_DATA.length]?.poster,
            videoUrl: r.videoUrl,
            product: {
              _id: r._id || `p-${i}`,
              title: r.productTitle || r.title,
              price: r.productPrice ? Math.round(r.productPrice * 1.25) : 120,
              discountedPrice: r.productPrice || 99,
              unit: '500g',
              images: [r.poster || 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800']
            }
          }));
          setReels(formatted);
        }
      } catch (e) {}
    };
    fetchLiveReels();
  }, []);

  const { getContent } = useContent();
  const badgeText = getContent('home.video_shopping', 'badgeText', 'Shoppable Farm Feeds');
  const headline = getContent('home.video_shopping', 'headline', 'Watch, Learn & Buy Directly');

  return (
    <section id="video-shopping" className="py-10 bg-white px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaf4ec] text-[#2d472c] text-xs font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>{badgeText}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2d472c] font-display tracking-tight">
            {headline}
          </h2>
        </div>

        {/* 4 Video Reels Grid with compact height & width */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch justify-center">
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="group relative w-full aspect-[9/14] sm:aspect-[9/13.5] rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-secondary-200 bg-black flex flex-col justify-between p-3 sm:p-3.5 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Background Autoplay Video */}
              <video
                src={reel.videoUrl}
                poster={reel.poster}
                loop
                muted={isMuted}
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full object-cover z-0 group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Overlays for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/40 z-0 pointer-events-none" />

              {/* Top Bar with Live Tag and Sound Toggle */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Live
                </span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors shadow-sm"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Volume2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />}
                </button>
              </div>

              {/* Ultra-Modern Liquid Glassmorphism Bottom Card */}
              <div className="relative z-10 p-3 sm:p-3.5 rounded-2xl bg-white/30 backdrop-blur-xl saturate-150 border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-2 group-hover:bg-white/40 group-hover:border-white/60 transition-all duration-300">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-snug font-display line-clamp-1 drop-shadow-md">
                    {reel.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-neutral-100 font-medium line-clamp-1 drop-shadow-sm">
                    {reel.crop}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/20">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white drop-shadow-md">₹{reel.price}</span>
                    <span className="text-[10px] sm:text-xs text-neutral-200 ml-0.5 drop-shadow-sm">/{reel.unit}</span>
                  </div>
                  <button
                    onClick={(e) => addToCart(reel.product, 1, e)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#2d472c]/90 hover:bg-[#2d472c] text-white text-[10px] sm:text-xs font-bold border border-emerald-400/30 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span>Buy</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Reel3DSection;

