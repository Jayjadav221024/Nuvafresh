/* ═══════════════════════════════════════════════════════════════════
   TIMEZONE ATLAS
   The browser reports its IANA timezone, and an IANA zone is named after a
   real place — so it resolves to a country and an approximate point on the
   globe without any IP lookup, third-party service, or tracking cookie.

   It is coarse on purpose: a zone tells you the country and roughly where,
   never a street. Anything finer on a Nuva session comes from the delivery
   address on an actual order.
═══════════════════════════════════════════════════════════════════ */
export const TIMEZONE_ATLAS = {
  'Asia/Kolkata': { city: 'Kolkata', country: 'India', lat: 22.57, lng: 88.36 },
  'Asia/Calcutta': { city: 'Kolkata', country: 'India', lat: 22.57, lng: 88.36 },
  'Asia/Karachi': { city: 'Karachi', country: 'Pakistan', lat: 24.86, lng: 67.01 },
  'Asia/Dhaka': { city: 'Dhaka', country: 'Bangladesh', lat: 23.81, lng: 90.41 },
  'Asia/Colombo': { city: 'Colombo', country: 'Sri Lanka', lat: 6.93, lng: 79.86 },
  'Asia/Kathmandu': { city: 'Kathmandu', country: 'Nepal', lat: 27.72, lng: 85.32 },
  'Asia/Dubai': { city: 'Dubai', country: 'United Arab Emirates', lat: 25.20, lng: 55.27 },
  'Asia/Qatar': { city: 'Doha', country: 'Qatar', lat: 25.29, lng: 51.53 },
  'Asia/Riyadh': { city: 'Riyadh', country: 'Saudi Arabia', lat: 24.71, lng: 46.68 },
  'Asia/Kuwait': { city: 'Kuwait City', country: 'Kuwait', lat: 29.38, lng: 47.99 },
  'Asia/Muscat': { city: 'Muscat', country: 'Oman', lat: 23.59, lng: 58.41 },
  'Asia/Singapore': { city: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82 },
  'Asia/Kuala_Lumpur': { city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.14, lng: 101.69 },
  'Asia/Bangkok': { city: 'Bangkok', country: 'Thailand', lat: 13.76, lng: 100.50 },
  'Asia/Jakarta': { city: 'Jakarta', country: 'Indonesia', lat: -6.21, lng: 106.85 },
  'Asia/Manila': { city: 'Manila', country: 'Philippines', lat: 14.60, lng: 120.98 },
  'Asia/Hong_Kong': { city: 'Hong Kong', country: 'Hong Kong', lat: 22.32, lng: 114.17 },
  'Asia/Shanghai': { city: 'Shanghai', country: 'China', lat: 31.23, lng: 121.47 },
  'Asia/Tokyo': { city: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69 },
  'Asia/Seoul': { city: 'Seoul', country: 'South Korea', lat: 37.57, lng: 126.98 },
  'Asia/Jerusalem': { city: 'Jerusalem', country: 'Israel', lat: 31.77, lng: 35.21 },
  'Asia/Istanbul': { city: 'Istanbul', country: 'Türkiye', lat: 41.01, lng: 28.98 },
  'Europe/Istanbul': { city: 'Istanbul', country: 'Türkiye', lat: 41.01, lng: 28.98 },
  'Europe/London': { city: 'London', country: 'United Kingdom', lat: 51.51, lng: -0.13 },
  'Europe/Dublin': { city: 'Dublin', country: 'Ireland', lat: 53.35, lng: -6.26 },
  'Europe/Paris': { city: 'Paris', country: 'France', lat: 48.86, lng: 2.35 },
  'Europe/Berlin': { city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.40 },
  'Europe/Madrid': { city: 'Madrid', country: 'Spain', lat: 40.42, lng: -3.70 },
  'Europe/Rome': { city: 'Rome', country: 'Italy', lat: 41.90, lng: 12.50 },
  'Europe/Amsterdam': { city: 'Amsterdam', country: 'Netherlands', lat: 52.37, lng: 4.90 },
  'Europe/Brussels': { city: 'Brussels', country: 'Belgium', lat: 50.85, lng: 4.35 },
  'Europe/Zurich': { city: 'Zurich', country: 'Switzerland', lat: 47.38, lng: 8.54 },
  'Europe/Vienna': { city: 'Vienna', country: 'Austria', lat: 48.21, lng: 16.37 },
  'Europe/Stockholm': { city: 'Stockholm', country: 'Sweden', lat: 59.33, lng: 18.07 },
  'Europe/Oslo': { city: 'Oslo', country: 'Norway', lat: 59.91, lng: 10.75 },
  'Europe/Copenhagen': { city: 'Copenhagen', country: 'Denmark', lat: 55.68, lng: 12.57 },
  'Europe/Helsinki': { city: 'Helsinki', country: 'Finland', lat: 60.17, lng: 24.94 },
  'Europe/Warsaw': { city: 'Warsaw', country: 'Poland', lat: 52.23, lng: 21.01 },
  'Europe/Prague': { city: 'Prague', country: 'Czechia', lat: 50.08, lng: 14.44 },
  'Europe/Lisbon': { city: 'Lisbon', country: 'Portugal', lat: 38.72, lng: -9.14 },
  'Europe/Athens': { city: 'Athens', country: 'Greece', lat: 37.98, lng: 23.73 },
  'Europe/Moscow': { city: 'Moscow', country: 'Russia', lat: 55.76, lng: 37.62 },
  'Europe/Kyiv': { city: 'Kyiv', country: 'Ukraine', lat: 50.45, lng: 30.52 },
  'Africa/Cairo': { city: 'Cairo', country: 'Egypt', lat: 30.04, lng: 31.24 },
  'Africa/Lagos': { city: 'Lagos', country: 'Nigeria', lat: 6.52, lng: 3.38 },
  'Africa/Nairobi': { city: 'Nairobi', country: 'Kenya', lat: -1.29, lng: 36.82 },
  'Africa/Johannesburg': { city: 'Johannesburg', country: 'South Africa', lat: -26.20, lng: 28.05 },
  'Africa/Casablanca': { city: 'Casablanca', country: 'Morocco', lat: 33.57, lng: -7.59 },
  'America/New_York': { city: 'New York', country: 'United States', lat: 40.71, lng: -74.01 },
  'America/Detroit': { city: 'Detroit', country: 'United States', lat: 42.33, lng: -83.05 },
  'America/Chicago': { city: 'Chicago', country: 'United States', lat: 41.88, lng: -87.63 },
  'America/Denver': { city: 'Denver', country: 'United States', lat: 39.74, lng: -104.99 },
  'America/Phoenix': { city: 'Phoenix', country: 'United States', lat: 33.45, lng: -112.07 },
  'America/Los_Angeles': { city: 'Los Angeles', country: 'United States', lat: 34.05, lng: -118.24 },
  'America/Anchorage': { city: 'Anchorage', country: 'United States', lat: 61.22, lng: -149.90 },
  'Pacific/Honolulu': { city: 'Honolulu', country: 'United States', lat: 21.31, lng: -157.86 },
  'America/Toronto': { city: 'Toronto', country: 'Canada', lat: 43.65, lng: -79.38 },
  'America/Vancouver': { city: 'Vancouver', country: 'Canada', lat: 49.28, lng: -123.12 },
  'America/Mexico_City': { city: 'Mexico City', country: 'Mexico', lat: 19.43, lng: -99.13 },
  'America/Bogota': { city: 'Bogotá', country: 'Colombia', lat: 4.71, lng: -74.07 },
  'America/Lima': { city: 'Lima', country: 'Peru', lat: -12.05, lng: -77.04 },
  'America/Sao_Paulo': { city: 'São Paulo', country: 'Brazil', lat: -23.55, lng: -46.63 },
  'America/Argentina/Buenos_Aires': { city: 'Buenos Aires', country: 'Argentina', lat: -34.60, lng: -58.38 },
  'America/Santiago': { city: 'Santiago', country: 'Chile', lat: -33.45, lng: -70.67 },
  'Australia/Sydney': { city: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21 },
  'Australia/Melbourne': { city: 'Melbourne', country: 'Australia', lat: -37.81, lng: 144.96 },
  'Australia/Brisbane': { city: 'Brisbane', country: 'Australia', lat: -27.47, lng: 153.03 },
  'Australia/Perth': { city: 'Perth', country: 'Australia', lat: -31.95, lng: 115.86 },
  'Pacific/Auckland': { city: 'Auckland', country: 'New Zealand', lat: -36.85, lng: 174.76 },
  'UTC': { city: 'Unknown', country: 'Unknown', lat: 0, lng: 0 }
};

