// ─── Hawkbology: Football Match Tracker ───────────────────────────────────────
// State
let matches = [];
let upcoming = [];
let editingMatchIdx = null;
let currentRating = 0;
let darkMode = false;
let mapInstance = null;

// ─── Persistence ──────────────────────────────────────────────────────────────
const LS_KEY = "hawkbology";
const LS_UPCOMING = "hawkbology_upcoming";

function updateLastUpdated() {
  const lastUpdated = localStorage.getItem('hawkbology_last_updated');
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
  localStorage.setItem('hawkbology_last_updated', Date.now().toString());
  updateLastUpdated();
}

function save() {
  if (typeof FireSync !== "undefined") {
    FireSync.save(LS_KEY, matches);
  } else {
    localStorage.setItem(LS_KEY, JSON.stringify(matches));
  }
  localStorage.setItem(LS_UPCOMING, JSON.stringify(upcoming));
  updateTimestamp();
  
  // Hawk Services Integration
  if (typeof HawkServices !== "undefined") {
    HawkServices.analytics.trackEvent('hawkbology', 'save', 'matches', matches.length);
    HawkServices.sync.queueSync('hawkbology', 'update', { matches: matches.length, upcoming: upcoming.length });
    HawkServices.userProfile.updateStats('hawkbology', matches.length);
  }
}

function load() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try { matches = JSON.parse(raw); } catch (e) {
      matches = INITIAL_MATCHES.map(m => ({ ...m, id: crypto.randomUUID() }));
    }
  } else {
    matches = INITIAL_MATCHES.map(m => ({ ...m, id: crypto.randomUUID() }));
    save();
  }
  // Merge any new INITIAL_MATCHES entries that aren't already in localStorage
  mergeInitialMatches();
  // Load upcoming
  const upRaw = localStorage.getItem(LS_UPCOMING);
  if (upRaw) { try { upcoming = JSON.parse(upRaw); } catch(e) { upcoming = []; } }
  // Cloud sync
  if (typeof FireSync !== "undefined") {
    FireSync.load(LS_KEY, (cloudData) => {
      if (cloudData && Array.isArray(cloudData) && cloudData.length > 0) {
        matches = cloudData;
        mergeInitialMatches();
        renderAll();
      }
    });
  }
}

function mergeInitialMatches() {
  let added = 0;
  INITIAL_MATCHES.forEach(im => {
    const exists = matches.some(m => m.date === im.date && m.home === im.home && m.away === im.away && m.stadium === im.stadium);
    if (!exists) {
      matches.push({ ...im, id: crypto.randomUUID() });
      added++;
    }
  });
  if (added > 0) save();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
function getYear(d) { return d ? d.slice(0, 4) : "Unknown"; }
function getResult(m) {
  if (m.homeScore == null || m.awayScore == null) return null;
  if (m.homeScore > m.awayScore) return "H";
  if (m.homeScore < m.awayScore) return "A";
  return "D";
}
function getUniqueGrounds() {
  const map = {};
  matches.forEach(m => { if (!map[m.stadium]) map[m.stadium] = []; map[m.stadium].push(m); });
  return map;
}
function getUniqueTeams() {
  const map = {};
  matches.forEach(m => { [m.home, m.away].forEach(t => { map[t] = (map[t] || 0) + 1; }); });
  return map;
}
function getUniqueCompetitions() {
  const set = new Set();
  matches.forEach(m => { if (m.competition) set.add(m.competition); });
  return [...set].sort();
}
function getYears() {
  const set = new Set();
  matches.forEach(m => set.add(getYear(m.date)));
  return [...set].sort().reverse();
}
function getWDL() {
  let w = 0, d = 0, l = 0;
  matches.forEach(m => { const r = getResult(m); if (r === "H") w++; else if (r === "A") l++; else if (r === "D") d++; });
  return { w, d, l };
}
function getMilestones() {
  const milestones = [];
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));
  [50, 100, 150, 200, 250, 300, 350, 400, 450, 500].forEach(n => {
    if (sorted.length >= n) milestones.push({ type: "match", n, match: sorted[n - 1] });
  });
  // Ground milestones
  const groundsSeen = new Set();
  sorted.forEach((m, i) => {
    groundsSeen.add(m.stadium);
    if ([25, 50, 75, 100, 125, 150, 175, 200].includes(groundsSeen.size)) {
      milestones.push({ type: "ground", n: groundsSeen.size, match: m });
    }
  });
  return milestones;
}

// ─── Header Stats & Milestones ────────────────────────────────────────────────
function updateHeaderStats() {
  document.getElementById("stat-total").textContent = `${matches.length} Games`;
  document.getElementById("stat-grounds").textContent = `${Object.keys(getUniqueGrounds()).length} Grounds`;
  const { w, d, l } = getWDL();
  document.getElementById("stat-record").textContent = `W${w} D${d} L${l}`;
}

function renderMilestones() {
  const el = document.getElementById("milestones-banner");
  const milestones = getMilestones();
  if (!milestones.length) { el.classList.add("hidden"); return; }
  const latest = milestones[milestones.length - 1];
  const label = latest.type === "match" ? `🎉 ${latest.n}th match` : `🏟 ${latest.n}th ground`;
  el.innerHTML = `<span class="milestone-badge">${label}</span> ${latest.match.home} vs ${latest.match.away} · ${formatDate(latest.match.date)}`;
  el.classList.remove("hidden");
}

