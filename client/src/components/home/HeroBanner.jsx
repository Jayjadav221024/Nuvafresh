import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useInView, animate } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Linkedin, Instagram, Twitter, Facebook,
  Heart, ShoppingCart, Minus, Plus
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useContent } from '../../context/ContentContext';

const HERO_PRODUCTS = [
  {
    _id: 'hero-prod-1',
    title: 'ELAICHI BANANA',
    badge: 'STAR SELLER',
    price: 120.00,
    unit: '1 kg',
    description: 'Elaichi Banana, also known as "Yelaki" in Karnataka or "Chiniya Banana" in North India, is a small-sized, sweet variant of banana known for its rich aroma and specific taste.',
    image: '/hero-elaichi-banana-top.png',
    // Shot straight down on a round plate, so it spins flat like a real dish
    topDown: true,
    category: 'Fresh Produce'
  },
  {
    _id: 'hero-prod-2',
    title: 'FRESH BUTTON MUSHROOMS',
    badge: 'FARM FRESH',
    price: 60.00,
    unit: '200g',
    description: 'Fresh Button Mushrooms are firm, creamy-white and mild in flavour, harvested young for a tender bite that soaks up every sauce, stir-fry and curry.',
    image: '/hero-mushroom.png',
    category: 'Fresh Produce'
  },
  {
    _id: 'hero-prod-3',
    title: 'A2 COW GHEE',
    badge: 'BEST SELLER',
    price: 850.00,
    unit: '500 ml',
    description: 'A2 Cow Ghee is slow-cooked from the milk of desi cows using the traditional bilona method, giving it a rich golden grain, nutty aroma and wholesome goodness.',
    image: '/hero-a2-ghee.png',
    category: 'Oils & Ghee'
  },
  {
    _id: 'hero-prod-4',
    title: 'ORGANIC TURMERIC POWDER',
    badge: 'PURE & NATURAL',
    price: 120.00,
    unit: '200g',
    description: 'Organic Turmeric Powder is stone-ground from sun-dried haldi roots, rich in natural curcumin with a deep golden colour and earthy, warm aroma.',
    image: '/hero-turmeric.png',
    category: 'Spices & Seasonings'
  }
];

const HERO_CATEGORIES = [
  { id: 'fresh-produce', title: 'Fresh Produce', image: '/categories/fresh-produce.png' },
  { id: 'pulses-lentils', title: 'Pulses & Lentils', image: '/categories/pulses-lentils.png' },
  { id: 'grains-staples', title: 'Grains & Staples', image: '/categories/grains-staples.png' },
  { id: 'spices-seasonings', title: 'Spices & Seasonings', image: '/categories/spices-seasonings.png' },
  { id: 'oils-ghee', title: 'Oils & Ghee', image: '/categories/oils-ghee.png' },
  { id: 'healthy-sweeteners', title: 'Healthy Sweeteners', image: '/categories/healthy-sweeteners.png' }
];

/* Cream line-art on the dark green disc, matching the reference. */
const CATEGORY_ICON = '#e9d6a4';

const STEP = 360 / HERO_PRODUCTS.length; // Wheel turn per product

/**
 * Wheel radius and dish diameter per breakpoint. The wheel is measured in real
 * pixels because the dishes are pinned to its rim by trigonometry, so the two
 * have to share one coordinate system. The radius sets how gently the arc curves
 * across the hero, and keeps the off-stage dishes well outside the panel.
 */
/* `rim` is the background band's own geometry, and it has to be per-breakpoint.
   The SVG stretches to its box with preserveAspectRatio="none", so a viewBox
   shaped for a wide desktop hero (1440x700) squashed into a phone's narrow box
   distorts the circle badly - the arc turns near-vertical and the band's
   thickness squeezes with it. Each breakpoint gets a viewBox roughly the shape
   of the box it will land in, with the circle sized to match. */
const metricsFor = (w) => {
  if (w >= 1280) {
    return { R: 820, D: 460, rim: { vw: 1440, vh: 700, cy: -280, r: 700, sw: 220 } };
  }
  if (w >= 1024) {
    return { R: 700, D: 400, rim: { vw: 1440, vh: 700, cy: -280, r: 700, sw: 220 } };
  }
  if (w >= 640) {
    return { R: 560, D: 320, rim: { vw: 1000, vh: 620, cy: -200, r: 520, sw: 170 } };
  }
  return { R: 380, D: 240, rim: { vw: 480, vh: 560, cy: -120, r: 300, sw: 110 } };
};

