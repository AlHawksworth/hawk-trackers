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
// Topps Match Attax / Chrome Premier League 2026-27 series
// ═══════════════════════════════════════════════════════════════════════════════
const PL_CARDS = [

  // ── ARSENAL ─────────────────────────────────────────────────────────────
  { id:'pl-001', num:'001', name:'David Raya',            sub:'Arsenal',            rarity:'common', valuable:false, category:'Arsenal' },
  { id:'pl-002', num:'002', name:'Ben White',             sub:'Arsenal',            rarity:'common', valuable:false, category:'Arsenal' },
  { id:'pl-003', num:'003', name:'William Saliba',        sub:'Arsenal',            rarity:'rare',   valuable:true,  category:'Arsenal' },
  { id:'pl-004', num:'004', name:'Gabriel Magalhães',     sub:'Arsenal',            rarity:'rare',   valuable:false, category:'Arsenal' },
  { id:'pl-005', num:'005', name:'Bukayo Saka',           sub:'Arsenal',            rarity:'epic',   valuable:true,  category:'Arsenal' },
  { id:'pl-006', num:'006', name:'Martin Ødegaard',       sub:'Arsenal',            rarity:'epic',   valuable:true,  category:'Arsenal' },
  { id:'pl-007', num:'007', name:'Declan Rice',           sub:'Arsenal',            rarity:'rare',   valuable:true,  category:'Arsenal' },
  { id:'pl-008', num:'008', name:'Leandro Trossard',      sub:'Arsenal',            rarity:'common', valuable:false, category:'Arsenal' },
  { id:'pl-009', num:'009', name:'Kai Havertz',           sub:'Arsenal',            rarity:'rare',   valuable:false, category:'Arsenal' },
  { id:'pl-010', num:'010', name:'Gabriel Martinelli',    sub:'Arsenal',            rarity:'rare',   valuable:false, category:'Arsenal' },

  // ── CHELSEA ─────────────────────────────────────────────────────────────
  { id:'pl-011', num:'011', name:'Robert Sánchez',        sub:'Chelsea',            rarity:'common', valuable:false, category:'Chelsea' },
  { id:'pl-012', num:'012', name:'Reece James',           sub:'Chelsea',            rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-013', num:'013', name:'Levi Colwill',          sub:'Chelsea',            rarity:'rare',   valuable:true,  category:'Chelsea' },
  { id:'pl-014', num:'014', name:'Cole Palmer',           sub:'Chelsea',            rarity:'epic',   valuable:true,  category:'Chelsea' },
  { id:'pl-015', num:'015', name:'Enzo Fernández',        sub:'Chelsea',            rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-016', num:'016', name:'Moisés Caicedo',        sub:'Chelsea',            rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-017', num:'017', name:'Pedro Neto',            sub:'Chelsea',            rarity:'rare',   valuable:true,  category:'Chelsea' },
  { id:'pl-018', num:'018', name:'Noni Madueke',          sub:'Chelsea',            rarity:'common', valuable:false, category:'Chelsea' },
  { id:'pl-019', num:'019', name:'Nicolas Jackson',       sub:'Chelsea',            rarity:'rare',   valuable:false, category:'Chelsea' },
  { id:'pl-020', num:'020', name:'Jadon Sancho',          sub:'Chelsea',            rarity:'rare',   valuable:false, category:'Chelsea' },

  // ── LIVERPOOL ────────────────────────────────────────────────────────────
  { id:'pl-021', num:'021', name:'Alisson Becker',        sub:'Liverpool',          rarity:'rare',   valuable:false, category:'Liverpool' },
  { id:'pl-022', num:'022', name:'Trent Alexander-Arnold',sub:'Liverpool',          rarity:'epic',   valuable:true,  category:'Liverpool' },
  { id:'pl-023', num:'023', name:'Virgil van Dijk',       sub:'Liverpool',          rarity:'epic',   valuable:true,  category:'Liverpool' },
  { id:'pl-024', num:'024', name:'Ibrahima Konaté',       sub:'Liverpool',          rarity:'rare',   valuable:false, category:'Liverpool' },
  { id:'pl-025', num:'025', name:'Andrew Robertson',      sub:'Liverpool',          rarity:'rare',   valuable:false, category:'Liverpool' },
  { id:'pl-026', num:'026', name:'Alexis Mac Allister',   sub:'Liverpool',          rarity:'rare',   valuable:false, category:'Liverpool' },
  { id:'pl-027', num:'027', name:'Dominik Szoboszlai',    sub:'Liverpool',          rarity:'rare',   valuable:true,  category:'Liverpool' },
  { id:'pl-028', num:'028', name:'Mohamed Salah',         sub:'Liverpool',          rarity:'legend', valuable:true,  category:'Liverpool' },
  { id:'pl-029', num:'029', name:'Darwin Núñez',          sub:'Liverpool',          rarity:'rare',   valuable:false, category:'Liverpool' },
  { id:'pl-030', num:'030', name:'Luis Díaz',             sub:'Liverpool',          rarity:'rare',   valuable:false, category:'Liverpool' },

  // ── MANCHESTER CITY ──────────────────────────────────────────────────────
  { id:'pl-031', num:'031', name:'Ederson',               sub:'Manchester City',    rarity:'rare',   valuable:false, category:'Manchester City' },
  { id:'pl-032', num:'032', name:'Kyle Walker',           sub:'Manchester City',    rarity:'common', valuable:false, category:'Manchester City' },
  { id:'pl-033', num:'033', name:'Rúben Dias',            sub:'Manchester City',    rarity:'rare',   valuable:false, category:'Manchester City' },
  { id:'pl-034', num:'034', name:'Manuel Akanji',         sub:'Manchester City',    rarity:'common', valuable:false, category:'Manchester City' },
  { id:'pl-035', num:'035', name:'Rodri',                 sub:'Manchester City',    rarity:'epic',   valuable:true,  category:'Manchester City' },
  { id:'pl-036', num:'036', name:'Kevin De Bruyne',       sub:'Manchester City',    rarity:'epic',   valuable:true,  category:'Manchester City' },
  { id:'pl-037', num:'037', name:'Bernardo Silva',        sub:'Manchester City',    rarity:'rare',   valuable:false, category:'Manchester City' },
  { id:'pl-038', num:'038', name:'Phil Foden',            sub:'Manchester City',    rarity:'epic',   valuable:true,  category:'Manchester City' },
  { id:'pl-039', num:'039', name:'Jack Grealish',         sub:'Manchester City',    rarity:'rare',   valuable:false, category:'Manchester City' },
  { id:'pl-040', num:'040', name:'Erling Haaland',        sub:'Manchester City',    rarity:'legend', valuable:true,  category:'Manchester City' },

  // ── MANCHESTER UNITED ────────────────────────────────────────────────────
  { id:'pl-041', num:'041', name:'André Onana',           sub:'Manchester United',  rarity:'common', valuable:false, category:'Manchester United' },
  { id:'pl-042', num:'042', name:'Diogo Dalot',           sub:'Manchester United',  rarity:'common', valuable:false, category:'Manchester United' },
  { id:'pl-043', num:'043', name:'Harry Maguire',         sub:'Manchester United',  rarity:'common', valuable:false, category:'Manchester United' },
  { id:'pl-044', num:'044', name:'Lisandro Martínez',     sub:'Manchester United',  rarity:'rare',   valuable:false, category:'Manchester United' },
  { id:'pl-045', num:'045', name:'Luke Shaw',             sub:'Manchester United',  rarity:'common', valuable:false, category:'Manchester United' },
  { id:'pl-046', num:'046', name:'Bruno Fernandes',       sub:'Manchester United',  rarity:'epic',   valuable:true,  category:'Manchester United' },
  { id:'pl-047', num:'047', name:'Kobbie Mainoo',         sub:'Manchester United',  rarity:'rare',   valuable:true,  category:'Manchester United' },
  { id:'pl-048', num:'048', name:'Rasmus Højlund',        sub:'Manchester United',  rarity:'rare',   valuable:true,  category:'Manchester United' },
  { id:'pl-049', num:'049', name:'Marcus Rashford',       sub:'Manchester United',  rarity:'rare',   valuable:false, category:'Manchester United' },
  { id:'pl-050', num:'050', name:'Amad Diallo',           sub:'Manchester United',  rarity:'rare',   valuable:true,  category:'Manchester United' },

  // ── TOTTENHAM ────────────────────────────────────────────────────────────
  { id:'pl-051', num:'051', name:'Guglielmo Vicario',     sub:'Tottenham',          rarity:'common', valuable:false, category:'Tottenham' },
  { id:'pl-052', num:'052', name:'Pedro Porro',           sub:'Tottenham',          rarity:'common', valuable:false, category:'Tottenham' },
  { id:'pl-053', num:'053', name:'Micky van de Ven',      sub:'Tottenham',          rarity:'rare',   valuable:true,  category:'Tottenham' },
  { id:'pl-054', num:'054', name:'Cristian Romero',       sub:'Tottenham',          rarity:'rare',   valuable:false, category:'Tottenham' },
  { id:'pl-055', num:'055', name:'Destiny Udogie',        sub:'Tottenham',          rarity:'rare',   valuable:true,  category:'Tottenham' },
  { id:'pl-056', num:'056', name:'Pape Matar Sarr',       sub:'Tottenham',          rarity:'rare',   valuable:true,  category:'Tottenham' },
  { id:'pl-057', num:'057', name:'Yves Bissouma',         sub:'Tottenham',          rarity:'common', valuable:false, category:'Tottenham' },
  { id:'pl-058', num:'058', name:'James Maddison',        sub:'Tottenham',          rarity:'rare',   valuable:false, category:'Tottenham' },
  { id:'pl-059', num:'059', name:'Heung-Min Son',         sub:'Tottenham',          rarity:'epic',   valuable:true,  category:'Tottenham' },
  { id:'pl-060', num:'060', name:'Dominic Solanke',       sub:'Tottenham',          rarity:'rare',   valuable:false, category:'Tottenham' },

  // ── NEWCASTLE ────────────────────────────────────────────────────────────
  { id:'pl-061', num:'061', name:'Nick Pope',             sub:'Newcastle',          rarity:'common', valuable:false, category:'Newcastle' },
  { id:'pl-062', num:'062', name:'Kieran Trippier',       sub:'Newcastle',          rarity:'common', valuable:false, category:'Newcastle' },
  { id:'pl-063', num:'063', name:'Sven Botman',           sub:'Newcastle',          rarity:'common', valuable:false, category:'Newcastle' },
  { id:'pl-064', num:'064', name:'Fabian Schär',          sub:'Newcastle',          rarity:'common', valuable:false, category:'Newcastle' },
  { id:'pl-065', num:'065', name:'Bruno Guimarães',       sub:'Newcastle',          rarity:'epic',   valuable:true,  category:'Newcastle' },
  { id:'pl-066', num:'066', name:'Joelinton',             sub:'Newcastle',          rarity:'rare',   valuable:false, category:'Newcastle' },
  { id:'pl-067', num:'067', name:'Anthony Gordon',        sub:'Newcastle',          rarity:'rare',   valuable:true,  category:'Newcastle' },
  { id:'pl-068', num:'068', name:'Alexander Isak',        sub:'Newcastle',          rarity:'epic',   valuable:true,  category:'Newcastle' },
  { id:'pl-069', num:'069', name:'Harvey Barnes',         sub:'Newcastle',          rarity:'common', valuable:false, category:'Newcastle' },
  { id:'pl-070', num:'070', name:'Miguel Almirón',        sub:'Newcastle',          rarity:'common', valuable:false, category:'Newcastle' },

  // ── ASTON VILLA ──────────────────────────────────────────────────────────
  { id:'pl-071', num:'071', name:'Emi Martínez',          sub:'Aston Villa',        rarity:'epic',   valuable:true,  category:'Aston Villa' },
  { id:'pl-072', num:'072', name:'Matty Cash',            sub:'Aston Villa',        rarity:'common', valuable:false, category:'Aston Villa' },
  { id:'pl-073', num:'073', name:'Ezri Konsa',            sub:'Aston Villa',        rarity:'common', valuable:false, category:'Aston Villa' },
  { id:'pl-074', num:'074', name:'Pau Torres',            sub:'Aston Villa',        rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-075', num:'075', name:'Lucas Digne',           sub:'Aston Villa',        rarity:'common', valuable:false, category:'Aston Villa' },
  { id:'pl-076', num:'076', name:'Douglas Luiz',          sub:'Aston Villa',        rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-077', num:'077', name:'John McGinn',           sub:'Aston Villa',        rarity:'common', valuable:false, category:'Aston Villa' },
  { id:'pl-078', num:'078', name:'Leon Bailey',           sub:'Aston Villa',        rarity:'rare',   valuable:false, category:'Aston Villa' },
  { id:'pl-079', num:'079', name:'Ollie Watkins',         sub:'Aston Villa',        rarity:'rare',   valuable:true,  category:'Aston Villa' },
  { id:'pl-080', num:'080', name:'Morgan Rogers',         sub:'Aston Villa',        rarity:'rare',   valuable:true,  category:'Aston Villa' },

  // ── BRIGHTON ─────────────────────────────────────────────────────────────
  { id:'pl-081', num:'081', name:'Bart Verbruggen',       sub:'Brighton',           rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-082', num:'082', name:'Joel Veltman',          sub:'Brighton',           rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-083', num:'083', name:'Lewis Dunk',            sub:'Brighton',           rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-084', num:'084', name:'Jan Paul van Hecke',    sub:'Brighton',           rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-085', num:'085', name:'Billy Gilmour',         sub:'Brighton',           rarity:'common', valuable:false, category:'Brighton' },
  { id:'pl-086', num:'086', name:'Mats Wieffer',          sub:'Brighton',           rarity:'rare',   valuable:false, category:'Brighton' },
  { id:'pl-087', num:'087', name:'Kaoru Mitoma',          sub:'Brighton',           rarity:'rare',   valuable:true,  category:'Brighton' },
  { id:'pl-088', num:'088', name:'Simon Adingra',         sub:'Brighton',           rarity:'rare',   valuable:true,  category:'Brighton' },
  { id:'pl-089', num:'089', name:'João Pedro',            sub:'Brighton',           rarity:'rare',   valuable:true,  category:'Brighton' },
  { id:'pl-090', num:'090', name:'Danny Welbeck',         sub:'Brighton',           rarity:'common', valuable:false, category:'Brighton' },

  // ── WEST HAM ─────────────────────────────────────────────────────────────
  { id:'pl-091', num:'091', name:'Lukasz Fabianski',      sub:'West Ham',           rarity:'common', valuable:false, category:'West Ham' },
  { id:'pl-092', num:'092', name:'Aaron Wan-Bissaka',     sub:'West Ham',           rarity:'common', valuable:false, category:'West Ham' },
  { id:'pl-093', num:'093', name:'Konstantinos Mavropanos',sub:'West Ham',          rarity:'common', valuable:false, category:'West Ham' },
  { id:'pl-094', num:'094', name:'Edson Álvarez',         sub:'West Ham',           rarity:'rare',   valuable:false, category:'West Ham' },
  { id:'pl-095', num:'095', name:'Tomáš Souček',          sub:'West Ham',           rarity:'common', valuable:false, category:'West Ham' },
  { id:'pl-096', num:'096', name:'Lucas Paquetá',         sub:'West Ham',           rarity:'rare',   valuable:true,  category:'West Ham' },
  { id:'pl-097', num:'097', name:'Mohammed Kudus',        sub:'West Ham',           rarity:'rare',   valuable:true,  category:'West Ham' },
  { id:'pl-098', num:'098', name:'Jarrod Bowen',          sub:'West Ham',           rarity:'rare',   valuable:false, category:'West Ham' },
  { id:'pl-099', num:'099', name:'Michail Antonio',       sub:'West Ham',           rarity:'common', valuable:false, category:'West Ham' },
  { id:'pl-100', num:'100', name:'James Ward-Prowse',     sub:'West Ham',           rarity:'common', valuable:false, category:'West Ham' },

  // ── EVERTON ──────────────────────────────────────────────────────────────
  { id:'pl-101', num:'101', name:'Jordan Pickford',       sub:'Everton',            rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-102', num:'102', name:'Séamus Coleman',        sub:'Everton',            rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-103', num:'103', name:'Jarrad Branthwaite',    sub:'Everton',            rarity:'rare',   valuable:true,  category:'Everton' },
  { id:'pl-104', num:'104', name:'Michael Keane',         sub:'Everton',            rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-105', num:'105', name:'Vitaliy Mykolenko',     sub:'Everton',            rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-106', num:'106', name:'Amadou Onana',          sub:'Everton',            rarity:'rare',   valuable:true,  category:'Everton' },
  { id:'pl-107', num:'107', name:'Idrissa Gueye',         sub:'Everton',            rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-108', num:'108', name:'Dwight McNeil',         sub:'Everton',            rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-109', num:'109', name:'Dominic Calvert-Lewin', sub:'Everton',            rarity:'common', valuable:false, category:'Everton' },
  { id:'pl-110', num:'110', name:'Beto',                  sub:'Everton',            rarity:'common', valuable:false, category:'Everton' },

  // ── FULHAM ───────────────────────────────────────────────────────────────
  { id:'pl-111', num:'111', name:'Bernd Leno',            sub:'Fulham',             rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-112', num:'112', name:'Kenny Tete',            sub:'Fulham',             rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-113', num:'113', name:'Tosin Adarabioyo',      sub:'Fulham',             rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-114', num:'114', name:'Calvin Bassey',         sub:'Fulham',             rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-115', num:'115', name:'Antonee Robinson',      sub:'Fulham',             rarity:'rare',   valuable:false, category:'Fulham' },
  { id:'pl-116', num:'116', name:'Tom Cairney',           sub:'Fulham',             rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-117', num:'117', name:'Andreas Pereira',       sub:'Fulham',             rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-118', num:'118', name:'Alex Iwobi',            sub:'Fulham',             rarity:'rare',   valuable:false, category:'Fulham' },
  { id:'pl-119', num:'119', name:'Raúl Jiménez',          sub:'Fulham',             rarity:'common', valuable:false, category:'Fulham' },
  { id:'pl-120', num:'120', name:'Adama Traoré',          sub:'Fulham',             rarity:'common', valuable:false, category:'Fulham' },

  // ── WOLVES ───────────────────────────────────────────────────────────────
  { id:'pl-121', num:'121', name:'José Sá',               sub:'Wolves',             rarity:'common', valuable:false, category:'Wolves' },
  { id:'pl-122', num:'122', name:'Nélson Semedo',         sub:'Wolves',             rarity:'common', valuable:false, category:'Wolves' },
  { id:'pl-123', num:'123', name:'Max Kilman',            sub:'Wolves',             rarity:'rare',   valuable:true,  category:'Wolves' },
  { id:'pl-124', num:'124', name:'Craig Dawson',          sub:'Wolves',             rarity:'common', valuable:false, category:'Wolves' },
  { id:'pl-125', num:'125', name:'Rayan Aït-Nouri',       sub:'Wolves',             rarity:'rare',   valuable:true,  category:'Wolves' },
  { id:'pl-126', num:'126', name:'João Gomes',            sub:'Wolves',             rarity:'rare',   valuable:false, category:'Wolves' },
  { id:'pl-127', num:'127', name:'Tommy Doyle',           sub:'Wolves',             rarity:'rare',   valuable:false, category:'Wolves' },
  { id:'pl-128', num:'128', name:'Pablo Sarabia',         sub:'Wolves',             rarity:'common', valuable:false, category:'Wolves' },
  { id:'pl-129', num:'129', name:'Pedro Neto',            sub:'Wolves',             rarity:'rare',   valuable:false, category:'Wolves' },
  { id:'pl-130', num:'130', name:'Matheus Cunha',         sub:'Wolves',             rarity:'rare',   valuable:true,  category:'Wolves' },

  // ── BRENTFORD ────────────────────────────────────────────────────────────
  { id:'pl-131', num:'131', name:'Mark Flekken',          sub:'Brentford',          rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-132', num:'132', name:'Aaron Hickey',          sub:'Brentford',          rarity:'rare',   valuable:false, category:'Brentford' },
  { id:'pl-133', num:'133', name:'Ben Mee',               sub:'Brentford',          rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-134', num:'134', name:'Ethan Pinnock',         sub:'Brentford',          rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-135', num:'135', name:'Kristoffer Ajer',       sub:'Brentford',          rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-136', num:'136', name:'Christian Nørgaard',    sub:'Brentford',          rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-137', num:'137', name:'Vitaly Janelt',         sub:'Brentford',          rarity:'common', valuable:false, category:'Brentford' },
  { id:'pl-138', num:'138', name:'Bryan Mbeumo',          sub:'Brentford',          rarity:'epic',   valuable:true,  category:'Brentford' },
  { id:'pl-139', num:'139', name:'Yoane Wissa',           sub:'Brentford',          rarity:'rare',   valuable:true,  category:'Brentford' },
  { id:'pl-140', num:'140', name:'Ivan Toney',            sub:'Brentford',          rarity:'rare',   valuable:false, category:'Brentford' },

  // ── CRYSTAL PALACE ───────────────────────────────────────────────────────
  { id:'pl-141', num:'141', name:'Sam Johnstone',         sub:'Crystal Palace',     rarity:'common', valuable:false, category:'Crystal Palace' },
  { id:'pl-142', num:'142', name:'Nathaniel Clyne',       sub:'Crystal Palace',     rarity:'common', valuable:false, category:'Crystal Palace' },
  { id:'pl-143', num:'143', name:'Marc Guéhi',            sub:'Crystal Palace',     rarity:'rare',   valuable:true,  category:'Crystal Palace' },
  { id:'pl-144', num:'144', name:'Joachim Andersen',      sub:'Crystal Palace',     rarity:'common', valuable:false, category:'Crystal Palace' },
  { id:'pl-145', num:'145', name:'Tyrick Mitchell',       sub:'Crystal Palace',     rarity:'common', valuable:false, category:'Crystal Palace' },
  { id:'pl-146', num:'146', name:'Adam Wharton',          sub:'Crystal Palace',     rarity:'rare',   valuable:true,  category:'Crystal Palace' },
  { id:'pl-147', num:'147', name:'Eberechi Eze',          sub:'Crystal Palace',     rarity:'epic',   valuable:true,  category:'Crystal Palace' },
  { id:'pl-148', num:'148', name:'Michael Olise',         sub:'Crystal Palace',     rarity:'epic',   valuable:true,  category:'Crystal Palace' },
  { id:'pl-149', num:'149', name:'Jean-Philippe Mateta',  sub:'Crystal Palace',     rarity:'rare',   valuable:false, category:'Crystal Palace' },
  { id:'pl-150', num:'150', name:'Odsonne Edouard',       sub:'Crystal Palace',     rarity:'common', valuable:false, category:'Crystal Palace' },

  // ── NOTTM FOREST ─────────────────────────────────────────────────────────
  { id:'pl-151', num:'151', name:'Matz Sels',             sub:'Nottm Forest',       rarity:'common', valuable:false, category:'Nottm Forest' },
  { id:'pl-152', num:'152', name:'Neco Williams',         sub:'Nottm Forest',       rarity:'common', valuable:false, category:'Nottm Forest' },
  { id:'pl-153', num:'153', name:'Murillo',               sub:'Nottm Forest',       rarity:'rare',   valuable:true,  category:'Nottm Forest' },
  { id:'pl-154', num:'154', name:'Felipe',                sub:'Nottm Forest',       rarity:'common', valuable:false, category:'Nottm Forest' },
  { id:'pl-155', num:'155', name:'Ola Aina',              sub:'Nottm Forest',       rarity:'common', valuable:false, category:'Nottm Forest' },
  { id:'pl-156', num:'156', name:'Ryan Yates',            sub:'Nottm Forest',       rarity:'common', valuable:false, category:'Nottm Forest' },
  { id:'pl-157', num:'157', name:'Morgan Gibbs-White',    sub:'Nottm Forest',       rarity:'rare',   valuable:true,  category:'Nottm Forest' },
  { id:'pl-158', num:'158', name:'Callum Hudson-Odoi',    sub:'Nottm Forest',       rarity:'rare',   valuable:false, category:'Nottm Forest' },
  { id:'pl-159', num:'159', name:'Anthony Elanga',        sub:'Nottm Forest',       rarity:'rare',   valuable:true,  category:'Nottm Forest' },
  { id:'pl-160', num:'160', name:'Taiwo Awoniyi',         sub:'Nottm Forest',       rarity:'common', valuable:false, category:'Nottm Forest' },

  // ── BOURNEMOUTH ──────────────────────────────────────────────────────────
  { id:'pl-161', num:'161', name:'Neto',                  sub:'Bournemouth',        rarity:'common', valuable:false, category:'Bournemouth' },
  { id:'pl-162', num:'162', name:'Adam Smith',            sub:'Bournemouth',        rarity:'common', valuable:false, category:'Bournemouth' },
  { id:'pl-163', num:'163', name:'Lloyd Kelly',           sub:'Bournemouth',        rarity:'common', valuable:false, category:'Bournemouth' },
  { id:'pl-164', num:'164', name:'Marcos Senesi',         sub:'Bournemouth',        rarity:'common', valuable:false, category:'Bournemouth' },
  { id:'pl-165', num:'165', name:'Milos Kerkez',          sub:'Bournemouth',        rarity:'rare',   valuable:true,  category:'Bournemouth' },
  { id:'pl-166', num:'166', name:'Philip Billing',        sub:'Bournemouth',        rarity:'common', valuable:false, category:'Bournemouth' },
  { id:'pl-167', num:'167', name:'Lewis Cook',            sub:'Bournemouth',        rarity:'common', valuable:false, category:'Bournemouth' },
  { id:'pl-168', num:'168', name:'Ryan Christie',         sub:'Bournemouth',        rarity:'common', valuable:false, category:'Bournemouth' },
  { id:'pl-169', num:'169', name:'Dominic Solanke',       sub:'Bournemouth',        rarity:'rare',   valuable:false, category:'Bournemouth' },
  { id:'pl-170', num:'170', name:'Antoine Semenyo',       sub:'Bournemouth',        rarity:'rare',   valuable:true,  category:'Bournemouth' },

  // ── LUTON / SHEFFIELD UTD / BURNLEY (relegated & promoted placeholder) ──
  // Promoted clubs for 2026/27 season
  { id:'pl-171', num:'171', name:'Liam Delap',            sub:'Ipswich',            rarity:'rare',   valuable:true,  category:'Ipswich' },
  { id:'pl-172', num:'172', name:'Omari Hutchinson',      sub:'Ipswich',            rarity:'rare',   valuable:true,  category:'Ipswich' },
  { id:'pl-173', num:'173', name:'Sam Szmodics',          sub:'Ipswich',            rarity:'common', valuable:false, category:'Ipswich' },
  { id:'pl-174', num:'174', name:'George Hirst',          sub:'Ipswich',            rarity:'common', valuable:false, category:'Ipswich' },
  { id:'pl-175', num:'175', name:'Ben Johnson',           sub:'Ipswich',            rarity:'common', valuable:false, category:'Ipswich' },

  { id:'pl-176', num:'176', name:'Noni Madueke',          sub:'Leicester City',     rarity:'rare',   valuable:false, category:'Leicester City' },
  { id:'pl-177', num:'177', name:'Jamie Vardy',           sub:'Leicester City',     rarity:'rare',   valuable:false, category:'Leicester City' },
  { id:'pl-178', num:'178', name:'James Maddison',        sub:'Leicester City',     rarity:'rare',   valuable:false, category:'Leicester City' },
  { id:'pl-179', num:'179', name:'Stephy Mavididi',       sub:'Leicester City',     rarity:'common', valuable:false, category:'Leicester City' },
  { id:'pl-180', num:'180', name:'Harry Winks',           sub:'Leicester City',     rarity:'common', valuable:false, category:'Leicester City' },

  // ── SPECIAL INSERTS ──────────────────────────────────────────────────────
  // Golden Boot contenders
  { id:'pl-GB1', num:'GB1', name:'Haaland — Golden Boot',     sub:'Golden Boot Insert',  rarity:'legend', valuable:true,  category:'Golden Boot' },
  { id:'pl-GB2', num:'GB2', name:'Salah — Golden Boot',       sub:'Golden Boot Insert',  rarity:'legend', valuable:true,  category:'Golden Boot' },
  { id:'pl-GB3', num:'GB3', name:'Isak — Golden Boot',        sub:'Golden Boot Insert',  rarity:'epic',   valuable:true,  category:'Golden Boot' },
  { id:'pl-GB4', num:'GB4', name:'Cole Palmer — Golden Boot', sub:'Golden Boot Insert',  rarity:'epic',   valuable:true,  category:'Golden Boot' },
  { id:'pl-GB5', num:'GB5', name:'Saka — Golden Boot',        sub:'Golden Boot Insert',  rarity:'epic',   valuable:true,  category:'Golden Boot' },

  // Wonderkids
  { id:'pl-WK1', num:'WK1', name:'Lamine Yamal — Wonderkid',   sub:'Wonderkid Insert',   rarity:'legend', valuable:true,  category:'Wonderkids' },
  { id:'pl-WK2', num:'WK2', name:'Kobbie Mainoo — Wonderkid',  sub:'Wonderkid Insert',   rarity:'epic',   valuable:true,  category:'Wonderkids' },
  { id:'pl-WK3', num:'WK3', name:'Amad Diallo — Wonderkid',    sub:'Wonderkid Insert',   rarity:'epic',   valuable:true,  category:'Wonderkids' },
  { id:'pl-WK4', num:'WK4', name:'Levi Colwill — Wonderkid',   sub:'Wonderkid Insert',   rarity:'rare',   valuable:true,  category:'Wonderkids' },
  { id:'pl-WK5', num:'WK5', name:'Micky van de Ven — Wonderkid',sub:'Wonderkid Insert',  rarity:'rare',   valuable:true,  category:'Wonderkids' },

  // Autographs
  { id:'pl-A01', num:'A01', name:'Haaland Auto',          sub:'On-Card Autograph',  rarity:'legend', valuable:true,  category:'Autographs (PL)' },
  { id:'pl-A02', num:'A02', name:'Salah Auto',            sub:'On-Card Autograph',  rarity:'legend', valuable:true,  category:'Autographs (PL)' },
  { id:'pl-A03', num:'A03', name:'Saka Auto',             sub:'On-Card Autograph',  rarity:'epic',   valuable:true,  category:'Autographs (PL)' },
  { id:'pl-A04', num:'A04', name:'Cole Palmer Auto',      sub:'On-Card Autograph',  rarity:'epic',   valuable:true,  category:'Autographs (PL)' },
  { id:'pl-A05', num:'A05', name:'De Bruyne Auto',        sub:'On-Card Autograph',  rarity:'epic',   valuable:true,  category:'Autographs (PL)' },
  { id:'pl-A06', num:'A06', name:'Foden Auto',            sub:'On-Card Autograph',  rarity:'epic',   valuable:true,  category:'Autographs (PL)' },
  { id:'pl-A07', num:'A07', name:'Van Dijk Auto',         sub:'On-Card Autograph',  rarity:'rare',   valuable:true,  category:'Autographs (PL)' },
  { id:'pl-A08', num:'A08', name:'Bruno Guimarães Auto',  sub:'On-Card Autograph',  rarity:'epic',   valuable:true,  category:'Autographs (PL)' },
  { id:'pl-A09', num:'A09', name:'Ødegaard Auto',         sub:'On-Card Autograph',  rarity:'epic',   valuable:true,  category:'Autographs (PL)' },
  { id:'pl-A10', num:'A10', name:'Rashford Auto',         sub:'On-Card Autograph',  rarity:'rare',   valuable:false, category:'Autographs (PL)' },

  // Chrome Refractors (PL)
  { id:'pl-CR1', num:'CR1', name:'Haaland Refractor',     sub:'Chrome Parallel',    rarity:'legend', valuable:true,  category:'Chrome (PL)' },
  { id:'pl-CR2', num:'CR2', name:'Salah Refractor',       sub:'Chrome Parallel',    rarity:'legend', valuable:true,  category:'Chrome (PL)' },
  { id:'pl-CR3', num:'CR3', name:'Saka Refractor',        sub:'Chrome Parallel',    rarity:'epic',   valuable:true,  category:'Chrome (PL)' },
  { id:'pl-CR4', num:'CR4', name:'Cole Palmer Refractor', sub:'Chrome Parallel',    rarity:'epic',   valuable:true,  category:'Chrome (PL)' },
  { id:'pl-CR5', num:'CR5', name:'Isak Refractor',        sub:'Chrome Parallel',    rarity:'epic',   valuable:true,  category:'Chrome (PL)' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function getOwnedSet() {
  return currentCollection === 'f1' ? ownedF1 : ownedPL;
}

function getCardSet() {
  return currentCollection === 'f1' ? F1_CARDS : PL_CARDS;
}

function isOwned(id) {
  return getOwnedSet().has(id);
}

function toggleOwned(id) {
  const owned = getOwnedSet();
  if (owned.has(id)) {
    owned.delete(id);
    showToast('Removed from collection', 'toast-needed');
  } else {
    owned.add(id);
    showToast('Added to collection ✓', 'toast-owned');
  }
  saveData();
  renderStats();
  renderValuablePanel();
  // Just re-render the single tile
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

// ─── Valuable panel ─────────────────────────────────────────────────────────
function renderValuablePanel() {
  const cards     = getCardSet();
  const ownedSet  = getOwnedSet();
  const valuables = cards.filter(c => c.valuable);
  const list      = document.getElementById('valuable-list');
  list.innerHTML  = '';
  valuables.forEach(c => {
    const chip = document.createElement('div');
    const own  = ownedSet.has(c.id);
    chip.className = 'valuable-chip' + (own ? ' owned-val' : '');
    chip.innerHTML = (own ? '✓ ' : '⭐ ') + escHtml(c.name);
    chip.title = c.sub + ' · ' + c.rarity;
    chip.onclick = () => {
      // Scroll to the card in the grid
      const tile = document.querySelector(`[data-id="${c.id}"]`);
      if (tile) tile.scrollIntoView({ behavior:'smooth', block:'center' });
    };
    list.appendChild(chip);
  });
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
  document.querySelectorAll('.col-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.col === col);
  });
  // Reset filters
  document.getElementById('search-input').value     = '';
  document.getElementById('filter-status').value    = 'all';
  document.getElementById('filter-rarity').value    = 'all';
  filterValueable = false;
  document.getElementById('toggle-valuable').classList.remove('active');
  renderStats();
  renderValuablePanel();
  applyFilters();
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
  renderValuablePanel();
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
  renderValuablePanel();
  applyFilters();
  showToast(`Cleared ${n} cards`, 'toast-needed');
}

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderValuablePanel();
  applyFilters();
  document.getElementById('bulk-visible').textContent = getCardSet().length;
});