function renderOnThisDay() {
  const el = document.getElementById("on-this-day");
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const suffix = `-${mm}-${dd}`;
  const otd = matches.filter(m => m.date && m.date.endsWith(suffix));
  if (!otd.length) { el.classList.add("hidden"); return; }
  el.innerHTML = `<div class="otd-title">📅 On This Day</div>` +
    otd.sort((a,b) => a.date.localeCompare(b.date)).map(m =>
      `<div class="otd-match"><span class="otd-year">${getYear(m.date)}</span> ${m.home} ${m.homeScore ?? "?"}–${m.awayScore ?? "?"} ${m.away} <span class="otd-comp">${m.competition || ""}</span></div>`
    ).join("");
  el.classList.remove("hidden");
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function renderDashboard() {
  updateHeaderStats();
  renderMilestones();
  renderOnThisDay();
  renderDashboardCards();
  renderRecentMatches();
  renderYearChart();
  renderTopGrounds();
  renderTopTeams();
}

function renderDashboardCards() {
  const el = document.getElementById("dashboard-cards");
  const grounds = Object.keys(getUniqueGrounds()).length;
  const teams = Object.keys(getUniqueTeams()).length;
  const comps = getUniqueCompetitions().length;
  const years = getYears();
  const span = years.length > 1 ? `${years[years.length - 1]}–${years[0]}` : (years[0] || "—");
  let totalGoals = 0;
  matches.forEach(m => { totalGoals += (m.homeScore || 0) + (m.awayScore || 0); });
  const avgGoals = matches.length ? (totalGoals / matches.length).toFixed(1) : "0";
  const intlStadiums = {
    "Stade de Genève":"Switzerland","Stadion Wankdorf":"Switzerland","Stockhorn Arena":"Switzerland",
    "AAMI Park":"Australia","Mohammed Bin Zayed Stadium":"UAE",
    "Gillette Stadium":"USA","Geodis Park":"USA",
    "Philips Stadion":"Netherlands","BZA Gröpelingen Platz 4":"Germany",
    "Volksparkstadion":"Germany","Grünwalder Stadion":"Germany","WWK ARENA":"Germany",
    "Stadio Arena Garibaldi":"Italy","Estadio La Rosaleda":"Spain",
    "The SMISA Stadium":"Scotland","Celtic Park":"Scotland","Galabank":"Scotland",
    "Europa Point Stadium":"Gibraltar","Cardiff City Stadium":"Wales",
  };
  const countrySet = new Set(["England"]);
  matches.forEach(m => { if (intlStadiums[m.stadium]) countrySet.add(intlStadiums[m.stadium]); });
  el.innerHTML = `
    <div class="dash-card accent-purple"><div class="dash-val">${matches.length}</div><div class="dash-label">Total Matches</div></div>
    <div class="dash-card accent-green"><div class="dash-val">${grounds}</div><div class="dash-label">Unique Grounds</div></div>
    <div class="dash-card accent-blue"><div class="dash-val">${teams}</div><div class="dash-label">Teams Watched</div></div>
    <div class="dash-card accent-orange"><div class="dash-val">${comps}</div><div class="dash-label">Competitions</div></div>
    <div class="dash-card accent-red"><div class="dash-val">${totalGoals}</div><div class="dash-label">Goals Seen (${avgGoals}/game)</div></div>
    <div class="dash-card accent-teal"><div class="dash-val">${countrySet.size}</div><div class="dash-label">Countries</div></div>
    <div class="dash-card accent-pink"><div class="dash-val">${span}</div><div class="dash-label">Year Span</div></div>
    <div class="dash-card accent-amber"><div class="dash-val">${getYears().length}</div><div class="dash-label">Calendar Years</div></div>
  `;
}

function renderRecentMatches() {
  const el = document.getElementById("recent-matches");
  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  if (!sorted.length) { el.innerHTML = '<div class="empty-msg">No matches yet.</div>'; return; }
  el.innerHTML = sorted.map(m => `
    <div class="recent-row" data-id="${m.id}">
      <div class="recent-date">${formatDate(m.date)}</div>
      <div class="recent-teams">${m.home} <span class="score">${m.homeScore ?? ""}–${m.awayScore ?? ""}</span> ${m.away}</div>
      <div class="recent-comp">${m.competition || ""}</div>
      ${m.rating ? `<div class="recent-rating">${"★".repeat(m.rating)}${"☆".repeat(5-m.rating)}</div>` : ""}
    </div>
  `).join("");
  el.querySelectorAll(".recent-row").forEach(row => { row.addEventListener("click", () => openEditMatch(row.dataset.id)); });
}

function renderYearChart() {
  const el = document.getElementById("year-chart");
  const yearMap = {};
  matches.forEach(m => { const y = getYear(m.date); yearMap[y] = (yearMap[y] || 0) + 1; });
  const years = Object.keys(yearMap).sort();
  const max = Math.max(...Object.values(yearMap), 1);
  el.innerHTML = years.map(y => `<div class="bar-row"><span class="bar-label">${y}</span><div class="bar-track"><div class="bar-fill" style="width:${(yearMap[y]/max)*100}%"></div></div><span class="bar-val">${yearMap[y]}</span></div>`).join("");
}

function renderTopGrounds() {
  const el = document.getElementById("top-grounds");
  const grounds = getUniqueGrounds();
  const sorted = Object.entries(grounds).sort((a,b) => b[1].length - a[1].length).slice(0, 10);
  const max = sorted.length ? sorted[0][1].length : 1;
  el.innerHTML = sorted.map(([name, ms]) => `<div class="bar-row clickable" data-ground="${name}"><span class="bar-label">${name}</span><div class="bar-track"><div class="bar-fill ground-fill" style="width:${(ms.length/max)*100}%"></div></div><span class="bar-val">${ms.length}</span></div>`).join("");
  el.querySelectorAll(".bar-row.clickable").forEach(row => { row.addEventListener("click", () => openGroundModal(row.dataset.ground)); });
}

function renderTopTeams() {
  const el = document.getElementById("top-teams");
  const teams = getUniqueTeams();
  const sorted = Object.entries(teams).sort((a,b) => b[1] - a[1]).slice(0, 10);
  const max = sorted.length ? sorted[0][1] : 1;
  el.innerHTML = sorted.map(([name, count]) => `<div class="bar-row"><span class="bar-label">${name}</span><div class="bar-track"><div class="bar-fill team-fill" style="width:${(count/max)*100}%"></div></div><span class="bar-val">${count}</span></div>`).join("");
}

// ─── Matches Page ─────────────────────────────────────────────────────────────
function renderMatches() {
  const el = document.getElementById("matches-list");
  const query = (document.getElementById("match-search").value || "").toLowerCase();
  const yearFilter = document.getElementById("filter-year").value;
  const compFilter = document.getElementById("filter-comp").value;
  const resultFilter = document.getElementById("filter-result").value;
  let filtered = [...matches].sort((a, b) => b.date.localeCompare(a.date));
  if (query) filtered = filtered.filter(m => m.home.toLowerCase().includes(query) || m.away.toLowerCase().includes(query) || m.stadium.toLowerCase().includes(query) || (m.competition||"").toLowerCase().includes(query) || (m.notes||"").toLowerCase().includes(query) || (m.companions||[]).join(" ").toLowerCase().includes(query));
  if (yearFilter !== "all") filtered = filtered.filter(m => getYear(m.date) === yearFilter);
  if (compFilter !== "all") filtered = filtered.filter(m => m.competition === compFilter);
  if (resultFilter !== "all") filtered = filtered.filter(m => { const r = getResult(m); return resultFilter === "W" ? r === "H" : resultFilter === "D" ? r === "D" : resultFilter === "L" ? r === "A" : true; });
  if (!filtered.length) { el.innerHTML = '<div class="empty-msg">No matches match your filters.</div>'; return; }
  const groups = {};
  filtered.forEach(m => { const key = m.date.slice(0, 7); if (!groups[key]) groups[key] = []; groups[key].push(m); });
  let html = "";
  for (const key of Object.keys(groups).sort().reverse()) {
    const [y, mo] = key.split("-");
    const monthName = new Date(y, parseInt(mo)-1).toLocaleString("en-GB", { month:"long", year:"numeric" });
    html += `<div class="match-group"><div class="match-group-header">${monthName} <span class="match-group-count">${groups[key].length} match${groups[key].length>1?"es":""}</span></div>`;
    groups[key].forEach(m => {
      const r = getResult(m);
      const rClass = r === "H" ? "result-win" : r === "A" ? "result-loss" : r === "D" ? "result-draw" : "";
      const isMilestone = checkMilestone(m);
      html += `<div class="match-row ${rClass}" data-id="${m.id}">
        <div class="match-date">${formatDate(m.date)}${isMilestone ? `<span class="milestone-pip" title="${isMilestone}">🎯</span>` : ""}</div>
        <div class="match-main">
          <div class="match-teams">${m.home} <span class="match-score">${m.homeScore ?? ""}–${m.awayScore ?? ""}</span> ${m.away}</div>
          <div class="match-meta">🏟 ${m.stadium}${m.competition ? " · "+m.competition : ""}${m.attendance ? " · 👥 "+m.attendance.toLocaleString() : ""}${m.rating ? " · "+"★".repeat(m.rating) : ""}</div>
          ${m.companions && m.companions.length ? `<div class="match-notes">👥 ${m.companions.join(", ")}</div>` : ""}
          ${m.notes ? `<div class="match-notes">${m.notes}</div>` : ""}
        </div>
      </div>`;
    });
    html += `</div>`;
  }
  el.innerHTML = html;
  el.querySelectorAll(".match-row").forEach(row => { row.addEventListener("click", () => openEditMatch(row.dataset.id)); });
}

function checkMilestone(m) {
  const sorted = [...matches].sort((a,b) => a.date.localeCompare(b.date));
  const idx = sorted.findIndex(x => x.id === m.id);
  if (idx >= 0 && [49,99,149,199,249,299,349,399,449,499].includes(idx)) return `${idx+1}th match!`;
  return null;
}

function populateFilters() {
  const yearSel = document.getElementById("filter-year");
  const compSel = document.getElementById("filter-comp");
  const curYear = yearSel.value, curComp = compSel.value;
  yearSel.innerHTML = '<option value="all">All Years</option>' + getYears().map(y => `<option value="${y}">${y}</option>`).join("");
  compSel.innerHTML = '<option value="all">All Competitions</option>' + getUniqueCompetitions().map(c => `<option value="${c}">${c}</option>`).join("");
  yearSel.value = curYear; compSel.value = curComp;
}

// ─── Grounds Page ─────────────────────────────────────────────────────────────
function renderGrounds() {
  const el = document.getElementById("grounds-grid");
  const query = (document.getElementById("ground-search").value || "").toLowerCase();
  const sortBy = document.getElementById("ground-sort").value;
  const grounds = getUniqueGrounds();
  let entries = Object.entries(grounds);
  if (query) entries = entries.filter(([name]) => name.toLowerCase().includes(query));
  if (sortBy === "visits") entries.sort((a,b) => b[1].length - a[1].length);
  else if (sortBy === "alpha") entries.sort((a,b) => a[0].localeCompare(b[0]));
  else if (sortBy === "recent") entries.sort((a,b) => { const aM = Math.max(...a[1].map(m=>m.date)); const bM = Math.max(...b[1].map(m=>m.date)); return bM > aM ? 1 : bM < aM ? -1 : 0; });
  if (!entries.length) { el.innerHTML = '<div class="empty-msg">No grounds match your search.</div>'; return; }
  el.innerHTML = entries.map(([name, ms]) => {
    const last = [...ms].sort((a,b) => b.date.localeCompare(a.date))[0];
    const first = [...ms].sort((a,b) => a.date.localeCompare(b.date))[0];
    const teams = new Set(); ms.forEach(m => { teams.add(m.home); teams.add(m.away); });
    return `<div class="ground-card" data-ground="${name}"><div class="ground-visits">${ms.length}</div><div class="ground-name">${name}</div><div class="ground-meta">${teams.size} teams · First: ${formatDate(first.date)}</div><div class="ground-meta">Last: ${formatDate(last.date)}</div></div>`;
  }).join("");
  el.querySelectorAll(".ground-card").forEach(card => { card.addEventListener("click", () => openGroundModal(card.dataset.ground)); });
}

// ─── Map Page ─────────────────────────────────────────────────────────────────
const GROUND_COORDS = {
  "Wembley Stadium":[51.556,-0.2795],"St. James' Park":[54.9755,-1.6216],"London Stadium":[51.5387,-0.0166],
  "Emirates Stadium":[51.5549,-0.1084],"Stamford Bridge":[51.4816,-0.191],"Anfield":[53.4308,-2.9609],
  "Old Trafford":[53.4631,-2.2913],"Etihad Stadium":[53.4831,-2.2004],"Tottenham Hotspur Stadium":[51.6042,-0.0662],
  "Goodison Park":[53.4387,-2.9663],"Villa Park":[52.5092,-1.8847],"St Mary's Stadium":[50.9058,-1.3909],
  "Craven Cottage":[51.4749,-0.2217],"Gtech Community Stadium":[51.4907,-0.2886],
  "American Express Stadium":[50.8616,-0.0837],"Molineux Stadium":[52.5903,-2.1306],
  "King Power Stadium":[52.6204,-1.1422],"Turf Moor":[53.789,-2.2302],
  "Carrow Road":[52.6221,1.3093],"Elland Road":[53.7779,-1.5722],
  "Brisbane Road":[51.5601,-0.0125],"Melbourne Stadium":[51.7361,0.4893],
  "Coles Park Stadium":[51.6003,-0.0987],"Reynolds Field":[51.5148,-0.3538],
  "John Smith's Stadium":[51.6543,-1.7684],"Portman Road":[52.0544,1.1447],
  "Loftus Road":[51.5093,-0.2323],"The Valley":[51.4865,0.0364],
  "Selhurst Park":[51.3983,-0.0855],"The Den":[51.4858,-0.0509],
  "Kingsmeadow Stadium":[51.4049,-0.2818],"Champion Hill Stadium":[51.4583,-0.0847],
  "Vicarage Road":[51.6497,-0.4015],"The Hive Stadium":[51.6028,-0.2816],
  "Kenilworth Road":[51.8842,-0.4316],"Adams Park":[51.6308,-0.8003],
  "Broadfield Stadium":[51.0996,-0.1949],"Pirelli Stadium":[52.8222,-1.6275],
  "Memorial Stadium":[51.4861,-2.5833],"Lamex Stadium":[51.8894,-0.1947],
  "Ashton Gate":[51.44,-2.6203],"The Hawthorns":[52.5091,-1.9638],
  "MKM Stadium":[53.7461,-0.3678],"Stadium MK":[52.0096,-0.7335],
  "Cardiff City Stadium":[51.4728,-3.2031],"Priestfield Stadium":[51.3817,0.5614],
  "Gillette Stadium":[42.0909,-71.2643],"Geodis Park":[36.1303,-86.7654],
  "AAMI Park":[-37.8253,144.9835],"Mohammed Bin Zayed Stadium":[24.4184,54.4396],
  "Philips Stadion":[51.4417,5.4681],"Volksparkstadion":[53.5872,9.8986],
  "Stadio Arena Garibaldi":[43.7267,10.3925],"Estadio La Rosaleda":[36.7283,-4.4314],
  "Celtic Park":[55.8497,-4.2055],"The SMISA Stadium":[55.8531,-4.4314],
  "Galabank":[55.0069,-3.2589],"Europa Point Stadium":[36.1114,-5.3456],
  "Stade de Genève":[46.1779,6.1283],"Stadion Wankdorf":[46.9631,7.4653],"Stockhorn Arena":[46.7588,7.6289],
  "BZA Gröpelingen Platz 4":[53.1135,8.7735],"Grünwalder Stadion":[48.1092,11.5547],"WWK ARENA":[48.3234,10.886],
  "Brunton Park":[54.8958,-2.9197],"Oakwell Stadium":[53.5523,-1.4677],
  "Fantastic Media Welfare Ground":[53.6128,-1.6647],"Gander Green Lane":[51.3636,-0.1928],
  "Old Spotted Dog Ground":[51.5488,0.0297],"New Lodge":[51.6283,0.4183],
  "Roding Lane":[51.6283,0.0583],"Capershotts":[51.6847,0.0047],
  "Ashton Athletic Track":[51.6047,0.0583],"Mile End Stadium":[51.5225,-0.0347],
  "Barrows Farm Stadium":[51.7647,0.0883],"Oakside Stadium":[51.5847,0.0283],
  "Imperial Fields 3G":[51.4283,-0.1947],"The Bees Stadium":[51.5847,-0.2283],
  "Grand Drive":[51.3847,-0.2283],"Cheshunt Stadium":[51.7047,-0.0283],
  "Parsloes Park 3G":[51.5547,0.1283],"Jack Carter Centre 3G":[51.5647,0.0883],
  "Hill Dickinson Stadium":[53.4387,-2.9663],"Academy Stadium":[53.4831,-2.2004],
  "Skye Direct Stadium":[53.5947,-1.7883],"Wombwell Recreation Ground":[53.5147,-1.4083],
};

function renderMap() {
  const container = document.getElementById("map-container");
  if (mapInstance) { mapInstance.invalidateSize(); return; }
  mapInstance = L.map(container).setView([52.5, -1.5], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© OpenStreetMap contributors', maxZoom: 18
  }).addTo(mapInstance);
  const grounds = getUniqueGrounds();
  Object.entries(grounds).forEach(([name, ms]) => {
    const coords = GROUND_COORDS[name];
    if (!coords) return;
    const color = ms.length >= 10 ? "#7c3aed" : ms.length >= 5 ? "#3b82f6" : ms.length >= 2 ? "#27ae60" : "#f39c12";
    const marker = L.circleMarker(coords, { radius: Math.min(6 + ms.length * 1.5, 18), fillColor: color, color: "#fff", weight: 2, fillOpacity: 0.85 }).addTo(mapInstance);
    const last = [...ms].sort((a,b) => b.date.localeCompare(a.date))[0];
    marker.bindPopup(`<strong>${name}</strong><br>${ms.length} visit${ms.length>1?"s":""}<br>Last: ${last.home} ${last.homeScore}–${last.awayScore} ${last.away}<br>${formatDate(last.date)}`);
  });
  setTimeout(() => mapInstance.invalidateSize(), 200);
}

