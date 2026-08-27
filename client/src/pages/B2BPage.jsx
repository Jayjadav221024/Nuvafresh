import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, Award, Sparkles, Building2, Phone, Mail, MapPin, 
  CheckCircle2, ArrowRight, Download, Send, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useContent } from '../context/ContentContext';

const B2B_OFFERINGS = [
  {
    category: 'Vegetables & Everyday Essentials',
    badge: 'Daily Fresh Harvest',
    bg: 'bg-[#2d472c] text-white',
    accent: 'text-emerald-300',
    items: [
      'Baby Corn', 'Beans Sprout', 'Beetroot', 'Broccoli', 'Carrot', 'Chinese Cabbage', 
      'Eggplant', 'French Beans', 'Garlic (China)', 'Ginger', 'Green Capsicum', 
      'Green Peas (Frozen)', 'Green Zucchini', 'Leeks', 'Onion', 'Papaya', 'Potato', 
      'Pumpkin', 'Radish', 'Red Cabbage', 'Red Radish', 'Spinach', 'Spring Onion', 
      'Sweet Potato', 'Tomato (Local, Nasik, Bangalore)', 'Yellow Capsicum', 'Green Tomato', 'Baby Onion'
    ]
  },
  {
    category: 'Leafy Greens & Herbs',
    badge: 'Hydro & Field Grown',
    bg: 'bg-[#f5f2e9] text-neutral-900 border border-[#ded7c5]',
    accent: 'text-[#2d472c]',
    items: [
      'Basil', 'Coriander', 'Dill', 'Sage', 'Mint', 'Rocket Leaf', 'Rosemary', 
      'Lettuce (Green Iceberg)', 'Lollo Rosso', 'Kale', 'Bok Choy', 'Thyme', 
      'Kaffir Lime Leaves', 'Lemon Grass'
    ]
  },
  {
    category: 'Exotics & Gourmet Ingredients',
    badge: 'Global Sourcing',
    bg: 'bg-[#3b5536] text-white',
    accent: 'text-emerald-300',
    items: [
      'Asparagus', 'Avocado (Imported)', 'Edamame Beans (Imported & Indian)', 
      'Celery', 'Snow Peas (Thai & Indian)', 'Thai Chilli (Small - Imported & Indian)', 
      'Thai Ginger', 'Kaffir Lime'
    ]
  },
  {
    category: 'Fresh Fruits',
    badge: 'Orchard Picked',
    bg: 'bg-[#f5f2e9] text-neutral-900 border border-[#ded7c5]',
    accent: 'text-[#2d472c]',
    items: [
      'Banana', 'Raw Banana', 'Green Apple (Imported)', 'Malta', 'Pineapple', 
      'Pomegranate', 'Red Apple', 'Grapefruit', 'Green Grapes', 'Blueberry'
    ]
  },
  {
    category: 'Mushrooms & Gourmet Fungi',
    badge: 'Clean Cultivated',
    bg: 'bg-[#2d472c] text-white',
    accent: 'text-emerald-300',
    items: ['Button Mushroom', 'King Oyster Mushroom', 'Portobello', 'Shiitake']
  },
  {
    category: 'Premium Add-ons & Seasonal Specialties',
    badge: 'Special Harvest',
    bg: 'bg-[#f5f2e9] text-neutral-900 border border-[#ded7c5]',
    accent: 'text-[#2d472c]',
    items: ['Italian Lemon', 'Lotus Root (Indian)', 'Seasonal Heritage Produce']
  },
  {
    category: 'Regional Specials & Pure Staples',
    badge: 'Native Grains',
    bg: 'bg-[#3b5536] text-white',
    accent: 'text-emerald-300',
    items: [
      'Khapli Wheat Flour', 'Pink Rock Salt', 'Ragi Flour', 'Pearl Millet', 
      'Red Rice', 'Kodo Millet (Kodri)', 'Desi Kolam Rice', 'Barnyard Millet (Moreyo)'
    ]
  },
  {
    category: 'Spices & Artisanal Seasonings',
    badge: 'High Curcumin & Single Origin',
    bg: 'bg-[#f5f2e9] text-neutral-900 border border-[#ded7c5]',
    accent: 'text-[#2d472c]',
    items: [
      'Whole Black pepper', 'Bhut Jolokia Chilli Pods (oven dried)', 'Cinnamon Powder (Taj Powder)', 
      'Lakadong Turmeric Powder (7–9% curcumin)', 'Black pepper Powder', 'Black Pepper Corns', 
      'Stone Flower', 'Long Pepper', 'Sichuan Pepper Corns Without Seeds', 
      'Sichuan Pepper Corns', 'Highland Ginger Powder (Adu Powder)'
    ]
  },
  {
    category: 'Pure Cold-Pressed Oils & Bilona Ghee',
    badge: '100% Unadulterated',
    bg: 'bg-[#2d472c] text-white',
    accent: 'text-emerald-300',
    items: ['Normal Ghee (Desi Ghee)', 'A2 Cow Ghee (Vedic Bilona)', 'Wood-Pressed Mustard Oil', 'Cold-Pressed Sesame Oil']
  }
];

