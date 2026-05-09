// Tubology - Live Tube Data (TfL API)

const TFL_BASE = 'https://api.tfl.gov.uk';
let liveRefreshTimer = null;
let liveStatusRefreshTimer = null;
let currentLiveView = 'status'; // 'status' or 'departures'
let selectedStation = null;

// ── Initialise Live Page ──
function initLivePage() {
  console.log('[Tubology Live] Initialising live page');
  renderLiveToolbar();
  renderLineStatus();
}

// ── Toolbar ──
function renderLiveToolbar() {
  const page = document.getElementById('page-live');
  page.innerHTML = `
    <div class="live-toolbar">
      <div class="live-view-toggle">
        <button class="live-toggle-btn active" data-view="status">Line Status</button>
        <button class="live-toggle-btn" data-view="departures">Departures</button>
      </div>
      <div class="live-refresh-info">
        <span id="live-last-updated"></span>
        <button class="live-refresh-btn" id="live-refresh-btn" title="Refresh">⟳</button>
      </div>
    </div>
    <div id="live-content"></div>
  `;

  // Toggle buttons
  page.querySelectorAll('.live-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page.querySelectorAll('.live-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLiveView = btn.dataset.view;
      if (currentLiveView === 'status') renderLineStatus();
      else renderDepartureBoard();
    });
  });

  // Refresh button
  document.getElementById('live-refresh-btn').addEventListener('click', () => {
    if (currentLiveView === 'status') renderLineStatus();
    else if (selectedStation) fetchArrivals(selectedStation);
  });
}

