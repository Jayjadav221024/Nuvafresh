import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import WherePurityGrowsSection from '../components/home/WherePurityGrowsSection';
import FarmersWayOfLifeSection from '../components/home/FarmersWayOfLifeSection';
import RegenerativeFarmingSection from '../components/home/RegenerativeFarmingSection';
import RegenerativeVideoSection from '../components/home/RegenerativeVideoSection';
import UVOzonePurificationSection from '../components/home/UVOzonePurificationSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import Reel3DSection from '../components/home/Reel3DSection';
import CertificationsSection from '../components/home/CertificationsSection';
import BlogSection from '../components/home/BlogSection';
import InstagramFollowSection from '../components/home/InstagramFollowSection';
import ProductCard from '../components/home/ProductCard';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useContent } from '../context/ContentContext';

const EXACT_BESTSELLERS = [
  {
    _id: 'bs-1',
    title: 'Khapli Wheat Flour',
    isHotDeal: true,
    originalPrice: 305.00,
    fromPrice: 200.00,
    toPrice: 328.00,
    price: 200.00,
    unit: '1 Kg / 2 Kg',
    images: ['/bestseller-khapli.jpg']
  },
  {
    _id: 'bs-2',
    title: 'Lakadong Turmeric Powder (7-9% curcumin)',
    isHotDeal: false,
    price: 500.00,
    unit: '250g',
    images: ['/bestseller-turmeric.png']
  },
  {
    _id: 'bs-3',
    title: 'A2 Cow Ghee (Machine Made)',
    isHotDeal: false,
    fromPrice: 600.00,
    toPrice: 2000.00,
    price: 600.00,
    unit: '500ml / 1L',
    images: ['/bestseller-ghee.jpg']
  },
  {
    _id: 'bs-4',
    title: 'Cinnamon Powder (Taj Powder)',
    isHotDeal: false,
    price: 200.00,
    unit: '100g',
    images: ['/bestseller-cinnamon.jpg']
  }
];

const HomePage = () => {
  const [bestsellers, setBestsellers] = useState(EXACT_BESTSELLERS);
  const { getContent } = useContent();

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        // Try fetching specifically flagged bestsellers first
        const { data } = await API.get('/products?bestseller=true&limit=4');
        if (data.success && data.products && data.products.length > 0) {
          setBestsellers(data.products.slice(0, 4));
        } else {
          // Fallback to top 4 catalog products
          const res = await API.get('/products?limit=4');
          if (res.data.success && res.data.products && res.data.products.length >= 4) {
            setBestsellers(res.data.products.slice(0, 4));
          }
        }
      } catch (e) {
        // Keeps graceful default fallback
      }
    };
    fetchBestsellers();
  }, []);

  return (
    <div className="bg-white space-y-12 pb-12 relative">
      {/* 1. Header Category Icons & "Nuva Bestsellers" Heading */}
      <HeroBanner />

      {/* 2. Nuva Bestsellers 4-Card Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
          {bestsellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 border-[#2d472c] text-[#2d472c] font-bold text-sm hover:bg-[#2d472c] hover:text-white transition-all shadow-sm"
          >
            <span>Explore All 100% Chemical-Free Produce</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 3. Where Purity Grows Section (Soil ground graphic with statement) */}
      <WherePurityGrowsSection />

      {/* 4. Farmers Are Professional Problem Solvers Section */}
      <FarmersWayOfLifeSection />

      {/* 5. Regenerative Farming Section (4 Pillars) */}
      <RegenerativeFarmingSection />

      {/* 5.1 Big Size Regenerative Farming Video Section */}
      <RegenerativeVideoSection />

      {/* 6. Testimonials Section */}
      <TestimonialsSection />

      {/* 7. Video Shopping / Interactive Reels Section */}
      <Reel3DSection />

      {/* 8. UV-Washed. RO-Purified. Ozone-Safe. Section (3-Column Hygiene Process) */}
      <UVOzonePurificationSection />

      {/* 8.1 Certifications Section (FSSAI, GMP, HACCP, ISO 9001) */}
      <CertificationsSection />

      {/* 9. Blog & Journal Section (3 Editorial Posts) */}
      <BlogSection />

      {/* 10. Follow us on Instagram Section (3D Mobile Mockup & Reels) */}
      <InstagramFollowSection />

      {/* Floating WhatsApp Quick Contact Button */}
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200 border-2 border-white"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 fill-current" />
      </a>
    </div>
  );
};

export default HomePage;
