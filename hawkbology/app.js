// ─── Hawkbology: Football Match Tracker ───────────────────────────────────────
// State
let matches = [];
let editingMatchIdx = null;
let darkMode = false;

// ─── Persistence ──────────────────────────────────────────────────────────────
const LS_KEY = "hawkbology";

function save() {
  if (typeof FireSync !== "undefined") {
    FireSync.save(LS_KEY, matches);
  } else {
    localStorage.setItem(LS_KEY, JSON.stringify(matches));
  }
}

function load() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try {
      matches = JSON.parse(raw);
    } catch (e) {
      matches = INITIAL_MATCHES.map(m => ({ ...m, id: crypto.randomUUID() }));
    }
  } else {
    matches = INITIAL_MATCHES.map(m => ({ ...m, id: crypto.randomUUID() }));
    save();
  }
  // Also try loading from cloud (will re-render if cloud data is newer)
  if (typeof FireSync !== "undefined") {
    FireSync.load(LS_KEY, (cloudData) => {
      if (cloudData && Array.isArray(cloudData) && cloudData.length > 0) {
        matches = cloudData;
        renderAll();
      }
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function getYear(d) {
  return d ? d.slice(0, 4) : "Unknown";
}

function getResult(m) {
  if (m.homeScore == null || m.awayScore == null) return null;
  if (m.homeScore > m.awayScore) return "H";
  if (m.homeScore < m.awayScore) return "A";
  return "D";
}

function getUniqueGrounds() {
  const map = {};
  matches.forEach(m => {
    const key = m.stadium;
    if (!map[key]) map[key] = [];
    map[key].push(m);
  });
  return map;
}

function getUniqueTeams() {
  const map = {};
  matches.forEach(m => {
    [m.home, m.away].forEach(team => {
      if (!map[team]) map[team] = 0;
      map[team]++;
    });
  });
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
  // We don't know which team the user supports, so count all results
  matches.forEach(m => {
    const r = getResult(m);
    if (r === "H") w++;
    else if (r === "A") l++;
    else if (r === "D") d++;
  });
  return { w, d, l };
}

// ─── Header Stats ─────────────────────────────────────────────────────────────
function updateHeaderStats() {
  document.getElementById("stat-total").textContent = `${matches.length} Games`;
  const grounds = Object.keys(getUniqueGrounds()).length;
  document.getElementById("stat-grounds").textContent = `${grounds} Grounds`;
  const { w, d, l } = getWDL();
  document.getElementById("stat-record").textContent = `W${w} D${d} L${l}`;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function renderDashboard() {
  updateHeaderStats();
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

  // Goals seen
  let totalGoals = 0;
  matches.forEach(m => {
    totalGoals += (m.homeScore || 0) + (m.awayScore || 0);
  });
  const avgGoals = matches.length ? (totalGoals / matches.length).toFixed(1) : "0";

  // Countries
  const countries = new Set();
  matches.forEach(m => {
    // Rough country detection from stadium names
    if (m.stadium.includes("Wembley") || m.stadium.includes("Stadium") || m.stadium.includes("Park") || m.stadium.includes("Road") || m.stadium.includes("Ground")) countries.add("England");
  });
  // Count unique countries from known international stadiums
  const intlStadiums = {
    "Stade de Genève": "Switzerland", "Stadion Wankdorf": "Switzerland", "Stockhorn Arena": "Switzerland",
    "AAMI Park": "Australia", "Mohammed Bin Zayed Stadium": "UAE",
    "Gillette Stadium": "USA", "Geodis Park": "USA",
    "Philips Stadion": "Netherlands", "BZA Gröpelingen Platz 4": "Germany",
    "Volksparkstadion": "Germany", "Grünwalder Stadion": "Germany", "WWK ARENA": "Germany",
    "Stadio Arena Garibaldi": "Italy", "Estadio La Rosaleda": "Spain",
    "The SMISA Stadium": "Scotland", "Celtic Park": "Scotland", "Galabank": "Scotland",
    "Europa Point Stadium": "Gibraltar", "Cardiff City Stadium": "Wales",
  };
  const countrySet = new Set(["England"]);
  matches.forEach(m => {
    if (intlStadiums[m.stadium]) countrySet.add(intlStadiums[m.stadium]);
  });

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
    </div>
  `).join("");
  el.querySelectorAll(".recent-row").forEach(row => {
    row.addEventListener("click", () => openEditMatch(row.dataset.id));
  });
}

function renderYearChart() {
  const el = document.getElementById("year-chart");
  const yearMap = {};
  matches.forEach(m => {
    const y = getYear(m.date);
    yearMap[y] = (yearMap[y] || 0) + 1;
  });
  const years = Object.keys(yearMap).sort();
  const max = Math.max(...Object.values(yearMap), 1);
  el.innerHTML = years.map(y => `
    <div class="bar-row">
      <span class="bar-label">${y}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(yearMap[y] / max) * 100}%"></div></div>
      <span class="bar-val">${yearMap[y]}</span>
    </div>
  `).join("");
}

function renderTopGrounds() {
  const el = document.getElementById("top-grounds");
  const grounds = getUniqueGrounds();
  const sorted = Object.entries(grounds).sort((a, b) => b[1].length - a[1].length).slice(0, 10);
  const max = sorted.length ? sorted[0][1].length : 1;
  el.innerHTML = sorted.map(([name, ms]) => `
    <div class="bar-row clickable" data-ground="${name}">
      <span class="bar-label">${name}</span>
      <div class="bar-track"><div class="bar-fill ground-fill" style="width:${(ms.length / max) * 100}%"></div></div>
      <span class="bar-val">${ms.length}</span>
    </div>
  `).join("");
  el.querySelectorAll(".bar-row.clickable").forEach(row => {
    row.addEventListener("click", () => openGroundModal(row.dataset.ground));
  });
}

function renderTopTeams() {
  const el = document.getElementById("top-teams");
  const teams = getUniqueTeams();
  const sorted = Object.entries(teams).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = sorted.length ? sorted[0][1] : 1;
  el.innerHTML = sorted.map(([name, count]) => `
    <div class="bar-row">
      <span class="bar-label">${name}</span>
      <div class="bar-track"><div class="bar-fill team-fill" style="width:${(count / max) * 100}%"></div></div>
      <span class="bar-val">${count}</span>
    </div>
  `).join("");
}

// ─── Matches Page ─────────────────────────────────────────────────────────────
function renderMatches() {
  const el = document.getElementById("matches-list");
  const query = (document.getElementById("match-search").value || "").toLowerCase();
  const yearFilter = document.getElementById("filter-year").value;
  const compFilter = document.getElementById("filter-comp").value;
  const resultFilter = document.getElementById("filter-result").value;

  let filtered = [...matches].sort((a, b) => b.date.localeCompare(a.date));

  if (query) {
    filtered = filtered.filter(m =>
      m.home.toLowerCase().includes(query) ||
      m.away.toLowerCase().includes(query) ||
      m.stadium.toLowerCase().includes(query) ||
      (m.competition || "").toLowerCase().includes(query) ||
      (m.notes || "").toLowerCase().includes(query)
    );
  }
  if (yearFilter !== "all") {
    filtered = filtered.filter(m => getYear(m.date) === yearFilter);
  }
  if (compFilter !== "all") {
    filtered = filtered.filter(m => m.competition === compFilter);
  }
  if (resultFilter !== "all") {
    filtered = filtered.filter(m => {
      const r = getResult(m);
      if (resultFilter === "W") return r === "H";
      if (resultFilter === "D") return r === "D";
      if (resultFilter === "L") return r === "A";
      return true;
    });
  }

  if (!filtered.length) {
    el.innerHTML = '<div class="empty-msg">No matches match your filters.</div>';
    return;
  }

  // Group by year-month
  const groups = {};
  filtered.forEach(m => {
    const key = m.date.slice(0, 7);
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });

  let html = "";
  for (const key of Object.keys(groups).sort().reverse()) {
    const [y, mo] = key.split("-");
    const monthName = new Date(y, parseInt(mo) - 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
    html += `<div class="match-group">
      <div class="match-group-header">${monthName} <span class="match-group-count">${groups[key].length} match${groups[key].length > 1 ? "es" : ""}</span></div>`;
    groups[key].forEach(m => {
      const r = getResult(m);
      const rClass = r === "H" ? "result-win" : r === "A" ? "result-loss" : r === "D" ? "result-draw" : "";
      html += `
        <div class="match-row ${rClass}" data-id="${m.id}">
          <div class="match-date">${formatDate(m.date)}</div>
          <div class="match-main">
            <div class="match-teams">${m.home} <span class="match-score">${m.homeScore ?? ""}–${m.awayScore ?? ""}</span> ${m.away}</div>
            <div class="match-meta">🏟 ${m.stadium}${m.competition ? " · " + m.competition : ""}${m.attendance ? " · 👥 " + m.attendance.toLocaleString() : ""}</div>
            ${m.notes ? `<div class="match-notes">${m.notes}</div>` : ""}
          </div>
        </div>`;
    });
    html += `</div>`;
  }
  el.innerHTML = html;

  el.querySelectorAll(".match-row").forEach(row => {
    row.addEventListener("click", () => openEditMatch(row.dataset.id));
  });
}

function populateFilters() {
  const yearSel = document.getElementById("filter-year");
  const compSel = document.getElementById("filter-comp");
  const years = getYears();
  const comps = getUniqueCompetitions();

  // Preserve current selection
  const curYear = yearSel.value;
  const curComp = compSel.value;

  yearSel.innerHTML = '<option value="all">All Years</option>' +
    years.map(y => `<option value="${y}">${y}</option>`).join("");
  compSel.innerHTML = '<option value="all">All Competitions</option>' +
    comps.map(c => `<option value="${c}">${c}</option>`).join("");

  yearSel.value = curYear;
  compSel.value = curComp;
}

// ─── Grounds Page ─────────────────────────────────────────────────────────────
function renderGrounds() {
  const el = document.getElementById("grounds-grid");
  const query = (document.getElementById("ground-search").value || "").toLowerCase();
  const sortBy = document.getElementById("ground-sort").value;
  const grounds = getUniqueGrounds();

  let entries = Object.entries(grounds);
  if (query) {
    entries = entries.filter(([name]) => name.toLowerCase().includes(query));
  }

  if (sortBy === "visits") {
    entries.sort((a, b) => b[1].length - a[1].length);
  } else if (sortBy === "alpha") {
    entries.sort((a, b) => a[0].localeCompare(b[0]));
  } else if (sortBy === "recent") {
    entries.sort((a, b) => {
      const aMax = Math.max(...a[1].map(m => m.date));
      const bMax = Math.max(...b[1].map(m => m.date));
      return bMax > aMax ? 1 : bMax < aMax ? -1 : 0;
    });
  }

  if (!entries.length) {
    el.innerHTML = '<div class="empty-msg">No grounds match your search.</div>';
    return;
  }

  el.innerHTML = entries.map(([name, ms]) => {
    const lastVisit = [...ms].sort((a, b) => b.date.localeCompare(a.date))[0];
    const firstVisit = [...ms].sort((a, b) => a.date.localeCompare(b.date))[0];
    const teams = new Set();
    ms.forEach(m => { teams.add(m.home); teams.add(m.away); });
    return `
      <div class="ground-card" data-ground="${name}">
        <div class="ground-visits">${ms.length}</div>
        <div class="ground-name">${name}</div>
        <div class="ground-meta">${teams.size} teams · First: ${formatDate(firstVisit.date)}</div>
        <div class="ground-meta">Last: ${formatDate(lastVisit.date)}</div>
      </div>`;
  }).join("");

  el.querySelectorAll(".ground-card").forEach(card => {
    card.addEventListener("click", () => openGroundModal(card.dataset.ground));
  });
}

// ─── Stats Page ───────────────────────────────────────────────────────────────
function renderStats() {
  const el = document.getElementById("stats-content");
  const { w, d, l } = getWDL();
  const total = w + d + l;
  const winPct = total ? ((w / total) * 100).toFixed(1) : 0;

  // Goals
  let totalGoals = 0, homeGoals = 0, awayGoals = 0;
  let biggestWin = null, biggestLoss = null, highestScoring = null;
  matches.forEach(m => {
    const hs = m.homeScore || 0, as = m.awayScore || 0;
    totalGoals += hs + as;
    homeGoals += hs;
    awayGoals += as;
    const totalG = hs + as;
    if (!highestScoring || totalG > (highestScoring.homeScore + highestScoring.awayScore)) highestScoring = m;
    const diff = hs - as;
    if (!biggestWin || diff > ((biggestWin.homeScore || 0) - (biggestWin.awayScore || 0))) biggestWin = m;
    if (!biggestLoss || diff < ((biggestLoss.homeScore || 0) - (biggestLoss.awayScore || 0))) biggestLoss = m;
  });

  // Competition breakdown
  const compMap = {};
  matches.forEach(m => {
    const c = m.competition || "Unknown";
    if (!compMap[c]) compMap[c] = 0;
    compMap[c]++;
  });
  const compSorted = Object.entries(compMap).sort((a, b) => b[1] - a[1]);
  const compMax = compSorted.length ? compSorted[0][1] : 1;

  // Day of week
  const dayMap = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
  const dayCount = {};
  matches.forEach(m => {
    if (!m.date) return;
    const day = new Date(m.date + "T12:00:00").getDay();
    const name = dayMap[day];
    dayCount[name] = (dayCount[name] || 0) + 1;
  });
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayMax = Math.max(...Object.values(dayCount), 1);

  // Month breakdown
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthCount = {};
  matches.forEach(m => {
    if (!m.date) return;
    const mo = parseInt(m.date.slice(5, 7)) - 1;
    const name = monthNames[mo];
    monthCount[name] = (monthCount[name] || 0) + 1;
  });
  const monthMax = Math.max(...Object.values(monthCount), 1);

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stats-panel">
        <div class="panel-title">Results Breakdown</div>
        <div class="results-summary">
          <div class="result-block win"><div class="result-num">${w}</div><div class="result-lbl">Home Wins</div></div>
          <div class="result-block draw"><div class="result-num">${d}</div><div class="result-lbl">Draws</div></div>
          <div class="result-block loss"><div class="result-num">${l}</div><div class="result-lbl">Away Wins</div></div>
        </div>
        <div class="result-pct">Home win rate: ${winPct}%</div>
      </div>
      <div class="stats-panel">
        <div class="panel-title">Goals</div>
        <div class="goals-grid">
          <div class="goal-stat"><div class="goal-val">${totalGoals}</div><div class="goal-lbl">Total Goals</div></div>
          <div class="goal-stat"><div class="goal-val">${matches.length ? (totalGoals / matches.length).toFixed(1) : 0}</div><div class="goal-lbl">Per Game</div></div>
          <div class="goal-stat"><div class="goal-val">${homeGoals}</div><div class="goal-lbl">Home Goals</div></div>
          <div class="goal-stat"><div class="goal-val">${awayGoals}</div><div class="goal-lbl">Away Goals</div></div>
        </div>
      </div>
      <div class="stats-panel">
        <div class="panel-title">Notable Matches</div>
        ${highestScoring ? `<div class="notable-match"><span class="notable-label">Highest scoring:</span> ${highestScoring.home} ${highestScoring.homeScore}–${highestScoring.awayScore} ${highestScoring.away} (${formatDate(highestScoring.date)})</div>` : ""}
        ${biggestWin ? `<div class="notable-match"><span class="notable-label">Biggest home win:</span> ${biggestWin.home} ${biggestWin.homeScore}–${biggestWin.awayScore} ${biggestWin.away} (${formatDate(biggestWin.date)})</div>` : ""}
        ${biggestLoss ? `<div class="notable-match"><span class="notable-label">Biggest away win:</span> ${biggestLoss.home} ${biggestLoss.homeScore}–${biggestLoss.awayScore} ${biggestLoss.away} (${formatDate(biggestLoss.date)})</div>` : ""}
      </div>
      <div class="stats-panel">
        <div class="panel-title">By Competition</div>
        ${compSorted.map(([c, n]) => `
          <div class="bar-row"><span class="bar-label">${c}</span><div class="bar-track"><div class="bar-fill comp-fill" style="width:${(n / compMax) * 100}%"></div></div><span class="bar-val">${n}</span></div>
        `).join("")}
      </div>
      <div class="stats-panel">
        <div class="panel-title">By Day of Week</div>
        ${dayOrder.map(d => `
          <div class="bar-row"><span class="bar-label">${d}</span><div class="bar-track"><div class="bar-fill day-fill" style="width:${((dayCount[d] || 0) / dayMax) * 100}%"></div></div><span class="bar-val">${dayCount[d] || 0}</span></div>
        `).join("")}
      </div>
      <div class="stats-panel">
        <div class="panel-title">By Month</div>
        ${monthNames.map(m => `
          <div class="bar-row"><span class="bar-label">${m}</span><div class="bar-track"><div class="bar-fill month-fill" style="width:${((monthCount[m] || 0) / monthMax) * 100}%"></div></div><span class="bar-val">${monthCount[m] || 0}</span></div>
        `).join("")}
      </div>
    </div>
  `;
}

// ─── Add / Edit Match Modal ───────────────────────────────────────────────────
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
  document.getElementById("m-notes").value = "";
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
  document.getElementById("m-notes").value = m.notes || "";
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

  if (!date || !home || !away) {
    alert("Date, home team and away team are required.");
    return;
  }

  if (editingMatchIdx) {
    const m = matches.find(x => x.id === editingMatchIdx);
    if (m) {
      Object.assign(m, { date, stadium, home, away, homeScore, awayScore, attendance, competition, notes });
    }
  } else {
    matches.push({ id: crypto.randomUUID(), date, stadium, home, away, homeScore, awayScore, attendance, competition, notes });
  }

  save();
  closeMatchModal();
  renderAll();
}

function deleteMatch() {
  if (!editingMatchIdx) return;
  showConfirmModal("Delete this match?", () => {
    matches = matches.filter(m => m.id !== editingMatchIdx);
    save();
    closeMatchModal();
    renderAll();
  });
}

function closeMatchModal() {
  document.getElementById("match-modal-overlay").classList.add("hidden");
  editingMatchIdx = null;
}

// ─── Ground Detail Modal ──────────────────────────────────────────────────────
function openGroundModal(name) {
  const grounds = getUniqueGrounds();
  const ms = grounds[name];
  if (!ms) return;
  document.getElementById("ground-modal-title").textContent = name;
  const sorted = [...ms].sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById("ground-modal-meta").textContent = `${ms.length} visit${ms.length > 1 ? "s" : ""} · First: ${formatDate(sorted[sorted.length - 1].date)} · Last: ${formatDate(sorted[0].date)}`;
  document.getElementById("ground-modal-matches").innerHTML = sorted.map(m => `
    <div class="gm-match">
      <div class="gm-date">${formatDate(m.date)}</div>
      <div class="gm-teams">${m.home} ${m.homeScore ?? ""}–${m.awayScore ?? ""} ${m.away}</div>
      <div class="gm-comp">${m.competition || ""}</div>
    </div>
  `).join("");
  document.getElementById("ground-modal-overlay").classList.remove("hidden");
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
let confirmCallback = null;
function showConfirmModal(msg, cb) {
  document.getElementById("confirm-modal-msg").textContent = msg;
  confirmCallback = cb;
  document.getElementById("confirm-modal-overlay").classList.remove("hidden");
}

document.getElementById("confirm-modal-yes").addEventListener("click", () => {
  document.getElementById("confirm-modal-overlay").classList.add("hidden");
  if (confirmCallback) confirmCallback();
  confirmCallback = null;
});
document.getElementById("confirm-modal-no").addEventListener("click", () => {
  document.getElementById("confirm-modal-overlay").classList.add("hidden");
  confirmCallback = null;
});

// ─── Undo Toast ───────────────────────────────────────────────────────────────
let undoTimer = null;
function showUndo(msg, cb) {
  const toast = document.getElementById("undo-toast");
  document.getElementById("undo-toast-msg").textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => toast.classList.add("hidden"), 5000);
  document.getElementById("undo-toast-btn").onclick = () => {
    toast.classList.add("hidden");
    cb();
  };
}

// ─── Dark Mode ────────────────────────────────────────────────────────────────
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark", darkMode);
  localStorage.setItem("hawkbology_dark", darkMode ? "1" : "0");
  document.getElementById("btn-dark-mode").textContent = darkMode ? "☀️" : "🌙";
}

// ─── Page Navigation ──────────────────────────────────────────────────────────
const PAGES = ["dashboard", "matches", "grounds", "stats", "ask"];
document.querySelectorAll(".page-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".page-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const page = btn.dataset.page;
    PAGES.forEach(p => {
      const el = document.getElementById("page-" + p);
      if (el) el.classList.toggle("hidden", p !== page);
    });
    if (page === "matches") { populateFilters(); renderMatches(); }
    if (page === "grounds") renderGrounds();
    if (page === "stats") renderStats();
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
document.getElementById("ground-modal-close").addEventListener("click", () => {
  document.getElementById("ground-modal-overlay").classList.add("hidden");
});
document.getElementById("btn-dark-mode").addEventListener("click", toggleDarkMode);

// Search / filter listeners
document.getElementById("match-search").addEventListener("input", renderMatches);
document.getElementById("filter-year").addEventListener("change", renderMatches);
document.getElementById("filter-comp").addEventListener("change", renderMatches);
document.getElementById("filter-result").addEventListener("change", renderMatches);
document.getElementById("ground-search").addEventListener("input", renderGrounds);
document.getElementById("ground-sort").addEventListener("change", renderGrounds);

// Close modals on overlay click
["match-modal-overlay", "ground-modal-overlay", "confirm-modal-overlay"].forEach(id => {
  document.getElementById(id).addEventListener("click", e => {
    if (e.target.id === id) {
      document.getElementById(id).classList.add("hidden");
    }
  });
});

// ─── Render All ───────────────────────────────────────────────────────────────
function renderAll() {
  updateHeaderStats();
  renderDashboard();
  populateFilters();
}

// ─── Init ─────────────────────────────────────────────────────────────────────
load();
if (localStorage.getItem("hawkbology_dark") === "1") {
  darkMode = true;
  document.body.classList.add("dark");
  document.getElementById("btn-dark-mode").textContent = "☀️";
}
renderAll();
