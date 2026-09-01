/* ═══════════════════════════════════════════════════════════════════
   STOREFRONT ANALYTICS
   One record per browsing session, sent once, so the admin's acquisition
   reports are built from visits that actually happened.

   Deliberately small: no cookies, no third party, no identifiers that
   outlive the tab. The id lives in sessionStorage, which the browser
   throws away when the tab closes — the same lifetime Shopify gives a
   session — and the only thing sent is where the visit came from.
═══════════════════════════════════════════════════════════════════ */
import API from '../api/axiosInstance';

const KEY = 'nuva_session_id';
const SENT_KEY = 'nuva_session_sent';

const newId = () => {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/** The current visit's id, created on first use. */
export const getSessionId = () => {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = newId();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch (e) {
    // Private mode with storage blocked: the visit just goes uncounted.
    return '';
  }
};

/* The browser's IANA timezone. It resolves to a country and a rough point on
   the map without an IP lookup or any cross-site identifier — coarse by
   design, and the only location signal an anonymous visit gives up. */
const timezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (e) {
    return '';
  }
};

/**
 * Announce this visit. Safe to call on every mount — it only reaches the
 * server the first time a tab loads the shop.
 */
export const trackSession = async () => {
  // The admin previewing the storefront in the editor iframe is staff
  // traffic, not a customer visit.
  if (typeof window === 'undefined' || window.self !== window.top) return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    if (sessionStorage.getItem(SENT_KEY) === sessionId) return;
    sessionStorage.setItem(SENT_KEY, sessionId);
  } catch (e) {
    return;
  }

  try {
    await API.post('/analytics/track', {
      sessionId,
      referrer: document.referrer || '',
      landingPath: window.location.pathname + window.location.search,
      timezone: timezone()
    });
  } catch (e) {
    // Analytics can fail quietly; the shop does not depend on it.
  }
};

/* ═══════════════════════════════════════════════════════════════════
   PRESENCE
   The live view needs to know which tabs are still open and where each
   one is in the funnel. Cart state is read straight out of the same
   localStorage key the cart itself uses, so this stays decoupled from
   React state and can't drift from what the shopper actually has.
═══════════════════════════════════════════════════════════════════ */
const HEARTBEAT_MS = 20000;
let heartbeatTimer = null;
let checkoutUntil = 0;

/** Called by the checkout when the payment sheet opens. */
export const markCheckoutStarted = () => {
  // Held for two minutes, so a shopper reading the payment screen still
  // reads as "checking out" between heartbeats.
  checkoutUntil = Date.now() + 2 * 60 * 1000;
};

const readCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('nuva_cart') || '[]');
    if (!Array.isArray(cart) || cart.length === 0) return { count: 0, value: 0 };
    return {
      count: cart.reduce((n, i) => n + (Number(i.quantity) || 1), 0),
      value: cart.reduce((n, i) => n + (Number(i.discountedPrice ?? i.price) || 0) * (Number(i.quantity) || 1), 0)
    };
  } catch (e) {
    return { count: 0, value: 0 };
  }
};

const beat = async () => {
  // A backgrounded tab is not a visitor looking at the shop.
  if (document.visibilityState === 'hidden') return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  const cart = readCart();
  const activity = Date.now() < checkoutUntil
    ? 'Checkout'
    : cart.count > 0
      ? 'Cart'
      : 'Browsing';

  try {
    await API.post('/analytics/heartbeat', {
      sessionId,
      activity,
      cartValue: cart.value,
      timezone: timezone()
    });
  } catch (e) {
    // Presence is best-effort.
  }
};

/** Start the presence heartbeat. Returns a stop function. */
export const startHeartbeat = () => {
  if (typeof window === 'undefined' || window.self !== window.top) return () => {};
  if (heartbeatTimer) return () => {};

  beat();
  heartbeatTimer = setInterval(beat, HEARTBEAT_MS);
  // Coming back to the tab should show up immediately, not up to 20s later.
  document.addEventListener('visibilitychange', beat);

  return () => {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    document.removeEventListener('visibilitychange', beat);
  };
};
