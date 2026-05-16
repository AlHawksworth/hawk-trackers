// ─── Default club data (2025-26 season) ───────────────────────────────────────
const DEFAULT_CLUBS = [
  // Premier League (20)
  { id: 1,  name: "Arsenal",                   stadium: "Emirates Stadium",              division: "Premier League" },
  { id: 2,  name: "Aston Villa",               stadium: "Villa Park",                    division: "Premier League" },
  { id: 3,  name: "Bournemouth",               stadium: "Dean Court",                    division: "Premier League" },
  { id: 4,  name: "Brentford",                 stadium: "Brentford Community Stadium",   division: "Premier League" },
  { id: 5,  name: "Brighton & Hove Albion",    stadium: "Falmer Stadium",                division: "Premier League" },
  { id: 6,  name: "Burnley",                   stadium: "Turf Moor",                     division: "Premier League" },
  { id: 7,  name: "Chelsea",                   stadium: "Stamford Bridge",               division: "Premier League" },
  { id: 8,  name: "Crystal Palace",            stadium: "Selhurst Park",                 division: "Premier League" },
  { id: 9,  name: "Everton",                   stadium: "Hill Dickinson Stadium",        division: "Premier League" },
  { id: 10, name: "Fulham",                    stadium: "Craven Cottage",                division: "Premier League" },
  { id: 11, name: "Leeds United",              stadium: "Elland Road",                   division: "Premier League" },
  { id: 12, name: "Liverpool",                 stadium: "Anfield",                       division: "Premier League" },
  { id: 13, name: "Manchester City",           stadium: "City of Manchester Stadium",    division: "Premier League" },
  { id: 14, name: "Manchester United",         stadium: "Old Trafford",                  division: "Premier League" },
  { id: 15, name: "Newcastle United",          stadium: "St James' Park",               division: "Premier League" },
  { id: 16, name: "Nottingham Forest",         stadium: "City Ground",                   division: "Premier League" },
  { id: 17, name: "Sunderland",                stadium: "Stadium of Light",              division: "Premier League" },
  { id: 18, name: "Tottenham Hotspur",         stadium: "Tottenham Hotspur Stadium",     division: "Premier League" },
  { id: 19, name: "West Ham United",           stadium: "London Stadium",                division: "Premier League" },
  { id: 20, name: "Wolverhampton Wanderers",   stadium: "Molineux Stadium",              division: "Premier League" },

  // Championship (24)
  { id: 21, name: "Birmingham City",           stadium: "St Andrew's",                   division: "Championship" },
  { id: 22, name: "Blackburn Rovers",          stadium: "Ewood Park",                    division: "Championship" },
  { id: 23, name: "Bristol City",              stadium: "Ashton Gate",                   division: "Championship" },
  { id: 24, name: "Charlton Athletic",         stadium: "The Valley",                    division: "Championship" },
  { id: 25, name: "Coventry City",             stadium: "Coventry Building Society Arena", division: "Championship" },
  { id: 26, name: "Derby County",              stadium: "Pride Park Stadium",            division: "Championship" },
  { id: 27, name: "Hull City",                 stadium: "MKM Stadium",                   division: "Championship" },
  { id: 28, name: "Ipswich Town",              stadium: "Portman Road",                  division: "Championship" },
  { id: 29, name: "Leicester City",            stadium: "King Power Stadium",            division: "Championship" },
  { id: 30, name: "Middlesbrough",             stadium: "Riverside Stadium",             division: "Championship" },
  { id: 31, name: "Millwall",                  stadium: "The Den",                       division: "Championship" },
  { id: 32, name: "Norwich City",              stadium: "Carrow Road",                   division: "Championship" },
  { id: 33, name: "Oxford United",             stadium: "Kassam Stadium",                division: "Championship" },
  { id: 34, name: "Portsmouth",                stadium: "Fratton Park",                  division: "Championship" },
  { id: 35, name: "Preston North End",         stadium: "Deepdale",                      division: "Championship" },
  { id: 36, name: "Queens Park Rangers",       stadium: "Loftus Road",                   division: "Championship" },
  { id: 37, name: "Sheffield United",          stadium: "Bramall Lane",                  division: "Championship" },
  { id: 38, name: "Sheffield Wednesday",       stadium: "Hillsborough Stadium",          division: "Championship" },
  { id: 39, name: "Southampton",               stadium: "St Mary's Stadium",             division: "Championship" },
  { id: 40, name: "Stoke City",                stadium: "bet365 Stadium",                division: "Championship" },
  { id: 41, name: "Swansea City",              stadium: "Swansea.com Stadium",           division: "Championship" },
  { id: 42, name: "Watford",                   stadium: "Vicarage Road",                 division: "Championship" },
  { id: 43, name: "West Bromwich Albion",      stadium: "The Hawthorns",                 division: "Championship" },
  { id: 44, name: "Wrexham",                   stadium: "Racecourse Ground",             division: "Championship" },

  // League One (24)
  { id: 45, name: "AFC Wimbledon",             stadium: "Plough Lane",                   division: "League One" },
  { id: 46, name: "Barnsley",                  stadium: "Oakwell",                       division: "League One" },
  { id: 47, name: "Blackpool",                 stadium: "Bloomfield Road",               division: "League One" },
  { id: 48, name: "Bolton Wanderers",          stadium: "Toughsheet Community Stadium",  division: "League One" },
  { id: 49, name: "Bradford City",             stadium: "Valley Parade",                 division: "League One" },
  { id: 50, name: "Burton Albion",             stadium: "Pirelli Stadium",               division: "League One" },
  { id: 51, name: "Cardiff City",              stadium: "Cardiff City Stadium",          division: "League One" },
  { id: 52, name: "Doncaster Rovers",          stadium: "Eco-Power Stadium",             division: "League One" },
  { id: 53, name: "Exeter City",               stadium: "St James Park",                 division: "League One" },
  { id: 54, name: "Huddersfield Town",         stadium: "Kirklees Stadium",              division: "League One" },
  { id: 55, name: "Leyton Orient",             stadium: "Brisbane Road",                 division: "League One" },
  { id: 56, name: "Lincoln City",              stadium: "Sincil Bank",                   division: "League One" },
  { id: 57, name: "Luton Town",                stadium: "Kenilworth Road",               division: "League One" },
  { id: 58, name: "Mansfield Town",            stadium: "Field Mill",                    division: "League One" },
  { id: 59, name: "Northampton Town",          stadium: "Sixfields Stadium",             division: "League One" },
  { id: 60, name: "Peterborough United",       stadium: "London Road Stadium",           division: "League One" },
  { id: 61, name: "Plymouth Argyle",           stadium: "Home Park",                     division: "League One" },
  { id: 62, name: "Port Vale",                 stadium: "Vale Park",                     division: "League One" },
  { id: 63, name: "Reading",                   stadium: "Madejski Stadium",              division: "League One" },
  { id: 64, name: "Rotherham United",          stadium: "New York Stadium",              division: "League One" },
  { id: 65, name: "Stevenage",                 stadium: "Broadhall Way",                 division: "League One" },
  { id: 66, name: "Stockport County",          stadium: "Edgeley Park",                  division: "League One" },
  { id: 67, name: "Wigan Athletic",            stadium: "Brick Community Stadium",       division: "League One" },
  { id: 68, name: "Wycombe Wanderers",         stadium: "Adams Park",                    division: "League One" },

  // League Two (24)
  { id: 69, name: "Accrington Stanley",        stadium: "Crown Ground",                  division: "League Two" },
  { id: 70, name: "Barnet",                    stadium: "The Hive Stadium",              division: "League Two" },
  { id: 71, name: "Rochdale",                   stadium: "Spotland Stadium",              division: "League Two" },
  { id: 72, name: "Bristol Rovers",            stadium: "Memorial Stadium",              division: "League Two" },
  { id: 73, name: "Bromley",                   stadium: "Hayes Lane",                    division: "League Two" },
  { id: 74, name: "Cambridge United",          stadium: "Abbey Stadium",                 division: "League Two" },
  { id: 75, name: "Cheltenham Town",           stadium: "Whaddon Road",                  division: "League Two" },
  { id: 76, name: "Chesterfield",              stadium: "SMH Group Stadium",             division: "League Two" },
  { id: 77, name: "Colchester United",         stadium: "Colchester Community Stadium",  division: "League Two" },
  { id: 78, name: "Crawley Town",              stadium: "Broadfield Stadium",            division: "League Two" },
  { id: 79, name: "Crewe Alexandra",           stadium: "Gresty Road",                   division: "League Two" },
  { id: 80, name: "Fleetwood Town",            stadium: "Highbury Stadium",              division: "League Two" },
  { id: 81, name: "Gillingham",                stadium: "Priestfield Stadium",           division: "League Two" },
  { id: 82, name: "Grimsby Town",              stadium: "Blundell Park",                 division: "League Two" },
  { id: 83, name: "York City",                  stadium: "York Community Stadium",        division: "League Two" },
  { id: 84, name: "Milton Keynes Dons",        stadium: "Stadium MK",                    division: "League Two" },
  { id: 85, name: "Newport County",            stadium: "Rodney Parade",                 division: "League Two" },
  { id: 86, name: "Notts County",              stadium: "Meadow Lane",                   division: "League Two" },
  { id: 87, name: "Oldham Athletic",           stadium: "Boundary Park",                 division: "League Two" },
  { id: 88, name: "Salford City",              stadium: "Moor Lane",                     division: "League Two" },
  { id: 89, name: "Shrewsbury Town",           stadium: "New Meadow",                    division: "League Two" },
  { id: 90, name: "Swindon Town",              stadium: "County Ground",                 division: "League Two" },
  { id: 91, name: "Tranmere Rovers",           stadium: "Prenton Park",                  division: "League Two" },
  { id: 92, name: "Walsall",                   stadium: "Bescot Stadium",                division: "League Two" },
];

const DIVISIONS = ["Premier League", "Championship", "League One", "League Two"];
const DIV_COLORS = {
  "Premier League": "pl-color",
  "Championship":   "champ-color",
  "League One":     "l1-color",
  "League Two":     "l2-color",
};

// ─── State ────────────────────────────────────────────────────────────────────
let state = { clubs: [], visits: {}, extras: {}, nlVisits: {}, targets: [], games: [], nextUpId: null };
let activeFilter = "all";
let activeDiv    = "all";
let searchQuery  = "";
let pendingVisitId = null;
let sortOrder    = "alpha";
let viewMode     = "grid"; // "grid" | "list"
let undoStack    = null;   // { type, id, data } for single-step undo

// ─── Home postcode / distance ─────────────────────────────────────────────────
// Hard-coded to CM16 4HW (Epping, Essex)
let homeLat = 51.6978, homeLng = 0.1143;

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Stadium capacities (approximate) for difficulty scoring ─────────────────
const STADIUM_CAPACITY = {
  1:60704, 2:43205, 3:11307, 4:17250, 5:31876, 6:21990, 7:40044, 8:25194,
  9:52769, 10:28800, 11:37645, 12:61276, 13:52900, 14:74244, 15:52264,
  16:31042, 17:48707, 18:62850, 19:62500, 20:31750,
  // Championship
  21:29409, 22:31367, 23:26462, 24:27111, 25:32609, 26:32926, 27:25586,
  28:30056, 29:32259, 30:34742, 31:20146, 32:27359, 33:12500, 34:20867,
  35:23408, 36:18439, 37:32050, 38:39732, 39:32384, 40:30089, 41:21088,
  42:22200, 43:26850, 44:10669,
  // League One
  45:9215, 46:23287, 47:16616, 48:28723, 49:25136, 50:6912, 51:33280,
  52:15231, 53:8219, 54:24121, 55:9271, 56:10669, 57:12300, 58:9186,
  59:8203, 60:15314, 61:18173, 62:19052, 63:24161, 64:12021, 65:7200,
  66:10841, 67:25133, 68:10137,
  // League Two
  69:5450, 70:6500, 71:10249, 72:9832, 73:6100, 74:8127, 75:7066,
  76:10504, 77:10105, 78:5996, 79:10153, 80:5327, 81:11582, 82:9052,
  83:8256, 84:30500, 85:7850, 86:19841, 87:13513, 88:5108, 89:9875,
  90:15728, 91:16789, 92:11300,
};

// ─── Difficulty score ─────────────────────────────────────────────────────────
function getDifficulty(club) {
  const capacity = STADIUM_CAPACITY[club.id] || 15000;
  const hasAccount = (typeof state !== "undefined") && state.extras?.[club.id]?.ticketAccount === "yes";

  // Score based on division + capacity
  let score = 0;
  if (club.division === "Premier League") score = 3;
  else if (club.division === "Championship") score = capacity > 25000 ? 2 : 1;
  else score = capacity > 20000 ? 1 : 0; // Large L1/L2 grounds slightly harder

  // Having an account makes it easier
  if (hasAccount) score = Math.max(0, score - 1);

  if (score >= 3) return { label: "Hard",   color: "#e74c3c", tip: "Sell-outs common — membership or early booking required." };
  if (score === 2) return { label: "Medium", color: "#f39c12", tip: "Usually available but book a few days ahead." };
  return              { label: "Easy",   color: "#27ae60", tip: "Walk-up friendly — tickets often available on the day." };
}

// ─── Persistence ──────────────────────────────────────────────────────────────
function save() {
  const toSave = { ...state, _dataVersion: DATA_VERSION };
  const json = JSON.stringify(toSave);
  // Keep a rolling backup (overwrite only when data changes)
  const prev = localStorage.getItem("92club");
  if (prev && prev !== json) localStorage.setItem("92club_backup", prev);
  if (typeof FireSync !== "undefined") {
    FireSync.save("92club", toSave);
  } else {
    localStorage.setItem("92club", json);
  }
  if (typeof redrawMap === "function" &&
      document.getElementById("page-map") &&
      !document.getElementById("page-map").classList.contains("hidden")) {
    redrawMap();
  }
}

// ─── Data version — bump this when DEFAULT_CLUBS changes (promotions/relegations) ──
const DATA_VERSION = 2;

