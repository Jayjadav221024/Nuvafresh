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
  { title: 'About', url: '/about' },
  { title: 'Our Roots', url: '/our-story' },
  { title: 'Soil Health', url: '/csr-initiatives' },
  { title: 'Award & Recognition', url: '/our-story' },
  { title: "Doctor's View", url: '/blogs' }
];

const CATEGORY_LINKS = ['Indian Fruits', 'Exotic Fruits', 'Indian Vegetables', 'Exotic Vegetables'];

const INFO_LINKS = [
  { title: 'Faqs', url: '/faqs' },
  { title: 'Privacy Policy', url: '/privacy-policy' },
  { title: 'Terms & Conditions', url: '/terms-and-conditions' },
  { title: 'Shipping & Refund Policy', url: '/shipping-and-refund' }
];

/* Brand marks lucide doesn't carry */
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const PinterestIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
    <path d="M9 8.6c0 3.4 2.9 6.3 6.3 6.3l1.2-1.4-1.9-1-1 .9a4.7 4.7 0 0 1-2.8-2.8l.9-1-1-1.9z" fill="currentColor" stroke="none" />
  </svg>
);

const SOCIALS = [
  { label: 'X', href: 'https://x.com', Icon: XIcon, size: 'h-4 w-4' },
  { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook, size: 'h-[18px] w-[18px]' },
  { label: 'Instagram', href: 'https://www.instagram.com/nuva_nutrition/', Icon: Instagram, size: 'h-[18px] w-[18px]' },
  { label: 'Pinterest', href: 'https://pinterest.com', Icon: PinterestIcon, size: 'h-[18px] w-[18px]' },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin, size: 'h-[17px] w-[17px]' },
  { label: 'YouTube', href: 'https://youtube.com', Icon: Youtube, size: 'h-[19px] w-[19px]' },
  { label: 'WhatsApp', href: 'https://wa.me/919227725359', Icon: WhatsAppIcon, size: 'h-[19px] w-[19px]' }
];

const VisaBadge = () => (
  <div className="h-10 w-[68px] rounded-[3px] bg-white flex items-center justify-center" aria-label="Visa" role="img">
    <svg viewBox="0 0 48 16" className="h-[15px] w-auto" aria-hidden="true">
      <text x="0" y="14" fontFamily="Arial Black, Arial, sans-serif" fontSize="17" fontWeight="900" fontStyle="italic" fill="#1a1f71">VISA</text>
    </svg>
  </div>
);

const MastercardBadge = () => (
  <div className="h-10 w-[64px] rounded-[3px] bg-white flex flex-col items-center justify-center" aria-label="Mastercard" role="img">
    <svg viewBox="0 0 40 25" className="h-[22px] w-auto" aria-hidden="true">
      <circle cx="13" cy="12.5" r="12" fill="#EB001B" />
      <circle cx="27" cy="12.5" r="12" fill="#F79E1B" />
      <path d="M20 2.7a12 12 0 0 1 0 19.6 12 12 0 0 1 0-19.6z" fill="#FF5F00" />
    </svg>
    <span className="text-[6.5px] leading-none mt-0.5 text-neutral-800 font-medium">mastercard</span>
  </div>
);

const headingClass = 'font-display text-[26px] leading-none text-[#f1e8cf]';
const listClass = 'space-y-[9px] text-[13px] text-[#f1ecdc]';
const linkClass = 'hover:text-white hover:underline underline-offset-4 transition-colors';

/**
 * Site footer, laid over one paddy-field photograph: hills rising out of the
 * page's white at the top, the field below, and the big "Nuva" wordmark (part
 * of the photo) in the bottom-left corner.
 *
 * The photo is used whole - never split - so there is no join to hide. The
 * footer is at least as tall as the photo is at full width (it is ~2:1), and the
 * photo covers it anchored bottom-left, so the hills always crown the top and
 * the wordmark always sits in the corner. The columns start where the field
 * begins, 22.85% down the photo; padding in % is measured against the width, so
 * 22.85% / 2.0033 = 11.4% of the width puts them there.
 */
