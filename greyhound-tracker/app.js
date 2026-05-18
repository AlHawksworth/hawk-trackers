// ── State ──
let bets = JSON.parse(localStorage.getItem('gh_bets')) || [];
let startingBank = parseFloat(localStorage.getItem('gh_bank')) || 5.00;

// Cloud sync
if (typeof FireSync !== "undefined") {
  FireSync.load("gh_bets", (d) => { if (d && Array.isArray(d)) { bets = d; renderAll(); } });
}

let sortCol = 'date';
let sortDir = 'desc';
let activeTab = 'track';
let currentPage = 1;
const PAGE_SIZE = 25;
let pnlChart = null;
let dowChart = null;
let trackNevChart = null;
let chartPeriod = 'all';
let formCollapsed = false;

// ── DOM ──
const betForm = document.getElementById('bet-form');
const betTbody = document.getElementById('bet-tbody');
const emptyState = document.getElementById('empty-state');
const chartEmpty = document.getElementById('chart-empty');
const breakdownCards = document.getElementById('breakdown-cards');
const filterTrack = document.getElementById('filter-track');
const filterResult = document.getElementById('filter-result');
const filterTrap = document.getElementById('filter-trap');
const filterSearch = document.getElementById('filter-search');
const clearAllBtn = document.getElementById('clear-all');
const exportBtn = document.getElementById('export-csv');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const cancelEditBtn = document.getElementById('cancel-edit');
const formSubmitBtn = document.getElementById('form-submit-btn');
const formTitle = document.getElementById('form-title');

document.getElementById('bet-date').valueAsDate = new Date();

// ── NEV Calculation ──
// Uses close price as the market's "true" probability estimate.
// NEV = Stake × [(CloseProb × (OpenOdds - 1)) - (1 - CloseProb)]
// If close price shortens vs open → market says dog has better chance than open implied → positive movement
// If close price drifts vs open → market says dog has worse chance → negative movement
function calculateNEV(bet) {
  if (!bet.openPrice || bet.openPrice <= 1 || !bet.closePrice || bet.closePrice <= 1) return null;
  const trueProb = 1 / bet.closePrice; // Market's final assessment
  const ev = (trueProb * (bet.openPrice - 1)) - (1 - trueProb);
  return ev * bet.stake; // NEV in £ terms
}

// Price movement: % change from open to close
// Negative = price shortened (got shorter/more fancied)
// Positive = price drifted (got longer/less fancied)
function calculateMovement(bet) {
  if (!bet.openPrice || !bet.closePrice || bet.openPrice <= 0) return null;
  return ((bet.closePrice - bet.openPrice) / bet.openPrice) * 100;
}

// Implied probability from decimal odds
function impliedProb(odds) {
  return odds > 1 ? (1 / odds) * 100 : 0;
}

// ── Auto-calculate returns ──
function autoCalcReturns() {
  const result = document.getElementById('result').value;
  const stake = parseFloat(document.getElementById('stake').value);
  const openPrice = parseFloat(document.getElementById('open-price').value);
  const returns = document.getElementById('returns');
  if (result === 'win' && stake > 0 && openPrice > 0 && !returns.value) {
    returns.value = (stake * openPrice).toFixed(2);
  }
  if (result === 'loss') returns.value = '0';
}
document.getElementById('result').addEventListener('change', autoCalcReturns);
document.getElementById('stake').addEventListener('change', autoCalcReturns);
document.getElementById('open-price').addEventListener('change', autoCalcReturns);

// ── Theme ──
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

// ── Keyboard Shortcut ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'a' && !e.ctrlKey && !e.metaKey &&
      document.activeElement.tagName !== 'INPUT' &&
      document.activeElement.tagName !== 'TEXTAREA' &&
      document.activeElement.tagName !== 'SELECT') {
    switchMainTab('bets');
    if (formCollapsed) toggleFormCollapse();
    document.getElementById('track').focus();
  }
});
document.getElementById('shortcut-add').addEventListener('click', () => {
  switchMainTab('bets');
  if (formCollapsed) toggleFormCollapse();
  document.getElementById('track').focus();
});

// ── Collapsible Form ──
document.getElementById('btn-collapse-form').addEventListener('click', toggleFormCollapse);
function toggleFormCollapse() {
  formCollapsed = !formCollapsed;
  document.getElementById('form-body').style.display = formCollapsed ? 'none' : 'block';
  document.getElementById('btn-collapse-form').textContent = formCollapsed ? '▼' : '▲';
}

// ── Bank Modal ──
document.getElementById('current-bank').addEventListener('click', () => {
  document.getElementById('bank-amount').value = startingBank;
  document.getElementById('bank-modal').style.display = 'flex';
});
document.getElementById('bank-save').addEventListener('click', () => {
  startingBank = parseFloat(document.getElementById('bank-amount').value) || 5;
  localStorage.setItem('gh_bank', startingBank);
  document.getElementById('bank-modal').style.display = 'none';
  renderAll();
});
document.getElementById('bank-cancel').addEventListener('click', () => {
  document.getElementById('bank-modal').style.display = 'none';
});
document.getElementById('bank-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
});

// ── Main Tab Switching ──
document.querySelectorAll('.main-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchMainTab(btn.dataset.maintab));
});

function switchMainTab(tab) {
  document.querySelectorAll('.main-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.maintab === tab);
  });
  document.querySelectorAll('.main-tab-content').forEach(c => c.style.display = 'none');
  document.getElementById('tab-' + tab).style.display = 'block';
  if (tab === 'analysis') { renderChart(); renderDowChart(); renderMonthly(); renderInsights(); renderNevSummary(); }
  if (tab === 'tracks') renderTracks();
  if (tab === 'selections') renderSelections();
  if (tab === 'pending') renderPending();
}

