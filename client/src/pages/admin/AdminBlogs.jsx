import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Edit2, Trash2, CheckCircle2, Eye, EyeOff, Sparkles, X, Image, Tag, Calendar
} from 'lucide-react';
import API from '../../api/axiosInstance';

const INITIAL_BLOGS = [
  {
    _id: 'b-1',
    id: 'ghee-7-checks',
    title: 'How to Identify Pure Cow Ghee: 7 Things to Check',
    category: 'Food & Health',
    author: 'Nuva Nutrition',
    publishedAt: '2026-08-19',
    status: 'Published',
    views: 1420,
    tags: ['a2 cow ghee', 'Vedic traditions', 'Living Soil'],
    bannerImage: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&auto=format&fit=crop&q=80',
    excerpt: "My dadi used to say a house without ghee in the dabba is not really running a kitchen at all. Growing up we'd get one spoon on hot dal...",
    content: "Pure cow ghee made with the ancient Bilona method has distinct aroma, golden graininess, and high nutritional density without preservatives."
  },
  {
    _id: 'b-2',
    id: 'avocado-weight-management',
    title: 'Avocado for Weight Management: What You Should Know',
    category: 'Food & Health',
    author: 'Nuva Nutrition',
    publishedAt: '2026-08-10',
    status: 'Published',
    views: 980,
    tags: ['healthy fats', 'weight loss', 'superfoods'],
    bannerImage: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80',
    excerpt: 'When consumed in moderate amounts, avocado can be a great choice for a person trying to lose weight. The presence of good fat...',
    content: "Monounsaturated fatty acids in avocados help regulate metabolism and support long-lasting satiety throughout the day."
  },
  {
    _id: 'b-3',
    id: 'benefits-of-black-rice',
    title: '10 Science-Backed Health Benefits of Black Rice',
    category: 'Staples & Grains',
    author: 'Nuva Nutrition',
    publishedAt: '2026-07-30',
    status: 'Published',
    views: 2150,
    tags: ['ancient grains', 'anthocyanins', 'gluten-free'],
    bannerImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    excerpt: 'Black rice is not just an eye-catching version of plain white rice; it is also highly nutritious. This rice has its distinctive black color due to...',
    content: "Rich in powerful anthocyanin antioxidants, black rice aids cardiovascular vitality and maintains healthy blood sugar indices."
  }
];

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const fetchBlogs = async () => {
    try {
      const { data } = await API.get('/blogs');
      if (data.success && data.blogs && data.blogs.length > 0) {
        setBlogs(data.blogs);
      }
    } catch (e) {
      console.warn('Using local blog state fallback', e);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Food & Health',
    author: 'Nuva Nutrition',
    status: 'Published',
    bannerImage: '',
    tags: [],
    excerpt: '',
    content: ''
  });

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData(blog);
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        category: 'Food & Health',
        author: 'Nuva Nutrition',
        status: 'Published',
        bannerImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
        tags: ['Chemical-Free', 'Ozone-Washed'],
        excerpt: '',
        content: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingBlog) {
      try {
        await API.put(`/blogs/${editingBlog._id || editingBlog.id}`, formData);
      } catch (err) {}
      setBlogs(blogs.map(b => (b._id === editingBlog._id || b.id === editingBlog.id) ? { ...b, ...formData } : b));
    } else {
      const payload = {
        ...formData,
        publishedAt: new Date().toISOString().split('T')[0],
        views: 0
      };
      try {
        const { data } = await API.post('/blogs', payload);
        if (data.success && data.blog) {
          setBlogs([data.blog, ...blogs]);
        } else {
          setBlogs([{ _id: `b-${Date.now()}`, ...payload }, ...blogs]);
        }
      } catch (err) {
        setBlogs([{ _id: `b-${Date.now()}`, ...payload }, ...blogs]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await API.delete(`/blogs/${id}`);
      } catch (err) {}
      setBlogs(blogs.filter(b => b._id !== id && b.id !== id));
    }
  };

  const handleToggleStatus = async (id) => {
    const target = blogs.find(b => b._id === id || b.id === id);
    if (!target) return;
    const newStatus = target.status === 'Published' ? 'Draft' : 'Published';
    try {
      await API.put(`/blogs/${id}`, { status: newStatus });
    } catch (err) {}
    setBlogs(blogs.map(b => {
      if (b._id === id || b.id === id) {
        return { ...b, status: newStatus };
      }
      return b;
    }));
  };

  const filteredBlogs = blogs.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || b.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 font-sans max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-display">
            Blog & Article Manager
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Create, edit, and publish clean food research, ancient grain guides, and healthy recipes.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search articles by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:ring-1 focus:ring-[#2d472c]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Food & Health', 'Staples & Grains'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#2d472c] text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Banner Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={blog.bannerImage}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  blog.status === 'Published'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {blog.status}
                </span>
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  {blog.category}
                </span>
              </div>

              {/* Text Info */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {blog.publishedAt}
                  </span>
                  <span>•</span>
                  <span>{blog.views} readers</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white line-clamp-2 leading-snug">
                  {blog.title}
                </h3>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {blog.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {blog.tags?.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium text-neutral-600 dark:text-neutral-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(blog.id)}
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 flex items-center gap-1"
              >
                {blog.status === 'Published' ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Unpublish</span>
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
                  onClick={() => handleOpenModal(blog)}
                  className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title="Edit Article"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                  title="Delete Article"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Blog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
                {editingBlog ? 'Edit Blog Article' : 'Write New Blog Article'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 7 Checks for Pure A2 Cow Ghee"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium"
                  >
                    <option value="Food & Health">Food & Health</option>
                    <option value="Staples & Grains">Staples & Grains</option>
                    <option value="Organic Farming">Organic Farming</option>
                    <option value="Recipes & Lifestyle">Recipes & Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Publish Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Banner Image URL
                </label>
                <input
                  type="text"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Tags (Press Enter to add)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag and press Enter"
                  className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {formData.tags?.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Article Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short engaging teaser shown on card previews..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Full Article Body Content
                </label>
                <textarea
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write full deep-dive article content..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2d472c] hover:bg-[#20341f] text-white text-xs font-bold shadow-md transition-transform active:scale-95"
                >
                  {editingBlog ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBlogs;
