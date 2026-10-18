// TFL Oyster Dashboard — app.js
'use strict';

// ── Default journey data from Oyster CSV (Oct 4, 2026 export) ──
// Used when the user has not imported their own CSV.
const DEFAULT_JOURNEYS = [
  { date: '03-Oct-2026', start: '18:08', end: '19:06', action: 'Tottenham Court Road to Epping', charge: 0.00, credit: 0, note: 'daily cap' },
  { date: '03-Oct-2026', start: '16:42', end: '17:18', action: 'Perivale to Oxford Circus', charge: 0.00, credit: 0, note: 'daily cap' },
  { date: '03-Oct-2026', start: '16:38', end: '',      action: 'Bus journey, route 297', charge: 0.00, credit: 0, note: 'daily cap' },
  { date: '03-Oct-2026', start: '14:27', end: '',      action: 'Bus journey, route 297', charge: 1.70, credit: 0, note: 'daily cap' },
  { date: '03-Oct-2026', start: '12:06', end: '13:01', action: 'Stepney Green to Ealing Broadway', charge: 3.30, credit: 0, note: '' },
  { date: '03-Oct-2026', start: '11:16', end: '11:19', action: 'Bromley by Bow to Bow Road', charge: 2.20, credit: 0, note: '' },
  { date: '03-Oct-2026', start: '11:01', end: '11:12', action: 'West Ham to Bromley by Bow', charge: 2.20, credit: 0, note: '' },
  { date: '03-Oct-2026', start: '10:53', end: '11:00', action: 'Plaistow to West Ham', charge: 2.20, credit: 0, note: '' },
  { date: '03-Oct-2026', start: '10:46', end: '10:52', action: 'Upton Park to Plaistow', charge: 2.20, credit: 0, note: '' },
  { date: '03-Oct-2026', start: '09:32', end: '10:25', action: 'Epping to East Ham', charge: 2.50, credit: 0, note: '' },
  { date: '01-Oct-2026', start: '18:44', end: '19:19', action: 'Stratford to Epping', charge: 3.40, credit: 0, note: '' },
  { date: '01-Oct-2026', start: '06:07', end: '06:47', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '30-Sep-2026', start: '19:54', end: '20:57', action: 'Custom House DLR to Epping', charge: 2.50, credit: 0, note: '' },
  { date: '30-Sep-2026', start: '08:17', end: '08:44', action: 'Stratford to Custom House DLR', charge: 2.30, credit: 0, note: '' },
  { date: '30-Sep-2026', start: '06:08', end: '06:41', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '30-Sep-2026', start: '06:08', end: '',      action: 'Topped up, Epping', charge: 0, credit: 30.00, note: '' },
  { date: '24-Sep-2026', start: '19:10', end: '19:55', action: 'Stratford to Epping', charge: 2.50, credit: 0, note: '' },
  { date: '24-Sep-2026', start: '07:10', end: '07:48', action: 'Epping to Stratford', charge: 3.40, credit: 0, note: '' },
  { date: '20-Sep-2026', start: '21:40', end: '22:38', action: "Leicester Square to Epping", charge: 4.00, credit: 0, note: '' },
  { date: '20-Sep-2026', start: '13:57', end: '14:48', action: "Epping to Tottenham Court Road", charge: 4.00, credit: 0, note: '' },
  { date: '19-Sep-2026', start: '16:30', end: '16:51', action: 'Woodford to Epping', charge: 2.40, credit: 0, note: '' },
  { date: '19-Sep-2026', start: '11:48', end: '12:12', action: 'Epping to Woodford', charge: 2.40, credit: 0, note: '' },
  { date: '19-Sep-2026', start: '11:48', end: '',      action: 'Topped up, Epping', charge: 0, credit: 20.00, note: '' },
  { date: '07-Sep-2026', start: '21:37', end: '22:33', action: "St Paul's to Epping", charge: 4.00, credit: 0, note: '' },
  { date: '07-Sep-2026', start: '20:37', end: '21:27', action: 'Carshalton [National Rail] to City Thameslink [National Rail]', charge: 4.40, credit: 0, note: '' },
  { date: '07-Sep-2026', start: '17:47', end: '',      action: 'Bus journey, route SL7', charge: 1.75, credit: 0, note: '' },
  { date: '07-Sep-2026', start: '15:37', end: '16:41', action: 'Stratford to West Croydon [London Overground/National Rail]', charge: 2.50, credit: 0, note: '' },
  { date: '07-Sep-2026', start: '06:14', end: '06:47', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '05-Sep-2026', start: '20:46', end: '21:55', action: 'Euston [London Underground] to Epping', charge: 4.00, credit: 0, note: '' },
  { date: '05-Sep-2026', start: '05:38', end: '06:32', action: 'Epping to Euston Square', charge: 4.00, credit: 0, note: '' },
  { date: '05-Sep-2026', start: '05:38', end: '',      action: 'Topped up, Epping', charge: 0, credit: 20.00, note: '' },
  { date: '03-Sep-2026', start: '18:46', end: '19:29', action: 'Stratford to Epping', charge: 3.40, credit: 0, note: '' },
  { date: '03-Sep-2026', start: '06:08', end: '06:43', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '02-Sep-2026', start: '15:57', end: '16:34', action: 'Stratford to Epping', charge: 2.50, credit: 0, note: '' },
  { date: '02-Sep-2026', start: '06:13', end: '06:49', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '01-Sep-2026', start: '15:56', end: '16:35', action: 'Stratford to Epping', charge: 2.50, credit: 0, note: '' },
  { date: '01-Sep-2026', start: '06:11', end: '06:47', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '29-Aug-2026', start: '08:16', end: '09:16', action: "Epping to Kings Cross (Met, Circle, H&C lines)", charge: 4.00, credit: 0, note: '' },
  { date: '29-Aug-2026', start: '08:15', end: '',      action: 'Topped up, Epping', charge: 0, credit: 20.00, note: '' },
  { date: '27-Aug-2026', start: '06:10', end: '07:09', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '26-Aug-2026', start: '13:41', end: '14:41', action: "Kings Cross (Met, Circle, H&C lines) to Epping", charge: 4.00, credit: 0, note: '' },
  { date: '21-Aug-2026', start: '06:16', end: '07:17', action: "Epping to Kings Cross (Met, Circle, H&C lines)", charge: 4.00, credit: 0, note: '' },
  { date: '20-Aug-2026', start: '20:26', end: '21:04', action: 'Stratford to Epping', charge: 2.50, credit: 0, note: '' },
  { date: '20-Aug-2026', start: '06:08', end: '06:41', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '19-Aug-2026', start: '21:28', end: '22:11', action: 'Stratford to Epping', charge: 2.50, credit: 0, note: '' },
  { date: '19-Aug-2026', start: '21:28', end: '',      action: 'Automated Refund, Stratford', charge: 0, credit: 4.50, note: '' },
  { date: '19-Aug-2026', start: '06:15', end: '06:54', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '18-Aug-2026', start: '13:52', end: '14:34', action: 'Stratford to Epping', charge: 2.50, credit: 0, note: '' },
  { date: '18-Aug-2026', start: '13:52', end: '',      action: 'Topped up, Stratford', charge: 0, credit: 20.00, note: '' },
  { date: '18-Aug-2026', start: '06:08', end: '13:52', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
  { date: '15-Aug-2026', start: '18:31', end: '19:30', action: 'Euston Square to Epping', charge: 4.00, credit: 0, note: '' },
  { date: '14-Aug-2026', start: '09:57', end: '10:50', action: 'Epping to Euston Square', charge: 4.00, credit: 0, note: '' },
  { date: '13-Aug-2026', start: '18:37', end: '19:28', action: 'Stratford to Epping', charge: 3.40, credit: 0, note: '' },
  { date: '13-Aug-2026', start: '06:26', end: '07:03', action: 'Epping to Stratford', charge: 2.50, credit: 0, note: '' },
];

const STORAGE_KEY = 'tfl_tracker_journeys';

// Active dataset — loaded from localStorage if the user imported their own CSV.
let RAW_JOURNEYS = loadJourneys();

function loadJourneys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) {
    console.warn('Could not load saved journeys, using defaults.', e);
  }
  return DEFAULT_JOURNEYS;
}

