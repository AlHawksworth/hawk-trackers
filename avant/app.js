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
  "Channel 4": "#000",
  "Kayo": "#00c853",
  "Crunchyroll": "#f47521",
  "Other": "#888"
};

let shows = [];
let editingId = null;

// ── Persistence ──────────────────────────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    shows = raw ? JSON.parse(raw) : [];
  } catch { shows = []; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shows));
  updateStats();
}

// ── Stats ────────────────────────────────────────────────────────────────────
function updateStats() {
  const watching = shows.filter(s => s.status === "watching").length;
  const toWatch = shows.filter(s => s.status === "to-watch").length;
  document.getElementById("stat-watching").textContent = watching + " Watching";
  document.getElementById("stat-to-watch").textContent = toWatch + " To Watch";
  document.getElementById("stat-total").textContent = shows.length + " Total";
}

// ── Filter dropdowns ─────────────────────────────────────────────────────────
function populateFilters() {
  const categories = [...new Set(shows.map(s => s.category))].sort();
  const services = [...new Set(shows.map(s => s.service))].sort();

  // Main page filters
  populateSelect("category-filter", categories, "All Categories");
  populateSelect("service-filter", services, "All Services");

  // To-watch page filters
  populateSelect("category-filter-towatch", categories, "All Categories");
  populateSelect("service-filter-towatch", services, "All Services");
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

// ── Render: Watching page ────────────────────────────────────────────────────
function renderMain() {
  const grid = document.getElementById("main-grid");
  const search = document.getElementById("search").value.toLowerCase();
  const statusFilter = document.querySelector("#page-watching .filter-btn.active")?.dataset.filter || "all";
  const catFilter = document.getElementById("category-filter").value;
  const svcFilter = document.getElementById("service-filter").value;

  let filtered = shows.filter(s => {
    if (search && !s.title.toLowerCase().includes(search) && !s.service.toLowerCase().includes(search)) return false;
    if (statusFilter === "watching" && s.status !== "watching") return false;
    if (statusFilter === "to-watch" && s.status !== "to-watch") return false;
    if (catFilter && s.category !== catFilter) return false;
    if (svcFilter && s.service !== svcFilter) return false;
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

  // Group by category
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

  // Attach card events
  grid.querySelectorAll(".show-card").forEach(card => {
    const id = parseInt(card.dataset.id);
    card.querySelector(".btn-edit")?.addEventListener("click", e => { e.stopPropagation(); openEdit(id); });
    card.querySelector(".btn-delete")?.addEventListener("click", e => { e.stopPropagation(); deleteShow(id); });
    card.querySelector(".btn-toggle")?.addEventListener("click", e => { e.stopPropagation(); toggleStatus(id); });
  });
}

function renderCard(show) {
  const color = SERVICE_COLORS[show.service] || SERVICE_COLORS["Other"];
  const statusClass = show.status === "watching" ? "watching" : "to-watch";
  const statusLabel = show.status === "watching" ? "Watching" : "To Watch";
  const toWatchClass = show.status === "to-watch" ? "to-watch-card" : "";
  const toggleIcon = show.status === "watching" ? "📋" : "▶";
  const toggleTitle = show.status === "watching" ? "Move to To Watch" : "Start Watching";

  return `
    <div class="show-card ${toWatchClass}" data-id="${show.id}">
      <div class="card-actions">
        <button class="card-action-btn btn-toggle" title="${toggleTitle}">${toggleIcon}</button>
        <button class="card-action-btn btn-edit" title="Edit">✏</button>
        <button class="card-action-btn delete btn-delete" title="Delete">✕</button>
      </div>
      <div class="card-service" style="color:${color}">
        <span class="service-dot" style="background:${color}"></span>
        ${show.service}
      </div>
      <div class="card-title">${escHtml(show.title)}</div>
      <div class="card-category">${show.category}${show.season ? " · " + escHtml(show.season) : ""}</div>
      <span class="card-status ${statusClass}">${statusLabel}</span>
      ${show.notes ? `<div class="card-category" style="margin-top:6px;font-style:italic">${escHtml(show.notes)}</div>` : ""}
    </div>`;
}

// ── Render: To Watch page ────────────────────────────────────────────────────
function renderToWatch() {
  const grid = document.getElementById("towatch-grid");
  const search = document.getElementById("search-towatch").value.toLowerCase();
  const catFilter = document.getElementById("category-filter-towatch").value;
  const svcFilter = document.getElementById("service-filter-towatch").value;

  let filtered = shows.filter(s => {
    if (s.status !== "to-watch") return false;
    if (search && !s.title.toLowerCase().includes(search) && !s.service.toLowerCase().includes(search)) return false;
    if (catFilter && s.category !== catFilter) return false;
    if (svcFilter && s.service !== svcFilter) return false;
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

  grid.innerHTML = filtered.map(s => renderCard(s)).join("");

  grid.querySelectorAll(".show-card").forEach(card => {
    const id = parseInt(card.dataset.id);
    card.querySelector(".btn-edit")?.addEventListener("click", e => { e.stopPropagation(); openEdit(id); });
    card.querySelector(".btn-delete")?.addEventListener("click", e => { e.stopPropagation(); deleteShow(id); });
    card.querySelector(".btn-toggle")?.addEventListener("click", e => { e.stopPropagation(); toggleStatus(id); });
  });
}

// ── Modal ────────────────────────────────────────────────────────────────────
function openAdd() {
  editingId = null;
  document.getElementById("modal-title").textContent = "Add Show";
  document.getElementById("input-title").value = "";
  document.getElementById("input-service").value = "Netflix";
  document.getElementById("input-category").value = "Comedy";
  document.getElementById("input-status").value = "watching";
  document.getElementById("input-season").value = "";
  document.getElementById("input-notes").value = "";
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("input-title").focus();
}

function openEdit(id) {
  const show = shows.find(s => s.id === id);
  if (!show) return;
  editingId = id;
  document.getElementById("modal-title").textContent = "Edit Show";
  document.getElementById("input-title").value = show.title;
  document.getElementById("input-service").value = show.service;
  document.getElementById("input-category").value = show.category;
  document.getElementById("input-status").value = show.status;
  document.getElementById("input-season").value = show.season || "";
  document.getElementById("input-notes").value = show.notes || "";
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("input-title").focus();
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  editingId = null;
}

function saveShow() {
  const title = document.getElementById("input-title").value.trim();
  if (!title) { document.getElementById("input-title").focus(); return; }

  const data = {
    title,
    service: document.getElementById("input-service").value,
    category: document.getElementById("input-category").value,
    status: document.getElementById("input-status").value,
    season: document.getElementById("input-season").value.trim(),
    notes: document.getElementById("input-notes").value.trim()
  };

  if (editingId !== null) {
    const idx = shows.findIndex(s => s.id === editingId);
    if (idx !== -1) shows[idx] = { ...shows[idx], ...data };
  } else {
    data.id = Date.now();
    data.addedAt = new Date().toISOString();
    shows.push(data);
  }

  save();
  closeModal();
  populateFilters();
  renderMain();
  renderToWatch();
}

// ── Actions ──────────────────────────────────────────────────────────────────
function deleteShow(id) {
  const show = shows.find(s => s.id === id);
  if (!show) return;
  if (!confirm(`Delete "${show.title}"?`)) return;
  shows = shows.filter(s => s.id !== id);
  save();
  populateFilters();
  renderMain();
  renderToWatch();
}

function toggleStatus(id) {
  const show = shows.find(s => s.id === id);
  if (!show) return;
  show.status = show.status === "watching" ? "to-watch" : "watching";
  save();
  renderMain();
  renderToWatch();
}

// ── Randomiser ───────────────────────────────────────────────────────────────
function randomise() {
  const watching = shows.filter(s => s.status === "watching");
  const result = document.getElementById("random-result");

  if (watching.length === 0) {
    document.getElementById("random-title").textContent = "No shows currently being watched!";
    document.getElementById("random-meta").textContent = "Add some shows first.";
    result.classList.add("visible");
    return;
  }

  const pick = watching[Math.floor(Math.random() * watching.length)];
  document.getElementById("random-title").textContent = "🎯 " + pick.title;
  document.getElementById("random-meta").textContent =
    pick.service + " · " + pick.category + (pick.season ? " · " + pick.season : "");
  result.classList.add("visible");
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
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      shows = data;
      save();
      populateFilters();
      renderMain();
      renderToWatch();
      alert("Imported " + shows.length + " shows.");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ── Page navigation ──────────────────────────────────────────────────────────
function showPage(page) {
  document.querySelectorAll(".page-tab").forEach(t => t.classList.toggle("active", t.dataset.page === page));
  document.getElementById("page-watching").classList.toggle("hidden", page !== "watching");
  document.getElementById("page-towatch").classList.toggle("hidden", page !== "towatch");
  document.getElementById("page-manage").classList.toggle("hidden", page !== "manage");
}

// ── Utility ──────────────────────────────────────────────────────────────────
function escHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ── Event wiring ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  load();
  populateFilters();
  updateStats();
  renderMain();
  renderToWatch();

  // Tabs
  document.querySelectorAll(".page-tab").forEach(tab => {
    tab.addEventListener("click", () => showPage(tab.dataset.page));
  });

  // Filter buttons (watching page)
  document.querySelectorAll("#page-watching .filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#page-watching .filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderMain();
    });
  });

  // Search & filter changes
  document.getElementById("search").addEventListener("input", renderMain);
  document.getElementById("category-filter").addEventListener("change", renderMain);
  document.getElementById("service-filter").addEventListener("change", renderMain);

  document.getElementById("search-towatch").addEventListener("input", renderToWatch);
  document.getElementById("category-filter-towatch").addEventListener("change", renderToWatch);
  document.getElementById("service-filter-towatch").addEventListener("change", renderToWatch);

  // Add button
  document.getElementById("btn-add").addEventListener("click", openAdd);

  // Modal
  document.getElementById("btn-save").addEventListener("click", saveShow);
  document.getElementById("btn-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Keyboard shortcut to close modal
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // Randomiser
  document.getElementById("btn-randomise").addEventListener("click", randomise);

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
