import React, { useEffect } from 'react';
import { ShieldCheck, Sparkles, AlertCircle, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

const PESTICIDE_TABLE_DATA = [
  {
    pesticide: 'Chlorpyrifos',
    category: 'Organophosphate',
    effects: 'Developmental delays in children, ADHD & learning disabilities, headaches, nausea, hormonal disruption'
  },
  {
    pesticide: 'Cypermethrin',
    category: 'Pyrethroid insecticide',
    effects: 'Skin irritation & rashes, breathing issues, disruption of the nervous system, suspected carcinogen'
  },
  {
    pesticide: 'Imidacloprid',
    category: 'Neonicotinoid',
    effects: 'Neurotoxicity, memory loss, hormonal imbalance, liver & thyroid dysfunction'
  },
  {
    pesticide: 'Dimethoate',
    category: 'Organophosphate',
    effects: 'Low sperm count & infertility, DNA damage, weak immunity, possible endocrine disruption'
  },
  {
    pesticide: 'Malathion',
    category: 'Organophosphate',
    effects: "Suspected carcinogen (linked to non-Hodgkin's lymphoma), immune system damage, liver & kidney stress"
  }
];

const OzoneShieldPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white font-sans text-neutral-900 overflow-hidden">
      
      {/* 1. Hero Banner: OZONE SHIELD with Machinery Background */}
      <section className="relative w-full h-[65vh] sm:h-[75vh] lg:h-[82vh] min-h-[500px] max-h-[800px] flex items-center justify-center bg-[#1e2a1d] overflow-hidden">
        {/* Machinery Factory Background Image with Balanced Overlay */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <img
            src="/ozone-shield-machinery.png"
            alt="Stainless steel ozone wash conveyor machinery"
            className="w-full h-full object-cover object-center brightness-95 contrast-105"
          />
          {/* Subtle gradient overlay to enhance typography contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b271a]/70 via-[#1b271a]/40 to-[#1b271a]/50" />
        </div>

        {/* Title Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#ffffff] font-display uppercase tracking-[0.18em] drop-shadow-xl">
            OZONE SHIELD
          </h1>
        </div>
      </section>

      {/* 2. Ozone Cure Section with Distressed / Torn Grass Border Divider & Pesticides Table */}
      <section className="relative w-full bg-[#374e33] text-white pt-20 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 mt-12 sm:mt-20">
        
        {/* Distressed / Torn Paper Forest Silhouette Top Border SVG */}
        <div className="absolute top-0 left-0 right-0 -translate-y-[98%] w-full overflow-hidden leading-none z-10 pointer-events-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 sm:h-20 fill-[#374e33]">
            <path d="M0,120 L0,55 Q30,40 60,60 T120,45 Q150,70 180,35 T240,65 Q280,20 320,55 T380,40 Q420,70 460,30 T520,60 Q560,35 600,50 T660,25 Q700,65 740,35 T800,60 Q840,30 880,55 T940,40 Q980,65 1020,30 T1080,60 Q1120,40 1160,55 T1200,45 L1200,120 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Section Heading: Ozone Cure */}
          <div className="text-center pt-2">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold font-display tracking-tight text-[#f7f6f2]">
              Ozone Cure
            </h2>
          </div>

          {/* Clean Rounded Glassmorphic Table matching screenshot */}
          <div className="max-w-6xl mx-auto space-y-3">
            
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-3.5 rounded-xl bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-wider text-emerald-200">
              <div className="md:col-span-2">PESTICIDE</div>
              <div className="md:col-span-3">CATEGORY</div>
              <div className="md:col-span-7">LINKED DISEASES / HEALTH EFFECTS</div>
            </div>

            {/* Table Body Rows */}
            {PESTICIDE_TABLE_DATA.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs sm:text-[13px] leading-relaxed items-center"
              >
                <div className="md:col-span-2 font-bold text-white">
                  {row.pesticide}
                </div>
                <div className="md:col-span-3 text-neutral-300">
                  {row.category}
                </div>
                <div className="md:col-span-7 text-neutral-200">
                  {row.effects}
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* 3. Power of Ozone Wash: Technical Machinery Schematic Diagram (Placed AFTER Ozone Cure) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Advanced 4-Stage Purification</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2d472c] font-display tracking-tight">
            Power of Ozone Wash
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto">
            From UV micro-bubble bath to RO sanitize rinse, air-knife drying, and food-grade packaging.
          </p>
        </div>

        {/* Technical Schematic Drawing Container matching the hand-drawn engineering diagram */}
        <div className="relative w-full max-w-6xl mx-auto rounded-3xl p-6 sm:p-10 border border-neutral-200/90 shadow-lg bg-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <div className="relative w-full overflow-hidden flex items-center justify-center">
            <img
              src="/ozone-wash-schematic-diagram.png"
              alt="Power of Ozone Wash technical machinery schematic diagram: UV Bubble Wash, RO Bubble Wash, Ozone Bubble Wash, Turbo Dryer, Air Dryer with Air Knife, Output"
              className="w-full h-auto max-h-[500px] object-contain object-center group-hover:scale-102 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 4. Section: PESTICIDE RESIDUE REDUCTION (Detailed Scientific Breakdown) */}
      <section className="bg-[#374e33] text-white pb-24 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-8 pt-10">
          
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide font-display text-white uppercase">
            PESTICIDE RESIDUE REDUCTION:
          </h2>

          {/* Bullet points & scientific statistics */}
          <div className="space-y-6 text-xs sm:text-[13.5px] leading-relaxed text-[#d7e5d5] font-normal">
            
            <p className="text-white font-medium">
              Studies have shown that ozonated water can reduce pesticide residues by <strong>40–90%</strong>.
            </p>

            <div className="space-y-1.5 pl-2">
              <p className="font-semibold text-white">Example:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-200">
                <li><strong>Chlorpyrifos:</strong> Reduced by ~70–90%</li>
                <li><strong>Cypermethrin:</strong> Reduced by ~60–85%</li>
                <li><strong>Imidacloprid:</strong> Reduced by ~50–80%</li>
              </ul>
            </div>

            <p>
              These reductions correspond to hundreds of ppb (from ~500–1000 ppb down to 50–100 ppb in some studies).
            </p>

            <div className="space-y-2 pt-2">
              <p className="font-bold text-white">Microbial Load Reduction (Bacteria, Yeasts, Molds):</p>
              <p>
                Reduction by <strong>1–4 log CFU</strong> (Colony Forming Units), which is a <strong>90–99.99%</strong> kill rate.
              </p>
              <div className="pl-4 space-y-1 text-neutral-200">
                <p><strong>E. coli:</strong> From ~1,000,000 CFU/g down to &lt;1,000 CFU/g</p>
                <p><strong>Listeria:</strong> Up to 99.9% reduction</p>
              </div>
            </div>

            {/* Technical Glossary Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/15 space-y-3 mt-6">
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Technical Reference & Clarity:
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed">
                • <strong>Ppb - Parts per billion (ppb)</strong> is a unit of measurement used to express the concentration of a substance within a mixture, typically in solutions or gases. It indicates the ratio of one part of the substance to one billion parts of the whole mixture. PPB is commonly used in fields like environmental science (measuring pollutants in air and water), food safety (detecting contaminants), and other areas where extremely low concentrations are important.
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed">
                • <strong>CFU - Colony Forming Unit</strong> In microbiology, a colony-forming unit (CFU) is a unit that estimates the number of microbial cells (bacteria, fungi, viruses etc.)
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Clean Transition Gap & Bottom CTA */}
      <section className="bg-[#fbfaf6] py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-200 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            <span>99.9% Ozone Certified</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold text-[#2d472c] font-display">
            Taste Pure Chemical-Free Living
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Every harvest batch is purified under aqueous Ozone & RO micro-bubble chambers before home delivery.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2d472c] hover:bg-[#20341f] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              <span>Explore Ozone Washed Produce</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Scroll to Top Button on Bottom Right */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 flex items-center justify-center shadow-lg border border-neutral-200 transition-transform active:scale-95"
        title="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 stroke-[2]" />
      </button>

    </div>
  );
};

export default OzoneShieldPage;