// ── Geographic station coordinates [lat, lon] ──
// Covers every station that appears in the data plus the surrounding network,
// so the map is honest (true relative positions) and self-maintaining.
const STATION_GEO = {
  // Central line (east)
  'Epping': [51.6937, 0.1139], 'Theydon Bois': [51.6717, 0.1033], 'Debden': [51.6455, 0.0838],
  'Loughton': [51.6412, 0.0552], 'Buckhurst Hill': [51.6266, 0.0471], 'Woodford': [51.6070, 0.0341],
  'South Woodford': [51.5917, 0.0275], 'Snaresbrook': [51.5807, 0.0216], 'Leytonstone': [51.5683, 0.0083],
  'Leyton': [51.5566, -0.0053], 'Stratford': [51.5416, -0.0042], 'Mile End': [51.5252, -0.0334],
  'Bethnal Green': [51.5270, -0.0549], 'Liverpool Street': [51.5178, -0.0823], "St. Paul's": [51.5146, -0.0973],
  'Chancery Lane': [51.5185, -0.1114], 'Holborn': [51.5174, -0.1200], 'Tottenham Court Road': [51.5165, -0.1308],
  'Oxford Circus': [51.5152, -0.1418], 'Bond Street': [51.5142, -0.1494], 'Marble Arch': [51.5136, -0.1586],
  'Lancaster Gate': [51.5119, -0.1756], 'Queensway': [51.5107, -0.1877], 'Notting Hill Gate': [51.5091, -0.1962],
  'Holland Park': [51.5075, -0.2060], "Shepherd's Bush": [51.5047, -0.2187], 'White City': [51.5120, -0.2240],
  'East Acton': [51.5168, -0.2476], 'North Acton': [51.5237, -0.2597], 'Hanger Lane': [51.5302, -0.2933],
  'Perivale': [51.5366, -0.3232], 'Greenford': [51.5423, -0.3456], 'Northolt': [51.5484, -0.3687],
  'South Ruislip': [51.5569, -0.3988], 'Ruislip Gardens': [51.5606, -0.4103], 'West Ruislip': [51.5696, -0.4376],
  'Wanstead': [51.5775, 0.0288], 'Redbridge': [51.5763, 0.0454], 'Gants Hill': [51.5765, 0.0658],
  'Newbury Park': [51.5756, 0.0899], 'Barkingside': [51.5856, 0.0887], 'Fairlop': [51.5959, 0.0912],
  'Hainault': [51.6031, 0.0933], 'Grange Hill': [51.6132, 0.0923], 'Chigwell': [51.6177, 0.0753],
  'Roding Valley': [51.6171, 0.0439],
  // District / H&C (east)
  'East Ham': [51.5390, 0.0518], 'Upton Park': [51.5352, 0.0343], 'Plaistow': [51.5313, 0.0172],
  'West Ham': [51.5287, 0.0053], 'Bromley by Bow': [51.5248, -0.0119], 'Bow Road': [51.5269, -0.0247],
  'Stepney Green': [51.5221, -0.0469], 'Barking': [51.5396, 0.0808],
  // DLR
  'Custom House DLR': [51.5095, 0.0276],
  // Central / Met near King's Cross & Euston
  "King's Cross St. Pancras": [51.5308, -0.1238], 'Euston': [51.5282, -0.1337], 'Euston Square': [51.5258, -0.1357],
  'Great Portland Street': [51.5237, -0.1441], 'Baker Street': [51.5226, -0.1571], 'Marylebone': [51.5225, -0.1631],
  "Regent's Park": [51.5234, -0.1466], 'Farringdon': [51.5203, -0.1053], 'Barbican': [51.5204, -0.0979],
  'Moorgate': [51.5186, -0.0886], 'Bank': [51.5133, -0.0886], 'Aldgate': [51.5143, -0.0755],
  'Aldgate East': [51.5154, -0.0726],
  // West End / Piccadilly / Bakerloo
  'Piccadilly Circus': [51.5100, -0.1340], 'Leicester Square': [51.5113, -0.1281], 'Charing Cross': [51.5074, -0.1278],
  'Embankment': [51.5074, -0.1223], 'Waterloo': [51.5031, -0.1132], 'Lambeth North': [51.4989, -0.1115],
  'Elephant & Castle': [51.4943, -0.1001],
  // SW / Victoria / Circle
  'Victoria': [51.4965, -0.1447], 'Westminster': [51.5010, -0.1254], "St. James's Park": [51.4994, -0.1335],
  'Sloane Square': [51.4924, -0.1565], 'South Kensington': [51.4941, -0.1738], 'Gloucester Road': [51.4945, -0.1829],
  "Earl's Court": [51.4915, -0.1948], 'High Street Kensington': [51.5010, -0.1925], 'Paddington': [51.5154, -0.1755],
  'Bayswater': [51.5121, -0.1879], 'Edgware Road': [51.5203, -0.1700], 'Warwick Avenue': [51.5235, -0.1835],
  'Ealing Broadway': [51.5152, -0.3017], 'Acton Town': [51.5028, -0.2801], 'Turnham Green': [51.4951, -0.2547],
  'Blackfriars': [51.5116, -0.1035], 'Temple': [51.5110, -0.1143], 'Mansion House': [51.5122, -0.0941],
  'Cannon Street': [51.5113, -0.0904], 'Monument': [51.5108, -0.0863], 'Tower Hill': [51.5098, -0.0766],
  // Northern approaches
  'Camden Town': [51.5392, -0.1426], 'Angel': [51.5322, -0.1058], 'Oval': [51.4819, -0.1128],
  'Warren Street': [51.5247, -0.1384], 'Goodge Street': [51.5205, -0.1347],
  // National Rail / Thameslink / Overground
  'West Croydon [London Overground/National Rail]': [51.3785, -0.1026],
  'Carshalton [National Rail]': [51.3681, -0.1663],
  'City Thameslink [National Rail]': [51.5141, -0.1033],
  // Bakerloo north
  'Harrow & Wealdstone': [51.5924, -0.3346], "Queen's Park": [51.5341, -0.2047], 'Kilburn Park': [51.5351, -0.1939],
  'Maida Vale': [51.5299, -0.1855],
};

