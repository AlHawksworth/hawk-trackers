// ═══════════════════════════════════════════════════════════════════════════════
// BETTING TRACKER — Clean Implementation 
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // Load shared ML and analytics services
  if (typeof HawkServices !== 'undefined') {
    console.log('🚀 Betting Tracker: HawkServices integration active');
    
    // Initialize ML engine for betting analytics
    if (typeof MLEngine !== 'undefined') {
      MLEngine.init('betting-tracker', {
        features: ['bet_analytics', 'pattern_recognition', 'risk_assessment'],
        dataSource: 'betting_data'
      });
    }
    
    // Initialize AI insights for betting patterns
    if (typeof AIInsights !== 'undefined') {
      AIInsights.init('betting', {
        analysisTypes: ['bet_patterns', 'profitability_analysis', 'risk_assessment', 'market_insights'],
        updateInterval: 30000 // 30 seconds
      });
    }

    // Initialize smart notifications for betting
    if (typeof SmartNotifications !== 'undefined') {
      SmartNotifications.init('betting-tracker', {
        types: ['loss_alerts', 'profit_milestones', 'streak_notifications', 'risk_warnings'],
        preferences: { riskAlerts: true, streakNotifications: true }
      });
    }
  }

  // Constants and Storage Keys
  const LS_KEY = 'betting_tracker_bets';
  const LS_BANKROLL = 'betting_tracker_bankroll';
  const LS_UNIT_SIZE = 'betting_tracker_unit_size';
  const LS_GOALS = 'betting_tracker_goals';
  const LS_RISK_SETTINGS = 'betting_tracker_risk_settings';
  const LS_ACHIEVEMENTS = 'betting_tracker_achievements';
  const PAGE_SIZE = 20;

  // Global Variables
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
      totalUnits,
      unitsPnl,
      streak, 
      streakType 
    };
  }

  // ── Achievements System ──────────────────────────────────────────────────────
  function initializeAchievements() {
    return [
      { id: 'first_bet', name: 'First Steps', description: 'Place your first bet', icon: '🎯', unlocked: false },
      { id: 'ten_bets', name: 'Getting Started', description: 'Place 10 bets', icon: '📈', unlocked: false, progress: 0, target: 10 },
      { id: 'first_win', name: 'Winner', description: 'Win your first bet', icon: '✅', unlocked: false },
      { id: 'win_streak_5', name: 'Hot Streak', description: 'Win 5 bets in a row', icon: '🔥', unlocked: false },
      { id: 'roi_positive', name: 'Profitable', description: 'Achieve positive ROI', icon: '📊', unlocked: false }
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
        case 'roi_positive':
          if (stats.roi > 0 && settled.length >= 10) {
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

    document.getElementById('stat-bankroll').textContent = '£' + currentBankroll.toFixed(2);
    document.getElementById('stat-units').textContent = stats.unitsPnl.toFixed(2) + 'u';
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

    fillSelect('filter-sport', sports, 'All Sports');
    fillSelect('filter-type', types, 'All Types');

    // Datalists for autocomplete
    const leagues = [...new Set(bets.map(b => b.league).filter(Boolean))].sort();
    const tipsters = [...new Set(bets.map(b => b.tipster).filter(Boolean))].sort();
    
    if (document.getElementById('list-leagues')) {
      document.getElementById('list-leagues').innerHTML = leagues.map(l => `<option value="${escHtml(l)}">`).join('');
    }
    if (document.getElementById('list-tipsters')) {
      document.getElementById('list-tipsters').innerHTML = tipsters.map(t => `<option value="${escHtml(t)}">`).join('');
    }
  }

  function fillSelect(id, items, allLabel) {
    const el = document.getElementById(id);
    if (!el) return;
    const current = el.value;
    el.innerHTML = `<option value="all">${allLabel}</option>` + items.map(i => `<option value="${escHtml(i)}">${i}</option>`).join('');
    el.value = current || 'all';
  }

  // ── Pending Tab ──────────────────────────────────────────────────────────────
  function renderPending() {
    const pending = getPending().sort((a, b) => b.date.localeCompare(a.date));
    const list = document.getElementById('pending-list');
    const empty = document.getElementById('pending-empty');

    if (!list) return;

    if (pending.length === 0) {
      list.innerHTML = '';
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';

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

  // ── Form Handling ────────────────────────────────────────────────────────────
  function setupForm() {
    const form = document.getElementById('bet-form');
    if (!form) return;
    
    document.getElementById('bet-date').value = todayStr();

    // Cancel edit
    const cancelBtn = document.getElementById('cancel-edit');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        editingId = null;
        form.reset();
        document.getElementById('bet-date').value = todayStr();
        document.getElementById('form-title').textContent = 'Add Bet';
        document.getElementById('form-submit-btn').textContent = 'Add Bet';
        this.style.display = 'none';
      });
    }

    // Form submission - THIS IS THE KEY FIX!
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
        tipster: document.getElementById('bet-tipster').value.trim(),
        notes: document.getElementById('bet-notes').value.trim()
      };

      if (editingId) {
        const index = bets.findIndex(b => b.id === editingId);
        if (index >= 0) bets[index] = bet;
        editingId = null;
        document.getElementById('form-title').textContent = 'Add Bet';
        document.getElementById('form-submit-btn').textContent = 'Add Bet';
        if (cancelBtn) cancelBtn.style.display = 'none';
      } else {
        bets.push(bet);
        
        // ML and Achievement Integration
        if (typeof MLEngine !== 'undefined') {
          MLEngine.trackEvent('bet_placed', {
            sport: bet.sport,
            odds: bet.odds,
            stake: bet.stake,
            result: bet.result
          });
        }
      }

      saveBets();
      checkAchievements();
      form.reset();
      document.getElementById('bet-date').value = todayStr();
      render();
      showNotification('✅ Bet saved successfully!');
    });
  }
  // ── Actions ──────────────────────────────────────────────────────────────────
  function editBet(id) {
    const bet = bets.find(b => b.id === id);
    if (!bet) return;
    editingId = id;
    
    // Populate form fields
    Object.keys(bet).forEach(key => {
      const element = document.getElementById('bet-' + key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = bet[key] || false;
        } else {
          element.value = bet[key] || '';
        }
      }
    });

    document.getElementById('form-title').textContent = 'Edit Bet';
    document.getElementById('form-submit-btn').textContent = 'Save Changes';
    document.getElementById('cancel-edit').style.display = '';
    
    // Show form and focus
    const formBody = document.getElementById('form-body');
    if (formBody) formBody.classList.remove('hidden');
    const collapseBtn = document.getElementById('btn-collapse-form');
    if (collapseBtn) collapseBtn.classList.remove('collapsed');
    document.getElementById('bet-description').focus();
    
    // Switch to bets tab
    const betsTab = document.querySelector('[data-maintab="bets"]');
    if (betsTab) betsTab.click();
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
    const modal = document.getElementById('quick-result-modal');
    if (!modal) return;
    
    document.getElementById('qr-id').value = id;
    document.getElementById('qr-result').value = bet.result;
    document.getElementById('qr-returns').value = bet.returns || '';
    modal.style.display = '';
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
    const qrSave = document.getElementById('qr-save');
    if (qrSave) {
      qrSave.addEventListener('click', function () {
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
    }
    
    const qrCancel = document.getElementById('qr-cancel');
    if (qrCancel) {
      qrCancel.addEventListener('click', function () {
        document.getElementById('quick-result-modal').style.display = 'none';
      });
    }

    // Bankroll modal
    const bankrollStat = document.getElementById('stat-bankroll');
    if (bankrollStat) {
      bankrollStat.addEventListener('click', function () {
        document.getElementById('bank-amount').value = bankroll;
        document.getElementById('bank-modal').style.display = '';
      });
    }
    
    const bankSave = document.getElementById('bank-save');
    if (bankSave) {
      bankSave.addEventListener('click', function () {
        bankroll = parseFloat(document.getElementById('bank-amount').value) || 50;
        saveBankroll();
        document.getElementById('bank-modal').style.display = 'none';
        render();
      });
    }

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
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
          tabContent.style.display = '';
          // Render specific content based on tab
          if (this.dataset.maintab === 'pending') renderPending();
        }
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
    ['filter-search', 'filter-sport', 'filter-type', 'filter-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () { currentPage = 1; renderTable(); });
        el.addEventListener('change', function () { currentPage = 1; renderTable(); });
      }
    });
  }

  // ── Utility Functions ────────────────────────────────────────────────────────
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

  // ── Master Render ────────────────────────────────────────────────────────────
  function render() {
    renderStats();
    populateFilters();
    renderTable();
    renderPending();
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    loadData();
    setupForm();
    setupModals();
    setupTabs();
    setupSorting();
    setupFilters();
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

  // Register with HawkServices for navigation integration  
  if (typeof HawkServices !== 'undefined') {
    const stats = calcStats();
    
    HawkServices.registerApp('betting-tracker', {
      name: 'Betting Tracker',
      description: 'Advanced Betting Analytics',
      icon: '💰',
      stats: {
        bets: () => bets.length,
        pnl: () => stats.pnl.toFixed(2),
        roi: () => stats.roi.toFixed(1) + '%',
        winRate: () => stats.winRate.toFixed(1) + '%'
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();