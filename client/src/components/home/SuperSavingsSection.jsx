import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useContent } from '../../context/ContentContext';
import API from '../../api/axiosInstance';

const SERVICE_PROMISES = [
  { icon: '/services/free-shipping.png', line1: 'Free', line2: 'Shipping' },
  { icon: '/services/free-returns.png', line1: 'Free', line2: 'Returns' },
  { icon: '/services/support-24-7.png', line1: 'Support', line2: '24/7' },
  { icon: '/services/payment-secure.png', line1: '100%', line2: 'Payment Secure' }
];

const SAVINGS_FALLBACK = [
  {
    _id: 'sv-1',
    slug: 'khapli-wheat-flour',
    title: 'Khapli Emmer Wheat Flour',
    originalPrice: 305.0,
    price: 256.0,
    unit: '1 Kg',
    images: ['/products/khapli-pack.webp', '/products/khapli-texture.webp']
  },
  {
    _id: 'sv-2',
    slug: 'khapli-wheat-flour',
    title: 'Nuva Khapli Wheat Flour Pack',
    originalPrice: 305.0,
    price: 256.0,
    unit: '2 Kg',
    images: ['/products/khapli-pack.webp', '/products/khapli-texture.webp']
  },
  {
    _id: 'sv-3',
    slug: 'lakadong-turmeric-powder-7-9-curcumin',
    title: 'Lakadong Turmeric Powder',
    originalPrice: 500.0,
    price: 400.0,
    unit: '250g',
    images: ['/products/turmeric-pack.webp', '/products/turmeric-texture.webp']
  },
  {
    _id: 'sv-4',
    slug: 'lakadong-turmeric-powder-7-9-curcumin',
    title: 'Lakadong Turmeric Powder',
    originalPrice: 250.0,
    price: 200.0,
    unit: '100g',
    images: ['/products/turmeric-pack.webp', '/products/turmeric-texture.webp']
  }
];

/* The arch: a semicircular top on straight sides, matching the reference.
   The horizontal radius is half the box width and the vertical radius is set in
   its own list after the slash, which is what keeps the curve a true arch
   instead of the squashed ellipse a single `border-radius: 50%` would give.
   Percentages rather than a pixel radius so the shape holds at every card
   width - a fixed radius would clamp and flatten on the narrow mobile card.

   The box matches the design team's arch artwork (1198 x 1673), and the
   vertical radius is half the width expressed against that height
   (0.5 x 1198 / 1673 = 35.8%), so the top is a true semicircle that lines up
   with the pre-cut images instead of cropping into them. */
const ARCH_ASPECT = '1198 / 1673';
const ARCH = { borderRadius: '50% 50% 18px 18px / 35.8% 35.8% 18px 18px' };

/* The product page lives at /products/:id and accepts an id or a slug. The slug
   comes first because the fallback cards have placeholder ids that match no
   product, only a real handle. */
const productHref = (product) => `/products/${product.slug || product._id}`;

const discountOf = (product) => {
  const mrp = product.originalPrice || product.mrp;
  if (!mrp || !product.price || mrp <= product.price) return 0;
  return Math.round(((mrp - product.price) / mrp) * 100);
};

