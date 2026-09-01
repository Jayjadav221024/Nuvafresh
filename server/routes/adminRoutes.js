import express from 'express';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import Inquiry from '../models/Inquiry.js';
import Newsletter from '../models/Newsletter.js';
import WebsiteSection from '../models/WebsiteSection.js';
import SectionContent from '../models/SectionContent.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import FAQ from '../models/FAQ.js';
import Testimonial from '../models/Testimonial.js';
import Media from '../models/Media.js';
import { CUSTOMERS_STORE, ORDERS_STORE } from '../utils/store.js';
import { getIncomingByProduct } from '../controllers/transferController.js';

const router = express.Router();

// Fallback seed FAQs if MongoDB collection is empty
const DEFAULT_FAQS = [
  {
    category: 'Ozone Wash & Purity',
    question: 'What is aqueous ozone washing and how does it remove pesticides?',
    answer: 'Aqueous ozone (O₃) is an all-natural, medical-grade sanitizer produced by infusing pure oxygen and water with ozone gas. It is 3,000x faster than chlorine at neutralizing pesticide molecules, heavy metals, mold, and pathogens. Within minutes, it reverts back to pure oxygen and water leaving 0.00 PPM chemical residue.',
    status: 'Published',
    order: 1
  },
  {
    category: 'Delivery & Packaging',
    question: 'How fast is sunrise farm harvest to doorstep delivery in Gujarat?',
    answer: 'All our organic leafy greens, vegetables, and seasonal fruits are harvested at sunrise (5:00 AM - 7:00 AM), immediately triple-washed in our cold-water aqueous ozone tunnel, vacuum-packed in biodegradable kraft boxes, and delivered to your kitchen within 12 hours.',
    status: 'Published',
    order: 2
  },
  {
    category: 'A2 Ghee & Staples',
    question: 'How is Nuva A2 Gir Cow Ghee prepared?',
    answer: 'Our A2 Desi Cow Ghee is prepared using the authentic Vedic Bilona method. Whole A2 milk from grass-fed Gir cows is curdled in earthen pots, hand-churned bidirectionally with wooden churners to extract makkhan (butter), and slowly simmered over cow-dung flame for pure golden aroma and granular texture.',
    status: 'Published',
    order: 3
  },
  {
    category: 'Orders & Payments',
    question: 'What payment options and discounts are available?',
    answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), instant QR code scan & pay, credit/debit cards, net banking, and Cash on Delivery (COD). Use coupon code WELCOME10 for an extra 10% OFF your first order.',
    status: 'Published',
    order: 4
  },
  {
    category: 'B2B & Commercial Supply',
    question: 'Do you supply to restaurants, cafes, and bulk institutional kitchens?',
    answer: 'Yes! We supply custom graded, ozone-washed exotics, hydroponic herbs, and cold-pressed oils daily to leading restaurants, hotels, and cloud kitchens across Vadodara, Ahmedabad, and Anand. You can request a rate card directly from our /b2b portal or call +91 92277 25359.',
    status: 'Published',
    order: 5
  }
];

// Public FAQs Endpoint for storefront pages
const loadFaqs = async () => {
  let faqs = [];
  try {
    faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
  } catch (e) {}

  if (faqs.length === 0) {
    try {
      faqs = await FAQ.insertMany(DEFAULT_FAQS);
    } catch (e) {
      faqs = DEFAULT_FAQS.map((f, i) => ({ _id: `faq-${i + 1}`, ...f }));
    }
  }
  return faqs;
};

