import React from 'react';
import { Instagram, ArrowUp, Heart, MessageCircle, Send, Bookmark, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <section className="relative w-full bg-gradient-to-b from-neutral-50/50 via-white to-[#fbfaf8] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans border-t border-neutral-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Side: Authentic High-Resolution 3D iPhone Multi-Layer Perspective Canvas */}
        <div className="relative w-full md:w-1/2 flex items-center justify-center min-h-[380px] sm:min-h-[520px] group perspective-[1200px]">
          
          {/* Dynamic Ambient Blur Glow behind the 3D Phone Setup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:scale-110 group-hover:bg-emerald-500/15" />
          
          <div className="relative w-full max-w-[480px] flex items-center justify-center transition-all duration-700 ease-out transform-gpu group-hover:-translate-y-2 group-hover:scale-105">
            {/* Ultra High-Def Master 3D Overlapping Phones Asset */}
            <img
              src={INSTAGRAM_3D_PHONES_BASE64}
              alt="The Nuva Nutrition Instagram 3D Mobile Showcase"
              className="w-full h-auto max-h-[520px] object-contain select-none pointer-events-none drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)]"
              loading="lazy"
            />
          </div>
        </div>

        {/* Right Side: Text & Follow Callout */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4ece1] text-[#2d472c] text-xs font-bold uppercase tracking-wider shadow-2xs border border-[#e8ddce]">
            <Instagram className="h-4 w-4 text-[#2d472c]" />
            <span>{handle}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#2d472c] font-display tracking-tight leading-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 font-sans leading-relaxed max-w-lg">
            {subtitle}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#2d472c] hover:bg-[#20341f] text-white text-xs sm:text-sm font-bold shadow-lg transition-all duration-200 active:scale-95 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Instagram className="h-4 w-4" />
              <span>{buttonText}</span>
            </a>

            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Daily Sunrise Harvest Stories</span>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Scroll to Top Action Button on Bottom Right */}
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