// ─── Stats Page ───────────────────────────────────────────────────────────────
function renderStats() {
  const el = document.getElementById("stats-content");
  const { w, d, l } = getWDL();
  const total = w + d + l;
  const winPct = total ? ((w/total)*100).toFixed(1) : 0;
  let totalGoals = 0, homeGoals = 0, awayGoals = 0;
  let biggestWin = null, biggestLoss = null, highestScoring = null;
  matches.forEach(m => {
    const hs = m.homeScore||0, as = m.awayScore||0;
    totalGoals += hs+as; homeGoals += hs; awayGoals += as;
    if (!highestScoring || (hs+as) > (highestScoring.homeScore+highestScoring.awayScore)) highestScoring = m;
    const diff = hs-as;
    if (!biggestWin || diff > ((biggestWin.homeScore||0)-(biggestWin.awayScore||0))) biggestWin = m;
    if (!biggestLoss || diff < ((biggestLoss.homeScore||0)-(biggestLoss.awayScore||0))) biggestLoss = m;
  });
  const compMap = {}; matches.forEach(m => { const c = m.competition||"Unknown"; compMap[c] = (compMap[c]||0)+1; });
  const compSorted = Object.entries(compMap).sort((a,b) => b[1]-a[1]);
  const compMax = compSorted.length ? compSorted[0][1] : 1;
  const dayMap = {0:"Sunday",1:"Monday",2:"Tuesday",3:"Wednesday",4:"Thursday",5:"Friday",6:"Saturday"};
  const dayCount = {}; matches.forEach(m => { if (!m.date) return; const day = new Date(m.date+"T12:00:00").getDay(); dayCount[dayMap[day]] = (dayCount[dayMap[day]]||0)+1; });
  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const dayMax = Math.max(...Object.values(dayCount), 1);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthCount = {}; matches.forEach(m => { if (!m.date) return; monthCount[monthNames[parseInt(m.date.slice(5,7))-1]] = (monthCount[monthNames[parseInt(m.date.slice(5,7))-1]]||0)+1; });
  const monthMax = Math.max(...Object.values(monthCount), 1);
  // Companions stats
  const companionMap = {};
  matches.forEach(m => { (m.companions||[]).forEach(c => { companionMap[c] = (companionMap[c]||0)+1; }); });
  const companionSorted = Object.entries(companionMap).sort((a,b) => b[1]-a[1]).slice(0, 10);
  const companionMax = companionSorted.length ? companionSorted[0][1] : 1;
  // Attendance stats
  const withAtt = matches.filter(m => m.attendance);
  const totalAtt = withAtt.reduce((s,m) => s + m.attendance, 0);
  const avgAtt = withAtt.length ? Math.round(totalAtt / withAtt.length).toLocaleString() : "N/A";
  const maxAtt = withAtt.length ? withAtt.reduce((best,m) => m.attendance > (best.attendance||0) ? m : best, withAtt[0]) : null;
  const minAtt = withAtt.length ? withAtt.reduce((best,m) => m.attendance < (best.attendance||Infinity) ? m : best, withAtt[0]) : null;

  el.innerHTML = `<div class="stats-grid">
    <div class="stats-panel"><div class="panel-title">Results Breakdown</div>
      <div class="results-summary"><div class="result-block win"><div class="result-num">${w}</div><div class="result-lbl">Home Wins</div></div><div class="result-block draw"><div class="result-num">${d}</div><div class="result-lbl">Draws</div></div><div class="result-block loss"><div class="result-num">${l}</div><div class="result-lbl">Away Wins</div></div></div>
      <div class="result-pct">Home win rate: ${winPct}%</div></div>
    <div class="stats-panel"><div class="panel-title">Goals</div>
      <div class="goals-grid"><div class="goal-stat"><div class="goal-val">${totalGoals}</div><div class="goal-lbl">Total Goals</div></div><div class="goal-stat"><div class="goal-val">${matches.length?(totalGoals/matches.length).toFixed(1):0}</div><div class="goal-lbl">Per Game</div></div><div class="goal-stat"><div class="goal-val">${homeGoals}</div><div class="goal-lbl">Home Goals</div></div><div class="goal-stat"><div class="goal-val">${awayGoals}</div><div class="goal-lbl">Away Goals</div></div></div></div>
    <div class="stats-panel"><div class="panel-title">Notable Matches</div>
      ${highestScoring?`<div class="notable-match"><span class="notable-label">Highest scoring:</span> ${highestScoring.home} ${highestScoring.homeScore}–${highestScoring.awayScore} ${highestScoring.away} (${formatDate(highestScoring.date)})</div>`:""}
      ${biggestWin?`<div class="notable-match"><span class="notable-label">Biggest home win:</span> ${biggestWin.home} ${biggestWin.homeScore}–${biggestWin.awayScore} ${biggestWin.away} (${formatDate(biggestWin.date)})</div>`:""}
      ${biggestLoss?`<div class="notable-match"><span class="notable-label">Biggest away win:</span> ${biggestLoss.home} ${biggestLoss.homeScore}–${biggestLoss.awayScore} ${biggestLoss.away} (${formatDate(biggestLoss.date)})</div>`:""}</div>
    <div class="stats-panel"><div class="panel-title">Attendance</div>
      <div class="goals-grid"><div class="goal-stat"><div class="goal-val">${withAtt.length}</div><div class="goal-lbl">Games w/ Attendance</div></div><div class="goal-stat"><div class="goal-val">${avgAtt}</div><div class="goal-lbl">Average</div></div></div>
      ${maxAtt?`<div class="notable-match" style="margin-top:8px"><span class="notable-label">Biggest crowd:</span> ${maxAtt.attendance.toLocaleString()} — ${maxAtt.home} vs ${maxAtt.away} (${formatDate(maxAtt.date)})</div>`:""}
      ${minAtt?`<div class="notable-match"><span class="notable-label">Smallest crowd:</span> ${minAtt.attendance.toLocaleString()} — ${minAtt.home} vs ${minAtt.away} (${formatDate(minAtt.date)})</div>`:""}</div>
    ${companionSorted.length ? `<div class="stats-panel"><div class="panel-title">Most Frequent Companions</div>${companionSorted.map(([c,n]) => `<div class="bar-row"><span class="bar-label">${c}</span><div class="bar-track"><div class="bar-fill" style="width:${(n/companionMax)*100}%"></div></div><span class="bar-val">${n}</span></div>`).join("")}</div>` : ""}
    <div class="stats-panel"><div class="panel-title">By Competition</div>${compSorted.map(([c,n]) => `<div class="bar-row"><span class="bar-label">${c}</span><div class="bar-track"><div class="bar-fill comp-fill" style="width:${(n/compMax)*100}%"></div></div><span class="bar-val">${n}</span></div>`).join("")}</div>
    <div class="stats-panel"><div class="panel-title">By Day of Week</div>${dayOrder.map(d => `<div class="bar-row"><span class="bar-label">${d}</span><div class="bar-track"><div class="bar-fill day-fill" style="width:${((dayCount[d]||0)/dayMax)*100}%"></div></div><span class="bar-val">${dayCount[d]||0}</span></div>`).join("")}</div>
    <div class="stats-panel"><div class="panel-title">By Month</div>${monthNames.map(m => `<div class="bar-row"><span class="bar-label">${m}</span><div class="bar-track"><div class="bar-fill month-fill" style="width:${((monthCount[m]||0)/monthMax)*100}%"></div></div><span class="bar-val">${monthCount[m]||0}</span></div>`).join("")}</div>
  </div>`;
}