// `logo` points at a file in /public/brands. Brands without a sourceable logo
// fall back to the styled wordmark, as does any logo that fails to load.
// `invert` flips light-on-transparent logos so they read on the white card.
const TRUSTED_BRANDS = [
  { name: 'BENTO B', logo: '/brands/bento-b.png' },
  { name: 'nectar' },
  { name: 'Bansal Super Market' },
  { name: 'basta!' },
  { name: 'Boh!' },
  { name: 'GREENR', logo: '/brands/greenr.png' },
  { name: 'ARTTH' },
  { name: 'mouj' },
  { name: "K's Verandah", logo: '/brands/ks-verandah.webp', invert: true },
  { name: 'lollo rosso' },
  { name: 'Picasso' },
  { name: 'THE BREWERY', logo: '/brands/the-brewery.png', invert: true }
];

const BrandLogo = ({ brand }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="h-24 sm:h-28 px-5 rounded-2xl bg-white border border-[#ded7c5] shadow-xs flex items-center justify-center text-center hover:border-[#2d472c] hover:shadow-md transition-all duration-200 group">
      {brand.logo && !failed ? (
        <img
          src={brand.logo}
          alt={`${brand.name} logo`}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`max-h-14 max-w-full w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition duration-300 ${brand.invert ? 'invert' : ''}`}
        />
      ) : (
        <span className="font-display font-bold text-sm sm:text-base text-[#2d472c]">
          {brand.name}
        </span>
      )}
    </div>
  );
};

const CERTIFICATIONS = [
  {
    title: 'FSSAI Licensed Facility',
    subtitle: 'Government Food Safety Standards',
    badge: 'fssai'
  },
  {
    title: 'GMP Certified Processes',
    subtitle: 'Good Manufacturing Practices',
    badge: 'GMP CERTIFIED'
  },
  {
    title: 'ISO 9001 Quality Compliance',
    subtitle: 'International Management Protocol',
    badge: 'ISO 9001'
  },
  {
    title: 'HACCP Certified',
    subtitle: 'Safe Food Handling & Bio-Control',
    badge: 'HACCP CERTIFIED'
  }
];