// ── Sticky header ──
window.addEventListener('scroll', () => {
  document.querySelector('header').classList.toggle('scrolled', window.scrollY > 10);
});

// ── Init ──
init();
function init() { renderAll(); }

function renderAll() {
  renderBets();
  renderBreakdown();
  updateSummary();
  populateTrackFilter();
  populateAutofill();
  renderPending();
}

// ── Helpers ──
function calculatePnL(bet) {
  if (bet.result === 'pending' || bet.result === 'void') return 0;
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
function fmtMovement(bet) {
  const mov = calculateMovement(bet);
  if (mov === null) return '—';
  const sign = mov > 0 ? '+' : '';
  return `${sign}${mov.toFixed(1)}%`;
}
function movementClass(bet) {
  const mov = calculateMovement(bet);
  if (mov === null) return '';
  // Shortened = good (price came in), drifted = bad
  return mov < 0 ? 'pos' : mov > 0 ? 'neg' : '';
}
function oddsRange(odds) {
  if (odds < 2) return 'Odds-on (<2.0)';
  if (odds < 3) return '2.0–3.0';
  if (odds < 5) return '3.0–5.0';
  if (odds < 8) return '5.0–8.0';
  if (odds < 12) return '8.0–12.0';
  return '12.0+';
}
function trapColor(trap) {
  const colors = { '1': '🔴', '2': '🔵', '3': '⚪', '4': '⚫', '5': '🟠', '6': '🟡' };
  return colors[trap] || '';
}
function dayName(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long' });
}
function saveBets() {
  if (typeof FireSync !== "undefined") { FireSync.save("gh_bets", bets); }
  else { localStorage.setItem('gh_bets', JSON.stringify(bets)); }
}

// ── Add / Edit Bet ──
let readdMode = false;

document.getElementById('btn-readd').addEventListener('click', () => {
  readdMode = true;
  betForm.requestSubmit();
});

betForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const editId = document.getElementById('edit-id').value;
  const data = {
    date: document.getElementById('bet-date').value,
    time: document.getElementById('bet-time').value || '',
    track: document.getElementById('track').value,
    distance: document.getElementById('distance').value || '',
    trap: document.getElementById('trap').value || '',
    dogName: document.getElementById('dog-name').value,
    grade: document.getElementById('grade').value || '',
    type: document.getElementById('bet-type').value,
    stake: parseFloat(document.getElementById('stake').value),
    openPrice: parseFloat(document.getElementById('open-price').value),
    closePrice: parseFloat(document.getElementById('close-price').value) || null,
    returns: parseFloat(document.getElementById('returns').value) || 0,
    result: document.getElementById('result').value,
    bookmaker: document.getElementById('bookmaker').value || '',
    reason: document.getElementById('selection-reason').value || '',
    notes: document.getElementById('notes').value || ''
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
      'bet-date': document.getElementById('bet-date').value,
      'bet-time': document.getElementById('bet-time').value,
      track: document.getElementById('track').value,
      distance: document.getElementById('distance').value,
      grade: document.getElementById('grade').value,
      bookmaker: document.getElementById('bookmaker').value,
      'selection-reason': document.getElementById('selection-reason').value,
    };
    betForm.reset();
    Object.entries(keep).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
    document.getElementById('stake').value = '';
    document.getElementById('returns').value = '';
    document.getElementById('result').value = '';
    document.getElementById('dog-name').value = '';
    document.getElementById('trap').value = '';
    document.getElementById('open-price').value = '';
    document.getElementById('close-price').value = '';
    readdMode = false;
  } else {
    betForm.reset();
    document.getElementById('bet-date').valueAsDate = new Date();
  }
  renderAll();
});

function editBet(id) {
  const bet = bets.find(b => b.id === id);
  if (!bet) return;
  document.getElementById('edit-id').value = bet.id;
  document.getElementById('bet-date').value = bet.date;
  document.getElementById('bet-time').value = bet.time || '';
  document.getElementById('track').value = bet.track;
  document.getElementById('distance').value = bet.distance || '';
  document.getElementById('trap').value = bet.trap || '';
  document.getElementById('dog-name').value = bet.dogName;
  document.getElementById('grade').value = bet.grade || '';
  document.getElementById('bet-type').value = bet.type;
  document.getElementById('stake').value = bet.stake;
  document.getElementById('open-price').value = bet.openPrice;
  document.getElementById('close-price').value = bet.closePrice || '';
  document.getElementById('returns').value = bet.returns || '';
  document.getElementById('result').value = bet.result;
  document.getElementById('bookmaker').value = bet.bookmaker || '';
  document.getElementById('selection-reason').value = bet.reason || '';
  document.getElementById('notes').value = bet.notes || '';
  formTitle.textContent = 'Edit Bet';
  formSubmitBtn.textContent = 'Save Changes';
  cancelEditBtn.style.display = 'inline-block';
  if (formCollapsed) toggleFormCollapse();
  switchMainTab('bets');
  document.querySelector('.add-bet-section').scrollIntoView({ behavior: 'smooth' });
}

function clearEditMode() {
  document.getElementById('edit-id').value = '';
  formTitle.textContent = 'Add Bet';
  formSubmitBtn.textContent = 'Add Bet';
  cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', () => {
  betForm.reset();
  clearEditMode();
  document.getElementById('bet-date').valueAsDate = new Date();
});

