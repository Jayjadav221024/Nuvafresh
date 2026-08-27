import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '../../context/ContentContext';
import { SOIL_STRIP_BASE64 } from '../../assets/soilStripBase64';

const WherePurityGrowsSection = () => {
  const { getContent } = useContent();
  const topHeadline = getContent('home.purity', 'topHeadline', "Proud to be India's 2nd to introduce Ozone -Wash freshness where purity meets innovation.");
  const sectionTitle = getContent('home.purity', 'sectionTitle', 'Where Purity Grows');
  const bodyText = getContent('home.purity', 'bodyText', 'At The Nuva, we don’t just supply produce we supply trust. We begin from the ground level, where we collaborate with local farms and international growers to source the best of Indian and exotic fruits and vegetables. The Nuva each fruit and vegetable are ozone-washed and a guarantees of cleanliness, freshness, and peace of mind.');
  const footerTagline = getContent('home.purity', 'footerTagline', 'Because health begins at home. And home begins with what you eat.');
  const customBg = getContent('home.purity', 'bgImage', '');
  const activeBgImage = customBg && customBg.trim() !== '' ? customBg : SOIL_STRIP_BASE64;

  const sectionRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        setIsInView(true);
        // Normalized scroll progress through the section (-1 at top entry, 0 at center, 1 at bottom exit)
        const progress = (windowHeight / 2 - (rect.top + rect.height / 2)) / (windowHeight / 2 + rect.height / 2);
        setScrollY(progress * 48); // Smooth 48px continuous up-to-down displacement
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="py-8 font-sans relative overflow-hidden bg-white">
      
      {/* 1. Top Statement Banner with Staggered Scroll Ease */}
      <div 
        className={`max-w-5xl mx-auto px-4 text-center mb-12 transition-all duration-700 ease-out transform ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
        }`}
      >
        <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#2d472c] font-sans tracking-tight leading-snug">
          {topHeadline}
        </h2>
      </div>

      {/* 2. Full-Width Soil Banner */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] min-h-[460px] md:min-h-[540px] flex items-center justify-center overflow-hidden bg-white">
        
        {/* Full-width Soil Strip with Smooth Counter-Parallax */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <img 
            src={activeBgImage} 
            alt="Where Purity Grows Soil Earth" 
            className="w-full h-full object-cover sm:object-fill transition-transform duration-300 ease-out"
            style={{ transform: `scale(1.03) translateY(${scrollY * -0.2}px)` }}
          />
        </div>

        {/* Centered White Text Block on Soil with Dynamic On-Scroll Up-to-Down Travel */}
        <div 
          className="relative z-10 max-w-2xl sm:max-w-3xl mx-auto px-6 py-16 text-center text-white space-y-4 transition-transform duration-300 ease-out"
          style={{ transform: `translateY(${scrollY}px)` }}
        >
          {/* Main Title: "Where Purity Grows" */}
          <h3 
            className={`text-3xl sm:text-4xl md:text-[46px] font-bold font-display text-white tracking-tight leading-tight drop-shadow-md transition-all duration-700 delay-100 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
            }`}
          >
            {sectionTitle}
          </h3>

          {/* Paragraph Body with Smooth Entry */}
          <p 
            className={`text-xs sm:text-[13px] md:text-[14px] text-neutral-100 font-sans leading-relaxed max-w-xl mx-auto font-normal drop-shadow-sm px-2 transition-all duration-700 delay-200 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            {bodyText}
          </p>

          {/* Tagline footer line */}
          <p 
            className={`text-xs sm:text-[13px] md:text-[14px] text-neutral-100 font-sans font-normal pt-1 drop-shadow-sm transition-all duration-700 delay-300 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            {footerTagline}
          </p>
        </div>

      </div>
    </section>
  );
};

export default WherePurityGrowsSection;
