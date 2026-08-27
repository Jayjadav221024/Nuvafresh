import Reel from '../models/Reel.js';

let MOCK_REELS = [
  {
    title: 'Dawn Hydro Spinach Harvesting',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-farmer-harvesting-produce-in-a-greenhouse-41582-large.mp4',
    productTitle: 'Hydro-Cleaned Baby Spinach',
    productPrice: 79,
    isFeatured: true,
    orderIndex: 1
  },
  {
    title: 'Vedic A2 Bilona Churning Process',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-fresh-milk-into-a-glass-42861-large.mp4',
    productTitle: 'Gir Cow A2 Bilona Ghee',
    productPrice: 1350,
    isFeatured: true,
    orderIndex: 2
  },
  {
    title: 'Cold-Pressed Valencia Oranges Streaming',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fresh-orange-juice-being-poured-into-a-glass-43346-large.mp4',
    productTitle: 'Cold-Pressed Orange Juice',
    productPrice: 160,
    isFeatured: true,
    orderIndex: 3
  },
  {
    title: 'Sunrise Fresh Ozone Wash Produce Dispatch',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-fresh-produce-41584-large.mp4',
    productTitle: 'Naturally Ripened Vine Tomatoes',
    productPrice: 65,
    isFeatured: true,
    orderIndex: 4
  }
];

const seedReelsIfEmpty = async () => {
  try {
    const count = await Reel.countDocuments();
    if (count === 0) {
      await Reel.insertMany(MOCK_REELS);
    }
  } catch (e) {
    console.error('Reel seed error:', e.message);
  }
};
seedReelsIfEmpty();

export const getReels = async (req, res) => {
  try {
    let dbReels = [];
    try {
      dbReels = await Reel.find().sort({ orderIndex: 1, createdAt: -1 }).lean();
    } catch (e) {}

    if (dbReels && dbReels.length > 0) {
      return res.json({ success: true, count: dbReels.length, reels: dbReels });
    }

    res.json({ success: true, count: MOCK_REELS.length, reels: MOCK_REELS });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReel = async (req, res) => {
  try {
    const newReel = {
      title: req.body.title,
      videoUrl: req.body.videoUrl,
      productTitle: req.body.productTitle,
      productPrice: Number(req.body.productPrice) || 99,
      isFeatured: true,
      orderIndex: Number(req.body.orderIndex) || 0
    };

    try {
      const created = await Reel.create(newReel);
      return res.status(201).json({ success: true, reel: created });
    } catch (e) {
      const fallback = { _id: `reel-${Date.now()}`, ...newReel };
      MOCK_REELS.unshift(fallback);
      return res.status(201).json({ success: true, reel: fallback });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReel = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      productPrice: Number(req.body.productPrice) || 99
    };

    let updated;
    try {
      updated = await Reel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    } catch (e) {
      MOCK_REELS = MOCK_REELS.map(r => r._id === req.params.id ? { ...r, ...updateData } : r);
      updated = { _id: req.params.id, ...updateData };
    }

    res.json({ success: true, reel: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReel = async (req, res) => {
  try {
    try {
      await Reel.findByIdAndDelete(req.params.id);
    } catch (e) {}

    MOCK_REELS = MOCK_REELS.filter(r => String(r._id) !== String(req.params.id));
    res.json({ success: true, message: 'Reel deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
