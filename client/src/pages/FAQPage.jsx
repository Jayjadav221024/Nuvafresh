import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Search, Sparkles, ChevronDown, ChevronUp, ShieldCheck, 
  MessageCircle, Phone, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';

const FALLBACK_FAQS = [
  {
    _id: 'faq-1',
    category: 'Ozone Wash & Purity',
    question: 'What is aqueous ozone washing and how does it remove pesticides?',
    answer: 'Aqueous ozone (O₃) is an all-natural, medical-grade sanitizer produced by infusing pure oxygen and water with ozone gas. It is 3,000x faster than chlorine at neutralizing pesticide molecules, heavy metals, mold, and pathogens. Within minutes, it reverts back to pure oxygen and water leaving 0.00 PPM chemical residue.',
    status: 'Published'
  },
  {
    _id: 'faq-2',
    category: 'Delivery & Packaging',
    question: 'How fast is sunrise farm harvest to doorstep delivery in Gujarat?',
    answer: 'All our organic leafy greens, vegetables, and seasonal fruits are harvested at sunrise (5:00 AM - 7:00 AM), immediately triple-washed in our cold-water aqueous ozone tunnel, vacuum-packed in biodegradable kraft boxes, and delivered to your kitchen within 12 hours.',
    status: 'Published'
  },
  {
    _id: 'faq-3',
    category: 'A2 Ghee & Staples',
    question: 'How is Nuva A2 Gir Cow Ghee prepared?',
    answer: 'Our A2 Desi Cow Ghee is prepared using the authentic Vedic Bilona method. Whole A2 milk from grass-fed Gir cows is curdled in earthen pots, hand-churned bidirectionally with wooden churners to extract makkhan (butter), and slowly simmered over cow-dung flame for pure golden aroma and granular texture.',
    status: 'Published'
  },
  {
    _id: 'faq-4',
    category: 'Orders & Payments',
    question: 'What payment options and discounts are available?',
    answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), instant QR code scan & pay, credit/debit cards, net banking, and Cash on Delivery (COD). Use coupon code WELCOME10 for an extra 10% OFF your first order.',
    status: 'Published'
  },
  {
    _id: 'faq-5',
    category: 'B2B & Commercial Supply',
    question: 'Do you supply to restaurants, cafes, and bulk institutional kitchens?',
    answer: 'Yes! We supply custom graded, ozone-washed exotics, hydroponic herbs, and cold-pressed oils daily to leading restaurants, hotels, and cloud kitchens across Vadodara, Ahmedabad, and Anand. You can request a rate card directly from our /b2b portal or call +91 92277 25359.',
    status: 'Published'
  }
];

const CATEGORIES = ['All', 'Ozone Wash & Purity', 'Delivery & Packaging', 'A2 Ghee & Staples', 'Orders & Payments', 'B2B & Commercial Supply'];

const FAQPage = () => {
  const [faqs, setFaqs] = useState(FALLBACK_FAQS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchPublicFaqs = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/admin/faqs');
        if (data.success && data.faqs && data.faqs.length > 0) {
          setFaqs(data.faqs.filter(f => f.status === 'Published'));
        }
      } catch (e) {
        console.warn('Using fallback FAQs', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicFaqs();
  }, []);

  const filtered = faqs.filter(faq => {
    const matchCat = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-[#fbfaf6] min-h-screen font-sans text-neutral-900 pb-20">
      
      {/* 1. Header Banner */}
      <section className="bg-[#1c2f21] text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Nuva Knowledge Base & FAQs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#f7f6f2]">
            Frequently Asked Questions
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our medical-grade aqueous ozone wash, sunrise farm harvesting, Vedic Bilona Ghee, and doorstep delivery.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-lg mx-auto">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-4 top-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search topics (e.g. pesticide removal, delivery timing)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-neutral-900 placeholder-neutral-400 rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Filter Pills */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-neutral-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#2d472c] text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. FAQs Accordion List */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 text-neutral-400 space-y-2">
            <HelpCircle className="h-8 w-8 mx-auto text-neutral-300" />
            <p className="text-sm font-bold text-neutral-700">No questions found matching your search</p>
            <p className="text-xs">Try searching for other keywords or reset your category filter</p>
          </div>
        ) : (
          filtered.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq._id || idx}
                className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-neutral-900 hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#f4f7f2] text-[#2d472c] text-[10px] font-bold">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold font-display text-[#2d472c]">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="p-1 text-neutral-500">
                    {isOpen ? <ChevronUp className="h-5 w-5 text-[#2d472c]" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 bg-[#faf9f5]/50">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* 4. Still Have Questions Callout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="p-8 rounded-3xl bg-[#f2f7f0] border border-[#cfe3cb] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold font-display text-[#2d472c]">Still have questions?</h3>
            <p className="text-xs text-neutral-600">Our Vadodara customer care team is available daily from 7:00 AM to 9:00 PM.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:+919227725359"
              className="px-5 py-2.5 rounded-full bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-300" />
              <span>Call Support</span>
            </a>
            <Link
              to="/contact-us"
              className="px-5 py-2.5 rounded-full bg-white border border-[#2d472c] text-[#2d472c] text-xs font-bold hover:bg-[#faf9f5]"
            >
              Contact Desk
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FAQPage;
