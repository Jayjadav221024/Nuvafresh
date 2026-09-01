import Blog from '../models/Blog.js';
import BlogPublication from '../models/BlogPublication.js';

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
    const { category, search, tag, limit, includeHidden } = req.query;
    try {
      let query = { status: 'Published' };
      // The admin's post list has to show hidden drafts too — they're kept
      // from the storefront, not from the person writing them.
      if (includeHidden === 'true' || (req.user && req.user.role === 'admin')) delete query.status;
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
    /* The storefront must not see hidden posts here either — the database
       path filters on status, so this one has to as well. */
    if (!(includeHidden === 'true' || (req.user && req.user.role === 'admin'))) {
      filtered = filtered.filter((b) => (b.status || 'Published') === 'Published');
    }
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
    const handle = req.body.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `blog-${Date.now()}`;
    const base = {
      id: handle,
      publishedAt: new Date().toISOString().split('T')[0],
      views: 0,
      ...req.body
    };

    try {
      /* Never hand MongoDB a client-side id: "b-1788246301331" is not an
         ObjectId, and passing it made every create fail its cast and fall
         through to the in-memory list, so nothing was ever persisted. */
      const { _id, ...forDb } = base;
      const created = await Blog.create(forDb);
      return res.status(201).json({ success: true, blog: created.toObject() });
    } catch (e) {
      const fallback = { _id: `b-${Date.now()}`, ...base };
      IN_MEMORY_BLOGS.unshift(fallback);
      return res.status(201).json({ success: true, blog: fallback });
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

/* ═══════════════════════════════════════════════════════════════════
   PUBLICATIONS
   The blogs a post can be filed under. Seeded from whatever the existing
   posts already use, so an established store doesn't open this screen to
   an empty list and lose the filing it already has.
═══════════════════════════════════════════════════════════════════ */
const FALLBACK_PUBLICATIONS = [
  { _id: 'pub-news', title: 'News', handle: 'news', commentsPolicy: 'Disabled' },
  { _id: 'pub-food-health', title: 'Food & Health', handle: 'food-health', commentsPolicy: 'Disabled' }
];

let IN_MEMORY_PUBLICATIONS = [...FALLBACK_PUBLICATIONS];

export const getPublications = async (req, res) => {
  try {
    let publications = [];
    try {
      publications = await BlogPublication.find().sort({ title: 1 }).lean();
    } catch (e) { /* database offline */ }

    if (publications.length === 0) publications = IN_MEMORY_PUBLICATIONS;

    /* Any blog name a post already uses is a real publication, whether or not
       somebody created it on this screen — otherwise editing an old post
       would silently refile it. */
    const known = new Set(publications.map((p) => p.title.toLowerCase()));

    /* Read the posts the same way getBlogs does — the database first, and the
       seeded set when it holds none — so the two screens can never disagree
       about which blogs exist or how many posts are in them. */
    let posts = [];
    try {
      posts = await Blog.find().select('category').lean();
    } catch (e) { /* database offline */ }
    if (posts.length === 0) posts = IN_MEMORY_BLOGS;

    const used = [...new Set(posts.map((b) => b.category))];
    for (const title of used) {
      if (title && !known.has(String(title).toLowerCase())) {
        publications.push({
          _id: `implicit-${title}`,
          title,
          handle: String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          commentsPolicy: 'Disabled',
          implicit: true
        });
        known.add(String(title).toLowerCase());
      }
    }

    /* Post counts, so the manage-blogs screen can warn before a delete. */
    const counts = new Map();
    for (const b of posts) counts.set(b.category, (counts.get(b.category) || 0) + 1);

    res.json({
      success: true,
      publications: publications
        .map((p) => ({ ...p, postCount: counts.get(p.title) || 0 }))
        .sort((a, b) => a.title.localeCompare(b.title))
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const createPublication = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ success: false, message: 'A blog needs a name.' });

    const record = {
      title,
      commentsPolicy: req.body.commentsPolicy || 'Disabled',
      seo: req.body.seo || {}
    };

    try {
      const created = await BlogPublication.create(record);
      return res.status(201).json({ success: true, publication: created.toObject() });
    } catch (e) {
      if (e?.code === 11000) {
        return res.status(400).json({ success: false, message: 'A blog with that name already exists.' });
      }
    }

    const fallback = {
      _id: `pub-${Date.now()}`,
      handle: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...record
    };
    IN_MEMORY_PUBLICATIONS.unshift(fallback);
    res.status(201).json({ success: true, publication: fallback });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    if (req.body.title !== undefined) updates.title = String(req.body.title).trim();
    if (req.body.commentsPolicy) updates.commentsPolicy = req.body.commentsPolicy;
    if (req.body.seo) updates.seo = req.body.seo;

    let previousTitle = '';
    try {
      const existing = await BlogPublication.findById(id);
      if (existing) {
        previousTitle = existing.title;
        Object.assign(existing, updates);
        await existing.save();
        // Renaming a blog has to carry its posts with it.
        if (updates.title && updates.title !== previousTitle) {
          await Blog.updateMany({ category: previousTitle }, { $set: { category: updates.title } });
        }
        return res.json({ success: true, publication: existing.toObject() });
      }
    } catch (e) { /* not an ObjectId, or database offline */ }

    const index = IN_MEMORY_PUBLICATIONS.findIndex((p) => p._id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Blog not found' });

    previousTitle = IN_MEMORY_PUBLICATIONS[index].title;
    IN_MEMORY_PUBLICATIONS[index] = { ...IN_MEMORY_PUBLICATIONS[index], ...updates };
    if (updates.title && updates.title !== previousTitle) {
      IN_MEMORY_BLOGS = IN_MEMORY_BLOGS.map((b) =>
        b.category === previousTitle ? { ...b, category: updates.title } : b
      );
    }
    res.json({ success: true, publication: IN_MEMORY_PUBLICATIONS[index] });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;

    let title = '';
    try {
      const existing = await BlogPublication.findById(id);
      if (existing) title = existing.title;
    } catch (e) { /* not an ObjectId, or database offline */ }
    if (!title) title = IN_MEMORY_PUBLICATIONS.find((p) => p._id === id)?.title || '';

    // Deleting a blog must never delete the writing filed under it. Counted
    // from the same source the list uses, or the guard misses in-memory posts.
    let posts = [];
    try {
      posts = await Blog.find().select('category').lean();
    } catch (e) { /* database offline */ }
    if (posts.length === 0) posts = IN_MEMORY_BLOGS;

    const postCount = posts.filter((b) => b.category === title).length;
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Move or delete the ${postCount} post${postCount === 1 ? '' : 's'} in "${title}" first.`
      });
    }

    try {
      await BlogPublication.findByIdAndDelete(id);
    } catch (e) { /* database offline */ }
    IN_MEMORY_PUBLICATIONS = IN_MEMORY_PUBLICATIONS.filter((p) => p._id !== id);

    res.json({ success: true, message: 'Blog removed' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