const FOOTER_PHOTO = '/footer-nuva-hills-field.jpg';
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

  const aboutText = getContent(
    'footer.contact',
    'aboutText',
    'Farm-fresh, chemical-free food grown the regenerative way - UV-washed, ozone-safe and delivered from our farms to your kitchen.'
  );
  const location = getContent('footer.contact', 'locationShort', 'Vadodara, Gujarat');
  const supportPhone = getContent('footer.contact', 'supportPhone', '+91 92277 25359');
  const supportEmail = getContent('footer.contact', 'supportEmail', 'support@thenuva.com');

  return (
    <footer className="relative overflow-hidden font-sans text-[#f1ecdc] bg-white min-h-[50vw]">
      <img
        src={FOOTER_PHOTO}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-left-bottom select-none pointer-events-none"
        draggable={false}
      />

      {/* On phones the footer is far taller than the photo is wide, so the photo
          scales up to the footer's height and the field starts much further down;
          the columns are pushed down with it so none of them sit on the sky. */}
      <div className="relative max-w-[1100px] mx-auto px-5 sm:px-8 pt-[62vw] md:pt-[calc(11.4%+20px)] pb-[26vw] md:pb-10">

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-[1.75fr_1fr_1.1fr_0.85fr] gap-x-6 gap-y-10">

          <div className="col-span-2 md:col-span-1">
            <h3 className={headingClass}>About Us</h3>
            <p className="mt-5 max-w-[290px] text-[13px] leading-[1.45] text-[#f1ecdc]">{aboutText}</p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {SOCIALS.map(({ label, href, Icon, size }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-full border-[1.5px] border-[#f1e8cf]/90 text-[#f1e8cf] flex items-center justify-center hover:bg-[#f1e8cf] hover:text-[#2d472c] transition-colors"
                >
                  <Icon className={size} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className={headingClass}>Categories</h3>
            <ul className={`mt-5 ${listClass}`}>
              {CATEGORY_LINKS.map((title) => (
                <li key={title}>
                  <Link to={`/shop?category=${encodeURIComponent(title)}`} className={linkClass}>{title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PAGES — driven by the "footer-pages" menu in the admin,
              falling back to these links if the menu can't be read. */}
          <div>
            <h3 className={headingClass}>Pages</h3>
            <ul className={`mt-5 ${listClass}`}>
              {pageLinks.map((link) => (
                <li key={link.url + link.title}>
                  <Link to={link.url} className={linkClass}>{link.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Information</h3>
            <ul className={`mt-5 ${listClass}`}>
              {INFO_LINKS.map((link) => (
                <li key={link.url}>
                  <Link to={link.url} className={linkClass}>{link.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Second row: contact under Pages, payment marks under Information.
              The first two columns stay empty so the wordmark has the corner. */}
          <div className="hidden md:block md:col-span-2" />

          <div>
            <h3 className={headingClass}>Let&rsquo;s Connect</h3>
            <ul className={`mt-5 ${listClass}`}>
              <li><a href={`tel:${supportPhone.replace(/\s/g, '')}`} className={linkClass}>{supportPhone}</a></li>
              <li><a href={`mailto:${supportEmail}`} className={linkClass}>{supportEmail}</a></li>
              <li>{location}</li>
            </ul>
          </div>

          <div className="flex items-start md:items-center md:justify-end gap-2.5 md:pt-4">
            <VisaBadge />
            <MastercardBadge />
          </div>
        </div>

        {/* Rule and copyright, kept to the right so they clear the wordmark */}
        <div className="mt-8 md:ml-[42%] border-t border-[#f1ecdc]/35 pt-8 text-right">
          <p className="text-[15px] tracking-wide">© {new Date().getFullYear()}, Nuva Nutrition.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
