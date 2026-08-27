import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Film, Sparkles, X, Save, CheckCircle2 } from 'lucide-react';
import API from '../../api/axiosInstance';

const AdminReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    productTitle: '',
    productPrice: ''
  });

  const fetchReels = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/reels');
      if (data.success && data.reels) {
        setReels(data.reels);
      }
    } catch (e) {
      console.warn('Reels fetch fallback', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingReel(item);
      setFormData({
        title: item.title || '',
        videoUrl: item.videoUrl || '',
        productTitle: item.productTitle || '',
        productPrice: item.productPrice || ''
      });
    } else {
      setEditingReel(null);
      setFormData({
        title: '',
        videoUrl: '',
        productTitle: '',
        productPrice: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      productPrice: Number(formData.productPrice) || 99,
      isFeatured: true
    };

    if (editingReel) {
      try {
        const { data } = await API.put(`/reels/${editingReel._id}`, payload);
        if (data.success && data.reel) {
          setReels(reels.map(r => r._id === editingReel._id ? data.reel : r));
        } else {
          setReels(reels.map(r => r._id === editingReel._id ? { ...r, ...payload } : r));
        }
      } catch (err) {
        setReels(reels.map(r => r._id === editingReel._id ? { ...r, ...payload } : r));
      }
    } else {
      try {
        const { data } = await API.post('/reels', payload);
        if (data.success && data.reel) {
          setReels([data.reel, ...reels]);
        } else {
          setReels([{ _id: `reel-${Date.now()}`, ...payload }, ...reels]);
        }
      } catch (err) {
        setReels([{ _id: `reel-${Date.now()}`, ...payload }, ...reels]);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this video reel from storefront?')) {
      try {
        await API.delete(`/reels/${id}`);
        setReels(reels.filter(r => r._id !== id));
      } catch (e) {
        setReels(reels.filter(r => r._id !== id));
      }
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950 font-display">Shoppable Video Reels Manager</h1>
          <p className="text-sm text-secondary-700">Manage 9:16 vertical farm harvest clips, headline overlays, and linked produce products</p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Upload New Video Reel</span>
        </button>
      </div>

      {/* Reels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reels.map((reel) => (
          <div key={reel._id} className="p-5 rounded-2xl bg-white border border-secondary-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> 
                <span>Shoppable Reel</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenModal(reel)}
                  className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
                  title="Edit Reel Text & Video"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(reel._id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Reel"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* 9:16 Vertical Video Container with Fallback Poster */}
            <div className="aspect-[9/14] rounded-xl overflow-hidden bg-neutral-950 relative border border-neutral-800 shadow-inner group">
              <video 
                src={reel.videoUrl} 
                poster={reel.poster || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'}
                loop 
                muted 
                autoPlay 
                playsInline 
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-xs space-y-1">
                <p className="font-bold font-display truncate drop-shadow-md">{reel.title}</p>
                <p className="text-[11px] text-emerald-300 font-semibold drop-shadow-md">₹{reel.productPrice} • {reel.productTitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Reel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-[#fbfbfa]">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <Film className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 font-display">
                    {editingReel ? 'Edit Shoppable Video Reel' : 'Add New Shoppable Video Reel'}
                  </h3>
                  <p className="text-xs text-neutral-500">Edit headline, product details, price, and video source stream</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Reel Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawn Hydro Spinach Harvesting"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Video URL (MP4 / WebM / S3 stream)</label>
                <input
                  type="url"
                  required
                  placeholder="https://.../video.mp4"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Linked Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hydro-Cleaned Baby Spinach"
                    value={formData.productTitle}
                    onChange={(e) => setFormData({ ...formData, productTitle: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="79"
                    value={formData.productPrice}
                    onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-1.5 text-xs px-5 py-2.5 rounded-xl"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingReel ? 'Save Changes' : 'Publish Reel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReels;
