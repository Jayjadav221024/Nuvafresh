import Transfer from '../models/Transfer.js';

/* ═══════════════════════════════════════════════════════════════════
   LOCATIONS
   Nuva's own sites. Shopify keeps these as a resource behind Settings;
   here they are fixed, because the chambers and hubs are physical places
   that change about once a year, not data a merchant edits daily.
═══════════════════════════════════════════════════════════════════ */
export const LOCATIONS = [
  { id: 'vadodara-chamber', name: 'Vadodara Bio-Purification Chamber', city: 'Vadodara, Gujarat', kind: 'Processing' },
  { id: 'ahmedabad-hub', name: 'Ahmedabad Express Fulfillment Hub', city: 'Ahmedabad, Gujarat', kind: 'Fulfillment' },
  { id: 'surat-coldpress', name: 'Surat Cold-Press Unit #2', city: 'Surat, Gujarat', kind: 'Processing' },
  { id: 'mumbai-depot', name: 'Mumbai Metro Distribution Depot', city: 'Mumbai, Maharashtra', kind: 'Distribution' },
  { id: 'anand-farm', name: 'Anand Partner Farm Collection Point', city: 'Anand, Gujarat', kind: 'Collection' }
];

/* MongoDB-offline fallback, the same pattern the order screens use: the
   admin stays usable without a database, it just forgets on restart. */
let TRANSFERS_STORE = [];

const toLocation = (value) => {
  if (!value) return { id: '', name: '' };
  if (typeof value === 'string') {
    const match = LOCATIONS.find((l) => l.id === value || l.name === value);
    return match ? { id: match.id, name: match.name } : { id: '', name: value };
  }
  return { id: value.id || '', name: value.name || '' };
};

const normaliseItems = (items = []) =>
  items
    .map((item) => {
      const quantity = Math.max(1, Math.round(Number(item.quantity) || 0));
      if (!item.title || !quantity) return null;
      const id = item.product || item.productId || item._id;
      return {
        // Only a real ObjectId goes in `product`; anything else is a seeded id.
        product: /^[0-9a-fA-F]{24}$/.test(String(id || '')) ? id : undefined,
        productId: String(id || ''),
        title: item.title,
        sku: item.sku || '',
        unit: item.unit || '',
        image: item.image || '',
        quantity,
        received: Math.max(0, Math.round(Number(item.received) || 0))
      };
    })
    .filter(Boolean);

/* Status follows what has been counted in, so it can never disagree with
   the line items the way a hand-set dropdown would. */
const deriveStatus = (transfer) => {
  if (transfer.status === 'Draft' || transfer.status === 'Cancelled') return transfer.status;
  const total = transfer.items.reduce((sum, i) => sum + i.quantity, 0);
  const received = transfer.items.reduce((sum, i) => sum + i.received, 0);
  if (received === 0) return 'In transit';
  if (received >= total) return 'Received';
  return 'Partially received';
};

const buildTransfer = (body) => {
  const items = normaliseItems(body.items);
  const origin = toLocation(body.origin);
  const destination = toLocation(body.destination);
  const status = body.status === 'Draft' ? 'Draft' : 'In transit';

  return {
    name: body.name || '',
    origin,
    destination,
    status,
    items,
    estimatedArrival: body.estimatedArrival ? new Date(body.estimatedArrival) : undefined,
    shippingCarrier: body.shippingCarrier || '',
    trackingNumber: body.trackingNumber || '',
    note: body.note || '',
    tags: Array.isArray(body.tags) ? body.tags : [],
    purchaseOrder: body.purchaseOrder || '',
    timeline: [
      {
        message: status === 'Draft'
          ? 'Transfer saved as a draft.'
          : `${items.reduce((s, i) => s + i.quantity, 0)} units marked in transit from ${origin.name || 'origin'} to ${destination.name || 'destination'}.`,
        author: 'Staff'
      }
    ]
  };
};

export const getLocations = (req, res) => {
  res.json({ success: true, locations: LOCATIONS });
};

export const getTransfers = async (req, res) => {
  try {
    let transfers = [];
    try {
      transfers = await Transfer.find().sort({ createdAt: -1 }).lean();
    } catch (e) { /* database offline */ }

    if (!transfers || transfers.length === 0) {
      transfers = TRANSFERS_STORE;
    } else {
      const ids = new Set(transfers.map((t) => String(t._id)));
      transfers = [...transfers, ...TRANSFERS_STORE.filter((t) => !ids.has(String(t._id)))];
    }

    res.json({ success: true, count: transfers.length, transfers });
  } catch (e) {
    res.json({ success: true, count: TRANSFERS_STORE.length, transfers: TRANSFERS_STORE });
  }
};

