// RunTrack - Privacy-first run & walk tracker
// All data stored in localStorage, no external services

(function() {
'use strict';

// ═══ DATA LAYER ═══
const STORAGE_KEY = 'runtrack_activities';

function loadActivities() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e) { return []; }
}

function saveActivities(activities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ═══ UTILITY ═══
function formatPace(km, mins) {
  if (!km || km <= 0) return '--:--';
  const pace = mins / km;
  const m = Math.floor(pace);
  const s = Math.round((pace - m) * 60);
  return m + ':' + String(s).padStart(2, '0');
}

function formatDuration(mins) {
  if (!mins) return '0:00';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? h + 'h ' + m + 'm' : m + 'm';
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return Math.round(((d - week1) / 86400000 + (week1.getDay() + 6) % 7 - 3) / 7) + 1;
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const week = getWeekNumber(d);
  return year + '-W' + String(week).padStart(2, '0');
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ═══ PAGE NAVIGATION ═══
const tabs = document.querySelectorAll('.page-tab');
const pages = document.querySelectorAll('.page');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    pages.forEach(p => p.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById('page-' + tab.dataset.page).classList.remove('hidden');
    if (tab.dataset.page === 'dashboard') renderDashboard();
    if (tab.dataset.page === 'history') renderHistory();
    if (tab.dataset.page === 'records') renderRecords();
  });
});

// ═══ HEADER STATS ═══
function updateHeaderStats() {
  const activities = loadActivities();
  const totalKm = activities.reduce((s, a) => s + (a.distance || 0), 0);
  const runs = activities.filter(a => a.type === 'run').length;
  const streak = calcWeekStreak(activities);

  document.getElementById('stat-total-km').textContent = totalKm.toFixed(1) + ' km';
  document.getElementById('stat-streak').textContent = '\u{1F525} ' + streak + ' week' + (streak !== 1 ? 's' : '');
  document.getElementById('stat-activities').textContent = runs + ' run' + (runs !== 1 ? 's' : '');
}

function calcWeekStreak(activities) {
  if (!activities.length) return 0;
  const weeks = new Set(activities.map(a => getWeekKey(a.date)));
  let streak = 0;
  const now = new Date();
  let checkDate = getMonday(now);

  // Check current week
  const currentWeekKey = getWeekKey(now.toISOString().slice(0, 10));
  if (!weeks.has(currentWeekKey)) {
    // Check if last week had activity
    checkDate.setDate(checkDate.getDate() - 7);
  }

  while (true) {
    const key = getWeekKey(checkDate.toISOString().slice(0, 10));
    if (weeks.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
  }
  return streak;
}

// ═══ DASHBOARD ═══
function renderDashboard() {
  const activities = loadActivities();
  renderSummaryCards(activities);
  renderWeeklyChart(activities, 8);
  renderPaceChart(activities);
  renderHeatmap(activities);
  renderComparison(activities);
}

function renderSummaryCards(activities) {
  const container = document.getElementById('summary-cards');
  const totalKm = activities.reduce((s, a) => s + (a.distance || 0), 0);
  const totalMins = activities.reduce((s, a) => s + (a.duration || 0), 0);
  const runs = activities.filter(a => a.type === 'run');
  const avgPace = runs.length && totalKm > 0 ? totalMins / totalKm : 0;

  // This month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const thisMonth = activities.filter(a => a.date >= monthStart);
  const monthKm = thisMonth.reduce((s, a) => s + (a.distance || 0), 0);

  // Last 7 days
  const weekAgo = new Date(now - 7 * 86400000).toISOString().slice(0, 10);
  const last7 = activities.filter(a => a.date >= weekAgo);
  const weekKm = last7.reduce((s, a) => s + (a.distance || 0), 0);

  container.innerHTML = `
    <div class="summary-card">
      <div class="summary-card-val">${totalKm.toFixed(1)} km</div>
      <div class="summary-card-label">Total Distance</div>
      <div class="summary-card-sub">${activities.length} activities</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-val">${monthKm.toFixed(1)} km</div>
      <div class="summary-card-label">This Month</div>
      <div class="summary-card-sub">${thisMonth.length} activities</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-val">${weekKm.toFixed(1)} km</div>
      <div class="summary-card-label">Last 7 Days</div>
      <div class="summary-card-sub">${last7.length} activities</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-val">${avgPace ? formatPace(1, avgPace / 1) : '--:--'}</div>
      <div class="summary-card-label">Avg Pace (min/km)</div>
      <div class="summary-card-sub">${runs.length} runs</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-val">${formatDuration(totalMins)}</div>
      <div class="summary-card-label">Total Time</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-val">${calcWeekStreak(activities)}</div>
      <div class="summary-card-label">Week Streak</div>
      <div class="summary-card-sub">consecutive weeks</div>
    </div>
  `;
}

// ═══ WEEKLY DISTANCE CHART (Canvas) ═══
function renderWeeklyChart(activities, numWeeks) {
  const canvas = document.getElementById('chart-weekly');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = 200 * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.offsetWidth;
  const h = 200;
  ctx.clearRect(0, 0, w, h);

  // Build weekly data
  const weeks = [];
  const now = new Date();
  for (let i = numWeeks - 1; i >= 0; i--) {
    const monday = getMonday(new Date(now - i * 7 * 86400000));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    const mondayStr = monday.toISOString().slice(0, 10);
    const sundayStr = sunday.toISOString().slice(0, 10);
    const weekActivities = activities.filter(a => a.date >= mondayStr && a.date <= sundayStr);
    const km = weekActivities.reduce((s, a) => s + (a.distance || 0), 0);
    weeks.push({ label: formatDateShort(mondayStr), km });
  }

  const maxKm = Math.max(...weeks.map(w => w.km), 5);
  const barW = Math.min(40, (w - 60) / weeks.length - 8);
  const chartH = h - 50;
  const startX = 40;

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 10 + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(w - 10, y);
    ctx.stroke();
  }

  // Y-axis labels
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '10px system-ui';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = 10 + (chartH / 4) * i;
    const val = (maxKm * (4 - i) / 4).toFixed(0);
    ctx.fillText(val + ' km', startX - 6, y + 3);
  }

  // Bars
  weeks.forEach((week, i) => {
    const x = startX + i * ((w - startX - 10) / weeks.length) + ((w - startX - 10) / weeks.length - barW) / 2;
    const barH = (week.km / maxKm) * chartH;
    const y = 10 + chartH - barH;

    // Bar
    const isCurrentWeek = i === weeks.length - 1;
    ctx.fillStyle = isCurrentWeek ? '#10b981' : 'rgba(16,185,129,0.5)';
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 4);
    ctx.fill();

    // Value on top
    if (week.km > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(week.km.toFixed(1), x + barW / 2, y - 5);
    }

    // X label
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(week.label, x + barW / 2, h - 5);
  });
}

