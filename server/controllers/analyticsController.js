import Session from '../models/Session.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ReportView from '../models/ReportView.js';
import { resolveTimezone } from '../data/timezoneAtlas.js';

/* ═══════════════════════════════════════════════════════════════════
   REFERRER CLASSIFICATION
   The referring host decides both the bucket a visit falls in and the
   channel it is credited to — the same rules Shopify's acquisition
   reports use, kept short enough to read in one sitting.
═══════════════════════════════════════════════════════════════════ */
const SEARCH_HOSTS = ['google', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'baidu', 'yandex', 'brave'];
const SOCIAL_HOSTS = ['instagram', 'facebook', 'fb.com', 'youtube', 'twitter', 'x.com', 't.co', 'linkedin', 'pinterest', 'reddit', 'whatsapp', 'threads', 'snapchat', 'tiktok'];
const AI_HOSTS = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'claude.ai', 'copilot.microsoft.com', 'gemini.google.com'];
const EMAIL_HOSTS = ['mail.google.com', 'outlook', 'mail.yahoo', 'zoho'];

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch (e) {
    return '';
  }
};

export const classifyReferrer = (referrer, ownHost = '') => {
  const host = hostOf(referrer);

  if (!host) return { source: 'Direct', channel: 'Direct', host: 'None' };
  if (ownHost && host === String(ownHost).replace(/^www\./, '').toLowerCase()) {
    return { source: 'Direct', channel: 'Direct', host: 'None' };
  }

  // AI before search: gemini.google.com would otherwise read as Google search.
  if (AI_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return { source: 'AI', channel: 'Referral', host };
  }
  if (EMAIL_HOSTS.some((h) => host.includes(h))) {
    return { source: 'Email', channel: 'Email', host };
  }
  if (SEARCH_HOSTS.some((h) => host.includes(h))) {
    // The engine name alone is what the report reads better as.
    const engine = SEARCH_HOSTS.find((h) => host.includes(h));
    return { source: 'Search', channel: 'Organic', host: engine };
  }
  if (SOCIAL_HOSTS.some((h) => host.includes(h))) {
    const network = SOCIAL_HOSTS.find((h) => host.includes(h)).replace('.com', '');
    return { source: 'Social', channel: 'Social', host: network };
  }
  return { source: 'Referral', channel: 'Referral', host };
};

const deviceOf = (userAgent = '') => {
  const ua = String(userAgent).toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return 'Tablet';
  if (/mobi|android|iphone|ipod/.test(ua)) return 'Mobile';
  return 'Desktop';
};

/* MongoDB-offline fallback, matching how orders and transfers behave. */
let SESSIONS_STORE = [];

/* ═══════════════════════════════════════════════════════════════════
   TRACKING
═══════════════════════════════════════════════════════════════════ */
export const trackSession = async (req, res) => {
  try {
    const { sessionId, referrer = '', landingPath = '/', timezone = '' } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required' });
    }

    const ownHost = hostOf(`http://${req.get('host') || ''}`) || '';
    const { source, channel, host } = classifyReferrer(referrer, ownHost);
    const place = resolveTimezone(timezone);

    const record = {
      sessionId: String(sessionId).slice(0, 64),
      source,
      channel,
      host,
      referrer: String(referrer).slice(0, 400),
      landingPath: String(landingPath).slice(0, 200),
      device: deviceOf(req.get('user-agent')),
      timezone: String(timezone).slice(0, 64),
      country: place?.country || '',
      city: place?.city && place.city !== 'Unknown' ? place.city : '',
      lat: place?.lat,
      lng: place?.lng,
      activity: 'Browsing',
      lastSeenAt: new Date()
    };

    try {
      // A reload of the same tab must not count twice.
      await Session.updateOne(
        { sessionId: record.sessionId },
        { $setOnInsert: { ...record, createdAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true });
    } catch (dbErr) {
      // Fall through to the in-memory store.
    }

    if (!SESSIONS_STORE.some((s) => s.sessionId === record.sessionId)) {
      SESSIONS_STORE.unshift({ ...record, orderTotal: 0, createdAt: new Date() });
      SESSIONS_STORE = SESSIONS_STORE.slice(0, 5000);
    }
    res.json({ success: true });
  } catch (e) {
    // Tracking must never break a page load.
    res.json({ success: false });
  }
};

