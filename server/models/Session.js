import mongoose from 'mongoose';

/* ═══════════════════════════════════════════════════════════════════
   SESSION
   One visit to the storefront. This is the only place traffic data comes
   from — nothing here is estimated or sampled. A session starts when a
   browser tab first loads the shop and, if that visit ends in a purchase,
   the order is linked back to it so sales can be attributed to a referrer.
═══════════════════════════════════════════════════════════════════ */
const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },

    /* Where the visit came from. `source` is the bucket ("Search", "Social",
       "Direct"), `host` the actual referring domain ("google.com"). */
    source: {
      type: String,
      enum: ['Search', 'Social', 'AI', 'Referral', 'Direct', 'Email'],
      default: 'Direct',
      index: true
    },
    channel: {
      type: String,
      enum: ['Organic', 'Social', 'Direct', 'Referral', 'Email', 'Unknown'],
      default: 'Direct',
      index: true
    },
    host: { type: String, default: 'None' },
    referrer: { type: String, default: '' },
    landingPath: { type: String, default: '/' },

    /* Location comes from two real signals and nothing else:
         • the visitor's IANA timezone, which the browser reports and which
           maps deterministically to a country and its approximate centre
         • the delivery city on an order this session placed
       A visit that gives neither stays "Unknown" rather than being guessed at. */
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    country: { type: String, default: '' },
    timezone: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number },

    /* How much the coordinate above is actually worth, so the live map can
       show an approximation as an approximation:
         address  — a city the customer typed on a real order
         timezone — the centre of the country their browser's zone names
         region   — the centre of a continent, for a zone we don't list
         unknown  — no coordinate at all; not plotted */
    precision: {
      type: String,
      enum: ['address', 'timezone', 'region', 'unknown'],
      default: 'unknown'
    },

    device: { type: String, enum: ['Desktop', 'Mobile', 'Tablet'], default: 'Desktop' },

    /* Live view: where this visitor is in the funnel right now, and when we
       last heard from their tab. */
    activity: {
      type: String,
      enum: ['Browsing', 'Cart', 'Checkout', 'Purchased'],
      default: 'Browsing',
      index: true
    },
    cartValue: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: Date.now, index: true },

    /* Conversion */
    orderId: { type: String, default: '' },
    orderTotal: { type: Number, default: 0 },
    convertedAt: { type: Date }
  },
  { timestamps: true }
);

sessionSchema.index({ createdAt: -1 });

export default mongoose.model('Session', sessionSchema);
