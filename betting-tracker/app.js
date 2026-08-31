// ═══════════════════════════════════════════════════════════════════════════════
// BETTING TRACKER — Enhanced Application with Advanced Features
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const LS_KEY = 'betting_tracker_bets';
  const LS_BANKROLL = 'betting_tracker_bankroll';
  const LS_UNIT_SIZE = 'betting_tracker_unit_size';
  const LS_GOALS = 'betting_tracker_goals';
  const LS_RISK_SETTINGS = 'betting_tracker_risk_settings';
  const LS_ACHIEVEMENTS = 'betting_tracker_achievements';
  const PAGE_SIZE = 20;

  let bets = [];
  let bankroll = 50;
  let unitSize = 5;
  let goals = [];
  let riskSettings = {
    dailyLossLimit: 50,
    weeklyLossLimit: 200,
    monthlyLossLimit: 500,
    maxBetPercent: 5,
    enableCoolingOff: false
  };
  let achievements = [];
  let currentPage = 1;
  let sortCol = 'date';
  let sortDir = 'desc';
  let editingId = null;
  let pnlChart = null;
  let sportChart = null;
  let dowChart = null;
  let stakeChart = null;
  let goalsChart = null;
  let riskChart = null;
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

  function saveUnitSize() {
    localStorage.setItem(LS_UNIT_SIZE, unitSize.toString());
    if (typeof FireSync !== 'undefined') FireSync.save(LS_UNIT_SIZE, unitSize);
  }

  function saveGoals() {
    const json = JSON.stringify(goals);
    localStorage.setItem(LS_GOALS, json);
    if (typeof FireSync !== 'undefined') FireSync.save(LS_GOALS, goals);
  }

  function saveRiskSettings() {
    const json = JSON.stringify(riskSettings);
    localStorage.setItem(LS_RISK_SETTINGS, json);
    if (typeof FireSync !== 'undefined') FireSync.save(LS_RISK_SETTINGS, riskSettings);
  }

  function saveAchievements() {
    const json = JSON.stringify(achievements);
    localStorage.setItem(LS_ACHIEVEMENTS, json);
    if (typeof FireSync !== 'undefined') FireSync.save(LS_ACHIEVEMENTS, achievements);
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

    try {
      const us = localStorage.getItem(LS_UNIT_SIZE);
      if (us) unitSize = parseFloat(us) || 5;
    } catch (e) {}

    try {
      const goalsRaw = localStorage.getItem(LS_GOALS);
      if (goalsRaw) goals = JSON.parse(goalsRaw);
    } catch (e) { goals = []; }

    try {
      const riskRaw = localStorage.getItem(LS_RISK_SETTINGS);
      if (riskRaw) riskSettings = { ...riskSettings, ...JSON.parse(riskRaw) };
    } catch (e) {}

    try {
      const achRaw = localStorage.getItem(LS_ACHIEVEMENTS);
      if (achRaw) achievements = JSON.parse(achRaw);
    } catch (e) { achievements = initializeAchievements(); }

    // Firebase sync load
    if (typeof FireSync !== 'undefined') {
      FireSync.load(LS_KEY, function (data) {
        if (data && Array.isArray(data)) { bets = data; render(); }
      });
      FireSync.load(LS_BANKROLL, function (data) {
        if (data && typeof data === 'number') { bankroll = data; render(); }
      });
      FireSync.load(LS_UNIT_SIZE, function (data) {
        if (data && typeof data === 'number') { unitSize = data; render(); }
      });
      FireSync.load(LS_GOALS, function (data) {
        if (data && Array.isArray(data)) { goals = data; render(); }
      });
      FireSync.load(LS_RISK_SETTINGS, function (data) {
        if (data && typeof data === 'object') { riskSettings = { ...riskSettings, ...data }; render(); }
      });
      FireSync.load(LS_ACHIEVEMENTS, function (data) {
        if (data && Array.isArray(data)) { achievements = data; render(); }
      });
    }
  }

  // ── Utility ──────────────────────────────────────────────────────────────────
  function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function fmt(n) { return '£' + Math.abs(n).toFixed(2); }
  function fmtPnl(n) { return (n >= 0 ? '+' : '-') + fmt(n); }
  function pct(n) { return n.toFixed(1) + '%'; }
  function todayStr() { return new Date().toISOString().split('T')[0]; }

  // ── Enhanced Calculations ────────────────────────────────────────────────────
  function getSettled() { return bets.filter(b => ['win', 'loss', 'cashout'].includes(b.result)); }
  function getPending() { return bets.filter(b => b.result === 'pending'); }

  function calcStats(subset) {
    if (!subset) subset = bets;
    const settled = subset.filter(b => ['win', 'loss', 'cashout'].includes(b.result));
    const wins = settled.filter(b => b.result === 'win');
    const totalStaked = settled.reduce((s, b) => s + b.stake, 0);
    const totalReturns = settled.reduce((s, b) => s + (b.returns || b.cashout || 0), 0);
    const pnl = totalReturns - totalStaked;
    const roi = totalStaked > 0 ? (pnl / totalStaked) * 100 : 0;
    const winRate = settled.length > 0 ? (wins.length / settled.length) * 100 : 0;
    const avgOdds = settled.length > 0 ? settled.reduce((s, b) => s + b.odds, 0) / settled.length : 0;

    // Expected Value calculation
    const expectedValue = settled.reduce((ev, b) => {
      if (b.expectedProb) {
        const expectedReturn = (b.expectedProb / 100) * b.odds * b.stake;
        const betEv = ((expectedReturn - b.stake) / b.stake) * 100;
        return ev + betEv;
      }
      return ev;
    }, 0) / settled.length || 0;

    // Closing Line Value
    const clvBets = settled.filter(b => b.closingOdds && b.closingOdds > 0);
    const clv = clvBets.length > 0 ? 
      clvBets.reduce((sum, b) => sum + ((b.closingOdds - b.odds) / b.odds * 100), 0) / clvBets.length : 0;

    // Units calculation
    const totalUnits = settled.reduce((s, b) => s + (b.units || b.stake / unitSize), 0);
    const unitsPnl = pnl / unitSize;

    // Streak calculation
    let streak = 0;
    let streakType = '';
    for (let i = settled.length - 1; i >= 0; i--) {
      const r = settled[i].result;
      if (streakType === '') { streakType = r; streak = 1; }
      else if (r === streakType) { streak++; }
      else break;
    }

    return { 
      settled: settled.length, 
      wins: wins.length, 
      totalStaked, 
      totalReturns, 
      pnl, 
      roi, 
      winRate, 
      avgOdds, 
      expectedValue,
      clv,
      totalUnits,
      unitsPnl,
      streak, 
      streakType 
    };
  }

  // ── Risk Assessment ──────────────────────────────────────────────────────────
  function assessRiskLevel() {
    const stats = calcStats();
    const pendingBets = getPending();
    const pendingStake = pendingBets.reduce((s, b) => s + b.stake, 0);
    const currentBankroll = bankroll + stats.pnl;
    const pendingRisk = currentBankroll > 0 ? (pendingStake / currentBankroll) * 100 : 0;

    if (pendingRisk > 20 || stats.roi < -30) return 'high';
    if (pendingRisk > 10 || stats.roi < -15) return 'medium';
    return 'low';
  }

  function getLossLimits() {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = getWeekStart(new Date());
    const monthStart = new Date().toISOString().slice(0, 7) + '-01';

    const dailyLosses = getSettled()
      .filter(b => b.date === today && b.result === 'loss')
      .reduce((sum, b) => sum + b.stake, 0);

    const weeklyLosses = getSettled()
      .filter(b => b.date >= weekStart && b.result === 'loss')
      .reduce((sum, b) => sum + b.stake, 0);

    const monthlyLosses = getSettled()
      .filter(b => b.date >= monthStart && b.result === 'loss')
      .reduce((sum, b) => sum + b.stake, 0);

    return { dailyLosses, weeklyLosses, monthlyLosses };
  }

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  // ── Stake Suggestion ─────────────────────────────────────────────────────────
  function suggestStake(odds, probability) {
    if (!odds || !probability) return null;
    
    const currentBankroll = bankroll + calcStats().pnl;
    const kellyFraction = ((odds * (probability / 100)) - 1) / (odds - 1);
    
    if (kellyFraction <= 0) return { type: 'avoid', message: 'No edge detected - avoid this bet' };
    
    const kellyStake = currentBankroll * kellyFraction;
    const maxStake = currentBankroll * (riskSettings.maxBetPercent / 100);
    const suggestedStake = Math.min(kellyStake, maxStake);
    
    if (suggestedStake < 0.01) return { type: 'small', message: 'Very small stake suggested' };
    
    return {
      type: 'recommend',
      stake: suggestedStake,
      message: `Suggested: £${suggestedStake.toFixed(2)} (${(suggestedStake / unitSize).toFixed(1)}u)`
    };
  }

  // ── Achievements System ──────────────────────────────────────────────────────
  function initializeAchievements() {
    return [
      { id: 'first_bet', name: 'First Steps', description: 'Place your first bet', icon: '🎯', unlocked: false },
      { id: 'ten_bets', name: 'Getting Started', description: 'Place 10 bets', icon: '📈', unlocked: false, progress: 0, target: 10 },
      { id: 'fifty_bets', name: 'Experienced', description: 'Place 50 bets', icon: '🏆', unlocked: false, progress: 0, target: 50 },
      { id: 'hundred_bets', name: 'Veteran', description: 'Place 100 bets', icon: '👑', unlocked: false, progress: 0, target: 100 },
      { id: 'first_win', name: 'Winner', description: 'Win your first bet', icon: '✅', unlocked: false },
      { id: 'win_streak_5', name: 'Hot Streak', description: 'Win 5 bets in a row', icon: '🔥', unlocked: false },
      { id: 'win_streak_10', name: 'On Fire', description: 'Win 10 bets in a row', icon: '🚀', unlocked: false },
      { id: 'profitable_month', name: 'Monthly Profit', description: 'Make profit in a month', icon: '💰', unlocked: false },
      { id: 'roi_positive', name: 'Profitable', description: 'Achieve positive ROI', icon: '📊', unlocked: false },
      { id: 'roi_10', name: 'Great Returns', description: 'Achieve 10% ROI', icon: '💎', unlocked: false },
      { id: 'winrate_60', name: 'Accurate', description: 'Achieve 60% win rate (min 20 bets)', icon: '🎯', unlocked: false },
      { id: 'big_odds', name: 'Long Shot', description: 'Win a bet with odds 10.0+', icon: '🎰', unlocked: false },
      { id: 'discipline', name: 'Disciplined', description: 'Use unit staking for 20 consecutive bets', icon: '⚖️', unlocked: false }
    ];
  }

  function checkAchievements() {
    const stats = calcStats();
    const settled = getSettled();
    let newUnlocks = [];

    achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      switch (achievement.id) {
        case 'first_bet':
          if (bets.length >= 1) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'ten_bets':
          achievement.progress = bets.length;
          if (bets.length >= 10) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'fifty_bets':
          achievement.progress = bets.length;
          if (bets.length >= 50) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'hundred_bets':
          achievement.progress = bets.length;
          if (bets.length >= 100) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'first_win':
          if (settled.some(b => b.result === 'win')) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'win_streak_5':
          if (stats.streak >= 5 && stats.streakType === 'win') {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'win_streak_10':
          if (stats.streak >= 10 && stats.streakType === 'win') {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'roi_positive':
          if (stats.roi > 0 && settled.length >= 10) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'roi_10':
          if (stats.roi >= 10 && settled.length >= 20) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'winrate_60':
          if (stats.winRate >= 60 && settled.length >= 20) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'big_odds':
          if (settled.some(b => b.result === 'win' && b.odds >= 10)) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
        case 'profitable_month':
          const thisMonth = new Date().toISOString().slice(0, 7);
          const monthlyBets = settled.filter(b => b.date.startsWith(thisMonth));
          const monthlyStats = calcStats(monthlyBets);
          if (monthlyStats.pnl > 0 && monthlyBets.length >= 5) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
          }
          break;
      }
    });

    if (newUnlocks.length > 0) {
      saveAchievements();
      // Show notification for new achievements
      newUnlocks.forEach(achievement => {
        showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`);
      });
    }
  }

  // ── Enhanced Render Functions ────────────────────────────────────────────────
  function renderStats() {
    const stats = calcStats();
    const currentBankroll = bankroll + stats.pnl;
    const riskLevel = assessRiskLevel();

    document.getElementById('stat-bankroll').textContent = '£' + currentBankroll.toFixed(2);
    document.getElementById('stat-bankroll').style.cursor = 'pointer';
    document.getElementById('stat-units').textContent = stats.unitsPnl.toFixed(2) + 'u';
    document.getElementById('stat-staked').textContent = fmt(stats.totalStaked);
    document.getElementById('stat-returns').textContent = fmt(stats.totalReturns);

    const pnlEl = document.getElementById('stat-pnl');
    pnlEl.textContent = fmtPnl(stats.pnl);
    pnlEl.className = 'value ' + (stats.pnl >= 0 ? 'pnl-positive' : 'pnl-negative');

    document.getElementById('stat-roi').textContent = pct(stats.roi);
    document.getElementById('stat-winrate').textContent = pct(stats.winRate);
    document.getElementById('stat-ev').textContent = pct(stats.expectedValue);
    document.getElementById('stat-avgodds').textContent = stats.avgOdds > 0 ? stats.avgOdds.toFixed(2) : '—';
    document.getElementById('stat-clv').textContent = stats.clv !== 0 ? pct(stats.clv) : '—';
    
    const riskEl = document.getElementById('stat-risk');
    riskEl.textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
    riskEl.className = 'value risk-' + riskLevel;

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
        
        // Phase 2: ML and Achievement Integration for new bets
        updateMLModelsWithBet(bet);
        checkSmartRecommendationsAfterBet(bet);
        
        // Update achievement engine
        if (window.AchievementEngine) {
          const achievementEngine = new AchievementEngine();
          achievementEngine.checkAndUnlockAchievements('betting-tracker', 'create', bet);
          achievementEngine.updateStreak('betting-tracker', { type: 'bet', sport: bet.sport });
        }
        
        // Sync to Hawk Central
        if (typeof HawkServices !== 'undefined') {
          HawkServices.sync.queueSync('betting-tracker', 'create', {
            sport: bet.sport,
            type: bet.type,
            stake: bet.stake,
            odds: bet.odds,
            date: bet.date
          });
          HawkServices.analytics.trackEvent('betting-tracker', 'add_bet', bet.sport, 1, 'betting-tracker');
        }
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
})();nst form = document.getElementById('bet-form');
    document.getElementById('bet-date').value = todayStr();

    // Add event listeners for stake suggestions
    const stakeInput = document.getElementById('bet-stake');
    const oddsInput = document.getElementById('bet-odds');
    const probInput = document.getElementById('bet-expected-prob');
    const unitsInput = document.getElementById('bet-units');

    function updateStakeSuggestion() {
      const odds = parseFloat(oddsInput.value);
      const prob = parseFloat(probInput.value);
      const suggestion = document.getElementById('stake-suggestion');
      
      if (odds && prob) {
        const stakeAdvice = suggestStake(odds, prob);
        if (stakeAdvice) {
          suggestion.textContent = stakeAdvice.message;
          suggestion.style.color = stakeAdvice.type === 'avoid' ? 'var(--red)' : 'var(--accent)';
        }
      } else {
        suggestion.textContent = '';
      }
    }

    function updateUnitsFromStake() {
      const stake = parseFloat(stakeInput.value);
      if (stake && unitSize > 0) {
        unitsInput.value = (stake / unitSize).toFixed(1);
      }
    }

    function updateStakeFromUnits() {
      const units = parseFloat(unitsInput.value);
      if (units && unitSize > 0) {
        stakeInput.value = (units * unitSize).toFixed(2);
      }
    }

    oddsInput.addEventListener('input', updateStakeSuggestion);
    probInput.addEventListener('input', updateStakeSuggestion);
    stakeInput.addEventListener('input', updateUnitsFromStake);
    unitsInput.addEventListener('input', updateStakeFromUnits);

    // Odds converter
    const decimalInput = document.getElementById('convert-decimal');
    if (decimalInput) {
      decimalInput.addEventListener('input', function() {
        const decimal = parseFloat(this.value);
        if (decimal && decimal >= 1) {
          const fractional = decimalToFractional(decimal);
          const american = decimalToAmerican(decimal);
          const probability = (1 / decimal * 100).toFixed(1);
          
          document.getElementById('convert-fractional').value = fractional;
          document.getElementById('convert-american').value = american;
          document.getElementById('convert-probability').value = probability + '%';
        }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      // Check risk limits before adding bet
      const stake = parseFloat(document.getElementById('bet-stake').value) || 0;
      const result = document.getElementById('bet-result').value;
      
      if (result === 'loss' && !checkLossLimits(stake)) {
        showNotification('❌ This bet would exceed your loss limits!', 'error');
        return;
      }

      const bet = {
        id: editingId || generateId(),
        date: document.getElementById('bet-date').value,
        sport: document.getElementById('bet-sport').value,
        type: document.getElementById('bet-type').value,
        market: document.getElementById('bet-market').value,
        league: document.getElementById('bet-league').value.trim(),
        description: document.getElementById('bet-description').value.trim(),
        stake: stake,
        units: parseFloat(document.getElementById('bet-units').value) || stake / unitSize,
        odds: parseFloat(document.getElementById('bet-odds').value) || 0,
        closingOdds: parseFloat(document.getElementById('bet-closing-odds').value) || null,
        expectedProb: parseFloat(document.getElementById('bet-expected-prob').value) || null,
        returns: parseFloat(document.getElementById('bet-returns').value) || 0,
        cashout: parseFloat(document.getElementById('bet-cashout').value) || 0,
        result: result,
        bookmaker: document.getElementById('bet-bookmaker').value,
        value: document.getElementById('bet-value').value,
        tipster: document.getElementById('bet-tipster').value.trim(),
        confidence: document.getElementById('bet-confidence').value,
        freebet: document.getElementById('bet-freebet').checked,
        inplay: document.getElementById('bet-inplay').checked,
        eachway: document.getElementById('bet-eachway').checked,
        emotionalState: document.getElementById('bet-emotional-state').value,
        notes: document.getElementById('bet-notes').value.trim()
      };

      if (editingId) {
        const index = bets.findIndex(b => b.id === editingId);
        if (index >= 0) bets[index] = bet;
        editingId = null;
        document.getElementById('form-title').textContent = 'Add Bet';
        document.getElementById('form-submit-btn').textContent = 'Add Bet';
        document.getElementById('cancel-edit').style.display = 'none';
      } else {
        bets.push(bet);
      }

      saveBets();
      checkAchievements();
      form.reset();
      document.getElementById('bet-date').value = todayStr();
      render();
      showNotification('✅ Bet saved successfully!');
    });
  }
  // ── Utility Functions ────────────────────────────────────────────────────────
  function decimalToFractional(decimal) {
    const num = decimal - 1;
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const denominator = 100;
    const numerator = Math.round(num * denominator);
    const divisor = gcd(numerator, denominator);
    return `${numerator / divisor}/${denominator / divisor}`;
  }

  function decimalToAmerican(decimal) {
    if (decimal >= 2) {
      return '+' + Math.round((decimal - 1) * 100);
    } else {
      return '-' + Math.round(100 / (decimal - 1));
    }
  }

  function checkLossLimits(additionalLoss) {
    const limits = getLossLimits();
    const { dailyLossLimit, weeklyLossLimit, monthlyLossLimit } = riskSettings;

    if (limits.dailyLosses + additionalLoss > dailyLossLimit) {
      return false;
    }
    if (limits.weeklyLosses + additionalLoss > weeklyLossLimit) {
      return false;
    }
    if (limits.monthlyLosses + additionalLoss > monthlyLossLimit) {
      return false;
    }
    return true;
  }

  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'error' ? 'var(--red)' : 'var(--green)'};
      color: white;
      border-radius: var(--radius-sm);
      z-index: 10000;
      font-weight: 600;
      font-size: 0.85rem;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // ── Goals Management ──────────────────────────────────────────────────────────
  function renderGoals() {
    const grid = document.getElementById('goals-grid');
    if (goals.length === 0) {
      grid.innerHTML = '<div class="empty-state">No goals set yet. Click "Add Goal" to get started.</div>';
      return;
    }

    grid.innerHTML = goals.map(goal => {
      const progress = calculateGoalProgress(goal);
      const progressPercent = Math.min((progress / goal.target) * 100, 100);
      const isCompleted = progress >= goal.target;

      return `
        <div class="goal-card ${isCompleted ? 'completed' : ''}">
          <div class="goal-card-header">
            <div class="goal-title">${goal.description}</div>
            <div class="goal-type">${goal.type}</div>
          </div>
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
          </div>
          <div class="goal-stats">
            <span>${progress.toFixed(1)} / ${goal.target}</span>
            <span>${progressPercent.toFixed(0)}%</span>
          </div>
          <button onclick="BetApp.deleteGoal('${goal.id}')" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: var(--muted); cursor: pointer;">×</button>
        </div>
      `;
    }).join('');
  }

  function calculateGoalProgress(goal) {
    const stats = calcStats();
    const now = new Date();
    const targetDate = new Date(goal.date);
    
    // Filter bets based on goal timeframe
    let relevantBets = bets;
    if (goal.type === 'profit') {
      const monthStart = goal.date.slice(0, 7) + '-01';
      relevantBets = getSettled().filter(b => b.date >= monthStart && b.date <= goal.date);
      return calcStats(relevantBets).pnl;
    } else if (goal.type === 'roi') {
      return stats.roi;
    } else if (goal.type === 'winrate') {
      return stats.winRate;
    } else if (goal.type === 'units') {
      return stats.unitsPnl;
    }
    return 0;
  }

  // ── Tools Functions ───────────────────────────────────────────────────────────
  function calculateKelly() {
    const bankrollInput = document.getElementById('kelly-bankroll');
    const oddsInput = document.getElementById('kelly-odds');
    const probInput = document.getElementById('kelly-prob');
    const result = document.getElementById('kelly-result');

    const bankroll = parseFloat(bankrollInput.value);
    const odds = parseFloat(oddsInput.value);
    const prob = parseFloat(probInput.value) / 100;

    if (!bankroll || !odds || !prob) {
      result.innerHTML = '<span style="color: var(--red)">Please fill all fields</span>';
      return;
    }

    const kellyFraction = ((odds * prob) - 1) / (odds - 1);
    const kellyStake = bankroll * kellyFraction;

    if (kellyFraction <= 0) {
      result.innerHTML = '<span style="color: var(--red)">No edge detected - avoid this bet</span>';
    } else {
      result.innerHTML = `
        <div style="color: var(--green)">
          <strong>Kelly Fraction:</strong> ${(kellyFraction * 100).toFixed(2)}%<br>
          <strong>Suggested Stake:</strong> £${kellyStake.toFixed(2)}
        </div>
      `;
    }
  }

  function calculateArbitrage() {
    const oddsA = parseFloat(document.getElementById('arb-odds-a').value);
    const oddsB = parseFloat(document.getElementById('arb-odds-b').value);
    const totalStake = parseFloat(document.getElementById('arb-stake').value);
    const result = document.getElementById('arb-result');

    if (!oddsA || !oddsB || !totalStake) {
      result.innerHTML = '<span style="color: var(--red)">Please fill all fields</span>';
      return;
    }

    const impliedProbA = 1 / oddsA;
    const impliedProbB = 1 / oddsB;
    const totalImplied = impliedProbA + impliedProbB;

    if (totalImplied >= 1) {
      result.innerHTML = '<span style="color: var(--red)">No arbitrage opportunity</span>';
      return;
    }

    const stakeA = (impliedProbA / totalImplied) * totalStake;
    const stakeB = (impliedProbB / totalImplied) * totalStake;
    const profit = totalStake * ((1 / totalImplied) - 1);

    result.innerHTML = `
      <div style="color: var(--green)">
        <strong>Stake A:</strong> £${stakeA.toFixed(2)}<br>
        <strong>Stake B:</strong> £${stakeB.toFixed(2)}<br>
        <strong>Guaranteed Profit:</strong> £${profit.toFixed(2)} (${((profit / totalStake) * 100).toFixed(2)}%)
      </div>
    `;
  }

  function calculateEV() {
    const odds = parseFloat(document.getElementById('ev-odds').value);
    const trueProb = parseFloat(document.getElementById('ev-true-prob').value) / 100;
    const result = document.getElementById('ev-result');

    if (!odds || !trueProb) {
      result.innerHTML = '<span style="color: var(--red)">Please fill all fields</span>';
      return;
    }

    const impliedProb = 1 / odds;
    const ev = (trueProb * odds) - 1;
    const evPercent = ev * 100;

    const color = evPercent > 0 ? 'var(--green)' : 'var(--red)';
    result.innerHTML = `
      <div style="color: ${color}">
        <strong>Expected Value:</strong> ${evPercent.toFixed(2)}%<br>
        <strong>Implied Probability:</strong> ${(impliedProb * 100).toFixed(1)}%<br>
        <strong>Edge:</strong> ${((trueProb - impliedProb) * 100).toFixed(1)}%
      </div>
    `;
  }
  // ── Risk Management ───────────────────────────────────────────────────────────
  function renderRisk() {
    const riskLevel = assessRiskLevel();
    const limits = getLossLimits();
    
    // Update risk indicator
    const riskIndicator = document.getElementById('current-risk-level');
    riskIndicator.textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
    riskIndicator.className = 'risk-level ' + riskLevel;

    // Update progress bars
    updateProgressBar('daily-loss-progress', 'daily-loss-text', limits.dailyLosses, riskSettings.dailyLossLimit);
    updateProgressBar('weekly-loss-progress', 'weekly-loss-text', limits.weeklyLosses, riskSettings.weeklyLossLimit);

    // Update risk settings form
    document.getElementById('daily-loss-limit').value = riskSettings.dailyLossLimit;
    document.getElementById('weekly-loss-limit').value = riskSettings.weeklyLossLimit;
    document.getElementById('monthly-loss-limit').value = riskSettings.monthlyLossLimit;
    document.getElementById('max-bet-percent').value = riskSettings.maxBetPercent;
    document.getElementById('enable-cooling-off').checked = riskSettings.enableCoolingOff;

    renderRiskAlerts();
    renderRiskChart();
  }

  function updateProgressBar(progressId, textId, current, limit) {
    const progressBar = document.getElementById(progressId);
    const progressText = document.getElementById(textId);
    const percentage = Math.min((current / limit) * 100, 100);
    
    progressBar.style.width = percentage + '%';
    progressBar.style.backgroundColor = percentage > 80 ? 'var(--red)' : 
                                       percentage > 60 ? 'var(--yellow)' : 'var(--green)';
    progressText.textContent = `£${current.toFixed(0)} / £${limit}`;
  }

  function renderRiskAlerts() {
    const alerts = document.getElementById('risk-alerts');
    const riskLevel = assessRiskLevel();
    const limits = getLossLimits();
    const stats = calcStats();
    const alertList = [];

    if (riskLevel === 'high') {
      alertList.push({ 
        type: 'error', 
        icon: '🚨', 
        text: 'High risk detected! Consider reducing your stake sizes or taking a break.' 
      });
    }

    if (limits.dailyLosses / riskSettings.dailyLossLimit > 0.8) {
      alertList.push({ 
        type: 'warning', 
        icon: '⚠️', 
        text: `You're close to your daily loss limit (${((limits.dailyLosses / riskSettings.dailyLossLimit) * 100).toFixed(0)}%)` 
      });
    }

    if (stats.streak >= 3 && stats.streakType === 'loss') {
      alertList.push({ 
        type: 'warning', 
        icon: '📉', 
        text: `You're on a ${stats.streak}-bet losing streak. Consider taking a break.` 
      });
    }

    if (alertList.length === 0) {
      alertList.push({ 
        type: 'info', 
        icon: '✅', 
        text: 'No risk alerts. You\'re betting within safe limits.' 
      });
    }

    alerts.innerHTML = alertList.map(alert => `
      <div class="risk-alert ${alert.type}">
        <span class="alert-icon">${alert.icon}</span>
        <span class="alert-text">${alert.text}</span>
      </div>
    `).join('');
  }

  function renderRiskChart() {
    const canvas = document.getElementById('risk-chart');
    if (!canvas) return;

    const settled = getSettled().slice(-30); // Last 30 bets
    if (settled.length === 0) {
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = '';
    let runningRisk = 0;
    const labels = [];
    const riskData = [];

    settled.forEach((bet, i) => {
      const bankrollAtTime = bankroll + calcStats(settled.slice(0, i)).pnl;
      const riskPercent = bankrollAtTime > 0 ? (bet.stake / bankrollAtTime) * 100 : 0;
      runningRisk = riskPercent;
      labels.push(`Bet ${i + 1}`);
      riskData.push(parseFloat(runningRisk.toFixed(2)));
    });

    const ctx = canvas.getContext('2d');
    if (riskChart) riskChart.destroy();
    riskChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Risk per Bet (%)',
          data: riskData,
          borderColor: 'var(--orange)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: true,
          tension: 0.3
        }, {
          label: 'Safe Limit',
          data: new Array(labels.length).fill(riskSettings.maxBetPercent),
          borderColor: 'var(--red)',
          borderDash: [5, 5],
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.4)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { 
            ticks: { color: 'rgba(255,255,255,0.4)', callback: v => v + '%' }, 
            grid: { color: 'rgba(255,255,255,0.05)' } 
          }
        }
      }
    });
  }

  // ── Enhanced Table and Filtering ─────────────────────────────────────────────
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
        (b.notes || '').toLowerCase().includes(search) ||
        (b.market || '').toLowerCase().includes(search)
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
        case 'pnl': 
          av = (a.returns || a.cashout || 0) - a.stake; 
          bv = (b.returns || b.cashout || 0) - b.stake; 
          break;
        default: av = a.date; bv = b.date;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

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
      const betPnl = ['pending', 'void'].includes(b.result) ? 0 : 
                     (b.returns || b.cashout || 0) - b.stake;
      const pnlClass = betPnl > 0 ? 'pnl-positive' : betPnl < 0 ? 'pnl-negative' : 'pnl-zero';
      
      // Enhanced display with new fields
      const displayUnits = b.units ? ` (${b.units.toFixed(1)}u)` : '';
      const displayMarket = b.market ? ` • ${b.market}` : '';
      const clvIndicator = b.closingOdds && b.closingOdds > b.odds ? ' 📈' : 
                          b.closingOdds && b.closingOdds < b.odds ? ' 📉' : '';
      
      return `<tr>
        <td>${b.date}</td>
        <td>${b.sport || '—'}</td>
        <td>${b.type || '—'}${displayMarket}</td>
        <td title="${escHtml(b.description)}">${truncate(b.description, 35)}${clvIndicator}</td>
        <td>${b.league || '—'}</td>
        <td>£${b.stake.toFixed(2)}${displayUnits}</td>
        <td>${b.odds.toFixed(2)}</td>
        <td><span class="result-badge ${b.result}">${b.result}</span></td>
        <td class="${pnlClass}">${['pending', 'void'].includes(b.result) ? '—' : fmtPnl(betPnl)}</td>
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
  // ── Enhanced Insights ─────────────────────────────────────────────────────────
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

    // Enhanced insights with new features
    
    // Market performance analysis
    const marketGroups = {};
    settled.forEach(b => {
      const k = b.market || 'Other';
      if (!marketGroups[k]) marketGroups[k] = [];
      marketGroups[k].push(b);
    });
    
    let bestMarket = '', bestMarketRoi = -Infinity;
    Object.keys(marketGroups).forEach(k => {
      if (marketGroups[k].length >= 3) {
        const s = calcStats(marketGroups[k]);
        if (s.roi > bestMarketRoi) { bestMarketRoi = s.roi; bestMarket = k; }
      }
    });
    
    if (bestMarket) {
      insights.push({ 
        icon: '🎯', 
        title: 'Best Market', 
        body: `<strong>${bestMarket}</strong> is your most profitable market with <strong>${pct(bestMarketRoi)}</strong> ROI.` 
      });
    }

    // Emotional state analysis
    const emotionalGroups = {};
    settled.forEach(b => {
      if (b.emotionalState) {
        const k = b.emotionalState;
        if (!emotionalGroups[k]) emotionalGroups[k] = [];
        emotionalGroups[k].push(b);
      }
    });
    
    Object.keys(emotionalGroups).forEach(state => {
      if (emotionalGroups[state].length >= 3) {
        const s = calcStats(emotionalGroups[state]);
        if (s.roi < -10) {
          insights.push({ 
            icon: '😤', 
            title: 'Emotional Impact', 
            body: `When you're <strong>${state}</strong>, your ROI drops to <strong>${pct(s.roi)}</strong>. Consider avoiding bets in this state.` 
          });
        }
      }
    });

    // Expected Value vs Reality
    const evBets = settled.filter(b => b.expectedProb);
    if (evBets.length >= 5) {
      const avgExpectedEv = stats.expectedValue;
      const actualRoi = calcStats(evBets).roi;
      const variance = actualRoi - avgExpectedEv;
      
      insights.push({ 
        icon: '📊', 
        title: 'EV Accuracy', 
        body: `Your expected ROI was <strong>${pct(avgExpectedEv)}</strong> but actual is <strong>${pct(actualRoi)}</strong>. Variance: <strong>${pct(variance)}</strong>` 
      });
    }

    // Closing Line Value insight
    const clvBets = settled.filter(b => b.closingOdds);
    if (clvBets.length >= 5) {
      const avgClv = clvBets.reduce((sum, b) => sum + ((b.closingOdds - b.odds) / b.odds * 100), 0) / clvBets.length;
      insights.push({ 
        icon: '📈', 
        title: 'Closing Line Value', 
        body: `Average CLV: <strong>${pct(avgClv)}</strong>. ${avgClv > 2 ? 'Excellent! You\'re beating the closing lines.' : 'Try to improve your line shopping.'}` 
      });
    }

    // Unit consistency
    const unitBets = settled.filter(b => b.units);
    if (unitBets.length >= 10) {
      const avgUnits = unitBets.reduce((sum, b) => sum + b.units, 0) / unitBets.length;
      const unitVariance = unitBets.reduce((sum, b) => sum + Math.pow(b.units - avgUnits, 2), 0) / unitBets.length;
      
      if (unitVariance < 0.5) {
        insights.push({ 
          icon: '⚖️', 
          title: 'Staking Discipline', 
          body: `Excellent unit discipline! Average stake: <strong>${avgUnits.toFixed(1)}u</strong> with low variance.` 
        });
      }
    }

    grid.innerHTML = insights.map(i => `
      <div class="insight-card">
        <div class="insight-card-title">${i.icon} ${i.title}</div>
        <div class="insight-card-body">${i.body}</div>
      </div>
    `).join('') || '<div class="insight-card"><div class="insight-card-body">Keep adding bets to unlock more insights.</div></div>';

    // Enhanced patterns with new data
    const patternItems = [];
    
    if (stats.streak >= 3 && stats.streakType === 'loss') {
      patternItems.push({ 
        icon: '🔥', 
        text: `You're on a <strong>${stats.streak}-loss streak</strong>. Consider reducing stakes or taking a break.` 
      });
    }
    
    if (stats.streak >= 3 && stats.streakType === 'win') {
      patternItems.push({ 
        icon: '🎉', 
        text: `Hot streak! <strong>${stats.streak} wins in a row</strong>. Stay disciplined and don't increase stakes dramatically.` 
      });
    }

    // Recent form analysis
    const last10 = settled.slice(-10);
    if (last10.length === 10) {
      const last10Stats = calcStats(last10);
      const recentForm = last10Stats.roi > stats.roi ? '📈 Improving' : '📉 Declining';
      patternItems.push({ 
        icon: recentForm.split(' ')[0], 
        text: `Recent form (last 10): <strong>${last10Stats.wins}/10</strong> wins, <strong>${fmtPnl(last10Stats.pnl)}</strong> P&L. ${recentForm.split(' ')[1]} performance.` 
      });
    }

    patterns.innerHTML = patternItems.map(p => `
      <div class="insight-card">
        <div class="insight-card-body">${p.icon} ${p.text}</div>
      </div>
    `).join('') || '<div class="insight-card"><div class="insight-card-body">More patterns will appear as you log more bets.</div></div>';

    // Enhanced alerts
    renderAdvancedAlerts(alerts, stats, settled);
  }

  function renderAdvancedAlerts(alertsContainer, stats, settled) {
    const alertItems = [];
    const limits = getLossLimits();

    // Risk-based alerts
    if (stats.roi < -20 && settled.length >= 10) {
      alertItems.push({ 
        icon: '🚨', 
        text: `Your ROI is <strong>${pct(stats.roi)}</strong>. Consider reviewing your strategy or taking a break.` 
      });
    }

    // Loss limit warnings
    if (limits.dailyLosses / riskSettings.dailyLossLimit > 0.8) {
      alertItems.push({ 
        icon: '⚠️', 
        text: `Approaching daily loss limit: <strong>£${limits.dailyLosses.toFixed(0)}</strong> of £${riskSettings.dailyLossLimit}` 
      });
    }

    // Variance alerts
    if (settled.length >= 20) {
      const expectedWins = settled.reduce((sum, b) => {
        const prob = b.expectedProb ? b.expectedProb / 100 : 1 / b.odds;
        return sum + prob;
      }, 0);
      const actualWins = stats.wins;
      const variance = Math.abs(actualWins - expectedWins);
      
      if (variance > Math.sqrt(expectedWins) * 2) {
        alertItems.push({ 
          icon: '📊', 
          text: `High variance detected. Expected <strong>${expectedWins.toFixed(1)}</strong> wins, got <strong>${actualWins}</strong>. This could be luck (good or bad).` 
        });
      }
    }

    // Staking inconsistency
    const stakes = settled.map(b => b.stake);
    const avgStake = stakes.reduce((a, b) => a + b, 0) / stakes.length;
    const stakeVariance = stakes.reduce((sum, stake) => sum + Math.pow(stake - avgStake, 2), 0) / stakes.length;
    
    if (stakeVariance > avgStake * 2 && settled.length >= 10) {
      alertItems.push({ 
        icon: '📏', 
        text: `Inconsistent staking detected. Consider using unit-based staking for better bankroll management.` 
      });
    }

    alertsContainer.innerHTML = alertItems.map(a => `
      <div class="alert-card">
        <div class="alert-icon">${a.icon}</div>
        <div class="alert-text">${a.text}</div>
      </div>
    `).join('') || '<div class="alert-card"><div class="alert-icon">✅</div><div class="alert-text">No alerts right now. Keep up the good work!</div></div>';
  }
  // ── Education Functions ──────────────────────────────────────────────────────
  function showGlossary() {
    const modal = document.getElementById('glossary-modal');
    const content = document.getElementById('glossary-content');
    
    const glossaryTerms = [
      { term: 'ROI', definition: 'Return on Investment - the percentage of profit relative to the amount staked' },
      { term: 'Expected Value (EV)', definition: 'The average amount you expect to win or lose per bet in the long run' },
      { term: 'Closing Line Value (CLV)', definition: 'How your betting odds compare to the final odds before an event starts' },
      { term: 'Kelly Criterion', definition: 'A mathematical formula for determining optimal bet sizing based on edge and odds' },
      { term: 'Variance', definition: 'The natural fluctuation in results due to random chance' },
      { term: 'Bankroll Management', definition: 'The practice of managing your betting funds to survive losing streaks' },
      { term: 'Unit', definition: 'A standardized betting amount, typically 1-5% of your bankroll' },
      { term: 'Sharp', definition: 'A professional or highly skilled bettor who consistently profits' },
      { term: 'Public Money', definition: 'Bets placed by recreational bettors, often creating line movement' },
      { term: 'Arbitrage', definition: 'Betting on all outcomes of an event at different bookmakers to guarantee profit' },
      { term: 'Hedge', definition: 'Placing a bet on the opposite outcome to reduce risk or guarantee profit' },
      { term: 'Steam', definition: 'Sudden line movement across multiple bookmakers, often indicating sharp money' }
    ];

    content.innerHTML = glossaryTerms.map(item => `
      <div class="glossary-term">
        <div class="glossary-word">${item.term}</div>
        <div>${item.definition}</div>
      </div>
    `).join('');

    modal.style.display = 'flex';
  }

  function showStrategies() {
    const modal = document.getElementById('strategy-modal');
    const content = document.getElementById('strategy-content');
    
    content.innerHTML = `
      <div class="strategy-section">
        <h4>Bankroll Management</h4>
        <p>Never bet more than 1-5% of your bankroll on a single bet. This helps you survive inevitable losing streaks and allows your edge to show over time.</p>
      </div>
      
      <div class="strategy-section">
        <h4>Value Betting</h4>
        <p>Only bet when you believe the true probability is higher than the implied probability of the odds. This gives you positive expected value.</p>
      </div>
      
      <div class="strategy-section">
        <h4>Line Shopping</h4>
        <p>Compare odds across multiple bookmakers to get the best price. Even small differences compound over time.</p>
      </div>
      
      <div class="strategy-section">
        <h4>Record Keeping</h4>
        <p>Track everything: stakes, odds, results, reasoning. This data helps you identify strengths and weaknesses in your approach.</p>
      </div>
      
      <div class="strategy-section">
        <h4>Emotional Discipline</h4>
        <p>Avoid betting when emotional (tilted, frustrated, overconfident). Stick to your pre-planned staking strategy.</p>
      </div>
      
      <div class="strategy-section">
        <h4>Specialization</h4>
        <p>Focus on sports/markets you understand well rather than betting on everything. Deep knowledge creates edge.</p>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function showVariance() {
    const settled = getSettled();
    if (settled.length < 10) {
      showNotification('Need at least 10 settled bets for variance analysis', 'error');
      return;
    }

    const stats = calcStats();
    const expectedWins = settled.reduce((sum, bet) => {
      const impliedProb = 1 / bet.odds;
      return sum + impliedProb;
    }, 0);

    const variance = Math.abs(stats.wins - expectedWins);
    const standardDeviation = Math.sqrt(expectedWins * (1 - (expectedWins / settled.length)));
    const zScore = variance / standardDeviation;

    let interpretation = '';
    if (zScore < 1) interpretation = 'Results are within normal variance';
    else if (zScore < 2) interpretation = 'Slight deviation - could be luck';
    else if (zScore < 3) interpretation = 'Significant deviation - investigate further';
    else interpretation = 'Extreme deviation - likely skill or major error';

    showNotification(`Variance Analysis: Expected ${expectedWins.toFixed(1)} wins, got ${stats.wins}. ${interpretation}`, 'success');
  }

  // ── Event Handlers and Navigation ────────────────────────────────────────────
  function setupEventHandlers() {
    // Tab navigation
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tab = this.dataset.maintab;
        switchTab(tab);
      });
    });

    // Modal handlers
    document.getElementById('bank-save').addEventListener('click', function() {
      bankroll = parseFloat(document.getElementById('bank-amount').value) || 50;
      unitSize = parseFloat(document.getElementById('unit-size').value) || 5;
      saveBankroll();
      saveUnitSize();
      document.getElementById('bank-modal').style.display = 'none';
      render();
    });

    document.getElementById('goal-save').addEventListener('click', function() {
      const goal = {
        id: generateId(),
        type: document.getElementById('goal-type').value,
        target: parseFloat(document.getElementById('goal-target').value),
        date: document.getElementById('goal-date').value,
        description: document.getElementById('goal-description').value
      };
      goals.push(goal);
      saveGoals();
      document.getElementById('goal-modal').style.display = 'none';
      render();
    });

    // Close modals
    document.querySelectorAll('.btn-cancel, .modal-overlay').forEach(el => {
      el.addEventListener('click', function(e) {
        if (e.target === this) {
          this.closest('.modal-overlay').style.display = 'none';
        }
      });
    });

    // Bankroll click handler
    document.getElementById('stat-bankroll').addEventListener('click', function() {
      document.getElementById('bank-modal').style.display = 'flex';
    });

    // Add goal button
    document.getElementById('add-goal-btn').addEventListener('click', function() {
      document.getElementById('goal-modal').style.display = 'flex';
    });

    // Risk settings save
    document.getElementById('save-risk-settings').addEventListener('click', function() {
      riskSettings.dailyLossLimit = parseFloat(document.getElementById('daily-loss-limit').value);
      riskSettings.weeklyLossLimit = parseFloat(document.getElementById('weekly-loss-limit').value);
      riskSettings.monthlyLossLimit = parseFloat(document.getElementById('monthly-loss-limit').value);
      riskSettings.maxBetPercent = parseFloat(document.getElementById('max-bet-percent').value);
      riskSettings.enableCoolingOff = document.getElementById('enable-cooling-off').checked;
      saveRiskSettings();
      showNotification('Risk settings saved!');
      render();
    });

    // Calculator button handlers
    document.getElementById('kelly-calculate').addEventListener('click', calculateKelly);
    document.getElementById('arb-calculate').addEventListener('click', calculateArbitrage);
    document.getElementById('ev-calculate').addEventListener('click', calculateEV);

    // Education button handlers
    document.getElementById('show-glossary').addEventListener('click', showGlossary);
    document.getElementById('show-strategies').addEventListener('click', showStrategies);
    document.getElementById('show-variance').addEventListener('click', showVariance);
  }

  function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.main-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-maintab="${tabName}"]`).classList.add('active');

    // Show/hide tab content
    document.querySelectorAll('.main-tab-content').forEach(content => {
      content.style.display = 'none';
    });
    document.getElementById(`tab-${tabName}`).style.display = 'block';

    // Render tab-specific content
    if (tabName === 'analysis') renderAnalysis();
    else if (tabName === 'insights') renderInsights();
    else if (tabName === 'goals') { renderGoals(); renderAchievements(); }
    else if (tabName === 'risk') renderRisk();
    else if (tabName === 'pending') renderPending();
  }

  function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = achievements.map(achievement => `
      <div class="achievement-card ${achievement.unlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
        ${achievement.target ? `
          <div class="achievement-progress">
            ${achievement.progress || 0} / ${achievement.target}
          </div>
        ` : ''}
      </div>
    `).join('');
  }
  // ── Remaining Core Functions ─────────────────────────────────────────────────
  function populateFilters() {
    const sports = [...new Set(bets.map(b => b.sport).filter(Boolean))].sort();
    const types = [...new Set(bets.map(b => b.type).filter(Boolean))].sort();
    const bookmakers = [...new Set(bets.map(b => b.bookmaker).filter(Boolean))].sort();

    fillSelect('filter-sport', sports, 'All Sports');
    fillSelect('filter-type', types, 'All Types');
    fillSelect('filter-bookmaker', bookmakers, 'All Bookmakers');

    // Enhanced datalists
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

    list.innerHTML = pending.map(b => {
      const potentialReturn = b.stake * b.odds;
      const units = b.units || (b.stake / unitSize);
      return `
        <div class="pending-card">
          <div class="pending-info">
            <div class="pending-desc">${escHtml(b.description)}</div>
            <div class="pending-meta">
              ${b.date} • ${b.sport} • £${b.stake.toFixed(2)} (${units.toFixed(1)}u) @ ${b.odds.toFixed(2)} • 
              Potential: £${potentialReturn.toFixed(2)} • 
              ${b.market ? b.market + ' • ' : ''}
              ${b.confidence ? b.confidence + '⭐ • ' : ''}
              ${b.tipster ? 'via ' + b.tipster : ''}
            </div>
          </div>
          <div class="pending-actions">
            <button class="btn-win" onclick="BetApp.settleResult('${b.id}','win')">✅ Won</button>
            <button class="btn-loss" onclick="BetApp.settleResult('${b.id}','loss')">❌ Lost</button>
          </div>
        </div>
      `;
    }).join('');
  }

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
      running += (b.returns || b.cashout || 0) - b.stake;
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

    if (settled.length === 0) { 
      tbody.innerHTML = ''; 
      empty.style.display = ''; 
      return; 
    }
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

    if (settled.length === 0) { 
      tbody.innerHTML = ''; 
      empty.style.display = ''; 
      return; 
    }
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
    if (settled.length === 0) { 
      container.innerHTML = '<p class="empty-state">No data yet.</p>'; 
      return; 
    }

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
      groups[k] += (b.returns || b.cashout || 0) - b.stake;
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
      groups[d] += (b.returns || b.cashout || 0) - b.stake;
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

  // ── Public API ────────────────────────────────────────────────────────────────
  function escHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function truncate(s, n) { return (s || '').length > n ? s.slice(0, n) + '…' : (s || ''); }

  function render() {
    renderStats();
    renderTable();
    populateFilters();
    
    // Update last updated timestamp
    document.getElementById('last-updated').textContent = 'Last updated: ' + new Date().toLocaleString();
  }

  // ── Public Methods ────────────────────────────────────────────────────────────
  window.BetApp = {
    // Core bet management
    edit: function(id) {
      const bet = bets.find(b => b.id === id);
      if (!bet) return;
      
      editingId = id;
      document.getElementById('bet-date').value = bet.date;
      document.getElementById('bet-sport').value = bet.sport || '';
      document.getElementById('bet-type').value = bet.type || '';
      document.getElementById('bet-market').value = bet.market || '';
      document.getElementById('bet-league').value = bet.league || '';
      document.getElementById('bet-description').value = bet.description || '';
      document.getElementById('bet-stake').value = bet.stake || '';
      document.getElementById('bet-units').value = bet.units || '';
      document.getElementById('bet-odds').value = bet.odds || '';
      document.getElementById('bet-closing-odds').value = bet.closingOdds || '';
      document.getElementById('bet-expected-prob').value = bet.expectedProb || '';
      document.getElementById('bet-returns').value = bet.returns || '';
      document.getElementById('bet-cashout').value = bet.cashout || '';
      document.getElementById('bet-result').value = bet.result || '';
      document.getElementById('bet-bookmaker').value = bet.bookmaker || '';
      document.getElementById('bet-value').value = bet.value || '';
      document.getElementById('bet-tipster').value = bet.tipster || '';
      document.getElementById('bet-confidence').value = bet.confidence || '';
      document.getElementById('bet-freebet').checked = bet.freebet || false;
      document.getElementById('bet-inplay').checked = bet.inplay || false;
      document.getElementById('bet-eachway').checked = bet.eachway || false;
      document.getElementById('bet-emotional-state').value = bet.emotionalState || '';
      document.getElementById('bet-notes').value = bet.notes || '';
      
      document.getElementById('form-title').textContent = 'Edit Bet';
      document.getElementById('form-submit-btn').textContent = 'Update Bet';
      document.getElementById('cancel-edit').style.display = '';
    },

    del: function(id) {
      if (confirm('Delete this bet?')) {
        bets = bets.filter(b => b.id !== id);
        saveBets();
        render();
      }
    },

    quickResult: function(id) {
      const bet = bets.find(b => b.id === id);
      if (!bet) return;
      
      document.getElementById('qr-id').value = id;
      document.getElementById('qr-result').value = bet.result;
      document.getElementById('qr-returns').value = bet.returns || '';
      document.getElementById('quick-result-modal').style.display = 'flex';
    },

    settleResult: function(id, result) {
      const bet = bets.find(b => b.id === id);
      if (!bet) return;
      
      bet.result = result;
      if (result === 'win') {
        bet.returns = bet.stake * bet.odds;
      } else if (result === 'loss') {
        bet.returns = 0;
      }
      
      saveBets();
      checkAchievements();
      render();
    },

    goPage: function(page) {
      currentPage = page;
      renderTable();
    },

    // Calculator functions
    calculateKelly: calculateKelly,
    calculateArbitrage: calculateArbitrage,
    calculateEV: calculateEV,

    // Education functions
    showGlossary: showGlossary,
    showStrategies: showStrategies,
    showVariance: showVariance,

    // Goal management
    deleteGoal: function(id) {
      goals = goals.filter(g => g.id !== id);
      saveGoals();
      render();
    },

    // Risk management
    saveRiskSettings: function() {
      // This is handled in setupEventHandlers
    },

    // CSV export/import
    exportCsv: function() {
      const headers = ['Date', 'Sport', 'Type', 'Market', 'League', 'Description', 'Stake', 'Units', 'Odds', 'ClosingOdds', 'ExpectedProb', 'Returns', 'Cashout', 'Result', 'Bookmaker', 'Value', 'Tipster', 'Confidence', 'FreeBet', 'InPlay', 'EachWay', 'EmotionalState', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...bets.map(b => [
          b.date, b.sport, b.type, b.market, b.league, `"${(b.description || '').replace(/"/g, '""')}"`,
          b.stake, b.units, b.odds, b.closingOdds || '', b.expectedProb || '', b.returns || '', b.cashout || '',
          b.result, b.bookmaker, b.value, b.tipster, b.confidence || '', b.freebet ? 'Yes' : 'No',
          b.inplay ? 'Yes' : 'No', b.eachway ? 'Yes' : 'No', b.emotionalState || '', `"${(b.notes || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `betting-tracker-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // ── Initialization ────────────────────────────────────────────────────────────
  function init() {
    loadData();
    setupForm();
    setupEventHandlers();
    render();

    // Set up period button handlers
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderPnlChart();
      });
    });

    // Set up breakdown tab handlers
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        breakdownTab = this.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderBreakdown();
      });
    });

    // Filter event handlers
    ['filter-search', 'filter-sport', 'filter-type', 'filter-result', 'filter-bookmaker'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        currentPage = 1;
        renderTable();
      });
    });

    // Sort handlers
    document.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', function() {
        const col = this.dataset.col;
        if (sortCol === col) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortCol = col;
          sortDir = 'desc';
        }
        renderTable();
      });
    });

    // Export/Import handlers
    document.getElementById('export-csv').addEventListener('click', window.BetApp.exportCsv);
    
    document.getElementById('import-btn').addEventListener('click', () => {
      document.getElementById('import-file').click();
    });

    // Additional modal handlers
    document.getElementById('qr-save').addEventListener('click', function() {
      const id = document.getElementById('qr-id').value;
      const result = document.getElementById('qr-result').value;
      const returns = parseFloat(document.getElementById('qr-returns').value) || 0;
      
      const bet = bets.find(b => b.id === id);
      if (bet) {
        bet.result = result;
        bet.returns = returns;
        saveBets();
        checkAchievements();
        render();
      }
      
      document.getElementById('quick-result-modal').style.display = 'none';
    });
  }

  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
