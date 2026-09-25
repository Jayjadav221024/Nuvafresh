import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

const DEFAULT_SLIDES = [
  { image: '/gifting/gift-hampers.jpg', alt: 'Gift hampers of fresh fruit and flowers', link: '/shop' },
  { image: '/gifting/gift-hampers.jpg', alt: 'Fresh fruit gift baskets', link: '/shop' },
  { image: '/gifting/gift-hampers.jpg', alt: 'Curated fruit hampers for loved ones', link: '/shop' }
];

const AUTOPLAY_MS = 5000;
const SLIDE_EASE = { duration: 0.7, ease: [0.22, 1, 0.36, 1] };

/**
 * Banner width and the gap between banners. The current banner is centred and
 * whatever is left of the row shows the neighbours peeking in at each edge.
 */
const metricsFor = (w) => {
  if (w >= 1024) return { peek: 64, gap: 22 };
  if (w >= 640) return { peek: 40, gap: 16 };
  return { peek: 20, gap: 10 };
};

/**
 * "Thoughtfully Picked for Your Loved Ones" - a looping banner carousel.
 *
 * The slide list is rendered three times over so there is always a banner on
 * both sides of the centre one to peek in. The track only ever rests on the
 * middle copy: after a move lands in one of the outer copies it is snapped,
 * invisibly, back to the same banner in the middle copy.
 */
const GiftingSection = () => {
  const { getContent } = useContent();

  const headingLead = getContent('home.gifting', 'headingLead', 'Thoughtfully Picked for Your');
  const headingAccent = getContent('home.gifting', 'headingAccent', 'Loved Ones');

  const slides = DEFAULT_SLIDES.map((slide, i) => ({
    image: getContent('home.gifting', `slide${i + 1}_image`, '') || slide.image,
    alt: getContent('home.gifting', `slide${i + 1}_alt`, '') || slide.alt,
    link: getContent('home.gifting', `slide${i + 1}_link`, '') || slide.link
  }));
  const n = slides.length;
  const track = [...slides, ...slides, ...slides];

  const rowRef = useRef(null);
  const [rowW, setRowW] = useState(0);
  const [{ peek, gap }, setMetrics] = useState(() =>
    metricsFor(typeof window === 'undefined' ? 1280 : window.innerWidth)
  );

  useLayoutEffect(() => {
    const measure = () => {
      if (rowRef.current) setRowW(rowRef.current.offsetWidth);
      setMetrics(metricsFor(window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const slideW = Math.max(0, rowW - 2 * (peek + gap));
  const pitch = slideW + gap;
  const offsetFor = (pos) => peek + gap - pos * pitch;

  // `pos` is the index into the tripled track; it rests in the middle copy
  const [pos, setPos] = useState(n);
  const x = useMotionValue(0);
  const [paused, setPaused] = useState(false);

  // Keep the track in place when the row is measured or resized
  useLayoutEffect(() => {
    x.set(offsetFor(pos));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitch, peek, gap]);

  const goTo = (next) => {
    setPos(next);
    animate(x, offsetFor(next), {
      ...SLIDE_EASE,
      onComplete: () => {
        // Landed in an outer copy: jump to the same banner in the middle copy
        const wrapped = n + (((next - n) % n) + n) % n;
        if (wrapped !== next) {
          x.set(offsetFor(wrapped));
          setPos(wrapped);
        }
      }
    });
  };

  const next = () => goTo(pos + 1);
  const prev = () => goTo(pos - 1);

  useEffect(() => {
    if (paused || !slideW) return undefined;
    const id = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, paused, slideW]);

  const active = (((pos - n) % n) + n) % n;

  const onDragEnd = (_, info) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -slideW * 0.15) next();
    else if (swipe > slideW * 0.15) prev();
    else goTo(pos);
  };

  return (
    <section data-section-key="home.gifting" className="bg-white py-4">
      {/* Heading, with the brush rule under the accent words */}
      <div className="text-center px-4">
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d472c] tracking-tight">
          {headingLead}{' '}
          <span className="relative inline-block">
            {headingAccent}
            <svg
              viewBox="0 0 320 16"
              aria-hidden="true"
              className="absolute left-0 -bottom-3 sm:-bottom-4 h-2.5 sm:h-3 w-[118%] -ml-[4%] text-[#2d472c]"
              preserveAspectRatio="none"
            >
              <path
                d="M3 11c58-6 126-9 198-7 41 1 79 3 116 7-38-3-79-5-120-5-64-1-131 1-194 5z"
                fill="currentColor"
                opacity="0.9"
              />
            </svg>
          </span>
        </h2>
      </div>

      {/* Banner row */}
      <div
        ref={rowRef}
        className="relative mt-10 sm:mt-12 overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          style={{ x, gap, opacity: slideW ? 1 : 0 }}
          drag="x"
          dragConstraints={{ left: offsetFor(pos + 1), right: offsetFor(pos - 1) }}
          dragElastic={0.08}
          onDragStart={() => setPaused(true)}
          onDragEnd={onDragEnd}
        >
          {track.map((slide, i) => (
            <Link
              key={i}
              to={slide.link}
              draggable={false}
              // A drag should not also count as a click through to the link
              onClick={(e) => { if (Math.abs(x.getVelocity()) > 20) e.preventDefault(); }}
              className="relative shrink-0 block overflow-hidden rounded-[20px] sm:rounded-[28px] aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.56/1] bg-[#5f7a4f]"
              style={{ width: slideW }}
              aria-hidden={i !== pos}
              tabIndex={i === pos ? 0 : -1}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                draggable={false}
                className="w-full h-full object-cover select-none"
              />
            </Link>
          ))}
        </motion.div>

        {/* Arrows, sitting over the peeking neighbours */}
        <button
          onClick={prev}
          aria-label="Previous gift banner"
          className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-5 lg:left-8 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 text-[#2d472c] shadow-md flex items-center justify-center hover:bg-[#2d472c] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next gift banner"
          className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-5 lg:right-8 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 text-[#2d472c] shadow-md flex items-center justify-center hover:bg-[#2d472c] hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-5 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(n + i)}
            aria-label={`Show gift banner ${i + 1}`}
            aria-current={i === active}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? 'w-7 bg-[#2d472c]' : 'w-2 bg-[#2d472c]/25 hover:bg-[#2d472c]/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default GiftingSection;
