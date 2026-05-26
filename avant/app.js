// Avant – Streaming Tracker app.js

const STORAGE_KEY = "avant_shows";
const SERVICE_COLORS = {
  "Netflix": "#e50914",
  "Disney+": "#113ccf",
  "Prime Video": "#00a8e1",
  "Apple TV+": "#555",
  "Stan": "#00b2ff",
  "Binge": "#f04e23",
  "Paramount+": "#0064ff",
  "BBC iPlayer": "#ff4c98",
  "ITVX": "#00cc99",
  "Now TV": "#2baf2b",
  "Channel 4": "#000",
  "Kayo": "#00c853",
  "Crunchyroll": "#f47521",
  "Other": "#888"
};

let shows = [];
let editingId = null;
let modalRating = 0;
let modalViewer = "solo";
let draggedItem = null;
const RECS_CACHE_KEY = "avant_recs";
const RECS_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

// ── Toast notifications ──────────────────────────────────────────────────────
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("visible"));
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Persistence ──────────────────────────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    shows = raw ? JSON.parse(raw) : [];
  } catch { shows = []; }

  // Migrate old data: add missing fields
  shows.forEach(s => {
    if (!s.id || typeof s.id === "number") s.id = s.id ? String(s.id) : generateId();
    if (!s.currentSeason) s.currentSeason = null;
    if (!s.currentEpisode) s.currentEpisode = null;
    if (!s.totalSeasons) s.totalSeasons = null;
    if (!s.episodesPerSeason) s.episodesPerSeason = null;
    if (!s.rating) s.rating = 0;
    if (!s.statusHistory) s.statusHistory = [];
    if (!s.updatedAt) s.updatedAt = s.addedAt || new Date().toISOString();
    if (!s.order) s.order = 0;
    if (!s.viewerType) s.viewerType = "solo";
  });

  if (typeof FireSync !== "undefined") {
    FireSync.load(STORAGE_KEY, function(data) {
      if (data && Array.isArray(data)) {
        shows = data;
        refreshUI();
      }
    });
    FireSync.listen(STORAGE_KEY, function(data) {
      if (data && Array.isArray(data)) {
        shows = data;
        refreshUI();
      }
    });
  }
}

function save() {
  if (typeof FireSync !== "undefined") {
    FireSync.save(STORAGE_KEY, shows);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shows));
  }
  updateStats();
}

function generateId() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function refreshUI() {
  updateStats();
  populateFilters();
  renderMain();
  renderToWatch();
  renderFinished();
  renderManageStats();
  checkRecommendations();
}

// ── Stats ────────────────────────────────────────────────────────────────────
function updateStats() {
  const watching = shows.filter(s => s.status === "watching").length;
  const toWatch = shows.filter(s => s.status === "to-watch").length;
  const finished = shows.filter(s => s.status === "finished").length;
  document.getElementById("stat-watching").textContent = watching + " Watching";
  document.getElementById("stat-to-watch").textContent = toWatch + " To Watch";
  document.getElementById("stat-finished").textContent = finished + " Finished";
  document.getElementById("stat-total").textContent = shows.length + " Total";
}

// ── Filter dropdowns ─────────────────────────────────────────────────────────
function populateFilters() {
  const categories = [...new Set(shows.map(s => s.category))].sort();
  const services = [...new Set(shows.map(s => s.service))].sort();

  populateSelect("category-filter", categories, "All Categories");
  populateSelect("service-filter", services, "All Services");
  populateSelect("category-filter-towatch", categories, "All Categories");
  populateSelect("service-filter-towatch", services, "All Services");
  populateSelect("category-filter-finished", categories, "All Categories");
  populateSelect("service-filter-finished", services, "All Services");
}

function populateSelect(id, items, defaultLabel) {
  const sel = document.getElementById(id);
  const current = sel.value;
  sel.innerHTML = `<option value="">${defaultLabel}</option>`;
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    sel.appendChild(opt);
  });
  sel.value = current;
}

// ── Sorting ──────────────────────────────────────────────────────────────────
function sortShows(list, sortBy) {
  const sorted = [...list];
  switch (sortBy) {
    case "alpha":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "recent":
      sorted.sort((a, b) => (b.addedAt || "").localeCompare(a.addedAt || ""));
      break;
    case "updated":
      sorted.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      break;
    case "rating":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "category":
    default:
      sorted.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
      break;
  }
  return sorted;
}