// Chart range buttons
document.querySelectorAll('.chart-range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chart-range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const range = btn.dataset.range;
    const activities = loadActivities();
    const numWeeks = range === 'all' ? Math.max(8, Math.ceil(activities.length / 3)) : parseInt(range);
    renderWeeklyChart(activities, numWeeks);
  });
});

// ═══ PACE TREND CHART ═══
function renderPaceChart(activities) {
  const canvas = document.getElementById('chart-pace');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = 180 * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.offsetWidth;
  const h = 180;
  ctx.clearRect(0, 0, w, h);

  const runs = activities.filter(a => a.type === 'run' && a.distance > 0 && a.duration > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (runs.length < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Log at least 2 runs to see pace trend', w / 2, h / 2);
    document.getElementById('pace-trend-label').textContent = '';
    return;
  }

  const paces = runs.map(r => r.duration / r.distance);
  const minPace = Math.min(...paces) - 0.5;
  const maxPace = Math.max(...paces) + 0.5;
  const range = maxPace - minPace;

  const chartL = 50, chartR = w - 20, chartT = 15, chartB = h - 30;
  const chartW = chartR - chartL, chartH = chartB - chartT;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = chartT + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(chartL, y);
    ctx.lineTo(chartR, y);
    ctx.stroke();

    // Y labels (pace - note: lower is better so invert)
    const paceVal = maxPace - (range / 4) * i;
    const m = Math.floor(paceVal);
    const s = Math.round((paceVal - m) * 60);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(m + ':' + String(s).padStart(2, '0'), chartL - 6, y + 3);
  }

  // Plot line
  ctx.beginPath();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  runs.forEach((run, i) => {
    const x = chartL + (i / (runs.length - 1)) * chartW;
    const pace = run.duration / run.distance;
    const y = chartT + ((maxPace - pace) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots
  runs.forEach((run, i) => {
    const x = chartL + (i / (runs.length - 1)) * chartW;
    const pace = run.duration / run.distance;
    const y = chartT + ((maxPace - pace) / range) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
  });

  // X labels (first and last date)
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '9px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(formatDateShort(runs[0].date), chartL, h - 5);
  ctx.textAlign = 'right';
  ctx.fillText(formatDateShort(runs[runs.length - 1].date), chartR, h - 5);

  // Trend label
  const firstAvg = paces.slice(0, Math.ceil(paces.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(paces.length / 3);
  const lastAvg = paces.slice(-Math.ceil(paces.length / 3)).reduce((a, b) => a + b, 0) / Math.ceil(paces.length / 3);
  const diff = firstAvg - lastAvg;
  const label = document.getElementById('pace-trend-label');
  if (diff > 0.1) {
    label.textContent = '\u2193 Getting faster by ' + (diff * 60).toFixed(0) + 's/km';
    label.style.color = '#10b981';
  } else if (diff < -0.1) {
    label.textContent = '\u2191 Pace slowed by ' + (Math.abs(diff) * 60).toFixed(0) + 's/km';
    label.style.color = '#ef4444';
  } else {
    label.textContent = 'Consistent pace';
    label.style.color = '';
  }
}

// ═══ HEATMAP ═══
function renderHeatmap(activities) {
  const container = document.getElementById('heatmap');
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 365);

  // Build date -> distance map
  const dateMap = {};
  activities.forEach(a => {
    dateMap[a.date] = (dateMap[a.date] || 0) + a.distance;
  });

  let html = '';
  const d = new Date(startDate);
  // Align to start of week (Monday)
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);

  const maxDist = Math.max(...Object.values(dateMap), 3);

  while (d <= now) {
    const key = d.toISOString().slice(0, 10);
    const dist = dateMap[key] || 0;
    let level = '';
    if (dist > 0) {
      const ratio = dist / maxDist;
      if (ratio > 0.75) level = 'l4';
      else if (ratio > 0.5) level = 'l3';
      else if (ratio > 0.25) level = 'l2';
      else level = 'l1';
    }
    html += '<div class="heatmap-cell ' + level + '" title="' + formatDate(key) + ': ' + dist.toFixed(1) + ' km"></div>';
    d.setDate(d.getDate() + 1);
  }

  container.innerHTML = html;

  const activeDays = Object.keys(dateMap).filter(k => {
    const dd = new Date(k);
    return dd >= startDate && dd <= now;
  }).length;
  document.getElementById('calendar-label').textContent = activeDays + ' active days in the last year';
}

// ═══ COMPARISON (This week vs last week) ═══
function renderComparison(activities) {
  const container = document.getElementById('comparison-card');
  const now = new Date();
  const thisMonday = getMonday(now);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(lastMonday.getDate() - 7);

  const thisMondayStr = thisMonday.toISOString().slice(0, 10);
  const lastMondayStr = lastMonday.toISOString().slice(0, 10);
  const thisSundayStr = new Date(thisMonday.getTime() + 6 * 86400000).toISOString().slice(0, 10);

  const thisWeek = activities.filter(a => a.date >= thisMondayStr && a.date <= thisSundayStr);
  const lastWeek = activities.filter(a => a.date >= lastMondayStr && a.date < thisMondayStr);

  const thisKm = thisWeek.reduce((s, a) => s + (a.distance || 0), 0);
  const lastKm = lastWeek.reduce((s, a) => s + (a.distance || 0), 0);
  const maxKm = Math.max(thisKm, lastKm, 1);

  const thisMins = thisWeek.reduce((s, a) => s + (a.duration || 0), 0);
  const lastMins = lastWeek.reduce((s, a) => s + (a.duration || 0), 0);

  let changeText = '';
  let changeClass = 'same';
  if (lastKm > 0) {
    const pctChange = ((thisKm - lastKm) / lastKm * 100).toFixed(0);
    if (pctChange > 0) { changeText = '\u2191 ' + pctChange + '% more distance than last week'; changeClass = 'up'; }
    else if (pctChange < 0) { changeText = '\u2193 ' + Math.abs(pctChange) + '% less distance than last week'; changeClass = 'down'; }
    else { changeText = 'Same distance as last week'; }
  } else if (thisKm > 0) {
    changeText = '\u{1F525} Active this week — keep it up!';
    changeClass = 'up';
  } else {
    changeText = 'No activity yet this week — time to lace up!';
  }

  container.innerHTML = `
    <div class="comparison-title">This Week vs Last Week</div>
    <div class="comparison-row">
      <span class="comparison-label">This week</span>
      <div class="comparison-bar-wrap">
        <div class="comparison-bar this-week" style="width:${(thisKm / maxKm * 100).toFixed(1)}%"></div>
      </div>
      <span class="comparison-val">${thisKm.toFixed(1)} km</span>
    </div>
    <div class="comparison-row">
      <span class="comparison-label">Last week</span>
      <div class="comparison-bar-wrap">
        <div class="comparison-bar last-week" style="width:${(lastKm / maxKm * 100).toFixed(1)}%"></div>
      </div>
      <span class="comparison-val">${lastKm.toFixed(1)} km</span>
    </div>
    <div class="comparison-change ${changeClass}">${changeText}</div>
  `;
}

// ═══ LOG ACTIVITY ═══
const logDate = document.getElementById('log-date');
logDate.value = new Date().toISOString().slice(0, 10);

let selectedType = 'run';
let selectedEffort = 3;

document.querySelectorAll('.log-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.log-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedType = btn.dataset.type;
  });
});