function load() {
  const raw = localStorage.getItem("92club");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const savedVersion = parsed._dataVersion || 1;
      if (savedVersion < DATA_VERSION) {
        // Club list has changed — use new defaults but preserve user data
        state.clubs = DEFAULT_CLUBS.map(c => ({ ...c }));
      } else {
        state.clubs = parsed.clubs || DEFAULT_CLUBS;
      }
      state.visits   = parsed.visits   || {};
      state.extras   = parsed.extras   || {};
      state.nlVisits = parsed.nlVisits || {};
      state.targets  = parsed.targets  || [];
      state.games    = parsed.games    || [];
      state.nextUpId = parsed.nextUpId || null;
      const validIds = new Set(state.clubs.map(c => String(c.id)));
      Object.keys(state.visits).forEach(id => {
        if (!validIds.has(id)) {
          delete state.visits[id];
        }
      });
      // Persist the version upgrade
      if (savedVersion < DATA_VERSION) save();
    } catch (e) {
      state.clubs = DEFAULT_CLUBS.map(c => ({ ...c }));
      state.visits = {}; state.extras = {}; state.nlVisits = {};
      state.targets = []; state.games = [];
    }
  } else {
    state.clubs = DEFAULT_CLUBS.map(c => ({ ...c }));
    state.visits = {}; state.extras = {}; state.nlVisits = {};
    state.targets = []; state.games = [];
  }
  // Cloud sync
  if (typeof FireSync !== "undefined") {
    FireSync.load("92club", (cloudData) => {
      if (cloudData && cloudData.clubs) {
        state.clubs    = cloudData.clubs    || state.clubs;
        state.visits   = cloudData.visits   || state.visits;
        state.extras   = cloudData.extras   || state.extras;
        state.nlVisits = cloudData.nlVisits || state.nlVisits;
        state.targets  = cloudData.targets  || state.targets;
        state.games    = cloudData.games    || state.games;
        state.nextUpId = cloudData.nextUpId || state.nextUpId;
        render();
      }
    });
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function renderDashboard() {
  const el = document.getElementById("tracker-dashboard");
  if (!el) return;

  const visitedWithDate = state.clubs
    .filter(c => state.visits[c.id]?.date)
    .sort((a, b) => state.visits[b.id].date.localeCompare(state.visits[a.id].date));
  const recentClub = visitedWithDate[0];
  const recentVal  = recentClub ? recentClub.name : "None yet";
  const recentSub  = recentClub ? formatDate(state.visits[recentClub.id].date) : "";

  let closestDiv = null, closestFrac = "—", closestRatio = -1;
  DIVISIONS.forEach(div => {
    const total = state.clubs.filter(c => c.division === div).length;
    const done  = state.clubs.filter(c => c.division === div && state.visits[c.id]).length;
    const ratio = total ? done / total : 0;
    if (ratio > closestRatio) { closestRatio = ratio; closestDiv = div; closestFrac = `${done}/${total}`; }
  });

  const thisYear = new Date().getFullYear().toString();
  const thisYearCount = Object.values(state.visits).filter(v => v?.date?.startsWith(thisYear)).length;

  const dates = [...new Set(
    Object.values(state.visits).filter(v => v?.date).map(v => v.date)
  )].sort();
  let streak = 0, maxStreak = 0, prevMs = null;
  for (const d of dates) {
    const ms = new Date(d).getTime();
    if (prevMs && ms - prevMs === 86400000) { streak++; } else { streak = 1; }
    if (streak > maxStreak) maxStreak = streak;
    prevMs = ms;
  }
  const streakVal   = dates.length === 0 ? 0 : maxStreak > 1 ? maxStreak : Object.keys(state.visits).length;
  const streakLabel = dates.length === 0 ? "Longest streak" : maxStreak > 1 ? "Longest streak (days)" : "Total visited";

  el.innerHTML = `
    <div class="dash-card">
      <div class="dash-val">${recentVal}</div>
      <div class="dash-label">${recentSub ? "Most recent · " + recentSub : "Most recent visit"}</div>
    </div>
    <div class="dash-card">
      <div class="dash-val">${closestFrac}</div>
      <div class="dash-label">Closest to complete · ${closestDiv || "—"}</div>
    </div>
    <div class="dash-card">
      <div class="dash-val">${thisYearCount}</div>
      <div class="dash-label">Grounds this year (${thisYear})</div>
    </div>
    <div class="dash-card">
      <div class="dash-val">${streakVal}</div>
      <div class="dash-label">${streakLabel}</div>
    </div>
    ${renderNextUp()}
  `;

  // Wire up Next Up card click
  const nextCard = document.getElementById("nextup-card");
  if (nextCard) {
    nextCard.addEventListener("click", () => openClubModal(parseInt(nextCard.dataset.id)));
  }
  wireNextUpPicker();
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  renderDashboard();
  const query = searchQuery.toLowerCase();
  const grid = document.getElementById("main-grid");

  // Show skeleton on very first render before data is ready
  if (!state.clubs.length) {
    grid.innerHTML = Array(8).fill(0).map(() =>
      `<div class="skeleton-card"><div class="sk-line sk-title"></div><div class="sk-line sk-sub"></div><div class="sk-line sk-sub sk-short"></div></div>`
    ).join("");
    return;
  }
  grid.innerHTML = "";

  const visitedCount = Object.keys(state.visits).length;
  const total = state.clubs.length;
  document.getElementById("stat-visited").textContent = `${visitedCount} Visited`;
  document.getElementById("stat-remaining").textContent = `${total - visitedCount} Remaining`;
  const nlCount = Object.keys(state.nlVisits).length;
  const nlTotal = DEFAULT_NL_CLUBS.length;
  const nlEl = document.getElementById("stat-nonleague");
  if (nlEl) {
    nlEl.textContent = `${nlCount}/${nlTotal} Non-League`;
    nlEl.style.display = nlCount > 0 ? "" : "none";
  }
  const pct = total ? Math.round((visitedCount / total) * 100) : 0;
  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("progress-pct").textContent = pct + "%";

  let anyVisible = false;

  DIVISIONS.forEach(div => {
    if (activeDiv !== "all" && activeDiv !== div) return;

    let clubs = state.clubs.filter(c => {
      if (c.division !== div) return false;
      const visited = !!state.visits[c.id];
      if (activeFilter === "visited" && !visited) return false;
      if (activeFilter === "unvisited" && visited) return false;
      if (activeFilter === "priority" && !(state.extras[c.id]?.priority > 0)) return false;
      if (query && !c.name.toLowerCase().includes(query) && !c.stadium.toLowerCase().includes(query)) return false;
      return true;
    });

    if (sortOrder === "alpha") {
      clubs = clubs.slice().sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "visited-first") {
      clubs = clubs.slice().sort((a, b) => {
        const av = !!state.visits[a.id], bv = !!state.visits[b.id];
        return av === bv ? 0 : av ? -1 : 1;
      });
    } else if (sortOrder === "unvisited-first") {
      clubs = clubs.slice().sort((a, b) => {
        const av = !!state.visits[a.id], bv = !!state.visits[b.id];
        return av === bv ? 0 : av ? 1 : -1;
      });
    }

    if (clubs.length === 0) return;
    anyVisible = true;

    const divVisited = clubs.filter(c => state.visits[c.id]).length;
    const section = document.createElement("div");
    section.className = "division-section";
    const colorClass = DIV_COLORS[div];
    const gridClass = viewMode === "list" ? "clubs-list" : "clubs-grid";
    section.innerHTML = `
      <div class="division-header ${colorClass}">
        <h2>${div}</h2>
        <div class="div-count"><span>${divVisited}/${clubs.length}</span></div>
      </div>
      <div class="${gridClass}" id="grid-${div.replace(/\s/g, '-')}"></div>
    `;
    grid.appendChild(section);

    const thisSeasonYear = "2025";
    const clubGrid = section.querySelector(`.${gridClass}`);
    clubs.forEach(club => {
      const visited   = !!state.visits[club.id];
      const visitData = state.visits[club.id];
      const extras    = state.extras[club.id] || {};
      const isThisSeason = visited && visitData?.date?.startsWith(thisSeasonYear);
      const isTarget = (state.targets || []).some(t => t.id === club.id);

      if (viewMode === "list") {
        // Compact list row
        const row = document.createElement("div");
        row.className = "club-list-row" + (visited ? " visited" : "");
        row.dataset.id = club.id;
        row.innerHTML = `
          <span class="list-check">${visited ? "✓" : ""}</span>
          <span class="list-name">${club.name}</span>
          <span class="list-stadium">${club.stadium}</span>
          <span class="list-badges">
            ${isThisSeason ? '<span class="badge badge-season">25/26</span>' : ""}
            ${isTarget ? '<span class="badge badge-target">🎯</span>' : ""}
            ${extras.priority ? `<span class="badge badge-priority">${"★".repeat(extras.priority)}</span>` : ""}
            ${extras.ticketAccount === "yes" ? '<span class="badge badge-ticket-yes">🎟</span>' : ""}
          </span>
          ${visited && visitData?.date ? `<span class="list-date">${formatDate(visitData.date)}</span>` : ""}
        `;
        row.addEventListener("click", () => openClubModal(club.id));
        clubGrid.appendChild(row);
      } else {
        // Card view
        const card = document.createElement("div");
        card.className = "club-card" + (visited ? " visited" : "");
        card.dataset.id = club.id;
        card.innerHTML = `
          ${visited ? '<div class="check-icon">✓</div>' : ""}
          <div class="div-tag ${colorClass}">${div}</div>
          <div class="club-name">${club.name}</div>
          <div class="stadium-name">${club.stadium}</div>
          ${visited && visitData?.date ? `<div class="visit-info">📅 ${formatDate(visitData.date)}</div>` : ""}
          ${visited && visitData?.notes ? `<div class="visit-notes">${visitData.notes}</div>` : ""}
          ${visited ? "" : '<div class="visit-info" style="color:#aaa;margin-top:8px;font-size:0.75rem;">Click to mark visited</div>'}
          <div class="card-badges">
            ${isThisSeason ? '<span class="badge badge-season">25/26</span>' : ""}
            ${isTarget ? '<span class="badge badge-target">🎯</span>' : ""}
            ${extras.priority ? `<span class="badge badge-priority">${"★".repeat(extras.priority)}</span>` : ""}
            ${extras.ticketAccount === "yes" ? '<span class="badge badge-ticket-yes">🎟 Account</span>' : ""}
            ${extras.ticketAccount === "no" ? '<span class="badge badge-ticket-no">✗ No account</span>' : ""}
            ${extras.notes ? '<span class="badge badge-notes">📝</span>' : ""}
          </div>
        `;
        card.addEventListener("click", () => openClubModal(club.id));
        clubGrid.appendChild(card);
      }
    });
  });

  if (!anyVisible) {
    grid.innerHTML = '<div class="empty-state">No clubs match your filters.</div>';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Visit modal ──────────────────────────────────────────────────────────────
function checkMilestone(prevCount, newCount) {
  const milestones = [
    { n: 25,  emoji: "🎯", title: "Quarter Century!", sub: "25 grounds visited. You're on your way!" },
    { n: 46,  emoji: "🏆", title: "Half the EFL!", sub: "46 grounds — you've done half the Football League." },
    { n: 50,  emoji: "🌟", title: "50 Down!", sub: "The halfway point. 42 to go." },
    { n: 75,  emoji: "🔥", title: "75 Grounds!", sub: "Three quarters done. The end is in sight!" },
    { n: 92,  emoji: "🎊", title: "THE 92 COMPLETE!", sub: "You've visited every ground in the top four divisions. Legendary." },
  ];
  for (const m of milestones) {
    if (prevCount < m.n && newCount >= m.n) {
      document.getElementById("milestone-emoji").textContent = m.emoji;
      document.getElementById("milestone-title").textContent = m.title;
      document.getElementById("milestone-sub").textContent   = m.sub;
      document.getElementById("milestone-overlay").classList.remove("hidden");
      break;
    }
  }
}

document.getElementById("milestone-close").addEventListener("click", () => {
  document.getElementById("milestone-overlay").classList.add("hidden");
});
function openVisitModal(id) {
  pendingVisitId = id;
  const club = state.clubs.find(c => c.id === id);
  document.getElementById("date-modal-title").textContent = `Mark ${club.name} as Visited`;
  document.getElementById("visit-date-input").value = "";
  document.getElementById("visit-notes-input").value = "";
  document.getElementById("date-modal-overlay").classList.remove("hidden");
}

function handleCardClick(id, isVisited) {
  if (isVisited) {
    const club = state.clubs.find(c => c.id === id);
    showConfirmModal(`Remove visit record for ${club?.name}?`, () => {
      delete state.visits[id];
      save();
      render();
    });
  } else {
    openVisitModal(id);
  }
}

document.getElementById("btn-confirm-visit").addEventListener("click", () => {
  if (pendingVisitId === null) return;
  const prevCount = Object.keys(state.visits).length;
  const date  = document.getElementById("visit-date-input").value;
  const notes = document.getElementById("visit-notes-input").value.trim();
  const id    = pendingVisitId;
  state.visits[id] = { date, notes };
  save();
  render();
  const newCount = Object.keys(state.visits).length;
  document.getElementById("date-modal-overlay").classList.add("hidden");
  pendingVisitId = null;
  // Show undo toast
  const club = state.clubs.find(c => c.id === id);
  showUndo(`✓ ${club?.name || "Club"} marked as visited`, () => {
    delete state.visits[id];
    save(); render();
  });
  // Fire celebration animation, then milestone check after it dismisses
  if (newCount > prevCount) {
    showCelebration(id);
  }
  checkMilestone(prevCount, newCount);
});

document.getElementById("btn-cancel-visit").addEventListener("click", () => {
  document.getElementById("date-modal-overlay").classList.add("hidden");
  // If we came from the club modal, reopen it
  if (pendingVisitId !== null) {
    const reopenId = pendingVisitId;
    pendingVisitId = null;
    openClubModal(reopenId);
  }
});

// ─── Filters & sort ───────────────────────────────────────────────────────────
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

document.querySelectorAll(".div-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".div-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeDiv = btn.dataset.div;
    render();
  });
});

document.getElementById("search").addEventListener("input", e => {
  searchQuery = e.target.value;
  render();
});

document.getElementById("sort-select").addEventListener("change", e => {
  sortOrder = e.target.value;
  render();
});

// ─── Manage Modal ─────────────────────────────────────────────────────────────
document.getElementById("btn-manage").addEventListener("click", () => {
  document.getElementById("modal-overlay").classList.remove("hidden");
  renderEditList();
});

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("modal-overlay").classList.add("hidden");
});

document.getElementById("modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modal-overlay")) {
    document.getElementById("modal-overlay").classList.add("hidden");
  }
});

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(t => t.classList.add("hidden"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.remove("hidden");
  });
});

document.getElementById("btn-add-club").addEventListener("click", () => {
  const name     = document.getElementById("new-name").value.trim();
  const stadium  = document.getElementById("new-stadium").value.trim();
  const division = document.getElementById("new-div").value;
  if (!name || !stadium) { alert("Please enter both a club name and stadium."); return; }
  const maxId = state.clubs.reduce((m, c) => Math.max(m, c.id), 0);
  state.clubs.push({ id: maxId + 1, name, stadium, division });
  save(); render();
  document.getElementById("new-name").value = "";
  document.getElementById("new-stadium").value = "";
  alert(`${name} added!`);
  renderEditList();
});

