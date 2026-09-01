import express from 'express';
import {
  trackSession,
  heartbeat,
  getAnalytics,
  getLiveView,
  getReportCatalogue,
  markReportViewed
} from '../controllers/analyticsController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: the storefront announces a visit, then keeps saying it's still open.
router.post('/track', trackSession);
router.post('/heartbeat', heartbeat);

// Admin: the reports built from those visits.
router.get('/reports', protect, requireAdmin, getAnalytics);
router.get('/live', protect, requireAdmin, getLiveView);
router.get('/catalogue', protect, requireAdmin, getReportCatalogue);
router.post('/catalogue/:id/viewed', protect, requireAdmin, markReportViewed);

export default router;