document.querySelectorAll('.effort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.effort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedEffort = parseInt(btn.dataset.effort);
  });
});

// Live pace calculation
const distInput = document.getElementById('log-distance');
const durInput = document.getElementById('log-duration');
const calcDiv = document.getElementById('log-calc');

function updateCalc() {
  const km = parseFloat(distInput.value);
  const mins = parseFloat(durInput.value);
  if (km > 0 && mins > 0) {
    const pace = formatPace(km, mins);
    const speed = (km / (mins / 60)).toFixed(1);
    calcDiv.textContent = 'Pace: ' + pace + ' min/km \u00B7 Speed: ' + speed + ' km/h';
  } else {
    calcDiv.textContent = '';
  }
}
distInput.addEventListener('input', updateCalc);
durInput.addEventListener('input', updateCalc);

// Save activity
document.getElementById('btn-save-activity').addEventListener('click', () => {
  const distance = parseFloat(distInput.value);
  const duration = parseFloat(durInput.value);
  const date = logDate.value;
  const notes = document.getElementById('log-notes').value.trim();

  if (!distance || distance <= 0) { alert('Enter a distance'); return; }
  if (!duration || duration <= 0) { alert('Enter a duration'); return; }
  if (!date) { alert('Pick a date'); return; }

  const activity = {
    id: generateId(),
    type: selectedType,
    date: date,
    distance: distance,
    duration: duration,
    effort: selectedEffort,
    notes: notes,
    createdAt: Date.now()
  };

  const activities = loadActivities();
  activities.push(activity);
  saveActivities(activities);

  // Reset form
  distInput.value = '';
  durInput.value = '';
  document.getElementById('log-notes').value = '';
  calcDiv.textContent = '';
  logDate.value = new Date().toISOString().slice(0, 10);

  // Check for new records
  checkNewRecords(activity, activities);

  updateHeaderStats();
  alert('Activity saved! \u{1F3C3}');
});

