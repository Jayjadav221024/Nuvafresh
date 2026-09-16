import GoKwikConfig from '../models/GoKwikConfig.js';
import GoKwikOrder from '../models/GoKwikOrder.js';
import GoKwikWebhookEvent from '../models/GoKwikWebhookEvent.js';
import GoKwikLog from '../models/GoKwikLog.js';
import {
  getGoKwikConfig,
  testGoKwikConnection,
  verifyWebhookSignature,
  processWebhook,
  logGoKwikActivity
} from '../services/gokwikService.js';

/**
 * Public Config for Storefront Checkout check
 * NEVER returns secrets or sensitive keys
 */
export const getPublicConfig = async (req, res) => {
  try {
    const config = await getGoKwikConfig();
    res.json({
      success: true,
      enabled: Boolean(config.isCheckoutEnabled && config.merchantId && config.apiKey),
      merchantId: config.merchantId || '',
      environment: config.environment || 'sandbox',
      cod: config.cod || {},
      rto: config.rto || {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Admin Config (API Secret masked for security)
 */
export const getAdminConfig = async (req, res) => {
  try {
    const config = await getGoKwikConfig();
    const configObj = config.toObject ? config.toObject() : { ...config };

    // Mask API Secret if present
    const hasSecret = Boolean(configObj.apiSecret && configObj.apiSecret.length > 0);
    configObj.hasApiSecret = hasSecret;
    configObj.apiSecretMasked = hasSecret
      ? '••••••••••••••••' + (configObj.apiSecret.length > 4 ? configObj.apiSecret.slice(-4) : '')
      : '';
    delete configObj.apiSecret; // Never send real secret in response

    res.json({ success: true, config: configObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Admin Config
 */
export const updateAdminConfig = async (req, res) => {
  try {
    const {
      merchantId,
      apiKey,
      apiSecret,
      environment,
      isCheckoutEnabled,
      cod,
      rto,
      webhookSecret
    } = req.body;

    let config = await GoKwikConfig.findOne();
    if (!config) {
      config = new GoKwikConfig();
    }

    if (merchantId !== undefined) config.merchantId = merchantId.trim();
    if (apiKey !== undefined) config.apiKey = apiKey.trim();
    // Only update apiSecret if new one is provided and not the masked placeholder
    if (apiSecret && !apiSecret.includes('••••')) {
      config.apiSecret = apiSecret.trim();
    }
    if (environment !== undefined) config.environment = environment;
    if (isCheckoutEnabled !== undefined) config.isCheckoutEnabled = isCheckoutEnabled;
    if (cod !== undefined) config.cod = { ...config.cod, ...cod };
    if (rto !== undefined) config.rto = { ...config.rto, ...rto };
    if (webhookSecret !== undefined) config.webhookSecret = webhookSecret.trim();

    await config.save();

    await logGoKwikActivity({
      event: 'Configuration Updated',
      type: 'CONFIG_CHANGE',
      status: 'Success',
      details: 'GoKwik settings updated by administrator',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      author: req.user?.name || 'Admin'
    });

    const configObj = config.toObject();
    configObj.hasApiSecret = Boolean(configObj.apiSecret);
    configObj.apiSecretMasked = configObj.apiSecret ? '••••••••••••••••' : '';
    delete configObj.apiSecret;

    res.json({
      success: true,
      message: 'GoKwik configuration updated successfully.',
      config: configObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Test Connection Endpoint
 */
export const testConnection = async (req, res) => {
  try {
    const { merchantId, apiKey, apiSecret, environment } = req.body;
    let configOverride = null;

    if (merchantId || apiKey || apiSecret) {
      const existing = await getGoKwikConfig();
      configOverride = {
        merchantId: merchantId || existing.merchantId,
        apiKey: apiKey || existing.apiKey,
        apiSecret: (apiSecret && !apiSecret.includes('••••')) ? apiSecret : existing.apiSecret,
        environment: environment || existing.environment
      };
    }

    const result = await testGoKwikConnection(
      configOverride,
      req.ip || '',
      req.user?.name || 'Admin'
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GoKwik Overview Statistics (Real database aggregated numbers)
 */
export const getGoKwikStats = async (req, res) => {
  try {
    const config = await getGoKwikConfig();

    const [totalOrders, paidOrders, codOrders, failedOrders] = await Promise.all([
      GoKwikOrder.countDocuments(),
      GoKwikOrder.countDocuments({ paymentStatus: 'Paid' }),
      GoKwikOrder.countDocuments({ paymentMethod: 'COD' }),
      GoKwikOrder.countDocuments({ paymentStatus: 'Failed' })
    ]);

    const prepaidOrders = await GoKwikOrder.countDocuments({
      paymentMethod: { $ne: 'COD' },
      paymentStatus: 'Paid'
    });

    const rtoOrders = await GoKwikOrder.countDocuments({ orderStatus: 'RTO' });

    // Aggregate Revenue
    const revenueAgg = await GoKwikOrder.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Derived Rates
    const paymentSuccessRate = totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0;
    const codConversionRate = codOrders > 0 ? Math.round(((codOrders - rtoOrders) / codOrders) * 100) : 0;
    const rtoRate = totalOrders > 0 ? Number(((rtoOrders / totalOrders) * 100).toFixed(1)) : 0;

    // Determine Status
    let connectionStatus = 'Not Connected';
    if (config.merchantId && config.apiKey && config.apiSecret) {
      connectionStatus = config.lastConnectionTest?.status === 'Success' ? 'Connected' : 'Configuration Required';
    }

    const recentOrders = await GoKwikOrder.find().sort({ createdAt: -1 }).limit(5).lean();

    res.json({
      success: true,
      status: connectionStatus,
      isCheckoutEnabled: config.isCheckoutEnabled,
      environment: config.environment,
      metrics: {
        totalOrders,
        prepaidOrders,
        codOrders,
        failedOrders,
        paymentSuccessRate: totalOrders > 0 ? `${paymentSuccessRate}%` : 'No data available',
        codConversionRate: codOrders > 0 ? `${codConversionRate}%` : 'No data available',
        rtoRate: totalOrders > 0 ? `${rtoRate}%` : 'No data available',
        totalRevenue,
        hasData: totalOrders > 0
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Paginated GoKwik Orders with Search & Filter
 */
export const getGoKwikOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const paymentStatus = req.query.paymentStatus || '';
    const paymentMethod = req.query.paymentMethod || '';
    const riskLevel = req.query.riskLevel || '';

    const query = {};

    if (search) {
      query.$or = [
        { gokwikOrderId: { $regex: search, $options: 'i' } },
        { merchantOrderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod.toUpperCase();
    }
    if (riskLevel && riskLevel !== 'all') {
      query['rtoRiskScore.level'] = riskLevel;
    }

    const total = await GoKwikOrder.countDocuments(query);
    const orders = await GoKwikOrder.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Specific GoKwik Order Details
 */
export const getGoKwikOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await GoKwikOrder.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { gokwikOrderId: id }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'GoKwik order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Analytics for Time Ranges (Today, 7D, 30D, 90D)
 */
export const getGoKwikAnalytics = async (req, res) => {
  try {
    const range = req.query.range || '7d';
    let days = 7;
    if (range === 'today') days = 1;
    if (range === '30d') days = 30;
    if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const orders = await GoKwikOrder.find({ createdAt: { $gte: startDate } }).lean();

    const totalOrders = orders.length;
    const successfulOrders = orders.filter((o) => o.paymentStatus === 'Paid');
    const failedOrders = orders.filter((o) => o.paymentStatus === 'Failed');
    const codOrders = orders.filter((o) => o.paymentMethod === 'COD');
    const prepaidOrders = orders.filter((o) => o.paymentMethod !== 'COD' && o.paymentStatus === 'Paid');

    const totalRevenue = successfulOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = successfulOrders.length > 0 ? Math.round(totalRevenue / successfulOrders.length) : 0;
    const successRate = totalOrders > 0 ? Math.round((successfulOrders.length / totalOrders) * 100) : 0;

    // Timeline distribution
    const daysArray = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayOrders = orders.filter((o) => {
        const at = new Date(o.createdAt);
        return at >= d && at < nextD;
      });

      return {
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.totalAmount, 0)
      };
    });

    res.json({
      success: true,
      summary: {
        totalOrders,
        successfulPayments: successfulOrders.length,
        failedPayments: failedOrders.length,
        codOrders: codOrders.length,
        prepaidOrders: prepaidOrders.length,
        totalRevenue,
        averageOrderValue,
        successRate: `${successRate}%`
      },
      timeline: daysArray
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Webhook History & Events
 */
export const getWebhookEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;

    const total = await GoKwikWebhookEvent.countDocuments();
    const events = await GoKwikWebhookEvent.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const lastEvent = await GoKwikWebhookEvent.findOne().sort({ createdAt: -1 });
    const lastSuccess = await GoKwikWebhookEvent.findOne({ status: 'Success' }).sort({ createdAt: -1 });
    const lastFailed = await GoKwikWebhookEvent.findOne({ status: 'Failed' }).sort({ createdAt: -1 });

    res.json({
      success: true,
      events,
      total,
      meta: {
        lastReceived: lastEvent?.createdAt || null,
        lastEventName: lastEvent?.eventType || 'None',
        lastSuccessAt: lastSuccess?.createdAt || null,
        lastFailedAt: lastFailed?.createdAt || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get GoKwik Activity Logs
 */
export const getGoKwikLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const type = req.query.type;

    const query = {};
    if (type && type !== 'all') query.type = type;

    const logs = await GoKwikLog.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Handle Inbound Webhooks from GoKwik
 */
export const handleWebhook = async (req, res) => {
  try {
    const config = await getGoKwikConfig();
    const signature = req.headers['x-gokwik-signature'] || req.headers['x-signature'];

    // If webhook secret configured, verify signature
    if (config.webhookSecret && signature) {
      const isValid = verifyWebhookSignature(JSON.stringify(req.body), signature, config.webhookSecret);
      if (!isValid) {
        await logGoKwikActivity({
          event: 'Webhook Signature Verification Failed',
          type: 'ERROR',
          status: 'Failed',
          details: 'Invalid signature received on webhook endpoint',
          ipAddress: req.ip || ''
        });
        return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const result = await processWebhook(req.body, req.headers, req.ip || '');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
