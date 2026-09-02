/* ═══════════════════════════════════════════════════════════════════
   CITY ATLAS
   The only source of a genuine city on a session: the delivery address a
   customer typed on an order they actually placed. A timezone can never
   give this — see timezoneAtlas.js — so a pin only moves to a real city
   once there is a real order behind it.

   Addresses are free text, so lookup normalises case, punctuation and the
   older names people still type (Bombay, Bangalore, Baroda). An address we
   can't place leaves the coordinate where it was and keeps its coarser
   precision, rather than inventing a point.
═══════════════════════════════════════════════════════════════════ */
import { TIMEZONE_ATLAS } from './timezoneAtlas.js';

/* Indian cities, since that is where Nuva delivers. */
const CITIES = {
  mumbai: [19.08, 72.88],
  delhi: [28.61, 77.21],
  'new delhi': [28.61, 77.21],
  bengaluru: [12.97, 77.59],
  hyderabad: [17.39, 78.49],
  ahmedabad: [23.03, 72.58],
  chennai: [13.08, 80.27],
  kolkata: [22.57, 88.36],
  surat: [21.17, 72.83],
  pune: [18.52, 73.86],
  jaipur: [26.91, 75.79],
  lucknow: [26.85, 80.95],
  kanpur: [26.45, 80.33],
  nagpur: [21.15, 79.09],
  indore: [22.72, 75.86],
  thane: [19.22, 72.98],
  bhopal: [23.26, 77.41],
  visakhapatnam: [17.69, 83.22],
  patna: [25.59, 85.14],
  vadodara: [22.31, 73.18],
  ghaziabad: [28.67, 77.43],
  ludhiana: [30.90, 75.86],
  agra: [27.18, 78.01],
  nashik: [19.99, 73.79],
  faridabad: [28.41, 77.32],
  meerut: [28.98, 77.71],
  rajkot: [22.30, 70.80],
  varanasi: [25.32, 82.97],
  srinagar: [34.08, 74.80],
  aurangabad: [19.88, 75.34],
  amritsar: [31.63, 74.87],
  'navi mumbai': [19.03, 73.03],
  prayagraj: [25.44, 81.83],
  ranchi: [23.34, 85.31],
  howrah: [22.59, 88.26],
  coimbatore: [11.02, 76.96],
  jabalpur: [23.18, 79.99],
  gwalior: [26.22, 78.18],
  vijayawada: [16.51, 80.65],
  jodhpur: [26.24, 73.02],
  madurai: [9.93, 78.12],
  raipur: [21.25, 81.63],
  kota: [25.21, 75.86],
  guwahati: [26.14, 91.74],
  chandigarh: [30.73, 76.78],
  solapur: [17.66, 75.91],
  hubballi: [15.36, 75.12],
  mysuru: [12.30, 76.64],
  tiruchirappalli: [10.79, 78.70],
  bareilly: [28.37, 79.43],
  aligarh: [27.90, 78.08],
  tiruppur: [11.11, 77.34],
  moradabad: [28.84, 78.77],
  jalandhar: [31.33, 75.58],
  bhubaneswar: [20.30, 85.82],
  salem: [11.66, 78.15],
  warangal: [17.97, 79.59],
  guntur: [16.31, 80.44],
  saharanpur: [29.97, 77.55],
  gorakhpur: [26.76, 83.37],
  bikaner: [28.02, 73.31],
  amravati: [20.93, 77.75],
  noida: [28.54, 77.39],
  jamshedpur: [22.80, 86.20],
  bhilai: [21.19, 81.28],
  cuttack: [20.46, 85.88],
  kochi: [9.93, 76.27],
  nellore: [14.44, 79.99],
  bhavnagar: [21.76, 72.15],
  dehradun: [30.32, 78.03],
  durgapur: [23.52, 87.31],
  asansol: [23.68, 86.99],
  rourkela: [22.26, 84.85],
  nanded: [19.15, 77.32],
  kolhapur: [16.70, 74.24],
  ajmer: [26.45, 74.64],
  akola: [20.71, 77.00],
  kalaburagi: [17.33, 76.83],
  jamnagar: [22.47, 70.06],
  ujjain: [23.18, 75.78],
  siliguri: [26.73, 88.40],
  jhansi: [25.45, 78.57],
  jammu: [32.73, 74.87],
  sangli: [16.85, 74.58],
  mangaluru: [12.91, 74.86],
  erode: [11.34, 77.72],
  belagavi: [15.85, 74.50],
  tirunelveli: [8.71, 77.76],
  gaya: [24.79, 85.00],
  jalgaon: [21.01, 75.56],
  udaipur: [24.58, 73.71],
  thiruvananthapuram: [8.52, 76.94],
  kozhikode: [11.26, 75.78],
  thrissur: [10.53, 76.21],
  kollam: [8.89, 76.61],
  alappuzha: [9.50, 76.34],
  kannur: [11.87, 75.37],
  kottayam: [9.59, 76.52],
  palakkad: [10.78, 76.65],
  gurugram: [28.46, 77.03],
  panaji: [15.49, 73.83],
  shimla: [31.10, 77.17],
  puducherry: [11.93, 79.83],
  anand: [22.56, 72.95],
  bharuch: [21.71, 72.99],
  gandhinagar: [23.22, 72.65],
  junagadh: [21.52, 70.46],
  nadiad: [22.69, 72.86],
  mehsana: [23.60, 72.40],
  navsari: [20.95, 72.93],
  valsad: [20.61, 72.93],
  vapi: [20.37, 72.90],
  porbandar: [21.64, 69.61],
  bhuj: [23.24, 69.67],
  morbi: [22.82, 70.84],
  surendranagar: [22.73, 71.65],
  patan: [23.85, 72.13],
  bhavani: [11.45, 77.68],
  shillong: [25.58, 91.89],
  imphal: [24.82, 93.94],
  agartala: [23.83, 91.28],
  aizawl: [23.73, 92.72],
  itanagar: [27.08, 93.61],
  kohima: [25.67, 94.11],
  gangtok: [27.33, 88.61],
  dispur: [26.14, 91.79],
  haridwar: [29.95, 78.16],
  rishikesh: [30.09, 78.27],
  ambala: [30.38, 76.78],
  panipat: [29.39, 76.97],
  karnal: [29.69, 76.99],
  hisar: [29.15, 75.72],
  rohtak: [28.90, 76.61],
  sonipat: [28.99, 77.02],
  bathinda: [30.21, 74.95],
  patiala: [30.34, 76.39],
  mohali: [30.70, 76.72],
  panchkula: [30.69, 76.85],
  bilaspur: [22.08, 82.15],
  korba: [22.35, 82.68],
  satna: [24.58, 80.83],
  rewa: [24.53, 81.30],
  sagar: [23.84, 78.74],
  dewas: [22.96, 76.06],
  ratlam: [23.33, 75.04],
  bhagalpur: [25.24, 86.99],
  muzaffarpur: [26.12, 85.39],
  darbhanga: [26.15, 85.90],
  purnia: [25.78, 87.47],
  hajipur: [25.69, 85.21],
  bokaro: [23.67, 86.15],
  hazaribagh: [23.99, 85.36],
  deoghar: [24.48, 86.70],
  berhampur: [19.31, 84.79],
  sambalpur: [21.47, 83.97],
  puri: [19.81, 85.83],
  balasore: [21.49, 86.93],
  tirupati: [13.63, 79.42],
  rajahmundry: [17.00, 81.78],
  kakinada: [16.99, 82.25],
  kurnool: [15.83, 78.04],
  anantapur: [14.68, 77.60],
  kadapa: [14.47, 78.82],
  nizamabad: [18.67, 78.09],
  karimnagar: [18.44, 79.13],
  khammam: [17.25, 80.15],
  vellore: [12.92, 79.13],
  thanjavur: [10.79, 79.14],
  dindigul: [10.36, 77.98],
  kanchipuram: [12.84, 79.70],
  cuddalore: [11.75, 79.77],
  nagercoil: [8.18, 77.43],
  hosur: [12.74, 77.83],
  davangere: [14.47, 75.92],
  ballari: [15.14, 76.92],
  shivamogga: [13.93, 75.57],
  tumakuru: [13.34, 77.10],
  udupi: [13.34, 74.75],
  hassan: [13.01, 76.10],
  bidar: [17.91, 77.52],
  raichur: [16.21, 77.36],
  latur: [18.40, 76.57],
  ahmednagar: [19.10, 74.75],
  satara: [17.69, 74.00],
  chandrapur: [19.95, 79.30],
  nandurbar: [21.37, 74.24],
  ratnagiri: [16.99, 73.31],
  alwar: [27.55, 76.63],
  bhilwara: [25.35, 74.64],
  sikar: [27.61, 75.14],
  pali: [25.77, 73.32],
  sriganganagar: [29.92, 73.88],
  mathura: [27.49, 77.67],
  firozabad: [27.15, 78.40],
  jaunpur: [25.75, 82.68],
  ayodhya: [26.80, 82.20],
  rampur: [28.81, 79.03],
  shahjahanpur: [27.88, 79.91],
  muzaffarnagar: [29.47, 77.70],
  bulandshahr: [28.40, 77.85],
  etawah: [26.78, 79.02],
  mirzapur: [25.15, 82.57],
  loni: [28.75, 77.29],
  bhiwandi: [19.30, 73.06],
  ulhasnagar: [19.22, 73.15],
  malegaon: [20.55, 74.53],
  maheshtala: [22.50, 88.25],
  ambattur: [13.10, 80.16],
  avadi: [13.12, 80.10],
  tambaram: [12.92, 80.13],
  kalyan: [19.24, 73.13],
  vasai: [19.39, 72.83],
  mira: [19.29, 72.87],
  dombivli: [19.22, 73.09],
  panvel: [18.99, 73.11],
  ichalkaranji: [16.69, 74.46],
  barrackpore: [22.76, 88.37],
  bardhaman: [23.26, 87.86],
  kharagpur: [22.35, 87.32],
  haldia: [22.06, 88.11],
  malda: [25.01, 88.14],
  krishnanagar: [23.40, 88.50]
};

