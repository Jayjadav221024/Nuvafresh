import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';
import { FRESH_PRODUCE_BASE64 } from '../../assets/freshProduceBase64';
import { PULSES_LENTILS_BASE64 } from '../../assets/pulsesLentilsBase64';
import { GRAINS_STAPLES_BASE64 } from '../../assets/grainsStaplesBase64';
import { SPICES_SEASONINGS_BASE64 } from '../../assets/spicesSeasoningsBase64';
import { OILS_GHEE_BASE64 } from '../../assets/oilsGheeBase64';
import { HEALTHY_SWEETENERS_BASE64 } from '../../assets/healthySweetenersBase64';

const HERO_CATEGORIES = [
  {
    id: 'fresh-produce',
    title: 'Fresh Produce',
    image: FRESH_PRODUCE_BASE64
  },
  {
    id: 'pulses-lentils',
    title: 'Pulses & Lentils',
    image: PULSES_LENTILS_BASE64
  },
  {
    id: 'grains-staples',
    title: 'Grains & Staples',
    image: GRAINS_STAPLES_BASE64
  },
  {
    id: 'spices-seasonings',
    title: 'Spices & Seasonings',
    image: SPICES_SEASONINGS_BASE64
  },
  {
    id: 'oils-ghee',
    title: 'Oils & Ghee',
    image: OILS_GHEE_BASE64
  },
  {
    id: 'healthy-sweeteners',
    title: 'Healthy Sweeteners',
    image: HEALTHY_SWEETENERS_BASE64
  }
];

const HeroBanner = () => {
  const { getContent, getSection } = useContent();
  const badgeTag = getContent('home.hero', 'badgeTag', 'HANDPICKED & MOST LOVED');
  const headline = getContent('home.hero', 'headlineLine1', 'Nuva Bestsellers');
  const subtitleParagraph = getContent('home.hero', 'subtitleParagraph', '100% Certified Chemical-Free staples directly harvested from our verified chemical-free partner farms.');
  const heroSection = getSection('home.hero', {});

  // Extract dynamic category pills configured from admin, with fallback to authentic default artworks
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

  return (
    <section data-section-key="home.hero" className="bg-white pt-10 pb-6">
      
      {/* 6 Category Icons Grid with Vintage Hand-Drawn Woodcut Style */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 md:gap-4 items-start justify-center">
          {dynamicCategories.map((category) => (
            <Link
              key={category.id}
              to={category.link || `/shop?category=${encodeURIComponent(category.title)}`}
              className="flex flex-col items-center text-center group cursor-pointer p-1.5 sm:p-3 rounded-xl transition-transform duration-200 hover:-translate-y-1 bg-neutral-50/70 sm:bg-transparent border border-neutral-100/80 sm:border-transparent"
            >
              {/* Illustrated Icon Container with Enhanced Dimensions */}
              <div className="h-14 w-14 sm:h-20 sm:w-20 md:h-28 md:w-28 flex items-center justify-center text-[#3b553a] group-hover:scale-108 transition-transform duration-300">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="max-h-full max-w-full object-contain filter contrast-125 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                    {category.svg}
                  </div>
                )}
              </div>

              {/* Title with Fixed Height & Vertical Baseline Alignment */}
              <div className="mt-1 sm:mt-2 h-8 sm:h-10 flex items-center justify-center text-center px-0.5">
                <h3 className="text-[11px] sm:text-xs md:text-[13px] font-bold text-[#2d472c] font-sans group-hover:text-emerald-700 transition-colors leading-tight tracking-tight line-clamp-2">
                  {category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Nuva Bestsellers Section Heading (Dynamic from Admin Panel with Premium Organic Accents) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4f7f2] border border-[#d8e3d5] text-[#2d472c] text-xs font-bold uppercase tracking-widest mb-3 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>{badgeTag}</span>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <div className="hidden sm:block h-px w-16 bg-gradient-to-r from-transparent to-[#2d472c]/30" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2d472c] font-display tracking-tight">
            {headline}
          </h2>
          <div className="hidden sm:block h-px w-16 bg-gradient-to-l from-transparent to-[#2d472c]/30" />
        </div>

        <p className="mt-2.5 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto font-sans leading-relaxed">
          {subtitleParagraph}
        </p>
      </div>

    </section>
  );
};

export default HeroBanner;
