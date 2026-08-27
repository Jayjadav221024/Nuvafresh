import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Plus, Search, Edit2, Trash2, CheckCircle2, ChevronDown, 
  ChevronUp, Sparkles, Tag, Layers, RefreshCw
} from 'lucide-react';
import API from '../../api/axiosInstance';

const INITIAL_FAQS = [
  {
    _id: 'faq-1',
    category: 'Ozone Wash & Purity',
    question: 'What is aqueous ozone washing and how does it remove pesticides?',
    answer: 'Aqueous ozone (O₃) is an all-natural, medical-grade sanitizer produced by infusing pure oxygen and water with ozone gas. It is 3,000x faster than chlorine at neutralizing pesticide molecules, heavy metals, mold, and pathogens. Within minutes, it reverts back to pure oxygen and water leaving 0.00 PPM chemical residue.',
    status: 'Published',
    order: 1
  },
  {
    _id: 'faq-2',
    category: 'Delivery & Packaging',
    question: 'How fast is sunrise farm harvest to doorstep delivery in Gujarat?',
    answer: 'All our organic leafy greens, vegetables, and seasonal fruits are harvested at sunrise (5:00 AM - 7:00 AM), immediately triple-washed in our cold-water aqueous ozone tunnel, vacuum-packed in biodegradable kraft boxes, and delivered to your kitchen within 12 hours.',
    status: 'Published',
    order: 2
  },
  {
    _id: 'faq-3',
    category: 'A2 Ghee & Staples',
    question: 'How is Nuva A2 Gir Cow Ghee prepared?',
    answer: 'Our A2 Desi Cow Ghee is prepared using the authentic Vedic Bilona method. Whole A2 milk from grass-fed Gir cows is curdled in earthen pots, hand-churned bidirectionally with wooden churners to extract makkhan (butter), and slowly simmered over cow-dung flame for pure golden aroma and granular texture.',
    status: 'Published',
    order: 3
  },
  {
    _id: 'faq-4',
    category: 'Orders & Payments',
    question: 'What payment options and discounts are available?',
    answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), instant QR code scan & pay, credit/debit cards, net banking, and Cash on Delivery (COD). Use coupon code WELCOME10 for an extra 10% OFF your first order.',
    status: 'Published',
    order: 4
  },
  {
    _id: 'faq-5',
    category: 'B2B & Commercial Supply',
    question: 'Do you supply to restaurants, cafes, and bulk institutional kitchens?',
    answer: 'Yes! We supply custom graded, ozone-washed exotics, hydroponic herbs, and cold-pressed oils daily to leading restaurants, hotels, and cloud kitchens across Vadodara, Ahmedabad, and Anand. You can request a rate card directly from our /b2b portal or call +91 92277 25359.',
    status: 'Published',
    order: 5
  }
];

const CATEGORIES = ['All', 'Ozone Wash & Purity', 'Delivery & Packaging', 'A2 Ghee & Staples', 'Orders & Payments', 'B2B & Commercial Supply'];

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState(INITIAL_FAQS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [expandedId, setExpandedId] = useState('faq-1');

  const [formData, setFormData] = useState({
    category: 'Ozone Wash & Purity',
    question: '',
    answer: '',
    status: 'Published'
  });

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/faqs');
      if (data.success && data.faqs && data.faqs.length > 0) {
        setFaqs(data.faqs);
      }
    } catch (e) {
      console.warn('FAQ fetch fallback', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        status: faq.status
      });
    } else {
      setEditingFaq(null);
      setFormData({
        category: 'Ozone Wash & Purity',
        question: '',
        answer: '',
        status: 'Published'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        const { data } = await API.put(`/admin/faqs/${editingFaq._id || editingFaq.id}`, formData);
        if (data.success && data.faq) {
          setFaqs(faqs.map(f => (f._id === editingFaq._id || f.id === editingFaq.id) ? data.faq : f));
        } else {
          setFaqs(faqs.map(f => (f._id === editingFaq._id || f.id === editingFaq.id) ? { ...f, ...formData } : f));
        }
      } else {
        const payload = {
          ...formData,
          order: faqs.length + 1
        };
        const { data } = await API.post('/admin/faqs', payload);
        if (data.success && data.faq) {
          setFaqs([data.faq, ...faqs]);
        } else {
          setFaqs([{ _id: `faq-${Date.now()}`, ...payload }, ...faqs]);
        }
      }
    } catch (err) {
      if (editingFaq) {
        setFaqs(faqs.map(f => (f._id === editingFaq._id || f.id === editingFaq.id) ? { ...f, ...formData } : f));
      } else {
        const created = {
          _id: `faq-${Date.now()}`,
          ...formData,
          order: faqs.length + 1
        };
        setFaqs([created, ...faqs]);
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await API.delete(`/admin/faqs/${id}`);
        setFaqs(faqs.filter(f => f._id !== id && f.id !== id));
      } catch (e) {
        setFaqs(faqs.filter(f => f._id !== id && f.id !== id));
      }
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchCat = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Frequently Asked Questions (FAQs)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage customer FAQ knowledge base, categorize answers, and synchronize responses across product pages.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#2d472c]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2d472c] text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs Accordion Cards */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 space-y-2">
            <HelpCircle className="h-8 w-8 mx-auto text-neutral-300" />
            <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200">No FAQs match your search criteria</p>
            <p className="text-xs">Try adjusting your category filter or search query</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const faqId = faq._id || faq.id;
            const isExpanded = expandedId === faqId;
            return (
              <div
                key={faqId}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
              >
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : faqId)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        {faq.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        faq.status === 'Published' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {faq.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(faq);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-[#2d472c] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Edit FAQ"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(faqId);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="p-1 text-neutral-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 border-t border-neutral-100 dark:border-neutral-800 leading-relaxed bg-neutral-50/40 dark:bg-neutral-900/60">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
                {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#faf9f5] dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-[#2d472c]"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does aqueous ozone eliminate pesticides?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full bg-[#faf9f5] dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-[#2d472c]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Answer Narrative *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed scientific or operational answer for customers..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full bg-[#faf9f5] dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-[#2d472c]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white font-bold shadow-md"
                >
                  {editingFaq ? 'Save Changes' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminFAQs;
