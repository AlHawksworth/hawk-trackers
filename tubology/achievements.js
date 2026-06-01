// Tubology - Achievements & Badges System

const ACHIEVEMENTS_KEY = 'tubology_achievements';

const ACHIEVEMENT_DEFS = [
  // Milestone achievements
  { id: 'first_station', name: 'First Steps', icon: '👣', desc: 'Visit your first station', check: () => visited.size >= 1 },
  { id: 'ten_stations', name: 'Getting Started', icon: '🚶', desc: 'Visit 10 stations', check: () => visited.size >= 10 },
  { id: 'fifty_stations', name: 'Explorer', icon: '🧭', desc: 'Visit 50 stations', check: () => visited.size >= 50 },
  { id: 'hundred_stations', name: 'Centurion', icon: '💯', desc: 'Visit 100 stations', check: () => visited.size >= 100 },
  { id: 'two_hundred', name: 'Veteran', icon: '🎖️', desc: 'Visit 200 stations', check: () => visited.size >= 200 },
  { id: 'all_stations', name: 'Completionist', icon: '👑', desc: 'Visit every single station', check: () => visited.size >= TOTAL_STATIONS },

  // Line completion
  { id: 'first_line', name: 'Line Clear', icon: '✅', desc: 'Complete your first line', check: () => getCompletedLineCount() >= 1 },
  { id: 'five_lines', name: 'Multi-Liner', icon: '🌟', desc: 'Complete 5 lines', check: () => getCompletedLineCount() >= 5 },
  { id: 'ten_lines', name: 'Network Master', icon: '🏅', desc: 'Complete 10 lines', check: () => getCompletedLineCount() >= 10 },
  { id: 'all_lines', name: 'Total Coverage', icon: '🏆', desc: 'Complete every line', check: () => getCompletedLineCount() >= Object.keys(TUBE_LINES).length },

  // Specific lines
  { id: 'bakerloo_done', name: 'Brown Line', icon: '🟤', desc: 'Complete the Bakerloo line', check: () => isLineComplete('bakerloo') },
  { id: 'central_done', name: 'Red Rider', icon: '🔴', desc: 'Complete the Central line', check: () => isLineComplete('central') },
  { id: 'northern_done', name: 'Dark Side', icon: '⚫', desc: 'Complete the Northern line', check: () => isLineComplete('northern') },
  { id: 'district_done', name: 'Green Machine', icon: '🟢', desc: 'Complete the District line', check: () => isLineComplete('district') },
  { id: 'elizabeth_done', name: 'Royal Line', icon: '👸', desc: 'Complete the Elizabeth line', check: () => isLineComplete('elizabeth') },
  { id: 'piccadilly_done', name: 'Deep Blue', icon: '🔵', desc: 'Complete the Piccadilly line', check: () => isLineComplete('piccadilly') },

  // Zone achievements
  { id: 'zone1_done', name: 'Zone 1 Master', icon: '🏙️', desc: 'Visit all Zone 1 stations', check: () => isZoneComplete(1) },
  { id: 'zone2_done', name: 'Inner Ring', icon: '🔲', desc: 'Visit all Zone 2 stations', check: () => isZoneComplete(2) },
  { id: 'zone3_done', name: 'Suburban Explorer', icon: '🏘️', desc: 'Visit all Zone 3 stations', check: () => isZoneComplete(3) },

  // Interchange achievements
  { id: 'ten_interchanges', name: 'Connector', icon: '🔀', desc: 'Visit 10 interchange stations', check: () => getInterchangeVisitCount() >= 10 },
  { id: 'all_interchanges', name: 'Hub Master', icon: '🕸️', desc: 'Visit all interchange stations', check: () => getInterchangeVisitCount() >= getTotalInterchanges() },

  // Overground
  { id: 'overground_start', name: 'Above Ground', icon: '🚈', desc: 'Visit your first Overground station', check: () => OVERGROUND_STATIONS.some(s => visited.has(s)) },
  { id: 'overground_done', name: 'Overground Complete', icon: '🌈', desc: 'Visit all Overground stations', check: () => OVERGROUND_STATIONS.every(s => visited.has(s)) },

  // Fun achievements
  { id: 'ten_in_day', name: 'Speed Demon', icon: '⚡', desc: 'Visit 10 stations in one day', check: () => getBestDayCount() >= 10 },
  { id: 'twenty_in_day', name: 'Marathon Runner', icon: '🏃', desc: 'Visit 20 stations in one day', check: () => getBestDayCount() >= 20 },
  { id: 'week_streak', name: 'Dedicated', icon: '📅', desc: 'Visit stations 7 days in a row', check: () => getCurrentStreak() >= 7 },
];