/* ── Heartbeat ──
   The open tab says "still here, and this is what I'm doing". It is what
   makes "visitors right now" a count of live tabs rather than a guess, and
   what fills the checkout funnel on the live view. */
export const heartbeat = async (req, res) => {
  try {
    const { sessionId, activity = 'Browsing', cartValue = 0, timezone = '' } = req.body;
    if (!sessionId) return res.json({ success: false });

    const patch = {
      lastSeenAt: new Date(),
      activity: ['Browsing', 'Cart', 'Checkout', 'Purchased'].includes(activity) ? activity : 'Browsing',
      cartValue: Math.max(0, Number(cartValue) || 0)
    };

    // A tab that started before the atlas knew its zone can still fill it in.
    const place = resolveTimezone(timezone);
    if (place) {
      patch.timezone = String(timezone).slice(0, 64);
      patch.country = place.country;
      patch.lat = place.lat;
      patch.lng = place.lng;
    }

    try {
      await Session.updateOne({ sessionId }, { $set: patch });
      return res.json({ success: true });
    } catch (e) { /* database offline */ }

    const index = SESSIONS_STORE.findIndex((s) => s.sessionId === sessionId);
    if (index !== -1) SESSIONS_STORE[index] = { ...SESSIONS_STORE[index], ...patch };
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
};

/* Called from the order controller when a checkout completes, so a sale can
   be credited to the referrer that brought the visit in. */
export const attachOrderToSession = async (sessionId, order) => {
  if (!sessionId || !order) return;

  const patch = {
    orderId: String(order._id || order.orderNumber || ''),
    orderTotal: Number(order.totalAmount) || 0,
    convertedAt: new Date(),
    activity: 'Purchased',
    cartValue: 0,
    lastSeenAt: new Date(),
    // The delivery address is a better location signal than the timezone, so
    // it wins where both exist.
    city: order.deliveryAddress?.city || '',
    region: order.deliveryAddress?.state || ''
  };

  try {
    const result = await Session.updateOne({ sessionId }, { $set: patch });
    if (result.matchedCount > 0) return;
  } catch (e) { /* database offline */ }

  const index = SESSIONS_STORE.findIndex((s) => s.sessionId === sessionId);
  if (index !== -1) SESSIONS_STORE[index] = { ...SESSIONS_STORE[index], ...patch };
};

/* ═══════════════════════════════════════════════════════════════════
   REPORTING
═══════════════════════════════════════════════════════════════════ */
const RANGES = {
  today: 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': 365
};

const startOfRange = (range) => {
  const days = RANGES[range] ?? RANGES['30d'];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
};

/* Group rows into { label, value } buckets, biggest first. */
const tally = (rows, keyFn, valueFn) => {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (key === null || key === undefined || key === '') continue;
    map.set(key, (map.get(key) || 0) + (valueFn ? valueFn(row) : 1));
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
};

export const getAnalytics = async (req, res) => {
  try {
    const range = RANGES[req.query.range] ? req.query.range : '30d';
    const start = startOfRange(range);
    const spanDays = RANGES[range];

    // The equally long window immediately before, for the change figures.
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - spanDays);

    /* ── Sessions ── */
    let sessions = [];
    try {
      sessions = await Session.find({ createdAt: { $gte: previousStart } }).lean();
    } catch (e) { /* database offline */ }
    sessions = [
      ...sessions,
      ...SESSIONS_STORE.filter(
        (s) => new Date(s.createdAt) >= previousStart && !sessions.some((d) => d.sessionId === s.sessionId)
      )
    ];

    const current = sessions.filter((s) => new Date(s.createdAt) >= start);
    const previous = sessions.filter((s) => new Date(s.createdAt) < start);

    /* ── Orders ── */
    let orders = [];
    try {
      orders = await Order.find({ createdAt: { $gte: previousStart } }).lean();
    } catch (e) { /* database offline */ }

    const currentOrders = orders.filter((o) => new Date(o.createdAt) >= start);
    const previousOrders = orders.filter((o) => new Date(o.createdAt) < start);

    const sum = (rows, pick) => rows.reduce((total, row) => total + (Number(pick(row)) || 0), 0);
    const grossSales = sum(currentOrders, (o) => o.totalAmount);
    const previousGross = sum(previousOrders, (o) => o.totalAmount);

    const change = (now, before) => {
      if (!before) return now > 0 ? 100 : 0;
      return Math.round(((now - before) / before) * 1000) / 10;
    };

    /* ── Sales attributed to a session ──
       Only sessions that actually converted carry a sale, so an unattributed
       order simply doesn't appear in the referrer reports. */
    const converted = current.filter((s) => s.orderId && s.orderTotal > 0);

    /* ── Sell-through rate ──
       units sold ÷ (units sold + units still on hand), per product. */
    let products = [];
    try {
      products = await Product.find().select('title unit stock').lean();
    } catch (e) { /* database offline */ }

    const soldByTitle = new Map();
    for (const order of currentOrders) {
      for (const item of order.items || []) {
        const key = item.title;
        if (!key) continue;
        soldByTitle.set(key, (soldByTitle.get(key) || 0) + (Number(item.quantity) || 0));
      }
    }

    const sellThrough = products
      .map((p) => {
        const sold = soldByTitle.get(p.title) || 0;
        const onHand = Number(p.stock) || 0;
        const denominator = sold + onHand;
        return {
          label: `${p.title}${p.unit ? ` · ${p.unit}` : ''}`,
          value: denominator === 0 ? 0 : Math.round((sold / denominator) * 1000) / 10,
          sold,
          onHand
        };
      })
      .sort((a, b) => b.value - a.value || b.sold - a.sold)
      .slice(0, 8);

    /* ── The report cards ── */
    const dailySessions = Array.from({ length: Math.min(spanDays, 30) }, (_, i) => {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const inDay = current.filter((s) => {
        const at = new Date(s.createdAt);
        return at >= day && at < next;
      });
      const ordersInDay = currentOrders.filter((o) => {
        const at = new Date(o.createdAt);
        return at >= day && at < next;
      });
      return {
        label: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        sessions: inDay.length,
        sales: Math.round(sum(ordersInDay, (o) => o.totalAmount))
      };
    });

    res.json({
      success: true,
      range,
      startsAt: start,
      summary: {
        sessions: current.length,
        sessionsChange: change(current.length, previous.length),
        orders: currentOrders.length,
        ordersChange: change(currentOrders.length, previousOrders.length),
        grossSales: Math.round(grossSales),
        grossSalesChange: change(grossSales, previousGross),
        averageOrderValue: currentOrders.length ? Math.round(grossSales / currentOrders.length) : 0,
        conversionRate: current.length
          ? Math.round((converted.length / current.length) * 1000) / 10
          : 0
      },
      reports: {
        sessionsBySocialReferrer: tally(current.filter((s) => s.source === 'Social'), (s) => s.host),
        sessionsByReferrer: tally(
          current,
          (s) => `${s.source} · ${s.host || 'None'} · ${s.city || 'Unknown'}`
        ),
        totalSalesByReferrer: tally(converted, (s) => s.host || 'None', (s) => s.orderTotal),
        performanceByChannel: tally(current, (s) => s.host || 'None', (s) => s.orderTotal || 0)
          .map((row) => ({
            ...row,
            channel: current.find((s) => (s.host || 'None') === row.label)?.channel || 'Unknown'
          })),
        totalSalesByCity: tally(
          currentOrders,
          (o) => o.deliveryAddress?.city || '',
          (o) => Number(o.totalAmount) || 0
        ),
        productsBySellThrough: sellThrough,
        sessionsByDevice: tally(current, (s) => s.device),
        salesByChannelName: tally(currentOrders, (o) => o.channel || 'Online Store', (o) => Number(o.totalAmount) || 0),
        topProducts: [...soldByTitle.entries()]
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8),

        /* ── The rest of the report library ── */
        sessionsByLocation: tally(
          current,
          (s) => `${s.country || 'Unknown'} · ${s.region || 'None'} · ${s.city || 'Unknown'}`
        ),
        paymentsByGateway: tally(
          currentOrders,
          (o) => o.paymentMethod || 'Unknown',
          (o) => Number(o.amountPaid ?? o.totalAmount) || 0
        ),
        ordersByFulfillment: tally(currentOrders, (o) => o.fulfillmentStatus || 'Unfulfilled'),
        /* Hours between an order being placed and its first fulfillment. Only
           orders that actually shipped can answer this. */
        fulfillmentTime: (() => {
          const buckets = new Map();
          for (const o of currentOrders) {
            const shippedAt = (o.fulfillments || []).map((f) => f.deliveredAt || f.createdAt).filter(Boolean)[0]
              || (o.fulfillmentStatus === 'Fulfilled' ? o.updatedAt : null);
            if (!shippedAt) continue;
            const hours = (new Date(shippedAt) - new Date(o.createdAt)) / 36e5;
            if (!Number.isFinite(hours) || hours < 0) continue;
            const bucket = hours < 24 ? 'Under 24 hours' : hours < 48 ? '1–2 days' : hours < 168 ? '2–7 days' : 'Over a week';
            const entry = buckets.get(bucket) || { total: 0, count: 0 };
            entry.total += hours;
            entry.count += 1;
            buckets.set(bucket, entry);
          }
          return [...buckets.entries()]
            .map(([label, b]) => ({ label, value: Math.round((b.total / b.count) * 10) / 10, orders: b.count }))
            .sort((a, b) => a.value - b.value);
        })(),
        /* A customer is "returning" on any order after their first — measured
           across all time, not just this range, or everyone looks new. */
        newVsReturning: (() => {
          const seenBefore = new Set();
          for (const o of orders) {
            if (new Date(o.createdAt) < start) seenBefore.add(o.user?.email || o.user?.name || '');
          }
          let isNew = 0;
          let returning = 0;
          const counted = new Set();
          for (const o of currentOrders) {
            const key = o.user?.email || o.user?.name || '';
            if (seenBefore.has(key) || counted.has(key)) returning += 1;
            else isNew += 1;
            counted.add(key);
          }
          return [
            { label: 'New customers', value: isNew },
            { label: 'Returning customers', value: returning }
          ].filter((r) => r.value > 0);
        })(),
        topCustomers: tally(
          currentOrders,
          (o) => o.user?.name || o.user?.email || '',
          (o) => Number(o.totalAmount) || 0
        ).slice(0, 10),
        /* Where visits stop. Each step is a real count, so the drop between
           steps is the store's actual funnel rather than a modelled one. */
        conversionFunnel: [
          { label: 'Sessions', value: current.length },
          { label: 'Reached cart', value: current.filter((s) => ['Cart', 'Checkout', 'Purchased'].includes(s.activity)).length },
          { label: 'Reached checkout', value: current.filter((s) => ['Checkout', 'Purchased'].includes(s.activity)).length },
          { label: 'Purchased', value: converted.length }
        ],
        inventoryOnHand: products
          .map((p) => ({ label: `${p.title}${p.unit ? ` · ${p.unit}` : ''}`, value: Number(p.stock) || 0 }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
        discountUsage: tally(
          currentOrders.filter((o) => o.discountCode),
          (o) => o.discountCode,
          (o) => Number(o.discountApplied) || 0
        ),

        daily: dailySessions
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   LIVE VIEW
   Everything on this screen is "right now" or "since midnight" — no
   rolling windows, no smoothing. A visitor counts as present while their
   tab has sent a heartbeat inside the last five minutes.
═══════════════════════════════════════════════════════════════════ */
const PRESENCE_WINDOW_MS = 5 * 60 * 1000;

export const getLiveView = async (req, res) => {
  try {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const presentSince = new Date(now.getTime() - PRESENCE_WINDOW_MS);

    /* ── Sessions since midnight ── */
    let sessions = [];
    try {
      sessions = await Session.find({ createdAt: { $gte: midnight } }).lean();
    } catch (e) { /* database offline */ }
    sessions = [
      ...sessions,
      ...SESSIONS_STORE.filter(
        (s) => new Date(s.createdAt) >= midnight && !sessions.some((d) => d.sessionId === s.sessionId)
      )
    ];

    /* Presence is judged on the heartbeat, not on when the session started —
       a tab opened this morning and left open is still a visitor now. */
    let live = [];
    try {
      live = await Session.find({ lastSeenAt: { $gte: presentSince } }).lean();
    } catch (e) { /* database offline */ }
    live = [
      ...live,
      ...SESSIONS_STORE.filter(
        (s) => s.lastSeenAt && new Date(s.lastSeenAt) >= presentSince && !live.some((d) => d.sessionId === s.sessionId)
      )
    ];

    /* ── Orders since midnight ── */
    let orders = [];
    try {
      orders = await Order.find({ createdAt: { $gte: midnight } }).sort({ createdAt: -1 }).lean();
    } catch (e) { /* database offline */ }

    const totalSales = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    /* ── Behaviour funnel, counted off live tabs ── */
    const behavior = {
      activeCarts: live.filter((s) => s.activity === 'Cart').length,
      checkingOut: live.filter((s) => s.activity === 'Checkout').length,
      purchased: live.filter((s) => s.activity === 'Purchased').length
    };

    /* ── Sessions by location: country · region · city ── */
    const byLocation = new Map();
    for (const s of sessions) {
      const key = `${s.country || 'Unknown'} · ${s.region || 'None'} · ${s.city || 'Unknown'}`;
      const entry = byLocation.get(key) || { label: key, value: 0, lat: s.lat, lng: s.lng };
      entry.value += 1;
      if (entry.lat === undefined && s.lat !== undefined) {
        entry.lat = s.lat;
        entry.lng = s.lng;
      }
      byLocation.set(key, entry);
    }

    /* ── Sessions per minute for the last hour ── */
    const minutes = Array.from({ length: 60 }, (_, i) => {
      const from = new Date(now.getTime() - (59 - i) * 60 * 1000);
      from.setSeconds(0, 0);
      const to = new Date(from.getTime() + 60 * 1000);
      return {
        label: from.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        sessions: sessions.filter((s) => {
          const at = new Date(s.createdAt);
          return at >= from && at < to;
        }).length
      };
    });

    res.json({
      success: true,
      at: now,
      visitorsRightNow: live.length,
      sinceMidnight: {
        sessions: sessions.length,
        orders: orders.length,
        totalSales: Math.round(totalSales),
        conversions: sessions.filter((s) => s.orderId).length
      },
      behavior,
      sessionsByLocation: [...byLocation.values()].sort((a, b) => b.value - a.value),
      sessionsPerMinute: minutes,
      liveVisitors: live
        .map((s) => ({
          sessionId: s.sessionId,
          activity: s.activity || 'Browsing',
          cartValue: s.cartValue || 0,
          device: s.device,
          source: s.source,
          host: s.host,
          city: s.city || '',
          country: s.country || '',
          lat: s.lat,
          lng: s.lng,
          lastSeenAt: s.lastSeenAt
        }))
        .sort((a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt)),
      recentOrders: orders.slice(0, 8).map((o) => ({
        _id: String(o._id),
        orderNumber: o.orderNumber || String(o._id).slice(-6),
        customer: o.user?.name || 'Customer',
        city: o.deliveryAddress?.city || '',
        total: Number(o.totalAmount) || 0,
        createdAt: o.createdAt
      }))
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   REPORT CATALOGUE
   The list of reports is fixed in code, the way a built-in report library
   is. Only "last viewed" is data, and it is written when a report is
   actually opened — never seeded.
═══════════════════════════════════════════════════════════════════ */
export const REPORT_CATALOGUE = [
  { id: 'orders-over-time', name: 'Orders over time', category: 'Orders', source: 'daily', measure: 'orders', format: 'count' },
  { id: 'total-sales-over-time', name: 'Total sales over time', category: 'Sales', source: 'daily', measure: 'sales', format: 'money' },
  { id: 'sessions-over-time', name: 'Sessions over time', category: 'Acquisition', source: 'daily', measure: 'sessions', format: 'count' },
  { id: 'products-by-sell-through-rate', name: 'Products by sell-through rate', category: 'Inventory', source: 'productsBySellThrough', format: 'percent' },
  { id: 'sessions-by-location', name: 'Sessions by location', category: 'Acquisition', source: 'sessionsByLocation', format: 'count' },
  { id: 'sessions-by-referrer', name: 'Sessions by referrer', category: 'Acquisition', source: 'sessionsByReferrer', format: 'count' },
  { id: 'sessions-by-social-referrer', name: 'Sessions by social referrer', category: 'Acquisition', source: 'sessionsBySocialReferrer', format: 'count' },
  { id: 'sessions-by-device', name: 'Sessions by device', category: 'Acquisition', source: 'sessionsByDevice', format: 'count' },
  { id: 'total-sales-by-referrer', name: 'Total sales by referrer', category: 'Sales', source: 'totalSalesByReferrer', format: 'money' },
  { id: 'total-sales-by-channel', name: 'Total sales by channel', category: 'Sales', source: 'salesByChannelName', format: 'money' },
  { id: 'total-sales-by-delivery-city', name: 'Total sales by delivery city', category: 'Sales', source: 'totalSalesByCity', format: 'money' },
  { id: 'top-products-by-units-sold', name: 'Top products by units sold', category: 'Sales', source: 'topProducts', format: 'count' },
  { id: 'net-payments-by-gateway', name: 'Net payments by gateway', category: 'Finances', source: 'paymentsByGateway', format: 'money' },
  { id: 'orders-by-fulfillment-status', name: 'Orders by fulfillment status', category: 'Orders', source: 'ordersByFulfillment', format: 'count' },
  { id: 'order-to-fulfillment-time', name: 'Order to fulfillment time', category: 'Orders', source: 'fulfillmentTime', format: 'hours' },
  { id: 'new-vs-returning-customers', name: 'New vs returning customers', category: 'Customers', source: 'newVsReturning', format: 'count' },
  { id: 'top-customers-by-spend', name: 'Top customers by spend', category: 'Customers', source: 'topCustomers', format: 'money' },
  { id: 'checkout-conversion-funnel', name: 'Checkout conversion funnel', category: 'Behavior', source: 'conversionFunnel', format: 'count' },
  { id: 'inventory-on-hand-by-product', name: 'Inventory on hand by product', category: 'Inventory', source: 'inventoryOnHand', format: 'count' },
  { id: 'discount-usage-by-code', name: 'Discount usage by code', category: 'Marketing', source: 'discountUsage', format: 'money' }
];

export const getReportCatalogue = async (req, res) => {
  let views = [];
  try {
    views = await ReportView.find().lean();
  } catch (e) { /* database offline — every report simply reads "Never" */ }

  const byId = new Map(views.map((v) => [v.reportId, v]));

  res.json({
    success: true,
    reports: REPORT_CATALOGUE.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      format: r.format,
      lastViewedAt: byId.get(r.id)?.lastViewedAt || null,
      viewCount: byId.get(r.id)?.viewCount || 0,
      createdBy: 'Nuva'
    }))
  });
};

export const markReportViewed = async (req, res) => {
  try {
    const { id } = req.params;
    if (!REPORT_CATALOGUE.some((r) => r.id === id)) {
      return res.status(404).json({ success: false, message: 'Unknown report' });
    }
    try {
      await ReportView.updateOne(
        { reportId: id },
        {
          $set: { lastViewedAt: new Date(), lastViewedBy: req.user?.name || 'Staff' },
          $inc: { viewCount: 1 }
        },
        { upsert: true }
      );
    } catch (e) { /* database offline — the view just isn't recorded */ }
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
