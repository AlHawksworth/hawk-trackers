// Tubology - Main App Logic (Performance & Visual Overhaul)

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
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderTubeMap === 'function') renderTubeMap();
}

// ── Update header stats with counter animation ──
function updateHeaderStats() {
  const v = visited.size;
  const r = TOTAL_STATIONS - v;
  const pct = TOTAL_STATIONS ? Math.round((v / TOTAL_STATIONS) * 100) : 0;

  animateCounter('stat-visited', v, ' Visited');
  animateCounter('stat-remaining', r, ' Remaining');
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-bar').style.width = pct + '%';
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
  let stations = ALL_STATIONS.slice();

  // Filter by line
  if (currentLineFilter !== 'all') {
    const lineStations = new Set(TUBE_LINES[currentLineFilter].uniqueStations);
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
    stations = stations.filter(s => {
      if (s.toLowerCase().includes(q)) return true;
      // Also search line names
      return STATION_INDEX[s].lines.some(l => TUBE_LINES[l].name.toLowerCase().includes(q));
    });
  }

  // Sort
  stations = sortStations(stations);
  filteredStations = stations;

  // Update count
  const el = document.querySelector('.station-count');
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
      const icon = line.isOverground ? '<span class="line-chip-icon">🟠</span>' : '';
      return `<span class="line-chip" style="background:${line.color}">${icon}${line.name}</span>`;
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

// ── Build line filter buttons (grouped: Tube / Overground) ──
function buildLineFilters() {
  const container = document.getElementById('line-filter-group');

  const tubeLines = Object.entries(TUBE_LINES).filter(([_, l]) => !l.isOverground);
  const overgroundLines = Object.entries(TUBE_LINES).filter(([_, l]) => l.isOverground);

  let html = '<button class="filter-btn active" data-line="all">All Lines</button>';
  html += '<div class="line-filter-section"><span class="line-filter-label">🚇 Tube</span>';
  tubeLines.forEach(([id, line]) => {
    html += `<button class="filter-btn line-filter-btn" data-line="${id}" style="--line-color:${line.color}">${line.name}</button>`;
  });
  html += '</div>';
  html += '<div class="line-filter-section"><span class="line-filter-label">🚈 Overground</span>';
  overgroundLines.forEach(([id, line]) => {
    html += `<button class="filter-btn line-filter-btn overground-btn" data-line="${id}" style="--line-color:${line.color}">${line.name}</button>`;
  });
  html += '</div>';

  container.innerHTML = html;

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-line]');
    if (!btn) return;
    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLineFilter = btn.dataset.line;
    updateBulkActions();
    updateFilteredStations();
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
      if (tab.dataset.page === 'live' && typeof initLivePage === 'function') initLivePage();
      if (tab.dataset.page === 'map' && typeof renderTubeMap === 'function') renderTubeMap();
      if (tab.dataset.page === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
      if (tab.dataset.page !== 'live' && typeof cleanupLive === 'function') cleanupLive();
    });
  });
}

// ── Filter buttons ──
function initFilters() {
  const filterBtns = document.querySelectorAll('#page-tracker > .toolbar > .filter-group:first-of-type .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      updateFilteredStations();
      renderVirtualList();
    });
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

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  buildLineFilters();
  initPageNav();
  initFilters();
  initSearch();
  initSort();
  initTheme();
  initOfflineIndicator();
  initVirtualScroll();

  // Station count element
  const countEl = document.createElement('div');
  countEl.className = 'station-count';
  const stationList = document.getElementById('station-list');
  stationList.parentNode.insertBefore(countEl, stationList);

  // Load from cloud if available, then render
  if (typeof FireSync !== 'undefined') {
    FireSync.load(STORAGE_KEY, (cloudData) => {
      if (cloudData && Array.isArray(cloudData)) {
        visited = new Set(cloudData);
      } else {
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
      updateFilteredStations();
      renderVirtualList();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderTubeMap === 'function') renderTubeMap();
    });

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

    FireSync.listen(STORAGE_KEY, (cloudData) => {
      if (cloudData && Array.isArray(cloudData)) {
        visited = new Set(cloudData);
        updateHeaderStats();
        updateFilteredStations();
        renderVirtualList();
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTubeMap === 'function') renderTubeMap();
      }
    });

    FireSync.listen(DATES_STORAGE_KEY, (cloudDates) => {
      if (cloudDates && typeof cloudDates === 'object') {
        visitDates = cloudDates;
        updateFilteredStations();
        renderVirtualList();
      }
    });
  } else {
    updateHeaderStats();
    updateFilteredStations();
    renderVirtualList();
  }
});
