import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useContent } from '../../context/ContentContext';
import API from '../../api/axiosInstance';

const REELS_DATA = [
  {
    id: 1,
    title: 'Green Grapes\n(Ozone Washed)',
    crop: 'Vision Protection | Sunburn defense | Respiratory Health Support',
    price: 79,
    mrp: 99,
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
    title: 'Potato\n(Ozone Washed)',
    crop: 'Vision Protection | Sunburn defense | Respiratory Health Support',
    price: 1350,
    mrp: 1450,
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
    title: 'Tomato\n(Ozone Washed)',
    crop: 'Vision Protection | Sunburn defense | Respiratory Health Support',
    price: 160,
    mrp: 180,
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
    title: 'Beetroot\n(Ozone Washed)',
    crop: 'Vision Protection | Sunburn defense | Respiratory Health Support',
    price: 65,
    mrp: 85,
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
  },
  {
    id: 5,
    title: 'Orange\n(Ozone Washed)',
    crop: 'Vision Protection | Sunburn defense | Respiratory Health Support',
    price: 120,
    mrp: 150,
    unit: '1 Kg',
    poster: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800',
    videoUrl: '/reel-ozone-wash-1.mp4',
    product: {
      _id: 'p-4',
      title: 'Nagpur Valencia Oranges',
      price: 150,
      discountedPrice: 120,
      unit: '1 Kg',
      images: ['https://images.unsplash.com/photo-1547514701-42782101795e?w=800']
    }
  }
];

/* Card width and the gap between neighbouring cards, per breakpoint. Both are
   real pixels because the fan is positioned by transform, not by layout - the
   cards are stacked on one point and pushed outwards from it. */
const metricsFor = (w) => {
  if (w >= 1280) return { cardW: 340, spacing: 196 };
  if (w >= 1024) return { cardW: 300, spacing: 172 };
  if (w >= 640) return { cardW: 268, spacing: 150 };
  return { cardW: 232, spacing: 92 };
};

