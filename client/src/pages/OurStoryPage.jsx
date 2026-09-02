import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Heart, Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

const OurStoryPage = () => {
  const { getContent } = useContent();
  const founderName = getContent('about.story', 'founderName', 'Aanshi Patel');
  const storyText = getContent('about.story', 'storyText', 'My name is Aanshi Patel, and I come from a family of farmers in Gujarat, and I have seen first-hand the effort and challenges that go into producing a single yield. What concerned me even more was when I saw the unhygienic "cleaning" practices and how many hands the produce passed through before it reached you.');
  const missionStatement = getContent('about.story', 'missionStatement', 'In shock and concern, I wanted to change it so that farmers get rewarded for their hard work and people receive fruits and vegetables that are truly clean. With this vision, I founded Nuva. Not just as a company, but as a promise. A promise not just to our customers, but to myself.');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setMounted(true);
  }, []);

  return (
    <div className="bg-[#fcfbf9] font-sans text-neutral-900 overflow-hidden space-y-16 sm:space-y-20 pb-20">
      
      {/* 1. Header Hero Banner with subtle fade in */}
      <section data-section-key="about.hero" className={`bg-[#fbfaf6] py-16 px-4 sm:px-6 lg:px-8 border-b border-[#e5e0d3] text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#e8e4d8] text-[#2d472c] text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Leaf className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>{getContent('about.hero', 'tag', 'The Nuva Journey')}</span>
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#2d472c] font-display tracking-tight">
            {getContent('about.hero', 'title', 'Our Story')}
          </h1>
          <p className="text-secondary-800 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed text-neutral-600 pt-1">
            {getContent('about.hero', 'subtitle', 'From the deep soil of Gujarat farms to your dining table — how we are redefining food safety and regenerative agriculture.')}
          </p>
        </div>
      </section>

      {/* Section 1: Story of Nuva (Founder Story - Image Left, Text Right) */}
      <section data-section-key="about.story" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          {/* Left: Founder Photo with Organic Curved Badge */}
          <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-lg lg:max-w-xl aspect-[4/4.5] md:h-[520px] lg:h-[560px] rounded-3xl lg:rounded-[40px] rounded-br-[80px] overflow-hidden shadow-2xl border-4 border-white bg-neutral-100 group transition-all duration-500 hover:shadow-3xl">
              <img
                src="/founder-aanshi-patel.jpg"
                alt={`${founderName} - Founder of Nuva`}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>
            
            {/* Subtle decorative glow blob */}
            <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-[#e7e3d8] rounded-full -z-10 blur-2xl opacity-70" />
          </div>

          {/* Right: Founder Narrative Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                {getContent('about.story', 'eyebrow', "Founder's Note")}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#2d472c] font-display tracking-tight leading-[1.15]">
                {getContent('about.story', 'heading', 'Story of Nuva')}
              </h2>
            </div>
            <div className="space-y-4 text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
              <p className="bg-white/60 p-4 rounded-2xl border border-[#ece8de] shadow-xs">
                {storyText}
              </p>
              <p className="bg-[#f4f7f2] p-4 rounded-2xl border border-[#dce6d8] text-[#2d472c] font-medium leading-relaxed">
                {missionStatement}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Section 1.5: Our Facilities: Where Tradition Meet Innovation */}
      <section data-section-key="about.facilities" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white border border-[#e5e0d3] min-h-[420px] sm:min-h-[460px] lg:min-h-[480px] flex flex-col lg:flex-row items-stretch group transition-all duration-300 hover:shadow-2xl">
          
          {/* Left Title Column */}
          <div className="w-full lg:w-2/5 p-8 sm:p-12 pb-44 sm:pb-52 flex flex-col justify-start relative z-10">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                {getContent('about.facilities', 'eyebrow', 'Infrastructure')}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#2d472c] font-display tracking-tight leading-[1.2]">
                {getContent('about.facilities', 'titleLine1', 'Our Facilities:')}
              </h2>
              <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#2d472c] font-display tracking-tight leading-[1.2]">
                {getContent('about.facilities', 'titleLine2', 'Where Tradition')}
              </h3>
              <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#2d472c] font-display tracking-tight leading-[1.2]">
                {getContent('about.facilities', 'titleLine3', 'Meet Innovation')}
              </h3>
            </div>
          </div>

          {/* Right Olive Green Content Box with Rounded Top-Left Corner */}
          <div className="w-full lg:w-3/5 bg-[#3e563b] text-white p-8 sm:p-12 lg:p-14 pb-44 sm:pb-52 flex flex-col justify-start relative z-20 rounded-t-3xl lg:rounded-t-none lg:rounded-tl-[90px]">
            {/* Body Copy */}
            <div className="space-y-4 text-xs sm:text-[14px] leading-relaxed text-neutral-100 font-normal">
              <p>
                {getContent('about.facilities', 'para1', 'Ever known where your produce comes from? Where was it cleaned? Well, now you do. At The Nuva, we deliver safe, organic, chemical-free, fresh, and hygienic produce to every home in Vadodara.')}
              </p>
              <p>
                {getContent('about.facilities', 'para2', 'Nuva has its own warehouse equipped with ozone-washing technology, an extremely effective method used to disinfect fruits and vegetables. This process helps us remove pesticides, bacteria, and viruses. Our process enhances the taste and colour of the produce making it residual-free, making sure your health is our priority.')}
              </p>
              <p className="text-emerald-200 font-medium">
                {getContent('about.facilities', 'para3', 'Our modern technology, clean spaces, and a professional team of doctors and nutritionists make sure that each produce that reaches your home is looked after from harvest to packaging.')}
              </p>
            </div>
          </div>

          {/* Continuous Bottom Panoramic Crop Foliage Banner */}
          <div className="absolute inset-x-0 bottom-0 w-full h-44 sm:h-52 md:h-60 lg:h-64 z-30 pointer-events-none overflow-hidden flex items-end">
            <img
              src="/facilities-crops-foreground.png"
              alt="Organic Crops Field Floor"
              className="w-full h-full object-cover object-bottom"
            />
          </div>

        </div>
      </section>

      {/* Section 2: Why Us - USP (Ozonized Washing Technology) */}
      <section data-section-key="about.ozone_usp" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
            {getContent('about.ozone_usp', 'eyebrow', 'Clean Tech Purity')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2d472c] font-display tracking-tight">
            {getContent('about.ozone_usp', 'heading', 'Why Us - USP')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto">
            {getContent('about.ozone_usp', 'subheading', 'Discover our standard for 99.9% residual-free food purification.')}
          </p>
        </div>

        {/* Banner with Curved Organic Transition (Green Left Box with curved right border, Photo Right) */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-[#374e33] flex flex-col lg:flex-row items-stretch group transition-all duration-300 hover:shadow-2xl">
          
          {/* Left Green Content Area */}
          <div className="w-full lg:w-3/5 p-8 sm:p-12 lg:p-16 text-white space-y-5 flex flex-col justify-center relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wider text-white">
              {getContent('about.ozone_usp', 'cardTitle', 'OZONIZED WASHING TECHNOLOGY')}
            </h3>
            <p className="text-xs sm:text-[14px] leading-relaxed text-neutral-200/90 font-normal">
              {getContent('about.ozone_usp', 'para1', 'Ozone (O₃) is a powerful oxidizing agent that reacts with contaminants and breaks them down into harmless substances. Ozone is generated by passing oxygen through a high-voltage electrical field, and is then dissolved in water, creating ozonated water.')}
            </p>
            <p className="text-xs sm:text-[14px] leading-relaxed text-neutral-200/90 font-normal">
              {getContent('about.ozone_usp', 'para2', 'Fruits and vegetables are then submerged in ozonated water, allowing it to neutralize the contaminants. This process breaks down pesticides, bacteria, viruses, and other pathogens, while preserving crisp natural crunch and vital nutrients.')}
            </p>
          </div>

          {/* Right Apples Conveyor Photo */}
          <div className="w-full lg:w-2/5 relative min-h-[300px] lg:min-h-[400px] bg-neutral-900 overflow-hidden">
            {/* Custom SVG Curve Separation matching the screenshot */}
            <div className="hidden lg:block absolute -left-1 top-0 bottom-0 w-16 z-20 pointer-events-none">
              <svg viewBox="0 0 100 500" preserveAspectRatio="none" className="h-full w-full fill-[#374e33]">
                <path d="M 0 0 Q 80 250 0 500 L 0 500 Z" />
              </svg>
            </div>
            <img
              src={getContent('about.ozone_usp', 'image', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80')}
              alt="Ozone Washed Apples on Conveyor"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

        </div>
      </section>

      {/* Section 3: Sustainable Packaging */}
      <section data-section-key="about.sustainable_packaging" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-[#e8e4d5] flex flex-col lg:flex-row items-stretch border border-[#d8d2bf] group transition-all duration-300 hover:shadow-2xl">
          
          {/* Left Kraft Bag / Illustrated Bag Package (Full height of the card) */}
          <div className="w-full lg:w-2/5 relative min-h-[320px] lg:min-h-[420px] flex items-center justify-center bg-[#e8e4d5] overflow-hidden">
            <img
              src={getContent('about.sustainable_packaging', 'image', '/sustainable-packaging-bag.jpg')}
              alt="Nuva Sustainable Kraft Bag Packaging with farm veggies"
              className="w-full h-full object-cover object-center filter contrast-[1.04] saturate-[1.03] group-hover:scale-103 transition-transform duration-700"
            />
          </div>

          {/* Right Olive Green Content Container with Curved Top-Left / Left border */}
          <div className="w-full lg:w-3/5 bg-[#374e33] p-8 sm:p-12 lg:p-16 text-white space-y-5 flex flex-col justify-center relative lg:rounded-tl-[80px] lg:rounded-bl-[80px]">
            <h3 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wider text-white">
              {getContent('about.sustainable_packaging', 'heading', 'SUSTAINABLE PACKAGING')}
            </h3>
            <p className="text-xs sm:text-[14px] leading-relaxed text-neutral-100 font-normal">
              {getContent('about.sustainable_packaging', 'para1', 'The Nuva packaging is food grade and it ensures that once the produce is cleaned, it stays fresh and uncontaminated. Our packaging is designed to contain minimal plastic and uses biodegradable and recyclable materials, helping reduce waste and pollution.')}
            </p>
            <p className="text-xs sm:text-[14px] leading-relaxed text-neutral-100 font-normal">
              {getContent('about.sustainable_packaging', 'para2', 'The packaged fruits and vegetables are dispatched directly from the NUVA warehouse to your doorstep in safe hands eliminating middlemen, making sure the produce remains fresh and untouched by unhygienic elements until they reach your hands.')}
            </p>
          </div>

        </div>
      </section>

      {/* Section 4: Fresh From Field - Directly From Farm To Doorstep */}
      <section data-section-key="about.fresh_field" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-[#374e33] flex flex-col lg:flex-row items-stretch group transition-all duration-300 hover:shadow-2xl">
          
          {/* Left Green Content Area */}
          <div className="w-full lg:w-3/5 p-8 sm:p-12 lg:p-16 text-white space-y-5 flex flex-col justify-center relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wider text-white">
              {getContent('about.fresh_field', 'heading', 'FRESH FROM FIELD-DIRECTLY FROM FARM TO DOORSTEP')}
            </h3>
            <p className="text-xs sm:text-[14px] leading-relaxed text-neutral-200/90 font-normal">
              {getContent('about.fresh_field', 'para1', 'The Nuva heavily focuses on maintaining transparency with our customers, providing you with the assurance you need when it comes to what you eat. We partner with reliable and trusted farms for the produce, and with no middleman, we carry out all the remaining processes to ensure no mishandling of your produce.')}
            </p>
            <p className="text-xs sm:text-[14px] leading-relaxed text-neutral-200/90 font-normal">
              {getContent('about.fresh_field', 'para2', 'From harvesting at sunrise to precision ozone bath and doorstep dispatch within hours, every batch arrives crisp and nutrient-dense.')}
            </p>
          </div>

          {/* Right Delivery Rider Photo */}
          <div className="w-full lg:w-2/5 relative min-h-[300px] lg:min-h-[400px] bg-neutral-900 overflow-hidden">
            {/* Custom SVG Curve Separation matching the screenshot */}
            <div className="hidden lg:block absolute -left-1 top-0 bottom-0 w-16 z-20 pointer-events-none">
              <svg viewBox="0 0 100 500" preserveAspectRatio="none" className="h-full w-full fill-[#374e33]">
                <path d="M 0 0 Q 80 250 0 500 L 0 500 Z" />
              </svg>
            </div>
            <img
              src={getContent('about.fresh_field', 'image', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80')}
              alt="Farm to Doorstep Delivery Rider"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

        </div>
      </section>

      {/* Section 5: BACK TO THE FARMERS / SUPPORTING OUR FARMERS – GIVING BACK WHERE IT MATTERS */}
      <section data-section-key="about.farmers_support" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-[#3e563b] flex flex-col lg:flex-row items-stretch group transition-all duration-300 hover:shadow-2xl">

          {/* Left Farmer Working in Field Photo */}
          <div className="w-full lg:w-2/5 relative min-h-[320px] lg:min-h-[420px] bg-neutral-900 overflow-hidden">
            <img
              src={getContent('about.farmers_support', 'image', '/supporting-our-farmers.jpg')}
              alt="Farmer harvesting fresh eggplants in open farm field"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Right Olive Green Content Box with Inward Rounded Top-Left Curve */}
          <div className="w-full lg:w-3/5 bg-[#3e563b] p-8 sm:p-12 lg:p-16 text-white space-y-5 flex flex-col justify-center relative lg:rounded-tl-[80px] lg:rounded-bl-[80px]">
            <h3 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wider text-white leading-snug">
              {getContent('about.farmers_support', 'heading', 'BACK TO THE FARMERS / SUPPORTING OUR FARMERS – GIVING BACK WHERE IT MATTERS')}
            </h3>
            <p className="text-xs sm:text-[14px] leading-relaxed text-neutral-100 font-normal">
              {getContent('about.farmers_support', 'para1', 'The traditional system is not fair to farmers. The love and care they put into their harvest and patiently waiting for seasons to go by just to see their yield. Their commitment and contributions are frequently undervalued, with the outcomes of their hard work remaining largely unrecognized.')}
            </p>
            <p className="text-xs sm:text-[14px] leading-relaxed text-neutral-100 font-normal">
              {getContent('about.farmers_support', 'para2', "Our system helps us ensure that farmers receive an actual fair and qualified value for their produce. Buying from Nuva is not just a favour to yourself, but to our country's backbone as well.")}
            </p>
          </div>

        </div>
      </section>

      {/* Call to action at the bottom */}
      <section data-section-key="about.cta" className="bg-gradient-to-b from-[#fbfaf6] to-[#f4f2ea] py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-200 text-center rounded-3xl max-w-7xl mx-auto shadow-sm">
        <div className="max-w-xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{getContent('about.cta', 'badge', 'Pure Farm Harvest')}</span>
          </span>
          <h3 className="text-2xl sm:text-4xl font-bold text-[#2d472c] font-display">
            {getContent('about.cta', 'heading', 'Experience 100% Chemical-Free Produce')}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed font-normal">
            {getContent('about.cta', 'subtitle', 'Order farm-fresh harvest directly washed with active ozone micro-bubbles delivered to your doorstep.')}
          </p>
          <div className="pt-2">
            <Link
              to={getContent('about.cta', 'buttonLink', '/shop')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2d472c] hover:bg-[#20341f] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              <span>{getContent('about.cta', 'buttonLabel', 'Explore The Produce')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default OurStoryPage;
