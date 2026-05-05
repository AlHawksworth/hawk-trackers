// Tubology - Dashboard with detailed stats

function renderDashboard() {
  const grid = document.getElementById('dashboard-grid');
  if (!grid) return;

  const totalVisited = visited.size;
  const totalPct = TOTAL_STATIONS ? Math.round((totalVisited / TOTAL_STATIONS) * 100) : 0;

  // Line stats
  const lineStats = Object.entries(TUBE_LINES).map(([id, line]) => {
    const unique = [...new Set(line.stations)];
    const v = unique.filter(s => visited.has(s)).length;
    return { id, name: line.name, color: line.color, total: unique.length, visited: v, pct: unique.length ? Math.round((v / unique.length) * 100) : 0 };
  }).sort((a, b) => b.pct - a.pct);

  // Interchange stations (on multiple lines)
  const interchanges = ALL_STATIONS.filter(s => STATION_INDEX[s].lines.length > 1);
  const interchangeVisited = interchanges.filter(s => visited.has(s)).length;

  // Zone approximation (simplified)
  const zone1Stations = [
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
  const zone1Visited = zone1Stations.filter(s => visited.has(s)).length;
  const zone1Pct = zone1Stations.length ? Math.round((zone1Visited / zone1Stations.length) * 100) : 0;

  // Completed lines
  const completedLines = lineStats.filter(l => l.pct === 100);

  // Most connected unvisited
  const unvisitedByConnections = ALL_STATIONS
    .filter(s => !visited.has(s))
    .map(s => ({ name: s, connections: STATION_INDEX[s].lines.length }))
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5);

  // Recent milestones
  const milestones = [
    { threshold: 50, label: '50 stations' },
    { threshold: 100, label: '100 stations' },
    { threshold: 150, label: '150 stations' },
    { threshold: 200, label: '200 stations' },
    { threshold: 250, label: '250 stations' },
    { threshold: TOTAL_STATIONS, label: 'ALL stations!' }
  ];
  const nextMilestone = milestones.find(m => totalVisited < m.threshold);

  grid.innerHTML = `
    <!-- Overall Progress -->
    <div class="dash-card dash-card-wide">
      <div class="dash-card-header">
        <h3>📊 Overall Progress</h3>
      </div>
      <div class="dash-big-stat">
        <div class="dash-big-number">${totalPct}%</div>
        <div class="dash-big-label">${totalVisited} of ${TOTAL_STATIONS} stations</div>
      </div>
      <div class="dash-progress-bar">
        <div class="dash-progress-fill" style="width:${totalPct}%"></div>
      </div>
      ${nextMilestone ? `<div class="dash-milestone">Next milestone: ${nextMilestone.label} (${nextMilestone.threshold - totalVisited} to go)</div>` : '<div class="dash-milestone">🎉 All milestones achieved!</div>'}
    </div>

    <!-- Quick Stats -->
    <div class="dash-card">
      <div class="dash-card-header"><h3>⚡ Quick Stats</h3></div>
      <div class="dash-stat-grid">
        <div class="dash-stat-item">
          <div class="dash-stat-value">${totalVisited}</div>
          <div class="dash-stat-label">Stations Visited</div>
        </div>
        <div class="dash-stat-item">
          <div class="dash-stat-value">${TOTAL_STATIONS - totalVisited}</div>
          <div class="dash-stat-label">Remaining</div>
        </div>
        <div class="dash-stat-item">
          <div class="dash-stat-value">${completedLines.length}</div>
          <div class="dash-stat-label">Lines Complete</div>
        </div>
        <div class="dash-stat-item">
          <div class="dash-stat-value">${Object.keys(TUBE_LINES).length}</div>
          <div class="dash-stat-label">Total Lines</div>
        </div>
      </div>
    </div>

    <!-- Zone 1 -->
    <div class="dash-card">
      <div class="dash-card-header"><h3>🏙️ Zone 1 Progress</h3></div>
      <div class="dash-big-stat">
        <div class="dash-big-number">${zone1Pct}%</div>
        <div class="dash-big-label">${zone1Visited} of ${zone1Stations.length} Zone 1 stations</div>
      </div>
      <div class="dash-progress-bar">
        <div class="dash-progress-fill zone1" style="width:${zone1Pct}%"></div>
      </div>
    </div>

    <!-- Interchanges -->
    <div class="dash-card">
      <div class="dash-card-header"><h3>🔄 Interchanges</h3></div>
      <div class="dash-big-stat">
        <div class="dash-big-number">${interchangeVisited}/${interchanges.length}</div>
        <div class="dash-big-label">Interchange stations visited</div>
      </div>
      <div class="dash-progress-bar">
        <div class="dash-progress-fill interchange" style="width:${interchanges.length ? Math.round((interchangeVisited/interchanges.length)*100) : 0}%"></div>
      </div>
    </div>

    <!-- Line Breakdown -->
    <div class="dash-card dash-card-wide">
      <div class="dash-card-header"><h3>🚇 Line Breakdown</h3></div>
      <div class="dash-line-list">
        ${lineStats.map(l => `
          <div class="dash-line-row">
            <span class="dash-line-color" style="background:${l.color}"></span>
            <span class="dash-line-name">${l.name}</span>
            <span class="dash-line-count">${l.visited}/${l.total}</span>
            <div class="dash-line-bar">
              <div class="dash-line-bar-fill" style="width:${l.pct}%;background:${l.color}"></div>
            </div>
            <span class="dash-line-pct">${l.pct}%</span>
            ${l.pct === 100 ? '<span class="dash-line-complete">✓</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Completed Lines -->
    <div class="dash-card">
      <div class="dash-card-header"><h3>🏆 Completed Lines</h3></div>
      ${completedLines.length === 0 ? '<p class="dash-empty">No lines completed yet. Keep going!</p>' :
        `<div class="dash-completed-list">
          ${completedLines.map(l => `
            <div class="dash-completed-item">
              <span class="dash-line-color" style="background:${l.color}"></span>
              <span>${l.name}</span>
              <span class="dash-completed-badge">✓ ${l.total} stations</span>
            </div>
          `).join('')}
        </div>`
      }
    </div>

    <!-- Suggested Next -->
    <div class="dash-card">
      <div class="dash-card-header"><h3>💡 Suggested Next Visits</h3></div>
      <p class="dash-sub">Most connected unvisited stations:</p>
      ${unvisitedByConnections.length === 0 ? '<p class="dash-empty">All stations visited! 🎉</p>' :
        `<div class="dash-suggestions">
          ${unvisitedByConnections.map(s => `
            <div class="dash-suggestion-item">
              <span class="dash-suggestion-name">${s.name}</span>
              <span class="dash-suggestion-lines">${s.connections} line${s.connections > 1 ? 's' : ''}</span>
            </div>
          `).join('')}
        </div>`
      }
    </div>
  `;
}
