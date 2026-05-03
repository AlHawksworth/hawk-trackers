// ─── journey.js ──────────────────────────────────────────────────────────────
// "Journey Map" tab — shows remaining grounds as a dotted route, grouped by
// region, with an ordered itinerary sidebar.

let journeyMapInstance = null;
let journeyMarkerLayer = null;
let journeyRouteLayer  = null;
let journeyDoneLayer   = null;
let journeyInitialised = false;

// ── Region order for the route (roughly north→south, west→east sweeps) ────────
const JOURNEY_REGION_ORDER = [
  "North East", "Cumbria", "North West", "Yorkshire",
  "East of England", "East Midlands", "West Midlands",
  "Wales", "South West", "South Coast", "South East", "London",
];

// ── Build an ordered list of unvisited clubs ──────────────────────────────────
function buildJourneyRoute() {
  const unvisited = [];
  for (const regionName of JOURNEY_REGION_ORDER) {
    const region = REGIONS.find(r => r.name === regionName);
    if (!region) continue;
    const clubs = state.clubs.filter(c =>
      region.ids.includes(Number(c.id)) &&
      !state.visits[c.id] &&
      CLUB_COORDS[c.id]
    );
    // Within each region sort by division (PL first) then alpha
    clubs.sort((a, b) => {
      const divOrder = ["Premier League","Championship","League One","League Two"];
      const da = divOrder.indexOf(a.division), db = divOrder.indexOf(b.division);
      return da !== db ? da - db : a.name.localeCompare(b.name);
    });
    unvisited.push(...clubs);
  }
  return unvisited;
}

function buildVisitedRoute() {
  return state.clubs
    .filter(c => state.visits[c.id]?.date && CLUB_COORDS[c.id])
    .sort((a, b) => state.visits[a.id].date.localeCompare(state.visits[b.id].date));
}

// ── Render the itinerary sidebar list ─────────────────────────────────────────
function renderJourneyItinerary(route) {
  const el = document.getElementById("journey-itinerary");
  if (!el) return;

  if (!route.length) {
    el.innerHTML = `<div class="journey-complete-msg">🎉 All 92 visited! The 92 Club is yours.</div>`;
    return;
  }

  let currentRegion = null;
  let html = "";

  for (let i = 0; i < route.length; i++) {
    const club = route[i];
    const region = JOURNEY_REGION_ORDER.find(rn => {
      const r = REGIONS.find(x => x.name === rn);
      return r && r.ids.includes(Number(club.id));
    });

    if (region !== currentRegion) {
      if (currentRegion !== null) html += `</div>`;
      const r = REGIONS.find(x => x.name === region);
      const regionClubs = route.filter(c => {
        const rx = REGIONS.find(x => x.name === region);
        return rx && rx.ids.includes(Number(c.id));
      });
      html += `
        <div class="journey-region-group">
          <div class="journey-region-header">
            <span class="journey-region-emoji">${r?.emoji || "📍"}</span>
            <span class="journey-region-name">${region}</span>
            <span class="journey-region-count">${regionClubs.length} left</span>
          </div>`;
      currentRegion = region;
    }

    const color = DIV_PIN_COLOR[club.division] || "#888";
    const diff  = getDifficulty(club);
    html += `
      <div class="journey-stop" data-id="${club.id}">
        <div class="journey-stop-num">${i + 1}</div>
        <div class="journey-stop-dot" style="background:${color}"></div>
        <div class="journey-stop-info">
          <div class="journey-stop-name">${club.name}</div>
          <div class="journey-stop-sub">${club.stadium}</div>
        </div>
        <span class="journey-diff-dot" style="background:${diff.color}" title="${diff.label}"></span>
      </div>`;
  }
  if (currentRegion !== null) html += `</div>`;

  el.innerHTML = html;

  // Click a stop → fly map to that club
  el.querySelectorAll(".journey-stop").forEach(row => {
    row.addEventListener("click", () => {
      const id = parseInt(row.dataset.id);
      const coords = CLUB_COORDS[id];
      if (coords && journeyMapInstance) {
        journeyMapInstance.flyTo(coords, 13, { duration: 1 });
        // Highlight the marker
        journeyMarkerLayer?.eachLayer(m => {
          if (m.options._clubId === id) m.openPopup();
        });
      }
    });
  });
}

