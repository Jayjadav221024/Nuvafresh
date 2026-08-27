import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Trash2, Edit2, Sparkles, Tag, ArrowRight, RefreshCw } from 'lucide-react';
import API from '../../api/axiosInstance';

const SEED_CATEGORIES = [
  { _id: 'cat-1', name: 'Ozone Washed Vegetables', slug: 'ozone-washed-vegetables', badgeTag: '0.00 ppm Residue · O3 Purified', count: 184, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', status: 'Active' },
  { _id: 'cat-2', name: 'A2 Ghee & Vedic Dairy', slug: 'a2-ghee', badgeTag: 'Vedic Bilona · Grass-Fed Gir Cow', count: 24, image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400', status: 'Active' },
  { _id: 'cat-3', name: 'Stone Pressed Oils', slug: 'stone-pressed-oils', badgeTag: 'Slow Kolhu · Unrefined', count: 38, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', status: 'Active' },
  { _id: 'cat-4', name: 'Organic Atta & Ancient Grains', slug: 'organic-atta', badgeTag: 'Low GI · Stone Ground Khapli', count: 52, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', status: 'Active' },
  { _id: 'cat-5', name: 'Cold-Pressed Juices & Wellness', slug: 'cold-pressed-juices', badgeTag: '100% Pure Raw · Zero Added Sugar', count: 37, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', status: 'Active' }
];

const AdminCategories = () => {
  const [categories, setCategories] = useState(SEED_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    badgeTag: '',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    status: 'Active'
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/categories');
      if (data.success && data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.warn('Category fetch fallback', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const slug = newCategory.slug || newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      ...newCategory,
      slug,
      count: 0
    };

    try {
      const { data } = await API.post('/admin/categories', payload);
      if (data.success && data.category) {
        setCategories([data.category, ...categories]);
      } else {
        setCategories([{ _id: `cat-${Date.now()}`, ...payload }, ...categories]);
      }
    } catch (err) {
      setCategories([{ _id: `cat-${Date.now()}`, ...payload }, ...categories]);
    }
    setShowModal(false);
    setNewCategory({ name: '', slug: '', badgeTag: '', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', status: 'Active' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete category? All products under this category will need re-tagging.')) {
      try {
        await API.delete(`/admin/categories/${id}`);
        setCategories(categories.filter(c => (c._id || c.id) !== id));
      } catch (e) {
        setCategories(categories.filter(c => (c._id || c.id) !== id));
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Categories & Quality Badges
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage storefront taxonomy, product classifications, and custom quality badge tags synced with storefront shop filters.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider font-extrabold bg-neutral-100/70 dark:bg-neutral-800/60">
                <th className="py-3 px-3">Image</th>
                <th className="py-3 px-3">Category Name</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Storefront Badge Tag</th>
                <th className="py-3 px-3 text-right">Active SKUs</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {categories.map((cat) => (
                <tr key={cat._id || cat.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="py-3.5">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                      <img src={cat.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'} alt={cat.name} className="h-full w-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-neutral-900 dark:text-white text-sm">
                    {cat.name}
                  </td>
                  <td className="py-3.5 font-mono text-neutral-400 text-[11px]">
                    /category/{cat.slug}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#e7e3d8] dark:bg-neutral-800 text-[#2d472c] dark:text-emerald-300 text-xs font-bold">
                      {cat.badgeTag || 'Chemical-Free Harvest'}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-right text-neutral-800 dark:text-neutral-200">
                    {cat.count || 0} Products
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {cat.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(cat._id || cat.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
                Add New Category
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exotics & Microgreens"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full bg-[#faf9f5] dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-[#2d472c]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Badge Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Hydroponic · Chemical Free"
                  value={newCategory.badgeTag}
                  onChange={(e) => setNewCategory({ ...newCategory, badgeTag: e.target.value })}
                  className="w-full bg-[#faf9f5] dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-[#2d472c]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCategory.image}
                  onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                  className="w-full bg-[#faf9f5] dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-[#2d472c]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2d472c] text-white font-bold shadow-md"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;
