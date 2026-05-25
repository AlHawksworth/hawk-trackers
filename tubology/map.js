// Tubology - Virtual Tube Map Renderer (Performance Optimised)

let mapScale = 1;
let mapOffsetX = 0;
let mapOffsetY = 0;
let isDragging = false;
let lastTouchX = 0;
let lastTouchY = 0;
let lastPinchDistance = null;
let mapControlsInitialised = false;
let cachedLineStats = null;
let mapRafId = null;

// Cache line stats — only recalculate when visited set changes
function getLineStats() {
  if (cachedLineStats && cachedLineStats._visitedSize === visited.size) {
    return cachedLineStats;
  }
  const stats = {};
  Object.entries(TUBE_LINES).forEach(([id, line]) => {
    const unique = line.uniqueStations;
    const visitedCount = unique.filter(s => visited.has(s)).length;
    stats[id] = {
      total: unique.length,
      visited: visitedCount,
      pct: unique.length ? Math.round((visitedCount / unique.length) * 100) : 0
    };
  });
  stats._visitedSize = visited.size;
  cachedLineStats = stats;
  return stats;
}

// Invalidate cache when visited changes
function invalidateMapCache() {
  cachedLineStats = null;
}

function renderTubeMap() {
  const canvas = document.getElementById('tube-map-canvas');
  const container = document.getElementById('tube-map-container');
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const width = container.clientWidth;
  const height = Math.max(700, container.clientHeight);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  ctx.save();
  ctx.translate(mapOffsetX, mapOffsetY);
  ctx.scale(mapScale, mapScale);

  // Background
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0f1117';
  ctx.fillStyle = bgColor;
  ctx.fillRect(-mapOffsetX / mapScale, -mapOffsetY / mapScale, width / mapScale, height / mapScale);

  const lineStats = getLineStats();

  // Layout
  const lineIds = Object.keys(TUBE_LINES);
  const tubeLineIds = lineIds.filter(id => !TUBE_LINES[id].isOverground);
  const overgroundLineIds = lineIds.filter(id => TUBE_LINES[id].isOverground);
  const allLineIds = [...tubeLineIds, ...overgroundLineIds];

  const padding = 30;
  const sectionGap = 20;
  const totalLines = allLineIds.length;
  const availableHeight = height - padding * 2 - sectionGap;
  const lineHeight = availableHeight / totalLines;
  const barStartX = 180;
  const barEndX = width - padding - 80;
  const barWidth = barEndX - barStartX;

  let currentY = padding;

  // Draw section headers
  function drawSectionHeader(label, y) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 10, y);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.moveTo(10, y + 10);
    ctx.lineTo(barEndX + 60, y + 10);
    ctx.stroke();
  }

  // Draw tube section
  drawSectionHeader('🚇 TUBE & ELIZABETH LINE', currentY);
  currentY += 20;

  tubeLineIds.forEach((lineId) => {
    drawLineRow(ctx, lineId, currentY + lineHeight / 2, barStartX, barEndX, barWidth, lineStats);
    currentY += lineHeight;
  });

  // Draw overground section
  currentY += sectionGap;
  drawSectionHeader('🚈 LONDON OVERGROUND', currentY);
  currentY += 20;

  overgroundLineIds.forEach((lineId) => {
    drawLineRow(ctx, lineId, currentY + lineHeight / 2, barStartX, barEndX, barWidth, lineStats);
    currentY += lineHeight;
  });

  ctx.restore();

  renderMapLegend(lineStats);

  // Initialise controls only once
  if (!mapControlsInitialised) {
    setupMapControls(canvas);
    mapControlsInitialised = true;
  }
}

