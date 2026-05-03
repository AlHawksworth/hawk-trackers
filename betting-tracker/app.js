// ── State ──────────────────────────────────────────────────────────────────
let bets     = JSON.parse(localStorage.getItem('bets'))     || [];
let cashflow = JSON.parse(localStorage.getItem('cashflow')) || [];

// Cloud sync on load
if (typeof FireSync !== "undefined") {
  FireSync.load("bets", (d) => { if (d && Array.isArray(d)) { bets = d; renderAll(); } });
  FireSync.load("cashflow", (d) => { if (d && Array.isArray(d)) { cashflow = d; } });
}
let sortCol   = 'date';
let sortDir   = 'desc';
let activeTab = 'sport';
let currentPage = 1;
const PAGE_SIZE  = 25;
let pnlChart  = null;
let dowChart  = null;
let chartPeriod = 'all';
let formCollapsed = false;

// ── DOM ────────────────────────────────────────────────────────────────────
const betForm       = document.getElementById('bet-form');
const betTbody      = document.getElementById('bet-tbody');
const emptyState    = document.getElementById('empty-state');
const chartEmpty    = document.getElementById('chart-empty');
const breakdownCards= document.getElementById('breakdown-cards');
const filterSport   = document.getElementById('filter-sport');
const filterResult  = document.getElementById('filter-result');
const filterType    = document.getElementById('filter-type');
const filterSearch  = document.getElementById('filter-search');
const clearAllBtn   = document.getElementById('clear-all');
const exportBtn     = document.getElementById('export-csv');
const importBtn     = document.getElementById('import-btn');
const importFile    = document.getElementById('import-file');
const cancelEditBtn = document.getElementById('cancel-edit');
const formSubmitBtn = document.getElementById('form-submit-btn');
const formTitle     = document.getElementById('form-title');

document.getElementById('bet-date').valueAsDate = new Date();

// ── Auto-calculate returns ─────────────────────────────────────────────────
function autoCalcReturns() {
  const result  = document.getElementById('result').value;
  const stake   = parseFloat(document.getElementById('stake').value);
  const odds    = parseFloat(document.getElementById('odds').value);
  const returns = document.getElementById('returns');
  if (result === 'win' && stake > 0 && odds > 0 && !returns.value) {
    returns.value = (stake * odds).toFixed(2);
  }
  if (result === 'loss') returns.value = '';
}
document.getElementById('result').addEventListener('change', autoCalcReturns);
document.getElementById('stake').addEventListener('change', autoCalcReturns);
document.getElementById('odds').addEventListener('change', autoCalcReturns);

// ── Theme ──────────────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '🌙' : '☀️';

document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  document.getElementById('theme-toggle').textContent = next === 'dark' ? '🌙' : '☀️';
  renderChart(); renderDowChart();
});

// ── Keyboard Shortcut ──────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'a' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT') {
    switchMainTab('bets');
    if (formCollapsed) toggleFormCollapse();
    document.getElementById('sport').focus();
  }
});
document.getElementById('shortcut-add').addEventListener('click', () => {
  switchMainTab('bets');
  if (formCollapsed) toggleFormCollapse();
  document.getElementById('sport').focus();
});

// ── Collapsible Form ───────────────────────────────────────────────────────
document.getElementById('btn-collapse-form').addEventListener('click', toggleFormCollapse);

function toggleFormCollapse() {
  formCollapsed = !formCollapsed;
  document.getElementById('form-body').style.display = formCollapsed ? 'none' : 'block';
  document.getElementById('btn-collapse-form').textContent = formCollapsed ? '▼' : '▲';
}

// ── Sticky header shadow ───────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.querySelector('header').classList.toggle('scrolled', window.scrollY > 10);
});

// ── Main Tab Switching ─────────────────────────────────────────────────────
document.querySelectorAll('.main-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchMainTab(btn.dataset.maintab));
});

function switchMainTab(tab) {
  document.querySelectorAll('.main-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.maintab === tab);
  });
  document.querySelectorAll('.main-tab-content').forEach(c => c.style.display = 'none');
  document.getElementById('tab-' + tab).style.display = 'block';
  if (tab === 'analysis') { renderChart(); renderDowChart(); renderMonthly(); renderInsights(); }
  if (tab === 'pending')  renderPending();
}

// ── Init ───────────────────────────────────────────────────────────────────
init();

function init() {
  renderBets();
  renderBreakdown();
  updateSummary();
  populateSportFilter();
  renderCashflow();
  populateAutofill();
  renderPending();
}