// ═══════════════════════════════════════════════════════════════════
// Phase 2: ML and Smart Recommendations Integration
// ═══════════════════════════════════════════════════════════════════

async function updateMLModelsWithBet(bet) {
  if (window.MLEngine) {
    try {
      const mlEngine = new MLEngine();
      await mlEngine.trainAllModels();
      console.log('✅ ML models updated after bet addition');
    } catch (error) {
      console.log('ML training running in background');
    }
  }
}

async function checkSmartRecommendationsAfterBet(bet) {
  if (window.SmartNotificationSystem) {
    try {
      const notificationSystem = new SmartNotificationSystem();
      const recommendations = await notificationSystem.generateSmartNotifications();
      
      // Show high-priority recommendations immediately
      const highPriority = recommendations.filter(r => r.priority === 'high');
      highPriority.slice(0, 2).forEach(rec => {
        if (typeof HawkServices !== 'undefined') {
          HawkServices.notifications.addNotification(
            rec.type,
            rec.title,
            rec.message,
            rec.metadata
          );
        }
      });
    } catch (error) {
      console.log('Smart notifications running in background');
    }
  }
}

// Initialize Phase 2 features when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load ML models after main app is ready
  setTimeout(() => {
    if (window.MLEngine) {
      const mlEngine = new MLEngine();
      mlEngine.trainAllModels().then(() => {
        console.log('✅ Betting Tracker ML models initialized');
      }).catch(() => {
        console.log('ML initialization running in background');
      });
    }
  }, 2000);
});