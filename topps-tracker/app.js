// ═══════════════════════════════════════════════════════════════════════════════
// TOPPS TRACKER — app.js
// F1 2026 & Premier League 2026/27 card collection tracker
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';

// ─── Storage keys ───────────────────────────────────────────────────────────
const LS_OWNED_F1  = 'topps_f1_2026_owned';
const LS_OWNED_PL  = 'topps_pl_2627_owned';
const LS_SPARES_F1 = 'topps_f1_2026_spares';
const LS_SPARES_PL = 'topps_pl_2627_spares';

// ─── App state ──────────────────────────────────────────────────────────────
let currentCollection = 'f1';   // 'f1' | 'pl'
let ownedF1  = new Set();
let ownedPL  = new Set();
let sparesF1 = {};
let sparesPL = {};
let filterValueable = false;
let toastTimer = null;

// ─── Rarity levels ──────────────────────────────────────────────────────────
// common | rare | epic | legend
// valuable = true means it's flagged as potentially high-value

// ===============================================================================
// F1 2026 CARD DATA
// Topps Formula 1 Turbo Attax 2026 Collection - Official Full Checklist
// Source: Grid Cards UK & Topps Official 2026 Release (408 Cards)
// Base Set (1-99), Season & Moment Inserts (100-249), F2/F3 Crossover (250-264),
// Chase Inserts (265-351), Tin Exclusives (GU, SUN, MR, GG) & Limited Editions (LE, BG)
// ===============================================================================
const F1_CARDS = [

  // -- BASE SET: McLaren --
  { id:'f1-001', num:'1', name:'McLaren Team Logo', sub:'Official Logo - McLaren', rarity:'common', valuable:false, category:'McLaren' },
  { id:'f1-002', num:'2', name:'Andrea Stella', sub:'Team Principal - McLaren', rarity:'common', valuable:false, category:'McLaren' },
  { id:'f1-003', num:'3', name:'Lando Norris & Oscar Piastri', sub:'Driver Duo - McLaren', rarity:'rare', valuable:false, category:'McLaren' },
  { id:'f1-004', num:'4', name:'Lando Norris', sub:'McLaren Base Card', rarity:'rare', valuable:false, category:'McLaren' },
  { id:'f1-005', num:'5', name:'Lando Norris', sub:'McLaren Base Card', rarity:'rare', valuable:false, category:'McLaren' },
  { id:'f1-006', num:'6', name:'Lando Norris', sub:'McLaren Base Card', rarity:'rare', valuable:false, category:'McLaren' },
  { id:'f1-007', num:'7', name:'Oscar Piastri', sub:'McLaren Base Card', rarity:'common', valuable:false, category:'McLaren' },
  { id:'f1-008', num:'8', name:'Oscar Piastri', sub:'McLaren Base Card', rarity:'common', valuable:false, category:'McLaren' },
  { id:'f1-009', num:'9', name:'Oscar Piastri', sub:'McLaren Base Card', rarity:'common', valuable:false, category:'McLaren' },

  // -- BASE SET: Mercedes-AMG --
  { id:'f1-010', num:'10', name:'Mercedes-AMG Team Logo', sub:'Official Logo - Mercedes-AMG', rarity:'common', valuable:false, category:'Mercedes-AMG' },
  { id:'f1-011', num:'11', name:'Toto Wolff', sub:'Team Principal - Mercedes-AMG', rarity:'rare', valuable:false, category:'Mercedes-AMG' },
  { id:'f1-012', num:'12', name:'George Russell & Kimi Antonelli', sub:'Driver Duo - Mercedes-AMG', rarity:'rare', valuable:false, category:'Mercedes-AMG' },
  { id:'f1-013', num:'13', name:'George Russell', sub:'Mercedes-AMG Base Card', rarity:'common', valuable:false, category:'Mercedes-AMG' },
  { id:'f1-014', num:'14', name:'George Russell', sub:'Mercedes-AMG Base Card', rarity:'common', valuable:false, category:'Mercedes-AMG' },
  { id:'f1-015', num:'15', name:'George Russell', sub:'Mercedes-AMG Base Card', rarity:'common', valuable:false, category:'Mercedes-AMG' },
  { id:'f1-016', num:'16', name:'Kimi Antonelli', sub:'Mercedes-AMG Base Card', rarity:'rare', valuable:false, category:'Mercedes-AMG' },
  { id:'f1-017', num:'17', name:'Kimi Antonelli', sub:'Mercedes-AMG Base Card', rarity:'rare', valuable:false, category:'Mercedes-AMG' },
  { id:'f1-018', num:'18', name:'Kimi Antonelli', sub:'Mercedes-AMG Base Card', rarity:'rare', valuable:false, category:'Mercedes-AMG' },

  // -- BASE SET: Red Bull Racing --
  { id:'f1-019', num:'19', name:'Red Bull Racing Team Logo', sub:'Official Logo - Red Bull Racing', rarity:'common', valuable:false, category:'Red Bull Racing' },
  { id:'f1-020', num:'20', name:'Laurent Mekies', sub:'Team Principal - Red Bull Racing', rarity:'common', valuable:false, category:'Red Bull Racing' },
  { id:'f1-021', num:'21', name:'Max Verstappen & Isack Hadjar', sub:'Driver Duo - Red Bull Racing', rarity:'rare', valuable:false, category:'Red Bull Racing' },
  { id:'f1-022', num:'22', name:'Max Verstappen', sub:'Red Bull Racing Base Card', rarity:'rare', valuable:false, category:'Red Bull Racing' },
  { id:'f1-023', num:'23', name:'Max Verstappen', sub:'Red Bull Racing Base Card', rarity:'rare', valuable:false, category:'Red Bull Racing' },
  { id:'f1-024', num:'24', name:'Max Verstappen', sub:'Red Bull Racing Base Card', rarity:'rare', valuable:false, category:'Red Bull Racing' },
  { id:'f1-025', num:'25', name:'Isack Hadjar', sub:'Red Bull Racing Base Card', rarity:'rare', valuable:false, category:'Red Bull Racing' },
  { id:'f1-026', num:'26', name:'Isack Hadjar', sub:'Red Bull Racing Base Card', rarity:'rare', valuable:false, category:'Red Bull Racing' },
  { id:'f1-027', num:'27', name:'Isack Hadjar', sub:'Red Bull Racing Base Card', rarity:'rare', valuable:false, category:'Red Bull Racing' },

  // -- BASE SET: Ferrari --
  { id:'f1-028', num:'28', name:'Ferrari Team Logo', sub:'Official Logo - Ferrari', rarity:'common', valuable:false, category:'Ferrari' },
  { id:'f1-029', num:'29', name:'Fr\u00e9d\u00e9ric Vasseur', sub:'Team Principal - Ferrari', rarity:'common', valuable:false, category:'Ferrari' },
  { id:'f1-030', num:'30', name:'Charles Leclerc & Lewis Hamilton', sub:'Driver Duo - Ferrari', rarity:'rare', valuable:false, category:'Ferrari' },
  { id:'f1-031', num:'31', name:'Charles Leclerc', sub:'Ferrari Base Card', rarity:'rare', valuable:false, category:'Ferrari' },
  { id:'f1-032', num:'32', name:'Charles Leclerc', sub:'Ferrari Base Card', rarity:'rare', valuable:false, category:'Ferrari' },
  { id:'f1-033', num:'33', name:'Charles Leclerc', sub:'Ferrari Base Card', rarity:'rare', valuable:false, category:'Ferrari' },
  { id:'f1-034', num:'34', name:'Lewis Hamilton', sub:'Ferrari Base Card', rarity:'rare', valuable:false, category:'Ferrari' },
  { id:'f1-035', num:'35', name:'Lewis Hamilton', sub:'Ferrari Base Card', rarity:'rare', valuable:false, category:'Ferrari' },
  { id:'f1-036', num:'36', name:'Lewis Hamilton', sub:'Ferrari Base Card', rarity:'rare', valuable:false, category:'Ferrari' },

  // -- BASE SET: Williams --
  { id:'f1-037', num:'37', name:'Williams Team Logo', sub:'Official Logo - Williams', rarity:'common', valuable:false, category:'Williams' },
  { id:'f1-038', num:'38', name:'James Vowles', sub:'Team Principal - Williams', rarity:'common', valuable:false, category:'Williams' },
  { id:'f1-039', num:'39', name:'Alex Albon & Carlos Sainz', sub:'Driver Duo - Williams', rarity:'rare', valuable:false, category:'Williams' },
  { id:'f1-040', num:'40', name:'Alex Albon', sub:'Williams Base Card', rarity:'common', valuable:false, category:'Williams' },
  { id:'f1-041', num:'41', name:'Alex Albon', sub:'Williams Base Card', rarity:'common', valuable:false, category:'Williams' },
  { id:'f1-042', num:'42', name:'Alex Albon', sub:'Williams Base Card', rarity:'common', valuable:false, category:'Williams' },
  { id:'f1-043', num:'43', name:'Carlos Sainz', sub:'Williams Base Card', rarity:'common', valuable:false, category:'Williams' },
  { id:'f1-044', num:'44', name:'Carlos Sainz', sub:'Williams Base Card', rarity:'common', valuable:false, category:'Williams' },
  { id:'f1-045', num:'45', name:'Carlos Sainz', sub:'Williams Base Card', rarity:'common', valuable:false, category:'Williams' },

  // -- BASE SET: Racing Bulls --
  { id:'f1-046', num:'46', name:'Racing Bulls Team Logo', sub:'Official Logo - Racing Bulls', rarity:'common', valuable:false, category:'Racing Bulls' },
  { id:'f1-047', num:'47', name:'Alan Permane', sub:'Team Principal - Racing Bulls', rarity:'common', valuable:false, category:'Racing Bulls' },
  { id:'f1-048', num:'48', name:'Liam Lawson & Arvid Lindblad', sub:'Driver Duo - Racing Bulls', rarity:'rare', valuable:false, category:'Racing Bulls' },
  { id:'f1-049', num:'49', name:'Liam Lawson', sub:'Racing Bulls Base Card', rarity:'rare', valuable:false, category:'Racing Bulls' },
  { id:'f1-050', num:'50', name:'Liam Lawson', sub:'Racing Bulls Base Card', rarity:'rare', valuable:false, category:'Racing Bulls' },
  { id:'f1-051', num:'51', name:'Liam Lawson', sub:'Racing Bulls Base Card', rarity:'rare', valuable:false, category:'Racing Bulls' },
  { id:'f1-052', num:'52', name:'Arvid Lindblad', sub:'Racing Bulls Base Card', rarity:'rare', valuable:false, category:'Racing Bulls' },
  { id:'f1-053', num:'53', name:'Arvid Lindblad', sub:'Racing Bulls Base Card', rarity:'rare', valuable:false, category:'Racing Bulls' },
  { id:'f1-054', num:'54', name:'Arvid Lindblad', sub:'Racing Bulls Base Card', rarity:'rare', valuable:false, category:'Racing Bulls' },

  // -- BASE SET: Aston Martin --
  { id:'f1-055', num:'55', name:'Aston Martin Team Logo', sub:'Official Logo - Aston Martin', rarity:'common', valuable:false, category:'Aston Martin' },
  { id:'f1-056', num:'56', name:'Adrian Newey', sub:'Team Principal - Aston Martin', rarity:'rare', valuable:false, category:'Aston Martin' },
  { id:'f1-057', num:'57', name:'Fernando Alonso & Lance Stroll', sub:'Driver Duo - Aston Martin', rarity:'rare', valuable:false, category:'Aston Martin' },
  { id:'f1-058', num:'58', name:'Fernando Alonso', sub:'Aston Martin Base Card', rarity:'rare', valuable:false, category:'Aston Martin' },
  { id:'f1-059', num:'59', name:'Fernando Alonso', sub:'Aston Martin Base Card', rarity:'rare', valuable:false, category:'Aston Martin' },
  { id:'f1-060', num:'60', name:'Fernando Alonso', sub:'Aston Martin Base Card', rarity:'rare', valuable:false, category:'Aston Martin' },
  { id:'f1-061', num:'61', name:'Lance Stroll', sub:'Aston Martin Base Card', rarity:'common', valuable:false, category:'Aston Martin' },
  { id:'f1-062', num:'62', name:'Lance Stroll', sub:'Aston Martin Base Card', rarity:'common', valuable:false, category:'Aston Martin' },
  { id:'f1-063', num:'63', name:'Lance Stroll', sub:'Aston Martin Base Card', rarity:'common', valuable:false, category:'Aston Martin' },

  // -- BASE SET: Haas --
  { id:'f1-064', num:'64', name:'Haas Team Logo', sub:'Official Logo - Haas', rarity:'common', valuable:false, category:'Haas' },
  { id:'f1-065', num:'65', name:'Ayao Komatsu', sub:'Team Principal - Haas', rarity:'common', valuable:false, category:'Haas' },
  { id:'f1-066', num:'66', name:'Oliver Bearman & Esteban Ocon', sub:'Driver Duo - Haas', rarity:'rare', valuable:false, category:'Haas' },
  { id:'f1-067', num:'67', name:'Oliver Bearman', sub:'Haas Base Card', rarity:'rare', valuable:false, category:'Haas' },
  { id:'f1-068', num:'68', name:'Oliver Bearman', sub:'Haas Base Card', rarity:'rare', valuable:false, category:'Haas' },
  { id:'f1-069', num:'69', name:'Oliver Bearman', sub:'Haas Base Card', rarity:'rare', valuable:false, category:'Haas' },
  { id:'f1-070', num:'70', name:'Esteban Ocon', sub:'Haas Base Card', rarity:'common', valuable:false, category:'Haas' },
  { id:'f1-071', num:'71', name:'Esteban Ocon', sub:'Haas Base Card', rarity:'common', valuable:false, category:'Haas' },
  { id:'f1-072', num:'72', name:'Esteban Ocon', sub:'Haas Base Card', rarity:'common', valuable:false, category:'Haas' },

  // -- BASE SET: Audi --
  { id:'f1-073', num:'73', name:'Audi Team Logo', sub:'Official Logo - Audi', rarity:'common', valuable:false, category:'Audi' },
  { id:'f1-074', num:'74', name:'Mattia Binotto', sub:'Team Principal - Audi', rarity:'common', valuable:false, category:'Audi' },
  { id:'f1-075', num:'75', name:'Nico H\u00fclkenberg & Gabriel Bortoleto', sub:'Driver Duo - Audi', rarity:'rare', valuable:false, category:'Audi' },
  { id:'f1-076', num:'76', name:'Nico H\u00fclkenberg', sub:'Audi Base Card', rarity:'common', valuable:false, category:'Audi' },
  { id:'f1-077', num:'77', name:'Nico H\u00fclkenberg', sub:'Audi Base Card', rarity:'common', valuable:false, category:'Audi' },
  { id:'f1-078', num:'78', name:'Nico H\u00fclkenberg', sub:'Audi Base Card', rarity:'common', valuable:false, category:'Audi' },
  { id:'f1-079', num:'79', name:'Gabriel Bortoleto', sub:'Audi Base Card', rarity:'rare', valuable:false, category:'Audi' },
  { id:'f1-080', num:'80', name:'Gabriel Bortoleto', sub:'Audi Base Card', rarity:'rare', valuable:false, category:'Audi' },
  { id:'f1-081', num:'81', name:'Gabriel Bortoleto', sub:'Audi Base Card', rarity:'rare', valuable:false, category:'Audi' },

  // -- BASE SET: Alpine --
  { id:'f1-082', num:'82', name:'Alpine Team Logo', sub:'Official Logo - Alpine', rarity:'common', valuable:false, category:'Alpine' },
  { id:'f1-083', num:'83', name:'Steve Nielsen', sub:'Team Principal - Alpine', rarity:'common', valuable:false, category:'Alpine' },
  { id:'f1-084', num:'84', name:'Pierre Gasly & Franco Colapinto', sub:'Driver Duo - Alpine', rarity:'rare', valuable:false, category:'Alpine' },
  { id:'f1-085', num:'85', name:'Pierre Gasly', sub:'Alpine Base Card', rarity:'common', valuable:false, category:'Alpine' },
  { id:'f1-086', num:'86', name:'Pierre Gasly', sub:'Alpine Base Card', rarity:'common', valuable:false, category:'Alpine' },
  { id:'f1-087', num:'87', name:'Pierre Gasly', sub:'Alpine Base Card', rarity:'common', valuable:false, category:'Alpine' },
  { id:'f1-088', num:'88', name:'Franco Colapinto', sub:'Alpine Base Card', rarity:'rare', valuable:false, category:'Alpine' },
  { id:'f1-089', num:'89', name:'Franco Colapinto', sub:'Alpine Base Card', rarity:'rare', valuable:false, category:'Alpine' },
  { id:'f1-090', num:'90', name:'Franco Colapinto', sub:'Alpine Base Card', rarity:'rare', valuable:false, category:'Alpine' },

  // -- BASE SET: Cadillac --
  { id:'f1-091', num:'91', name:'Cadillac Team Logo', sub:'Official Logo - Cadillac', rarity:'common', valuable:false, category:'Cadillac' },
  { id:'f1-092', num:'92', name:'Graeme Lowdon', sub:'Team Principal - Cadillac', rarity:'common', valuable:false, category:'Cadillac' },
  { id:'f1-093', num:'93', name:'Sergio Perez & Valtteri Bottas', sub:'Driver Duo - Cadillac', rarity:'rare', valuable:false, category:'Cadillac' },
  { id:'f1-094', num:'94', name:'Sergio Perez', sub:'Cadillac Base Card', rarity:'common', valuable:false, category:'Cadillac' },
  { id:'f1-095', num:'95', name:'Sergio Perez', sub:'Cadillac Base Card', rarity:'common', valuable:false, category:'Cadillac' },
  { id:'f1-096', num:'96', name:'Sergio Perez', sub:'Cadillac Base Card', rarity:'common', valuable:false, category:'Cadillac' },
  { id:'f1-097', num:'97', name:'Valtteri Bottas', sub:'Cadillac Base Card', rarity:'common', valuable:false, category:'Cadillac' },
  { id:'f1-098', num:'98', name:'Valtteri Bottas', sub:'Cadillac Base Card', rarity:'common', valuable:false, category:'Cadillac' },
  { id:'f1-099', num:'99', name:'Valtteri Bottas', sub:'Cadillac Base Card', rarity:'common', valuable:false, category:'Cadillac' },

  // -- EPIC MOMENTS (100-117) --
  { id:'f1-100', num:'100', name:'Lewis Hamilton Epic Moment', sub:'Epic Moment (22.03.2025)', rarity:'epic', valuable:false, category:'Epic Moments' },
  { id:'f1-101', num:'101', name:'Kimi Antonelli Epic Moment', sub:'Epic Moment (02.05.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-102', num:'102', name:'Max Verstappen Epic Moment', sub:'Epic Moment (18.05.2025)', rarity:'epic', valuable:false, category:'Epic Moments' },
  { id:'f1-103', num:'103', name:'George Russell Epic Moment', sub:'Epic Moment (15.06.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-104', num:'104', name:'Kimi Antonelli Epic Moment', sub:'Epic Moment (15.06.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-105', num:'105', name:'Lando Norris Epic Moment', sub:'Epic Moment (06.07.2025)', rarity:'epic', valuable:false, category:'Epic Moments' },
  { id:'f1-106', num:'106', name:'Nico H\u00fclkenberg Epic Moment', sub:'Epic Moment (06.07.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-107', num:'107', name:'Oscar Piastri Epic Moment', sub:'Epic Moment (27.07.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-108', num:'108', name:'Charles Leclerc Epic Moment', sub:'Epic Moment (02.08.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-109', num:'109', name:'Lando Norris Epic Moment', sub:'Epic Moment (03.08.2025)', rarity:'epic', valuable:false, category:'Epic Moments' },
  { id:'f1-110', num:'110', name:'Isack Hadjar Epic Moment', sub:'Epic Moment (31.08.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-111', num:'111', name:'Max Verstappen Epic Moment', sub:'Epic Moment (07.09.2025)', rarity:'epic', valuable:false, category:'Epic Moments' },
  { id:'f1-112', num:'112', name:'Carlos Sainz Epic Moment', sub:'Epic Moment (21.09.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-113', num:'113', name:'Liam Lawson Epic Moment', sub:'Epic Moment (21.09.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-114', num:'114', name:'Oliver Bearman Epic Moment', sub:'Epic Moment (26.10.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-115', num:'115', name:'Kimi Antonelli Epic Moment', sub:'Epic Moment (09.11.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-116', num:'116', name:'Carlos Sainz Epic Moment', sub:'Epic Moment (30.11.2025)', rarity:'rare', valuable:false, category:'Epic Moments' },
  { id:'f1-117', num:'117', name:'Lando Norris Epic Moment', sub:'Epic Moment (07.12.2025)', rarity:'epic', valuable:false, category:'Epic Moments' },

  // -- SPEED SILHOUETTES (118-134) --
  { id:'f1-118', num:'118', name:'Oscar Piastri Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-119', num:'119', name:'George Russell Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-120', num:'120', name:'Kimi Antonelli Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-121', num:'121', name:'Charles Leclerc Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-122', num:'122', name:'Alex Albon Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-123', num:'123', name:'Carlos Sainz Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-124', num:'124', name:'Liam Lawson Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-125', num:'125', name:'Arvid Lindblad Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-126', num:'126', name:'Fernando Alonso Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-127', num:'127', name:'Lance Stroll Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-128', num:'128', name:'Oliver Bearman Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-129', num:'129', name:'Esteban Ocon Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-130', num:'130', name:'Nico H\u00fclkenberg Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-131', num:'131', name:'Gabriel Bortoleto Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-132', num:'132', name:'Pierre Gasly Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-133', num:'133', name:'Franco Colapinto Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },
  { id:'f1-134', num:'134', name:'Valtteri Bottas Speed Silhouette', sub:'Speed Silhouettes Insert', rarity:'rare', valuable:false, category:'Speed Silhouettes' },

  // -- LEGENDS OF THE GRID (136-150) --
  { id:'f1-136', num:'136', name:'Sir Stirling Moss Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-137', num:'137', name:'Sir Jack Brabham Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-138', num:'138', name:'Graham Hill Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-139', num:'139', name:'Sir Jackie Stewart Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-140', num:'140', name:'Emerson Fittipaldi Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-141', num:'141', name:'Jody Scheckter Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-142', num:'142', name:'Riccardo Patrese Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-143', num:'143', name:'Nigel Mansell Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-144', num:'144', name:'Alain Prost Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-145', num:'145', name:'Mika H\u00e4kkinen Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-146', num:'146', name:'Michael Schumacher Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-147', num:'147', name:'Damon Hill Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-148', num:'148', name:'Rubens Barrichello Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-149', num:'149', name:'Kimi R\u00e4ikk\u00f6nen Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },
  { id:'f1-150', num:'150', name:'Mark Webber Legend', sub:'Legends of the Grid', rarity:'legend', valuable:true, category:'Legends of the Grid' },

  // -- SPRINT SUPERSTARS (151-156) --
  { id:'f1-151', num:'151', name:'Max Verstappen Sprint Superstar', sub:'Sprint Superstars Insert', rarity:'rare', valuable:false, category:'Sprint Superstars' },
  { id:'f1-152', num:'152', name:'George Russell Sprint Superstar', sub:'Sprint Superstars Insert', rarity:'rare', valuable:false, category:'Sprint Superstars' },
  { id:'f1-153', num:'153', name:'Lando Norris Sprint Superstar', sub:'Sprint Superstars Insert', rarity:'rare', valuable:false, category:'Sprint Superstars' },
  { id:'f1-154', num:'154', name:'Oscar Piastri Sprint Superstar', sub:'Sprint Superstars Insert', rarity:'rare', valuable:false, category:'Sprint Superstars' },
  { id:'f1-155', num:'155', name:'Lewis Hamilton Sprint Superstar', sub:'Sprint Superstars Insert', rarity:'rare', valuable:false, category:'Sprint Superstars' },
  { id:'f1-156', num:'156', name:'Kimi Antonelli Sprint Superstar', sub:'Sprint Superstars Insert', rarity:'rare', valuable:false, category:'Sprint Superstars' },

  // -- DRIVERCORE (157-178) --
  { id:'f1-157', num:'157', name:'Fernando Alonso DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-158', num:'158', name:'Lewis Hamilton DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-159', num:'159', name:'Sergio Perez DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-160', num:'160', name:'Nico H\u00fclkenberg DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-161', num:'161', name:'Valtteri Bottas DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-162', num:'162', name:'Max Verstappen DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-163', num:'163', name:'Carlos Sainz DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-164', num:'164', name:'Lance Stroll DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-165', num:'165', name:'Esteban Ocon DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-166', num:'166', name:'Pierre Gasly DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-167', num:'167', name:'Charles Leclerc DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-168', num:'168', name:'Lando Norris DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-169', num:'169', name:'George Russell DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-170', num:'170', name:'Alex Albon DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-171', num:'171', name:'Oscar Piastri DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-172', num:'172', name:'Liam Lawson DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-173', num:'173', name:'Oliver Bearman DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-174', num:'174', name:'Franco Colapinto DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-175', num:'175', name:'Kimi Antonelli DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-176', num:'176', name:'Gabriel Bortoleto DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-177', num:'177', name:'Isack Hadjar DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },
  { id:'f1-178', num:'178', name:'Rubens Barrichello DriverCore', sub:'DriverCore Insert', rarity:'rare', valuable:false, category:'DriverCore' },

  // -- NIGHT SHIFT (179-183) --
  { id:'f1-179', num:'179', name:'Oscar Piastri Night Shift', sub:'Night Shift Insert', rarity:'rare', valuable:false, category:'Night Shift' },
  { id:'f1-180', num:'180', name:'Isack Hadjar Night Shift', sub:'Night Shift Insert', rarity:'rare', valuable:false, category:'Night Shift' },
  { id:'f1-181', num:'181', name:'Oliver Bearman Night Shift', sub:'Night Shift Insert', rarity:'rare', valuable:false, category:'Night Shift' },
  { id:'f1-182', num:'182', name:'Gabriel Bortoleto Night Shift', sub:'Night Shift Insert', rarity:'rare', valuable:false, category:'Night Shift' },
  { id:'f1-183', num:'183', name:'Franco Colapinto Night Shift', sub:'Night Shift Insert', rarity:'rare', valuable:false, category:'Night Shift' },

  // -- 2026 F1 CAR (184-205) --
  { id:'f1-184', num:'184', name:'Lando Norris (McLaren MCL40)', sub:'2026 Car - McLaren MCL40', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-185', num:'185', name:'Max Verstappen (Red Bull RB22)', sub:'2026 Car - Red Bull RB22', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-186', num:'186', name:'Oscar Piastri (McLaren MCL40)', sub:'2026 Car - McLaren MCL40', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-187', num:'187', name:'George Russell (Mercedes W17)', sub:'2026 Car - Mercedes W17', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-188', num:'188', name:'Charles Leclerc (Ferrari SF-26)', sub:'2026 Car - Ferrari SF-26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-189', num:'189', name:'Lewis Hamilton (Ferrari SF-26)', sub:'2026 Car - Ferrari SF-26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-190', num:'190', name:'Kimi Antonelli (Mercedes W17)', sub:'2026 Car - Mercedes W17', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-191', num:'191', name:'Alex Albon (Williams FW48)', sub:'2026 Car - Williams FW48', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-192', num:'192', name:'Carlos Sainz (Williams FW48)', sub:'2026 Car - Williams FW48', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-193', num:'193', name:'Fernando Alonso (Aston Martin AMR26)', sub:'2026 Car - Aston Martin AMR26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-194', num:'194', name:'Nico H\u00fclkenberg (Audi R26)', sub:'2026 Car - Audi R26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-195', num:'195', name:'Isack Hadjar (Red Bull RB22)', sub:'2026 Car - Red Bull RB22', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-196', num:'196', name:'Oliver Bearman (Haas VF-26)', sub:'2026 Car - Haas VF-26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-197', num:'197', name:'Liam Lawson (VCARB 03)', sub:'2026 Car - VCARB 03', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-198', num:'198', name:'Esteban Ocon (Haas VF-26)', sub:'2026 Car - Haas VF-26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-199', num:'199', name:'Lance Stroll (Aston Martin AMR26)', sub:'2026 Car - Aston Martin AMR26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-200', num:'200', name:'Pierre Gasly (Alpine A526)', sub:'2026 Car - Alpine A526', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-201', num:'201', name:'Gabriel Bortoleto (Audi R26)', sub:'2026 Car - Audi R26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-202', num:'202', name:'Franco Colapinto (Alpine A526)', sub:'2026 Car - Alpine A526', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-203', num:'203', name:'Sergio Perez (Cadillac MAC-26)', sub:'2026 Car - Cadillac MAC-26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-204', num:'204', name:'Valtteri Bottas (Cadillac MAC-26)', sub:'2026 Car - Cadillac MAC-26', rarity:'rare', valuable:false, category:'2026 F1 Car' },
  { id:'f1-205', num:'205', name:'Arvid Lindblad (VCARB 03)', sub:'2026 Car - VCARB 03', rarity:'rare', valuable:false, category:'2026 F1 Car' },

  // -- LA MONUMENTAL (206-227) --
  { id:'f1-206', num:'206', name:'Lando Norris LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-207', num:'207', name:'Oscar Piastri LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-208', num:'208', name:'George Russell LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-209', num:'209', name:'Kimi Antonelli LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-210', num:'210', name:'Max Verstappen LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-211', num:'211', name:'Isack Hadjar LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-212', num:'212', name:'Charles Leclerc LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-213', num:'213', name:'Lewis Hamilton LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-214', num:'214', name:'Alex Albon LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-215', num:'215', name:'Carlos Sainz LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-216', num:'216', name:'Liam Lawson LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-217', num:'217', name:'Arvid Lindblad LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-218', num:'218', name:'Fernando Alonso LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-219', num:'219', name:'Lance Stroll LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-220', num:'220', name:'Oliver Bearman LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-221', num:'221', name:'Esteban Ocon LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-222', num:'222', name:'Nico H\u00fclkenberg LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-223', num:'223', name:'Gabriel Bortoleto LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-224', num:'224', name:'Pierre Gasly LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-225', num:'225', name:'Franco Colapinto LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-226', num:'226', name:'Sergio Perez LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },
  { id:'f1-227', num:'227', name:'Valtteri Bottas LA Monumental', sub:'LA Monumental Insert', rarity:'rare', valuable:false, category:'LA Monumental' },

  // -- TURBO ATTAX LEGACY (228-249) --
  { id:'f1-228', num:'228', name:'Lando Norris Legacy', sub:'Turbo Attax Legacy', rarity:'epic', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-229', num:'229', name:'Oscar Piastri Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-230', num:'230', name:'George Russell Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-231', num:'231', name:'Kimi Antonelli Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-232', num:'232', name:'Max Verstappen Legacy', sub:'Turbo Attax Legacy', rarity:'epic', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-233', num:'233', name:'Isack Hadjar Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-234', num:'234', name:'Charles Leclerc Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-235', num:'235', name:'Lewis Hamilton Legacy', sub:'Turbo Attax Legacy', rarity:'epic', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-236', num:'236', name:'Alex Albon Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-237', num:'237', name:'Carlos Sainz Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-238', num:'238', name:'Liam Lawson Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-239', num:'239', name:'Arvid Lindblad Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-240', num:'240', name:'Fernando Alonso Legacy', sub:'Turbo Attax Legacy', rarity:'epic', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-241', num:'241', name:'Lance Stroll Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-242', num:'242', name:'Oliver Bearman Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-243', num:'243', name:'Esteban Ocon Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-244', num:'244', name:'Nico H\u00fclkenberg Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-245', num:'245', name:'Gabriel Bortoleto Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-246', num:'246', name:'Pierre Gasly Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-247', num:'247', name:'Franco Colapinto Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-248', num:'248', name:'Sergio Perez Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },
  { id:'f1-249', num:'249', name:'Valtteri Bottas Legacy', sub:'Turbo Attax Legacy', rarity:'rare', valuable:false, category:'Turbo Attax Legacy' },

  // -- CHAMPIONS (250-252) --
  { id:'f1-250', num:'250', name:'Lando Norris Champion', sub:'F2/F3 Champions Insert', rarity:'epic', valuable:false, category:'F2 & F3 Champions' },
  { id:'f1-251', num:'251', name:'Leonardo Fornaroli Champion', sub:'F2/F3 Champions Insert', rarity:'epic', valuable:false, category:'F2 & F3 Champions' },
  { id:'f1-252', num:'252', name:'Rafael C\u00e2mara Champion', sub:'F2/F3 Champions Insert', rarity:'epic', valuable:false, category:'F2 & F3 Champions' },

  // -- 10 YEARS OF F2 (253) --
  { id:'f1-253', num:'253', name:'Richard Verschoor - 10 Years of F2', sub:'Most Race Starts Milestone', rarity:'rare', valuable:false, category:'10 Years of F2' },

  // -- F2 ONE TO WATCH (254-263) --
  { id:'f1-254', num:'254', name:'Joshua D\u00fcrksen One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },
  { id:'f1-255', num:'255', name:'Colton Herta One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },
  { id:'f1-256', num:'256', name:'Nikola Tsolov One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },
  { id:'f1-257', num:'257', name:'Dino Beganovic One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },
  { id:'f1-258', num:'258', name:'Gabriele Min\u00ecu00ec One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },
  { id:'f1-259', num:'259', name:'Mari Boya One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },
  { id:'f1-260', num:'260', name:'Alexander Dunne One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },
  { id:'f1-261', num:'261', name:'Kush Maini One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },
  { id:'f1-262', num:'262', name:'Emerson Fittipaldi One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },
  { id:'f1-263', num:'263', name:'Nico Varrone One to Watch', sub:'F2 One to Watch Prospect', rarity:'rare', valuable:false, category:'F2 One to Watch' },

  // -- TECHNICAL DRAWING (264) --
  { id:'f1-264', num:'264', name:'Technical Drawing - 2026 F1 Car', sub:'Technical Blueprint Insert', rarity:'rare', valuable:false, category:'Technical Drawing' },

  // -- SIGNATURE STYLE (265-288) --
  { id:'f1-265', num:'265', name:'Lando Norris Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-266', num:'266', name:'Oscar Piastri Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-267', num:'267', name:'George Russell Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-268', num:'268', name:'Kimi Antonelli Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-269', num:'269', name:'Max Verstappen Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-270', num:'270', name:'Isack Hadjar Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-271', num:'271', name:'Charles Leclerc Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-272', num:'272', name:'Lewis Hamilton Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-273', num:'273', name:'Alex Albon Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-274', num:'274', name:'Carlos Sainz Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-275', num:'275', name:'Liam Lawson Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-276', num:'276', name:'Arvid Lindblad Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-277', num:'277', name:'Fernando Alonso Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-278', num:'278', name:'Lance Stroll Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-279', num:'279', name:'Oliver Bearman Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-280', num:'280', name:'Esteban Ocon Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-281', num:'281', name:'Nico H\u00fclkenberg Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-282', num:'282', name:'Gabriel Bortoleto Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-283', num:'283', name:'Pierre Gasly Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-284', num:'284', name:'Franco Colapinto Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-285', num:'285', name:'Sergio Perez Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-286', num:'286', name:'Valtteri Bottas Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-287', num:'287', name:'Sir Jackie Stewart Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },
  { id:'f1-288', num:'288', name:'Mika H\u00e4kkinen Signature Style', sub:'Driver Signature Autograph', rarity:'epic', valuable:true, category:'Signature Style' },

  // -- 100 CLUB (289-297) --
  { id:'f1-289', num:'289', name:'Sir Stirling Moss 100 Club', sub:'100 Club Chase', rarity:'legend', valuable:true, category:'100 Club' },
  { id:'f1-290', num:'290', name:'Graham Hill 100 Club', sub:'100 Club Chase', rarity:'legend', valuable:true, category:'100 Club' },
  { id:'f1-291', num:'291', name:'Alain Prost 100 Club', sub:'100 Club Chase', rarity:'legend', valuable:true, category:'100 Club' },
  { id:'f1-292', num:'292', name:'Rubens Barrichello 100 Club', sub:'100 Club Chase', rarity:'legend', valuable:true, category:'100 Club' },
  { id:'f1-293', num:'293', name:'Lando Norris (101)', sub:'100 Club Chase', rarity:'legend', valuable:true, category:'100 Club' },
  { id:'f1-294', num:'294', name:'George Russell 100 Club', sub:'100 Club Chase', rarity:'legend', valuable:true, category:'100 Club' },
  { id:'f1-295', num:'295', name:'Max Verstappen 100 Club', sub:'100 Club Chase', rarity:'legend', valuable:true, category:'100 Club' },
  { id:'f1-296', num:'296', name:'Carlos Sainz 100 Club', sub:'100 Club Chase', rarity:'legend', valuable:true, category:'100 Club' },
  { id:'f1-297', num:'297', name:'Oliver Bearman 100 Club', sub:'100 Club Chase', rarity:'legend', valuable:true, category:'100 Club' },

  // -- BLACK EDGE (298-306) --
  { id:'f1-298', num:'298', name:'Nigel Mansell Black Edge', sub:'Black Edge Chase Card', rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'f1-299', num:'299', name:'Damon Hill Black Edge', sub:'Black Edge Chase Card', rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'f1-300', num:'300', name:'Kimi R\u00e4ikk\u00f6nen Black Edge', sub:'Black Edge Chase Card', rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'f1-301', num:'301', name:'Oscar Piastri Black Edge', sub:'Black Edge Chase Card', rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'f1-302', num:'302', name:'Lewis Hamilton Black Edge', sub:'Black Edge Chase Card', rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'f1-303', num:'303', name:'Alex Albon Black Edge', sub:'Black Edge Chase Card', rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'f1-304', num:'304', name:'Fernando Alonso Black Edge', sub:'Black Edge Chase Card', rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'f1-305', num:'305', name:'Esteban Ocon Black Edge', sub:'Black Edge Chase Card', rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'f1-306', num:'306', name:'Sergio Perez Black Edge', sub:'Black Edge Chase Card', rarity:'legend', valuable:true, category:'Black Edge' },

  // -- DIAMOND INFINITY (307-315) --
  { id:'f1-307', num:'307', name:'Lando Norris Diamond Infinity', sub:'Diamond Infinity Chase', rarity:'epic', valuable:true, category:'Diamond Infinity' },
  { id:'f1-308', num:'308', name:'George Russell Diamond Infinity', sub:'Diamond Infinity Chase', rarity:'epic', valuable:true, category:'Diamond Infinity' },
  { id:'f1-309', num:'309', name:'Isack Hadjar Diamond Infinity', sub:'Diamond Infinity Chase', rarity:'epic', valuable:true, category:'Diamond Infinity' },
  { id:'f1-310', num:'310', name:'Charles Leclerc Diamond Infinity', sub:'Diamond Infinity Chase', rarity:'epic', valuable:true, category:'Diamond Infinity' },
  { id:'f1-311', num:'311', name:'Carlos Sainz Diamond Infinity', sub:'Diamond Infinity Chase', rarity:'epic', valuable:true, category:'Diamond Infinity' },
  { id:'f1-312', num:'312', name:'Arvid Lindblad Diamond Infinity', sub:'Diamond Infinity Chase', rarity:'epic', valuable:true, category:'Diamond Infinity' },
  { id:'f1-313', num:'313', name:'Nico H\u00fclkenberg Diamond Infinity', sub:'Diamond Infinity Chase', rarity:'epic', valuable:true, category:'Diamond Infinity' },
  { id:'f1-314', num:'314', name:'Pierre Gasly Diamond Infinity', sub:'Diamond Infinity Chase', rarity:'epic', valuable:true, category:'Diamond Infinity' },
  { id:'f1-315', num:'315', name:'Valtteri Bottas Diamond Infinity', sub:'Diamond Infinity Chase', rarity:'epic', valuable:true, category:'Diamond Infinity' },

  // -- TURBO CHROME (316-340) --
  { id:'f1-C316', num:'316', name:'Lando Norris Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C317', num:'317', name:'Oscar Piastri Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C318', num:'318', name:'George Russell Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C319', num:'319', name:'Kimi Antonelli Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C320', num:'320', name:'Max Verstappen Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C321', num:'321', name:'Isack Hadjar Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C322', num:'322', name:'Charles Leclerc Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C323', num:'323', name:'Lewis Hamilton Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C324', num:'324', name:'Alex Albon Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C325', num:'325', name:'Carlos Sainz Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C326', num:'326', name:'Liam Lawson Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C327', num:'327', name:'Arvid Lindblad Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C328', num:'328', name:'Fernando Alonso Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C329', num:'329', name:'Lance Stroll Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C330', num:'330', name:'Oliver Bearman Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C331', num:'331', name:'Esteban Ocon Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C332', num:'332', name:'Nico H\u00fclkenberg Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C333', num:'333', name:'Gabriel Bortoleto Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C334', num:'334', name:'Pierre Gasly Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C335', num:'335', name:'Franco Colapinto Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C336', num:'336', name:'Sergio Perez Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C337', num:'337', name:'Valtteri Bottas Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'epic', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C338', num:'~338', name:'Sir Stirling Moss Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'legend', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C339', num:'~339', name:'Michael Schumacher Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'legend', valuable:true, category:'Turbo Chrome' },
  { id:'f1-C340', num:'~340', name:'Mark Webber Turbo Chrome', sub:'Turbo Chrome Parallel Series', rarity:'legend', valuable:true, category:'Turbo Chrome' },

  // -- F1 GOLD (341-351) --
  { id:'f1-G341', num:'~341', name:'Lando Norris F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G342', num:'~342', name:'George Russell F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G343', num:'~343', name:'Max Verstappen F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G344', num:'~344', name:'Charles Leclerc F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G345', num:'~345', name:'Alex Albon F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G346', num:'~346', name:'Liam Lawson F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G347', num:'~347', name:'Fernando Alonso F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G348', num:'~348', name:'Oliver Bearman F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G349', num:'~349', name:'Nico H\u00fclkenberg F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G350', num:'~350', name:'Pierre Gasly F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },
  { id:'f1-G351', num:'~351', name:'Sergio Perez F1 Gold', sub:'F1 Gold Lead Driver Edition', rarity:'legend', valuable:true, category:'F1 Gold' },

  // -- THE WINNING FORMULA (341) --
  { id:'f1-WF341', num:'341', name:'Lewis Hamilton - The Winning Formula', sub:'The Winning Formula Standalone', rarity:'legend', valuable:true, category:'The Winning Formula' },

  // -- STRATEGY CARD (342) --
  { id:'f1-SC342', num:'342', name:'Strategy Card (Pit Stop / Overtake)', sub:'Starter Pack Exclusive Strategy', rarity:'rare', valuable:true, category:'Strategy Card' },

  // -- GUARDIANS OF THE GRID (GU1-GU11) --
  { id:'f1-GU1', num:'GU1', name:'Oscar Piastri Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU2', num:'GU2', name:'George Russell Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU3', num:'GU3', name:'Isack Hadjar Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU4', num:'GU4', name:'Lewis Hamilton Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU5', num:'GU5', name:'Carlos Sainz Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU6', num:'GU6', name:'Liam Lawson Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU7', num:'GU7', name:'Fernando Alonso Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU8', num:'GU8', name:'Esteban Ocon Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU9', num:'GU9', name:'Nico H\u00fclkenberg Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU10', num:'GU10', name:'Franco Colapinto Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },
  { id:'f1-GU11', num:'GU11', name:'Valtteri Bottas Guardians of the Grid', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Guardians of the Grid' },

  // -- SUNSHINE STATE (SUN1-SUN11) --
  { id:'f1-SUN1', num:'SUN1', name:'Lando Norris Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN2', num:'SUN2', name:'Kimi Antonelli Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN3', num:'SUN3', name:'Max Verstappen Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN4', num:'SUN4', name:'Charles Leclerc Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN5', num:'SUN5', name:'Alex Albon Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN6', num:'SUN6', name:'Arvid Lindblad Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN7', num:'SUN7', name:'Lance Stroll Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN8', num:'SUN8', name:'Oliver Bearman Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN9', num:'SUN9', name:'Gabriel Bortoleto Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN10', num:'SUN10', name:'Pierre Gasly Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },
  { id:'f1-SUN11', num:'SUN11', name:'Sergio Perez Sunshine State', sub:'Mega Tin Exclusive', rarity:'epic', valuable:true, category:'Sunshine State' },

  // -- MANUFACTURED RELICS --
  { id:'f1-MR-NOR', num:'MR-NOR', name:'Lando Norris Relic Card', sub:'Driver-Worn Relic (Super Tin)', rarity:'legend', valuable:true, category:'Manufactured Relics' },
  { id:'f1-MR-VER', num:'MR-VER', name:'Max Verstappen Relic Card', sub:'Driver-Worn Relic (Super Tin)', rarity:'legend', valuable:true, category:'Manufactured Relics' },
  { id:'f1-MR-HAM', num:'MR-HAM', name:'Lewis Hamilton Relic Card', sub:'Driver-Worn Relic (Super Tin)', rarity:'legend', valuable:true, category:'Manufactured Relics' },
  { id:'f1-MR-ALO', num:'MR-ALO', name:'Fernando Alonso Relic Card', sub:'Driver-Worn Relic (Super Tin)', rarity:'legend', valuable:true, category:'Manufactured Relics' },
  { id:'f1-MR-STE', num:'MR-STE', name:'Sir Jackie Stewart Relic Card', sub:'Driver-Worn Relic (Super Tin)', rarity:'legend', valuable:true, category:'Manufactured Relics' },
  { id:'f1-MR-MAN', num:'MR-MAN', name:'Nigel Mansell Relic Card', sub:'Driver-Worn Relic (Super Tin)', rarity:'legend', valuable:true, category:'Manufactured Relics' },
  { id:'f1-MR-RAI', num:'MR-RAI', name:'Kimi R\u00e4ikk\u00f6nen Relic Card', sub:'Driver-Worn Relic (Super Tin)', rarity:'legend', valuable:true, category:'Manufactured Relics' },
  { id:'f1-MR-PRO', num:'MR-PRO', name:'Alain Prost Relic Card', sub:'Driver-Worn Relic (Super Tin)', rarity:'legend', valuable:true, category:'Manufactured Relics' },
  { id:'f1-MR-MSC', num:'MR-MSC', name:'Michael Schumacher Relic Card', sub:'Driver-Worn Relic (Super Tin)', rarity:'legend', valuable:true, category:'Manufactured Relics' },

  // -- GREATS OF THE GRID (GG1-GG8) --
  { id:'f1-GG1', num:'GG1', name:'Lewis Hamilton Greats of the Grid', sub:'Super Tin Exclusive', rarity:'legend', valuable:true, category:'Greats of the Grid' },
  { id:'f1-GG2', num:'GG2', name:'Max Verstappen Greats of the Grid', sub:'Super Tin Exclusive', rarity:'legend', valuable:true, category:'Greats of the Grid' },
  { id:'f1-GG3', num:'GG3', name:'Fernando Alonso Greats of the Grid', sub:'Super Tin Exclusive', rarity:'legend', valuable:true, category:'Greats of the Grid' },
  { id:'f1-GG4', num:'GG4', name:'Lando Norris Greats of the Grid', sub:'Super Tin Exclusive', rarity:'legend', valuable:true, category:'Greats of the Grid' },
  { id:'f1-GG5', num:'GG5', name:'Sir Jack Brabham Greats of the Grid', sub:'Super Tin Exclusive', rarity:'legend', valuable:true, category:'Greats of the Grid' },
  { id:'f1-GG6', num:'GG6', name:'Sir Jackie Stewart Greats of the Grid', sub:'Super Tin Exclusive', rarity:'legend', valuable:true, category:'Greats of the Grid' },
  { id:'f1-GG7', num:'GG7', name:'Jody Scheckter Greats of the Grid', sub:'Super Tin Exclusive', rarity:'legend', valuable:true, category:'Greats of the Grid' },
  { id:'f1-GG8', num:'GG8', name:'Michael Schumacher Greats of the Grid', sub:'Super Tin Exclusive', rarity:'legend', valuable:true, category:'Greats of the Grid' },

  // -- LIMITED EDITIONS --
  { id:'f1-LE1', num:'LE1', name:'Oscar Piastri Papaya LE', sub:'Papaya LE - Starter Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE2', num:'LE2', name:'Carlos Sainz Chilli LE', sub:'Chilli LE - Starter Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE3', num:'LE3', name:'Max Verstappen Orange LE', sub:'Orange LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE4', num:'LE4', name:'Lando Norris Golden Glory LE', sub:'Golden Glory LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE5', num:'LE5', name:'Charles Leclerc Hot Red LE', sub:'Hot Red LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE6', num:'LE6', name:'George Russell Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE7', num:'LE7', name:'Isack Hadjar Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE8', num:'LE8', name:'Arvid Lindblad Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE9', num:'LE9', name:'Gabriel Bortoleto Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE10', num:'LE10', name:'Kimi Antonelli Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE11', num:'LE11', name:'Fernando Alonso Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE12', num:'LE12', name:'Liam Lawson Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE13', num:'LE13', name:'Alex Albon Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE14', num:'LE14', name:'Nico H\u00fclkenberg Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-LE15', num:'LE15', name:'Oliver Bearman Diamond LE', sub:'Diamond LE - Hero Pack Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-BG1', num:'BG1', name:'Esteban Ocon Black Gold LE', sub:'Black Gold LE - Topps.com Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
  { id:'f1-BG2', num:'BG2', name:'Franco Colapinto Black Gold LE', sub:'Black Gold LE - Topps.com Exclusive', rarity:'legend', valuable:true, category:'Limited Editions' },
];

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

  // ── BALL MASTERS INSERTS ──────────────────────────────────────────────────
  { id:'pl-BM-2',   num:'BM 2',   name:'Ball Masters #2',   sub:'Ball Masters', rarity:'rare',   valuable:false, category:'Ball Masters' },
  { id:'pl-BM-12',  num:'BM 12',  name:'Ball Masters #12',  sub:'Ball Masters', rarity:'rare',   valuable:false, category:'Ball Masters' },
  { id:'pl-BM-14',  num:'BM 14',  name:'Ball Masters #14',  sub:'Ball Masters', rarity:'rare',   valuable:false, category:'Ball Masters' },
  { id:'pl-BM-18',  num:'BM 18',  name:'Ball Masters #18',  sub:'Ball Masters', rarity:'rare',   valuable:false, category:'Ball Masters' },
  { id:'pl-BM-19',  num:'BM 19',  name:'Ball Masters #19',  sub:'Ball Masters', rarity:'rare',   valuable:false, category:'Ball Masters' },
  { id:'pl-BM-25',  num:'BM 25',  name:'Ball Masters #25',  sub:'Ball Masters', rarity:'rare',   valuable:false, category:'Ball Masters' },

  // ── FUTURE FLASHBACK INSERTS ──────────────────────────────────────────────
  { id:'pl-FF-1',   num:'FF 1',   name:'Future Flashback #1',  sub:'Future Flashback', rarity:'rare',   valuable:false, category:'Future Flashback' },
  { id:'pl-FF-12',  num:'FF 12',  name:'Future Flashback #12', sub:'Future Flashback', rarity:'rare',   valuable:false, category:'Future Flashback' },
  { id:'pl-FF-14',  num:'FF 14',  name:'Future Flashback #14', sub:'Future Flashback', rarity:'rare',   valuable:false, category:'Future Flashback' },
  { id:'pl-FF-20',  num:'FF 20',  name:'Future Flashback #20', sub:'Future Flashback', rarity:'rare',   valuable:false, category:'Future Flashback' },

  // ── GOLDEN LEGENDS INSERTS ────────────────────────────────────────────────
  { id:'pl-GL-1',   num:'GL 1',   name:'Golden Legends #1',  sub:'Golden Legends', rarity:'epic',   valuable:true,  category:'Golden Legends' },

  // ── NEXT BEST INSERTS ─────────────────────────────────────────────────────
  { id:'pl-NB-4',   num:'NB 4',   name:'Next Best #4',   sub:'Next Best', rarity:'rare',   valuable:false, category:'Next Best' },
  { id:'pl-NB-8',   num:'NB 8',   name:'Next Best #8',   sub:'Next Best', rarity:'rare',   valuable:false, category:'Next Best' },
  { id:'pl-NB-13',  num:'NB 13',  name:'Next Best #13',  sub:'Next Best', rarity:'rare',   valuable:false, category:'Next Best' },
  { id:'pl-NB-14',  num:'NB 14',  name:'Next Best #14',  sub:'Next Best', rarity:'rare',   valuable:false, category:'Next Best' },
  { id:'pl-NB-17',  num:'NB 17',  name:'Next Best #17',  sub:'Next Best', rarity:'rare',   valuable:false, category:'Next Best' },

  // ── ONES TO WATCH / ON FIRE INSERTS ──────────────────────────────────────
  { id:'pl-OF-11',  num:'OF 11',  name:'On Fire #11',  sub:'On Fire', rarity:'rare',   valuable:false, category:'On Fire' },
  { id:'pl-OF-13',  num:'OF 13',  name:'On Fire #13',  sub:'On Fire', rarity:'rare',   valuable:false, category:'On Fire' },

  // ── POWER TRANSFER INSERTS ────────────────────────────────────────────────
  { id:'pl-PT-3',   num:'PT 3',   name:'Power Transfer #3',  sub:'Power Transfer', rarity:'rare',   valuable:false, category:'Power Transfer' },
  { id:'pl-PT-4',   num:'PT 4',   name:'Power Transfer #4',  sub:'Power Transfer', rarity:'rare',   valuable:false, category:'Power Transfer' },

  // ── RISING TALENT INSERTS ─────────────────────────────────────────────────
  { id:'pl-RT-6',   num:'RT 6',   name:'Rising Talent #6',   sub:'Rising Talent', rarity:'rare',   valuable:false, category:'Rising Talent' },
  { id:'pl-RT-21',  num:'RT 21',  name:'Rising Talent #21',  sub:'Rising Talent', rarity:'rare',   valuable:false, category:'Rising Talent' },

  // ── SUPER PREMIER LEAGUE INSERTS ─────────────────────────────────────────
  { id:'pl-SPL-8',  num:'SPL 8',  name:'Super PL #8',   sub:'Super Premier League', rarity:'rare',   valuable:false, category:'Super Premier League' },
  { id:'pl-SPL-9',  num:'SPL 9',  name:'Super PL #9',   sub:'Super Premier League', rarity:'rare',   valuable:false, category:'Super Premier League' },
  { id:'pl-SPL-11', num:'SPL 11', name:'Super PL #11',  sub:'Super Premier League', rarity:'rare',   valuable:false, category:'Super Premier League' },
  { id:'pl-SPL-13', num:'SPL 13', name:'Super PL #13',  sub:'Super Premier League', rarity:'rare',   valuable:false, category:'Super Premier League' },
  { id:'pl-SPL-15', num:'SPL 15', name:'Super PL #15',  sub:'Super Premier League', rarity:'rare',   valuable:false, category:'Super Premier League' },
  { id:'pl-SPL-24', num:'SPL 24', name:'Super PL #24',  sub:'Super Premier League', rarity:'rare',   valuable:false, category:'Super Premier League' },

  // ── SPECIAL / PROMO ───────────────────────────────────────────────────────
  { id:'pl-8B7',    num:'8B7',    name:'Special #8B7',  sub:'Special / Promo',      rarity:'epic',   valuable:true,  category:'Special' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function getOwnedSet() {
  return currentCollection === 'f1' ? ownedF1 : ownedPL;
}

// Derive the correct owned set directly from a card id (works cross-collection)
function ownedSetForId(id) {
  return id.startsWith('f1-') ? ownedF1 : ownedPL;
}

// Spares helpers
function sparesMapForId(id) {
  return id.startsWith('f1-') ? sparesF1 : sparesPL;
}
function getSpares(id) {
  return sparesMapForId(id)[id] || 0;
}
function setSpares(id, delta) {
  const map     = sparesMapForId(id);
  const current = map[id] || 0;
  const next    = Math.max(0, current + delta);
  if (next === 0) {
    delete map[id];
  } else {
    map[id] = next;
  }
  saveData();
  // Update the tile in place
  const tile = document.querySelector(`[data-id="${id}"]`);
  if (tile) updateTile(tile, id);
  // Refresh watch list summary if open
  if (currentCollection === 'watchlist') {
    filterWatchlist(currentWLFilter || 'all');
  }
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
    // Clear any spares when removing ownership
    delete sparesMapForId(id)[id];
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
  FireSync.save(LS_OWNED_F1,  [...ownedF1]);
  FireSync.save(LS_OWNED_PL,  [...ownedPL]);
  FireSync.save(LS_SPARES_F1, sparesF1);
  FireSync.save(LS_SPARES_PL, sparesPL);
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
    (currentCollection === 'f1' ? 'F1 Turbo Attax 2026' : 'Premier League 2026/27') + ' — Collection Progress';
  document.getElementById('progress-pct').textContent = `${curOwnedN} / ${curCards.length}  (${curPct}%)`;
}

// ─── Render helpers ─────────────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateTile(tile, id) {
  const owned  = isOwned(id);
  const spares = getSpares(id);

  tile.classList.toggle('owned',     owned);
  tile.classList.toggle('needed',    !owned);
  tile.classList.toggle('has-spares', spares > 0);

  const btn    = tile.querySelector('.card-toggle-btn');
  const check  = tile.querySelector('.card-owned-check');
  const badges = tile.querySelector('.card-badges');

  // ── Owned / Needed badge ──
  let ownedBadge  = badges.querySelector('.badge-owned');
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
    if (ownedBadge)  ownedBadge.remove();
    if (!neededBadge) {
      neededBadge = document.createElement('span');
      neededBadge.className = 'card-badge badge-needed';
      neededBadge.textContent = 'Needed';
      badges.prepend(neededBadge);
    }
  }

  // ── Spares badge ──
  let sparesBadge = badges.querySelector('.badge-spares');
  if (owned && spares > 0) {
    if (!sparesBadge) {
      sparesBadge = document.createElement('span');
      sparesBadge.className = 'card-badge badge-spares';
      badges.appendChild(sparesBadge);
    }
    sparesBadge.textContent = `🔄 ×${spares}`;
  } else {
    if (sparesBadge) sparesBadge.remove();
  }

  // ── Spares stepper row ──
  let sparesRow = tile.querySelector('.card-spares-row');
  if (owned) {
    if (!sparesRow) {
      // Insert before card-toggle
      sparesRow = document.createElement('div');
      sparesRow.className = 'card-spares-row';
      tile.querySelector('.card-toggle').before(sparesRow);
    }
    sparesRow.innerHTML = `
      <span class="spares-label">Spares:</span>
      <div class="spares-stepper">
        <button class="spare-btn spare-dec" onclick="event.stopPropagation();setSpares('${id}',-1)" ${spares === 0 ? 'disabled' : ''}>−</button>
        <span class="spare-count">${spares}</span>
        <button class="spare-btn spare-inc" onclick="event.stopPropagation();setSpares('${id}',1)">+</button>
      </div>`;
  } else {
    if (sparesRow) sparesRow.remove();
  }

  if (btn)   btn.textContent   = owned ? 'Remove' : '+ Own';
  if (check) check.textContent = owned ? '✓' : '';
}

function buildTile(card) {
  const owned  = isOwned(card.id);
  const spares = getSpares(card.id);
  const tile   = document.createElement('div');
  tile.className = 'card-tile' + (owned ? ' owned' : ' needed') + (card.valuable ? ' valuable' : '') + (spares > 0 ? ' has-spares' : '');
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

  // Spares badge (only when owned and spares > 0)
  const sparesBadge = (owned && spares > 0)
    ? `<span class="card-badge badge-spares">🔄 ×${spares}</span>`
    : '';

  // Spares stepper row (only when owned)
  const sparesRow = owned ? `
    <div class="card-spares-row">
      <span class="spares-label">Spares:</span>
      <div class="spares-stepper">
        <button class="spare-btn spare-dec" onclick="event.stopPropagation();setSpares('${card.id}',-1)" ${spares === 0 ? 'disabled' : ''}>−</button>
        <span class="spare-count">${spares}</span>
        <button class="spare-btn spare-inc" onclick="event.stopPropagation();setSpares('${card.id}',1)">+</button>
      </div>
    </div>` : '';

  tile.innerHTML = `
    <div class="card-badges">${statusBadge}${rarityBadge}${valBadge}${sparesBadge}</div>
    <div class="card-number">#${escHtml(card.num)}</div>
    <div class="card-name">${escHtml(card.name)}</div>
    <div class="card-sub">${escHtml(card.sub)}</div>
    ${sparesRow}
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
    if (status === 'spares' &&  getSpares(c.id) === 0) return false;
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

  // Sort: PL team categories first (A-Z), then F1 team categories (A-Z), then inserts/specials
  const PL_TEAMS = new Set([
    'Arsenal','Aston Villa','AFC Bournemouth','Brentford','Brighton',
    'Chelsea','Coventry City','Crystal Palace','Everton','Fulham',
    'Hull City','Ipswich Town','Leeds United','Liverpool',
    'Manchester City','Manchester United','Newcastle United',
    'Nottingham Forest','Sunderland','Tottenham Hotspur',
    'West Ham United','Wolves','Leicester City','Southampton',
  ]);
  const F1_TEAMS = new Set([
    'McLaren','Mercedes-AMG','Red Bull Racing','Ferrari','Williams',
    'Racing Bulls','Aston Martin','Haas','Audi','Alpine','Cadillac',
  ]);

  const sortedGroups = Object.keys(groups).sort((a, b) => {
    const aIsTeam  = PL_TEAMS.has(a) || F1_TEAMS.has(a);
    const bIsTeam  = PL_TEAMS.has(b) || F1_TEAMS.has(b);
    if (aIsTeam && !bIsTeam) return -1;
    if (!aIsTeam && bIsTeam) return  1;
    return a.localeCompare(b);
  });

  sortedGroups.forEach(cat => {
    const catCards = groups[cat];
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
  if (filter === 'spares') filtered = allValuable.filter(c => getSpares(c.id) > 0);

  // Summary chips
  const totalVal   = allValuable.length;
  const ownedVal   = allValuable.filter(c => (c.collection === 'f1' ? ownedF1 : ownedPL).has(c.id)).length;
  const neededVal  = totalVal - ownedVal;
  const sparesVal  = allValuable.filter(c => getSpares(c.id) > 0).length;
  const f1Val      = allValuable.filter(c => c.collection === 'f1').length;
  const plVal      = allValuable.filter(c => c.collection === 'pl').length;

  document.getElementById('wl-summary').innerHTML = `
    <div class="wl-summary-chip">Total valuable: <span>${totalVal}</span></div>
    <div class="wl-summary-chip" style="color:var(--c-owned)">✓ Owned: <span style="color:var(--c-owned)">${ownedVal}</span></div>
    <div class="wl-summary-chip" style="color:var(--c-needed)">⬜ Needed: <span style="color:var(--c-needed)">${neededVal}</span></div>
    ${sparesVal > 0 ? `<div class="wl-summary-chip" style="color:#a78bfa">🔄 Spares available: <span style="color:#a78bfa">${sparesVal}</span></div>` : ''}
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
    const groupKey = (c.collection === 'f1' ? '🏎 F1 Turbo Attax 2026' : '⚽ Premier League 26/27') + ' — ' + c.category;
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
  // ── One-time seed: pre-populate PL 26/27 collection from physical card count ──
  const SEED_KEY = 'topps_pl_2627_seeded_v1';
  if (!localStorage.getItem(SEED_KEY)) {
    // Cards owned (including those with spares — count ≥ 1)
    const SEEDED_OWNED = [
      'pl-012','pl-014','pl-017','pl-019','pl-020','pl-039','pl-041','pl-049',
      'pl-054','pl-058','pl-074','pl-075','pl-076','pl-080','pl-094','pl-098',
      'pl-107','pl-109','pl-122','pl-131','pl-132','pl-134','pl-140','pl-143',
      'pl-146','pl-152','pl-153','pl-158','pl-160','pl-167','pl-180','pl-184',
      'pl-186','pl-192','pl-196','pl-199','pl-203','pl-210','pl-221','pl-227',
      'pl-230','pl-232','pl-233','pl-237','pl-239','pl-240','pl-245','pl-246',
      'pl-247','pl-253','pl-254','pl-264','pl-265','pl-270','pl-274','pl-275',
      'pl-277','pl-280','pl-281','pl-286','pl-291','pl-292','pl-299',
      'pl-8B7',
      'pl-BM-2','pl-BM-12','pl-BM-14','pl-BM-18','pl-BM-19','pl-BM-25',
      'pl-FF-1','pl-FF-12','pl-FF-20',
      'pl-GL-1',
      'pl-NB-8','pl-NB-13','pl-NB-14','pl-NB-17',
      'pl-OF-11','pl-OF-13',
      'pl-PT-3','pl-PT-4',
      'pl-RT-6',
      'pl-SPL-9','pl-SPL-11','pl-SPL-13','pl-SPL-15','pl-SPL-24',
    ];
    // Spares: card id → spare count (count - 1, since 1 owned + spares)
    const SEEDED_SPARES = {
      'pl-014':  1,  // count 2
      'pl-094':  1,  // count 2
      'pl-140':  1,  // count 2
      'pl-158':  1,  // count 2
      'pl-167':  1,  // count 2
      'pl-192':  1,  // count 2
      'pl-237':  1,  // count 2
      'pl-270':  2,  // count 3
      'pl-280':  1,  // count 2
      'pl-BM-25':1,  // count 2
      'pl-FF-20':1,  // count 2
      'pl-NB-8': 1,  // count 2
    };
    ownedPL  = new Set(SEEDED_OWNED);
    sparesPL = { ...SEEDED_SPARES };
    FireSync.save(LS_OWNED_PL,  [...ownedPL]);
    FireSync.save(LS_SPARES_PL, sparesPL);
    localStorage.setItem(SEED_KEY, '1');
  }

  // Load all four data keys from Firestore (falls back to localStorage)
  // Use a simple counter to render once all four loads complete
  let loaded = 0;
  function onLoad() {
    loaded++;
    if (loaded === 4) {
      renderStats();
      applyFilters();
      document.getElementById('bulk-visible').textContent = getCardSet().length;
    }
  }

  FireSync.load(LS_OWNED_F1, data => {
    if (Array.isArray(data)) ownedF1 = new Set(data);
    onLoad();
  });
  FireSync.load(LS_OWNED_PL, data => {
    if (Array.isArray(data)) ownedPL = new Set(data);
    onLoad();
  });
  FireSync.load(LS_SPARES_F1, data => {
    if (data && typeof data === 'object') sparesF1 = data;
    onLoad();
  });
  FireSync.load(LS_SPARES_PL, data => {
    if (data && typeof data === 'object') sparesPL = data;
    onLoad();
  });

  // Live sync — keep state updated when another device saves
  FireSync.listen(LS_OWNED_F1,  data => { if (Array.isArray(data)) { ownedF1 = new Set(data); renderStats(); applyFilters(); } });
  FireSync.listen(LS_OWNED_PL,  data => { if (Array.isArray(data)) { ownedPL = new Set(data); renderStats(); applyFilters(); } });
  FireSync.listen(LS_SPARES_F1, data => { if (data && typeof data === 'object') { sparesF1 = data; applyFilters(); } });
  FireSync.listen(LS_SPARES_PL, data => { if (data && typeof data === 'object') { sparesPL = data; applyFilters(); } });
});
