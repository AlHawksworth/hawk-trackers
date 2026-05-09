// Tubology - Main App Logic

const STORAGE_KEY = 'tubology_visited';
const DATES_STORAGE_KEY = 'tubology_visit_dates';

// State
let visited = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
let visitDates = JSON.parse(localStorage.getItem(DATES_STORAGE_KEY) || '{}');
let currentFilter = 'all';
let currentLineFilter = 'all';
let currentSort = 'alpha';
let searchQuery = '';
let undoTimeout = null;

// Save state
function save() {
  const data = [...visited];
  if (typeof FireSync !== 'undefined') {
    FireSync.save(STORAGE_KEY, data);
    FireSync.save(DATES_STORAGE_KEY, visitDates);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(DATES_STORAGE_KEY, JSON.stringify(visitDates));
  }
  updateHeaderStats();
}

// Toggle visited with undo toast
function toggleVisited(station) {
  const wasVisited = visited.has(station);

  if (wasVisited) {
    visited.delete(station);
    delete visitDates[station];
  } else {
    visited.add(station);
    visitDates[station] = new Date().toISOString().split('T')[0];
  }
  save();
  renderStationList();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderTubeMap === 'function') renderTubeMap();

  // Show undo toast
  showUndoToast(station, wasVisited);
}

// Undo toast
function showUndoToast(station, wasVisited) {
  clearTimeout(undoTimeout);
  let toast = document.getElementById('undo-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'undo-toast';
    toast.className = 'undo-toast';
    document.body.appendChild(toast);
  }

  const action = wasVisited ? 'unmarked' : 'marked as visited';
  toast.innerHTML = `
    <span class="undo-toast-text">${station} ${action}</span>
    <button class="undo-toast-btn" id="undo-btn">Undo</button>
  `;
  toast.classList.add('visible');

  document.getElementById('undo-btn').onclick = () => {
    // Reverse the action
    if (wasVisited) {
      visited.add(station);
      visitDates[station] = new Date().toISOString().split('T')[0];
    } else {
      visited.delete(station);
      delete visitDates[station];
    }
    save();
    renderStationList();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderTubeMap === 'function') renderTubeMap();
    hideUndoToast();
  };

  undoTimeout = setTimeout(hideUndoToast, 4000);
}

function hideUndoToast() {
  clearTimeout(undoTimeout);
  const toast = document.getElementById('undo-toast');
  if (toast) toast.classList.remove('visible');
}

// Mark all on a line
function markLineVisited(lineId) {
  const line = TUBE_LINES[lineId];
  const today = new Date().toISOString().split('T')[0];
  line.stations.forEach(s => {
    if (!visited.has(s)) {
      visited.add(s);
      visitDates[s] = today;
    }
  });
  save();
  renderStationList();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderTubeMap === 'function') renderTubeMap();
}

// Clear all on a line
function clearLineVisited(lineId) {
  const line = TUBE_LINES[lineId];
  line.stations.forEach(s => {
    visited.delete(s);
    delete visitDates[s];
  });
  save();
  renderStationList();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderTubeMap === 'function') renderTubeMap();
}

// Update header stats
function updateHeaderStats() {
  const v = visited.size;
  const r = TOTAL_STATIONS - v;
  const pct = TOTAL_STATIONS ? Math.round((v / TOTAL_STATIONS) * 100) : 0;
  document.getElementById('stat-visited').textContent = v + ' Visited';
  document.getElementById('stat-remaining').textContent = r + ' Remaining';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-bar').style.width = pct + '%';
}

