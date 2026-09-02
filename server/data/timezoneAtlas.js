/* ═══════════════════════════════════════════════════════════════════
   TIMEZONE ATLAS
   The browser reports its IANA timezone, and an IANA zone is named after a
   real place — so it resolves to a country without any IP lookup,
   third-party service, or tracking cookie.

   What a zone does NOT tell you is a city. `Asia/Kolkata` is the zone for
   all of India, so a visitor on it is somewhere in India and nothing more
   precise than that. Every point here is therefore the centroid of the
   zone's country or region, never a city, and it is marked `timezone`
   precision so the map can draw it as the approximation it is.

   A session earns a real city only from the delivery address on an actual
   order — see cityAtlas.js.
═══════════════════════════════════════════════════════════════════ */
export const TIMEZONE_ATLAS = {
  /* ── South and Central Asia ── */
  'Asia/Kolkata': { country: 'India', lat: 22.5, lng: 79.0 },
  'Asia/Calcutta': { country: 'India', lat: 22.5, lng: 79.0 },
  'Asia/Karachi': { country: 'Pakistan', lat: 30.0, lng: 69.5 },
  'Asia/Dhaka': { country: 'Bangladesh', lat: 23.8, lng: 90.3 },
  'Asia/Colombo': { country: 'Sri Lanka', lat: 7.6, lng: 80.7 },
  'Asia/Kathmandu': { country: 'Nepal', lat: 28.3, lng: 84.1 },
  'Asia/Thimphu': { country: 'Bhutan', lat: 27.4, lng: 90.4 },
  'Asia/Kabul': { country: 'Afghanistan', lat: 33.9, lng: 66.0 },
  'Indian/Maldives': { country: 'Maldives', lat: 3.2, lng: 73.2 },
  'Asia/Tashkent': { country: 'Uzbekistan', lat: 41.4, lng: 64.6 },
  'Asia/Almaty': { country: 'Kazakhstan', lat: 48.0, lng: 68.0 },

  /* ── Middle East ── */
  'Asia/Dubai': { country: 'United Arab Emirates', lat: 24.3, lng: 54.3 },
  'Asia/Qatar': { country: 'Qatar', lat: 25.3, lng: 51.2 },
  'Asia/Riyadh': { country: 'Saudi Arabia', lat: 24.0, lng: 45.0 },
  'Asia/Kuwait': { country: 'Kuwait', lat: 29.3, lng: 47.7 },
  'Asia/Muscat': { country: 'Oman', lat: 21.5, lng: 57.0 },
  'Asia/Bahrain': { country: 'Bahrain', lat: 26.1, lng: 50.5 },
  'Asia/Tehran': { country: 'Iran', lat: 32.4, lng: 53.7 },
  'Asia/Baghdad': { country: 'Iraq', lat: 33.2, lng: 43.7 },
  'Asia/Beirut': { country: 'Lebanon', lat: 33.9, lng: 35.9 },
  'Asia/Amman': { country: 'Jordan', lat: 31.3, lng: 36.5 },
  'Asia/Jerusalem': { country: 'Israel', lat: 31.5, lng: 34.9 },
  'Asia/Yerevan': { country: 'Armenia', lat: 40.3, lng: 45.0 },
  'Asia/Baku': { country: 'Azerbaijan', lat: 40.3, lng: 47.8 },
  'Asia/Tbilisi': { country: 'Georgia', lat: 42.0, lng: 43.5 },
  'Asia/Istanbul': { country: 'Türkiye', lat: 39.0, lng: 35.0 },
  'Europe/Istanbul': { country: 'Türkiye', lat: 39.0, lng: 35.0 },

  /* ── East and South-East Asia ── */
  'Asia/Singapore': { country: 'Singapore', lat: 1.35, lng: 103.82 },
  'Asia/Kuala_Lumpur': { country: 'Malaysia', lat: 3.9, lng: 102.3 },
  'Asia/Bangkok': { country: 'Thailand', lat: 15.0, lng: 101.0 },
  'Asia/Ho_Chi_Minh': { country: 'Vietnam', lat: 14.1, lng: 108.3 },
  'Asia/Yangon': { country: 'Myanmar', lat: 19.8, lng: 96.1 },
  'Asia/Jakarta': { country: 'Indonesia', lat: -2.5, lng: 110.0 },
  'Asia/Manila': { country: 'Philippines', lat: 12.8, lng: 122.0 },
  'Asia/Hong_Kong': { country: 'Hong Kong', lat: 22.32, lng: 114.17 },
  'Asia/Macau': { country: 'Macau', lat: 22.16, lng: 113.55 },
  'Asia/Taipei': { country: 'Taiwan', lat: 23.7, lng: 121.0 },
  'Asia/Shanghai': { country: 'China', lat: 34.5, lng: 108.0 },
  'Asia/Tokyo': { country: 'Japan', lat: 36.5, lng: 138.0 },
  'Asia/Seoul': { country: 'South Korea', lat: 36.5, lng: 127.8 },
  'Asia/Ulaanbaatar': { country: 'Mongolia', lat: 46.9, lng: 103.8 },

  /* ── Europe ── */
  'Europe/London': { country: 'United Kingdom', lat: 54.0, lng: -2.5 },
  'Europe/Dublin': { country: 'Ireland', lat: 53.2, lng: -8.0 },
  'Europe/Paris': { country: 'France', lat: 46.6, lng: 2.4 },
  'Europe/Berlin': { country: 'Germany', lat: 51.2, lng: 10.4 },
  'Europe/Madrid': { country: 'Spain', lat: 40.2, lng: -3.6 },
  'Europe/Rome': { country: 'Italy', lat: 42.8, lng: 12.6 },
  'Europe/Amsterdam': { country: 'Netherlands', lat: 52.2, lng: 5.4 },
  'Europe/Brussels': { country: 'Belgium', lat: 50.6, lng: 4.6 },
  'Europe/Luxembourg': { country: 'Luxembourg', lat: 49.8, lng: 6.1 },
  'Europe/Zurich': { country: 'Switzerland', lat: 46.8, lng: 8.2 },
  'Europe/Vienna': { country: 'Austria', lat: 47.6, lng: 14.1 },
  'Europe/Stockholm': { country: 'Sweden', lat: 62.0, lng: 15.5 },
  'Europe/Oslo': { country: 'Norway', lat: 61.0, lng: 9.0 },
  'Europe/Copenhagen': { country: 'Denmark', lat: 56.0, lng: 10.0 },
  'Europe/Helsinki': { country: 'Finland', lat: 64.0, lng: 26.0 },
  'Europe/Reykjavik': { country: 'Iceland', lat: 64.9, lng: -18.6 },
  'Europe/Warsaw': { country: 'Poland', lat: 52.1, lng: 19.4 },
  'Europe/Prague': { country: 'Czechia', lat: 49.8, lng: 15.4 },
  'Europe/Bratislava': { country: 'Slovakia', lat: 48.7, lng: 19.5 },
  'Europe/Budapest': { country: 'Hungary', lat: 47.2, lng: 19.4 },
  'Europe/Bucharest': { country: 'Romania', lat: 45.9, lng: 25.0 },
  'Europe/Sofia': { country: 'Bulgaria', lat: 42.7, lng: 25.3 },
  'Europe/Belgrade': { country: 'Serbia', lat: 44.0, lng: 20.9 },
  'Europe/Zagreb': { country: 'Croatia', lat: 45.1, lng: 15.5 },
  'Europe/Ljubljana': { country: 'Slovenia', lat: 46.1, lng: 14.8 },
  'Europe/Vilnius': { country: 'Lithuania', lat: 55.2, lng: 23.9 },
  'Europe/Riga': { country: 'Latvia', lat: 56.9, lng: 24.9 },
  'Europe/Tallinn': { country: 'Estonia', lat: 58.6, lng: 25.0 },
  'Europe/Minsk': { country: 'Belarus', lat: 53.7, lng: 27.9 },
  'Europe/Lisbon': { country: 'Portugal', lat: 39.6, lng: -8.0 },
  'Europe/Athens': { country: 'Greece', lat: 39.0, lng: 22.0 },
  'Europe/Malta': { country: 'Malta', lat: 35.9, lng: 14.4 },
  'Europe/Moscow': { country: 'Russia', lat: 56.0, lng: 40.0 },
  'Europe/Kyiv': { country: 'Ukraine', lat: 49.0, lng: 32.0 },

  /* ── Africa ── */
  'Africa/Cairo': { country: 'Egypt', lat: 26.8, lng: 30.8 },
  'Africa/Lagos': { country: 'Nigeria', lat: 9.1, lng: 8.7 },
  'Africa/Accra': { country: 'Ghana', lat: 7.9, lng: -1.0 },
  'Africa/Abidjan': { country: "Côte d'Ivoire", lat: 7.5, lng: -5.5 },
  'Africa/Dakar': { country: 'Senegal', lat: 14.5, lng: -14.5 },
  'Africa/Nairobi': { country: 'Kenya', lat: 0.2, lng: 37.9 },
  'Africa/Kampala': { country: 'Uganda', lat: 1.4, lng: 32.3 },
  'Africa/Dar_es_Salaam': { country: 'Tanzania', lat: -6.4, lng: 34.9 },
  'Africa/Addis_Ababa': { country: 'Ethiopia', lat: 9.1, lng: 40.5 },
  'Africa/Khartoum': { country: 'Sudan', lat: 15.6, lng: 30.2 },
  'Africa/Kinshasa': { country: 'DR Congo', lat: -4.0, lng: 21.8 },
  'Africa/Johannesburg': { country: 'South Africa', lat: -29.0, lng: 25.0 },
  'Africa/Harare': { country: 'Zimbabwe', lat: -19.0, lng: 29.9 },
  'Africa/Lusaka': { country: 'Zambia', lat: -13.1, lng: 27.9 },
  'Africa/Maputo': { country: 'Mozambique', lat: -18.7, lng: 35.5 },
  'Africa/Windhoek': { country: 'Namibia', lat: -22.6, lng: 17.1 },
  'Africa/Casablanca': { country: 'Morocco', lat: 31.8, lng: -7.1 },
  'Africa/Algiers': { country: 'Algeria', lat: 28.0, lng: 2.6 },
  'Africa/Tunis': { country: 'Tunisia', lat: 34.0, lng: 9.6 },
  'Africa/Tripoli': { country: 'Libya', lat: 27.0, lng: 17.2 },
  'Indian/Mauritius': { country: 'Mauritius', lat: -20.2, lng: 57.6 },

  /* ── The Americas ── */
  'America/New_York': { country: 'United States', lat: 40.0, lng: -77.0 },
  'America/Detroit': { country: 'United States', lat: 44.3, lng: -85.4 },
  'America/Chicago': { country: 'United States', lat: 38.5, lng: -92.0 },
  'America/Denver': { country: 'United States', lat: 39.5, lng: -107.0 },
  'America/Phoenix': { country: 'United States', lat: 34.3, lng: -111.7 },
  'America/Los_Angeles': { country: 'United States', lat: 38.0, lng: -120.5 },
  'America/Anchorage': { country: 'United States', lat: 63.0, lng: -152.0 },
  'Pacific/Honolulu': { country: 'United States', lat: 20.8, lng: -156.3 },
  'America/Puerto_Rico': { country: 'Puerto Rico', lat: 18.2, lng: -66.5 },
  'America/Toronto': { country: 'Canada', lat: 47.0, lng: -80.0 },
  'America/Halifax': { country: 'Canada', lat: 45.5, lng: -63.5 },
  'America/St_Johns': { country: 'Canada', lat: 48.5, lng: -56.0 },
  'America/Winnipeg': { country: 'Canada', lat: 53.0, lng: -98.0 },
  'America/Regina': { country: 'Canada', lat: 52.5, lng: -106.0 },
  'America/Edmonton': { country: 'Canada', lat: 54.5, lng: -114.0 },
  'America/Vancouver': { country: 'Canada', lat: 53.0, lng: -124.0 },
  'America/Mexico_City': { country: 'Mexico', lat: 23.0, lng: -102.0 },
  'America/Guatemala': { country: 'Guatemala', lat: 15.5, lng: -90.3 },
  'America/Costa_Rica': { country: 'Costa Rica', lat: 9.9, lng: -84.1 },
  'America/Panama': { country: 'Panama', lat: 8.5, lng: -80.1 },
  'America/Havana': { country: 'Cuba', lat: 21.8, lng: -79.0 },
  'America/Bogota': { country: 'Colombia', lat: 4.0, lng: -73.0 },
  'America/Caracas': { country: 'Venezuela', lat: 7.0, lng: -66.0 },
  'America/Guayaquil': { country: 'Ecuador', lat: -1.5, lng: -78.5 },
  'America/Lima': { country: 'Peru', lat: -9.2, lng: -75.0 },
  'America/La_Paz': { country: 'Bolivia', lat: -16.7, lng: -64.7 },
  'America/Asuncion': { country: 'Paraguay', lat: -23.4, lng: -58.4 },
  'America/Montevideo': { country: 'Uruguay', lat: -32.8, lng: -56.0 },
  'America/Sao_Paulo': { country: 'Brazil', lat: -20.0, lng: -47.0 },
  'America/Argentina/Buenos_Aires': { country: 'Argentina', lat: -35.0, lng: -64.0 },
  'America/Santiago': { country: 'Chile', lat: -35.0, lng: -71.3 },

  /* ── Oceania ── */
  'Australia/Sydney': { country: 'Australia', lat: -33.0, lng: 147.0 },
  'Australia/Melbourne': { country: 'Australia', lat: -37.0, lng: 144.5 },
  'Australia/Brisbane': { country: 'Australia', lat: -22.5, lng: 145.0 },
  'Australia/Adelaide': { country: 'Australia', lat: -30.5, lng: 135.5 },
  'Australia/Perth': { country: 'Australia', lat: -26.0, lng: 121.0 },
  'Australia/Darwin': { country: 'Australia', lat: -19.5, lng: 133.5 },
  'Australia/Hobart': { country: 'Australia', lat: -42.0, lng: 146.6 },
  'Pacific/Auckland': { country: 'New Zealand', lat: -41.0, lng: 174.0 },
  'Pacific/Fiji': { country: 'Fiji', lat: -17.8, lng: 178.0 }
};

