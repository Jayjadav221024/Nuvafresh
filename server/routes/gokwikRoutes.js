import express from 'express';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  getPublicConfig,
  getAdminConfig,
  updateAdminConfig,
  testConnection,
  getGoKwikStats,
  getGoKwikOrders,
  getGoKwikOrderDetail,
  getGoKwikAnalytics,
  getWebhookEvents,
  getGoKwikLogs,
  handleWebhook
} from '../controllers/gokwikController.js';

const router = express.Router();

// Public Storefront Configuration Check (No secrets returned)
router.get('/public-config', getPublicConfig);

// Inbound GoKwik Webhook Receiver (Public / Signature-authenticated)
router.post('/webhook', handleWebhook);

// Admin-Protected GoKwik Management Endpoints
router.use(protect);
router.use(requireAdmin);

// Dashboard Overview KPIs
router.get('/stats', getGoKwikStats);

// Settings Configuration CRUD & Test Connection
router.get('/config', getAdminConfig);
router.put('/config', updateAdminConfig);
router.post('/test-connection', testConnection);

// GoKwik Orders Management
router.get('/orders', getGoKwikOrders);
router.get('/orders/:id', getGoKwikOrderDetail);

// Analytics
router.get('/analytics', getGoKwikAnalytics);

// Webhook Auditing
router.get('/webhooks', getWebhookEvents);

// Activity Logs
router.get('/logs', getGoKwikLogs);

export default router;
