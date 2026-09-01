import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { ORDERS_STORE, addOrderToStore, updateOrderInStore, deleteOrderFromStore } from '../utils/store.js';
import { attachOrderToSession } from './analyticsController.js';

/* ── Checkout side effects ──
   A placed order has to move the same numbers the admin reads back, or the
   inventory screen and the discount usage counter drift away from reality.
   Both are best-effort: a bookkeeping failure must never lose the order. */
const commitInventory = async (items = []) => {
  await Promise.all(
    items.map(async (item) => {
      const id = item.product || item.productId || item._id;
      const quantity = Number(item.quantity) || 0;
      if (!id || quantity <= 0 || !/^[0-9a-fA-F]{24}$/.test(String(id))) return;

      try {
        // Floor at zero so an oversell cannot push stock negative.
        await Product.updateOne(
          { _id: id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } }
        );
      } catch (e) { /* product missing or db offline — order still stands */ }
    })
  );
};

const commitCouponUse = async (code) => {
  if (!code) return;
  try {
    await Coupon.updateOne({ code: String(code).toUpperCase().trim() }, { $inc: { usedCount: 1 } });
  } catch (e) { /* discount removed since checkout — nothing to count */ }
};

/* ── Derived order attributes ──
   Everything below is computed from data the checkout already collects,
   so the admin never displays a number nobody actually recorded. */
const assessRisk = (order, priorOrderCount) => {
  const reasons = [];
  if (order.paymentStatus === 'Pending') reasons.push('payment is not captured yet');
  if (priorOrderCount === 0) reasons.push('first order from this customer');
  if ((order.totalAmount || 0) > 5000) reasons.push('order value is unusually high');
  if (!order.deliveryAddress?.postalCode) reasons.push('delivery address is incomplete');

  if (reasons.length >= 3) return { riskLevel: 'High', riskReason: `Review before fulfilling: ${reasons.join(', ')}.` };
  if (reasons.length >= 1) return { riskLevel: 'Medium', riskReason: `Worth a check: ${reasons.join(', ')}.` };
  return { riskLevel: 'Low', riskReason: 'Chargeback risk is low. You can fulfill this order.' };
};

