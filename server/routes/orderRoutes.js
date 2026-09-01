import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderTracking,
  updateOrderDetails,
  addOrderTimelineEntry,
  fulfillOrder,
  deleteOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Order creation & listing
router.route('/')
  .post(createOrder)
  .get(getOrders);

// Public Order Tracking by ID
router.route('/track/:id')
  .get(getOrderById);

router.route('/:id')
  .get(getOrderById)
  .put(updateOrderDetails)
  .delete(deleteOrder);

// Admin order status & tracking updates
router.route('/:id/status')
  .put(updateOrderStatus);

router.route('/:id/track')
  .put(updateOrderTracking);

// Order detail screen: fulfillment and the staff timeline
router.route('/:id/fulfill')
  .post(fulfillOrder);

router.route('/:id/timeline')
  .post(addOrderTimelineEntry);

export default router;

