// Hawk Football Travels — App Logic
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  // visits: array of visit objects loaded from the JSON files baked into the page
  // For the PoC, we embed the visit data directly via VISIT_DATA (set in visits-data.js or inline)
  let visits = [];

  // Combine all clubs
  const ALL_CLUBS = [
    ...ENGLISH_CLUBS.map(c => ({ ...c, displayRegion: c.region === 'wales' ? 'wales' : 'england' })),
    ...EUROPEAN_CLUBS.map(c => ({ ...c, tier: 99, league: c.country, displayRegion: 'europe' })),
  ];

  // ── Visit data — embedded JSON from /visits folder ─────────────────────────
  // Drop your visit JSON files into /visits/ and add them here.
  const EMBEDDED_VISITS = [
    {
      "visit_id": 1,
      "date": "2026-08-14",
      "home_team": "Coventry City",
      "away_team": "AS Monaco",
      "stadium_name": "Coventry Building Society Arena",
      "stand_seat": "East Stand, Block E19",
      "ticket_price_gbp": 20.00,
      "scores": {
        "stadium_character": 8,
        "clubhouse_concessions": 8,
        "welcome_vibe": 9,
        "travel_value": 8,
        "total_score": 33,
        "percentage": 82.5
      },
      "hawk_tip": "Hit Twisted Barrel Brewery in the city centre for solid vegan food first. Take a £7 Uber to Dhillons Brewery near the ground. Stay at Ibis Coventry Central for a budget overnight stop."
    }
  ];

  // ── Filters / sort state ───────────────────────────────────────────────────
  let currentRegion  = 'all';
  let currentTier    = 'all';
  let currentStatus  = 'all';
  let currentSort    = 'alpha';
  let searchQuery    = '';

  let reviewSearch   = '';
  let reviewSort     = 'date-desc';

  // ── Helpers ────────────────────────────────────────────────────────────────

  function scoreClass(pct) {
    if (pct >= 80) return 'score-great';
    if (pct >= 65) return 'score-good';
    if (pct >= 50) return 'score-ok';
    return 'score-poor';
  }

  function scoreVerdict(pct) {
    if (pct >= 80) return '🟢 Excellent';
    if (pct >= 65) return '🟡 Good';
    if (pct >= 50) return '🟠 Decent';
    return '🔴 Disappointing';
  }

  function tierLabel(tier) {
    const labels = { 1: 'PL', 2: 'Champ', 3: 'L1', 4: 'L2', 5: 'NL', 6: 'Step 6', 99: 'EUR' };
    return labels[tier] || '—';
  }

  function tierClass(tier) {
    if (tier === 99) return 'tier-eu';
    return `tier-${tier}`;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Find the visit for a given club (matches on home_team name or stadium_name)
  function findVisitForClub(club) {
    return visits.find(v =>
      v.home_team.toLowerCase().includes(club.name.toLowerCase()) ||
      club.name.toLowerCase().includes(v.home_team.toLowerCase()) ||
      v.stadium_name.toLowerCase() === club.stadium.toLowerCase()
    );
  }

  // Lookup club from visit
  function findClubForVisit(visit) {
    return ALL_CLUBS.find(c =>
      visit.home_team.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(visit.home_team.toLowerCase()) ||
      visit.stadium_name.toLowerCase() === c.stadium.toLowerCase()
    );
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    visits = EMBEDDED_VISITS;
    updateHeader();
    renderStadiums();
    renderReviews();
    renderDashboard();
    bindEvents();
  }

  // ── Header Stats ───────────────────────────────────────────────────────────
  function updateHeader() {
    const total = ALL_CLUBS.length;
    const visitedCount = visits.length;
    const pct = Math.round((visitedCount / total) * 100);

    document.getElementById('stat-visited').textContent = `${visitedCount} Visited`;
    document.getElementById('progress-bar').style.width = `${pct}%`;
    document.getElementById('progress-pct').textContent = `${pct}%`;

    if (visits.length > 0) {
      const avg = visits.reduce((sum, v) => sum + v.scores.percentage, 0) / visits.length;
      document.getElementById('stat-avg').textContent = `${avg.toFixed(1)}% Avg`;
    } else {
      document.getElementById('stat-avg').textContent = '— Avg %';
    }
  }

  // ── Stadium List ───────────────────────────────────────────────────────────
  function renderStadiums() {
    let clubs = [...ALL_CLUBS];

    // Region filter
    if (currentRegion !== 'all') {
      clubs = clubs.filter(c => c.displayRegion === currentRegion);
    }

    // Tier filter (only for non-EU)
    if (currentTier !== 'all') {
      const t = parseInt(currentTier, 10);
      clubs = clubs.filter(c => c.tier === t);
    }

    // Status filter
    if (currentStatus === 'visited') {
      clubs = clubs.filter(c => !!findVisitForClub(c));
    } else if (currentStatus === 'unvisited') {
      clubs = clubs.filter(c => !findVisitForClub(c));
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      clubs = clubs.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.stadium.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.league || '').toLowerCase().includes(q) ||
        (c.country || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (currentSort === 'alpha') {
      clubs.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'tier') {
      clubs.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
    } else if (currentSort === 'score') {
      clubs.sort((a, b) => {
        const va = findVisitForClub(a);
        const vb = findVisitForClub(b);
        const sa = va ? va.scores.percentage : -1;
        const sb = vb ? vb.scores.percentage : -1;
        return sb - sa;
      });
    }

    const container = document.getElementById('stadium-list');
    document.getElementById('result-count').textContent = `${clubs.length} stadiums`;

    if (clubs.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--muted);font-size:0.88rem;">
          No stadiums match your filters.
        </div>`;
      return;
    }

    container.innerHTML = clubs.map(club => {
      const visit = findVisitForClub(club);
      const tc = tierClass(club.tier);
      const hasReview = !!visit;
      const pct = visit ? visit.scores.percentage : null;
      const sc = pct !== null ? scoreClass(pct) : '';

      return `
        <div class="stadium-item ${tc} ${hasReview ? 'has-review' : ''}"
             data-id="${club.id}"
             role="button"
             tabindex="0"
             aria-label="${club.name} at ${club.stadium}${hasReview ? `, scored ${pct}%` : ', not yet visited'}">
          <span class="stadium-tier-badge" style="border-color:var(--tier-color);color:var(--tier-color);">
            ${tierLabel(club.tier)}
          </span>
          <div class="stadium-info">
            <div class="stadium-club">${club.name}</div>
            <div class="stadium-name">${club.stadium}</div>
            <div class="stadium-meta">${club.city} · ${club.league || club.country || ''}</div>
          </div>
          ${hasReview
            ? `<div class="stadium-score ${sc}">
                 <div class="score-pct" style="color:var(--score-color)">${pct}%</div>
                 <div class="score-label">${visit.scores.total_score}/40</div>
               </div>`
            : `<div class="stadium-score">
                 <div class="score-pct" style="color:var(--muted)">—</div>
                 <div class="score-label">not visited</div>
               </div>`
          }
        </div>`;
    }).join('');

    // Bind click events
    container.querySelectorAll('.stadium-item').forEach(el => {
      el.addEventListener('click', () => openModal(el.dataset.id));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(el.dataset.id); });
    });
  }

  // ── Reviews Page ───────────────────────────────────────────────────────────
  function renderReviews() {
    const container = document.getElementById('reviews-list');

    let reviewList = [...visits];

    if (reviewSearch) {
      const q = reviewSearch.toLowerCase();
      reviewList = reviewList.filter(v =>
        v.home_team.toLowerCase().includes(q) ||
        v.stadium_name.toLowerCase().includes(q) ||
        (v.away_team || '').toLowerCase().includes(q) ||
        (v.hawk_tip || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (reviewSort === 'date-desc') {
      reviewList.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (reviewSort === 'date-asc') {
      reviewList.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (reviewSort === 'score-desc') {
      reviewList.sort((a, b) => b.scores.percentage - a.scores.percentage);
    } else if (reviewSort === 'score-asc') {
      reviewList.sort((a, b) => a.scores.percentage - b.scores.percentage);
    }

    if (reviewList.length === 0) {
      container.innerHTML = `
        <div class="review-empty">
          <div class="review-empty-icon">⭐</div>
          <div class="review-empty-text">
            ${visits.length === 0
              ? 'No reviews yet. Drop your visit JSON files into the <code>visits/</code> folder to get started.'
              : 'No reviews match your search.'}
          </div>
        </div>`;
      return;
    }

    container.innerHTML = reviewList.map(v => buildReviewCard(v)).join('');

    container.querySelectorAll('.review-card').forEach(card => {
      card.addEventListener('click', () => {
        const club = findClubForVisit(visits.find(v => String(v.visit_id) === card.dataset.visitId));
        if (club) openModal(club.id);
      });
    });
  }

  function buildReviewCard(v) {
    const pct = v.scores.percentage;
    const sc = scoreClass(pct);

    const breakdown = SCORE_CATEGORIES.map(cat => {
      const val = v.scores[cat.key] || 0;
      const barPct = (val / cat.max) * 100;
      return `
        <div class="score-row">
          <span class="score-row-label">${cat.emoji} ${cat.label}</span>
          <div class="score-row-bar">
            <div class="score-row-fill" style="width:${barPct}%;background:var(--accent)"></div>
          </div>
          <span class="score-row-val">${val}/${cat.max}</span>
        </div>`;
    }).join('');

    return `
      <div class="review-card ${sc}" data-visit-id="${v.visit_id}" role="button" tabindex="0" aria-label="Review: ${v.home_team} vs ${v.away_team}">
        <div class="review-card-header">
          <div class="review-score-circle ${sc}" style="--score-color:var(--score-color)">
            <span class="review-score-pct" style="color:var(--score-color)">${pct}%</span>
            <span class="review-score-out">${v.scores.total_score}/40</span>
          </div>
          <div class="review-card-meta">
            <div class="review-card-club">${v.home_team}</div>
            <div class="review-card-stadium">🏟 ${v.stadium_name}</div>
            <div class="review-card-tags">
              <span class="review-tag date">📅 ${formatDate(v.date)}</span>
              ${v.away_team ? `<span class="review-tag matchup">vs ${v.away_team}</span>` : ''}
              ${v.ticket_price_gbp != null ? `<span class="review-tag ticket">🎟 £${v.ticket_price_gbp.toFixed(2)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="review-card-body">
          <div class="score-breakdown">${breakdown}</div>
          ${v.hawk_tip ? `
            <div class="hawk-tip">
              <div class="hawk-tip-label">🦅 Hawk Tip</div>
              ${escapeHtml(v.hawk_tip)}
            </div>` : ''}
        </div>
        ${v.stand_seat ? `
          <div class="review-card-footer">
            <span class="review-stand">💺 ${escapeHtml(v.stand_seat)}</span>
          </div>` : ''}
      </div>`;
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  function renderDashboard() {
    const grid = document.getElementById('dashboard-grid');

    const totalClubs = ALL_CLUBS.length;
    const visitedCount = visits.length;
    const pct = totalClubs > 0 ? ((visitedCount / totalClubs) * 100).toFixed(1) : 0;
    const avgScore = visitedCount > 0
      ? (visits.reduce((s, v) => s + v.scores.percentage, 0) / visitedCount).toFixed(1)
      : null;
    const topVisit = [...visits].sort((a, b) => b.scores.percentage - a.scores.percentage)[0];
    const lowestVisit = [...visits].sort((a, b) => a.scores.percentage - b.scores.percentage)[0];

    // Visits by tier
    const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 99: 0 };
    const tierTotals = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 99: 0 };
    ALL_CLUBS.forEach(c => { tierTotals[c.tier] = (tierTotals[c.tier] || 0) + 1; });
    visits.forEach(v => {
      const club = findClubForVisit(v);
      if (club) tierCounts[club.tier] = (tierCounts[club.tier] || 0) + 1;
    });

    const tierNames = {
      1: 'Premier League', 2: 'Championship', 3: 'League One',
      4: 'League Two', 5: 'Nat. League', 6: 'Step 6', 99: 'European'
    };

    const tierRows = [1, 2, 3, 4, 5, 6, 99].map(t => {
      const cnt = tierCounts[t] || 0;
      const tot = tierTotals[t] || 0;
      const w = tot > 0 ? (cnt / tot) * 100 : 0;
      return `
        <div class="dash-tier-row ${tierClass(t)}">
          <span class="dash-tier-label">${tierNames[t]}</span>
          <div class="dash-tier-bar">
            <div class="dash-tier-fill" style="width:${w}%;background:var(--tier-color)"></div>
          </div>
          <span class="dash-tier-count">${cnt} / ${tot}</span>
        </div>`;
    }).join('');

    // Top 5 reviews
    const top5 = [...visits]
      .sort((a, b) => b.scores.percentage - a.scores.percentage)
      .slice(0, 5);
    const top5Html = top5.length
      ? top5.map((v, i) => {
          const sc = scoreClass(v.scores.percentage);
          return `
            <div class="dash-top-item ${sc}">
              <span class="dash-top-rank">#${i + 1}</span>
              <span class="dash-top-name">${v.home_team}<span style="color:var(--muted);font-weight:400;font-size:0.7rem;"> · ${v.stadium_name}</span></span>
              <span class="dash-top-score" style="color:var(--score-color)">${v.scores.percentage}%</span>
            </div>`;
        }).join('')
      : '<div class="dash-empty">No reviews yet.</div>';

    grid.innerHTML = `
      <!-- Totals -->
      <div class="dash-card">
        <div class="dash-card-title">Overall Progress</div>
        <div class="dash-big">
          <div class="dash-big-number">${visitedCount}</div>
          <div class="dash-big-label">Stadiums visited of ${totalClubs}</div>
        </div>
        <div class="dash-stat-row">
          <span class="dash-stat-label">Coverage</span>
          <span class="dash-stat-value">${pct}%</span>
        </div>
        <div class="dash-stat-row">
          <span class="dash-stat-label">Average score</span>
          <span class="dash-stat-value">${avgScore ? avgScore + '%' : '—'}</span>
        </div>
        <div class="dash-stat-row">
          <span class="dash-stat-label">English clubs</span>
          <span class="dash-stat-value">${ENGLISH_CLUBS.length}</span>
        </div>
        <div class="dash-stat-row">
          <span class="dash-stat-label">European clubs</span>
          <span class="dash-stat-value">${EUROPEAN_CLUBS.length}</span>
        </div>
      </div>

      <!-- Best / Worst -->
      <div class="dash-card">
        <div class="dash-card-title">Highlights</div>
        ${topVisit ? `
          <div class="dash-stat-row">
            <span class="dash-stat-label">🏆 Best visit</span>
            <span class="dash-stat-value" style="color:var(--score-great)">${topVisit.home_team} · ${topVisit.scores.percentage}%</span>
          </div>` : '<div class="dash-empty">No visits yet.</div>'}
        ${lowestVisit && lowestVisit !== topVisit ? `
          <div class="dash-stat-row">
            <span class="dash-stat-label">📉 Lowest rated</span>
            <span class="dash-stat-value" style="color:var(--score-poor)">${lowestVisit.home_team} · ${lowestVisit.scores.percentage}%</span>
          </div>` : ''}
        ${visits.length > 0 ? `
          <div class="dash-stat-row">
            <span class="dash-stat-label">💰 Avg ticket price</span>
            <span class="dash-stat-value">£${(visits.reduce((s,v) => s + (v.ticket_price_gbp||0), 0) / visits.length).toFixed(2)}</span>
          </div>
          <div class="dash-stat-row">
            <span class="dash-stat-label">💷 Total spent</span>
            <span class="dash-stat-value">£${visits.reduce((s,v) => s + (v.ticket_price_gbp||0), 0).toFixed(2)}</span>
          </div>` : ''}
      </div>

      <!-- Tier breakdown -->
      <div class="dash-card dash-card-wide">
        <div class="dash-card-title">Visits by League Tier</div>
        <div class="dash-tier-list">${tierRows}</div>
      </div>

      <!-- Top 5 -->
      <div class="dash-card dash-card-wide">
        <div class="dash-card-title">⭐ Top Rated Stadiums</div>
        <div class="dash-top-list">${top5Html}</div>
      </div>
    `;
  }

  // ── Modal ──────────────────────────────────────────────────────────────────
  function openModal(clubId) {
    const club = ALL_CLUBS.find(c => c.id === clubId);
    if (!club) return;

    const visit = findVisitForClub(club);
    const modal = document.getElementById('review-modal');
    const body  = document.getElementById('modal-body');

    if (visit) {
      const pct = visit.scores.percentage;
      const sc  = scoreClass(pct);

      const breakdown = SCORE_CATEGORIES.map(cat => {
        const val = visit.scores[cat.key] || 0;
        const barPct = (val / cat.max) * 100;
        return `
          <div class="score-row">
            <span class="score-row-label">${cat.emoji} ${cat.label}</span>
            <div class="score-row-bar">
              <div class="score-row-fill" style="width:${barPct}%"></div>
            </div>
            <span class="score-row-val">${val}/${cat.max}</span>
          </div>`;
      }).join('');

      body.innerHTML = `
        <div class="modal-header" style="padding-top:8px;">
          <div class="modal-title">${club.name}</div>
          <div class="modal-subtitle">🏟 ${club.stadium} · ${club.city}</div>
        </div>

        <div class="modal-section">
          <div class="modal-section-label">Visit Summary</div>
          <div class="modal-score-hero">
            <div class="modal-score-big ${sc}" style="color:var(--score-color)">${pct}%</div>
            <div class="modal-score-info">
              <div class="modal-score-total">${visit.scores.total_score} / 40 total score</div>
              <div class="modal-score-verdict ${sc}" style="color:var(--score-color)">${scoreVerdict(pct)}</div>
            </div>
          </div>
          <div class="modal-matchup">
            <span class="modal-team">${visit.home_team}</span>
            <span class="modal-vs">vs</span>
            <span class="modal-team">${visit.away_team || '—'}</span>
            <span class="modal-date-pill">📅 ${formatDate(visit.date)}</span>
            ${visit.ticket_price_gbp != null ? `<span class="modal-ticket-pill">🎟 £${visit.ticket_price_gbp.toFixed(2)}</span>` : ''}
          </div>
          ${visit.stand_seat ? `<div class="modal-stand">💺 ${escapeHtml(visit.stand_seat)}</div>` : ''}
        </div>

        <div class="modal-section">
          <div class="modal-section-label">Score Breakdown</div>
          <div class="score-breakdown">${breakdown}</div>
        </div>

        ${visit.hawk_tip ? `
        <div class="modal-section">
          <div class="modal-section-label">🦅 Hawk Tip</div>
          <div class="modal-tip">${escapeHtml(visit.hawk_tip)}</div>
        </div>` : ''}
      `;
    } else {
      body.innerHTML = `
        <div class="modal-unvisited">
          <div class="modal-unvisited-icon">🏟</div>
          <div class="modal-unvisited-title">${club.name}</div>
          <div class="modal-subtitle" style="margin-bottom:12px;">🏟 ${club.stadium} · ${club.city}</div>
          <div class="review-tag" style="display:inline-block;margin-bottom:14px;">${club.league || club.country || ''} · ${tierLabel(club.tier)}</div>
          <div class="modal-unvisited-sub">
            You haven't visited this stadium yet.<br>
            Drop a visit JSON file into the <code>visits/</code> folder to add your rating.
          </div>
        </div>`;
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('review-modal').hidden = true;
    document.body.style.overflow = '';
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  function bindEvents() {
    // Page tabs
    document.querySelectorAll('.page-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.page-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.getElementById(`page-${tab.dataset.page}`).classList.add('active');
      });
    });

    // Region filter
    document.querySelectorAll('#region-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#region-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRegion = btn.dataset.region;
        // If europe selected, hide tier filter (doesn't apply)
        document.getElementById('tier-filter').style.display =
          currentRegion === 'europe' ? 'none' : '';
        renderStadiums();
      });
    });

    // Tier filter
    document.querySelectorAll('#tier-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#tier-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTier = btn.dataset.tier;
        renderStadiums();
      });
    });

    // Status filter
    document.querySelectorAll('#status-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#status-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStatus = btn.dataset.status;
        renderStadiums();
      });
    });

    // Sort filter
    document.querySelectorAll('#sort-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#sort-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSort = btn.dataset.sort;
        renderStadiums();
      });
    });

    // Stadium search
    document.getElementById('search').addEventListener('input', e => {
      searchQuery = e.target.value.trim();
      renderStadiums();
    });

    // Review search
    document.getElementById('review-search').addEventListener('input', e => {
      reviewSearch = e.target.value.trim();
      renderReviews();
    });

    // Review sort
    document.querySelectorAll('#review-sort .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#review-sort .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        reviewSort = btn.dataset.rsort;
        renderReviews();
      });
    });

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('review-modal').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ── Utility ────────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
