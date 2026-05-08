// ─── map.js ──────────────────────────────────────────────────────────────────
// Leaflet-based interactive map with regional breakdown.

// ── Club coordinates (lat, lng) ───────────────────────────────────────────────
const CLUB_COORDS = {
  1:  [51.555, -0.108],   // Arsenal
  2:  [52.509, -1.885],   // Aston Villa
  3:  [50.735, -1.838],   // Bournemouth
  4:  [51.491, -0.289],   // Brentford
  5:  [50.862, -0.083],   // Brighton
  6:  [53.789, -2.230],   // Burnley
  7:  [51.482, -0.191],   // Chelsea
  8:  [51.398, -0.085],   // Crystal Palace
  9:  [53.445, -2.961],   // Everton
  10: [51.475, -0.221],   // Fulham
  11: [53.778, -1.572],   // Leeds
  12: [53.431, -2.961],   // Liverpool
  13: [53.483, -2.200],   // Man City
  14: [53.463, -2.291],   // Man Utd
  15: [54.975, -1.622],   // Newcastle
  16: [52.940, -1.133],   // Nottm Forest
  17: [54.914, -1.388],   // Sunderland
  18: [51.604, -0.066],   // Spurs
  19: [51.539,  0.017],   // West Ham
  20: [52.590, -2.130],   // Wolves
  21: [52.476, -1.867],   // Birmingham
  22: [53.728, -2.489],   // Blackburn
  23: [51.440, -2.620],   // Bristol City
  24: [51.487,  0.036],   // Charlton
  25: [52.448, -1.500],   // Coventry
  26: [52.915, -1.447],   // Derby
  27: [53.746, -0.367],   // Hull
  28: [52.055,  1.145],   // Ipswich
  29: [52.620, -1.142],   // Leicester
  30: [54.578, -1.217],   // Middlesbrough
  31: [51.486, -0.051],   // Millwall
  32: [52.622,  1.309],   // Norwich
  33: [51.717, -1.208],   // Oxford
  34: [50.796, -1.064],   // Portsmouth
  35: [53.772, -2.685],   // Preston
  36: [51.509, -0.232],   // QPR
  37: [53.370, -1.471],   // Sheffield Utd
  38: [53.411, -1.500],   // Sheffield Wed
  39: [50.906, -1.391],   // Southampton
  40: [53.000, -2.175],   // Stoke
  41: [51.643, -3.935],   // Swansea
  42: [51.650, -0.402],   // Watford
  43: [52.509, -1.964],   // West Brom
  44: [53.046, -2.993],   // Wrexham
  45: [51.422, -0.196],   // AFC Wimbledon
  46: [53.552, -1.467],   // Barnsley
  47: [53.804, -3.048],   // Blackpool
  48: [53.580, -2.535],   // Bolton
  49: [53.804, -1.778],   // Bradford
  50: [52.812, -1.641],   // Burton Albion
  51: [51.473, -3.203],   // Cardiff
  52: [53.522, -1.122],   // Doncaster
  53: [50.728, -3.524],   // Exeter
  54: [53.654, -1.768],   // Huddersfield
  55: [51.560, -0.013],   // Leyton Orient
  56: [53.228, -0.540],   // Lincoln
  57: [51.884, -0.432],   // Luton
  58: [53.143, -1.196],   // Mansfield
  59: [52.236, -0.934],   // Northampton
  60: [52.570, -0.237],   // Peterborough
  61: [50.388, -4.122],   // Plymouth
  62: [53.050, -2.183],   // Port Vale
  63: [51.422, -0.983],   // Reading
  64: [53.430, -1.362],   // Rotherham
  65: [51.882, -0.202],   // Stevenage
  66: [53.400, -2.158],   // Stockport
  67: [53.545, -2.637],   // Wigan
  68: [51.630, -0.799],   // Wycombe
  69: [53.754, -2.364],   // Accrington
  70: [51.650, -0.279],   // Barnet
  71: [54.111, -3.227],   // Barrow
  72: [51.511, -2.573],   // Bristol Rovers
  73: [51.402,  0.017],   // Bromley
  74: [52.205,  0.124],   // Cambridge
  75: [51.900, -2.070],   // Cheltenham
  76: [53.235, -1.428],   // Chesterfield
  77: [51.893,  0.897],   // Colchester
  78: [51.109, -0.187],   // Crawley
  79: [53.089, -2.440],   // Crewe
  80: [53.921, -3.012],   // Fleetwood
  81: [51.386,  0.570],   // Gillingham
  82: [53.567, -0.068],   // Grimsby
  83: [53.992, -1.540],   // Harrogate
  84: [52.001, -0.787],   // MK Dons
  85: [51.588, -2.997],   // Newport
  86: [52.944, -1.148],   // Notts County
  87: [53.540, -2.116],   // Oldham
  88: [53.502, -2.296],   // Salford
  89: [52.707, -2.752],   // Shrewsbury
  90: [51.564, -1.772],   // Swindon
  91: [53.374, -3.108],   // Tranmere
  92: [52.566, -1.997],   // Walsall
};