function renderEditList() {
  const q    = document.getElementById("edit-search").value.toLowerCase();
  const list = document.getElementById("edit-list");
  const filtered = state.clubs.filter(c =>
    !q || c.name.toLowerCase().includes(q) || c.stadium.toLowerCase().includes(q)
  );
  if (filtered.length === 0) { list.innerHTML = '<div class="no-results">No clubs found.</div>'; return; }
  list.innerHTML = filtered.map(c => `
    <div class="edit-item" data-id="${c.id}">
      <div class="edit-name">${c.name}</div>
      <input class="stadium-input" data-id="${c.id}" value="${c.stadium.replace(/"/g, '&quot;')}" placeholder="Stadium name" title="Edit stadium" />
      <select class="div-select" data-id="${c.id}">
        ${DIVISIONS.map(d => `<option${d === c.division ? " selected" : ""}>${d}</option>`).join("")}
      </select>
      <button class="del-btn" data-id="${c.id}">Remove</button>
    </div>
  `).join("");

  list.querySelectorAll(".stadium-input").forEach(input => {
    input.addEventListener("change", () => {
      const id   = parseInt(input.dataset.id);
      const club = state.clubs.find(c => c.id === id);
      if (club && input.value.trim()) { club.stadium = input.value.trim(); save(); render(); }
    });
  });

  list.querySelectorAll(".div-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const id   = parseInt(sel.dataset.id);
      const club = state.clubs.find(c => c.id === id);
      if (club) { club.division = sel.value; save(); render(); }
    });
  });

  list.querySelectorAll(".del-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id   = parseInt(btn.dataset.id);
      const club = state.clubs.find(c => c.id === id);
      if (confirm(`Remove ${club.name} from the list?`)) {
        state.clubs = state.clubs.filter(c => c.id !== id);
        delete state.visits[id];
        save(); render(); renderEditList();
      }
    });
  });
}

document.getElementById("edit-search").addEventListener("input", renderEditList);

document.getElementById("btn-export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "92club-tracker.json";
  a.click();
});

document.getElementById("btn-export-csv").addEventListener("click", () => {
  const rows = [["Club","Division","Stadium","Date Visited","Notes","Match Rating","Visited With"]];
  state.clubs.forEach(club => {
    const v = state.visits[club.id];
    const e = state.extras[club.id] || {};
    if (v) rows.push([
      club.name, club.division, club.stadium,
      v.date || "", (v.notes || "").replace(/,/g,"；"),
      e.matchRating || "", (e.visitedWith || "").replace(/,/g,"；")
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "92club-visits.csv";
  a.click();
});

document.getElementById("file-import").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.clubs) throw new Error("Invalid format");
      state = data;
      save(); render(); renderEditList();
      alert("Data imported successfully!");
    } catch (err) {
      alert("Failed to import: invalid JSON file.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// ─── Club Detail Modal ────────────────────────────────────────────────────────
let activeClubModalId = null;

function updateStarUI(priority) {
  const stars = document.querySelectorAll(".cm-star");
  const label = document.getElementById("cm-star-label");
  stars.forEach(s => {
    s.classList.toggle("active", parseInt(s.dataset.star) <= priority);
  });
  label.textContent = priority ? "★".repeat(priority) + " Priority" : "Not set";
}

function openClubModal(id) {
  activeClubModalId = id;
  const club      = state.clubs.find(c => c.id === id);
  const visited   = !!state.visits[id];
  const visitData = state.visits[id];
  const extras    = state.extras[id] || {};
  const colorClass = DIV_COLORS[club.division] || "";

  document.getElementById("club-modal-title").textContent = club.name;
  document.getElementById("club-modal-meta").innerHTML = `
    <div class="club-modal-div ${colorClass}">${club.division}</div>
    <div class="club-modal-stadium">🏟 ${club.stadium}</div>
  `;

  // Visit section
  const visitSection = document.getElementById("club-modal-visit-section");
  if (visited) {
    const rating = extras.matchRating || 0;
    const ratingStars = rating ? "⭐".repeat(rating) : "";
    visitSection.innerHTML = `
      <div class="cm-visited-row">
        <span class="cm-visited-badge">✓ Visited${visitData?.date ? " · " + formatDate(visitData.date) : ""}</span>
        <button class="cm-remove-btn" id="cm-remove-visit">Remove visit</button>
      </div>
      ${visitData?.notes ? `<div class="cm-visit-notes">"${visitData.notes}"</div>` : ""}
      <div class="cm-match-rating-row">
        <span class="cm-field-label">Match rating:</span>
        <div class="cm-match-stars">
          ${[1,2,3,4,5].map(n => `<button class="cm-match-star${rating >= n ? " active" : ""}" data-rating="${n}">★</button>`).join("")}
          <span class="cm-match-rating-label">${rating ? ratingStars + " " + ["","Poor","OK","Good","Great","Excellent"][rating] : "Not rated"}</span>
        </div>
      </div>
      <div class="cm-with-row">
        <span class="cm-field-label">Visited with:</span>
        <input type="text" id="cm-visited-with" class="cm-inline-input" value="${(extras.visitedWith || "").replace(/"/g,'&quot;')}" placeholder="e.g. Dad, friends…" />
      </div>
      <div class="cm-photo-row">
        <span class="cm-field-label">Photo URL:</span>
        <input type="url" id="cm-photo-url" class="cm-inline-input" value="${(extras.photoUrl || "").replace(/"/g,'&quot;')}" placeholder="https://…" />
        ${extras.photoUrl ? `<a href="${extras.photoUrl}" target="_blank" class="cm-url-open">View ↗</a>` : ""}
      </div>
    `;
    document.getElementById("cm-remove-visit").addEventListener("click", () => {
      showConfirmModal(`Remove visit record for ${club.name}?`, () => {
        delete state.visits[id];
        save(); render();
        closeClubModal();
      });
    });
    // Match rating stars
    visitSection.querySelectorAll(".cm-match-star").forEach(btn => {
      btn.addEventListener("click", () => {
        const n = parseInt(btn.dataset.rating);
        if (!state.extras[id]) state.extras[id] = {};
        state.extras[id].matchRating = (state.extras[id].matchRating === n) ? 0 : n;
        save(); render();
        openClubModal(id); // refresh
      });
    });
  } else {
    visitSection.innerHTML = `<button class="primary-btn cm-mark-btn" id="cm-mark-visited">Mark as Visited</button>`;
    document.getElementById("cm-mark-visited").addEventListener("click", () => {
      saveClubModalExtras();
      closeClubModal(false);
      openVisitModal(id);
    });
  }

  // Stars
  updateStarUI(extras.priority || 0);

  // Ticket buttons
  const ticketVal = extras.ticketAccount || "";
  document.getElementById("cm-ticket-yes").classList.toggle("active",  ticketVal === "yes");
  document.getElementById("cm-ticket-no").classList.toggle("active",   ticketVal === "no");
  document.getElementById("cm-ticket-none").classList.toggle("active", ticketVal === "");

  // Ticket URL
  const urlInput = document.getElementById("cm-ticket-url");
  urlInput.value = extras.ticketUrl || "";
  const urlLink = document.getElementById("cm-ticket-url-link");
  urlLink.innerHTML = extras.ticketUrl
    ? `<a href="${extras.ticketUrl}" target="_blank" class="cm-url-open">🔗 Open ticketing page ↗</a>`
    : "";

  // Notes
  document.getElementById("cm-notes-input").value = extras.notes || "";

  document.getElementById("club-modal-overlay").classList.remove("hidden");
}

function saveClubModalExtras() {
  if (activeClubModalId === null) return;
  const id = activeClubModalId;
  if (!state.extras[id]) state.extras[id] = {};
  state.extras[id].notes      = document.getElementById("cm-notes-input").value.trim();
  state.extras[id].ticketUrl  = document.getElementById("cm-ticket-url").value.trim();
  const withEl  = document.getElementById("cm-visited-with");
  const photoEl = document.getElementById("cm-photo-url");
  if (withEl)  state.extras[id].visitedWith = withEl.value.trim();
  if (photoEl) state.extras[id].photoUrl    = photoEl.value.trim();
  save();
  render();
}

function closeClubModal(doSave = true) {
  if (doSave) saveClubModalExtras();
  document.getElementById("club-modal-overlay").classList.add("hidden");
  activeClubModalId = null;
}

document.getElementById("club-modal-close").addEventListener("click", () => closeClubModal());
document.getElementById("club-modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("club-modal-overlay")) closeClubModal();
});

// Star rating
document.querySelectorAll(".cm-star").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = activeClubModalId;
    if (id === null) return;
    if (!state.extras[id]) state.extras[id] = {};
    const val = parseInt(btn.dataset.star);
    // Click same star again = clear
    state.extras[id].priority = (state.extras[id].priority === val) ? 0 : val;
    updateStarUI(state.extras[id].priority);
    save(); render();
  });
});

// Ticket URL live link update
document.getElementById("cm-ticket-url").addEventListener("input", e => {
  const val = e.target.value.trim();
  document.getElementById("cm-ticket-url-link").innerHTML = val
    ? `<a href="${val}" target="_blank" class="cm-url-open">🔗 Open ticketing page ↗</a>`
    : "";
});

// Ticket account buttons
["cm-ticket-yes", "cm-ticket-no", "cm-ticket-none"].forEach(btnId => {
  document.getElementById(btnId).addEventListener("click", () => {
    const id = activeClubModalId;
    if (id === null) return;
    if (!state.extras[id]) state.extras[id] = {};
    const map = { "cm-ticket-yes": "yes", "cm-ticket-no": "no", "cm-ticket-none": "" };
    state.extras[id].ticketAccount = map[btnId];
    document.getElementById("cm-ticket-yes").classList.toggle("active",  map[btnId] === "yes");
    document.getElementById("cm-ticket-no").classList.toggle("active",   map[btnId] === "no");
    document.getElementById("cm-ticket-none").classList.toggle("active", map[btnId] === "");
    save(); render();
  });
});

// ─── Non-League Data (2025-26) ────────────────────────────────────────────────
const DEFAULT_NL_CLUBS = [
  // National League (24)
  { id: "nl-1",  name: "Aldershot Town",        stadium: "The Recreation Ground",           tier: "National League" },
  { id: "nl-2",  name: "Altrincham",             stadium: "Moss Lane",                       tier: "National League" },
  { id: "nl-3",  name: "Boreham Wood",           stadium: "Meadow Park",                     tier: "National League" },
  { id: "nl-4",  name: "Boston United",          stadium: "Boston Community Stadium",        tier: "National League" },
  { id: "nl-5",  name: "Brackley Town",          stadium: "St. James Park",                  tier: "National League" },
  { id: "nl-6",  name: "Braintree Town",         stadium: "Cressing Road",                   tier: "National League" },
  { id: "nl-7",  name: "Carlisle United",        stadium: "Brunton Park",                    tier: "National League" },
  { id: "nl-8",  name: "Eastleigh",              stadium: "Ten Acres",                       tier: "National League" },
  { id: "nl-9",  name: "FC Halifax Town",        stadium: "The Shay",                        tier: "National League" },
  { id: "nl-10", name: "Forest Green Rovers",    stadium: "The New Lawn",                    tier: "National League" },
  { id: "nl-11", name: "Gateshead",              stadium: "Gateshead International Stadium", tier: "National League" },
  { id: "nl-12", name: "Hartlepool United",      stadium: "Victoria Park",                   tier: "National League" },
  { id: "nl-13", name: "Morecambe",              stadium: "Mazuma Mobile Stadium",           tier: "National League" },
  { id: "nl-14", name: "Barrow",                  stadium: "Holker Street",                   tier: "National League" },
  { id: "nl-15", name: "Scunthorpe United",      stadium: "Glanford Park",                   tier: "National League" },
  { id: "nl-16", name: "Solihull Moors",         stadium: "Damson Park",                     tier: "National League" },
  { id: "nl-17", name: "Southend United",        stadium: "Roots Hall",                      tier: "National League" },
  { id: "nl-18", name: "Sutton United",          stadium: "Gander Green Lane",               tier: "National League" },
  { id: "nl-19", name: "Tamworth",               stadium: "The Lamb Ground",                 tier: "National League" },
  { id: "nl-20", name: "Truro City",             stadium: "Truro City Stadium",              tier: "National League" },
  { id: "nl-21", name: "Wealdstone",             stadium: "Grosvenor Vale",                  tier: "National League" },
  { id: "nl-22", name: "Woking",                 stadium: "Kingfield Stadium",               tier: "National League" },
  { id: "nl-23", name: "Yeovil Town",            stadium: "Huish Park",                      tier: "National League" },
  { id: "nl-24", name: "Harrogate Town",          stadium: "Wetherby Road",                   tier: "National League" },

  // National League North (24)
  { id: "nln-1",  name: "AFC Fylde",             stadium: "Mill Farm Sports Village",        tier: "National League North" },
  { id: "nln-2",  name: "AFC Telford United",    stadium: "New Bucks Head",                  tier: "National League North" },
  { id: "nln-3",  name: "Alfreton Town",         stadium: "North Street",                    tier: "National League North" },
  { id: "nln-4",  name: "Bedford Town",          stadium: "The Eyrie",                       tier: "National League North" },
  { id: "nln-5",  name: "Buxton",                stadium: "The Silverlands",                 tier: "National League North" },
  { id: "nln-6",  name: "Chester",               stadium: "Deva Stadium",                    tier: "National League North" },
  { id: "nln-7",  name: "Chorley",               stadium: "Victory Park",                    tier: "National League North" },
  { id: "nln-8",  name: "Curzon Ashton",         stadium: "Tameside Stadium",                tier: "National League North" },
  { id: "nln-9",  name: "Darlington",            stadium: "Blackwell Meadows",               tier: "National League North" },
  { id: "nln-10", name: "Hereford",              stadium: "Edgar Street",                    tier: "National League North" },
  { id: "nln-11", name: "Kidderminster Harriers",stadium: "Aggborough",                      tier: "National League North" },
  { id: "nln-12", name: "King's Lynn Town",      stadium: "The Walks",                       tier: "National League North" },
  { id: "nln-13", name: "Leamington",            stadium: "New Windmill Ground",             tier: "National League North" },
  { id: "nln-14", name: "Macclesfield",          stadium: "Moss Rose",                       tier: "National League North" },
  { id: "nln-15", name: "Marine",                stadium: "Rossett Park",                    tier: "National League North" },
  { id: "nln-16", name: "Merthyr Town",          stadium: "Penydarren Park",                 tier: "National League North" },
  { id: "nln-17", name: "Oxford City",           stadium: "Marsh Lane",                      tier: "National League North" },
  { id: "nln-18", name: "Peterborough Sports",   stadium: "Lincoln Road",                    tier: "National League North" },
  { id: "nln-19", name: "Radcliffe",             stadium: "Stainton Park",                   tier: "National League North" },
  { id: "nln-20", name: "Scarborough Athletic",  stadium: "Scarborough Sports Village",      tier: "National League North" },
  { id: "nln-21", name: "South Shields",         stadium: "Mariners Park",                   tier: "National League North" },
  { id: "nln-22", name: "Southport",             stadium: "Haig Avenue",                     tier: "National League North" },
  { id: "nln-23", name: "Spennymoor Town",       stadium: "The Brewery Field",               tier: "National League North" },
  { id: "nln-24", name: "Worksop Town",          stadium: "Sandy Lane",                      tier: "National League North" },

  // National League South (24)
  { id: "nls-1",  name: "AFC Totton",            stadium: "Testwood Stadium",                tier: "National League South" },
  { id: "nls-2",  name: "Bath City",             stadium: "Twerton Park",                    tier: "National League South" },
  { id: "nls-3",  name: "Chelmsford City",       stadium: "Melbourne Stadium",               tier: "National League South" },
  { id: "nls-4",  name: "Chesham United",        stadium: "The Meadow",                      tier: "National League South" },
  { id: "nls-5",  name: "Chippenham Town",       stadium: "Hardenhuish Park",                tier: "National League South" },
  { id: "nls-6",  name: "Dagenham & Redbridge",  stadium: "Victoria Road",                   tier: "National League South" },
  { id: "nls-7",  name: "Dorking Wanderers",     stadium: "Meadowbank Stadium",              tier: "National League South" },
  { id: "nls-8",  name: "Dover Athletic",        stadium: "Crabble Athletic Ground",         tier: "National League South" },
  { id: "nls-9",  name: "Eastbourne Borough",    stadium: "Priory Lane",                     tier: "National League South" },
  { id: "nls-10", name: "Ebbsfleet United",      stadium: "Stonebridge Road",                tier: "National League South" },
  { id: "nls-11", name: "Enfield Town",          stadium: "Queen Elizabeth II Stadium",      tier: "National League South" },
  { id: "nls-12", name: "Farnborough",           stadium: "Cherrywood Road",                 tier: "National League South" },
  { id: "nls-13", name: "Hampton & Richmond Borough", stadium: "Beveree Stadium",            tier: "National League South" },
  { id: "nls-14", name: "Hemel Hempstead Town",  stadium: "Vauxhall Road",                   tier: "National League South" },
  { id: "nls-15", name: "Hornchurch",            stadium: "Hornchurch Stadium",              tier: "National League South" },
  { id: "nls-16", name: "Horsham",               stadium: "Hop Oast Stadium",                tier: "National League South" },
  { id: "nls-17", name: "Maidenhead United",     stadium: "York Road",                       tier: "National League South" },
  { id: "nls-18", name: "Maidstone United",      stadium: "Gallagher Stadium",               tier: "National League South" },
  { id: "nls-19", name: "Salisbury",             stadium: "Raymond McEnhill Stadium",        tier: "National League South" },
  { id: "nls-20", name: "Slough Town",           stadium: "Arbour Park",                     tier: "National League South" },
  { id: "nls-21", name: "Tonbridge Angels",      stadium: "Longmead Stadium",                tier: "National League South" },
  { id: "nls-22", name: "Torquay United",        stadium: "Plainmoor",                       tier: "National League South" },
  { id: "nls-23", name: "Weston-super-Mare",     stadium: "Woodspring Stadium",              tier: "National League South" },
  { id: "nls-24", name: "Worthing",              stadium: "Woodside Road",                   tier: "National League South" },
];