// Render station list
function renderStationList() {
  const container = document.getElementById('station-list');
  let stations = ALL_STATIONS.slice();

  // Filter by line
  if (currentLineFilter !== 'all') {
    const lineStations = new Set(TUBE_LINES[currentLineFilter].stations);
    stations = stations.filter(s => lineStations.has(s));
  }

  // Filter by visited status
  if (currentFilter === 'visited') {
    stations = stations.filter(s => visited.has(s));
  } else if (currentFilter === 'unvisited') {
    stations = stations.filter(s => !visited.has(s));
  }

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    stations = stations.filter(s => s.toLowerCase().includes(q));
  }

  // Sort
  stations = sortStations(stations);

  container.innerHTML = stations.map(station => {
    const info = STATION_INDEX[station];
    const isVisited = visited.has(station);
    const lineChips = info.lines.map(l =>
      `<span class="line-chip" style="background:${TUBE_LINES[l].color}">${TUBE_LINES[l].name}</span>`
    ).join('');
    const dateStr = visitDates[station] ? `<span class="station-date">${visitDates[station]}</span>` : '';
    const escapedStation = station.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
      <div class="station-item ${isVisited ? 'visited' : ''}" data-station="${station}">
        <button class="station-check" 
          onclick="toggleVisited('${escapedStation}')"
          aria-label="${station} - ${isVisited ? 'visited' : 'not visited'}"
          aria-checked="${isVisited}"
          role="checkbox">
          ${isVisited ? '✓' : ''}
        </button>
        <div class="station-info">
          <div class="station-name">${station}</div>
          <div class="station-lines">${lineChips}${dateStr}</div>
        </div>
      </div>
    `;
  }).join('');

  // Show count
  const countEl = document.querySelector('.station-count');
  if (!countEl) {
    const c = document.createElement('div');
    c.className = 'station-count';
    container.parentNode.insertBefore(c, container);
  }
  const el = document.querySelector('.station-count');
  if (el) el.textContent = `Showing ${stations.length} station${stations.length !== 1 ? 's' : ''}`;
}

// Sort stations
function sortStations(stations) {
  switch (currentSort) {
    case 'alpha':
      return stations.sort();
    case 'line':
      return stations.sort((a, b) => {
        const lineA = STATION_INDEX[a].lines[0];
        const lineB = STATION_INDEX[b].lines[0];
        if (lineA !== lineB) return lineA.localeCompare(lineB);
        return a.localeCompare(b);
      });
    case 'zone':
      return stations.sort((a, b) => {
        const zoneA = getApproxZone(a);
        const zoneB = getApproxZone(b);
        if (zoneA !== zoneB) return zoneA - zoneB;
        return a.localeCompare(b);
      });
    case 'completion':
      return stations.sort((a, b) => {
        const scoreA = getCompletionScore(a);
        const scoreB = getCompletionScore(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.localeCompare(b);
      });
    case 'date':
      return stations.sort((a, b) => {
        const dateA = visitDates[a] || '';
        const dateB = visitDates[b] || '';
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        return a.localeCompare(b);
      });
    default:
      return stations;
  }
}

// Approximate zone for sorting
function getApproxZone(station) {
  const zone1 = [
    "Paddington", "Edgware Road", "Baker Street", "Great Portland Street",
    "Euston Square", "King's Cross St. Pancras", "Farringdon", "Barbican",
    "Moorgate", "Liverpool Street", "Aldgate", "Tower Hill", "Monument",
    "Cannon Street", "Mansion House", "Blackfriars", "Temple", "Embankment",
    "Westminster", "St. James's Park", "Victoria", "Sloane Square",
    "South Kensington", "Gloucester Road", "High Street Kensington",
    "Notting Hill Gate", "Bayswater", "Marble Arch", "Bond Street",
    "Oxford Circus", "Regent's Park", "Warren Street", "Goodge Street",
    "Tottenham Court Road", "Holborn", "Chancery Lane", "St. Paul's",
    "Bank", "Leicester Square", "Piccadilly Circus", "Charing Cross",
    "Covent Garden", "Green Park", "Hyde Park Corner", "Knightsbridge",
    "Lancaster Gate", "Queensway", "Pimlico", "Vauxhall", "Lambeth North",
    "Waterloo", "Southwark", "London Bridge", "Borough", "Elephant & Castle",
    "Kennington", "Oval", "Aldgate East", "Angel", "Old Street",
    "Russell Square", "Mornington Crescent", "Euston", "Marylebone",
    "Warwick Avenue", "Maida Vale"
  ];
  if (zone1.includes(station)) return 1;
  // Rough heuristic: interchange stations tend to be more central
  const lines = STATION_INDEX[station].lines.length;
  if (lines >= 3) return 1;
  if (lines >= 2) return 2;
  return 3;
}

// How close is this station to completing a line?
function getCompletionScore(station) {
  const lines = STATION_INDEX[station].lines;
  let bestScore = 0;
  lines.forEach(lineId => {
    const lineStations = [...new Set(TUBE_LINES[lineId].stations)];
    const visitedOnLine = lineStations.filter(s => visited.has(s)).length;
    const pct = visitedOnLine / lineStations.length;
    if (pct > bestScore) bestScore = pct;
  });
  return bestScore;
}

// Build line filter buttons
function buildLineFilters() {
  const container = document.getElementById('line-filter-group');
  container.innerHTML = '<button class="filter-btn active" data-line="all">All Lines</button>';
  Object.entries(TUBE_LINES).forEach(([id, line]) => {
    container.innerHTML += `<button class="filter-btn line-filter-btn" data-line="${id}" style="--line-color:${line.color}">${line.name}</button>`;
  });

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-line]');
    if (!btn) return;
    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLineFilter = btn.dataset.line;
    updateBulkActions();
    renderStationList();
  });
}

// Bulk actions UI
function updateBulkActions() {
  let bulkContainer = document.getElementById('bulk-actions');
  if (currentLineFilter === 'all') {
    if (bulkContainer) bulkContainer.classList.add('hidden');
    return;
  }
  if (!bulkContainer) {
    bulkContainer = document.createElement('div');
    bulkContainer.id = 'bulk-actions';
    bulkContainer.className = 'bulk-actions';
    const toolbar = document.querySelector('#page-tracker .toolbar');
    toolbar.appendChild(bulkContainer);
  }
  bulkContainer.classList.remove('hidden');
  const lineName = TUBE_LINES[currentLineFilter].name;
  bulkContainer.innerHTML = `
    <button class="bulk-btn bulk-mark" onclick="markLineVisited('${currentLineFilter}')">✓ Mark all ${lineName} visited</button>
    <button class="bulk-btn bulk-clear" onclick="clearLineVisited('${currentLineFilter}')">✗ Clear ${lineName}</button>
  `;
}

// Page navigation
function initPageNav() {
  const tabs = document.querySelectorAll('.page-tab');
  const pages = document.querySelectorAll('.page');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const pageId = 'page-' + tab.dataset.page;
      document.getElementById(pageId).classList.add('active');

      // Trigger renders
      if (tab.dataset.page === 'live' && typeof initLivePage === 'function') initLivePage();
      if (tab.dataset.page === 'map' && typeof renderTubeMap === 'function') renderTubeMap();
      if (tab.dataset.page === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
      // Clean up live timers when leaving
      if (tab.dataset.page !== 'live' && typeof cleanupLive === 'function') cleanupLive();
    });
  });
}

// Filter buttons
function initFilters() {
  const filterBtns = document.querySelectorAll('#page-tracker > .toolbar > .filter-group:first-of-type .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderStationList();
    });
  });
}

// Sort controls
function initSort() {
  const sortGroup = document.getElementById('sort-group');
  if (!sortGroup) return;
  sortGroup.addEventListener('click', e => {
    const btn = e.target.closest('[data-sort]');
    if (!btn) return;
    sortGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.dataset.sort;
    renderStationList();
  });
}

// Search
function initSearch() {
  const input = document.getElementById('search');
  input.addEventListener('input', () => {
    searchQuery = input.value.trim();
    renderStationList();
  });
}

// Offline indicator
function initOfflineIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.className = 'offline-indicator';
  indicator.innerHTML = '📡 You are offline';
  document.body.appendChild(indicator);

  function updateOnlineStatus() {
    if (!navigator.onLine) {
      indicator.classList.add('visible');
    } else {
      indicator.classList.remove('visible');
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  buildLineFilters();
  initPageNav();
  initFilters();
  initSearch();
  initSort();
  initOfflineIndicator();

  // Load from cloud if available, then render
  if (typeof FireSync !== 'undefined') {
    FireSync.load(STORAGE_KEY, (cloudData) => {
      if (cloudData && Array.isArray(cloudData)) {
        visited = new Set(cloudData);
      } else {
        // No cloud data — if we have local data, push it up
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          try {
            const localArr = JSON.parse(local);
            if (Array.isArray(localArr) && localArr.length > 0) {
              visited = new Set(localArr);
              FireSync.save(STORAGE_KEY, localArr);
            }
          } catch(e) {}
        }
      }
      updateHeaderStats();
      renderStationList();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderTubeMap === 'function') renderTubeMap();
    });

    // Load visit dates
    FireSync.load(DATES_STORAGE_KEY, (cloudDates) => {
      if (cloudDates && typeof cloudDates === 'object') {
        visitDates = cloudDates;
      } else {
        const localDates = localStorage.getItem(DATES_STORAGE_KEY);
        if (localDates) {
          try {
            visitDates = JSON.parse(localDates);
            FireSync.save(DATES_STORAGE_KEY, visitDates);
          } catch(e) {}
        }
      }
    });

    // Listen for real-time changes from other devices
    FireSync.listen(STORAGE_KEY, (cloudData) => {
      if (cloudData && Array.isArray(cloudData)) {
        visited = new Set(cloudData);
        updateHeaderStats();
        renderStationList();
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTubeMap === 'function') renderTubeMap();
      }
    });

    FireSync.listen(DATES_STORAGE_KEY, (cloudDates) => {
      if (cloudDates && typeof cloudDates === 'object') {
        visitDates = cloudDates;
        renderStationList();
      }
    });
  } else {
    updateHeaderStats();
    renderStationList();
  }
});