const B2BPage = () => {
  const { getContent } = useContent();
  const heroTag = getContent('b2b.hero', 'tag', 'Nuva B2B & Modern Commercial Kitchens');
  const heroHeadline = getContent('b2b.hero', 'headline', 'India’s Cleanest');
  const heroHighlight = getContent('b2b.hero', 'highlightText', 'Food Ecosystem');
  const heroDesc = getContent(
    'b2b.hero', 
    'description', 
    'Ozone-Washed • UV-Cleaned • RO-Purified Produce for leading restaurants, cloud kitchens, hotels, and retail partners. Nuva delivers fresh, unpolished, zero-chemical fruits, gourmet exotics, and staples with verified hygiene.'
  );
  const supportPhone = getContent('b2b.hero', 'supportPhone', '+91 92277 25359');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [inquiryData, setInquiryData] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: 'Vadodara',
    businessType: 'Restaurant / Cafe',
    estimatedDailyVolume: '10 - 50 Kg',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/inquiries', {
        name: inquiryData.contactPerson,
        email: inquiryData.email,
        phone: inquiryData.phone,
        subject: `B2B Partnership Inquiry: ${inquiryData.businessName} (${inquiryData.businessType})`,
        message: `Business Name: ${inquiryData.businessName}\nType: ${inquiryData.businessType}\nCity: ${inquiryData.city}\nEst. Volume: ${inquiryData.estimatedDailyVolume}\nNotes: ${inquiryData.notes}`
      });
      setSubmitted(true);
    } catch (err) {
      // Fallback optimistic submission
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const heroBgImage = getContent('b2b.hero', 'bgImage', '/ozone-shield-machinery.png');
  const processTag = getContent('b2b.process', 'tag', 'Transparency & Journey');
  const processHeading = getContent('b2b.process', 'heading', 'The Nuva Process: Farm to Kitchen');
  const processDesc = getContent('b2b.process', 'description', 'From the farmer sowing seeds with care, through automated multi-stage ozone wash tunnels, to clean kitchen delivery.');
  const step1Title = getContent('b2b.process', 'step1_title', 'Direct Farmer Sourcing');
  const step1Desc = getContent('b2b.process', 'step1_desc', '"Every seed is a promise; a promise to feed." Partnering with local growers for high-nutrition soil harvests.');
  const step2Title = getContent('b2b.process', 'step2_title', 'Triple-Clean Purification');
  const step2Desc = getContent('b2b.process', 'step2_desc', 'Automated conveyor tunnels with medical ozone (O₃), UV light baths, and RO micro-bubble rinse.');
  const step3Title = getContent('b2b.process', 'step3_title', 'Air-Dry & Safe Pack');
  const step3Desc = getContent('b2b.process', 'step3_desc', 'Turbo air knife moisture removal and sustainable food-grade kraft packaging for zero contamination.');
  const step4Title = getContent('b2b.process', 'step4_title', 'Sunrise Kitchen Delivery');
  const step4Desc = getContent('b2b.process', 'step4_desc', 'Ready-to-prep, sterile harvest batches delivered to culinary teams and modern households.');

  return (
    <div className="bg-[#fbfaf6] font-sans text-neutral-900 selection:bg-[#2d472c] selection:text-white">
      
      {/* 1. HERO BANNER: India's Cleanest Food Ecosystem for Modern Kitchens & B2B */}
      <section className="relative bg-[#1c2f21] text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            src={heroBgImage}
            alt="Commercial ozone washing line"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c2f21]/90 via-[#1c2f21]/95 to-[#1c2f21] z-0" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>{heroTag}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.15] text-[#f7f6f2]">
              {heroHeadline} <br />
              <span className="text-[#cce8c7]">{heroHighlight}</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
              {heroDesc}
            </p>

            {/* Quick Contact & Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#partner-inquiry"
                className="px-8 py-3.5 rounded-full bg-[#f5c76c] hover:bg-[#fabf50] text-[#1c2e22] font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Request Commercial Rate Card
              </a>
              <a
                href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-colors"
              >
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>{supportPhone}</span>
              </a>
            </div>
          </div>

          {/* Right Highlight Box */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl space-y-5">
              <h3 className="text-xl font-bold font-display text-white">The NUVA Way:</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-neutral-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Triple-Clean Purity:</strong> Multi-stage RO + UV + Aqueous Ozone wash removes 99.9% pesticide residue.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Region-Specific Direct Sourcing:</strong> Single-origin harvests directly from audited farmers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Longer Shelf Life:</strong> 3-5 days extended freshness with significantly reduced kitchen wastage.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Complete Pantry in One Place:</strong> Exotic microgreens + daily vegetables + stone-milled staples in one scheduled dispatch.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 2. THE NUVA PROCESS (Comic-Style Farm to Commercial Kitchen Pipeline) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2d472c]">{processTag}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2d472c] font-display tracking-tight">
            {processHeading}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            {processDesc}
          </p>
        </div>

        {/* 4 Step Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#ded7c5] shadow-xs space-y-3">
            <span className="text-2xl font-black text-[#2d472c]">01</span>
            <h4 className="text-base font-bold text-neutral-900">{step1Title}</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {step1Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#ded7c5] shadow-xs space-y-3">
            <span className="text-2xl font-black text-[#2d472c]">02</span>
            <h4 className="text-base font-bold text-neutral-900">{step2Title}</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {step2Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#ded7c5] shadow-xs space-y-3">
            <span className="text-2xl font-black text-[#2d472c]">03</span>
            <h4 className="text-base font-bold text-neutral-900">{step3Title}</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {step3Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#ded7c5] shadow-xs space-y-3">
            <span className="text-2xl font-black text-[#2d472c]">04</span>
            <h4 className="text-base font-bold text-neutral-900">{step4Title}</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {step4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* 3. COMPLETE B2B PRODUCT CATALOGUE / OFFERINGS */}
      <section className="py-16 sm:py-20 bg-white border-y border-neutral-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2d472c]">Commercial Procurement</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2d472c] font-display tracking-tight">
                What We Offer
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-xl">
                A wide, premium selection of everyday essentials, gourmet greens, regional staples, and imported exotics — all sanitized, graded, and delivered fresh.
              </p>
            </div>
            <p className="text-xs font-semibold text-[#2d472c] bg-[#f2f7f0] px-4 py-2 rounded-full border border-[#d2e5ce]">
              *Special or custom bulk requirements accommodated upon request
            </p>
          </div>

          {/* Offerings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {B2B_OFFERINGS.map((offer, idx) => (
              <div
                key={idx}
                className={`p-6 sm:p-7 rounded-3xl ${offer.bg} shadow-md flex flex-col justify-between space-y-5 transition-transform duration-300 hover:-translate-y-1`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${offer.bg.includes('text-white') ? 'bg-white/20 text-emerald-200' : 'bg-[#2d472c] text-white'}`}>
                      {offer.badge}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight leading-snug">
                    {offer.category}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {offer.items.map((item, itemIdx) => (
                      <span
                        key={itemIdx}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                          offer.bg.includes('text-white')
                            ? 'bg-white/10 text-neutral-100 hover:bg-white/20'
                            : 'bg-white text-neutral-800 border border-neutral-300/80 shadow-2xs'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. TRUSTED BY TOP BRANDS & RESTAURANTS */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2d472c]">Institutional Validation</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2d472c] font-display tracking-tight">
            Where Top Brands Place Their Trust
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Trusted daily by premier restaurants, boutique cafes, premium gourmet supermarkets, and culinary pioneers across Gujarat.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {TRUSTED_BRANDS.map((brand) => (
            <BrandLogo key={brand.name} brand={brand} />
          ))}
        </div>
      </section>

      {/* 5. CERTIFICATIONS: Excellence Isn't Claimed - It's Certified */}
      <section className="bg-[#2d472c] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display tracking-tight text-[#f7f6f2]">
              Excellence Isn't Claimed — It’s Certified
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80">
              Third-party accredited standards ensure 100% safety and regulatory compliance for every supply contract.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CERTIFICATIONS.map((cert, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center space-y-2.5"
              >
                <span className="inline-block px-3 py-1 rounded-full bg-[#f5c76c] text-[#1c2e22] text-xs font-extrabold uppercase tracking-wider">
                  {cert.badge}
                </span>
                <h4 className="text-sm font-bold text-white pt-1">{cert.title}</h4>
                <p className="text-xs text-neutral-300">{cert.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PARTNER INQUIRY FORM & LOCATION HUBS */}
      <section id="partner-inquiry" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Info & Hub Addresses matching brochure */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2d472c]">Institutional Desk</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2d472c] font-display tracking-tight">
                NUVA B2B Partnerships
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Connect with our procurement leads to receive sample kits, scheduled morning delivery slots, and tier-1 bulk pricing.
              </p>
            </div>

            {/* Hub Details */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-[#ded7c5] shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-[#2d472c] font-bold text-sm">
                  <Building2 className="h-4 w-4 text-emerald-700" />
                  <span>Head Office</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  4th floor, Pancham Icon, Beside D Mart Mall, Vasna Road, Vadodara, Gujarat - 390007
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#ded7c5] shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-[#2d472c] font-bold text-sm">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <span>Processing Unit</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Kaival Society, Anand, Gujarat - 388330
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#ded7c5] shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-[#2d472c] font-bold text-sm">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <span>Retail Outlet</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Shop No.184 Radhakrishna Flat, Productivity Road, Nr. Akota Garden, Vadodara, Gujarat - 390020
                </p>
              </div>
            </div>

            {/* Direct Phone & Website */}
            <div className="p-5 rounded-2xl bg-[#f2f7f0] border border-[#cfe3cb] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#2d472c] uppercase">Direct Partnership Line</span>
                <p className="text-base font-bold text-[#2d472c]">+91 92277 25359</p>
              </div>
              <a
                href="tel:+919227725359"
                className="h-10 w-10 rounded-full bg-[#2d472c] text-white flex items-center justify-center shadow-md hover:bg-[#20341f]"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right: Commercial Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-[#ded7c5] shadow-lg">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Check className="h-7 w-7 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-bold font-display text-[#2d472c]">Commercial Inquiry Received!</h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
                  Thank you for connecting. Our B2B partnership director will call you within 2 business hours with a custom rate card.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#2d472c] text-white text-xs font-bold"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-[#2d472c] font-display">
                    Request Commercial Rate Card
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Partner with Nuva for daily scheduled clean produce deliveries.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Business / Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={inquiryData.businessName}
                      onChange={(e) => setInquiryData({ ...inquiryData, businessName: e.target.value })}
                      placeholder="e.g. Grand Heritage Cafe"
                      className="w-full bg-[#faf9f5] border border-neutral-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      value={inquiryData.contactPerson}
                      onChange={(e) => setInquiryData({ ...inquiryData, contactPerson: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#faf9f5] border border-neutral-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={inquiryData.phone}
                      onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#faf9f5] border border-neutral-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Business Email *</label>
                    <input
                      type="email"
                      required
                      value={inquiryData.email}
                      onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                      placeholder="purchase@yourbrand.com"
                      className="w-full bg-[#faf9f5] border border-neutral-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Business Type</label>
                    <select
                      value={inquiryData.businessType}
                      onChange={(e) => setInquiryData({ ...inquiryData, businessType: e.target.value })}
                      className="w-full bg-[#faf9f5] border border-neutral-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
                    >
                      <option>Restaurant / Cafe</option>
                      <option>Cloud Kitchen</option>
                      <option>Hotel / Resort</option>
                      <option>Supermarket / Retail</option>
                      <option>Corporate Catering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={inquiryData.city}
                      onChange={(e) => setInquiryData({ ...inquiryData, city: e.target.value })}
                      placeholder="Vadodara / Ahmedabad / Anand"
                      className="w-full bg-[#faf9f5] border border-neutral-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Est. Daily Volume</label>
                    <select
                      value={inquiryData.estimatedDailyVolume}
                      onChange={(e) => setInquiryData({ ...inquiryData, estimatedDailyVolume: e.target.value })}
                      className="w-full bg-[#faf9f5] border border-neutral-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
                    >
                      <option>10 - 50 Kg</option>
                      <option>50 - 150 Kg</option>
                      <option>150 - 500 Kg</option>
                      <option>500+ Kg / Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Specific Produce Requirements / Remarks</label>
                  <textarea
                    rows={3}
                    value={inquiryData.notes}
                    onChange={(e) => setInquiryData({ ...inquiryData, notes: e.target.value })}
                    placeholder="e.g. Need daily morning supply of hydroponic lettuce, ozone washed bell peppers, and cold-pressed oils."
                    className="w-full bg-[#faf9f5] border border-neutral-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#2d472c]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Submitting Details...' : 'Submit Commercial Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* 7. Bottom Thank You Strip */}
      <section className="bg-[#1c2f21] text-white py-12 px-4 sm:px-6 lg:px-8 text-center border-t border-emerald-950">
        <h2 className="text-3xl sm:text-5xl font-black font-display tracking-widest text-[#f5c76c] uppercase">
          THANK YOU!
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2">
          Nuva Nutrition Pvt. Ltd. — Rethink Your Food.
        </p>
      </section>

    </div>
  );
};

export default B2BPage;
