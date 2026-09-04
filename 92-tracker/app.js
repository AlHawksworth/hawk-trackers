// ─── 92 Club Tracker - Full Functionality (Restored) ──────────────────────────
console.log("🔥 92 TRACKER VERSION 2024-09-04-16:00 LOADED");

// ─── Default club data (2025-26 season) ───────────────────────────────────────
const DEFAULT_CLUBS = [
  // Premier League (20)
  { id: 1,  name: "Arsenal",                   stadium: "Emirates Stadium",              division: "Premier League" },
  { id: 2,  name: "Aston Villa",               stadium: "Villa Park",                    division: "Premier League" },
  { id: 3,  name: "Bournemouth",               stadium: "Dean Court",                    division: "Premier League" },
  { id: 4,  name: "Brentford",                 stadium: "Brentford Community Stadium",   division: "Premier League" },
  { id: 5,  name: "Brighton & Hove Albion",    stadium: "Falmer Stadium",                division: "Premier League" },
  { id: 6,  name: "Burnley",                   stadium: "Turf Moor",                     division: "Championship" },
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
  { id: 19, name: "West Ham United",           stadium: "London Stadium",                division: "Championship" },
  { id: 20, name: "Wolverhampton Wanderers",   stadium: "Molineux Stadium",              division: "Championship" },

  // Championship (24)
  { id: 21, name: "Birmingham City",           stadium: "St Andrew's",                   division: "Championship" },
  { id: 22, name: "Blackburn Rovers",          stadium: "Ewood Park",                    division: "Championship" },
  { id: 23, name: "Bristol City",              stadium: "Ashton Gate",                   division: "Championship" },
  { id: 24, name: "Charlton Athletic",         stadium: "The Valley",                    division: "Championship" },
  { id: 25, name: "Coventry City",             stadium: "Coventry Building Society Arena", division: "Premier League" },
  { id: 26, name: "Derby County",              stadium: "Pride Park Stadium",            division: "Championship" },
  { id: 27, name: "Hull City",                 stadium: "MKM Stadium",                   division: "Premier League" },
  { id: 28, name: "Ipswich Town",              stadium: "Portman Road",                  division: "Premier League" },
  { id: 29, name: "Leicester City",            stadium: "King Power Stadium",            division: "League One" },
  { id: 30, name: "Middlesbrough",             stadium: "Riverside Stadium",             division: "Championship" },
  { id: 31, name: "Millwall",                  stadium: "The Den",                       division: "Championship" },
  { id: 32, name: "Norwich City",              stadium: "Carrow Road",                   division: "Championship" },
  { id: 33, name: "Oxford United",             stadium: "Kassam Stadium",                division: "League One" },
  { id: 34, name: "Portsmouth",                stadium: "Fratton Park",                  division: "Championship" },
  { id: 35, name: "Preston North End",         stadium: "Deepdale",                      division: "Championship" },
  { id: 36, name: "Queens Park Rangers",       stadium: "Loftus Road",                   division: "Championship" },
  { id: 37, name: "Sheffield United",          stadium: "Bramall Lane",                  division: "Championship" },
  { id: 38, name: "Sheffield Wednesday",       stadium: "Hillsborough Stadium",          division: "League One" },
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
  { id: 48, name: "Bolton Wanderers",          stadium: "Toughsheet Community Stadium",  division: "Championship" },
  { id: 49, name: "Bradford City",             stadium: "Valley Parade",                 division: "League One" },
  { id: 50, name: "Burton Albion",             stadium: "Pirelli Stadium",               division: "League One" },
  { id: 51, name: "Cardiff City",              stadium: "Cardiff City Stadium",          division: "Championship" },
  { id: 52, name: "Doncaster Rovers",          stadium: "Eco-Power Stadium",             division: "League One" },
  { id: 53, name: "Exeter City",               stadium: "St James Park",                 division: "League Two" },
  { id: 54, name: "Huddersfield Town",         stadium: "Kirklees Stadium",              division: "League One" },
  { id: 55, name: "Leyton Orient",             stadium: "Brisbane Road",                 division: "League One" },
  { id: 56, name: "Lincoln City",              stadium: "Sincil Bank",                   division: "Championship" },
  { id: 57, name: "Luton Town",                stadium: "Kenilworth Road",               division: "League One" },
  { id: 58, name: "Mansfield Town",            stadium: "Field Mill",                    division: "League One" },
  { id: 59, name: "Northampton Town",          stadium: "Sixfields Stadium",             division: "League Two" },
  { id: 60, name: "Peterborough United",       stadium: "London Road Stadium",           division: "League One" },
  { id: 61, name: "Plymouth Argyle",           stadium: "Home Park",                     division: "League One" },
  { id: 62, name: "Port Vale",                 stadium: "Vale Park",                     division: "League Two" },
  { id: 63, name: "Reading",                   stadium: "Madejski Stadium",              division: "League One" },
  { id: 64, name: "Rotherham United",          stadium: "New York Stadium",              division: "League Two" },
  { id: 65, name: "Stevenage",                 stadium: "Broadhall Way",                 division: "League One" },
  { id: 66, name: "Stockport County",          stadium: "Edgeley Park",                  division: "League One" },
  { id: 67, name: "Wigan Athletic",            stadium: "Brick Community Stadium",       division: "League One" },
  { id: 68, name: "Wycombe Wanderers",         stadium: "Adams Park",                    division: "League One" },

  // League Two (24)
  { id: 69, name: "Accrington Stanley",        stadium: "Crown Ground",                  division: "League Two" },
  { id: 70, name: "Barnet",                    stadium: "The Hive Stadium",              division: "League Two" },
  { id: 71, name: "Rochdale",                   stadium: "Spotland Stadium",              division: "League Two" },
  { id: 72, name: "Bristol Rovers",            stadium: "Memorial Stadium",              division: "League Two" },
  { id: 73, name: "Bromley",                   stadium: "Hayes Lane",                    division: "League One" },
  { id: 74, name: "Cambridge United",          stadium: "Abbey Stadium",                 division: "League One" },
  { id: 75, name: "Cheltenham Town",           stadium: "Whaddon Road",                  division: "League Two" },
  { id: 76, name: "Chesterfield",              stadium: "SMH Group Stadium",             division: "League Two" },
  { id: 77, name: "Colchester United",         stadium: "Colchester Community Stadium",  division: "League Two" },
  { id: 78, name: "Crawley Town",              stadium: "Broadfield Stadium",            division: "League Two" },
  { id: 79, name: "Crewe Alexandra",           stadium: "Gresty Road",                   division: "League Two" },
  { id: 80, name: "Fleetwood Town",            stadium: "Highbury Stadium",              division: "League Two" },
  { id: 81, name: "Gillingham",                stadium: "Priestfield Stadium",           division: "League Two" },
  { id: 82, name: "Grimsby Town",              stadium: "Blundell Park",                 division: "League Two" },
  { id: 83, name: "York City",                  stadium: "York Community Stadium",        division: "League Two" },
  { id: 84, name: "Milton Keynes Dons",        stadium: "Stadium MK",                    division: "League One" },
  { id: 85, name: "Newport County",            stadium: "Rodney Parade",                 division: "League Two" },
  { id: 86, name: "Notts County",              stadium: "Meadow Lane",                   division: "League One" },
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

// ─── Persistence ──────────────────────────────────────────────────────────────
function save() {
  const toSave = { ...state, _dataVersion: 8 };
  localStorage.setItem("92club", JSON.stringify(toSave));
  updateTimestamp();
}

// ─── Data loading ─────────────────────────────────────────────────────────────
function updateLastUpdated() {
  const lastUpdated = localStorage.getItem('92club_last_updated');
  const element = document.getElementById('last-updated');
  if (!element) return;
  
  if (lastUpdated) {
    const date = new Date(parseInt(lastUpdated));
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let timeAgo;
    if (diffMins < 1) timeAgo = 'Just now';
    else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
    else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
    else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
    else timeAgo = date.toLocaleDateString();
    
    element.textContent = `Last updated: ${timeAgo}`;
  } else {
    element.textContent = 'Last updated: Never';
  }
}

function updateTimestamp() {
  localStorage.setItem('92club_last_updated', Date.now().toString());
  updateLastUpdated();
}

function load() {
  const raw = localStorage.getItem("92club");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      state.clubs = parsed.clubs || DEFAULT_CLUBS.map(c => ({ ...c }));
      state.visits = parsed.visits || {};
      state.extras = parsed.extras || {};
      state.nlVisits = parsed.nlVisits || {};
      state.targets = parsed.targets || [];
      state.games = parsed.games || [];
      state.nextUpId = parsed.nextUpId || null;
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
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  const query = searchQuery.toLowerCase();
  const grid = document.getElementById("main-grid");

  if (!grid) return;

  // Show skeleton if no data
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
    }

    if (clubs.length === 0) return;
    anyVisible = true;

    const divVisited = clubs.filter(c => state.visits[c.id]).length;
    const divTotal = clubs.length;
    const divPct = divTotal ? Math.round((divVisited / divTotal) * 100) : 0;
    const section = document.createElement("div");
    section.className = "division-section";
    const colorClass = DIV_COLORS[div];
    const gridClass = viewMode === "list" ? "clubs-list" : "clubs-grid";
    section.innerHTML = `
      <div class="division-header ${colorClass}">
        <h2>${div}</h2>
        <div class="div-count"><span>${divVisited}/${divTotal}</span></div>
      </div>
      <div class="${gridClass}">
        ${clubs.map(club => {
          const visited = !!state.visits[club.id];
          const divBorderClass = div === "Premier League" ? "div-border-pl" :
                                 div === "Championship" ? "div-border-champ" :
                                 div === "League One" ? "div-border-l1" : "div-border-l2";
          return `
            <div class="club-card ${divBorderClass}${visited ? ' visited' : ''}" data-id="${club.id}">
              ${visited ? '<div class="check-icon">✓</div>' : ""}
              <div class="div-tag ${colorClass}">${div}</div>
              <div class="club-name">${club.name}</div>
              <div class="club-stadium">${club.stadium}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    grid.appendChild(section);

    // Add click handlers
    section.querySelectorAll('.club-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const visited = !!state.visits[id];
        if (visited) {
          openClubModal(id);
        } else {
          openVisitModal(id);
        }
      });
    });
  });

  if (!anyVisible) {
    grid.innerHTML = '<div class="empty-state">No clubs match your filters.</div>';
  }
}