function deleteBet(id) {
  if (confirm('Delete this bet?')) {
    bets = bets.filter(b => b.id !== id);
    saveBets(); renderAll();
  }
}

function duplicateBet(id) {
  const bet = bets.find(b => b.id === id);
  if (!bet) return;
  bets.unshift({ ...bet, id: Date.now(), date: new Date().toISOString().split('T')[0], result: 'pending', returns: 0 });
  saveBets(); renderAll();
}

// ── Quick Result Modal ──
function openQuickResult(id) {
  const bet = bets.find(b => b.id === id);
  if (!bet) return;
  document.getElementById('qr-id').value = id;
  document.getElementById('qr-result').value = bet.result;
  document.getElementById('qr-returns').value = bet.returns || '';
  document.getElementById('qr-close').value = bet.closePrice || '';
  document.getElementById('quick-result-modal').style.display = 'flex';
}
document.getElementById('qr-save').addEventListener('click', () => {
  const id = parseInt(document.getElementById('qr-id').value);
  const result = document.getElementById('qr-result').value;
  const returns = parseFloat(document.getElementById('qr-returns').value) || 0;
  const closePrice = parseFloat(document.getElementById('qr-close').value) || null;
  bets = bets.map(b => b.id === id ? { ...b, result, returns, closePrice } : b);
  saveBets();
  document.getElementById('quick-result-modal').style.display = 'none';
  renderAll();
});
document.getElementById('qr-cancel').addEventListener('click', () => {
  document.getElementById('quick-result-modal').style.display = 'none';
});
document.getElementById('quick-result-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
});

// ── Pending Tab ──
document.getElementById('bulk-win').addEventListener('click', () => {
  if (confirm('Mark ALL pending bets as won?')) {
    bets = bets.map(b => b.result === 'pending' ? { ...b, result: 'win', returns: parseFloat((b.stake * b.openPrice).toFixed(2)) } : b);
    saveBets(); renderAll(); renderPending();
  }
});
document.getElementById('bulk-loss').addEventListener('click', () => {
  if (confirm('Mark ALL pending bets as lost?')) {
    bets = bets.map(b => b.result === 'pending' ? { ...b, result: 'loss', returns: 0 } : b);
    saveBets(); renderAll(); renderPending();
  }
});

function renderPending() {
  const pending = bets.filter(b => b.result === 'pending').sort((a, b) => b.date.localeCompare(a.date));
  const list = document.getElementById('pending-list');
  const empty = document.getElementById('pending-empty');
  const bulk = document.getElementById('pending-bulk-actions');
  const badge = document.getElementById('pending-badge');

  badge.style.display = pending.length > 0 ? 'inline-block' : 'none';
  if (pending.length > 0) badge.textContent = pending.length;
  bulk.style.display = pending.length > 0 ? 'flex' : 'none';

  if (pending.length === 0) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  list.innerHTML = pending.map(bet => {
    const mov = fmtMovement(bet);
    const movCls = movementClass(bet);
    return `<div class="pending-card">
      <div class="pending-top">
        <span class="pending-desc">${trapColor(bet.trap)} ${bet.dogName}</span>
        <span class="pending-date">${formatDate(bet.date)}${bet.time ? ' ' + bet.time : ''}</span>
      </div>
      <div class="pending-meta">
        <span class="type-badge">${bet.track}</span>
        ${bet.grade ? `<span class="league-badge">${bet.grade}</span>` : ''}
        <span>${bet.type}</span>
        <span>£${bet.stake.toFixed(2)} @ ${bet.openPrice.toFixed(2)}</span>
        <span class="pending-potential">Potential: £${(bet.stake * bet.openPrice).toFixed(2)}</span>
        ${mov !== '—' ? `<span class="nev-tag ${movCls}">Mov: ${mov}</span>` : ''}
      </div>
      <div class="pending-actions">
        <button class="btn-win" onclick="quickSettle(${bet.id},'win')">✅ Won</button>
        <button class="btn-loss" onclick="quickSettle(${bet.id},'loss')">❌ Lost</button>
        <button class="btn-action" onclick="openQuickResult(${bet.id})">✏️ Custom</button>
        <button class="btn-action" onclick="editBet(${bet.id})">📝 Edit</button>
      </div>
    </div>`;
  }).join('');
}

function quickSettle(id, result) {
  const bet = bets.find(b => b.id === id);
  if (!bet) return;
  const returns = result === 'win' ? bet.stake * bet.openPrice : 0;
  bets = bets.map(b => b.id === id ? { ...b, result, returns } : b);
  saveBets(); renderAll(); renderPending();
}

// ── Render Bets Table ──
function getFiltered() {
  const track = filterTrack.value;
  const result = filterResult.value;
  const trap = filterTrap.value;
  const search = filterSearch.value.toLowerCase();
  return bets.filter(b => {
    if (track !== 'all' && b.track !== track) return false;
    if (result !== 'all' && b.result !== result) return false;
    if (trap !== 'all' && b.trap !== trap) return false;
    if (search && !b.dogName.toLowerCase().includes(search) &&
        !b.track.toLowerCase().includes(search) &&
        !(b.grade || '').toLowerCase().includes(search) &&
        !(b.notes || '').toLowerCase().includes(search)) return false;
    return true;
  });
}