// ─── Season Review Page ───────────────────────────────────────────────────────
function getSeasons() {
  const seasonSet = new Set();
  matches.forEach(m => { if (!m.date) return; const y = parseInt(m.date.slice(0,4)); const mo = parseInt(m.date.slice(5,7)); seasonSet.add(mo >= 8 ? y : y-1); });
  return [...seasonSet].sort().reverse();
}
function getMatchesInSeason(seasonStart) {
  return matches.filter(m => m.date >= `${seasonStart}-08-01` && m.date <= `${seasonStart+1}-07-31`);
}
function renderSeasonReview() {
  const select = document.getElementById("season-select");
  const seasons = getSeasons();
  const cur = select.value;
  select.innerHTML = seasons.map(s => `<option value="${s}">${s}/${(s+1).toString().slice(2)} Season</option>`).join("");
  if (cur && seasons.includes(parseInt(cur))) select.value = cur;
  select.removeEventListener("change", renderSeasonContent);
  select.addEventListener("change", renderSeasonContent);
  renderSeasonContent();
}
function renderSeasonContent() {
  const el = document.getElementById("season-content");
  const seasonStart = parseInt(document.getElementById("season-select").value);
  const seasonMatches = getMatchesInSeason(seasonStart);
  const sorted = [...seasonMatches].sort((a,b) => a.date.localeCompare(b.date));
  if (!seasonMatches.length) { el.innerHTML = '<div class="empty-msg">No matches in this season.</div>'; return; }
  let w=0,d=0,l=0,totalGoals=0;
  seasonMatches.forEach(m => { const r=getResult(m); if(r==="H")w++; else if(r==="D")d++; else if(r==="A")l++; totalGoals+=(m.homeScore||0)+(m.awayScore||0); });
  const groundSet = new Set(); const teamMap = {}; const compMap = {};
  seasonMatches.forEach(m => { groundSet.add(m.stadium); [m.home,m.away].forEach(t=>{teamMap[t]=(teamMap[t]||0)+1;}); compMap[m.competition||"Unknown"]=(compMap[m.competition||"Unknown"]||0)+1; });
  const priorGrounds = new Set(matches.filter(m => m.date < `${seasonStart}-08-01`).map(m => m.stadium));
  const newGrounds = [...groundSet].filter(g => !priorGrounds.has(g));
  let bigWin=null,bigWinDiff=-1,highScore=null,highScoreTotal=-1;
  seasonMatches.forEach(m => { if(m.homeScore==null) return; const diff=m.homeScore-m.awayScore; const tot=m.homeScore+m.awayScore; if(diff>bigWinDiff){bigWinDiff=diff;bigWin=m;} if(tot>highScoreTotal){highScoreTotal=tot;highScore=m;} });
  const monthNames=["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"];
  const monthCount={}; monthNames.forEach(mn=>{monthCount[mn]=0;});
  seasonMatches.forEach(m => { const mo=parseInt(m.date.slice(5,7)); monthCount[monthNames[mo>=8?mo-8:mo+4]]++; });
  const monthMax=Math.max(...Object.values(monthCount),1);
  const compSorted=Object.entries(compMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const compMax=compSorted.length?compSorted[0][1]:1;
  const teamSorted=Object.entries(teamMap).sort((a,b)=>b[1]-a[1]).slice(0,8);

  el.innerHTML = `<div class="season-header"><h2>${seasonStart}/${(seasonStart+1).toString().slice(2)} Season Review</h2><div class="season-subtitle">${seasonMatches.length} matches · ${groundSet.size} grounds · ${Object.keys(teamMap).length} teams</div></div>
    <div class="season-cards">
      <div class="dash-card accent-purple"><div class="dash-val">${seasonMatches.length}</div><div class="dash-label">Matches</div></div>
      <div class="dash-card accent-green"><div class="dash-val">${groundSet.size}</div><div class="dash-label">Grounds</div></div>
      <div class="dash-card accent-blue"><div class="dash-val">${newGrounds.length}</div><div class="dash-label">New Grounds</div></div>
      <div class="dash-card accent-orange"><div class="dash-val">${totalGoals}</div><div class="dash-label">Goals Seen</div></div>
      <div class="dash-card accent-red"><div class="dash-val">${w}</div><div class="dash-label">Home Wins</div></div>
      <div class="dash-card accent-teal"><div class="dash-val">${d}</div><div class="dash-label">Draws</div></div>
      <div class="dash-card accent-pink"><div class="dash-val">${l}</div><div class="dash-label">Away Wins</div></div>
      <div class="dash-card accent-amber"><div class="dash-val">${(totalGoals/seasonMatches.length).toFixed(1)}</div><div class="dash-label">Goals/Game</div></div>
    </div>
    <div class="season-grid">
      <div class="stats-panel"><div class="panel-title">Monthly Breakdown</div>${monthNames.map(m=>`<div class="bar-row"><span class="bar-label">${m}</span><div class="bar-track"><div class="bar-fill month-fill" style="width:${(monthCount[m]/monthMax)*100}%"></div></div><span class="bar-val">${monthCount[m]}</span></div>`).join("")}</div>
      <div class="stats-panel"><div class="panel-title">By Competition</div>${compSorted.map(([c,n])=>`<div class="bar-row"><span class="bar-label">${c}</span><div class="bar-track"><div class="bar-fill comp-fill" style="width:${(n/compMax)*100}%"></div></div><span class="bar-val">${n}</span></div>`).join("")}</div>
      <div class="stats-panel"><div class="panel-title">Notable Matches</div>
        ${bigWin?`<div class="notable-match"><span class="notable-label">Biggest home win:</span> ${bigWin.home} ${bigWin.homeScore}–${bigWin.awayScore} ${bigWin.away} (${formatDate(bigWin.date)})</div>`:""}
        ${highScore?`<div class="notable-match"><span class="notable-label">Highest scoring:</span> ${highScore.home} ${highScore.homeScore}–${highScore.awayScore} ${highScore.away} (${formatDate(highScore.date)})</div>`:""}
        <div class="notable-match"><span class="notable-label">First:</span> ${sorted[0].home} ${sorted[0].homeScore??"?"}–${sorted[0].awayScore??"?"} ${sorted[0].away} (${formatDate(sorted[0].date)})</div>
        <div class="notable-match"><span class="notable-label">Last:</span> ${sorted[sorted.length-1].home} ${sorted[sorted.length-1].homeScore??"?"}–${sorted[sorted.length-1].awayScore??"?"} ${sorted[sorted.length-1].away} (${formatDate(sorted[sorted.length-1].date)})</div></div>
      <div class="stats-panel"><div class="panel-title">Most Seen Teams</div>${teamSorted.map(([t,n])=>`<div class="bar-row"><span class="bar-label">${t}</span><div class="bar-track"><div class="bar-fill team-fill" style="width:${(n/teamSorted[0][1])*100}%"></div></div><span class="bar-val">${n}</span></div>`).join("")}</div>
      ${newGrounds.length?`<div class="stats-panel"><div class="panel-title">New Grounds</div><div class="new-grounds-list">${newGrounds.map(g=>{const gm=seasonMatches.find(m=>m.stadium===g);return`<div class="new-ground-item">🏟 <strong>${g}</strong><div class="new-ground-meta">${gm?gm.home+" vs "+gm.away+" · "+formatDate(gm.date):""}</div></div>`;}).join("")}</div></div>`:""}
    </div>
    <div class="stats-panel" style="margin-top:1rem"><div class="panel-title">All Matches</div><div class="season-match-list">${sorted.map(m=>{const r=getResult(m);const rc=r==="H"?"result-win":r==="A"?"result-loss":r==="D"?"result-draw":"";return`<div class="match-row ${rc}" data-id="${m.id}"><div class="match-date">${formatDate(m.date)}</div><div class="match-main"><div class="match-teams">${m.home} <span class="match-score">${m.homeScore??""}–${m.awayScore??""}</span> ${m.away}</div><div class="match-meta">🏟 ${m.stadium}${m.competition?" · "+m.competition:""}</div></div></div>`;}).join("")}</div></div>`;
  el.querySelectorAll(".match-row").forEach(row => { row.addEventListener("click", () => openEditMatch(row.dataset.id)); });
}

// ─── Timeline (Heatmap) Page ──────────────────────────────────────────────────
function renderTimeline() {
  const select = document.getElementById("timeline-year-select");
  const years = getYears();
  const cur = select.value;
  select.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
  if (cur && years.includes(cur)) select.value = cur;
  select.removeEventListener("change", renderTimelineHeatmap);
  select.addEventListener("change", renderTimelineHeatmap);
  renderTimelineHeatmap();
}
function renderTimelineHeatmap() {
  const el = document.getElementById("timeline-heatmap");
  const year = document.getElementById("timeline-year-select").value;
  if (!year) { el.innerHTML = ""; return; }
  // Build day map for the year
  const dayMap = {};
  matches.filter(m => m.date && m.date.startsWith(year)).forEach(m => { dayMap[m.date] = (dayMap[m.date]||0)+1; });
  // Generate weeks grid (Jan 1 to Dec 31)
  const startDate = new Date(`${year}-01-01T12:00:00`);
  const endDate = new Date(`${year}-12-31T12:00:00`);
  let html = '<div class="heatmap-grid">';
  // Month labels
  html += '<div class="heatmap-months">';
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  monthLabels.forEach(m => { html += `<span class="hm-month">${m}</span>`; });
  html += '</div><div class="heatmap-cells">';
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().slice(0, 10);
    const count = dayMap[dateStr] || 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;
    const title = `${dateStr}: ${count} game${count !== 1 ? "s" : ""}`;
    html += `<div class="hm-cell tl-${level}" title="${title}"></div>`;
    current.setDate(current.getDate() + 1);
  }
  html += '</div></div>';
  // Summary
  const totalInYear = matches.filter(m => m.date && m.date.startsWith(year)).length;
  const daysWithGames = Object.keys(dayMap).length;
  html += `<div class="timeline-summary">${totalInYear} games across ${daysWithGames} days in ${year}</div>`;
  el.innerHTML = html;
}