// ─── Visit Modal ──────────────────────────────────────────────────────────────
function openVisitModal(id) {
  pendingVisitId = id;
  const club = state.clubs.find(c => c.id === id);
  document.getElementById("date-modal-title").textContent = `Mark ${club?.name || "Club"} as Visited`;
  document.getElementById("visit-date-input").value = "";
  document.getElementById("visit-notes-input").value = "";
  document.getElementById("date-modal-overlay").classList.remove("hidden");
}

function handleCardClick(id, isVisited) {
  if (isVisited) {
    openClubModal(id);
  } else {
    openVisitModal(id);
  }
}

// ─── Club Modal ───────────────────────────────────────────────────────────────
let activeClubModalId = null;

function openClubModal(id) {
  activeClubModalId = id;
  const club = state.clubs.find(c => c.id === id);
  const extras = state.extras[id] || {};
  
  document.getElementById("club-modal-title").textContent = club.name;
  document.getElementById("club-modal-meta").innerHTML = `
    <div>${club.stadium}</div>
    <div>${club.division}</div>
  `;
  
  const visitSection = document.getElementById("club-modal-visit-section");
  if (state.visits[id]) {
    const visit = state.visits[id];
    visitSection.innerHTML = `
      <div class="cm-visited-badge">✓ Visited</div>
      <div class="cm-visit-details">
        <div>${formatDate(visit.date)}</div>
        ${visit.notes ? `<div class="cm-visit-notes">${visit.notes}</div>` : ''}
      </div>
      <button class="cm-remove-btn" id="cm-remove-visit">Remove Visit</button>
    `;
    document.getElementById("cm-remove-visit").addEventListener("click", () => {
      const club = state.clubs.find(c => c.id === id);
      if (confirm(`Remove visit record for ${club.name}?`)) {
        delete state.visits[id];
        save();
        render();
        closeClubModal();
      }
    });
  } else {
    visitSection.innerHTML = `
      <button class="cm-visit-btn" id="cm-mark-visited">Mark as Visited</button>
    `;
    document.getElementById("cm-mark-visited").addEventListener("click", () => {
      closeClubModal(false);
      openVisitModal(id);
    });
  }

  document.getElementById("club-modal-overlay").classList.remove("hidden");
}