const NL_TIERS = ["National League", "National League North", "National League South"];

// ─── Non-League state ─────────────────────────────────────────────────────────
let nlFilter = "all";
let nlSearch = "";
let activeNlClubId = null;

function renderNonLeague() {
  const totalClubs   = DEFAULT_NL_CLUBS.length;
  const totalVisited = DEFAULT_NL_CLUBS.filter(c => state.nlVisits[c.id]).length;
  const pct = Math.round((totalVisited / totalClubs) * 100);

  document.getElementById("nl-header").innerHTML = `
    <div class="nl-stats-row">
      <div class="nl-stat-card">
        <div class="nl-stat-val">${totalVisited}</div>
        <div class="nl-stat-label">Visited</div>
      </div>
      <div class="nl-stat-card">
        <div class="nl-stat-val">${totalClubs - totalVisited}</div>
        <div class="nl-stat-label">Remaining</div>
      </div>
      <div class="nl-stat-card">
        <div class="nl-stat-val">${pct}%</div>
        <div class="nl-stat-label">Complete</div>
      </div>
      <div class="nl-progress-wrap">
        <div class="nl-progress-bar" style="width:${pct}%"></div>
      </div>
    </div>
  `;

  const query = nlSearch.toLowerCase();
  const content = document.getElementById("nl-content");
  content.innerHTML = "";

  NL_TIERS.forEach(tier => {
    let clubs = DEFAULT_NL_CLUBS.filter(c => c.tier === tier);

    // Apply filter
    if (nlFilter === "visited")   clubs = clubs.filter(c =>  state.nlVisits[c.id]);
    if (nlFilter === "unvisited") clubs = clubs.filter(c => !state.nlVisits[c.id]);
    if (query) clubs = clubs.filter(c =>
      c.name.toLowerCase().includes(query) || c.stadium.toLowerCase().includes(query)
    );

    if (!clubs.length) return;

    const visited = clubs.filter(c => state.nlVisits[c.id]).length;
    const tierPct = clubs.length ? Math.round((visited / clubs.length) * 100) : 0;

    const section = document.createElement("div");
    section.className = "nl-section";
    section.innerHTML = `
      <div class="nl-section-title">
        ${tier}
        <span class="nl-count-badge">${visited}/${clubs.length}</span>
        <div class="nl-tier-bar-wrap"><div class="nl-tier-bar" style="width:${tierPct}%"></div></div>
      </div>
      <div class="nl-club-list"></div>
    `;
    content.appendChild(section);

    const list = section.querySelector(".nl-club-list");
    clubs.forEach(club => {
      const isVisited = !!state.nlVisits[club.id];
      const visitData = state.nlVisits[club.id] || {};
      const notes = state.extras["nl_" + club.id]?.notes || "";
      const row = document.createElement("div");
      row.className = "nl-club-row" + (isVisited ? " nl-visited" : "");
      row.innerHTML = `
        <div class="nl-club-info" style="cursor:pointer">
          <span class="nl-club-name">${club.name}</span>
          <span class="nl-club-stadium">${club.stadium}</span>
          ${isVisited && visitData.date ? `<span class="nl-visit-date">📅 ${formatDate(visitData.date)}</span>` : ""}
          ${notes ? `<span class="nl-notes-badge">📝</span>` : ""}
        </div>
        <button class="nl-check${isVisited ? " nl-check-done" : ""}" data-nlid="${club.id}">
          ${isVisited ? "✓" : "○"}
        </button>
      `;

      // Click club info → open notes modal
      row.querySelector(".nl-club-info").addEventListener("click", () => openNlModal(club.id));

      // Click check button → toggle visit
      row.querySelector(".nl-check").addEventListener("click", e => {
        e.stopPropagation();
        if (state.nlVisits[club.id]) {
          delete state.nlVisits[club.id];
        } else {
          state.nlVisits[club.id] = { date: new Date().toISOString().slice(0, 10) };
        }
        save();
        renderNonLeague();
      });

      list.appendChild(row);
    });
  });
}

// ─── Non-League club modal ────────────────────────────────────────────────────
function openNlModal(id) {
  activeNlClubId = id;
  const club = DEFAULT_NL_CLUBS.find(c => c.id === id);
  const isVisited = !!state.nlVisits[id];
  const visitData = state.nlVisits[id] || {};
  const notes = state.extras["nl_" + id]?.notes || "";

  document.getElementById("nl-modal-title").textContent = club.name;
  document.getElementById("nl-modal-meta").innerHTML =
    `<div style="font-size:0.78rem;color:var(--muted)">🏟 ${club.stadium} · ${club.tier}</div>`;

  const visitSection = document.getElementById("nl-modal-visit-section");
  if (isVisited) {
    visitSection.innerHTML = `
      <div class="cm-visited-row">
        <span class="cm-visited-badge">✓ Visited${visitData.date ? " · " + formatDate(visitData.date) : ""}</span>
        <button class="cm-remove-btn" id="nl-remove-visit">Remove</button>
      </div>`;
    document.getElementById("nl-remove-visit").addEventListener("click", () => {
      delete state.nlVisits[id];
      save(); renderNonLeague(); closeNlModal();
    });
  } else {
    visitSection.innerHTML = `<button class="primary-btn" id="nl-mark-visited">Mark as Visited</button>`;
    document.getElementById("nl-mark-visited").addEventListener("click", () => {
      state.nlVisits[id] = { date: new Date().toISOString().slice(0, 10) };
      save(); renderNonLeague(); closeNlModal();
    });
  }

  document.getElementById("nl-modal-notes").value = notes;
  document.getElementById("nl-modal-overlay").classList.remove("hidden");
}

function closeNlModal() {
  if (activeNlClubId !== null) {
    const notes = document.getElementById("nl-modal-notes").value.trim();
    if (!state.extras["nl_" + activeNlClubId]) state.extras["nl_" + activeNlClubId] = {};
    state.extras["nl_" + activeNlClubId].notes = notes;
    save();
  }
  document.getElementById("nl-modal-overlay").classList.add("hidden");
  activeNlClubId = null;
}

document.getElementById("nl-modal-close").addEventListener("click", closeNlModal);
document.getElementById("nl-modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("nl-modal-overlay")) closeNlModal();
});

// Non-league search + filter
document.getElementById("nl-search").addEventListener("input", e => {
  nlSearch = e.target.value;
  renderNonLeague();
});
document.querySelectorAll(".nl-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nl-filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    nlFilter = btn.dataset.nlfilter;
    renderNonLeague();
  });
});

// ─── CSV Import ───────────────────────────────────────────────────────────────
document.getElementById("file-import-csv").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const lines = ev.target.result.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let matched = 0, notFound = [];
    lines.forEach(name => {
      const club = state.clubs.find(c =>
        c.name.toLowerCase() === name.toLowerCase() ||
        c.name.toLowerCase().includes(name.toLowerCase())
      );
      if (club && !state.visits[club.id]) {
        state.visits[club.id] = { date: "", notes: "" };
        matched++;
      } else if (!club) {
        notFound.push(name);
      }
    });
    save(); render();
    let msg = `Matched ${matched} clubs as visited.`;
    if (notFound.length) msg += `\n\nNot found (${notFound.length}):\n${notFound.slice(0,10).join(", ")}${notFound.length > 10 ? "…" : ""}`;
    alert(msg);
  };
  reader.readAsText(file);
  e.target.value = "";
});

// ─── Trip Planner ─────────────────────────────────────────────────────────────
let plannerInitialised = false;

// ── Planner tab switching ─────────────────────────────────────────────────────
document.querySelectorAll(".planner-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".planner-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.ptab;
    document.getElementById("ptab-find").classList.toggle("hidden", tab !== "find");
    document.getElementById("ptab-targets").classList.toggle("hidden", tab !== "targets");
    document.getElementById("ptab-games").classList.toggle("hidden", tab !== "games");
    if (tab === "targets") renderTargets();
    if (tab === "games")   renderGames();
  });
});

function initPlanner() {
  // Populate region dropdown once
  if (!plannerInitialised) {
    const sel = document.getElementById("planner-region");
    if (typeof REGIONS !== "undefined") {
      REGIONS.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.name;
        opt.textContent = r.emoji + " " + r.name;
        sel.appendChild(opt);
      });
    }
    // Wire up live filters
    ["planner-region","planner-division","planner-sort"].forEach(id => {
      document.getElementById(id).addEventListener("change", runPlanner);
    });
    document.getElementById("planner-account-only").addEventListener("change", runPlanner);

    // Target search
    const targetInput    = document.getElementById("target-search-input");
    const targetDropdown = document.getElementById("target-search-results");
    targetInput.addEventListener("input", () => {
      const q = targetInput.value.toLowerCase().trim();
      if (!q) { targetDropdown.classList.add("hidden"); return; }
      const matches = state.clubs
        .filter(c => c.name.toLowerCase().includes(q) && !state.visits[c.id])
        .slice(0, 8);
      if (!matches.length) { targetDropdown.classList.add("hidden"); return; }
      const DIV_COLOR = {"Premier League":"#7c3aed","Championship":"#e74c3c","League One":"#f39c12","League Two":"#27ae60"};
      targetDropdown.innerHTML = matches.map(c => {
        const alreadyTarget = (state.targets || []).some(t => t.id === c.id);
        return `<div class="target-search-item${alreadyTarget ? " target-already" : ""}" data-id="${c.id}">
          <span class="target-search-name">${c.name}</span>
          <span class="target-search-div" style="color:${DIV_COLOR[c.division]||'#888'}">${c.division}</span>
          ${alreadyTarget ? '<span class="target-search-added">Added ✓</span>' : ""}
        </div>`;
      }).join("");
      targetDropdown.classList.remove("hidden");
      targetDropdown.querySelectorAll(".target-search-item:not(.target-already)").forEach(item => {
        item.addEventListener("click", () => {
          const id = parseInt(item.dataset.id);
          if (!state.targets) state.targets = [];
          if (!state.targets.some(t => t.id === id)) {
            state.targets.push({ id, targetDate: "", note: "" });
            save();
          }
          targetInput.value = "";
          targetDropdown.classList.add("hidden");
          renderTargets();
        });
      });
    });
    document.addEventListener("click", e => {
      if (!targetInput.contains(e.target) && !targetDropdown.contains(e.target)) {
        targetDropdown.classList.add("hidden");
      }
    });

    plannerInitialised = true;
  }
  runPlanner();
}