// ─── Head to Head Page ────────────────────────────────────────────────────────
function renderH2H() {
  // Populate datalist
  const teams = Object.keys(getUniqueTeams()).sort();
  document.getElementById("h2h-teams-list").innerHTML = teams.map(t => `<option value="${t}">`).join("");
}
function doH2H() {
  const teamA = document.getElementById("h2h-team-a").value.trim().toLowerCase();
  const teamB = document.getElementById("h2h-team-b").value.trim().toLowerCase();
  const el = document.getElementById("h2h-results");
  if (!teamA && !teamB) { el.innerHTML = '<div class="empty-msg">Enter one or two teams to compare.</div>'; return; }
  // If only one team, show their stats
  if (!teamB || !teamA) {
    const term = (teamA || teamB).toLowerCase();
    const games = matches.filter(m => m.home.toLowerCase().includes(term) || m.away.toLowerCase().includes(term));
    if (!games.length) { el.innerHTML = `<div class="empty-msg">No games found for "${teamA||teamB}".</div>`; return; }
    let hw=0,d=0,aw=0,goals=0;
    games.forEach(m => { const r=getResult(m); if(r==="H")hw++; else if(r==="D")d++; else if(r==="A")aw++; goals+=(m.homeScore||0)+(m.awayScore||0); });
    el.innerHTML = `<div class="h2h-summary"><h3>${games.length} games involving "${teamA||teamB}"</h3>
      <div class="results-summary"><div class="result-block win"><div class="result-num">${hw}</div><div class="result-lbl">Home Wins</div></div><div class="result-block draw"><div class="result-num">${d}</div><div class="result-lbl">Draws</div></div><div class="result-block loss"><div class="result-num">${aw}</div><div class="result-lbl">Away Wins</div></div></div>
      <div style="margin-top:8px;font-size:0.85rem">${goals} goals (${(goals/games.length).toFixed(1)}/game)</div></div>
      <div class="h2h-matches">${games.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,15).map(m=>`<div class="match-row ${getResult(m)==="H"?"result-win":getResult(m)==="A"?"result-loss":"result-draw"}"><div class="match-date">${formatDate(m.date)}</div><div class="match-main"><div class="match-teams">${m.home} <span class="match-score">${m.homeScore}–${m.awayScore}</span> ${m.away}</div><div class="match-meta">🏟 ${m.stadium}</div></div></div>`).join("")}</div>`;
    return;
  }
  // Both teams: find games where both appear
  const h2hGames = matches.filter(m => (m.home.toLowerCase().includes(teamA) || m.away.toLowerCase().includes(teamA)) && (m.home.toLowerCase().includes(teamB) || m.away.toLowerCase().includes(teamB)));
  if (!h2hGames.length) {
    // Show individual stats side by side
    const gamesA = matches.filter(m => m.home.toLowerCase().includes(teamA) || m.away.toLowerCase().includes(teamA));
    const gamesB = matches.filter(m => m.home.toLowerCase().includes(teamB) || m.away.toLowerCase().includes(teamB));
    el.innerHTML = `<div class="h2h-summary"><h3>No direct meetings found</h3><p style="font-size:0.85rem;color:var(--muted)">You've seen "${teamA}" ${gamesA.length} times and "${teamB}" ${gamesB.length} times, but never against each other.</p></div>`;
    return;
  }
  let aWins=0,draws=0,bWins=0,goals=0;
  h2hGames.forEach(m => {
    goals += (m.homeScore||0)+(m.awayScore||0);
    const r = getResult(m);
    const homeIsA = m.home.toLowerCase().includes(teamA);
    if (r === "D") draws++;
    else if ((r === "H" && homeIsA) || (r === "A" && !homeIsA)) aWins++;
    else bWins++;
  });
  el.innerHTML = `<div class="h2h-summary"><h3>${h2hGames.length} meetings</h3>
    <div class="results-summary"><div class="result-block win"><div class="result-num">${aWins}</div><div class="result-lbl">${document.getElementById("h2h-team-a").value} wins</div></div><div class="result-block draw"><div class="result-num">${draws}</div><div class="result-lbl">Draws</div></div><div class="result-block loss"><div class="result-num">${bWins}</div><div class="result-lbl">${document.getElementById("h2h-team-b").value} wins</div></div></div>
    <div style="margin-top:8px;font-size:0.85rem">${goals} goals (${(goals/h2hGames.length).toFixed(1)}/game)</div></div>
    <div class="h2h-matches">${h2hGames.sort((a,b)=>b.date.localeCompare(a.date)).map(m=>`<div class="match-row"><div class="match-date">${formatDate(m.date)}</div><div class="match-main"><div class="match-teams">${m.home} <span class="match-score">${m.homeScore}–${m.awayScore}</span> ${m.away}</div><div class="match-meta">🏟 ${m.stadium} · ${m.competition||""}</div></div></div>`).join("")}</div>`;
}