// ── Helpers ────────────────────────────────────────────────────────────────
function calculateReturn(bet) { return bet.returns || 0; }
function calculatePnL(bet) {
  if (bet.result === 'pending') return 0;
  return (bet.returns || 0) - bet.stake;
}
function fmtMoney(val, sign = false) {
  const abs = `£${Math.abs(val).toFixed(2)}`;
  if (!sign) return val >= 0 ? abs : `-${abs}`;
  return val > 0 ? `+${abs}` : val < 0 ? `-${abs}` : '£0.00';
}
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function oddsRange(odds) {
  if (odds < 2)  return 'Odds-on (<2.0)';
  if (odds < 3)  return 'Evens–3.0';
  if (odds < 6)  return '3.0–6.0';
  if (odds < 11) return '6.0–11.0';
  return '11.0+';
}
function dayName(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long' });
}
function saveBets()     {
  if (typeof FireSync !== "undefined") { FireSync.save("bets", bets); }
  else { localStorage.setItem('bets', JSON.stringify(bets)); }
}
function saveCashflow() {
  if (typeof FireSync !== "undefined") { FireSync.save("cashflow", cashflow); }
  else { localStorage.setItem('cashflow', JSON.stringify(cashflow)); }
}

// ── Add / Edit Bet ─────────────────────────────────────────────────────────
let readdMode = false;

document.getElementById('btn-readd').addEventListener('click', () => {
  readdMode = true;
  betForm.requestSubmit();
});

betForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const editId = document.getElementById('edit-id').value;
  const data = {
    sport:      document.getElementById('sport').value,
    type:       document.getElementById('bet-type').value,
    date:       document.getElementById('bet-date').value,
    description:document.getElementById('description').value,
    league:     document.getElementById('league').value || '',
    stake:      parseFloat(document.getElementById('stake').value),
    odds:       parseFloat(document.getElementById('odds').value),
    returns:    parseFloat(document.getElementById('returns').value) || 0,
    result:     document.getElementById('result').value,
    bookmaker:  document.getElementById('bookmaker').value || 'N/A',
    valueTag:   document.getElementById('value-tag').value || '',
    tipster:    document.getElementById('tipster').value || '',
    freeBet:    document.getElementById('free-bet').value || '',
    notes:      document.getElementById('notes').value || ''
  };

  if (editId) {
    bets = bets.map(b => b.id === parseInt(editId) ? { ...b, ...data } : b);
    clearEditMode();
  } else {
    bets.unshift({ id: Date.now(), ...data });
  }
  saveBets();

  if (readdMode) {
    const keep = {
      sport:      document.getElementById('sport').value,
      league:     document.getElementById('league').value,
      'bet-type': document.getElementById('bet-type').value,
      'bet-date': document.getElementById('bet-date').value,
      bookmaker:  document.getElementById('bookmaker').value,
      odds:       document.getElementById('odds').value,
      'free-bet': document.getElementById('free-bet').value,
      notes:      document.getElementById('notes').value,
      description:document.getElementById('description').value,
    };
    betForm.reset();
    Object.entries(keep).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
    document.getElementById('stake').value   = '';
    document.getElementById('returns').value = '';
    document.getElementById('result').value  = '';
    readdMode = false;
  } else {
    betForm.reset();
    document.getElementById('bet-date').valueAsDate = new Date();
  }
  init();
});

function editBet(id) {
  const bet = bets.find(b => b.id === id);
  if (!bet) return;
  document.getElementById('edit-id').value     = bet.id;
  document.getElementById('sport').value       = bet.sport;
  document.getElementById('bet-type').value    = bet.type || 'Single';
  document.getElementById('bet-date').value    = bet.date;
  document.getElementById('description').value = bet.description;
  document.getElementById('league').value      = bet.league || '';
  document.getElementById('stake').value       = bet.stake;
  document.getElementById('odds').value        = bet.odds;
  document.getElementById('returns').value     = bet.returns || '';
  document.getElementById('result').value      = bet.result;
  document.getElementById('bookmaker').value   = bet.bookmaker !== 'N/A' ? bet.bookmaker : '';
  document.getElementById('value-tag').value   = bet.valueTag || '';
  document.getElementById('tipster').value     = bet.tipster || '';
  document.getElementById('free-bet').value    = bet.freeBet || '';
  document.getElementById('notes').value       = bet.notes || '';
  formTitle.textContent     = 'Edit Bet';
  formSubmitBtn.textContent = 'Save Changes';
  cancelEditBtn.style.display = 'inline-block';
  if (formCollapsed) toggleFormCollapse();
  switchMainTab('bets');
  document.querySelector('.add-bet-section').scrollIntoView({ behavior: 'smooth' });
}