/* The names people still type for cities that were renamed. */
const ALIASES = {
  bombay: 'mumbai',
  bangalore: 'bengaluru',
  banglore: 'bengaluru',
  calcutta: 'kolkata',
  madras: 'chennai',
  poona: 'pune',
  baroda: 'vadodara',
  gurgaon: 'gurugram',
  trivandrum: 'thiruvananthapuram',
  calicut: 'kozhikode',
  cochin: 'kochi',
  ernakulam: 'kochi',
  trichur: 'thrissur',
  quilon: 'kollam',
  alleppey: 'alappuzha',
  cannanore: 'kannur',
  palghat: 'palakkad',
  trichy: 'tiruchirappalli',
  tiruchi: 'tiruchirappalli',
  mysore: 'mysuru',
  mangalore: 'mangaluru',
  hubli: 'hubballi',
  gulbarga: 'kalaburagi',
  belgaum: 'belagavi',
  bellary: 'ballari',
  shimoga: 'shivamogga',
  tumkur: 'tumakuru',
  allahabad: 'prayagraj',
  faizabad: 'ayodhya',
  benares: 'varanasi',
  banaras: 'varanasi',
  pondicherry: 'puducherry',
  panjim: 'panaji',
  goa: 'panaji',
  simla: 'shimla',
  waltair: 'visakhapatnam',
  vizag: 'visakhapatnam',
  'greater noida': 'noida',
  'navi mumbai': 'navi mumbai',
  'thane west': 'thane',
  'thane east': 'thane',
  secunderabad: 'hyderabad',
  'new bombay': 'navi mumbai'
};

