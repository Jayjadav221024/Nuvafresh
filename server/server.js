import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { ensureAdminExists } from './controllers/authController.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reelRoutes from './routes/reelRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB & ensure admin account is ready
connectDB().then(() => {
  ensureAdminExists();
});

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'The Nuva - O3 Fresh Produce API Engine',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build on Render / production
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Nuva Server Active]: REST API running on http://localhost:${PORT}`);
});