function clearEditMode() {
  document.getElementById('edit-id').value = '';
  formTitle.textContent     = 'Add Bet';
  formSubmitBtn.textContent = 'Add Bet';
  cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', () => {
  betForm.reset();
  clearEditMode();
  document.getElementById('bet-date').valueAsDate = new Date();
});

function duplicateBet(id) {
  const bet = bets.find(b => b.id === id);
  if (!bet) return;
  bets.unshift({ ...bet, id: Date.now(), date: new Date().toISOString().split('T')[0], result: 'pending', returns: 0 });
  saveBets(); init();
}

function deleteBet(id) {
  if (confirm('Delete this bet?')) {
    bets = bets.filter(b => b.id !== id);
    saveBets(); init();
  }
}

// ── Quick Result Modal ─────────────────────────────────────────────────────
function openQuickResult(id) {
  const bet = bets.find(b => b.id === id);
  if (!bet) return;
  document.getElementById('qr-id').value      = id;
  document.getElementById('qr-result').value  = bet.result;
  document.getElementById('qr-returns').value = bet.returns || '';
  document.getElementById('quick-result-modal').style.display = 'flex';
}
document.getElementById('qr-save').addEventListener('click', () => {
  const id      = parseInt(document.getElementById('qr-id').value);
  const result  = document.getElementById('qr-result').value;
  const returns = parseFloat(document.getElementById('qr-returns').value) || 0;
  bets = bets.map(b => b.id === id ? { ...b, result, returns } : b);
  saveBets();
  document.getElementById('quick-result-modal').style.display = 'none';
  init();
});
document.getElementById('qr-cancel').addEventListener('click', () => {
  document.getElementById('quick-result-modal').style.display = 'none';
});
document.getElementById('quick-result-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
});

// ── Pending Tab ────────────────────────────────────────────────────────────────
document.getElementById('bulk-win').addEventListener('click', () => {
  if (confirm('Mark ALL pending bets as won?')) {
    bets = bets.map(b => b.result === 'pending' ? { ...b, result: 'win', returns: parseFloat((b.stake * b.odds).toFixed(2)) } : b);
    saveBets(); init(); renderPending();
  }
});

document.getElementById('bulk-loss').addEventListener('click', () => {
  if (confirm('Mark ALL pending bets as lost?')) {
    bets = bets.map(b => b.result === 'pending' ? { ...b, result: 'loss', returns: 0 } : b);
    saveBets(); init(); renderPending();
  }
});