const useCarouselMetrics = () => {
  const [metrics, setMetrics] = useState(() =>
    metricsFor(typeof window === 'undefined' ? 1280 : window.innerWidth)
  );

  useEffect(() => {
    const onResize = () => setMetrics(metricsFor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return metrics;
};

const CARD_SPRING = { type: 'spring', stiffness: 60, damping: 18, mass: 0.9 };

/**
 * One card in the fan.
 *
 * Every card sits on the same centre point and is pushed out from it, so the
 * depth cues are all derived from `offset` - how many places it is from the
 * active card. Sliding the fan is then just a matter of re-deriving those from a
 * new active index; nothing is re-laid out.
 *
 * Only the active card mounts a <video>. The others show their poster, which
 * keeps four or five simultaneous video decodes off the page.
 */
const ReelCard = ({ reel, offset, cardW, spacing, isMuted, onToggleMute, onSelect, onAdd }) => {
  const dist = Math.abs(offset);
  const isActive = dist === 0;

  return (
    <motion.div
      className="absolute top-0 cursor-pointer"
      // Nearer the centre means nearer the front, so the active card overlaps both
      // of its neighbours and the fan reads as having depth
      style={{ left: '50%', width: cardW, marginLeft: -cardW / 2, zIndex: 10 - dist }}
      initial={false}
      animate={{
        x: offset * spacing,
        // Outer cards lean away from the centre, which is what turns a flat row
        // of overlapping cards into a fan
        rotate: offset * 5,
        scale: 1 - dist * 0.13,
        // Behind the active card they sit slightly low, as if further back
        y: dist * 14,
        opacity: dist > 2 ? 0 : 1,
        filter: `brightness(${isActive ? 1 : 0.72})`
      }}
      transition={CARD_SPRING}
      // Beyond the second neighbour the cards are invisible, so they must not
      // swallow clicks meant for the ones behind them
      onClick={() => !isActive && onSelect()}
      aria-hidden={dist > 2}
    >
      <div
        className={`rounded-[28px] bg-[#3a5233] p-3 sm:p-3.5 pb-4 shadow-[0_28px_60px_-24px_rgba(20,35,20,0.75)] ${
          isActive ? 'ring-1 ring-white/10' : ''
        }`}
        style={{ pointerEvents: dist > 2 ? 'none' : 'auto' }}
      >
        {/* Media */}
        <div
          className="relative rounded-[20px] overflow-hidden bg-black"
          style={{ height: cardW * 0.88 }}
        >
          {isActive ? (
            <video
              src={reel.videoUrl}
              poster={reel.poster}
              loop
              autoPlay
              playsInline
              muted={isMuted}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <img
              src={reel.poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Play glyph on the resting cards; the active one plays already, so it
              gets the sound toggle in the same spot instead */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isActive) onToggleMute();
              else onSelect();
            }}
            aria-label={isActive ? (isMuted ? 'Unmute' : 'Mute') : `Play ${reel.title.replace('\n', ' ')}`}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/25 backdrop-blur-[2px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              {isActive ? (
                isMuted ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )
              ) : (
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              )}
            </span>
          </button>
        </div>

        {/* Copy */}
        <div className="px-1.5 pt-4">
          <h3 className="font-display text-xl sm:text-2xl leading-[1.15] text-white whitespace-pre-line">
            {reel.title}
          </h3>

          <p className="mt-2 text-[12px] sm:text-[13px] leading-snug text-white/85">
            {reel.crop}
          </p>

          <p className="mt-3.5 text-[12px] sm:text-[13px] text-white/70">{reel.unit}</p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-lg sm:text-xl text-white">
              {reel.mrp > reel.price && (
                <span className="mr-1.5 text-sm text-white/55 line-through">
                  ₹{reel.mrp.toFixed(2)}
                </span>
              )}
              <span className="font-semibold">₹{reel.price.toFixed(2)}</span>
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(e);
              }}
              className="shrink-0 rounded-full bg-[#efe6cf] hover:bg-white text-[#2d472c] text-sm px-6 py-1.5 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Reel3DSection = () => {
  const [reels, setReels] = useState(REELS_DATA);
  const [activeIndex, setActiveIndex] = useState(Math.floor(REELS_DATA.length / 2));
  const [isMuted, setIsMuted] = useState(true);
  const { addToCart } = useCart();
  const { getContent } = useContent();
  const { cardW, spacing } = useCarouselMetrics();
  const stageRef = useRef(null);

  useEffect(() => {
    const fetchLiveReels = async () => {
      try {
        const { data } = await API.get('/reels');
        if (data.success && data.reels && data.reels.length > 0) {
          const formatted = data.reels.map((r, i) => {
            const fallback = REELS_DATA[i % REELS_DATA.length];
            const price = r.productPrice || 99;
            return {
              id: r._id || i,
              title: r.productTitle || r.title,
              crop: r.description || fallback.crop,
              price,
              mrp: Math.round(price * 1.25),
              unit: r.unit || '500g',
              poster: r.poster || fallback.poster,
              videoUrl: r.videoUrl,
              product: {
                _id: r._id || `p-${i}`,
                title: r.productTitle || r.title,
                price: Math.round(price * 1.25),
                discountedPrice: price,
                unit: r.unit || '500g',
                images: [r.poster || fallback.poster]
              }
            };
          });
          setReels(formatted);
          setActiveIndex(Math.floor(formatted.length / 2));
        }
      } catch (e) {}
    };
    fetchLiveReels();
  }, []);

  const headline = getContent('home.video_shopping', 'headline', 'Shop By Recipe');

  // Shortest way round, so stepping from the last card to the first slides one
  // place rather than rewinding the whole fan
  const offsetOf = (index) => {
    const n = reels.length;
    let diff = index - activeIndex;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    return diff;
  };

  const step = (dir) => setActiveIndex((prev) => (prev + dir + reels.length) % reels.length);

  // The fan is taller than any single card: the active one is full size and the
  // neighbours are pushed down, so the stage has to clear both
  const stageHeight = cardW * 1.62 + 40;

  return (
    <section id="video-shopping" className="py-12 sm:py-16 bg-white overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d472c] tracking-tight">
            {headline}
          </h2>

          {/* Hand-drawn brush rule, matching the other section headings */}
          <svg
            viewBox="0 0 320 16"
            aria-hidden="true"
            className="mx-auto mt-2 h-3 w-48 sm:w-64 md:w-80 text-[#2d472c]"
          >
            <path
              d="M3 11c58-6 126-9 198-7 41 1 79 3 116 7-38-3-79-5-120-5-64-1-131 1-194 5z"
              fill="currentColor"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* The fan. Cards overflow this box on both sides by design, so the
            section clips them rather than the container scrolling. */}
        <div
          ref={stageRef}
          className="relative mt-10 sm:mt-12 select-none"
          style={{ height: stageHeight }}
        >
          {reels.map((reel, index) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              offset={offsetOf(index)}
              cardW={cardW}
              spacing={spacing}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((m) => !m)}
              onSelect={() => setActiveIndex(index)}
              onAdd={(e) => addToCart(reel.product, 1, e)}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous recipe"
            className="w-10 h-10 rounded-full border border-[#2d472c]/25 text-[#2d472c] flex items-center justify-center hover:bg-[#2d472c] hover:text-white hover:border-[#2d472c] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {reels.map((reel, index) => (
              <button
                key={reel.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to ${reel.title.replace('\n', ' ')}`}
                aria-current={index === activeIndex}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-6 bg-[#2d472c]' : 'w-1.5 bg-[#2d472c]/25'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next recipe"
            className="w-10 h-10 rounded-full border border-[#2d472c]/25 text-[#2d472c] flex items-center justify-center hover:bg-[#2d472c] hover:text-white hover:border-[#2d472c] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Reel3DSection;
