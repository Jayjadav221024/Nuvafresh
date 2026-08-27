import Order from '../models/Order.js';
import { ORDERS_STORE, addOrderToStore, updateOrderInStore, deleteOrderFromStore } from '../utils/store.js';

export const createOrder = async (req, res) => {
  try {
    const orderData = {
      user: {
        name: req.body.deliveryAddress?.name || req.user?.name || 'Customer',
        email: req.user?.email || req.body.deliveryAddress?.email || 'customer@example.com',
        phone: req.body.deliveryAddress?.phone || req.user?.phone || '+91 92277 25359'
      },
      items: req.body.items || [],
      totalAmount: req.body.totalAmount || 0,
      discountApplied: req.body.discountApplied || 0,
      paymentStatus: req.body.paymentMethod === 'COD' ? 'Pending' : 'Completed',
      paymentMethod: req.body.paymentMethod || 'UPI Instant QR Pay',
      transactionId: req.body.transactionId,
      utrNumber: req.body.utrNumber,
      orderStatus: 'Placed',
      deliveryAddress: req.body.deliveryAddress
    };

    let createdOrder = null;
    try {
      createdOrder = await Order.create(orderData);
    } catch (dbErr) {
      // MongoDB offline fallback
    }

    const savedOrder = addOrderToStore(createdOrder ? createdOrder.toObject() : orderData);
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    let orders = [];
    try {
      orders = await Order.find().sort({ createdAt: -1 });
    } catch (e) {}

    if (!orders || orders.length === 0) {
      orders = ORDERS_STORE;
    } else {
      // Merge with in-memory store
      const dbIds = new Set(orders.map(o => o._id.toString()));
      const extra = ORDERS_STORE.filter(o => !dbIds.has(o._id));
      orders = [...orders, ...extra];
    }

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.json({ success: true, count: ORDERS_STORE.length, orders: ORDERS_STORE });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order = ORDERS_STORE.find(o => o._id.toLowerCase() === id.toLowerCase());

    if (!order) {
      try {
        order = await Order.findById(id);
      } catch (e) {}
    }

    if (!order) {
      // Check partial match on order id
      order = ORDERS_STORE.find(o => o._id.toLowerCase().includes(id.toLowerCase()));
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, carrier, trackingNumber, currentLocation, estimatedDelivery, trackingNotes } = req.body;

    const updated = updateOrderInStore(id, {
      orderStatus: status,
      carrier,
      trackingNumber,
      currentLocation,
      estimatedDelivery,
      trackingNotes
    });

    try {
      await Order.findByIdAndUpdate(id, { orderStatus: status });
    } catch (e) {}

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = updateOrderInStore(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteOrderFromStore(id);

    try {
      await Order.findByIdAndDelete(id);
    } catch (e) {}

    res.json({ success: true, message: 'Order deleted successfully', deletedId: id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