// ── Duplicate detection ──────────────────────────────────────────────────────
function findDuplicate(title, excludeId) {
  const normalised = title.toLowerCase().trim();
  return shows.find(s => s.title.toLowerCase().trim() === normalised && String(s.id) !== String(excludeId));
}

// ── Progress calculation ─────────────────────────────────────────────────────
function getProgress(show) {
  if (!show.totalSeasons || !show.episodesPerSeason) return null;
  if (!show.currentSeason || !show.currentEpisode) return null;
  const totalEps = show.totalSeasons * show.episodesPerSeason;
  const watchedEps = ((show.currentSeason - 1) * show.episodesPerSeason) + show.currentEpisode;
  return Math.min(Math.round((watchedEps / totalEps) * 100), 100);
}

// ── Render: Watching page ────────────────────────────────────────────────────
function renderMain() {
  const grid = document.getElementById("main-grid");
  const search = document.getElementById("search").value.toLowerCase();
  const catFilter = document.getElementById("category-filter").value;
  const svcFilter = document.getElementById("service-filter").value;
  const viewerFilter = document.getElementById("viewer-filter").value;
  const sortBy = document.getElementById("sort-watching").value;

  let filtered = shows.filter(s => {
    if (s.status !== "watching") return false;
    if (search && !s.title.toLowerCase().includes(search) && !s.service.toLowerCase().includes(search)) return false;
    if (catFilter && s.category !== catFilter) return false;
    if (svcFilter && s.service !== svcFilter) return false;
    if (viewerFilter && s.viewerType !== viewerFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📺</div>
        <p>${shows.length === 0 ? "No shows yet. Add your first show to get started." : "No shows match your filters."}</p>
      </div>`;
    return;
  }

  filtered = sortShows(filtered, sortBy);

  if (sortBy === "category") {
    const grouped = {};
    filtered.forEach(s => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });
    const sortedCategories = Object.keys(grouped).sort();
    grid.innerHTML = sortedCategories.map(cat => `
      <div class="category-section">
        <div class="category-header">
          <h2>${cat}</h2>
          <span class="category-count">${grouped[cat].length}</span>
        </div>
        <div class="shows-grid">
          ${grouped[cat].map(s => renderCard(s)).join("")}
        </div>
      </div>
    `).join("");
  } else {
    grid.innerHTML = `<div class="shows-grid">${filtered.map(s => renderCard(s)).join("")}</div>`;
  }

  attachCardEvents(grid);
}

function renderCard(show) {
  const color = SERVICE_COLORS[show.service] || SERVICE_COLORS["Other"];
  const statusClass = show.status === "watching" ? "watching" : show.status === "finished" ? "finished" : "to-watch";
  const statusLabel = show.status === "watching" ? "Watching" : show.status === "finished" ? "Finished" : "To Watch";
  const toWatchClass = show.status === "to-watch" ? "to-watch-card" : "";
  const finishedClass = show.status === "finished" ? "finished-card" : "";

  let toggleBtns = "";
  if (show.status === "watching") {
    toggleBtns = `<button class="card-action-btn btn-toggle" data-to="to-watch" title="Move to To Watch" aria-label="Move to To Watch">📋</button>
      <button class="card-action-btn btn-toggle" data-to="finished" title="Mark Finished" aria-label="Mark Finished">✅</button>`;
  } else if (show.status === "to-watch") {
    toggleBtns = `<button class="card-action-btn btn-toggle" data-to="watching" title="Start Watching" aria-label="Start Watching">▶</button>`;
  } else {
    toggleBtns = `<button class="card-action-btn btn-toggle" data-to="watching" title="Re-watch" aria-label="Re-watch">🔄</button>`;
  }

  const progress = getProgress(show);
  const progressHtml = progress !== null ? `<div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div><span class="progress-text">${progress}%</span></div>` : "";

  const episodeInfo = show.currentSeason && show.currentEpisode
    ? `S${show.currentSeason}E${show.currentEpisode}` 
    : (show.currentSeason ? `S${show.currentSeason}` : "");

  const ratingHtml = show.rating ? `<div class="card-rating">${"★".repeat(show.rating)}${"☆".repeat(5 - show.rating)}</div>` : "";

  const viewerIcon = show.viewerType === "couple" ? "👫" : "👤";
  const viewerLabel = show.viewerType === "couple" ? "Couple" : "Solo";

  return `
    <div class="show-card ${toWatchClass} ${finishedClass}" data-id="${show.id}" tabindex="0" role="article" aria-label="${escHtml(show.title)}">
      <div class="card-actions">
        ${toggleBtns}
        <button class="card-action-btn btn-edit" title="Edit" aria-label="Edit ${escHtml(show.title)}">✏</button>
        <button class="card-action-btn delete btn-delete" title="Delete" aria-label="Delete ${escHtml(show.title)}">✕</button>
      </div>
      <button class="viewer-badge btn-viewer-toggle" title="Click to switch (${viewerLabel})" aria-label="Toggle viewer type">${viewerIcon}</button>
      <div class="card-service" style="color:${color}">
        <span class="service-dot" style="background:${color}"></span>
        ${show.service}
      </div>
      <div class="card-title">${escHtml(show.title)}</div>
      <div class="card-category">${show.category}${episodeInfo ? " · " + episodeInfo : ""}</div>
      ${progressHtml}
      ${ratingHtml}
      <span class="card-status ${statusClass}">${statusLabel}</span>
      ${show.notes ? `<div class="card-notes">${escHtml(show.notes)}</div>` : ""}
    </div>`;
}

function attachCardEvents(container) {
  container.querySelectorAll(".show-card").forEach(card => {
    const id = card.dataset.id;
    card.querySelector(".btn-edit")?.addEventListener("click", e => { e.stopPropagation(); openEdit(id); });
    card.querySelector(".btn-delete")?.addEventListener("click", e => { e.stopPropagation(); deleteShow(id); });
    card.querySelectorAll(".btn-toggle").forEach(btn => {
      btn.addEventListener("click", e => { e.stopPropagation(); changeStatus(id, btn.dataset.to); });
    });
    // Viewer type toggle (single click)
    card.querySelector(".btn-viewer-toggle")?.addEventListener("click", e => {
      e.stopPropagation();
      toggleViewerType(id);
    });
    // Keyboard support
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEdit(id); }
      if (e.key === "Delete") { e.preventDefault(); deleteShow(id); }
    });
  });
}

// ── Render: To Watch page ────────────────────────────────────────────────────
function renderToWatch() {
  const grid = document.getElementById("towatch-grid");
  const search = document.getElementById("search-towatch").value.toLowerCase();
  const catFilter = document.getElementById("category-filter-towatch").value;
  const svcFilter = document.getElementById("service-filter-towatch").value;
  const viewerFilter = document.getElementById("viewer-filter-towatch").value;
  const sortBy = document.getElementById("sort-towatch").value;

  let filtered = shows.filter(s => {
    if (s.status !== "to-watch") return false;
    if (search && !s.title.toLowerCase().includes(search) && !s.service.toLowerCase().includes(search)) return false;
    if (catFilter && s.category !== catFilter) return false;
    if (svcFilter && s.service !== svcFilter) return false;
    if (viewerFilter && s.viewerType !== viewerFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">📋</div>
        <p>No shows in your To Watch list yet.</p>
      </div>`;
    return;
  }

  filtered = sortShows(filtered, sortBy);
  grid.innerHTML = filtered.map(s => renderCard(s)).join("");
  attachCardEvents(grid);
  initDragAndDrop(grid);
}

// ── Render: Finished page ────────────────────────────────────────────────────
function renderFinished() {
  const grid = document.getElementById("finished-grid");
  const search = document.getElementById("search-finished").value.toLowerCase();
  const catFilter = document.getElementById("category-filter-finished").value;
  const svcFilter = document.getElementById("service-filter-finished").value;
  const sortBy = document.getElementById("sort-finished").value;

  let filtered = shows.filter(s => {
    if (s.status !== "finished") return false;
    if (search && !s.title.toLowerCase().includes(search) && !s.service.toLowerCase().includes(search)) return false;
    if (catFilter && s.category !== catFilter) return false;
    if (svcFilter && s.service !== svcFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">✅</div>
        <p>No finished shows yet. Mark shows as finished when you complete them.</p>
      </div>`;
    return;
  }

  filtered = sortShows(filtered, sortBy);
  grid.innerHTML = filtered.map(s => renderCard(s)).join("");
  attachCardEvents(grid);
}

// ── Manage Stats ─────────────────────────────────────────────────────────────
function renderManageStats() {
  const el = document.getElementById("manage-stats");
  if (!el) return;
  const finished = shows.filter(s => s.status === "finished");
  const rated = finished.filter(s => s.rating > 0);
  const avgRating = rated.length ? (rated.reduce((sum, s) => sum + s.rating, 0) / rated.length).toFixed(1) : "–";
  const topCategory = getMostCommon(shows.map(s => s.category));
  const topService = getMostCommon(shows.map(s => s.service));

  el.innerHTML = `
    <div class="stat-card"><div class="stat-value">${shows.length}</div><div class="stat-label">Total Shows</div></div>
    <div class="stat-card"><div class="stat-value">${finished.length}</div><div class="stat-label">Finished</div></div>
    <div class="stat-card"><div class="stat-value">${avgRating}</div><div class="stat-label">Avg Rating</div></div>
    <div class="stat-card"><div class="stat-value">${topCategory || "–"}</div><div class="stat-label">Top Category</div></div>
    <div class="stat-card"><div class="stat-value">${topService || "–"}</div><div class="stat-label">Top Service</div></div>
  `;
}

function getMostCommon(arr) {
  if (!arr.length) return null;
  const counts = {};
  arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

// ── Drag and Drop (To Watch reordering) ──────────────────────────────────────
function initDragAndDrop(container) {
  const cards = container.querySelectorAll(".show-card");
  cards.forEach(card => {
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", e => {
      draggedItem = card;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedItem = null;
      container.querySelectorAll(".show-card").forEach(c => c.classList.remove("drag-over"));
      // Save new order
      const cardIds = [...container.querySelectorAll(".show-card")].map(c => c.dataset.id);
      cardIds.forEach((id, idx) => {
        const show = shows.find(s => String(s.id) === String(id));
        if (show) show.order = idx;
      });
      save();
    });
    card.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (draggedItem && card !== draggedItem) {
        card.classList.add("drag-over");
        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          container.insertBefore(draggedItem, card);
        } else {
          container.insertBefore(draggedItem, card.nextSibling);
        }
      }
    });
    card.addEventListener("dragleave", () => {
      card.classList.remove("drag-over");
    });
  });
}

// ── Modal ────────────────────────────────────────────────────────────────────
function openAdd() {
  editingId = null;
  modalRating = 0;
  modalViewer = "solo";
  document.getElementById("modal-title").textContent = "Add Show";
  document.getElementById("input-title").value = "";
  document.getElementById("input-service").value = "Netflix";
  document.getElementById("input-category").value = "Comedy";
  document.getElementById("input-status").value = "watching";
  document.getElementById("input-current-season").value = "";
  document.getElementById("input-current-episode").value = "";
  document.getElementById("input-total-seasons").value = "";
  document.getElementById("input-episodes-per-season").value = "";
  document.getElementById("input-notes").value = "";
  updateStarDisplay();
  updateViewerToggle();
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("input-title").focus();
}

function openEdit(id) {
  const show = shows.find(s => String(s.id) === String(id));
  if (!show) return;
  editingId = id;
  modalRating = show.rating || 0;
  modalViewer = show.viewerType || "solo";
  document.getElementById("modal-title").textContent = "Edit Show";
  document.getElementById("input-title").value = show.title;
  document.getElementById("input-service").value = show.service;
  document.getElementById("input-category").value = show.category;
  document.getElementById("input-status").value = show.status;
  document.getElementById("input-current-season").value = show.currentSeason || "";
  document.getElementById("input-current-episode").value = show.currentEpisode || "";
  document.getElementById("input-total-seasons").value = show.totalSeasons || "";
  document.getElementById("input-episodes-per-season").value = show.episodesPerSeason || "";
  document.getElementById("input-notes").value = show.notes || "";
  updateStarDisplay();
  updateViewerToggle();
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("input-title").focus();
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  editingId = null;
}

function updateStarDisplay() {
  document.querySelectorAll("#star-rating .star-btn").forEach(btn => {
    const star = parseInt(btn.dataset.star);
    btn.classList.toggle("active", star <= modalRating);
  });
}

function updateViewerToggle() {
  document.querySelectorAll("#viewer-toggle .viewer-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.viewer === modalViewer);
  });
}

function toggleViewerType(id) {
  const show = shows.find(s => String(s.id) === String(id));
  if (!show) return;
  show.viewerType = show.viewerType === "couple" ? "solo" : "couple";
  show.updatedAt = new Date().toISOString();
  save();
  renderMain();
  renderToWatch();
  renderFinished();
  const label = show.viewerType === "couple" ? "👫 Couple" : "👤 Solo";
  showToast(`"${show.title}" → ${label}`);
}

function saveShow() {
  const title = document.getElementById("input-title").value.trim();
  if (!title) { document.getElementById("input-title").focus(); return; }

  // Duplicate detection
  const duplicate = findDuplicate(title, editingId);
  if (duplicate && !editingId) {
    if (!confirm(`"${duplicate.title}" already exists (${duplicate.status}). Add anyway?`)) return;
  }

  const data = {
    title,
    service: document.getElementById("input-service").value,
    category: document.getElementById("input-category").value,
    status: document.getElementById("input-status").value,
    viewerType: modalViewer,
    currentSeason: parseInt(document.getElementById("input-current-season").value) || null,
    currentEpisode: parseInt(document.getElementById("input-current-episode").value) || null,
    totalSeasons: parseInt(document.getElementById("input-total-seasons").value) || null,
    episodesPerSeason: parseInt(document.getElementById("input-episodes-per-season").value) || null,
    rating: modalRating,
    notes: document.getElementById("input-notes").value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (editingId !== null) {
    const idx = shows.findIndex(s => String(s.id) === String(editingId));
    if (idx !== -1) {
      const oldStatus = shows[idx].status;
      shows[idx] = { ...shows[idx], ...data };
      if (oldStatus !== data.status) {
        shows[idx].statusHistory = shows[idx].statusHistory || [];
        shows[idx].statusHistory.push({ from: oldStatus, to: data.status, at: new Date().toISOString() });
      }
    }
    showToast(`"${title}" updated`);
  } else {
    data.id = generateId();
    data.addedAt = new Date().toISOString();
    data.statusHistory = [{ from: null, to: data.status, at: data.addedAt }];
    data.order = shows.length;
    shows.push(data);
    showToast(`"${title}" added`);
  }

  save();
  closeModal();
  populateFilters();
  renderMain();
  renderToWatch();
  renderFinished();
  renderManageStats();
}

// ── Actions ──────────────────────────────────────────────────────────────────
function deleteShow(id) {
  const show = shows.find(s => String(s.id) === String(id));
  if (!show) return;
  if (!confirm(`Delete "${show.title}"?`)) return;
  shows = shows.filter(s => String(s.id) !== String(id));
  save();
  populateFilters();
  renderMain();
  renderToWatch();
  renderFinished();
  renderManageStats();
  showToast(`"${show.title}" deleted`, "info");
}

function changeStatus(id, newStatus) {
  const show = shows.find(s => String(s.id) === String(id));
  if (!show) return;
  const oldStatus = show.status;
  show.status = newStatus;
  show.updatedAt = new Date().toISOString();
  show.statusHistory = show.statusHistory || [];
  show.statusHistory.push({ from: oldStatus, to: newStatus, at: show.updatedAt });
  save();
  renderMain();
  renderToWatch();
  renderFinished();
  renderManageStats();
  const labels = { "watching": "Watching", "to-watch": "To Watch", "finished": "Finished" };
  showToast(`"${show.title}" → ${labels[newStatus]}`);
}

// ── Randomiser (Watching) ─────────────────────────────────────────────────────
function randomise() {
  const watching = shows.filter(s => s.status === "watching");
  runSpinner(watching, {
    result: "random-result",
    stage: "spinner-stage",
    reel: "spinner-reel",
    finalEl: "random-final",
    title: "random-title",
    meta: "random-meta",
    btn: "btn-randomise",
    emptyTitle: "No shows currently being watched!",
    emptyMeta: "Add some shows first."
  });
}

function randomiseToWatch() {
  const toWatch = shows.filter(s => s.status === "to-watch");
  runSpinner(toWatch, {
    result: "random-result-towatch",
    stage: "spinner-stage-towatch",
    reel: "spinner-reel-towatch",
    finalEl: "random-final-towatch",
    title: "random-title-towatch",
    meta: "random-meta-towatch",
    btn: "btn-randomise-towatch",
    emptyTitle: "No shows in your To Watch list!",
    emptyMeta: "Add some shows first."
  });
}

function runSpinner(pool, els) {
  const result = document.getElementById(els.result);
  const stage = document.getElementById(els.stage);
  const reel = document.getElementById(els.reel);
  const finalEl = document.getElementById(els.finalEl);
  const btn = document.getElementById(els.btn);

  result.classList.remove("visible");
  if (stage) stage.classList.remove("active");
  if (finalEl) finalEl.classList.add("hidden");

  if (pool.length === 0) {
    if (finalEl) finalEl.classList.remove("hidden");
    document.getElementById(els.title).textContent = els.emptyTitle;
    document.getElementById(els.meta).textContent = els.emptyMeta;
    result.classList.add("visible");
    return;
  }

  btn.disabled = true;
  btn.style.opacity = "0.6";

  const winner = pool[Math.floor(Math.random() * pool.length)];

  // Build reel with shuffled items (no consecutive duplicates)
  const totalSpins = 18 + Math.floor(Math.random() * 8);
  const reelItems = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (let i = 0; i < totalSpins; i++) {
    let pick = shuffled[i % shuffled.length];
    // Avoid consecutive duplicates
    if (reelItems.length > 0 && pick.id === reelItems[reelItems.length - 1].id && pool.length > 1) {
      pick = shuffled[(i + 1) % shuffled.length];
    }
    reelItems.push(pick);
  }
  reelItems.push(winner);

  reel.innerHTML = reelItems.map(s => {
    const color = SERVICE_COLORS[s.service] || SERVICE_COLORS["Other"];
    return `<div class="spinner-item">
      <span>${escHtml(s.title)}</span>
      <span class="spin-service" style="color:${color}">${s.service}</span>
    </div>`;
  }).join("");

  if (finalEl) finalEl.classList.add("hidden");
  stage.classList.add("active");
  result.classList.add("visible");

  const itemH = 52;
  let currentIdx = 0;
  let delay = 60;

  function tick() {
    currentIdx++;
    reel.style.transform = `translateY(-${currentIdx * itemH}px)`;

    if (currentIdx < reelItems.length - 1) {
      const progress = currentIdx / (reelItems.length - 1);
      if (progress > 0.5) {
        delay = 60 + (progress - 0.5) * 2 * 340;
      }
      reel.style.transition = `transform ${delay}ms cubic-bezier(.2,.6,.3,1)`;
      setTimeout(tick, delay);
    } else {
      setTimeout(() => {
        stage.classList.remove("active");
        if (finalEl) finalEl.classList.remove("hidden");
        document.getElementById(els.title).textContent = winner.title;
        document.getElementById(els.meta).textContent =
          winner.service + " · " + winner.category + (winner.currentSeason ? " · S" + winner.currentSeason + (winner.currentEpisode ? "E" + winner.currentEpisode : "") : "");
        btn.disabled = false;
        btn.style.opacity = "";
      }, 400);
    }
  }

  reel.style.transition = "none";
  reel.style.transform = "translateY(0)";
  void reel.offsetHeight;
  setTimeout(tick, 100);
}

// ── Import / Export ──────────────────────────────────────────────────────────
function exportData() {
  const blob = new Blob([JSON.stringify(shows, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "avant-shows-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Data exported successfully");
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      const currentCount = shows.length;
      const importCount = data.length;
      if (!confirm(`This will replace your ${currentCount} current show${currentCount !== 1 ? "s" : ""} with ${importCount} show${importCount !== 1 ? "s" : ""} from the file.\n\nContinue?`)) return;
      shows = data;
      // Ensure all imported shows have required fields
      shows.forEach(s => {
        if (!s.id) s.id = generateId();
        if (!s.statusHistory) s.statusHistory = [];
        if (!s.updatedAt) s.updatedAt = s.addedAt || new Date().toISOString();
        if (!s.rating) s.rating = 0;
        if (!s.order) s.order = 0;
        if (!s.viewerType) s.viewerType = "solo";
      });
      save();
      populateFilters();
      renderMain();
      renderToWatch();
      renderFinished();
      renderManageStats();
      showToast(`Imported ${shows.length} shows`);
    } catch {
      showToast("Invalid JSON file", "error");
    }
  };
  reader.readAsText(file);
}

// ── Page navigation ──────────────────────────────────────────────────────────
function showPage(page) {
  document.querySelectorAll(".page-tab").forEach(t => t.classList.toggle("active", t.dataset.page === page));
  document.getElementById("page-watching").classList.toggle("hidden", page !== "watching");
  document.getElementById("page-towatch").classList.toggle("hidden", page !== "towatch");
  document.getElementById("page-finished").classList.toggle("hidden", page !== "finished");
  document.getElementById("page-recommendations").classList.toggle("hidden", page !== "recommendations");
  document.getElementById("page-manage").classList.toggle("hidden", page !== "manage");
  if (page === "recommendations") checkRecommendations();
}

// ── Utility ──────────────────────────────────────────────────────────────────
function escHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ── Recommendations Engine ───────────────────────────────────────────────────
const TMDB_API_KEY = "d9e94e0ee9cba3f5e5b6e74a7b1e21a7"; // Free public demo key
const TMDB_BASE = "https://api.themoviedb.org/3";

// TMDB genre ID mapping
const GENRE_MAP = {
  "Comedy": 35, "Drama": 18, "Thriller": 53, "Sci-Fi": 10765,
  "Horror": 27, "Action": 10759, "Documentary": 99, "Reality": 10764,
  "Animation": 16, "Crime": 80, "Romance": 10749, "Sport": null, "Other": null
};

function getTopGenres() {
  const rated = shows.filter(s => s.rating >= 4);
  if (rated.length === 0) return shows.filter(s => s.status === "finished").map(s => s.category);
  const counts = {};
  rated.forEach(s => { counts[s.category] = (counts[s.category] || 0) + s.rating; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
}

function checkRecommendations() {
  try {
    const cached = JSON.parse(localStorage.getItem(RECS_CACHE_KEY) || "null");
    if (cached && cached.shows && (Date.now() - cached.fetchedAt) < RECS_INTERVAL) {
      renderRecommendations(cached.shows);
      return;
    }
  } catch {}
  fetchRecommendations(false);
}

async function fetchRecommendations(force) {
  const grid = document.getElementById("recs-grid");
  const topGenres = getTopGenres();

  if (topGenres.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">💡</div><p>Rate some shows to get personalised recommendations.</p></div>`;
    return;
  }

  // Check cache unless forced
  if (!force) {
    try {
      const cached = JSON.parse(localStorage.getItem(RECS_CACHE_KEY) || "null");
      if (cached && cached.shows && (Date.now() - cached.fetchedAt) < RECS_INTERVAL) {
        renderRecommendations(cached.shows);
        return;
      }
    } catch {}
  }

  grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⏳</div><p>Finding shows you might like...</p></div>`;

  const genreIds = topGenres.map(g => GENRE_MAP[g]).filter(Boolean);
  if (genreIds.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">💡</div><p>No matching genres found for recommendations.</p></div>`;
    return;
  }

  try {
    const url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreIds.join(",")}&sort_by=vote_average.desc&vote_count.gte=100&page=${Math.floor(Math.random() * 3) + 1}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("TMDB API error");
    const data = await res.json();

    // Filter out shows we already have
    const existingTitles = new Set(shows.map(s => s.title.toLowerCase()));
    const recs = (data.results || [])
      .filter(r => !existingTitles.has(r.name?.toLowerCase()))
      .slice(0, 12)
      .map(r => ({
        title: r.name,
        overview: r.overview?.slice(0, 120) + (r.overview?.length > 120 ? "…" : ""),
        rating: r.vote_average?.toFixed(1),
        poster: r.poster_path ? `https://image.tmdb.org/t/p/w200${r.poster_path}` : null,
        year: r.first_air_date?.slice(0, 4) || "",
        tmdbId: r.id
      }));

    // Cache results
    localStorage.setItem(RECS_CACHE_KEY, JSON.stringify({ shows: recs, fetchedAt: Date.now() }));
    renderRecommendations(recs);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⚠️</div><p>Couldn't fetch recommendations. Check your connection and try again.</p></div>`;
  }
}

function renderRecommendations(recs) {
  const grid = document.getElementById("recs-grid");
  if (!recs || recs.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">💡</div><p>No new recommendations found. Try rating more shows.</p></div>`;
    return;
  }

  grid.innerHTML = recs.map(r => `
    <div class="rec-card">
      ${r.poster ? `<img class="rec-poster" src="${r.poster}" alt="${escHtml(r.title)}" loading="lazy" />` : `<div class="rec-poster-placeholder">🎬</div>`}
      <div class="rec-info">
        <div class="rec-title">${escHtml(r.title)}</div>
        <div class="rec-meta">${r.year} · ⭐ ${r.rating}/10</div>
        <div class="rec-overview">${escHtml(r.overview)}</div>
        <button class="rec-add-btn" data-title="${escHtml(r.title)}">+ Add to To Watch</button>
      </div>
    </div>
  `).join("");

  // Wire up "Add to To Watch" buttons
  grid.querySelectorAll(".rec-add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.title;
      if (findDuplicate(title, null)) {
        showToast(`"${title}" is already in your list`, "info");
        return;
      }
      const newShow = {
        id: generateId(),
        title,
        service: "Other",
        category: getTopGenres()[0] || "Other",
        status: "to-watch",
        viewerType: "solo",
        currentSeason: null,
        currentEpisode: null,
        totalSeasons: null,
        episodesPerSeason: null,
        rating: 0,
        notes: "Added from recommendations",
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [{ from: null, to: "to-watch", at: new Date().toISOString() }],
        order: shows.length
      };
      shows.push(newShow);
      save();
      populateFilters();
      renderToWatch();
      showToast(`"${title}" added to To Watch`);
      btn.textContent = "✓ Added";
      btn.disabled = true;
    });
  });
}