function checkNewRecords(activity, activities) {
  const runs = activities.filter(a => a.type === 'run' && a.distance > 0 && a.duration > 0);
  if (activity.type !== 'run' || !activity.distance || !activity.duration) return;

  const pace = activity.duration / activity.distance;
  const allPaces = runs.map(r => r.duration / r.distance);
  const bestPace = Math.min(...allPaces);

  if (pace <= bestPace && runs.length > 1) {
    setTimeout(() => alert('\u{1F3C6} New fastest pace! ' + formatPace(activity.distance, activity.duration) + ' min/km'), 100);
  }

  const allDistances = runs.map(r => r.distance);
  if (activity.distance >= Math.max(...allDistances) && runs.length > 1) {
    setTimeout(() => alert('\u{1F3C6} New longest run! ' + activity.distance.toFixed(2) + ' km'), 200);
  }
}

// ═══ HISTORY ═══
let historyFilter = 'all';
let historySort = 'newest';
let editingId = null;

function renderHistory() {
  const activities = loadActivities();
  const search = document.getElementById('history-search').value.toLowerCase();

  let filtered = activities.filter(a => {
    if (historyFilter !== 'all' && a.type !== historyFilter) return false;
    if (search && !(a.notes || '').toLowerCase().includes(search)) return false;
    return true;
  });

  // Sort
  switch (historySort) {
    case 'newest': filtered.sort((a, b) => b.date.localeCompare(a.date)); break;
    case 'oldest': filtered.sort((a, b) => a.date.localeCompare(b.date)); break;
    case 'longest': filtered.sort((a, b) => b.distance - a.distance); break;
    case 'fastest':
      filtered = filtered.filter(a => a.distance > 0 && a.duration > 0);
      filtered.sort((a, b) => (a.duration / a.distance) - (b.duration / b.distance));
      break;
  }

  const container = document.getElementById('history-list');
  if (!filtered.length) {
    container.innerHTML = '<div class="history-empty">No activities yet. Log your first run!</div>';
    return;
  }

  container.innerHTML = filtered.map(a => {
    const icon = a.type === 'run' ? '\u{1F3C3}' : a.type === 'walk' ? '\u{1F6B6}' : '\u{1F500}';
    const pace = a.distance > 0 && a.duration > 0 ? formatPace(a.distance, a.duration) : '--:--';
    return `
      <div class="history-item" data-id="${a.id}">
        <div class="history-icon">${icon}</div>
        <div class="history-main">
          <div class="history-title">${a.type.charAt(0).toUpperCase() + a.type.slice(1)} \u2022 ${formatDate(a.date)}</div>
          <div class="history-meta">${a.notes || 'No notes'} \u2022 Effort: ${a.effort}/5</div>
        </div>
        <div class="history-stats">
          <div class="history-stat">
            <div class="history-stat-val">${a.distance.toFixed(2)}</div>
            <div class="history-stat-label">km</div>
          </div>
          <div class="history-stat">
            <div class="history-stat-val">${formatDuration(a.duration)}</div>
            <div class="history-stat-label">time</div>
          </div>
          <div class="history-stat">
            <div class="history-stat-val">${pace}</div>
            <div class="history-stat-label">min/km</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Click to edit
  container.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => openEditModal(item.dataset.id));
  });
}

// History filters
document.querySelectorAll('[data-hfilter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-hfilter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    historyFilter = btn.dataset.hfilter;
    renderHistory();
  });
});

document.getElementById('history-sort').addEventListener('change', (e) => {
  historySort = e.target.value;
  renderHistory();
});

document.getElementById('history-search').addEventListener('input', () => renderHistory());

// Export CSV
document.getElementById('btn-export-csv').addEventListener('click', () => {
  const activities = loadActivities();
  const header = 'date,type,distance_km,duration_mins,pace_min_per_km,effort,notes\n';
  const rows = activities.map(a => {
    const pace = a.distance > 0 && a.duration > 0 ? (a.duration / a.distance).toFixed(2) : '';
    return [a.date, a.type, a.distance, a.duration, pace, a.effort, '"' + (a.notes || '').replace(/"/g, '""') + '"'].join(',');
  }).join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'runtrack-export-' + new Date().toISOString().slice(0, 10) + '.csv';
  link.click();
  URL.revokeObjectURL(url);
});

// Import
document.getElementById('btn-import-csv').addEventListener('click', () => {
  document.getElementById('file-import').click();
});

document.getElementById('file-import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const text = ev.target.result;
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          saveActivities(data);
          alert('Imported ' + data.length + ' activities');
        }
      } else {
        // CSV import
        const lines = text.trim().split('\n').slice(1); // skip header
        const imported = lines.map(line => {
          const parts = line.split(',');
          return {
            id: generateId(),
            date: parts[0],
            type: parts[1] || 'run',
            distance: parseFloat(parts[2]) || 0,
            duration: parseFloat(parts[3]) || 0,
            effort: parseInt(parts[5]) || 3,
            notes: (parts[6] || '').replace(/^"|"$/g, ''),
            createdAt: Date.now()
          };
        }).filter(a => a.distance > 0);
        const existing = loadActivities();
        saveActivities([...existing, ...imported]);
        alert('Imported ' + imported.length + ' activities');
      }
      updateHeaderStats();
      renderHistory();
    } catch(err) {
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ═══ EDIT MODAL ═══
function openEditModal(id) {
  const activities = loadActivities();
  const activity = activities.find(a => a.id === id);
  if (!activity) return;

  editingId = id;
  const overlay = document.getElementById('edit-modal-overlay');
  const fields = document.getElementById('edit-fields');

  fields.innerHTML = `
    <div class="log-field">
      <label>Type</label>
      <div class="log-type-btns">
        <button class="log-type-btn edit-type-btn ${activity.type === 'run' ? 'active' : ''}" data-type="run">\u{1F3C3} Run</button>
        <button class="log-type-btn edit-type-btn ${activity.type === 'walk' ? 'active' : ''}" data-type="walk">\u{1F6B6} Walk</button>
        <button class="log-type-btn edit-type-btn ${activity.type === 'mixed' ? 'active' : ''}" data-type="mixed">\u{1F500} Mixed</button>
      </div>
    </div>
    <div class="log-field">
      <label for="edit-date">Date</label>
      <input type="date" id="edit-date" value="${activity.date}" />
    </div>
    <div class="log-row">
      <div class="log-field">
        <label for="edit-distance">Distance (km)</label>
        <input type="number" id="edit-distance" step="0.01" value="${activity.distance}" />
      </div>
      <div class="log-field">
        <label for="edit-duration">Duration (mins)</label>
        <input type="number" id="edit-duration" step="1" value="${activity.duration}" />
      </div>
    </div>
    <div class="log-field">
      <label for="edit-effort">Effort</label>
      <div class="effort-btns" id="edit-effort-btns">
        ${[1,2,3,4,5].map(n => `<button class="effort-btn edit-effort-btn ${activity.effort === n ? 'active' : ''}" data-effort="${n}">${n}</button>`).join('')}
      </div>
    </div>
    <div class="log-field">
      <label for="edit-notes">Notes</label>
      <input type="text" id="edit-notes" value="${activity.notes || ''}" />
    </div>
  `;

  // Wire up edit type buttons
  fields.querySelectorAll('.edit-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      fields.querySelectorAll('.edit-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  fields.querySelectorAll('.edit-effort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      fields.querySelectorAll('.edit-effort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  overlay.classList.remove('hidden');
}

document.getElementById('edit-modal-close').addEventListener('click', () => {
  document.getElementById('edit-modal-overlay').classList.add('hidden');
  editingId = null;
});

document.getElementById('btn-update-activity').addEventListener('click', () => {
  if (!editingId) return;
  const activities = loadActivities();
  const idx = activities.findIndex(a => a.id === editingId);
  if (idx === -1) return;

  const fields = document.getElementById('edit-fields');
  const activeType = fields.querySelector('.edit-type-btn.active');
  const activeEffort = fields.querySelector('.edit-effort-btn.active');

  activities[idx].type = activeType ? activeType.dataset.type : activities[idx].type;
  activities[idx].date = document.getElementById('edit-date').value;
  activities[idx].distance = parseFloat(document.getElementById('edit-distance').value) || 0;
  activities[idx].duration = parseFloat(document.getElementById('edit-duration').value) || 0;
  activities[idx].effort = activeEffort ? parseInt(activeEffort.dataset.effort) : activities[idx].effort;
  activities[idx].notes = document.getElementById('edit-notes').value.trim();

  saveActivities(activities);
  document.getElementById('edit-modal-overlay').classList.add('hidden');
  editingId = null;
  updateHeaderStats();
  renderHistory();
});

document.getElementById('btn-delete-activity').addEventListener('click', () => {
  if (!editingId) return;
  if (!confirm('Delete this activity?')) return;
  const activities = loadActivities().filter(a => a.id !== editingId);
  saveActivities(activities);
  document.getElementById('edit-modal-overlay').classList.add('hidden');
  editingId = null;
  updateHeaderStats();
  renderHistory();
});

// ═══ RECORDS ═══
function renderRecords() {
  const activities = loadActivities();
  const runs = activities.filter(a => a.type === 'run' && a.distance > 0 && a.duration > 0);
  const all = activities.filter(a => a.distance > 0);

  const grid = document.getElementById('records-grid');

  if (!all.length) {
    grid.innerHTML = '<div class="history-empty">Log some activities to see your records!</div>';
    document.getElementById('milestones-list').innerHTML = '';
    document.getElementById('streaks-info').innerHTML = '';
    return;
  }

  // Records
  const longestRun = runs.length ? runs.reduce((best, r) => r.distance > best.distance ? r : best) : null;
  const fastestPace = runs.length ? runs.reduce((best, r) => (r.duration / r.distance) < (best.duration / best.distance) ? r : best) : null;
  const longestDuration = all.reduce((best, a) => a.duration > best.duration ? a : best);
  const totalKm = all.reduce((s, a) => s + a.distance, 0);

  // Longest streak (consecutive days)
  const dates = [...new Set(all.map(a => a.date))].sort();
  let maxDayStreak = 1, currentDayStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = daysBetween(new Date(dates[i-1]), new Date(dates[i]));
    if (diff === 1) { currentDayStreak++; maxDayStreak = Math.max(maxDayStreak, currentDayStreak); }
    else { currentDayStreak = 1; }
  }
  if (dates.length === 1) maxDayStreak = 1;

  grid.innerHTML = `
    ${longestRun ? `<div class="record-card">
      <div class="record-card-icon">\u{1F4CF}</div>
      <div class="record-card-val">${longestRun.distance.toFixed(2)} km</div>
      <div class="record-card-label">Longest Run</div>
      <div class="record-card-date">${formatDate(longestRun.date)}</div>
    </div>` : ''}
    ${fastestPace ? `<div class="record-card">
      <div class="record-card-icon">\u26A1</div>
      <div class="record-card-val">${formatPace(fastestPace.distance, fastestPace.duration)}</div>
      <div class="record-card-label">Fastest Pace</div>
      <div class="record-card-date">${formatDate(fastestPace.date)}</div>
    </div>` : ''}
    <div class="record-card">
      <div class="record-card-icon">\u23F1</div>
      <div class="record-card-val">${formatDuration(longestDuration.duration)}</div>
      <div class="record-card-label">Longest Activity</div>
      <div class="record-card-date">${formatDate(longestDuration.date)}</div>
    </div>
    <div class="record-card">
      <div class="record-card-icon">\u{1F30D}</div>
      <div class="record-card-val">${totalKm.toFixed(1)} km</div>
      <div class="record-card-label">Total Distance</div>
      <div class="record-card-date">${all.length} activities</div>
    </div>
    <div class="record-card">
      <div class="record-card-icon">\u{1F525}</div>
      <div class="record-card-val">${maxDayStreak}</div>
      <div class="record-card-label">Best Day Streak</div>
      <div class="record-card-date">consecutive days</div>
    </div>
    <div class="record-card">
      <div class="record-card-icon">\u{1F4C5}</div>
      <div class="record-card-val">${calcWeekStreak(activities)}</div>
      <div class="record-card-label">Current Week Streak</div>
      <div class="record-card-date">consecutive weeks</div>
    </div>
  `;

  // Milestones
  const milestones = [
    { name: 'First Run', icon: '\u{1F476}', target: 1, unit: 'activities', current: all.length },
    { name: '10 Activities', icon: '\u{1F4AA}', target: 10, unit: 'activities', current: all.length },
    { name: '25 Activities', icon: '\u{1F3C5}', target: 25, unit: 'activities', current: all.length },
    { name: '50 Activities', icon: '\u{1F947}', target: 50, unit: 'activities', current: all.length },
    { name: '100 Activities', icon: '\u{1F3C6}', target: 100, unit: 'activities', current: all.length },
    { name: '50 km Total', icon: '\u{1F6E3}', target: 50, unit: 'km', current: totalKm },
    { name: '100 km Total', icon: '\u{1F30D}', target: 100, unit: 'km', current: totalKm },
    { name: '250 km Total', icon: '\u{1F680}', target: 250, unit: 'km', current: totalKm },
    { name: '500 km Total', icon: '\u2B50', target: 500, unit: 'km', current: totalKm },
    { name: 'Sub 6:00/km', icon: '\u26A1', target: 6, unit: 'pace', current: fastestPace ? fastestPace.duration / fastestPace.distance : 99 },
    { name: 'Sub 5:00/km', icon: '\u{1F525}', target: 5, unit: 'pace', current: fastestPace ? fastestPace.duration / fastestPace.distance : 99 },
    { name: '10km Run', icon: '\u{1F3C3}', target: 10, unit: 'single_km', current: longestRun ? longestRun.distance : 0 },
    { name: 'Half Marathon', icon: '\u{1F3C5}', target: 21.1, unit: 'single_km', current: longestRun ? longestRun.distance : 0 },
  ];

  document.getElementById('milestones-list').innerHTML = milestones.map(m => {
    let achieved = false;
    if (m.unit === 'pace') achieved = m.current <= m.target;
    else if (m.unit === 'single_km') achieved = m.current >= m.target;
    else achieved = m.current >= m.target;

    return `
      <div class="milestone ${achieved ? 'achieved' : ''}">
        <div class="milestone-icon">${m.icon}</div>
        <div class="milestone-info">
          <div class="milestone-name">${m.name}</div>
          <div class="milestone-detail">${achieved ? '\u2713 Achieved' : getProgress(m)}</div>
        </div>
      </div>
    `;
  }).join('');

  // Streaks
  document.getElementById('streaks-info').innerHTML = `
    <div class="streak-item">
      <div class="streak-val">${calcWeekStreak(activities)}</div>
      <div class="streak-label">Current week streak</div>
    </div>
    <div class="streak-item">
      <div class="streak-val">${maxDayStreak}</div>
      <div class="streak-label">Best day streak</div>
    </div>
    <div class="streak-item">
      <div class="streak-val">${dates.length}</div>
      <div class="streak-label">Total active days</div>
    </div>
    <div class="streak-item">
      <div class="streak-val">${all.length}</div>
      <div class="streak-label">Total activities</div>
    </div>
  `;
}

function getProgress(milestone) {
  if (milestone.unit === 'pace') {
    return formatPace(1, milestone.current) + ' \u2192 ' + milestone.target + ':00';
  }
  if (milestone.unit === 'single_km') {
    return milestone.current.toFixed(1) + ' / ' + milestone.target + ' km';
  }
  return milestone.current + ' / ' + milestone.target;
}

// ═══ GPS TRACKING ═══
let gpsWatchId = null;
let gpsPositions = [];
let gpsStartTime = null;
let gpsTimerInterval = null;

const gpsStatus = document.getElementById('gps-status');
const gpsDistEl = document.getElementById('gps-distance');
const gpsDurEl = document.getElementById('gps-duration');
const gpsPaceEl = document.getElementById('gps-pace');
const gpsStartBtn = document.getElementById('gps-start');
const gpsStopBtn = document.getElementById('gps-stop');
const gpsDiscardBtn = document.getElementById('gps-discard');

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calcGpsDistance() {
  let total = 0;
  for (let i = 1; i < gpsPositions.length; i++) {
    total += haversineDistance(
      gpsPositions[i-1].lat, gpsPositions[i-1].lon,
      gpsPositions[i].lat, gpsPositions[i].lon
    );
  }
  return total;
}

function updateGpsDisplay() {
  const dist = calcGpsDistance();
  const elapsed = (Date.now() - gpsStartTime) / 1000 / 60; // minutes
  gpsDistEl.textContent = dist.toFixed(2);

  const mins = Math.floor(elapsed);
  const secs = Math.floor((elapsed - mins) * 60);
  gpsDurEl.textContent = mins + ':' + String(secs).padStart(2, '0');

  if (dist > 0.05) {
    gpsPaceEl.textContent = formatPace(dist, elapsed);
  }
}

gpsStartBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('GPS not available on this device');
    return;
  }

  gpsPositions = [];
  gpsStartTime = Date.now();

  gpsStatus.textContent = 'Recording...';
  gpsStatus.classList.add('recording');
  gpsStartBtn.classList.add('hidden');
  gpsStopBtn.classList.remove('hidden');
  gpsDiscardBtn.classList.remove('hidden');

  gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      gpsPositions.push({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        time: Date.now(),
        accuracy: pos.coords.accuracy
      });
      updateGpsDisplay();
    },
    (err) => {
      gpsStatus.textContent = 'GPS error: ' + err.message;
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );

  gpsTimerInterval = setInterval(updateGpsDisplay, 1000);
});

gpsStopBtn.addEventListener('click', () => {
  stopGps();
  const dist = calcGpsDistance();
  const duration = (Date.now() - gpsStartTime) / 1000 / 60;

  if (dist < 0.01) {
    alert('Distance too short to save');
    resetGps();
    return;
  }

  const activity = {
    id: generateId(),
    type: 'run',
    date: new Date().toISOString().slice(0, 10),
    distance: Math.round(dist * 100) / 100,
    duration: Math.round(duration),
    effort: 3,
    notes: 'GPS recorded',
    createdAt: Date.now(),
    gps: true
  };

  const activities = loadActivities();
  activities.push(activity);
  saveActivities(activities);
  updateHeaderStats();

  alert('Run saved! ' + dist.toFixed(2) + ' km in ' + formatDuration(Math.round(duration)));
  resetGps();
});

gpsDiscardBtn.addEventListener('click', () => {
  if (confirm('Discard this recording?')) {
    stopGps();
    resetGps();
  }
});

function stopGps() {
  if (gpsWatchId !== null) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }
  if (gpsTimerInterval) {
    clearInterval(gpsTimerInterval);
    gpsTimerInterval = null;
  }
}

function resetGps() {
  gpsPositions = [];
  gpsStartTime = null;
  gpsDistEl.textContent = '0.00';
  gpsDurEl.textContent = '0:00';
  gpsPaceEl.textContent = '--:--';
  gpsStatus.textContent = 'Ready to record';
  gpsStatus.classList.remove('recording');
  gpsStartBtn.classList.remove('hidden');
  gpsStopBtn.classList.add('hidden');
  gpsDiscardBtn.classList.add('hidden');
}

// ═══ INIT ═══
updateHeaderStats();
renderDashboard();

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

})();
