import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/common/CartDrawer';
import FloatingCartBar from '../components/common/FloatingCartBar';
import AuthModal from '../components/common/AuthModal';
import FlyToCartOverlay from '../components/common/FlyToCartOverlay';
import { trackSession, startHeartbeat } from '../lib/analytics';

const StorefrontLayout = () => {
  // Count this visit once, so the admin's acquisition reports have something
  // real to read. Storefront only — admin screens are not customer traffic.
  useEffect(() => {
    trackSession();
    return startHeartbeat();
  }, []);

  // Bi-directional click-to-edit communication when embedded in Admin WebsiteEditor iframe
  useEffect(() => {
    const isIframe = window.self !== window.top;
    if (!isIframe) return;

    const handleSectionClick = (e) => {
      // Find closest section, header, footer, or explicitly marked element
      const targetElement = e.target.closest('[data-section-key], header, footer, section, nav');
      if (targetElement) {
        let inferredKey = targetElement.getAttribute('data-section-key');
        
        if (!inferredKey) {
          const text = targetElement.innerText || '';
          if (targetElement.tagName === 'HEADER' || text.includes('Nuva') && text.includes('Home') && text.includes('Products')) {
            inferredKey = 'sitewide.header';
          } else if (text.includes('Free shipping') || text.includes('WELCOME10')) {
            inferredKey = 'sitewide.announcement';
          } else if (text.includes('Bestsellers') || text.includes('Fresh Produce') || text.includes('HANDPICKED')) {
            inferredKey = 'home.hero';
          } else if (text.includes('Ozone -Wash') || text.includes('Where Purity Grows')) {
            inferredKey = 'home.purity';
          } else if (text.includes('PROBLEM SOLVERS') || text.includes('WAY OF LIFE')) {
            inferredKey = 'home.farmers';
          } else if (text.includes('Regenerative Farming') || text.includes('Farm To Fork')) {
            inferredKey = 'home.regenerative';
          } else if (text.includes('Showcase') || text.includes('Regenerative Farming in Action')) {
            inferredKey = 'home.regenerative_video';
          } else if (text.includes('Video shopping') || text.includes('Shoppable Farm Feeds')) {
            inferredKey = 'home.video_shopping';
          } else if (text.includes('UV-Washed') || text.includes('RO-Purified') || text.includes('Ozone-Safe')) {
            inferredKey = 'home.uv_ozone';
          } else if (text.includes('Certifications') || text.includes('FSSAI') || text.includes('GMP') || text.includes('HACCP')) {
            inferredKey = 'home.certifications';
          } else if (text.includes('Journal & Insights') || text.includes('Stories from Soil') || text.includes('Soil to Health')) {
            inferredKey = 'home.blog';
          } else if (text.includes('Instagram') || text.includes('@nuvanutrition')) {
            inferredKey = 'home.instagram';
          } else if (targetElement.tagName === 'FOOTER' || text.includes('ABOUT US') || text.includes('Vadodara')) {
            inferredKey = 'footer.contact';
          }
        }

        if (inferredKey) {
          window.parent.postMessage({ type: 'NUVA_SECTION_CLICKED', sectionKey: inferredKey }, '*');
        }
      }
    };

    document.addEventListener('click', handleSectionClick, true);
    return () => document.removeEventListener('click', handleSectionClick, true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf6] text-neutral-900 selection:bg-[#2d472c] selection:text-white font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <FloatingCartBar />
      <AuthModal />
      <FlyToCartOverlay />
    </div>
  );
};

export default StorefrontLayout;