function renderPending() {
  const pending = bets.filter(b => b.result === 'pending').sort((a, b) => b.date.localeCompare(a.date));
  const list    = document.getElementById('pending-list');
  const empty   = document.getElementById('pending-empty');
  const bulk    = document.getElementById('pending-bulk-actions');
  const badge   = document.getElementById('pending-badge');

  if (pending.length > 0) {
    badge.textContent = pending.length;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }

  bulk.style.display = pending.length > 0 ? 'flex' : 'none';

  if (pending.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = pending.map(bet => `
    <div class="pending-card">
      <div class="pending-top">
        <span class="pending-desc">${bet.description}</span>
        <span class="pending-date">${formatDate(bet.date)}</span>
      </div>
      <div class="pending-meta">
        <span class="type-badge">${bet.sport}</span>
        ${bet.league ? `<span class="league-badge">${bet.league}</span>` : ''}
        <span class="type-badge">${bet.type || 'Single'}</span>
        <span>${bet.bookmaker}</span>
        <span>£${bet.stake.toFixed(2)} @ ${bet.odds.toFixed(2)}</span>
        <span class="pending-potential">Potential: £${(bet.stake * bet.odds).toFixed(2)}</span>
      </div>
      <div class="pending-actions">
        <button class="btn-win" onclick="quickSettle(${bet.id},'win')">✅ Won</button>
        <button class="btn-loss" onclick="quickSettle(${bet.id},'loss')">❌ Lost</button>
        <button class="btn-action" onclick="openQuickResult(${bet.id})">✏️ Custom</button>
        <button class="btn-action" onclick="editBet(${bet.id})">📝 Edit</button>
      </div>
    </div>`).join('');
}

function quickSettle(id, result) {
  const bet = bets.find(b => b.id === id);
  if (!bet) return;
  const returns = result === 'win' ? bet.stake * bet.odds : 0;
  bets = bets.map(b => b.id === id ? { ...b, result, returns } : b);
  saveBets(); init(); renderPending();
}

// ── Render Bets Table ──────────────────────────────────────────────────────
function getFiltered() {
  const sport  = filterSport.value;
  const result = filterResult.value;
  const type   = filterType.value;
  const search = filterSearch.value.toLowerCase();
  return bets.filter(b => {
    if (sport  !== 'all' && b.sport  !== sport)  return false;
    if (result !== 'all' && b.result !== result) return false;
    if (type   !== 'all' && (b.type || 'Single') !== type) return false;
    if (search && !b.description.toLowerCase().includes(search) &&
        !b.sport.toLowerCase().includes(search) &&
        !(b.league || '').toLowerCase().includes(search) &&
        !(b.bookmaker || '').toLowerCase().includes(search) &&
        !(b.tipster || '').toLowerCase().includes(search)) return false;
    return true;
  });
}

function getSorted(list) {
  return [...list].sort((a, b) => {
    let av, bv;
    if      (sortCol === 'pnl')     { av = calculatePnL(a);    bv = calculatePnL(b); }
    else if (sortCol === 'balance') { return 0; }
    else if (sortCol === 'stake')   { av = a.stake;  bv = b.stake; }
    else if (sortCol === 'odds')    { av = a.odds;   bv = b.odds; }
    else if (sortCol === 'returns') { av = a.returns || 0; bv = b.returns || 0; }
    else { av = (a[sortCol] || '').toString().toLowerCase(); bv = (b[sortCol] || '').toString().toLowerCase(); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });
}

function renderBets() {
  const filtered = getSorted(getFiltered());
  const pagination = document.getElementById('pagination');

  if (filtered.length === 0) {
    betTbody.innerHTML = '';
    emptyState.style.display = 'block';
    pagination.innerHTML = '';
    return;
  }
  emptyState.style.display = 'none';

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const allSorted = [...bets].sort((a, b) => a.date.localeCompare(b.date));
  const balanceMap = {};
  let running = 0;
  allSorted.forEach(b => { running += calculatePnL(b); balanceMap[b.id] = running; });

  betTbody.innerHTML = paginated.map(bet => {
    const pnl     = calculatePnL(bet);
    const returns = calculateReturn(bet);
    const balance = balanceMap[bet.id];
    const pnlCls  = pnl > 0 ? 'pos' : pnl < 0 ? 'neg' : '';
    const balCls  = balance > 0 ? 'pos' : balance < 0 ? 'neg' : '';
    const isPending = bet.result === 'pending';
    const valueIcon = bet.valueTag === 'value' ? ' ✅' : bet.valueTag === 'non-value' ? ' ❌' : bet.valueTag === 'tipster' ? ' 📢' : '';
    return `<tr>
      <td>${formatDate(bet.date)}</td>
      <td>${bet.sport}</td>
      <td>${bet.league ? `<span class="league-badge">${bet.league}</span>` : '<span class="muted-dash">—</span>'}</td>
      <td>
        ${bet.description}${valueIcon}
        ${bet.tipster ? `<div class="row-note">📢 ${bet.tipster}</div>` : ''}
        ${bet.notes   ? `<div class="row-note">${bet.notes}</div>` : ''}
        ${bet.freeBet ? `<div class="row-freebet">🎁 ${bet.freeBet}</div>` : ''}
      </td>
      <td><span class="type-badge">${bet.type || 'Single'}</span></td>
      <td>${bet.bookmaker}</td>
      <td>£${bet.stake.toFixed(2)}</td>
      <td>${bet.odds.toFixed(2)}</td>
      <td>${returns > 0 ? `£${returns.toFixed(2)}` : '—'}</td>
      <td><span class="badge ${bet.result} ${isPending ? 'clickable' : ''}"
        ${isPending ? `onclick="openQuickResult(${bet.id})" title="Click to update"` : ''}>
        ${bet.result}${isPending ? ' ✏️' : ''}</span></td>
      <td class="pnl-cell ${pnlCls}">${fmtMoney(pnl, true)}</td>
      <td class="pnl-cell ${balCls}">${fmtMoney(balance, true)}</td>
      <td class="action-cell">
        <button class="btn-action" onclick="editBet(${bet.id})" title="Edit">✏️</button>
        <button class="btn-action" onclick="duplicateBet(${bet.id})" title="Duplicate">📋</button>
        <button class="btn-action btn-del" onclick="deleteBet(${bet.id})" title="Delete">🗑️</button>
      </td>
    </tr>`;
  }).join('');

  updateSortIcons();
  renderPagination(totalPages, filtered.length);
}

function renderPagination(totalPages, totalCount) {
  const el = document.getElementById('pagination');
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end   = Math.min(currentPage * PAGE_SIZE, totalCount);

  let pages = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages += `<span class="page-ellipsis">…</span>`;
    }
  }

  el.innerHTML = `
    <div class="page-info">Showing ${start}–${end} of ${totalCount} bets</div>
    <div class="page-btns">
      <button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹ Prev</button>
      ${pages}
      <button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next ›</button>
    </div>`;
}

