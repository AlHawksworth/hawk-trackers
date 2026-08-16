// Hawk Football Travels — App Logic
(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────
  const LS_VISITS     = 'hft-visits';
  const LS_BUCKET     = 'hft-bucket';
  const LS_PHOTOS     = 'hft-photos';
  const LS_ACHIEVEMENTS = 'hft-achievements';
  const LS_THEME      = 'hft-theme';
  const LS_PROFILE    = 'hft-profile';
  const LS_FRIENDS    = 'hft-friends';
  const LS_SETTINGS   = 'hft-settings';

  // ── State ──────────────────────────────────────────────────────────────────
  // Make sure ENGLISH_CLUBS is available before using it
  if (typeof ENGLISH_CLUBS === 'undefined') {
    console.error('❌ ENGLISH_CLUBS is not defined! Make sure data.js is loaded first.');
  }
  
  const ALL_CLUBS = (typeof ENGLISH_CLUBS !== 'undefined') 
    ? [...ENGLISH_CLUBS.map(c => ({ ...c, displayRegion: c.region === 'wales' ? 'wales' : 'england' }))]
    : [];

  // Seed data from the visits/ folder — add new entries here as you import more JSONs
  const SEED_VISITS = [
    {
      visit_id: 1,
      date: '2026-08-14',
      home_team: 'Coventry City',
      away_team: 'AS Monaco',
      stadium_name: 'Coventry Building Society Arena',
      stand_seat: 'East Stand, Block E19',
      ticket_price_gbp: 20.00,
      scores: {
        sightlines_view: 10,
        architecture_character: 6,
        cover_pitch: 7,
        happy_wife_happy_life: 7,
        inground_bars_concourses: 8,
        prematch_local_scene: 8,
        atmosphere_fan_noise: 8,
        club_welcome_hospitality: 5,
        travel_transit_logistics: 5,
        ticket_admission_value: 8,
        total_score: 72,
        percentage: 72.0
      },
      hawk_tip: 'Hit Twisted Barrel Brewery in the city centre for solid vegan food first. Take a £7 Uber to Dhillons Brewery near the ground. Stay at Ibis Coventry Central for a budget overnight stop.'
    }
  ];

  // Merge seed + any locally-imported visits (keyed by visit_id)
  function loadVisits() {
    const stored = JSON.parse(localStorage.getItem(LS_VISITS) || '[]');
    const merged = [...SEED_VISITS];
    const existingIds = new Set(merged.map(v => v.visit_id));
    stored.forEach(v => { if (!existingIds.has(v.visit_id)) merged.push(v); });
    return merged;
  }

  let visits = loadVisits();
  let bucketList = new Set(JSON.parse(localStorage.getItem(LS_BUCKET) || '[]'));
  let photos = JSON.parse(localStorage.getItem(LS_PHOTOS) || '{}');
  let achievements = JSON.parse(localStorage.getItem(LS_ACHIEVEMENTS) || '[]');
  let userProfile = JSON.parse(localStorage.getItem(LS_PROFILE) || '{"name": "Football Fan", "joinDate": "' + new Date().toISOString().split('T')[0] + '"}');
  let settings = JSON.parse(localStorage.getItem(LS_SETTINGS) || '{"theme": "dark", "notifications": true, "location": null}');
  let userLocation = null;

  // Filter/sort state
  let currentRegion  = 'all';
  let currentTier    = 'all';
  let currentStatus  = 'all';
  let currentSort    = 'alpha';
  let searchQuery    = '';
  let reviewSearch   = '';
  let reviewSort     = 'date-desc';
  let currentPage    = 'stadiums';
  let currentSocialTab = 'achievements';

  // Modal navigation state
  let modalClubIds   = [];   // ordered list of club ids for current viewed context
  let modalIndex     = 0;

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

  // Individual score colour (10-point scale)
  function barColor(val, max) {
    const pct = (val / max) * 100;
    if (pct >= 80) return 'var(--score-great)';
    if (pct >= 65) return 'var(--score-good)';
    if (pct >= 50) return 'var(--score-ok)';
    return 'var(--score-poor)';
  }

  function tierLabel(tier) {
    return { 1: 'PL', 2: 'Champ', 3: 'L1', 4: 'L2', 5: 'NL', 6: 'Step 6' }[tier] || '—';
  }

  function tierClass(tier) {
    return `tier-${tier}`;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast toast-${type} show`;
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), 2800);
  }

  // Calculate distance between two coordinates (Haversine formula)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Get user's location
  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          userLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          settings.location = userLocation;
          saveSettings();
        },
        error => console.log('Location access denied')
      );
    }
  }

  // Calculate streak of visits
  function calculateStreak() {
    if (visits.length === 0) return 0;
    
    const sortedVisits = visits
      .map(v => new Date(v.date))
      .sort((a, b) => b - a);
    
    let streak = 1;
    let currentDate = sortedVisits[0];
    
    for (let i = 1; i < sortedVisits.length; i++) {
      const diffDays = Math.floor((currentDate - sortedVisits[i]) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) { // Within a month
        streak++;
        currentDate = sortedVisits[i];
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Theme management
  function initTheme() {
    const theme = localStorage.getItem(LS_THEME) || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(LS_THEME, newTheme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    }
    settings.theme = newTheme;
    saveSettings();
  }

  // Save functions
  function saveSettings() {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  }

  function savePhotos() {
    localStorage.setItem(LS_PHOTOS, JSON.stringify(photos));
  }

  function saveAchievements() {
    localStorage.setItem(LS_ACHIEVEMENTS, JSON.stringify(achievements));
  }

  function saveProfile() {
    localStorage.setItem(LS_PROFILE, JSON.stringify(userProfile));
  }

  function findVisitForClub(club) {
    return visits.find(v =>
      v.home_team.toLowerCase().includes(club.name.toLowerCase()) ||
      club.name.toLowerCase().includes(v.home_team.toLowerCase()) ||
      v.stadium_name.toLowerCase() === club.stadium.toLowerCase()
    );
  }

  function findClubForVisit(visit) {
    return ALL_CLUBS.find(c =>
      visit.home_team.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(visit.home_team.toLowerCase()) ||
      visit.stadium_name.toLowerCase() === c.stadium.toLowerCase()
    );
  }

  function saveBucket() {
    localStorage.setItem(LS_BUCKET, JSON.stringify([...bucketList]));
  }

  function saveImportedVisit(v) {
    const stored = JSON.parse(localStorage.getItem(LS_VISITS) || '[]');
    const existingIds = new Set(stored.map(x => x.visit_id));
    if (!existingIds.has(v.visit_id)) stored.push(v);
    localStorage.setItem(LS_VISITS, JSON.stringify(stored));
  }

  // ── Radar / Spider Chart (SVG) ─────────────────────────────────────────────
  function buildRadar(scores, size = 100) {
    if (typeof SCORE_CATEGORIES === 'undefined') {
      console.error('❌ SCORE_CATEGORIES is not defined!');
      return '<div>Error: Score categories not loaded</div>';
    }
    
    const cats = SCORE_CATEGORIES;
    const cx = size / 2, cy = size / 2, r = size * 0.38;
    const n = cats.length;
    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2;

    // Background rings
    const rings = [0.25, 0.5, 0.75, 1].map(frac => {
      const pts = cats.map((_, i) => {
        const a = startAngle + i * angleStep;
        const rx = cx + r * frac * Math.cos(a);
        const ry = cy + r * frac * Math.sin(a);
        return `${rx.toFixed(1)},${ry.toFixed(1)}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>`;
    }).join('');

    // Spokes
    const spokes = cats.map((_, i) => {
      const a = startAngle + i * angleStep;
      const x2 = (cx + r * Math.cos(a)).toFixed(1);
      const y2 = (cy + r * Math.sin(a)).toFixed(1);
      return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>`;
    }).join('');

    // Data polygon
    const dataPoints = cats.map((cat, i) => {
      const val = scores[cat.key] || 0;
      const frac = val / cat.max;
      const a = startAngle + i * angleStep;
      const x = cx + r * frac * Math.cos(a);
      const y = cy + r * frac * Math.sin(a);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    // Dots
    const dots = cats.map((cat, i) => {
      const val = scores[cat.key] || 0;
      const frac = val / cat.max;
      const a = startAngle + i * angleStep;
      const x = (cx + r * frac * Math.cos(a)).toFixed(1);
      const y = (cy + r * frac * Math.sin(a)).toFixed(1);
      return `<circle cx="${x}" cy="${y}" r="2.5" fill="var(--accent)" opacity="0.9"/>`;
    }).join('');

    // Labels
    const labels = cats.map((cat, i) => {
      const a = startAngle + i * angleStep;
      const labelR = r * 1.28;
      const lx = (cx + labelR * Math.cos(a)).toFixed(1);
      const ly = (cy + labelR * Math.sin(a)).toFixed(1);
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="7" fill="rgba(255,255,255,0.5)">${cat.emoji}</text>`;
    }).join('');

    return `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="radar-svg" aria-hidden="true">
        ${rings}${spokes}
        <polygon points="${dataPoints}" fill="rgba(45,158,107,0.25)" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/>
        ${dots}${labels}
      </svg>`;
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    console.log('🚀 HFT App Initializing...');
    console.log('📊 ENGLISH_CLUBS length:', ENGLISH_CLUBS.length);
    console.log('📊 ALL_CLUBS length:', ALL_CLUBS.length);
    console.log('🔧 Score categories:', SCORE_CATEGORIES.length);
    
    try {
      initTheme();
      console.log('✅ Theme initialized');
      
      getUserLocation();
      console.log('✅ Location service started');
      
      updateHeader();
      console.log('✅ Header updated');
      
      renderStadiums();
      console.log('✅ Stadiums rendered');
      
      renderReviews();
      console.log('✅ Reviews rendered');
      
      renderDashboard();
      console.log('✅ Dashboard rendered');
      
      renderSocial();
      console.log('✅ Social rendered');
      
      bindEvents();
      console.log('✅ Events bound');
      
      checkAchievements();
      console.log('✅ Achievements checked');
      
      console.log('🎉 HFT App Initialization Complete!');
      
    } catch(error) {
      console.error('❌ HFT App Initialization Failed:', error);
    }
  }

  // ── Header Stats ───────────────────────────────────────────────────────────
  function updateHeader() {
    const total = ALL_CLUBS.length;
    const visitedCount = visits.length;
    const pct = Math.round((visitedCount / total) * 100);
    const streak = calculateStreak();
    
    document.getElementById('stat-visited').textContent = `${visitedCount} Visited`;
    document.getElementById('stat-streak').textContent = `${streak} Streak`;
    document.getElementById('progress-bar').style.width = `${pct}%`;
    document.getElementById('progress-pct').textContent = `${pct}%`;
    
    if (visits.length > 0) {
      const avg = visits.reduce((s, v) => s + v.scores.percentage, 0) / visits.length;
      document.getElementById('stat-avg').textContent = `${avg.toFixed(1)}% Avg`;
    } else {
      document.getElementById('stat-avg').textContent = '— Avg %';
    }
  }

  // ── Stadium List ───────────────────────────────────────────────────────────
  function getFilteredClubs() {
    let clubs = [...ALL_CLUBS];
    
    // Region filter
    if (currentRegion !== 'all') {
      clubs = clubs.filter(c => c.displayRegion === currentRegion);
    }
    
    // Tier filter
    if (currentTier !== 'all') {
      clubs = clubs.filter(c => c.tier === parseInt(currentTier, 10));
    }
    
    // Status filter
    if (currentStatus === 'visited') {
      clubs = clubs.filter(c => !!findVisitForClub(c));
    } else if (currentStatus === 'unvisited') {
      clubs = clubs.filter(c => !findVisitForClub(c));
    } else if (currentStatus === 'bucket') {
      clubs = clubs.filter(c => bucketList.has(c.id) && !findVisitForClub(c));
    } else if (currentStatus === 'nearby' && userLocation) {
      clubs = clubs.filter(c => {
        if (!c.coordinates) return false;
        const distance = calculateDistance(
          userLocation.lat, userLocation.lon,
          c.coordinates.lat, c.coordinates.lon
        );
        return distance <= 50; // Within 50 miles
      });
    }
    
    // Search filter
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
    
    // Sorting
    if (currentSort === 'alpha') {
      clubs.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'tier') {
      clubs.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
    } else if (currentSort === 'score') {
      clubs.sort((a, b) => {
        const sa = (findVisitForClub(a) || {}).scores?.percentage ?? -1;
        const sb = (findVisitForClub(b) || {}).scores?.percentage ?? -1;
        return sb - sa;
      });
    } else if (currentSort === 'distance' && userLocation) {
      clubs.sort((a, b) => {
        if (!a.coordinates || !b.coordinates) return 0;
        const distA = calculateDistance(userLocation.lat, userLocation.lon, a.coordinates.lat, a.coordinates.lon);
        const distB = calculateDistance(userLocation.lat, userLocation.lon, b.coordinates.lat, b.coordinates.lon);
        return distA - distB;
      });
    } else if (currentSort === 'price') {
      clubs.sort((a, b) => {
        const visitA = findVisitForClub(a);
        const visitB = findVisitForClub(b);
        const priceA = visitA?.ticket_price_gbp ?? 999;
        const priceB = visitB?.ticket_price_gbp ?? 999;
        return priceA - priceB;
      });
    }
    
    return clubs;
  }

  function renderStadiums() {
    console.log('🏟️ Rendering stadiums...');
    const clubs = getFilteredClubs();
    console.log('📊 Filtered clubs:', clubs.length);
    
    const container = document.getElementById('stadium-list');
    if (!container) {
      console.error('❌ Stadium list container not found!');
      return;
    }
    
    const resultCount = document.getElementById('result-count');
    if (resultCount) {
      resultCount.textContent = `${clubs.length} stadium${clubs.length !== 1 ? 's' : ''}`;
    }

    // Store ordered IDs for modal navigation
    modalClubIds = clubs.map(c => c.id);

    if (clubs.length === 0) {
      container.innerHTML = `<div class="list-empty">No stadiums match your filters.</div>`;
      return;
    }

    container.innerHTML = clubs.map(club => {
      const visit = findVisitForClub(club);
      const tc = tierClass(club.tier);
      const hasReview = !!visit;
      const pct = visit ? visit.scores.percentage : null;
      const sc = pct !== null ? scoreClass(pct) : '';
      const inBucket = bucketList.has(club.id);

      return `
        <div class="stadium-item ${tc} ${hasReview ? 'has-review' : ''}"
             data-id="${club.id}"
             role="button"
             tabindex="0"
             aria-label="${club.name} at ${club.stadium}${hasReview ? `, scored ${pct}%` : ', not yet visited'}">
          <span class="stadium-tier-badge">${tierLabel(club.tier)}</span>
          <div class="stadium-info">
            <div class="stadium-club">${club.name}</div>
            <div class="stadium-name">${club.stadium}</div>
            <div class="stadium-meta">${club.city}${club.league ? ' · ' + club.league : ''}${club.country ? ' · ' + club.country : ''}</div>
          </div>
          <div class="stadium-actions">
            ${hasReview
              ? `<div class="stadium-score ${sc}">
                   <div class="score-pct">${pct}%</div>
                   <div class="score-label">${visit.scores.total_score}/100</div>
                 </div>`
              : `<button class="bucket-btn ${inBucket ? 'active' : ''}"
                         data-id="${club.id}"
                         title="${inBucket ? 'Remove from bucket list' : 'Add to bucket list'}"
                         aria-label="${inBucket ? 'Remove from bucket list' : 'Add to bucket list'}"
                         aria-pressed="${inBucket}">
                   ${inBucket ? '🎯' : '＋'}
                 </button>`
            }
          </div>
        </div>`;
    }).join('');

    container.querySelectorAll('.stadium-item').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.closest('.bucket-btn')) return; // handled separately
        const idx = modalClubIds.indexOf(el.dataset.id);
        openModal(el.dataset.id, idx);
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          const idx = modalClubIds.indexOf(el.dataset.id);
          openModal(el.dataset.id, idx);
        }
      });
    });

    container.querySelectorAll('.bucket-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        toggleBucket(btn.dataset.id);
        renderStadiums();
      });
    });
  }

  function toggleBucket(clubId) {
    if (bucketList.has(clubId)) {
      bucketList.delete(clubId);
      showToast('Removed from bucket list', 'info');
    } else {
      bucketList.add(clubId);
      showToast('Added to bucket list 🎯', 'success');
    }
    saveBucket();
  }

  // ── Reviews Page ───────────────────────────────────────────────────────────
  function renderReviews() {
    const container = document.getElementById('reviews-list');
    let list = [...visits];
    if (reviewSearch) {
      const q = reviewSearch.toLowerCase();
      list = list.filter(v =>
        v.home_team.toLowerCase().includes(q) ||
        v.stadium_name.toLowerCase().includes(q) ||
        (v.away_team || '').toLowerCase().includes(q) ||
        (v.hawk_tip || '').toLowerCase().includes(q)
      );
    }
    if (reviewSort === 'date-desc')   list.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (reviewSort === 'date-asc')    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (reviewSort === 'score-desc')  list.sort((a, b) => b.scores.percentage - a.scores.percentage);
    else if (reviewSort === 'score-asc')   list.sort((a, b) => a.scores.percentage - b.scores.percentage);

    if (list.length === 0) {
      container.innerHTML = `
        <div class="review-empty">
          <div class="review-empty-icon">⭐</div>
          <div class="review-empty-text">
            ${visits.length === 0
              ? 'No reviews yet. Use the 📥 Import button on the Stadiums tab to load a visit JSON file.'
              : 'No reviews match your search.'}
          </div>
        </div>`;
      return;
    }

    container.innerHTML = list.map(v => buildReviewCard(v)).join('');

    container.querySelectorAll('.review-card').forEach(card => {
      card.addEventListener('click', () => {
        const v = visits.find(x => String(x.visit_id) === card.dataset.visitId);
        if (!v) return;
        const club = findClubForVisit(v);
        if (club) {
          const idx = modalClubIds.indexOf(club.id);
          openModal(club.id, idx >= 0 ? idx : 0);
        }
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') card.click();
      });
    });
  }

  function buildReviewCard(v) {
    const pct = v.scores.percentage;
    const sc = scoreClass(pct);

    const breakdown = SCORE_CATEGORIES.map(cat => {
      const val = v.scores[cat.key] || 0;
      const barPct = (val / cat.max) * 100;
      const color = barColor(val, cat.max);
      return `
        <div class="score-row">
          <span class="score-row-label">${cat.emoji} ${cat.label}</span>
          <div class="score-row-bar">
            <div class="score-row-fill" style="width:${barPct}%;background:${color}"></div>
          </div>
          <span class="score-row-val" style="color:${color}">${val}/${cat.max}</span>
        </div>`;
    }).join('');

    const radar = buildRadar(v.scores, 96);

    return `
      <div class="review-card ${sc}" data-visit-id="${v.visit_id}" role="button" tabindex="0" aria-label="Review: ${v.home_team} vs ${v.away_team || ''}">
        <div class="review-card-header">
          <div class="review-score-circle ${sc}">
            <span class="review-score-pct">${pct}%</span>
            <span class="review-score-out">${v.scores.total_score}/100</span>
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
          <div class="review-radar">${radar}</div>
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

    const sorted = [...visits].sort((a, b) => b.scores.percentage - a.scores.percentage);
    const topVisit    = sorted[0];
    const lowestVisit = sorted[sorted.length - 1];

    // Tier breakdown
    const tierTotals = {};
    const tierCounts = {};
    ALL_CLUBS.forEach(c => { tierTotals[c.tier] = (tierTotals[c.tier] || 0) + 1; });
    visits.forEach(v => {
      const club = findClubForVisit(v);
      if (club) tierCounts[club.tier] = (tierCounts[club.tier] || 0) + 1;
    });
    const tierNames = { 1:'Premier League', 2:'Championship', 3:'League One', 4:'League Two', 5:'Nat. League', 6:'Step 6' };
    const tierRows = [1,2,3,4,5,6].map(t => {
      const cnt = tierCounts[t] || 0;
      const tot = tierTotals[t] || 0;
      const w = tot > 0 ? (cnt / tot) * 100 : 0;
      return `
        <div class="dash-tier-row ${tierClass(t)}">
          <span class="dash-tier-label">${tierNames[t]}</span>
          <div class="dash-tier-bar"><div class="dash-tier-fill" style="width:${w}%;background:var(--tier-color)"></div></div>
          <span class="dash-tier-count">${cnt} / ${tot}</span>
        </div>`;
    }).join('');

    // Top 5
    const top5 = sorted.slice(0, 5);
    const top5Html = top5.length
      ? top5.map((v, i) => {
          const sc = scoreClass(v.scores.percentage);
          return `
            <div class="dash-top-item ${sc}">
              <span class="dash-top-rank">#${i + 1}</span>
              <span class="dash-top-name">${v.home_team}<span class="dash-top-sub"> · ${v.stadium_name}</span></span>
              <span class="dash-top-score">${v.scores.percentage}%</span>
            </div>`;
        }).join('')
      : '<div class="dash-empty">No reviews yet.</div>';

    // Category averages radar (if any visits)
    let avgRadarHtml = '';
    if (visits.length > 0) {
      const avgScores = {};
      SCORE_CATEGORIES.forEach(cat => {
        avgScores[cat.key] = visits.reduce((s, v) => s + (v.scores[cat.key] || 0), 0) / visits.length;
      });
      avgRadarHtml = `
        <div class="dash-card">
          <div class="dash-card-title">Avg Score Radar</div>
          <div class="dash-radar-wrap">
            ${buildRadar(avgScores, 140)}
            <div class="dash-radar-legend">
              ${SCORE_CATEGORIES.map(cat => {
                const avg = avgScores[cat.key].toFixed(1);
                const color = barColor(avgScores[cat.key], cat.max);
                return `<div class="dash-radar-item">
                  <span class="dash-radar-emoji">${cat.emoji}</span>
                  <span class="dash-radar-label">${cat.label}</span>
                  <span class="dash-radar-val" style="color:${color}">${avg}/10</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>`;
    }

    // Bucket list suggestions
    const bucketClubs = ALL_CLUBS.filter(c => bucketList.has(c.id) && !findVisitForClub(c));
    const bucketHtml = bucketClubs.length
      ? bucketClubs.slice(0, 8).map(c => `
          <div class="dash-bucket-item ${tierClass(c.tier)}">
            <span class="dash-bucket-badge">${tierLabel(c.tier)}</span>
            <span class="dash-bucket-name">${c.name}</span>
            <span class="dash-bucket-city">${c.city}</span>
          </div>`).join('')
      : '<div class="dash-empty">No bucket list items yet. Hit ＋ on any unvisited stadium.</div>';

    grid.innerHTML = `
      <div class="dash-card">
        <div class="dash-card-title">Overall Progress</div>
        <div class="dash-big">
          <div class="dash-big-number">${visitedCount}</div>
          <div class="dash-big-label">Stadiums visited of ${totalClubs}</div>
        </div>
        <div class="dash-stat-row"><span class="dash-stat-label">Coverage</span><span class="dash-stat-value">${pct}%</span></div>
        <div class="dash-stat-row"><span class="dash-stat-label">Average score</span><span class="dash-stat-value">${avgScore ? avgScore + '%' : '—'}</span></div>
        <div class="dash-stat-row"><span class="dash-stat-label">English clubs</span><span class="dash-stat-value">${ENGLISH_CLUBS.length}</span></div>
        <div class="dash-stat-row"><span class="dash-stat-label">🎯 Bucket list</span><span class="dash-stat-value">${bucketList.size}</span></div>
      </div>

      <div class="dash-card">
        <div class="dash-card-title">Highlights</div>
        ${topVisit ? `
          <div class="dash-stat-row"><span class="dash-stat-label">🏆 Best</span><span class="dash-stat-value score-great-text">${topVisit.home_team} · ${topVisit.scores.percentage}%</span></div>
          <div class="dash-stat-row"><span class="dash-stat-label">📉 Lowest</span><span class="dash-stat-value score-poor-text">${lowestVisit.home_team} · ${lowestVisit.scores.percentage}%</span></div>
          <div class="dash-stat-row"><span class="dash-stat-label">💰 Avg ticket</span><span class="dash-stat-value">£${(visits.reduce((s,v) => s + (v.ticket_price_gbp||0), 0) / visits.length).toFixed(2)}</span></div>
          <div class="dash-stat-row"><span class="dash-stat-label">💷 Total spent</span><span class="dash-stat-value">£${visits.reduce((s,v) => s + (v.ticket_price_gbp||0), 0).toFixed(2)}</span></div>
        ` : '<div class="dash-empty">No visits yet.</div>'}
      </div>

      ${avgRadarHtml}

      <div class="dash-card dash-card-wide">
        <div class="dash-card-title">Visits by League Tier</div>
        <div class="dash-tier-list">${tierRows}</div>
      </div>

      <div class="dash-card dash-card-wide">
        <div class="dash-card-title">⭐ Top Rated Stadiums</div>
        <div class="dash-top-list">${top5Html}</div>
      </div>

      <div class="dash-card dash-card-wide">
        <div class="dash-card-title">🎯 Bucket List</div>
        <div class="dash-bucket-list">${bucketHtml}</div>
      </div>
    `;
  }

  // ── Modal ──────────────────────────────────────────────────────────────────
  function openModal(clubId, listIndex) {
    const club = ALL_CLUBS.find(c => c.id === clubId);
    if (!club) return;

    modalIndex = typeof listIndex === 'number' ? listIndex : modalClubIds.indexOf(clubId);
    renderModalContent(club);

    document.getElementById('review-modal').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function renderModalContent(club) {
    const visit = findVisitForClub(club);
    const body  = document.getElementById('modal-body');
    const counter = document.getElementById('modal-nav-counter');
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');

    // Nav counter
    if (modalClubIds.length > 1) {
      counter.textContent = `${modalIndex + 1} / ${modalClubIds.length}`;
      prevBtn.disabled = modalIndex <= 0;
      nextBtn.disabled = modalIndex >= modalClubIds.length - 1;
      prevBtn.style.visibility = '';
      nextBtn.style.visibility = '';
    } else {
      counter.textContent = '';
      prevBtn.style.visibility = 'hidden';
      nextBtn.style.visibility = 'hidden';
    }

    if (visit) {
      const pct = visit.scores.percentage;
      const sc  = scoreClass(pct);

      const breakdown = SCORE_CATEGORIES.map(cat => {
        const val = visit.scores[cat.key] || 0;
        const barPct = (val / cat.max) * 100;
        const color = barColor(val, cat.max);
        return `
          <div class="score-row">
            <span class="score-row-label">${cat.emoji} ${cat.label}</span>
            <div class="score-row-bar">
              <div class="score-row-fill" style="width:${barPct}%;background:${color}"></div>
            </div>
            <span class="score-row-val" style="color:${color}">${val}/${cat.max}</span>
          </div>`;
      }).join('');

      const radar = buildRadar(visit.scores, 120);

      body.innerHTML = `
        <div class="modal-header">
          <div class="modal-title" id="modal-title">${club.name}</div>
          <div class="modal-subtitle">🏟 ${club.stadium} · ${club.city}</div>
        </div>
        <div class="modal-section">
          <div class="modal-section-label">Visit Summary</div>
          <div class="modal-score-hero">
            <div class="modal-score-big ${sc}">${pct}%</div>
            <div class="modal-score-info">
              <div class="modal-score-total">${visit.scores.total_score} / 100</div>
              <div class="modal-score-verdict ${sc}">${scoreVerdict(pct)}</div>
            </div>
            <div class="modal-radar">${radar}</div>
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
      const inBucket = bucketList.has(club.id);
      body.innerHTML = `
        <div class="modal-unvisited">
          <div class="modal-unvisited-icon">🏟</div>
          <div class="modal-unvisited-title" id="modal-title">${club.name}</div>
          <div class="modal-subtitle">${club.stadium} · ${club.city}</div>
          <div style="margin:10px 0;">
            <span class="review-tag" style="display:inline-block;">${club.league || club.country || ''} · ${tierLabel(club.tier)}</span>
          </div>
          <button class="bucket-toggle-btn ${inBucket ? 'active' : ''}" data-id="${club.id}">
            ${inBucket ? '🎯 On Bucket List' : '＋ Add to Bucket List'}
          </button>
          <div class="modal-unvisited-sub">
            Drop a visit JSON into the <code>visits/</code> folder or use the Import button to add your rating.
          </div>
        </div>`;

      body.querySelector('.bucket-toggle-btn').addEventListener('click', e => {
        toggleBucket(club.id);
        renderModalContent(club);
        renderStadiums();
        renderDashboard();
      });
    }
  }

  function closeModal() {
    document.getElementById('review-modal').hidden = true;
    document.body.style.overflow = '';
  }

  function navigateModal(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex < 0 || newIndex >= modalClubIds.length) return;
    modalIndex = newIndex;
    const club = ALL_CLUBS.find(c => c.id === modalClubIds[modalIndex]);
    if (club) renderModalContent(club);
  }

  // ── Social & Achievements ──────────────────────────────────────────────────
  const ACHIEVEMENTS = [
    { id: 'first-visit', name: 'First Step', description: 'Visit your first stadium', emoji: '🏟️', condition: () => visits.length >= 1 },
    { id: 'five-visits', name: 'Getting Started', description: 'Visit 5 different stadiums', emoji: '⭐', condition: () => visits.length >= 5 },
    { id: 'ten-visits', name: 'Regular', description: 'Visit 10 different stadiums', emoji: '🔥', condition: () => visits.length >= 10 },
    { id: 'london-complete', name: 'London Explorer', description: 'Visit 5 London stadiums', emoji: '🏙️', condition: () => visits.filter(v => findClubForVisit(v)?.city === 'London').length >= 5 },
    { id: 'perfect-score', name: 'Perfectionist', description: 'Give a stadium 100% rating', emoji: '💯', condition: () => visits.some(v => v.scores.percentage === 100) },
    { id: 'all-tiers', name: 'Tier Traveller', description: 'Visit stadiums from 4 different tiers', emoji: '🎯', condition: () => {
      const tiers = new Set(visits.map(v => findClubForVisit(v)?.tier).filter(t => t));
      return tiers.size >= 4;
    }},
    { id: 'month-streak', name: 'Monthly Visitor', description: 'Visit 3 stadiums in one month', emoji: '📅', condition: () => calculateStreak() >= 3 },
    { id: 'big-spender', name: 'Big Spender', description: 'Spend £100+ on tickets', emoji: '💰', condition: () => visits.reduce((sum, v) => sum + (v.ticket_price_gbp || 0), 0) >= 100 },
    { id: 'traveller', name: 'Distance Traveller', description: 'Visit stadiums in 3+ different regions', emoji: '🚗', condition: () => {
      const regions = new Set(visits.map(v => findClubForVisit(v)?.region).filter(r => r));
      return regions.size >= 3;
    }},
    { id: 'reviewer', name: 'Detailed Reviewer', description: 'Write 5 detailed reviews with hawk tips', emoji: '✍️', condition: () => visits.filter(v => v.hawk_tip && v.hawk_tip.length > 50).length >= 5 }
  ];

  function checkAchievements() {
    let newAchievements = 0;
    
    ACHIEVEMENTS.forEach(achievement => {
      if (!achievements.includes(achievement.id) && achievement.condition()) {
        achievements.push(achievement.id);
        newAchievements++;
        showToast(`🏆 Achievement unlocked: ${achievement.name}!`, 'success');
      }
    });
    
    if (newAchievements > 0) {
      saveAchievements();
    }
  }

  function renderSocial() {
    renderAchievements();
    updateProfile();
  }

  function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = ACHIEVEMENTS.map(achievement => {
      const earned = achievements.includes(achievement.id);
      return `
        <div class="achievement-card ${earned ? 'earned' : 'locked'}">
          <div class="achievement-emoji">${achievement.emoji}</div>
          <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
          </div>
          <div class="achievement-status">
            ${earned ? '✅' : '🔒'}
          </div>
        </div>`;
    }).join('');
  }

  function updateProfile() {
    const nameEl = document.getElementById('profile-name');
    const statsEl = document.getElementById('profile-stats');
    
    if (nameEl) nameEl.textContent = userProfile.name;
    if (statsEl) {
      const visitCount = visits.length;
      const totalClubs = ALL_CLUBS.length;
      const completionPct = Math.round((visitCount / totalClubs) * 100);
      statsEl.textContent = `${visitCount} visits • ${completionPct}% complete • ${achievements.length} achievements`;
    }
  }

  // ── Photo Management ───────────────────────────────────────────────────────
  function addPhoto(visitId, photoData) {
    if (!photos[visitId]) photos[visitId] = [];
    photos[visitId].push({
      id: Date.now(),
      data: photoData,
      timestamp: new Date().toISOString()
    });
    savePhotos();
  }

  function getPhotosForVisit(visitId) {
    return photos[visitId] || [];
  }

  // ── Export Functions ───────────────────────────────────────────────────────
  function exportToPDF() {
    const data = {
      profile: userProfile,
      visits: visits,
      achievements: achievements,
      bucketList: Array.from(bucketList),
      stats: {
        totalVisits: visits.length,
        averageScore: visits.length > 0 ? (visits.reduce((s, v) => s + v.scores.percentage, 0) / visits.length).toFixed(1) : 0,
        totalSpent: visits.reduce((s, v) => s + (v.ticket_price_gbp || 0), 0),
        streak: calculateStreak()
      }
    };
    
    // Create a simple text report for now
    const report = `
HAWK FOOTBALL TRAVELS REPORT
Generated: ${new Date().toLocaleDateString()}

PROFILE
Name: ${userProfile.name}
Member since: ${userProfile.joinDate}

STATISTICS
Total Visits: ${data.stats.totalVisits}
Average Score: ${data.stats.averageScore}%
Total Spent: £${data.stats.totalSpent.toFixed(2)}
Current Streak: ${data.stats.streak}

ACHIEVEMENTS UNLOCKED: ${achievements.length}/${ACHIEVEMENTS.length}
${ACHIEVEMENTS.filter(a => achievements.includes(a.id)).map(a => `✅ ${a.name}: ${a.description}`).join('\n')}

RECENT VISITS
${visits.slice(0, 10).map(v => `${formatDate(v.date)} - ${v.home_team} (${v.stadium_name}) - ${v.scores.percentage}%`).join('\n')}
    `.trim();
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hawk-football-travels-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Report exported successfully!', 'success');
  }

  function exportReviews() {
    const reviewsData = visits.map(v => ({
      date: v.date,
      home_team: v.home_team,
      away_team: v.away_team || '',
      stadium_name: v.stadium_name,
      score_percentage: v.scores.percentage,
      total_score: v.scores.total_score,
      ticket_price: v.ticket_price_gbp || 0,
      hawk_tip: v.hawk_tip || '',
      stand_seat: v.stand_seat || ''
    }));
    
    const csv = [
      'Date,Home Team,Away Team,Stadium,Score %,Total Score,Ticket Price,Hawk Tip,Stand/Seat',
      ...reviewsData.map(r => [
        r.date,
        `"${r.home_team}"`,
        `"${r.away_team}"`,
        `"${r.stadium_name}"`,
        r.score_percentage,
        r.total_score,
        r.ticket_price,
        `"${r.hawk_tip.replace(/"/g, '""')}"`,
        `"${r.stand_seat}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hawk-football-travels-reviews-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Reviews exported to CSV!', 'success');
  }
  function handleImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const v = JSON.parse(e.target.result);
        // Basic validation
        if (!v.home_team || !v.stadium_name || !v.scores) {
          showToast('Invalid visit JSON — missing required fields.', 'error');
          return;
        }
        if (!v.visit_id) v.visit_id = Date.now();
        saveImportedVisit(v);
        visits = loadVisits();
        updateHeader();
        renderStadiums();
        renderReviews();
        renderDashboard();
        showToast(`✅ Imported ${v.home_team} (${v.date || 'no date'})`, 'success');
      } catch {
        showToast('Could not parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  function bindEvents() {
    // Page navigation tabs
    document.querySelectorAll('.page-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        showPage(tab.dataset.page);
      });
    });

    // Region filter
    document.querySelectorAll('#region-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#region-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRegion = btn.dataset.region;
        renderStadiums();
      });
    });

    // Tier
    document.querySelectorAll('#tier-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#tier-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTier = btn.dataset.tier;
        renderStadiums();
      });
    });

    // Status
    document.querySelectorAll('#status-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#status-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStatus = btn.dataset.status;
        renderStadiums();
      });
    });

    // Sort
    document.querySelectorAll('#sort-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#sort-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSort = btn.dataset.sort;
        renderStadiums();
      });
    });

    // Search
    document.getElementById('search').addEventListener('input', e => { searchQuery = e.target.value.trim(); renderStadiums(); });

    // Review search + sort
    document.getElementById('review-search').addEventListener('input', e => { reviewSearch = e.target.value.trim(); renderReviews(); });
    document.querySelectorAll('#review-sort .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#review-sort .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        reviewSort = btn.dataset.rsort;
        renderReviews();
      });
    });

    // Modal close + nav
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-prev').addEventListener('click', () => navigateModal(-1));
    document.getElementById('modal-next').addEventListener('click', () => navigateModal(1));
    document.getElementById('review-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
    document.addEventListener('keydown', e => {
      if (document.getElementById('review-modal').hidden) return;
      if (e.key === 'Escape')      closeModal();
      if (e.key === 'ArrowLeft')   navigateModal(-1);
      if (e.key === 'ArrowRight')  navigateModal(1);
    });

    // Import file
    document.getElementById('import-file').addEventListener('change', e => {
      handleImport(e.target.files[0]);
      e.target.value = ''; // reset so same file can be re-imported
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // Social tabs
    document.querySelectorAll('.social-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.social-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.social-tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`social-${tab.dataset.socialTab}`).classList.add('active');
        currentSocialTab = tab.dataset.socialTab;
      });
    });

    // Quick rate button and modal
    const quickRateBtn = document.getElementById('quick-rate-btn');
    if (quickRateBtn) {
      quickRateBtn.addEventListener('click', openQuickRateModal);
    }

    const quickRateClose = document.getElementById('quick-rate-close');
    if (quickRateClose) {
      quickRateClose.addEventListener('click', closeQuickRateModal);
    }

    const quickRateCancel = document.getElementById('quick-rate-cancel');
    if (quickRateCancel) {
      quickRateCancel.addEventListener('click', closeQuickRateModal);
    }

    const quickRateSave = document.getElementById('quick-rate-save');
    if (quickRateSave) {
      quickRateSave.addEventListener('click', saveQuickRate);
    }

    // Quick score slider
    const quickScoreSlider = document.getElementById('quick-score');
    const quickScoreDisplay = document.getElementById('quick-score-display');
    if (quickScoreSlider && quickScoreDisplay) {
      quickScoreSlider.addEventListener('input', e => {
        quickScoreDisplay.textContent = e.target.value;
      });
    }

    // Photo upload button and modal
    const photoUploadBtn = document.getElementById('photo-upload-btn');
    if (photoUploadBtn) {
      photoUploadBtn.addEventListener('click', openPhotoModal);
    }

    const photoClose = document.getElementById('photo-close');
    if (photoClose) {
      photoClose.addEventListener('click', closePhotoModal);
    }

    // Photo upload area
    const photoUploadArea = document.getElementById('photo-upload-area');
    const photoInput = document.getElementById('photo-input');
    if (photoUploadArea && photoInput) {
      photoUploadArea.addEventListener('click', () => photoInput.click());
      
      // Drag and drop
      photoUploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        photoUploadArea.classList.add('dragover');
      });
      
      photoUploadArea.addEventListener('dragleave', () => {
        photoUploadArea.classList.remove('dragover');
      });
      
      photoUploadArea.addEventListener('drop', e => {
        e.preventDefault();
        photoUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handlePhotoUpload(files);
      });
      
      photoInput.addEventListener('change', e => {
        handlePhotoUpload(e.target.files);
      });
    }

    // Export buttons
    const exportDashboard = document.getElementById('export-dashboard');
    if (exportDashboard) {
      exportDashboard.addEventListener('click', exportToPDF);
    }

    const exportReviewsBtn = document.getElementById('export-reviews');
    if (exportReviewsBtn) {
      exportReviewsBtn.addEventListener('click', exportReviews);
    }

    // Share profile button
    const shareProfileBtn = document.getElementById('share-profile-btn');
    if (shareProfileBtn) {
      shareProfileBtn.addEventListener('click', shareProfile);
    }

    // Help button
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', openHelpModal);
    }

    const helpClose = document.getElementById('help-close');
    if (helpClose) {
      helpClose.addEventListener('click', closeHelpModal);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      // Only if no input is focused
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case '1': showPage('stadiums'); break;
        case '2': showPage('map'); break;
        case '3': showPage('reviews'); break;
        case '4': showPage('social'); break;
        case '5': showPage('dashboard'); break;
        case 'q': if (e.ctrlKey || e.metaKey) openQuickRateModal(); break;
        case 't': if (e.ctrlKey || e.metaKey) { e.preventDefault(); toggleTheme(); } break;
      }
    });
  }

  // ── New Functions ─────────────────────────────────────────────────────────

  // Page Navigation
  function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }
    
    // Update tab states
    document.querySelectorAll('.page-tab').forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });
    
    const activeTab = document.querySelector(`[data-page="${pageId}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');
    }
    
    currentPage = pageId;
    
    // Load page-specific content
    if (pageId === 'map') {
      renderMap();
    } else if (pageId === 'social') {
      renderSocial();
    }
  }

  function renderMap() {
    // For now, show a placeholder. In a real implementation, 
    // this would initialize a proper map library like Leaflet or Google Maps
    const mapContainer = document.getElementById('stadium-map');
    if (!mapContainer) return;
    
    console.log('Map rendering would go here');
  }

  // Quick Rate Modal
  function openQuickRateModal() {
    const modal = document.getElementById('quick-rate-modal');
    const select = document.getElementById('quick-stadium');
    
    // Populate stadium options
    select.innerHTML = '<option value="">Select a stadium...</option>' +
      ALL_CLUBS.map(club => `<option value="${club.id}">${club.name} - ${club.stadium}</option>`).join('');
    
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeQuickRateModal() {
    document.getElementById('quick-rate-modal').hidden = true;
    document.body.style.overflow = '';
    
    // Reset form
    document.getElementById('quick-stadium').value = '';
    document.getElementById('quick-score').value = '7';
    document.getElementById('quick-score-display').textContent = '7';
    document.getElementById('quick-notes').value = '';
  }

  function saveQuickRate() {
    const stadiumId = document.getElementById('quick-stadium').value;
    const score = parseInt(document.getElementById('quick-score').value);
    const notes = document.getElementById('quick-notes').value;
    
    if (!stadiumId) {
      showToast('Please select a stadium', 'error');
      return;
    }
    
    const club = ALL_CLUBS.find(c => c.id === stadiumId);
    if (!club) return;
    
    // Create a simplified visit record
    const visit = {
      visit_id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      home_team: club.name,
      stadium_name: club.stadium,
      scores: {
        sightlines_view: score,
        architecture_character: score,
        cover_pitch: score,
        happy_wife_happy_life: score,
        inground_bars_concourses: score,
        prematch_local_scene: score,
        atmosphere_fan_noise: score,
        club_welcome_hospitality: score,
        travel_transit_logistics: score,
        ticket_admission_value: score,
        total_score: score * 10,
        percentage: score * 10
      },
      hawk_tip: notes
    };
    
    saveImportedVisit(visit);
    visits = loadVisits();
    updateHeader();
    renderStadiums();
    renderReviews();
    renderDashboard();
    checkAchievements();
    
    closeQuickRateModal();
    showToast('Visit saved successfully!', 'success');
  }

  // Photo Upload Modal
  function openPhotoModal() {
    document.getElementById('photo-modal').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closePhotoModal() {
    document.getElementById('photo-modal').hidden = true;
    document.body.style.overflow = '';
  }

  function handlePhotoUpload(files) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          // For now, just show a toast. In a real app, this would save the photo
          showToast(`Photo "${file.name}" uploaded!`, 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Help Modal
  function openHelpModal() {
    document.getElementById('help-modal').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeHelpModal() {
    document.getElementById('help-modal').hidden = true;
    document.body.style.overflow = '';
  }

  // Share Profile
  function shareProfile() {
    const shareData = {
      title: `${userProfile.name}'s Football Journey`,
      text: `I've visited ${visits.length} stadiums with an average score of ${visits.length > 0 ? (visits.reduce((s, v) => s + v.scores.percentage, 0) / visits.length).toFixed(1) : 0}%!`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`).then(() => {
        showToast('Profile link copied to clipboard!', 'success');
      });
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