const DIV_PIN_COLOR = {
  "Premier League": "#7c3aed",
  "Championship":   "#e74c3c",
  "League One":     "#f39c12",
  "League Two":     "#27ae60",
};

// ── Regions ───────────────────────────────────────────────────────────────────
const REGIONS = [
  {
    // Greater London clubs only
    name: "London", emoji: "🏙",
    ids: [
      1,  // Arsenal
      4,  // Brentford
      7,  // Chelsea
      8,  // Crystal Palace
      10, // Fulham
      18, // Tottenham Hotspur
      19, // West Ham United
      24, // Charlton Athletic
      31, // Millwall
      36, // Queens Park Rangers
      45, // AFC Wimbledon
      55, // Leyton Orient
      70, // Barnet
      73, // Bromley
    ],
    center: [51.5, -0.12], zoom: 10,
  },
  {
    // South East — Surrey, Kent, Sussex, Herts, Beds, Berks, Bucks, Oxon
    name: "South East", emoji: "🌳",
    ids: [
      5,  // Brighton & Hove Albion
      33, // Oxford United
      42, // Watford (Hertfordshire)
      57, // Luton Town (Bedfordshire)
      63, // Reading (Berkshire)
      65, // Stevenage (Hertfordshire)
      68, // Wycombe Wanderers (Buckinghamshire)
      78, // Crawley Town (West Sussex)
      81, // Gillingham (Kent)
      84, // Milton Keynes Dons (Buckinghamshire)
    ],
    center: [51.55, -0.5], zoom: 8,
  },
  {
    // South Coast — Dorset, Hampshire, Isle of Wight
    name: "South Coast", emoji: "⛵",
    ids: [
      3,  // Bournemouth
      34, // Portsmouth
      39, // Southampton
    ],
    center: [50.85, -1.4], zoom: 9,
  },
  {
    // South West — Devon, Cornwall, Somerset, Wiltshire, Gloucestershire
    name: "South West", emoji: "🌊",
    ids: [
      53, // Exeter City
      61, // Plymouth Argyle
      72, // Bristol Rovers
      75, // Cheltenham Town
      90, // Swindon Town
      23, // Bristol City
    ],
    center: [51.3, -2.8], zoom: 8,
  },
  {
    // East of England — Norfolk, Suffolk, Essex, Lincolnshire, Cambridgeshire
    name: "East of England", emoji: "🌾",
    ids: [
      28, // Ipswich Town (Suffolk)
      32, // Norwich City (Norfolk)
      56, // Lincoln City (Lincolnshire)
      60, // Peterborough United (Cambridgeshire)
      74, // Cambridge United (Cambridgeshire)
      77, // Colchester United (Essex)
      82, // Grimsby Town (Lincolnshire)
    ],
    center: [52.5, 0.5], zoom: 8,
  },
  {
    // East Midlands — Nottinghamshire, Derbyshire, Leicestershire, Northamptonshire, Lincolnshire
    name: "East Midlands", emoji: "🏰",
    ids: [
      16, // Nottingham Forest
      26, // Derby County
      29, // Leicester City
      58, // Mansfield Town
      59, // Northampton Town
      76, // Chesterfield
      86, // Notts County
    ],
    center: [52.8, -1.1], zoom: 8,
  },
  {
    // West Midlands — Birmingham, Coventry, Wolves, Walsall, West Brom, Shrewsbury, Stoke, Burton
    name: "West Midlands", emoji: "⚙️",
    ids: [
      2,  // Aston Villa
      20, // Wolverhampton Wanderers
      21, // Birmingham City
      25, // Coventry City
      40, // Stoke City
      43, // West Bromwich Albion
      50, // Burton Albion
      62, // Port Vale
      89, // Shrewsbury Town
      92, // Walsall
    ],
    center: [52.5, -2.0], zoom: 8,
  },
  {
    // Yorkshire — Leeds, Sheffield, Hull, Bradford, Barnsley, Doncaster, Huddersfield, Rotherham, Harrogate
    name: "Yorkshire", emoji: "🌹",
    ids: [
      11, // Leeds United
      27, // Hull City
      37, // Sheffield United
      38, // Sheffield Wednesday
      46, // Barnsley
      49, // Bradford City
      52, // Doncaster Rovers
      54, // Huddersfield Town
      64, // Rotherham United
      83, // Harrogate Town
    ],
    center: [53.7, -1.5], zoom: 9,
  },
  {
    // North West — Greater Manchester, Merseyside, Lancashire, Cheshire
    name: "North West", emoji: "🌹",
    ids: [
      6,  // Burnley
      9,  // Everton
      12, // Liverpool
      13, // Manchester City
      14, // Manchester United
      22, // Blackburn Rovers
      35, // Preston North End
      47, // Blackpool
      48, // Bolton Wanderers
      66, // Stockport County
      67, // Wigan Athletic
      69, // Accrington Stanley
      79, // Crewe Alexandra (Cheshire)
      80, // Fleetwood Town
      87, // Oldham Athletic
      88, // Salford City
      91, // Tranmere Rovers
    ],
    center: [53.5, -2.5], zoom: 8,
  },
  {
    // North East — Tyne & Wear, Teesside, County Durham
    name: "North East", emoji: "⚓",
    ids: [
      15, // Newcastle United
      17, // Sunderland
      30, // Middlesbrough
    ],
    center: [54.8, -1.5], zoom: 9,
  },
  {
    // Cumbria
    name: "Cumbria", emoji: "🏔",
    ids: [
      71, // Barrow
    ],
    center: [54.2, -3.0], zoom: 10,
  },
  {
    // Wales
    name: "Wales", emoji: "🐉",
    ids: [
      41, // Swansea City
      44, // Wrexham
      51, // Cardiff City
      85, // Newport County
    ],
    center: [51.9, -3.5], zoom: 8,
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
let leafletMap    = null;
let markerLayer   = null;
let activeDivs    = new Set(["Premier League", "Championship", "League One", "League Two"]);
let activeRegion  = null;
let showYearLabels   = false;
let showUnvisitedOnly = false;
let homeMarker    = null;
let radiusCircle  = null;
let showHomeMarker = false;
let showRadius     = false;

// ── Icon builder ──────────────────────────────────────────────────────────────
function makeIcon(color, visited, highlight, year) {
  const size    = visited ? 28 : 22;
  const opacity = highlight === false ? "0.2" : "1";
  const yearTag = (visited && showYearLabels && year)
    ? `<div style="position:absolute;bottom:${size*1.4+2}px;left:50%;transform:translateX(-50%);background:${color};color:#fff;font-size:9px;font-weight:700;padding:1px 4px;border-radius:4px;white-space:nowrap;pointer-events:none">${year}</div>`
    : "";
  const wrapper = `<div style="position:relative;display:inline-block">`;
  const svg = visited
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size*1.4}" viewBox="0 0 28 39" style="opacity:${opacity}">
        <path d="M14 38 C14 38 2 22 2 14 A12 12 0 1 1 26 14 C26 22 14 38 14 38Z" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="14" y="16" text-anchor="middle" dominant-baseline="central" fill="white" font-size="11" font-weight="bold" font-family="sans-serif">✓</text>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size*1.4}" viewBox="0 0 22 31" style="opacity:${opacity}">
        <path d="M11 30 C11 30 1 18 1 11 A10 10 0 1 1 21 11 C21 18 11 30 11 30Z" fill="white" stroke="${color}" stroke-width="2.5"/>
        <circle cx="11" cy="11" r="3.5" fill="${color}" opacity="0.7"/>
      </svg>`;
  return L.divIcon({
    html: wrapper + yearTag + svg + "</div>",
    className: "",
    iconSize:   [size, size*1.4 + (showYearLabels && year ? 14 : 0)],
    iconAnchor: [size/2, size*1.4 + (showYearLabels && year ? 14 : 0)],
    popupAnchor:[0, -(size*1.4)]
  });
}

// ── Init map ──────────────────────────────────────────────────────────────────
function initMap() {
  if (leafletMap) return;
  leafletMap = L.map("leaflet-map", { center: [52.8, -1.8], zoom: 6, minZoom: 5, maxZoom: 13 });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd", maxZoom: 19,
  }).addTo(leafletMap);
  markerLayer = L.layerGroup().addTo(leafletMap);
  drawClubs();
  drawHeatmap();
  drawHomeMarker();
  drawRadiusCircle();
  setupNearestUnvisited();
  updateSidebar();
}

// ── Draw markers ──────────────────────────────────────────────────────────────
function drawClubs() {
  if (!leafletMap) return;
  markerLayer.clearLayers();
  const regionIds = activeRegion ? new Set(REGIONS.find(r => r.name === activeRegion)?.ids || []) : null;

  for (const club of state.clubs) {
    if (!activeDivs.has(club.division)) continue;
    const coords = CLUB_COORDS[club.id];
    if (!coords) continue;

    const visited   = !!state.visits[club.id];
    if (showUnvisitedOnly && visited) continue;
    const visitData = state.visits[club.id];
    const color     = DIV_PIN_COLOR[club.division] || "#888";
    const highlight = regionIds ? regionIds.has(Number(club.id)) : true;
    const year      = visitData?.date ? visitData.date.slice(0,4) : null;
    const marker    = L.marker(coords, { icon: makeIcon(color, visited, highlight, year), title: club.name });

    const popupHtml = `
      <div class="lf-popup">
        <div class="lf-popup-name">${club.name}</div>
        <div class="lf-popup-div" style="color:${color}">${club.division}</div>
        <div class="lf-popup-stadium">🏟 ${club.stadium}</div>
        ${visited
          ? `<div class="lf-popup-status visited-status">✓ Visited${visitData?.date ? " · " + formatDate(visitData.date) : ""}</div>
             ${visitData?.notes ? `<div class="lf-popup-notes">"${visitData.notes}"</div>` : ""}
             <button class="lf-btn lf-btn-remove" data-id="${club.id}">Remove visit</button>`
          : `<button class="lf-btn lf-btn-visit" data-id="${club.id}">Mark as visited</button>`}
      </div>`;

    marker.bindPopup(popupHtml, { maxWidth: 240, className: "lf-popup-wrap" });
    marker.on("popupopen", () => {
      const vBtn = document.querySelector(`.lf-btn-visit[data-id="${club.id}"]`);
      const rBtn = document.querySelector(`.lf-btn-remove[data-id="${club.id}"]`);
      if (vBtn) vBtn.addEventListener("click", () => { marker.closePopup(); openVisitModal(club.id); });
      if (rBtn) rBtn.addEventListener("click", () => { marker.closePopup(); handleCardClick(club.id, true); });
    });
    markerLayer.addLayer(marker);
  }
}

// ── Sidebar tab switcher ──────────────────────────────────────────────────────
function switchSidebarTab(tab) {
  document.getElementById("sidebar-tab-stats").classList.toggle("active",   tab === "stats");
  document.getElementById("sidebar-tab-regions").classList.toggle("active", tab === "regions");
  document.getElementById("sidebar-panel-stats").classList.toggle("hidden",   tab !== "stats");
  document.getElementById("sidebar-panel-regions").classList.toggle("hidden", tab !== "regions");
}

// ── Sidebar stats ─────────────────────────────────────────────────────────────
function updateSidebar() {
  const total   = state.clubs.length;
  const visited = Object.keys(state.visits).length;
  const pct     = total ? Math.round((visited / total) * 100) : 0;
  const circ    = 2 * Math.PI * 48;

  document.getElementById("ms-visited").textContent   = visited;
  document.getElementById("ms-remaining").textContent = total - visited;
  document.getElementById("donut-pct").textContent    = pct + "%";
  document.getElementById("donut-arc").setAttribute("stroke-dasharray", `${(pct/100*circ).toFixed(1)} ${circ.toFixed(1)}`);

  [["Premier League","bar-pl","frac-pl"],["Championship","bar-ch","frac-ch"],
   ["League One","bar-l1","frac-l1"],["League Two","bar-l2","frac-l2"]].forEach(([key,barId,fracId]) => {
    const dc = state.clubs.filter(c => c.division === key);
    const dv = dc.filter(c => state.visits[c.id]).length;
    document.getElementById(barId).style.width  = (dc.length ? (dv/dc.length)*100 : 0) + "%";
    document.getElementById(fracId).textContent = `${dv}/${dc.length}`;
  });

  renderRecentVisits();
  renderRegions();
}

function renderRecentVisits() {
  const el = document.getElementById("recent-visits-list");
  if (!el) return;
  const visited = state.clubs
    .filter(c => state.visits[c.id]?.date)
    .sort((a, b) => state.visits[b.id].date.localeCompare(state.visits[a.id].date))
    .slice(0, 5);
  if (!visited.length) { el.innerHTML = '<div class="rv-empty">No visits logged yet</div>'; return; }
  el.innerHTML = visited.map(c => {
    const color = DIV_PIN_COLOR[c.division] || "#888";
    return `<div class="rv-item"><span class="rv-dot" style="background:${color}"></span><div class="rv-info"><div class="rv-name">${c.name}</div><div class="rv-date">${formatDate(state.visits[c.id].date)}</div></div></div>`;
  }).join("");
}

// ── Regional breakdown ────────────────────────────────────────────────────────
function renderRegions() {
  const el = document.getElementById("region-breakdown");
  if (!el) return;

  el.innerHTML = REGIONS.map(region => {
    const clubs     = state.clubs.filter(c => region.ids.includes(Number(c.id)));
    const done      = clubs.filter(c => state.visits[c.id]).length;
    const total     = clubs.length;
    const pct       = total ? Math.round((done / total) * 100) : 0;
    const remaining = clubs.filter(c => !state.visits[c.id]);    const isActive  = activeRegion === region.name;

    const remainingHtml = remaining.map(c => {
      const color = DIV_PIN_COLOR[c.division] || "#888";
      return `<div class="region-club-row"><span class="region-club-dot" style="background:${color}"></span><span class="region-club-name">${c.name}</span></div>`;
    }).join("");

    return `<div class="region-card${isActive ? " active" : ""}" data-region="${region.name}">
      <div class="region-card-header">
        <span class="region-emoji">${region.emoji}</span>
        <span class="region-name">${region.name}</span>
        <span class="region-frac">${done}/${total}</span>
      </div>
      <div class="region-bar-wrap"><div class="region-bar" style="width:${pct}%"></div></div>
      ${remaining.length
        ? `<div class="region-remaining${isActive ? "" : " hidden"}"><div class="region-remaining-label">${remaining.length} remaining:</div>${remainingHtml}</div>`
        : `<div class="region-complete">✓ Complete!</div>`}
    </div>`;
  }).join("");

  el.querySelectorAll(".region-card").forEach(card => {
    card.addEventListener("click", () => {
      const name = card.dataset.region;
      if (activeRegion === name) {
        activeRegion = null;
        if (leafletMap) leafletMap.setView([52.8, -1.8], 6);
      } else {
        activeRegion = name;
        const r = REGIONS.find(r => r.name === name);
        if (leafletMap && r) leafletMap.setView(r.center, r.zoom);
      }
      drawClubs();
      renderRegions();
    });
  });
}

// ── Journey mode (polyline connecting visited grounds in date order) ──────────
let journeyLayer  = null;
let heatLayer     = null;
let showJourney   = false;
let showHeatmap   = false;

function drawJourney() {
  if (journeyLayer) { journeyLayer.remove(); journeyLayer = null; }
  if (!showJourney || !leafletMap) return;

  const visited = state.clubs
    .filter(c => state.visits[c.id]?.date && CLUB_COORDS[c.id])
    .sort((a, b) => state.visits[a.id].date.localeCompare(state.visits[b.id].date));

  if (visited.length < 2) return;

  const latlngs = visited.map(c => CLUB_COORDS[c.id]);
  journeyLayer = L.polyline(latlngs, {
    color: "#7c3aed",
    weight: 2,
    opacity: 0.5,
    dashArray: "6 4",
  }).addTo(leafletMap);
}

// ── Heatmap overlay ───────────────────────────────────────────────────────────
function drawHeatmap() {
  if (heatLayer) { heatLayer.remove(); heatLayer = null; }
  if (!showHeatmap || !leafletMap) return;

  heatLayer = L.layerGroup().addTo(leafletMap);
  state.clubs
    .filter(c => state.visits[c.id] && CLUB_COORDS[c.id])
    .forEach(c => {
      L.circle(CLUB_COORDS[c.id], {
        radius: 28000,
        color: "none",
        fillColor: "#27ae60",
        fillOpacity: 0.07,
        interactive: false,
      }).addTo(heatLayer);
    });
}

// ── Nearest unvisited on map click ────────────────────────────────────────────
let nearestPopup = null;
function setupNearestUnvisited() {
  leafletMap.on("click", e => {
    // Don't fire if a marker popup is open
    if (nearestPopup) { nearestPopup.remove(); nearestPopup = null; }

    const { lat, lng } = e.latlng;
    const unvisited = state.clubs.filter(c => !state.visits[c.id] && CLUB_COORDS[c.id]);
    if (!unvisited.length) return;

    let nearest = null, nearestDist = Infinity;
    unvisited.forEach(c => {
      const [clat, clng] = CLUB_COORDS[c.id];
      const d = Math.sqrt((lat - clat) ** 2 + (lng - clng) ** 2);
      if (d < nearestDist) { nearestDist = d; nearest = c; }
    });

    if (!nearest) return;
    const [clat, clng] = CLUB_COORDS[nearest.id];
    const km = Math.round(typeof haversine !== "undefined"
      ? haversine(lat, lng, clat, clng)
      : nearestDist * 111);

    const color = DIV_PIN_COLOR[nearest.division] || "#888";
    nearestPopup = L.popup({ closeButton: true, autoClose: false })
      .setLatLng(e.latlng)
      .setContent(`
        <div style="font-family:sans-serif;min-width:160px">
          <div style="font-size:0.7rem;color:#888;margin-bottom:2px">Nearest unvisited</div>
          <div style="font-weight:700;font-size:0.92rem">${nearest.name}</div>
          <div style="font-size:0.72rem;color:${color};margin-bottom:6px">${nearest.division} · ${km} km away</div>
          <button class="lf-btn lf-btn-visit" data-id="${nearest.id}" style="margin-top:0">View club →</button>
        </div>`)
      .addTo(leafletMap);

    nearestPopup.on("add", () => {
      const btn = document.querySelector(`.lf-btn-visit[data-id="${nearest.id}"]`);
      if (btn) btn.addEventListener("click", () => {
        nearestPopup.remove(); nearestPopup = null;
        if (typeof openClubModal === "function") openClubModal(nearest.id);
      });
    });

    // Auto-close after 8 seconds
    setTimeout(() => { if (nearestPopup) { nearestPopup.remove(); nearestPopup = null; } }, 8000);
  });
}

// ── Home marker + radius circle ───────────────────────────────────────────────
function drawHomeMarker() {
  if (homeMarker) { homeMarker.remove(); homeMarker = null; }
  if (!showHomeMarker || !leafletMap) return;
  const homeIcon = L.divIcon({
    html: `<div style="background:#1a1a2e;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏠</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
  homeMarker = L.marker([homeLat, homeLng], { icon: homeIcon, zIndexOffset: 1000 })
    .bindPopup("<b>Home</b><br>CM16 4HW")
    .addTo(leafletMap);
}