function runPlanner() {
  const region      = document.getElementById("planner-region").value;
  const division    = document.getElementById("planner-division").value;
  const sortBy      = document.getElementById("planner-sort").value;
  const accountOnly = document.getElementById("planner-account-only").checked;
  const results     = document.getElementById("planner-results");

  const DIV_COLOR = { "Premier League":"#7c3aed","Championship":"#e74c3c","League One":"#f39c12","League Two":"#27ae60" };
  const DIFF_ORDER = { "Premier League": 1, "Championship": 2, "League One": 3, "League Two": 3 };

  // Get unvisited clubs
  let clubs = state.clubs.filter(c => !state.visits[c.id]);

  // Region filter
  if (region !== "all" && typeof REGIONS !== "undefined") {
    const r = REGIONS.find(r => r.name === region);
    if (r) clubs = clubs.filter(c => r.ids.includes(Number(c.id)));
  }

  // Division filter
  if (division !== "all") clubs = clubs.filter(c => c.division === division);

  // Account filter
  if (accountOnly) clubs = clubs.filter(c => state.extras[c.id]?.ticketAccount === "yes");

  if (!clubs.length) {
    results.innerHTML = `<div class="planner-empty">${accountOnly ? "No unvisited clubs with a ticketing account in this selection." : "No unvisited grounds match — great work!"}</div>`;
    return;
  }

  // Sort
  clubs = clubs.slice().sort((a, b) => {
    const ea = state.extras[a.id] || {}, eb = state.extras[b.id] || {};
    if (sortBy === "priority") {
      const pa = ea.priority || 0, pb = eb.priority || 0;
      return pb - pa || a.name.localeCompare(b.name);
    }
    if (sortBy === "distance" && homeLat) {
      const ca = typeof CLUB_COORDS !== "undefined" ? CLUB_COORDS[a.id] : null;
      const cb = typeof CLUB_COORDS !== "undefined" ? CLUB_COORDS[b.id] : null;
      const da = ca ? haversine(homeLat, homeLng, ca[0], ca[1]) : 9999;
      const db = cb ? haversine(homeLat, homeLng, cb[0], cb[1]) : 9999;
      return da - db;
    }
    if (sortBy === "easy") return DIFF_ORDER[a.division] - DIFF_ORDER[b.division] || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });

  const rows = clubs.map(club => {
    const color   = DIV_COLOR[club.division] || "#888";
    const extras  = state.extras[club.id] || {};
    const diff    = getDifficulty(club);
    const coords  = typeof CLUB_COORDS !== "undefined" ? CLUB_COORDS[club.id] : null;
    const distStr = (homeLat && coords)
      ? `<span class="planner-dist">${Math.round(haversine(homeLat, homeLng, coords[0], coords[1]))} km</span>`
      : "";

    return `<div class="planner-club-row" data-id="${club.id}">
      <div class="planner-club-left">
        <div class="planner-club-name">${club.name}${extras.priority ? ` <span class="planner-stars">${"★".repeat(extras.priority)}</span>` : ""}</div>
        <div class="planner-club-sub">
          <span style="color:${color};font-weight:600;font-size:0.75rem">${club.division}</span>
          <span class="planner-stadium">🏟 ${club.stadium}</span>
          ${distStr}
        </div>
      </div>
      <div class="planner-club-right">
        <span class="planner-diff-badge" style="background:${diff.color}">${diff.label}</span>
        ${extras.ticketAccount === "yes" ? '<span class="planner-acct">🎟 Account</span>' : ""}
        ${extras.ticketUrl ? `<a href="${extras.ticketUrl}" target="_blank" class="planner-ticket-link">Buy ↗</a>` : ""}
        <button class="planner-view-btn" data-id="${club.id}">View →</button>
      </div>
    </div>`;
  });

  results.innerHTML = `
    <div class="planner-summary">${clubs.length} unvisited ground${clubs.length !== 1 ? "s" : ""}</div>
    <div class="planner-club-list">${rows.join("")}</div>
  `;

  // Wire view buttons
  results.querySelectorAll(".planner-view-btn").forEach(btn => {
    btn.addEventListener("click", () => openClubModal(parseInt(btn.dataset.id)));
  });
}

// ─── 26/27 Targets ────────────────────────────────────────────────────────────
function renderTargets() {
  const targets = state.targets || [];
  const DIV_COLOR = {"Premier League":"#7c3aed","Championship":"#e74c3c","League One":"#f39c12","League Two":"#27ae60"};

  // Season pace calculation (26/27 season: Aug 2026 – May 2027)
  const seasonEnd  = new Date("2027-05-31");
  const now        = new Date();
  const weeksLeft  = Math.max(0, Math.round((seasonEnd - now) / (7 * 86400000)));
  const remaining  = targets.filter(t => !state.visits[t.id]).length;
  const paceNeeded = weeksLeft > 0 && remaining > 0
    ? (remaining / weeksLeft).toFixed(1)
    : null;

  // Summary
  const done  = targets.filter(t => state.visits[t.id]).length;
  const total = targets.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  const overdue = targets.filter(t => t.targetDate && t.targetDate < now.toISOString().slice(0,10) && !state.visits[t.id]);

  document.getElementById("targets-summary").innerHTML = total
    ? `<div class="targets-progress">
        <span class="targets-count"><strong>${done}</strong> of <strong>${total}</strong> targets visited</span>
        <div class="targets-bar-wrap"><div class="targets-bar" style="width:${pct}%"></div></div>
        <span class="targets-pct">${pct}%</span>
       </div>
       ${paceNeeded ? `<div class="targets-pace">📅 ${weeksLeft} weeks left in 26/27 — you need <strong>${paceNeeded} grounds/week</strong> to complete all targets</div>` : ""}
       ${overdue.length ? `<div class="targets-overdue-alert">⚠️ ${overdue.length} overdue target${overdue.length > 1 ? "s" : ""} — date passed without a visit</div>` : ""}
       <div class="targets-actions">
         <button class="targets-import-btn" id="btn-import-priority">⭐ Add all priority clubs</button>
       </div>`
    : `<p class="targets-empty-hint">Search for clubs below to add your 2026/27 targets.</p>
       <div class="targets-actions">
         <button class="targets-import-btn" id="btn-import-priority">⭐ Add all priority clubs</button>
       </div>`;

  // Wire import-from-priority button
  const importBtn = document.getElementById("btn-import-priority");
  if (importBtn) {
    importBtn.addEventListener("click", () => {
      const priorityClubs = state.clubs.filter(c =>
        (state.extras[c.id]?.priority || 0) >= 3 && !state.visits[c.id]
      );
      let added = 0;
      priorityClubs.forEach(c => {
        if (!state.targets.some(t => t.id === c.id)) {
          state.targets.push({ id: c.id, targetDate: "", note: "" });
          added++;
        }
      });
      if (added) { save(); renderTargets(); }
      else alert("No new ★★★+ unvisited clubs to add.");
    });
  }

  const list = document.getElementById("targets-list");
  if (!targets.length) { list.innerHTML = ""; return; }

  // Group by region if REGIONS available
  let groupedHtml = "";
  if (typeof REGIONS !== "undefined") {
    const regionMap = {};
    const unassigned = [];
    targets.forEach(t => {
      const r = REGIONS.find(r => r.ids.includes(Number(t.id)));
      if (r) {
        if (!regionMap[r.name]) regionMap[r.name] = { emoji: r.emoji, targets: [] };
        regionMap[r.name].targets.push(t);
      } else {
        unassigned.push(t);
      }
    });
    if (unassigned.length) regionMap["Other"] = { emoji: "📍", targets: unassigned };

    Object.entries(regionMap).forEach(([regionName, { emoji, targets: rTargets }]) => {
      const rdone = rTargets.filter(t => state.visits[t.id]).length;
      groupedHtml += `<div class="targets-region-group">
        <div class="targets-region-title">${emoji} ${regionName} <span class="targets-region-count">${rdone}/${rTargets.length}</span></div>
        ${buildTargetRows(rTargets, DIV_COLOR)}
      </div>`;
    });
  } else {
    // Sort: unvisited first, then by target date
    const sorted = [...targets].sort((a, b) => {
      const av = !!state.visits[a.id], bv = !!state.visits[b.id];
      if (av !== bv) return av ? 1 : -1;
      if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
      return a.targetDate ? -1 : b.targetDate ? 1 : 0;
    });
    groupedHtml = buildTargetRows(sorted, DIV_COLOR);
  }

  list.innerHTML = groupedHtml;
  wireTargetRows(list);
}

function buildTargetRows(targets, DIV_COLOR) {
  return targets.map(t => {
    const club    = state.clubs.find(c => c.id === t.id);
    if (!club) return "";
    const visited   = !!state.visits[t.id];
    const visitData = state.visits[t.id];
    const color     = DIV_COLOR[club.division] || "#888";
    const diff      = getDifficulty(club);
    const extras    = state.extras[t.id] || {};
    const today     = new Date().toISOString().slice(0, 10);
    const isOverdue = t.targetDate && t.targetDate < today && !visited;

    return `<div class="target-row${visited ? " target-done" : ""}${isOverdue ? " target-overdue" : ""}" data-tid="${t.id}">
      <div class="target-row-left">
        <div class="target-club-name">${visited ? "✓ " : ""}${club.name}${isOverdue ? ' <span class="target-overdue-badge">⚠️ Overdue</span>' : ""}${extras.matchRating ? ` <span class="target-match-rating">${"⭐".repeat(extras.matchRating)}</span>` : ""}</div>
        <div class="target-club-sub">
          <span style="color:${color};font-weight:600;font-size:0.75rem">${club.division}</span>
          <span class="target-stadium">🏟 ${club.stadium}</span>
          <span class="target-diff-badge" style="background:${diff.color}">${diff.label}</span>
          ${extras.ticketAccount === "yes" ? '<span class="target-acct">🎟 Account</span>' : ""}
          ${visited && visitData?.date ? `<span class="target-visited-date">Visited ${formatDate(visitData.date)}</span>` : ""}
          ${extras.visitedWith ? `<span class="target-with">👥 ${extras.visitedWith}</span>` : ""}
        </div>
        <div class="target-row-controls">
          <label class="target-date-label">Target date:
            <input type="date" class="target-date-input" data-tid="${t.id}" value="${t.targetDate || ""}" />
          </label>
          <input type="text" class="target-note-input" data-tid="${t.id}" value="${(t.note || "").replace(/"/g,'&quot;')}" placeholder="Add a note…" />
        </div>
      </div>
      <div class="target-row-actions">
        ${!visited
          ? `<button class="target-mark-btn" data-tid="${t.id}">Mark visited</button>`
          : `<button class="target-unmark-btn" data-tid="${t.id}">Remove visit</button>`}
        <button class="target-remove-btn" data-tid="${t.id}" title="Remove target">✕</button>
      </div>
    </div>`;
  }).join("");
}

function wireTargetRows(container) {
  container.querySelectorAll(".target-date-input").forEach(input => {
    input.addEventListener("change", () => {
      const id = parseInt(input.dataset.tid);
      const t = state.targets.find(t => t.id === id);
      if (t) { t.targetDate = input.value; save(); }
    });
  });
  container.querySelectorAll(".target-note-input").forEach(input => {
    input.addEventListener("blur", () => {
      const id = parseInt(input.dataset.tid);
      const t = state.targets.find(t => t.id === id);
      if (t) { t.note = input.value.trim(); save(); }
    });
  });
  container.querySelectorAll(".target-mark-btn").forEach(btn => {
    btn.addEventListener("click", () => openVisitModal(parseInt(btn.dataset.tid)));
  });
  container.querySelectorAll(".target-unmark-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.tid);
      showConfirmModal(`Remove visit record for ${state.clubs.find(c=>c.id===id)?.name}?`, () => {
        delete state.visits[id];
        save(); render(); renderTargets();
      });
    });
  });
  container.querySelectorAll(".target-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.tid);
      state.targets = state.targets.filter(t => t.id !== id);
      save(); renderTargets();
    });
  });
}

// ─── My Games ─────────────────────────────────────────────────────────────────
// A game object: { gid, clubId, date, time, opponent, attendance, seat, travel, notes, score, rating }

let gamesFilter = "all";
let editingGameId = null;
let gameRating = 0;
let gameAttendance = "yes";
let gameClubId = null;

function generateGid() {
  return "g" + Date.now() + Math.random().toString(36).slice(2, 6);
}

function renderGames() {
  const games = state.games || [];
  const today = new Date().toISOString().slice(0, 10);
  const DIV_COLOR = {"Premier League":"#7c3aed","Championship":"#e74c3c","League One":"#f39c12","League Two":"#27ae60"};

  // Summary stats
  const upcoming  = games.filter(g => g.date >= today && g.attendance === "yes").length;
  const attended  = games.filter(g => g.date < today  && g.attendance === "yes").length;
  const total     = games.length;

  const summaryEl = document.getElementById("games-summary");
  if (summaryEl) {
    summaryEl.innerHTML = total
      ? `<div class="games-stats-row">
           <div class="games-stat"><span class="games-stat-val">${total}</span><span class="games-stat-label">Planned</span></div>
           <div class="games-stat"><span class="games-stat-val" style="color:#27ae60">${attended}</span><span class="games-stat-label">Attended</span></div>
           <div class="games-stat"><span class="games-stat-val" style="color:#7c3aed">${upcoming}</span><span class="games-stat-label">Upcoming</span></div>
         </div>`
      : "";
  }

  // Filter
  let filtered = [...games];
  if (gamesFilter === "upcoming")  filtered = filtered.filter(g => g.date >= today);
  if (gamesFilter === "attending") filtered = filtered.filter(g => g.attendance === "yes");
  if (gamesFilter === "past")      filtered = filtered.filter(g => g.date < today);

  // Sort by date
  filtered.sort((a, b) => a.date.localeCompare(b.date));

  const list = document.getElementById("games-list");
  if (!list) return;

  if (!filtered.length) {
    list.innerHTML = `<div class="games-empty">${
      total === 0
        ? 'No games planned yet. Click <strong>+ Plan a Game</strong> to get started.'
        : 'No games match this filter.'
    }</div>`;
    return;
  }

  // Group by month
  const byMonth = {};
  filtered.forEach(g => {
    const key = g.date.slice(0, 7); // YYYY-MM
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(g);
  });

  let html = "";
  for (const [monthKey, monthGames] of Object.entries(byMonth)) {
    const [y, m] = monthKey.split("-");
    const monthLabel = new Date(parseInt(y), parseInt(m) - 1, 1)
      .toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    html += `<div class="games-month-group">
      <div class="games-month-header">${monthLabel}</div>
      <div class="games-month-list">`;

    monthGames.forEach(g => {
      const club = state.clubs.find(c => c.id === g.clubId);
      const clubName = club ? club.name : "Unknown Club";
      const stadium  = club ? club.stadium : "";
      const color    = club ? (DIV_COLOR[club.division] || "#888") : "#888";
      const isPast   = g.date < today;
      const isToday  = g.date === today;

      const attendClass = g.attendance === "yes" ? "attend-yes" : g.attendance === "maybe" ? "attend-maybe" : "attend-no";
      const attendLabel = g.attendance === "yes" ? "✓ Attending" : g.attendance === "maybe" ? "? Maybe" : "✗ Not going";

      const dateObj = new Date(g.date + "T12:00:00");
      const dateLabel = dateObj.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

      const ratingHtml = g.rating ? `<span class="game-card-rating">${"⭐".repeat(g.rating)}</span>` : "";
      const scoreHtml  = g.score  ? `<span class="game-card-score">${g.score}</span>` : "";

      html += `<div class="game-card${isPast ? " game-past" : ""}${isToday ? " game-today" : ""}" data-gid="${g.gid}">
        <div class="game-card-date-col">
          <div class="game-card-date">${dateLabel}</div>
          ${g.time ? `<div class="game-card-time">${g.time}</div>` : ""}
          <div class="game-card-attend ${attendClass}">${attendLabel}</div>
        </div>
        <div class="game-card-main">
          <div class="game-card-club" style="color:${color}">${clubName}</div>
          <div class="game-card-stadium">🏟 ${stadium}</div>
          ${g.opponent ? `<div class="game-card-opponent">vs ${g.opponent}</div>` : ""}
          <div class="game-card-meta">
            ${g.seat   ? `<span class="game-card-tag">🪑 ${g.seat}</span>` : ""}
            ${g.travel ? `<span class="game-card-tag">🚆 ${g.travel}</span>` : ""}
            ${scoreHtml}${ratingHtml}
          </div>
          ${g.notes ? `<div class="game-card-notes">${g.notes}</div>` : ""}
        </div>
        <button class="game-card-edit-btn" data-gid="${g.gid}" title="Edit">✏️</button>
      </div>`;
    });

    html += `</div></div>`;
  }

  list.innerHTML = html;

  list.querySelectorAll(".game-card-edit-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      openGameModal(btn.dataset.gid);
    });
  });
  list.querySelectorAll(".game-card").forEach(card => {
    card.addEventListener("click", () => openGameModal(card.dataset.gid));
  });
}