const useWheelMetrics = () => {
  const [metrics, setMetrics] = useState(() =>
    metricsFor(typeof window === 'undefined' ? 1280 : window.innerWidth)
  );

  useEffect(() => {
    const onResize = () => setMetrics(metricsFor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { ...metrics, size: metrics.R * 2 };
};

/* Entrance timing. The band starts first so it is already settling when the
   product arrives, and the product reads as landing onto it. */
const BAND_RISE = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };
const PRODUCT_DROP = { duration: 0.8, delay: 0.13, ease: [0.22, 1, 0.36, 1] };

/* How the wheel settles on a new product. */
const WHEEL_SPRING = { type: 'spring', stiffness: 40, damping: 16, mass: 1 };

/* Copy blurs out the moment a turn starts and blurs back in only once the new
   product has landed. Without the wait the text was still on screen while the
   dish swung across it, and the two overlapped mid-flight. The enter delay is
   what holds it back; the exit is quick so the old copy clears immediately. */
const COPY_MOTION = {
  initial: { opacity: 0, filter: 'blur(14px)', y: 16 },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
  exit: { opacity: 0, filter: 'blur(10px)', y: -10 }
};

const COPY_TRANSITION = {
  duration: 0.55,
  delay: 0.42,
  ease: [0.22, 1, 0.36, 1],
  // Leaving must not wait on the incoming delay, or the old copy lingers
  exit: { duration: 0.22, delay: 0, ease: 'easeIn' }
};

/**
 * The wheel-rim band behind the product.
 *
 * A hollow circle: only its stroke paints, which is what gives a thick curved
 * band instead of a filled shape. The mask fades both ends out so they dissolve
 * rather than cutting off at the edges.
 *
 * cy is NEGATIVE, putting the circle's centre above the hero so what lands
 * inside is its BOTTOM arc - a valley. That is what sends the two arms climbing
 * up to the top corners behind the navbar while the curve dips lowest dead
 * centre, passing behind the product. A positive cy would flip it to an arch
 * with the arms falling away toward the corners instead.
 *
 * Tuning: cy sets how deep the dip sits, r how flat it is (larger = flatter),
 * strokeWidth the band thickness. The height is pinned to the hero row rather
 * than the whole panel so the valley's lowest point stays inside the box - it
 * is what keeps the band from being cut off by a hard edge above the strip.
 */
const HeroRim = ({ rim }) => (
  <motion.svg
    aria-hidden="true"
    className="absolute top-0 left-0 w-full h-[520px] sm:h-[536px] lg:h-[632px] -z-10 pointer-events-none"
    viewBox={`0 0 ${rim.vw} ${rim.vh}`}
    preserveAspectRatio="none"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={BAND_RISE}
  >
    <defs>
      <linearGradient id="fadeMask" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="white" stopOpacity="0" />
        <stop offset="15%" stopColor="white" stopOpacity="1" />
        <stop offset="85%" stopColor="white" stopOpacity="1" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <mask id="edgeFade">
        <rect x="0" y="0" width={rim.vw} height={rim.vh} fill="url(#fadeMask)" />
      </mask>
    </defs>

    <circle
      cx={rim.vw / 2}
      cy={rim.cy}
      r={rim.r}
      fill="none"
      stroke="#E8E8E8"
      strokeWidth={rim.sw}
      mask="url(#edgeFade)"
    />
  </motion.svg>
);

/* The product shots are wide, angled plates rather than round top-down dishes,
   so the dish box is wider than it is tall. */
const DISH_ASPECT = 1.3;

/**
 * A hero dish bolted to the wheel rim. It rolls with the wheel on every turn -
 * the old one travels off stage while the next rides up into the panel - and
 * lifts slightly while hovered.
 *
 * The shots are transparent PNGs, so there is no circular crop: the plate's own
 * outline is the edge, and the shadow is a drop-shadow that follows it.
 *
 * While hovered the dish spins in place. A top-down shot of a round plate
 * (`topDown`) simply rotates clockwise, which is exactly how a real plate
 * spinning on the table looks from above. An angled shot can't do that without
 * skewing the food, so it turns about its own vertical axis in 3D instead.
 * On leave it carries on the same way to the next full turn and settles there.
 */
const DISH_SPIN_SECONDS = 6; // One full turn while hovered
const DISH_PERSPECTIVE = 1400; // px - lower = stronger 3D depth (angled shots only)

const HeroDish = ({ product, size }) => {
  const spin = useMotionValue(0);
  const spinRun = useRef(null);
  // Angled shots: negative rotateY moves the near side left, which reads as
  // clockwise seen from above. Perspective lives in the transform itself because
  // the wrapper's filter would otherwise flatten the 3D.
  const turn = useTransform(spin, (deg) =>
    product.topDown
      ? `rotate(${deg}deg)`
      : `perspective(${DISH_PERSPECTIVE}px) rotateY(${-deg}deg)`
  );

  useEffect(() => () => spinRun.current?.stop(), []);

  const startSpin = () => {
    spinRun.current?.stop();
    const from = spin.get();
    spinRun.current = animate(spin, [from, from + 360], {
      duration: DISH_SPIN_SECONDS,
      ease: 'linear',
      repeat: Infinity
    });
  };

  const stopSpin = () => {
    spinRun.current?.stop();
    const current = spin.get();
    const rest = Math.ceil(current / 360) * 360;
    // Remaining distance sets the duration, so the plate keeps roughly its pace
    spinRun.current = animate(spin, rest, {
      duration: Math.max(0.35, ((rest - current) / 360) * DISH_SPIN_SECONDS * 0.5),
      ease: [0.22, 1, 0.36, 1]
    });
  };

  return (
    <motion.div
      className="relative"
      // Shadow sits on the wrapper, not the spinning image, so it keeps falling downward
      style={{
        width: size * DISH_ASPECT,
        height: size,
        filter: `drop-shadow(0 ${size * 0.04}px ${size * 0.05}px rgba(45,71,44,0.22))`
      }}
      whileHover={{ scale: 1.04, y: -6 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      onHoverStart={startSpin}
      onHoverEnd={stopSpin}
    >
      <motion.img
        src={product.image}
        alt={product.title}
        className="w-full h-full object-contain select-none pointer-events-none"
        style={{ transform: turn }}
      />
    </motion.div>
  );
};

/**
 * One card in the strip. Selecting the card body rolls the wheel to that
 * product; the wishlist, Add and cart controls sit on top of it, so each of
 * those stops the click from bubbling up and moving the wheel underneath.
 */
const StripCard = ({ product, isActive, onSelect }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const [wished, setWished] = useState(false);

  const line = cart.find((item) => item._id === product._id);
  const qty = line?.quantity || 0;

  const stop = (fn) => (event) => {
    event.stopPropagation();
    fn(event);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={isActive}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`relative cursor-pointer rounded-t-[64px] sm:rounded-t-[80px] rounded-b-3xl border px-3 pt-14 sm:pt-[74px] pb-9 text-center transition-all duration-200 ${isActive
          ? 'border-[#2d472c] bg-white/70 shadow-[0_18px_36px_-22px_rgba(45,71,44,0.6)]'
          : 'border-[#9fae97] bg-transparent hover:bg-white/45'
        }`}
    >
      {/* Product image, straddling the top of the arch */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-11 sm:-top-14 w-32 h-24 sm:w-44 sm:h-32">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_8px_10px_rgba(45,71,44,0.2)]"
        />
      </div>

      {/* Wishlist. Kept in the flow rather than absolutely placed, so it always
          lands just under the image whatever the card ends up sized at. */}
      <div className="flex justify-end -mt-2 mb-0.5 pr-0.5">
        <button
          onClick={stop(() => setWished((w) => !w))}
          aria-label={wished ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
          aria-pressed={wished}
          className="text-[#2d472c] hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wished ? 'fill-[#2d472c]' : ''}`} />
        </button>
      </div>

      <h3 className="text-xs sm:text-[15px] font-semibold text-[#2d472c] leading-tight line-clamp-2 min-h-[2.2em]">
        {product.title}
      </h3>

      <p className="mt-1.5 text-xl sm:text-[28px] font-bold text-[#2d472c] leading-none">
        ₹{product.price.toFixed(2)}
      </p>
      <p className="mt-1 text-[11px] text-[#6f7c6c]">{product.unit}</p>

      {/* Add, or the stepper once it is in the basket */}
      <div className="mt-2.5 flex justify-center">
        {qty > 0 ? (
          <div className="inline-flex items-center gap-2.5 rounded-full bg-[#2d472c] text-white px-2.5 py-1">
            <button
              onClick={stop(() => updateQuantity(product._id, -1))}
              aria-label={`Decrease ${product.title} quantity`}
              className="w-5 h-5 flex items-center justify-center hover:opacity-70"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold tabular-nums min-w-[1ch]">{qty}</span>
            <button
              onClick={stop(() => addToCart(product))}
              aria-label={`Increase ${product.title} quantity`}
              className="w-5 h-5 flex items-center justify-center hover:opacity-70"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={stop((e) => addToCart(product, 1, e))}
            className="rounded-full border border-[#2d472c] px-6 py-1 text-xs font-semibold text-[#2d472c] hover:bg-[#2d472c] hover:text-white transition-colors"
          >
            Add
          </button>
        )}
      </div>

      {/* Cart button, straddling the bottom edge of the card */}
      <button
        onClick={stop((e) => addToCart(product, 1, e))}
        aria-label={`Add ${product.title} to cart`}
        className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-9 h-9 rounded-full border border-[#2d472c] bg-[#f3f1e6] text-[#2d472c] flex items-center justify-center hover:bg-[#2d472c] hover:text-[#f3f1e6] transition-colors"
      >
        <ShoppingCart className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * The card strip under the hero. It is the wheel's other set of controls: each
 * card selects its product, and the chevrons step the wheel, so the strip and
 * the hero always show the same thing.
 */
const ProductStrip = ({ activeIndex, onSelect, onPrev, onNext }) => (
  <div className="relative max-w-7xl mx-auto px-10 sm:px-14">
    <div
      className="relative rounded-[28px] px-5 sm:px-10 pt-20 sm:pt-24 pb-8 sm:pb-10"
      style={{
        background: [
          'repeating-linear-gradient(48deg, rgba(120,110,80,0.07) 0px, rgba(120,110,80,0.07) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 5px)',
          'repeating-linear-gradient(-42deg, rgba(120,110,80,0.055) 0px, rgba(120,110,80,0.055) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 8px)',
          'linear-gradient(180deg, #ece7d7 0%, #e5dfcc 100%)'
        ].join(', ')
      }}
    >
      {/* Ticket notches punched out of both edges. They are filled with the page
          colour, which is what makes them read as cut into the panel. */}
      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white" />
      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-16 sm:gap-x-6">
        {HERO_PRODUCTS.map((product, i) => (
          <StripCard
            key={product._id}
            product={product}
            isActive={i === activeIndex}
            onSelect={() => onSelect(i)}
          />
        ))}
      </div>
    </div>

    {/* Chevrons, sitting in the notches */}
    <button
      onClick={onPrev}
      aria-label="Previous product"
      className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-[#2d472c] hover:text-[#729867] transition-colors"
    >
      <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={1.25} />
    </button>
    <button
      onClick={onNext}
      aria-label="Next product"
      className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-[#2d472c] hover:text-[#729867] transition-colors"
    >
      <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={1.25} />
    </button>
  </div>
);

/**
 * Browse By Category.
 *
 * Before the section is scrolled to, all six discs sit stacked on the row's
 * centre point, so they read as a single circle. When it comes into view the
 * stack splits: the first three travel out to the left, the last three to the
 * right, each landing on its own grid slot.
 *
 * The landing positions are the real grid positions - the circles are never
 * moved out of the grid. They are only transformed onto the centre and then
 * released back to zero, so the layout stays plain CSS grid at every width and
 * the fan-out works the same on the 3-column mobile grid as on the 6-column
 * desktop one. Offsets are read with offsetLeft/offsetTop rather than
 * getBoundingClientRect because those are layout values and so are not
 * polluted by the collapse transform that is already applied.
 */
const SPLIT_SPRING = { type: 'spring', stiffness: 60, damping: 17, mass: 0.9 };

/**
 * One disc. Its offset is driven by motion values rather than an `animate` prop
 * so the two states can be applied differently: collapsing onto the centre is
 * SET (an instant jump, done while the row is still off screen or hidden), and
 * only the fan-out is ANIMATED. With an `animate` prop the component would mount
 * already in its final position whenever the section happened to be on screen at
 * load, and the split would never be seen.
 */
const CategoryCircle = ({ category, offset, open, delay }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reveal = useMotionValue(0); // icon + label opacity

  useLayoutEffect(() => {
    if (!offset) return undefined;

    if (!open) {
      // Park on the centre without animating - this is the resting stacked state
      x.set(offset.dx);
      y.set(offset.dy);
      reveal.set(0);
      return undefined;
    }

    const runs = [
      animate(x, 0, { ...SPLIT_SPRING, delay }),
      animate(y, 0, { ...SPLIT_SPRING, delay }),
      animate(reveal, 1, { duration: 0.4, delay: delay + 0.22 })
    ];

    return () => runs.forEach((run) => run.stop());
  }, [offset, open, delay, x, y, reveal]);

  return (
    <motion.div className="flex justify-center" style={{ x, y }}>
      <Link
        to={category.link || `/shop?category=${encodeURIComponent(category.title)}`}
        className="flex flex-col items-center text-center group cursor-pointer"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-[168px] md:h-[168px] rounded-full bg-[#3a5233] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_34px_-16px_rgba(45,71,44,0.85)]">
          {category.image ? (
            /* Painted through a CSS mask rather than tinted with filters. The
               assets are RGBA line art on a transparent ground, so the alpha
               channel makes a clean stencil - which gives the exact cream, where
               a brightness/invert/sepia chain could only approximate it.

               The icon is hidden while the discs are stacked; six icons piled on
               one another is what would give the stack away as more than a
               single circle. */
            <motion.span
              role="img"
              aria-label={category.title}
              className="block w-[66%] h-[66%] transition-transform duration-300 group-hover:scale-105"
              style={{
                opacity: reveal,
                backgroundColor: CATEGORY_ICON,
                WebkitMaskImage: `url("${category.image}")`,
                maskImage: `url("${category.image}")`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center'
              }}
            />
          ) : (
            <div className="w-1/2 h-1/2 flex items-center justify-center text-[#e9d6a4]">
              {category.svg}
            </div>
          )}
        </div>

        <motion.h3
          className="mt-3.5 text-[12px] sm:text-sm md:text-[15px] font-medium text-[#2d472c] font-sans leading-snug group-hover:text-[#3a5233] transition-colors max-w-[9rem]"
          style={{ opacity: reveal }}
        >
          {category.title}
        </motion.h3>
      </Link>
    </motion.div>
  );
};

const CategoryCircles = ({ categories }) => {
  const gridRef = useRef(null);
  // The negative bottom margin holds the trigger back until the row has actually
  // travelled up into the viewport, instead of firing the moment its top edge appears
  const inView = useInView(gridRef, { once: true, margin: '0px 0px -22% 0px' });
  const [offsets, setOffsets] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      const grid = gridRef.current;
      if (!grid) return;

      const centerX = grid.offsetWidth / 2;
      const centerY = grid.offsetHeight / 2;

      setOffsets(
        Array.from(grid.children).map((child) => ({
          dx: centerX - (child.offsetLeft + child.offsetWidth / 2),
          dy: centerY - (child.offsetTop + child.offsetHeight / 2)
        }))
      );
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [categories.length]);

  // Until the slots are measured there is nothing sensible to collapse onto, so
  // the row is held invisible rather than flashing in its spread-out state
  const measured = offsets !== null;
  const mid = (categories.length - 1) / 2;

  return (
    <div
      ref={gridRef}
      // `relative` makes the grid the children's offsetParent, which is what the
      // offsetLeft/offsetTop measurements above are taken against
      className="relative mt-8 sm:mt-10 grid grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-8 sm:gap-x-5"
      style={{ opacity: measured ? 1 : 0 }}
    >
      {categories.map((category, index) => (
        <CategoryCircle
          key={category.id}
          category={category}
          offset={offsets?.[index]}
          open={measured && inView}
          // The innermost pair leaves the stack first and the outermost last, so the
          // split reads as one circle peeling apart rather than six moving at once
          delay={(Math.abs(mid - index) - 0.5) * 0.09}
        />
      ))}
    </div>
  );
};

const HeroBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  // Accumulating (non-modulo) wheel angle so the wheel always turns the intended direction
  const ring = useMotionValue(0);
  const targetAngle = useRef(0);
  const { R, D, size, rim } = useWheelMetrics();
  const { addToCart } = useCart();
  const { getContent, getSection } = useContent();

  const activeProduct = HERO_PRODUCTS[activeIndex];

  /* Roll the wheel by a signed number of slots. The angle accumulates rather
     than wrapping at 360, so the wheel always turns the way it was asked to
     instead of unwinding the long way back to zero. */
  const spinBy = (slots, nextIndex) => {
    if (slots === 0) return;
    targetAngle.current -= slots * STEP;
    animate(ring, targetAngle.current, WHEEL_SPRING);
    setActiveIndex(nextIndex);
  };

  /* Picking a card rolls whichever way is shorter, so choosing the last card
     rolls back one step rather than grinding forward through the whole wheel. */
  const goTo = (nextIndex) => {
    const n = HERO_PRODUCTS.length;
    let slots = (((nextIndex - activeIndex) % n) + n) % n;
    if (slots > n / 2) slots -= n;
    spinBy(slots, nextIndex);
  };

  const handleNext = () => spinBy(1, (activeIndex + 1) % HERO_PRODUCTS.length);
  const handlePrev = () =>
    spinBy(-1, (activeIndex - 1 + HERO_PRODUCTS.length) % HERO_PRODUCTS.length);

  const categoryHeading = getContent('home.hero', 'categoryHeading', 'Browse By Category');
  const heroSection = getSection('home.hero', {});

  const dynamicCategories = (heroSection.categoryItems && heroSection.categoryItems.length > 0)
    ? heroSection.categoryItems.map((item, idx) => {
      const fallback = HERO_CATEGORIES[idx] || HERO_CATEGORIES[0];
      return {
        id: `hero-cat-${idx}`,
        title: item.title || fallback.title,
        image: item.image && item.image.trim() !== '' ? item.image : fallback.image,
        link: item.link || `/shop?category=${encodeURIComponent(item.title || fallback.title)}`
      };
    })
    : HERO_CATEGORIES;

  /* The negative margin slides the hero up under the nav row, which is
     transparent at the top of the page - so the background band runs on behind
     the logo and links instead of stopping at a seam where the two meet. The
     hero row adds the same amount back as padding, so nothing visibly moves.
     Both are per-breakpoint and must stay in step with the navbar’s own
     h-20/h-24/h-28, or the hero content drifts. */
  return (
    <section data-section-key="home.hero" className="bg-white relative -mt-20 sm:-mt-24 lg:-mt-28 pb-12 select-none">

      {/* Full-bleed panel on white. overflow-hidden keeps the off-stage dishes
          out of sight. */}
      <div className="relative isolate overflow-hidden bg-white">

        {/* `isolate` makes the panel a stacking context, so the band's -z-10
            lands behind the hero content but still above the panel's own white
            background instead of vanishing beneath it. */}
        <HeroRim rim={rim} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-2 min-h-[520px] sm:min-h-[536px] lg:min-h-[632px] flex items-center">

          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

            {/* Left: product title and copy */}
            <div className="md:col-span-3 order-2 md:order-1 relative z-20 text-center md:text-right">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct._id}
                  {...COPY_MOTION}
                  transition={COPY_TRANSITION}
                  className="space-y-2.5"
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-sans tracking-wide text-[#2d472c] uppercase leading-tight">
                    {activeProduct.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#556b53] font-sans leading-relaxed mx-auto md:mx-0 md:ml-auto max-w-xs sm:max-w-sm font-normal">
                    {activeProduct.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Centre: the dish, riding the rim of the wheel. Top-aligned rather
                than centred in the row, so it sits up near the navbar and the
                valley of the band passes behind its lower half. */}
            <div className="md:col-span-6 order-1 md:order-2 md:self-start relative flex justify-center" style={{ zIndex: 0 }}>
              <div className="relative shrink-0" style={{ width: D, height: D }}>

                {/* The rolling frame. Its hub sits a full radius ABOVE the dish,
                    matching the way the rim band arcs upward - so the dishes
                    hang off the underside of the wheel and the off-stage ones
                    wait up near the navbar. That is what makes the next product
                    swing DOWN into place instead of rising from below. */}
                <motion.div
                  className="absolute"
                  style={{
                    width: size,
                    height: size,
                    left: D / 2 - size / 2,
                    top: D / 2 - R - size / 2,
                    rotate: ring,
                    zIndex: 1
                  }}
                  initial={{ opacity: 0, y: -72 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={PRODUCT_DROP}
                >
                  {HERO_PRODUCTS.map((product, i) => {
                    // Resting slot is +90deg: the bottom of the wheel, directly
                    // under the hub, which is where the product sits.
                    const a = ((90 + i * STEP) * Math.PI) / 180;
                    // The wheel is turned -i*STEP when product i is on stage, so
                    // pre-rotating its slot by +i*STEP lands the plate upright.
                    // Round dishes never needed this; angled shots do.
                    return (
                      <div
                        key={product._id}
                        className="absolute"
                        style={{
                          left: size / 2 + R * Math.cos(a),
                          top: size / 2 + R * Math.sin(a),
                          marginLeft: -(D * DISH_ASPECT) / 2,
                          marginTop: -D / 2,
                          transform: `rotate(${i * STEP}deg)`
                        }}
                      >
                        <HeroDish product={product} size={D} />
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* Right: badge, actions and the wheel controls */}
            <div className="md:col-span-3 order-3 relative z-20 flex flex-col items-center md:items-end justify-center space-y-4">

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.badge}
                  {...COPY_MOTION}
                  transition={COPY_TRANSITION}
                  className="bg-[#2d472c] text-[#f4efe4] px-5 py-2 font-display font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xs border-l-4 border-[#8e9f8b]"
                >
                  {activeProduct.badge}
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col items-stretch md:items-end gap-2.5 w-44">
                <Link
                  to={`/shop?category=${encodeURIComponent(activeProduct.category)}`}
                  className="w-full py-2.5 rounded-full bg-[#e7e3d4] text-[#2d472c] font-medium text-xs sm:text-sm hover:bg-[#ded7c0] text-center transition-colors shadow-2xs"
                >
                  See More
                </Link>

                <button
                  onClick={() => addToCart(activeProduct)}
                  className="w-full py-2.5 rounded-full border border-[#2d472c] bg-white text-[#2d472c] font-medium text-xs sm:text-sm hover:bg-[#2d472c] hover:text-white text-center transition-colors shadow-2xs"
                >
                  Add To Cart
                </button>
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  onClick={handlePrev}
                  aria-label="Previous product dish"
                  className="w-8 h-8 rounded-full border border-neutral-300 bg-white flex items-center justify-center text-[#2d472c] hover:bg-[#2d472c] hover:text-white hover:border-[#2d472c] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold text-neutral-600 font-sans tabular-nums tracking-wider">
                  0{activeIndex + 1} / 0{HERO_PRODUCTS.length}
                </span>

                <button
                  onClick={handleNext}
                  aria-label="Next product dish"
                  className="px-3.5 py-1.5 rounded-full bg-[#2d472c] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#20341f] transition-colors shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

          {/* Far right vertical social rail */}
          <div className="hidden lg:flex flex-col items-center space-y-4 absolute right-2 top-1/2 -translate-y-1/2 text-neutral-700 z-30">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#2d472c] transition-colors p-1" title="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#2d472c] transition-colors p-1" title="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#2d472c] transition-colors p-1" title="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#2d472c] transition-colors p-1" title="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Card strip: the wheel's other controls. It shares the panel - and the
            background band running behind it - so the two read as one block
            rather than as a hero with a separate section bolted underneath. */}
        <div className="relative z-10 pb-10">
          <ProductStrip
            activeIndex={activeIndex}
            onSelect={goTo}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>

      {/* Browse By Category - sits directly under the hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">

        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d472c] tracking-tight">
            {categoryHeading}
          </h2>

          {/* Hand-drawn brush rule under the heading */}
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

        <CategoryCircles categories={dynamicCategories} />
      </div>

      {/* The hero ends on Browse By Category. What used to follow here - the
          service promises bar and the Nuva Bestsellers heading - now lives with
          the sections it belongs to: the bar opens SuperSavingsSection, and the
          heading sits with its own product grid on HomePage. Super Savings comes
          between the two. */}

    </section>
  );
};

export default HeroBanner;