function drawLineRow(ctx, lineId, y, barStartX, barEndX, barWidth, lineStats) {
  const line = TUBE_LINES[lineId];
  const stats = lineStats[lineId];
  const uniqueStations = line.uniqueStations;

  // Line label
  ctx.fillStyle = line.color;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(line.name, barStartX - 15, y - 7);

  // Stats text
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText(`${stats.visited}/${stats.total}`, barStartX - 15, y + 7);

  // Background track
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.moveTo(barStartX, y);
  ctx.lineTo(barEndX, y);
  ctx.stroke();

  // Progress fill
  if (stats.pct > 0) {
    const fillWidth = (stats.pct / 100) * barWidth;
    ctx.beginPath();
    ctx.strokeStyle = line.color;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.moveTo(barStartX, y);
    ctx.lineTo(barStartX + fillWidth, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Station dots
  if (uniqueStations.length > 1) {
    const dotSpacing = barWidth / (uniqueStations.length - 1);
    uniqueStations.forEach((station, sIdx) => {
      const x = barStartX + sIdx * dotSpacing;
      const isVisited = visited.has(station);
      const isInterchange = STATION_INDEX[station] && STATION_INDEX[station].lines.length > 1;

      ctx.beginPath();
      ctx.arc(x, y, isInterchange ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isVisited ? line.color : 'rgba(255,255,255,0.12)';
      ctx.fill();

      if (isInterchange && isVisited) {
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }

  // Completion badge
  if (stats.pct === 100) {
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✓', barEndX + 10, y);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(stats.pct + '%', barEndX + 10, y);
  }
}

function setupMapControls(canvas) {
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastTouchX = e.clientX;
    lastTouchY = e.clientY;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    mapOffsetX += e.clientX - lastTouchX;
    mapOffsetY += e.clientY - lastTouchY;
    lastTouchX = e.clientX;
    lastTouchY = e.clientY;
    scheduleMapRender();
  });

  canvas.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging = true;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      mapOffsetX += e.touches[0].clientX - lastTouchX;
      mapOffsetY += e.touches[0].clientY - lastTouchY;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      scheduleMapRender();
    } else if (e.touches.length === 2) {
      const distance = Math.sqrt(
        Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
        Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
      );
      if (lastPinchDistance) {
        const scale = distance / lastPinchDistance;
        mapScale = Math.max(0.5, Math.min(3, mapScale * scale));
        scheduleMapRender();
      }
      lastPinchDistance = distance;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
    lastPinchDistance = null;
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    mapScale = Math.max(0.5, Math.min(3, mapScale * delta));
    scheduleMapRender();
  }, { passive: false });
}

// Throttle map renders during interaction
function scheduleMapRender() {
  if (mapRafId) return;
  mapRafId = requestAnimationFrame(() => {
    mapRafId = null;
    renderTubeMap();
  });
}

function renderMapLegend(lineStats) {
  const legend = document.getElementById('map-legend');
  if (!legend) return;

  const totalVisited = visited.size;
  const totalPct = Math.round((totalVisited / TOTAL_STATIONS) * 100);

  let html = `
    <div class="legend-summary">
      <div class="legend-total">${totalPct}% Complete</div>
      <div class="legend-detail">${totalVisited} of ${TOTAL_STATIONS} stations visited</div>
    </div>
    <div class="map-controls">
      <button class="map-control-btn" onclick="resetMapView()">Reset View</button>
      <button class="map-control-btn" onclick="zoomIn()">Zoom +</button>
      <button class="map-control-btn" onclick="zoomOut()">Zoom −</button>
    </div>
    <div class="legend-lines">
  `;

  // Tube lines
  const tubeEntries = Object.entries(TUBE_LINES).filter(([_, l]) => !l.isOverground);
  const overgroundEntries = Object.entries(TUBE_LINES).filter(([_, l]) => l.isOverground);

  html += '<div class="legend-section-label">🚇 Tube</div>';
  tubeEntries.forEach(([id, line]) => {
    const stats = lineStats[id];
    html += legendLineHtml(line, stats);
  });

  html += '<div class="legend-section-label">🚈 Overground</div>';
  overgroundEntries.forEach(([id, line]) => {
    const stats = lineStats[id];
    html += legendLineHtml(line, stats);
  });

  html += '</div>';
  legend.innerHTML = html;
}

function legendLineHtml(line, stats) {
  const complete = stats.pct === 100;
  return `
    <div class="legend-line ${complete ? 'complete' : ''}">
      <span class="legend-color" style="background:${line.color}"></span>
      <span class="legend-name">${line.name}</span>
      <span class="legend-pct">${stats.pct}%</span>
      <div class="legend-bar">
        <div class="legend-bar-fill" style="width:${stats.pct}%;background:${line.color}"></div>
      </div>
    </div>
  `;
}

function resetMapView() {
  mapScale = 1;
  mapOffsetX = 0;
  mapOffsetY = 0;
  renderTubeMap();
}

function zoomIn() {
  mapScale = Math.min(3, mapScale * 1.2);
  renderTubeMap();
}

function zoomOut() {
  mapScale = Math.max(0.5, mapScale * 0.8);
  renderTubeMap();
}

// Re-render on resize (debounced)
let mapResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(mapResizeTimer);
  mapResizeTimer = setTimeout(() => {
    if (document.getElementById('page-map') && document.getElementById('page-map').classList.contains('active')) {
      renderTubeMap();
    }
  }, 200);
});