function openGameModal(gid) {
  const game = gid ? (state.games || []).find(g => g.gid === gid) : null;
  editingGameId = game ? game.gid : null;
  gameRating    = game?.rating || 0;
  gameAttendance = game?.attendance || "yes";
  gameClubId    = game?.clubId || null;

  const today = new Date().toISOString().slice(0, 10);

  document.getElementById("game-modal-title").textContent = game ? "Edit Game" : "Plan a Game";
  document.getElementById("game-date-input").value    = game?.date     || "";
  document.getElementById("game-time-input").value    = game?.time     || "15:00";
  document.getElementById("game-opponent-input").value = game?.opponent || "";
  document.getElementById("game-seat-input").value    = game?.seat     || "";
  document.getElementById("game-travel-input").value  = game?.travel   || "";
  document.getElementById("game-notes-input").value   = game?.notes    || "";
  document.getElementById("game-score-input").value   = game?.score    || "";

  // Club display
  const clubInput    = document.getElementById("game-club-input");
  const clubSelected = document.getElementById("game-club-selected");
  if (game?.clubId) {
    const club = state.clubs.find(c => c.id === game.clubId);
    clubInput.value = "";
    clubInput.classList.add("hidden");
    clubSelected.classList.remove("hidden");
    clubSelected.innerHTML = `<span class="game-club-name">${club?.name || "Unknown"}</span>
      <button class="game-club-clear" id="btn-clear-game-club">✕ Change</button>`;
    wireClearClubBtn();
  } else {
    clubInput.value = "";
    clubInput.classList.remove("hidden");
    clubSelected.classList.add("hidden");
    clubSelected.innerHTML = "";
  }

  // Attendance buttons
  document.querySelectorAll(".game-attend-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.attend === gameAttendance);
  });

  // Rating stars
  updateGameStars(gameRating);

  // Show result section if game date is in the past
  const gameDate = game?.date || "";
  const resultSection = document.getElementById("game-result-section");
  resultSection.classList.toggle("hidden", !gameDate || gameDate >= today);

  // Delete button
  document.getElementById("btn-delete-game").classList.toggle("hidden", !game);

  document.getElementById("game-modal-overlay").classList.remove("hidden");
}

function wireClearClubBtn() {
  const btn = document.getElementById("btn-clear-game-club");
  if (btn) {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      gameClubId = null;
      document.getElementById("game-club-input").value = "";
      document.getElementById("game-club-input").classList.remove("hidden");
      document.getElementById("game-club-selected").classList.add("hidden");
      document.getElementById("game-club-selected").innerHTML = "";
    });
  }
}

function updateGameStars(rating) {
  document.querySelectorAll(".game-star").forEach(s => {
    s.classList.toggle("active", parseInt(s.dataset.star) <= rating);
  });
}

function closeGameModal() {
  document.getElementById("game-modal-overlay").classList.add("hidden");
  document.getElementById("game-club-dropdown").classList.add("hidden");
  editingGameId = null;
  gameClubId    = null;
  gameRating    = 0;
  gameAttendance = "yes";
}

// Wire up game modal controls
document.getElementById("game-modal-close").addEventListener("click", closeGameModal);
document.getElementById("game-modal-cancel").addEventListener("click", closeGameModal);
document.getElementById("game-modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("game-modal-overlay")) closeGameModal();
});

document.getElementById("btn-add-game").addEventListener("click", () => openGameModal(null));

document.querySelectorAll(".game-attend-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    gameAttendance = btn.dataset.attend;
    document.querySelectorAll(".game-attend-btn").forEach(b => b.classList.toggle("active", b === btn));
  });
});

document.querySelectorAll(".game-star").forEach(star => {
  star.addEventListener("click", () => {
    const val = parseInt(star.dataset.star);
    gameRating = gameRating === val ? 0 : val;
    updateGameStars(gameRating);
  });
});

// Show result section when date is set to a past date
document.getElementById("game-date-input").addEventListener("change", e => {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("game-result-section").classList.toggle("hidden", !e.target.value || e.target.value >= today);
});

// Club search in game modal
(function() {
  const input    = document.getElementById("game-club-input");
  const dropdown = document.getElementById("game-club-dropdown");
  const DIV_COLOR = {"Premier League":"#7c3aed","Championship":"#e74c3c","League One":"#f39c12","League Two":"#27ae60"};

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { dropdown.classList.add("hidden"); return; }
    const matches = state.clubs.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) { dropdown.classList.add("hidden"); return; }
    dropdown.innerHTML = matches.map(c =>
      `<div class="target-search-item" data-id="${c.id}">
        <span class="target-search-name">${c.name}</span>
        <span class="target-search-div" style="color:${DIV_COLOR[c.division]||'#888'}">${c.division}</span>
      </div>`
    ).join("");
    dropdown.classList.remove("hidden");
    dropdown.querySelectorAll(".target-search-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = parseInt(item.dataset.id);
        gameClubId = id;
        const club = state.clubs.find(c => c.id === id);
        input.value = "";
        input.classList.add("hidden");
        const sel = document.getElementById("game-club-selected");
        sel.classList.remove("hidden");
        sel.innerHTML = `<span class="game-club-name">${club?.name || ""}</span>
          <button class="game-club-clear" id="btn-clear-game-club">✕ Change</button>`;
        wireClearClubBtn();
        dropdown.classList.add("hidden");
      });
    });
  });

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
})();

document.getElementById("btn-save-game").addEventListener("click", () => {
  const date     = document.getElementById("game-date-input").value;
  const opponent = document.getElementById("game-opponent-input").value.trim();

  if (!gameClubId) { alert("Please select a club."); return; }
  if (!date)       { alert("Please set a match date."); return; }

  const gameData = {
    gid:        editingGameId || generateGid(),
    clubId:     gameClubId,
    date,
    time:       document.getElementById("game-time-input").value,
    opponent,
    attendance: gameAttendance,
    seat:       document.getElementById("game-seat-input").value.trim(),
    travel:     document.getElementById("game-travel-input").value.trim(),
    notes:      document.getElementById("game-notes-input").value.trim(),
    score:      document.getElementById("game-score-input").value.trim(),
    rating:     gameRating,
  };

  if (!state.games) state.games = [];
  if (editingGameId) {
    const idx = state.games.findIndex(g => g.gid === editingGameId);
    if (idx !== -1) state.games[idx] = gameData;
  } else {
    state.games.push(gameData);
  }

  save();
  closeGameModal();
  renderGames();
});

document.getElementById("btn-delete-game").addEventListener("click", () => {
  if (!editingGameId) return;
  showConfirmModal("Delete this game plan?", () => {
    state.games = (state.games || []).filter(g => g.gid !== editingGameId);
    save();
    closeGameModal();
    renderGames();
  });
});

// Games filter buttons
document.querySelectorAll(".games-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".games-filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    gamesFilter = btn.dataset.gfilter;
    renderGames();
  });
});
// ─── Combined total in dashboard ──────────────────────────────────────────────
function getTotalGroundsVisited() {
  const the92 = Object.keys(state.visits).length;
  const nl    = Object.keys(state.nlVisits).length;
  return the92 + nl;
}

// ─── "Next up" suggestion ─────────────────────────────────────────────────────
function getNextUpClub() {
  const unvisited = state.clubs.filter(c => !state.visits[c.id]);
  if (!unvisited.length) return null;

  // If user has manually selected a next-up team, use it (unless they've since visited it)
  if (state.nextUpId) {
    const manual = unvisited.find(c => c.id === state.nextUpId);
    if (manual) return manual;
    // They've visited it — clear the selection
    state.nextUpId = null;
    save();
  }
  return null; // no auto-suggestion; user must pick
}

function renderNextUp() {
  const unvisited = state.clubs.filter(c => !state.visits[c.id]);
  if (!unvisited.length) return "";

  const club = getNextUpClub();

  if (!club) {
    return `<div class="dash-card dash-card-nextup" id="nextup-card-wrap">
      <div class="dash-label" style="margin-bottom:6px">Next up</div>
      <div style="font-size:0.8rem;opacity:0.6;margin-bottom:8px">None selected</div>
      <button class="nextup-change-btn" id="nextup-change-btn">Pick a team</button>
      <div id="nextup-picker" class="nextup-picker hidden">
        <input type="text" id="nextup-search" class="nextup-search-input" placeholder="Search teams…" autocomplete="off" />
        <div id="nextup-search-results" class="nextup-search-results"></div>
      </div>
    </div>`;
  }

  const coords = typeof CLUB_COORDS !== "undefined" ? CLUB_COORDS[club.id] : null;
  const dist = (homeLat && coords) ? haversine(homeLat, homeLng, coords[0], coords[1]) : 9999;
  const diff = getDifficulty(club);
  const distStr = (homeLat && dist < 9999) ? ` · ${Math.round(dist)} km` : "";

  return `<div class="dash-card dash-card-nextup" id="nextup-card-wrap">
    <div class="dash-label" style="margin-bottom:4px">Next up <button class="nextup-change-btn" id="nextup-change-btn" title="Change team">✎</button></div>
    <div class="dash-val nextup-club-name" style="font-size:1rem;cursor:pointer" id="nextup-card" data-id="${club.id}">${club.name}</div>
    <div style="font-size:0.72rem;margin-top:4px;opacity:0.6">${club.division}${distStr}</div>
    <div style="margin-top:6px"><span style="background:${diff.color};color:#fff;font-size:0.68rem;padding:2px 7px;border-radius:8px;font-weight:600">${diff.label}</span></div>
    <div id="nextup-picker" class="nextup-picker hidden" style="margin-top:8px">
      <input type="text" id="nextup-search" class="nextup-search-input" placeholder="Search teams…" autocomplete="off" />
      <div id="nextup-search-results" class="nextup-search-results"></div>
    </div>
  </div>`;
}

let _nextUpDocListener = null;

function wireNextUpPicker() {
  const changeBtn = document.getElementById("nextup-change-btn");
  const picker    = document.getElementById("nextup-picker");
  const searchInput = document.getElementById("nextup-search");
  const resultsEl   = document.getElementById("nextup-search-results");
  if (!changeBtn || !picker) return;

  const DIV_COLOR = {"Premier League":"#7c3aed","Championship":"#e74c3c","League One":"#f39c12","League Two":"#27ae60"};

  changeBtn.addEventListener("click", e => {
    e.stopPropagation();
    picker.classList.toggle("hidden");
    if (!picker.classList.contains("hidden")) {
      searchInput.value = "";
      resultsEl.innerHTML = "";
      searchInput.focus();
      showNextUpResults("");
    }
  });

  function showNextUpResults(q) {
    const unvisited = state.clubs.filter(c => !state.visits[c.id]);
    const matches = q
      ? unvisited.filter(c => c.name.toLowerCase().includes(q))
      : unvisited.slice(0, 10);
    const clearRow = state.nextUpId && !q
      ? `<div class="nextup-result-item nextup-clear-item" id="nextup-clear-btn">✕ Clear selection</div>`
      : "";
    if (!matches.length && !clearRow) { resultsEl.innerHTML = '<div class="nextup-no-results">No matches</div>'; return; }
    resultsEl.innerHTML = clearRow + matches.map(c => `
      <div class="nextup-result-item${state.nextUpId === c.id ? " nextup-selected" : ""}" data-id="${c.id}">
        <span class="nextup-result-name">${c.name}</span>
        <span class="nextup-result-div" style="color:${DIV_COLOR[c.division]||'#888'}">${c.division}</span>
        ${state.nextUpId === c.id ? '<span class="nextup-result-check">✓</span>' : ""}
      </div>`).join("");
    const clearBtn = resultsEl.querySelector("#nextup-clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.nextUpId = null;
        save();
        renderDashboard();
      });
    }
    resultsEl.querySelectorAll(".nextup-result-item:not(#nextup-clear-btn)").forEach(item => {
      item.addEventListener("click", () => {
        state.nextUpId = parseInt(item.dataset.id);
        save();
        renderDashboard();
      });
    });
  }

  searchInput.addEventListener("input", () => showNextUpResults(searchInput.value.toLowerCase().trim()));

  // Remove previous document listener before adding a new one
  if (_nextUpDocListener) document.removeEventListener("click", _nextUpDocListener);
  _nextUpDocListener = e => {
    const wrap = document.getElementById("nextup-card-wrap");
    if (wrap && !wrap.contains(e.target)) {
      const p = document.getElementById("nextup-picker");
      if (p) p.classList.add("hidden");
    }
  };
  document.addEventListener("click", _nextUpDocListener);

  // Wire the club name click to open modal
  const nameEl = document.getElementById("nextup-card");
  if (nameEl) {
    nameEl.addEventListener("click", () => openClubModal(parseInt(nameEl.dataset.id)));
  }
}

