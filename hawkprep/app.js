/* ═══════════════════════════════════════════════════════════
   HawkPrep — Emergency Food Store Tracker
   Data stored locally in localStorage under 'hawkprep_items'
═══════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'hawkprep_items';
const SOON_DAYS = 14; // "going off soon" window

/* ── Categories (with icon + a rough "well stocked" target for readiness) ── */
const CATEGORIES = [
  { id: 'tinned',    name: 'Tinned goods',    icon: '🥫', target: 10 },
  { id: 'pasta-rice', name: 'Pasta & rice',   icon: '🍝', target: 6 },
  { id: 'grains',    name: 'Grains & cereal', icon: '🌾', target: 4 },
  { id: 'water',     name: 'Water & drinks',  icon: '💧', target: 8 },
  { id: 'fridge',    name: 'Fridge',          icon: '🧊', target: 6 },
  { id: 'frozen',    name: 'Frozen',          icon: '❄️', target: 6 },
  { id: 'baking',    name: 'Baking & dry',    icon: '🧂', target: 4 },
  { id: 'snacks',    name: 'Snacks',          icon: '🍫', target: 4 },
  { id: 'sauces',    name: 'Sauces & oils',   icon: '🫙', target: 4 },
  { id: 'medical',   name: 'Medical & other', icon: '🩹', target: 3 },
];

const catById = id => CATEGORIES.find(c => c.id === id) || { name: 'Other', icon: '📦', target: 3 };

/* ── State ── */
let items = load();
let editingId = null;

/* ── Persistence ── */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ── Date helpers ── */
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}
function expiryStatus(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return 'none';
  if (d < 0) return 'expired';
  if (d <= SOON_DAYS) return 'soon';
  return 'ok';
}
function expiryLabel(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return 'No date';
  if (d < 0) return Math.abs(d) === 1 ? 'Expired 1 day ago' : `Expired ${Math.abs(d)} days ago`;
  if (d === 0) return 'Use by today';
  if (d === 1) return 'Use by tomorrow';
  if (d <= SOON_DAYS) return `${d} days left`;
  if (d <= 60) return `${d} days left`;
  const months = Math.round(d / 30);
  return months <= 1 ? '~1 month left' : `~${months} months left`;
}
function shortExpiry(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return 'No date';
  if (d < 0) return `${Math.abs(d)}d ago`;
  if (d === 0) return 'Today';
  if (d <= 60) return `${d}d`;
  return `${Math.round(d / 30)}mo`;
}

/* ═══════════════════════════════════════════════════════════
   RENDER — Dashboard
═══════════════════════════════════════════════════════════ */
function renderDashboard() {
  const totalItems = items.length;
  const totalUnits = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  const expired = items.filter(it => expiryStatus(it.expiry) === 'expired');
  const soon = items.filter(it => expiryStatus(it.expiry) === 'soon');

  document.getElementById('stat-total').textContent = totalItems;
  document.getElementById('stat-units').textContent = totalUnits;
  document.getElementById('stat-expired').textContent = expired.length;
  document.getElementById('stat-soon').textContent = soon.length;

  // Alert banner
  const banner = document.getElementById('alert-banner');
  if (expired.length > 0) {
    banner.hidden = false;
    banner.innerHTML = `⚠️ <span>${expired.length} item${expired.length > 1 ? 's have' : ' has'} passed its use-by date — check and replace.</span>`;
  } else if (soon.length > 0) {
    banner.hidden = false;
    banner.innerHTML = `⏳ <span>${soon.length} item${soon.length > 1 ? 's are' : ' is'} going off within ${SOON_DAYS} days.</span>`;
    banner.style.background = 'color-mix(in srgb, var(--warn) 14%, var(--surface))';
    banner.style.borderColor = 'color-mix(in srgb, var(--warn) 45%, transparent)';
    banner.style.color = '#fcd34d';
  } else {
    banner.hidden = true;
  }

  renderReadiness();
  renderExpiryTimeline(expired, soon);
  renderCategoryBreakdown();
}

