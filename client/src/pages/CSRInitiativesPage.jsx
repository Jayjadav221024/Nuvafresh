import React, { useEffect } from 'react';
import { Heart, Sprout, ArrowUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

const CSR_PILLARS = [
  {
    number: '1',
    text: 'Development of new agricultural technologies'
  },
  {
    number: '2',
    text: 'Training farmers in Agri-Tech use'
  },
  {
    number: '3',
    text: 'Providing subsidized Agri-Tech equipment'
  },
  {
    number: '4',
    text: 'Promote permanent and organic agriculture practices'
  }
];

const CSRInitiativesPage = () => {
  const { getContent } = useContent();
  const headline = getContent('csr.hero', 'headline', '1 Rupee On Every Order To AGRI TECH');
  const subheadline = getContent(
    'csr.hero', 
    'subheadline', 
    'We understand the need for the development of the Agri-Tech industry. We believe in empowering farmers and the ecosystem, giving back to the community as much as we can. For every single order placed by our customers, Nuva donates ₹1 towards the development of Agri-Tech. This means each time you buy from us, you are helping farmers, the environment, and the Indian system.'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white font-sans text-neutral-900 overflow-hidden">
      
      {/* 1. Hero Banner: CSR INITIATIVES with Farm Planting Background matching screenshot */}
      <section className="relative w-full h-[65vh] sm:h-[80vh] lg:h-[85vh] min-h-[500px] max-h-[850px] flex items-center justify-center bg-neutral-950 overflow-hidden">
        {/* Farm Field Planting Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/csr-initiatives-hero.jpg"
            alt="Founder planting sapling in fertile farm soil"
            className="w-full h-full object-cover object-center brightness-95"
          />
          {/* Subtle dark gradient overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-brightness-95" />
        </div>

        {/* Title Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#ffffff] font-display uppercase tracking-[0.16em] drop-shadow-lg">
            CSR INITIATIVES
          </h1>
        </div>
      </section>

      {/* 2. Section: 1 Rupee On Every Order To AGRI TECH & 4 Contribution Pillar Cards */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Heading & Paragraph */}
        <div className="max-w-4xl mx-auto text-center space-y-5 mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-[#2d472c] font-display tracking-tight">
            {headline}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-3xl mx-auto">
            {subheadline}
          </p>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#2d472c] font-display">
            The ₹1 Contribution Goes Towards:
          </h3>
        </div>

        {/* 4 Green Pillar Cards with Huge Watermark Numbers matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {CSR_PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className="relative aspect-square sm:aspect-[4/4.5] rounded-3xl bg-[#374e33] p-6 sm:p-7 flex flex-col items-center justify-center text-center text-white shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group cursor-default"
            >
              {/* Huge Background Number Watermark matching screenshot */}
              <span className="absolute inset-0 flex items-center justify-center text-[180px] sm:text-[210px] font-serif font-black text-white/[0.08] pointer-events-none select-none group-hover:scale-105 transition-transform duration-500">
                {pillar.number}
              </span>

              {/* Foreground Card Text */}
              <p className="relative z-10 text-sm sm:text-base font-medium leading-snug px-2 text-[#f7f6f2]">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>

      </section>

      {/* 3. Section: Tractor & Meadow Illustration Banner with "A Step Towards The Future Of Farming" */}
      <section className="relative w-full bg-white pt-8">
        
        {/* Authentic Pencil Hand-drawn Tractor in Meadow Grass Illustration Banner (100% Full Width across screen) */}
        <div className="w-full overflow-hidden -mb-1">
          <img
            src="/tractor-grass-banner.png"
            alt="Hand-drawn agricultural tractor in lush farm meadow grass"
            className="w-full h-auto max-h-64 sm:max-h-80 md:max-h-96 object-cover object-bottom"
          />
        </div>

        {/* Lower Deep Green Banner with Narrative & Wheat Ear Graphic */}
        <div className="w-full bg-[#374e33] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            
            {/* Left Content */}
            <div className="w-full md:w-3/4 space-y-4">
              <h2 className="text-2xl sm:text-4xl font-bold font-display tracking-tight text-[#f7f6f2]">
                A Step Towards<br />
                The Future Of Farming
              </h2>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                Our initiative is a targeted step toward bridging urban consumers and agricultural communities. With each purchase, Nuva customers play an active role in promoting Indian agriculture; to promote a system that is not only safe and healthy, but also of technology, innovation and stability.
              </p>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                By choosing us you not only buy fruits and vegetables, but you also support the development of a smart, green and more flexible agricultural future.
              </p>
            </div>

            {/* Right Wheat Stalk Grain Graphic matching screenshot */}
            <div className="w-full md:w-1/4 flex justify-end">
              <svg viewBox="0 0 180 200" className="h-40 w-auto fill-[#f7f6f2] opacity-90">
                {/* Stalk 1 */}
                <path d="M 30 190 Q 60 110 130 50" stroke="#f7f6f2" strokeWidth="2.5" fill="none" />
                {/* Grains */}
                <ellipse cx="140" cy="45" rx="14" ry="7" transform="rotate(-35 140 45)" />
                <ellipse cx="120" cy="55" rx="13" ry="6" transform="rotate(-30 120 55)" />
                <ellipse cx="105" cy="70" rx="13" ry="6" transform="rotate(-25 105 70)" />
                <ellipse cx="90" cy="85" rx="12" ry="6" transform="rotate(-20 90 85)" />
                <ellipse cx="75" cy="105" rx="12" ry="6" transform="rotate(-15 75 105)" />
                <ellipse cx="60" cy="125" rx="11" ry="5" transform="rotate(-10 60 125)" />

                {/* Stalk 2 */}
                <path d="M 30 190 Q 90 120 160 80" stroke="#f7f6f2" strokeWidth="2.5" fill="none" />
                <ellipse cx="165" cy="78" rx="13" ry="6" transform="rotate(-25 165 78)" />
                <ellipse cx="150" cy="88" rx="12" ry="6" transform="rotate(-20 150 88)" />
                <ellipse cx="135" cy="100" rx="12" ry="6" transform="rotate(-15 135 100)" />
                <ellipse cx="118" cy="115" rx="11" ry="5" transform="rotate(-10 118 115)" />
                <ellipse cx="100" cy="132" rx="10" ry="5" transform="rotate(-5 100 132)" />
              </svg>
            </div>

          </div>
        </div>

      </section>

      {/* Call to action at the bottom */}
      <section className="bg-[#fbfaf6] py-14 px-4 sm:px-6 lg:px-8 border-t border-neutral-200 text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-[#2d472c] font-display mb-3">
          Join Hands in Regenerative Impact
        </h3>
        <p className="text-sm text-neutral-600 max-w-lg mx-auto mb-6">
          Every order directly funds sustainable tech, bio-fertilizers, and living soil stewardship for our farmers.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2d472c] hover:bg-[#20341f] text-white text-sm font-bold shadow-lg transition-transform active:scale-95"
        >
          <span>Shop & Support Agri-Tech</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
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

export default CSRInitiativesPage;