// ── Line Status ──
async function renderLineStatus() {
  const container = document.getElementById('live-content');
  if (!container) {
    console.error('[Tubology Live] live-content container not found');
    return;
  }
  container.innerHTML = `<div class="live-loading"><div class="dot-matrix-loader">LOADING...</div></div>`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${TFL_BASE}/Line/Mode/tube,elizabeth-line/Status`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('API error');
    const lines = await res.json();

    let html = '<div class="live-status-grid">';
    lines.forEach(line => {
      const status = line.lineStatuses[0];
      const severity = status.statusSeverity;
      const statusText = status.statusSeverityDescription;
      const reason = status.reason || '';
      const lineColor = getLineColor(line.id);
      const statusClass = getStatusClass(severity);

      html += `
        <div class="live-status-card ${statusClass}">
          <div class="live-status-line">
            <div class="live-status-color" style="background:${lineColor}"></div>
            <span class="live-status-name">${line.name}</span>
          </div>
          <div class="live-status-badge ${statusClass}">${statusText}</div>
          ${reason ? `<div class="live-status-reason">${reason}</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
    html += `<div class="live-auto-refresh">Auto-refreshes every 60s</div>`;
    container.innerHTML = html;
    updateTimestamp();

    // Auto-refresh line status every 60s
    clearInterval(liveStatusRefreshTimer);
    liveStatusRefreshTimer = setInterval(() => {
      if (currentLiveView === 'status') {
        renderLineStatus();
      }
    }, 60000);
  } catch (e) {
    const isTimeout = e.name === 'AbortError';
    container.innerHTML = `
      <div class="live-error">
        <div class="dot-matrix-board">
          <div class="dot-matrix-row error">${isTimeout ? 'REQUEST TIMED OUT' : 'CONNECTION ERROR'}</div>
          <div class="dot-matrix-row dim">${isTimeout ? 'The TfL API is taking too long to respond' : 'Check your internet connection'}</div>
          <div class="dot-matrix-row dim">Tap refresh to try again</div>
        </div>
      </div>
    `;
  }
}

// ── Departure Board ──
function renderDepartureBoard() {
  const container = document.getElementById('live-content');

  let stationOptions = ALL_STATIONS.map(s => `<option value="${s}">${s}</option>`).join('');

  container.innerHTML = `
    <div class="departure-search">
      <input type="text" id="live-station-search" class="live-station-input" placeholder="Search for a station..." autocomplete="off" list="live-station-list" />
      <datalist id="live-station-list">${stationOptions}</datalist>
    </div>
    <div id="departure-display">
      <div class="dot-matrix-board">
        <div class="dot-matrix-row dim">Select a station to view</div>
        <div class="dot-matrix-row dim">live departure information</div>
      </div>
    </div>
  `;

  const input = document.getElementById('live-station-search');
  input.addEventListener('change', () => {
    const val = input.value.trim();
    if (val && ALL_STATIONS.includes(val)) {
      selectedStation = val;
      fetchArrivals(val);
    }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      // Fuzzy match
      const match = ALL_STATIONS.find(s => s.toLowerCase() === val.toLowerCase());
      if (match) {
        selectedStation = match;
        input.value = match;
        fetchArrivals(match);
      }
    }
  });

  // Clear status refresh when switching to departures
  clearInterval(liveStatusRefreshTimer);
}

async function fetchArrivals(stationName) {
  const display = document.getElementById('departure-display');
  display.innerHTML = `
    <div class="dot-matrix-board">
      <div class="dot-matrix-row blink">LOADING...</div>
    </div>
  `;

  try {
    // First get the station's naptan ID via search
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const searchRes = await fetch(`${TFL_BASE}/StopPoint/Search/${encodeURIComponent(stationName)}?modes=tube,elizabeth-line&maxResults=5`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!searchRes.ok) throw new Error('Search failed');
    const searchData = await searchRes.json();

    if (!searchData.matches || searchData.matches.length === 0) {
      display.innerHTML = `
        <div class="dot-matrix-board">
          <div class="dot-matrix-row error">STATION NOT FOUND</div>
        </div>
      `;
      return;
    }

    const naptanId = searchData.matches[0].id;

    // Fetch arrivals
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 10000);
    const arrRes = await fetch(`${TFL_BASE}/StopPoint/${naptanId}/Arrivals?mode=tube,elizabeth-line`, { signal: controller2.signal });
    clearTimeout(timeout2);
    if (!arrRes.ok) throw new Error('Arrivals failed');
    const arrivals = await arrRes.json();

    renderArrivalBoard(stationName, arrivals);
    updateTimestamp();
  } catch (e) {
    const isTimeout = e.name === 'AbortError';
    display.innerHTML = `
      <div class="dot-matrix-board">
        <div class="dot-matrix-row error">${isTimeout ? 'REQUEST TIMED OUT' : 'SERVICE UNAVAILABLE'}</div>
        <div class="dot-matrix-row dim">${isTimeout ? 'TfL API is slow — try again' : 'Please try again'}</div>
      </div>
    `;
  }
}

function renderArrivalBoard(stationName, arrivals) {
  const display = document.getElementById('departure-display');

  // Sort by time to station
  arrivals.sort((a, b) => a.timeToStation - b.timeToStation);

  // Group by platform/line
  const grouped = {};
  arrivals.forEach(arr => {
    const key = arr.lineName || 'Unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(arr);
  });

  if (arrivals.length === 0) {
    display.innerHTML = `
      <div class="dot-matrix-board">
        <div class="dot-matrix-header">${stationName.toUpperCase()}</div>
        <div class="dot-matrix-row dim">No trains currently scheduled</div>
      </div>
    `;
    return;
  }

  let html = `<div class="dot-matrix-board">
    <div class="dot-matrix-header">${stationName.toUpperCase()}</div>
    <div class="dot-matrix-subheader">LIVE DEPARTURES</div>
    <div class="dot-matrix-separator"></div>
  `;

  // Show next arrivals grouped by line
  Object.entries(grouped).forEach(([lineName, lineArrivals]) => {
    const lineColor = getLineColorByName(lineName);
    html += `<div class="dot-matrix-line-header" style="--dm-line-color:${lineColor}">${lineName}</div>`;

    // Show up to 4 per line
    lineArrivals.slice(0, 4).forEach(arr => {
      const mins = Math.floor(arr.timeToStation / 60);
      const timeStr = mins <= 0 ? 'DUE' : mins === 1 ? '1 min' : `${mins} mins`;
      const dest = arr.destinationName ? arr.destinationName.replace(' Underground Station', '') : 'Unknown';
      const platform = arr.platformName || '';

      html += `
        <div class="dot-matrix-row">
          <span class="dm-destination">${dest}</span>
          <span class="dm-platform">${platform}</span>
          <span class="dm-time ${mins <= 0 ? 'due' : ''}">${timeStr}</span>
        </div>
      `;
    });

    html += `<div class="dot-matrix-separator"></div>`;
  });

  html += '</div>';

  // Auto-refresh countdown
  html += `<div class="live-auto-refresh">Auto-refreshes every 30s</div>`;

  display.innerHTML = html;

  // Set up auto-refresh
  clearInterval(liveRefreshTimer);
  liveRefreshTimer = setInterval(() => {
    if (currentLiveView === 'departures' && selectedStation) {
      fetchArrivals(selectedStation);
    }
  }, 30000);
}

// ── Helpers ──
function getLineColor(lineId) {
  const colors = {
    bakerloo: '#B36305',
    central: '#E32017',
    circle: '#FFD300',
    district: '#00782A',
    'hammersmith-city': '#F3A9BB',
    jubilee: '#A0A5A9',
    metropolitan: '#9B0056',
    northern: '#000000',
    piccadilly: '#003688',
    victoria: '#0098D4',
    'waterloo-city': '#95CDBA',
    elizabeth: '#6950A1',
    'elizabeth-line': '#6950A1'
  };
  return colors[lineId] || '#666';
}

function getLineColorByName(name) {
  const colors = {
    'Bakerloo': '#B36305',
    'Central': '#E32017',
    'Circle': '#FFD300',
    'District': '#00782A',
    'Hammersmith & City': '#F3A9BB',
    'Jubilee': '#A0A5A9',
    'Metropolitan': '#9B0056',
    'Northern': '#000000',
    'Piccadilly': '#003688',
    'Victoria': '#0098D4',
    'Waterloo & City': '#95CDBA',
    'Elizabeth': '#6950A1',
    'Elizabeth line': '#6950A1'
  };
  return colors[name] || '#666';
}

function getStatusClass(severity) {
  // TfL severity: 10 = Good Service, 5 = Part Closure, etc.
  if (severity === 10) return 'status-good';
  if (severity >= 7) return 'status-minor';
  if (severity >= 5) return 'status-reduced';
  return 'status-severe';
}

function updateTimestamp() {
  const el = document.getElementById('live-last-updated');
  if (el) {
    const now = new Date();
    el.textContent = `Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

// Clean up timers when leaving page
function cleanupLive() {
  if (liveRefreshTimer) {
    clearInterval(liveRefreshTimer);
    liveRefreshTimer = null;
  }
  if (liveStatusRefreshTimer) {
    clearInterval(liveStatusRefreshTimer);
    liveStatusRefreshTimer = null;
  }
}