function closeClubModal(doSave = true) {
  document.getElementById("club-modal-overlay").classList.add("hidden");
  activeClubModalId = null;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
document.getElementById("btn-confirm-visit").addEventListener("click", () => {
  const dateInput = document.getElementById("visit-date-input");
  const notesInput = document.getElementById("visit-notes-input");
  
  if (!dateInput.value) {
    alert("Please enter a visit date");
    return;
  }

  state.visits[pendingVisitId] = {
    date: dateInput.value,
    notes: notesInput.value.trim()
  };
  
  save();
  render();
  
  document.getElementById("date-modal-overlay").classList.add("hidden");
  pendingVisitId = null;
});

document.getElementById("btn-cancel-visit").addEventListener("click", () => {
  document.getElementById("date-modal-overlay").classList.add("hidden");
  pendingVisitId = null;
});

document.getElementById("club-modal-close").addEventListener("click", () => closeClubModal());

// Search functionality
document.getElementById("search").addEventListener("input", e => {
  searchQuery = e.target.value;
  render();
});

// Filter buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

// Division buttons
document.querySelectorAll(".div-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".div-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeDiv = btn.dataset.div;
    render();
  });
});

// Sort dropdown
document.getElementById("sort-select").addEventListener("change", e => {
  sortOrder = e.target.value;
  render();
});

// View toggle
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

// ─── Dark mode toggle ─────────────────────────────────────────────────────────
document.getElementById("btn-dark-mode").addEventListener("click", () => {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  document.body.setAttribute("data-theme", isDark ? "light" : "dark");
  localStorage.setItem("92club-theme", isDark ? "light" : "dark");
  document.getElementById("btn-dark-mode").textContent = isDark ? "🌙" : "☀️";
});

const savedTheme = localStorage.getItem("92club-theme");
if (savedTheme) {
  document.body.setAttribute("data-theme", savedTheme);
  if (savedTheme === "dark") document.getElementById("btn-dark-mode").textContent = "☀️";
}

// ─── Initialization ───────────────────────────────────────────────────────────
function initializeApp() {
  console.log("Initializing 92 Tracker...");
  updateLastUpdated();
  load();
  render();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}