// ─── Upcoming Matches Page ────────────────────────────────────────────────────
function renderUpcoming() {
  const el = document.getElementById("upcoming-list");
  if (!upcoming.length) { el.innerHTML = '<div class="empty-msg">No upcoming matches planned. Add one!</div>'; return; }
  const sorted = [...upcoming].sort((a,b) => a.date.localeCompare(b.date));
  el.innerHTML = sorted.map(m => `
    <div class="match-row upcoming-row" data-uid="${m.id}">
      <div class="match-date">${formatDate(m.date)}</div>
      <div class="match-main">
        <div class="match-teams">${m.home || "TBC"} vs ${m.away || "TBC"}</div>
        <div class="match-meta">🏟 ${m.stadium || "TBC"}${m.competition ? " · "+m.competition : ""}</div>
        ${m.notes ? `<div class="match-notes">${m.notes}</div>` : ""}
      </div>
      <div class="upcoming-actions">
        <button class="secondary-btn btn-convert-upcoming" data-uid="${m.id}" title="Convert to match (add score)">✓ Done</button>
        <button class="danger-btn-sm btn-delete-upcoming" data-uid="${m.id}" title="Remove">✕</button>
      </div>
    </div>
  `).join("");
  el.querySelectorAll(".btn-convert-upcoming").forEach(btn => {
    btn.addEventListener("click", (e) => { e.stopPropagation(); convertUpcoming(btn.dataset.uid); });
  });
  el.querySelectorAll(".btn-delete-upcoming").forEach(btn => {
    btn.addEventListener("click", (e) => { e.stopPropagation(); deleteUpcoming(btn.dataset.uid); });
  });
}
function addUpcoming() {
  const date = prompt("Date (YYYY-MM-DD):");
  if (!date) return;
  const stadium = prompt("Stadium:") || "";
  const home = prompt("Home team:") || "TBC";
  const away = prompt("Away team:") || "TBC";
  const competition = prompt("Competition:") || "";
  const notes = prompt("Notes:") || "";
  upcoming.push({ id: crypto.randomUUID(), date, stadium, home, away, competition, notes });
  save();
  renderUpcoming();
}
function convertUpcoming(id) {
  const m = upcoming.find(x => x.id === id);
  if (!m) return;
  // Open the add match modal pre-filled
  editingMatchIdx = null;
  document.getElementById("match-modal-title").textContent = "Add Match";
  document.getElementById("m-date").value = m.date || "";
  document.getElementById("m-stadium").value = m.stadium || "";
  document.getElementById("m-home").value = m.home || "";
  document.getElementById("m-away").value = m.away || "";
  document.getElementById("m-home-score").value = "";
  document.getElementById("m-away-score").value = "";
  document.getElementById("m-attendance").value = "";
  document.getElementById("m-comp").value = m.competition || "";
  document.getElementById("m-notes").value = m.notes || "";
  document.getElementById("m-companions").value = "";
  setRating(0);
  document.getElementById("btn-delete-match").classList.add("hidden");
  document.getElementById("match-modal-overlay").classList.remove("hidden");
  // Remove from upcoming after save
  upcoming = upcoming.filter(x => x.id !== id);
  save();
  renderUpcoming();
}
function deleteUpcoming(id) {
  upcoming = upcoming.filter(x => x.id !== id);
  save();
  renderUpcoming();
}