// ── Line definitions (colour + stations for map & by-line view) ──
const LINE_DEFS = [
  { id: 'central',       name: 'Central',       color: '#E32017',
    stations: ['West Ruislip','Ruislip Gardens','South Ruislip','Northolt','Greenford','Perivale','Hanger Lane','North Acton','East Acton','White City',"Shepherd's Bush",'Holland Park','Notting Hill Gate','Queensway','Lancaster Gate','Marble Arch','Bond Street','Oxford Circus','Tottenham Court Road','Holborn','Chancery Lane',"St. Paul's",'Bank','Liverpool Street','Bethnal Green','Mile End','Stratford','Leyton','Leytonstone','Snaresbrook','South Woodford','Woodford','Buckhurst Hill','Loughton','Debden','Theydon Bois','Epping','Wanstead','Redbridge','Gants Hill','Newbury Park','Barkingside','Fairlop','Hainault','Grange Hill','Chigwell','Roding Valley'] },
  { id: 'district',      name: 'District',      color: '#00782A',
    stations: ['Ealing Broadway','Acton Town','Turnham Green','Hammersmith','Barons Court','West Kensington',"Earl's Court",'Gloucester Road','South Kensington','Sloane Square','Victoria',"St. James's Park",'Westminster','Embankment','Temple','Blackfriars','Mansion House','Cannon Street','Monument','Tower Hill','Aldgate East','Stepney Green','Mile End','Bow Road','Bromley by Bow','West Ham','Plaistow','Upton Park','East Ham','Barking'] },
  { id: 'hammersmith',   name: 'Hammersmith & City', color: '#F3A9BB',
    stations: ['Hammersmith','Paddington','Edgware Road','Baker Street','Great Portland Street','Euston Square',"King's Cross St. Pancras",'Farringdon','Barbican','Moorgate','Liverpool Street','Aldgate East','Stepney Green','Mile End','Bow Road','Bromley by Bow','West Ham','Plaistow','Upton Park','East Ham','Barking'] },
  { id: 'metropolitan',  name: 'Metropolitan',  color: '#9B0056',
    stations: ['Aldgate','Liverpool Street','Moorgate','Barbican','Farringdon',"King's Cross St. Pancras",'Euston Square','Great Portland Street','Baker Street','Marylebone'] },
  { id: 'jubilee',       name: 'Jubilee',        color: '#A0A5A9',
    stations: ['Baker Street','Bond Street','Westminster','Waterloo','West Ham','Stratford'] },
  { id: 'bakerloo',      name: 'Bakerloo',       color: '#B36305',
    stations: ['Harrow & Wealdstone',"Queen's Park",'Kilburn Park','Maida Vale','Warwick Avenue','Paddington','Edgware Road','Marylebone','Baker Street',"Regent's Park",'Oxford Circus','Piccadilly Circus','Charing Cross','Embankment','Waterloo','Lambeth North','Elephant & Castle'] },
  { id: 'northern',      name: 'Northern',       color: '#000000',
    stations: ['Camden Town','Euston','Warren Street','Goodge Street','Tottenham Court Road','Leicester Square','Charing Cross','Embankment','Waterloo','Oval','Angel','Moorgate','Bank','Elephant & Castle'] },
  { id: 'victoria',      name: 'Victoria',       color: '#0098D4',
    stations: ['Oval','Victoria','Pimlico','Warren Street','Euston',"King's Cross St. Pancras"] },
  { id: 'piccadilly',    name: 'Piccadilly',     color: '#003688',
    stations: ['Acton Town','Turnham Green','Hammersmith',"Earl's Court",'Gloucester Road','South Kensington','Piccadilly Circus','Leicester Square','Holborn',"King's Cross St. Pancras"] },
  { id: 'circle',        name: 'Circle',         color: '#FFD300',
    stations: ['Paddington','Edgware Road','Baker Street','Great Portland Street','Euston Square',"King's Cross St. Pancras",'Farringdon','Barbican','Moorgate','Liverpool Street','Aldgate','Tower Hill','Monument','Cannon Street','Mansion House','Blackfriars','Temple','Embankment','Westminster',"St. James's Park",'Victoria','Sloane Square','South Kensington','Gloucester Road','High Street Kensington','Notting Hill Gate','Bayswater'] },
  { id: 'dlr',           name: 'DLR',            color: '#00A4A7',
    stations: ['Bank','West Ham','Custom House DLR','Stratford'] },
  { id: 'overground',    name: 'Overground',     color: '#EF7B10',
    stations: ['Stratford','West Croydon [London Overground/National Rail]'] },
];

// ══════════════════════════════════════════════════════════════════════════════
// DATE / TIME HELPERS
// ══════════════════════════════════════════════════════════════════════════════
const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Parse "03-Oct-2026" into a Date (local, midday to avoid TZ edge cases)
function parseDate(dateStr) {
  const m = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/.exec(dateStr);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const mon = MONTHS[m[2]];
  const year = parseInt(m[3], 10);
  if (mon === undefined) return null;
  return new Date(year, mon, day, 12, 0, 0);
}

