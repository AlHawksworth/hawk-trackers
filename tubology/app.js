// Tubology - Main App Logic (Performance & Visual Overhaul)

const STORAGE_KEY = 'tubology_visited';
const DATES_STORAGE_KEY = 'tubology_visit_dates';

// State
let visited = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
let visitDates = JSON.parse(localStorage.getItem(DATES_STORAGE_KEY) || '{}');
let currentFilter = 'all';
let currentLineFilter = 'all';
let currentZoneFilter = 'all';
let currentSort = 'alpha';
let searchQuery = '';
let undoTimeout = null;
let filteredStations = []; // cached filtered/sorted list
let searchDebounceTimer = null;

// Theme
let currentTheme = localStorage.getItem('tubology_theme') || 'dark';

// ── Virtual Scroll State ──
const ITEM_HEIGHT = 64; // px per station row
const BUFFER_ITEMS = 8; // extra items above/below viewport
let scrollContainer = null;
let virtualListInner = null;
let lastRenderRange = { start: -1, end: -1 };

// ── Save state ──
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

// ── Toggle visited with undo toast ──
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
  updateFilteredStations();
  renderVirtualList();
  updateOgFilteredStations();
  renderOgVirtualList();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderTubeMap === 'function') renderTubeMap();

  // Animate the item
  const item = document.querySelector(`.station-item[data-station="${CSS.escape(station)}"]`);
  if (item) {
    item.classList.add('station-pulse');
    setTimeout(() => item.classList.remove('station-pulse'), 400);
  }

  showUndoToast(station, wasVisited);

  // Line completion celebration
  if (!wasVisited) checkLineCompletion(station);

  // Check achievements
  if (typeof checkAchievements === 'function') checkAchievements();
}

// ── Check if completing a station finishes a line ──
function checkLineCompletion(station) {
  const lines = STATION_INDEX[station].lines;
  lines.forEach(lineId => {
    const line = TUBE_LINES[lineId];
    const allVisited = line.uniqueStations.every(s => visited.has(s));
    if (allVisited) {
      showCelebration(line.name);
    }
  });
}