const SavingsCard = ({ product }) => {
  const { addToCart } = useCart();
  const discount = discountOf(product);
  const mrp = product.originalPrice || product.mrp;
  const [packShot, closeUp] = product.images || [];

  return (
    <div className="group flex flex-col">
      {/* Media + badge. The badge hangs off the top of the arch, so this wrapper
          carries the padding that keeps it from being clipped by the row above. */}
      <div className="relative pt-10 sm:pt-12">
        <Link
          to={productHref(product)}
          className="block relative overflow-hidden bg-[#dfd6bd] shadow-[0_18px_34px_-22px_rgba(30,45,28,0.75)] transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_26px_40px_-22px_rgba(30,45,28,0.85)]"
          style={{ ...ARCH, aspectRatio: ARCH_ASPECT }}
        >
          <img
            src={packShot}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.04] ${
              closeUp ? 'group-hover:opacity-0' : ''
            }`}
          />

          {/* Second image, if the product has one: the close-up of the product
              itself fades in over the pack shot on hover. */}
          {closeUp && (
            <img
              src={closeUp}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-0 scale-[1.06] transition-[transform,opacity] duration-700 ease-out group-hover:opacity-100 group-hover:scale-100"
            />
          )}
        </Link>

        {discount > 0 && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[86px] h-[86px] sm:w-[100px] sm:h-[100px] rounded-full bg-[#3a5233] text-[#efe6cf] flex flex-col items-center justify-center leading-none shadow-[0_10px_24px_-10px_rgba(20,35,20,0.8)]">
            <span className="font-display text-2xl sm:text-[28px] font-bold">{discount}%</span>
            <span className="font-display text-base sm:text-lg font-bold tracking-wide">OFF</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col px-1">
        <h3 className="text-sm sm:text-base font-medium text-[#2d472c] leading-snug line-clamp-2">
          <Link to={productHref(product)} className="hover:underline">
            {product.title}
          </Link>
        </h3>

        {product.unit && <p className="mt-1 text-xs text-[#5c6b53]">{product.unit}</p>}

        <div className="mt-auto pt-3 flex items-end justify-between gap-3">
          <p className="text-[#2d472c]">
            {mrp > product.price && (
              <span className="mr-1.5 text-xs text-[#5c6b53] line-through">
                ₹{mrp.toFixed(2)}
              </span>
            )}
            <span className="text-base sm:text-lg font-semibold">
              ₹{Number(product.price).toFixed(2)}
            </span>
          </p>

          <button
            type="button"
            onClick={(e) => addToCart(product, 1, e)}
            className="shrink-0 rounded-full bg-[#3a5233] hover:bg-[#2d472c] text-[#efe6cf] text-sm px-5 py-1.5 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Super Savings - the discounted rail that sits directly under Browse By
 * Category. The service promises bar leads the section rather than closing out
 * the hero, because in the design it sits on this cream ground, not on the white
 * above it.
 */
const SuperSavingsSection = () => {
  const [products, setProducts] = useState(SAVINGS_FALLBACK);
  const { getContent } = useContent();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const { data } = await API.get('/products?onSale=true&limit=4');
        const found = data?.success ? data.products : null;

        if (found && found.length > 0) {
          setProducts(found.slice(0, 4));
          return;
        }

        // No sale flag on the catalogue yet - fall back to whatever is actually
        // marked down, so the badges always have a real discount behind them
        const res = await API.get('/products?limit=24');
        const discounted = (res.data?.products || []).filter((p) => discountOf(p) > 0);
        if (discounted.length > 0) setProducts(discounted.slice(0, 4));
      } catch (e) {
        // Keeps the graceful default
      }
    };
    fetchDeals();
  }, []);

  const heading = getContent('home.super_savings', 'heading', 'Super Savings');

  return (
    <section
      data-section-key="home.super_savings"
      className="bg-[#eae3d2] rounded-t-[40px] sm:rounded-t-[56px] pt-8 sm:pt-10 pb-14 sm:pb-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Service promises bar */}
        <div className="rounded-2xl bg-[#3a5233] text-[#e9d6a4] px-5 sm:px-8 py-6 sm:py-7 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4">
          {SERVICE_PROMISES.map(({ icon, line1, line2 }) => (
            <div
              key={line2}
              className="flex items-center gap-3 sm:gap-4 justify-center md:justify-start"
            >
              {/* Line-art PNGs painted through a mask in the text colour, like the
                  category icons. The box is wider than tall because the truck and
                  card are wide; contain keeps the square ones from stretching. */}
              <span
                aria-hidden="true"
                className="block w-11 h-9 sm:w-14 sm:h-11 shrink-0 bg-current"
                style={{
                  WebkitMaskImage: `url("${icon}")`,
                  maskImage: `url("${icon}")`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center'
                }}
              />
              <p className="text-base sm:text-lg md:text-xl leading-tight">
                {line1}
                <br />
                {line2}
              </p>
            </div>
          ))}
        </div>

        {/* Heading. View All is pulled out of the flow on desktop so the title
            stays optically centred on the section, as in the design. */}
        <div className="relative mt-12 sm:mt-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#2d472c] tracking-tight">
            {heading}
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

          <Link
            to="/shop"
            className="mt-4 inline-block underline underline-offset-4 text-[#2d472c] hover:text-[#3a5233] md:mt-0 md:absolute md:right-0 md:bottom-1"
          >
            View All ›
          </Link>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 sm:gap-x-8">
          {products.map((product) => (
            <SavingsCard key={product._id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default SuperSavingsSection;
