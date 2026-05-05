// Tubology - Virtual Tube Map Renderer
// Renders a schematic tube map on canvas showing line completion percentages

function renderTubeMap() {
  const canvas = document.getElementById('tube-map-canvas');
  const container = document.getElementById('tube-map-container');
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Size canvas to container
  const width = container.clientWidth;
  const height = Math.max(600, container.clientHeight);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  // Clear
  ctx.fillStyle = '#0f1117';
  ctx.fillRect(0, 0, width, height);

  // Calculate line stats
  const lineStats = {};
  Object.entries(TUBE_LINES).forEach(([id, line]) => {
    const unique = [...new Set(line.stations)];
    const visitedCount = unique.filter(s => visited.has(s)).length;
    lineStats[id] = {
      total: unique.length,
      visited: visitedCount,
      pct: Math.round((visitedCount / unique.length) * 100)
    };
  });

  // Layout: draw each line as a horizontal bar with station dots
  const lineIds = Object.keys(TUBE_LINES);
  const padding = 30;
  const lineHeight = (height - padding * 2) / lineIds.length;
  const barStartX = 180;
  const barEndX = width - padding;
  const barWidth = barEndX - barStartX;

  lineIds.forEach((lineId, idx) => {
    const line = TUBE_LINES[lineId];
    const stats = lineStats[lineId];
    const y = padding + idx * lineHeight + lineHeight / 2;
    const uniqueStations = [...new Set(line.stations)];

    // Line label
    ctx.fillStyle = line.color;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(line.name, barStartX - 15, y - 8);

    // Percentage
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(stats.pct + '% (' + stats.visited + '/' + stats.total + ')', barStartX - 15, y + 8);

    // Background track
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.moveTo(barStartX, y);
    ctx.lineTo(barEndX, y);
    ctx.stroke();

    // Visited progress fill
    if (stats.pct > 0) {
      const fillWidth = (stats.pct / 100) * barWidth;
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.moveTo(barStartX, y);
      ctx.lineTo(barStartX + fillWidth, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Station dots
    const dotSpacing = barWidth / (uniqueStations.length - 1 || 1);
    uniqueStations.forEach((station, sIdx) => {
      const x = barStartX + sIdx * dotSpacing;
      const isVisited = visited.has(station);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      if (isVisited) {
        ctx.fillStyle = line.color;
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fill();
      }
    });

    // Full completion badge
    if (stats.pct === 100) {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✓ COMPLETE', barEndX + 8, y);
    }
  });

  // Render legend
  renderMapLegend(lineStats);
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
    <div class="legend-lines">
  `;

  Object.entries(TUBE_LINES).forEach(([id, line]) => {
    const stats = lineStats[id];
    const complete = stats.pct === 100;
    html += `
      <div class="legend-line ${complete ? 'complete' : ''}">
        <span class="legend-color" style="background:${line.color}"></span>
        <span class="legend-name">${line.name}</span>
        <span class="legend-pct">${stats.pct}%</span>
        <div class="legend-bar">
          <div class="legend-bar-fill" style="width:${stats.pct}%;background:${line.color}"></div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  legend.innerHTML = html;
}

// Re-render on resize
window.addEventListener('resize', () => {
  if (document.getElementById('page-map').classList.contains('active')) {
    renderTubeMap();
  }
});
