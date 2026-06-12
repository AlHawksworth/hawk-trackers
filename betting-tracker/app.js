// ═══════════════════════════════════════════════════════════════════════════════
// BETTING TRACKER — Main Application
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const LS_KEY = 'betting_tracker_bets';
  const LS_BANKROLL = 'betting_tracker_bankroll';
  const PAGE_SIZE = 20;

  let bets = [];
  let bankroll = 50;
  let currentPage = 1;
  let sortCol = 'date';
  let sortDir = 'desc';
  let editingId = null;
  let pnlChart = null;
  let sportChart = null;
  let dowChart = null;
  let stakeChart = null;
  let breakdownTab = 'sport';

  // ── Persistence ──────────────────────────────────────────────────────────────
  function saveBets() {
    const json = JSON.stringify(bets);
    localStorage.setItem(LS_KEY, json);
    if (typeof FireSync !== 'undefined') FireSync.save(LS_KEY, bets);
  }

  function saveBankroll() {
    localStorage.setItem(LS_BANKROLL, bankroll.toString());
    if (typeof FireSync !== 'undefined') FireSync.save(LS_BANKROLL, bankroll);
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) bets = JSON.parse(raw);
    } catch (e) { bets = []; }
    try {
      const br = localStorage.getItem(LS_BANKROLL);
      if (br) bankroll = parseFloat(br) || 50;
    } catch (e) {}

    // Firebase sync load
    if (typeof FireSync !== 'undefined') {
      FireSync.load(LS_KEY, function (data) {
        if (data && Array.isArray(data)) { bets = data; render(); }
      });
      FireSync.load(LS_BANKROLL, function (data) {
        if (data && typeof data === 'number') { bankroll = data; render(); }
      });
    }
  }

  // ── Utility ──────────────────────────────────────────────────────────────────
  function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function fmt(n) { return '£' + Math.abs(n).toFixed(2); }
  function fmtPnl(n) { return (n >= 0 ? '+' : '-') + fmt(n); }
  function pct(n) { return n.toFixed(1) + '%'; }
  function todayStr() { return new Date().toISOString().split('T')[0]; }

  // ── Core calculations ────────────────────────────────────────────────────────
  function getSettled() { return bets.filter(b => b.result === 'win' || b.result === 'loss'); }
  function getPending() { return bets.filter(b => b.result === 'pending'); }

  function calcStats(subset) {
    if (!subset) subset = bets;
    const settled = subset.filter(b => b.result === 'win' || b.result === 'loss');
    const wins = settled.filter(b => b.result === 'win');
    const totalStaked = settled.reduce((s, b) => s + b.stake, 0);
    const totalReturns = settled.reduce((s, b) => s + (b.returns || 0), 0);
    const pnl = totalReturns - totalStaked;
    const roi = totalStaked > 0 ? (pnl / totalStaked) * 100 : 0;
    const winRate = settled.length > 0 ? (wins.length / settled.length) * 100 : 0;
    const avgOdds = settled.length > 0 ? settled.reduce((s, b) => s + b.odds, 0) / settled.length : 0;

    // Streak
    let streak = 0;
    let streakType = '';
    for (let i = settled.length - 1; i >= 0; i--) {
      const r = settled[i].result;
      if (streakType === '') { streakType = r; streak = 1; }
      else if (r === streakType) { streak++; }
      else break;
    }

    return { settled: settled.length, wins: wins.length, totalStaked, totalReturns, pnl, roi, winRate, avgOdds, streak, streakType };
  }

  // ── Render summary stats ─────────────────────────────────────────────────────
  function renderStats() {
    const stats = calcStats();
    const currentBankroll = bankroll + stats.pnl;

    document.getElementById('stat-bankroll').textContent = '£' + currentBankroll.toFixed(2);
    document.getElementById('stat-bankroll').style.cursor = 'pointer';
    document.getElementById('stat-staked').textContent = fmt(stats.totalStaked);
    document.getElementById('stat-returns').textContent = fmt(stats.totalReturns);

    const pnlEl = document.getElementById('stat-pnl');
    pnlEl.textContent = fmtPnl(stats.pnl);
    pnlEl.className = 'value ' + (stats.pnl >= 0 ? 'pnl-positive' : 'pnl-negative');

    document.getElementById('stat-roi').textContent = pct(stats.roi);
    document.getElementById('stat-winrate').textContent = pct(stats.winRate);
    document.getElementById('stat-avgodds').textContent = stats.avgOdds > 0 ? stats.avgOdds.toFixed(2) : '—';

    const streakEl = document.getElementById('stat-streak');
    if (stats.streak > 0) {
      streakEl.textContent = stats.streak + (stats.streakType === 'win' ? 'W' : 'L');
      streakEl.style.color = stats.streakType === 'win' ? 'var(--green)' : 'var(--red)';
    } else {
      streakEl.textContent = '—';
      streakEl.style.color = '';
    }

    // Pending badge
    const pending = getPending();
    const badge = document.getElementById('pending-badge');
    if (pending.length > 0) {
      badge.textContent = pending.length;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  // ── Filter & Sort ────────────────────────────────────────────────────────────
  function getFilteredBets() {
    let filtered = [...bets];
    const search = document.getElementById('filter-search').value.toLowerCase().trim();
    const sport = document.getElementById('filter-sport').value;
    const type = document.getElementById('filter-type').value;
    const result = document.getElementById('filter-result').value;
    const bookmaker = document.getElementById('filter-bookmaker').value;

    if (search) {
      filtered = filtered.filter(b =>
        (b.description || '').toLowerCase().includes(search) ||
        (b.league || '').toLowerCase().includes(search) ||
        (b.tipster || '').toLowerCase().includes(search) ||
        (b.notes || '').toLowerCase().includes(search)
      );
    }
    if (sport !== 'all') filtered = filtered.filter(b => b.sport === sport);
    if (type !== 'all') filtered = filtered.filter(b => b.type === type);
    if (result !== 'all') filtered = filtered.filter(b => b.result === result);
    if (bookmaker !== 'all') filtered = filtered.filter(b => b.bookmaker === bookmaker);

    // Sort
    filtered.sort((a, b) => {
      let av, bv;
      switch (sortCol) {
        case 'date': av = a.date; bv = b.date; break;
        case 'sport': av = a.sport; bv = b.sport; break;
        case 'description': av = a.description; bv = b.description; break;
        case 'stake': av = a.stake; bv = b.stake; break;
        case 'odds': av = a.odds; bv = b.odds; break;
        case 'pnl': av = (a.returns || 0) - a.stake; bv = (b.returns || 0) - b.stake; break;
        default: av = a.date; bv = b.date;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  // ── Render Table ─────────────────────────────────────────────────────────────
  function renderTable() {
    const filtered = getFilteredBets();
    const tbody = document.getElementById('bet-tbody');
    const emptyState = document.getElementById('empty-state');
    const pagination = document.getElementById('pagination');

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = '';
      pagination.innerHTML = '';
      return;
    }
    emptyState.style.display = 'none';

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PAGE_SIZE;
    const page = filtered.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = page.map(b => {
      const betPnl = b.result === 'pending' || b.result === 'void' ? 0 : (b.returns || 0) - b.stake;
      const pnlClass = betPnl > 0 ? 'pnl-positive' : betPnl < 0 ? 'pnl-negative' : 'pnl-zero';
      return `<tr>
        <td>${b.date}</td>
        <td>${b.sport || '—'}</td>
        <td>${b.type || '—'}</td>
        <td title="${escHtml(b.description)}">${truncate(b.description, 35)}</td>
        <td>${b.league || '—'}</td>
        <td>£${b.stake.toFixed(2)}</td>
        <td>${b.odds.toFixed(2)}</td>
        <td><span class="result-badge ${b.result}">${b.result}</span></td>
        <td class="${pnlClass}">${b.result === 'pending' ? '—' : fmtPnl(betPnl)}</td>
        <td class="actions-cell">
          <button title="Edit" onclick="BetApp.edit('${b.id}')">✏️</button>
          <button title="Quick Result" onclick="BetApp.quickResult('${b.id}')">⚡</button>
          <button title="Delete" onclick="BetApp.del('${b.id}')">🗑️</button>
        </td>
      </tr>`;
    }).join('');

    // Pagination
    if (totalPages > 1) {
      let html = '';
      for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="BetApp.goPage(${i})">${i}</button>`;
      }
      pagination.innerHTML = html;
    } else {
      pagination.innerHTML = '';
    }
  }

  function escHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function truncate(s, n) { return (s || '').length > n ? s.slice(0, n) + '…' : (s || ''); }

  // ── Populate filter dropdowns ────────────────────────────────────────────────
  function populateFilters() {
    const sports = [...new Set(bets.map(b => b.sport).filter(Boolean))].sort();
    const types = [...new Set(bets.map(b => b.type).filter(Boolean))].sort();
    const bookmakers = [...new Set(bets.map(b => b.bookmaker).filter(Boolean))].sort();

    fillSelect('filter-sport', sports, 'All Sports');
    fillSelect('filter-type', types, 'All Types');
    fillSelect('filter-bookmaker', bookmakers, 'All Bookmakers');

    // Datalists for autocomplete
    const leagues = [...new Set(bets.map(b => b.league).filter(Boolean))].sort();
    const tipsters = [...new Set(bets.map(b => b.tipster).filter(Boolean))].sort();
    document.getElementById('list-leagues').innerHTML = leagues.map(l => `<option value="${escHtml(l)}">`).join('');
    document.getElementById('list-tipsters').innerHTML = tipsters.map(t => `<option value="${escHtml(t)}">`).join('');
  }

  function fillSelect(id, items, allLabel) {
    const el = document.getElementById(id);
    const current = el.value;
    el.innerHTML = `<option value="all">${allLabel}</option>` + items.map(i => `<option value="${escHtml(i)}">${i}</option>`).join('');
    el.value = current || 'all';
  }

  // ── Pending Tab ──────────────────────────────────────────────────────────────
  function renderPending() {
    const pending = getPending().sort((a, b) => b.date.localeCompare(a.date));
    const list = document.getElementById('pending-list');
    const empty = document.getElementById('pending-empty');
    const bulkActions = document.getElementById('pending-bulk-actions');

    if (pending.length === 0) {
      list.innerHTML = '';
      empty.style.display = '';
      bulkActions.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    bulkActions.style.display = pending.length > 1 ? '' : 'none';

    list.innerHTML = pending.map(b => `
      <div class="pending-card">
        <div class="pending-info">
          <div class="pending-desc">${escHtml(b.description)}</div>
          <div class="pending-meta">${b.date} • ${b.sport} • £${b.stake.toFixed(2)} @ ${b.odds.toFixed(2)} • Potential: £${(b.stake * b.odds).toFixed(2)}</div>
        </div>
        <div class="pending-actions">
          <button class="btn-win" onclick="BetApp.settleResult('${b.id}','win')">✅ Won</button>
          <button class="btn-loss" onclick="BetApp.settleResult('${b.id}','loss')">❌ Lost</button>
        </div>
      </div>
    `).join('');
  }

  // ── Analysis Tab ─────────────────────────────────────────────────────────────
  function renderAnalysis() {
    renderPnlChart();
    renderMonthly();
    renderDaily();
    renderBreakdown();
    renderSportChart();
    renderDowChart();
    renderStakeChart();
  }

  function renderPnlChart() {
    const canvas = document.getElementById('pnl-chart');
    const emptyEl = document.getElementById('chart-empty');
    const settled = getSettled().sort((a, b) => a.date.localeCompare(b.date));

    if (settled.length === 0) {
      emptyEl.style.display = '';
      canvas.style.display = 'none';
      return;
    }
    emptyEl.style.display = 'none';
    canvas.style.display = '';

    // Apply period filter
    const period = document.querySelector('.period-btn.active')?.dataset.period || 'all';
    let filtered = settled;
    if (period !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(period));
      const cutStr = cutoff.toISOString().split('T')[0];
      filtered = settled.filter(b => b.date >= cutStr);
    }

    let running = 0;
    const labels = [];
    const data = [];
    filtered.forEach(b => {
      running += (b.returns || 0) - b.stake;
      labels.push(b.date);
      data.push(parseFloat(running.toFixed(2)));
    });

    const ctx = canvas.getContext('2d');
    if (pnlChart) pnlChart.destroy();
    pnlChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Running P&L',
          data,
          borderColor: running >= 0 ? '#10b981' : '#ef4444',
          backgroundColor: running >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: data.length > 50 ? 0 : 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.4)', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: 'rgba(255,255,255,0.4)', callback: v => '£' + v }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  function renderMonthly() {
    const settled = getSettled();
    const tbody = document.getElementById('monthly-tbody');
    const empty = document.getElementById('monthly-empty');

    if (settled.length === 0) { tbody.innerHTML = ''; empty.style.display = ''; return; }
    empty.style.display = 'none';

    const months = {};
    settled.forEach(b => {
      const m = b.date.slice(0, 7);
      if (!months[m]) months[m] = [];
      months[m].push(b);
    });

    const rows = Object.keys(months).sort().reverse().map(m => {
      const s = calcStats(months[m]);
      return `<tr>
        <td>${m}</td><td>${s.settled}</td><td>${s.wins}</td><td>${pct(s.winRate)}</td>
        <td>${fmt(s.totalStaked)}</td><td>${fmt(s.totalReturns)}</td>
        <td class="${s.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${fmtPnl(s.pnl)}</td>
        <td>${pct(s.roi)}</td>
      </tr>`;
    });
    tbody.innerHTML = rows.join('');
  }

  function renderDaily() {
    const settled = getSettled();
    const tbody = document.getElementById('daily-tbody');
    const empty = document.getElementById('daily-empty');

    if (settled.length === 0) { tbody.innerHTML = ''; empty.style.display = ''; return; }
    empty.style.display = 'none';

    const days = {};
    settled.forEach(b => {
      if (!days[b.date]) days[b.date] = [];
      days[b.date].push(b);
    });

    const rows = Object.keys(days).sort().reverse().slice(0, 30).map(d => {
      const s = calcStats(days[d]);
      return `<tr>
        <td>${d}</td><td>${s.settled}</td><td>${s.wins}</td><td>${pct(s.winRate)}</td>
        <td>${fmt(s.totalStaked)}</td><td>${fmt(s.totalReturns)}</td>
        <td class="${s.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${fmtPnl(s.pnl)}</td>
        <td>${pct(s.roi)}</td>
      </tr>`;
    });
    tbody.innerHTML = rows.join('');
  }

  function renderBreakdown() {
    const settled = getSettled();
    const container = document.getElementById('breakdown-cards');
    if (settled.length === 0) { container.innerHTML = '<p class="empty-state">No data yet.</p>'; return; }

    let groups = {};
    settled.forEach(b => {
      let key;
      switch (breakdownTab) {
        case 'sport': key = b.sport || 'Unknown'; break;
        case 'type': key = b.type || 'Unknown'; break;
        case 'bookmaker': key = b.bookmaker || 'Unknown'; break;
        case 'league': key = b.league || 'Unknown'; break;
        case 'tipster': key = b.tipster || 'Unknown'; break;
        case 'confidence': key = b.confidence ? b.confidence + '⭐' : 'Unrated'; break;
        case 'dayofweek':
          const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          key = dow[new Date(b.date).getDay()];
          break;
        case 'odds':
          if (b.odds < 1.5) key = '1.01–1.49';
          else if (b.odds < 2) key = '1.50–1.99';
          else if (b.odds < 3) key = '2.00–2.99';
          else if (b.odds < 5) key = '3.00–4.99';
          else if (b.odds < 10) key = '5.00–9.99';
          else key = '10.00+';
          break;
        default: key = 'Unknown';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });

    container.innerHTML = Object.keys(groups).sort().map(key => {
      const s = calcStats(groups[key]);
      return `<div class="sport-card">
        <div class="sport-card-title">${escHtml(key)}</div>
        <div class="sport-card-row"><span class="label">Bets</span><span>${s.settled}</span></div>
        <div class="sport-card-row"><span class="label">Wins</span><span>${s.wins} (${pct(s.winRate)})</span></div>
        <div class="sport-card-row"><span class="label">Staked</span><span>${fmt(s.totalStaked)}</span></div>
        <div class="sport-card-row"><span class="label">P&L</span><span class="${s.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${fmtPnl(s.pnl)}</span></div>
        <div class="sport-card-row"><span class="label">ROI</span><span>${pct(s.roi)}</span></div>
        <div class="sport-card-row"><span class="label">Avg Odds</span><span>${s.avgOdds.toFixed(2)}</span></div>
      </div>`;
    }).join('');
  }

  function renderSportChart() {
    const settled = getSettled();
    const canvas = document.getElementById('sport-chart');
    if (settled.length === 0) { canvas.style.display = 'none'; return; }
    canvas.style.display = '';

    const groups = {};
    settled.forEach(b => {
      const k = b.sport || 'Other';
      if (!groups[k]) groups[k] = 0;
      groups[k] += (b.returns || 0) - b.stake;
    });

    const labels = Object.keys(groups).sort();
    const data = labels.map(l => parseFloat(groups[l].toFixed(2)));
    const colors = data.map(v => v >= 0 ? '#10b981' : '#ef4444');

    const ctx = canvas.getContext('2d');
    if (sportChart) sportChart.destroy();
    sportChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderRadius: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { display: false } },
          y: { ticks: { color: 'rgba(255,255,255,0.4)', callback: v => '£' + v }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  function renderDowChart() {
    const settled = getSettled();
    const canvas = document.getElementById('dow-chart');
    if (settled.length === 0) { canvas.style.display = 'none'; return; }
    canvas.style.display = '';

    const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const groups = dow.map(() => 0);
    settled.forEach(b => {
      const d = new Date(b.date).getDay();
      groups[d] += (b.returns || 0) - b.stake;
    });

    const colors = groups.map(v => v >= 0 ? '#10b981' : '#ef4444');
    const ctx = canvas.getContext('2d');
    if (dowChart) dowChart.destroy();
    dowChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: dow, datasets: [{ data: groups.map(v => parseFloat(v.toFixed(2))), backgroundColor: colors, borderRadius: 4 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { display: false } },
          y: { ticks: { color: 'rgba(255,255,255,0.4)', callback: v => '£' + v }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  function renderStakeChart() {
    const settled = getSettled();
    const canvas = document.getElementById('stake-chart');
    if (settled.length === 0) { canvas.style.display = 'none'; return; }
    canvas.style.display = '';

    const ranges = { '£0–1': 0, '£1–2': 0, '£2–5': 0, '£5–10': 0, '£10–20': 0, '£20+': 0 };
    settled.forEach(b => {
      if (b.stake < 1) ranges['£0–1']++;
      else if (b.stake < 2) ranges['£1–2']++;
      else if (b.stake < 5) ranges['£2–5']++;
      else if (b.stake < 10) ranges['£5–10']++;
      else if (b.stake < 20) ranges['£10–20']++;
      else ranges['£20+']++;
    });

    const labels = Object.keys(ranges);
    const data = Object.values(ranges);
    const ctx = canvas.getContext('2d');
    if (stakeChart) stakeChart.destroy();
    stakeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'], borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } } } }
      }
    });
  }

  // ── Insights Tab ─────────────────────────────────────────────────────────────
  function renderInsights() {
    const settled = getSettled();
    const grid = document.getElementById('insights-grid');
    const patterns = document.getElementById('patterns-grid');
    const alerts = document.getElementById('alerts-list');

    if (settled.length < 3) {
      grid.innerHTML = '<div class="insight-card"><div class="insight-card-body">Add at least 3 settled bets to see insights.</div></div>';
      patterns.innerHTML = '';
      alerts.innerHTML = '';
      return;
    }

    const stats = calcStats();
    const insights = [];

    // Best sport
    const sportGroups = {};
    settled.forEach(b => {
      const k = b.sport || 'Other';
      if (!sportGroups[k]) sportGroups[k] = [];
      sportGroups[k].push(b);
    });
    let bestSport = '', bestRoi = -Infinity;
    Object.keys(sportGroups).forEach(k => {
      if (sportGroups[k].length >= 2) {
        const s = calcStats(sportGroups[k]);
        if (s.roi > bestRoi) { bestRoi = s.roi; bestSport = k; }
      }
    });
    if (bestSport) {
      insights.push({ icon: '🏆', title: 'Best Sport', body: `<strong>${bestSport}</strong> gives you the best ROI at <strong>${pct(bestRoi)}</strong>. Consider focusing more bets here.` });
    }

    // Best odds range
    const oddsGroups = { low: [], mid: [], high: [], vhigh: [] };
    settled.forEach(b => {
      if (b.odds < 2) oddsGroups.low.push(b);
      else if (b.odds < 3) oddsGroups.mid.push(b);
      else if (b.odds < 5) oddsGroups.high.push(b);
      else oddsGroups.vhigh.push(b);
    });
    let bestOddsRange = '', bestOddsRoi = -Infinity;
    const oddsLabels = { low: '< 2.00', mid: '2.00–2.99', high: '3.00–4.99', vhigh: '5.00+' };
    Object.keys(oddsGroups).forEach(k => {
      if (oddsGroups[k].length >= 2) {
        const s = calcStats(oddsGroups[k]);
        if (s.roi > bestOddsRoi) { bestOddsRoi = s.roi; bestOddsRange = oddsLabels[k]; }
      }
    });
    if (bestOddsRange) {
      insights.push({ icon: '📊', title: 'Sweet Spot Odds', body: `You perform best at odds <strong>${bestOddsRange}</strong> with <strong>${pct(bestOddsRoi)}</strong> ROI. Target this range.` });
    }

    // Avg stake on wins vs losses
    const wins = settled.filter(b => b.result === 'win');
    const losses = settled.filter(b => b.result === 'loss');
    if (wins.length > 0 && losses.length > 0) {
      const avgWinStake = wins.reduce((s, b) => s + b.stake, 0) / wins.length;
      const avgLossStake = losses.reduce((s, b) => s + b.stake, 0) / losses.length;
      if (avgLossStake > avgWinStake * 1.2) {
        insights.push({ icon: '⚠️', title: 'Stake Discipline', body: `You stake more on losses (avg <strong>${fmt(avgLossStake)}</strong>) vs wins (avg <strong>${fmt(avgWinStake)}</strong>). Consider flat staking.` });
      }
    }

    // Best day of week
    const dowGroups = {};
    const dowNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    settled.forEach(b => {
      const d = new Date(b.date).getDay();
      if (!dowGroups[d]) dowGroups[d] = [];
      dowGroups[d].push(b);
    });
    let bestDow = '', bestDowRoi = -Infinity;
    Object.keys(dowGroups).forEach(d => {
      if (dowGroups[d].length >= 2) {
        const s = calcStats(dowGroups[d]);
        if (s.roi > bestDowRoi) { bestDowRoi = s.roi; bestDow = dowNames[d]; }
      }
    });
    if (bestDow) {
      insights.push({ icon: '📅', title: 'Best Day', body: `<strong>${bestDow}</strong> is your best day with <strong>${pct(bestDowRoi)}</strong> ROI.` });
    }

    // Accumulator performance
    const accas = settled.filter(b => ['Accumulator', 'Fourfold', 'Fivefold', 'Sixfold'].includes(b.type));
    if (accas.length >= 3) {
      const accaStats = calcStats(accas);
      insights.push({ icon: '🎰', title: 'Accumulator P&L', body: `Your accas: <strong>${accaStats.wins}/${accaStats.settled}</strong> wins, <strong>${fmtPnl(accaStats.pnl)}</strong> P&L (${pct(accaStats.roi)} ROI).` });
    }

    // In-play performance
    const inplay = settled.filter(b => b.inplay);
    if (inplay.length >= 3) {
      const ipStats = calcStats(inplay);
      insights.push({ icon: '⚡', title: 'In-Play Bets', body: `In-play: <strong>${ipStats.wins}/${ipStats.settled}</strong> wins, <strong>${fmtPnl(ipStats.pnl)}</strong> P&L (${pct(ipStats.roi)} ROI).` });
    }

    grid.innerHTML = insights.map(i => `
      <div class="insight-card">
        <div class="insight-card-title">${i.icon} ${i.title}</div>
        <div class="insight-card-body">${i.body}</div>
      </div>
    `).join('') || '<div class="insight-card"><div class="insight-card-body">Keep adding bets to unlock more insights.</div></div>';

    // Patterns
    const patternItems = [];
    if (stats.streak >= 3 && stats.streakType === 'loss') {
      patternItems.push({ icon: '🔥', text: `You're on a <strong>${stats.streak}-loss streak</strong>. Consider reducing stakes until you break it.` });
    }
    if (stats.streak >= 3 && stats.streakType === 'win') {
      patternItems.push({ icon: '🎉', text: `Hot streak! <strong>${stats.streak} wins in a row</strong>. Keep your discipline.` });
    }
    const last10 = settled.slice(-10);
    if (last10.length === 10) {
      const last10Stats = calcStats(last10);
      patternItems.push({ icon: '📈', text: `Last 10 bets: <strong>${last10Stats.wins}/10</strong> wins, <strong>${fmtPnl(last10Stats.pnl)}</strong> P&L.` });
    }
    patterns.innerHTML = patternItems.map(p => `
      <div class="insight-card">
        <div class="insight-card-body">${p.icon} ${p.text}</div>
      </div>
    `).join('') || '<div class="insight-card"><div class="insight-card-body">More patterns will appear as you log more bets.</div></div>';

    // Alerts
    const alertItems = [];
    if (stats.roi < -20 && stats.settled >= 10) {
      alertItems.push({ icon: '🚨', text: `Your ROI is <strong>${pct(stats.roi)}</strong>. Review your strategy or take a break.` });
    }
    if (stats.winRate < 30 && stats.settled >= 10) {
      alertItems.push({ icon: '📉', text: `Win rate below 30%. Consider betting at lower odds or doing more research.` });
    }
    const pendingBets = getPending();
    const pendingStake = pendingBets.reduce((s, b) => s + b.stake, 0);
    const currentBankroll = bankroll + stats.pnl;
    if (pendingStake > currentBankroll * 0.5 && pendingBets.length > 0) {
      alertItems.push({ icon: '⚠️', text: `You have <strong>£${pendingStake.toFixed(2)}</strong> in pending bets — over 50% of your bankroll. Manage risk.` });
    }
    alerts.innerHTML = alertItems.map(a => `
      <div class="alert-card">
        <div class="alert-icon">${a.icon}</div>
        <div class="alert-text">${a.text}</div>
      </div>
    `).join('') || '<div class="alert-card"><div class="alert-icon">✅</div><div class="alert-text">No alerts right now. Keep up the good work!</div></div>';
  }

  // ── Form Handling ────────────────────────────────────────────────────────────
  function setupForm() {
    const form = document.getElementById('bet-form');
    document.getElementById('bet-date').value = todayStr();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const bet = {
        id: editingId || generateId(),
        date: document.getElementById('bet-date').value,
        sport: document.getElementById('bet-sport').value,
        type: document.getElementById('bet-type').value,
        league: document.getElementById('bet-league').value.trim(),
        description: document.getElementById('bet-description').value.trim(),
        stake: parseFloat(document.getElementById('bet-stake').value) || 0,
        odds: parseFloat(document.getElementById('bet-odds').value) || 0,
        returns: parseFloat(document.getElementById('bet-returns').value) || 0,
        result: document.getElementById('bet-result').value,
        bookmaker: document.getElementById('bet-bookmaker').value,
        value: document.getElementById('bet-value').value,
        tipster: document.getElementById('bet-tipster').value.trim(),
        confidence: document.getElementById('bet-confidence').value,
        freebet: document.getElementById('bet-freebet').checked,
        inplay: document.getElementById('bet-inplay').checked,
        notes: document.getElementById('bet-notes').value.trim(),
      };

      // Auto-calculate returns for wins if not set
      if (bet.result === 'win' && !bet.returns) {
        bet.returns = bet.stake * bet.odds;
      }
      if (bet.result === 'loss') {
        bet.returns = 0;
      }

      if (editingId) {
        const idx = bets.findIndex(b => b.id === editingId);
        if (idx !== -1) bets[idx] = bet;
        editingId = null;
        document.getElementById('form-title').textContent = 'Add Bet';
        document.getElementById('form-submit-btn').textContent = 'Add Bet';
        document.getElementById('cancel-edit').style.display = 'none';
      } else {
        bets.push(bet);
      }

      saveBets();
      form.reset();
      document.getElementById('bet-date').value = todayStr();
      render();
    });

    // Cancel edit
    document.getElementById('cancel-edit').addEventListener('click', function () {
      editingId = null;
      document.getElementById('bet-form').reset();
      document.getElementById('bet-date').value = todayStr();
      document.getElementById('form-title').textContent = 'Add Bet';
      document.getElementById('form-submit-btn').textContent = 'Add Bet';
      this.style.display = 'none';
    });

    // Collapse form
    document.getElementById('btn-collapse-form').addEventListener('click', function () {
      const body = document.getElementById('form-body');
      body.classList.toggle('hidden');
      this.classList.toggle('collapsed');
    });

    // Shortcut add
    document.getElementById('shortcut-add').addEventListener('click', function () {
      const body = document.getElementById('form-body');
      body.classList.remove('hidden');
      document.getElementById('btn-collapse-form').classList.remove('collapsed');
      document.getElementById('bet-description').focus();
      document.querySelector('[data-maintab="bets"]').click();
    });
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  function editBet(id) {
    const bet = bets.find(b => b.id === id);
    if (!bet) return;
    editingId = id;
    document.getElementById('bet-date').value = bet.date;
    document.getElementById('bet-sport').value = bet.sport;
    document.getElementById('bet-type').value = bet.type;
    document.getElementById('bet-league').value = bet.league || '';
    document.getElementById('bet-description').value = bet.description;
    document.getElementById('bet-stake').value = bet.stake;
    document.getElementById('bet-odds').value = bet.odds;
    document.getElementById('bet-returns').value = bet.returns || '';
    document.getElementById('bet-result').value = bet.result;
    document.getElementById('bet-bookmaker').value = bet.bookmaker || '';
    document.getElementById('bet-value').value = bet.value || '';
    document.getElementById('bet-tipster').value = bet.tipster || '';
    document.getElementById('bet-confidence').value = bet.confidence || '';
    document.getElementById('bet-freebet').checked = bet.freebet || false;
    document.getElementById('bet-inplay').checked = bet.inplay || false;
    document.getElementById('bet-notes').value = bet.notes || '';

    document.getElementById('form-title').textContent = 'Edit Bet';
    document.getElementById('form-submit-btn').textContent = 'Save Changes';
    document.getElementById('cancel-edit').style.display = '';
    document.getElementById('form-body').classList.remove('hidden');
    document.getElementById('btn-collapse-form').classList.remove('collapsed');
    document.getElementById('bet-description').focus();
    document.querySelector('[data-maintab="bets"]').click();
  }

  function deleteBet(id) {
    if (!confirm('Delete this bet?')) return;
    bets = bets.filter(b => b.id !== id);
    saveBets();
    render();
  }

  function quickResult(id) {
    const bet = bets.find(b => b.id === id);
    if (!bet) return;
    document.getElementById('qr-id').value = id;
    document.getElementById('qr-result').value = bet.result;
    document.getElementById('qr-returns').value = bet.returns || '';
    document.getElementById('quick-result-modal').style.display = '';
  }

  function settleResult(id, result) {
    const bet = bets.find(b => b.id === id);
    if (!bet) return;
    bet.result = result;
    if (result === 'win') bet.returns = bet.stake * bet.odds;
    if (result === 'loss') bet.returns = 0;
    saveBets();
    render();
  }

  // ── Modals ───────────────────────────────────────────────────────────────────
  function setupModals() {
    // Quick result modal
    document.getElementById('qr-save').addEventListener('click', function () {
      const id = document.getElementById('qr-id').value;
      const bet = bets.find(b => b.id === id);
      if (!bet) return;
      bet.result = document.getElementById('qr-result').value;
      bet.returns = parseFloat(document.getElementById('qr-returns').value) || 0;
      if (bet.result === 'win' && !bet.returns) bet.returns = bet.stake * bet.odds;
      if (bet.result === 'loss') bet.returns = 0;
      saveBets();
      document.getElementById('quick-result-modal').style.display = 'none';
      render();
    });
    document.getElementById('qr-cancel').addEventListener('click', function () {
      document.getElementById('quick-result-modal').style.display = 'none';
    });

    // Bankroll modal
    document.getElementById('stat-bankroll').addEventListener('click', function () {
      document.getElementById('bank-amount').value = bankroll;
      document.getElementById('bank-modal').style.display = '';
    });
    document.getElementById('bank-save').addEventListener('click', function () {
      bankroll = parseFloat(document.getElementById('bank-amount').value) || 50;
      saveBankroll();
      document.getElementById('bank-modal').style.display = 'none';
      render();
    });
    document.getElementById('bank-cancel').addEventListener('click', function () {
      document.getElementById('bank-modal').style.display = 'none';
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(el => {
      el.addEventListener('click', function (e) {
        if (e.target === el) el.style.display = 'none';
      });
    });
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  function setupTabs() {
    // Main tabs
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.main-tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.main-tab-content').forEach(t => t.style.display = 'none');
        const tabId = 'tab-' + this.dataset.maintab;
        document.getElementById(tabId).style.display = '';
        if (this.dataset.maintab === 'analysis') renderAnalysis();
        if (this.dataset.maintab === 'insights') renderInsights();
      });
    });

    // Breakdown tabs
    document.querySelectorAll('.breakdown-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.breakdown-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        breakdownTab = this.dataset.tab;
        renderBreakdown();
      });
    });

    // Period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderPnlChart();
      });
    });
  }

  // ── Sorting ──────────────────────────────────────────────────────────────────
  function setupSorting() {
    document.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', function () {
        const col = this.dataset.col;
        if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortCol = col; sortDir = 'desc'; }
        renderTable();
      });
    });
  }

  // ── Filters ──────────────────────────────────────────────────────────────────
  function setupFilters() {
    ['filter-search', 'filter-sport', 'filter-type', 'filter-result', 'filter-bookmaker'].forEach(id => {
      document.getElementById(id).addEventListener('input', function () { currentPage = 1; renderTable(); });
      document.getElementById(id).addEventListener('change', function () { currentPage = 1; renderTable(); });
    });
  }

  // ── CSV Export/Import ────────────────────────────────────────────────────────
  function setupCSV() {
    document.getElementById('export-csv').addEventListener('click', function () {
      if (bets.length === 0) { alert('No bets to export.'); return; }
      const headers = ['date', 'sport', 'type', 'league', 'description', 'stake', 'odds', 'returns', 'result', 'bookmaker', 'value', 'tipster', 'confidence', 'freebet', 'inplay', 'notes'];
      const rows = bets.map(b => headers.map(h => {
        let v = b[h] || '';
        if (typeof v === 'boolean') v = v ? 'true' : 'false';
        if (typeof v === 'number') v = v.toString();
        return '"' + String(v).replace(/"/g, '""') + '"';
      }).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'betting-tracker-' + todayStr() + '.csv';
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('import-btn').addEventListener('click', function () {
      document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        try {
          const lines = ev.target.result.split('\n').filter(l => l.trim());
          if (lines.length < 2) { alert('CSV appears empty.'); return; }
          const headers = parseCSVLine(lines[0]);
          let imported = 0;
          for (let i = 1; i < lines.length; i++) {
            const vals = parseCSVLine(lines[i]);
            if (vals.length < 5) continue;
            const bet = {
              id: generateId(),
              date: getCSVVal(headers, vals, 'date') || todayStr(),
              sport: getCSVVal(headers, vals, 'sport') || '',
              type: getCSVVal(headers, vals, 'type') || 'Single',
              league: getCSVVal(headers, vals, 'league') || '',
              description: getCSVVal(headers, vals, 'description') || getCSVVal(headers, vals, 'selection') || '',
              stake: parseFloat(getCSVVal(headers, vals, 'stake')) || 0,
              odds: parseFloat(getCSVVal(headers, vals, 'odds')) || 0,
              returns: parseFloat(getCSVVal(headers, vals, 'returns')) || 0,
              result: getCSVVal(headers, vals, 'result') || 'pending',
              bookmaker: getCSVVal(headers, vals, 'bookmaker') || '',
              value: getCSVVal(headers, vals, 'value') || '',
              tipster: getCSVVal(headers, vals, 'tipster') || '',
              confidence: getCSVVal(headers, vals, 'confidence') || '',
              freebet: getCSVVal(headers, vals, 'freebet') === 'true',
              inplay: getCSVVal(headers, vals, 'inplay') === 'true',
              notes: getCSVVal(headers, vals, 'notes') || '',
            };
            if (bet.stake > 0) { bets.push(bet); imported++; }
          }
          saveBets();
          render();
          alert('Imported ' + imported + ' bets.');
        } catch (err) {
          alert('Error importing CSV: ' + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    result.push(current.trim());
    return result;
  }

  function getCSVVal(headers, vals, key) {
    const idx = headers.findIndex(h => h.toLowerCase().trim() === key.toLowerCase());
    return idx >= 0 ? (vals[idx] || '') : '';
  }

  // ── Theme Toggle ─────────────────────────────────────────────────────────────
  function setupTheme() {
    const saved = localStorage.getItem('betting_tracker_theme') || 'dark';
    document.documentElement.dataset.theme = saved;
    const btn = document.getElementById('theme-toggle');
    btn.textContent = saved === 'dark' ? '🌙' : '☀️';
    btn.addEventListener('click', function () {
      const current = document.documentElement.dataset.theme;
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('betting_tracker_theme', next);
      btn.textContent = next === 'dark' ? '🌙' : '☀️';
    });
  }

  // ── Bulk pending actions ─────────────────────────────────────────────────────
  function setupBulkPending() {
    document.getElementById('bulk-win').addEventListener('click', function () {
      if (!confirm('Mark all pending bets as won?')) return;
      getPending().forEach(b => {
        b.result = 'win';
        b.returns = b.stake * b.odds;
      });
      saveBets();
      render();
    });
    document.getElementById('bulk-loss').addEventListener('click', function () {
      if (!confirm('Mark all pending bets as lost?')) return;
      getPending().forEach(b => {
        b.result = 'loss';
        b.returns = 0;
      });
      saveBets();
      render();
    });
  }

  // ── Master Render ────────────────────────────────────────────────────────────
  function render() {
    renderStats();
    populateFilters();
    renderTable();
    renderPending();
    // Only render charts/insights if those tabs are active
    if (document.getElementById('tab-analysis').style.display !== 'none') renderAnalysis();
    if (document.getElementById('tab-insights').style.display !== 'none') renderInsights();
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    loadData();
    setupForm();
    setupModals();
    setupTabs();
    setupSorting();
    setupFilters();
    setupCSV();
    setupTheme();
    setupBulkPending();
    render();
  }

  // Public API for inline event handlers
  window.BetApp = {
    edit: editBet,
    del: deleteBet,
    quickResult: quickResult,
    settleResult: settleResult,
    goPage: function (p) { currentPage = p; renderTable(); }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