// ─── Stats page ───────────────────────────────────────────────────────────────
function renderStats() {
  const el = document.getElementById("stats-content");
  if (!el) return;

  const visitedClubs = state.clubs.filter(c => state.visits[c.id]?.date);
  const coords = typeof CLUB_COORDS !== "undefined" ? CLUB_COORDS : {};

  if (!visitedClubs.length) {
    el.innerHTML = '<div class="stats-empty">No visits logged yet — start ticking off grounds!</div>';
    return;
  }

  // ── Year by year ──────────────────────────────────────────────────────────
  const byYear = {};
  const clubsByYear = {};
  visitedClubs.forEach(c => {
    const y = state.visits[c.id].date.slice(0, 4);
    byYear[y] = (byYear[y] || 0) + 1;
    if (!clubsByYear[y]) clubsByYear[y] = [];
    clubsByYear[y].push(c.name);
  });
  const years = Object.keys(byYear).sort();
  const maxY = Math.max(...Object.values(byYear));
  const yearBars = years.map(y => {
    const names = clubsByYear[y].slice(0, 5).join(", ") + (clubsByYear[y].length > 5 ? `… +${clubsByYear[y].length - 5} more` : "");
    return `
    <div class="stat-bar-col" title="${y}: ${byYear[y]} ground${byYear[y] !== 1 ? "s" : ""}\n${names}">
      <div class="stat-bar-val">${byYear[y]}</div>
      <div class="stat-bar" style="height:${Math.round((byYear[y]/maxY)*120)}px;background:#7c3aed"></div>
      <div class="stat-bar-label">${y}</div>
    </div>`;
  }).join("");

  // ── Division completion timeline ──────────────────────────────────────────
  const divTimeline = DIVISIONS.map(div => {
    const divClubs = state.clubs.filter(c => c.division === div);
    const divVisited = divClubs.filter(c => state.visits[c.id]);
    const done = divVisited.length;
    const total = divClubs.length;
    const pct = Math.round((done / total) * 100);
    const colorClass = DIV_COLORS[div];

    // Find completion date (date of last visit that completed the division)
    let completedDate = null;
    if (done === total) {
      const dates = divVisited.map(c => state.visits[c.id].date).filter(Boolean).sort();
      completedDate = dates[dates.length - 1];
    }

    return `<div class="stat-div-row">
      <div class="stat-div-name ${colorClass}">${div}</div>
      <div class="stat-div-bar-wrap">
        <div class="stat-div-bar ${colorClass.replace('-color','')}-bar" style="width:${pct}%"></div>
      </div>
      <div class="stat-div-info">
        ${done === total
          ? `<span class="stat-complete">✓ Complete${completedDate ? " · " + formatDate(completedDate) : ""}</span>`
          : `<span class="stat-remaining">${done}/${total} · ${total - done} remaining</span>`}
      </div>
    </div>`;
  }).join("");

  // ── Geography stats ───────────────────────────────────────────────────────
  const withCoords = visitedClubs.filter(c => coords[c.id]);
  let geoHtml = '<div class="stat-geo-empty">Log more visits to see geography stats.</div>';
  if (withCoords.length) {
    const northernmost = withCoords.reduce((a, b) => coords[a.id][0] > coords[b.id][0] ? a : b);
    const southernmost = withCoords.reduce((a, b) => coords[a.id][0] < coords[b.id][0] ? a : b);
    const furthestFromLondon = withCoords.reduce((a, b) => {
      const da = haversine(51.5, -0.1, coords[a.id][0], coords[a.id][1]);
      const db = haversine(51.5, -0.1, coords[b.id][0], coords[b.id][1]);
      return da > db ? a : b;
    });
    const distFL = Math.round(haversine(51.5, -0.1, coords[furthestFromLondon.id][0], coords[furthestFromLondon.id][1]));

    // Unique regions visited
    let regionsVisited = 0;
    if (typeof REGIONS !== "undefined") {
      regionsVisited = REGIONS.filter(r =>
        r.ids.some(id => state.visits[id])
      ).length;
    }

    geoHtml = `
      <div class="stat-geo-grid">
        <div class="stat-geo-card">
          <div class="stat-geo-icon">⬆️</div>
          <div class="stat-geo-val">${northernmost.name}</div>
          <div class="stat-geo-label">Most northerly</div>
        </div>
        <div class="stat-geo-card">
          <div class="stat-geo-icon">⬇️</div>
          <div class="stat-geo-val">${southernmost.name}</div>
          <div class="stat-geo-label">Most southerly</div>
        </div>
        <div class="stat-geo-card">
          <div class="stat-geo-icon">📍</div>
          <div class="stat-geo-val">${furthestFromLondon.name}</div>
          <div class="stat-geo-label">Furthest from London · ${distFL} km</div>
        </div>
        <div class="stat-geo-card">
          <div class="stat-geo-icon">🗺</div>
          <div class="stat-geo-val">${regionsVisited}</div>
          <div class="stat-geo-label">Regions visited</div>
        </div>
      </div>`;
  }

  // ── Grounds per month heatmap ─────────────────────────────────────────────
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const byMonth = Array(12).fill(0);
  visitedClubs.forEach(c => {
    const d = state.visits[c.id].date;
    if (d) byMonth[parseInt(d.slice(5,7)) - 1]++;
  });
  const maxM = Math.max(...byMonth, 1);
  const monthCells = MONTHS.map((m, i) => {
    const count = byMonth[i];
    const intensity = count / maxM;
    const bg = count === 0 ? "rgba(0,0,0,0.05)" : `rgba(39,174,96,${0.15 + intensity * 0.85})`;
    return `<div class="stat-month-cell" style="background:${bg}">
      <div class="stat-month-name">${m}</div>
      <div class="stat-month-count">${count}</div>
    </div>`;
  }).join("");

  // ── Personal records ─────────────────────────────────────────────────────
  // Best year
  const bestYear = years.length ? years.reduce((a, b) => byYear[a] >= byYear[b] ? a : b) : null;

  // Most visited division
  const divCounts = DIVISIONS.map(div => ({
    div,
    count: state.clubs.filter(c => c.division === div && state.visits[c.id]).length
  }));
  const topDiv = divCounts.reduce((a, b) => a.count >= b.count ? a : b);

  // Most visited region
  let topRegion = null;
  if (typeof REGIONS !== "undefined") {
    const regionCounts = REGIONS.map(r => ({
      name: r.name, emoji: r.emoji,
      count: r.ids.filter(id => state.visits[id]).length
    }));
    topRegion = regionCounts.reduce((a, b) => a.count >= b.count ? a : b);
  }

  // Furthest from home (CM16 4HW)
  let furthestFromHome = null, furthestHomeDist = 0;
  if (withCoords.length) {
    withCoords.forEach(c => {
      const d = haversine(homeLat, homeLng, coords[c.id][0], coords[c.id][1]);
      if (d > furthestHomeDist) { furthestHomeDist = d; furthestFromHome = c; }
    });
  }

  const recordsHtml = `
    <div class="stat-records-grid">
      ${bestYear ? `<div class="stat-record-card">
        <div class="stat-record-icon">📅</div>
        <div class="stat-record-val">${bestYear}</div>
        <div class="stat-record-label">Best year · ${byYear[bestYear]} grounds</div>
      </div>` : ""}
      ${topDiv.count > 0 ? `<div class="stat-record-card">
        <div class="stat-record-icon">🏆</div>
        <div class="stat-record-val">${topDiv.div.replace(" League","").replace("Premier","PL")}</div>
        <div class="stat-record-label">Most visited division · ${topDiv.count} grounds</div>
      </div>` : ""}
      ${topRegion && topRegion.count > 0 ? `<div class="stat-record-card">
        <div class="stat-record-icon">${topRegion.emoji}</div>
        <div class="stat-record-val">${topRegion.name}</div>
        <div class="stat-record-label">Favourite region · ${topRegion.count} grounds</div>
      </div>` : ""}
      ${furthestFromHome ? `<div class="stat-record-card">
        <div class="stat-record-icon">🚗</div>
        <div class="stat-record-val">${furthestFromHome.name}</div>
        <div class="stat-record-label">Furthest from home · ${Math.round(furthestHomeDist)} km</div>
      </div>` : ""}
    </div>`;

  // ── Streak calendar (GitHub-style contribution grid) ─────────────────────
  // Show last 52 weeks
  const calendarDates = new Set(
    visitedClubs.map(c => state.visits[c.id].date).filter(Boolean)
  );
  const calEnd   = new Date();
  const calStart = new Date(calEnd.getTime() - 364 * 86400000);
  // Align to Monday
  calStart.setDate(calStart.getDate() - calStart.getDay() + 1);

  const weeks = [];
  let cur = new Date(calStart);
  while (cur <= calEnd) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const iso = cur.toISOString().slice(0, 10);
      week.push({ date: iso, count: calendarDates.has(iso) ? 1 : 0 });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  const calCells = weeks.map(week =>
    `<div class="cal-week">${week.map(day =>
      `<div class="cal-day${day.count ? " cal-day-active" : ""}" title="${day.date}"></div>`
    ).join("")}</div>`
  ).join("");

  // ── Division completion race ──────────────────────────────────────────────
  const raceRows = DIVISIONS.map(div => {
    const divClubs   = state.clubs.filter(c => c.division === div);
    const divVisited = divClubs.filter(c => state.visits[c.id]).length;
    const remaining  = divClubs.length - divVisited;
    const pct        = Math.round((divVisited / divClubs.length) * 100);
    const colorClass = DIV_COLORS[div];
    const barColor   = { "pl-color":"#7c3aed","champ-color":"#e74c3c","l1-color":"#f39c12","l2-color":"#27ae60" }[colorClass];
    return `<div class="race-row">
      <div class="race-div-name ${colorClass}">${div}</div>
      <div class="race-bar-wrap">
        <div class="race-bar" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div class="race-info">
        ${remaining === 0
          ? `<span class="race-complete">✓ Done!</span>`
          : `<span class="race-remaining">${remaining} to go</span>`}
      </div>
    </div>`;
  }).join("");

  el.innerHTML = `
    <div class="stats-section">
      <div class="stats-section-title">Year by Year <span class="stats-tip">Hover a bar for details</span></div>
      <div class="stat-bar-chart">${yearBars}</div>
    </div>
    <div class="stats-section">
      <div class="stats-section-title">Division Progress</div>
      <div class="stat-div-list">${divTimeline}</div>
    </div>
    <div class="stats-section">
      <div class="stats-section-title">Division Completion Race</div>
      <div class="race-list">${raceRows}</div>
    </div>
    <div class="stats-section">
      <div class="stats-section-title">Personal Records</div>
      ${recordsHtml}
    </div>
    <div class="stats-section">
      <div class="stats-section-title">Geography</div>
      ${geoHtml}
    </div>
    <div class="stats-section">
      <div class="stats-section-title">Visits by Month</div>
      <div class="stat-month-grid">${monthCells}</div>
    </div>
    <div class="stats-section">
      <div class="stats-section-title">Activity Calendar <span class="stats-tip">Last 52 weeks</span></div>
      <div class="cal-grid">${calCells}</div>
      <div class="cal-legend"><span>Less</span><div class="cal-day"></div><div class="cal-day cal-day-active"></div><span>More</span></div>
    </div>
    <div class="stats-section">
      <div class="stats-section-title">Badges</div>
      ${renderBadges()}
    </div>
  `;
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function renderBadges() {
  const visited      = state.clubs.filter(c => state.visits[c.id]);
  const visitedIds   = new Set(visited.map(c => c.id));
  const visitCount   = visited.length;
  const allDates     = visited.map(c => state.visits[c.id].date).filter(Boolean).sort();
  const coords       = typeof CLUB_COORDS !== "undefined" ? CLUB_COORDS : {};

  // Helper: clubs in a division visited
  const divDone = div => state.clubs.filter(c => c.division === div && visitedIds.has(c.id)).length;
  const divTotal = div => state.clubs.filter(c => c.division === div).length;

  // Welsh grounds
  const welshIds = [41, 44, 51, 85];
  const welshDone = welshIds.filter(id => visitedIds.has(id)).length;

  // North East
  const neIds = [15, 17, 30];
  const neDone = neIds.filter(id => visitedIds.has(id)).length;

  // London grounds (from REGIONS)
  const londonIds = typeof REGIONS !== "undefined"
    ? (REGIONS.find(r => r.name === "London")?.ids || []) : [];
  const londonDone = londonIds.filter(id => visitedIds.has(id)).length;

  // South West
  const swIds = [53, 61, 72, 75, 90, 23];
  const swDone = swIds.filter(id => visitedIds.has(id)).length;

  // Ticket accounts
  const accountCount = state.clubs.filter(c => state.extras[c.id]?.ticketAccount === "yes").length;

  // Priority stars set
  const priorityCount = state.clubs.filter(c => (state.extras[c.id]?.priority || 0) > 0).length;

  // Targets completed
  const targetsTotal = (state.targets || []).length;
  const targetsDone  = (state.targets || []).filter(t => visitedIds.has(t.id)).length;
  const allTargetsDone = targetsTotal > 0 && targetsDone === targetsTotal;

  // Multi-ground day (2+ visits same date)
  const byDate = {};
  allDates.forEach(d => { byDate[d] = (byDate[d] || 0) + 1; });
  const multiGroundDay = Object.values(byDate).some(v => v >= 2);

  // Monthly regular (visited at least 1 ground in 6 consecutive months)
  let monthlyRegular = false;
  if (allDates.length >= 6) {
    const months = [...new Set(allDates.map(d => d.slice(0, 7)))].sort();
    let streak = 1;
    for (let i = 1; i < months.length; i++) {
      const [py, pm] = months[i-1].split("-").map(Number);
      const [cy, cm] = months[i].split("-").map(Number);
      const diff = (cy - py) * 12 + (cm - pm);
      if (diff === 1) { streak++; if (streak >= 6) { monthlyRegular = true; break; } }
      else streak = 1;
    }
  }

  // Fast starter (10 grounds in first 30 days of tracking)
  let fastStarter = false;
  if (allDates.length >= 10) {
    const first = new Date(allDates[0]);
    const tenth = new Date(allDates[9]);
    fastStarter = (tenth - first) / 86400000 <= 30;
  }

  // All regions visited
  let allRegions = false;
  if (typeof REGIONS !== "undefined") {
    allRegions = REGIONS.every(r => r.ids.some(id => visitedIds.has(id)));
  }

  // Define all badges
  const BADGES = [
    // Completion
    { id:"the92",    emoji:"🏆", label:"The 92",            color:"#f39c12", desc:"Visit all 92 grounds",                    earned: visitCount >= 92 },
    { id:"pl",       emoji:"🥇", label:"PL Complete",       color:"#7c3aed", desc:"All 20 Premier League grounds",            earned: divDone("Premier League") >= divTotal("Premier League") },
    { id:"champ",    emoji:"🥈", label:"Championship",      color:"#e74c3c", desc:"All 24 Championship grounds",             earned: divDone("Championship") >= divTotal("Championship") },
    { id:"l1",       emoji:"🥉", label:"League One",        color:"#f39c12", desc:"All 24 League One grounds",               earned: divDone("League One") >= divTotal("League One") },
    { id:"l2",       emoji:"🎖", label:"League Two",        color:"#27ae60", desc:"All 24 League Two grounds",               earned: divDone("League Two") >= divTotal("League Two") },
    { id:"regions",  emoji:"🌍", label:"All Regions",       color:"#16a085", desc:"Visit a ground in every region",          earned: allRegions },
    // Volume
    { id:"first",    emoji:"🌱", label:"First Ground",      color:"#27ae60", desc:"Log your first visit",                    earned: visitCount >= 1 },
    { id:"ten",      emoji:"🔟", label:"Ten Down",          color:"#2980b9", desc:"10 grounds visited",                      earned: visitCount >= 10 },
    { id:"quarter",  emoji:"🎯", label:"Quarter Century",   color:"#8e44ad", desc:"25 grounds visited",                      earned: visitCount >= 25 },
    { id:"halftime", emoji:"⚽", label:"Half Time",         color:"#e74c3c", desc:"46 grounds — half the Football League",   earned: visitCount >= 46 },
    { id:"fifty",    emoji:"🌟", label:"50 Club",           color:"#f39c12", desc:"50 grounds visited",                      earned: visitCount >= 50 },
    { id:"seventy5", emoji:"🔥", label:"75 Grounds",        color:"#e67e22", desc:"75 grounds visited",                      earned: visitCount >= 75 },
    { id:"ninety",   emoji:"🏅", label:"90 Minutes",        color:"#c0392b", desc:"90 grounds visited",                      earned: visitCount >= 90 },
    // Geography
    { id:"welsh",    emoji:"🐉", label:"Welsh Dragon",      color:"#c0392b", desc:"All 4 Welsh grounds",                     earned: welshDone >= 4 },
    { id:"northeast",emoji:"⚓", label:"NE Explorer",       color:"#2c3e50", desc:"Newcastle, Sunderland & Middlesbrough",   earned: neDone >= 3 },
    { id:"london",   emoji:"🏙", label:"London Calling",    color:"#7f8c8d", desc:"All London grounds visited",              earned: londonIds.length > 0 && londonDone >= londonIds.length },
    { id:"southwest",emoji:"🌊", label:"SW Safari",         color:"#1abc9c", desc:"All South West grounds",                  earned: swDone >= swIds.length },
    // Planning
    { id:"tickets",  emoji:"🎟", label:"Ticket Master",     color:"#8e44ad", desc:"Ticket account at 10+ clubs",             earned: accountCount >= 10 },
    { id:"planner",  emoji:"🗓", label:"Season Planner",    color:"#2980b9", desc:"Completed all 26/27 targets",             earned: allTargetsDone },
    { id:"priority", emoji:"⭐", label:"Prioritiser",       color:"#f39c12", desc:"Priority stars set on 20+ clubs",         earned: priorityCount >= 20 },
    // Activity
    { id:"doubleday",emoji:"📅", label:"Double Header",     color:"#16a085", desc:"2+ grounds in a single day",              earned: multiGroundDay },
    { id:"monthly",  emoji:"🗓", label:"Monthly Regular",   color:"#2980b9", desc:"At least 1 ground every month for 6 months", earned: monthlyRegular },
    { id:"fast",     emoji:"🚀", label:"Fast Starter",      color:"#e74c3c", desc:"10 grounds in your first 30 days",        earned: fastStarter },
  ];

  const earnedCount = BADGES.filter(b => b.earned).length;

  const badgeHtml = BADGES.map(b => `
    <div class="badge-card${b.earned ? " badge-earned" : " badge-locked"}" title="${b.desc}">
      <div class="badge-icon" style="${b.earned ? `background:${b.color}` : ""}">
        <span>${b.emoji}</span>
      </div>
      <div class="badge-label">${b.label}</div>
      ${!b.earned ? `<div class="badge-locked-desc">${b.desc}</div>` : ""}
    </div>`).join("");

  return `
    <div class="badges-summary">${earnedCount} / ${BADGES.length} badges earned</div>
    <div class="badges-grid">${badgeHtml}</div>
  `;
}

document.getElementById("btn-reset-all").addEventListener("click", () => {
  if (confirm("Reset ALL data? This will clear all visits and restore the default club list. This cannot be undone.")) {
    state.clubs    = DEFAULT_CLUBS.map(c => ({ ...c }));
    state.visits   = {};
    state.extras   = {};
    state.nlVisits = {};
    save(); render(); renderEditList();
    alert("All data has been reset.");
  }
});

// ─── View toggle ──────────────────────────────────────────────────────────────
document.getElementById("btn-view-grid").addEventListener("click", () => {
  viewMode = "grid";
  document.getElementById("btn-view-grid").classList.add("active");
  document.getElementById("btn-view-list").classList.remove("active");
  render();
});
document.getElementById("btn-view-list").addEventListener("click", () => {
  viewMode = "list";
  document.getElementById("btn-view-list").classList.add("active");
  document.getElementById("btn-view-grid").classList.remove("active");
  render();
});

// ─── Undo toast ───────────────────────────────────────────────────────────────
let undoTimer = null;

function showUndo(msg, undoFn) {
  clearTimeout(undoTimer);
  undoStack = undoFn;
  document.getElementById("undo-toast-msg").textContent = msg;
  document.getElementById("undo-toast").classList.remove("hidden");
  undoTimer = setTimeout(() => {
    document.getElementById("undo-toast").classList.add("hidden");
    undoStack = null;
  }, 5000);
}

document.getElementById("undo-toast-btn").addEventListener("click", () => {
  if (undoStack) { undoStack(); undoStack = null; }
  clearTimeout(undoTimer);
  document.getElementById("undo-toast").classList.add("hidden");
});

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
document.addEventListener("keydown", e => {
  // Escape — close any open modal
  if (e.key === "Escape") {
    // Dismiss celebration if open
    const celebOverlay = document.getElementById("celebration-overlay");
    if (celebOverlay && !celebOverlay.classList.contains("hidden")) {
      dismissCelebration();
      return;
    }
    ["club-modal-overlay","date-modal-overlay","modal-overlay","milestone-overlay",
     "nl-modal-overlay"].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains("hidden")) {
        el.classList.add("hidden");
        if (id === "club-modal-overlay") closeClubModal(true);
      }
    });
    return;
  }
  // Don't fire shortcuts when typing in an input
  if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;

  // V — mark/open visit modal for focused card (if club modal is open)
  if (e.key === "v" || e.key === "V") {
    if (activeClubModalId !== null) {
      const visited = !!state.visits[activeClubModalId];
      if (!visited) {
        saveClubModalExtras();
        closeClubModal(false);
        openVisitModal(activeClubModalId);
      }
    }
  }
});