// Minutes since midnight for "HH:MM"
function timeToMinutes(t) {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

// Duration in minutes between start and end on the same day
function journeyDuration(j) {
  const s = timeToMinutes(j.start);
  const e = timeToMinutes(j.end);
  if (s === null || e === null) return null;
  let diff = e - s;
  if (diff < 0) diff += 24 * 60; // crosses midnight
  // Guard against absurd values (bad data like 06:08–13:52 topup rows)
  if (diff > 180) return null;
  return diff;
}

function fmtDuration(mins) {
  if (mins == null) return '—';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ══════════════════════════════════════════════════════════════════════════════
// PARSING
// ══════════════════════════════════════════════════════════════════════════════
function parseJourneyType(action) {
  if (!action) return 'tube';
  if (action.startsWith('Bus journey')) return 'bus';
  if (action.startsWith('Topped up')) return 'topup';
  if (action.startsWith('Automated Refund')) return 'refund';
  if (action.includes('[National Rail]')) return 'nationalrail';
  if (action.includes('DLR')) return 'dlr';
  if (action.includes('Overground')) return 'overground';
  return 'tube';
}

function isTravelType(type) {
  return ['tube', 'dlr', 'nationalrail', 'overground'].includes(type);
}

const STATION_ALIASES = {
  "St Paul's": "St. Paul's",
  "Kings Cross (Met, Circle, H&C lines)": "King's Cross St. Pancras",
  "Euston [London Underground]": "Euston",
};

function cleanStationName(s) {
  const raw = s.trim();
  // 1. Exact alias match on the raw CSV name (handles "Kings Cross (Met, Circle, H&C lines)")
  if (STATION_ALIASES[raw]) return STATION_ALIASES[raw];
  // 2. Raw name is a known station (keeps NR/Overground bracket names we track)
  if (STATION_GEO[raw]) return raw;
  // 3. Strip "(Met, Circle…)" style suffixes
  const noParen = raw.replace(/\s*\(Met, Circle.*?\)/gi, '').trim();
  if (STATION_ALIASES[noParen]) return STATION_ALIASES[noParen];
  if (STATION_GEO[noParen]) return noParen;
  // 4. Strip "[National Rail]" style suffixes
  const stripped = noParen.replace(/\s*\[.*?\]/g, '').trim();
  if (STATION_ALIASES[stripped]) return STATION_ALIASES[stripped];
  if (STATION_GEO[stripped]) return stripped;
  // 5. Fall back to the raw name (keeps it visible even if unmapped)
  return raw;
}

// Returns { from, to } canonical names, or null
function parseRoute(action) {
  const type = parseJourneyType(action);
  if (!isTravelType(type)) return null;
  const match = action.match(/^(.+?)\s+to\s+(.+)$/i);
  if (!match) return null;
  return { from: cleanStationName(match[1]), to: cleanStationName(match[2]) };
}

function extractStations(action) {
  const r = parseRoute(action);
  return r ? [r.from, r.to].filter(Boolean) : [];
}

// ══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ══════════════════════════════════════════════════════════════════════════════
function computeStats() {
  const all = RAW_JOURNEYS;
  const travel = all.filter(j => isTravelType(parseJourneyType(j.action)));
  const bus    = all.filter(j => parseJourneyType(j.action) === 'bus');

  // Station tap frequency
  const stationCount = {};
  travel.forEach(j => extractStations(j.action).forEach(s => {
    stationCount[s] = (stationCount[s] || 0) + 1;
  }));
  const visitedStations = Object.keys(stationCount);

  // Spend
  const totalSpend = all.reduce((s, j) => s + (j.charge || 0), 0);
  const tubeSpend  = travel.reduce((s, j) => s + (j.charge || 0), 0);
  const busSpend   = bus.reduce((s, j) => s + (j.charge || 0), 0);
  const totalTopup = all.reduce((s, j) => s + (j.credit || 0), 0);

  // Travel days
  const dayset = new Set(travel.map(j => j.date));
  const travelDays = dayset.size;

  // Monthly spend — keyed by sortable YYYY-MM, labelled "Mon YYYY"
  const monthlyMap = {};
  all.filter(j => j.charge > 0).forEach(j => {
    const d = parseDate(j.date);
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${Object.keys(MONTHS)[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    if (!monthlyMap[key]) monthlyMap[key] = { label, total: 0 };
    monthlyMap[key].total += j.charge;
  });
  const monthlySpend = Object.keys(monthlyMap).sort()
    .map(k => ({ label: monthlyMap[k].label, total: monthlyMap[k].total }));

  // Most expensive single journey
  const paid = travel.filter(j => j.charge > 0);
  const mostExpensive = paid.reduce((best, j) => j.charge > best.charge ? j : best, paid[0] || { charge: 0 });
  const avgCost = paid.length ? tubeSpend / paid.length : 0;

  // Daily cap hits & estimated savings
  const capJourneys = all.filter(j => j.note && j.note.toLowerCase().includes('cap'));
  const capHits = capJourneys.length;
  // Savings estimate: what a free/capped travel journey would otherwise have cost (use avg paid fare)
  const cappedFreeTravel = capJourneys.filter(j => isTravelType(parseJourneyType(j.action)) && j.charge === 0);
  const capSavings = cappedFreeTravel.length * (avgCost || 0);

  // Top stations
  const topStations = Object.entries(stationCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Top routes (direction-insensitive O-D pairs)
  const routeCount = {};
  travel.forEach(j => {
    const r = parseRoute(j.action);
    if (!r || !r.from || !r.to) return;
    const key = [r.from, r.to].sort().join(' ↔ ');
    routeCount[key] = (routeCount[key] || 0) + 1;
  });
  const topRoutes = Object.entries(routeCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Line usage
  const lineVisits = LINE_DEFS.map(line => {
    const visited = line.stations.filter(s => stationCount[s]).length;
    return { ...line, visited, total: line.stations.length };
  }).filter(l => l.visited > 0).sort((a, b) => b.visited - a.visited);

  // ── Duration analytics ──
  const durations = travel.map(journeyDuration).filter(d => d !== null);
  const totalTravelMins = durations.reduce((a, b) => a + b, 0);
  const avgDuration = durations.length ? totalTravelMins / durations.length : 0;
  let longestJourney = null, longestMins = -1;
  travel.forEach(j => {
    const d = journeyDuration(j);
    if (d !== null && d > longestMins) { longestMins = d; longestJourney = j; }
  });

  // ── Time-of-day buckets ──
  // AM peak 06:30–09:30, PM peak 16:00–19:00, off-peak otherwise
  const timeBuckets = { amPeak: 0, offPeak: 0, pmPeak: 0 };
  const hourHistogram = new Array(24).fill(0);
  travel.forEach(j => {
    const mins = timeToMinutes(j.start);
    if (mins === null) return;
    hourHistogram[Math.floor(mins / 60)]++;
    if (mins >= 390 && mins <= 570) timeBuckets.amPeak++;
    else if (mins >= 960 && mins <= 1140) timeBuckets.pmPeak++;
    else timeBuckets.offPeak++;
  });

  // ── Day-of-week ──
  const dowCount = new Array(7).fill(0);
  travel.forEach(j => {
    const d = parseDate(j.date);
    if (d) dowCount[d.getDay()]++;
  });
  const weekdayTrips = dowCount.slice(1, 6).reduce((a, b) => a + b, 0);
  const weekendTrips = dowCount[0] + dowCount[6];
  let busiestDowIdx = 0;
  dowCount.forEach((c, i) => { if (c > dowCount[busiestDowIdx]) busiestDowIdx = i; });

  // Cost per travel day & projection
  const costPerDay = travelDays ? totalSpend / travelDays : 0;
  const projectedMonthly = costPerDay * 20; // ~20 working days

  return {
    totalJourneys: travel.length + bus.length,
    tubeJourneys: travel.length,
    busJourneys: bus.length,
    visitedStations, stationCount, topStations, topRoutes,
    totalSpend, tubeSpend, busSpend, totalTopup,
    travelDays, monthlySpend, mostExpensive, avgCost,
    capHits, capSavings, costPerDay, projectedMonthly,
    totalTravelMins, avgDuration, longestJourney, longestMins,
    timeBuckets, hourHistogram, dowCount, weekdayTrips, weekendTrips, busiestDowIdx,
    lineVisits,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDERING — OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
function statCard(icon, value, label, accent) {
  return `
    <div class="stat-card ${accent || ''}">
      <div class="stat-icon">${icon}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
    </div>`;
}

function renderStats(stats) {
  document.getElementById('stats-grid').innerHTML = [
    statCard('🚇', stats.totalJourneys, 'Total Journeys', 'accent-blue'),
    statCard('📍', stats.visitedStations.length, 'Stations Visited', 'accent-red'),
    statCard('📅', stats.travelDays, 'Travel Days', 'accent-green'),
    statCard('💷', `£${stats.totalSpend.toFixed(2)}`, 'Total Spent', 'accent-yellow'),
    statCard('🚌', stats.busJourneys, 'Bus Rides', 'accent-purple'),
    statCard('⏱', fmtDuration(stats.totalTravelMins), 'Time Travelling', 'accent-teal'),
  ].join('');
}

function renderTopStations(stats) {
  const rankClass = i => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
  document.getElementById('top-stations-grid').innerHTML = stats.topStations.map(([name, count], i) => `
    <div class="station-rank-card">
      <div class="rank-num ${rankClass(i)}">${i + 1}</div>
      <div class="station-rank-info">
        <div class="station-rank-name">${displayName(name)}</div>
        <div class="station-rank-detail">${getLineForStation(name)}</div>
      </div>
      <div class="station-rank-count">${count}×</div>
    </div>
  `).join('');
}

function renderRoutes(stats) {
  const grid = document.getElementById('routes-grid');
  if (!grid) return;
  if (!stats.topRoutes.length) { grid.innerHTML = '<p class="byline-intro">No routes recorded.</p>'; return; }
  const max = stats.topRoutes[0][1];
  grid.innerHTML = stats.topRoutes.map(([route, count]) => {
    const [a, b] = route.split(' ↔ ');
    return `
      <div class="route-card">
        <div class="route-ends">
          <span class="route-station">${displayName(a)}</span>
          <span class="route-arrow">⇄</span>
          <span class="route-station">${displayName(b)}</span>
        </div>
        <div class="route-bar-wrap"><div class="route-bar-fill" style="width:${Math.round((count / max) * 100)}%"></div></div>
        <div class="route-count">${count}×</div>
      </div>`;
  }).join('');
}

function displayName(s) {
  return s.replace(/\s*\[.*?\]/g, '').replace(/\s*DLR$/, '');
}

function getLineForStation(name) {
  for (const line of LINE_DEFS) {
    if (line.stations.includes(name)) return line.name + ' line';
  }
  return 'TfL network';
}

function renderSpend(stats) {
  document.getElementById('spend-grid').innerHTML = `
    <div class="spend-card"><div class="spend-amount">£${stats.totalSpend.toFixed(2)}</div><div class="spend-label">Total Spent</div><div class="spend-sub">All transport</div></div>
    <div class="spend-card"><div class="spend-amount">£${stats.tubeSpend.toFixed(2)}</div><div class="spend-label">Tube / Rail</div><div class="spend-sub">${stats.tubeJourneys} journeys</div></div>
    <div class="spend-card"><div class="spend-amount">£${stats.busSpend.toFixed(2)}</div><div class="spend-label">Bus</div><div class="spend-sub">${stats.busJourneys} rides</div></div>
    <div class="spend-card"><div class="spend-amount">£${stats.avgCost.toFixed(2)}</div><div class="spend-label">Avg Journey</div><div class="spend-sub">Tube / Rail</div></div>
    <div class="spend-card"><div class="spend-amount">£${stats.costPerDay.toFixed(2)}</div><div class="spend-label">Per Travel Day</div><div class="spend-sub">${stats.travelDays} days</div></div>
    <div class="spend-card"><div class="spend-amount">£${(stats.mostExpensive.charge || 0).toFixed(2)}</div><div class="spend-label">Priciest Trip</div><div class="spend-sub">${displayName((stats.mostExpensive.action || '').split(' to ').slice(-1)[0] || '—')}</div></div>
  `;

  // Insight cards
  const insights = document.getElementById('spend-insights');
  if (insights) {
    insights.innerHTML = `
      <div class="insight-card">
        <div class="insight-icon">🎯</div>
        <div><div class="insight-value">£${stats.capSavings.toFixed(2)}</div><div class="insight-label">Estimated saved from daily caps (${stats.capHits} capped taps)</div></div>
      </div>
      <div class="insight-card">
        <div class="insight-icon">📈</div>
        <div><div class="insight-value">£${stats.projectedMonthly.toFixed(2)}</div><div class="insight-label">Projected monthly cost at this rate (~20 travel days)</div></div>
      </div>
      <div class="insight-card">
        <div class="insight-icon">💳</div>
        <div><div class="insight-value">£${stats.totalTopup.toFixed(2)}</div><div class="insight-label">Topped up across the period</div></div>
      </div>
    `;
  }
}

function renderMonthChart(stats) {
  const wrap = document.getElementById('month-chart');
  const entries = stats.monthlySpend;
  if (!entries.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  const max = Math.max(...entries.map(e => e.total));
  wrap.innerHTML = `
    <div class="section-title">📆 Spend by Month</div>
    <div class="bar-chart">
      ${entries.map(e => `
        <div class="bar-col">
          <div class="bar-value">£${e.total.toFixed(0)}</div>
          <div class="bar-fill" style="height:${Math.round((e.total / max) * 90)}px"></div>
          <div class="bar-label">${e.label}</div>
        </div>`).join('')}
    </div>`;
}

function renderLines(stats) {
  document.getElementById('lines-grid').innerHTML = stats.lineVisits.map(l => `
    <div class="line-card">
      <div class="line-dot" style="background:${l.color}"></div>
      <div class="line-info">
        <div class="line-name">${l.name}</div>
        <div class="line-bar-wrap"><div class="line-bar-fill" style="background:${l.color};width:${Math.round((l.visited / l.total) * 100)}%"></div></div>
      </div>
      <div class="line-count">${l.visited} sta.</div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDERING — TRAVEL PATTERNS
// ══════════════════════════════════════════════════════════════════════════════
function renderPatterns(stats) {
  // Duration cards
  const durWrap = document.getElementById('duration-grid');
  if (durWrap) {
    const lj = stats.longestJourney;
    durWrap.innerHTML = [
      statCard('⏱', fmtDuration(stats.totalTravelMins), 'Total Time Travelling', 'accent-teal'),
      statCard('📏', fmtDuration(Math.round(stats.avgDuration)), 'Avg Journey Length', 'accent-blue'),
      statCard('🐢', fmtDuration(stats.longestMins >= 0 ? stats.longestMins : null), 'Longest Journey', 'accent-purple'),
    ].join('') +
    (lj ? `<div class="stat-card accent-yellow" style="grid-column:span 1">
      <div class="stat-icon">🚇</div>
      <div class="stat-value" style="font-size:0.95rem;line-height:1.3">${displayName(lj.action)}</div>
      <div class="stat-label">Longest Trip · ${lj.date.replace(/-20\d\d/, '')}</div>
    </div>` : '');
  }

  // Time-of-day
  const tod = document.getElementById('timeofday-bars');
  if (tod) {
    const b = stats.timeBuckets;
    const total = b.amPeak + b.offPeak + b.pmPeak || 1;
    const row = (label, val, color) => `
      <div class="tod-row">
        <div class="tod-label">${label}</div>
        <div class="tod-bar-wrap"><div class="tod-bar-fill" style="width:${Math.round((val / total) * 100)}%;background:${color}"></div></div>
        <div class="tod-val">${val} (${Math.round((val / total) * 100)}%)</div>
      </div>`;
    tod.innerHTML =
      row('🌅 AM peak (06:30–09:30)', b.amPeak, '#f59e0b') +
      row('🌇 PM peak (16:00–19:00)', b.pmPeak, '#8b5cf6') +
      row('🌤 Off-peak', b.offPeak, '#2dd4bf');
  }

  // Hour histogram
  const hist = document.getElementById('hour-histogram');
  if (hist) {
    const max = Math.max(...stats.hourHistogram, 1);
    hist.innerHTML = stats.hourHistogram.map((c, h) => `
      <div class="hist-col" title="${h}:00 — ${c} journey${c === 1 ? '' : 's'}">
        <div class="hist-fill" style="height:${Math.round((c / max) * 100)}%;${c === 0 ? 'opacity:0.15' : ''}"></div>
        <div class="hist-hour">${h % 3 === 0 ? h : ''}</div>
      </div>`).join('');
  }

  // Day of week
  const dow = document.getElementById('dow-bars');
  if (dow) {
    const max = Math.max(...stats.dowCount, 1);
    const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const order = [1,2,3,4,5,6,0]; // Mon-first
    dow.innerHTML = order.map(i => `
      <div class="dow-row">
        <div class="dow-label">${names[i]}</div>
        <div class="dow-bar-wrap"><div class="dow-bar-fill ${i === stats.busiestDowIdx ? 'busiest' : ''}" style="width:${Math.round((stats.dowCount[i] / max) * 100)}%"></div></div>
        <div class="dow-val">${stats.dowCount[i]}</div>
      </div>`).join('');
  }

  // Weekday vs weekend summary
  const split = document.getElementById('weekday-split');
  if (split) {
    const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    split.innerHTML = [
      statCard('💼', stats.weekdayTrips, 'Weekday Trips', 'accent-blue'),
      statCard('🛋', stats.weekendTrips, 'Weekend Trips', 'accent-green'),
      statCard('🔥', names[stats.busiestDowIdx], 'Busiest Day', 'accent-red'),
    ].join('');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDERING — JOURNEY HISTORY
// ══════════════════════════════════════════════════════════════════════════════
let activeFilter = 'all';
function renderJourneys(filter) {
  activeFilter = filter;
  document.querySelectorAll('.jf-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));

  let journeys = [...RAW_JOURNEYS];
  if (filter === 'tube')  journeys = journeys.filter(j => isTravelType(parseJourneyType(j.action)));
  if (filter === 'bus')   journeys = journeys.filter(j => parseJourneyType(j.action) === 'bus');
  if (filter === 'topup') journeys = journeys.filter(j => ['topup','refund'].includes(parseJourneyType(j.action)));
  if (filter === 'free')  journeys = journeys.filter(j => j.charge === 0 && !['topup','refund'].includes(parseJourneyType(j.action)));

  const iconMap = { tube:'🚇', bus:'🚌', dlr:'🚈', nationalrail:'🚆', overground:'🚊', topup:'💳', refund:'💚' };
  document.getElementById('journey-list').innerHTML = journeys.map(j => {
    const type = parseJourneyType(j.action);
    const icon = iconMap[type] || '🚇';
    const chargeText = j.credit > 0 ? `+£${j.credit.toFixed(2)}`
      : j.charge === 0 ? (type === 'topup' ? '' : 'FREE') : `£${j.charge.toFixed(2)}`;
    const chargeClass = j.credit > 0 ? 'credit' : (j.charge === 0 && type !== 'topup') ? 'free' : 'paid';
    const dur = journeyDuration(j);
    const timeStr = j.end ? `${j.start} – ${j.end}${dur !== null ? ' · ' + fmtDuration(dur) : ''}` : j.start;
    return `
      <div class="journey-row">
        <div class="journey-icon ${type}">${icon}</div>
        <div class="journey-info">
          <div class="journey-route">${j.action}</div>
          <div class="journey-time">${timeStr}${j.note ? ' · ' + j.note : ''}</div>
        </div>
        <div class="journey-charge ${chargeClass}">${chargeText}</div>
        <div class="journey-date">${j.date.replace(/-20\d\d/, '')}</div>
      </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDERING — GEOGRAPHIC MAP
// ══════════════════════════════════════════════════════════════════════════════
function buildMap(stats) {
  const svg = document.getElementById('tube-map-svg');
  if (!svg) return;
  const visitedSet = new Set(stats.visitedStations);

  // Project lat/lon → SVG x/y.
  // Compute bounds from the core network only (exclude far-flung outliers like
  // Carshalton / West Croydon) so central London isn't compressed, then clamp
  // any out-of-range stations to the map edge.
  const W = 800, H = 520, PAD = 40;
  const geos = Object.values(STATION_GEO);
  const lats = geos.map(g => g[0]).sort((a, b) => a - b);
  const lons = geos.map(g => g[1]).sort((a, b) => a - b);
  const pct = (arr, p) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(arr.length * p)))];
  const minLat = pct(lats, 0.04), maxLat = pct(lats, 0.99);
  const minLon = pct(lons, 0.01), maxLon = pct(lons, 0.99);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const project = ([lat, lon]) => {
    const x = PAD + clamp((lon - minLon) / (maxLon - minLon), 0, 1) * (W - 2 * PAD);
    const y = PAD + clamp((maxLat - lat) / (maxLat - minLat), 0, 1) * (H - 2 * PAD); // lat inverted
    return [x, y];
  };

  // Line connections
  const lineSegments = LINE_DEFS.map(line => {
    const pts = line.stations.map(s => STATION_GEO[s]).filter(Boolean).map(project);
    if (pts.length < 2) return '';
    return `<polyline points="${pts.map(p => p.join(',')).join(' ')}" stroke="${line.color}" stroke-width="2.5" fill="none" opacity="0.3" stroke-linejoin="round" stroke-linecap="round"/>`;
  }).join('');

  // Station dots
  const dots = Object.entries(STATION_GEO).map(([name, geo]) => {
    const [x, y] = project(geo);
    const visited = visitedSet.has(name);
    const count = stats.stationCount[name] || 0;
    const r = visited ? Math.min(5 + count, 11) : 2.6;
    const fill = visited ? '#DC241F' : 'rgba(255,255,255,0.14)';
    const stroke = visited ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.12)';
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${visited ? 1.5 : 1}" class="station-dot ${visited ? 'visited' : ''}" data-name="${name}" data-count="${count}"></circle>`;
  }).join('');

  // Labels for visited only
  const labels = stats.visitedStations.map(name => {
    const geo = STATION_GEO[name];
    if (!geo) return '';
    const [x, y] = project(geo);
    return `<text x="${x.toFixed(1)}" y="${(y - 9).toFixed(1)}" font-size="8" fill="rgba(255,255,255,0.82)" text-anchor="middle" font-family="system-ui" font-weight="600">${displayName(name)}</text>`;
  }).join('');

  svg.innerHTML = lineSegments + dots + labels;

  // Tooltip
  const tip = document.getElementById('map-tooltip');
  svg.querySelectorAll('.station-dot').forEach(dot => {
    dot.style.cursor = 'pointer';
    dot.addEventListener('mouseenter', function () {
      const count = parseInt(this.dataset.count, 10);
      tip.textContent = count > 0 ? `${displayName(this.dataset.name)} · tapped ${count}×` : displayName(this.dataset.name);
      tip.style.display = 'block';
    });
    dot.addEventListener('mousemove', function (e) {
      const rect = svg.closest('.map-container').getBoundingClientRect();
      tip.style.left = (e.clientX - rect.left + 12) + 'px';
      tip.style.top = (e.clientY - rect.top - 28) + 'px';
    });
    dot.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDERING — BY LINE
// ══════════════════════════════════════════════════════════════════════════════
const LIGHT_LINES = new Set(['circle', 'hammersmith']);
let byLineData = null; // cached for search filtering

function renderByLine(stats) {
  const visitedSet = new Set(stats.visitedStations);

  const linesWithTaps = LINE_DEFS.map(line => {
    const tapped = line.stations.filter(s => visitedSet.has(s));
    const totalTaps = tapped.reduce((sum, s) => sum + (stats.stationCount[s] || 0), 0);
    return { ...line, total: line.stations.length, tappedStations: tapped, tappedCount: tapped.length, totalTaps };
  }).filter(l => l.tappedCount > 0).sort((a, b) => b.tappedCount - a.tappedCount);

  // Catch-all for tapped stations not on any defined line
  const matched = new Set();
  linesWithTaps.forEach(l => l.tappedStations.forEach(s => matched.add(s)));
  const orphans = stats.visitedStations.filter(s => !matched.has(s));
  if (orphans.length) {
    linesWithTaps.push({
      id: 'national-rail', name: 'National Rail / Other', color: '#8b5cf6',
      stations: orphans, tappedStations: orphans, tappedCount: orphans.length,
      total: orphans.length, totalTaps: orphans.reduce((s, o) => s + (stats.stationCount[o] || 0), 0),
    });
  }

  byLineData = { linesWithTaps, visitedSet, stationCount: stats.stationCount, visitedCount: stats.visitedStations.length };

  // Summary bar
  const totalTaps = Object.values(stats.stationCount).reduce((a, b) => a + b, 0);
  const mostUsed = linesWithTaps[0];
  document.getElementById('line-summary-bar').innerHTML = `
    <div class="line-summary-card"><div class="line-summary-value" style="color:#60a5fa">${linesWithTaps.length}</div><div class="line-summary-label">Lines Touched</div></div>
    <div class="line-summary-card"><div class="line-summary-value" style="color:#f87171">${stats.visitedStations.length}</div><div class="line-summary-label">Unique Stations</div></div>
    <div class="line-summary-card"><div class="line-summary-value" style="color:#fbbf24">${totalTaps}</div><div class="line-summary-label">Total Taps</div></div>
    <div class="line-summary-card"><div class="line-summary-value" style="color:${mostUsed ? mostUsed.color : '#fff'};font-size:1rem;line-height:1.3;padding-top:6px">${mostUsed ? mostUsed.name : '—'}</div><div class="line-summary-label">Most Used Line</div></div>
  `;
  const badge = document.getElementById('byline-count-badge');
  if (badge) badge.textContent = `${linesWithTaps.length} lines`;

  drawLineDetails('');
}

function drawLineDetails(query) {
  if (!byLineData) return;
  const q = (query || '').trim().toLowerCase();
  const { linesWithTaps, visitedSet, stationCount } = byLineData;
  const container = document.getElementById('line-detail-list');

  const visibleLines = linesWithTaps.map(line => {
    const stationsToShow = q
      ? line.stations.filter(s => displayName(s).toLowerCase().includes(q))
      : line.stations;
    return { line, stationsToShow };
  }).filter(x => x.stationsToShow.length > 0);

  if (!visibleLines.length) {
    container.innerHTML = `<p class="byline-intro">No stations match “${query}”.</p>`;
    return;
  }

  container.innerHTML = visibleLines.map(({ line, stationsToShow }, idx) => {
    const pct = Math.round((line.tappedCount / line.total) * 100);
    const lightText = LIGHT_LINES.has(line.id) ? 'light-text' : '';
    const collapsed = (q === '' && idx !== 0) ? 'collapsed' : ''; // expand all when searching

    const sorted = [...stationsToShow].sort((a, b) => {
      const av = visitedSet.has(a) ? (stationCount[a] || 0) : -1;
      const bv = visitedSet.has(b) ? (stationCount[b] || 0) : -1;
      return bv - av;
    });

    const chips = sorted.map(s => {
      const tapped = visitedSet.has(s);
      const count = stationCount[s] || 0;
      return `
        <div class="station-chip ${tapped ? 'tapped' : ''}" title="${s}">
          <div class="station-chip-marker"></div>
          <div class="station-chip-name">${displayName(s)}</div>
          ${tapped ? `<div class="station-chip-count">${count}×</div>` : ''}
        </div>`;
    }).join('');

    return `
      <div class="line-detail ${collapsed}" style="--line-color:${line.color}">
        <div class="line-detail-header" data-line-toggle>
          <span class="line-badge ${lightText}" style="background:${line.color}">${line.name}</span>
          <div class="line-detail-meta">
            <div class="line-detail-name">${line.tappedCount} of ${line.total} stations · ${line.totalTaps} taps</div>
            <div class="line-progress-wrap"><div class="line-progress-fill" style="background:${line.color};width:${pct}%"></div></div>
          </div>
          <div class="line-detail-stat"><div class="line-detail-count" style="color:${line.color}">${line.tappedCount}</div><div class="line-detail-pct">${pct}%</div></div>
          <div class="line-chevron">▼</div>
        </div>
        <div class="line-stations">${chips}</div>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-line-toggle]').forEach(header => {
    header.addEventListener('click', () => header.closest('.line-detail').classList.toggle('collapsed'));
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// CSV IMPORT
// ══════════════════════════════════════════════════════════════════════════════
// Parse a line of CSV respecting quoted fields
function parseCsvLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function parseOysterCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  if (!lines.length) throw new Error('Empty file');
  // Detect header
  let startIdx = 0;
  if (/date/i.test(lines[0]) && /journey|action/i.test(lines[0])) startIdx = 1;
  const rows = [];
  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]).map(c => c.trim());
    if (cols.length < 4) continue;
    const [date, start, end, action, charge, credit, , note] = cols;
    if (!date || !action) continue;
    const num = v => {
      if (v == null) return 0;
      const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
      return isNaN(n) ? 0 : n;
    };
    rows.push({
      date, start: start || '', end: end || '', action,
      charge: num(charge), credit: num(credit),
      note: note ? note.replace(/^"|"$/g, '') : (/cap/i.test(cols.join(' ')) ? 'daily cap' : ''),
    });
  }
  if (!rows.length) throw new Error('No valid journey rows found');
  return rows;
}

function importCsvText(text) {
  const rows = parseOysterCsv(text);
  RAW_JOURNEYS = rows;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch (e) { console.warn('Save failed', e); }
  renderAll();
  showToast(`Imported ${rows.length} rows ✓`);
}

function resetToDefault() {
  RAW_JOURNEYS = DEFAULT_JOURNEYS;
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  renderAll();
  showToast('Reset to sample data');
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

function initImport() {
  const fileInput = document.getElementById('csv-file');
  const importBtn = document.getElementById('import-btn');
  const pasteBtn = document.getElementById('paste-import-btn');
  const pasteArea = document.getElementById('csv-paste');
  const resetBtn = document.getElementById('reset-btn');

  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try { importCsvText(String(reader.result)); }
        catch (err) { showToast('Import failed: ' + err.message); }
      };
      reader.onerror = () => showToast('Could not read file');
      reader.readAsText(file);
      fileInput.value = '';
    });
  }
  if (pasteBtn && pasteArea) {
    pasteBtn.addEventListener('click', () => {
      const text = pasteArea.value;
      if (!text.trim()) { showToast('Paste some CSV first'); return; }
      try { importCsvText(text); pasteArea.value = ''; }
      catch (err) { showToast('Import failed: ' + err.message); }
    });
  }
  if (resetBtn) resetBtn.addEventListener('click', resetToDefault);

  // Show "using your data" banner
  const banner = document.getElementById('data-source');
  if (banner) {
    const custom = !!localStorage.getItem(STORAGE_KEY);
    banner.textContent = custom ? '📁 Showing your imported data' : '📊 Showing sample data — import your own CSV below';
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════════════════════════════
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      buttons.forEach(b => b.classList.toggle('active', b === btn));
      panels.forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function initByLineSearch() {
  const input = document.getElementById('byline-search');
  if (!input) return;
  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => drawLineDetails(input.value), 120);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════════
function renderAll() {
  try {
    const stats = computeStats();
    renderStats(stats);
    renderTopStations(stats);
    renderRoutes(stats);
    renderSpend(stats);
    renderMonthChart(stats);
    renderLines(stats);
    renderPatterns(stats);
    renderJourneys(activeFilter || 'all');
    buildMap(stats);
    renderByLine(stats);
    const dataBanner = document.getElementById('data-source');
    if (dataBanner) {
      const custom = !!localStorage.getItem(STORAGE_KEY);
      dataBanner.textContent = custom ? '📁 Showing your imported data' : '📊 Showing sample data — import your own CSV below';
    }
  } catch (e) {
    console.error('Render failed', e);
    showToast('Something went wrong rendering the dashboard');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  initTabs();
  initByLineSearch();
  initImport();

  document.querySelectorAll('.jf-btn').forEach(btn => {
    btn.addEventListener('click', () => renderJourneys(btn.dataset.filter));
  });

  // Register service worker (PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
});
