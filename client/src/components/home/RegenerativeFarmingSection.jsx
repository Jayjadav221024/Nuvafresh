import React from 'react';
import { useContent } from '../../context/ContentContext';
import { 
  REGEN_FARM_TO_FORK_BASE64, 
  REGEN_OZONE_WASHED_BASE64, 
  REGEN_SUSTAINABLE_PACKING_BASE64, 
  REGEN_100_FRESH_BASE64 
} from '../../assets/regenerativeBase64';

const REGENERATIVE_PILLARS = [
  {
    id: 'farm-to-fork',
    title: 'Farm To Fork',
    image: REGEN_FARM_TO_FORK_BASE64
  },
  {
    id: 'ozone-washed',
    title: 'Ozone Washed',
    image: REGEN_OZONE_WASHED_BASE64
  },
  {
    id: 'sustainable-packing',
    title: 'Sustainable Packing',
    image: REGEN_SUSTAINABLE_PACKING_BASE64
  },
  {
    id: '100-fresh',
    title: '100% Fresh',
    image: REGEN_100_FRESH_BASE64
  }
];

const RegenerativeFarmingSection = () => {
  const { getContent, getSection } = useContent();
  const sectionHeading = getContent('home.regenerative', 'sectionTitle', 'Regenerative Farming');
  const regenSection = getSection('home.regenerative', {});

  const dynamicPillars = (regenSection.pillars && regenSection.pillars.length > 0)
    ? regenSection.pillars.map((p, idx) => {
        const fallback = REGENERATIVE_PILLARS[idx] || REGENERATIVE_PILLARS[0];
        return {
          id: `pillar-${idx}`,
          title: p.title || fallback.title,
          image: p.image && p.image.trim() !== '' ? p.image : fallback.image
        };
      })
    : REGENERATIVE_PILLARS;

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-secondary-200 font-sans">
      {/* Section Title */}
      <div className="max-w-4xl mx-auto text-center mb-14">
        <h2 className="text-3xl sm:text-4xl md:text-[38px] font-bold text-[#2d472c] font-display tracking-tight">
          {sectionHeading}
        </h2>
      </div>

      {/* 4 Pillars with Dynamic or Authentic Brand Artworks */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 items-start justify-center">
        {dynamicPillars.map((pillar) => (
          <div key={pillar.id} className="flex flex-col items-center text-center group cursor-default">
            
            {/* Icon Wrapper */}
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex items-center justify-center mb-4">
              <img 
                src={pillar.image} 
                alt={pillar.title} 
                className="w-full h-full object-contain transform group-hover:scale-108 transition-transform duration-300 ease-out drop-shadow-xs"
              />
            </div>

            {/* Pillar Title */}
            <h3 className="text-base sm:text-[17px] font-bold text-[#2d472c] font-display tracking-tight">
              {pillar.title}
            </h3>

          </div>
        ))}
      </div>
    </section>
  );
};

export default RegenerativeFarmingSection;
