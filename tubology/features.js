// Tubology - Additional Features (Export/Import, Nearest Unvisited, Random Station)

// ══════════════════════════════════════════════════
// ── EXPORT / IMPORT ──
// ══════════════════════════════════════════════════

function exportData() {
  const data = {
    version: 2,
    appName: 'tubology',
    exportDate: new Date().toISOString(),
    visited: [...visited],
    visitDates: visitDates,
    achievements: unlockedAchievements
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `tubology-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Data exported successfully');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        if (!data.visited || !Array.isArray(data.visited)) {
          showToast('Invalid backup file — missing visited array', 'error');
          return;
        }

        // Schema version check
        const version = data.version || 1;
        if (version > 2) {
          showToast('Backup file is from a newer version of Tubology. Please update the app.', 'error');
          return;
        }

        // Validate stations exist in current data
        const validStations = data.visited.filter(s => ALL_STATIONS.includes(s));
        const invalidCount = data.visited.length - validStations.length;

        // Confirm before merging
        let msg = `Import ${validStations.length} visited stations? This will merge with your current data.`;
        if (invalidCount > 0) {
          msg += `\n\n${invalidCount} station(s) in the backup are not recognised and will be skipped.`;
        }
        if (!confirm(msg)) {
          return;
        }

        // Merge data
        validStations.forEach(s => visited.add(s));
        if (data.visitDates) {
          Object.keys(data.visitDates).forEach(s => {
            if (ALL_STATIONS.includes(s)) {
              // Keep earliest date
              if (!visitDates[s] || data.visitDates[s] < visitDates[s]) {
                visitDates[s] = data.visitDates[s];
              }
            }
          });
        }
        if (data.achievements) {
          Object.assign(unlockedAchievements, data.achievements);
          localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
        }

        save();
        updateFilteredStations();
        renderVirtualList();
        updateOgFilteredStations();
        renderOgVirtualList();
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTubeMap === 'function') renderTubeMap();
        checkAchievements();

        showToast(`Imported ${validStations.length} stations successfully`);
      } catch (err) {
        showToast('Failed to read backup file', 'error');
      }
    };
    reader.readAsText(file);
  });

  input.click();
}

function exportCSV() {
  let csv = 'Station,Visited,Date,Lines,Zone\n';
  ALL_STATIONS.forEach(station => {
    const isVisited = visited.has(station) ? 'Yes' : 'No';
    const date = visitDates[station] || '';
    const lines = STATION_INDEX[station].lines.map(l => TUBE_LINES[l].name).join('; ');
    const zone = STATION_ZONES[station] || '';
    csv += `"${station}",${isVisited},${date},"${lines}",${zone}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tubology-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('CSV exported successfully');
}

// ══════════════════════════════════════════════════
// ── NEAREST UNVISITED (Geolocation) ──
// ══════════════════════════════════════════════════

// Approximate coordinates for stations (central London focus)
// This is a simplified set - enough for distance calculations
const STATION_COORDS = {
  "Paddington": [51.5154, -0.1755], "Baker Street": [51.5226, -0.1571],
  "Oxford Circus": [51.5152, -0.1418], "King's Cross St. Pancras": [51.5308, -0.1238],
  "Liverpool Street": [51.5178, -0.0823], "Victoria": [51.4965, -0.1447],
  "Waterloo": [51.5036, -0.1143], "London Bridge": [51.5052, -0.0864],
  "Bank": [51.5133, -0.0886], "Canary Wharf": [51.5051, -0.0185],
  "Stratford": [51.5416, -0.0042], "Westminster": [51.5010, -0.1254],
  "Green Park": [51.5067, -0.1428], "Bond Street": [51.5142, -0.1494],
  "Tottenham Court Road": [51.5165, -0.1310], "Euston": [51.5282, -0.1337],
  "Camden Town": [51.5392, -0.1426], "Brixton": [51.4627, -0.1145],
  "Clapham Junction": [51.4641, -0.1703], "Richmond": [51.4633, -0.3013],
  "Ealing Broadway": [51.5150, -0.3019], "Hammersmith": [51.4936, -0.2251],
  "Shepherd's Bush": [51.5046, -0.2187], "Notting Hill Gate": [51.5094, -0.1967],
  "Earl's Court": [51.4907, -0.1953], "South Kensington": [51.4941, -0.1738],
  "Finsbury Park": [51.5642, -0.1065], "Highbury & Islington": [51.5463, -0.1039],
  "Angel": [51.5322, -0.1058], "Old Street": [51.5258, -0.0873],
  "Moorgate": [51.5186, -0.0886], "Farringdon": [51.5203, -0.1053],
  "Barbican": [51.5204, -0.0979], "Holborn": [51.5174, -0.1200],
  "Covent Garden": [51.5129, -0.1243], "Leicester Square": [51.5113, -0.1281],
  "Piccadilly Circus": [51.5100, -0.1347], "Charing Cross": [51.5073, -0.1277],
  "Embankment": [51.5074, -0.1223], "Temple": [51.5111, -0.1141],
  "Blackfriars": [51.5120, -0.1032], "Cannon Street": [51.5113, -0.0904],
  "Monument": [51.5108, -0.0863], "Tower Hill": [51.5098, -0.0766],
  "Aldgate": [51.5143, -0.0755], "Aldgate East": [51.5152, -0.0715],
  "Whitechapel": [51.5194, -0.0612], "Bethnal Green": [51.5270, -0.0549],
  "Mile End": [51.5249, -0.0332], "Bow Road": [51.5269, -0.0247],
  "West Ham": [51.5287, 0.0056], "Wembley Park": [51.5635, -0.2795],
  "Kilburn": [51.5471, -0.2047], "Willesden Junction": [51.5326, -0.2440],
  "Acton Town": [51.5028, -0.2801], "Heathrow Terminals 2 & 3": [51.4713, -0.4524],
  "Cockfosters": [51.6517, -0.1496], "High Barnet": [51.6503, -0.1943],
  "Morden": [51.4022, -0.1948], "Upminster": [51.5590, 0.2510],
  "Epping": [51.6937, 0.1139], "Amersham": [51.6740, -0.6073],
  "Chesham": [51.7052, -0.6110], "Watford": [51.6573, -0.4177],
};

let nearestWatchId = null;

function showNearestUnvisited() {
  if (!navigator.geolocation) {
    showToast('Geolocation not supported', 'error');
    return;
  }

  showToast('Finding your location...');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      displayNearestStations(lat, lon);
    },
    (error) => {
      showToast('Could not get your location', 'error');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function displayNearestStations(lat, lon) {
  // Find unvisited stations with known coordinates
  const unvisitedWithCoords = ALL_STATIONS
    .filter(s => !visited.has(s) && STATION_COORDS[s])
    .map(s => ({
      name: s,
      distance: haversineDistance(lat, lon, STATION_COORDS[s][0], STATION_COORDS[s][1])
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  if (unvisitedWithCoords.length === 0) {
    showToast('All nearby stations visited! 🎉');
    return;
  }

  // Show in a modal
  let modal = document.getElementById('nearest-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'nearest-modal';
    modal.className = 'nearest-modal';
    document.body.appendChild(modal);
  }

  let html = `
    <div class="nearest-modal-content">
      <div class="nearest-modal-header">
        <h3>📍 Nearest Unvisited</h3>
        <button class="nearest-close-btn" onclick="closeNearestModal()">✕</button>
      </div>
      <div class="nearest-list">
  `;

  unvisitedWithCoords.forEach(s => {
    const lines = STATION_INDEX[s.name].lines.map(l =>
      `<span class="line-chip" style="background:${TUBE_LINES[l].color}">${TUBE_LINES[l].name}</span>`
    ).join('');
    const distStr = s.distance < 1 ? `${Math.round(s.distance * 1000)}m` : `${s.distance.toFixed(1)}km`;

    html += `
      <div class="nearest-item">
        <div class="nearest-item-info">
          <div class="nearest-item-name">${s.name}</div>
          <div class="nearest-item-lines">${lines}</div>
        </div>
        <div class="nearest-item-distance">${distStr}</div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  modal.innerHTML = html;
  modal.classList.add('visible');
}

function closeNearestModal() {
  const modal = document.getElementById('nearest-modal');
  if (modal) modal.classList.remove('visible');
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ══════════════════════════════════════════════════
// ── RANDOM STATION ──
// ══════════════════════════════════════════════════

function showRandomUnvisited() {
  const unvisited = ALL_STATIONS.filter(s => !visited.has(s));
  if (unvisited.length === 0) {
    showToast('All stations visited! 🎉');
    return;
  }

  const station = unvisited[Math.floor(Math.random() * unvisited.length)];
  const lines = STATION_INDEX[station].lines.map(l =>
    `<span class="line-chip" style="background:${TUBE_LINES[l].color}">${TUBE_LINES[l].name}</span>`
  ).join('');
  const zone = STATION_ZONES[station] ? `Zone ${STATION_ZONES[station]}` : '';

  let modal = document.getElementById('random-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'random-modal';
    modal.className = 'nearest-modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="nearest-modal-content random-modal-content">
      <div class="nearest-modal-header">
        <h3>🎲 Random Station</h3>
        <button class="nearest-close-btn" onclick="closeRandomModal()">✕</button>
      </div>
      <div class="random-station-display">
        <div class="random-station-name">${station}</div>
        <div class="random-station-meta">
          <div class="random-station-lines">${lines}</div>
          ${zone ? `<div class="random-station-zone">${zone}</div>` : ''}
        </div>
      </div>
      <div class="random-actions">
        <button class="btn-primary" onclick="markRandomVisited('${station.replace(/'/g, "\\'")}')">✓ Mark Visited</button>
        <button class="btn-secondary" onclick="rerollRandom()">🎲 Another One</button>
      </div>
    </div>
  `;

  modal.classList.add('visible');
}

function closeRandomModal() {
  const modal = document.getElementById('random-modal');
  if (modal) modal.classList.remove('visible');
}

function markRandomVisited(station) {
  toggleVisited(station);
  closeRandomModal();
  checkAchievements();
}

function rerollRandom() {
  closeRandomModal();
  showRandomUnvisited();
}

// ══════════════════════════════════════════════════
// ── TOAST UTILITY ──
// ══════════════════════════════════════════════════

function showToast(message, type = 'info') {
  let toast = document.getElementById('feature-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'feature-toast';
    toast.className = 'feature-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `feature-toast ${type} visible`;
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ══════════════════════════════════════════════════
// ── LONG PRESS TO MARK (Mobile UX) ──
// ══════════════════════════════════════════════════

let longPressTimer = null;
let longPressTarget = null;
let longPressStartX = 0;
let longPressStartY = 0;
const LONG_PRESS_MOVE_THRESHOLD = 10; // px — cancel if finger moves more than this
const LONG_PRESS_DURATION = 700; // ms — increased from 500 to reduce accidental triggers

function initLongPress() {
  // Delegate from station lists
  document.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.station-item');
    if (!item) return;

    const touch = e.touches[0];
    longPressStartX = touch.clientX;
    longPressStartY = touch.clientY;
    longPressTarget = item;

    longPressTimer = setTimeout(() => {
      // Only fire if target is still valid (not cancelled by move)
      if (!longPressTarget) return;
      const station = item.dataset.station;
      if (station) {
        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(30);
        toggleVisited(station);
        checkAchievements();
        item.classList.add('station-pulse');
        setTimeout(() => item.classList.remove('station-pulse'), 400);
      }
      longPressTarget = null;
    }, LONG_PRESS_DURATION);
  }, { passive: true });

  document.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
    longPressTarget = null;
  });

  document.addEventListener('touchmove', (e) => {
    if (!longPressTarget) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - longPressStartX);
    const dy = Math.abs(touch.clientY - longPressStartY);
    // Cancel if finger has moved beyond threshold (user is scrolling)
    if (dx > LONG_PRESS_MOVE_THRESHOLD || dy > LONG_PRESS_MOVE_THRESHOLD) {
      clearTimeout(longPressTimer);
      longPressTarget = null;
    }
  }, { passive: true });
}

// Init long press on load
document.addEventListener('DOMContentLoaded', () => {
  initLongPress();
});
