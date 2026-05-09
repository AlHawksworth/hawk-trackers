// Tubology - Main App Logic

const STORAGE_KEY = 'tubology_visited';

// State
let visited = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
let currentFilter = 'all';
let currentLineFilter = 'all';
let searchQuery = '';

// Save state
function save() {
  const data = [...visited];
  if (typeof FireSync !== 'undefined') {
    FireSync.save(STORAGE_KEY, data);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  updateHeaderStats();
}

// Toggle visited
function toggleVisited(station) {
  if (visited.has(station)) {
    visited.delete(station);
  } else {
    visited.add(station);
  }
  save();
  renderStationList();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderTubeMap === 'function') renderTubeMap();
}

// Mark all on a line
function markLineVisited(lineId) {
  TUBE_LINES[lineId].stations.forEach(s => visited.add(s));
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
  let stations = ALL_STATIONS;

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

  container.innerHTML = stations.map(station => {
    const info = STATION_INDEX[station];
    const isVisited = visited.has(station);
    const lineChips = info.lines.map(l =>
      `<span class="line-chip" style="background:${TUBE_LINES[l].color}">${TUBE_LINES[l].name}</span>`
    ).join('');

    return `
      <div class="station-item ${isVisited ? 'visited' : ''}" data-station="${station}">
        <button class="station-check" onclick="toggleVisited('${station.replace(/'/g, "\\'")}')">
          ${isVisited ? '✓' : ''}
        </button>
        <div class="station-info">
          <div class="station-name">${station}</div>
          <div class="station-lines">${lineChips}</div>
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
    renderStationList();
  });
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

// Search
function initSearch() {
  const input = document.getElementById('search');
  input.addEventListener('input', () => {
    searchQuery = input.value.trim();
    renderStationList();
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  buildLineFilters();
  initPageNav();
  initFilters();
  initSearch();

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
              // Push local data to cloud
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
  } else {
    updateHeaderStats();
    renderStationList();
  }
});