function goToPage(page) {
  currentPage = page;
  renderBets();
  document.querySelector('.bet-history').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('th.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.col;
    if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    else { sortCol = col; sortDir = 'desc'; }
    currentPage = 1;
    renderBets();
  });
});

function updateSortIcons() {
  document.querySelectorAll('th.sortable').forEach(th => {
    const icon = th.querySelector('.sort-icon');
    if (th.dataset.col === sortCol) icon.textContent = sortDir === 'asc' ? '↑' : '↓';
    else icon.textContent = '↕';
  });
}

// ── Summary ────────────────────────────────────────────────────────────────
function updateSummary() {
  const totalStaked  = bets.reduce((s, b) => s + b.stake, 0);
  const totalReturns = bets.reduce((s, b) => s + calculateReturn(b), 0);
  const totalPnL     = bets.reduce((s, b) => s + calculatePnL(b), 0);

  const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

  setEl('total-staked',  `£${totalStaked.toFixed(2)}`);
  setEl('total-returns', `£${totalReturns.toFixed(2)}`);

  const pnlEl = document.getElementById('total-pnl');
  if (pnlEl) {
    pnlEl.textContent = fmtMoney(totalPnL, true);
    pnlEl.className   = 'value ' + (totalPnL > 0 ? 'total-pnl-pos' : totalPnL < 0 ? 'total-pnl-neg' : '');
  }

  const totalDeposited = cashflow.filter(c => c.type === 'deposit').reduce((s, c) => s + c.amount, 0);
  const totalWithdrawn = cashflow.filter(c => c.type === 'withdrawal').reduce((s, c) => s + c.amount, 0);
  const accountPnL     = totalWithdrawn - totalDeposited;

  setEl('total-deposited', `£${totalDeposited.toFixed(2)}`);
  setEl('total-withdrawn', `£${totalWithdrawn.toFixed(2)}`);

  const accPnlEl = document.getElementById('account-pnl');
  if (accPnlEl) {
    accPnlEl.textContent = fmtMoney(accountPnL, true);
    accPnlEl.className   = 'value ' + (accountPnL > 0 ? 'total-pnl-pos' : accountPnL < 0 ? 'total-pnl-neg' : '');
  }
}

// ── Breakdown ──────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    renderBreakdown();
  });
});

function renderBreakdown() {
  const groups = {};
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  bets.forEach(bet => {
    let key;
    if      (activeTab === 'sport')      key = bet.sport;
    else if (activeTab === 'league')     key = bet.league || 'No League';
    else if (activeTab === 'bookmaker')  key = bet.bookmaker || 'N/A';
    else if (activeTab === 'tipster')    key = bet.tipster || 'No Tipster';
    else if (activeTab === 'value')      key = bet.valueTag || 'Untagged';
    else if (activeTab === 'dayofweek')  key = DAYS[new Date(bet.date + 'T00:00:00').getDay()];
    else key = oddsRange(bet.odds);

    if (!groups[key]) groups[key] = { bets: 0, wins: 0, losses: 0, staked: 0, pnl: 0 };
    groups[key].bets++;
    groups[key].staked += bet.stake;
    groups[key].pnl    += calculatePnL(bet);
    if (bet.result === 'win')  groups[key].wins++;
    if (bet.result === 'loss') groups[key].losses++;
  });

  const sorted = Object.entries(groups).sort((a, b) => b[1].pnl - a[1].pnl);
  if (sorted.length === 0) {
    breakdownCards.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">No data yet</p>';
    return;
  }
  breakdownCards.innerHTML = sorted.map(([key, s]) => {
    const winRate = s.bets > 0 ? ((s.wins / s.bets) * 100).toFixed(0) : 0;
    const pnlCls  = s.pnl > 0 ? 'pos' : s.pnl < 0 ? 'neg' : '';
    const cardCls = s.pnl > 0 ? 'positive' : s.pnl < 0 ? 'negative' : '';
    return `<div class="sport-card ${cardCls}">
      <div class="sport-name">${key}</div>
      <div class="sport-stats">
        <div class="stat"><span>Bets</span><span>${s.bets}</span></div>
        <div class="stat"><span>Win Rate</span><span>${winRate}%</span></div>
        <div class="stat"><span>Staked</span><span>£${s.staked.toFixed(2)}</span></div>
      </div>
      <div class="pnl ${pnlCls}">${fmtMoney(s.pnl, true)}</div>
    </div>`;
  }).join('');
}

