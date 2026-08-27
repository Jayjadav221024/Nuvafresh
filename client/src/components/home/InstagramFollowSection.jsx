import React from 'react';
import { Instagram, ArrowUp } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { INSTAGRAM_3D_PHONES_BASE64 } from '../../assets/instagram3DPhonesBase64';

const InstagramFollowSection = () => {
  const { getContent } = useContent();
  const handle = getContent('home.instagram', 'handle', '@nuvanutrition');
  const title = getContent('home.instagram', 'title', 'Follow our daily farm harvest on Instagram');
  const subtitle = getContent('home.instagram', 'subtitle', 'Join 24,000+ conscious food lovers witnessing sunrise harvests, cold ozone washing, and healthy recipes.');
  const buttonText = getContent('home.instagram', 'buttonText', 'Follow @nuvanutrition');
  const instagramUrl = getContent('home.instagram', 'instagramUrl', 'https://instagram.com');
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans border-t border-neutral-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Side: Authentic 3D Instagram Mobile Mockup with Realistic Perspective & Shadow */}
        <div className="relative w-full md:w-1/2 flex items-center justify-center min-h-[380px] sm:min-h-[480px] group">
          <div className="relative w-full max-w-[480px] flex items-center justify-center transition-transform duration-500 hover:scale-105">
            <img
              src={INSTAGRAM_3D_PHONES_BASE64}
              alt="The Nuva Nutrition Instagram 3D Showcase"
              className="w-full h-auto max-h-[500px] object-contain drop-shadow-2xl select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Right Side: Text & Follow Callout */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4ece1] text-[#2d472c] text-xs font-bold uppercase tracking-wider">
            <Instagram className="h-3.5 w-3.5" />
            <span>{handle}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#2d472c] font-display tracking-tight leading-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 font-sans leading-relaxed max-w-lg">
            {subtitle}
          </p>

          <div className="pt-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2d472c] hover:bg-[#20341f] text-white text-xs sm:text-sm font-bold shadow-lg transition-transform duration-200 active:scale-95"
            >
              <Instagram className="h-4 w-4" />
              <span>{buttonText}</span>
            </a>
          </div>
        </div>

      </div>

      {/* Floating Scroll to Top Action Button on Bottom Right matching image */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 flex items-center justify-center shadow-lg border border-neutral-200 transition-transform active:scale-95"
        title="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 stroke-[2]" />
      </button>
    </section>
  );
};

export default InstagramFollowSection;
