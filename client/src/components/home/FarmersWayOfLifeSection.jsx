import React from 'react';
import { useContent } from '../../context/ContentContext';
import { FARMER_SOWING_BASE64 } from '../../assets/farmerSowingBase64';

const FarmersWayOfLifeSection = () => {
  const { getContent } = useContent();
  const smallTag = getContent('home.farmers', 'smallTag', 'OUR WAY OF LIFE');
  const mainHeadline = getContent('home.farmers', 'mainHeadline', 'FARMERS ARE PROFESSIONAL PROBLEM SOLVERS');
  const paragraphCopy = getContent('home.farmers', 'paragraphCopy', 'Organic Farming isn’t a type of farming but a way of life. Besides being workers of the soil, farmers believe in community strength and rely on the natural interconnection of species!');
  const customImg = getContent('home.farmers', 'farmerIllustration', '');
  const activeImage = customImg && customImg.trim() !== '' ? customImg : FARMER_SOWING_BASE64;

  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-b border-secondary-200 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Text Content with Scroll Reveal */}
        <div className="lg:col-span-5 space-y-5">
          <span className="inline-block text-xs font-bold tracking-[0.2em] text-[#5d6856] uppercase animate-fade-in-up">
            {smallTag}
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-[#2d472c] font-display uppercase tracking-tight leading-[1.15] hover:text-[#3d5e3c] transition-colors duration-300">
            {mainHeadline}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans font-medium max-w-lg">
            {paragraphCopy}
          </p>
        </div>

        {/* Right Authentic Hand-Drawn Farmer Artwork */}
        <div className="lg:col-span-7 flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-xl group">
            <img 
              src={activeImage} 
              alt="Farmers Sowing Seeds - Nuva Nutrition" 
              className="w-full h-auto max-h-[460px] object-contain transform group-hover:scale-103 transition-transform duration-500 ease-out"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default FarmersWayOfLifeSection;
