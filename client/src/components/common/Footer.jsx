import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import API from '../../api/axiosInstance';
import { STORE_TOPICS, subscribeToStoreChanges } from '../../lib/storeSync';

/* What the PAGES column shows if the menu can't be read — the same links,
   so a network failure degrades to the previous behaviour rather than an
   empty column. */
const FALLBACK_PAGE_LINKS = [
  { title: 'Our Story', url: '/our-story' },
  { title: 'B2B & Commercial', url: '/b2b' },
  { title: 'CSR Initiatives', url: '/csr-initiatives' },
  { title: 'Ozone Shield', url: '/ozone-shield' },
  { title: 'Frequently Asked Questions (FAQs)', url: '/faqs' },
  { title: 'Blogs & Research', url: '/blogs' },
  { title: 'Contact Us', url: '/contact-us' },
  { title: 'Track Order', url: '/track-order' }
];

const Footer = () => {
  const { getContent } = useContent();

  const [pageLinks, setPageLinks] = useState(FALLBACK_PAGE_LINKS);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/content/menus/footer-pages');
        const items = (data.menu?.items || []).filter((i) => i.title);
        if (items.length > 0) setPageLinks(items);
      } catch (e) {
        // Keep the built-in links.
      }
    };
    load();
    // Saving the menu in the admin updates the open storefront tab.
    return subscribeToStoreChanges(STORE_TOPICS.CONTENT, load);
  }, []);
  const officeAddress = getContent('footer.contact', 'officeAddress', '4th floor, Pancham Icon, Vasna Rd, Kalyan Nagar, Diwalipura, Vadodara, Gujarat 390007');
  const supportPhone = getContent('footer.contact', 'supportPhone', '+91 92277 25359');
  const supportEmail = getContent('footer.contact', 'supportEmail', 'support@thenuva.com');
  const copyrightNotice = getContent('footer.contact', 'copyrightNotice', '© 2026, Nuva Nutrition. Crafted By Spreadd');

  return (
    <footer className="bg-[#3b5536] text-[#e1e9df] font-sans border-t border-[#466540]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* 4-Column Main Grid matching user screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Column 1: ABOUT US */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase font-display">
              ABOUT US
            </h3>
            
            <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-[#cddccb]">
              <p className="font-semibold text-white">NuvaNutrition Pvt. Ltd</p>
              <p>{officeAddress}</p>
            </div>

            <div className="space-y-1 text-xs sm:text-[13px] text-[#cddccb] pt-2">
              <p>
                <a href={`tel:${supportPhone}`} className="hover:text-white transition-colors">
                  {supportPhone}
                </a>
              </p>
              <p>
                <a href={`mailto:${supportEmail}`} className="hover:text-white transition-colors">
                  {supportEmail}
                </a>
              </p>
            </div>

            {/* Social Icons Round Row */}
            <div className="flex items-center gap-2.5 pt-3">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-[#466540] hover:bg-[#52774b] text-white flex items-center justify-center transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 fill-white stroke-none" />
              </a>

              {/* Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-[#466540] hover:bg-[#52774b] text-white flex items-center justify-center transition-all duration-200"
                aria-label="Pinterest"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/nuva_nutrition"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-[#466540] hover:bg-[#52774b] text-white flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>

              {/* Youtube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-[#466540] hover:bg-[#52774b] text-white flex items-center justify-center transition-all duration-200"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-[#466540] hover:bg-[#52774b] text-white flex items-center justify-center transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: CATEGORIES */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase font-display">
              CATEGORIES
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#cddccb]">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Fresh Produce
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Grains & Staples
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Healthy Sweeteners
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Pulses & Lentils
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Spices & Seasonings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: PAGES — driven by the "footer-pages" menu in the admin,
              falling back to these links if the menu can't be read. */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase font-display">
              PAGES
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#cddccb]">
              {pageLinks.map((link) => (
                <li key={link.url + link.title}>
                  <Link to={link.url} className="hover:text-white transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: INFORMATION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase font-display">
              INFORMATION
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#cddccb]">
              <li>
                <Link to="/faqs" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/shipping-and-refund" className="hover:text-white transition-colors">
                  Shipping & Refund Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright centered */}
        <div className="mt-14 pt-8 border-t border-[#466540]/60 text-center">
          <p className="text-xs sm:text-[13px] text-[#cddccb]">
            © {new Date().getFullYear()}, Nuva Nutrition. Crafted By Spreadd
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