// ─── CSV Import / Export ──────────────────────────────────────────────────────
function openImportModal() {
  document.getElementById("import-csv-text").value = "";
  document.getElementById("import-preview").textContent = "";
  document.getElementById("import-modal-overlay").classList.remove("hidden");
}
function closeImportModal() {
  document.getElementById("import-modal-overlay").classList.add("hidden");
}
function parseCSVLine(line) {
  // Format: YYYYMMDD Stadium Home Away HScore AScore Attendance Competition
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 10) return null;
  const dateRaw = trimmed.slice(0, 8);
  const date = `${dateRaw.slice(0,4)}-${dateRaw.slice(4,6)}-${dateRaw.slice(6,8)}`;
  const rest = trimmed.slice(9).trim();
  // Try to parse: Stadium is everything up to the teams, scores are numbers near the end
  // Use regex to find the pattern: ... TeamA TeamB Score1 Score2 [Attendance] Competition
  const match = rest.match(/^(.+?)\s+(\S.*?)\s+(\S.*?)\s+(\d+)\s+(\d+)\s+(\d*)\s*(.*)$/);
  if (!match) {
    // Simpler parse: split by double space or tab
    const parts = rest.split(/\t|\s{2,}/);
    if (parts.length >= 5) {
      return { date, stadium: parts[0], home: parts[1], away: parts[2], homeScore: parseInt(parts[3])||0, awayScore: parseInt(parts[4])||0, attendance: parts[5] ? parseInt(parts[5])||null : null, competition: parts.slice(6).join(" ").trim() || "" };
    }
    return null;
  }
  return { date, stadium: match[1].trim(), home: match[2].trim(), away: match[3].trim(), homeScore: parseInt(match[4]), awayScore: parseInt(match[5]), attendance: match[6] ? parseInt(match[6])||null : null, competition: match[7].trim() || "" };
}
function doImport() {
  const text = document.getElementById("import-csv-text").value;
  const lines = text.split("\n").filter(l => l.trim());
  let imported = 0;
  lines.forEach(line => {
    const parsed = parseCSVLine(line);
    if (parsed) {
      // Check for duplicates
      const exists = matches.some(m => m.date === parsed.date && m.home === parsed.home && m.away === parsed.away);
      if (!exists) {
        matches.push({ id: crypto.randomUUID(), ...parsed, rating: null, companions: [], notes: "" });
        imported++;
      }
    }
  });
  if (imported > 0) { save(); renderAll(); }
  closeImportModal();
  alert(`Imported ${imported} new match${imported !== 1 ? "es" : ""}. ${lines.length - imported} skipped (duplicates or unparseable).`);
}
function exportCSV() {
  const sorted = [...matches].sort((a,b) => b.date.localeCompare(a.date));
  const header = "Date,Stadium,Home,Away,HomeScore,AwayScore,Attendance,Competition,Rating,Companions,Notes";
  const rows = sorted.map(m => {
    const esc = s => `"${(s||"").replace(/"/g,'""')}"`;
    return `${m.date},${esc(m.stadium)},${esc(m.home)},${esc(m.away)},${m.homeScore??""},${m.awayScore??""},${m.attendance??""},${esc(m.competition)},${m.rating||""},${esc((m.companions||[]).join("; "))},${esc(m.notes)}`;
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `hawkbology-export-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── Add / Edit Match Modal ───────────────────────────────────────────────────
function setRating(val) {
  currentRating = val;
  document.querySelectorAll("#m-rating .star").forEach(s => {
    s.classList.toggle("active", parseInt(s.dataset.val) <= val);
  });
}
function openAddMatch() {
  editingMatchIdx = null;
  document.getElementById("match-modal-title").textContent = "Add Match";
  document.getElementById("m-date").value = "";
  document.getElementById("m-stadium").value = "";
  document.getElementById("m-home").value = "";
  document.getElementById("m-away").value = "";
  document.getElementById("m-home-score").value = "";
  document.getElementById("m-away-score").value = "";
  document.getElementById("m-attendance").value = "";
  document.getElementById("m-comp").value = "";
  document.getElementById("m-companions").value = "";
  document.getElementById("m-notes").value = "";
  setRating(0);
  document.getElementById("btn-delete-match").classList.add("hidden");
  document.getElementById("match-modal-overlay").classList.remove("hidden");
}
function openEditMatch(id) {
  const m = matches.find(x => x.id === id);
  if (!m) return;
  editingMatchIdx = id;
  document.getElementById("match-modal-title").textContent = "Edit Match";
  document.getElementById("m-date").value = m.date || "";
  document.getElementById("m-stadium").value = m.stadium || "";
  document.getElementById("m-home").value = m.home || "";
  document.getElementById("m-away").value = m.away || "";
  document.getElementById("m-home-score").value = m.homeScore ?? "";
  document.getElementById("m-away-score").value = m.awayScore ?? "";
  document.getElementById("m-attendance").value = m.attendance ?? "";
  document.getElementById("m-comp").value = m.competition || "";
  document.getElementById("m-companions").value = (m.companions || []).join(", ");
  document.getElementById("m-notes").value = m.notes || "";
  setRating(m.rating || 0);
  document.getElementById("btn-delete-match").classList.remove("hidden");
  document.getElementById("match-modal-overlay").classList.remove("hidden");
}
function saveMatch() {
  const date = document.getElementById("m-date").value;
  const stadium = document.getElementById("m-stadium").value.trim();
  const home = document.getElementById("m-home").value.trim();
  const away = document.getElementById("m-away").value.trim();
  const homeScore = document.getElementById("m-home-score").value !== "" ? parseInt(document.getElementById("m-home-score").value) : null;
  const awayScore = document.getElementById("m-away-score").value !== "" ? parseInt(document.getElementById("m-away-score").value) : null;
  const attendance = document.getElementById("m-attendance").value !== "" ? parseInt(document.getElementById("m-attendance").value) : null;
  const competition = document.getElementById("m-comp").value.trim();
  const notes = document.getElementById("m-notes").value.trim();
  const companions = document.getElementById("m-companions").value.split(",").map(s => s.trim()).filter(Boolean);
  const rating = currentRating || null;
  if (!date || !home || !away) { alert("Date, home team and away team are required."); return; }
  if (editingMatchIdx) {
    const m = matches.find(x => x.id === editingMatchIdx);
    if (m) Object.assign(m, { date, stadium, home, away, homeScore, awayScore, attendance, competition, notes, companions, rating });
  } else {
    matches.push({ id: crypto.randomUUID(), date, stadium, home, away, homeScore, awayScore, attendance, competition, notes, companions, rating });
  }
  save(); closeMatchModal(); renderAll();
}
function deleteMatch() {
  if (!editingMatchIdx) return;
  showConfirmModal("Delete this match?", () => { matches = matches.filter(m => m.id !== editingMatchIdx); save(); closeMatchModal(); renderAll(); });
}
function closeMatchModal() { document.getElementById("match-modal-overlay").classList.add("hidden"); editingMatchIdx = null; }

// ─── Ground Detail Modal ──────────────────────────────────────────────────────
function openGroundModal(name) {
  const grounds = getUniqueGrounds();
  const ms = grounds[name];
  if (!ms) return;
  document.getElementById("ground-modal-title").textContent = name;
  const sorted = [...ms].sort((a,b) => b.date.localeCompare(a.date));
  document.getElementById("ground-modal-meta").textContent = `${ms.length} visit${ms.length>1?"s":""} · First: ${formatDate(sorted[sorted.length-1].date)} · Last: ${formatDate(sorted[0].date)}`;
  document.getElementById("ground-modal-matches").innerHTML = sorted.map(m => `<div class="gm-match"><div class="gm-date">${formatDate(m.date)}</div><div class="gm-teams">${m.home} ${m.homeScore??""}–${m.awayScore??""} ${m.away}</div><div class="gm-comp">${m.competition||""}</div></div>`).join("");
  document.getElementById("ground-modal-overlay").classList.remove("hidden");
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
let confirmCallback = null;
function showConfirmModal(msg, cb) {
  document.getElementById("confirm-modal-msg").textContent = msg;
  confirmCallback = cb;
  document.getElementById("confirm-modal-overlay").classList.remove("hidden");
}
document.getElementById("confirm-modal-yes").addEventListener("click", () => { document.getElementById("confirm-modal-overlay").classList.add("hidden"); if (confirmCallback) confirmCallback(); confirmCallback = null; });
document.getElementById("confirm-modal-no").addEventListener("click", () => { document.getElementById("confirm-modal-overlay").classList.add("hidden"); confirmCallback = null; });

// ─── Dark Mode ────────────────────────────────────────────────────────────────
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark", darkMode);
  localStorage.setItem("hawkbology_dark", darkMode ? "1" : "0");
  document.getElementById("btn-dark-mode").textContent = darkMode ? "☀️" : "🌙";
}

// ─── Page Navigation ──────────────────────────────────────────────────────────
const PAGES = ["dashboard", "matches", "grounds", "map", "stats", "season", "timeline", "h2h", "upcoming", "ask"];
document.querySelectorAll(".page-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".page-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const page = btn.dataset.page;
    PAGES.forEach(p => { const el = document.getElementById("page-"+p); if (el) el.classList.toggle("hidden", p !== page); });
    if (page === "matches") { populateFilters(); renderMatches(); }
    if (page === "grounds") renderGrounds();
    if (page === "map") { setTimeout(() => renderMap(), 100); }
    if (page === "stats") renderStats();
    if (page === "season") renderSeasonReview();
    if (page === "timeline") renderTimeline();
    if (page === "h2h") renderH2H();
    if (page === "upcoming") renderUpcoming();
    if (page === "dashboard") renderDashboard();
    if (page === "ask" && typeof initChat === "function") initChat();
  });
});

// ─── Event Listeners ──────────────────────────────────────────────────────────
document.getElementById("btn-add-match").addEventListener("click", openAddMatch);
document.getElementById("btn-save-match").addEventListener("click", saveMatch);
document.getElementById("btn-delete-match").addEventListener("click", deleteMatch);
document.getElementById("match-modal-close").addEventListener("click", closeMatchModal);
document.getElementById("match-modal-cancel").addEventListener("click", closeMatchModal);
document.getElementById("ground-modal-close").addEventListener("click", () => { document.getElementById("ground-modal-overlay").classList.add("hidden"); });
document.getElementById("btn-dark-mode").addEventListener("click", toggleDarkMode);
document.getElementById("btn-import-csv").addEventListener("click", openImportModal);
document.getElementById("btn-export-csv").addEventListener("click", exportCSV);
document.getElementById("import-modal-close").addEventListener("click", closeImportModal);
document.getElementById("import-modal-cancel").addEventListener("click", closeImportModal);
document.getElementById("btn-do-import").addEventListener("click", doImport);
document.getElementById("btn-add-upcoming").addEventListener("click", addUpcoming);
document.getElementById("h2h-go").addEventListener("click", doH2H);
document.getElementById("h2h-team-a").addEventListener("keydown", e => { if (e.key === "Enter") doH2H(); });
document.getElementById("h2h-team-b").addEventListener("keydown", e => { if (e.key === "Enter") doH2H(); });

// Star rating
document.querySelectorAll("#m-rating .star").forEach(star => {
  star.addEventListener("click", () => setRating(parseInt(star.dataset.val)));
});

// Search / filter listeners
document.getElementById("match-search").addEventListener("input", renderMatches);
document.getElementById("filter-year").addEventListener("change", renderMatches);
document.getElementById("filter-comp").addEventListener("change", renderMatches);
document.getElementById("filter-result").addEventListener("change", renderMatches);
document.getElementById("ground-search").addEventListener("input", renderGrounds);
document.getElementById("ground-sort").addEventListener("change", renderGrounds);

// CSV import preview
document.getElementById("import-csv-text").addEventListener("input", () => {
  const lines = document.getElementById("import-csv-text").value.split("\n").filter(l => l.trim());
  const parseable = lines.filter(l => parseCSVLine(l)).length;
  document.getElementById("import-preview").textContent = `${parseable} of ${lines.length} lines parseable`;
});

// Close modals on overlay click
["match-modal-overlay", "ground-modal-overlay", "confirm-modal-overlay", "import-modal-overlay"].forEach(id => {
  document.getElementById(id).addEventListener("click", e => { if (e.target.id === id) document.getElementById(id).classList.add("hidden"); });
});

// ─── Render All ───────────────────────────────────────────────────────────────
function renderAll() { updateHeaderStats(); renderDashboard(); populateFilters(); }

// ─── Init ─────────────────────────────────────────────────────────────────────
updateLastUpdated();
load();
if (localStorage.getItem("hawkbology_dark") === "1") { darkMode = true; document.body.classList.add("dark"); document.getElementById("btn-dark-mode").textContent = "☀️"; }
renderAll();

// Register service worker
if ("serviceWorker" in navigator) { navigator.serviceWorker.register("sw.js").catch(() => {}); }