// ── Celebration animation ──
function showCelebration(lineName) {
  let overlay = document.getElementById('celebration-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'celebration-overlay';
    overlay.className = 'celebration-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="celebration-content">
      <div class="celebration-emoji">🎉</div>
      <div class="celebration-text">${lineName} Complete!</div>
      <div class="confetti-container">${generateConfetti()}</div>
    </div>
  `;
  overlay.classList.add('visible');
  setTimeout(() => overlay.classList.remove('visible'), 3000);
}

function generateConfetti() {
  let html = '';
  const colors = ['#E32017', '#FFD300', '#003688', '#0098D4', '#00782A', '#F6A600', '#B43D93'];
  for (let i = 0; i < 30; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const size = 6 + Math.random() * 8;
    html += `<div class="confetti-piece" style="left:${left}%;animation-delay:${delay}s;background:${color};width:${size}px;height:${size}px"></div>`;
  }
  return html;
}

// ── Undo toast ──
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
    if (wasVisited) {
      visited.add(station);
      visitDates[station] = new Date().toISOString().split('T')[0];
    } else {
      visited.delete(station);
      delete visitDates[station];
    }
    save();
    updateFilteredStations();
    renderVirtualList();
    updateOgFilteredStations();
    renderOgVirtualList();
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

// ── Mark/Clear all on a line ──
function markLineVisited(lineId) {
  const line = TUBE_LINES[lineId];
  const today = new Date().toISOString().split('T')[0];
  line.uniqueStations.forEach(s => {
    if (!visited.has(s)) {
      visited.add(s);
      visitDates[s] = today;
    }
  });
  save();
  updateFilteredStations();
  renderVirtualList();
  updateOgFilteredStations();
  renderOgVirtualList();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderTubeMap === 'function') renderTubeMap();
}

function clearLineVisited(lineId) {
  const line = TUBE_LINES[lineId];
  line.uniqueStations.forEach(s => {
    visited.delete(s);
    delete visitDates[s];
  });
  save();
  updateFilteredStations();
  renderVirtualList();
  updateOgFilteredStations();
  renderOgVirtualList();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderTubeMap === 'function') renderTubeMap();
}

// ── Update header stats with counter animation ──
function updateHeaderStats() {
  // Main header shows tube-only stats
  const tubeVisited = TUBE_ONLY_STATIONS.filter(s => visited.has(s)).length;
  const tubeRemaining = TOTAL_TUBE_STATIONS - tubeVisited;
  const tubePct = TOTAL_TUBE_STATIONS ? Math.round((tubeVisited / TOTAL_TUBE_STATIONS) * 100) : 0;

  animateCounter('stat-visited', tubeVisited, ' Visited');
  animateCounter('stat-remaining', tubeRemaining, ' Remaining');
  document.getElementById('progress-pct').textContent = tubePct + '%';
  document.getElementById('progress-bar').style.width = tubePct + '%';

  // Overground stats
  updateOvergroundStats();
}

function animateCounter(elementId, target, suffix) {
  const el = document.getElementById(elementId);
  const current = parseInt(el.textContent) || 0;
  if (current === target) { el.textContent = target + suffix; return; }

  const diff = target - current;
  const steps = Math.min(Math.abs(diff), 15);
  const stepSize = diff / steps;
  let step = 0;

  function tick() {
    step++;
    if (step >= steps) {
      el.textContent = target + suffix;
    } else {
      el.textContent = Math.round(current + stepSize * step) + suffix;
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

// ── Filtering & Sorting (cached) ──
function updateFilteredStations() {
  // Main tracker only shows tube stations (non-overground)
  let stations = TUBE_ONLY_STATIONS.slice();

  // Filter by line (only tube lines)
  if (currentLineFilter !== 'all') {
    const lineStations = new Set(TUBE_LINES[currentLineFilter].uniqueStations);
    stations = stations.filter(s => lineStations.has(s));
  }

  // Filter by zone
  if (currentZoneFilter !== 'all') {
    const zone = parseInt(currentZoneFilter);
    stations = stations.filter(s => STATION_ZONES[s] === zone);
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
    stations = stations.filter(s => {
      if (s.toLowerCase().includes(q)) return true;
      // Also search line names (tube lines only)
      return STATION_INDEX[s].lines
        .filter(l => !TUBE_LINES[l].isOverground)
        .some(l => TUBE_LINES[l].name.toLowerCase().includes(q));
    });
  }

  // Sort
  stations = sortStations(stations);
  filteredStations = stations;

  // Update count
  const el = document.querySelector('#page-tracker .station-count');
  if (el) el.textContent = `Showing ${stations.length} station${stations.length !== 1 ? 's' : ''}`;
}

// ── Virtual Scroll Rendering ──
function initVirtualScroll() {
  scrollContainer = document.getElementById('station-list');
  scrollContainer.style.overflow = 'auto';
  scrollContainer.style.maxHeight = 'calc(100vh - 280px)';
  scrollContainer.style.position = 'relative';

  virtualListInner = document.createElement('div');
  virtualListInner.className = 'virtual-list-inner';
  scrollContainer.appendChild(virtualListInner);

  scrollContainer.addEventListener('scroll', onVirtualScroll, { passive: true });
  window.addEventListener('resize', () => renderVirtualList());
}

function onVirtualScroll() {
  requestAnimationFrame(renderVirtualList);
}

function renderVirtualList() {
  if (!scrollContainer || !virtualListInner) return;

  // Empty state
  if (filteredStations.length === 0) {
    virtualListInner.style.height = '0px';
    virtualListInner.innerHTML = '';
    let emptyEl = scrollContainer.querySelector('.empty-state');
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.className = 'empty-state';
      scrollContainer.appendChild(emptyEl);
    }
    if (searchQuery) {
      emptyEl.innerHTML = `
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No stations found</div>
        <div class="empty-state-desc">Try a different search term or adjust your filters</div>
      `;
    } else if (currentFilter === 'visited') {
      emptyEl.innerHTML = `
        <div class="empty-state-icon">🚇</div>
        <div class="empty-state-title">No stations visited yet</div>
        <div class="empty-state-desc">Tap the circle next to a station to mark it as visited</div>
      `;
    } else if (currentFilter === 'unvisited') {
      emptyEl.innerHTML = `
        <div class="empty-state-icon">🎉</div>
        <div class="empty-state-title">All done!</div>
        <div class="empty-state-desc">You've visited every station in this selection</div>
      `;
    } else {
      emptyEl.innerHTML = `
        <div class="empty-state-icon">🗺️</div>
        <div class="empty-state-title">No stations match</div>
        <div class="empty-state-desc">Try adjusting your line or zone filters</div>
      `;
    }
    emptyEl.style.display = 'flex';
    return;
  }

  // Hide empty state if visible
  const emptyEl = scrollContainer.querySelector('.empty-state');
  if (emptyEl) emptyEl.style.display = 'none';

  const totalHeight = filteredStations.length * ITEM_HEIGHT;
  virtualListInner.style.height = totalHeight + 'px';

  const scrollTop = scrollContainer.scrollTop;
  const viewportHeight = scrollContainer.clientHeight;

  let startIdx = Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_ITEMS;
  let endIdx = Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + BUFFER_ITEMS;
  startIdx = Math.max(0, startIdx);
  endIdx = Math.min(filteredStations.length, endIdx);

  // Skip re-render if range hasn't changed
  if (startIdx === lastRenderRange.start && endIdx === lastRenderRange.end) return;
  lastRenderRange = { start: startIdx, end: endIdx };

  // Build visible items
  const fragment = document.createDocumentFragment();
  for (let i = startIdx; i < endIdx; i++) {
    const station = filteredStations[i];
    const info = STATION_INDEX[station];
    const isVisited = visited.has(station);

    const row = document.createElement('div');
    row.className = 'station-item' + (isVisited ? ' visited' : '');
    row.dataset.station = station;
    row.style.position = 'absolute';
    row.style.top = (i * ITEM_HEIGHT) + 'px';
    row.style.left = '0';
    row.style.right = '0';
    row.style.height = ITEM_HEIGHT + 'px';

    const lineChips = info.lines.map(l => {
      const line = TUBE_LINES[l];
      if (line.isOverground) return ''; // Don't show overground chips in tube tracker
      return `<span class="line-chip" style="background:${line.color}">${line.name}</span>`;
    }).join('');
    const dateStr = visitDates[station] ? `<span class="station-date">${visitDates[station]}</span>` : '';

    row.innerHTML = `
      <button class="station-check"
        aria-label="${station} - ${isVisited ? 'visited' : 'not visited'}"
        aria-checked="${isVisited}"
        role="checkbox">
        ${isVisited ? '✓' : ''}
      </button>
      <div class="station-info">
        <div class="station-name">${station}</div>
        <div class="station-lines">${lineChips}${dateStr}</div>
      </div>
    `;

    // Click handler on the check button
    row.querySelector('.station-check').addEventListener('click', () => toggleVisited(station));

    fragment.appendChild(row);
  }

  // Clear and append
  virtualListInner.innerHTML = '';
  virtualListInner.appendChild(fragment);
}

// ── Sort stations ──
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

function getApproxZone(station) {
  // Use real zone data
  if (typeof STATION_ZONES !== 'undefined' && STATION_ZONES[station]) {
    return STATION_ZONES[station];
  }
  // Fallback: guess based on connectivity
  const lines = STATION_INDEX[station].lines.length;
  if (lines >= 3) return 1;
  if (lines >= 2) return 2;
  return 3;
}

function getCompletionScore(station) {
  const lines = STATION_INDEX[station].lines;
  let bestScore = 0;
  lines.forEach(lineId => {
    const lineStations = TUBE_LINES[lineId].uniqueStations;
    const visitedOnLine = lineStations.filter(s => visited.has(s)).length;
    const pct = visitedOnLine / lineStations.length;
    if (pct > bestScore) bestScore = pct;
  });
  return bestScore;
}

// ── Build line filter buttons (tube lines only for main tracker) ──
function buildLineFilters() {
  const container = document.getElementById('line-filter-group');

  const tubeLines = Object.entries(TUBE_LINES).filter(([_, l]) => !l.isOverground);

  let html = '<button class="filter-btn active" data-line="all">All Lines</button>';
  tubeLines.forEach(([id, line]) => {
    html += `<button class="filter-btn line-filter-btn" data-line="${id}" style="--line-color:${line.color}">${line.name}</button>`;
  });

  container.innerHTML = html;

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-line]');
    if (!btn) return;
    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLineFilter = btn.dataset.line;
    updateBulkActions();
    updateFilteredStations();
    lastRenderRange = { start: -1, end: -1 };
    renderVirtualList();
  });
}

// ── Build zone filter buttons ──
function buildZoneFilters() {
  const container = document.getElementById('zone-filter-group');
  if (!container) return;

  // Find all zones that tube-only stations belong to
  const zones = new Set();
  TUBE_ONLY_STATIONS.forEach(s => {
    const z = STATION_ZONES[s];
    if (z) zones.add(z);
  });
  const sortedZones = [...zones].sort((a, b) => a - b);

  let html = '<button class="filter-btn active" data-zone="all">All Zones</button>';
  sortedZones.forEach(z => {
    html += `<button class="filter-btn zone-filter-btn" data-zone="${z}">Zone ${z}</button>`;
  });
  container.innerHTML = html;

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-zone]');
    if (!btn) return;
    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentZoneFilter = btn.dataset.zone;
    updateFilteredStations();
    lastRenderRange = { start: -1, end: -1 };
    renderVirtualList();
  });
}

// ── Bulk actions UI ──
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

// ── Page navigation ──
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

      // Lazy-trigger renders only when needed
      if (tab.dataset.page === 'overground') {
        updateOgFilteredStations();
        ogLastRenderRange = { start: -1, end: -1 };
        renderOgVirtualList();
      }
      if (tab.dataset.page === 'live' && typeof initLivePage === 'function') initLivePage();
      if (tab.dataset.page === 'map' && typeof renderTubeMap === 'function') renderTubeMap();
      if (tab.dataset.page === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
      if (tab.dataset.page === 'achievements' && typeof renderAchievements === 'function') {
        const container = document.getElementById('achievements-container');
        if (container) container.innerHTML = renderAchievements();
      }
      if (tab.dataset.page !== 'live' && typeof cleanupLive === 'function') cleanupLive();
    });
  });
}

// ── Filter buttons ──
function initFilters() {
  const filterGroup = document.getElementById('status-filter-group');
  filterGroup.addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    updateFilteredStations();
    lastRenderRange = { start: -1, end: -1 };
    renderVirtualList();
  });
}

// ── Sort controls ──
function initSort() {
  const sortGroup = document.getElementById('sort-group');
  if (!sortGroup) return;
  sortGroup.addEventListener('click', e => {
    const btn = e.target.closest('[data-sort]');
    if (!btn) return;
    sortGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.dataset.sort;
    updateFilteredStations();
    lastRenderRange = { start: -1, end: -1 };
    renderVirtualList();
  });
}

// ── Search with debounce ──
function initSearch() {
  const input = document.getElementById('search');
  input.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      searchQuery = input.value.trim();
      updateFilteredStations();
      lastRenderRange = { start: -1, end: -1 }; // force re-render
      scrollContainer.scrollTop = 0;
      renderVirtualList();
    }, 150);
  });
}

// ── Theme toggle ──
function initTheme() {
  applyTheme(currentTheme);

  let themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) {
    themeBtn = document.createElement('button');
    themeBtn.id = 'theme-toggle';
    themeBtn.className = 'theme-toggle-btn';
    themeBtn.title = 'Toggle light/dark mode';
    document.querySelector('.header-inner').appendChild(themeBtn);
  }
  updateThemeButton();

  themeBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tubology_theme', currentTheme);
    applyTheme(currentTheme);
    updateThemeButton();
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function updateThemeButton() {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

// ── Offline indicator ──
function initOfflineIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.className = 'offline-indicator';
  indicator.innerHTML = '📡 You are offline';
  document.body.appendChild(indicator);

  function updateOnlineStatus() {
    indicator.classList.toggle('visible', !navigator.onLine);
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

// ══════════════════════════════════════════════════
// ── OVERGROUND TAB LOGIC ──
// ══════════════════════════════════════════════════

let ogFilter = 'all';
let ogLineFilter = 'all';
let ogSearchQuery = '';
let ogFilteredStations = [];
let ogScrollContainer = null;
let ogVirtualListInner = null;
let ogLastRenderRange = { start: -1, end: -1 };
let ogSearchDebounceTimer = null;

function updateOvergroundStats() {
  const ogVisited = OVERGROUND_STATIONS.filter(s => visited.has(s)).length;
  const ogRemaining = TOTAL_OVERGROUND_STATIONS - ogVisited;
  const ogPct = TOTAL_OVERGROUND_STATIONS ? Math.round((ogVisited / TOTAL_OVERGROUND_STATIONS) * 100) : 0;

  const visitedEl = document.getElementById('og-stat-visited');
  const remainingEl = document.getElementById('og-stat-remaining');
  const pctEl = document.getElementById('og-progress-pct');
  const barEl = document.getElementById('og-progress-bar');

  if (visitedEl) visitedEl.textContent = ogVisited + ' Visited';
  if (remainingEl) remainingEl.textContent = ogRemaining + ' Remaining';
  if (pctEl) pctEl.textContent = ogPct + '%';
  if (barEl) barEl.style.width = ogPct + '%';
}

function updateOgFilteredStations() {
  let stations = OVERGROUND_STATIONS.slice();

  if (ogLineFilter !== 'all') {
    const lineStations = new Set(TUBE_LINES[ogLineFilter].uniqueStations);
    stations = stations.filter(s => lineStations.has(s));
  }

  if (ogFilter === 'visited') {
    stations = stations.filter(s => visited.has(s));
  } else if (ogFilter === 'unvisited') {
    stations = stations.filter(s => !visited.has(s));
  }

  if (ogSearchQuery) {
    const q = ogSearchQuery.toLowerCase();
    stations = stations.filter(s => {
      if (s.toLowerCase().includes(q)) return true;
      return STATION_INDEX[s].lines
        .filter(l => TUBE_LINES[l].isOverground)
        .some(l => TUBE_LINES[l].name.toLowerCase().includes(q));
    });
  }

  stations.sort();
  ogFilteredStations = stations;

  const countEl = document.getElementById('og-station-count');
  if (countEl) countEl.textContent = `Showing ${stations.length} station${stations.length !== 1 ? 's' : ''}`;
}

function initOvergroundTab() {
  // Build line filter buttons
  const container = document.getElementById('og-line-filter-group');
  if (!container) return;

  const overgroundLines = Object.entries(TUBE_LINES).filter(([_, l]) => l.isOverground);
  let html = '<button class="filter-btn active" data-og-line="all">All Lines</button>';
  overgroundLines.forEach(([id, line]) => {
    html += `<button class="filter-btn line-filter-btn" data-og-line="${id}" style="--line-color:${line.color}">${line.name}</button>`;
  });
  container.innerHTML = html;

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-og-line]');
    if (!btn) return;
    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ogLineFilter = btn.dataset.ogLine;
    updateOgFilteredStations();
    renderOgVirtualList();
  });

  // Filter buttons
  const filterBtns = document.querySelectorAll('[data-og-filter]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ogFilter = btn.dataset.ogFilter;
      updateOgFilteredStations();
      renderOgVirtualList();
    });
  });

  // Search
  const searchInput = document.getElementById('og-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(ogSearchDebounceTimer);
      ogSearchDebounceTimer = setTimeout(() => {
        ogSearchQuery = searchInput.value.trim();
        updateOgFilteredStations();
        ogLastRenderRange = { start: -1, end: -1 };
        if (ogScrollContainer) ogScrollContainer.scrollTop = 0;
        renderOgVirtualList();
      }, 150);
    });
  }

  // Virtual scroll
  ogScrollContainer = document.getElementById('og-station-list');
  if (ogScrollContainer) {
    ogScrollContainer.style.overflow = 'auto';
    ogScrollContainer.style.maxHeight = 'calc(100vh - 320px)';
    ogScrollContainer.style.position = 'relative';

    ogVirtualListInner = document.createElement('div');
    ogVirtualListInner.className = 'virtual-list-inner';
    ogScrollContainer.appendChild(ogVirtualListInner);

    ogScrollContainer.addEventListener('scroll', () => {
      requestAnimationFrame(renderOgVirtualList);
    }, { passive: true });
  }

  updateOgFilteredStations();
  renderOgVirtualList();
}

function renderOgVirtualList() {
  if (!ogScrollContainer || !ogVirtualListInner) return;

  // Empty state
  if (ogFilteredStations.length === 0) {
    ogVirtualListInner.style.height = '0px';
    ogVirtualListInner.innerHTML = '';
    let emptyEl = ogScrollContainer.querySelector('.empty-state');
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.className = 'empty-state';
      ogScrollContainer.appendChild(emptyEl);
    }
    if (ogSearchQuery) {
      emptyEl.innerHTML = `
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No stations found</div>
        <div class="empty-state-desc">Try a different search term or line filter</div>
      `;
    } else if (ogFilter === 'visited') {
      emptyEl.innerHTML = `
        <div class="empty-state-icon">🚈</div>
        <div class="empty-state-title">No Overground stations visited</div>
        <div class="empty-state-desc">Start exploring the Overground network!</div>
      `;
    } else if (ogFilter === 'unvisited') {
      emptyEl.innerHTML = `
        <div class="empty-state-icon">🎉</div>
        <div class="empty-state-title">All done!</div>
        <div class="empty-state-desc">You've visited every Overground station here</div>
      `;
    } else {
      emptyEl.innerHTML = `
        <div class="empty-state-icon">🗺️</div>
        <div class="empty-state-title">No stations match</div>
        <div class="empty-state-desc">Try adjusting your filters</div>
      `;
    }
    emptyEl.style.display = 'flex';
    return;
  }

  // Hide empty state
  const emptyEl = ogScrollContainer.querySelector('.empty-state');
  if (emptyEl) emptyEl.style.display = 'none';

  const totalHeight = ogFilteredStations.length * ITEM_HEIGHT;
  ogVirtualListInner.style.height = totalHeight + 'px';

  const scrollTop = ogScrollContainer.scrollTop;
  const viewportHeight = ogScrollContainer.clientHeight;

  let startIdx = Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_ITEMS;
  let endIdx = Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + BUFFER_ITEMS;
  startIdx = Math.max(0, startIdx);
  endIdx = Math.min(ogFilteredStations.length, endIdx);

  if (startIdx === ogLastRenderRange.start && endIdx === ogLastRenderRange.end) return;
  ogLastRenderRange = { start: startIdx, end: endIdx };

  const fragment = document.createDocumentFragment();
  for (let i = startIdx; i < endIdx; i++) {
    const station = ogFilteredStations[i];
    const info = STATION_INDEX[station];
    const isVisited = visited.has(station);

    const row = document.createElement('div');
    row.className = 'station-item' + (isVisited ? ' visited' : '');
    row.dataset.station = station;
    row.style.position = 'absolute';
    row.style.top = (i * ITEM_HEIGHT) + 'px';
    row.style.left = '0';
    row.style.right = '0';
    row.style.height = ITEM_HEIGHT + 'px';

    // Show overground line chips (and any shared tube lines)
    const lineChips = info.lines.map(l => {
      const line = TUBE_LINES[l];
      return `<span class="line-chip" style="background:${line.color}">${line.name}</span>`;
    }).join('');
    const dateStr = visitDates[station] ? `<span class="station-date">${visitDates[station]}</span>` : '';

    row.innerHTML = `
      <button class="station-check"
        aria-label="${station} - ${isVisited ? 'visited' : 'not visited'}"
        aria-checked="${isVisited}"
        role="checkbox">
        ${isVisited ? '✓' : ''}
      </button>
      <div class="station-info">
        <div class="station-name">${station}</div>
        <div class="station-lines">${lineChips}${dateStr}</div>
      </div>
    `;

    row.querySelector('.station-check').addEventListener('click', () => toggleVisited(station));
    fragment.appendChild(row);
  }

  ogVirtualListInner.innerHTML = '';
  ogVirtualListInner.appendChild(fragment);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  buildLineFilters();
  buildZoneFilters();
  initPageNav();
  initFilters();
  initSearch();
  initSort();
  initTheme();
  initOfflineIndicator();
  initVirtualScroll();
  initOvergroundTab();

  // Station count element (for tube tracker)
  const countEl = document.createElement('div');
  countEl.className = 'station-count';
  const stationList = document.getElementById('station-list');
  stationList.parentNode.insertBefore(countEl, stationList);

  // Load from cloud if available, then render
  if (typeof FireSync !== 'undefined') {
    FireSync.load(STORAGE_KEY, (cloudData) => {
      if (cloudData && Array.isArray(cloudData)) {
        // Merge cloud + local so no stations are lost
        cloudData.forEach(s => visited.add(s));
      } else {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          try {
            const localArr = JSON.parse(local);
            if (Array.isArray(localArr) && localArr.length > 0) {
              localArr.forEach(s => visited.add(s));
              FireSync.save(STORAGE_KEY, [...visited]);
            }
          } catch(e) {}
        }
      }
      // Save merged set back to cloud so both sides stay in sync
      FireSync.save(STORAGE_KEY, [...visited]);
      updateHeaderStats();
      updateFilteredStations();
      renderVirtualList();
      updateOgFilteredStations();
      renderOgVirtualList();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderTubeMap === 'function') renderTubeMap();
    });

    FireSync.load(DATES_STORAGE_KEY, (cloudDates) => {
      if (cloudDates && typeof cloudDates === 'object') {
        // Merge: keep the earliest date for each station
        Object.keys(cloudDates).forEach(station => {
          if (!visitDates[station] || cloudDates[station] < visitDates[station]) {
            visitDates[station] = cloudDates[station];
          }
        });
      } else {
        const localDates = localStorage.getItem(DATES_STORAGE_KEY);
        if (localDates) {
          try {
            visitDates = JSON.parse(localDates);
          } catch(e) {}
        }
      }
      // Save merged dates back
      FireSync.save(DATES_STORAGE_KEY, visitDates);
    });

    FireSync.listen(STORAGE_KEY, (cloudData) => {
      if (cloudData && Array.isArray(cloudData)) {
        // Merge incoming cloud data with local — never lose stations
        cloudData.forEach(s => visited.add(s));
        updateHeaderStats();
        updateFilteredStations();
        renderVirtualList();
        updateOgFilteredStations();
        renderOgVirtualList();
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTubeMap === 'function') renderTubeMap();
      }
    });

    FireSync.listen(DATES_STORAGE_KEY, (cloudDates) => {
      if (cloudDates && typeof cloudDates === 'object') {
        // Merge: keep earliest date per station
        Object.keys(cloudDates).forEach(station => {
          if (!visitDates[station] || cloudDates[station] < visitDates[station]) {
            visitDates[station] = cloudDates[station];
          }
        });
        updateFilteredStations();
        renderVirtualList();
        updateOgFilteredStations();
        renderOgVirtualList();
      }
    });
  } else {
    updateHeaderStats();
    updateFilteredStations();
    renderVirtualList();
    updateOgFilteredStations();
    renderOgVirtualList();
  }
});