// ── Draw the map ──────────────────────────────────────────────────────────────
function drawJourneyMap() {
  if (!journeyMapInstance) return;

  journeyMarkerLayer.clearLayers();
  journeyRouteLayer.clearLayers();
  journeyDoneLayer.clearLayers();

  const route   = buildJourneyRoute();
  const visited = buildVisitedRoute();

  // ── Dotted route line through unvisited grounds ───────────────────────────
  if (route.length >= 2) {
    const latlngs = route.map(c => CLUB_COORDS[c.id]);
    L.polyline(latlngs, {
      color: "#7c3aed",
      weight: 2,
      opacity: 0.45,
      dashArray: "6 7",
    }).addTo(journeyRouteLayer);
  }

  // ── Solid line through visited grounds (in date order) ────────────────────
  if (visited.length >= 2) {
    const latlngs = visited.map(c => CLUB_COORDS[c.id]);
    L.polyline(latlngs, {
      color: "#27ae60",
      weight: 2.5,
      opacity: 0.55,
    }).addTo(journeyDoneLayer);
  }

  // ── Unvisited markers ─────────────────────────────────────────────────────
  route.forEach((club, idx) => {
    const coords = CLUB_COORDS[club.id];
    const color  = DIV_PIN_COLOR[club.division] || "#888";
    const icon   = makeJourneyIcon(color, false, idx + 1);
    const marker = L.marker(coords, { icon, title: club.name, _clubId: club.id });
    const diff   = getDifficulty(club);

    marker.bindPopup(`
      <div class="lf-popup">
        <div class="lf-popup-name">${club.name}</div>
        <div class="lf-popup-div" style="color:${color}">${club.division}</div>
        <div class="lf-popup-stadium">🏟 ${club.stadium}</div>
        <div style="font-size:0.72rem;margin:4px 0 8px;color:${diff.color};font-weight:600">
          ${diff.label} tickets · ${diff.tip}
        </div>
        <div style="font-size:0.7rem;color:#888;margin-bottom:8px">Stop #${idx + 1} on your route</div>
        <button class="lf-btn lf-btn-visit" data-id="${club.id}">Mark as visited</button>
      </div>`, { maxWidth: 240, className: "lf-popup-wrap" });

    marker.on("popupopen", () => {
      const btn = document.querySelector(`.lf-btn-visit[data-id="${club.id}"]`);
      if (btn) btn.addEventListener("click", () => {
        marker.closePopup();
        if (typeof openVisitModal === "function") openVisitModal(club.id);
      });
    });

    marker.addTo(journeyMarkerLayer);
  });

  // ── Visited markers (smaller, green) ─────────────────────────────────────
  visited.forEach(club => {
    const coords = CLUB_COORDS[club.id];
    const icon   = makeJourneyIcon("#27ae60", true);
    const marker = L.marker(coords, { icon, title: club.name, _clubId: club.id });
    const vd     = state.visits[club.id];

    marker.bindPopup(`
      <div class="lf-popup">
        <div class="lf-popup-name">${club.name}</div>
        <div class="lf-popup-div" style="color:#27ae60">${club.division}</div>
        <div class="lf-popup-stadium">🏟 ${club.stadium}</div>
        <div class="lf-popup-status visited-status">✓ Visited${vd?.date ? " · " + formatDate(vd.date) : ""}</div>
        ${vd?.notes ? `<div class="lf-popup-notes">"${vd.notes}"</div>` : ""}
      </div>`, { maxWidth: 220, className: "lf-popup-wrap" });

    marker.addTo(journeyMarkerLayer);
  });

  renderJourneyItinerary(route);
  updateJourneyStats(route, visited);
}

// ── Custom icon for journey map ───────────────────────────────────────────────
function makeJourneyIcon(color, visited, num) {
  if (visited) {
    return L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);opacity:0.8"></div>`,
      className: "",
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -10],
    });
  }
  return L.divIcon({
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:${color};border:2.5px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:9px;font-weight:700;font-family:sans-serif;
      line-height:1">${num || ""}</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16],
  });
}

// ── Stats bar at top of sidebar ───────────────────────────────────────────────
function updateJourneyStats(route, visited) {
  const total   = state.clubs.length;
  const doneN   = visited.length;
  const leftN   = route.length;
  const pct     = total ? Math.round((doneN / total) * 100) : 0;

  const el = document.getElementById("journey-stats");
  if (!el) return;
  el.innerHTML = `
    <div class="journey-stat"><span class="journey-stat-val">${doneN}</span><span class="journey-stat-label">Done</span></div>
    <div class="journey-stat"><span class="journey-stat-val" style="color:#7c3aed">${leftN}</span><span class="journey-stat-label">Remaining</span></div>
    <div class="journey-stat-bar-wrap">
      <div class="journey-stat-bar" style="width:${pct}%"></div>
    </div>
    <span class="journey-stat-pct">${pct}%</span>
  `;
}

// ── Init ──────────────────────────────────────────────────────────────────────
function initJourneyMap() {
  if (journeyInitialised) {
    journeyMapInstance.invalidateSize();
    drawJourneyMap();
    return;
  }
  journeyInitialised = true;

  journeyMapInstance = L.map("journey-leaflet-map", {
    center: [52.8, -1.8], zoom: 6, minZoom: 5, maxZoom: 14,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd", maxZoom: 19,
  }).addTo(journeyMapInstance);

  journeyDoneLayer   = L.layerGroup().addTo(journeyMapInstance);
  journeyRouteLayer  = L.layerGroup().addTo(journeyMapInstance);
  journeyMarkerLayer = L.layerGroup().addTo(journeyMapInstance);

  drawJourneyMap();

  // Layer toggles
  document.getElementById("journey-toggle-route").addEventListener("change", e => {
    if (e.target.checked) journeyRouteLayer.addTo(journeyMapInstance);
    else journeyMapInstance.removeLayer(journeyRouteLayer);
  });
  document.getElementById("journey-toggle-done").addEventListener("change", e => {
    if (e.target.checked) journeyDoneLayer.addTo(journeyMapInstance);
    else journeyMapInstance.removeLayer(journeyDoneLayer);
  });

  // Reset view button
  document.getElementById("journey-reset-view").addEventListener("click", () => {
    journeyMapInstance.flyTo([52.8, -1.8], 6, { duration: 1 });
  });
}
