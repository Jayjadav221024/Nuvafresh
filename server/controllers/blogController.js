import Blog from '../models/Blog.js';

const DEFAULT_BLOGS = [
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
    images: {
      left: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500&auto=format&fit=crop&q=80',
      right: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=80'
    },
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
    images: {
      left: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80',
      right: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80'
    },
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
    images: {
      left: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      right: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80'
    },
    excerpt: 'Black rice is not just an eye-catching version of plain white rice; it is also highly nutritious. This rice has its distinctive black color due to...',
    content: "Rich in powerful anthocyanin antioxidants, black rice aids cardiovascular vitality and maintains healthy blood sugar indices."
  }
];

let IN_MEMORY_BLOGS = [...DEFAULT_BLOGS];

export const getBlogs = async (req, res) => {
  try {
    const { category, search, tag, limit } = req.query;
    try {
      let query = { status: 'Published' };
      if (req.user && req.user.role === 'admin') delete query.status;
      if (category && category !== 'All') query.category = category;
      if (tag && tag !== 'All articles') query.tags = { $in: [tag] };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } }
        ];
      }

      let q = Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });
      if (limit) q = q.limit(Number(limit));
      const blogs = await q.lean();

      if (blogs.length > 0) {
        return res.json({ success: true, count: blogs.length, blogs });
      }
    } catch (e) {}

    let filtered = [...IN_MEMORY_BLOGS];
    if (category && category !== 'All') {
      filtered = filtered.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }
    if (tag && tag !== 'All articles') {
      filtered = filtered.filter(b => b.tags?.some(t => t.toLowerCase() === tag.toLowerCase()));
    }
    if (search) {
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(search.toLowerCase()) || 
        b.excerpt.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (limit) {
      filtered = filtered.slice(0, Number(limit));
    }

    res.json({ success: true, count: filtered.length, blogs: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      const blog = await Blog.findOne({ $or: [{ slug: id }, { _id: id }] }).lean();
      if (blog) return res.json({ success: true, blog });
    } catch (e) {}

    const found = IN_MEMORY_BLOGS.find(b => b.id === id || b._id === id || b.slug === id);
    if (found) return res.json({ success: true, blog: found });

    res.status(404).json({ success: false, message: 'Article not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const newBlog = {
      _id: `b-${Date.now()}`,
      id: req.body.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `blog-${Date.now()}`,
      publishedAt: new Date().toISOString().split('T')[0],
      views: 0,
      ...req.body
    };

    try {
      const created = await Blog.create(newBlog);
      return res.status(201).json({ success: true, blog: created });
    } catch (e) {
      IN_MEMORY_BLOGS.unshift(newBlog);
      return res.status(201).json({ success: true, blog: newBlog });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    try {
      const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (updated) return res.json({ success: true, blog: updated });
    } catch (e) {}

    IN_MEMORY_BLOGS = IN_MEMORY_BLOGS.map(b => (b._id === req.params.id || b.id === req.params.id) ? { ...b, ...req.body } : b);
    const updatedMock = IN_MEMORY_BLOGS.find(b => b._id === req.params.id || b.id === req.params.id);
    res.json({ success: true, blog: updatedMock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    try {
      await Blog.findByIdAndDelete(req.params.id);
    } catch (e) {}

    IN_MEMORY_BLOGS = IN_MEMORY_BLOGS.filter(b => b._id !== req.params.id && b.id !== req.params.id);
    res.json({ success: true, message: 'Article removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