// ── Insights ───────────────────────────────────────────────────────────────
function renderInsights() {
  const bar = document.getElementById('insight-bar');
  const settled = bets.filter(b => b.result !== 'pending');
  if (settled.length === 0) { bar.innerHTML = ''; return; }

  const best  = settled.reduce((a, b) => calculatePnL(b) > calculatePnL(a) ? b : a);
  const worst = settled.reduce((a, b) => calculatePnL(b) < calculatePnL(a) ? b : a);
  const avgWinOdds  = settled.filter(b => b.result === 'win').reduce((s, b) => s + b.odds, 0) / (settled.filter(b => b.result === 'win').length || 1);
  const avgLossOdds = settled.filter(b => b.result === 'loss').reduce((s, b) => s + b.odds, 0) / (settled.filter(b => b.result === 'loss').length || 1);
  const avgWinStake  = settled.filter(b => b.result === 'win').reduce((s, b) => s + b.stake, 0) / (settled.filter(b => b.result === 'win').length || 1);
  const avgLossStake = settled.filter(b => b.result === 'loss').reduce((s, b) => s + b.stake, 0) / (settled.filter(b => b.result === 'loss').length || 1);

  const settledByDate = [...settled].sort((a, b) => b.date.localeCompare(a.date));
  let curStreak = 0, maxStreak = 0, curStreakType = '';
  let tempStreak = 0, tempType = '';
  for (const b of settledByDate) {
    if (b.result === tempType) { tempStreak++; }
    else { tempStreak = 1; tempType = b.result; }
    if (tempStreak > maxStreak) { maxStreak = tempStreak; curStreakType = tempType; }
  }

  bar.innerHTML = `
    <div class="insight-card">
      <div class="insight-label">Best Bet</div>
      <div class="insight-val pos">+£${calculatePnL(best).toFixed(2)}</div>
      <div class="insight-sub">${best.description}</div>
    </div>
    <div class="insight-card">
      <div class="insight-label">Worst Bet</div>
      <div class="insight-val neg">-£${Math.abs(calculatePnL(worst)).toFixed(2)}</div>
      <div class="insight-sub">${worst.description}</div>
    </div>
    <div class="insight-card">
      <div class="insight-label">Avg Odds (W/L)</div>
      <div class="insight-val">${avgWinOdds.toFixed(2)} / ${avgLossOdds.toFixed(2)}</div>
      <div class="insight-sub">Winners vs Losers</div>
    </div>
    <div class="insight-card">
      <div class="insight-label">Avg Stake (W/L)</div>
      <div class="insight-val">£${avgWinStake.toFixed(2)} / £${avgLossStake.toFixed(2)}</div>
      <div class="insight-sub">Winners vs Losers</div>
    </div>
    <div class="insight-card">
      <div class="insight-label">Longest Streak</div>
      <div class="insight-val ${curStreakType === 'win' ? 'pos' : 'neg'}">${maxStreak} ${curStreakType === 'win' ? '🟢' : '🔴'}</div>
      <div class="insight-sub">${curStreakType} streak</div>
    </div>`;
}

