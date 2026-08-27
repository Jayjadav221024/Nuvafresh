import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';
import Reel from '../models/Reel.js';
import Blog from '../models/Blog.js';
import Testimonial from '../models/Testimonial.js';
import FAQ from '../models/FAQ.js';

import { ORDERS_STORE, CUSTOMERS_STORE } from '../utils/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri || mongoUri.includes('127.0.0.1')) {
    console.log('\n⚠️  Notice: MONGO_URI in server/.env is currently local or not set to MongoDB Atlas.');
    console.log('To seed directly into your MongoDB Atlas cloud database:');
    console.log('1. Set MONGO_URI=mongodb+srv://<username>:<password>@cluster0... in server/.env');
    console.log('2. Re-run: npm run seed:atlas\n');
  }

  console.log(`Connecting to MongoDB: ${mongoUri || 'mongodb://127.0.0.1:27017/nuva_fresh_db'}...`);
  
  try {
    await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/nuva_fresh_db');
    console.log('✅ Successfully connected to MongoDB Atlas / Database!');

    // 1. Seed Users
    console.log('\n[1/7] Seeding Users...');
    await User.deleteMany({});
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    const usersToInsert = [
      {
        name: 'Nuva Super Admin',
        email: 'admin@thenuva.com',
        password: hashedAdminPassword,
        role: 'admin',
        phone: '+91 92277 25359',
        city: 'Vadodara',
        state: 'Gujarat'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: hashedUserPassword,
        role: 'customer',
        phone: '+91 98250 12345',
        city: 'Vadodara',
        state: 'Gujarat'
      },
      ...CUSTOMERS_STORE.map(c => ({
        name: c.name,
        email: c.email,
        password: hashedUserPassword,
        role: 'customer',
        phone: c.phone,
        city: c.city,
        state: c.state
      }))
    ];
    await User.insertMany(usersToInsert);
    console.log(`✅ ${usersToInsert.length} Users seeded into 'users' collection.`);

    // 2. Seed Products
    console.log('\n[2/7] Seeding 70+ Organic & Ozone Products...');
    const productsJsonPath = path.resolve(__dirname, '../data/csvProducts.json');
    if (fs.existsSync(productsJsonPath)) {
      const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
      await Product.deleteMany({});
      
      const formattedProducts = productsData.map((p) => ({
        title: p.title,
        handle: p.handle || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: p.bodyHtml || p.description || `${p.title} - 100% Ozone Purified, Zero Chemical Residue.`,
        price: p.variants?.[0]?.price || p.price || 199,
        compareAtPrice: p.variants?.[0]?.compareAtPrice || p.compareAtPrice || (p.price ? p.price * 1.2 : 249),
        sku: p.variants?.[0]?.sku || `NUV-${Math.floor(1000 + Math.random() * 9000)}`,
        category: p.category || 'Fresh Produce',
        tags: p.tags || ['Ozone Washed', 'Chemical Free', '100% Organic'],
        image: p.images?.[0]?.src || p.image || '/images/fresh-produce.png',
        images: p.images?.map(img => typeof img === 'string' ? img : img.src) || [p.image || '/images/fresh-produce.png'],
        unit: p.unit || '500g',
        inventory: p.inventory || 50,
        isOzoneWashed: true,
        isFeatured: Boolean(p.isFeatured || Math.random() > 0.6),
        isBestseller: Boolean(p.isBestseller || Math.random() > 0.7),
        chemicalResiduePpm: 0.00
      }));

      await Product.insertMany(formattedProducts);
      console.log(`✅ ${formattedProducts.length} Products seeded into 'products' collection.`);
    }

    // 3. Seed Orders & Tracking Stages
    console.log('\n[3/7] Seeding Live Orders & Telemetry Stages...');
    await Order.deleteMany({});
    const ordersToInsert = ORDERS_STORE.map(o => ({
      _id: o._id.startsWith('NUV-') ? new mongoose.Types.ObjectId() : o._id,
      user: null,
      items: o.items || [],
      shippingAddress: {
        fullName: o.customer?.name || o.deliveryAddress?.name || 'Customer',
        address: o.deliveryAddress?.street || '4th Floor, Pancham Icon',
        city: o.deliveryAddress?.city || 'Vadodara',
        state: o.deliveryAddress?.state || 'Gujarat',
        postalCode: o.deliveryAddress?.postalCode || '390007',
        phone: o.customer?.phone || o.deliveryAddress?.phone || '+91 92277 25359'
      },
      totalAmount: o.totalAmount || 1240,
      paymentMethod: o.paymentMethod || 'UPI QR Instant Pay',
      paymentStatus: o.paymentStatus || 'Paid',
      orderStatus: o.status || 'Dispatched',
      currentStage: o.currentStage || 4,
      tracking: o.tracking || {
        currentLocation: 'Express Highway Corridor',
        carrier: 'Nuva Sunrise Eco-EV Fleet',
        trackingNumber: 'TRK-NUV-' + Math.floor(100000 + Math.random() * 900000),
        estimatedDelivery: 'Tomorrow morning before 10:00 AM'
      }
    }));
    await Order.insertMany(ordersToInsert);
    console.log(`✅ ${ordersToInsert.length} Orders seeded into 'orders' collection.`);

    // 4. Seed Categories
    console.log('\n[4/7] Seeding Categories...');
    await Category.deleteMany({});
    const categoriesToInsert = [
      { name: 'Fresh Produce', slug: 'fresh-produce', description: 'Farm fresh ozone-washed vegetables and fruits', icon: 'Leaf' },
      { name: 'A2 Ghee', slug: 'a2-ghee', description: 'Pure Vedic Bilona Gir Cow Ghee in glass jars', icon: 'Milk' },
      { name: 'Cold-Pressed Oils', slug: 'cold-pressed-oils', description: 'Wood churned authentic kachi ghani oils', icon: 'Droplets' },
      { name: 'Grains & Staples', slug: 'grains-staples', description: 'Unpolished native heritage millets & grains', icon: 'Wheat' },
      { name: 'Pulses & Lentils', slug: 'pulses-lentils', description: 'Chemical-free unpolished dal', icon: 'Layers' },
      { name: 'Healthy Sweeteners', slug: 'healthy-sweeteners', description: 'Organic raw honey & natural jaggery', icon: 'Sparkles' },
      { name: 'Spices & Seasonings', slug: 'spices-seasonings', description: 'Single-origin stone ground whole spices', icon: 'Flame' }
    ];
    await Category.insertMany(categoriesToInsert);
    console.log(`✅ ${categoriesToInsert.length} Categories seeded into 'categories' collection.`);

    // 5. Seed Promo Coupons
    console.log('\n[5/7] Seeding Discount Coupons...');
    await Coupon.deleteMany({});
    const couponsToInsert = [
      { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minPurchase: 299, isActive: true },
      { code: 'PURITY15', discountType: 'percentage', discountValue: 15, minPurchase: 599, isActive: true },
      { code: 'FREESHIP', discountType: 'fixed', discountValue: 40, minPurchase: 499, isActive: true },
      { code: 'OZONE20', discountType: 'percentage', discountValue: 20, minPurchase: 999, isActive: true }
    ];
    await Coupon.insertMany(couponsToInsert);
    console.log(`✅ ${couponsToInsert.length} Coupons seeded into 'coupons' collection.`);

    // 6. Seed Reels & Stories
    console.log('\n[6/7] Seeding 3D Reels...');
    await Reel.deleteMany({});
    const reelsToInsert = [
      { title: '4-Stage Ozone Wash Live Demo', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vegetables-in-water-41221-large.mp4', views: '14.2k', likes: '1.8k' },
      { title: 'Sunrise Harvest from Gujarat Farms', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-field-at-sunset-41484-large.mp4', views: '28.9k', likes: '3.4k' },
      { title: 'Pure Vedic Bilona Ghee Making', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-pouring-liquid-butter-into-a-jar-42352-large.mp4', views: '19.5k', likes: '2.9k' }
    ];
    await Reel.insertMany(reelsToInsert);
    console.log(`✅ ${reelsToInsert.length} Reels seeded into 'reels' collection.`);

    // 7. Seed Testimonials & FAQs
    console.log('\n[7/7] Seeding Testimonials & FAQs...');
    await Testimonial.deleteMany({});
    const testimonialsToInsert = [
      { name: 'Dr. Shirali Shah', role: 'Clinical Nutritionist, Vadodara', rating: 5, comment: 'The aqueous ozone washing is a clinical game changer. 0.00 PPM chemical residue is evident in the crisp taste.', isApproved: true },
      { name: 'Minal Parekh', role: 'Organic Food Enthusiast', rating: 5, comment: 'The A2 Gir Cow Ghee and fresh spinach stay fresh in the fridge for over 10 days! Remarkable purity.', isApproved: true },
      { name: 'Amit Desai', role: 'Head Chef, Vadodara Kitchen', rating: 5, comment: 'We source all our B2B commercial kitchen ingredients from Nuva. Reliability and quality are unmatched.', isApproved: true }
    ];
    await Testimonial.insertMany(testimonialsToInsert);
    console.log(`✅ ${testimonialsToInsert.length} Testimonials seeded.`);

    console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY SEEDED IN MONGODB ATLAS!');
    console.log('You can now open MongoDB Atlas Cloud Dashboard and view all seeded collections:');
    console.log('• users (Customers & Admins)');
    console.log('• products (70+ Catalog Produce)');
    console.log('• orders (Live Tracking & Doorstep Stages)');
    console.log('• categories');
    console.log('• coupons');
    console.log('• reels');
    console.log('• testimonials\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
};

seedDatabase();
