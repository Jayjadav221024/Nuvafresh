import React from 'react';
import { Leaf } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

const DEFAULT_YOUTUBE_ID = "wdf04OwoucA";

const RegenerativeVideoSection = () => {
  const { getContent } = useContent();
  const rawEmbedOrUrl = getContent('home.video', 'videoUrl', '');
  const badgeTitle = getContent('home.video', 'badgeTitle', 'Regenerative Agriculture in Action');
  const captionTitle = getContent('home.video', 'captionTitle', 'NATURALLY GROWN & HANDPICKED');
  const captionBody = getContent('home.video', 'captionBody', 'Nurturing our soils naturally without chemicals or pesticides, delivering nutrient-rich pure harvests.');

  let vidId = DEFAULT_YOUTUBE_ID;
  if (rawEmbedOrUrl && rawEmbedOrUrl.trim() !== '') {
    if (rawEmbedOrUrl.includes('youtu.be/')) {
      vidId = rawEmbedOrUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (rawEmbedOrUrl.includes('watch?v=')) {
      vidId = rawEmbedOrUrl.split('watch?v=')[1]?.split('&')[0];
    } else if (rawEmbedOrUrl.includes('embed/')) {
      vidId = rawEmbedOrUrl.split('embed/')[1]?.split('?')[0];
    }
  }

  const embedSrc = `https://www.youtube.com/embed/${vidId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${vidId}&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&enablejsapi=1&vq=hd1080`;

  return (
    <section className="relative w-screen left-1/2 right-1/2 -mx-[50vw] bg-neutral-950 overflow-hidden font-sans border-y border-neutral-800 my-0">
      {/* Full-Width Full-Screen 100vw Canvas with High Height */}
      <div className="relative w-full h-[78vh] sm:h-[90vh] lg:h-[98vh] xl:h-[100vh] min-h-[640px] max-h-[1200px] flex items-center justify-center bg-black overflow-hidden group">
        
        {/* Full-bleed HD Video Player */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
          <iframe 
            className="w-[125%] h-[125%] min-w-full min-h-full object-cover scale-105"
            width="100%" 
            height="100%" 
            src={embedSrc} 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
          />
        </div>

        {/* Subtle Edge Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top-Left Badge: Section Title / Theme */}
        <div className="absolute top-6 left-6 sm:left-10 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs sm:text-sm font-semibold text-white shadow-lg pointer-events-none">
          <Leaf className="h-4 w-4 text-emerald-400" />
          <span>{badgeTitle}</span>
        </div>

        {/* Top-Right Badge: Live Living Soil Status */}
        <div className="absolute top-6 right-6 sm:right-10 z-20 hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold text-white shadow-lg pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>100% Living Soil & Clean Harvest</span>
        </div>

        {/* Bottom Left Overlay Caption */}
        <div className="absolute bottom-6 left-6 sm:left-10 z-20 hidden md:block max-w-md bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white shadow-xl pointer-events-none">
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">{captionTitle}</p>
          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
            {captionBody}
          </p>
        </div>

      </div>
    </section>
  );
};

export default RegenerativeVideoSection;
