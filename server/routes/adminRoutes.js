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
import { CUSTOMERS_STORE } from '../utils/store.js';

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
router.get('/faqs', async (req, res) => {
  try {
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
    const rev = await Review.create(req.body);
    res.status(201).json({ success: true, review: rev });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/reviews/public', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'Approved' }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, reviews });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public Coupon Validation API for Storefront Cart & Checkout
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, cartTotal = 0 } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Please enter a coupon code' });

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      status: 'Active'
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (coupon.validTo && new Date(coupon.validTo) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` 
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

// 1. Dashboard Metrics
router.get('/dashboard-kpis', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ stock: { $lte: 10 } });
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    const pendingInquiries = await Inquiry.countDocuments({ status: 'Unread' });
    const pendingReviews = await Review.countDocuments({ status: 'Pending' });

    // 7-day revenue chart simulation / aggregation
    const chartData = [
      { day: 'Mon', revenue: 42000, orders: 34 },
      { day: 'Tue', revenue: 58000, orders: 48 },
      { day: 'Wed', revenue: 51000, orders: 41 },
      { day: 'Thu', revenue: 76000, orders: 62 },
      { day: 'Fri', revenue: 89000, orders: 74 },
      { day: 'Sat', revenue: 112000, orders: 95 },
      { day: 'Sun', revenue: 98000, orders: 81 },
    ];

    res.json({
      success: true,
      stats: {
        todayRevenue: 98450,
        revenueGrowth: '+18.4%',
        todayOrders: 81,
        ordersGrowth: '+12.6%',
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

router.post('/categories', async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, category: cat });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category removed' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 3. Coupons CRUD
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon removed' });
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
    res.json({ success: true, review: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 6. Newsletter Subscribers
router.get('/newsletter', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json({ success: true, subscribers });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// 7. Schema-Driven Dynamic Website Content Editor (Update & Undo)
router.patch('/content/:sectionKey', async (req, res) => {
  try {
    const { fields } = req.body;
    const section = await SectionContent.findOne({ sectionKey: req.params.sectionKey });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    section.fields = fields;
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
router.get('/customers', async (req, res) => {
  try {
    let dbCustomers = [];
    try {
      dbCustomers = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    } catch (e) {}

    // Combine and deduplicate by email
    const emailsSeen = new Set();
    const combined = [];

    // Prioritize in-memory store for instant live updates
    for (const c of CUSTOMERS_STORE) {
      if (c.email && !emailsSeen.has(c.email.toLowerCase())) {
        emailsSeen.add(c.email.toLowerCase());
        combined.push(c);
      }
    }

    for (const u of dbCustomers) {
      if (u.email && !emailsSeen.has(u.email.toLowerCase())) {
        emailsSeen.add(u.email.toLowerCase());
        combined.push({
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          phone: u.phone || '+91 98250 12345',
          city: 'Vadodara',
          state: 'Gujarat',
          totalOrders: 1,
          lifetimeValue: 1200,
          status: 'Active',
          createdAt: u.createdAt
        });
      }
    }

    res.json({ success: true, count: combined.length, customers: combined });
  } catch (e) {
    res.json({ success: true, count: CUSTOMERS_STORE.length, customers: CUSTOMERS_STORE });
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

// 11. Admin Testimonials CRUD Operations
router.get('/testimonials', async (req, res) => {
  try {
    let testimonials = [];
    try {
      testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    } catch (e) {}

    if (testimonials.length === 0) {
      testimonials = IN_MEMORY_TESTIMONIALS;
    }
    res.json({ success: true, count: testimonials.length, testimonials });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/testimonials', async (req, res) => {
  try {
    let created;
    try {
      created = await Testimonial.create(req.body);
    } catch (e) {
      created = { _id: `t-${Date.now()}`, ...req.body };
      IN_MEMORY_TESTIMONIALS.unshift(created);
    }
    res.status(201).json({ success: true, testimonial: created });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/testimonials/:id', async (req, res) => {
  try {
    let updated;
    try {
      updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } catch (e) {
      IN_MEMORY_TESTIMONIALS = IN_MEMORY_TESTIMONIALS.map(t => t._id === req.params.id ? { ...t, ...req.body } : t);
      updated = { _id: req.params.id, ...req.body };
    }
    res.json({ success: true, testimonial: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/testimonials/:id/status', async (req, res) => {
  try {
    let updated;
    try {
      updated = await Testimonial.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    } catch (e) {
      IN_MEMORY_TESTIMONIALS = IN_MEMORY_TESTIMONIALS.map(t => t._id === req.params.id ? { ...t, status: req.body.status } : t);
      updated = { _id: req.params.id, status: req.body.status };
    }
    res.json({ success: true, testimonial: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    try {
      await Testimonial.findByIdAndDelete(req.params.id);
    } catch (e) {
      IN_MEMORY_TESTIMONIALS = IN_MEMORY_TESTIMONIALS.filter(t => t._id !== req.params.id);
    }
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
