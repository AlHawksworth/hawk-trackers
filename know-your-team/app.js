// ═══════════════════════════════════════════
// KnowYourTeam — Main Application
// Features: Browse, Search, Quiz, Compare, Favourites, Deep Linking
// ═══════════════════════════════════════════

(function () {
  'use strict';

  // ── State ──
  let currentLeague = 'all';
  let searchQuery = '';
  let browseScrollPos = 0;
  let quizState = { mode: null, score: 0, total: 0, answered: false };

  // ── DOM Refs ──
  const searchInput = document.getElementById('search-input');
  const teamList = document.getElementById('team-list');
  const filterBtn = document.getElementById('filter-btn');
  const filterLabel = document.getElementById('filter-label');
  const leagueFilter = document.getElementById('league-filter');
  const viewBrowse = document.getElementById('view-browse');
  const viewTeam = document.getElementById('view-team');
  const viewCompare = document.getElementById('view-compare');
  const viewQuiz = document.getElementById('view-quiz');
  const teamDetail = document.getElementById('team-detail');
  const backBtn = document.getElementById('back-btn');
  const compareBackBtn = document.getElementById('compare-back-btn');
  const quizBackBtn = document.getElementById('quiz-back-btn');
  const quizNavBtn = document.getElementById('quiz-nav-btn');
  const compareNavBtn = document.getElementById('compare-nav-btn');
  const randomBtn = document.getElementById('random-btn');
  const favFilterBtn = document.getElementById('fav-filter-btn');
  const compareTeamA = document.getElementById('compare-team-a');
  const compareTeamB = document.getElementById('compare-team-b');
  const compareResult = document.getElementById('compare-result');

  // ── Favourites ──
  function getFavourite() {
    return localStorage.getItem('kyt-favourite') || null;
  }

  function setFavourite(teamId) {
    localStorage.setItem('kyt-favourite', teamId);
  }

  function removeFavourite() {
    localStorage.removeItem('kyt-favourite');
  }

  // ── Navigation ──
  function showView(viewId) {
    // Save scroll position when leaving browse
    if (viewBrowse.classList.contains('active')) {
      browseScrollPos = window.scrollY;
    }
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');

    // Update URL hash
    if (viewId === 'browse') {
      history.replaceState(null, '', window.location.pathname);
    }
  }

  backBtn.addEventListener('click', () => {
    showView('browse');
    // Restore scroll position
    requestAnimationFrame(() => window.scrollTo(0, browseScrollPos));
    history.replaceState(null, '', window.location.pathname);
  });

  compareBackBtn.addEventListener('click', () => {
    showView('browse');
    requestAnimationFrame(() => window.scrollTo(0, browseScrollPos));
  });

  quizBackBtn.addEventListener('click', () => {
    showView('browse');
    requestAnimationFrame(() => window.scrollTo(0, browseScrollPos));
  });

  // ── Nav Buttons ──
  quizNavBtn.addEventListener('click', () => {
    showView('quiz');
    window.scrollTo(0, 0);
    location.hash = 'quiz';
  });

  compareNavBtn.addEventListener('click', () => {
    showView('compare');
    populateCompareSelects();
    window.scrollTo(0, 0);
    location.hash = 'compare';
  });

  // ── Random Team ──
  randomBtn.addEventListener('click', () => {
    const team = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    showTeamDetail(team);
  });

  // ── Favourite Filter ──
  favFilterBtn.addEventListener('click', () => {
    const favId = getFavourite();
    if (favId) {
      const team = TEAMS.find(t => t.id === favId);
      if (team) showTeamDetail(team);
    } else {
      alert('No favourite team set yet! Open a team and tap the ⭐ button to set one.');
    }
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

  // ── Search (expanded to include players and legends) ──
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderTeamList();
  });

  // Keyboard shortcut Ctrl+K to focus search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      showView('browse');
    }
  });

  // ── Render Team List ──
  function renderTeamList() {
    let teams = TEAMS;
    const favId = getFavourite();

    // Filter by league
    if (currentLeague !== 'all') {
      teams = teams.filter(t => t.league === currentLeague);
    }

    // Filter by search — now covers players and legends too
    if (searchQuery) {
      teams = teams.filter(t => {
        const basic = t.name.toLowerCase().includes(searchQuery) ||
          t.nickname.toLowerCase().includes(searchQuery) ||
          t.ground.toLowerCase().includes(searchQuery) ||
          t.manager.toLowerCase().includes(searchQuery);
        if (basic) return true;

        // Search key players
        if (t.keyPlayers && t.keyPlayers.some(p => p.name.toLowerCase().includes(searchQuery))) return true;

        // Search legends
        if (t.legends && t.legends.some(l => l.name.toLowerCase().includes(searchQuery))) return true;

        return false;
      });
    }

    // Sort favourites first
    if (favId) {
      teams = [...teams].sort((a, b) => {
        if (a.id === favId) return -1;
        if (b.id === favId) return 1;
        return 0;
      });
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
      <div class="team-card${team.id === favId ? ' is-favourite' : ''}" data-id="${team.id}" role="listitem" tabindex="0" aria-label="${team.name} - ${team.ground}">
        <div class="team-badge-wrap">
          <span class="team-badge-initials" style="background:${getBadgeColor(team)}">${getInitials(team.name)}</span>
        </div>
        <div class="team-card-info">
          <div class="team-card-name">${team.id === favId ? '⭐ ' : ''}${team.name}</div>
          <div class="team-card-meta">
            <span>${team.ground}</span>
          </div>
        </div>
        <div class="team-card-league">${team.leagueShort}</div>
      </div>
    `).join('');

    // Bind click + keyboard events
    teamList.querySelectorAll('.team-card').forEach(card => {
      const handler = () => {
        const team = TEAMS.find(t => t.id === card.dataset.id);
        if (team) showTeamDetail(team);
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
      });
    });
  }

  // ── Badge Helpers ──
  function getBadgeColor(team) {
    const colours = team.colours.toLowerCase();
    if (colours.includes('red') && colours.includes('white')) return '#c0392b';
    if (colours.includes('red') && colours.includes('black')) return '#922b21';
    if (colours.includes('red') && colours.includes('blue')) return '#8e44ad';
    if (colours.includes('red')) return '#e74c3c';
    if (colours.includes('sky blue')) return '#5dade2';
    if (colours.includes('royal blue')) return '#2e86c1';
    if (colours.includes('blue') && colours.includes('white')) return '#2980b9';
    if (colours.includes('blue')) return '#3498db';
    if (colours.includes('claret')) return '#6c3461';
    if (colours.includes('black') && colours.includes('white')) return '#2c3e50';
    if (colours.includes('gold') || colours.includes('amber')) return '#d4920b';
    if (colours.includes('orange')) return '#e67e22';
    if (colours.includes('white')) return '#566573';
    if (colours.includes('green')) return '#27ae60';
    if (colours.includes('yellow')) return '#f1c40f';
    return '#7f8c8d';
  }

  function getInitials(name) {
    // Remove common prefixes
    const clean = name.replace(/^AFC\s/i, '').replace(/^FC\s/i, '');
    const words = clean.split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  // ── Show Team Detail ──
  function showTeamDetail(team) {
    const favId = getFavourite();
    const isFav = team.id === favId;
    let html = '';

    // Header
    html += `
      <div class="team-header">
        <div class="team-header-badge-wrap">
          <span class="team-header-badge-initials" style="background:${getBadgeColor(team)}">${getInitials(team.name)}</span>
        </div>
        <h1 class="team-header-name">${team.name}</h1>
        <div class="team-header-sub">${team.nickname} · Est. ${team.founded}</div>
        <span class="team-header-league">${team.league}</span>
        <button class="fav-btn" id="fav-btn" aria-label="${isFav ? 'Remove from favourites' : 'Set as favourite team'}">${isFav ? '⭐ My Team' : '☆ Set as My Team'}</button>
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

    // Update hash for deep linking
    location.hash = 'team/' + team.id;

    // Favourite button handler
    document.getElementById('fav-btn').addEventListener('click', () => {
      const currentFav = getFavourite();
      if (currentFav === team.id) {
        removeFavourite();
      } else {
        setFavourite(team.id);
      }
      // Re-render detail to update button
      showTeamDetail(team);
      renderTeamList(); // Update list ordering
    });
  }

  // ═══════════════════════════════════════════
  // COMPARE FEATURE
  // ═══════════════════════════════════════════
  function populateCompareSelects() {
    const sorted = [...TEAMS].sort((a, b) => a.name.localeCompare(b.name));
    const options = sorted.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    compareTeamA.innerHTML = options;
    compareTeamB.innerHTML = options;
    // Default to two different teams
    if (sorted.length > 1) {
      compareTeamB.value = sorted[1].id;
    }
    renderCompare();
  }

  function renderCompare() {
    const teamA = TEAMS.find(t => t.id === compareTeamA.value);
    const teamB = TEAMS.find(t => t.id === compareTeamB.value);
    if (!teamA || !teamB) return;

    const rows = [
      ['Ground', teamA.ground, teamB.ground],
      ['Capacity', teamA.capacity, teamB.capacity],
      ['Avg Attendance', teamA.avgAttendance, teamB.avgAttendance],
      ['Founded', teamA.founded, teamB.founded],
      ['League', teamA.league, teamB.league],
      ['Manager', teamA.manager, teamB.manager],
      ['Colours', teamA.colours, teamB.colours],
      ['Nickname', teamA.nickname, teamB.nickname],
      ['Owner', teamA.owner, teamB.owner],
    ];

    compareResult.innerHTML = `
      <div class="compare-header">
        <div class="compare-team-header">
          <span class="compare-badge" style="background:${getBadgeColor(teamA)}">${getInitials(teamA.name)}</span>
          <span class="compare-team-name">${teamA.name}</span>
        </div>
        <div class="compare-team-header">
          <span class="compare-badge" style="background:${getBadgeColor(teamB)}">${getInitials(teamB.name)}</span>
          <span class="compare-team-name">${teamB.name}</span>
        </div>
      </div>
      <div class="compare-table">
        ${rows.map(([label, a, b]) => `
          <div class="compare-row">
            <div class="compare-cell compare-cell-a">${a}</div>
            <div class="compare-cell compare-cell-label">${label}</div>
            <div class="compare-cell compare-cell-b">${b}</div>
          </div>
        `).join('')}
      </div>
      <div class="compare-honours">
        <div class="compare-honours-col">
          <div class="info-section-title">Honours</div>
          ${(teamA.honours || []).map(h => `<span class="honour-tag">${h}</span>`).join('')}
        </div>
        <div class="compare-honours-col">
          <div class="info-section-title">Honours</div>
          ${(teamB.honours || []).map(h => `<span class="honour-tag">${h}</span>`).join('')}
        </div>
      </div>
    `;
  }

  compareTeamA.addEventListener('change', renderCompare);
  compareTeamB.addEventListener('change', renderCompare);

  // ═══════════════════════════════════════════
  // QUIZ FEATURE
  // ═══════════════════════════════════════════
  const quizArea = document.getElementById('quiz-area');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const quizFeedback = document.getElementById('quiz-feedback');
  const quizNextBtn = document.getElementById('quiz-next-btn');
  const quizScore = document.getElementById('quiz-score');

  document.querySelectorAll('.quiz-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      quizState = { mode: btn.dataset.mode, score: 0, total: 0, answered: false };
      quizArea.classList.remove('hidden');
      document.querySelector('.quiz-modes').classList.add('hidden');
      generateQuestion();
    });
  });

  quizNextBtn.addEventListener('click', () => {
    quizState.answered = false;
    generateQuestion();
  });

  function generateQuestion() {
    quizFeedback.textContent = '';
    quizFeedback.className = 'quiz-feedback';
    quizNextBtn.classList.add('hidden');
    quizOptions.innerHTML = '';

    // Pick a random team
    const team = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    // Pick 3 wrong answers
    const wrongTeams = TEAMS.filter(t => t.id !== team.id).sort(() => Math.random() - 0.5).slice(0, 3);

    let question = '';
    let correctAnswer = team.name;
    let answers = [];

    switch (quizState.mode) {
      case 'nickname':
        question = `Which team is nicknamed "${team.nickname}"?`;
        answers = [team, ...wrongTeams].map(t => t.name);
        break;
      case 'ground':
        question = `Who plays at ${team.ground}?`;
        answers = [team, ...wrongTeams].map(t => t.name);
        break;
      case 'player':
        if (team.keyPlayers && team.keyPlayers.length > 0) {
          const player = team.keyPlayers[Math.floor(Math.random() * team.keyPlayers.length)];
          question = `Which team does ${player.name} play for?`;
        } else {
          question = `Which team is nicknamed "${team.nickname}"?`;
        }
        answers = [team, ...wrongTeams].map(t => t.name);
        break;
      case 'legend':
        if (team.legends && team.legends.length > 0) {
          const legend = team.legends[Math.floor(Math.random() * team.legends.length)];
          question = `${legend.name} is a legend of which club?`;
        } else {
          question = `Which team is nicknamed "${team.nickname}"?`;
        }
        answers = [team, ...wrongTeams].map(t => t.name);
        break;
      case 'year':
        question = `When was ${team.name} founded?`;
        correctAnswer = String(team.founded);
        const years = [team.founded, ...wrongTeams.map(t => t.founded)];
        answers = [...new Set(years)].map(String);
        // Ensure 4 options
        while (answers.length < 4) {
          answers.push(String(team.founded + Math.floor(Math.random() * 20) - 10));
        }
        break;
    }

    // Shuffle answers
    answers = answers.sort(() => Math.random() - 0.5);

    quizQuestion.textContent = question;
    quizScore.textContent = `${quizState.score} / ${quizState.total}`;

    answers.forEach(ans => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = ans;
      btn.setAttribute('role', 'button');
      btn.addEventListener('click', () => {
        if (quizState.answered) return;
        quizState.answered = true;
        quizState.total++;

        if (ans === correctAnswer) {
          quizState.score++;
          btn.classList.add('correct');
          quizFeedback.textContent = '✅ Correct!';
          quizFeedback.classList.add('correct');
        } else {
          btn.classList.add('wrong');
          quizFeedback.textContent = `❌ Wrong! The answer is ${correctAnswer}`;
          quizFeedback.classList.add('wrong');
          // Highlight correct
          quizOptions.querySelectorAll('.quiz-option-btn').forEach(b => {
            if (b.textContent === correctAnswer) b.classList.add('correct');
          });
        }
        quizScore.textContent = `${quizState.score} / ${quizState.total}`;
        quizNextBtn.classList.remove('hidden');
      });
      quizOptions.appendChild(btn);
    });
  }

  // Reset quiz when going back
  quizBackBtn.addEventListener('click', () => {
    quizArea.classList.add('hidden');
    document.querySelector('.quiz-modes').classList.remove('hidden');
  });

  // ═══════════════════════════════════════════
  // DEEP LINKING (hash-based routing)
  // ═══════════════════════════════════════════
  function handleHash() {
    const hash = location.hash.slice(1); // remove #
    if (hash.startsWith('team/')) {
      const teamId = hash.replace('team/', '');
      const team = TEAMS.find(t => t.id === teamId);
      if (team) {
        showTeamDetail(team);
        return;
      }
    }
    if (hash === 'quiz') {
      showView('quiz');
      return;
    }
    if (hash === 'compare') {
      showView('compare');
      populateCompareSelects();
      return;
    }
    // Default: show browse
    showView('browse');
  }

  window.addEventListener('hashchange', handleHash);

  // ── Init ──
  renderTeamList();
  // Handle initial hash
  if (location.hash) {
    handleHash();
  }

})();
