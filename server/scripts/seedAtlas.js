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
    console.log('\n⚠️  Notice: MONGO_URI in server/.env is currently local.');
    console.log('To seed your MongoDB Atlas Cloud database:');
    console.log('1. Set MONGO_URI in server/.env or pass it as an environment variable.');
    console.log('2. Run: npm run seed:atlas\n');
  }

  console.log(`Connecting to MongoDB...`);
  
  try {
    await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/nuva_fresh_db');
    console.log('✅ Successfully connected to MongoDB Atlas / Database!');

    // 1. Seed Users (De-duplicated)
    console.log('\n[1/7] Seeding Users...');
    await User.deleteMany({});
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    const userMap = new Map();

    userMap.set('admin@thenuva.com', {
      name: 'Nuva Super Admin',
      email: 'admin@thenuva.com',
      password: hashedAdminPassword,
      role: 'admin',
      phone: '+91 92277 25359',
      addresses: [{ street: '4th Floor, Pancham Icon', city: 'Vadodara', state: 'Gujarat', postalCode: '390007' }]
    });

    CUSTOMERS_STORE.forEach(c => {
      if (!userMap.has(c.email.toLowerCase())) {
        userMap.set(c.email.toLowerCase(), {
          name: c.name,
          email: c.email.toLowerCase(),
          password: hashedUserPassword,
          role: 'customer',
          phone: c.phone || '+91 98250 12345',
          addresses: [{ street: c.city || 'Vadodara Hub', city: c.city || 'Vadodara', state: c.state || 'Gujarat', postalCode: '390007' }]
        });
      }
    });

    const insertedUsers = await User.insertMany(Array.from(userMap.values()));
    console.log(`✅ ${insertedUsers.length} Users seeded into 'users' collection.`);

    // 2. Seed Products
    console.log('\n[2/7] Seeding 70+ Organic & Ozone Products...');
    const productsJsonPath = path.resolve(__dirname, '../data/csvProducts.json');
    let insertedProducts = [];
    if (fs.existsSync(productsJsonPath)) {
      const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
      await Product.deleteMany({});
      
      const formattedProducts = productsData.map((p, idx) => {
        const cleanTitle = p.title || `Organic Produce ${idx + 1}`;
        const baseSlug = (p.handle || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '');
        const finalPrice = p.variants?.[0]?.price || p.price || 199;
        
        return {
          title: cleanTitle,
          slug: `${baseSlug}-${idx + 1}`,
          description: p.bodyHtml || p.description || `${cleanTitle} - 100% Ozone Purified, Zero Chemical Residue.`,
          price: finalPrice,
          discountedPrice: p.variants?.[0]?.compareAtPrice || p.compareAtPrice || Math.round(finalPrice * 0.9),
          sku: p.variants?.[0]?.sku || `NUV-${Math.floor(1000 + Math.random() * 9000)}`,
          category: p.category || 'Fresh Produce',
          stock: p.inventory || 50,
          unit: p.unit || '500g',
          images: p.images?.map(img => typeof img === 'string' ? img : img.src) || [p.image || '/images/fresh-produce.png'],
          isOzoneWashed: true,
          isFeatured: Boolean(p.isFeatured || idx < 8),
          isBestseller: Boolean(p.isBestseller || idx < 4)
        };
      });

      insertedProducts = await Product.insertMany(formattedProducts);
      console.log(`✅ ${insertedProducts.length} Products seeded into 'products' collection.`);
    }

    // 3. Seed Orders & Tracking Stages
    console.log('\n[3/7] Seeding Live Orders & Telemetry Stages...');
    await Order.deleteMany({});
    const sampleProduct = insertedProducts[0] || { _id: new mongoose.Types.ObjectId(), title: 'Organic Spinach', price: 99 };

    const ordersToInsert = ORDERS_STORE.map(o => ({
      user: insertedUsers[1]?._id || null,
      items: (o.items && o.items.length > 0) 
        ? o.items.map(it => ({
            product: sampleProduct._id,
            title: it.title || 'Organic Item',
            quantity: it.quantity || 1,
            price: it.price || 199
          }))
        : [{ product: sampleProduct._id, title: sampleProduct.title, quantity: 1, price: sampleProduct.price }],
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
      },
      deliveryAddress: {
        street: o.deliveryAddress?.street || '4th Floor, Pancham Icon',
        city: o.deliveryAddress?.city || 'Vadodara',
        state: o.deliveryAddress?.state || 'Gujarat',
        postalCode: o.deliveryAddress?.postalCode || '390007'
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
      { code: 'WELCOME10', type: 'percentage', value: 10, minOrderValue: 299, status: 'Active' },
      { code: 'PURITY15', type: 'percentage', value: 15, minOrderValue: 599, status: 'Active' },
      { code: 'FREESHIP', type: 'flat', value: 40, minOrderValue: 499, status: 'Active' },
      { code: 'OZONE20', type: 'percentage', value: 20, minOrderValue: 999, status: 'Active' }
    ];
    await Coupon.insertMany(couponsToInsert);
    console.log(`✅ ${couponsToInsert.length} Coupons seeded into 'coupons' collection.`);

    // 6. Seed Reels & Stories
    console.log('\n[6/7] Seeding 3D Reels...');
    await Reel.deleteMany({});
    const reelsToInsert = [
      { title: '4-Stage Ozone Wash Live Demo', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vegetables-in-water-41221-large.mp4', isFeatured: true },
      { title: 'Sunrise Harvest from Gujarat Farms', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-field-at-sunset-41484-large.mp4', isFeatured: true },
      { title: 'Pure Vedic Bilona Ghee Making', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-pouring-liquid-butter-into-a-jar-42352-large.mp4', isFeatured: true }
    ];
    await Reel.insertMany(reelsToInsert);
    console.log(`✅ ${reelsToInsert.length} Reels seeded into 'reels' collection.`);

    // 7. Seed Testimonials
    console.log('\n[7/7] Seeding Testimonials...');
    await Testimonial.deleteMany({});
    const testimonialsToInsert = [
      { author: 'Dr. Shirali Shah', city: 'Vadodara', quote: 'The aqueous ozone washing is a clinical game changer. 0.00 PPM chemical residue is evident in the crisp taste.', rating: 5, status: 'Published' },
      { author: 'Minal Parekh', city: 'Ahmedabad', quote: 'The A2 Gir Cow Ghee and fresh spinach stay fresh in the fridge for over 10 days! Remarkable purity.', rating: 5, status: 'Published' },
      { author: 'Amit Desai', city: 'Surat', quote: 'We source all our B2B commercial kitchen ingredients from Nuva. Reliability and quality are unmatched.', rating: 5, status: 'Published' }
    ];
    await Testimonial.insertMany(testimonialsToInsert);
    console.log(`✅ ${testimonialsToInsert.length} Testimonials seeded into 'testimonials' collection.`);

    console.log('\n======================================================');
    console.log('🎉 ALL PROJECT DATA SUCCESSFULLY SEEDED IN DATABASE!');
    console.log('======================================================');
    console.log('Collections populated:');
    console.log('• users (Super Admin & Customers)');
    console.log('• products (70+ Organic & Ozone Produce)');
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