function drawRadiusCircle() {
  if (radiusCircle) { radiusCircle.remove(); radiusCircle = null; }
  if (!showRadius || !leafletMap) return;
  const miles = parseInt(document.getElementById("radius-select").value) || 50;
  const km    = miles * 1.60934;
  radiusCircle = L.circle([homeLat, homeLng], {
    radius: km * 1000,
    color: "#7c3aed",
    weight: 1.5,
    opacity: 0.6,
    fillColor: "#7c3aed",
    fillOpacity: 0.05,
    interactive: false,
  }).addTo(leafletMap);
}

// ── Full redraw ───────────────────────────────────────────────────────────────
function redrawMap() {
  drawClubs();
  drawJourney();
  drawHeatmap();
  drawHomeMarker();
  drawRadiusCircle();
  updateSidebar();
}

// ── Page tab switching ────────────────────────────────────────────────────────
const PAGES = ["tracker", "map", "fixtures", "nonleague", "planner", "journey", "stats", "games"];
document.querySelectorAll(".page-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".page-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const page = btn.dataset.page;
    PAGES.forEach(p => {
      const el = document.getElementById("page-" + p);
      if (el) el.classList.toggle("hidden", p !== page);
    });
    if (page === "map") {
      setTimeout(() => {
        if (!leafletMap) initMap();
        else { leafletMap.invalidateSize(); redrawMap(); }
      }, 50);
    }
    if (page === "fixtures" && typeof loadFixtures    === "function") loadFixtures();
    if (page === "nonleague" && typeof renderNonLeague === "function") renderNonLeague();
    if (page === "planner"   && typeof initPlanner     === "function") initPlanner();
    if (page === "journey"   && typeof initJourneyMap  === "function") setTimeout(() => initJourneyMap(), 50);
    if (page === "stats"     && typeof renderStats     === "function") renderStats();
    if (page === "games"     && typeof initGamesPage   === "function") initGamesPage();
  });
});

