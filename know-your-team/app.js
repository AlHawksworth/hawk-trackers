// ═══════════════════════════════════════════
// KnowYourTeam — Main Application
// ═══════════════════════════════════════════

(function () {
  'use strict';

  // ── State ──
  let currentLeague = 'all';
  let searchQuery = '';

  // ── DOM Refs ──
  const searchInput = document.getElementById('search-input');
  const teamList = document.getElementById('team-list');
  const filterBtn = document.getElementById('filter-btn');
  const filterLabel = document.getElementById('filter-label');
  const leagueFilter = document.getElementById('league-filter');
  const viewBrowse = document.getElementById('view-browse');
  const viewTeam = document.getElementById('view-team');
  const teamDetail = document.getElementById('team-detail');
  const backBtn = document.getElementById('back-btn');

  // ── Navigation ──
  function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
  }

  backBtn.addEventListener('click', () => {
    showView('browse');
  });

  // ── Filter Toggle ──
  filterBtn.addEventListener('click', () => {
    leagueFilter.classList.toggle('hidden');
  });

  // ── League Filter ──
  document.querySelectorAll('.league-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.league-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentLeague = chip.dataset.league;
      filterLabel.textContent = currentLeague === 'all' ? 'All Leagues' : currentLeague;
      renderTeamList();
    });
  });

  // ── Search ──
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderTeamList();
  });

  // ── Render Team List ──
  function renderTeamList() {
    let teams = TEAMS;

    // Filter by league
    if (currentLeague !== 'all') {
      teams = teams.filter(t => t.league === currentLeague);
    }

    // Filter by search
    if (searchQuery) {
      teams = teams.filter(t =>
        t.name.toLowerCase().includes(searchQuery) ||
        t.nickname.toLowerCase().includes(searchQuery) ||
        t.ground.toLowerCase().includes(searchQuery)
      );
    }

    if (teams.length === 0) {
      teamList.innerHTML = `
        <div class="empty-state">
          <span class="empty-state-icon">🔍</span>
          <div class="empty-state-text">No teams found. Try a different search or filter.</div>
        </div>
      `;
      return;
    }

    teamList.innerHTML = teams.map(team => `
      <div class="team-card" data-id="${team.id}">
        <div class="team-badge">${team.badge}</div>
        <div class="team-card-info">
          <div class="team-card-name">${team.name}</div>
          <div class="team-card-meta">
            <span>${team.ground}</span>
          </div>
        </div>
        <div class="team-card-league">${team.leagueShort}</div>
      </div>
    `).join('');

    // Bind click events
    teamList.querySelectorAll('.team-card').forEach(card => {
      card.addEventListener('click', () => {
        const team = TEAMS.find(t => t.id === card.dataset.id);
        if (team) showTeamDetail(team);
      });
    });
  }

  // ── Show Team Detail ──
  function showTeamDetail(team) {
    let html = '';

    // Header
    html += `
      <div class="team-header">
        <span class="team-header-badge">${team.badge}</span>
        <h1 class="team-header-name">${team.name}</h1>
        <div class="team-header-sub">${team.nickname} · Est. ${team.founded}</div>
        <span class="team-header-league">${team.league}</span>
      </div>
    `;

    // Quick Stats
    html += `
      <div class="info-section">
        <div class="info-section-title">Quick Facts</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${team.capacity}</div>
            <div class="stat-label">Capacity</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${team.avgAttendance}</div>
            <div class="stat-label">Avg Attendance</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${team.founded}</div>
            <div class="stat-label">Founded</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${team.leagueShort}</div>
            <div class="stat-label">League</div>
          </div>
        </div>
      </div>
    `;

    // Club Info
    html += `
      <div class="info-section">
        <div class="info-section-title">Club Info</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-row-label">Ground</span>
            <span class="info-row-value">${team.ground}</span>
          </div>
          <div class="info-row">
            <span class="info-row-label">Manager</span>
            <span class="info-row-value">${team.manager}</span>
          </div>
          <div class="info-row">
            <span class="info-row-label">Nickname</span>
            <span class="info-row-value">${team.nickname}</span>
          </div>
          <div class="info-row">
            <span class="info-row-label">Colours</span>
            <span class="info-row-value">${team.colours}</span>
          </div>
          <div class="info-row">
            <span class="info-row-label">Owner</span>
            <span class="info-row-value">${team.owner}</span>
          </div>
        </div>
      </div>
    `;

    // Key Players
    if (team.keyPlayers && team.keyPlayers.length > 0) {
      html += `
        <div class="info-section">
          <div class="info-section-title">Key Players</div>
          <div class="player-list">
            ${team.keyPlayers.map(p => `
              <div class="player-item">
                <div class="player-number">${p.number}</div>
                <div class="player-info">
                  <div class="player-name">${p.name}</div>
                  <div class="player-position">${p.position}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Club Legends
    if (team.legends && team.legends.length > 0) {
      html += `
        <div class="info-section">
          <div class="info-section-title">Club Legends</div>
          <div class="legend-list">
            ${team.legends.map(l => `
              <div class="legend-item">
                <div class="legend-icon">⭐</div>
                <div class="legend-info">
                  <div class="legend-name">${l.name}</div>
                  <div class="legend-detail">${l.detail}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Honours
    if (team.honours && team.honours.length > 0) {
      html += `
        <div class="info-section">
          <div class="info-section-title">Honours</div>
          <div class="honours-list">
            ${team.honours.map(h => `<span class="honour-tag">${h}</span>`).join('')}
          </div>
        </div>
      `;
    }

    // History
    if (team.history) {
      html += `
        <div class="info-section">
          <div class="info-section-title">History</div>
          <div class="history-text">${team.history}</div>
        </div>
      `;
    }

    teamDetail.innerHTML = html;
    showView('team');
    window.scrollTo(0, 0);
  }

  // ── Init ──
  renderTeamList();

})();