// ── Event wiring ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  load();
  populateFilters();
  updateStats();
  renderMain();
  renderToWatch();
  renderFinished();
  renderManageStats();

  // Tabs
  document.querySelectorAll(".page-tab").forEach(tab => {
    tab.addEventListener("click", () => showPage(tab.dataset.page));
  });

  // Search & filter changes
  document.getElementById("search").addEventListener("input", renderMain);
  document.getElementById("category-filter").addEventListener("change", renderMain);
  document.getElementById("service-filter").addEventListener("change", renderMain);
  document.getElementById("viewer-filter").addEventListener("change", renderMain);
  document.getElementById("sort-watching").addEventListener("change", renderMain);

  document.getElementById("search-towatch").addEventListener("input", renderToWatch);
  document.getElementById("category-filter-towatch").addEventListener("change", renderToWatch);
  document.getElementById("service-filter-towatch").addEventListener("change", renderToWatch);
  document.getElementById("viewer-filter-towatch").addEventListener("change", renderToWatch);
  document.getElementById("sort-towatch").addEventListener("change", renderToWatch);

  document.getElementById("search-finished").addEventListener("input", renderFinished);
  document.getElementById("category-filter-finished").addEventListener("change", renderFinished);
  document.getElementById("service-filter-finished").addEventListener("change", renderFinished);
  document.getElementById("sort-finished").addEventListener("change", renderFinished);

  // Add button
  document.getElementById("btn-add").addEventListener("click", openAdd);

  // Modal
  document.getElementById("btn-save").addEventListener("click", saveShow);
  document.getElementById("btn-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Star rating
  document.querySelectorAll("#star-rating .star-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const star = parseInt(btn.dataset.star);
      modalRating = (modalRating === star) ? 0 : star; // Toggle off if same star clicked
      updateStarDisplay();
    });
  });

  // Viewer toggle in modal
  document.querySelectorAll("#viewer-toggle .viewer-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      modalViewer = btn.dataset.viewer;
      updateViewerToggle();
    });
  });

  // Keyboard shortcut to close modal
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // Randomisers
  document.getElementById("btn-randomise").addEventListener("click", randomise);
  document.getElementById("btn-randomise-towatch").addEventListener("click", randomiseToWatch);

  // Recommendations
  document.getElementById("btn-refresh-recs").addEventListener("click", () => fetchRecommendations(true));

  // Export / Import
  document.getElementById("btn-export").addEventListener("click", exportData);
  document.getElementById("file-import").addEventListener("change", e => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = "";
  });

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
