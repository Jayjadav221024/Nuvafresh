import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { TESTIMONIAL_AMIT_BASE64 } from '../../assets/testimonialAmitBase64';
import { TESTIMONIAL_MINAL_BASE64 } from '../../assets/testimonialMinalBase64';
import { TESTIMONIAL_SHIRALI_BASE64 } from '../../assets/testimonialShiraliBase64';
import API from '../../api/axiosInstance';
import { useContent } from '../../context/ContentContext';

const TESTIMONIALS_DATA = [
  {
    id: 1,
    quote: "Hello Nuva team, I ordered organic fruits and veggies from the app — all farm-fresh, natural, and spoilage-free. The Golden Kiwi, Bhindi, and Khapli flour bhakhri were excellent. Loved the seasonal variety, eco-friendly packaging, and sustainable approach. Keep it up, Aanshi!",
    author: "Minal Kapasi",
    city: "Vadodara",
    avatar: TESTIMONIAL_MINAL_BASE64
  },
  {
    id: 2,
    quote: "The A2 Bilona ghee and cold-pressed mustard oil took me back to my village roots in Gujarat. Truly chemical-free with an unmistakable authentic aroma. Clean delivery with zero plastic waste!",
    author: "Amit",
    city: "Vadodara",
    avatar: TESTIMONIAL_AMIT_BASE64
  },
  {
    id: 3,
    quote: "Ever since switching to Nuva’s ozone-washed leafy greens, our family has experienced noticeably crisper salads with zero chemical or fertilizer smell. Remarkable quality standards.",
    author: "Shirali Parikh",
    city: "Mumbai",
    avatar: TESTIMONIAL_SHIRALI_BASE64
  },
  {
    id: 4,
    quote: "The Lakadong turmeric has an extraordinary rich golden hue and high curcumin level. The transparency in sourcing and HPLC lab test QR code on every dispatch gives complete peace of mind.",
    author: "Dr. Rajesh Dave",
    city: "Ahmedabad",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80"
  }
];

const TestimonialsSection = () => {
  const { getContent } = useContent();
  const eyebrow = getContent('home.testimonials', 'eyebrow', 'We care about our customer experience too');
  const heading = getContent('home.testimonials', 'heading', 'Testimonials');

  const [testimonials, setTestimonials] = useState(TESTIMONIALS_DATA);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await API.get('/admin/testimonials/public');
        if (data.success && data.testimonials && data.testimonials.length > 0) {
          setTestimonials(data.testimonials.map((t, idx) => ({
            id: t._id || idx,
            quote: t.quote,
            author: t.author,
            city: t.city,
            avatar: t.avatar || TESTIMONIALS_DATA[idx % TESTIMONIALS_DATA.length]?.avatar || TESTIMONIAL_MINAL_BASE64
          })));
        }
      } catch (e) {}
    };
    fetchTestimonials();
  }, []);

  const current = testimonials[activeIndex] || testimonials[0] || TESTIMONIALS_DATA[0];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* 1. Header with Eyebrow Subtitle */}
      <div className="max-w-4xl mx-auto text-center mb-10 space-y-1">
        <p className="text-xs sm:text-sm font-medium text-neutral-600">
          {eyebrow}
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-[38px] font-bold text-[#2d472c] font-display tracking-tight">
          {heading}
        </h2>
      </div>

      {/* 2. Beige Rounded Card Container matching exact screenshot */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#e7e3d8] rounded-[36px] p-8 sm:p-12 md:p-14 shadow-sm border border-[#dad4c7] relative flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-between">
          
          {/* Left Text Block */}
          <div className="flex-1 space-y-6 text-left relative">
            
            {/* Subtle quotation mark symbol in top right of text */}
            <div className="absolute -top-3 right-4 text-3xl font-serif text-[#788572]/40 select-none">
              “
            </div>

            {/* Testimonial Quote */}
            <p className="text-sm sm:text-base md:text-[17px] font-bold text-[#2d472c] font-sans leading-relaxed">
              {current.quote}
            </p>

            {/* Author Name & City */}
            <div className="pt-2">
              <h4 className="text-sm font-bold text-[#2d472c]">
                {current.author}
              </h4>
              <p className="text-xs text-neutral-600 font-medium mt-0.5">
                {current.city}
              </p>
            </div>

          </div>

          {/* Right Circular Avatar with Bouquet Framing */}
          <div className="shrink-0 relative">
            <div className="h-44 w-44 sm:h-52 sm:w-52 md:h-56 md:w-56 rounded-full overflow-hidden border-4 border-white/60 shadow-md">
              <img
                src={current.avatar}
                alt={current.author}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>

        </div>

        {/* 3. Dot Pagination Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((item, index) => (
            <button
              key={item.id || index}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? 'w-7 bg-[#2d472c]'
                  : 'w-2.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
              title={`Testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Heading for Next Section: Video shopping */}
      <div className="max-w-4xl mx-auto text-center mt-16">
        <h2 className="text-3xl sm:text-4xl md:text-[38px] font-bold text-[#2d472c] font-display tracking-tight">
          {getContent('home.video_shopping', 'topTitle', 'Video shopping')}
        </h2>
      </div>

    </section>
  );
};

export default TestimonialsSection;