/* Region prefix → a continental fallback for a zone we don't list, so an
   unlisted visitor still shows up somewhere truthful rather than being
   dropped. These are continent centroids and are marked as such. */
const REGION_FALLBACK = {
  Asia: { country: 'Asia', lat: 34.0, lng: 100.0 },
  Europe: { country: 'Europe', lat: 50.0, lng: 10.0 },
  Africa: { country: 'Africa', lat: 2.0, lng: 21.0 },
  America: { country: 'Americas', lat: 15.0, lng: -90.0 },
  Australia: { country: 'Australia', lat: -25.0, lng: 134.0 },
  Pacific: { country: 'Pacific', lat: -10.0, lng: -160.0 },
  Atlantic: { country: 'Atlantic', lat: 30.0, lng: -30.0 },
  Indian: { country: 'Indian Ocean', lat: -10.0, lng: 75.0 }
};

/* UTC is not a place. Browsers report it for VPNs, servers, hardened
   privacy settings and misconfigured machines, so it resolves to a
   country-less session with no coordinate — the globe leaves it off
   rather than dropping a pin on Null Island. */
const PLACELESS = new Set(['UTC', 'Etc/UTC', 'Etc/GMT', 'GMT', 'Universal', 'Zulu']);

/**
 * Resolve an IANA timezone to a country and an approximate point.
 * Returns null when the zone tells us nothing we can honestly plot.
 */
export const resolveTimezone = (timezone) => {
  if (!timezone) return null;
  if (PLACELESS.has(timezone)) return null;

  const exact = TIMEZONE_ATLAS[timezone];
  if (exact) return { ...exact, precision: 'timezone' };

  const region = REGION_FALLBACK[String(timezone).split('/')[0]];
  return region ? { ...region, precision: 'region' } : null;
};