function renderReadiness() {
  // Readiness = how many category targets you've met (weighted), ignoring expired units
  let scoreSum = 0;
  CATEGORIES.forEach(cat => {
    const units = items
      .filter(it => it.category === cat.id && expiryStatus(it.expiry) !== 'expired')
      .reduce((s, it) => s + (Number(it.qty) || 0), 0);
    scoreSum += Math.min(1, units / cat.target);
  });
  const pct = Math.round((scoreSum / CATEGORIES.length) * 100);

  document.getElementById('readiness-fill').style.width = pct + '%';
  const label = document.getElementById('readiness-label');
  const note = document.getElementById('readiness-note');
  label.textContent = pct + '%';

  let msg, colour;
  if (items.length === 0) {
    msg = 'Add items to see how well-stocked you are.'; colour = 'var(--muted)';
  } else if (pct >= 80) {
    msg = 'Well prepared — you have a solid spread across categories.'; colour = 'var(--ok)';
  } else if (pct >= 50) {
    msg = 'Getting there. Top up the categories that are running low.'; colour = 'var(--warn)';
  } else {
    msg = 'Light on supplies. Build up a broader stock across categories.'; colour = 'var(--danger)';
  }
  note.textContent = msg;
  label.style.color = colour;
}

function renderExpiryTimeline(expired, soon) {
  const list = document.getElementById('expiry-list');
  // Items with dates, nearest first; prioritise expired + soon, then a few upcoming
  const dated = items
    .filter(it => it.expiry)
    .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry));

  const toShow = dated.slice(0, 8);

  if (toShow.length === 0) {
    list.innerHTML = `<p class="panel-note">No use-by dates logged yet. Add dates to items so HawkPrep can warn you before they go off.</p>`;
    return;
  }

  list.innerHTML = toShow.map(it => {
    const status = expiryStatus(it.expiry);
    const cat = catById(it.category);
    return `
      <div class="expiry-row ${status}">
        <div class="expiry-main">
          <div class="expiry-name">${cat.icon} ${escapeHtml(it.name)}</div>
          <div class="expiry-meta">${it.qty} ${escapeHtml(it.unit || '')} · ${escapeHtml(it.location || 'Cupboard')}</div>
        </div>
        <span class="expiry-badge ${status}">${expiryLabel(it.expiry)}</span>
      </div>`;
  }).join('');
}

function renderCategoryBreakdown() {
  const wrap = document.getElementById('category-breakdown');
  const counts = {};
  items.forEach(it => {
    counts[it.category] = (counts[it.category] || 0) + (Number(it.qty) || 0);
  });
  const present = CATEGORIES.filter(c => counts[c.id] > 0);

  if (present.length === 0) {
    wrap.innerHTML = `<p class="panel-note">Nothing stocked yet.</p>`;
    return;
  }

  const maxUnits = Math.max(...present.map(c => counts[c.id]));
  wrap.innerHTML = present
    .sort((a, b) => counts[b.id] - counts[a.id])
    .map(c => {
      const units = counts[c.id];
      const pct = Math.round((units / maxUnits) * 100);
      return `
        <div class="cat-row">
          <div class="cat-name">${c.icon} ${c.name}</div>
          <div class="cat-track"><div class="cat-fill" style="width:${pct}%"></div></div>
          <div class="cat-count">${units}</div>
        </div>`;
    }).join('');
}