export const getTransferById = async (req, res) => {
  try {
    let transfer = TRANSFERS_STORE.find((t) => String(t._id) === req.params.id);
    if (!transfer) {
      try {
        transfer = await Transfer.findById(req.params.id).lean();
      } catch (e) { /* not an ObjectId, or database offline */ }
    }
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    res.json({ success: true, transfer });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const createTransfer = async (req, res) => {
  try {
    const data = buildTransfer(req.body);

    if (data.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Add at least one product to transfer.' });
    }
    if (!data.origin.name || !data.destination.name) {
      return res.status(400).json({ success: false, message: 'Choose both an origin and a destination.' });
    }
    if (data.origin.id && data.origin.id === data.destination.id) {
      return res.status(400).json({ success: false, message: 'Origin and destination must be different locations.' });
    }

    try {
      const created = await Transfer.create(data);
      return res.status(201).json({ success: true, transfer: created.toObject() });
    } catch (dbErr) {
      // Fall through to the in-memory store.
    }

    const fallback = {
      _id: `tr-${Date.now()}`,
      reference: `TR-${String(Date.now()).slice(-4)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    TRANSFERS_STORE.unshift(fallback);
    res.status(201).json({ success: true, transfer: fallback });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateTransfer = async (req, res) => {
  try {
    const updates = {};
    ['name', 'note', 'purchaseOrder', 'shippingCarrier', 'trackingNumber'].forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (Array.isArray(req.body.tags)) updates.tags = req.body.tags;
    if (req.body.estimatedArrival) updates.estimatedArrival = new Date(req.body.estimatedArrival);
    if (req.body.items) updates.items = normaliseItems(req.body.items);
    if (req.body.origin) updates.origin = toLocation(req.body.origin);
    if (req.body.destination) updates.destination = toLocation(req.body.destination);
    if (req.body.status) updates.status = req.body.status;

    const index = TRANSFERS_STORE.findIndex((t) => String(t._id) === req.params.id);
    if (index !== -1) {
      const merged = { ...TRANSFERS_STORE[index], ...updates, updatedAt: new Date() };
      merged.status = deriveStatus(merged);
      TRANSFERS_STORE[index] = merged;
      return res.json({ success: true, transfer: merged });
    }

    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });

    Object.assign(transfer, updates);
    transfer.status = deriveStatus(transfer);
    await transfer.save();

    res.json({ success: true, transfer: transfer.toObject() });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* Receiving a transfer counts stock in at the destination. It deliberately
   does NOT change Product.stock: a product carries one store-wide on-hand
   number, and moving units between Nuva's own locations doesn't create or
   destroy any. What changes is where they are — which is what the transfer
   record itself is for, and what the inventory screen reads as "incoming". */
export const receiveTransfer = async (req, res) => {
  try {
    const requested = Array.isArray(req.body.items) ? req.body.items : null;

    const applyReceipt = (transfer) => {
      transfer.items = transfer.items.map((item, index) => {
        const ask = requested
          ? requested.find((r, i) => (r.productId ? String(r.productId) === String(item.productId) : i === index))
          : null;
        // No payload means "receive everything", the common case.
        const received = ask ? Math.round(Number(ask.received) || 0) : item.quantity;
        return { ...item, received: Math.min(item.quantity, Math.max(0, received)) };
      });
      transfer.status = deriveStatus(transfer);
      transfer.timeline = [
        ...(transfer.timeline || []),
        {
          message: transfer.status === 'Received'
            ? `All ${transfer.items.reduce((s, i) => s + i.received, 0)} units received at ${transfer.destination?.name || 'destination'}.`
            : `${transfer.items.reduce((s, i) => s + i.received, 0)} of ${transfer.items.reduce((s, i) => s + i.quantity, 0)} units received.`,
          author: 'Staff',
          createdAt: new Date()
        }
      ];
      return transfer;
    };

    const index = TRANSFERS_STORE.findIndex((t) => String(t._id) === req.params.id);
    if (index !== -1) {
      TRANSFERS_STORE[index] = applyReceipt({ ...TRANSFERS_STORE[index], updatedAt: new Date() });
      return res.json({ success: true, transfer: TRANSFERS_STORE[index] });
    }

    const doc = await Transfer.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Transfer not found' });

    const updated = applyReceipt(doc.toObject());
    doc.items = updated.items;
    doc.status = updated.status;
    doc.timeline = updated.timeline;
    await doc.save();

    res.json({ success: true, transfer: doc.toObject() });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteTransfer = async (req, res) => {
  try {
    const before = TRANSFERS_STORE.length;
    TRANSFERS_STORE = TRANSFERS_STORE.filter((t) => String(t._id) !== req.params.id);
    if (TRANSFERS_STORE.length < before) {
      return res.json({ success: true, message: 'Transfer deleted' });
    }

    const removed = await Transfer.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ success: false, message: 'Transfer not found' });

    res.json({ success: true, message: 'Transfer deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* Units still on the road, per product — what the inventory screen shows in
   its "Incoming" column. Read by adminRoutes, so it lives here next to the
   status rules that decide which transfers still count. */
export const getIncomingByProduct = async () => {
  const incoming = new Map();

  const collect = (transfers) => {
    for (const transfer of transfers) {
      if (!['In transit', 'Partially received'].includes(transfer.status)) continue;
      for (const item of transfer.items || []) {
        const outstanding = Math.max(0, (Number(item.quantity) || 0) - (Number(item.received) || 0));
        if (outstanding === 0) continue;
        const key = String(item.product || item.productId || item.title);
        incoming.set(key, (incoming.get(key) || 0) + outstanding);
      }
    }
  };

  try {
    collect(await Transfer.find({ status: { $in: ['In transit', 'Partially received'] } }).lean());
  } catch (e) { /* database offline — the in-memory store still counts */ }

  collect(TRANSFERS_STORE);
  return incoming;
};