/* Global cities, folded in from the timezone atlas' own country list so a
   delivery outside India still places. Built once. */
let index = null;

const normalise = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')      // drop digits, dots, hyphens, commas
    .replace(/\s+/g, ' ')
    .trim();

const titleCase = (name) =>
  name.replace(/(^|\s)([a-z])/g, (_, space, letter) => space + letter.toUpperCase());

const build = () => {
  const out = new Map();
  for (const [name, [lat, lng]] of Object.entries(CITIES)) {
    out.set(name, { lat, lng, city: titleCase(name) });
  }
  // Aliases resolve to the canonical entry, so "Baroda" and "Vadodara"
  // are one row on the live map rather than two.
  for (const [alias, target] of Object.entries(ALIASES)) {
    const hit = out.get(target);
    if (hit) out.set(alias, hit);
  }
  for (const zone of Object.keys(TIMEZONE_ATLAS)) {
    const leaf = normalise(zone.split('/').pop().replace(/_/g, ' '));
    if (leaf && !out.has(leaf)) {
      const { lat, lng } = TIMEZONE_ATLAS[zone];
      out.set(leaf, { lat, lng, city: titleCase(leaf), coarse: true });
    }
  }
  return out;
};

const placed = (entry, precision) => ({
  city: entry.city,
  lat: entry.lat,
  lng: entry.lng,
  precision
});

/**
 * Resolve a delivery-address city to a canonical name and a coordinate.
 * Returns null when the name isn't one we can place — the caller keeps
 * whatever coarser location it already had.
 */
export const resolveCity = (city) => {
  if (!city) return null;
  if (!index) index = build();

  const name = normalise(city);
  if (!name) return null;

  const exact = index.get(name);
  if (exact) return placed(exact, exact.coarse ? 'timezone' : 'address');

  /* "Vadodara Gujarat", "Andheri East, Mumbai" — take the longest listed
     city name that appears as a whole word in the string. */
  let best = null;
  for (const [known, entry] of index) {
    if (entry.coarse || known.length < 5) continue;
    if (!name.includes(known)) continue;
    const boundary = new RegExp(`(^|\\s)${known}(\\s|$)`).test(name);
    if (boundary && (!best || known.length > best.name.length)) best = { name: known, entry };
  }
  return best ? placed(best.entry, 'address') : null;
};