// Helper functions for achievement checks
function getCompletedLineCount() {
  return Object.entries(TUBE_LINES).filter(([_, line]) =>
    line.uniqueStations.every(s => visited.has(s))
  ).length;
}

function isLineComplete(lineId) {
  const line = TUBE_LINES[lineId];
  return line && line.uniqueStations.every(s => visited.has(s));
}

function isZoneComplete(zone) {
  if (typeof getStationsInZone !== 'function') return false;
  const zoneStations = getStationsInZone(zone);
  return zoneStations.length > 0 && zoneStations.every(s => visited.has(s));
}

function getInterchangeVisitCount() {
  return ALL_STATIONS.filter(s => STATION_INDEX[s].lines.length > 1 && visited.has(s)).length;
}

function getTotalInterchanges() {
  return ALL_STATIONS.filter(s => STATION_INDEX[s].lines.length > 1).length;
}

function getBestDayCount() {
  const dateCounts = {};
  Object.values(visitDates).forEach(date => {
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });
  return Math.max(0, ...Object.values(dateCounts));
}

function getCurrentStreak() {
  const dateCounts = {};
  Object.values(visitDates).forEach(date => {
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });
  let streak = 0;
  let checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (dateCounts[dateStr]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Load unlocked achievements
let unlockedAchievements = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '{}');

// Check and unlock achievements
function checkAchievements() {
  let newlyUnlocked = [];
  ACHIEVEMENT_DEFS.forEach(ach => {
    if (!unlockedAchievements[ach.id] && ach.check()) {
      unlockedAchievements[ach.id] = new Date().toISOString().split('T')[0];
      newlyUnlocked.push(ach);
    }
  });

  if (newlyUnlocked.length > 0) {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
    // Show notification for first new one
    showAchievementNotification(newlyUnlocked[0]);
  }

  return newlyUnlocked;
}

// Show achievement unlock notification
function showAchievementNotification(achievement) {
  let notif = document.getElementById('achievement-notif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'achievement-notif';
    notif.className = 'achievement-notif';
    document.body.appendChild(notif);
  }

  notif.innerHTML = `
    <div class="achievement-notif-icon">${achievement.icon}</div>
    <div class="achievement-notif-text">
      <div class="achievement-notif-title">Achievement Unlocked!</div>
      <div class="achievement-notif-name">${achievement.name}</div>
    </div>
  `;
  notif.classList.add('visible');
  setTimeout(() => notif.classList.remove('visible'), 4000);
}

// Render achievements page/section in dashboard
function renderAchievements() {
  const unlocked = Object.keys(unlockedAchievements).length;
  const total = ACHIEVEMENT_DEFS.length;
  const pct = Math.round((unlocked / total) * 100);

  let html = `
    <div class="achievements-header">
      <div class="achievements-progress">
        <span class="achievements-count">${unlocked}/${total} Unlocked</span>
        <div class="dash-progress-bar">
          <div class="dash-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>
    </div>
    <div class="achievements-grid">
  `;

  ACHIEVEMENT_DEFS.forEach(ach => {
    const isUnlocked = !!unlockedAchievements[ach.id];
    const date = unlockedAchievements[ach.id] || '';
    html += `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${isUnlocked ? ach.icon : '🔒'}</div>
        <div class="achievement-info">
          <div class="achievement-name">${ach.name}</div>
          <div class="achievement-desc">${ach.desc}</div>
          ${isUnlocked ? `<div class="achievement-date">Unlocked ${date}</div>` : ''}
        </div>
      </div>
    `;
  });

  html += '</div>';
  return html;
}