export const createOrder = async (req, res) => {
  try {
    const items = req.body.items || [];
    const subtotal = req.body.subtotal
      ?? items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    const shippingCost = Number(req.body.shippingCost) || 0;
    const totalAmount = req.body.totalAmount || subtotal + shippingCost;

    // GST is inclusive on Nuva pricing, so back it out of the total rather
    // than adding it on top.
    const taxRate = 0.05;
    const taxAmount = Math.round((totalAmount * taxRate / (1 + taxRate)) * 100) / 100;

    const customer = {
      name: req.body.deliveryAddress?.name || req.user?.name || 'Customer',
      email: req.user?.email || req.body.deliveryAddress?.email || 'customer@example.com',
      phone: req.body.deliveryAddress?.phone || req.user?.phone || '+91 92277 25359'
    };

    let priorOrderCount = 0;
    try {
      priorOrderCount = await Order.countDocuments({ 'user.email': customer.email });
    } catch (e) { /* offline — treat as a first order */ }

    const paymentStatus = req.body.paymentMethod === 'COD' ? 'Pending' : 'Completed';

    const orderData = {
      user: customer,
      items,
      subtotal,
      shippingCost,
      shippingMethod: req.body.shippingMethod || 'Local Delivery',
      taxAmount,
      taxLabel: 'CGST/SGST 5%',
      taxIncluded: true,
      totalAmount,
      amountPaid: paymentStatus === 'Completed' ? totalAmount : 0,
      discountApplied: req.body.discountApplied || 0,
      discountCode: req.body.discountCode || '',
      channel: req.body.channel || 'Online Store',
      paymentStatus,
      paymentMethod: req.body.paymentMethod || 'UPI Instant QR Pay',
      transactionId: req.body.transactionId,
      utrNumber: req.body.utrNumber,
      orderStatus: 'Placed',
      fulfillmentStatus: 'Unfulfilled',
      deliveryAddress: req.body.deliveryAddress,
      billingSameAsShipping: req.body.billingSameAsShipping !== false,
      billingAddress: req.body.billingAddress,
      customerNote: req.body.customerNote || '',
      // A manually created order carries whatever tags the merchant typed on
      // the create screen; the storefront checkout simply sends none.
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      additionalDetails: {
        dueDate: req.body.deliveryDate || '',
        dueTime: req.body.deliverySlot || '',
        fulfillmentType: req.body.fulfillmentType || 'Pickup / Delivery',
        slotBookedAt: new Date()
      },
      timeline: [
        {
          kind: 'system',
          message: `${customer.name} placed this order on ${req.body.channel || 'Online Store'}.`,
          author: customer.name
        },
        ...(paymentStatus === 'Completed'
          ? [{
              kind: 'payment',
              message: `A ₹${Number(totalAmount).toFixed(2)} INR payment was processed by ${req.body.paymentMethod || 'UPI Instant QR Pay'}.`,
              author: 'System'
            }]
          : [{
              kind: 'payment',
              message: 'Payment is pending — this order is cash on delivery.',
              author: 'System'
            }])
      ]
    };

    Object.assign(orderData, assessRisk(orderData, priorOrderCount));

    let createdOrder = null;
    try {
      createdOrder = await Order.create(orderData);
    } catch (dbErr) {
      // MongoDB offline fallback
    }

    const savedOrder = addOrderToStore(createdOrder ? createdOrder.toObject() : orderData);

    await Promise.all([
      commitInventory(items),
      commitCouponUse(orderData.discountCode),
      // Credits the sale to whatever brought this visit in. Best-effort: an
      // untracked checkout is simply an unattributed order.
      attachOrderToSession(req.body.sessionId, savedOrder).catch(() => {})
    ]);

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

/* Merchant edits from the order detail screen: notes, tags, delivery slot,
   archive state. Money and line items are deliberately not editable here. */
export const updateOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = [
      'staffNote', 'customerNote', 'tags', 'additionalDetails',
      'archived', 'riskLevel', 'billingSameAsShipping', 'billingAddress'
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const updated = updateOrderInStore(id, updates);

    try {
      const order = await Order.findById(id);
      if (order) {
        Object.assign(order, updates);
        await order.save();
        return res.json({ success: true, order });
      }
    } catch (e) { /* fall through to the in-memory copy */ }

    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addOrderTimelineEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'A comment is required' });
    }

    const entry = {
      kind: 'comment',
      message: message.trim(),
      author: req.user?.name || 'Administrator',
      createdAt: new Date()
    };

    try {
      const order = await Order.findById(id);
      if (order) {
        order.timeline.unshift(entry);
        await order.save();
        return res.json({ success: true, order });
      }
    } catch (e) { /* fall through */ }

    const memory = ORDERS_STORE.find((o) => String(o._id).toLowerCase() === String(id).toLowerCase());
    if (!memory) return res.status(404).json({ success: false, message: 'Order not found' });
    memory.timeline = [entry, ...(memory.timeline || [])];
    res.json({ success: true, order: memory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Mark items fulfilled / delivered, appending the matching timeline events
   so the feed reflects what actually happened. */
export const fulfillOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'Ready for delivery', location = 'Vadodara', carrier, trackingNumber, note } = req.body;

    const now = new Date();
    const events = [];

    try {
      const order = await Order.findById(id);
      if (!order) throw new Error('not in db');

      const itemCount = order.items?.length || 0;
      let fulfillment = order.fulfillments?.[0];

      if (!fulfillment) {
        order.fulfillments.push({
          reference: `${order.orderNumber || 'NUVA'}-F1`,
          location,
          status,
          carrier,
          trackingNumber,
          note,
          itemIndexes: order.items.map((_, i) => i)
        });
        fulfillment = order.fulfillments[0];
      } else {
        Object.assign(fulfillment, { location, status, carrier, trackingNumber, note });
      }

      if (status === 'Delivered') {
        fulfillment.deliveredAt = now;
        order.orderStatus = 'Delivered';
        order.fulfillmentStatus = 'Fulfilled';
        events.push({ kind: 'fulfillment', message: `You marked ${itemCount} item${itemCount === 1 ? '' : 's'} as delivered.`, author: req.user?.name || 'Administrator' });
      } else if (status === 'Out for delivery') {
        order.orderStatus = 'Out for Delivery';
        order.fulfillmentStatus = 'Fulfilled';
        events.push({ kind: 'fulfillment', message: `You marked ${itemCount} item${itemCount === 1 ? '' : 's'} as fulfilled from ${location}.`, author: req.user?.name || 'Administrator' });
      } else {
        order.orderStatus = 'Dispatched';
        events.push({ kind: 'fulfillment', message: `You marked ${itemCount} item${itemCount === 1 ? '' : 's'} as ready for delivery.`, author: req.user?.name || 'Administrator' });
      }

      order.timeline.unshift(...events.map((e) => ({ ...e, createdAt: now })));
      await order.save();
      return res.json({ success: true, order });
    } catch (e) {
      const memory = ORDERS_STORE.find((o) => String(o._id).toLowerCase() === String(id).toLowerCase());
      if (!memory) return res.status(404).json({ success: false, message: 'Order not found' });

      const itemCount = memory.items?.length || 0;
      memory.fulfillments = [{
        reference: `${memory.orderNumber || memory._id}-F1`,
        location, status, carrier, trackingNumber, note,
        deliveredAt: status === 'Delivered' ? now : undefined,
        itemIndexes: (memory.items || []).map((_, i) => i)
      }];
      memory.fulfillmentStatus = status === 'Ready for delivery' ? 'Unfulfilled' : 'Fulfilled';
      memory.orderStatus = status === 'Delivered' ? 'Delivered' : status === 'Out for delivery' ? 'Out for Delivery' : 'Dispatched';
      memory.timeline = [
        { kind: 'fulfillment', message: `You marked ${itemCount} item${itemCount === 1 ? '' : 's'} as ${status.toLowerCase()}.`, author: 'Administrator', createdAt: now },
        ...(memory.timeline || [])
      ];
      return res.json({ success: true, order: memory });
    }
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