function getSorted(list) {
  return [...list].sort((a, b) => {
    let av, bv;
    if (sortCol === 'pnl') { av = calculatePnL(a); bv = calculatePnL(b); }
    else if (sortCol === 'movement') { av = calculateMovement(a) || 0; bv = calculateMovement(b) || 0; }
    else if (sortCol === 'nev') { av = calculateNEV(a) || 0; bv = calculateNEV(b) || 0; }
    else if (sortCol === 'stake') { av = a.stake; bv = b.stake; }
    else if (sortCol === 'openPrice') { av = a.openPrice; bv = b.openPrice; }
    else if (sortCol === 'closePrice') { av = a.closePrice || 0; bv = b.closePrice || 0; }
    else { av = (a[sortCol] || '').toString().toLowerCase(); bv = (b[sortCol] || '').toString().toLowerCase(); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
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

  betTbody.innerHTML = paginated.map(bet => {
    const pnl = calculatePnL(bet);
    const nev = calculateNEV(bet);
    const mov = fmtMovement(bet);
    const movCls = movementClass(bet);
    const pnlCls = pnl > 0 ? 'pos' : pnl < 0 ? 'neg' : '';
    const isPending = bet.result === 'pending';
    const nevStr = nev !== null ? fmtMoney(nev, true) : '—';
    const nevCls = nev !== null ? (nev >= 0 ? 'pos' : 'neg') : '';

    return `<tr>
      <td>${formatDate(bet.date)}</td>
      <td>${bet.time || '—'}</td>
      <td>${bet.track}</td>
      <td>
        ${trapColor(bet.trap)} ${bet.dogName}
        ${bet.notes ? `<div class="row-note">${bet.notes}</div>` : ''}
      </td>
      <td>${bet.trap || '—'}</td>
      <td><span class="type-badge">${bet.type}</span></td>
      <td>£${bet.stake.toFixed(2)}</td>
      <td>${bet.openPrice.toFixed(2)}</td>
      <td>${bet.closePrice ? bet.closePrice.toFixed(2) : '—'}</td>
      <td class="pnl-cell ${movCls}">${mov}</td>
      <td class="pnl-cell ${nevCls}">${nevStr}</td>
      <td><span class="badge ${bet.result} ${isPending ? 'clickable' : ''}"
        ${isPending ? `onclick="openQuickResult(${bet.id})" title="Click to update"` : ''}>
        ${bet.result}${isPending ? ' ✏️' : ''}</span></td>
      <td class="pnl-cell ${pnlCls}">${fmtMoney(pnl, true)}</td>
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
  const end = Math.min(currentPage * PAGE_SIZE, totalCount);
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

// ── Filters ──
filterTrack.addEventListener('change', () => { currentPage = 1; renderBets(); });
filterResult.addEventListener('change', () => { currentPage = 1; renderBets(); });
filterTrap.addEventListener('change', () => { currentPage = 1; renderBets(); });
filterSearch.addEventListener('input', () => { currentPage = 1; renderBets(); });

function populateTrackFilter() {
  const tracks = [...new Set(bets.map(b => b.track))].sort();
  filterTrack.innerHTML = '<option value="all">All Tracks</option>' +
    tracks.map(t => `<option value="${t}">${t}</option>`).join('');
}

function populateAutofill() {
  const dogs = [...new Set(bets.map(b => b.dogName))].sort();
  document.getElementById('list-dogs').innerHTML = dogs.map(d => `<option value="${d}">`).join('');
}

// ── Summary ──
function updateSummary() {
  const settled = bets.filter(b => b.result !== 'pending' && b.result !== 'void');
  const totalStaked = settled.reduce((s, b) => s + b.stake, 0);
  const totalReturns = settled.reduce((s, b) => s + (b.returns || 0), 0);
  const totalPnL = settled.reduce((s, b) => s + calculatePnL(b), 0);
  const totalNev = settled.reduce((s, b) => s + (calculateNEV(b) || 0), 0);
  const roi = totalStaked > 0 ? ((totalPnL / totalStaked) * 100) : 0;
  const currentBank = startingBank + totalPnL;

  const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setEl('total-staked', `£${totalStaked.toFixed(2)}`);
  setEl('total-returns', `£${totalReturns.toFixed(2)}`);

  const pnlEl = document.getElementById('total-pnl');
  if (pnlEl) {
    pnlEl.textContent = fmtMoney(totalPnL, true);
    pnlEl.className = 'value ' + (totalPnL > 0 ? 'total-pnl-pos' : totalPnL < 0 ? 'total-pnl-neg' : '');
  }

  const nevEl = document.getElementById('total-nev');
  if (nevEl) {
    nevEl.textContent = fmtMoney(totalNev, true);
    nevEl.className = 'value ' + (totalNev >= 0 ? 'total-pnl-pos' : 'total-pnl-neg');
  }

  const roiEl = document.getElementById('total-roi');
  if (roiEl) {
    roiEl.textContent = `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`;
    roiEl.className = 'value ' + (roi >= 0 ? 'total-pnl-pos' : 'total-pnl-neg');
  }

  const bankEl = document.getElementById('current-bank');
  if (bankEl) {
    bankEl.textContent = `£${currentBank.toFixed(2)}`;
    bankEl.className = 'value ' + (currentBank >= startingBank ? 'total-pnl-pos' : 'total-pnl-neg');
    bankEl.style.cursor = 'pointer';
    bankEl.title = 'Click to change starting bank';
  }
}

// ── NEV Summary Section ──
function renderNevSummary() {
  const el = document.getElementById('nev-summary');
  const settled = bets.filter(b => b.result !== 'pending' && b.result !== 'void');
  const withNev = settled.filter(b => calculateNEV(b) !== null);

  if (withNev.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);text-align:center">Add open & close prices to see NEV analysis.</p>';
    return;
  }

  const totalNev = withNev.reduce((s, b) => s + calculateNEV(b), 0);
  const avgNevPerBet = totalNev / withNev.length;
  const totalPnL = withNev.reduce((s, b) => s + calculatePnL(b), 0);
  const variance = totalPnL - totalNev;
  const nevBets = withNev.filter(b => calculateNEV(b) < 0);
  const posEvBets = withNev.filter(b => calculateNEV(b) >= 0);

  // Average movement
  const withMov = settled.filter(b => calculateMovement(b) !== null);
  const avgMov = withMov.length > 0 ? withMov.reduce((s, b) => s + calculateMovement(b), 0) / withMov.length : 0;

  // Avg implied prob at open vs close
  const avgOpenProb = withNev.reduce((s, b) => s + impliedProb(b.openPrice), 0) / withNev.length;
  const avgCloseProb = withNev.reduce((s, b) => s + impliedProb(b.closePrice), 0) / withNev.length;

  el.innerHTML = `
    <div class="nev-grid">
      <div class="nev-card">
        <div class="nev-label">Total NEV</div>
        <div class="nev-val ${totalNev >= 0 ? 'pos' : 'neg'}">${fmtMoney(totalNev, true)}</div>
        <div class="nev-sub">Expected value based on market</div>
      </div>
      <div class="nev-card">
        <div class="nev-label">Avg NEV / Bet</div>
        <div class="nev-val ${avgNevPerBet >= 0 ? 'pos' : 'neg'}">${fmtMoney(avgNevPerBet, true)}</div>
        <div class="nev-sub">Per bet expected value</div>
      </div>
      <div class="nev-card">
        <div class="nev-label">Actual vs Expected</div>
        <div class="nev-val ${variance >= 0 ? 'pos' : 'neg'}">${fmtMoney(variance, true)}</div>
        <div class="nev-sub">${variance >= 0 ? 'Running above expectation' : 'Running below expectation'}</div>
      </div>
      <div class="nev-card">
        <div class="nev-label">-EV / +EV Bets</div>
        <div class="nev-val">${nevBets.length} / ${posEvBets.length}</div>
        <div class="nev-sub">of ${withNev.length} tracked</div>
      </div>
      <div class="nev-card">
        <div class="nev-label">Avg Movement</div>
        <div class="nev-val ${avgMov <= 0 ? 'pos' : 'neg'}">${avgMov > 0 ? '+' : ''}${avgMov.toFixed(1)}%</div>
        <div class="nev-sub">${avgMov <= 0 ? 'Avg shortening (good)' : 'Avg drifting (bad)'}</div>
      </div>
      <div class="nev-card">
        <div class="nev-label">Open vs Close Prob</div>
        <div class="nev-val">${avgOpenProb.toFixed(1)}% → ${avgCloseProb.toFixed(1)}%</div>
        <div class="nev-sub">Implied probability shift</div>
      </div>
    </div>`;
}

// ── Breakdown ──
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
  const settled = bets.filter(b => b.result !== 'pending');

  settled.forEach(bet => {
    let key;
    if (activeTab === 'track') key = bet.track;
    else if (activeTab === 'trap') key = bet.trap ? `Trap ${bet.trap} ${trapColor(bet.trap)}` : 'Unknown';
    else if (activeTab === 'grade') key = bet.grade || 'No Grade';
    else if (activeTab === 'distance') key = bet.distance ? `${bet.distance}m` : 'Unknown';
    else if (activeTab === 'reason') key = bet.reason || 'No Reason';
    else if (activeTab === 'bookmaker') key = bet.bookmaker || 'Unknown';
    else if (activeTab === 'dayofweek') key = DAYS[new Date(bet.date + 'T00:00:00').getDay()];
    else key = oddsRange(bet.openPrice);

    if (!groups[key]) groups[key] = { bets: 0, wins: 0, losses: 0, staked: 0, pnl: 0, nev: 0, nevCount: 0 };
    groups[key].bets++;
    groups[key].staked += bet.stake;
    groups[key].pnl += calculatePnL(bet);
    const nev = calculateNEV(bet);
    if (nev !== null) { groups[key].nev += nev; groups[key].nevCount++; }
    if (bet.result === 'win') groups[key].wins++;
    if (bet.result === 'loss') groups[key].losses++;
  });

  const sorted = Object.entries(groups).sort((a, b) => b[1].pnl - a[1].pnl);
  if (sorted.length === 0) {
    breakdownCards.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">No data yet</p>';
    return;
  }

  breakdownCards.innerHTML = sorted.map(([key, s]) => {
    const winRate = s.bets > 0 ? ((s.wins / s.bets) * 100).toFixed(0) : 0;
    const roi = s.staked > 0 ? ((s.pnl / s.staked) * 100).toFixed(1) : 0;
    const pnlCls = s.pnl > 0 ? 'pos' : s.pnl < 0 ? 'neg' : '';
    const cardCls = s.pnl > 0 ? 'positive' : s.pnl < 0 ? 'negative' : '';
    const nevStr = s.nevCount > 0 ? fmtMoney(s.nev, true) : '—';
    const nevCls = s.nev >= 0 ? 'pos' : 'neg';
    return `<div class="sport-card ${cardCls}">
      <div class="sport-name">${key}</div>
      <div class="sport-stats">
        <div class="stat"><span>Bets</span><span>${s.bets}</span></div>
        <div class="stat"><span>Win Rate</span><span>${winRate}%</span></div>
        <div class="stat"><span>Staked</span><span>£${s.staked.toFixed(2)}</span></div>
        <div class="stat"><span>ROI</span><span class="${pnlCls}">${roi > 0 ? '+' : ''}${roi}%</span></div>
        ${s.nevCount > 0 ? `<div class="stat"><span>NEV</span><span class="${nevCls}">${nevStr}</span></div>` : ''}
      </div>
      <div class="pnl ${pnlCls}">${fmtMoney(s.pnl, true)}</div>
    </div>`;
  }).join('');
}

// ── Insights ──
function renderInsights() {
  const bar = document.getElementById('insight-bar');
  const settled = bets.filter(b => b.result !== 'pending' && b.result !== 'void');
  if (settled.length === 0) { bar.innerHTML = ''; return; }

  const best = settled.reduce((a, b) => calculatePnL(b) > calculatePnL(a) ? b : a);
  const worst = settled.reduce((a, b) => calculatePnL(b) < calculatePnL(a) ? b : a);
  const wins = settled.filter(b => b.result === 'win');
  const losses = settled.filter(b => b.result === 'loss');
  const winRate = ((wins.length / settled.length) * 100).toFixed(1);
  const avgWinOdds = wins.length > 0 ? (wins.reduce((s, b) => s + b.openPrice, 0) / wins.length) : 0;
  const avgLossOdds = losses.length > 0 ? (losses.reduce((s, b) => s + b.openPrice, 0) / losses.length) : 0;
  const avgStake = settled.reduce((s, b) => s + b.stake, 0) / settled.length;

  // Streak calc
  const byDate = [...settled].sort((a, b) => b.date.localeCompare(a.date));
  let maxStreak = 0, streakType = '';
  let tempStreak = 0, tempType = '';
  for (const b of byDate) {
    if (b.result === tempType) { tempStreak++; }
    else { tempStreak = 1; tempType = b.result; }
    if (tempStreak > maxStreak) { maxStreak = tempStreak; streakType = tempType; }
  }

  bar.innerHTML = `
    <div class="insight-card">
      <div class="insight-label">Win Rate</div>
      <div class="insight-val">${winRate}%</div>
      <div class="insight-sub">${wins.length}W / ${losses.length}L of ${settled.length}</div>
    </div>
    <div class="insight-card">
      <div class="insight-label">Best Bet</div>
      <div class="insight-val pos">+£${calculatePnL(best).toFixed(2)}</div>
      <div class="insight-sub">${best.dogName} @ ${best.openPrice.toFixed(2)}</div>
    </div>
    <div class="insight-card">
      <div class="insight-label">Worst Bet</div>
      <div class="insight-val neg">-£${Math.abs(calculatePnL(worst)).toFixed(2)}</div>
      <div class="insight-sub">${worst.dogName}</div>
    </div>
    <div class="insight-card">
      <div class="insight-label">Avg Odds (W/L)</div>
      <div class="insight-val">${avgWinOdds.toFixed(2)} / ${avgLossOdds.toFixed(2)}</div>
      <div class="insight-sub">Winners vs Losers</div>
    </div>
    <div class="insight-card">
      <div class="insight-label">Avg Stake</div>
      <div class="insight-val">£${avgStake.toFixed(2)}</div>
      <div class="insight-sub">Per bet</div>
    </div>
    <div class="insight-card">
      <div class="insight-label">Longest Streak</div>
      <div class="insight-val ${streakType === 'win' ? 'pos' : 'neg'}">${maxStreak} ${streakType === 'win' ? '🟢' : '🔴'}</div>
      <div class="insight-sub">${streakType} streak</div>
    </div>`;
}

// ── Monthly Summary ──
function renderMonthly() {
  const tbody = document.getElementById('monthly-tbody');
  const empty = document.getElementById('monthly-empty');
  const months = {};
  bets.filter(b => b.result !== 'pending').forEach(b => {
    const key = b.date.slice(0, 7);
    if (!months[key]) months[key] = { bets: 0, wins: 0, staked: 0, returns: 0, pnl: 0, nev: 0 };
    months[key].bets++;
    months[key].staked += b.stake;
    months[key].returns += (b.returns || 0);
    months[key].pnl += calculatePnL(b);
    months[key].nev += (calculateNEV(b) || 0);
    if (b.result === 'win') months[key].wins++;
  });
  const sorted = Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
  if (sorted.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = sorted.map(([month, s]) => {
    const label = new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const winRate = s.bets > 0 ? ((s.wins / s.bets) * 100).toFixed(0) : 0;
    const roi = s.staked > 0 ? ((s.pnl / s.staked) * 100).toFixed(1) : 0;
    const pnlCls = s.pnl > 0 ? 'pos' : s.pnl < 0 ? 'neg' : '';
    const nevCls = s.nev >= 0 ? 'pos' : 'neg';
    return `<tr>
      <td>${label}</td>
      <td>${s.bets}</td>
      <td>£${s.staked.toFixed(2)}</td>
      <td>£${s.returns.toFixed(2)}</td>
      <td class="pnl-cell ${pnlCls}">${fmtMoney(s.pnl, true)}</td>
      <td class="pnl-cell ${nevCls}">${fmtMoney(s.nev, true)}</td>
      <td>${winRate}%</td>
      <td class="${pnlCls}">${roi > 0 ? '+' : ''}${roi}%</td>
    </tr>`;
  }).join('');
}

// ── Tracks Tab ──
function renderTracks() {
  const tbody = document.getElementById('tracks-tbody');
  const empty = document.getElementById('tracks-empty');
  const tracks = {};
  const settled = bets.filter(b => b.result !== 'pending' && b.result !== 'void');

  settled.forEach(b => {
    if (!tracks[b.track]) tracks[b.track] = { bets: 0, wins: 0, staked: 0, returns: 0, pnl: 0, nev: 0, totalOdds: 0 };
    tracks[b.track].bets++;
    tracks[b.track].staked += b.stake;
    tracks[b.track].returns += (b.returns || 0);
    tracks[b.track].pnl += calculatePnL(b);
    tracks[b.track].nev += (calculateNEV(b) || 0);
    tracks[b.track].totalOdds += b.openPrice;
    if (b.result === 'win') tracks[b.track].wins++;
  });

  const sorted = Object.entries(tracks).sort((a, b) => b[1].pnl - a[1].pnl);
  if (sorted.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  tbody.innerHTML = sorted.map(([track, s]) => {
    const winRate = ((s.wins / s.bets) * 100).toFixed(0);
    const roi = s.staked > 0 ? ((s.pnl / s.staked) * 100).toFixed(1) : 0;
    const avgOdds = (s.totalOdds / s.bets).toFixed(2);
    const pnlCls = s.pnl > 0 ? 'pos' : s.pnl < 0 ? 'neg' : '';
    const nevCls = s.nev >= 0 ? 'pos' : 'neg';
    return `<tr>
      <td><strong>${track}</strong></td>
      <td>${s.bets}</td>
      <td>${s.wins}</td>
      <td>${winRate}%</td>
      <td>£${s.staked.toFixed(2)}</td>
      <td>£${s.returns.toFixed(2)}</td>
      <td class="pnl-cell ${pnlCls}">${fmtMoney(s.pnl, true)}</td>
      <td class="pnl-cell ${nevCls}">${fmtMoney(s.nev, true)}</td>
      <td class="${pnlCls}">${roi > 0 ? '+' : ''}${roi}%</td>
      <td>${avgOdds}</td>
    </tr>`;
  }).join('');

  renderTrackNevChart(sorted);
}

function renderTrackNevChart(sorted) {
  const ctx = document.getElementById('track-nev-chart');
  if (trackNevChart) trackNevChart.destroy();
  if (sorted.length === 0) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#94a3b8' : '#52637a';

  trackNevChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(([t]) => t),
      datasets: [
        { label: 'P&L', data: sorted.map(([, s]) => s.pnl.toFixed(2)), backgroundColor: sorted.map(([, s]) => s.pnl >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)') },
        { label: 'NEV', data: sorted.map(([, s]) => s.nev.toFixed(2)), backgroundColor: 'rgba(108,99,255,0.5)' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, callback: v => '£' + v }, grid: { color: gridColor } }
      }
    }
  });
}

// ── Selections (Dogs) Tab ──
function renderSelections() {
  const tbody = document.getElementById('dogs-tbody');
  const empty = document.getElementById('dogs-empty');
  const dogs = {};
  const settled = bets.filter(b => b.result !== 'pending' && b.result !== 'void');

  settled.forEach(b => {
    const name = b.dogName;
    if (!dogs[name]) dogs[name] = { bets: 0, wins: 0, staked: 0, returns: 0, pnl: 0, nev: 0, totalOdds: 0, bestPnl: -Infinity };
    dogs[name].bets++;
    dogs[name].staked += b.stake;
    dogs[name].returns += (b.returns || 0);
    const pnl = calculatePnL(b);
    dogs[name].pnl += pnl;
    dogs[name].nev += (calculateNEV(b) || 0);
    dogs[name].totalOdds += b.openPrice;
    if (pnl > dogs[name].bestPnl) dogs[name].bestPnl = pnl;
    if (b.result === 'win') dogs[name].wins++;
  });

  const sorted = Object.entries(dogs).sort((a, b) => b[1].pnl - a[1].pnl);
  if (sorted.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  tbody.innerHTML = sorted.map(([dog, s]) => {
    const winRate = ((s.wins / s.bets) * 100).toFixed(0);
    const avgOdds = (s.totalOdds / s.bets).toFixed(2);
    const pnlCls = s.pnl > 0 ? 'pos' : s.pnl < 0 ? 'neg' : '';
    const nevCls = s.nev >= 0 ? 'pos' : 'neg';
    const bestCls = s.bestPnl > 0 ? 'pos' : s.bestPnl < 0 ? 'neg' : '';
    return `<tr>
      <td><strong>${dog}</strong></td>
      <td>${s.bets}</td>
      <td>${s.wins}</td>
      <td>${winRate}%</td>
      <td>£${s.staked.toFixed(2)}</td>
      <td>£${s.returns.toFixed(2)}</td>
      <td class="pnl-cell ${pnlCls}">${fmtMoney(s.pnl, true)}</td>
      <td class="pnl-cell ${nevCls}">${fmtMoney(s.nev, true)}</td>
      <td>${avgOdds}</td>
      <td class="pnl-cell ${bestCls}">${fmtMoney(s.bestPnl, true)}</td>
    </tr>`;
  }).join('');

  renderTopPerformers(sorted);
}

function renderTopPerformers(sorted) {
  const el = document.getElementById('top-performers');
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();

  el.innerHTML = `
    <div class="perf-section">
      <h3 class="pos">🏆 Top 5 Profitable Dogs</h3>
      <div class="perf-list">
        ${top5.map(([dog, s], i) => `
          <div class="perf-item positive">
            <span class="perf-rank">#${i + 1}</span>
            <span class="perf-name">${dog}</span>
            <span class="perf-stats">${s.bets} bets, ${s.wins}W, ${((s.wins/s.bets)*100).toFixed(0)}%</span>
            <span class="perf-pnl pos">${fmtMoney(s.pnl, true)}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="perf-section">
      <h3 class="neg">💸 Bottom 5 Dogs</h3>
      <div class="perf-list">
        ${bottom5.map(([dog, s], i) => `
          <div class="perf-item negative">
            <span class="perf-rank">#${sorted.length - 4 + i}</span>
            <span class="perf-name">${dog}</span>
            <span class="perf-stats">${s.bets} bets, ${s.wins}W</span>
            <span class="perf-pnl neg">${fmtMoney(s.pnl, true)}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

// ── P&L Chart ──
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    chartPeriod = btn.dataset.period;
    renderChart();
  });
});

function renderChart() {
  let settled = [...bets].filter(b => b.result !== 'pending' && b.result !== 'void').sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
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

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#94a3b8' : '#52637a';

  let runPnl = 0, runNev = 0;
  const labels = [];
  const pnlData = [];
  const nevData = [];

  settled.forEach((b, i) => {
    runPnl += calculatePnL(b);
    runNev += (calculateNEV(b) || 0);
    labels.push(i + 1);
    pnlData.push(runPnl.toFixed(2));
    nevData.push(runNev.toFixed(2));
  });

  if (pnlChart) pnlChart.destroy();
  pnlChart = new Chart(document.getElementById('pnl-chart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Actual P&L',
          data: pnlData,
          borderColor: '#6c63ff',
          backgroundColor: 'rgba(108,99,255,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 2
        },
        {
          label: 'Expected (NEV)',
          data: nevData,
          borderColor: '#ef4444',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor } },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: £${ctx.parsed.y}` } }
      },
      scales: {
        x: { title: { display: true, text: 'Bet #', color: textColor }, ticks: { color: textColor }, grid: { color: gridColor } },
        y: { title: { display: true, text: 'P&L (£)', color: textColor }, ticks: { color: textColor, callback: v => '£' + v }, grid: { color: gridColor } }
      }
    }
  });
}

// ── Day of Week Chart ──
function renderDowChart() {
  const settled = bets.filter(b => b.result !== 'pending' && b.result !== 'void');
  const dowEmpty = document.getElementById('dow-empty');
  if (settled.length === 0) { dowEmpty.style.display = 'block'; return; }
  dowEmpty.style.display = 'none';

  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayPnl = [0,0,0,0,0,0,0];
  settled.forEach(b => {
    const d = new Date(b.date + 'T00:00:00').getDay();
    const idx = d === 0 ? 6 : d - 1;
    dayPnl[idx] += calculatePnL(b);
  });

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#94a3b8' : '#52637a';

  if (dowChart) dowChart.destroy();
  dowChart = new Chart(document.getElementById('dow-chart'), {
    type: 'bar',
    data: {
      labels: DAYS,
      datasets: [{
        label: 'P&L',
        data: dayPnl.map(v => v.toFixed(2)),
        backgroundColor: dayPnl.map(v => v >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)')
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, callback: v => '£' + v }, grid: { color: gridColor } }
      }
    }
  });
}

// ── Export CSV ──
exportBtn.addEventListener('click', () => {
  if (bets.length === 0) return alert('No bets to export.');
  const headers = ['Date','Time','Track','Distance','Trap','Dog','Grade','Type','Stake','OpenPrice','ClosePrice','Movement%','NEV','Returns','Result','P&L','Bookmaker','Reason','Notes'];
  const rows = bets.map(b => [
    b.date, b.time || '', b.track, b.distance || '', b.trap || '', b.dogName,
    b.grade || '', b.type, b.stake.toFixed(2), b.openPrice.toFixed(2),
    b.closePrice ? b.closePrice.toFixed(2) : '',
    calculateMovement(b) !== null ? calculateMovement(b).toFixed(1) : '',
    calculateNEV(b) !== null ? calculateNEV(b).toFixed(4) : '',
    (b.returns || 0).toFixed(2), b.result,
    calculatePnL(b).toFixed(2), b.bookmaker || '', b.reason || '', b.notes || ''
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `greyhound-bets-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
});

// ── Import CSV ──
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const lines = ev.target.result.split('\n').filter(l => l.trim());
    const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].match(/(".*?"|[^,]+)/g)?.map(c => c.replace(/"/g, '').trim()) || [];
      if (cols.length < 5) continue;
      const get = (name) => cols[header.indexOf(name)] || '';
      bets.push({
        id: Date.now() + i,
        date: get('date'),
        time: get('time'),
        track: get('track'),
        distance: get('distance'),
        trap: get('trap'),
        dogName: get('dog'),
        grade: get('grade'),
        type: get('type') || 'Win',
        stake: parseFloat(get('stake')) || 0,
        openPrice: parseFloat(get('openprice')) || 0,
        closePrice: parseFloat(get('closeprice')) || null,
        returns: parseFloat(get('returns')) || 0,
        result: get('result') || 'pending',
        bookmaker: get('bookmaker'),
        reason: get('reason'),
        notes: get('notes')
      });
    }
    saveBets(); renderAll();
    alert(`Imported ${lines.length - 1} bets.`);
  };
  reader.readAsText(file);
  importFile.value = '';
});

// ── Clear All ──
clearAllBtn.addEventListener('click', () => {
  if (confirm('Delete ALL bets? This cannot be undone.')) {
    bets = [];
    saveBets(); renderAll();
  }
});