// ─── Overdue target check ─────────────────────────────────────────────────────
function getOverdueTargets() {
  const today = new Date().toISOString().slice(0, 10);
  return (state.targets || []).filter(t =>
    t.targetDate && t.targetDate < today && !state.visits[t.id]
  );
}

// ─── In-app confirm modal ─────────────────────────────────────────────────────
let confirmCallback = null;

function showConfirmModal(msg, onConfirm) {
  confirmCallback = onConfirm;
  document.getElementById("confirm-modal-msg").textContent = msg;
  document.getElementById("confirm-modal-overlay").classList.remove("hidden");
}

document.getElementById("confirm-modal-yes").addEventListener("click", () => {
  document.getElementById("confirm-modal-overlay").classList.add("hidden");
  if (confirmCallback) { confirmCallback(); confirmCallback = null; }
});
document.getElementById("confirm-modal-no").addEventListener("click", () => {
  document.getElementById("confirm-modal-overlay").classList.add("hidden");
  confirmCallback = null;
});
document.getElementById("confirm-modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("confirm-modal-overlay")) {
    document.getElementById("confirm-modal-overlay").classList.add("hidden");
    confirmCallback = null;
  }
});

// ─── Dark mode ────────────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem("92club-theme");
if (savedTheme) document.body.setAttribute("data-theme", savedTheme);
document.getElementById("btn-dark-mode").addEventListener("click", () => {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  document.body.setAttribute("data-theme", isDark ? "light" : "dark");
  localStorage.setItem("92club-theme", isDark ? "light" : "dark");
  document.getElementById("btn-dark-mode").textContent = isDark ? "🌙" : "☀️";
});
if (savedTheme === "dark") document.getElementById("btn-dark-mode").textContent = "☀️";

// ─── Init ─────────────────────────────────────────────────────────────────────
load();
render();

// ─── Celebration — confetti + overlay on every new ground ─────────────────────
// roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === "number") r = [r, r, r, r];
    const [tl, tr, br, bl] = r;
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
    return this;
  };
}

const celebCanvas = document.getElementById("confetti-canvas");
const celebCtx    = celebCanvas.getContext("2d");
let celebParticles = [];
let celebAnimFrame = null;

function resizeCelebCanvas() {
  celebCanvas.width  = window.innerWidth;
  celebCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCelebCanvas);
resizeCelebCanvas();

const CELEB_COLORS = [
  "#27ae60","#2ecc71","#f39c12","#e74c3c","#7c3aed",
  "#3498db","#e67e22","#1abc9c","#f1c40f","#fff"
];

function spawnConfetti(count) {
  const W = celebCanvas.width;
  const H = celebCanvas.height;
  for (let i = 0; i < count; i++) {
    const isRibbon = Math.random() > 0.5;
    celebParticles.push({
      x: W * 0.5 + (Math.random() - 0.5) * W * 0.6,
      y: -20 - Math.random() * H * 0.3,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      w: isRibbon ? (Math.random() * 4 + 2) : (Math.random() * 8 + 5),
      h: isRibbon ? (Math.random() * 16 + 10) : (Math.random() * 8 + 5),
      color: CELEB_COLORS[Math.floor(Math.random() * CELEB_COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.12 + Math.random() * 0.08,
      drag: 0.98 + Math.random() * 0.015,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.03 + Math.random() * 0.05,
      opacity: 1,
      isRibbon,
    });
  }
}

function spawnBurst() {
  // Burst from center-ish
  const W = celebCanvas.width;
  const H = celebCanvas.height;
  const cx = W / 2;
  const cy = H * 0.35;
  for (let i = 0; i < 60; i++) {
    const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.3;
    const speed = 6 + Math.random() * 10;
    celebParticles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      w: Math.random() * 7 + 4,
      h: Math.random() * 7 + 4,
      color: CELEB_COLORS[Math.floor(Math.random() * CELEB_COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 15,
      gravity: 0.15 + Math.random() * 0.1,
      drag: 0.96 + Math.random() * 0.02,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.04 + Math.random() * 0.06,
      opacity: 1,
      isRibbon: Math.random() > 0.6,
    });
  }
}

function animateConfetti() {
  const W = celebCanvas.width;
  const H = celebCanvas.height;
  celebCtx.clearRect(0, 0, W, H);

  for (let i = celebParticles.length - 1; i >= 0; i--) {
    const p = celebParticles[i];
    p.vy += p.gravity;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.x += p.vx + Math.sin(p.wobble) * 1.5;
    p.y += p.vy;
    p.rotation += p.rotSpeed;
    p.wobble += p.wobbleSpeed;

    // Fade out near bottom
    if (p.y > H * 0.8) {
      p.opacity -= 0.02;
    }

    if (p.opacity <= 0 || p.y > H + 50) {
      celebParticles.splice(i, 1);
      continue;
    }

    celebCtx.save();
    celebCtx.translate(p.x, p.y);
    celebCtx.rotate((p.rotation * Math.PI) / 180);
    celebCtx.globalAlpha = p.opacity;
    celebCtx.fillStyle = p.color;

    if (p.isRibbon) {
      // Wavy ribbon
      celebCtx.beginPath();
      celebCtx.moveTo(-p.w / 2, -p.h / 2);
      celebCtx.quadraticCurveTo(p.w, 0, -p.w / 2, p.h / 2);
      celebCtx.quadraticCurveTo(-p.w, 0, -p.w / 2, -p.h / 2);
      celebCtx.fill();
    } else {
      // Rounded rectangle
      const r = Math.min(p.w, p.h) * 0.2;
      celebCtx.beginPath();
      celebCtx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, r);
      celebCtx.fill();
    }

    celebCtx.restore();
  }

  if (celebParticles.length > 0) {
    celebAnimFrame = requestAnimationFrame(animateConfetti);
  } else {
    celebCtx.clearRect(0, 0, W, H);
    celebAnimFrame = null;
  }
}

function startConfetti() {
  if (celebAnimFrame) cancelAnimationFrame(celebAnimFrame);
  celebParticles = [];
  resizeCelebCanvas();

  // Initial burst
  spawnBurst();
  // Rain of confetti in waves
  spawnConfetti(80);
  setTimeout(() => spawnConfetti(50), 400);
  setTimeout(() => spawnConfetti(30), 900);

  celebAnimFrame = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  // Let existing particles finish naturally — just stop spawning
}

// ── Celebration overlay ───────────────────────────────────────────────────────
let celebTimeout = null;

function showCelebration(clubId) {
  const club = state.clubs.find(c => c.id === clubId);
  if (!club) return;

  const visited = Object.keys(state.visits).length;
  const total   = state.clubs.length;
  const pct     = Math.round((visited / total) * 100);
  const remaining = total - visited;

  // Populate card
  document.getElementById("celeb-club").textContent    = club.name;
  document.getElementById("celeb-stadium").textContent  = "🏟 " + club.stadium;
  document.getElementById("celeb-count").textContent    = visited + " / " + total;
  document.getElementById("celeb-progress-label").textContent =
    remaining === 0
      ? "THE 92 COMPLETE! 🏆"
      : remaining + " ground" + (remaining !== 1 ? "s" : "") + " to go";

  // Fun titles based on count
  const titles = [
    "Ground Logged!",
    "Another One Down!",
    "Ticked Off!",
    "Get In!",
    "Lovely Stuff!",
    "On The Board!",
    "Boom!",
    "That's The One!",
    "Scenes!",
    "What A Ground!",
  ];
  document.getElementById("celeb-title").textContent =
    titles[Math.floor(Math.random() * titles.length)];

  // Show overlay
  const overlay = document.getElementById("celebration-overlay");
  overlay.classList.remove("hidden");

  // Animate progress bar after a tick (so the CSS transition fires)
  requestAnimationFrame(() => {
    document.getElementById("celeb-progress-bar").style.width = pct + "%";
  });

  // Fire confetti
  startConfetti();

  // Auto-dismiss after 5 seconds
  clearTimeout(celebTimeout);
  celebTimeout = setTimeout(() => dismissCelebration(), 5000);
}

function dismissCelebration() {
  clearTimeout(celebTimeout);
  const overlay = document.getElementById("celebration-overlay");
  overlay.classList.add("hidden");
  // Reset progress bar for next time
  document.getElementById("celeb-progress-bar").style.width = "0%";
  stopConfetti();
}

document.getElementById("celeb-dismiss").addEventListener("click", dismissCelebration);
document.getElementById("celebration-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("celebration-overlay")) dismissCelebration();
});