// ── Monthly Summary ────────────────────────────────────────────────────────
function renderMonthly() {
  const tbody = document.getElementById('monthly-tbody');
  const empty = document.getElementById('monthly-empty');
  const months = {};
  bets.forEach(b => {
    const key = b.date.slice(0, 7);
    if (!months[key]) months[key] = { bets: 0, wins: 0, staked: 0, returns: 0, pnl: 0 };
    months[key].bets++;
    months[key].staked  += b.stake;
    months[key].returns += calculateReturn(b);
    months[key].pnl     += calculatePnL(b);
    if (b.result === 'win') months[key].wins++;
  });
  const sorted = Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
  if (sorted.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = sorted.map(([month, s]) => {
    const label   = new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const winRate = s.bets > 0 ? ((s.wins / s.bets) * 100).toFixed(0) : 0;
    const roi     = s.staked > 0 ? ((s.pnl / s.staked) * 100).toFixed(1) : 0;
    const pnlCls  = s.pnl > 0 ? 'pos' : s.pnl < 0 ? 'neg' : '';
    return `<tr>
      <td>${label}</td>
      <td>${s.bets}</td>
      <td>£${s.staked.toFixed(2)}</td>
      <td>£${s.returns.toFixed(2)}</td>
      <td class="pnl-cell ${pnlCls}">${fmtMoney(s.pnl, true)}</td>
      <td>${winRate}%</td>
      <td class="${pnlCls}">${roi > 0 ? '+' : ''}${roi}%</td>
    </tr>`;
  }).join('');
}

// ── P&L Chart ──────────────────────────────────────────────────────────────
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    chartPeriod = btn.dataset.period;
    renderChart();
  });
});

function renderChart() {
  let settled = [...bets].filter(b => b.result !== 'pending').sort((a, b) => a.date.localeCompare(b.date));
  if (chartPeriod !== 'all') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(chartPeriod));
    settled = settled.filter(b => new Date(b.date + 'T00:00:00') >= cutoff);
  }
  if (settled.length < 2) {
    chartEmpty.style.display = 'block';
    document.getElementById('pnl-chart').style.display = 'none';
    if (pnlChart) { pnlChart.destroy(); pnlChart = null; }
    return;
  }
  chartEmpty.style.display = 'none';
  document.getElementById('pnl-chart').style.display = 'block';
  let running = 0;
  const labels = [], data = [];
  settled.forEach(b => {
    running += calculatePnL(b);
    labels.push(formatDate(b.date));
    data.push(parseFloat(running.toFixed(2)));
  });
  const ctx = document.getElementById('pnl-chart').getContext('2d');
  if (pnlChart) pnlChart.destroy();
  const lineColor = data[data.length - 1] >= 0 ? '#22c55e' : '#ef4444';
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#2e3250';
  const tickColor = '#94a3b8';
  pnlChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Running P&L', data, borderColor: lineColor, backgroundColor: lineColor + '22', borderWidth: 2, pointRadius: 3, fill: true, tension: 0.3 }] },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` £${c.parsed.y.toFixed(2)}` } } },
      scales: {
        x: { ticks: { color: tickColor, maxTicksLimit: 10 }, grid: { color: gridColor } },
        y: { ticks: { color: tickColor, callback: v => `£${v}` }, grid: { color: gridColor }, border: { dash: [4,4] } }
      }
    }
  });
}

// ── Day of Week Chart ──────────────────────────────────────────────────────
function renderDowChart() {
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const dowEmpty = document.getElementById('dow-empty');
  const canvas   = document.getElementById('dow-chart');
  const settled  = bets.filter(b => b.result !== 'pending');
  if (settled.length === 0) { dowEmpty.style.display = 'block'; canvas.style.display = 'none'; if (dowChart) { dowChart.destroy(); dowChart = null; } return; }
  dowEmpty.style.display = 'none'; canvas.style.display = 'block';
  const pnlByDay = {};
  DAYS.forEach(d => pnlByDay[d] = 0);
  settled.forEach(b => {
    const day = new Date(b.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long' });
    pnlByDay[day] = (pnlByDay[day] || 0) + calculatePnL(b);
  });
  const values = DAYS.map(d => parseFloat((pnlByDay[d] || 0).toFixed(2)));
  const colors = values.map(v => v >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)');
  const ctx = document.getElementById('dow-chart').getContext('2d');
  if (dowChart) dowChart.destroy();
  dowChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: DAYS, datasets: [{ data: values, backgroundColor: colors, borderRadius: 6 }] },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` £${c.parsed.y.toFixed(2)}` } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
        y: { ticks: { color: '#94a3b8', callback: v => `£${v}` }, grid: { color: '#2e3250' } }
      }
    }
  });
}

// ── Sport Filter ───────────────────────────────────────────────────────────
function populateSportFilter() {
  const sports = [...new Set(bets.map(b => b.sport))].sort();
  const cur = filterSport.value;
  filterSport.innerHTML = '<option value="all">All Sports</option>' + sports.map(s => `<option value="${s}">${s}</option>`).join('');
  if (sports.includes(cur)) filterSport.value = cur;
}

[filterSport, filterResult, filterType, filterSearch].forEach(el => el.addEventListener('input', () => { currentPage = 1; renderBets(); }));

