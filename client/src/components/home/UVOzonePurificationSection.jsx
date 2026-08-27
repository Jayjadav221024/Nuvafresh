import React from 'react';
import { useContent } from '../../context/ContentContext';

const DEFAULT_PURITY_STEPS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=700&auto=format&fit=crop&q=80',
    title: 'Because Clean Food Starts with Clean Water.',
    subtitle: '',
    description: "The Nuva fruits and veggies go through a triple-cleaning process - first UV-washed, then rinsed with RO-purified water, and finally treated with ozone-safe methods. No tap water. No chemicals. Just a clean, honest start to food that's safe before it even reaches your hands."
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
    title: 'No Harmful Pesticides. No Residue. Just Peace of Mind.',
    subtitle: '',
    description: 'Because feeding your family should never come with fear. The Nuva gently cleanse every fruit and vegetable using UV light, RO-purified water, and ozone-safe methods - washing away harmful pesticide traces, not your trust. What reaches your home is more than just clean food — it’s care you can feel.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&auto=format&fit=crop&q=80',
    title: 'Safe Machines. Safer Hands.',
    subtitle: 'Certified Hygiene. Everyday Care.',
    description: 'From farm to pack, every step follows certified processes and industry-approved hygiene standards. At The Nuva, we handle your produce the way you would - with clean tools, trusted systems, and the kind of care that feels like home.'
  }
];

const UVOzonePurificationSection = () => {
  const { getContent } = useContent();
  const mainHeading = getContent('home.uv_ozone', 'heading', 'UV-Washed. RO-Purified. Ozone-Safe.');

  const steps = [
    {
      id: 1,
      image: getContent('home.uv_ozone', 'step1_image', DEFAULT_PURITY_STEPS[0].image),
      title: getContent('home.uv_ozone', 'step1_title', DEFAULT_PURITY_STEPS[0].title),
      subtitle: '',
      description: getContent('home.uv_ozone', 'step1_desc', DEFAULT_PURITY_STEPS[0].description)
    },
    {
      id: 2,
      image: getContent('home.uv_ozone', 'step2_image', DEFAULT_PURITY_STEPS[1].image),
      title: getContent('home.uv_ozone', 'step2_title', DEFAULT_PURITY_STEPS[1].title),
      subtitle: '',
      description: getContent('home.uv_ozone', 'step2_desc', DEFAULT_PURITY_STEPS[1].description)
    },
    {
      id: 3,
      image: getContent('home.uv_ozone', 'step3_image', DEFAULT_PURITY_STEPS[2].image),
      title: getContent('home.uv_ozone', 'step3_title', DEFAULT_PURITY_STEPS[2].title),
      subtitle: getContent('home.uv_ozone', 'step3_subtitle', DEFAULT_PURITY_STEPS[2].subtitle),
      description: getContent('home.uv_ozone', 'step3_desc', DEFAULT_PURITY_STEPS[2].description)
    }
  ];

  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 font-sans border-t border-secondary-200">
      
      {/* 1. Main Heading */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-[42px] font-bold text-[#2d472c] font-display tracking-tight leading-tight">
          {mainHeading}
        </h2>
      </div>

      {/* 2. 3-Column Image & Narrative Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 items-start">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center text-center space-y-5">
            
            {/* Rounded Corner Image Box */}
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-secondary-200 bg-secondary-100 group">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5 px-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#2d472c] font-sans leading-snug">
                {step.title}
              </h3>
              {step.subtitle && (
                <p className="text-xs font-bold text-[#2d472c] uppercase tracking-wider">
                  {step.subtitle}
                </p>
              )}
            </div>

            {/* Narrative Description Paragraph */}
            <p className="text-xs sm:text-[13.5px] text-neutral-600 leading-relaxed font-sans font-normal px-2">
              {step.description}
            </p>

          </div>
        ))}
      </div>

    </section>
  );
};

export default UVOzonePurificationSection;