// ── Sidebar tab buttons ───────────────────────────────────────────────────────
document.getElementById("sidebar-tab-stats").addEventListener("click",   () => switchSidebarTab("stats"));
document.getElementById("sidebar-tab-regions").addEventListener("click", () => switchSidebarTab("regions"));

// ── Division filter buttons ───────────────────────────────────────────────────
document.querySelectorAll(".map-div-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const div = btn.dataset.div;
    if (activeDivs.has(div)) {
      if (activeDivs.size === 1) return;
      activeDivs.delete(div);
      btn.classList.remove("active");
    } else {
      activeDivs.add(div);
      btn.classList.add("active");
    }
    updateShowAllBtn();
    drawClubs();
  });
});

document.getElementById("map-filter-all").addEventListener("click", () => {
  const all = ["Premier League","Championship","League One","League Two"];
  if (all.every(d => activeDivs.has(d))) {
    activeDivs = new Set(["Premier League"]);
    document.querySelectorAll(".map-div-toggle").forEach(b => b.classList.toggle("active", b.dataset.div === "Premier League"));
  } else {
    activeDivs = new Set(all);
    document.querySelectorAll(".map-div-toggle").forEach(b => b.classList.add("active"));
  }
  updateShowAllBtn();
  drawClubs();
});

document.getElementById("toggle-journey").addEventListener("change", e => {
  showJourney = e.target.checked;
  drawJourney();
});

document.getElementById("toggle-year-labels").addEventListener("change", e => {
  showYearLabels = e.target.checked;
  drawClubs();
});

document.getElementById("toggle-heatmap").addEventListener("change", e => {
  showHeatmap = e.target.checked;
  drawHeatmap();
});

document.getElementById("toggle-map-unvisited-only").addEventListener("change", e => {
  showUnvisitedOnly = e.target.checked;
  drawClubs();
});

document.getElementById("toggle-home-marker").addEventListener("change", e => {
  showHomeMarker = e.target.checked;
  drawHomeMarker();
});

document.getElementById("toggle-radius").addEventListener("change", e => {
  showRadius = e.target.checked;
  drawRadiusCircle();
});

document.getElementById("radius-select").addEventListener("change", () => {
  if (showRadius) drawRadiusCircle();
});

// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener("load", () => {});

function updateShowAllBtn() {
  const all = ["Premier League","Championship","League One","League Two"];
  document.getElementById("map-filter-all").textContent = all.every(d => activeDivs.has(d)) ? "Show All ✓" : "Show All";
}