/* ═══════════════════════════════════════════════════════════
   RENDER — Inventory
═══════════════════════════════════════════════════════════ */
function renderInventory() {
  const list = document.getElementById('inventory-list');
  const empty = document.getElementById('empty-inventory');

  if (items.length === 0) {
    list.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const q = document.getElementById('search').value.trim().toLowerCase();
  const catFilter = document.getElementById('filter-cat').value;
  const sortBy = document.getElementById('sort-by').value;

  let filtered = items.filter(it => {
    const matchesQ = !q || it.name.toLowerCase().includes(q) ||
      (it.notes || '').toLowerCase().includes(q);
    const matchesCat = !catFilter || it.category === catFilter;
    return matchesQ && matchesCat;
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'category': return catById(a.category).name.localeCompare(catById(b.category).name);
      case 'qty': return (b.qty || 0) - (a.qty || 0);
      case 'expiry':
      default: {
        const da = a.expiry ? daysUntil(a.expiry) : Infinity;
        const db = b.expiry ? daysUntil(b.expiry) : Infinity;
        return da - db;
      }
    }
  });

  if (filtered.length === 0) {
    list.innerHTML = `<p class="panel-note" style="padding:30px 0;text-align:center">No items match your search.</p>`;
    return;
  }

  list.innerHTML = filtered.map(it => {
    const cat = catById(it.category);
    const status = expiryStatus(it.expiry);
    return `
      <div class="inv-card" data-id="${it.id}">
        <div class="inv-icon">${cat.icon}</div>
        <div class="inv-body">
          <div class="inv-name">${escapeHtml(it.name)}</div>
          <div class="inv-sub">
            <span>${cat.name}</span>
            <span class="dot">·</span>
            <span>${escapeHtml(it.location || 'Cupboard')}</span>
            ${it.notes ? `<span class="dot">·</span><span>${escapeHtml(it.notes)}</span>` : ''}
          </div>
        </div>
        <div class="inv-right">
          <div class="inv-qty">${it.qty}<span class="inv-qty-unit"> ${escapeHtml(it.unit || '')}</span></div>
          <div class="inv-exp ${status}">${shortExpiry(it.expiry)}</div>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.inv-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
}

/* ═══════════════════════════════════════════════════════════
   MODAL — Add / Edit
═══════════════════════════════════════════════════════════ */
function openModal(id) {
  editingId = id || null;
  const form = document.getElementById('item-form');
  form.reset();

  const title = document.getElementById('modal-title');
  const delBtn = document.getElementById('form-delete');

  if (id) {
    const it = items.find(x => x.id === id);
    if (!it) return;
    title.textContent = 'Edit item';
    document.getElementById('f-id').value = it.id;
    document.getElementById('f-name').value = it.name;
    document.getElementById('f-category').value = it.category;
    document.getElementById('f-qty').value = it.qty;
    document.getElementById('f-unit').value = it.unit || 'tins';
    document.getElementById('f-expiry').value = it.expiry || '';
    document.getElementById('f-location').value = it.location || 'Cupboard';
    document.getElementById('f-notes').value = it.notes || '';
    delBtn.hidden = false;
  } else {
    title.textContent = 'Add item';
    document.getElementById('f-id').value = '';
    delBtn.hidden = true;
  }

  document.getElementById('modal').hidden = false;
  setTimeout(() => document.getElementById('f-name').focus(), 50);
}

function closeModal() {
  document.getElementById('modal').hidden = true;
  editingId = null;
}

function handleSubmit(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('f-name').value.trim(),
    category: document.getElementById('f-category').value,
    qty: Math.max(0, Number(document.getElementById('f-qty').value) || 0),
    unit: document.getElementById('f-unit').value,
    expiry: document.getElementById('f-expiry').value || null,
    location: document.getElementById('f-location').value,
    notes: document.getElementById('f-notes').value.trim(),
  };
  if (!data.name) return;

  if (editingId) {
    const idx = items.findIndex(x => x.id === editingId);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    toast('Item updated');
  } else {
    data.id = 'it_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    data.added = Date.now();
    items.push(data);
    toast('Item added');
  }

  save();
  closeModal();
  renderAll();
}

function deleteItem() {
  if (!editingId) return;
  const it = items.find(x => x.id === editingId);
  if (it && !confirm(`Delete "${it.name}" from your store?`)) return;
  items = items.filter(x => x.id !== editingId);
  save();
  closeModal();
  renderAll();
  toast('Item deleted');
}

/* ═══════════════════════════════════════════════════════════
   UI plumbing
═══════════════════════════════════════════════════════════ */
function renderAll() {
  renderDashboard();
  renderInventory();
}

function switchView(view) {
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.view === view));
  document.querySelectorAll('.view').forEach(v =>
    v.classList.toggle('active', v.id === 'view-' + view));
}

function populateCategorySelects() {
  const formSelect = document.getElementById('f-category');
  const filterSelect = document.getElementById('filter-cat');
  CATEGORIES.forEach(c => {
    const o1 = document.createElement('option');
    o1.value = c.id; o1.textContent = `${c.icon} ${c.name}`;
    formSelect.appendChild(o1);
    const o2 = document.createElement('option');
    o2.value = c.id; o2.textContent = `${c.icon} ${c.name}`;
    filterSelect.appendChild(o2);
  });
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ── Wire up events ── */
function init() {
  populateCategorySelects();

  document.querySelectorAll('.tab').forEach(tab =>
    tab.addEventListener('click', () => switchView(tab.dataset.view)));

  document.getElementById('open-add').addEventListener('click', () => openModal());
  document.getElementById('empty-add').addEventListener('click', () => openModal());
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target.id === 'modal') closeModal();
  });
  document.getElementById('item-form').addEventListener('submit', handleSubmit);
  document.getElementById('form-delete').addEventListener('click', deleteItem);

  document.getElementById('search').addEventListener('input', renderInventory);
  document.getElementById('filter-cat').addEventListener('change', renderInventory);
  document.getElementById('sort-by').addEventListener('change', renderInventory);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('modal').hidden) closeModal();
  });

  renderAll();
}

/* ── Service worker ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

init();
