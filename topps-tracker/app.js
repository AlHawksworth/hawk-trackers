// ═══════════════════════════════════════════════════════════════════════════════
// TOPPS TRACKER — app.js
// F1 2026 & Premier League 2026/27 card collection tracker
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';

// ─── Storage keys ───────────────────────────────────────────────────────────
const LS_OWNED_F1 = 'topps_f1_2026_owned';
const LS_OWNED_PL = 'topps_pl_2627_owned';

// ─── App state ──────────────────────────────────────────────────────────────
let currentCollection = 'f1';   // 'f1' | 'pl'
let ownedF1 = new Set(JSON.parse(localStorage.getItem(LS_OWNED_F1) || '[]'));
let ownedPL = new Set(JSON.parse(localStorage.getItem(LS_OWNED_PL) || '[]'));
let filterValueable = false;
let toastTimer = null;

// ─── Rarity levels ──────────────────────────────────────────────────────────
// common | rare | epic | legend
// valuable = true means it's flagged as potentially high-value

// ═══════════════════════════════════════════════════════════════════════════════
// F1 2026 CARD DATA
// Topps Chrome F1 2026 series — drivers, constructors, parallels & specials
// Total: ~200 base cards + inserts
// ═══════════════════════════════════════════════════════════════════════════════
const F1_CARDS = [

  // ── BASE SET: Drivers (1–20) ─────────────────────────────────────────────
  { id:'f1-001', num:'001', name:'Max Verstappen',       sub:'Red Bull Racing',    rarity:'legend', valuable:true,  category:'Base Set' },
  { id:'f1-002', num:'002', name:'Sergio Pérez',          sub:'Red Bull Racing',    rarity:'common', valuable:false, category:'Base Set' },
  { id:'f1-003', num:'003', name:'Lewis Hamilton',        sub:'Ferrari',            rarity:'legend', valuable:true,  category:'Base Set' },
  { id:'f1-004', num:'004', name:'Charles Leclerc',       sub:'Ferrari',            rarity:'epic',   valuable:true,  category:'Base Set' },
  { id:'f1-005', num:'005', name:'Lando Norris',          sub:'McLaren',            rarity:'epic',   valuable:true,  category:'Base Set' },
  { id:'f1-006', num:'006', name:'Oscar Piastri',         sub:'McLaren',            rarity:'rare',   valuable:true,  category:'Base Set' },
  { id:'f1-007', num:'007', name:'George Russell',        sub:'Mercedes',           rarity:'rare',   valuable:false, category:'Base Set' },
  { id:'f1-008', num:'008', name:'Kimi Antonelli',        sub:'Mercedes',           rarity:'rare',   valuable:true,  category:'Base Set' },
  { id:'f1-009', num:'009', name:'Fernando Alonso',       sub:'Aston Martin',       rarity:'legend', valuable:true,  category:'Base Set' },
  { id:'f1-010', num:'010', name:'Lance Stroll',          sub:'Aston Martin',       rarity:'common', valuable:false, category:'Base Set' },
  { id:'f1-011', num:'011', name:'Carlos Sainz',          sub:'Williams',           rarity:'rare',   valuable:false, category:'Base Set' },
  { id:'f1-012', num:'012', name:'Alex Albon',            sub:'Williams',           rarity:'common', valuable:false, category:'Base Set' },
  { id:'f1-013', num:'013', name:'Pierre Gasly',          sub:'Alpine',             rarity:'common', valuable:false, category:'Base Set' },
  { id:'f1-014', num:'014', name:'Jack Doohan',           sub:'Alpine',             rarity:'rare',   valuable:true,  category:'Base Set' },
  { id:'f1-015', num:'015', name:'Nico Hülkenberg',       sub:'Sauber / Audi',      rarity:'common', valuable:false, category:'Base Set' },
  { id:'f1-016', num:'016', name:'Valtteri Bottas',       sub:'Sauber / Audi',      rarity:'common', valuable:false, category:'Base Set' },
  { id:'f1-017', num:'017', name:'Yuki Tsunoda',          sub:'Racing Bulls',       rarity:'rare',   valuable:false, category:'Base Set' },
  { id:'f1-018', num:'018', name:'Isack Hadjar',          sub:'Racing Bulls',       rarity:'rare',   valuable:true,  category:'Base Set' },
  { id:'f1-019', num:'019', name:'Esteban Ocon',          sub:'Haas',               rarity:'common', valuable:false, category:'Base Set' },
  { id:'f1-020', num:'020', name:'Oliver Bearman',        sub:'Haas',               rarity:'rare',   valuable:true,  category:'Base Set' },

  // ── BASE SET: Constructors (21–30) ──────────────────────────────────────
  { id:'f1-021', num:'021', name:'Red Bull Racing',       sub:'Constructor Card',   rarity:'epic',   valuable:true,  category:'Constructors' },
  { id:'f1-022', num:'022', name:'Ferrari',               sub:'Constructor Card',   rarity:'epic',   valuable:true,  category:'Constructors' },
  { id:'f1-023', num:'023', name:'McLaren',               sub:'Constructor Card',   rarity:'epic',   valuable:true,  category:'Constructors' },
  { id:'f1-024', num:'024', name:'Mercedes',              sub:'Constructor Card',   rarity:'rare',   valuable:false, category:'Constructors' },
  { id:'f1-025', num:'025', name:'Aston Martin',          sub:'Constructor Card',   rarity:'rare',   valuable:false, category:'Constructors' },
  { id:'f1-026', num:'026', name:'Williams',              sub:'Constructor Card',   rarity:'common', valuable:false, category:'Constructors' },
  { id:'f1-027', num:'027', name:'Alpine',                sub:'Constructor Card',   rarity:'common', valuable:false, category:'Constructors' },
  { id:'f1-028', num:'028', name:'Sauber / Audi',         sub:'Constructor Card',   rarity:'rare',   valuable:true,  category:'Constructors' },
  { id:'f1-029', num:'029', name:'Racing Bulls',          sub:'Constructor Card',   rarity:'common', valuable:false, category:'Constructors' },
  { id:'f1-030', num:'030', name:'Haas',                  sub:'Constructor Card',   rarity:'common', valuable:false, category:'Constructors' },

  // ── CHROME REFRACTORS (C01–C20) ─────────────────────────────────────────
  { id:'f1-C01', num:'C01', name:'Max Verstappen Refractor',     sub:'Chrome Parallel',   rarity:'legend', valuable:true,  category:'Chrome Refractors' },
  { id:'f1-C02', num:'C02', name:'Lewis Hamilton Refractor',     sub:'Chrome Parallel',   rarity:'legend', valuable:true,  category:'Chrome Refractors' },
  { id:'f1-C03', num:'C03', name:'Lando Norris Refractor',       sub:'Chrome Parallel',   rarity:'epic',   valuable:true,  category:'Chrome Refractors' },
  { id:'f1-C04', num:'C04', name:'Charles Leclerc Refractor',    sub:'Chrome Parallel',   rarity:'epic',   valuable:true,  category:'Chrome Refractors' },
  { id:'f1-C05', num:'C05', name:'Fernando Alonso Refractor',    sub:'Chrome Parallel',   rarity:'legend', valuable:true,  category:'Chrome Refractors' },
  { id:'f1-C06', num:'C06', name:'Oscar Piastri Refractor',      sub:'Chrome Parallel',   rarity:'rare',   valuable:true,  category:'Chrome Refractors' },
  { id:'f1-C07', num:'C07', name:'Kimi Antonelli Refractor',     sub:'Chrome Parallel',   rarity:'rare',   valuable:true,  category:'Chrome Refractors' },
  { id:'f1-C08', num:'C08', name:'George Russell Refractor',     sub:'Chrome Parallel',   rarity:'rare',   valuable:false, category:'Chrome Refractors' },
  { id:'f1-C09', num:'C09', name:'Oliver Bearman Refractor',     sub:'Chrome Parallel',   rarity:'rare',   valuable:true,  category:'Chrome Refractors' },
  { id:'f1-C10', num:'C10', name:'Isack Hadjar Refractor',       sub:'Chrome Parallel',   rarity:'rare',   valuable:true,  category:'Chrome Refractors' },

  // Gold Refractors (/50)
  { id:'f1-G01', num:'G01', name:'Max Verstappen Gold /50',      sub:'Gold Refractor',    rarity:'legend', valuable:true,  category:'Gold Refractors' },
  { id:'f1-G02', num:'G02', name:'Lewis Hamilton Gold /50',      sub:'Gold Refractor',    rarity:'legend', valuable:true,  category:'Gold Refractors' },
  { id:'f1-G03', num:'G03', name:'Lando Norris Gold /50',        sub:'Gold Refractor',    rarity:'epic',   valuable:true,  category:'Gold Refractors' },
  { id:'f1-G04', num:'G04', name:'Charles Leclerc Gold /50',     sub:'Gold Refractor',    rarity:'epic',   valuable:true,  category:'Gold Refractors' },
  { id:'f1-G05', num:'G05', name:'Fernando Alonso Gold /50',     sub:'Gold Refractor',    rarity:'legend', valuable:true,  category:'Gold Refractors' },

  // SuperFractors (1/1)
  { id:'f1-SF1', num:'SF1', name:'Verstappen SuperFractor 1/1',  sub:'SuperFractor — 1/1', rarity:'legend', valuable:true, category:'SuperFractors' },
  { id:'f1-SF2', num:'SF2', name:'Hamilton SuperFractor 1/1',    sub:'SuperFractor — 1/1', rarity:'legend', valuable:true, category:'SuperFractors' },
  { id:'f1-SF3', num:'SF3', name:'Norris SuperFractor 1/1',      sub:'SuperFractor — 1/1', rarity:'legend', valuable:true, category:'SuperFractors' },

  // ── AUTOGRAPHS (A01–A15) ────────────────────────────────────────────────
  { id:'f1-A01', num:'A01', name:'Verstappen Auto',       sub:'On-Card Autograph',  rarity:'legend', valuable:true,  category:'Autographs' },
  { id:'f1-A02', num:'A02', name:'Hamilton Auto',         sub:'On-Card Autograph',  rarity:'legend', valuable:true,  category:'Autographs' },
  { id:'f1-A03', num:'A03', name:'Norris Auto',           sub:'On-Card Autograph',  rarity:'epic',   valuable:true,  category:'Autographs' },
  { id:'f1-A04', num:'A04', name:'Leclerc Auto',          sub:'On-Card Autograph',  rarity:'epic',   valuable:true,  category:'Autographs' },
  { id:'f1-A05', num:'A05', name:'Alonso Auto',           sub:'On-Card Autograph',  rarity:'legend', valuable:true,  category:'Autographs' },
  { id:'f1-A06', num:'A06', name:'Piastri Auto',          sub:'On-Card Autograph',  rarity:'rare',   valuable:true,  category:'Autographs' },
  { id:'f1-A07', num:'A07', name:'Antonelli Auto',        sub:'On-Card Autograph',  rarity:'rare',   valuable:true,  category:'Autographs' },
  { id:'f1-A08', num:'A08', name:'Bearman Auto',          sub:'On-Card Autograph',  rarity:'rare',   valuable:true,  category:'Autographs' },
  { id:'f1-A09', num:'A09', name:'Hadjar Auto',           sub:'On-Card Autograph',  rarity:'rare',   valuable:true,  category:'Autographs' },
  { id:'f1-A10', num:'A10', name:'Doohan Auto',           sub:'On-Card Autograph',  rarity:'rare',   valuable:true,  category:'Autographs' },
  { id:'f1-A11', num:'A11', name:'Russell Auto',          sub:'On-Card Autograph',  rarity:'rare',   valuable:false, category:'Autographs' },
  { id:'f1-A12', num:'A12', name:'Sainz Auto',            sub:'On-Card Autograph',  rarity:'rare',   valuable:false, category:'Autographs' },
  { id:'f1-A13', num:'A13', name:'Gasly Auto',            sub:'On-Card Autograph',  rarity:'common', valuable:false, category:'Autographs' },
  { id:'f1-A14', num:'A14', name:'Tsunoda Auto',          sub:'On-Card Autograph',  rarity:'common', valuable:false, category:'Autographs' },
  { id:'f1-A15', num:'A15', name:'Hülkenberg Auto',       sub:'On-Card Autograph',  rarity:'common', valuable:false, category:'Autographs' },

  // ── INSERT SETS ─────────────────────────────────────────────────────────
  // Speed Kings
  { id:'f1-SK1', num:'SK1', name:'Verstappen — Speed Kings',  sub:'Speed Kings Insert',  rarity:'epic',   valuable:true,  category:'Speed Kings' },
  { id:'f1-SK2', num:'SK2', name:'Norris — Speed Kings',      sub:'Speed Kings Insert',  rarity:'epic',   valuable:true,  category:'Speed Kings' },
  { id:'f1-SK3', num:'SK3', name:'Hamilton — Speed Kings',    sub:'Speed Kings Insert',  rarity:'epic',   valuable:true,  category:'Speed Kings' },
  { id:'f1-SK4', num:'SK4', name:'Leclerc — Speed Kings',     sub:'Speed Kings Insert',  rarity:'rare',   valuable:false, category:'Speed Kings' },
  { id:'f1-SK5', num:'SK5', name:'Alonso — Speed Kings',      sub:'Speed Kings Insert',  rarity:'rare',   valuable:false, category:'Speed Kings' },

  // Pit Lane Prospects (rookies / next gen)
  { id:'f1-PP1', num:'PP1', name:'Kimi Antonelli — Prospect',  sub:'Pit Lane Prospects', rarity:'epic',  valuable:true,  category:'Pit Lane Prospects' },
  { id:'f1-PP2', num:'PP2', name:'Isack Hadjar — Prospect',    sub:'Pit Lane Prospects', rarity:'rare',  valuable:true,  category:'Pit Lane Prospects' },
  { id:'f1-PP3', num:'PP3', name:'Oliver Bearman — Prospect',  sub:'Pit Lane Prospects', rarity:'rare',  valuable:true,  category:'Pit Lane Prospects' },
  { id:'f1-PP4', num:'PP4', name:'Jack Doohan — Prospect',     sub:'Pit Lane Prospects', rarity:'rare',  valuable:true,  category:'Pit Lane Prospects' },

  // Circuit Legends
  { id:'f1-CL1', num:'CL1', name:'Monaco GP — Circuit Legend',    sub:'Circuit Legends',  rarity:'rare',  valuable:false, category:'Circuit Legends' },
  { id:'f1-CL2', num:'CL2', name:'Silverstone — Circuit Legend',  sub:'Circuit Legends',  rarity:'rare',  valuable:false, category:'Circuit Legends' },
  { id:'f1-CL3', num:'CL3', name:'Monza — Circuit Legend',        sub:'Circuit Legends',  rarity:'rare',  valuable:false, category:'Circuit Legends' },
  { id:'f1-CL4', num:'CL4', name:'Spa — Circuit Legend',          sub:'Circuit Legends',  rarity:'rare',  valuable:false, category:'Circuit Legends' },
  { id:'f1-CL5', num:'CL5', name:'Suzuka — Circuit Legend',       sub:'Circuit Legends',  rarity:'rare',  valuable:false, category:'Circuit Legends' },
  { id:'f1-CL6', num:'CL6', name:'Interlagos — Circuit Legend',   sub:'Circuit Legends',  rarity:'rare',  valuable:false, category:'Circuit Legends' },

  // Hall of Fame
  { id:'f1-HF1', num:'HF1', name:'Michael Schumacher — HoF',  sub:'Hall of Fame',  rarity:'legend', valuable:true, category:'Hall of Fame' },
  { id:'f1-HF2', num:'HF2', name:'Ayrton Senna — HoF',        sub:'Hall of Fame',  rarity:'legend', valuable:true, category:'Hall of Fame' },
  { id:'f1-HF3', num:'HF3', name:'Alain Prost — HoF',         sub:'Hall of Fame',  rarity:'legend', valuable:true, category:'Hall of Fame' },
  { id:'f1-HF4', num:'HF4', name:'Nigel Mansell — HoF',       sub:'Hall of Fame',  rarity:'epic',   valuable:true, category:'Hall of Fame' },
  { id:'f1-HF5', num:'HF5', name:'Jackie Stewart — HoF',      sub:'Hall of Fame',  rarity:'epic',   valuable:true, category:'Hall of Fame' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIER LEAGUE 2026/27 CARD DATA
// Source: 2026-27 Topps Flagship Premier League — official checklist
// https://www.checklistinsider.com/2026-27-topps-flagship-premier-league
// 300 Base cards (incl. Future Stars 1-20) + autograph sets + insert sets
// ═══════════════════════════════════════════════════════════════════════════════
const PL_CARDS = [

  // ── FUTURE STARS (1-20) ──────────────────────────────────────────────────
  { id:'pl-001', num:'1',   name:'Max Dowman',              sub:'Arsenal FS',                rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-002', num:'2',   name:'Jamaldeen Jimoh-Aloba',   sub:'Aston Villa FS',            rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-003', num:'3',   name:'Veljko Milosavljevic',    sub:'AFC Bournemouth FS',        rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-004', num:'4',   name:'Junior Kroupi',           sub:'AFC Bournemouth FS',        rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-005', num:'5',   name:'Yasin Ayari',             sub:'Brighton FS',               rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-006', num:'6',   name:'Stefanos Tzimas',         sub:'Brighton FS',               rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-007', num:'7',   name:'Reggie Walsh',            sub:'Chelsea FS',                rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-008', num:'8',   name:'Estevao Willian',         sub:'Chelsea FS',                rarity:'epic',   valuable:true,  category:'Future Stars' },
  { id:'pl-009', num:'9',   name:'Dastan Satpayev',         sub:'Chelsea FS',                rarity:'rare',   valuable:false, category:'Future Stars' },
  { id:'pl-010', num:'10',  name:'Romain Esse',             sub:'Crystal Palace FS',         rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-011', num:'11',  name:'Joel Drakes-Thomas',      sub:'Crystal Palace FS',         rarity:'rare',   valuable:false, category:'Future Stars' },
  { id:'pl-012', num:'12',  name:'Josh King',               sub:'Fulham FS',                 rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-013', num:'13',  name:'Harry Gray',              sub:'Leeds United FS',           rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-014', num:'14',  name:'Giovanni Leoni',          sub:'Liverpool FC FS',           rarity:'epic',   valuable:true,  category:'Future Stars' },
  { id:'pl-015', num:'15',  name:'Rio Ngumoha',             sub:'Liverpool FC FS',           rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-016', num:'16',  name:'Divine Mukasa',           sub:'Manchester City FS',        rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-017', num:'17',  name:'Jack Fletcher',           sub:'Manchester United FS',      rarity:'rare',   valuable:false, category:'Future Stars' },
  { id:'pl-018', num:'18',  name:'Shea Lacey',              sub:'Manchester United FS',      rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-019', num:'19',  name:'Igor Jesus',              sub:'Nottingham Forest FS',      rarity:'rare',   valuable:true,  category:'Future Stars' },
  { id:'pl-020', num:'20',  name:'Chris Rigg',              sub:'Sunderland FS',             rarity:'epic',   valuable:true,  category:'Future Stars' },

  // ── ARSENAL (21-34) ──────────────────────────────────────────────────────
  { id:'pl-021', num:'21',  name:'William Saliba',          sub:'Arsenal',                   rarity:'epic',   valuable:true,  category:'Arsenal' },
  { id:'pl-022', num:'22',  name:'Gabriel Magalhaes',       sub:'Arsenal',                   rarity:'rare',   valuable:false, category:'Arsenal' },
  { id:'pl-023', num:'23',  name:'Jaden Dixon',             sub:'Arsenal RC',                rarity:'rare',   valuable:true,  category:'Arsenal' },
  { id:'pl-024', num:'24',  name:'Jurrien Timber',          sub:'Arsenal',                   rarity:'rare',   valuable:true,  category:'Arsenal' },
  { id:'pl-025', num:'25',  name:'Myles Lewis-Skelly',      sub:'Arsenal',                   rarity:'rare',   valuable:true,  category:'Arsenal' },
  { id:'pl-026', num:'26',  name:'Martin Zubimendi',        sub:'Arsenal',                   rarity:'epic',   valuable:true,  category:'Arsenal' },
  { id:'pl-027', num:'27',  name:'Ife Ibrahim',             sub:'Arsenal RC',                rarity:'rare',   valuable:false, category:'Arsenal' },
  { id:'pl-028', num:'28',  name:'Declan Rice',             sub:'Arsenal',                   rarity:'epic',   valuable:true,  category:'Arsenal' },
  { id:'pl-029', num:'29',  name:'Martin Odegaard',         sub:'Arsenal',                   rarity:'epic',   valuable:true,  category:'Arsenal' },
  { id:'pl-030', num:'30',  name:'Eberechi Eze',            sub:'Arsenal',                   rarity:'epic',   valuable:true,  category:'Arsenal' },
  { id:'pl-031', num:'31',  name:'Gabriel Martinelli',      sub:'Arsenal',                   rarity:'rare',   valuable:false, category:'Arsenal' },
  { id:'pl-032', num:'32',  name:'Bukayo Saka',             sub:'Arsenal',                   rarity:'legend', valuable:true,  category:'Arsenal' },
  { id:'pl-033', num:'33',  name:'Viktor Gyokeres',         sub:'Arsenal',                   rarity:'legend', valuable:true,  category:'Arsenal' },
  { id:'pl-034', num:'34',  name:'Brando Bailey-Joseph',    sub:'Arsenal RC',                rarity:'rare',   valuable:false, category:'Arsenal' },

  // ── ASTON VILLA (35-48) ──────────────────────────────────────────────────
  { id:'pl-035', num:'35',  name:'Pau Torres',              sub:'Aston Villa',               rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-036', num:'36',  name:'Ezri Konsa',              sub:'Aston Villa',               rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-037', num:'37',  name:'Matty Cash',              sub:'Aston Villa',               rarity:'common', valuable:false, category:'Aston Villa' },
  { id:'pl-038', num:'38',  name:'Lamare Bogarde',          sub:'Aston Villa',               rarity:'common', valuable:false, category:'Aston Villa' },
  { id:'pl-039', num:'39',  name:'Ian Maatsen',             sub:'Aston Villa',               rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-040', num:'40',  name:'Boubacar Kamara',         sub:'Aston Villa',               rarity:'common', valuable:false, category:'Aston Villa' },
  { id:'pl-041', num:'41',  name:'Amadou Onana',            sub:'Aston Villa',               rarity:'rare',   valuable:true,  category:'Aston Villa' },
  { id:'pl-042', num:'42',  name:'Youri Tielemans',         sub:'Aston Villa',               rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-043', num:'43',  name:'John McGinn',             sub:'Aston Villa',               rarity:'common', valuable:false, category:'Aston Villa' },
  { id:'pl-044', num:'44',  name:'Morgan Rogers',           sub:'Aston Villa',               rarity:'rare',   valuable:true,  category:'Aston Villa' },
  { id:'pl-045', num:'45',  name:'Alysson',                 sub:'Aston Villa RC',            rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-046', num:'46',  name:'Brian Madjo',             sub:'Aston Villa RC',            rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-047', num:'47',  name:'Tammy Abraham',           sub:'Aston Villa',               rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-048', num:'48',  name:'Ollie Watkins',           sub:'Aston Villa',               rarity:'epic',   valuable:true,  category:'Aston Villa' },

  // ── AFC BOURNEMOUTH (49-62) ───────────────────────────────────────────────
  { id:'pl-049', num:'49',  name:'Bafode Diakite',          sub:'AFC Bournemouth',           rarity:'common', valuable:false, category:'AFC Bournemouth' },
  { id:'pl-050', num:'50',  name:'Julio Soler',             sub:'AFC Bournemouth',           rarity:'common', valuable:false, category:'AFC Bournemouth' },
  { id:'pl-051', num:'51',  name:'Adrien Truffert',         sub:'AFC Bournemouth',           rarity:'rare',   valuable:false, category:'AFC Bournemouth' },
  { id:'pl-052', num:'52',  name:'Tyler Adams',             sub:'AFC Bournemouth',           rarity:'rare',   valuable:false, category:'AFC Bournemouth' },
  { id:'pl-053', num:'53',  name:'Marcus Tavernier',        sub:'AFC Bournemouth',           rarity:'common', valuable:false, category:'AFC Bournemouth' },
  { id:'pl-054', num:'54',  name:'Alex Scott',              sub:'AFC Bournemouth',           rarity:'rare',   valuable:true,  category:'AFC Bournemouth' },
  { id:'pl-055', num:'55',  name:'David Brooks',            sub:'AFC Bournemouth',           rarity:'common', valuable:false, category:'AFC Bournemouth' },
  { id:'pl-056', num:'56',  name:'Alex Toth',               sub:'AFC Bournemouth RC',        rarity:'rare',   valuable:false, category:'AFC Bournemouth' },
  { id:'pl-057', num:'57',  name:'Lewis Cook',              sub:'AFC Bournemouth',           rarity:'common', valuable:false, category:'AFC Bournemouth' },
  { id:'pl-058', num:'58',  name:'Amine Adli',              sub:'AFC Bournemouth',           rarity:'rare',   valuable:false, category:'AFC Bournemouth' },
  { id:'pl-059', num:'59',  name:'Ben Gannon-Doak',         sub:'AFC Bournemouth',           rarity:'common', valuable:false, category:'AFC Bournemouth' },
  { id:'pl-060', num:'60',  name:'Justin Kluivert',         sub:'AFC Bournemouth',           rarity:'rare',   valuable:false, category:'AFC Bournemouth' },
  { id:'pl-061', num:'61',  name:'Rayan',                   sub:'AFC Bournemouth RC',        rarity:'rare',   valuable:true,  category:'AFC Bournemouth' },
  { id:'pl-062', num:'62',  name:'Evanilson',               sub:'AFC Bournemouth',           rarity:'rare',   valuable:true,  category:'AFC Bournemouth' },

  // ── BRENTFORD (63-76) ────────────────────────────────────────────────────
  { id:'pl-063', num:'63',  name:'Nathan Collins',          sub:'Brentford',                 rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-064', num:'64',  name:'Sepp van den Berg',       sub:'Brentford',                 rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-065', num:'65',  name:'Michael Kayode',          sub:'Brentford',                 rarity:'rare',   valuable:false, category:'Brentford' },
  { id:'pl-066', num:'66',  name:'Yunus Konak',             sub:'Brentford',                 rarity:'rare',   valuable:false, category:'Brentford' },
  { id:'pl-067', num:'67',  name:'Antoni Milambo',          sub:'Brentford',                 rarity:'rare',   valuable:true,  category:'Brentford' },
  { id:'pl-068', num:'68',  name:'Mathias Jensen',          sub:'Brentford',                 rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-069', num:'69',  name:'Jordan Henderson',        sub:'Brentford',                 rarity:'rare',   valuable:false, category:'Brentford' },
  { id:'pl-070', num:'70',  name:'Mikkel Damsgaard',        sub:'Brentford',                 rarity:'rare',   valuable:false, category:'Brentford' },
  { id:'pl-071', num:'71',  name:'Yehor Yarmolyuk',         sub:'Brentford',                 rarity:'rare',   valuable:false, category:'Brentford' },
  { id:'pl-072', num:'72',  name:'Kaye Furo',               sub:'Brentford RC',              rarity:'rare',   valuable:true,  category:'Brentford' },
  { id:'pl-073', num:'73',  name:'Kevin Schade',            sub:'Brentford',                 rarity:'rare',   valuable:false, category:'Brentford' },
  { id:'pl-074', num:'74',  name:'Keane Lewis-Potter',      sub:'Brentford',                 rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-075', num:'75',  name:'Igor Thiago',             sub:'Brentford',                 rarity:'rare',   valuable:true,  category:'Brentford' },
  { id:'pl-076', num:'76',  name:'Dango Ouattara',          sub:'Brentford',                 rarity:'rare',   valuable:true,  category:'Brentford' },

  // ── BRIGHTON (77-90) ─────────────────────────────────────────────────────
  { id:'pl-077', num:'77',  name:'Jan Paul van Hecke',      sub:'Brighton & Hove Albion',    rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-078', num:'78',  name:'Ferdi Kadioglu',          sub:'Brighton & Hove Albion',    rarity:'rare',   valuable:true,  category:'Brighton' },
  { id:'pl-079', num:'79',  name:'Lewis Dunk',              sub:'Brighton & Hove Albion',    rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-080', num:'80',  name:'Diego Coppola',           sub:'Brighton & Hove Albion',    rarity:'rare',   valuable:false, category:'Brighton' },
  { id:'pl-081', num:'81',  name:'Jack Hinshelwood',        sub:'Brighton & Hove Albion',    rarity:'rare',   valuable:false, category:'Brighton' },
  { id:'pl-082', num:'82',  name:'Carlos Baleba',           sub:'Brighton & Hove Albion',    rarity:'rare',   valuable:false, category:'Brighton' },
  { id:'pl-083', num:'83',  name:'Diego Gomez',             sub:'Brighton & Hove Albion',    rarity:'rare',   valuable:false, category:'Brighton' },
  { id:'pl-084', num:'84',  name:'Mats Wieffer',            sub:'Brighton & Hove Albion',    rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-085', num:'85',  name:'Pascal Gross',            sub:'Brighton & Hove Albion',    rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-086', num:'86',  name:'Kaoru Mitoma',            sub:'Brighton & Hove Albion',    rarity:'rare',   valuable:true,  category:'Brighton' },
  { id:'pl-087', num:'87',  name:'Charalampos Kostoulas',   sub:'Brighton & Hove Albion',    rarity:'rare',   valuable:true,  category:'Brighton' },
  { id:'pl-088', num:'88',  name:'Danny Welbeck',           sub:'Brighton & Hove Albion',    rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-089', num:'89',  name:'Georginio Rutter',        sub:'Brighton & Hove Albion',    rarity:'rare',   valuable:false, category:'Brighton' },
  { id:'pl-090', num:'90',  name:'Yankuba Minteh',          sub:'Brighton & Hove Albion',    rarity:'rare',   valuable:true,  category:'Brighton' },

  // ── CHELSEA (91-104) ─────────────────────────────────────────────────────
  { id:'pl-091', num:'91',  name:'Jorrel Hato',             sub:'Chelsea',                   rarity:'rare',   valuable:true,  category:'Chelsea' },
  { id:'pl-092', num:'92',  name:'Reece James',             sub:'Chelsea',                   rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-093', num:'93',  name:'Marc Cucurella',          sub:'Chelsea',                   rarity:'common', valuable:false, category:'Chelsea' },
  { id:'pl-094', num:'94',  name:'Malo Gusto',              sub:'Chelsea',                   rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-095', num:'95',  name:'Moises Caicedo',          sub:'Chelsea',                   rarity:'epic',   valuable:true,  category:'Chelsea' },
  { id:'pl-096', num:'96',  name:'Enzo Fernandez',          sub:'Chelsea',                   rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-097', num:'97',  name:'Landon Emenalo',          sub:'Chelsea RC',                rarity:'rare',   valuable:true,  category:'Chelsea' },
  { id:'pl-098', num:'98',  name:'Andrey Santos',           sub:'Chelsea',                   rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-099', num:'99',  name:'Jesse Derry',             sub:'Chelsea RC',                rarity:'rare',   valuable:true,  category:'Chelsea' },
  { id:'pl-100', num:'100', name:'Pedro Neto',              sub:'Chelsea',                   rarity:'rare',   valuable:true,  category:'Chelsea' },
  { id:'pl-101', num:'101', name:'Alejandro Garnacho',      sub:'Chelsea',                   rarity:'epic',   valuable:true,  category:'Chelsea' },
  { id:'pl-102', num:'102', name:'Ryan Kavuma-McQueen',     sub:'Chelsea RC',                rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-103', num:'103', name:'Joao Pedro',              sub:'Chelsea',                   rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-104', num:'104', name:'Cole Palmer',             sub:'Chelsea',                   rarity:'legend', valuable:true,  category:'Chelsea' },

  // ── CRYSTAL PALACE (105-118) ──────────────────────────────────────────────
  { id:'pl-105', num:'105', name:'Tyrick Mitchell',         sub:'Crystal Palace',            rarity:'common', valuable:false, category:'Crystal Palace' },
  { id:'pl-106', num:'106', name:'Maxence Lacroix',         sub:'Crystal Palace',            rarity:'common', valuable:false, category:'Crystal Palace' },
  { id:'pl-107', num:'107', name:'Chadi Riad',              sub:'Crystal Palace',            rarity:'common', valuable:false, category:'Crystal Palace' },
  { id:'pl-108', num:'108', name:'Dean Benamar',            sub:'Crystal Palace RC',         rarity:'rare',   valuable:false, category:'Crystal Palace' },
  { id:'pl-109', num:'109', name:'Chris Richards',          sub:'Crystal Palace',            rarity:'common', valuable:false, category:'Crystal Palace' },
  { id:'pl-110', num:'110', name:'Daniel Munoz',            sub:'Crystal Palace',            rarity:'common', valuable:false, category:'Crystal Palace' },
  { id:'pl-111', num:'111', name:'Justin Devenny',          sub:'Crystal Palace',            rarity:'rare',   valuable:false, category:'Crystal Palace' },
  { id:'pl-112', num:'112', name:'Adam Wharton',            sub:'Crystal Palace',            rarity:'rare',   valuable:true,  category:'Crystal Palace' },
  { id:'pl-113', num:'113', name:'Yeremy Pino',             sub:'Crystal Palace',            rarity:'rare',   valuable:true,  category:'Crystal Palace' },
  { id:'pl-114', num:'114', name:'Brennan Johnson',         sub:'Crystal Palace',            rarity:'rare',   valuable:true,  category:'Crystal Palace' },
  { id:'pl-115', num:'115', name:'Ismaila Sarr',            sub:'Crystal Palace',            rarity:'rare',   valuable:false, category:'Crystal Palace' },
  { id:'pl-116', num:'116', name:'Eddie Nketiah',           sub:'Crystal Palace',            rarity:'rare',   valuable:false, category:'Crystal Palace' },
  { id:'pl-117', num:'117', name:'Jorgen Strand Larsen',    sub:'Crystal Palace',            rarity:'rare',   valuable:false, category:'Crystal Palace' },
  { id:'pl-118', num:'118', name:'Jean-Philippe Mateta',    sub:'Crystal Palace',            rarity:'rare',   valuable:false, category:'Crystal Palace' },

  // ── EVERTON (119-132) ────────────────────────────────────────────────────
  { id:'pl-119', num:'119', name:'James Tarkowski',         sub:'Everton',                   rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-120', num:'120', name:'Jarrad Branthwaite',      sub:'Everton',                   rarity:'rare',   valuable:true,  category:'Everton' },
  { id:'pl-121', num:'121', name:'Adam Aznou',              sub:'Everton',                   rarity:'rare',   valuable:true,  category:'Everton' },
  { id:'pl-122', num:'122', name:'Jake O\'Brien',           sub:'Everton',                   rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-123', num:'123', name:'Vitalii Mykolenko',       sub:'Everton',                   rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-124', num:'124', name:'Charly Alcaraz',          sub:'Everton',                   rarity:'rare',   valuable:false, category:'Everton' },
  { id:'pl-125', num:'125', name:'Tim Iroegbunam',          sub:'Everton',                   rarity:'rare',   valuable:false, category:'Everton' },
  { id:'pl-126', num:'126', name:'Kiernan Dewsbury-Hall',   sub:'Everton',                   rarity:'rare',   valuable:false, category:'Everton' },
  { id:'pl-127', num:'127', name:'James Garner',            sub:'Everton',                   rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-128', num:'128', name:'Tyler Dibling',           sub:'Everton',                   rarity:'epic',   valuable:true,  category:'Everton' },
  { id:'pl-129', num:'129', name:'Dwight McNeil',           sub:'Everton',                   rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-130', num:'130', name:'Iliman Ndiaye',           sub:'Everton',                   rarity:'rare',   valuable:true,  category:'Everton' },
  { id:'pl-131', num:'131', name:'Beto',                    sub:'Everton',                   rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-132', num:'132', name:'Thierno Barry',           sub:'Everton',                   rarity:'rare',   valuable:true,  category:'Everton' },

  // ── FULHAM (133-146) ─────────────────────────────────────────────────────
  { id:'pl-133', num:'133', name:'Calvin Bassey',           sub:'Fulham',                    rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-134', num:'134', name:'Joachim Andersen',        sub:'Fulham',                    rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-135', num:'135', name:'Antonee Robinson',        sub:'Fulham',                    rarity:'rare',   valuable:false, category:'Fulham' },
  { id:'pl-136', num:'136', name:'Kenny Tete',              sub:'Fulham',                    rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-137', num:'137', name:'Timothy Castagne',        sub:'Fulham',                    rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-138', num:'138', name:'Sasa Lukic',              sub:'Fulham',                    rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-139', num:'139', name:'Sander Berge',            sub:'Fulham',                    rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-140', num:'140', name:'Alex Iwobi',              sub:'Fulham',                    rarity:'rare',   valuable:false, category:'Fulham' },
  { id:'pl-141', num:'141', name:'Seth Ridgeon',            sub:'Fulham RC',                 rarity:'rare',   valuable:false, category:'Fulham' },
  { id:'pl-142', num:'142', name:'Emile Smith Rowe',        sub:'Fulham',                    rarity:'epic',   valuable:true,  category:'Fulham' },
  { id:'pl-143', num:'143', name:'Oscar Bobb',              sub:'Fulham',                    rarity:'epic',   valuable:true,  category:'Fulham' },
  { id:'pl-144', num:'144', name:'Aaron Loupalo-Bi',        sub:'Fulham RC',                 rarity:'rare',   valuable:false, category:'Fulham' },
  { id:'pl-145', num:'145', name:'Kevin',                   sub:'Fulham',                    rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-146', num:'146', name:'Rodrigo Muniz',           sub:'Fulham',                    rarity:'rare',   valuable:false, category:'Fulham' },

  // ── LEEDS UNITED (147-160) ────────────────────────────────────────────────
  { id:'pl-147', num:'147', name:'Joe Rodon',               sub:'Leeds United',              rarity:'common', valuable:false, category:'Leeds United' },
  { id:'pl-148', num:'148', name:'Pascal Struijk',          sub:'Leeds United',              rarity:'common', valuable:false, category:'Leeds United' },
  { id:'pl-149', num:'149', name:'Jayden Bogle',            sub:'Leeds United',              rarity:'common', valuable:false, category:'Leeds United' },
  { id:'pl-150', num:'150', name:'Ethan Ampadu',            sub:'Leeds United',              rarity:'common', valuable:false, category:'Leeds United' },
  { id:'pl-151', num:'151', name:'Gabriel Gudmundsson',     sub:'Leeds United',              rarity:'common', valuable:false, category:'Leeds United' },
  { id:'pl-152', num:'152', name:'Sean Longstaff',          sub:'Leeds United',              rarity:'common', valuable:false, category:'Leeds United' },
  { id:'pl-153', num:'153', name:'Ao Tanaka',               sub:'Leeds United',              rarity:'rare',   valuable:false, category:'Leeds United' },
  { id:'pl-154', num:'154', name:'Brenden Aaronson',        sub:'Leeds United',              rarity:'rare',   valuable:false, category:'Leeds United' },
  { id:'pl-155', num:'155', name:'Anton Stach',             sub:'Leeds United',              rarity:'rare',   valuable:false, category:'Leeds United' },
  { id:'pl-156', num:'156', name:'Lukas Nmecha',            sub:'Leeds United',              rarity:'rare',   valuable:false, category:'Leeds United' },
  { id:'pl-157', num:'157', name:'Wilfried Gnonto',         sub:'Leeds United',              rarity:'rare',   valuable:true,  category:'Leeds United' },
  { id:'pl-158', num:'158', name:'Daniel James',            sub:'Leeds United',              rarity:'common', valuable:false, category:'Leeds United' },
  { id:'pl-159', num:'159', name:'Noah Okafor',             sub:'Leeds United',              rarity:'rare',   valuable:true,  category:'Leeds United' },
  { id:'pl-160', num:'160', name:'Dominic Calvert-Lewin',   sub:'Leeds United',              rarity:'rare',   valuable:false, category:'Leeds United' },

  // ── LIVERPOOL (161-174) ───────────────────────────────────────────────────
  { id:'pl-161', num:'161', name:'Jeremy Jacquet',          sub:'Liverpool FC RC',           rarity:'rare',   valuable:false, category:'Liverpool' },
  { id:'pl-162', num:'162', name:'Virgil van Dijk',         sub:'Liverpool FC',              rarity:'epic',   valuable:true,  category:'Liverpool' },
  { id:'pl-163', num:'163', name:'Milos Kerkez',            sub:'Liverpool FC',              rarity:'rare',   valuable:true,  category:'Liverpool' },
  { id:'pl-164', num:'164', name:'Jeremie Frimpong',        sub:'Liverpool FC',              rarity:'rare',   valuable:true,  category:'Liverpool' },
  { id:'pl-165', num:'165', name:'Conor Bradley',           sub:'Liverpool FC',              rarity:'rare',   valuable:false, category:'Liverpool' },
  { id:'pl-166', num:'166', name:'Ryan Gravenberch',        sub:'Liverpool FC',              rarity:'rare',   valuable:true,  category:'Liverpool' },
  { id:'pl-167', num:'167', name:'Alexis Mac Allister',     sub:'Liverpool FC',              rarity:'rare',   valuable:false, category:'Liverpool' },
  { id:'pl-168', num:'168', name:'Dominik Szoboszlai',      sub:'Liverpool FC',              rarity:'rare',   valuable:true,  category:'Liverpool' },
  { id:'pl-169', num:'169', name:'Curtis Jones',            sub:'Liverpool FC',              rarity:'common', valuable:false, category:'Liverpool' },
  { id:'pl-170', num:'170', name:'Florian Wirtz',           sub:'Liverpool FC',              rarity:'legend', valuable:true,  category:'Liverpool' },
  { id:'pl-171', num:'171', name:'Keyrol Figueroa',         sub:'Liverpool FC RC',           rarity:'rare',   valuable:true,  category:'Liverpool' },
  { id:'pl-172', num:'172', name:'Cody Gakpo',              sub:'Liverpool FC',              rarity:'rare',   valuable:false, category:'Liverpool' },
  { id:'pl-173', num:'173', name:'Hugo Ekitike',            sub:'Liverpool FC',              rarity:'epic',   valuable:true,  category:'Liverpool' },
  { id:'pl-174', num:'174', name:'Alexander Isak',          sub:'Liverpool FC',              rarity:'legend', valuable:true,  category:'Liverpool' },

  // ── MANCHESTER CITY (175-188) ─────────────────────────────────────────────
  { id:'pl-175', num:'175', name:'Marc Guéhi',              sub:'Manchester City',           rarity:'rare',   valuable:true,  category:'Manchester City' },
  { id:'pl-176', num:'176', name:'Ruben Dias',              sub:'Manchester City',           rarity:'rare',   valuable:false, category:'Manchester City' },
  { id:'pl-177', num:'177', name:'Josko Gvardiol',          sub:'Manchester City',           rarity:'rare',   valuable:true,  category:'Manchester City' },
  { id:'pl-178', num:'178', name:'Nico O\'Reilly',          sub:'Manchester City',           rarity:'rare',   valuable:true,  category:'Manchester City' },
  { id:'pl-179', num:'179', name:'Floyd Samba',             sub:'Manchester City RC',        rarity:'rare',   valuable:false, category:'Manchester City' },
  { id:'pl-180', num:'180', name:'Tijjani Reijnders',       sub:'Manchester City',           rarity:'epic',   valuable:true,  category:'Manchester City' },
  { id:'pl-181', num:'181', name:'Rodri',                   sub:'Manchester City',           rarity:'legend', valuable:true,  category:'Manchester City' },
  { id:'pl-182', num:'182', name:'Jeremy Doku',             sub:'Manchester City',           rarity:'epic',   valuable:true,  category:'Manchester City' },
  { id:'pl-183', num:'183', name:'Phil Foden',              sub:'Manchester City',           rarity:'epic',   valuable:true,  category:'Manchester City' },
  { id:'pl-184', num:'184', name:'Rayan Cherki',            sub:'Manchester City',           rarity:'epic',   valuable:true,  category:'Manchester City' },
  { id:'pl-185', num:'185', name:'Antoine Semenyo',         sub:'Manchester City',           rarity:'rare',   valuable:true,  category:'Manchester City' },
  { id:'pl-186', num:'186', name:'Ryan McAidoo',            sub:'Manchester City RC',        rarity:'rare',   valuable:false, category:'Manchester City' },
  { id:'pl-187', num:'187', name:'Omar Marmoush',           sub:'Manchester City',           rarity:'rare',   valuable:true,  category:'Manchester City' },
  { id:'pl-188', num:'188', name:'Erling Haaland',          sub:'Manchester City',           rarity:'legend', valuable:true,  category:'Manchester City' },

  // ── MANCHESTER UNITED (189-202) ───────────────────────────────────────────
  { id:'pl-189', num:'189', name:'Tyler Fredricson',        sub:'Manchester United RC',      rarity:'rare',   valuable:false, category:'Manchester United' },
  { id:'pl-190', num:'190', name:'Leny Yoro',               sub:'Manchester United',         rarity:'epic',   valuable:true,  category:'Manchester United' },
  { id:'pl-191', num:'191', name:'Lisandro Martinez',       sub:'Manchester United',         rarity:'rare',   valuable:false, category:'Manchester United' },
  { id:'pl-192', num:'192', name:'Ayden Heaven',            sub:'Manchester United',         rarity:'rare',   valuable:false, category:'Manchester United' },
  { id:'pl-193', num:'193', name:'Patrick Dorgu',           sub:'Manchester United',         rarity:'rare',   valuable:true,  category:'Manchester United' },
  { id:'pl-194', num:'194', name:'Godwill Kukonki',         sub:'Manchester United RC',      rarity:'rare',   valuable:false, category:'Manchester United' },
  { id:'pl-195', num:'195', name:'Kobbie Mainoo',           sub:'Manchester United',         rarity:'epic',   valuable:true,  category:'Manchester United' },
  { id:'pl-196', num:'196', name:'Bruno Fernandes',         sub:'Manchester United',         rarity:'epic',   valuable:true,  category:'Manchester United' },
  { id:'pl-197', num:'197', name:'Tyler Fletcher',          sub:'Manchester United RC',      rarity:'rare',   valuable:false, category:'Manchester United' },
  { id:'pl-198', num:'198', name:'JJ Gabriel',              sub:'Manchester United RC',      rarity:'rare',   valuable:true,  category:'Manchester United' },
  { id:'pl-199', num:'199', name:'Matheus Cunha',           sub:'Manchester United',         rarity:'epic',   valuable:true,  category:'Manchester United' },
  { id:'pl-200', num:'200', name:'Amad',                    sub:'Manchester United',         rarity:'epic',   valuable:true,  category:'Manchester United' },
  { id:'pl-201', num:'201', name:'Bryan Mbeumo',            sub:'Manchester United',         rarity:'legend', valuable:true,  category:'Manchester United' },
  { id:'pl-202', num:'202', name:'Benjamin Sesko',          sub:'Manchester United',         rarity:'legend', valuable:true,  category:'Manchester United' },

  // ── NEWCASTLE UNITED (203-216) ────────────────────────────────────────────
  { id:'pl-203', num:'203', name:'Sven Botman',             sub:'Newcastle United',          rarity:'common', valuable:false, category:'Newcastle United' },
  { id:'pl-204', num:'204', name:'Malick Thiaw',            sub:'Newcastle United',          rarity:'rare',   valuable:true,  category:'Newcastle United' },
  { id:'pl-205', num:'205', name:'Tino Livramento',         sub:'Newcastle United',          rarity:'rare',   valuable:true,  category:'Newcastle United' },
  { id:'pl-206', num:'206', name:'Lewis Hall',              sub:'Newcastle United',          rarity:'rare',   valuable:false, category:'Newcastle United' },
  { id:'pl-207', num:'207', name:'Dan Burn',                sub:'Newcastle United',          rarity:'common', valuable:false, category:'Newcastle United' },
  { id:'pl-208', num:'208', name:'Jacob Ramsey',            sub:'Newcastle United',          rarity:'rare',   valuable:true,  category:'Newcastle United' },
  { id:'pl-209', num:'209', name:'Sandro Tonali',           sub:'Newcastle United',          rarity:'epic',   valuable:true,  category:'Newcastle United' },
  { id:'pl-210', num:'210', name:'Joelinton',               sub:'Newcastle United',          rarity:'common', valuable:false, category:'Newcastle United' },
  { id:'pl-211', num:'211', name:'Bruno Guimaraes',         sub:'Newcastle United',          rarity:'epic',   valuable:true,  category:'Newcastle United' },
  { id:'pl-212', num:'212', name:'Sean Neave',              sub:'Newcastle United RC',       rarity:'rare',   valuable:false, category:'Newcastle United' },
  { id:'pl-213', num:'213', name:'Harvey Barnes',           sub:'Newcastle United',          rarity:'common', valuable:false, category:'Newcastle United' },
  { id:'pl-214', num:'214', name:'Yoane Wissa',             sub:'Newcastle United',          rarity:'rare',   valuable:true,  category:'Newcastle United' },
  { id:'pl-215', num:'215', name:'Nick Woltemade',          sub:'Newcastle United',          rarity:'rare',   valuable:true,  category:'Newcastle United' },
  { id:'pl-216', num:'216', name:'Anthony Elanga',          sub:'Newcastle United',          rarity:'rare',   valuable:true,  category:'Newcastle United' },

  // ── NOTTINGHAM FOREST (217-230) ───────────────────────────────────────────
  { id:'pl-217', num:'217', name:'Nikola Milenkovic',       sub:'Nottingham Forest',         rarity:'common', valuable:false, category:'Nottingham Forest' },
  { id:'pl-218', num:'218', name:'Nicolo Savona',           sub:'Nottingham Forest',         rarity:'rare',   valuable:false, category:'Nottingham Forest' },
  { id:'pl-219', num:'219', name:'Murillo',                 sub:'Nottingham Forest',         rarity:'rare',   valuable:true,  category:'Nottingham Forest' },
  { id:'pl-220', num:'220', name:'Luca Netz',               sub:'Nottingham Forest',         rarity:'rare',   valuable:false, category:'Nottingham Forest' },
  { id:'pl-221', num:'221', name:'Neco Williams',           sub:'Nottingham Forest',         rarity:'common', valuable:false, category:'Nottingham Forest' },
  { id:'pl-222', num:'222', name:'Ola Aina',                sub:'Nottingham Forest',         rarity:'common', valuable:false, category:'Nottingham Forest' },
  { id:'pl-223', num:'223', name:'James McAtee',            sub:'Nottingham Forest',         rarity:'rare',   valuable:false, category:'Nottingham Forest' },
  { id:'pl-224', num:'224', name:'Elliot Anderson',         sub:'Nottingham Forest',         rarity:'rare',   valuable:false, category:'Nottingham Forest' },
  { id:'pl-225', num:'225', name:'Morgan Gibbs-White',      sub:'Nottingham Forest',         rarity:'rare',   valuable:true,  category:'Nottingham Forest' },
  { id:'pl-226', num:'226', name:'Ryan Yates',              sub:'Nottingham Forest',         rarity:'common', valuable:false, category:'Nottingham Forest' },
  { id:'pl-227', num:'227', name:'Omari Hutchinson',        sub:'Nottingham Forest',         rarity:'rare',   valuable:true,  category:'Nottingham Forest' },
  { id:'pl-228', num:'228', name:'Callum Hudson-Odoi',      sub:'Nottingham Forest',         rarity:'rare',   valuable:false, category:'Nottingham Forest' },
  { id:'pl-229', num:'229', name:'Dan Ndoye',               sub:'Nottingham Forest',         rarity:'rare',   valuable:true,  category:'Nottingham Forest' },
  { id:'pl-230', num:'230', name:'Chris Wood',              sub:'Nottingham Forest',         rarity:'rare',   valuable:false, category:'Nottingham Forest' },

  // ── SUNDERLAND (231-244) ──────────────────────────────────────────────────
  { id:'pl-231', num:'231', name:'Trai Hume',               sub:'Sunderland',                rarity:'common', valuable:false, category:'Sunderland' },
  { id:'pl-232', num:'232', name:'Reinildo Mandava',        sub:'Sunderland',                rarity:'rare',   valuable:false, category:'Sunderland' },
  { id:'pl-233', num:'233', name:'Omar Alderete',           sub:'Sunderland',                rarity:'common', valuable:false, category:'Sunderland' },
  { id:'pl-234', num:'234', name:'Nordi Mukiele',           sub:'Sunderland',                rarity:'common', valuable:false, category:'Sunderland' },
  { id:'pl-235', num:'235', name:'Habib Diarra',            sub:'Sunderland',                rarity:'rare',   valuable:true,  category:'Sunderland' },
  { id:'pl-236', num:'236', name:'Granit Xhaka',            sub:'Sunderland',                rarity:'rare',   valuable:false, category:'Sunderland' },
  { id:'pl-237', num:'237', name:'Noah Sadiki',             sub:'Sunderland',                rarity:'rare',   valuable:false, category:'Sunderland' },
  { id:'pl-238', num:'238', name:'Enzo Le Fee',             sub:'Sunderland',                rarity:'rare',   valuable:false, category:'Sunderland' },
  { id:'pl-239', num:'239', name:'Nilson Angulo',           sub:'Sunderland',                rarity:'rare',   valuable:true,  category:'Sunderland' },
  { id:'pl-240', num:'240', name:'Timur Tutierov',          sub:'Sunderland RC',             rarity:'rare',   valuable:false, category:'Sunderland' },
  { id:'pl-241', num:'241', name:'Brian Brobbey',           sub:'Sunderland',                rarity:'rare',   valuable:true,  category:'Sunderland' },
  { id:'pl-242', num:'242', name:'Chemsdine Talbi',         sub:'Sunderland',                rarity:'rare',   valuable:true,  category:'Sunderland' },
  { id:'pl-243', num:'243', name:'Eliezer Mayenda',         sub:'Sunderland',                rarity:'rare',   valuable:false, category:'Sunderland' },
  { id:'pl-244', num:'244', name:'Wilson Isidor',           sub:'Sunderland',                rarity:'common', valuable:false, category:'Sunderland' },

  // ── TOTTENHAM HOTSPUR (245-258) ───────────────────────────────────────────
  { id:'pl-245', num:'245', name:'Pedro Porro',             sub:'Tottenham Hotspur',         rarity:'common', valuable:false, category:'Tottenham Hotspur' },
  { id:'pl-246', num:'246', name:'Micky van de Ven',        sub:'Tottenham Hotspur',         rarity:'epic',   valuable:true,  category:'Tottenham Hotspur' },
  { id:'pl-247', num:'247', name:'Cristian Romero',         sub:'Tottenham Hotspur',         rarity:'rare',   valuable:false, category:'Tottenham Hotspur' },
  { id:'pl-248', num:'248', name:'Souza',                   sub:'Tottenham Hotspur RC',      rarity:'rare',   valuable:false, category:'Tottenham Hotspur' },
  { id:'pl-249', num:'249', name:'Djed Spence',             sub:'Tottenham Hotspur',         rarity:'common', valuable:false, category:'Tottenham Hotspur' },
  { id:'pl-250', num:'250', name:'Archie Gray',             sub:'Tottenham Hotspur',         rarity:'rare',   valuable:true,  category:'Tottenham Hotspur' },
  { id:'pl-251', num:'251', name:'Conor Gallagher',         sub:'Tottenham Hotspur',         rarity:'rare',   valuable:false, category:'Tottenham Hotspur' },
  { id:'pl-252', num:'252', name:'Dejan Kulusevski',        sub:'Tottenham Hotspur',         rarity:'rare',   valuable:true,  category:'Tottenham Hotspur' },
  { id:'pl-253', num:'253', name:'Lucas Bergvall',          sub:'Tottenham Hotspur',         rarity:'epic',   valuable:true,  category:'Tottenham Hotspur' },
  { id:'pl-254', num:'254', name:'Xavi Simons',             sub:'Tottenham Hotspur',         rarity:'legend', valuable:true,  category:'Tottenham Hotspur' },
  { id:'pl-255', num:'255', name:'Luca Williams-Barnett',   sub:'Tottenham Hotspur RC',      rarity:'epic',   valuable:true,  category:'Tottenham Hotspur' },
  { id:'pl-256', num:'256', name:'James Maddison',          sub:'Tottenham Hotspur',         rarity:'rare',   valuable:false, category:'Tottenham Hotspur' },
  { id:'pl-257', num:'257', name:'Mohammed Kudus',          sub:'Tottenham Hotspur',         rarity:'rare',   valuable:true,  category:'Tottenham Hotspur' },
  { id:'pl-258', num:'258', name:'Dominic Solanke',         sub:'Tottenham Hotspur',         rarity:'rare',   valuable:false, category:'Tottenham Hotspur' },

  // ── COVENTRY CITY (259-272) ───────────────────────────────────────────────
  { id:'pl-259', num:'259', name:'Milan van Ewijk',         sub:'Coventry City',             rarity:'rare',   valuable:false, category:'Coventry City' },
  { id:'pl-260', num:'260', name:'Jay Dasilva',             sub:'Coventry City',             rarity:'common', valuable:false, category:'Coventry City' },
  { id:'pl-261', num:'261', name:'Liam Kitching',           sub:'Coventry City RC',          rarity:'rare',   valuable:false, category:'Coventry City' },
  { id:'pl-262', num:'262', name:'Bobby Thomas',            sub:'Coventry City RC',          rarity:'rare',   valuable:false, category:'Coventry City' },
  { id:'pl-263', num:'263', name:'Joel Latibeaudiere',      sub:'Coventry City RC',          rarity:'rare',   valuable:false, category:'Coventry City' },
  { id:'pl-264', num:'264', name:'Matt Grimes',             sub:'Coventry City',             rarity:'common', valuable:false, category:'Coventry City' },
  { id:'pl-265', num:'265', name:'Victor Torp',             sub:'Coventry City',             rarity:'common', valuable:false, category:'Coventry City' },
  { id:'pl-266', num:'266', name:'Jack Rudoni',             sub:'Coventry City',             rarity:'common', valuable:false, category:'Coventry City' },
  { id:'pl-267', num:'267', name:'Josh Eccles',             sub:'Coventry City RC',          rarity:'rare',   valuable:false, category:'Coventry City' },
  { id:'pl-268', num:'268', name:'Ellis Simms',             sub:'Coventry City',             rarity:'common', valuable:false, category:'Coventry City' },
  { id:'pl-269', num:'269', name:'Brandon Thomas-Asante',   sub:'Coventry City',             rarity:'common', valuable:false, category:'Coventry City' },
  { id:'pl-270', num:'270', name:'Tatsuhiro Sakamoto',      sub:'Coventry City',             rarity:'rare',   valuable:false, category:'Coventry City' },
  { id:'pl-271', num:'271', name:'Ephron Mason-Clark',      sub:'Coventry City RC',          rarity:'rare',   valuable:false, category:'Coventry City' },
  { id:'pl-272', num:'272', name:'Haji Wright',             sub:'Coventry City',             rarity:'rare',   valuable:false, category:'Coventry City' },

  // ── IPSWICH TOWN (273-286) ────────────────────────────────────────────────
  { id:'pl-273', num:'273', name:'Dara O\'Shea',            sub:'Ipswich Town',              rarity:'common', valuable:false, category:'Ipswich Town' },
  { id:'pl-274', num:'274', name:'Darnell Furlong',         sub:'Ipswich Town',              rarity:'common', valuable:false, category:'Ipswich Town' },
  { id:'pl-275', num:'275', name:'Leif Davis',              sub:'Ipswich Town',              rarity:'common', valuable:false, category:'Ipswich Town' },
  { id:'pl-276', num:'276', name:'Cedric Kipre',            sub:'Ipswich Town',              rarity:'common', valuable:false, category:'Ipswich Town' },
  { id:'pl-277', num:'277', name:'Jacob Greaves',           sub:'Ipswich Town',              rarity:'common', valuable:false, category:'Ipswich Town' },
  { id:'pl-278', num:'278', name:'Ben Johnson',             sub:'Ipswich Town',              rarity:'common', valuable:false, category:'Ipswich Town' },
  { id:'pl-279', num:'279', name:'Azor Matusiwa',           sub:'Ipswich Town',              rarity:'common', valuable:false, category:'Ipswich Town' },
  { id:'pl-280', num:'280', name:'Jack Taylor',             sub:'Ipswich Town RC',           rarity:'rare',   valuable:false, category:'Ipswich Town' },
  { id:'pl-281', num:'281', name:'Marcelino Nunez',         sub:'Ipswich Town',              rarity:'common', valuable:false, category:'Ipswich Town' },
  { id:'pl-282', num:'282', name:'Kasey McAteer',           sub:'Ipswich Town',              rarity:'rare',   valuable:false, category:'Ipswich Town' },
  { id:'pl-283', num:'283', name:'Sindre Walle Egeli',      sub:'Ipswich Town',              rarity:'rare',   valuable:false, category:'Ipswich Town' },
  { id:'pl-284', num:'284', name:'Jaden Philogene',         sub:'Ipswich Town',              rarity:'rare',   valuable:true,  category:'Ipswich Town' },
  { id:'pl-285', num:'285', name:'George Hirst',            sub:'Ipswich Town',              rarity:'common', valuable:false, category:'Ipswich Town' },
  { id:'pl-286', num:'286', name:'Jack Clarke',             sub:'Ipswich Town',              rarity:'rare',   valuable:false, category:'Ipswich Town' },

  // ── HULL CITY (287-300) ───────────────────────────────────────────────────
  { id:'pl-287', num:'287', name:'John Egan',               sub:'Hull City',                 rarity:'common', valuable:false, category:'Hull City' },
  { id:'pl-288', num:'288', name:'Charlie Hughes',          sub:'Hull City',                 rarity:'common', valuable:false, category:'Hull City' },
  { id:'pl-289', num:'289', name:'Lewie Coyle',             sub:'Hull City',                 rarity:'common', valuable:false, category:'Hull City' },
  { id:'pl-290', num:'290', name:'Ryan Giles',              sub:'Hull City',                 rarity:'common', valuable:false, category:'Hull City' },
  { id:'pl-291', num:'291', name:'Semi Ajayi',              sub:'Hull City',                 rarity:'common', valuable:false, category:'Hull City' },
  { id:'pl-292', num:'292', name:'Cody Drameh',             sub:'Hull City',                 rarity:'common', valuable:false, category:'Hull City' },
  { id:'pl-293', num:'293', name:'Darko Gyabi',             sub:'Hull City RC',              rarity:'rare',   valuable:false, category:'Hull City' },
  { id:'pl-294', num:'294', name:'Regan Slater',            sub:'Hull City RC',              rarity:'rare',   valuable:false, category:'Hull City' },
  { id:'pl-295', num:'295', name:'Matt Crooks',             sub:'Hull City',                 rarity:'common', valuable:false, category:'Hull City' },
  { id:'pl-296', num:'296', name:'David Akintola',          sub:'Hull City RC',              rarity:'rare',   valuable:false, category:'Hull City' },
  { id:'pl-297', num:'297', name:'Liam Millar',             sub:'Hull City',                 rarity:'common', valuable:false, category:'Hull City' },
  { id:'pl-298', num:'298', name:'Mohamed Belloumi',        sub:'Hull City RC',              rarity:'rare',   valuable:false, category:'Hull City' },
  { id:'pl-299', num:'299', name:'Kyle Joseph',             sub:'Hull City RC',              rarity:'rare',   valuable:false, category:'Hull City' },
  { id:'pl-300', num:'300', name:'Oli McBurnie',            sub:'Hull City',                 rarity:'common', valuable:false, category:'Hull City' },

  // ── BASE AUTOGRAPHS (key names only — 165 total in set) ───────────────────
  { id:'pl-BA-BS',  num:'BA-BS',  name:'Bukayo Saka Auto',          sub:'Base Autograph',   rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-EH',  num:'BA-EH',  name:'Erling Haaland Auto',       sub:'Base Autograph',   rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MS',  num:'BA-MS',  name:'Mohamed Salah Auto',        sub:'Base Autograph',   rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-CP',  num:'BA-CP',  name:'Cole Palmer Auto',          sub:'Base Autograph',   rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-VVD', num:'BA-VVD', name:'Virgil van Dijk Auto',      sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-PF',  num:'BA-PF',  name:'Phil Foden Auto',           sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-BF',  num:'BA-BF',  name:'Bruno Fernandes Auto',      sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-KMA', num:'BA-KMA', name:'Kobbie Mainoo Auto',        sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-BG',  num:'BA-BG',  name:'Bruno Guimaraes Auto',      sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-ST',  num:'BA-ST',  name:'Sandro Tonali Auto',        sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-RC',  num:'BA-RC',  name:'Rayan Cherki Auto',         sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JD',  num:'BA-JD',  name:'Jeremy Doku Auto',          sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-TR',  num:'BA-TR',  name:'Tijjani Reijnders Auto',    sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-LY',  num:'BA-LY',  name:'Leny Yoro Auto',            sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MC',  num:'BA-MC',  name:'Matheus Cunha Auto',        sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-BM',  num:'BA-BM',  name:'Bryan Mbeumo Auto',         sub:'Base Autograph',   rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-AGA', num:'BA-AGA', name:'Alejandro Garnacho Auto',   sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-DR',  num:'BA-DR',  name:'Declan Rice Auto',          sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MZ',  num:'BA-MZ',  name:'Martin Zubimendi Auto',     sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-EE',  num:'BA-EE',  name:'Eberechi Eze Auto',         sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JF',  num:'BA-JF',  name:'Jeremie Frimpong Auto',     sub:'Base Autograph',   rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MKE', num:'BA-MKE', name:'Milos Kerkez Auto',         sub:'Base Autograph',   rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-NW',  num:'BA-NW',  name:'Nick Woltemade Auto',       sub:'Base Autograph',   rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JJG', num:'BA-JJG', name:'JJ Gabriel Auto',           sub:'Base Autograph',   rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-LW',  num:'BA-LW',  name:'Luca Williams-Barnett Auto',sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-LB',  num:'BA-LB',  name:'Lucas Bergvall Auto',       sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-DK',  num:'BA-DK',  name:'Dejan Kulusevski Auto',     sub:'Base Autograph',   rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-PD',  num:'BA-PD',  name:'Patrick Dorgu Auto',        sub:'Base Autograph',   rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JBR', num:'BA-JBR', name:'Jarrad Branthwaite Auto',   sub:'Base Autograph',   rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-TD',  num:'BA-TD',  name:'Tyler Dibling Auto',        sub:'Base Autograph',   rarity:'epic',   valuable:true,  category:'Base Autographs' },

  // ── 25 YEARS CHAMPIONS ANNIVERSARY AUTOS (/25 Hobby Exclusive) ────────────
  { id:'pl-CA-TH',  num:'CA-TH',  name:'Thierry Henry — 25 Yrs Auto',      sub:'Anniversary Auto /25', rarity:'legend', valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-PV',  num:'CA-PV',  name:'Patrick Vieira — 25 Yrs Auto',     sub:'Anniversary Auto /25', rarity:'legend', valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-DB',  num:'CA-DB',  name:'Dennis Bergkamp — 25 Yrs Auto',    sub:'Anniversary Auto /25', rarity:'legend', valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-DS',  num:'CA-DS',  name:'David Seaman — 25 Yrs Auto',       sub:'Anniversary Auto /25', rarity:'epic',   valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-AC',  num:'CA-AC',  name:'Ashley Cole — 25 Yrs Auto',        sub:'Anniversary Auto /25', rarity:'epic',   valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-FL',  num:'CA-FL',  name:'Freddie Ljungberg — 25 Yrs Auto',  sub:'Anniversary Auto /25', rarity:'rare',   valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-RPA', num:'CA-RPA', name:'Ray Parlour — 25 Yrs Auto',        sub:'Anniversary Auto /25', rarity:'rare',   valuable:false, category:'Anniversary Autos' },

  // ── BLACK EDGE AUTOS (Hobby Exclusive) ────────────────────────────────────
  { id:'pl-BE-HK',  num:'BE-HK',  name:'Harry Kane — Black Edge Auto',     sub:'Black Edge Auto',      rarity:'legend', valuable:true,  category:'Black Edge Autos' },
  { id:'pl-BE-DB',  num:'BE-DB',  name:'David Beckham — Black Edge Auto',  sub:'Black Edge Auto',      rarity:'legend', valuable:true,  category:'Black Edge Autos' },
  { id:'pl-BE-HE',  num:'BE-HE',  name:'Hugo Ekitike — Black Edge Auto',   sub:'Black Edge Auto',      rarity:'epic',   valuable:true,  category:'Black Edge Autos' },
  { id:'pl-BE-AS',  num:'BE-AS',  name:'Antoine Semenyo — Black Edge Auto',sub:'Black Edge Auto',      rarity:'rare',   valuable:true,  category:'Black Edge Autos' },
  { id:'pl-BE-MD',  num:'BE-MD',  name:'Max Dowman — Black Edge Auto',     sub:'Black Edge Auto',      rarity:'epic',   valuable:true,  category:'Black Edge Autos' },

  // ── GOLDEN BOOT ON-CARD AUTOS ─────────────────────────────────────────────
  { id:'pl-GB-MS',  num:'GB-MS',  name:'Mohamed Salah — Golden Boot Auto', sub:'Golden Boot Auto',     rarity:'legend', valuable:true,  category:'Golden Boot Autos' },
  { id:'pl-GB-EH',  num:'GB-EH',  name:'Erling Haaland — Golden Boot Auto',sub:'Golden Boot Auto',    rarity:'legend', valuable:true,  category:'Golden Boot Autos' },
  { id:'pl-GB-AS',  num:'GB-AS',  name:'Alan Shearer — Golden Boot Auto',  sub:'Golden Boot Auto',     rarity:'legend', valuable:true,  category:'Golden Boot Autos' },
  { id:'pl-GB-TH',  num:'GB-TH',  name:'Thierry Henry — Golden Boot Auto', sub:'Golden Boot Auto',     rarity:'legend', valuable:true,  category:'Golden Boot Autos' },
  { id:'pl-GK-HK',  num:'GK-HK',  name:'Harry Kane — Golden Boot Auto',    sub:'Golden Boot Auto',     rarity:'legend', valuable:true,  category:'Golden Boot Autos' },
  { id:'pl-GB-SHM', num:'GB-SHM', name:'Son Heung-min — Golden Boot Auto', sub:'Golden Boot Auto',     rarity:'epic',   valuable:true,  category:'Golden Boot Autos' },
  { id:'pl-GB-MO',  num:'GB-MO',  name:'Michael Owen — Golden Boot Auto',  sub:'Golden Boot Auto',     rarity:'epic',   valuable:true,  category:'Golden Boot Autos' },

  // ── CHROME CLASSICS AUTOS (Hobby Exclusive) ───────────────────────────────
  { id:'pl-CC-EH',  num:'CC-EH',  name:'Eden Hazard — Chrome Classics',    sub:'Chrome Classics Auto', rarity:'legend', valuable:true,  category:'Chrome Classics Autos' },
  { id:'pl-CC-RK',  num:'CC-RK',  name:'Roy Keane — Chrome Classics',      sub:'Chrome Classics Auto', rarity:'legend', valuable:true,  category:'Chrome Classics Autos' },
  { id:'pl-CC-AS',  num:'CC-AS',  name:'Alan Shearer — Chrome Classics',   sub:'Chrome Classics Auto', rarity:'legend', valuable:true,  category:'Chrome Classics Autos' },
  { id:'pl-CC-RVP', num:'CC-RVP', name:'Robin van Persie — Chrome Classic',sub:'Chrome Classics Auto', rarity:'epic',   valuable:true,  category:'Chrome Classics Autos' },
  { id:'pl-CC-RF',  num:'CC-RF',  name:'Roberto Firmino — Chrome Classic', sub:'Chrome Classics Auto', rarity:'epic',   valuable:true,  category:'Chrome Classics Autos' },
  { id:'pl-CC-TS',  num:'CC-TS',  name:'Thiago Silva — Chrome Classics',   sub:'Chrome Classics Auto', rarity:'epic',   valuable:true,  category:'Chrome Classics Autos' },
  { id:'pl-CC-YT',  num:'CC-YT',  name:'Yaya Toure — Chrome Classics',     sub:'Chrome Classics Auto', rarity:'epic',   valuable:true,  category:'Chrome Classics Autos' },
  { id:'pl-CC-DF',  num:'CC-DF',  name:'Duncan Ferguson — Chrome Classic', sub:'Chrome Classics Auto', rarity:'rare',   valuable:true,  category:'Chrome Classics Autos' },
  { id:'pl-CC-WZ',  num:'CC-WZ',  name:'Wilfried Zaha — Chrome Classics',  sub:'Chrome Classics Auto', rarity:'rare',   valuable:false, category:'Chrome Classics Autos' },

  // ── DUAL AUTOS (Hobby Exclusive) ──────────────────────────────────────────
  { id:'pl-DA-KH',  num:'DA-KH',  name:'Kane / Son Dual Auto',             sub:'Dual Autograph',       rarity:'legend', valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-BK',  num:'DA-BK',  name:'Beckham / Keane Dual Auto',        sub:'Dual Autograph',       rarity:'legend', valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-DS',  num:'DA-DS',  name:'Dowman / Saka Dual Auto',          sub:'Dual Autograph',       rarity:'epic',   valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-FD',  num:'DA-FD',  name:'Foden / Doku Dual Auto',           sub:'Dual Autograph',       rarity:'epic',   valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-TG',  num:'DA-TG',  name:'Tonali / Guimaraes Dual Auto',     sub:'Dual Autograph',       rarity:'epic',   valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-SW',  num:'DA-SW',  name:'Shearer / Woltemade Dual Auto',    sub:'Dual Autograph',       rarity:'epic',   valuable:true,  category:'Dual Autographs' },

  // ── MARKS OF EXCELLENCE ───────────────────────────────────────────────────
  { id:'pl-EX-EH',  num:'EX-EH',  name:'Erling Haaland — Marks of Excellence', sub:'Marks of Excellence', rarity:'legend', valuable:true, category:'Marks of Excellence' },
  { id:'pl-EX-MS',  num:'EX-MS',  name:'Mohamed Salah — Marks of Excellence',  sub:'Marks of Excellence', rarity:'legend', valuable:true, category:'Marks of Excellence' },
  { id:'pl-EX-VVD', num:'EX-VVD', name:'Virgil van Dijk — Marks of Excellence',sub:'Marks of Excellence', rarity:'epic',   valuable:true, category:'Marks of Excellence' },

  // ── PREMIER CLASS AUTO RELICS (Hobby Exclusive) ───────────────────────────
  { id:'pl-PC-EH',  num:'PC-EH',  name:'Haaland — Premier Class Auto Relic',   sub:'Premier Class AR',    rarity:'legend', valuable:true,  category:'Premier Class Relics' },
  { id:'pl-PC-MS',  num:'PC-MS',  name:'Salah — Premier Class Auto Relic',      sub:'Premier Class AR',   rarity:'legend', valuable:true,  category:'Premier Class Relics' },
  { id:'pl-PC-CP',  num:'PC-CP',  name:'Cole Palmer — Premier Class Auto Relic',sub:'Premier Class AR',   rarity:'legend', valuable:true,  category:'Premier Class Relics' },
  { id:'pl-PC-HK',  num:'PC-HK',  name:'Harry Kane — Premier Class Auto Relic', sub:'Premier Class AR',   rarity:'legend', valuable:true,  category:'Premier Class Relics' },
  { id:'pl-PC-BS',  num:'PC-BS',  name:'Bukayo Saka — Premier Class Auto Relic',sub:'Premier Class AR',   rarity:'legend', valuable:true,  category:'Premier Class Relics' },
  { id:'pl-PC-BF',  num:'PC-BF',  name:'Bruno Fernandes — Premier Class AR',    sub:'Premier Class AR',   rarity:'epic',   valuable:true,  category:'Premier Class Relics' },
  { id:'pl-PC-DB',  num:'PC-DB',  name:'David Beckham — Premier Class AR',      sub:'Premier Class AR',   rarity:'legend', valuable:true,  category:'Premier Class Relics' },
  { id:'pl-PC-SG',  num:'PC-SG',  name:'Steven Gerrard — Premier Class AR',     sub:'Premier Class AR',   rarity:'legend', valuable:true,  category:'Premier Class Relics' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function getOwnedSet() {
  return currentCollection === 'f1' ? ownedF1 : ownedPL;
}

// Derive the correct owned set directly from a card id (works cross-collection)
function ownedSetForId(id) {
  return id.startsWith('f1-') ? ownedF1 : ownedPL;
}

function getCardSet() {
  return currentCollection === 'f1' ? F1_CARDS : PL_CARDS;
}

function isOwned(id) {
  return ownedSetForId(id).has(id);
}

function toggleOwned(id) {
  const owned = ownedSetForId(id);
  if (owned.has(id)) {
    owned.delete(id);
    showToast('Removed from collection', 'toast-needed');
  } else {
    owned.add(id);
    showToast('Added to collection ✓', 'toast-owned');
  }
  saveData();
  renderStats();
  // If watch list tab is currently showing, refresh it
  if (currentCollection === 'watchlist') {
    filterWatchlist(currentWLFilter || 'all');
  }
  // Re-render the single tile
  const tile = document.querySelector(`[data-id="${id}"]`);
  if (tile) updateTile(tile, id);
}

function saveData() {
  localStorage.setItem(LS_OWNED_F1, JSON.stringify([...ownedF1]));
  localStorage.setItem(LS_OWNED_PL, JSON.stringify([...ownedPL]));
  const btn = document.getElementById('save-btn');
  btn.textContent = 'Saved ✓';
  btn.classList.add('saved');
  setTimeout(() => {
    btn.textContent = 'Save';
    btn.classList.remove('saved');
  }, 1800);
}

// ─── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg, cls = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + cls;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ─── Stats ──────────────────────────────────────────────────────────────────
function renderStats() {
  const f1Total  = F1_CARDS.length;
  const plTotal  = PL_CARDS.length;
  const totalCards = f1Total + plTotal;

  const f1Owned  = F1_CARDS.filter(c => ownedF1.has(c.id)).length;
  const plOwned  = PL_CARDS.filter(c => ownedPL.has(c.id)).length;
  const totalOwned = f1Owned + plOwned;

  const f1ValOwned = F1_CARDS.filter(c => c.valuable && ownedF1.has(c.id)).length;
  const plValOwned = PL_CARDS.filter(c => c.valuable && ownedPL.has(c.id)).length;
  const totalValOwned = f1ValOwned + plValOwned;

  const f1Pct = f1Total ? Math.round(f1Owned / f1Total * 100) : 0;
  const plPct = plTotal ? Math.round(plOwned / plTotal * 100) : 0;

  document.getElementById('stat-total-owned').textContent  = totalOwned;
  document.getElementById('stat-total-cards').textContent  = totalCards;
  document.getElementById('stat-valuable-owned').textContent = totalValOwned;
  document.getElementById('stat-f1-pct').textContent  = f1Pct + '%';
  document.getElementById('stat-pl-pct').textContent  = plPct + '%';

  // Progress bar for current collection
  const curCards   = currentCollection === 'f1' ? F1_CARDS : PL_CARDS;
  const curOwned   = currentCollection === 'f1' ? ownedF1   : ownedPL;
  const curOwnedN  = curCards.filter(c => curOwned.has(c.id)).length;
  const curPct     = curCards.length ? Math.round(curOwnedN / curCards.length * 100) : 0;
  const fillEl = document.getElementById('progress-fill');
  fillEl.style.width = curPct + '%';
  fillEl.className = 'progress-fill ' + (currentCollection === 'f1' ? 'f1' : 'pl');
  document.getElementById('progress-label').textContent =
    (currentCollection === 'f1' ? 'F1 2026' : 'Premier League 2026/27') + ' — Collection Progress';
  document.getElementById('progress-pct').textContent = `${curOwnedN} / ${curCards.length}  (${curPct}%)`;
}

// ─── Render helpers ─────────────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateTile(tile, id) {
  const owned = isOwned(id);
  tile.classList.toggle('owned', owned);
  const btn    = tile.querySelector('.card-toggle-btn');
  const check  = tile.querySelector('.card-owned-check');
  const badges = tile.querySelector('.card-badges');

  // Update owned badge
  let ownedBadge = badges.querySelector('.badge-owned');
  let neededBadge = badges.querySelector('.badge-needed');
  if (owned) {
    if (!ownedBadge) {
      ownedBadge = document.createElement('span');
      ownedBadge.className = 'card-badge badge-owned';
      ownedBadge.textContent = 'Owned';
      badges.prepend(ownedBadge);
    }
    if (neededBadge) neededBadge.remove();
  } else {
    if (ownedBadge) ownedBadge.remove();
    if (!neededBadge) {
      neededBadge = document.createElement('span');
      neededBadge.className = 'card-badge badge-needed';
      neededBadge.textContent = 'Needed';
      badges.prepend(neededBadge);
    }
  }
  if (btn)   btn.textContent   = owned ? 'Remove' : '+ Own';
  if (check) check.textContent = owned ? '✓' : '';
}

function buildTile(card) {
  const owned = isOwned(card.id);
  const tile  = document.createElement('div');
  tile.className = 'card-tile' + (owned ? ' owned' : ' needed') + (card.valuable ? ' valuable' : '');
  tile.dataset.id = card.id;

  // Rarity badge
  const rarityBadge = card.rarity !== 'common'
    ? `<span class="card-badge badge-${card.rarity}">${card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}</span>`
    : '';

  // Valuable badge
  const valBadge = card.valuable
    ? `<span class="card-badge badge-valuable">⭐ Hot</span>`
    : '';

  // Owned/needed badge
  const statusBadge = owned
    ? `<span class="card-badge badge-owned">Owned</span>`
    : `<span class="card-badge badge-needed">Needed</span>`;

  tile.innerHTML = `
    <div class="card-badges">${statusBadge}${rarityBadge}${valBadge}</div>
    <div class="card-number">#${escHtml(card.num)}</div>
    <div class="card-name">${escHtml(card.name)}</div>
    <div class="card-sub">${escHtml(card.sub)}</div>
    <div class="card-toggle">
      <button class="card-toggle-btn" onclick="event.stopPropagation();toggleOwned('${card.id}')">${owned ? 'Remove' : '+ Own'}</button>
      <div class="card-owned-check">${owned ? '✓' : ''}</div>
    </div>
  `;

  tile.addEventListener('click', () => toggleOwned(card.id));
  return tile;
}

// ─── Main render ────────────────────────────────────────────────────────────
function applyFilters() {
  const query    = (document.getElementById('search-input').value || '').toLowerCase();
  const status   = document.getElementById('filter-status').value;
  const rarity   = document.getElementById('filter-rarity').value;
  const ownedSet = getOwnedSet();
  const allCards = getCardSet();

  let filtered = allCards.filter(c => {
    if (query && !c.name.toLowerCase().includes(query) &&
                 !c.sub.toLowerCase().includes(query)  &&
                 !c.category.toLowerCase().includes(query) &&
                 !c.num.toLowerCase().includes(query)) return false;
    if (status === 'owned'  && !ownedSet.has(c.id)) return false;
    if (status === 'needed' &&  ownedSet.has(c.id)) return false;
    if (rarity !== 'all'    && c.rarity !== rarity)   return false;
    if (filterValueable     && !c.valuable)            return false;
    return true;
  });

  renderGrid(filtered);
  document.getElementById('bulk-visible').textContent = filtered.length;
}

function renderGrid(cards) {
  const section  = document.getElementById('card-grid-section');
  section.innerHTML = '';

  if (!cards.length) {
    section.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🃏</div>
        <p>No cards match your filters.</p>
      </div>`;
    return;
  }

  // Group by category
  const groups = {};
  cards.forEach(c => {
    if (!groups[c.category]) groups[c.category] = [];
    groups[c.category].push(c);
  });

  Object.entries(groups).forEach(([cat, catCards]) => {
    const heading = document.createElement('div');
    heading.className = 'section-heading';
    heading.textContent = cat;
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'card-grid';
    catCards.forEach(c => grid.appendChild(buildTile(c)));
    section.appendChild(grid);
  });
}

// ─── Collection switch ───────────────────────────────────────────────────────
function switchCollection(col) {
  currentCollection = col;

  // Update tab highlights
  document.querySelectorAll('.col-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.col === col);
  });

  const browserView   = document.getElementById('browser-view');
  const watchlistView = document.getElementById('watchlist-view');

  if (col === 'watchlist') {
    browserView.style.display   = 'none';
    watchlistView.style.display = 'block';
    // Reset watchlist sub-filter to 'all' on first open
    filterWatchlist(currentWLFilter || 'all');
    return;
  }

  // Showing a card collection
  browserView.style.display   = 'block';
  watchlistView.style.display = 'none';

  // Reset browse filters
  document.getElementById('search-input').value     = '';
  document.getElementById('filter-status').value    = 'all';
  document.getElementById('filter-rarity').value    = 'all';
  filterValueable = false;
  document.getElementById('toggle-valuable').classList.remove('active');

  renderStats();
  applyFilters();
}

// ─── Watch List ──────────────────────────────────────────────────────────────
let currentWLFilter = 'all';

function filterWatchlist(filter) {
  currentWLFilter = filter;

  // Update pill highlights
  document.querySelectorAll('.wl-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.wl === filter);
  });

  // Build combined valuable card list
  const allValuable = [
    ...F1_CARDS.filter(c => c.valuable).map(c => ({ ...c, collection: 'f1' })),
    ...PL_CARDS.filter(c => c.valuable).map(c => ({ ...c, collection: 'pl' })),
  ];

  let filtered = allValuable;
  if (filter === 'f1')     filtered = allValuable.filter(c => c.collection === 'f1');
  if (filter === 'pl')     filtered = allValuable.filter(c => c.collection === 'pl');
  if (filter === 'owned')  filtered = allValuable.filter(c => (c.collection === 'f1' ? ownedF1 : ownedPL).has(c.id));
  if (filter === 'needed') filtered = allValuable.filter(c => !(c.collection === 'f1' ? ownedF1 : ownedPL).has(c.id));

  // Summary chips
  const totalVal   = allValuable.length;
  const ownedVal   = allValuable.filter(c => (c.collection === 'f1' ? ownedF1 : ownedPL).has(c.id)).length;
  const neededVal  = totalVal - ownedVal;
  const f1Val      = allValuable.filter(c => c.collection === 'f1').length;
  const plVal      = allValuable.filter(c => c.collection === 'pl').length;

  document.getElementById('wl-summary').innerHTML = `
    <div class="wl-summary-chip">Total valuable: <span>${totalVal}</span></div>
    <div class="wl-summary-chip" style="color:var(--c-owned)">✓ Owned: <span style="color:var(--c-owned)">${ownedVal}</span></div>
    <div class="wl-summary-chip" style="color:var(--c-needed)">⬜ Needed: <span style="color:var(--c-needed)">${neededVal}</span></div>
    <div class="wl-summary-chip">🏎 F1: <span>${f1Val}</span></div>
    <div class="wl-summary-chip">⚽ PL: <span>${plVal}</span></div>
  `;

  // Render grid — temporarily override collection so buildTile works correctly
  const section = document.getElementById('watchlist-grid-section');
  section.innerHTML = '';

  if (!filtered.length) {
    section.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⭐</div><p>No valuable cards match this filter.</p></div>`;
    return;
  }

  // Group by collection then category
  const groups = {};
  filtered.forEach(c => {
    const groupKey = (c.collection === 'f1' ? '🏎 F1 2026' : '⚽ Premier League 26/27') + ' — ' + c.category;
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(c);
  });

  Object.entries(groups).forEach(([groupName, cards]) => {
    const heading = document.createElement('div');
    heading.className = 'section-heading';
    heading.textContent = groupName;
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'card-grid';
    cards.forEach(c => {
      const tile = buildTile(c);
      grid.appendChild(tile);
    });
    section.appendChild(grid);
  });
}

// ─── Valuable filter toggle ──────────────────────────────────────────────────
function toggleValuableFilter() {
  filterValueable = !filterValueable;
  document.getElementById('toggle-valuable').classList.toggle('active', filterValueable);
  applyFilters();
}

// ─── Bulk actions ────────────────────────────────────────────────────────────
function markAllOwned() {
  const ownedSet = getOwnedSet();
  const allCards = getCardSet();
  if (!confirm(`Mark ALL ${allCards.length} cards in this collection as owned?`)) return;
  allCards.forEach(c => ownedSet.add(c.id));
  saveData();
  renderStats();
  applyFilters();
  showToast(`Marked all ${allCards.length} cards as owned ✓`, 'toast-owned');
}

function clearCollection() {
  const ownedSet = getOwnedSet();
  const allCards = getCardSet();
  const n = [...ownedSet].filter(id => allCards.find(c => c.id === id)).length;
  if (!n) { showToast('Nothing to clear', ''); return; }
  if (!confirm(`Remove all ${n} owned cards from this collection?`)) return;
  allCards.forEach(c => ownedSet.delete(c.id));
  saveData();
  renderStats();
  applyFilters();
  showToast(`Cleared ${n} cards`, 'toast-needed');
}

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  applyFilters();
  document.getElementById('bulk-visible').textContent = getCardSet().length;
});
