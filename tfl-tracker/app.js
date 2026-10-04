// TFL Oyster Dashboard — app.js
'use strict';

// ── Raw journey data from Oyster CSV (Oct 4, 2026 export) ──
const RAW_JOURNEYS = [
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

// ── Station coordinates for the schematic map (simplified tube diagram) ──
// Each station: [x, y] in a 800×560 coordinate space
const STATION_COORDS = {
  // Central Line — horizontal spine
  'Epping':              [760, 100],
  'Theydon Bois':        [730, 100],
  'Debden':              [700, 100],
  'Loughton':            [670, 100],
  'Buckhurst Hill':      [640, 100],
  'Woodford':            [610, 100],
  'South Woodford':      [580, 100],
  'Snaresbrook':         [560, 120],
  'Leytonstone':         [540, 130],
  'Leyton':              [520, 150],
  'Stratford':           [500, 175],
  'Mile End':            [465, 200],
  'Bethnal Green':       [440, 200],
  'Liverpool Street':    [415, 200],
  "St. Paul's":          [390, 200],
  'Bank':                [385, 215],
  'Chancery Lane':       [365, 200],
  'Holborn':             [340, 200],
  'Tottenham Court Road':[315, 200],
  'Oxford Circus':       [290, 200],
  'Bond Street':         [265, 200],
  'Marble Arch':         [240, 200],
  'Lancaster Gate':      [220, 200],
  'Queensway':           [200, 200],
  'Notting Hill Gate':   [175, 200],
  'Holland Park':        [155, 200],
  "Shepherd's Bush":     [135, 200],
  'White City':          [115, 200],
  'East Acton':          [95, 200],
  'North Acton':         [78, 200],
  'Hanger Lane':         [60, 185],
  'Perivale':            [45, 175],
  'Greenford':           [30, 160],
  'Northolt':            [18, 145],
  'South Ruislip':       [10, 130],
  'Ruislip Gardens':     [8, 115],
  'West Ruislip':        [5, 100],
  // Central line Hainault loop (approx)
  'Wanstead':            [535, 155],
  'Redbridge':           [555, 145],
  'Gants Hill':          [575, 135],
  'Newbury Park':        [595, 120],
  'Barkingside':         [615, 110],
  'Fairlop':             [630, 108],
  'Hainault':            [645, 105],
  'Grange Hill':         [650, 125],
  'Chigwell':            [660, 115],
  'Roding Valley':       [655, 108],

  // District / H&C — east/west
  'East Ham':            [510, 240],
  'Upton Park':          [490, 240],
  'Plaistow':            [472, 240],
  'West Ham':            [455, 235],
  'Bromley by Bow':      [445, 245],
  'Bow Road':            [430, 245],
  'Stepney Green':       [410, 225],

  // DLR
  'Custom House DLR':    [495, 265],

  // Metropolitan / Kings Cross area
  "King's Cross St. Pancras": [315, 155],
  "Kings Cross (Met, Circle, H&C lines)": [315, 155],
  'Euston Square':       [295, 155],
  'Euston [London Underground]': [310, 140],
  'Euston':              [310, 140],
  'Great Portland Street': [280, 155],
  'Baker Street':        [258, 165],
  'Marylebone':          [248, 170],
  "Regent's Park":       [280, 180],
  'Farringdon':          [358, 175],
  'Barbican':            [370, 175],
  'Moorgate':            [390, 175],
  'Aldgate':             [415, 185],
  'Aldgate East':        [425, 195],

  // Piccadilly / Bakerloo
  'Piccadilly Circus':   [295, 225],
  'Leicester Square':    [310, 220],
  "Charing Cross":       [305, 245],
  'Embankment':          [305, 255],
  'Waterloo':            [300, 275],
  'Lambeth North':       [285, 285],
  'Elephant & Castle':   [310, 305],

  // Victoria / Jubilee
  'Victoria':            [255, 275],
  'Westminster':         [280, 265],
  'St. James\'s Park':   [265, 270],
  'Sloane Square':       [230, 285],
  'South Kensington':    [205, 270],
  'Gloucester Road':     [195, 255],
  "Earl's Court":        [170, 260],
  'High Street Kensington': [185, 240],
  'Paddington':          [220, 175],
  'Bayswater':           [195, 178],
  'Royal Oak':           [208, 168],
  'Edgware Road':        [232, 175],

  // Northern approaches
  'Camden Town':         [285, 130],
  'Angel':               [330, 155],
  'Oval':                [295, 320],

  // South / Overground
  'West Croydon [London Overground/National Rail]': [280, 420],
  'Carshalton [National Rail]': [270, 440],
  'City Thameslink [National Rail]': [350, 210],

  // Bakerloo north
  'Harrow & Wealdstone': [60, 80],
  'Kenton':              [68, 90],
  'South Kenton':        [76, 98],
  'North Wembley':       [82, 108],
  'Wembley Central':     [88, 118],
  'Stonebridge Park':    [88, 130],
  'Harlesden':           [90, 142],
  'Willesden Junction':  [95, 152],
  'Kensal Green':        [102, 162],
  "Queen's Park":        [110, 172],
  'Kilburn Park':        [118, 180],
  'Maida Vale':          [124, 186],
  'Warwick Avenue':      [218, 168],
  "Ealing Broadway":     [48, 220],
};

// ── Line definitions (colour + stations that matter for our map) ──
const LINE_DEFS = [
  { id: 'central',       name: 'Central',       color: '#E32017',
    stations: ['West Ruislip','Ruislip Gardens','South Ruislip','Northolt','Greenford','Perivale','Hanger Lane','North Acton','East Acton','White City',"Shepherd's Bush",'Holland Park','Notting Hill Gate','Queensway','Lancaster Gate','Marble Arch','Bond Street','Oxford Circus','Tottenham Court Road','Holborn','Chancery Lane',"St. Paul's",'Bank','Liverpool Street','Bethnal Green','Mile End','Stratford','Leyton','Leytonstone','Snaresbrook','South Woodford','Woodford','Buckhurst Hill','Loughton','Debden','Theydon Bois','Epping','Wanstead','Redbridge','Gants Hill','Newbury Park','Barkingside','Fairlop','Hainault','Grange Hill','Chigwell','Roding Valley'] },
  { id: 'district',      name: 'District',      color: '#00782A',
    stations: ['Ealing Broadway','Acton Town','Turnham Green','Gunnersbury','Kew Gardens','Richmond','Hammersmith','Barons Court','West Kensington',"Earl's Court",'Gloucester Road','South Kensington','Sloane Square','Victoria',"St. James's Park",'Westminster','Embankment','Temple','Blackfriars','Mansion House','Cannon Street','Monument','Tower Hill','Aldgate','Stepney Green','Mile End','Bow Road','Bromley by Bow','West Ham','Plaistow','Upton Park','East Ham','Barking'] },
  { id: 'hammersmith',   name: 'Hammersmith & City', color: '#F3A9BB',
    stations: ['Hammersmith','Goldhawk Road','Shepherd\'s Bush Market','Wood Lane','Latimer Road','Ladbroke Grove','Westbourne Park','Royal Oak','Paddington','Edgware Road','Baker Street','Great Portland Street','Euston Square',"King's Cross St. Pancras",'Farringdon','Barbican','Moorgate','Liverpool Street','Aldgate'] },
  { id: 'metropolitan',  name: 'Metropolitan',  color: '#9B0056',
    stations: ['Aldgate','Liverpool Street','Moorgate','Barbican','Farringdon',"King's Cross St. Pancras",'Euston Square','Great Portland Street','Baker Street','Marylebone','Wembley Park','Harrow-on-the-Hill','Pinner','Northwood','Rickmansworth','Chorleywood','Chalfont & Latimer','Amersham'] },
  { id: 'jubilee',       name: 'Jubilee',        color: '#A0A5A9',
    stations: ['Stanmore','Canons Park','Queensbury','Kingsbury','Wembley Park','Neasden','Dollis Hill','Willesden Green','Kilburn','West Hampstead','Finchley Road','Swiss Cottage','St. John\'s Wood','Baker Street','Bond Street','Green Park','Westminster','Waterloo','Southwark','London Bridge','Bermondsey','Canada Water','Canary Wharf','North Greenwich','Canning Town','West Ham','Stratford'] },
  { id: 'bakerloo',      name: 'Bakerloo',       color: '#B36305',
    stations: ['Harrow & Wealdstone','Kenton','South Kenton','North Wembley','Wembley Central','Stonebridge Park','Harlesden','Willesden Junction','Kensal Green',"Queen's Park",'Kilburn Park','Maida Vale','Warwick Avenue','Paddington','Edgware Road','Marylebone','Baker Street',"Regent's Park",'Oxford Circus','Piccadilly Circus','Charing Cross','Embankment','Waterloo','Lambeth North','Elephant & Castle'] },
  { id: 'northern',      name: 'Northern',       color: '#ffffff',
    stations: ['Edgware','Mill Hill East','High Barnet','Totteridge & Whetstone','Woodside Park','West Finchley','Finchley Central','East Finchley','Highgate','Archway','Tufnell Park','Kentish Town','Camden Town','Mornington Crescent','Euston','Warren Street','Goodge Street','Tottenham Court Road','Leicester Square','Charing Cross','Embankment','Waterloo','Kennington','Oval','Stockwell','Clapham North','Clapham Common','Clapham South','Balham','Tooting Bec','Tooting Broadway','Colliers Wood','South Wimbledon','Morden','Angel','Old Street','Moorgate','Bank','London Bridge','Borough','Elephant & Castle'] },
  { id: 'victoria',      name: 'Victoria',       color: '#0098D4',
    stations: ['Brixton','Stockwell','Vauxhall','Pimlico','Victoria','Sloane Square','South Kensington','Gloucester Road','Earl\'s Court','High Street Kensington','Notting Hill Gate','Bayswater','Paddington','Edgware Road','Baker Street','Regent\'s Park','Oxford Circus','Warren Street','Euston','King\'s Cross St. Pancras','Highbury & Islington','Finsbury Park','Seven Sisters','Tottenham Hale','Blackhorse Road','Walthamstow Central'] },
  { id: 'piccadilly',    name: 'Piccadilly',     color: '#003688',
    stations: ['Heathrow Terminal 5','Heathrow Terminals 2 & 3','Hatton Cross','Hounslow West','Hounslow Central','Hounslow East','Osterley','Boston Manor','Northfields','South Ealing','Acton Town','Turnham Green','Gunnersbury','Kew Gardens','Richmond','Hammersmith','Baron\'s Court','West Kensington','Earl\'s Court','Gloucester Road','South Kensington','Knightsbridge','Hyde Park Corner','Green Park','Piccadilly Circus','Leicester Square','Covent Garden','Holborn','Russell Square',"King's Cross St. Pancras",'Caledonian Road','Holloway Road','Arsenal','Finsbury Park','Manor House','Turnpike Lane','Wood Green','Bounds Green','Arnos Grove','Southgate','Oakwood','Cockfosters'] },
  { id: 'circle',        name: 'Circle',         color: '#FFD300',
    stations: ['Hammersmith','Goldhawk Road',"Shepherd's Bush Market",'Wood Lane','Latimer Road','Ladbroke Grove','Westbourne Park','Royal Oak','Paddington','Edgware Road','Baker Street','Great Portland Street','Euston Square',"King's Cross St. Pancras",'Farringdon','Barbican','Moorgate','Liverpool Street','Aldgate','Tower Hill','Monument','Cannon Street','Mansion House','Blackfriars','Temple','Embankment','Westminster',"St. James's Park",'Victoria','Sloane Square','South Kensington','Gloucester Road','High Street Kensington','Notting Hill Gate','Bayswater'] },
  { id: 'dlr',           name: 'DLR',            color: '#00A4A7',
    stations: ['Bank','Tower Gateway','Shadwell','Limehouse','Westferry','Poplar','West India Quay','Canary Wharf','Heron Quays','South Quay','Crossharbour','Mudchute','Island Gardens','Cutty Sark','Greenwich','Deptford Bridge','Elverson Road','Lewisham','Stratford','Stratford High Street','Abbey Road','West Ham','Canning Town','Royal Victoria','Custom House DLR','Prince Regent','Royal Albert','Beckton Park','Cyprus','Gallions Reach','Beckton','Devons Road','Bow Church','Pudding Mill Lane','Star Lane','Langdon Park','All Saints','Mile End','Bethnal Green'] },
  { id: 'overground',    name: 'Overground',     color: '#EF7B10',
    stations: ['Stratford','Hackney Wick','Homerton','Hackney Central','London Fields','Cambridge Heath','Bethnal Green','Shoreditch High Street','Whitechapel','Shadwell','Wapping','Rotherhithe','Surrey Quays','New Cross Gate','New Cross','Clapham Junction','West Croydon','Crystal Palace','Sydenham','Forest Hill','Honor Oak Park','Brockley','New Cross Gate'] },
];

// ── Parse journeys ──────────────────────────────────────────────────────────
function parseJourneyType(action) {
  if (action.startsWith('Bus journey')) return 'bus';
  if (action.startsWith('Topped up')) return 'topup';
  if (action.startsWith('Automated Refund')) return 'refund';
  if (action.includes('[National Rail]')) return 'nationalrail';
  if (action.includes('DLR')) return 'dlr';
  if (action.includes('Overground')) return 'overground';
  return 'tube';
}

function extractStations(action) {
  const type = parseJourneyType(action);
  if (type !== 'tube' && type !== 'dlr' && type !== 'nationalrail' && type !== 'overground') return [];
  
  // Handle "Station to Station" format
  const match = action.match(/^(.+?)\s+to\s+(.+)$/i);
  if (!match) return [];
  
  let from = match[1].trim();
  let to   = match[2].trim();
  
  // Normalise bracket annotations
  const clean = s => s
    .replace(/\s*\[.*?\]/g, '')           // remove [National Rail] etc
    .replace(/\s*\(Met, Circle.*?\)/gi, '') // remove (Met, Circle…)
    .trim();
  
  from = clean(from);
  to   = clean(to);

  // Map CSV names → canonical station names
  const aliases = {
    "St Paul's": "St. Paul's",
    "Kings Cross (Met, Circle, H&C lines)": "King's Cross St. Pancras",
    "Euston [London Underground]": "Euston",
    "Custom House DLR": "Custom House DLR",
    "West Croydon [London Overground/National Rail]": "West Croydon [London Overground/National Rail]",
    "Carshalton [National Rail]": "Carshalton [National Rail]",
    "City Thameslink [National Rail]": "City Thameslink [National Rail]",
  };
  
  from = aliases[from] || from;
  to   = aliases[to]   || to;
  
  return [from, to].filter(Boolean);
}

// ── Compute statistics ──────────────────────────────────────────────────────
function computeStats() {
  const journeys = RAW_JOURNEYS.filter(j => parseJourneyType(j.action) !== 'topup' && parseJourneyType(j.action) !== 'refund');
  const tubeJourneys = journeys.filter(j => ['tube','dlr','nationalrail','overground'].includes(parseJourneyType(j.action)));
  const busJourneys  = journeys.filter(j => parseJourneyType(j.action) === 'bus');

  // Station frequency
  const stationCount = {};
  tubeJourneys.forEach(j => {
    extractStations(j.action).forEach(s => {
      stationCount[s] = (stationCount[s] || 0) + 1;
    });
  });

  // Unique stations
  const visitedStations = new Set(Object.keys(stationCount));

  // Total spend (charges only)
  const totalSpend = RAW_JOURNEYS.reduce((s, j) => s + (j.charge || 0), 0);
  const tubeSpend  = tubeJourneys.reduce((s, j) => s + (j.charge || 0), 0);
  const busSpend   = busJourneys.reduce((s, j) => s + (j.charge || 0), 0);
  const totalTopup = RAW_JOURNEYS.reduce((s, j) => s + (j.credit || 0), 0);

  // Travel days
  const travelDays = new Set(tubeJourneys.map(j => j.date));

  // Monthly spend
  const monthlySpend = {};
  RAW_JOURNEYS.filter(j => j.charge > 0).forEach(j => {
    const parts = j.date.split('-');
    const monthKey = `${parts[1]} ${parts[2]}`;
    monthlySpend[monthKey] = (monthlySpend[monthKey] || 0) + j.charge;
  });

  // Most expensive single journey
  const paidJourneys = tubeJourneys.filter(j => j.charge > 0);
  const mostExpensive = paidJourneys.reduce((best, j) => j.charge > best.charge ? j : best, paidJourneys[0] || { charge: 0 });

  // Average journey cost (tube only)
  const avgCost = paidJourneys.length ? tubeSpend / paidJourneys.length : 0;

  // Daily cap hits
  const capHits = RAW_JOURNEYS.filter(j => j.note && j.note.includes('cap')).length;

  // Top stations sorted
  const topStations = Object.entries(stationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Line usage — count how many of our visited stations are on each line
  const lineVisits = LINE_DEFS.map(line => {
    const lineVisited = line.stations.filter(s => visitedStations.has(s)).length;
    return { ...line, visited: lineVisited, total: line.stations.length };
  }).filter(l => l.visited > 0).sort((a, b) => b.visited - a.visited);

  return {
    totalJourneys:   tubeJourneys.length + busJourneys.length,
    tubeJourneys:    tubeJourneys.length,
    busJourneys:     busJourneys.length,
    visitedStations: [...visitedStations],
    stationCount,
    topStations,
    totalSpend,
    tubeSpend,
    busSpend,
    totalTopup,
    travelDays:      travelDays.size,
    monthlySpend,
    mostExpensive,
    avgCost,
    capHits,
    lineVisits,
  };
}

// ── Render Stats Cards ───────────────────────────────────────────────────────
function renderStats(stats) {
  const grid = document.getElementById('stats-grid');
  const items = [
    { icon: '🚇', value: stats.totalJourneys,          label: 'Total Journeys',     accent: 'accent-blue' },
    { icon: '📍', value: stats.visitedStations.length, label: 'Stations Visited',   accent: 'accent-red' },
    { icon: '📅', value: stats.travelDays,             label: 'Travel Days',        accent: 'accent-green' },
    { icon: '💷', value: `£${stats.totalSpend.toFixed(2)}`, label: 'Total Spent',   accent: 'accent-yellow' },
    { icon: '🚌', value: stats.busJourneys,            label: 'Bus Rides',          accent: 'accent-purple' },
    { icon: '🎯', value: stats.capHits,                label: 'Daily Cap Hits',     accent: 'accent-teal' },
  ];
  grid.innerHTML = items.map(i => `
    <div class="stat-card ${i.accent}">
      <div class="stat-icon">${i.icon}</div>
      <div class="stat-value">${i.value}</div>
      <div class="stat-label">${i.label}</div>
    </div>
  `).join('');
}

// ── Render Top Stations ──────────────────────────────────────────────────────
function renderTopStations(stats) {
  const grid = document.getElementById('top-stations-grid');
  const rankClass = i => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
  grid.innerHTML = stats.topStations.map(([name, count], i) => `
    <div class="station-rank-card">
      <div class="rank-num ${rankClass(i)}">${i + 1}</div>
      <div class="station-rank-info">
        <div class="station-rank-name">${name}</div>
        <div class="station-rank-detail">${getLineForStation(name)}</div>
      </div>
      <div class="station-rank-count">${count}×</div>
    </div>
  `).join('');
}

function getLineForStation(name) {
  for (const line of LINE_DEFS) {
    if (line.stations.includes(name)) return line.name + ' line';
  }
  return 'TfL network';
}

// ── Render Spending ──────────────────────────────────────────────────────────
function renderSpend(stats) {
  const grid = document.getElementById('spend-grid');
  grid.innerHTML = `
    <div class="spend-card">
      <div class="spend-amount">£${stats.totalSpend.toFixed(2)}</div>
      <div class="spend-label">Total Spent</div>
      <div class="spend-sub">All transport</div>
    </div>
    <div class="spend-card">
      <div class="spend-amount">£${stats.tubeSpend.toFixed(2)}</div>
      <div class="spend-label">Tube / Rail</div>
      <div class="spend-sub">${stats.tubeJourneys} journeys</div>
    </div>
    <div class="spend-card">
      <div class="spend-amount">£${stats.busSpend.toFixed(2)}</div>
      <div class="spend-label">Bus</div>
      <div class="spend-sub">${stats.busJourneys} rides</div>
    </div>
    <div class="spend-card">
      <div class="spend-amount">£${stats.avgCost.toFixed(2)}</div>
      <div class="spend-label">Avg Journey</div>
      <div class="spend-sub">Tube / Rail</div>
    </div>
    <div class="spend-card">
      <div class="spend-amount">£${stats.totalTopup.toFixed(2)}</div>
      <div class="spend-label">Topped Up</div>
      <div class="spend-sub">Across period</div>
    </div>
    <div class="spend-card">
      <div class="spend-amount">£${(stats.mostExpensive.charge || 0).toFixed(2)}</div>
      <div class="spend-label">Priciest Trip</div>
      <div class="spend-sub">${(stats.mostExpensive.action || '').split(' to ').slice(-1)[0] || '—'}</div>
    </div>
  `;
}

// ── Render Monthly Bar Chart ─────────────────────────────────────────────────
function renderMonthChart(stats) {
  const wrap = document.getElementById('month-chart');
  const entries = Object.entries(stats.monthlySpend);
  if (!entries.length) { wrap.style.display = 'none'; return; }
  const max = Math.max(...entries.map(([,v]) => v));
  wrap.innerHTML = `
    <div class="section-title">📆 Spend by Month</div>
    <div class="bar-chart">
      ${entries.map(([month, val]) => `
        <div class="bar-col">
          <div class="bar-value">£${val.toFixed(0)}</div>
          <div class="bar-fill" style="height:${Math.round((val / max) * 90)}px"></div>
          <div class="bar-label">${month}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Render Line Breakdown ────────────────────────────────────────────────────
function renderLines(stats) {
  const grid = document.getElementById('lines-grid');
  grid.innerHTML = stats.lineVisits.map(l => `
    <div class="line-card">
      <div class="line-dot" style="background:${l.color}"></div>
      <div class="line-info">
        <div class="line-name">${l.name}</div>
        <div class="line-bar-wrap">
          <div class="line-bar-fill" style="background:${l.color};width:${Math.round((l.visited / l.total) * 100)}%"></div>
        </div>
      </div>
      <div class="line-count">${l.visited} sta.</div>
    </div>
  `).join('');
}

// ── Render Journey History ───────────────────────────────────────────────────
let activeFilter = 'all';

function renderJourneys(filter) {
  activeFilter = filter;
  // Update filter buttons
  document.querySelectorAll('.jf-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });

  const list = document.getElementById('journey-list');
  let journeys = [...RAW_JOURNEYS];

  if (filter === 'tube')   journeys = journeys.filter(j => parseJourneyType(j.action) === 'tube');
  if (filter === 'bus')    journeys = journeys.filter(j => parseJourneyType(j.action) === 'bus');
  if (filter === 'topup')  journeys = journeys.filter(j => parseJourneyType(j.action) === 'topup' || parseJourneyType(j.action) === 'refund');
  if (filter === 'free')   journeys = journeys.filter(j => j.charge === 0 && parseJourneyType(j.action) !== 'topup' && parseJourneyType(j.action) !== 'refund');

  const iconMap = {
    tube: '🚇', bus: '🚌', dlr: '🚈', nationalrail: '🚆', overground: '🚊', topup: '💳', refund: '💚',
  };

  list.innerHTML = journeys.map(j => {
    const type = parseJourneyType(j.action);
    const icon = iconMap[type] || '🚇';
    const chargeText = j.credit > 0
      ? `+£${j.credit.toFixed(2)}`
      : j.charge === 0
        ? (type === 'topup' ? '' : 'FREE')
        : `£${j.charge.toFixed(2)}`;
    const chargeClass = j.credit > 0 ? 'credit' : j.charge === 0 && type !== 'topup' ? 'free' : 'paid';
    const timeStr = j.end ? `${j.start} – ${j.end}` : j.start;
    return `
      <div class="journey-row">
        <div class="journey-icon ${type}">${icon}</div>
        <div class="journey-info">
          <div class="journey-route">${j.action}</div>
          <div class="journey-time">${timeStr}${j.note ? ' · ' + j.note : ''}</div>
        </div>
        <div class="journey-charge ${chargeClass}">${chargeText}</div>
        <div class="journey-date">${j.date.replace(/-20\d\d/, '')}</div>
      </div>
    `;
  }).join('');
}

// ── Build Schematic Map ──────────────────────────────────────────────────────
function buildMap(stats) {
  const visitedSet = new Set(stats.visitedStations);
  const svg = document.getElementById('tube-map-svg');
  
  // Draw line connections first (behind stations)
  const lineSegments = [];
  LINE_DEFS.forEach(line => {
    const coords = line.stations
      .map(s => STATION_COORDS[s])
      .filter(Boolean);
    if (coords.length < 2) return;
    // Draw polyline
    const points = coords.map(([x,y]) => `${x},${y}`).join(' ');
    lineSegments.push(`<polyline points="${points}" stroke="${line.color}" stroke-width="3" fill="none" opacity="0.35" stroke-linejoin="round"/>`);
  });

  // Draw station dots
  const stationDots = Object.entries(STATION_COORDS).map(([name, [x, y]]) => {
    const visited = visitedSet.has(name);
    const count = stats.stationCount[name] || 0;
    const radius = visited ? Math.min(7 + count, 12) : 4;
    const fill   = visited ? '#DC241F' : 'rgba(255,255,255,0.12)';
    const stroke = visited ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)';
    const title  = visited ? `${name} (${count}×)` : name;
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${visited ? 1.5 : 1}" data-name="${name}" class="station-dot ${visited ? 'visited' : ''}" data-count="${count}">
      <title>${title}</title>
    </circle>`;
  });

  // Station labels for visited stations
  const labels = stats.visitedStations.map(name => {
    const coords = STATION_COORDS[name];
    if (!coords) return '';
    const [x, y] = coords;
    const count = stats.stationCount[name] || 0;
    return `<text x="${x}" y="${y - 10}" font-size="8" fill="rgba(255,255,255,0.8)" text-anchor="middle" font-family="system-ui" font-weight="600">${name.replace(" [London Underground]","").replace(" [National Rail]","")}</text>`;
  });

  svg.innerHTML = lineSegments.join('') + stationDots.join('') + labels.join('');

  // Tooltip on hover
  svg.querySelectorAll('.station-dot').forEach(dot => {
    dot.style.cursor = 'pointer';
    dot.addEventListener('mouseenter', function(e) {
      const tip = document.getElementById('map-tooltip');
      const name = this.dataset.name;
      const count = parseInt(this.dataset.count);
      tip.textContent = count > 0 ? `${name} · tapped ${count}×` : name;
      tip.style.display = 'block';
    });
    dot.addEventListener('mousemove', function(e) {
      const tip = document.getElementById('map-tooltip');
      const rect = svg.closest('.map-container').getBoundingClientRect();
      tip.style.left = (e.clientX - rect.left + 12) + 'px';
      tip.style.top  = (e.clientY - rect.top  - 28) + 'px';
    });
    dot.addEventListener('mouseleave', function() {
      document.getElementById('map-tooltip').style.display = 'none';
    });
  });
}

// ── Update section count badges ──────────────────────────────────────────────
function updateBadges(stats) {
  const el = document.getElementById('station-count-badge');
  if (el) el.textContent = `${stats.visitedStations.length} stations`;
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const stats = computeStats();

  renderStats(stats);
  renderTopStations(stats);
  renderSpend(stats);
  renderMonthChart(stats);
  renderLines(stats);
  renderJourneys('all');
  buildMap(stats);
  updateBadges(stats);

  // Filter buttons
  document.querySelectorAll('.jf-btn').forEach(btn => {
    btn.addEventListener('click', () => renderJourneys(btn.dataset.filter));
  });
});
