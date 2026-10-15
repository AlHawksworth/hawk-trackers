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


  // ─────────────────────────────────────────────────────────────────────────
  // AUTOGRAPHS & RELICS — Source: lukesolve.com/pages/topps-premier-league-flagship-2026-27-checklist
  // ─────────────────────────────────────────────────────────────────────────

  // ── BASE AUTOGRAPHS (165 cards) ───────────────────────────────────────────
  // Arsenal
  { id:'pl-BA-GM',  num:'BA-GM',  name:'Gabriel Magalhaes',       sub:'Arsenal — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-SC',  num:'BA-SC',  name:'Sol Campbell',            sub:'Arsenal — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-ML',  num:'BA-ML',  name:'Myles Lewis-Skelly',      sub:'Arsenal — Base Auto',       rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MZ',  num:'BA-MZ',  name:'Martin Zubimendi',        sub:'Arsenal — Base Auto',       rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-EE',  num:'BA-EE',  name:'Eberechi Eze',            sub:'Arsenal — Base Auto',       rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-DR',  num:'BA-DR',  name:'Declan Rice',             sub:'Arsenal — Base Auto',       rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-NWA', num:'BA-NWA', name:'Ethan Nwaneri',           sub:'Arsenal — Base Auto',       rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-BS',  num:'BA-BS',  name:'Bukayo Saka',             sub:'Arsenal — Base Auto',       rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-IW',  num:'BA-IW',  name:'Ian Wright',              sub:'Arsenal — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-NA',  num:'BA-NA',  name:'Nicolas Anelka',          sub:'Arsenal — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-NMA', num:'BA-NMA', name:'Noni Madueke',            sub:'Arsenal — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  // Aston Villa
  { id:'pl-BA-EK',  num:'BA-EK',  name:'Ezri Konsa',              sub:'Aston Villa — Base Auto',   rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-MCH', num:'BA-MCH', name:'Matty Cash',              sub:'Aston Villa — Base Auto',   rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-YT',  num:'BA-YT',  name:'Youri Tielemans',         sub:'Aston Villa — Base Auto',   rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-JMG', num:'BA-JMG', name:'John McGinn',             sub:'Aston Villa — Base Auto',   rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-OW',  num:'BA-OW',  name:'Ollie Watkins',           sub:'Aston Villa — Base Auto',   rarity:'epic',   valuable:true,  category:'Base Autographs' },
  // AFC Bournemouth
  { id:'pl-BA-AT',  num:'BA-AT',  name:'Adrien Truffert',         sub:'AFC Bournemouth — Base Auto',rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-TAD', num:'BA-TAD', name:'Tyler Adams',             sub:'AFC Bournemouth — Base Auto',rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-LC',  num:'BA-LC',  name:'Lewis Cook',              sub:'AFC Bournemouth — Base Auto',rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-ASC', num:'BA-ASC', name:'Alex Scott',              sub:'AFC Bournemouth — Base Auto',rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MTA', num:'BA-MTA', name:'Marcus Tavernier',        sub:'AFC Bournemouth — Base Auto',rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-BGD', num:'BA-BGD', name:'Ben Gannon-Doak',         sub:'AFC Bournemouth — Base Auto',rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-AAD', num:'BA-AAD', name:'Amine Adli',              sub:'AFC Bournemouth — Base Auto',rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-EVA', num:'BA-EVA', name:'Evanilson',               sub:'AFC Bournemouth — Base Auto',rarity:'rare',   valuable:true,  category:'Base Autographs' },
  // Brentford
  { id:'pl-BA-CK',  num:'BA-CK',  name:'Caoimhin Kelleher',       sub:'Brentford — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-VJ',  num:'BA-VJ',  name:'Vitaly Janelt',           sub:'Brentford — Base Auto',     rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-YY',  num:'BA-YY',  name:'Yegor Yarmolyuk',         sub:'Brentford — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-KF',  num:'BA-KF',  name:'Kaye Furo RC',            sub:'Brentford — Base Auto',     rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-KS',  num:'BA-KS',  name:'Kevin Schade',            sub:'Brentford — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  // Brighton
  { id:'pl-BA-LD',  num:'BA-LD',  name:'Lewis Dunk',              sub:'Brighton — Base Auto',      rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-MW',  num:'BA-MW',  name:'Mats Wieffer',            sub:'Brighton — Base Auto',      rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-CB',  num:'BA-CB',  name:'Carlos Baleba',           sub:'Brighton — Base Auto',      rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-TW',  num:'BA-TW',  name:'Tom Watson',              sub:'Brighton — Base Auto',      rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-DW',  num:'BA-DW',  name:'Danny Welbeck',           sub:'Brighton — Base Auto',      rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-GR',  num:'BA-GR',  name:'Georginio Rutter',        sub:'Brighton — Base Auto',      rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-YM',  num:'BA-YM',  name:'Yankuba Minteh',          sub:'Brighton — Base Auto',      rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-CKO', num:'BA-CKO', name:'Charalampos Kostoulas',   sub:'Brighton — Base Auto',      rarity:'rare',   valuable:true,  category:'Base Autographs' },
  // Chelsea
  { id:'pl-BA-JT',  num:'BA-JT',  name:'John Terry',              sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-JHA', num:'BA-JHA', name:'Jorrel Hato',             sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-EF',  num:'BA-EF',  name:'Enzo Fernandez',          sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-FL',  num:'BA-FL',  name:'Frank Lampard',           sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-LE',  num:'BA-LE',  name:'Landon Emenalo RC',       sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JDE', num:'BA-JDE', name:'Jesse Derry RC',          sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JDY', num:'BA-JDY', name:'Jamie Gittens',           sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-CP',  num:'BA-CP',  name:'Cole Palmer',             sub:'Chelsea — Base Auto',       rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MGU', num:'BA-MGU', name:'Marc Guiu',               sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-SE',  num:'BA-SE',  name:"Samuel Eto'o",            sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-DCO', num:'BA-DCO', name:'Diego Costa',             sub:'Chelsea — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-AGA', num:'BA-AGA', name:'Alejandro Garnacho',      sub:'Chelsea — Base Auto',       rarity:'epic',   valuable:true,  category:'Base Autographs' },
  // Coventry City
  { id:'pl-BA-JR',  num:'BA-JR',  name:'Jack Rudoni',             sub:'Coventry City — Base Auto', rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-GS',  num:'BA-GS',  name:'Gordon Strachan',         sub:'Coventry City — Base Auto', rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-JH',  num:'BA-JH',  name:'John Hartson',            sub:'Coventry City — Base Auto', rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-DD',  num:'BA-DD',  name:'Dion Dublin',             sub:'Coventry City — Base Auto', rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-BTA', num:'BA-BTA', name:'Brandon Thomas-Asante',   sub:'Coventry City — Base Auto', rarity:'common', valuable:false, category:'Base Autographs' },
  // Crystal Palace
  { id:'pl-BA-CRI', num:'BA-CRI', name:'Chris Richards',          sub:'Crystal Palace — Base Auto',rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-TM',  num:'BA-TM',  name:'Tyrick Mitchell',         sub:'Crystal Palace — Base Auto',rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-YP',  num:'BA-YP',  name:'Yeremy Pino',             sub:'Crystal Palace — Base Auto',rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-BJO', num:'BA-BJO', name:'Brennan Johnson',         sub:'Crystal Palace — Base Auto',rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-AW',  num:'BA-AW',  name:'Adam Wharton',            sub:'Crystal Palace — Base Auto',rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-EN',  num:'BA-EN',  name:'Eddie Nketiah',           sub:'Crystal Palace — Base Auto',rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-JPM', num:'BA-JPM', name:'Jean-Philippe Mateta',    sub:'Crystal Palace — Base Auto',rarity:'rare',   valuable:false, category:'Base Autographs' },
  // Everton
  { id:'pl-BA-JPI', num:'BA-JPI', name:'Jordan Pickford',         sub:'Everton — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-VM',  num:'BA-VM',  name:'Vitalii Mykolenko',       sub:'Everton — Base Auto',       rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-PJ',  num:'BA-PJ',  name:'Phil Jagielka',           sub:'Everton — Base Auto',       rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-AA',  num:'BA-AA',  name:'Adam Aznou',              sub:'Everton — Base Auto',       rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-AY',  num:'BA-AY',  name:'Ashley Young',            sub:'Everton — Base Auto',       rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-JBR', num:'BA-JBR', name:'Jarrad Branthwaite',      sub:'Everton — Base Auto',       rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-KD',  num:'BA-KD',  name:'Kiernan Dewsbury-Hall',   sub:'Everton — Base Auto',       rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-LO',  num:'BA-LO',  name:'Leon Osman',              sub:'Everton — Base Auto',       rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-DM',  num:'BA-DM',  name:'Dwight McNeil',           sub:'Everton — Base Auto',       rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-JB',  num:'BA-JB',  name:'James Beattie',           sub:'Everton — Base Auto',       rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-TD',  num:'BA-TD',  name:'Tyler Dibling',           sub:'Everton — Base Auto',       rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-BE',  num:'BA-BE',  name:'Beto',                    sub:'Everton — Base Auto',       rarity:'common', valuable:false, category:'Base Autographs' },
  // Fulham
  { id:'pl-BA-CBA', num:'BA-CBA', name:'Calvin Bassey',           sub:'Fulham — Base Auto',        rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-ARO', num:'BA-ARO', name:'Antonee Robinson',        sub:'Fulham — Base Auto',        rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-ESR', num:'BA-ESR', name:'Emile Smith Rowe',        sub:'Fulham — Base Auto',        rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-AI',  num:'BA-AI',  name:'Alex Iwobi',              sub:'Fulham — Base Auto',        rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-LS',  num:'BA-LS',  name:'Louis Saha',              sub:'Fulham — Base Auto',        rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-BMB', num:'BA-BMB', name:'Brian McBride',           sub:'Fulham — Base Auto',        rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-KE',  num:'BA-KE',  name:'Kevin',                   sub:'Fulham — Base Auto',        rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-OB',  num:'BA-OB',  name:'Oscar Bobb',              sub:'Fulham — Base Auto',        rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-BZ',  num:'BA-BZ',  name:'Bobby Zamora',            sub:'Fulham — Base Auto',        rarity:'common', valuable:false, category:'Base Autographs' },
  // Leeds United
  { id:'pl-BA-BA',  num:'BA-BA',  name:'Brenden Aaronson',        sub:'Leeds United — Base Auto',  rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-AS',  num:'BA-AS',  name:'Anton Stach',             sub:'Leeds United — Base Auto',  rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-LN',  num:'BA-LN',  name:'Lukas Nmecha',            sub:'Leeds United — Base Auto',  rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-WG',  num:'BA-WG',  name:'Wilfried Gnonto',         sub:'Leeds United — Base Auto',  rarity:'rare',   valuable:true,  category:'Base Autographs' },
  // Liverpool
  { id:'pl-BA-VVD', num:'BA-VVD', name:'Virgil van Dijk',         sub:'Liverpool — Base Auto',     rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-CBR', num:'BA-CBR', name:'Conor Bradley',           sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-JC',  num:'BA-JC',  name:'Jamie Carragher',         sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-MKE', num:'BA-MKE', name:'Milos Kerkez',            sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-AR',  num:'BA-AR',  name:'Andy Robertson',          sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-JF',  num:'BA-JF',  name:'Jeremie Frimpong',        sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-SBA', num:'BA-SBA', name:'Stefan Bajcetic',         sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-TAL', num:'BA-TAL', name:'Thiago Alcantara',        sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-SG',  num:'BA-SG',  name:'Steven Gerrard',          sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-PCO', num:'BA-PCO', name:'Philippe Coutinho',       sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-SM',  num:'BA-SM',  name:'Sadio Mane',              sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-RF',  num:'BA-RF',  name:'Roberto Firmino',         sub:'Liverpool — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-MS',  num:'BA-MS',  name:'Mohamed Salah',           sub:'Liverpool — Base Auto',     rarity:'legend', valuable:true,  category:'Base Autographs' },
  // Manchester City
  { id:'pl-BA-MGI', num:'BA-MGI', name:'Marc Guehi',              sub:'Man City — Base Auto',      rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-NOR', num:'BA-NOR', name:"Nico O'Reilly",           sub:'Man City — Base Auto',      rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JG',  num:'BA-JG',  name:'Josko Gvardiol',          sub:'Man City — Base Auto',      rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MN',  num:'BA-MN',  name:'Matheus Nunes',           sub:'Man City — Base Auto',      rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-TR',  num:'BA-TR',  name:'Tijjani Reijnders',       sub:'Man City — Base Auto',      rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-SAV', num:'BA-SAV', name:'Savinho',                 sub:'Man City — Base Auto',      rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JD',  num:'BA-JD',  name:'Jeremy Doku',             sub:'Man City — Base Auto',      rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-PF',  num:'BA-PF',  name:'Phil Foden',              sub:'Man City — Base Auto',      rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-RC',  num:'BA-RC',  name:'Rayan Cherki',            sub:'Man City — Base Auto',      rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-RMA', num:'BA-RMA', name:'Riyad Mahrez',            sub:'Man City — Base Auto',      rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-EH',  num:'BA-EH',  name:'Erling Haaland',          sub:'Man City — Base Auto',      rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-SA',  num:'BA-SA',  name:'Sergio Aguero',           sub:'Man City — Base Auto',      rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-ASE', num:'BA-ASE', name:'Antoine Semenyo',         sub:'Man City — Base Auto',      rarity:'rare',   valuable:true,  category:'Base Autographs' },
  // Manchester United
  { id:'pl-BA-Ev',  num:'BA-Ev',  name:'Edwin van der Sar',       sub:'Man United — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-PS',  num:'BA-PS',  name:'Peter Schmeichel',        sub:'Man United — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-DDA', num:'BA-DDA', name:'Diogo Dalot',             sub:'Man United — Base Auto',    rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-NV',  num:'BA-NV',  name:'Nemanja Vidic',           sub:'Man United — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-GH',  num:'BA-GH',  name:'Gabriel Heinze',          sub:'Man United — Base Auto',    rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-LY',  num:'BA-LY',  name:'Leny Yoro',               sub:'Man United — Base Auto',    rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-PD',  num:'BA-PD',  name:'Patrick Dorgu',           sub:'Man United — Base Auto',    rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MCA', num:'BA-MCA', name:'Michael Carrick',         sub:'Man United — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-SK',  num:'BA-SK',  name:'Shinji Kagawa',           sub:'Man United — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-BF',  num:'BA-BF',  name:'Bruno Fernandes',         sub:'Man United — Base Auto',    rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-MM',  num:'BA-MM',  name:'Mason Mount',             sub:'Man United — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-AH',  num:'BA-AH',  name:'Ander Herrera',           sub:'Man United — Base Auto',    rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-KMA', num:'BA-KMA', name:'Kobbie Mainoo',           sub:'Man United — Base Auto',    rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-BSE', num:'BA-BSE', name:'Benjamin Sesko',          sub:'Man United — Base Auto',    rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JZ',  num:'BA-JZ',  name:'Joshua Zirkzee',          sub:'Man United — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-MC',  num:'BA-MC',  name:'Matheus Cunha',           sub:'Man United — Base Auto',    rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-RV',  num:'BA-RV',  name:'Robin Van Persie',        sub:'Man United — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-ASA', num:'BA-ASA', name:'Alexis Sanchez',          sub:'Man United — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-BM',  num:'BA-BM',  name:'Bryan Mbeumo',            sub:'Man United — Base Auto',    rarity:'legend', valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JJ',  num:'BA-JJ',  name:'JJ Gabriel RC',           sub:'Man United — Base Auto',    rarity:'rare',   valuable:true,  category:'Base Autographs' },
  // Newcastle United
  { id:'pl-BA-NP',  num:'BA-NP',  name:'Nick Pope',               sub:'Newcastle — Base Auto',     rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-SB',  num:'BA-SB',  name:'Sven Botman',             sub:'Newcastle — Base Auto',     rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-THI', num:'BA-THI', name:'Malick Thiaw',            sub:'Newcastle — Base Auto',     rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-TL',  num:'BA-TL',  name:'Tino Livramento',         sub:'Newcastle — Base Auto',     rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-LM',  num:'BA-LM',  name:'Lewis Miley',             sub:'Newcastle — Base Auto',     rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-BG',  num:'BA-BG',  name:'Bruno Guimaraes',         sub:'Newcastle — Base Auto',     rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-ST',  num:'BA-ST',  name:'Sandro Tonali',           sub:'Newcastle — Base Auto',     rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JMU', num:'BA-JMU', name:'Jacob Murphy',            sub:'Newcastle — Base Auto',     rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-PK',  num:'BA-PK',  name:'Patrick Kluivert',        sub:'Newcastle — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-PC',  num:'BA-PC',  name:'Papiss Cisse',            sub:'Newcastle — Base Auto',     rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-NW',  num:'BA-NW',  name:'Nick Woltemade',          sub:'Newcastle — Base Auto',     rarity:'rare',   valuable:true,  category:'Base Autographs' },
  // Nottingham Forest
  { id:'pl-BA-ZA',  num:'BA-ZA',  name:'Zach Abbott',             sub:'Nottm Forest — Base Auto',  rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-NM',  num:'BA-NM',  name:'Nikola Milenkovic',       sub:'Nottm Forest — Base Auto',  rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-OH',  num:'BA-OH',  name:'Omari Hutchinson',        sub:'Nottm Forest — Base Auto',  rarity:'rare',   valuable:true,  category:'Base Autographs' },
  // Sunderland
  { id:'pl-BA-JO',  num:'BA-JO',  name:"John O'Shea",             sub:'Sunderland — Base Auto',    rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-RM',  num:'BA-RM',  name:'Reinildo Mandava',        sub:'Sunderland — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-GX',  num:'BA-GX',  name:'Granit Xhaka',            sub:'Sunderland — Base Auto',    rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-CT',  num:'BA-CT',  name:'Chemsdine Talbi',         sub:'Sunderland — Base Auto',    rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-KP',  num:'BA-KP',  name:'Kevin Phillips',          sub:'Sunderland — Base Auto',    rarity:'common', valuable:false, category:'Base Autographs' },
  { id:'pl-BA-DC',  num:'BA-DC',  name:'Djibril Cisse',           sub:'Sunderland — Base Auto',    rarity:'common', valuable:false, category:'Base Autographs' },
  // Tottenham Hotspur
  { id:'pl-BA-CR',  num:'BA-CR',  name:'Cristian Romero',         sub:'Tottenham — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-DU',  num:'BA-DU',  name:'Destiny Udogie',          sub:'Tottenham — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-TA',  num:'BA-TA',  name:'Toby Alderweireld',       sub:'Tottenham — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-Mv',  num:'BA-Mv',  name:'Micky van de Ven',        sub:'Tottenham — Base Auto',     rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-LB',  num:'BA-LB',  name:'Lucas Bergvall',          sub:'Tottenham — Base Auto',     rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-JM',  num:'BA-JM',  name:'James Maddison',          sub:'Tottenham — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-DK',  num:'BA-DK',  name:'Dejan Kulusevski',        sub:'Tottenham — Base Auto',     rarity:'rare',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-LW',  num:'BA-LW',  name:'Luca Williams-Barnett RC',sub:'Tottenham — Base Auto',     rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-GB',  num:'BA-GB',  name:'Gareth Bale',             sub:'Tottenham — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-DSO', num:'BA-DSO', name:'Dominic Solanke',         sub:'Tottenham — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-SH',  num:'BA-SH',  name:'Son Heung-min',           sub:'Tottenham — Base Auto',     rarity:'epic',   valuable:true,  category:'Base Autographs' },
  { id:'pl-BA-WL',  num:'BA-WL',  name:'Will Lankshear',          sub:'Tottenham — Base Auto',     rarity:'rare',   valuable:false, category:'Base Autographs' },
  { id:'pl-BA-MT',  num:'BA-MT',  name:'Mathys Tel',              sub:'Tottenham — Base Auto',     rarity:'rare',   valuable:true,  category:'Base Autographs' },

  // ── FUTURE STARS AUTOGRAPHS ───────────────────────────────────────────────
  { id:'pl-FSA-MD', num:'FSA-MD', name:'Max Dowman',              sub:'Future Stars Auto — Arsenal',       rarity:'epic',   valuable:true,  category:'Future Stars Autographs' },
  { id:'pl-FSA-EL', num:'FSA-EL', name:'Junior Kroupi',           sub:'Future Stars Auto — Bournemouth',   rarity:'rare',   valuable:true,  category:'Future Stars Autographs' },
  { id:'pl-FSA-YA', num:'FSA-YA', name:'Yasin Ayari',             sub:'Future Stars Auto — Brighton',      rarity:'rare',   valuable:true,  category:'Future Stars Autographs' },
  { id:'pl-FSA-RW', num:'FSA-RW', name:'Reggie Walsh',            sub:'Future Stars Auto — Chelsea',       rarity:'rare',   valuable:true,  category:'Future Stars Autographs' },
  { id:'pl-FSA-RE', num:'FSA-RE', name:'Romain Esse',             sub:'Future Stars Auto — Crystal Palace',rarity:'rare',   valuable:true,  category:'Future Stars Autographs' },
  { id:'pl-FSA-JK', num:'FSA-JK', name:'Josh King',               sub:'Future Stars Auto — Fulham',        rarity:'rare',   valuable:true,  category:'Future Stars Autographs' },
  { id:'pl-FSA-HG', num:'FSA-HG', name:'Harry Gray',              sub:'Future Stars Auto — Leeds',         rarity:'rare',   valuable:true,  category:'Future Stars Autographs' },
  { id:'pl-FSA-GL', num:'FSA-GL', name:'Giovanni Leoni',          sub:'Future Stars Auto — Liverpool',     rarity:'epic',   valuable:true,  category:'Future Stars Autographs' },
  { id:'pl-FSA-DM', num:'FSA-DM', name:'Divine Mukasa',           sub:'Future Stars Auto — Man City',      rarity:'rare',   valuable:true,  category:'Future Stars Autographs' },
  { id:'pl-FSA-SL', num:'FSA-SL', name:'Shea Lacey',              sub:'Future Stars Auto — Man United',    rarity:'rare',   valuable:true,  category:'Future Stars Autographs' },

  // ── STARS OF THE PREMIER LEAGUE AUTOGRAPHS ────────────────────────────────
  { id:'pl-SPLA-DR', num:'SPLA-DR', name:'Declan Rice',           sub:'Stars of the PL Auto — Arsenal',    rarity:'epic',   valuable:true,  category:'Stars of PL Autographs' },
  { id:'pl-SPLA-YT', num:'SPLA-YT', name:'Youri Tielemans',       sub:'Stars of the PL Auto — Aston Villa',rarity:'rare',   valuable:false, category:'Stars of PL Autographs' },
  { id:'pl-SPLA-PG', num:'SPLA-PG', name:'Pascal Gross',          sub:'Stars of the PL Auto — Brighton',   rarity:'rare',   valuable:false, category:'Stars of PL Autographs' },
  { id:'pl-SPLA-JR', num:'SPLA-JR', name:'Jack Rudoni',           sub:'Stars of the PL Auto — Coventry',   rarity:'common', valuable:false, category:'Stars of PL Autographs' },
  { id:'pl-SPLA-AW', num:'SPLA-AW', name:'Adam Wharton',          sub:'Stars of the PL Auto — Crystal Palace',rarity:'rare', valuable:true, category:'Stars of PL Autographs' },
  { id:'pl-SPLA-BA', num:'SPLA-BA', name:'Brenden Aaronson',      sub:'Stars of the PL Auto — Leeds',      rarity:'rare',   valuable:false, category:'Stars of PL Autographs' },
  { id:'pl-SPLA-MG', num:'SPLA-MG', name:'Marc Guehi',            sub:'Stars of the PL Auto — Man City',   rarity:'rare',   valuable:true,  category:'Stars of PL Autographs' },
  { id:'pl-SPLA-KM', num:'SPLA-KM', name:'Kobbie Mainoo',         sub:'Stars of the PL Auto — Man United', rarity:'epic',   valuable:true,  category:'Stars of PL Autographs' },
  { id:'pl-SPLA-BM', num:'SPLA-BM', name:'Bryan Mbeumo',          sub:'Stars of the PL Auto — Man United', rarity:'legend', valuable:true,  category:'Stars of PL Autographs' },

  // ── DUAL AUTOGRAPHS ───────────────────────────────────────────────────────
  { id:'pl-DA-DS',  num:'DA-DS',  name:'Max Dowman / Bukayo Saka',          sub:'Dual Auto — Arsenal',        rarity:'legend', valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-YW',  num:'DA-YW',  name:'Dwight Yorke / Ollie Watkins',      sub:'Dual Auto — Aston Villa',    rarity:'epic',   valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-ZP',  num:'DA-ZP',  name:'Gianfranco Zola / Cole Palmer',     sub:'Dual Auto — Chelsea',        rarity:'legend', valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-ME',  num:'DA-ME',  name:'Sadio Mane / Hugo Ekitike',         sub:'Dual Auto — Liverpool',      rarity:'epic',   valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-FD',  num:'DA-FD',  name:'Phil Foden / Jeremy Doku',          sub:'Dual Auto — Man City',       rarity:'epic',   valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-SM',  num:'DA-SM',  name:'Benjamin Sesko / Bryan Mbeumo',     sub:'Dual Auto — Man United',     rarity:'legend', valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-BK',  num:'DA-BK',  name:'David Beckham / Roy Keane',         sub:'Dual Auto — Man United',     rarity:'legend', valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-SW',  num:'DA-SW',  name:'Alan Shearer / Nick Woltemade',     sub:'Dual Auto — Newcastle',      rarity:'epic',   valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-TG',  num:'DA-TG',  name:'Sandro Tonali / Bruno Guimaraes',  sub:'Dual Auto — Newcastle',      rarity:'epic',   valuable:true,  category:'Dual Autographs' },
  { id:'pl-DA-KH',  num:'DA-KH',  name:'Harry Kane / Son Heung-min',        sub:'Dual Auto — Tottenham',      rarity:'legend', valuable:true,  category:'Dual Autographs' },

  // ── 25 YEARS CHAMPIONS ANNIVERSARY ON-CARD AUTOS (/25 — Arsenal) ─────────
  { id:'pl-CA-DS',  num:'CA-DS',  name:'David Seaman',            sub:'25 Yrs Champions Auto /25',  rarity:'epic',   valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-MK',  num:'CA-MK',  name:'Martin Keown',            sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-SC',  num:'CA-SC',  name:'Sol Campbell',            sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-TA',  num:'CA-TA',  name:'Tony Adams',              sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-AC',  num:'CA-AC',  name:'Ashley Cole',             sub:'25 Yrs Champions Auto /25',  rarity:'epic',   valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-GVB', num:'CA-GVB', name:'Giovanni van Bronckhorst',sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-ED',  num:'CA-ED',  name:'Edu',                     sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-PV',  num:'CA-PV',  name:'Patrick Vieira',          sub:'25 Yrs Champions Auto /25',  rarity:'legend', valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-RPA', num:'CA-RPA', name:'Ray Parlour',             sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-FL',  num:'CA-FL',  name:'Freddie Ljungberg',       sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-RP',  num:'CA-RP',  name:'Robert Pires',            sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-DB',  num:'CA-DB',  name:'Dennis Bergkamp',         sub:'25 Yrs Champions Auto /25',  rarity:'legend', valuable:true,  category:'Anniversary Autos' },
  { id:'pl-CA-NK',  num:'CA-NK',  name:'Nwankwo Kanu',            sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-SW',  num:'CA-SW',  name:'Sylvain Wiltord',         sub:'25 Yrs Champions Auto /25',  rarity:'rare',   valuable:false, category:'Anniversary Autos' },
  { id:'pl-CA-TH',  num:'CA-TH',  name:'Thierry Henry',           sub:'25 Yrs Champions Auto /25',  rarity:'legend', valuable:true,  category:'Anniversary Autos' },

  // ── MARKS OF EXCELLENCE ───────────────────────────────────────────────────
  { id:'pl-EX-VVD', num:'EX-VVD', name:'Virgil van Dijk',         sub:'Marks of Excellence — Liverpool', rarity:'epic',   valuable:true, category:'Marks of Excellence' },
  { id:'pl-EX-RN',  num:'EX-RN',  name:'Rio Ngumoha',             sub:'Marks of Excellence — Liverpool', rarity:'rare',   valuable:true, category:'Marks of Excellence' },
  { id:'pl-EX-MS',  num:'EX-MS',  name:'Mohamed Salah',           sub:'Marks of Excellence — Liverpool', rarity:'legend', valuable:true, category:'Marks of Excellence' },
  { id:'pl-EX-GD',  num:'EX-GD',  name:'Gianluigi Donnarumma',    sub:'Marks of Excellence — Man City',  rarity:'epic',   valuable:true, category:'Marks of Excellence' },
  { id:'pl-EX-EH',  num:'EX-EH',  name:'Erling Haaland',          sub:'Marks of Excellence — Man City',  rarity:'legend', valuable:true, category:'Marks of Excellence' },

  // ── GOLDEN BOOT ON-CARD AUTOGRAPHS ────────────────────────────────────────
  { id:'pl-GB-TH',  num:'GB-TH',  name:'Thierry Henry',           sub:'Golden Boot Auto — Arsenal',     rarity:'legend', valuable:true, category:'Golden Boot Autographs' },
  { id:'pl-GB-MS',  num:'GB-MS',  name:'Mohamed Salah',           sub:'Golden Boot Auto — Liverpool',   rarity:'legend', valuable:true, category:'Golden Boot Autographs' },
  { id:'pl-GB-MO',  num:'GB-MO',  name:'Michael Owen',            sub:'Golden Boot Auto — Liverpool',   rarity:'epic',   valuable:true, category:'Golden Boot Autographs' },
  { id:'pl-GB-JFH', num:'GB-JFH', name:'Jimmy Floyd Hasselbaink', sub:'Golden Boot Auto — Leeds',       rarity:'epic',   valuable:true, category:'Golden Boot Autographs' },
  { id:'pl-GB-EH',  num:'GB-EH',  name:'Erling Haaland',          sub:'Golden Boot Auto — Man City',    rarity:'legend', valuable:true, category:'Golden Boot Autographs' },
  { id:'pl-GB-RVP', num:'GB-RVP', name:'Robin van Persie',        sub:'Golden Boot Auto — Man United',  rarity:'epic',   valuable:true, category:'Golden Boot Autographs' },
  { id:'pl-GB-AS',  num:'GB-AS',  name:'Alan Shearer',            sub:'Golden Boot Auto — Newcastle',   rarity:'legend', valuable:true, category:'Golden Boot Autographs' },
  { id:'pl-GB-KP',  num:'GB-KP',  name:'Kevin Phillips',          sub:'Golden Boot Auto — Sunderland',  rarity:'rare',   valuable:false,category:'Golden Boot Autographs' },
  { id:'pl-GK-HK',  num:'GK-HK',  name:'Harry Kane',              sub:'Golden Boot Auto — Tottenham',   rarity:'legend', valuable:true, category:'Golden Boot Autographs' },
  { id:'pl-GB-SHM', num:'GB-SHM', name:'Son Heung-min',           sub:'Golden Boot Auto — Tottenham',   rarity:'epic',   valuable:true, category:'Golden Boot Autographs' },

  // ── BLACK EDGE AUTOGRAPHS ─────────────────────────────────────────────────
  { id:'pl-BE-MD',  num:'BE-MD',  name:'Max Dowman',              sub:'Black Edge Auto — Arsenal',      rarity:'epic',   valuable:true, category:'Black Edge Autographs' },
  { id:'pl-BE-PG',  num:'BE-PG',  name:'Paul Gascoigne',          sub:'Black Edge Auto — Everton',      rarity:'epic',   valuable:true, category:'Black Edge Autographs' },
  { id:'pl-BE-LS',  num:'BE-LS',  name:'Luis Suarez',             sub:'Black Edge Auto — Liverpool',    rarity:'legend', valuable:true, category:'Black Edge Autographs' },
  { id:'pl-BE-HE',  num:'BE-HE',  name:'Hugo Ekitike',            sub:'Black Edge Auto — Liverpool',    rarity:'epic',   valuable:true, category:'Black Edge Autographs' },
  { id:'pl-BE-KDB', num:'BE-KDB', name:'Kevin De Bruyne',         sub:'Black Edge Auto — Man City',     rarity:'legend', valuable:true, category:'Black Edge Autographs' },
  { id:'pl-BE-AS',  num:'BE-AS',  name:'Antoine Semenyo',         sub:'Black Edge Auto — Man City',     rarity:'rare',   valuable:true, category:'Black Edge Autographs' },
  { id:'pl-BE-JJG', num:'BE-JJG', name:'JJ Gabriel RC',           sub:'Black Edge Auto — Man United',   rarity:'rare',   valuable:true, category:'Black Edge Autographs' },
  { id:'pl-BE-DB',  num:'BE-DB',  name:'David Beckham',           sub:'Black Edge Auto — Man United',   rarity:'legend', valuable:true, category:'Black Edge Autographs' },
  { id:'pl-BE-DG',  num:'BE-DG',  name:'David Ginola',            sub:'Black Edge Auto — Newcastle',    rarity:'epic',   valuable:true, category:'Black Edge Autographs' },
  { id:'pl-BE-HK',  num:'BE-HK',  name:'Harry Kane',              sub:'Black Edge Auto — Tottenham',    rarity:'legend', valuable:true, category:'Black Edge Autographs' },

  // ── CHROME CLASSICS AUTOGRAPHS ────────────────────────────────────────────
  { id:'pl-CC-IW',  num:'CC-IW',  name:'Ian Wright',              sub:'Chrome Classics — Arsenal',      rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-JPA', num:'CC-JPA', name:'Juan Pablo Angel',        sub:'Chrome Classics — Aston Villa',  rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-GA',  num:'CC-GA',  name:'Gabriel Agbonlahor',      sub:'Chrome Classics — Aston Villa',  rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-JD',  num:'CC-JD',  name:'Jermain Defoe',           sub:'Chrome Classics — Bournemouth',  rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-DW',  num:'CC-DW',  name:'Danny Welbeck',           sub:'Chrome Classics — Brighton',     rarity:'common', valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-TS',  num:'CC-TS',  name:'Thiago Silva',            sub:'Chrome Classics — Chelsea',      rarity:'epic',   valuable:true, category:'Chrome Classics Autographs' },
  { id:'pl-CC-EH',  num:'CC-EH',  name:'Eden Hazard',             sub:'Chrome Classics — Chelsea',      rarity:'legend', valuable:true, category:'Chrome Classics Autographs' },
  { id:'pl-CC-EG',  num:'CC-EG',  name:'Eidur Gudjohnsen',        sub:'Chrome Classics — Chelsea',      rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-ID',  num:'CC-ID',  name:'Iain Dowie',              sub:'Chrome Classics — Crystal Palace',rarity:'common',valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-WZ',  num:'CC-WZ',  name:'Wilfried Zaha',           sub:'Chrome Classics — Crystal Palace',rarity:'rare',  valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-DF',  num:'CC-DF',  name:'Duncan Ferguson',         sub:'Chrome Classics — Everton',      rarity:'rare',   valuable:true, category:'Chrome Classics Autographs' },
  { id:'pl-CC-SM',  num:'CC-SM',  name:'Steed Malbranque',        sub:'Chrome Classics — Fulham',       rarity:'common', valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-BMB', num:'CC-BMB', name:'Brian McBride',           sub:'Chrome Classics — Fulham',       rarity:'common', valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-JB',  num:'CC-JB',  name:'John Barnes',             sub:'Chrome Classics — Liverpool',    rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-RF',  num:'CC-RF',  name:'Roberto Firmino',         sub:'Chrome Classics — Liverpool',    rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-NA',  num:'CC-NA',  name:'Nicolas Anelka',          sub:'Chrome Classics — Liverpool',    rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-PZ',  num:'CC-PZ',  name:'Pablo Zabaleta',          sub:'Chrome Classics — Man City',     rarity:'common', valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-YT',  num:'CC-YT',  name:'Yaya Toure',              sub:'Chrome Classics — Man City',     rarity:'epic',   valuable:true, category:'Chrome Classics Autographs' },
  { id:'pl-CC-RM',  num:'CC-RM',  name:'Riyad Mahrez',            sub:'Chrome Classics — Man City',     rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-RK',  num:'CC-RK',  name:'Roy Keane',               sub:'Chrome Classics — Man United',   rarity:'legend', valuable:true, category:'Chrome Classics Autographs' },
  { id:'pl-CC-RVP', num:'CC-RVP', name:'Robin van Persie',        sub:'Chrome Classics — Man United',   rarity:'epic',   valuable:true, category:'Chrome Classics Autographs' },
  { id:'pl-CC-ASZ', num:'CC-ASZ', name:'Alexis Sanchez',          sub:'Chrome Classics — Man United',   rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-AS',  num:'CC-AS',  name:'Alan Shearer',            sub:'Chrome Classics — Newcastle',    rarity:'legend', valuable:true, category:'Chrome Classics Autographs' },
  { id:'pl-CC-PK',  num:'CC-PK',  name:'Patrick Kluivert',        sub:'Chrome Classics — Newcastle',    rarity:'rare',   valuable:false,category:'Chrome Classics Autographs' },
  { id:'pl-CC-KP',  num:'CC-KP',  name:'Kevin Phillips',          sub:'Chrome Classics — Sunderland',   rarity:'common', valuable:false,category:'Chrome Classics Autographs' },

  // ── PERFECT 10 AUTOGRAPHS ─────────────────────────────────────────────────
  { id:'pl-PT-EE',  num:'PT-EE',  name:'Eberechi Eze',            sub:'Perfect 10 Auto — Arsenal',      rarity:'epic',   valuable:true, category:'Perfect 10 Autographs' },
  { id:'pl-PT-CP',  num:'PT-CP',  name:'Cole Palmer',             sub:'Perfect 10 Auto — Chelsea',      rarity:'legend', valuable:true, category:'Perfect 10 Autographs' },
  { id:'pl-PT-EH',  num:'PT-EH',  name:'Eden Hazard',             sub:'Perfect 10 Auto — Chelsea',      rarity:'legend', valuable:true, category:'Perfect 10 Autographs' },
  { id:'pl-PT-IN',  num:'PT-IN',  name:'Iliman Ndiaye',           sub:'Perfect 10 Auto — Everton',      rarity:'rare',   valuable:true, category:'Perfect 10 Autographs' },
  { id:'pl-PT-PC',  num:'PT-PC',  name:'Philippe Coutinho',       sub:'Perfect 10 Auto — Liverpool',    rarity:'rare',   valuable:false,category:'Perfect 10 Autographs' },
  { id:'pl-PT-RC',  num:'PT-RC',  name:'Rayan Cherki',            sub:'Perfect 10 Auto — Man City',     rarity:'epic',   valuable:true, category:'Perfect 10 Autographs' },
  { id:'pl-PT-SA',  num:'PT-SA',  name:'Sergio Aguero',           sub:'Perfect 10 Auto — Man City',     rarity:'rare',   valuable:false,category:'Perfect 10 Autographs' },
  { id:'pl-PT-MC',  num:'PT-MC',  name:'Matheus Cunha',           sub:'Perfect 10 Auto — Man United',   rarity:'epic',   valuable:true, category:'Perfect 10 Autographs' },
  { id:'pl-PT-WR',  num:'PT-WR',  name:'Wayne Rooney',            sub:'Perfect 10 Auto — Man United',   rarity:'legend', valuable:true, category:'Perfect 10 Autographs' },
  { id:'pl-PT-HK',  num:'PT-HK',  name:'Harry Kane',              sub:'Perfect 10 Auto — Tottenham',    rarity:'legend', valuable:true, category:'Perfect 10 Autographs' },

  // ── VIBES AUTOGRAPHS ──────────────────────────────────────────────────────
  { id:'pl-VI-VG',  num:'VI-VG',  name:'Viktor Gyokeres',         sub:'Vibes Auto — Arsenal',           rarity:'legend', valuable:true, category:'Vibes Autographs' },
  { id:'pl-VI-OW',  num:'VI-OW',  name:'Ollie Watkins',           sub:'Vibes Auto — Aston Villa',       rarity:'epic',   valuable:true, category:'Vibes Autographs' },
  { id:'pl-VI-CK',  num:'VI-CK',  name:'Charalampos Kostoulas',   sub:'Vibes Auto — Brighton',          rarity:'rare',   valuable:true, category:'Vibes Autographs' },
  { id:'pl-VI-MC',  num:'VI-MC',  name:'Marc Cucurella',          sub:'Vibes Auto — Chelsea',           rarity:'common', valuable:false,category:'Vibes Autographs' },
  { id:'pl-VI-JPM', num:'VI-JPM', name:'Jean-Philippe Mateta',    sub:'Vibes Auto — Crystal Palace',    rarity:'rare',   valuable:false,category:'Vibes Autographs' },
  { id:'pl-VI-AI',  num:'VI-AI',  name:'Alex Iwobi',              sub:'Vibes Auto — Fulham',            rarity:'rare',   valuable:false,category:'Vibes Autographs' },
  { id:'pl-VI-HE',  num:'VI-HE',  name:'Hugo Ekitike',            sub:'Vibes Auto — Liverpool',         rarity:'epic',   valuable:true, category:'Vibes Autographs' },
  { id:'pl-VI-EH',  num:'VI-EH',  name:'Erling Haaland',          sub:'Vibes Auto — Man City',          rarity:'legend', valuable:true, category:'Vibes Autographs' },
  { id:'pl-VI-PD',  num:'VI-PD',  name:'Patrick Dorgu',           sub:'Vibes Auto — Man United',        rarity:'rare',   valuable:true, category:'Vibes Autographs' },
  { id:'pl-VI-CT',  num:'VI-CT',  name:'Chemsdine Talbi',         sub:'Vibes Auto — Sunderland',        rarity:'rare',   valuable:true, category:'Vibes Autographs' },

  // ── MAYHEM AUTOGRAPHS ─────────────────────────────────────────────────────
  { id:'pl-MA-GMA', num:'MA-GMA', name:'Gabriel Martinelli',      sub:'Mayhem Auto — Arsenal',          rarity:'rare',   valuable:false,category:'Mayhem Autographs' },
  { id:'pl-MA-EV',  num:'MA-EV',  name:'Evanilson',               sub:'Mayhem Auto — Bournemouth',      rarity:'rare',   valuable:true, category:'Mayhem Autographs' },
  { id:'pl-MA-DO',  num:'MA-DO',  name:'Dango Ouattara',          sub:'Mayhem Auto — Brentford',        rarity:'rare',   valuable:true, category:'Mayhem Autographs' },
  { id:'pl-MA-YA',  num:'MA-YA',  name:'Yasin Ayari',             sub:'Mayhem Auto — Brighton',         rarity:'rare',   valuable:true, category:'Mayhem Autographs' },
  { id:'pl-MA-JDE', num:'MA-JDE', name:'Jesse Derry RC',          sub:'Mayhem Auto — Chelsea',          rarity:'rare',   valuable:true, category:'Mayhem Autographs' },
  { id:'pl-MA-KE',  num:'MA-KE',  name:'Kevin',                   sub:'Mayhem Auto — Fulham',           rarity:'common', valuable:false,category:'Mayhem Autographs' },
  { id:'pl-MA-NO',  num:'MA-NO',  name:'Noah Okafor',             sub:'Mayhem Auto — Leeds',            rarity:'rare',   valuable:true, category:'Mayhem Autographs' },
  { id:'pl-MA-JF',  num:'MA-JF',  name:'Jeremie Frimpong',        sub:'Mayhem Auto — Liverpool',        rarity:'rare',   valuable:true, category:'Mayhem Autographs' },
  { id:'pl-MA-JD',  num:'MA-JD',  name:'Jeremy Doku',             sub:'Mayhem Auto — Man City',         rarity:'epic',   valuable:true, category:'Mayhem Autographs' },
  { id:'pl-MA-BS',  num:'MA-BS',  name:'Benjamin Sesko',          sub:'Mayhem Auto — Man United',       rarity:'legend', valuable:true, category:'Mayhem Autographs' },

  // ── ON FIRE AUTOGRAPHS ────────────────────────────────────────────────────
  { id:'pl-OF-GM',  num:'OF-GM',  name:'Gabriel Martinelli',      sub:'On Fire Auto — Arsenal',         rarity:'rare',   valuable:false,category:'On Fire Autographs' },
  { id:'pl-OF-BS',  num:'OF-BS',  name:'Bukayo Saka',             sub:'On Fire Auto — Arsenal',         rarity:'legend', valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-EK',  num:'OF-EK',  name:'Ezri Konsa',              sub:'On Fire Auto — Aston Villa',     rarity:'rare',   valuable:false,category:'On Fire Autographs' },
  { id:'pl-OF-EV',  num:'OF-EV',  name:'Evanilson',               sub:'On Fire Auto — Bournemouth',     rarity:'rare',   valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-KS',  num:'OF-KS',  name:'Kevin Schade',            sub:'On Fire Auto — Brentford',       rarity:'rare',   valuable:false,category:'On Fire Autographs' },
  { id:'pl-OF-MS',  num:'OF-MS',  name:'Moises Caicedo',          sub:'On Fire Auto — Chelsea',         rarity:'epic',   valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-JP',  num:'OF-JP',  name:'Joao Pedro',              sub:'On Fire Auto — Chelsea',         rarity:'rare',   valuable:false,category:'On Fire Autographs' },
  { id:'pl-OF-NO',  num:'OF-NO',  name:'Noah Okafor',             sub:'On Fire Auto — Leeds',           rarity:'rare',   valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-VVD', num:'OF-VVD', name:'Virgil van Dijk',         sub:'On Fire Auto — Liverpool',       rarity:'epic',   valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-TR',  num:'OF-TR',  name:'Tijjani Reijnders',       sub:'On Fire Auto — Man City',        rarity:'epic',   valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-AS',  num:'OF-AS',  name:'Antoine Semenyo',         sub:'On Fire Auto — Man City',        rarity:'rare',   valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-BF',  num:'OF-BF',  name:'Bruno Fernandes',         sub:'On Fire Auto — Man United',      rarity:'epic',   valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-BM',  num:'OF-BM',  name:'Bryan Mbeumo',            sub:'On Fire Auto — Man United',      rarity:'legend', valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-ST',  num:'OF-ST',  name:'Sandro Tonali',           sub:'On Fire Auto — Newcastle',       rarity:'epic',   valuable:true, category:'On Fire Autographs' },
  { id:'pl-OF-BG',  num:'OF-BG',  name:'Bruno Guimaraes',         sub:'On Fire Auto — Newcastle',       rarity:'epic',   valuable:true, category:'On Fire Autographs' },

  // ── AUTO RELICS ───────────────────────────────────────────────────────────
  { id:'pl-AR-AC',  num:'AR-AC',  name:'Ashley Cole',             sub:'Auto Relic — Arsenal',           rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-MD',  num:'AR-MD',  name:'Max Dowman',              sub:'Auto Relic — Arsenal',           rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-CF',  num:'AR-CF',  name:'Cesc Fabregas',           sub:'Auto Relic — Arsenal',           rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-KS',  num:'AR-KS',  name:'Kevin Schade',            sub:'Auto Relic — Brentford',         rarity:'rare',   valuable:false,category:'Auto Relics' },
  { id:'pl-AR-DW',  num:'AR-DW',  name:'Danny Welbeck',           sub:'Auto Relic — Brighton',          rarity:'common', valuable:false,category:'Auto Relics' },
  { id:'pl-AR-MA',  num:'AR-MA',  name:'Marcel Desailly',         sub:'Auto Relic — Chelsea',           rarity:'rare',   valuable:false,category:'Auto Relics' },
  { id:'pl-AR-JT',  num:'AR-JT',  name:'John Terry',              sub:'Auto Relic — Chelsea',           rarity:'rare',   valuable:false,category:'Auto Relics' },
  { id:'pl-AR-FL',  num:'AR-FL',  name:'Frank Lampard',           sub:'Auto Relic — Chelsea',           rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-AG',  num:'AR-AG',  name:'Alejandro Garnacho',      sub:'Auto Relic — Chelsea',           rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-GZ',  num:'AR-GZ',  name:'Gianfranco Zola',         sub:'Auto Relic — Chelsea',           rarity:'rare',   valuable:false,category:'Auto Relics' },
  { id:'pl-AR-JK',  num:'AR-JK',  name:'Josh King',               sub:'Auto Relic — Fulham',            rarity:'rare',   valuable:false,category:'Auto Relics' },
  { id:'pl-AR-FT',  num:'AR-FT',  name:'Fernando Torres',         sub:'Auto Relic — Liverpool',         rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-LS',  num:'AR-LS',  name:'Luis Suarez',             sub:'Auto Relic — Liverpool',         rarity:'legend', valuable:true, category:'Auto Relics' },
  { id:'pl-AR-SA',  num:'AR-SA',  name:'Sergio Aguero',           sub:'Auto Relic — Man City',          rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-PS',  num:'AR-PS',  name:'Paul Scholes',            sub:'Auto Relic — Man United',        rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-RK',  num:'AR-RK',  name:'Roy Keane',               sub:'Auto Relic — Man United',        rarity:'legend', valuable:true, category:'Auto Relics' },
  { id:'pl-AR-JJ',  num:'AR-JJ',  name:'JJ Gabriel RC',           sub:'Auto Relic — Man United',        rarity:'rare',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-ST',  num:'AR-ST',  name:'Sandro Tonali',           sub:'Auto Relic — Newcastle',         rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-LWB', num:'AR-LWB', name:'Luca Williams-Barnett RC',sub:'Auto Relic — Tottenham',         rarity:'epic',   valuable:true, category:'Auto Relics' },
  { id:'pl-AR-SHM', num:'AR-SHM', name:'Son Heung-min',           sub:'Auto Relic — Tottenham',         rarity:'epic',   valuable:true, category:'Auto Relics' },

  // ── PREMIER CLASS AUTO RELICS ─────────────────────────────────────────────
  { id:'pl-PC-MD',  num:'PC-MD',  name:'Max Dowman',              sub:'Premier Class AR — Arsenal',     rarity:'epic',   valuable:true, category:'Premier Class Auto Relics' },
  { id:'pl-PC-BS',  num:'PC-BS',  name:'Bukayo Saka',             sub:'Premier Class AR — Arsenal',     rarity:'legend', valuable:true, category:'Premier Class Auto Relics' },
  { id:'pl-PC-CP',  num:'PC-CP',  name:'Cole Palmer',             sub:'Premier Class AR — Chelsea',     rarity:'legend', valuable:true, category:'Premier Class Auto Relics' },
  { id:'pl-PC-SG',  num:'PC-SG',  name:'Steven Gerrard',          sub:'Premier Class AR — Liverpool',   rarity:'epic',   valuable:true, category:'Premier Class Auto Relics' },
  { id:'pl-PC-MS',  num:'PC-MS',  name:'Mohamed Salah',           sub:'Premier Class AR — Liverpool',   rarity:'legend', valuable:true, category:'Premier Class Auto Relics' },
  { id:'pl-PC-EH',  num:'PC-EH',  name:'Erling Haaland',          sub:'Premier Class AR — Man City',    rarity:'legend', valuable:true, category:'Premier Class Auto Relics' },
  { id:'pl-PC-BF',  num:'PC-BF',  name:'Bruno Fernandes',         sub:'Premier Class AR — Man United',  rarity:'epic',   valuable:true, category:'Premier Class Auto Relics' },
  { id:'pl-PC-DB',  num:'PC-DB',  name:'David Beckham',           sub:'Premier Class AR — Man United',  rarity:'legend', valuable:true, category:'Premier Class Auto Relics' },
  { id:'pl-PC-JJ',  num:'PC-JJ',  name:'JJ Gabriel RC',           sub:'Premier Class AR — Man United',  rarity:'rare',   valuable:true, category:'Premier Class Auto Relics' },
  { id:'pl-PC-HK',  num:'PC-HK',  name:'Harry Kane',              sub:'Premier Class AR — Tottenham',   rarity:'legend', valuable:true, category:'Premier Class Auto Relics' },

  // ── BASE CARD RELICS ──────────────────────────────────────────────────────
  { id:'pl-BR-AC',  num:'BR-AC',  name:'Ashley Cole',             sub:'Base Relic — Arsenal',           rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-EN',  num:'BR-EN',  name:'Ethan Nwaneri',           sub:'Base Relic — Arsenal',           rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-VG',  num:'BR-VG',  name:'Viktor Gyokeres',         sub:'Base Relic — Arsenal',           rarity:'legend', valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-JM',  num:'BR-JM',  name:'John McGinn',             sub:'Base Relic — Aston Villa',       rarity:'common', valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-MR',  num:'BR-MR',  name:'Morgan Rogers',           sub:'Base Relic — Aston Villa',       rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-EV',  num:'BR-EV',  name:'Evanilson',               sub:'Base Relic — Bournemouth',       rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-KA',  num:'BR-KA',  name:'Kristoffer Ajer',         sub:'Base Relic — Brentford',         rarity:'common', valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-VJ',  num:'BR-VJ',  name:'Vitaly Janelt',           sub:'Base Relic — Brentford',         rarity:'common', valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-GR',  num:'BR-GR',  name:'Georginio Rutter',        sub:'Base Relic — Brighton',          rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-TW',  num:'BR-TW',  name:'Tom Watson',              sub:'Base Relic — Brighton',          rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-MG',  num:'BR-MG',  name:'Malo Gusto',              sub:'Base Relic — Chelsea',           rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-LCO', num:'BR-LCO', name:'Levi Colwill',            sub:'Base Relic — Chelsea',           rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-RD',  num:'BR-RD',  name:'Roberto Di Matteo',       sub:'Base Relic — Chelsea',           rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-DDR', num:'BR-DDR', name:'Didier Drogba',           sub:'Base Relic — Chelsea',           rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-JP',  num:'BR-JP',  name:'Joao Pedro',              sub:'Base Relic — Chelsea',           rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-EW',  num:'BR-EW',  name:'Estevao Willian',         sub:'Base Relic — Chelsea',           rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-RE',  num:'BR-RE',  name:'Romain Esse',             sub:'Base Relic — Crystal Palace',    rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-AW',  num:'BR-AW',  name:'Adam Wharton',            sub:'Base Relic — Crystal Palace',    rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-VM',  num:'BR-VM',  name:'Vitalii Mykolenko',       sub:'Base Relic — Everton',           rarity:'common', valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-DM',  num:'BR-DM',  name:'Dwight McNeil',           sub:'Base Relic — Everton',           rarity:'common', valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-AR',  num:'BR-AR',  name:'Antonee Robinson',        sub:'Base Relic — Fulham',            rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-JK',  num:'BR-JK',  name:'Josh King',               sub:'Base Relic — Fulham',            rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-GS',  num:'BR-GS',  name:'Gordon Strachan',         sub:'Base Relic — Leeds',             rarity:'common', valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-WG',  num:'BR-WG',  name:'Wilfried Gnonto',         sub:'Base Relic — Leeds',             rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-TAL', num:'BR-TAL', name:'Thiago Alcantara',        sub:'Base Relic — Liverpool',         rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-DS',  num:'BR-DS',  name:'Dominik Szoboszlai',      sub:'Base Relic — Liverpool',         rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-CG',  num:'BR-CG',  name:'Cody Gakpo',              sub:'Base Relic — Liverpool',         rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-MS',  num:'BR-MS',  name:'Mohamed Salah',           sub:'Base Relic — Liverpool',         rarity:'legend', valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-RF',  num:'BR-RF',  name:'Roberto Firmino',         sub:'Base Relic — Liverpool',         rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-RN',  num:'BR-RN',  name:'Rio Ngumoha',             sub:'Base Relic — Liverpool',         rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-RO',  num:'BR-RO',  name:'Rodri',                   sub:'Base Relic — Man City',          rarity:'legend', valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-KD',  num:'BR-KD',  name:'Kevin De Bruyne',         sub:'Base Relic — Man City',          rarity:'legend', valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-SAV', num:'BR-SAV', name:'Savinho',                 sub:'Base Relic — Man City',          rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-PF',  num:'BR-PF',  name:'Phil Foden',              sub:'Base Relic — Man City',          rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-SA',  num:'BR-SA',  name:'Sergio Aguero',           sub:'Base Relic — Man City',          rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-EH',  num:'BR-EH',  name:'Erling Haaland',          sub:'Base Relic — Man City',          rarity:'legend', valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-RV',  num:'BR-RV',  name:'Raphael Varane',          sub:'Base Relic — Man United',        rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-JS',  num:'BR-JS',  name:'Jaap Stam',               sub:'Base Relic — Man United',        rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-PSC', num:'BR-PSC', name:'Paul Scholes',            sub:'Base Relic — Man United',        rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-JJ',  num:'BR-JJ',  name:'JJ Gabriel RC',           sub:'Base Relic — Man United',        rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-BG',  num:'BR-BG',  name:'Bruno Guimaraes',         sub:'Base Relic — Newcastle',         rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-ST',  num:'BR-ST',  name:'Sandro Tonali',           sub:'Base Relic — Newcastle',         rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-LM',  num:'BR-LM',  name:'Lewis Miley',             sub:'Base Relic — Newcastle',         rarity:'rare',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-CH',  num:'BR-CH',  name:'Callum Hudson-Odoi',      sub:'Base Relic — Nottm Forest',      rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-CW',  num:'BR-CW',  name:'Chris Wood',              sub:'Base Relic — Nottm Forest',      rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-EM',  num:'BR-EM',  name:'Eliezer Mayenda',         sub:'Base Relic — Sunderland',        rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-LW',  num:'BR-LW',  name:'Luca Williams-Barnett RC',sub:'Base Relic — Tottenham',         rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-DSO', num:'BR-DSO', name:'Dominic Solanke',         sub:'Base Relic — Tottenham',         rarity:'rare',   valuable:false,category:'Base Card Relics' },
  { id:'pl-BR-LB',  num:'BR-LB',  name:'Lucas Bergvall',          sub:'Base Relic — Tottenham',         rarity:'epic',   valuable:true, category:'Base Card Relics' },
  { id:'pl-BR-SHM', num:'BR-SHM', name:'Son Heung-min',           sub:'Base Relic — Tottenham',         rarity:'epic',   valuable:true, category:'Base Card Relics' },

  // ══════════════════════════════════════════════════════════════════════════
  // INSERT SETS — sourced from full checklist data
  // ══════════════════════════════════════════════════════════════════════════

  // ── BEAST MODE (BM 1–25) ─────────────────────────────────────────────────
  { id:'pl-BM-1',  num:'BM 1',  name:'Max Dowman',            sub:'Beast Mode — Arsenal',             rarity:'rare',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-2',  num:'BM 2',  name:'Bukayo Saka',           sub:'Beast Mode — Arsenal',             rarity:'epic',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-3',  num:'BM 3',  name:'Ollie Watkins',         sub:'Beast Mode — Aston Villa',         rarity:'rare',   valuable:false, category:'Beast Mode' },
  { id:'pl-BM-4',  num:'BM 4',  name:'Brian Madjo RC',        sub:'Beast Mode — Aston Villa',         rarity:'rare',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-5',  num:'BM 5',  name:'Junior Kroupi',         sub:'Beast Mode — AFC Bournemouth',     rarity:'rare',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-6',  num:'BM 6',  name:'Igor Thiago',           sub:'Beast Mode — Brentford',           rarity:'rare',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-7',  num:'BM 7',  name:'Charalampos Kostoulas', sub:'Beast Mode — Brighton',            rarity:'rare',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-8',  num:'BM 8',  name:'Estevao Willian',       sub:'Beast Mode — Chelsea',             rarity:'epic',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-9',  num:'BM 9',  name:'Dastan Satpayev',       sub:'Beast Mode — Chelsea',             rarity:'rare',   valuable:false, category:'Beast Mode' },
  { id:'pl-BM-10', num:'BM 10', name:'Jorgen Strand Larsen',  sub:'Beast Mode — Crystal Palace',      rarity:'rare',   valuable:false, category:'Beast Mode' },
  { id:'pl-BM-11', num:'BM 11', name:'Iliman Ndiaye',         sub:'Beast Mode — Everton',             rarity:'rare',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-12', num:'BM 12', name:'Josh King',             sub:'Beast Mode — Fulham',              rarity:'rare',   valuable:false, category:'Beast Mode' },
  { id:'pl-BM-13', num:'BM 13', name:'Lukas Nmecha',          sub:'Beast Mode — Leeds United',        rarity:'rare',   valuable:false, category:'Beast Mode' },
  { id:'pl-BM-14', num:'BM 14', name:'Dominik Szoboszlai',    sub:'Beast Mode — Liverpool',           rarity:'rare',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-15', num:'BM 15', name:'Alexander Isak',        sub:'Beast Mode — Liverpool',           rarity:'epic',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-16', num:'BM 16', name:'Gianluigi Donnarumma',  sub:'Beast Mode — Manchester City',     rarity:'epic',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-17', num:'BM 17', name:'Erling Haaland',        sub:'Beast Mode — Manchester City',     rarity:'legend', valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-18', num:'BM 18', name:'Matheus Cunha',         sub:'Beast Mode — Manchester United',   rarity:'epic',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-19', num:'BM 19', name:'Benjamin Sesko',        sub:'Beast Mode — Manchester United',   rarity:'legend', valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-20', num:'BM 20', name:'Bruno Guimaraes',       sub:'Beast Mode — Newcastle United',    rarity:'epic',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-21', num:'BM 21', name:'Joelinton',             sub:'Beast Mode — Newcastle United',    rarity:'rare',   valuable:false, category:'Beast Mode' },
  { id:'pl-BM-22', num:'BM 22', name:'Morgan Gibbs-White',    sub:'Beast Mode — Nottingham Forest',   rarity:'rare',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-23', num:'BM 23', name:'Brian Brobbey',         sub:'Beast Mode — Sunderland',          rarity:'rare',   valuable:true,  category:'Beast Mode' },
  { id:'pl-BM-24', num:'BM 24', name:'Conor Gallagher',       sub:'Beast Mode — Tottenham Hotspur',   rarity:'rare',   valuable:false, category:'Beast Mode' },
  { id:'pl-BM-25', num:'BM 25', name:'Kasey McAteer',         sub:'Beast Mode — Ipswich Town',        rarity:'rare',   valuable:false, category:'Beast Mode' },

  // ── ULTRA BEAST MODE (UBM 1–10) ──────────────────────────────────────────
  { id:'pl-UBM-1',  num:'UBM 1',  name:'Bukayo Saka',           sub:'ULTRA Beast Mode — Arsenal',           rarity:'legend', valuable:true,  category:'ULTRA Beast Mode' },
  { id:'pl-UBM-2',  num:'UBM 2',  name:'Brian Madjo RC',        sub:'ULTRA Beast Mode — Aston Villa',       rarity:'epic',   valuable:true,  category:'ULTRA Beast Mode' },
  { id:'pl-UBM-3',  num:'UBM 3',  name:'Igor Thiago',           sub:'ULTRA Beast Mode — Brentford',         rarity:'epic',   valuable:true,  category:'ULTRA Beast Mode' },
  { id:'pl-UBM-4',  num:'UBM 4',  name:'Estevao Willian',       sub:'ULTRA Beast Mode — Chelsea',           rarity:'legend', valuable:true,  category:'ULTRA Beast Mode' },
  { id:'pl-UBM-5',  num:'UBM 5',  name:'Iliman Ndiaye',         sub:'ULTRA Beast Mode — Everton',           rarity:'epic',   valuable:true,  category:'ULTRA Beast Mode' },
  { id:'pl-UBM-6',  num:'UBM 6',  name:'Dominik Szoboszlai',    sub:'ULTRA Beast Mode — Liverpool',         rarity:'epic',   valuable:true,  category:'ULTRA Beast Mode' },
  { id:'pl-UBM-7',  num:'UBM 7',  name:'Gianluigi Donnarumma',  sub:'ULTRA Beast Mode — Manchester City',   rarity:'legend', valuable:true,  category:'ULTRA Beast Mode' },
  { id:'pl-UBM-8',  num:'UBM 8',  name:'Erling Haaland',        sub:'ULTRA Beast Mode — Manchester City',   rarity:'legend', valuable:true,  category:'ULTRA Beast Mode' },
  { id:'pl-UBM-9',  num:'UBM 9',  name:'Matheus Cunha',         sub:'ULTRA Beast Mode — Manchester United', rarity:'epic',   valuable:true,  category:'ULTRA Beast Mode' },
  { id:'pl-UBM-10', num:'UBM 10', name:'Bruno Guimaraes',       sub:'ULTRA Beast Mode — Newcastle United',  rarity:'epic',   valuable:true,  category:'ULTRA Beast Mode' },

  // ── NITRO BOOST (NB 1–25) ────────────────────────────────────────────────
  { id:'pl-NB-1',  num:'NB 1',  name:'Noni Madueke',          sub:'Nitro Boost — Arsenal',            rarity:'rare',   valuable:false, category:'Nitro Boost' },
  { id:'pl-NB-2',  num:'NB 2',  name:'Brando Bailey-Joseph RC',sub:'Nitro Boost — Arsenal',           rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-3',  num:'NB 3',  name:'Alysson RC',            sub:'Nitro Boost — Aston Villa',        rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-4',  num:'NB 4',  name:'Marcus Tavernier',      sub:'Nitro Boost — AFC Bournemouth',    rarity:'common', valuable:false, category:'Nitro Boost' },
  { id:'pl-NB-5',  num:'NB 5',  name:'Michael Kayode',        sub:'Nitro Boost — Brentford',          rarity:'rare',   valuable:false, category:'Nitro Boost' },
  { id:'pl-NB-6',  num:'NB 6',  name:'Yankuba Minteh',        sub:'Nitro Boost — Brighton',           rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-7',  num:'NB 7',  name:'Pedro Neto',            sub:'Nitro Boost — Chelsea',            rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-8',  num:'NB 8',  name:'Jamie Gittens',         sub:'Nitro Boost — Chelsea',            rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-9',  num:'NB 9',  name:'Daniel Munoz',          sub:'Nitro Boost — Crystal Palace',     rarity:'common', valuable:false, category:'Nitro Boost' },
  { id:'pl-NB-10', num:'NB 10', name:'Thierno Barry',         sub:'Nitro Boost — Everton',            rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-11', num:'NB 11', name:'Oscar Bobb',            sub:'Nitro Boost — Fulham',             rarity:'epic',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-12', num:'NB 12', name:'Wilfried Gnonto',       sub:'Nitro Boost — Leeds United',       rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-13', num:'NB 13', name:'Jeremie Frimpong',      sub:'Nitro Boost — Liverpool',          rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-14', num:'NB 14', name:'Rio Ngumoha',           sub:'Nitro Boost — Liverpool',          rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-15', num:'NB 15', name:'Savinho',               sub:'Nitro Boost — Manchester City',    rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-16', num:'NB 16', name:'Omar Marmoush',         sub:'Nitro Boost — Manchester City',    rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-17', num:'NB 17', name:'Amad',                  sub:'Nitro Boost — Manchester United',  rarity:'epic',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-18', num:'NB 18', name:'Jacob Murphy',          sub:'Nitro Boost — Newcastle United',   rarity:'common', valuable:false, category:'Nitro Boost' },
  { id:'pl-NB-19', num:'NB 19', name:'Anthony Elanga',        sub:'Nitro Boost — Newcastle United',   rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-20', num:'NB 20', name:'Omari Hutchinson',      sub:'Nitro Boost — Nottingham Forest',  rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-21', num:'NB 21', name:'Chemsdine Talbi',       sub:'Nitro Boost — Sunderland',         rarity:'rare',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-22', num:'NB 22', name:'Micky van de Ven',      sub:'Nitro Boost — Tottenham Hotspur',  rarity:'epic',   valuable:true,  category:'Nitro Boost' },
  { id:'pl-NB-23', num:'NB 23', name:'Ephron Mason-Clark RC', sub:'Nitro Boost — Coventry City',      rarity:'rare',   valuable:false, category:'Nitro Boost' },
  { id:'pl-NB-24', num:'NB 24', name:'Sindre Walle Egeli',    sub:'Nitro Boost — Ipswich Town',       rarity:'rare',   valuable:false, category:'Nitro Boost' },
  { id:'pl-NB-25', num:'NB 25', name:'Matt Crooks',           sub:'Nitro Boost — Hull City',          rarity:'common', valuable:false, category:'Nitro Boost' },

  // ── FLYING THE FLAG (FF 1–25) ────────────────────────────────────────────
  { id:'pl-FF-1',  num:'FF 1',  name:'William Saliba',        sub:'Flying The Flag — Arsenal',        rarity:'epic',   valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-2',  num:'FF 2',  name:'Martin Odegaard',       sub:'Flying The Flag — Arsenal',        rarity:'epic',   valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-3',  num:'FF 3',  name:'Amadou Onana',          sub:'Flying The Flag — Aston Villa',    rarity:'rare',   valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-4',  num:'FF 4',  name:'Emiliano Buendia',      sub:'Flying The Flag — Aston Villa',    rarity:'rare',   valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-5',  num:'FF 5',  name:'Amine Adli',            sub:'Flying The Flag — AFC Bournemouth',rarity:'common', valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-6',  num:'FF 6',  name:'Mikkel Damsgaard',      sub:'Flying The Flag — Brentford',      rarity:'rare',   valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-7',  num:'FF 7',  name:'Diego Gomez',           sub:'Flying The Flag — Brighton',       rarity:'rare',   valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-8',  num:'FF 8',  name:'Kaoru Mitoma',          sub:'Flying The Flag — Brighton',       rarity:'rare',   valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-9',  num:'FF 9',  name:'Moises Caicedo',        sub:'Flying The Flag — Chelsea',        rarity:'epic',   valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-10', num:'FF 10', name:'Joao Pedro',            sub:'Flying The Flag — Chelsea',        rarity:'rare',   valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-11', num:'FF 11', name:'Ismaila Sarr',          sub:'Flying The Flag — Crystal Palace', rarity:'rare',   valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-12', num:'FF 12', name:'Jorgen Strand Larsen',  sub:'Flying The Flag — Crystal Palace', rarity:'rare',   valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-13', num:'FF 13', name:'Beto',                  sub:'Flying The Flag — Everton',        rarity:'common', valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-14', num:'FF 14', name:'Antonee Robinson',      sub:'Flying The Flag — Fulham',         rarity:'rare',   valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-15', num:'FF 15', name:'Ethan Ampadu',          sub:'Flying The Flag — Leeds United',   rarity:'common', valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-16', num:'FF 16', name:'Virgil van Dijk',       sub:'Flying The Flag — Liverpool',      rarity:'epic',   valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-17', num:'FF 17', name:'Josko Gvardiol',        sub:'Flying The Flag — Manchester City',rarity:'rare',   valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-18', num:'FF 18', name:'Phil Foden',            sub:'Flying The Flag — Manchester City',rarity:'epic',   valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-19', num:'FF 19', name:'Diogo Dalot',           sub:'Flying The Flag — Manchester United',rarity:'common',valuable:false,category:'Flying The Flag' },
  { id:'pl-FF-20', num:'FF 20', name:'Malick Thiaw',          sub:'Flying The Flag — Newcastle United',rarity:'rare',  valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-21', num:'FF 21', name:'Sandro Tonali',         sub:'Flying The Flag — Newcastle United',rarity:'epic',  valuable:true,  category:'Flying The Flag' },
  { id:'pl-FF-22', num:'FF 22', name:'Chris Wood',            sub:'Flying The Flag — Nottingham Forest',rarity:'rare', valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-23', num:'FF 23', name:'Noah Sadiki',           sub:'Flying The Flag — Sunderland',     rarity:'rare',   valuable:false, category:'Flying The Flag' },
  { id:'pl-FF-24', num:'FF 24', name:'Pedro Porro',           sub:'Flying The Flag — Tottenham Hotspur',rarity:'common',valuable:false,category:'Flying The Flag' },
  { id:'pl-FF-25', num:'FF 25', name:'Brandon Thomas-Asante', sub:'Flying The Flag — Coventry City',  rarity:'common', valuable:false, category:'Flying The Flag' },

  // ── STARS OF THE PREMIER LEAGUE (SPL 1–25) — non-auto insert cards ───────
  { id:'pl-SPL-1',  num:'SPL 1',  name:'Jurrien Timber',       sub:'Stars of the PL — Arsenal',           rarity:'rare',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-2',  num:'SPL 2',  name:'Declan Rice',          sub:'Stars of the PL — Arsenal',           rarity:'epic',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-3',  num:'SPL 3',  name:'Youri Tielemans',      sub:'Stars of the PL — Aston Villa',       rarity:'rare',   valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-4',  num:'SPL 4',  name:'Justin Kluivert',      sub:'Stars of the PL — AFC Bournemouth',   rarity:'rare',   valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-5',  num:'SPL 5',  name:'Nathan Collins',       sub:'Stars of the PL — Brentford',         rarity:'common', valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-6',  num:'SPL 6',  name:'Pascal Gross',         sub:'Stars of the PL — Brighton',          rarity:'common', valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-7',  num:'SPL 7',  name:'Reece James',          sub:'Stars of the PL — Chelsea',           rarity:'rare',   valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-8',  num:'SPL 8',  name:'Enzo Fernandez',       sub:'Stars of the PL — Chelsea',           rarity:'rare',   valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-9',  num:'SPL 9',  name:'Adam Wharton',         sub:'Stars of the PL — Crystal Palace',    rarity:'rare',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-10', num:'SPL 10', name:'Jarrad Branthwaite',   sub:'Stars of the PL — Everton',           rarity:'rare',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-11', num:'SPL 11', name:'Emile Smith Rowe',     sub:'Stars of the PL — Fulham',            rarity:'epic',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-12', num:'SPL 12', name:'Brenden Aaronson',     sub:'Stars of the PL — Leeds United',      rarity:'rare',   valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-13', num:'SPL 13', name:'Ryan Gravenberch',     sub:'Stars of the PL — Liverpool',         rarity:'rare',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-14', num:'SPL 14', name:'Alexis Mac Allister',  sub:'Stars of the PL — Liverpool',         rarity:'rare',   valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-15', num:'SPL 15', name:'Marc Guehi',           sub:'Stars of the PL — Manchester City',   rarity:'rare',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-16', num:'SPL 16', name:'Rodri',                sub:'Stars of the PL — Manchester City',   rarity:'legend', valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-17', num:'SPL 17', name:'Kobbie Mainoo',        sub:'Stars of the PL — Manchester United', rarity:'epic',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-18', num:'SPL 18', name:'Bryan Mbeumo',         sub:'Stars of the PL — Manchester United', rarity:'legend', valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-19', num:'SPL 19', name:'Jacob Ramsey',         sub:'Stars of the PL — Newcastle United',  rarity:'rare',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-20', num:'SPL 20', name:'Yoane Wissa',          sub:'Stars of the PL — Newcastle United',  rarity:'rare',   valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-21', num:'SPL 21', name:'Elliot Anderson',      sub:'Stars of the PL — Nottingham Forest', rarity:'rare',   valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-22', num:'SPL 22', name:'Granit Xhaka',         sub:'Stars of the PL — Sunderland',        rarity:'rare',   valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-23', num:'SPL 23', name:'Xavi Simons',          sub:'Stars of the PL — Tottenham Hotspur', rarity:'legend', valuable:true,  category:'Stars of the PL' },
  { id:'pl-SPL-24', num:'SPL 24', name:'Jack Rudoni',          sub:'Stars of the PL — Coventry City',     rarity:'common', valuable:false, category:'Stars of the PL' },
  { id:'pl-SPL-25', num:'SPL 25', name:'Ellis Simms',          sub:'Stars of the PL — Coventry City',     rarity:'common', valuable:false, category:'Stars of the PL' },

  // ── RETRO THREADS (RT 1–25) ──────────────────────────────────────────────
  { id:'pl-RT-1',  num:'RT 1',  name:'Paul Merson',           sub:'Retro Threads — Arsenal',          rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-2',  num:'RT 2',  name:'Dwight Yorke',          sub:'Retro Threads — Aston Villa',      rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-3',  num:'RT 3',  name:'Dion Dublin',           sub:'Retro Threads — Aston Villa',      rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-4',  num:'RT 4',  name:'Glenn Murray',          sub:'Retro Threads — AFC Bournemouth',  rarity:'common', valuable:false, category:'Retro Threads' },
  { id:'pl-RT-5',  num:'RT 5',  name:'Mathias Jensen',        sub:'Retro Threads — Brentford',        rarity:'common', valuable:false, category:'Retro Threads' },
  { id:'pl-RT-6',  num:'RT 6',  name:'Danny Welbeck',         sub:'Retro Threads — Brighton',         rarity:'common', valuable:false, category:'Retro Threads' },
  { id:'pl-RT-7',  num:'RT 7',  name:'Marcel Desailly',       sub:'Retro Threads — Chelsea',          rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-8',  num:'RT 8',  name:'Ruud Gullit',           sub:'Retro Threads — Chelsea',          rarity:'epic',   valuable:true,  category:'Retro Threads' },
  { id:'pl-RT-9',  num:'RT 9',  name:'Gabor Kiraly',          sub:'Retro Threads — Crystal Palace',   rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-10', num:'RT 10', name:'Attilio Lombardo',      sub:'Retro Threads — Crystal Palace',   rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-11', num:'RT 11', name:'James Rodriguez',       sub:'Retro Threads — Everton',          rarity:'epic',   valuable:true,  category:'Retro Threads' },
  { id:'pl-RT-12', num:'RT 12', name:'Duncan Ferguson',       sub:'Retro Threads — Everton',          rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-13', num:'RT 13', name:'Bobby Zamora',          sub:'Retro Threads — Fulham',           rarity:'common', valuable:false, category:'Retro Threads' },
  { id:'pl-RT-14', num:'RT 14', name:'Dimitar Berbatov',      sub:'Retro Threads — Fulham',           rarity:'epic',   valuable:true,  category:'Retro Threads' },
  { id:'pl-RT-15', num:'RT 15', name:'Steve McManaman',       sub:'Retro Threads — Liverpool',        rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-16', num:'RT 16', name:'Robbie Fowler',         sub:'Retro Threads — Liverpool',        rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-17', num:'RT 17', name:'Samir Nasri',           sub:'Retro Threads — Manchester City',  rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-18', num:'RT 18', name:'Shaun Wright-Phillips', sub:'Retro Threads — Manchester City',  rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-19', num:'RT 19', name:'Craig Bellamy',         sub:'Retro Threads — Manchester City',  rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-20', num:'RT 20', name:'Gary Pallister',        sub:'Retro Threads — Manchester United',rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-21', num:'RT 21', name:'Ryan Giggs',            sub:'Retro Threads — Manchester United',rarity:'epic',   valuable:true,  category:'Retro Threads' },
  { id:'pl-RT-22', num:'RT 22', name:'Federico Macheda',      sub:'Retro Threads — Manchester United',rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-23', num:'RT 23', name:'Les Ferdinand',         sub:'Retro Threads — Newcastle United', rarity:'rare',   valuable:false, category:'Retro Threads' },
  { id:'pl-RT-24', num:'RT 24', name:'Claudio Reyna',         sub:'Retro Threads — Sunderland',       rarity:'common', valuable:false, category:'Retro Threads' },
  { id:'pl-RT-25', num:'RT 25', name:'Djibril Cisse',         sub:'Retro Threads — Sunderland',       rarity:'common', valuable:false, category:'Retro Threads' },

  // ── 8-BIT BALLERS (8B 1–20) ──────────────────────────────────────────────
  { id:'pl-8B-1',  num:'8B 1',  name:'Santi Cazorla',         sub:'8-Bit Ballers — Arsenal',          rarity:'rare',   valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-2',  num:'8B 2',  name:'Olivier Giroud',        sub:'8-Bit Ballers — Arsenal',          rarity:'rare',   valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-3',  num:'8B 3',  name:'Darren Bent',           sub:'8-Bit Ballers — Aston Villa',      rarity:'common', valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-4',  num:'8B 4',  name:'Simon Francis',         sub:'8-Bit Ballers — AFC Bournemouth',  rarity:'common', valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-5',  num:'8B 5',  name:'James Milner',          sub:'8-Bit Ballers — Brighton',         rarity:'rare',   valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-6',  num:'8B 6',  name:'Petr Cech',             sub:'8-Bit Ballers — Chelsea',          rarity:'epic',   valuable:true,  category:'8-Bit Ballers' },
  { id:'pl-8B-7',  num:'8B 7',  name:'David Luiz',            sub:'8-Bit Ballers — Chelsea',          rarity:'rare',   valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-8',  num:'8B 8',  name:'Daniel Sturridge',      sub:'8-Bit Ballers — Chelsea',          rarity:'rare',   valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-9',  num:'8B 9',  name:'Yannick Bolasie',       sub:'8-Bit Ballers — Crystal Palace',   rarity:'common', valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-10', num:'8B 10', name:'Yakubu',                sub:'8-Bit Ballers — Everton',          rarity:'common', valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-11', num:'8B 11', name:'Clint Dempsey',         sub:'8-Bit Ballers — Fulham',           rarity:'rare',   valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-12', num:'8B 12', name:'Steven Gerrard',        sub:'8-Bit Ballers — Liverpool',        rarity:'epic',   valuable:true,  category:'8-Bit Ballers' },
  { id:'pl-8B-13', num:'8B 13', name:'Fernando Torres',       sub:'8-Bit Ballers — Liverpool',        rarity:'epic',   valuable:true,  category:'8-Bit Ballers' },
  { id:'pl-8B-14', num:'8B 14', name:'David Silva',           sub:'8-Bit Ballers — Manchester City',  rarity:'epic',   valuable:true,  category:'8-Bit Ballers' },
  { id:'pl-8B-15', num:'8B 15', name:'Yaya Toure',            sub:'8-Bit Ballers — Manchester City',  rarity:'epic',   valuable:true,  category:'8-Bit Ballers' },
  { id:'pl-8B-16', num:'8B 16', name:'Nani',                  sub:'8-Bit Ballers — Manchester United',rarity:'rare',   valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-17', num:'8B 17', name:'Kevin Nolan',           sub:'8-Bit Ballers — Newcastle United', rarity:'common', valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-18', num:'8B 18', name:'Papiss Cisse',          sub:'8-Bit Ballers — Newcastle United', rarity:'rare',   valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-19', num:'8B 19', name:'Obafemi Martins',       sub:'8-Bit Ballers — Newcastle United', rarity:'rare',   valuable:false, category:'8-Bit Ballers' },
  { id:'pl-8B-20', num:'8B 20', name:"John O'Shea",           sub:'8-Bit Ballers — Sunderland',       rarity:'common', valuable:false, category:'8-Bit Ballers' },

  // ── REMEMBER THE NAME (RTN 1–5) ──────────────────────────────────────────
  { id:'pl-RTN-1', num:'RTN 1', name:'Didier Drogba',         sub:'Remember The Name — Chelsea',         rarity:'legend', valuable:true, category:'Remember The Name' },
  { id:'pl-RTN-2', num:'RTN 2', name:'Rio Ngumoha',           sub:'Remember The Name — Liverpool',       rarity:'epic',   valuable:true, category:'Remember The Name' },
  { id:'pl-RTN-3', num:'RTN 3', name:'Mario Balotelli',       sub:'Remember The Name — Manchester City', rarity:'epic',   valuable:true, category:'Remember The Name' },
  { id:'pl-RTN-4', num:'RTN 4', name:'Sergio Aguero',         sub:'Remember The Name — Manchester City', rarity:'legend', valuable:true, category:'Remember The Name' },
  { id:'pl-RTN-5', num:'RTN 5', name:'Wayne Rooney',          sub:'Remember The Name — Manchester United',rarity:'legend',valuable:true, category:'Remember The Name' },

  // ── CHROME CLASSICS INSERTS (CC 1–25) — non-auto insert cards ────────────
  { id:'pl-CC-1',  num:'CC 1',  name:'Ian Wright',            sub:'Chrome Classics — Arsenal',        rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-2',  num:'CC 2',  name:'Juan Pablo Angel',      sub:'Chrome Classics — Aston Villa',    rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-3',  num:'CC 3',  name:'Gabriel Agbonlahor',    sub:'Chrome Classics — Aston Villa',    rarity:'common', valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-4',  num:'CC 4',  name:'Jermain Defoe',         sub:'Chrome Classics — AFC Bournemouth',rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-5',  num:'CC 5',  name:'Danny Welbeck',         sub:'Chrome Classics — Brighton',       rarity:'common', valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-6',  num:'CC 6',  name:'Thiago Silva',          sub:'Chrome Classics — Chelsea',        rarity:'epic',   valuable:true,  category:'Chrome Classics' },
  { id:'pl-CC-7',  num:'CC 7',  name:'Eden Hazard',           sub:'Chrome Classics — Chelsea',        rarity:'legend', valuable:true,  category:'Chrome Classics' },
  { id:'pl-CC-8',  num:'CC 8',  name:'Eidur Gudjohnsen',      sub:'Chrome Classics — Chelsea',        rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-9',  num:'CC 9',  name:'Iain Dowie',            sub:'Chrome Classics — Crystal Palace', rarity:'common', valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-10', num:'CC 10', name:'Wilfried Zaha',         sub:'Chrome Classics — Crystal Palace', rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-11', num:'CC 11', name:'Duncan Ferguson',       sub:'Chrome Classics — Everton',        rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-12', num:'CC 12', name:'Steed Malbranque',      sub:'Chrome Classics — Fulham',         rarity:'common', valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-13', num:'CC 13', name:'Brian McBride',         sub:'Chrome Classics — Fulham',         rarity:'common', valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-14', num:'CC 14', name:'John Barnes',           sub:'Chrome Classics — Liverpool',      rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-15', num:'CC 15', name:'Roberto Firmino',       sub:'Chrome Classics — Liverpool',      rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-16', num:'CC 16', name:'Nicolas Anelka',        sub:'Chrome Classics — Liverpool',      rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-17', num:'CC 17', name:'Pablo Zabaleta',        sub:'Chrome Classics — Manchester City',rarity:'common', valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-18', num:'CC 18', name:'Yaya Toure',            sub:'Chrome Classics — Manchester City',rarity:'epic',   valuable:true,  category:'Chrome Classics' },
  { id:'pl-CC-19', num:'CC 19', name:'Riyad Mahrez',          sub:'Chrome Classics — Manchester City',rarity:'rare',   valuable:false, category:'Chrome Classics' },
  { id:'pl-CC-20', num:'CC 20', name:'Roy Keane',             sub:'Chrome Classics — Manchester United',rarity:'legend',valuable:true, category:'Chrome Classics' },
  { id:'pl-CC-21', num:'CC 21', name:'Robin van Persie',      sub:'Chrome Classics — Manchester United',rarity:'epic',  valuable:true, category:'Chrome Classics' },
  { id:'pl-CC-22', num:'CC 22', name:'Alexis Sanchez',        sub:'Chrome Classics — Manchester United',rarity:'rare',  valuable:false,category:'Chrome Classics' },
  { id:'pl-CC-23', num:'CC 23', name:'Alan Shearer',          sub:'Chrome Classics — Newcastle United',rarity:'legend', valuable:true, category:'Chrome Classics' },
  { id:'pl-CC-24', num:'CC 24', name:'Patrick Kluivert',      sub:'Chrome Classics — Newcastle United',rarity:'rare',   valuable:false,category:'Chrome Classics' },
  { id:'pl-CC-25', num:'CC 25', name:'Kevin Phillips',        sub:'Chrome Classics — Sunderland',     rarity:'common', valuable:false, category:'Chrome Classics' },

  // ── GOLD LION (GL 1–20) ───────────────────────────────────────────────────
  { id:'pl-GL-1',  num:'GL 1',  name:'Declan Rice',           sub:'Gold Lion — Arsenal',              rarity:'epic',   valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-2',  num:'GL 2',  name:'Max Dowman',            sub:'Gold Lion — Arsenal',              rarity:'epic',   valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-3',  num:'GL 3',  name:'Thierry Henry',         sub:'Gold Lion — Arsenal',              rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-4',  num:'GL 4',  name:'Morgan Rogers',         sub:'Gold Lion — Aston Villa',          rarity:'rare',   valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-5',  num:'GL 5',  name:'Rayan RC',              sub:'Gold Lion — AFC Bournemouth',      rarity:'epic',   valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-6',  num:'GL 6',  name:'Igor Thiago',           sub:'Gold Lion — Brentford',            rarity:'rare',   valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-7',  num:'GL 7',  name:'Cole Palmer',           sub:'Gold Lion — Chelsea',              rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-8',  num:'GL 8',  name:'Estevao Willian',       sub:'Gold Lion — Chelsea',              rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-9',  num:'GL 9',  name:'Wayne Rooney',          sub:'Gold Lion — Everton',              rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-10', num:'GL 10', name:'Steven Gerrard',        sub:'Gold Lion — Liverpool',            rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-11', num:'GL 11', name:'Florian Wirtz',         sub:'Gold Lion — Liverpool',            rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-12', num:'GL 12', name:'Kevin De Bruyne',       sub:'Gold Lion — Manchester City',      rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-13', num:'GL 13', name:'Antoine Semenyo',       sub:'Gold Lion — Manchester City',      rarity:'rare',   valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-14', num:'GL 14', name:'Erling Haaland',        sub:'Gold Lion — Manchester City',      rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-15', num:'GL 15', name:'Bruno Fernandes',       sub:'Gold Lion — Manchester United',    rarity:'epic',   valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-16', num:'GL 16', name:'David Beckham',         sub:'Gold Lion — Manchester United',    rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-17', num:'GL 17', name:'JJ Gabriel RC',         sub:'Gold Lion — Manchester United',    rarity:'epic',   valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-18', num:'GL 18', name:'Bruno Guimaraes',       sub:'Gold Lion — Newcastle United',     rarity:'epic',   valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-19', num:'GL 19', name:'Alan Shearer',          sub:'Gold Lion — Newcastle United',     rarity:'legend', valuable:true,  category:'Gold Lion' },
  { id:'pl-GL-20', num:'GL 20', name:'Harry Kane',            sub:'Gold Lion — Tottenham Hotspur',    rarity:'legend', valuable:true,  category:'Gold Lion' },

  // ── TRUE GOLD LION (SGL 1–20) — 1/1 parallel of Gold Lion ───────────────
  { id:'pl-SGL-1',  num:'SGL 1',  name:'Declan Rice',         sub:'True Gold Lion — Arsenal',            rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-2',  num:'SGL 2',  name:'Max Dowman',          sub:'True Gold Lion — Arsenal',            rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-3',  num:'SGL 3',  name:'Thierry Henry',       sub:'True Gold Lion — Arsenal',            rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-4',  num:'SGL 4',  name:'Morgan Rogers',       sub:'True Gold Lion — Aston Villa',        rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-5',  num:'SGL 5',  name:'Rayan RC',            sub:'True Gold Lion — AFC Bournemouth',    rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-6',  num:'SGL 6',  name:'Igor Thiago',         sub:'True Gold Lion — Brentford',          rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-7',  num:'SGL 7',  name:'Cole Palmer',         sub:'True Gold Lion — Chelsea',            rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-8',  num:'SGL 8',  name:'Estevao Willian',     sub:'True Gold Lion — Chelsea',            rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-9',  num:'SGL 9',  name:'Wayne Rooney',        sub:'True Gold Lion — Everton',            rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-10', num:'SGL 10', name:'Steven Gerrard',      sub:'True Gold Lion — Liverpool',          rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-11', num:'SGL 11', name:'Florian Wirtz',       sub:'True Gold Lion — Liverpool',          rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-12', num:'SGL 12', name:'Kevin De Bruyne',     sub:'True Gold Lion — Manchester City',    rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-13', num:'SGL 13', name:'Antoine Semenyo',     sub:'True Gold Lion — Manchester City',    rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-14', num:'SGL 14', name:'Erling Haaland',      sub:'True Gold Lion — Manchester City',    rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-15', num:'SGL 15', name:'Bruno Fernandes',     sub:'True Gold Lion — Manchester United',  rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-16', num:'SGL 16', name:'David Beckham',       sub:'True Gold Lion — Manchester United',  rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-17', num:'SGL 17', name:'JJ Gabriel RC',       sub:'True Gold Lion — Manchester United',  rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-18', num:'SGL 18', name:'Bruno Guimaraes',     sub:'True Gold Lion — Newcastle United',   rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-19', num:'SGL 19', name:'Alan Shearer',        sub:'True Gold Lion — Newcastle United',   rarity:'legend', valuable:true, category:'True Gold Lion' },
  { id:'pl-SGL-20', num:'SGL 20', name:'Harry Kane',          sub:'True Gold Lion — Tottenham Hotspur',  rarity:'legend', valuable:true, category:'True Gold Lion' },

  // ── PERFECT 10 INSERTS (PT 1–10) — non-auto insert cards ─────────────────
  { id:'pl-PT-1',  num:'PT 1',  name:'Eberechi Eze',          sub:'Perfect 10 — Arsenal',             rarity:'epic',   valuable:true, category:'Perfect 10' },
  { id:'pl-PT-2',  num:'PT 2',  name:'Cole Palmer',           sub:'Perfect 10 — Chelsea',             rarity:'legend', valuable:true, category:'Perfect 10' },
  { id:'pl-PT-3',  num:'PT 3',  name:'Eden Hazard',           sub:'Perfect 10 — Chelsea',             rarity:'legend', valuable:true, category:'Perfect 10' },
  { id:'pl-PT-4',  num:'PT 4',  name:'Iliman Ndiaye',         sub:'Perfect 10 — Everton',             rarity:'rare',   valuable:true, category:'Perfect 10' },
  { id:'pl-PT-5',  num:'PT 5',  name:'Philippe Coutinho',     sub:'Perfect 10 — Liverpool',           rarity:'rare',   valuable:false,category:'Perfect 10' },
  { id:'pl-PT-6',  num:'PT 6',  name:'Rayan Cherki',          sub:'Perfect 10 — Manchester City',     rarity:'epic',   valuable:true, category:'Perfect 10' },
  { id:'pl-PT-7',  num:'PT 7',  name:'Sergio Aguero',         sub:'Perfect 10 — Manchester City',     rarity:'epic',   valuable:true, category:'Perfect 10' },
  { id:'pl-PT-8',  num:'PT 8',  name:'Matheus Cunha',         sub:'Perfect 10 — Manchester United',   rarity:'epic',   valuable:true, category:'Perfect 10' },
  { id:'pl-PT-9',  num:'PT 9',  name:'Wayne Rooney',          sub:'Perfect 10 — Manchester United',   rarity:'legend', valuable:true, category:'Perfect 10' },
  { id:'pl-PT-10', num:'PT 10', name:'Harry Kane',            sub:'Perfect 10 — Tottenham Hotspur',   rarity:'legend', valuable:true, category:'Perfect 10' },

  // ── VIBES INSERTS (VI 1–10) — non-auto insert cards ──────────────────────
  { id:'pl-VI-1',  num:'VI 1',  name:'Viktor Gyokeres',       sub:'Vibes — Arsenal',                  rarity:'legend', valuable:true, category:'Vibes' },
  { id:'pl-VI-2',  num:'VI 2',  name:'Ollie Watkins',         sub:'Vibes — Aston Villa',              rarity:'epic',   valuable:true, category:'Vibes' },
  { id:'pl-VI-3',  num:'VI 3',  name:'Charalampos Kostoulas', sub:'Vibes — Brighton',                 rarity:'rare',   valuable:true, category:'Vibes' },
  { id:'pl-VI-4',  num:'VI 4',  name:'Marc Cucurella',        sub:'Vibes — Chelsea',                  rarity:'common', valuable:false,category:'Vibes' },
  { id:'pl-VI-5',  num:'VI 5',  name:'Jean-Philippe Mateta',  sub:'Vibes — Crystal Palace',           rarity:'rare',   valuable:false,category:'Vibes' },
  { id:'pl-VI-6',  num:'VI 6',  name:'Alex Iwobi',            sub:'Vibes — Fulham',                   rarity:'rare',   valuable:false,category:'Vibes' },
  { id:'pl-VI-7',  num:'VI 7',  name:'Hugo Ekitike',          sub:'Vibes — Liverpool',                rarity:'epic',   valuable:true, category:'Vibes' },
  { id:'pl-VI-8',  num:'VI 8',  name:'Erling Haaland',        sub:'Vibes — Manchester City',          rarity:'legend', valuable:true, category:'Vibes' },
  { id:'pl-VI-9',  num:'VI 9',  name:'Patrick Dorgu',         sub:'Vibes — Manchester United',        rarity:'rare',   valuable:true, category:'Vibes' },
  { id:'pl-VI-10', num:'VI 10', name:'Chemsdine Talbi',       sub:'Vibes — Sunderland',               rarity:'rare',   valuable:true, category:'Vibes' },

  // ── MAYHEM INSERTS (MA 1–20) — non-auto insert cards ─────────────────────
  { id:'pl-MA-1',  num:'MA 1',  name:'Gabriel Magalhaes',     sub:'Mayhem — Arsenal',                 rarity:'rare',   valuable:false,category:'Mayhem' },
  { id:'pl-MA-2',  num:'MA 2',  name:'Gabriel Martinelli',    sub:'Mayhem — Arsenal',                 rarity:'rare',   valuable:false,category:'Mayhem' },
  { id:'pl-MA-3',  num:'MA 3',  name:'Evanilson',             sub:'Mayhem — AFC Bournemouth',         rarity:'rare',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-4',  num:'MA 4',  name:'Dango Ouattara',        sub:'Mayhem — Brentford',               rarity:'rare',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-5',  num:'MA 5',  name:'Yasin Ayari',           sub:'Mayhem — Brighton',                rarity:'rare',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-6',  num:'MA 6',  name:'Jesse Derry RC',        sub:'Mayhem — Chelsea',                 rarity:'rare',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-7',  num:'MA 7',  name:'Alejandro Garnacho',    sub:'Mayhem — Chelsea',                 rarity:'epic',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-8',  num:'MA 8',  name:'Yeremy Pino',           sub:'Mayhem — Crystal Palace',          rarity:'rare',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-9',  num:'MA 9',  name:'Kevin',                 sub:'Mayhem — Fulham',                  rarity:'common', valuable:false,category:'Mayhem' },
  { id:'pl-MA-10', num:'MA 10', name:'Noah Okafor',           sub:'Mayhem — Leeds United',            rarity:'rare',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-11', num:'MA 11', name:'Jeremie Frimpong',      sub:'Mayhem — Liverpool',               rarity:'rare',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-12', num:'MA 12', name:'Dominik Szoboszlai',    sub:'Mayhem — Liverpool',               rarity:'rare',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-13', num:'MA 13', name:'Jeremy Doku',           sub:'Mayhem — Manchester City',         rarity:'epic',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-14', num:'MA 14', name:'Godwill Kukonki RC',    sub:'Mayhem — Manchester United',       rarity:'rare',   valuable:false,category:'Mayhem' },
  { id:'pl-MA-15', num:'MA 15', name:'Benjamin Sesko',        sub:'Mayhem — Manchester United',       rarity:'legend', valuable:true, category:'Mayhem' },
  { id:'pl-MA-16', num:'MA 16', name:'Harvey Barnes',         sub:'Mayhem — Newcastle United',        rarity:'common', valuable:false,category:'Mayhem' },
  { id:'pl-MA-17', num:'MA 17', name:'Igor Jesus',            sub:'Mayhem — Nottingham Forest',       rarity:'rare',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-18', num:'MA 18', name:'Enzo Le Fee',           sub:'Mayhem — Sunderland',              rarity:'rare',   valuable:false,category:'Mayhem' },
  { id:'pl-MA-19', num:'MA 19', name:'Lucas Bergvall',        sub:'Mayhem — Tottenham Hotspur',       rarity:'epic',   valuable:true, category:'Mayhem' },
  { id:'pl-MA-20', num:'MA 20', name:'Haji Wright',           sub:'Mayhem — Coventry City',           rarity:'common', valuable:false,category:'Mayhem' },

  // ── ON FIRE INSERTS (OF 1–15) — non-auto insert cards ────────────────────
  { id:'pl-OF-1',  num:'OF 1',  name:'Tijjani Reijnders',     sub:'On Fire — Manchester City',        rarity:'epic',   valuable:true, category:'On Fire' },
  { id:'pl-OF-2',  num:'OF 2',  name:'Moises Caicedo',        sub:'On Fire — Chelsea',                rarity:'epic',   valuable:true, category:'On Fire' },
  { id:'pl-OF-3',  num:'OF 3',  name:'Sandro Tonali',         sub:'On Fire — Newcastle United',       rarity:'epic',   valuable:true, category:'On Fire' },
  { id:'pl-OF-4',  num:'OF 4',  name:'Kevin Schade',          sub:'On Fire — Brentford',              rarity:'rare',   valuable:false,category:'On Fire' },
  { id:'pl-OF-5',  num:'OF 5',  name:'Gabriel Martinelli',    sub:'On Fire — Arsenal',                rarity:'rare',   valuable:false,category:'On Fire' },
  { id:'pl-OF-6',  num:'OF 6',  name:'Bryan Mbeumo',          sub:'On Fire — Manchester United',      rarity:'legend', valuable:true, category:'On Fire' },
  { id:'pl-OF-7',  num:'OF 7',  name:'Bukayo Saka',           sub:'On Fire — Arsenal',                rarity:'legend', valuable:true, category:'On Fire' },
  { id:'pl-OF-8',  num:'OF 8',  name:'Evanilson',             sub:'On Fire — AFC Bournemouth',        rarity:'rare',   valuable:true, category:'On Fire' },
  { id:'pl-OF-9',  num:'OF 9',  name:'Joao Pedro',            sub:'On Fire — Chelsea',                rarity:'rare',   valuable:false,category:'On Fire' },
  { id:'pl-OF-10', num:'OF 10', name:'Ezri Konsa',            sub:'On Fire — Aston Villa',            rarity:'rare',   valuable:false,category:'On Fire' },
  { id:'pl-OF-11', num:'OF 11', name:'Bruno Fernandes',       sub:'On Fire — Manchester United',      rarity:'epic',   valuable:true, category:'On Fire' },
  { id:'pl-OF-12', num:'OF 12', name:'Antoine Semenyo',       sub:'On Fire — Manchester City',        rarity:'rare',   valuable:true, category:'On Fire' },
  { id:'pl-OF-13', num:'OF 13', name:'Noah Okafor',           sub:'On Fire — Leeds United',           rarity:'rare',   valuable:true, category:'On Fire' },
  { id:'pl-OF-14', num:'OF 14', name:'Virgil van Dijk',       sub:'On Fire — Liverpool',              rarity:'epic',   valuable:true, category:'On Fire' },
  { id:'pl-OF-15', num:'OF 15', name:'Bruno Guimaraes',       sub:'On Fire — Newcastle United',       rarity:'epic',   valuable:true, category:'On Fire' },

  // ── GOLDEN BOOT INSERTS (GB 1–9) — non-auto insert cards ─────────────────
  { id:'pl-GB-I1', num:'GB 1',  name:'Thierry Henry',         sub:'Golden Boot — Arsenal',            rarity:'legend', valuable:true, category:'Golden Boot' },
  { id:'pl-GB-I2', num:'GB 2',  name:'Didier Drogba',         sub:'Golden Boot — Chelsea',            rarity:'legend', valuable:true, category:'Golden Boot' },
  { id:'pl-GB-I3', num:'GB 3',  name:'Mohamed Salah',         sub:'Golden Boot — Liverpool',          rarity:'legend', valuable:true, category:'Golden Boot' },
  { id:'pl-GB-I4', num:'GB 4',  name:'Luis Suarez',           sub:'Golden Boot — Liverpool',          rarity:'epic',   valuable:true, category:'Golden Boot' },
  { id:'pl-GB-I5', num:'GB 5',  name:'Carlos Tevez',          sub:'Golden Boot — Manchester City',    rarity:'epic',   valuable:true, category:'Golden Boot' },
  { id:'pl-GB-I6', num:'GB 6',  name:'Erling Haaland',        sub:'Golden Boot — Manchester City',    rarity:'legend', valuable:true, category:'Golden Boot' },
  { id:'pl-GB-I7', num:'GB 7',  name:'Robin van Persie',      sub:'Golden Boot — Manchester United',  rarity:'epic',   valuable:true, category:'Golden Boot' },
  { id:'pl-GB-I8', num:'GB 8',  name:'Alan Shearer',          sub:'Golden Boot — Newcastle United',   rarity:'legend', valuable:true, category:'Golden Boot' },
  { id:'pl-GB-I9', num:'GB 9',  name:'Kevin Phillips',        sub:'Golden Boot — Sunderland',         rarity:'rare',   valuable:false,category:'Golden Boot' },

  // ── BLACK EDGE INSERTS (BE 1–50) — non-auto insert cards ─────────────────
  { id:'pl-BE-I1',  num:'BE 1',  name:'Eberechi Eze',         sub:'Black Edge — Arsenal',             rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I2',  num:'BE 2',  name:'Max Dowman',           sub:'Black Edge — Arsenal',             rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I3',  num:'BE 3',  name:'Gabriel Martinelli',   sub:'Black Edge — Arsenal',             rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I4',  num:'BE 4',  name:'Morgan Rogers',        sub:'Black Edge — Aston Villa',         rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I5',  num:'BE 5',  name:'Tammy Abraham',        sub:'Black Edge — Aston Villa',         rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I6',  num:'BE 6',  name:'Gabriel Agbonlahor',   sub:'Black Edge — Aston Villa',         rarity:'common', valuable:false,category:'Black Edge' },
  { id:'pl-BE-I7',  num:'BE 7',  name:'Evanilson',            sub:'Black Edge — AFC Bournemouth',     rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I8',  num:'BE 8',  name:'Rayan RC',             sub:'Black Edge — AFC Bournemouth',     rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I9',  num:'BE 9',  name:'Igor Thiago',          sub:'Black Edge — Brentford',           rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I10', num:'BE 10', name:'Kaye Furo RC',         sub:'Black Edge — Brentford',           rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I11', num:'BE 11', name:'Kaoru Mitoma',         sub:'Black Edge — Brighton',            rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I12', num:'BE 12', name:'Georginio Rutter',     sub:'Black Edge — Brighton',            rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I13', num:'BE 13', name:'Estevao Willian',      sub:'Black Edge — Chelsea',             rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'pl-BE-I14', num:'BE 14', name:'Joao Pedro',           sub:'Black Edge — Chelsea',             rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I15', num:'BE 15', name:'Gianfranco Zola',      sub:'Black Edge — Chelsea',             rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I16', num:'BE 16', name:'Diego Costa',          sub:'Black Edge — Chelsea',             rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I17', num:'BE 17', name:'Ismaila Sarr',         sub:'Black Edge — Crystal Palace',      rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I18', num:'BE 18', name:'Brennan Johnson',      sub:'Black Edge — Crystal Palace',      rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I19', num:'BE 19', name:'Yannick Bolasie',      sub:'Black Edge — Crystal Palace',      rarity:'common', valuable:false,category:'Black Edge' },
  { id:'pl-BE-I20', num:'BE 20', name:'Jean-Philippe Mateta', sub:'Black Edge — Crystal Palace',      rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I21', num:'BE 21', name:'Paul Gascoigne',       sub:'Black Edge — Everton',             rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I22', num:'BE 22', name:'Thierno Barry',        sub:'Black Edge — Everton',             rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I23', num:'BE 23', name:'Iliman Ndiaye',        sub:'Black Edge — Everton',             rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I24', num:'BE 24', name:'Kevin',                sub:'Black Edge — Fulham',              rarity:'common', valuable:false,category:'Black Edge' },
  { id:'pl-BE-I25', num:'BE 25', name:'Noah Okafor',          sub:'Black Edge — Leeds United',        rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I26', num:'BE 26', name:'Dominic Calvert-Lewin',sub:'Black Edge — Leeds United',        rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I27', num:'BE 27', name:'Jeremy Jacquet RC',    sub:'Black Edge — Liverpool',           rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I28', num:'BE 28', name:'Philippe Coutinho',    sub:'Black Edge — Liverpool',           rarity:'rare',   valuable:false,category:'Black Edge' },
  { id:'pl-BE-I29', num:'BE 29', name:'Luis Suarez',          sub:'Black Edge — Liverpool',           rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'pl-BE-I30', num:'BE 30', name:'Alexander Isak',       sub:'Black Edge — Liverpool',           rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'pl-BE-I31', num:'BE 31', name:'Hugo Ekitike',         sub:'Black Edge — Liverpool',           rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I32', num:'BE 32', name:'Kevin De Bruyne',      sub:'Black Edge — Manchester City',     rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'pl-BE-I33', num:'BE 33', name:'Phil Foden',           sub:'Black Edge — Manchester City',     rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I34', num:'BE 34', name:'Antoine Semenyo',      sub:'Black Edge — Manchester City',     rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I35', num:'BE 35', name:'David Beckham',        sub:'Black Edge — Manchester United',   rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'pl-BE-I36', num:'BE 36', name:'Bruno Fernandes',      sub:'Black Edge — Manchester United',   rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I37', num:'BE 37', name:'Amad',                 sub:'Black Edge — Manchester United',   rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I38', num:'BE 38', name:'Zlatan Ibrahimovic',   sub:'Black Edge — Manchester United',   rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'pl-BE-I39', num:'BE 39', name:'JJ Gabriel RC',        sub:'Black Edge — Manchester United',   rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I40', num:'BE 40', name:'Bruno Guimaraes',      sub:'Black Edge — Newcastle United',    rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I41', num:'BE 41', name:'Nick Woltemade',       sub:'Black Edge — Newcastle United',    rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I42', num:'BE 42', name:'David Ginola',         sub:'Black Edge — Newcastle United',    rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I43', num:'BE 43', name:'Igor Jesus',           sub:'Black Edge — Nottingham Forest',   rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I44', num:'BE 44', name:'Chris Rigg',           sub:'Black Edge — Sunderland',          rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I45', num:'BE 45', name:'Wilson Isidor',        sub:'Black Edge — Sunderland',          rarity:'common', valuable:false,category:'Black Edge' },
  { id:'pl-BE-I46', num:'BE 46', name:'Edgar Davids',         sub:'Black Edge — Tottenham Hotspur',   rarity:'epic',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I47', num:'BE 47', name:'Mohammed Kudus',       sub:'Black Edge — Tottenham Hotspur',   rarity:'rare',   valuable:true, category:'Black Edge' },
  { id:'pl-BE-I48', num:'BE 48', name:'Harry Kane',           sub:'Black Edge — Tottenham Hotspur',   rarity:'legend', valuable:true, category:'Black Edge' },
  { id:'pl-BE-I49', num:'BE 49', name:'Ellis Simms',          sub:'Black Edge — Coventry City',       rarity:'common', valuable:false,category:'Black Edge' },
  { id:'pl-BE-I50', num:'BE 50', name:'Tatsuhiro Sakamoto',   sub:'Black Edge — Coventry City',       rarity:'rare',   valuable:false,category:'Black Edge' },

  // ── QUASAR (QU 1–15) ─────────────────────────────────────────────────────
  { id:'pl-QU-1',  num:'QU 1',  name:'Eberechi Eze',          sub:'Quasar — Arsenal',                 rarity:'epic',   valuable:true, category:'Quasar' },
  { id:'pl-QU-2',  num:'QU 2',  name:'Alex Toth RC',          sub:'Quasar — AFC Bournemouth',         rarity:'rare',   valuable:false,category:'Quasar' },
  { id:'pl-QU-3',  num:'QU 3',  name:'Dango Ouattara',        sub:'Quasar — Brentford',               rarity:'rare',   valuable:true, category:'Quasar' },
  { id:'pl-QU-4',  num:'QU 4',  name:'Carlos Baleba',         sub:'Quasar — Brighton',                rarity:'rare',   valuable:false,category:'Quasar' },
  { id:'pl-QU-5',  num:'QU 5',  name:'Pedro Neto',            sub:'Quasar — Chelsea',                 rarity:'rare',   valuable:true, category:'Quasar' },
  { id:'pl-QU-6',  num:'QU 6',  name:'Jean-Philippe Mateta',  sub:'Quasar — Crystal Palace',          rarity:'rare',   valuable:false,category:'Quasar' },
  { id:'pl-QU-7',  num:'QU 7',  name:'Kiernan Dewsbury-Hall', sub:'Quasar — Everton',                 rarity:'rare',   valuable:false,category:'Quasar' },
  { id:'pl-QU-8',  num:'QU 8',  name:'Oscar Bobb',            sub:'Quasar — Fulham',                  rarity:'epic',   valuable:true, category:'Quasar' },
  { id:'pl-QU-9',  num:'QU 9',  name:'Noah Okafor',           sub:'Quasar — Leeds United',            rarity:'rare',   valuable:true, category:'Quasar' },
  { id:'pl-QU-10', num:'QU 10', name:'Rio Ngumoha',           sub:'Quasar — Liverpool',               rarity:'rare',   valuable:true, category:'Quasar' },
  { id:'pl-QU-11', num:'QU 11', name:'Charlie Gray RC',       sub:'Quasar — Manchester City',         rarity:'rare',   valuable:false,category:'Quasar' },
  { id:'pl-QU-12', num:'QU 12', name:'Tijjani Reijnders',     sub:'Quasar — Manchester City',         rarity:'epic',   valuable:true, category:'Quasar' },
  { id:'pl-QU-13', num:'QU 13', name:'Bryan Mbeumo',          sub:'Quasar — Manchester United',       rarity:'legend', valuable:true, category:'Quasar' },
  { id:'pl-QU-14', num:'QU 14', name:'Sean Neave RC',         sub:'Quasar — Newcastle United',        rarity:'rare',   valuable:false,category:'Quasar' },
  { id:'pl-QU-15', num:'QU 15', name:'Dan Ndoye',             sub:'Quasar — Nottingham Forest',       rarity:'rare',   valuable:true, category:'Quasar' },

  // ── BILLBOARD MATERIAL (BB 1–25) ──────────────────────────────────────────
  { id:'pl-BB-1',  num:'BB 1',  name:'Martin Odegaard',       sub:'Billboard Material — Arsenal',            rarity:'epic',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-2',  num:'BB 2',  name:'Max Dowman',            sub:'Billboard Material — Arsenal',            rarity:'epic',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-3',  num:'BB 3',  name:'Morgan Rogers',         sub:'Billboard Material — Aston Villa',        rarity:'rare',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-4',  num:'BB 4',  name:'Rayan RC',              sub:'Billboard Material — AFC Bournemouth',    rarity:'epic',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-5',  num:'BB 5',  name:'Igor Thiago',           sub:'Billboard Material — Brentford',          rarity:'rare',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-6',  num:'BB 6',  name:'Danny Welbeck',         sub:'Billboard Material — Brighton',           rarity:'common', valuable:false,category:'Billboard Material' },
  { id:'pl-BB-7',  num:'BB 7',  name:'Ryan Kavuma-McQueen RC',sub:'Billboard Material — Chelsea',            rarity:'rare',   valuable:false,category:'Billboard Material' },
  { id:'pl-BB-8',  num:'BB 8',  name:'Estevao Willian',       sub:'Billboard Material — Chelsea',            rarity:'legend', valuable:true, category:'Billboard Material' },
  { id:'pl-BB-9',  num:'BB 9',  name:'Joel Drakes-Thomas RC', sub:'Billboard Material — Crystal Palace',     rarity:'rare',   valuable:false,category:'Billboard Material' },
  { id:'pl-BB-10', num:'BB 10', name:'Charly Alcaraz',        sub:'Billboard Material — Everton',            rarity:'rare',   valuable:false,category:'Billboard Material' },
  { id:'pl-BB-11', num:'BB 11', name:'Kevin',                 sub:'Billboard Material — Fulham',             rarity:'common', valuable:false,category:'Billboard Material' },
  { id:'pl-BB-12', num:'BB 12', name:'Brenden Aaronson',      sub:'Billboard Material — Leeds United',       rarity:'rare',   valuable:false,category:'Billboard Material' },
  { id:'pl-BB-13', num:'BB 13', name:'Florian Wirtz',         sub:'Billboard Material — Liverpool',          rarity:'legend', valuable:true, category:'Billboard Material' },
  { id:'pl-BB-14', num:'BB 14', name:'Alexander Isak',        sub:'Billboard Material — Liverpool',          rarity:'legend', valuable:true, category:'Billboard Material' },
  { id:'pl-BB-15', num:'BB 15', name:'Phil Foden',            sub:'Billboard Material — Manchester City',    rarity:'epic',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-16', num:'BB 16', name:'Jeremy Doku',           sub:'Billboard Material — Manchester City',    rarity:'epic',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-17', num:'BB 17', name:'Benjamin Sesko',        sub:'Billboard Material — Manchester United',  rarity:'legend', valuable:true, category:'Billboard Material' },
  { id:'pl-BB-18', num:'BB 18', name:'Amad',                  sub:'Billboard Material — Manchester United',  rarity:'epic',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-19', num:'BB 19', name:'Bruno Guimaraes',       sub:'Billboard Material — Newcastle United',   rarity:'epic',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-20', num:'BB 20', name:'Omari Hutchinson',      sub:'Billboard Material — Nottingham Forest',  rarity:'rare',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-21', num:'BB 21', name:'Eliezer Mayenda',       sub:'Billboard Material — Sunderland',         rarity:'rare',   valuable:false,category:'Billboard Material' },
  { id:'pl-BB-22', num:'BB 22', name:'Mohammed Kudus',        sub:'Billboard Material — Tottenham Hotspur',  rarity:'rare',   valuable:true, category:'Billboard Material' },
  { id:'pl-BB-23', num:'BB 23', name:'Jack Rudoni RC',        sub:'Billboard Material — Coventry City',      rarity:'rare',   valuable:false,category:'Billboard Material' },
  { id:'pl-BB-24', num:'BB 24', name:'George Hirst',          sub:'Billboard Material — Ipswich Town',       rarity:'common', valuable:false,category:'Billboard Material' },
  { id:'pl-BB-25', num:'BB 25', name:'Oli McBurnie',          sub:'Billboard Material — Hull City',          rarity:'common', valuable:false,category:'Billboard Material' },

  // ── CARPE DIEM (CD 1–10) ─────────────────────────────────────────────────
  { id:'pl-CD-1',  num:'CD 1',  name:'Viktor Gyokeres',       sub:'Carpe Diem — Arsenal',             rarity:'legend', valuable:true, category:'Carpe Diem' },
  { id:'pl-CD-2',  num:'CD 2',  name:'Thierry Henry',         sub:'Carpe Diem — Arsenal',             rarity:'legend', valuable:true, category:'Carpe Diem' },
  { id:'pl-CD-3',  num:'CD 3',  name:'Morgan Rogers',         sub:'Carpe Diem — Aston Villa',         rarity:'rare',   valuable:true, category:'Carpe Diem' },
  { id:'pl-CD-4',  num:'CD 4',  name:'Ollie Watkins',         sub:'Carpe Diem — Aston Villa',         rarity:'epic',   valuable:true, category:'Carpe Diem' },
  { id:'pl-CD-5',  num:'CD 5',  name:'Frank Lampard',         sub:'Carpe Diem — Chelsea',             rarity:'epic',   valuable:true, category:'Carpe Diem' },
  { id:'pl-CD-6',  num:'CD 6',  name:'Joao Pedro',            sub:'Carpe Diem — Chelsea',             rarity:'rare',   valuable:false,category:'Carpe Diem' },
  { id:'pl-CD-7',  num:'CD 7',  name:'Erling Haaland',        sub:'Carpe Diem — Manchester City',     rarity:'legend', valuable:true, category:'Carpe Diem' },
  { id:'pl-CD-8',  num:'CD 8',  name:'Bruno Fernandes',       sub:'Carpe Diem — Manchester United',   rarity:'epic',   valuable:true, category:'Carpe Diem' },
  { id:'pl-CD-9',  num:'CD 9',  name:'Wayne Rooney',          sub:'Carpe Diem — Manchester United',   rarity:'legend', valuable:true, category:'Carpe Diem' },
  { id:'pl-CD-10', num:'CD 10', name:'Granit Xhaka',          sub:'Carpe Diem — Sunderland',          rarity:'rare',   valuable:false,category:'Carpe Diem' },

  // ── HOME PITCH (HP 1–20) ─────────────────────────────────────────────────
  { id:'pl-HP-1',  num:'HP 1',  name:'Max Dowman',            sub:'Home Pitch — Arsenal',             rarity:'epic',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-2',  num:'HP 2',  name:'Bukayo Saka',           sub:'Home Pitch — Arsenal',             rarity:'legend', valuable:true, category:'Home Pitch' },
  { id:'pl-HP-3',  num:'HP 3',  name:'Ollie Watkins',         sub:'Home Pitch — Aston Villa',         rarity:'epic',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-4',  num:'HP 4',  name:'Tyler Adams',           sub:'Home Pitch — AFC Bournemouth',     rarity:'rare',   valuable:false,category:'Home Pitch' },
  { id:'pl-HP-5',  num:'HP 5',  name:'Kevin Schade',          sub:'Home Pitch — Brentford',           rarity:'rare',   valuable:false,category:'Home Pitch' },
  { id:'pl-HP-6',  num:'HP 6',  name:'Yankuba Minteh',        sub:'Home Pitch — Brighton',            rarity:'rare',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-7',  num:'HP 7',  name:'Eden Hazard',           sub:'Home Pitch — Chelsea',             rarity:'legend', valuable:true, category:'Home Pitch' },
  { id:'pl-HP-8',  num:'HP 8',  name:'Brennan Johnson',       sub:'Home Pitch — Crystal Palace',      rarity:'rare',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-9',  num:'HP 9',  name:'Iliman Ndiaye',         sub:'Home Pitch — Everton',             rarity:'rare',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-10', num:'HP 10', name:'Alex Iwobi',            sub:'Home Pitch — Fulham',              rarity:'rare',   valuable:false,category:'Home Pitch' },
  { id:'pl-HP-11', num:'HP 11', name:'Brenden Aaronson',      sub:'Home Pitch — Leeds United',        rarity:'rare',   valuable:false,category:'Home Pitch' },
  { id:'pl-HP-12', num:'HP 12', name:'Roberto Firmino',       sub:'Home Pitch — Liverpool',           rarity:'rare',   valuable:false,category:'Home Pitch' },
  { id:'pl-HP-13', num:'HP 13', name:'Rayan Cherki',          sub:'Home Pitch — Manchester City',     rarity:'epic',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-14', num:'HP 14', name:'Mario Balotelli',       sub:'Home Pitch — Manchester City',     rarity:'epic',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-15', num:'HP 15', name:'Bryan Mbeumo',          sub:'Home Pitch — Manchester United',   rarity:'legend', valuable:true, category:'Home Pitch' },
  { id:'pl-HP-16', num:'HP 16', name:'Edinson Cavani',        sub:'Home Pitch — Manchester United',   rarity:'epic',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-17', num:'HP 17', name:'Sandro Tonali',         sub:'Home Pitch — Newcastle United',    rarity:'epic',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-18', num:'HP 18', name:'Igor Jesus',            sub:'Home Pitch — Nottingham Forest',   rarity:'rare',   valuable:true, category:'Home Pitch' },
  { id:'pl-HP-19', num:'HP 19', name:'Granit Xhaka',          sub:'Home Pitch — Sunderland',          rarity:'rare',   valuable:false,category:'Home Pitch' },
  { id:'pl-HP-20', num:'HP 20', name:'Lucas Bergvall',        sub:'Home Pitch — Tottenham Hotspur',   rarity:'epic',   valuable:true, category:'Home Pitch' },

  // ── PERFECT STORM (PS 1–20) ───────────────────────────────────────────────
  { id:'pl-PS-1',  num:'PS 1',  name:'Declan Rice',           sub:'Perfect Storm — Arsenal',          rarity:'epic',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-2',  num:'PS 2',  name:'Brian Madjo RC',        sub:'Perfect Storm — Aston Villa',      rarity:'epic',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-3',  num:'PS 3',  name:'Junior Kroupi',         sub:'Perfect Storm — AFC Bournemouth',  rarity:'rare',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-4',  num:'PS 4',  name:'Kaye Furo RC',          sub:'Perfect Storm — Brentford',        rarity:'epic',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-5',  num:'PS 5',  name:'Diego Gomez',           sub:'Perfect Storm — Brighton',         rarity:'rare',   valuable:false,category:'Perfect Storm' },
  { id:'pl-PS-6',  num:'PS 6',  name:'Cole Palmer',           sub:'Perfect Storm — Chelsea',          rarity:'legend', valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-7',  num:'PS 7',  name:'Yeremy Pino',           sub:'Perfect Storm — Crystal Palace',   rarity:'rare',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-8',  num:'PS 8',  name:'Tyler Dibling',         sub:'Perfect Storm — Everton',          rarity:'epic',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-9',  num:'PS 9',  name:'Oscar Bobb',            sub:'Perfect Storm — Fulham',           rarity:'epic',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-10', num:'PS 10', name:'Dominic Calvert-Lewin', sub:'Perfect Storm — Leeds United',     rarity:'rare',   valuable:false,category:'Perfect Storm' },
  { id:'pl-PS-11', num:'PS 11', name:'Florian Wirtz',         sub:'Perfect Storm — Liverpool',        rarity:'legend', valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-12', num:'PS 12', name:'Fernando Torres',       sub:'Perfect Storm — Liverpool',        rarity:'epic',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-13', num:'PS 13', name:'Antoine Semenyo',       sub:'Perfect Storm — Manchester City',  rarity:'rare',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-14', num:'PS 14', name:'Matheus Cunha',         sub:'Perfect Storm — Manchester United',rarity:'epic',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-15', num:'PS 15', name:'Eric Cantona',          sub:'Perfect Storm — Manchester United',rarity:'legend', valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-16', num:'PS 16', name:'Nick Woltemade',        sub:'Perfect Storm — Newcastle United', rarity:'rare',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-17', num:'PS 17', name:'Morgan Gibbs-White',    sub:'Perfect Storm — Nottingham Forest',rarity:'rare',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-18', num:'PS 18', name:'Brian Brobbey',         sub:'Perfect Storm — Sunderland',       rarity:'rare',   valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-19', num:'PS 19', name:'Xavi Simons',           sub:'Perfect Storm — Tottenham Hotspur',rarity:'legend', valuable:true, category:'Perfect Storm' },
  { id:'pl-PS-20', num:'PS 20', name:'Haji Wright RC',        sub:'Perfect Storm — Coventry City',    rarity:'rare',   valuable:false,category:'Perfect Storm' },

  // ── THE RISE (TR 1–10) ────────────────────────────────────────────────────
  { id:'pl-TR-1',  num:'TR 1',  name:'Thierry Henry',         sub:'The Rise — Arsenal',               rarity:'legend', valuable:true, category:'The Rise' },
  { id:'pl-TR-2',  num:'TR 2',  name:'Frank Lampard',         sub:'The Rise — Chelsea',               rarity:'legend', valuable:true, category:'The Rise' },
  { id:'pl-TR-3',  num:'TR 3',  name:'Clint Dempsey',         sub:'The Rise — Fulham',                rarity:'rare',   valuable:false,category:'The Rise' },
  { id:'pl-TR-4',  num:'TR 4',  name:'Steven Gerrard',        sub:'The Rise — Liverpool',             rarity:'legend', valuable:true, category:'The Rise' },
  { id:'pl-TR-5',  num:'TR 5',  name:'Mohamed Salah',         sub:'The Rise — Liverpool',             rarity:'legend', valuable:true, category:'The Rise' },
  { id:'pl-TR-6',  num:'TR 6',  name:'Kevin De Bruyne',       sub:'The Rise — Manchester City',       rarity:'legend', valuable:true, category:'The Rise' },
  { id:'pl-TR-7',  num:'TR 7',  name:'David Beckham',         sub:'The Rise — Manchester United',     rarity:'legend', valuable:true, category:'The Rise' },
  { id:'pl-TR-8',  num:'TR 8',  name:'Wayne Rooney',          sub:'The Rise — Manchester United',     rarity:'legend', valuable:true, category:'The Rise' },
  { id:'pl-TR-9',  num:'TR 9',  name:'Nolberto Solano',       sub:'The Rise — Newcastle United',      rarity:'rare',   valuable:false,category:'The Rise' },
  { id:'pl-TR-10', num:'TR 10', name:'Gareth Bale',           sub:'The Rise — Tottenham Hotspur',     rarity:'legend', valuable:true, category:'The Rise' },

  // ── ALL KINGS (AK 1–10) ───────────────────────────────────────────────────
  { id:'pl-AK-1',  num:'AK 1',  name:'Bukayo Saka',           sub:'All Kings — Arsenal',              rarity:'legend', valuable:true, category:'All Kings' },
  { id:'pl-AK-2',  num:'AK 2',  name:'Morgan Rogers',         sub:'All Kings — Aston Villa',          rarity:'rare',   valuable:true, category:'All Kings' },
  { id:'pl-AK-3',  num:'AK 3',  name:'Igor Thiago',           sub:'All Kings — Brentford',            rarity:'rare',   valuable:true, category:'All Kings' },
  { id:'pl-AK-4',  num:'AK 4',  name:'Estevao Willian',       sub:'All Kings — Chelsea',              rarity:'legend', valuable:true, category:'All Kings' },
  { id:'pl-AK-5',  num:'AK 5',  name:'Josh King',             sub:'All Kings — Fulham',               rarity:'rare',   valuable:false,category:'All Kings' },
  { id:'pl-AK-6',  num:'AK 6',  name:'Jeremy Jacquet RC',     sub:'All Kings — Liverpool',            rarity:'epic',   valuable:true, category:'All Kings' },
  { id:'pl-AK-7',  num:'AK 7',  name:'Erling Haaland',        sub:'All Kings — Manchester City',      rarity:'legend', valuable:true, category:'All Kings' },
  { id:'pl-AK-8',  num:'AK 8',  name:'Bruno Fernandes',       sub:'All Kings — Manchester United',    rarity:'epic',   valuable:true, category:'All Kings' },
  { id:'pl-AK-9',  num:'AK 9',  name:'JJ Gabriel RC',         sub:'All Kings — Manchester United',    rarity:'epic',   valuable:true, category:'All Kings' },
  { id:'pl-AK-10', num:'AK 10', name:'Morgan Gibbs-White',    sub:'All Kings — Nottingham Forest',    rarity:'rare',   valuable:true, category:'All Kings' },

  // ── DIAMOND ROOKIES (DR 1–5) ──────────────────────────────────────────────
  { id:'pl-DR-1',  num:'DR 1',  name:'Brian Madjo RC',        sub:'Diamond Rookies — Aston Villa',    rarity:'legend', valuable:true, category:'Diamond Rookies' },
  { id:'pl-DR-2',  num:'DR 2',  name:'Rayan RC',              sub:'Diamond Rookies — AFC Bournemouth',rarity:'legend', valuable:true, category:'Diamond Rookies' },
  { id:'pl-DR-3',  num:'DR 3',  name:'Jesse Derry RC',        sub:'Diamond Rookies — Chelsea',        rarity:'legend', valuable:true, category:'Diamond Rookies' },
  { id:'pl-DR-4',  num:'DR 4',  name:'Jeremy Jacquet RC',     sub:'Diamond Rookies — Liverpool',      rarity:'legend', valuable:true, category:'Diamond Rookies' },
  { id:'pl-DR-5',  num:'DR 5',  name:'JJ Gabriel RC',         sub:'Diamond Rookies — Manchester United',rarity:'legend',valuable:true, category:'Diamond Rookies' },
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
  // If dashboard is open, refresh it too
  if (currentCollection === 'dashboard') {
    renderDashboard(currentDashScope || 'both');
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

// ─── Dashboard ───────────────────────────────────────────────────────────────
let currentDashScope = 'both'; // 'both' | 'f1' | 'pl'

function setDashScope(scope) {
  currentDashScope = scope;
  document.querySelectorAll('.dash-sub').forEach(b => {
    b.classList.toggle('active', b.dataset.ds === scope);
  });
  renderDashboard(scope);
}

function renderDashboard(scope) {
  // ── Build working card+owned sets based on scope ──────────────────────────
  let cards = [];
  if (scope === 'both') {
    cards = [
      ...F1_CARDS.map(c => ({ ...c, _col: 'f1', _owned: ownedF1.has(c.id), _spares: sparesF1[c.id] || 0 })),
      ...PL_CARDS.map(c => ({ ...c, _col: 'pl', _owned: ownedPL.has(c.id), _spares: sparesPL[c.id] || 0 })),
    ];
  } else if (scope === 'f1') {
    cards = F1_CARDS.map(c => ({ ...c, _col: 'f1', _owned: ownedF1.has(c.id), _spares: sparesF1[c.id] || 0 }));
  } else {
    cards = PL_CARDS.map(c => ({ ...c, _col: 'pl', _owned: ownedPL.has(c.id), _spares: sparesPL[c.id] || 0 }));
  }

  const total       = cards.length;
  const owned       = cards.filter(c => c._owned).length;
  const needed      = total - owned;
  const pct         = total ? Math.round(owned / total * 100) : 0;
  const valuableOwned = cards.filter(c => c._owned && c.valuable).length;
  const sparesTotal = cards.reduce((s, c) => s + c._spares, 0);

  // ── Stat strip ────────────────────────────────────────────────────────────
  document.getElementById('dash-stat-strip').innerHTML = `
    <div class="dash-stat ds-green">
      <div class="dash-stat-val">${owned}</div>
      <div class="dash-stat-lbl">Owned</div>
    </div>
    <div class="dash-stat">
      <div class="dash-stat-val">${needed}</div>
      <div class="dash-stat-lbl">Still Needed</div>
    </div>
    <div class="dash-stat ds-blue">
      <div class="dash-stat-val">${pct}%</div>
      <div class="dash-stat-lbl">Complete</div>
    </div>
    <div class="dash-stat ds-gold">
      <div class="dash-stat-val">${valuableOwned}</div>
      <div class="dash-stat-lbl">Valuables Owned</div>
    </div>
    <div class="dash-stat ds-purple">
      <div class="dash-stat-val">${sparesTotal}</div>
      <div class="dash-stat-lbl">Total Spares</div>
    </div>
  `;

  // ── Team / category breakdown ─────────────────────────────────────────────
  // Define the canonical PL clubs (categories that are actual teams, not insert sets)
  const PL_CLUBS = new Set([
    'Arsenal','Aston Villa','AFC Bournemouth','Brentford','Brighton',
    'Chelsea','Coventry City','Crystal Palace','Everton','Fulham',
    'Hull City','Ipswich Town','Leeds United','Liverpool',
    'Manchester City','Manchester United','Newcastle United',
    'Nottingham Forest','Sunderland','Tottenham Hotspur',
  ]);
  const F1_TEAMS = new Set([
    'Base Set','Constructors',
  ]);

  // Build per-team stats — only base set categories (no insert sets)
  const teamMap = {};
  cards.forEach(c => {
    // Only count cards whose category is a team/club name (not an insert)
    const isTeam = (c._col === 'pl' && PL_CLUBS.has(c.category)) ||
                   (c._col === 'f1' && (c.category === 'Base Set' || c.category === 'Constructors'));
    if (!isTeam) return;
    if (!teamMap[c.category]) teamMap[c.category] = { total: 0, owned: 0, col: c._col };
    teamMap[c.category].total++;
    if (c._owned) teamMap[c.category].owned++;
  });

  const teams = Object.entries(teamMap)
    .map(([name, d]) => ({ name, ...d, pct: d.total ? Math.round(d.owned / d.total * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct || a.name.localeCompare(b.name));

  const teamListEl = document.getElementById('dash-team-list');
  const teamSubEl  = document.getElementById('dash-teams-sub');
  teamSubEl.textContent = `${teams.filter(t => t.pct === 100).length} of ${teams.length} complete`;
  teamListEl.innerHTML = teams.map(t => `
    <div class="dash-team-row${t.pct === 100 ? ' complete' : ''}">
      <div class="dash-team-header">
        <span class="dash-team-name">${escHtml(t.name)}</span>
        <span class="dash-team-count"><span class="owned-n">${t.owned}</span> / ${t.total} · ${t.pct}%</span>
      </div>
      <div class="dash-bar-track">
        <div class="dash-bar-fill ${t.col === 'pl' ? 'pl-bar' : 'f1-bar'}" style="width:${t.pct}%"></div>
      </div>
    </div>
  `).join('');

  // ── Set-type breakdown (base categories) ─────────────────────────────────
  const BASE_SET_CATS = new Set([...PL_CLUBS, 'Base Set', 'Constructors', 'Future Stars']);
  const setMap = {};
  cards.forEach(c => {
    if (BASE_SET_CATS.has(c.category)) return; // skip — in team section
    if (!setMap[c.category]) setMap[c.category] = { total: 0, owned: 0 };
    setMap[c.category].total++;
    if (c._owned) setMap[c.category].owned++;
  });

  const sets = Object.entries(setMap)
    .map(([name, d]) => ({ name, ...d, pct: d.total ? Math.round(d.owned / d.total * 100) : 0 }))
    .sort((a, b) => b.owned - a.owned || a.name.localeCompare(b.name));

  // Split: autograph/relic sets vs insert sets
  const AUTO_RELIC_KEYWORDS = ['Auto', 'Relic', 'Autograph', 'Chrome Classics', 'Marks of Excellence'];
  const isAutoRelic = (name) => AUTO_RELIC_KEYWORDS.some(k => name.includes(k));

  const autoSets   = sets.filter(s => isAutoRelic(s.name));
  const insertSets = sets.filter(s => !isAutoRelic(s.name));

  const renderSetRows = (arr, barClass) => arr.map(s => `
    <div class="dash-set-row">
      <div class="dash-set-header">
        <span class="dash-set-name">${escHtml(s.name)}</span>
        <span class="dash-set-count"><span class="owned-n">${s.owned}</span>/${s.total} · ${s.pct}%</span>
      </div>
      <div class="dash-bar-track">
        <div class="dash-bar-fill ${barClass}" style="width:${s.pct}%"></div>
      </div>
    </div>
  `).join('');

  document.getElementById('dash-set-list').innerHTML =
    autoSets.length ? renderSetRows(autoSets, 'set-bar') : '<div class="dash-empty">No auto/relic cards yet</div>';

  document.getElementById('dash-insert-list').innerHTML =
    insertSets.length ? renderSetRows(insertSets, 'insert-bar') : '<div class="dash-empty">No insert cards yet</div>';

  // ── Rarity breakdown ──────────────────────────────────────────────────────
  const rarities = ['common', 'rare', 'epic', 'legend'];
  const rarityMap = {};
  rarities.forEach(r => { rarityMap[r] = { total: 0, owned: 0 }; });
  cards.forEach(c => {
    if (rarityMap[c.rarity]) {
      rarityMap[c.rarity].total++;
      if (c._owned) rarityMap[c.rarity].owned++;
    }
  });

  document.getElementById('dash-rarity-grid').innerHTML = rarities.map(r => {
    const d   = rarityMap[r];
    const pct = d.total ? Math.round(d.owned / d.total * 100) : 0;
    const label = r.charAt(0).toUpperCase() + r.slice(1);
    return `
      <div class="dash-rarity-card rarity-${r}">
        <div class="dash-rarity-top">
          <span class="dash-rarity-name">${label}</span>
          <span class="dash-rarity-owned">${d.owned}</span>
        </div>
        <div class="dash-rarity-total">of ${d.total} · ${pct}%</div>
        <div class="dash-bar-track">
          <div class="dash-bar-fill ${r}-bar" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // ── Spares list ───────────────────────────────────────────────────────────
  const spareCards = cards
    .filter(c => c._spares > 0)
    .sort((a, b) => b._spares - a._spares);

  const sparesSubEl = document.getElementById('dash-spares-sub');
  sparesSubEl.textContent = spareCards.length
    ? `${spareCards.length} card${spareCards.length !== 1 ? 's' : ''} · ${sparesTotal} total spares`
    : '';

  document.getElementById('dash-spares-list').innerHTML = spareCards.length
    ? spareCards.map(c => `
        <div class="dash-spare-row" onclick="switchCollection('${c._col}')">
          <div class="dash-spare-info">
            <div class="dash-spare-name">#${escHtml(c.num)} ${escHtml(c.name)}</div>
            <div class="dash-spare-sub">${escHtml(c.sub)}</div>
          </div>
          <div class="dash-spare-badge">🔄 ×${c._spares}</div>
        </div>
      `).join('')
    : '<div class="dash-empty">No spares logged yet</div>';

  // ── Almost complete — teams + insert sets with ≥50% and at least 1 missing ─
  const almostItems = [
    ...teams.filter(t => t.pct >= 50 && t.pct < 100),
    ...sets.filter(s => s.pct >= 50 && s.pct < 100),
  ]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 12);

  document.getElementById('dash-needs-list').innerHTML = almostItems.length
    ? almostItems.map(item => {
        const missing = item.total - item.owned;
        return `
          <div class="dash-need-row">
            <div class="dash-need-header">
              <span class="dash-need-name">${escHtml(item.name)}</span>
              <span class="dash-need-label">${missing} card${missing !== 1 ? 's' : ''} needed</span>
            </div>
            <div class="dash-bar-track">
              <div class="dash-bar-fill need-bar" style="width:${item.pct}%"></div>
            </div>
          </div>
        `;
      }).join('')
    : '<div class="dash-empty">Nothing 50%+ yet — start collecting!</div>';
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
  const team     = document.getElementById('filter-team').value;
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
    if (team !== 'all'      && c.category !== team)    return false;
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
  const dashboardView = document.getElementById('dashboard-view');

  // Hide all views first
  browserView.style.display   = 'none';
  watchlistView.style.display = 'none';
  dashboardView.style.display = 'none';

  if (col === 'watchlist') {
    watchlistView.style.display = 'block';
    filterWatchlist(currentWLFilter || 'all');
    return;
  }

  if (col === 'dashboard') {
    dashboardView.style.display = 'block';
    renderDashboard(currentDashScope || 'both');
    return;
  }

  // Showing a card collection (f1 | pl)
  browserView.style.display = 'block';

  // Reset browse filters
  document.getElementById('search-input').value     = '';
  document.getElementById('filter-status').value    = 'all';
  document.getElementById('filter-rarity').value    = 'all';
  filterValueable = false;
  document.getElementById('toggle-valuable').classList.remove('active');

  // Show team filter only for PL; populate it with unique categories
  const teamSelect = document.getElementById('filter-team');
  teamSelect.value = 'all';
  if (col === 'pl') {
    const categories = [...new Set(PL_CARDS.map(c => c.category))].sort((a, b) => {
      const PL_TEAMS_LOCAL = new Set([
        'Arsenal','Aston Villa','AFC Bournemouth','Brentford','Brighton',
        'Chelsea','Coventry City','Crystal Palace','Everton','Fulham',
        'Hull City','Ipswich Town','Leeds United','Liverpool',
        'Manchester City','Manchester United','Newcastle United',
        'Nottingham Forest','Sunderland','Tottenham Hotspur',
        'West Ham United','Wolves','Leicester City','Southampton',
      ]);
      const aIsTeam = PL_TEAMS_LOCAL.has(a);
      const bIsTeam = PL_TEAMS_LOCAL.has(b);
      if (aIsTeam && !bIsTeam) return -1;
      if (!aIsTeam && bIsTeam) return  1;
      return a.localeCompare(b);
    });
    teamSelect.innerHTML = '<option value="all">All teams</option>' +
      categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    teamSelect.style.display = '';
  } else {
    teamSelect.style.display = 'none';
  }

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
  if (currentCollection === 'dashboard') renderDashboard(currentDashScope || 'both');
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
  if (currentCollection === 'dashboard') renderDashboard(currentDashScope || 'both');
  showToast(`Cleared ${n} cards`, 'toast-needed');
}

// ─── Export CSV ──────────────────────────────────────────────────────────────
function exportCSV() {
  // Export the currently visible collection (F1 or PL) — owned cards only
  const allCards = getCardSet();
  const ownedSet = getOwnedSet();
  const sparesMap = currentCollection === 'f1' ? sparesF1 : sparesPL;
  const collectionName = currentCollection === 'f1' ? 'F1_Turbo_Attax_2026' : 'PL_26_27';

  const owned = allCards.filter(c => ownedSet.has(c.id));
  if (!owned.length) {
    showToast('No owned cards to export', '');
    return;
  }

  const escape = v => `"${String(v).replace(/"/g, '""')}"`;

  const header = ['Card Number', 'Name', 'Sub', 'Category', 'Rarity', 'Valuable', 'Spares'];
  const rows = owned.map(c => [
    escape(c.num),
    escape(c.name),
    escape(c.sub),
    escape(c.category),
    escape(c.rarity),
    escape(c.valuable ? 'Yes' : 'No'),
    escape(sparesMap[c.id] || 0),
  ]);

  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const filename = `${collectionName}_Collection_${new Date().toISOString().slice(0,10)}.csv`;

  // Try Blob download first, fall back to data: URI for PWA/mobile
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
  } catch (e) {
    // Fallback: data URI
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const a   = document.createElement('a');
    a.href    = uri;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 500);
  }
  showToast(`Exported ${owned.length} cards ✓`, 'toast-owned');
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
