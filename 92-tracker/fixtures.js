// ─── fixtures.js ─────────────────────────────────────────────────────────────
// Fetches upcoming fixtures from football-data.org and shows home games
// for clubs the user hasn't visited yet, grouped by date.

const COMPETITIONS = [
  { code: "PL",  label: "Premier League",  div: "Premier League" },
  { code: "ELC", label: "Championship",    div: "Championship"   },
  { code: "EL1", label: "League One",      div: "League One"     },
  { code: "EL2", label: "League Two",      div: "League Two"     },
];

const API_BASE = "https://api.football-data.org/v4";
const LS_KEY_APIKEY = "92club_apikey";
const LS_KEY_CACHE  = "92club_fixtures_cache";
const CACHE_TTL_MS  = 60 * 60 * 1000; // 1 hour

let fixturesDivFilter = "all";
let unvisitedOnly = true;
let cachedFixtures = null; // { ts, matches: [...] }

// ── Normalise club name for fuzzy matching ────────────────────────────────────
function normName(s) {
  return s.toLowerCase()
    .replace(/\s*(fc|afc|city|united|town|county|rovers|wanderers|athletic|hotspur|albion|north end|park rangers)\s*/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Build a lookup: normName → club id
function buildNameMap() {
  const map = {};
  for (const club of state.clubs) {
    map[normName(club.name)] = club.id;
  }
  return map;
}

function matchClubId(apiName, nameMap) {
  const n = normName(apiName);
  if (nameMap[n] !== undefined) return nameMap[n];
  // Partial match fallback
  for (const [key, id] of Object.entries(nameMap)) {
    if (n.includes(key) || key.includes(n)) return id;
  }
  return null;
}

// ── API fetch ─────────────────────────────────────────────────────────────────
async function fetchCompetitionFixtures(code, apiKey) {
  const today = new Date();
  const dateFrom = today.toISOString().slice(0, 10);
  const dateTo = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const url = `${API_BASE}/competitions/${code}/matches?status=SCHEDULED&dateFrom=${dateFrom}&dateTo=${dateTo}`;
  const res = await fetch(url, { headers: { "X-Auth-Token": apiKey } });
  if (!res.ok) {
    if (res.status === 403) throw new Error("forbidden");
    if (res.status === 429) throw new Error("ratelimit");
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  return (data.matches || []).map(m => ({
    competition: code,
    date: m.utcDate.slice(0, 10),
    time: m.utcDate.slice(11, 16),
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    venue: m.homeTeam.venue || null,
  }));
}

async function fetchAllFixtures(apiKey) {
  // Check cache
  const raw = localStorage.getItem(LS_KEY_CACHE);
  if (raw) {
    try {
      const c = JSON.parse(raw);
      if (Date.now() - c.ts < CACHE_TTL_MS) {
        cachedFixtures = c;
        return c.matches;
      }
    } catch {}
  }

  setStatus("loading", "Fetching fixtures…");
  const all = [];
  for (const comp of COMPETITIONS) {
    try {
      const matches = await fetchCompetitionFixtures(comp.code, apiKey);
      all.push(...matches);
    } catch (err) {
      if (err.message === "forbidden") {
        // This competition not on free tier — skip silently
        console.warn(`${comp.code} not available on this API tier`);
      } else {
        throw err;
      }
    }
  }

  cachedFixtures = { ts: Date.now(), matches: all };
  localStorage.setItem(LS_KEY_CACHE, JSON.stringify(cachedFixtures));
  return all;
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderFixtures(matches) {
  const container = document.getElementById("fixtures-list");
  const nameMap = buildNameMap();

  // Filter
  const filtered = matches.filter(m => {
    if (fixturesDivFilter !== "all" && m.competition !== fixturesDivFilter) return false;
    const homeId = matchClubId(m.homeTeam, nameMap);
    if (unvisitedOnly && homeId !== null && state.visits[homeId]) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="fix-empty">No upcoming fixtures match your filters.</div>';
    return;
  }

  // Group by date
  const byDate = {};
  for (const m of filtered) {
    if (!byDate[m.date]) byDate[m.date] = [];
    byDate[m.date].push(m);
  }

  const compLabel = { PL: "Premier League", ELC: "Championship", EL1: "League One", EL2: "League Two" };
  const compColor = { PL: "pl-color", ELC: "champ-color", EL1: "l1-color", EL2: "l2-color" };

  let html = "";
  for (const date of Object.keys(byDate).sort()) {
    const d = new Date(date + "T12:00:00");
    const label = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    html += `<div class="fix-date-group">
      <div class="fix-date-header">${label}</div>
      <div class="fix-matches">`;

    for (const m of byDate[date].sort((a, b) => a.time.localeCompare(b.time))) {
      const homeId = matchClubId(m.homeTeam, nameMap);
      const visited = homeId !== null && !!state.visits[homeId];
      const cc = compColor[m.competition] || "";
      html += `
        <div class="fix-match${visited ? " fix-visited" : ""}">
          <span class="fix-comp-tag ${cc}">${compLabel[m.competition] || m.competition}</span>
          <span class="fix-time">${m.time}</span>
          <span class="fix-teams">
            <span class="fix-home">${m.homeTeam}</span>
            <span class="fix-vs">vs</span>
            <span class="fix-away">${m.awayTeam}</span>
          </span>
          ${visited ? '<span class="fix-done-badge">✓ Visited</span>' : ""}
        </div>`;
    }
    html += `</div></div>`;
  }

  container.innerHTML = html;
}

// ── Status helper ─────────────────────────────────────────────────────────────
function setStatus(type, msg) {
  const el = document.getElementById("api-status");
  el.className = "api-status " + type;
  el.textContent = msg;
}

// ── Load / refresh ────────────────────────────────────────────────────────────
async function loadFixtures() {
  const apiKey = localStorage.getItem(LS_KEY_APIKEY) || "";
  const input = document.getElementById("api-key-input");
  if (input && !input.value && apiKey) input.value = apiKey;

  if (!apiKey) {
    setStatus("warn", "Enter your free API key above to load fixtures.");
    document.getElementById("fixtures-list").innerHTML =
      '<div class="fix-empty fix-prompt">Register at <a href="https://www.football-data.org/client/register" target="_blank">football-data.org</a> for a free API key, then paste it above.</div>';
    return;
  }

  try {
    const matches = await fetchAllFixtures(apiKey);
    setStatus("ok", `${matches.length} fixtures loaded · cached for 1 hour`);
    renderFixtures(matches);
  } catch (err) {
    if (err.message === "ratelimit") {
      setStatus("error", "Rate limit hit — please wait a minute and try again.");
    } else {
      setStatus("error", "Failed to load fixtures: " + err.message);
    }
  }
}

// ── Controls ──────────────────────────────────────────────────────────────────
document.getElementById("btn-save-key").addEventListener("click", () => {
  const key = document.getElementById("api-key-input").value.trim();
  if (!key) { setStatus("warn", "Please enter an API key."); return; }
  localStorage.setItem(LS_KEY_APIKEY, key);
  // Bust cache so fresh data loads
  localStorage.removeItem(LS_KEY_CACHE);
  cachedFixtures = null;
  loadFixtures();
});

document.getElementById("api-key-input").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("btn-save-key").click();
});

document.querySelectorAll(".fix-div-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".fix-div-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    fixturesDivFilter = btn.dataset.div;
    if (cachedFixtures) renderFixtures(cachedFixtures.matches);
  });
});

document.getElementById("toggle-unvisited-only").addEventListener("change", e => {
  unvisitedOnly = e.target.checked;
  if (cachedFixtures) renderFixtures(cachedFixtures.matches);
});
