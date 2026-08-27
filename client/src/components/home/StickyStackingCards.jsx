import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Box, Sprout } from 'lucide-react';

const CARDS_DATA = [
  {
    id: 1,
    title: 'Farm to Fork in Under 12 Hours',
    tagline: 'DIRECT HARVEST',
    description: 'Harvested at dawn from pesticide-free partner farms. No intermediate warehousing or chemical preservation.',
    icon: Sprout,
    gradient: 'from-secondary-900 via-secondary-950 to-primary-950',
    accentText: 'text-primary-300',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    title: 'Advanced 4-Stage Ozone Washing',
    tagline: 'PURITY REDEFINED',
    description: 'Infused with active O₃ micro-bubbles that break down 99.9% of surface bacteria, parasites, and chemical nitrates.',
    icon: Sparkles,
    gradient: 'from-primary-900 via-primary-950 to-secondary-950',
    accentText: 'text-primary-300',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    title: 'Zero-Plastic Breathable Packaging',
    tagline: 'SUSTAINABILITY FIRST',
    description: 'Packed in breathable, starch-based bio-films and unbleached Kraft boxes to keep your greens respiring naturally.',
    icon: Box,
    gradient: 'from-accent-900 via-accent-950 to-neutral-900',
    accentText: 'text-accent-300',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    title: '100% Lab Certified Chemical Free',
    tagline: 'VERIFIED ASSURANCE',
    description: 'Every dispatch carries a traceable QR code linking straight to HPLC gas chromatography lab reports confirming zero heavy metals.',
    icon: ShieldCheck,
    gradient: 'from-secondary-950 via-primary-900 to-neutral-950',
    accentText: 'text-primary-300',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80'
  }
];

const StickyStackingCards = () => {
  return (
    <section id="ozone-standard" className="relative bg-secondary-100/60 py-20 px-4 sm:px-6 lg:px-8 border-y border-secondary-200">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center mb-14">
        <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-accent-200 text-accent-900 border border-accent-300">
          The Nuva Standard
        </span>
        <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 font-display">
          Why Ozone Washed Produce Matters
        </h2>
        <p className="mt-3 text-base sm:text-lg text-secondary-800">
          Experience clean eating where nature meets medical-grade aqueous purification.
        </p>
      </div>

      {/* Sticky Overlapping Cards */}
      <div className="max-w-4xl mx-auto space-y-8 relative">
        {CARDS_DATA.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                top: `calc(100px + ${index * 36}px)`,
              }}
              className="sticky rounded-lg overflow-hidden border border-secondary-300 shadow-xl"
            >
              <div className={`p-8 sm:p-10 bg-gradient-to-br ${card.gradient} flex flex-col md:flex-row items-center gap-8 justify-between relative text-white`}>
                
                {/* Left Text */}
                <div className="flex-1 space-y-3 z-10">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-md bg-white/10 flex items-center justify-center border border-white/20">
                      <Icon className={`h-5 w-5 ${card.accentText}`} />
                    </div>
                    <span className={`text-xs font-bold tracking-widest uppercase ${card.accentText}`}>
                      {card.tagline}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                    {card.title}
                  </h3>

                  <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                {/* Right Image */}
                <div className="w-full md:w-64 h-44 rounded-lg overflow-hidden shadow-md border border-white/15 shrink-0">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Watermark */}
                <div className="absolute right-6 bottom-3 text-7xl font-black text-white/5 pointer-events-none select-none">
                  0{index + 1}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default StickyStackingCards;
