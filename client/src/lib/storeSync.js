/* ═══════════════════════════════════════════════════════════════════
   STORE SYNC
   Shopify's admin and storefront feel like one app because a save on one
   side shows up on the other without a manual refresh. This is the same
   idea, minus the infrastructure: whoever writes announces the topic it
   touched, and whoever reads that topic refetches.

   Three transports, because each covers a gap the others leave:
     • BroadcastChannel — the admin and the live store in two tabs
     • localStorage     — browsers without BroadcastChannel, same origin
     • window message   — the Website Editor's same-window preview
═══════════════════════════════════════════════════════════════════ */

export const STORE_TOPICS = {
  CONTENT: 'content',
  PRODUCTS: 'products',
  COLLECTIONS: 'collections',
  CATEGORIES: 'categories',
  REVIEWS: 'reviews',
  TESTIMONIALS: 'testimonials',
  FAQS: 'faqs',
  BLOGS: 'blogs',
  REELS: 'reels',
  DISCOUNTS: 'discounts',
  ORDERS: 'orders',
  INVENTORY: 'inventory'
};

const CHANNEL_NAME = 'nuva-store-sync';
const STORAGE_KEY = 'nuva_store_sync';
const MESSAGE_TYPE = 'NUVA_STORE_SYNC';

// Legacy message types the Website Editor already emits. Keeping them mapped
// means existing editor code stays valid while new callers use topics.
const LEGACY_CONTENT_TYPES = ['NUVA_CMS_UPDATED', 'NUVA_SECTION_SAVED'];

const openChannel = () => {
  try {
    return typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
  } catch (e) {
    return null;
  }
};

/* One long-lived channel for sending. Opening and closing one per publish
   risks closing before the message has been dispatched, and a subscriber
   never hears its own channel anyway — so senders and receivers each get
   their own. */
let publisherChannel;
const getPublisherChannel = () => {
  if (publisherChannel === undefined) publisherChannel = openChannel();
  return publisherChannel;
};

/**
 * Announce that a topic changed. Call it after a successful admin write.
 * @param {string|string[]} topics one or more STORE_TOPICS values
 */
export const publishStoreChange = (topics) => {
  const list = (Array.isArray(topics) ? topics : [topics]).filter(Boolean);
  if (list.length === 0) return;

  const payload = { type: MESSAGE_TYPE, topics: list, at: Date.now() };

  const channel = getPublisherChannel();
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch (e) {
      // The channel can be closed out from under us on page teardown.
      publisherChannel = undefined;
    }
  }

  try {
    // The storage event only fires in *other* tabs, which is exactly the
    // cross-tab case BroadcastChannel would otherwise have to cover alone.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {}

  try {
    window.postMessage(payload, window.location.origin);
  } catch (e) {}
};

/**
 * Run `handler` whenever one of `topics` is announced.
 * @param {string|string[]} topics
 * @param {() => void} handler
 * @returns {() => void} unsubscribe
 */
export const subscribeToStoreChanges = (topics, handler) => {
  const wanted = new Set(Array.isArray(topics) ? topics : [topics]);

  const matches = (payload) =>
    Array.isArray(payload?.topics) && payload.topics.some((t) => wanted.has(t));

  const onChannel = (event) => {
    if (matches(event?.data)) handler();
  };

  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      if (matches(JSON.parse(event.newValue))) handler();
    } catch (e) {}
  };

  const onMessage = (event) => {
    const data = event?.data;
    if (!data) return;
    if (data.type === MESSAGE_TYPE && matches(data)) return handler();
    if (wanted.has(STORE_TOPICS.CONTENT) && LEGACY_CONTENT_TYPES.includes(data.type)) handler();
  };

  const channel = openChannel();
  if (channel) channel.addEventListener('message', onChannel);
  window.addEventListener('storage', onStorage);
  window.addEventListener('message', onMessage);

  return () => {
    if (channel) {
      channel.removeEventListener('message', onChannel);
      try {
        channel.close();
      } catch (e) {}
    }
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('message', onMessage);
  };
};
