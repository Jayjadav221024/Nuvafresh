import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  updateOrderTracking,
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
  .delete(deleteOrder);

// Admin order status & tracking updates
router.route('/:id/status')
  .put(updateOrderStatus);

router.route('/:id/track')
  .put(updateOrderTracking);

export default router;