router.get('/faqs', async (req, res) => {
  try {
    const faqs = await loadFaqs();
    res.json({ success: true, count: faqs.length, faqs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Published-only feed for storefront widgets (product page accordion, etc).
// Registered before the admin guard so it stays public.
router.get('/faqs/public', async (req, res) => {
  try {
    const faqs = (await loadFaqs()).filter((f) => f.status === 'Published');
    res.json({ success: true, count: faqs.length, faqs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public routes for customer engagement submission
router.post('/inquiries', async (req, res) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    res.status(201).json({ success: true, inquiry });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Newsletter.findOne({ email });
    if (existing) return res.json({ success: true, message: 'Already subscribed' });
    const sub = await Newsletter.create({ email });
    res.status(201).json({ success: true, subscription: sub });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    // A shopper can never publish straight to the storefront — moderation
    // owns `status`, exactly like Shopify's review apps.
    const { status, isVerifiedPurchase, ...submitted } = req.body;
    const rev = await Review.create({ ...submitted, status: 'Pending', isVerifiedPurchase: false });
    res.status(201).json({
      success: true,
      review: rev,
      message: 'Thanks! Your review is awaiting moderation and will appear shortly.'
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Approved reviews only. `?product=<id>` scopes them to one product detail page.
router.get('/reviews/public', async (req, res) => {
  try {
    const query = { status: 'Approved' };
    const { product, productTitle } = req.query;

    // Match on whichever identifier the caller has. CSV-seeded products carry
    // string ids that cannot cast to an ObjectId, so the title is the fallback.
    const scopes = [];
    if (product && /^[0-9a-fA-F]{24}$/.test(product)) scopes.push({ product });
    if (productTitle) scopes.push({ productTitle });
    if (scopes.length > 0) query.$or = scopes;

    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: reviews.length, reviews });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public Coupon Validation API for Storefront Cart & Checkout
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, cartTotal = 0, cartQuantity = 0 } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Please enter a coupon code' });

    // Status is derived on save, so a coupon whose start date has since passed
    // may still be stored as 'Scheduled'. Only 'Disabled' is a hard stop here —
    // the date checks below are the real gate.
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      status: { $ne: 'Disabled' }
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return res.status(400).json({ success: false, message: 'This coupon is not active yet' });
    }

    if (coupon.hasEndDate && coupon.validTo && new Date(coupon.validTo) < now) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    // Only enforce a cap when the merchant actually turned one on.
    if (coupon.limitTotalUses && coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    if (coupon.minimumRequirement === 'amount' && coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
      });
    }

    if (coupon.minimumRequirement === 'quantity' && coupon.minQuantity && cartQuantity < coupon.minQuantity) {
      return res.status(400).json({
        success: false,
        message: `Add at least ${coupon.minQuantity} items to use this coupon`
      });
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.value) / 100);
    } else {
      discountAmount = Math.min(coupon.value, cartTotal);
    }

    res.json({
      success: true,
      message: `Coupon ${coupon.code} applied successfully!`,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public Categories API for Storefront Category Filters and Menus
router.get('/categories/public', async (req, res) => {
  try {
    const categories = await Category.find().sort({ orderIndex: 1, createdAt: -1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public Testimonials API
const DEFAULT_TESTIMONIALS = [
  {
    _id: 't-1',
    author: 'Minal Kapasi',
    city: 'Vadodara',
    quote: 'Hello Nuva team, I ordered organic fruits and veggies from the app — all farm-fresh, natural, and spoilage-free. The Golden Kiwi, Bhindi, and Khapli flour bhakhri were excellent. Loved the seasonal variety, eco-friendly packaging, and sustainable approach. Keep it up, Aanshi!',
    rating: 5,
    status: 'Published',
    order: 1
  },
  {
    _id: 't-2',
    author: 'Amit',
    city: 'Vadodara',
    quote: 'The A2 Bilona ghee and cold-pressed mustard oil took me back to my village roots in Gujarat. Truly chemical-free with an unmistakable authentic aroma. Clean delivery with zero plastic waste!',
    rating: 5,
    status: 'Published',
    order: 2
  },
  {
    _id: 't-3',
    author: 'Shirali Parikh',
    city: 'Mumbai',
    quote: 'Ever since switching to Nuva’s ozone-washed leafy greens, our family has experienced noticeably crisper salads with zero chemical or fertilizer smell. Remarkable quality standards.',
    rating: 5,
    status: 'Published',
    order: 3
  },
  {
    _id: 't-4',
    author: 'Dr. Rajesh Dave',
    city: 'Ahmedabad',
    quote: 'The Lakadong turmeric has an extraordinary rich golden hue and high curcumin level. The transparency in sourcing and HPLC lab test QR code on every dispatch gives complete peace of mind.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
    rating: 5,
    status: 'Published',
    order: 4
  }
];

let IN_MEMORY_TESTIMONIALS = [...DEFAULT_TESTIMONIALS];

const seedTestimonialsIfEmpty = async () => {
  try {
    const count = await Testimonial.countDocuments();
    if (count === 0) {
      await Testimonial.insertMany(DEFAULT_TESTIMONIALS.map(({ _id, ...rest }) => rest));
    }
  } catch (e) {
    console.error('Testimonial seed error:', e.message);
  }
};
seedTestimonialsIfEmpty();

router.get('/testimonials/public', async (req, res) => {
  try {
    let testimonials = [];
    try {
      testimonials = await Testimonial.find({ status: 'Published' }).sort({ order: 1, createdAt: -1 });
    } catch (e) {}

    if (testimonials.length === 0) {
      testimonials = IN_MEMORY_TESTIMONIALS.filter(t => t.status === 'Published');
    }
    res.json({ success: true, count: testimonials.length, testimonials });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public Media Library Query API
router.get('/media/public', async (req, res) => {
  try {
    let media = [];
    try {
      media = await Media.find().sort({ createdAt: -1 });
    } catch (e) {}
    res.json({ success: true, count: media.length, media });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public Content Section API for storefront components and Admin Website Editor
router.get('/content/sections', async (req, res) => {
  try {
    let sections = [];
    try {
      sections = await SectionContent.find().sort({ page: 1, createdAt: 1 });
    } catch (e) {}

    // If database has 0 sections, auto-seed and return MASTER_CMS_SECTIONS
    if (!sections || sections.length === 0) {
      try {
        const { MASTER_CMS_SECTIONS } = await import('../scripts/seedSectionContent.js');
        if (MASTER_CMS_SECTIONS && MASTER_CMS_SECTIONS.length > 0) {
          sections = MASTER_CMS_SECTIONS;
          // Asynchronously upsert to DB in background
          SectionContent.insertMany(MASTER_CMS_SECTIONS).catch(() => {});
        }
      } catch (seedErr) {}
    }

    res.json({ success: true, count: sections.length, sections });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/content/:sectionKey', async (req, res) => {
  try {
    const section = await SectionContent.findOne({ sectionKey: req.params.sectionKey });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, section });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ================= ADMIN PROTECTED ROUTES =================
router.use(protect);
router.use(requireAdmin);

// Testimonials Admin CRUD
router.get('/testimonials', async (req, res) => {
  try {
    let testimonials = [];
    try {
      testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    } catch (e) {}
    if (testimonials.length === 0) testimonials = IN_MEMORY_TESTIMONIALS;
    res.json({ success: true, count: testimonials.length, testimonials });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/testimonials', async (req, res) => {
  try {
    const newTestimonial = {
      _id: `t-${Date.now()}`,
      order: IN_MEMORY_TESTIMONIALS.length + 1,
      ...req.body
    };
    try {
      const created = await Testimonial.create(newTestimonial);
      return res.status(201).json({ success: true, testimonial: created });
    } catch (e) {
      IN_MEMORY_TESTIMONIALS.push(newTestimonial);
      return res.status(201).json({ success: true, testimonial: newTestimonial });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/testimonials/:id', async (req, res) => {
  try {
    try {
      const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (updated) return res.json({ success: true, testimonial: updated });
    } catch (e) {}
    IN_MEMORY_TESTIMONIALS = IN_MEMORY_TESTIMONIALS.map(t => t._id === req.params.id ? { ...t, ...req.body } : t);
    const found = IN_MEMORY_TESTIMONIALS.find(t => t._id === req.params.id);
    res.json({ success: true, testimonial: found });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    try {
      await Testimonial.findByIdAndDelete(req.params.id);
    } catch (e) {}
    IN_MEMORY_TESTIMONIALS = IN_MEMORY_TESTIMONIALS.filter(t => t._id !== req.params.id);
    res.json({ success: true, message: 'Testimonial removed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Media Library Admin CRUD
router.get('/media', async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json({ success: true, count: media.length, media });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/media', async (req, res) => {
  try {
    const newMedia = await Media.create(req.body);
    res.status(201).json({ success: true, media: newMedia });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/media/:id', async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Media item deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 1. Dashboard Metrics — every number below is derived from real order data.
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const sumRevenue = (orders) =>
  orders.reduce((total, o) => total + (Number(o.totalAmount) || 0), 0);

const percentChange = (current, previous) => {
  if (!previous) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

router.get('/dashboard-kpis', async (req, res) => {
  try {
    const [totalProducts, lowStockCount, totalOrders, pendingInquiries, pendingReviews] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ stock: { $lte: 10 } }),
        Order.countDocuments(),
        Inquiry.countDocuments({ status: 'Unread' }),
        Review.countDocuments({ status: 'Pending' })
      ]);

    const today = startOfDay(new Date());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const [recentOrders, weekOrders] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Order.find({ createdAt: { $gte: weekAgo } }).select('totalAmount createdAt').lean()
    ]);

    // Bucket the last seven days, oldest first, so the chart reads left to right.
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekAgo);
      day.setDate(day.getDate() + i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);

      const inBucket = weekOrders.filter((o) => {
        const at = new Date(o.createdAt);
        return at >= day && at < next;
      });

      return {
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.round(sumRevenue(inBucket)),
        orders: inBucket.length
      };
    });

    const todayBucket = chartData[chartData.length - 1] || { revenue: 0, orders: 0 };
    const yesterdayBucket = chartData[chartData.length - 2] || { revenue: 0, orders: 0 };

    res.json({
      success: true,
      stats: {
        todayRevenue: todayBucket.revenue,
        revenueGrowth: percentChange(todayBucket.revenue, yesterdayBucket.revenue),
        todayOrders: todayBucket.orders,
        ordersGrowth: percentChange(todayBucket.orders, yesterdayBucket.orders),
        weekRevenue: Math.round(sumRevenue(weekOrders)),
        accessScope: '18 screens authorized',
        lowStockCount,
        totalProducts,
        totalOrders,
        pendingInquiries,
        pendingReviews
      },
      chartData,
      recentOrders
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 2. Categories CRUD
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ orderIndex: 1, createdAt: -1 });
    res.json({ success: true, categories });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

const slugifyName = (name) =>
  String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

router.post('/categories', async (req, res) => {
  try {
    const cat = await Category.create({
      ...req.body,
      slug: req.body.slug || slugifyName(req.body.name)
    });
    res.status(201).json({ success: true, category: cat });
  } catch (e) {
    const message = e.code === 11000 ? 'A category with that name already exists' : e.message;
    res.status(400).json({ success: false, message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const previousName = category.name;
    Object.assign(category, req.body);
    if (req.body.name && !req.body.slug) category.slug = slugifyName(req.body.name);
    await category.save();

    // A rename must carry the catalogue with it, or every product filed under
    // the old name silently drops out of the storefront filter.
    if (req.body.name && req.body.name !== previousName) {
      await Product.updateMany({ category: previousName }, { category: req.body.name }).catch(() => {});
    }

    res.json({ success: true, category });
  } catch (e) {
    const message = e.code === 11000 ? 'A category with that name already exists' : e.message;
    res.status(400).json({ success: false, message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0 && req.query.force !== 'true') {
      return res.status(409).json({
        success: false,
        message: `${productCount} product${productCount === 1 ? '' : 's'} still use "${category.name}". Move them first, or delete with ?force=true.`,
        productCount
      });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category removed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 3. Discounts (coupons) CRUD
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Discount not found' });
    res.json({ success: true, coupon });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (e) {
    const message = e.code === 11000 ? 'A discount with that code already exists' : e.message;
    res.status(400).json({ success: false, message });
  }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Discount not found' });

    // usedCount is owned by checkout, never by the editor.
    const { usedCount, ...updates } = req.body;
    Object.assign(coupon, updates);
    await coupon.save();

    res.json({ success: true, coupon });
  } catch (e) {
    const message = e.code === 11000 ? 'A discount with that code already exists' : e.message;
    res.status(400).json({ success: false, message });
  }
});

// Staff-only timeline note on a discount.
router.post('/coupons/:id/timeline', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'A comment is required' });

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Discount not found' });

    coupon.timeline.unshift({
      author: req.user?.name || 'Administrator',
      message: message.trim(),
      createdAt: new Date()
    });
    await coupon.save();

    res.json({ success: true, coupon });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Discount removed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 4. Inquiries
router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/inquiries/:id/status', async (req, res) => {
  try {
    const updated = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, inquiry: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 5. Reviews Moderation
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/reviews/:id/status', async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Hiding keeps spam in the queue forever; deleting removes it for good.
router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 6. Newsletter Subscribers
router.get('/newsletter', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/newsletter/:id/status', async (req, res) => {
  try {
    const updated = await Newsletter.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Subscriber not found' });
    res.json({ success: true, subscriber: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/newsletter/:id', async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subscriber removed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/* ── Inventory ──
   Shopify's inventory screen is a view over the product catalogue, not a
   separate store. `onHand` is product.stock; `committed` is whatever sits in
   unfulfilled orders; `available` is what a shopper can still buy. */
router.get('/inventory', async (req, res) => {
  try {
    const products = await Product.find().sort({ title: 1 }).lean();

    // Sum unfulfilled order lines per product so "committed" is a real number.
    const committedByKey = new Map();
    try {
      const openOrders = await Order.find({ fulfillmentStatus: { $ne: 'Fulfilled' } }).lean();
      for (const order of openOrders) {
        for (const item of order.items || []) {
          const key = String(item.product || item.productId || item.title || '');
          if (!key) continue;
          committedByKey.set(key, (committedByKey.get(key) || 0) + (Number(item.quantity) || 0));
        }
      }
    } catch (e) { /* orders unavailable — committed stays 0 */ }

    // Units still on the road between Nuva's own locations.
    let incomingByKey = new Map();
    try {
      incomingByKey = await getIncomingByProduct();
    } catch (e) { /* transfers unavailable — incoming stays 0 */ }

    const items = products.map((p) => {
      const onHand = Number(p.stock) || 0;
      const committed = committedByKey.get(String(p._id)) || committedByKey.get(p.title) || 0;
      const incoming = incomingByKey.get(String(p._id)) || incomingByKey.get(p.title) || 0;
      return {
        _id: p._id,
        name: p.title,
        sku: p.variants?.[0]?.sku || p.ozoneBatchNumber || 'No SKU',
        image: p.images?.[0] || '',
        category: p.category,
        unit: p.unit,
        status: p.status || 'active',
        onHand,
        committed,
        incoming,
        unavailable: 0,
        available: Math.max(0, onHand - committed)
      };
    });

    res.json({ success: true, count: items.length, items });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Set or adjust stock for one product. `{ onHand }` sets it, `{ delta }` adjusts.
router.patch('/inventory/:id', async (req, res) => {
  try {
    const { onHand, delta } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const next = delta !== undefined
      ? (Number(product.stock) || 0) + Number(delta)
      : Number(onHand);

    if (!Number.isFinite(next)) {
      return res.status(400).json({ success: false, message: 'Provide a numeric onHand or delta' });
    }

    product.stock = Math.max(0, Math.round(next));
    await product.save();

    res.json({ success: true, productId: product._id, onHand: product.stock });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// 7. Schema-Driven Dynamic Website Content Editor (Update & Undo)
router.patch('/content/:sectionKey', async (req, res) => {
  try {
    const { fields, page, title, subtitle, fieldsSchema } = req.body;
    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({ success: false, message: 'A "fields" object is required' });
    }

    let section = await SectionContent.findOne({ sectionKey: req.params.sectionKey });

    // Auto-create the section when the editor saves a key that was never seeded,
    // so a fresh database never blocks a legitimate content update.
    if (!section) {
      section = new SectionContent({
        sectionKey: req.params.sectionKey,
        page: page || 'SITE-WIDE',
        title: title || req.params.sectionKey,
        subtitle: subtitle || '',
        fieldsSchema: Array.isArray(fieldsSchema) ? fieldsSchema : [],
        defaultFields: { ...fields }
      });
    }

    // Merge instead of replace: the editor may send only the fields it owns,
    // and a partial payload must never wipe the rest of the section.
    section.fields = { ...(section.fields || {}), ...fields };
    section.isEdited = true;
    section.updatedBy = req.user?.name || 'Administrator';
    section.updatedAt = new Date();
    await section.save();

    res.json({ success: true, section });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/content/:sectionKey/undo', async (req, res) => {
  try {
    const section = await SectionContent.findOne({ sectionKey: req.params.sectionKey });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    section.fields = section.defaultFields;
    section.isEdited = false;
    section.updatedBy = req.user?.name || 'Administrator';
    section.updatedAt = new Date();
    await section.save();

    res.json({ success: true, section, message: 'Reverted to default' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 8. Sign-In & Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 9. Customers List
/* ── Customer facts, derived from orders ──
   Order count and amount spent are the two numbers this screen exists to
   show, so they are summed from the orders themselves rather than stored
   on the customer where they would drift. Keyed by email, which is what an
   order actually carries. */
const allOrders = async (projection) => {
  let dbOrders = [];
  try {
    dbOrders = await Order.find().select(projection).lean();
  } catch (e) { /* database offline */ }

  /* Merged, not either-or: this is exactly how GET /orders builds its list,
     and if the two disagreed a customer's order count would contradict the
     orders screen it links to. */
  const ids = new Set(dbOrders.map((o) => String(o._id)));
  return [...dbOrders, ...ORDERS_STORE.filter((o) => !ids.has(String(o._id)))];
};

const buildCustomerIndex = async () => {
  const orders = await allOrders('user totalAmount createdAt deliveryAddress');

  const index = new Map();
  for (const order of orders) {
    const email = String(order.user?.email || '').toLowerCase();
    if (!email) continue;
    const entry = index.get(email) || { orders: 0, spent: 0, lastOrderAt: null, lastAddress: null };
    entry.orders += 1;
    entry.spent += Number(order.totalAmount) || 0;
    const at = new Date(order.createdAt);
    if (!entry.lastOrderAt || at > entry.lastOrderAt) {
      entry.lastOrderAt = at;
      entry.lastAddress = order.deliveryAddress || entry.lastAddress;
    }
    index.set(email, entry);
  }
  return index;
};

/* Subscription state comes from the newsletter list — the only place this
   store records consent. Absent means "not subscribed", never "unknown". */
const buildSubscriberSet = async () => {
  try {
    const rows = await Newsletter.find({ status: 'Subscribed' }).select('email').lean();
    return new Set(rows.map((r) => String(r.email).toLowerCase()));
  } catch (e) {
    return new Set();
  }
};

router.get('/customers', async (req, res) => {
  try {
    let dbCustomers = [];
    try {
      dbCustomers = await User.find({ role: { $in: ['user', 'customer'] } })
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();
    } catch (e) {}

    const [stats, subscribed] = await Promise.all([buildCustomerIndex(), buildSubscriberSet()]);

    const emailsSeen = new Set();
    const combined = [];

    const decorate = (base) => {
      const email = String(base.email || '').toLowerCase();
      const facts = stats.get(email) || { orders: 0, spent: 0, lastOrderAt: null, lastAddress: null };
      return {
        ...base,
        totalOrders: facts.orders,
        lifetimeValue: Math.round(facts.spent),
        lastOrderAt: facts.lastOrderAt,
        city: base.city || facts.lastAddress?.city || '',
        state: base.state || facts.lastAddress?.state || '',
        emailSubscribed: subscribed.has(email)
      };
    };

    // The in-memory store wins on identity so a just-registered customer
    // appears immediately, but its numbers are replaced by the real ones.
    for (const c of CUSTOMERS_STORE) {
      if (c.email && !emailsSeen.has(c.email.toLowerCase())) {
        emailsSeen.add(c.email.toLowerCase());
        combined.push(decorate(c));
      }
    }

    for (const u of dbCustomers) {
      if (u.email && !emailsSeen.has(u.email.toLowerCase())) {
        emailsSeen.add(u.email.toLowerCase());
        combined.push(decorate({
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          city: u.addresses?.[0]?.city || '',
          state: u.addresses?.[0]?.state || '',
          createdAt: u.createdAt
        }));
      }
    }

    res.json({ success: true, count: combined.length, customers: combined });
  } catch (e) {
    res.json({ success: true, count: CUSTOMERS_STORE.length, customers: CUSTOMERS_STORE });
  }
});

/* One customer, with the orders that produced their totals. */
router.get('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let base = CUSTOMERS_STORE.find((c) => String(c._id) === id);
    if (!base) {
      try {
        const user = await User.findById(id).select('-password').lean();
        if (user) {
          base = {
            _id: String(user._id),
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            addresses: user.addresses || [],
            createdAt: user.createdAt
          };
        }
      } catch (e) { /* not an ObjectId, or database offline */ }
    }
    if (!base) return res.status(404).json({ success: false, message: 'Customer not found' });

    const email = String(base.email || '').toLowerCase();

    const orders = (await allOrders('user totalAmount createdAt deliveryAddress orderNumber paymentStatus fulfillmentStatus items'))
      .filter((o) => String(o.user?.email || '').toLowerCase() === email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const subscribed = await buildSubscriberSet();
    const spent = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const last = orders[0];

    res.json({
      success: true,
      customer: {
        ...base,
        totalOrders: orders.length,
        lifetimeValue: Math.round(spent),
        averageOrderValue: orders.length ? Math.round(spent / orders.length) : 0,
        lastOrderAt: last?.createdAt || null,
        emailSubscribed: subscribed.has(email),
        city: base.city || last?.deliveryAddress?.city || '',
        state: base.state || last?.deliveryAddress?.state || '',
        defaultAddress: base.addresses?.[0] || last?.deliveryAddress || null
      },
      orders: orders.map((o) => ({
        _id: String(o._id),
        // A seeded order's id ("NUV-9081") is already the readable number; only
        // a long ObjectId needs shortening.
        orderNumber: o.orderNumber || (String(o._id).length > 12 ? String(o._id).slice(-6) : String(o._id)),
        createdAt: o.createdAt,
        totalAmount: Number(o.totalAmount) || 0,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        itemCount: (o.items || []).reduce((n, i) => n + (Number(i.quantity) || 1), 0)
      }))
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 10. Admin FAQs CRUD Operations
router.post('/faqs', async (req, res) => {
  try {
    const newFaq = await FAQ.create(req.body);
    res.status(201).json({ success: true, faq: newFaq });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/faqs/:id', async (req, res) => {
  try {
    const updated = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, faq: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/faqs/:id', async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'FAQ removed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Status-only toggle for the testimonials list (the full CRUD sits above).
router.patch('/testimonials/:id/status', async (req, res) => {
  try {
    let updated;
    try {
      updated = await Testimonial.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    } catch (e) {}

    if (!updated) {
      IN_MEMORY_TESTIMONIALS = IN_MEMORY_TESTIMONIALS.map(t =>
        t._id === req.params.id ? { ...t, status: req.body.status } : t
      );
      updated = IN_MEMORY_TESTIMONIALS.find(t => t._id === req.params.id);
    }

    res.json({ success: true, testimonial: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
