import React, { useState, useEffect } from 'react';
import { 
  Star, Plus, Trash2, Edit2, CheckCircle2, Eye, EyeOff, MessageSquare, 
  MapPin, Quote, Sparkles, X, User, Image, AlertCircle
} from 'lucide-react';
import API from '../../api/axiosInstance';
import { TESTIMONIAL_AMIT_BASE64 } from '../../assets/testimonialAmitBase64';
import { TESTIMONIAL_MINAL_BASE64 } from '../../assets/testimonialMinalBase64';
import { TESTIMONIAL_SHIRALI_BASE64 } from '../../assets/testimonialShiraliBase64';

const DEFAULT_TESTIMONIALS = [
  {
    _id: 't-1',
    author: 'Minal Kapasi',
    city: 'Vadodara',
    quote: 'Hello Nuva team, I ordered organic fruits and veggies from the app — all farm-fresh, natural, and spoilage-free. The Golden Kiwi, Bhindi, and Khapli flour bhakhri were excellent. Loved the seasonal variety, eco-friendly packaging, and sustainable approach. Keep it up, Aanshi!',
    rating: 5,
    status: 'Published',
    avatar: TESTIMONIAL_MINAL_BASE64,
    order: 1
  },
  {
    _id: 't-2',
    author: 'Amit',
    city: 'Vadodara',
    quote: 'The A2 Bilona ghee and cold-pressed mustard oil took me back to my village roots in Gujarat. Truly chemical-free with an unmistakable authentic aroma. Clean delivery with zero plastic waste!',
    rating: 5,
    status: 'Published',
    avatar: TESTIMONIAL_AMIT_BASE64,
    order: 2
  },
  {
    _id: 't-3',
    author: 'Shirali Parikh',
    city: 'Mumbai',
    quote: 'Ever since switching to Nuva’s ozone-washed leafy greens, our family has experienced noticeably crisper salads with zero chemical or fertilizer smell. Remarkable quality standards.',
    rating: 5,
    status: 'Published',
    avatar: TESTIMONIAL_SHIRALI_BASE64,
    order: 3
  },
  {
    _id: 't-4',
    author: 'Dr. Rajesh Dave',
    city: 'Ahmedabad',
    quote: 'The Lakadong turmeric has an extraordinary rich golden hue and high curcumin level. The transparency in sourcing and HPLC lab test QR code on every dispatch gives complete peace of mind.',
    rating: 5,
    status: 'Published',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
    order: 4
  }
];

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const [formData, setFormData] = useState({
    author: '',
    city: '',
    quote: '',
    rating: 5,
    avatar: '',
    status: 'Published'
  });

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/testimonials');
      if (data.success && data.testimonials && data.testimonials.length > 0) {
        setTestimonials(data.testimonials);
      }
    } catch (e) {
      console.warn('Using local testimonial state fallback', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        author: item.author || '',
        city: item.city || '',
        quote: item.quote || '',
        rating: item.rating || 5,
        avatar: item.avatar || '',
        status: item.status || 'Published'
      });
    } else {
      setEditingItem(null);
      setFormData({
        author: '',
        city: '',
        quote: '',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        status: 'Published'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.author || !formData.quote) return;

    if (editingItem) {
      try {
        await API.put(`/admin/testimonials/${editingItem._id}`, formData);
      } catch (err) {}
      setTestimonials(testimonials.map(t => t._id === editingItem._id ? { ...t, ...formData } : t));
    } else {
      const payload = {
        _id: `t-${Date.now()}`,
        ...formData
      };
      try {
        const { data } = await API.post('/admin/testimonials', payload);
        if (data.success && data.testimonial) {
          setTestimonials([data.testimonial, ...testimonials]);
        } else {
          setTestimonials([payload, ...testimonials]);
        }
      } catch (err) {
        setTestimonials([payload, ...testimonials]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this testimonial?')) {
      try {
        await API.delete(`/admin/testimonials/${id}`);
      } catch (err) {}
      setTestimonials(testimonials.filter(t => t._id !== id));
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Published' ? 'Draft' : 'Published';
    try {
      await API.put(`/admin/testimonials/${item._id}`, { status: newStatus });
    } catch (err) {}
    setTestimonials(testimonials.map(t => t._id === item._id ? { ...t, status: newStatus } : t));
  };

  const filtered = filterStatus === 'All' 
    ? testimonials 
    : testimonials.filter(t => t.status === filterStatus);

  return (
    <div className="p-6 sm:p-8 space-y-8 font-sans max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Customer Testimonials
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Manage verified customer feedback and quotes displayed across the homepage and story pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl">
            {['All', 'Published', 'Draft'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === tab ? 'bg-[#2d472c] text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Grid of Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div 
            key={item._id}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
          >
            {/* Top Row: Avatar + Name + Status */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  {item.avatar ? (
                    <img 
                      src={item.avatar} 
                      alt={item.author} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      {item.author?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                      {item.author}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <MapPin className="h-3 w-3" />
                      <span>{item.city || 'Gujarat'}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  item.status === 'Published' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' 
                    : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote Body */}
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed italic line-clamp-4">
                "{item.quote}"
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(item)}
                className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5"
              >
                {item.status === 'Published' ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Publish</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-fadeIn">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
                {editingItem ? 'Edit Testimonial' : 'Add New Customer Testimonial'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Minal Kapasi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    City / Region
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Vadodara"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Customer Quote Feedback *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Paste authentic customer quote here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Avatar Photo URL
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://... image URL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Rating Stars (1-5)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-800"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs bg-neutral-50 dark:bg-neutral-800"
                  >
                    <option value="Published">Published (Live on Website)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md transition-transform active:scale-95"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