/* Region prefix → a usable fallback when the exact zone isn't listed, so a
   visitor from an unlisted zone still lands on the right continent rather
   than being dropped. */
const REGION_FALLBACK = {
  Asia: { city: 'Unknown', country: 'Asia', lat: 34.0, lng: 100.0 },
  Europe: { city: 'Unknown', country: 'Europe', lat: 50.0, lng: 10.0 },
  Africa: { city: 'Unknown', country: 'Africa', lat: 2.0, lng: 21.0 },
  America: { city: 'Unknown', country: 'Americas', lat: 15.0, lng: -90.0 },
  Australia: { city: 'Unknown', country: 'Australia', lat: -25.0, lng: 134.0 },
  Pacific: { city: 'Unknown', country: 'Pacific', lat: -10.0, lng: -160.0 },
  Atlantic: { city: 'Unknown', country: 'Atlantic', lat: 30.0, lng: -30.0 },
  Indian: { city: 'Unknown', country: 'Indian Ocean', lat: -10.0, lng: 75.0 }
};

export const resolveTimezone = (timezone) => {
  if (!timezone) return null;
  const exact = TIMEZONE_ATLAS[timezone];
  if (exact) return exact;

  const region = String(timezone).split('/')[0];
  return REGION_FALLBACK[region] || null;
};