clearAllBtn.addEventListener('click', () => {
  if (confirm('Delete all bets? This cannot be undone.')) { bets = []; saveBets(); init(); }
});

// ── Export CSV ─────────────────────────────────────────────────────────────
exportBtn.addEventListener('click', () => {
  const headers = ['Date','Sport','League','Type','Description','Bookmaker','Stake','Odds','Returns','Result','P&L','Value Tag','Tipster','Free Bet','Notes'];
  const rows = bets.map(b => [
    b.date, b.sport, `"${b.league||''}"`, b.type||'Single', `"${b.description}"`,
    b.bookmaker, b.stake.toFixed(2), b.odds.toFixed(2), (b.returns||0).toFixed(2),
    b.result, calculatePnL(b).toFixed(2), b.valueTag||'', `"${b.tipster||''}"`,
    `"${b.freeBet||''}"`, `"${b.notes||''}"`
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `bets-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
});

importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const lines = ev.target.result.trim().split('\n').slice(1);
    let imported = 0;
    lines.forEach(line => {
      const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g);
      if (!cols || cols.length < 9) return;
      const c = cols.map(x => x.replace(/^"|"$/g, '').trim());
      bets.unshift({ id: Date.now() + Math.random(), date: c[0], sport: c[1], league: c[2]||'', type: c[3]||'Single', description: c[4], bookmaker: c[5]||'N/A', stake: parseFloat(c[6])||0, odds: parseFloat(c[7])||1, returns: parseFloat(c[8])||0, result: c[9]||'pending', valueTag: c[11]||'', tipster: c[12]||'', freeBet: c[13]||'', notes: c[14]||'' });
      imported++;
    });
    saveBets(); init();
    alert(`Imported ${imported} bet(s).`);
    importFile.value = '';
  };
  reader.readAsText(file);
});

// ── Cashflow ───────────────────────────────────────────────────────────────
document.getElementById('cf-date').valueAsDate = new Date();
document.getElementById('cashflow-form').addEventListener('submit', (e) => {
  e.preventDefault();
  cashflow.unshift({ id: Date.now(), type: document.getElementById('cf-type').value, date: document.getElementById('cf-date').value, amount: parseFloat(document.getElementById('cf-amount').value), bookmaker: document.getElementById('cf-bookmaker').value || 'N/A', notes: document.getElementById('cf-notes').value || '' });
  saveCashflow();
  document.getElementById('cashflow-form').reset();
  document.getElementById('cf-date').valueAsDate = new Date();
  init();
});

function deleteCashflow(id) {
  if (confirm('Delete this entry?')) { cashflow = cashflow.filter(c => c.id !== id); saveCashflow(); init(); }
}

function renderCashflow() {
  const tbody  = document.getElementById('cf-tbody');
  const empty  = document.getElementById('cf-empty');
  const sorted = [...cashflow].sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = sorted.map(c => {
    const isDeposit = c.type === 'deposit';
    return `<tr>
      <td>${formatDate(c.date)}</td>
      <td><span class="cf-badge ${isDeposit ? 'cf-deposit' : 'cf-withdrawal'}">${isDeposit ? '⬇️ Deposit' : '⬆️ Withdrawal'}</span></td>
      <td>${c.bookmaker}</td>
      <td class="pnl-cell ${isDeposit ? 'neg' : 'pos'}">${isDeposit ? '-' : '+'}£${c.amount.toFixed(2)}</td>
      <td class="row-note">${c.notes}</td>
      <td><button class="btn-action btn-del" onclick="deleteCashflow(${c.id})" title="Delete">🗑️</button></td>
    </tr>`;
  }).join('');
}

// ── Autofill Datalists ─────────────────────────────────────────────────────
function populateAutofill() {
  const unique = (arr) => [...new Set(arr.filter(Boolean))].sort();

  const leagues      = unique(bets.map(b => b.league));
  const descriptions = unique(bets.map(b => b.description));
  const freebets     = unique(bets.map(b => b.freeBet));
  const notes        = unique(bets.map(b => b.notes));

  fillDatalist('list-leagues',      leagues);
  fillDatalist('list-descriptions', descriptions);
  fillDatalist('list-freebets',     freebets);
  fillDatalist('list-notes',        notes);
}

function fillDatalist(id, values) {
  const dl = document.getElementById(id);
  if (!dl) return;
  dl.innerHTML = values.map(v => `<option value="${v.replace(/"/g, '&quot;')}"></option>`).join('');
}
