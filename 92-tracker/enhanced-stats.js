// ─── Enhanced Statistics Module ──────────────────────────────────────────────
// Advanced metrics and analytics for the 92 Tracker

// ── Distance & Travel Analytics ───────────────────────────────────────────────
function calculateTravelAnalytics() {
  const visitedWithCoords = state.clubs.filter(c => 
    state.visits[c.id]?.date && CLUB_COORDS[c.id]
  );
  
  if (!visitedWithCoords.length) return null;

  // Sort by visit date for journey analysis
  const chronological = visitedWithCoords.sort((a, b) => 
    state.visits[a.id].date.localeCompare(state.visits[b.id].date)
  );

  let totalDistance = 0;
  let totalJourneyDistance = 0;
  let furthestFromHome = null;
  let furthestHomeDist = 0;
  
  // Calculate distances from home and total journey
  visitedWithCoords.forEach((c, i) => {
    const distFromHome = haversine(homeLat, homeLng, CLUB_COORDS[c.id][0], CLUB_COORDS[c.id][1]);
    totalDistance += distFromHome;
    
    if (distFromHome > furthestHomeDist) {
      furthestHomeDist = distFromHome;
      furthestFromHome = c;
    }
    
    // Calculate journey between consecutive visits
    if (i > 0) {
      const prevCoords = CLUB_COORDS[chronological[i-1].id];
      const currCoords = CLUB_COORDS[c.id];
      totalJourneyDistance += haversine(prevCoords[0], prevCoords[1], currCoords[0], currCoords[1]);
    }
  });

  // Analyze trips by date (multiple grounds same day)
  const tripsByDate = {};
  chronological.forEach(c => {
    const date = state.visits[c.id].date;
    if (!tripsByDate[date]) tripsByDate[date] = [];
    tripsByDate[date].push(c);
  });
  
  let longestSingleTrip = 0;
  let longestTripClubs = [];
  let multiGroundDays = 0;
  
  Object.entries(tripsByDate).forEach(([date, clubs]) => {
    if (clubs.length >= 2) {
      multiGroundDays++;
      let tripDistance = 0;
      
      for (let i = 1; i < clubs.length; i++) {
        const d = haversine(
          CLUB_COORDS[clubs[i-1].id][0], CLUB_COORDS[clubs[i-1].id][1],
          CLUB_COORDS[clubs[i].id][0], CLUB_COORDS[clubs[i].id][1]
        );
        tripDistance += d;
      }
      
      if (tripDistance > longestSingleTrip) {
        longestSingleTrip = tripDistance;
        longestTripClubs = clubs;
      }
    }
  });

  return {
    totalDistanceFromHome: Math.round(totalDistance),
    averageDistanceFromHome: Math.round(totalDistance / visitedWithCoords.length),
    totalJourneyDistance: Math.round(totalJourneyDistance),
    furthestFromHome,
    furthestHomeDist: Math.round(furthestHomeDist),
    longestSingleTrip: Math.round(longestSingleTrip),
    longestTripClubs,
    multiGroundDays,
    averageTripDistance: totalJourneyDistance > 0 ? Math.round(totalJourneyDistance / Math.max(1, visitedWithCoords.length - 1)) : 0
  };
}

// ── Streak & Consistency Analytics ────────────────────────────────────────────
function calculateStreakAnalytics() {
  const visits = Object.entries(state.visits)
    .filter(([id, v]) => v?.date)
    .map(([id, v]) => ({ id: parseInt(id), date: v.date }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!visits.length) return null;

  // Calculate various streak types
  const streaks = {
    currentStreak: 0,
    longestStreak: 0,
    currentMonthlyStreak: 0,
    longestMonthlyStreak: 0,
    bestMonth: null,
    bestMonthCount: 0,
    daysSinceLastVisit: 0
  };

  // Daily streak calculation
  const dates = [...new Set(visits.map(v => v.date))].sort();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  
  // Current streak (consecutive days from most recent)
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const date = new Date(dates[i]);
    const nextDate = i < dates.length - 1 ? new Date(dates[i + 1]) : today;
    const daysDiff = Math.floor((nextDate - date) / (1000 * 60 * 60 * 24));
    
    if (i === dates.length - 1) {
      // Check if current streak is still active
      const daysSinceLastVisit = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      streaks.daysSinceLastVisit = daysSinceLastVisit;
      if (daysSinceLastVisit <= 7) currentStreak = 1; // Within a week
    }
    
    if (daysDiff === 1 && i < dates.length - 1) {
      if (currentStreak === 0) tempStreak++;
      else currentStreak++;
    } else if (currentStreak > 0) {
      break;
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 1;
    }
  }
  
  streaks.currentStreak = currentStreak;
  streaks.longestStreak = Math.max(longestStreak, tempStreak);

  // Monthly consistency
  const monthCounts = {};
  visits.forEach(v => {
    const month = v.date.slice(0, 7);
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  
  const months = Object.keys(monthCounts).sort();
  let monthlyStreak = 0;
  let maxMonthlyStreak = 0;
  
  for (let i = 0; i < months.length; i++) {
    if (i === 0 || isConsecutiveMonth(months[i-1], months[i])) {
      monthlyStreak++;
    } else {
      maxMonthlyStreak = Math.max(maxMonthlyStreak, monthlyStreak);
      monthlyStreak = 1;
    }
  }
  maxMonthlyStreak = Math.max(maxMonthlyStreak, monthlyStreak);
  
  // Current monthly streak (check if current month has a visit)
  const currentMonth = todayStr.slice(0, 7);
  const lastVisitMonth = dates[dates.length - 1]?.slice(0, 7);
  streaks.currentMonthlyStreak = lastVisitMonth === currentMonth ? monthlyStreak : 0;
  streaks.longestMonthlyStreak = maxMonthlyStreak;

  // Best month
  const bestMonth = Object.entries(monthCounts).reduce((a, b) => 
    a[1] >= b[1] ? a : b
  );
  streaks.bestMonth = bestMonth[0];
  streaks.bestMonthCount = bestMonth[1];

  return streaks;
}

function isConsecutiveMonth(prev, curr) {
  const [py, pm] = prev.split('-').map(Number);
  const [cy, cm] = curr.split('-').map(Number);
  const diff = (cy - py) * 12 + (cm - pm);
  return diff === 1;
}

// ── Performance & Efficiency Metrics ──────────────────────────────────────────
function calculatePerformanceMetrics() {
  const visits = Object.entries(state.visits)
    .filter(([id, v]) => v?.date)
    .sort(([,a], [,b]) => a.date.localeCompare(b.date));

  if (!visits.length) return null;

  const startDate = new Date(visits[0][1].date);
  const latestDate = new Date(visits[visits.length - 1][1].date);
  const daysSinceStart = Math.floor((latestDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calculate velocity metrics
  const groundsPerDay = visits.length / Math.max(1, daysSinceStart);
  const groundsPerWeek = groundsPerDay * 7;
  const groundsPerMonth = groundsPerDay * 30.44; // Average month length
  
  // Project completion date at current rate
  const remaining = 92 - visits.length;
  const daysToComplete = remaining / Math.max(groundsPerDay, 0.01); // Avoid division by zero
  const projectedCompletion = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);
  
  // Efficiency score based on avoiding backtracking
  let efficiencyScore = 100;
  if (visits.length >= 2) {
    let unnecessaryDistance = 0;
    let totalDistance = 0;
    
    for (let i = 1; i < visits.length; i++) {
      const prevClub = state.clubs.find(c => c.id === parseInt(visits[i-1][0]));
      const currClub = state.clubs.find(c => c.id === parseInt(visits[i][0]));
      
      if (CLUB_COORDS[prevClub.id] && CLUB_COORDS[currClub.id]) {
        const distance = haversine(
          CLUB_COORDS[prevClub.id][0], CLUB_COORDS[prevClub.id][1],
          CLUB_COORDS[currClub.id][0], CLUB_COORDS[currClub.id][1]
        );
        totalDistance += distance;
        
        // Check if there were closer unvisited options at the time
        const visitedAtTime = visits.slice(0, i).map(([id]) => parseInt(id));
        const unvisitedAtTime = state.clubs.filter(c => 
          !visitedAtTime.includes(c.id) && CLUB_COORDS[c.id]
        );
        
        if (unvisitedAtTime.length > 0) {
          const closestAlternative = unvisitedAtTime.reduce((closest, club) => {
            const distToAlternative = haversine(
              CLUB_COORDS[prevClub.id][0], CLUB_COORDS[prevClub.id][1],
              CLUB_COORDS[club.id][0], CLUB_COORDS[club.id][1]
            );
            return distToAlternative < closest.distance ? 
              { club, distance: distToAlternative } : closest;
          }, { club: null, distance: Infinity });
          
          if (distance > closestAlternative.distance * 1.5) {
            unnecessaryDistance += distance - closestAlternative.distance;
          }
        }
      }
    }
    
    if (totalDistance > 0) {
      efficiencyScore = Math.max(0, 100 - (unnecessaryDistance / totalDistance * 100));
    }
  }

  return {
    daysSinceStart,
    groundsPerDay: Math.round(groundsPerDay * 1000) / 1000,
    groundsPerWeek: Math.round(groundsPerWeek * 10) / 10,
    groundsPerMonth: Math.round(groundsPerMonth * 10) / 10,
    projectedCompletion: projectedCompletion.toISOString().slice(0, 10),
    efficiencyScore: Math.round(efficiencyScore),
    daysToComplete: Math.round(daysToComplete)
  };
}

// ── Difficulty & Achievement Analytics ────────────────────────────────────────
function calculateDifficultyMetrics() {
  const visited = state.clubs.filter(c => state.visits[c.id]);
  const unvisited = state.clubs.filter(c => !state.visits[c.id]);
  
  if (!visited.length) return null;

  // Categorize by difficulty
  const difficultyCategories = { easy: 0, medium: 0, hard: 0 };
  const remainingDifficulty = { easy: 0, medium: 0, hard: 0 };
  
  visited.forEach(club => {
    const diff = getDifficulty(club);
    if (diff.label === 'Easy') difficultyCategories.easy++;
    else if (diff.label === 'Medium') difficultyCategories.medium++;
    else difficultyCategories.hard++;
  });
  
  unvisited.forEach(club => {
    const diff = getDifficulty(club);
    if (diff.label === 'Easy') remainingDifficulty.easy++;
    else if (diff.label === 'Medium') remainingDifficulty.medium++;
    else remainingDifficulty.hard++;
  });

  // Calculate average capacity of visited stadiums
  const capacities = visited
    .map(c => STADIUM_CAPACITY[c.id])
    .filter(Boolean);
  
  const avgCapacity = capacities.length > 0 ? 
    Math.round(capacities.reduce((a, b) => a + b, 0) / capacities.length) : 0;

  const largestVisited = visited.reduce((largest, club) => {
    const capacity = STADIUM_CAPACITY[club.id] || 0;
    const largestCapacity = STADIUM_CAPACITY[largest?.id] || 0;
    return capacity > largestCapacity ? club : largest;
  }, null);

  return {
    difficultyCategories,
    remainingDifficulty,
    avgCapacity,
    largestVisited,
    largestCapacity: largestVisited ? STADIUM_CAPACITY[largestVisited.id] : 0
  };
}

// ── Social & Sharing Metrics ──────────────────────────────────────────────────
function calculateSocialMetrics() {
  const visits = Object.values(state.visits).filter(v => v);
  
  // Count visits with notes (engaged visits)
  const visitsWithNotes = visits.filter(v => v.notes && v.notes.trim()).length;
  
  // Count visits with companions
  const visitsWithCompanions = visits.filter(v => 
    state.extras && Object.values(state.extras).some(e => e.visitedWith && e.visitedWith.trim())
  ).length;

  // Most common companions
  const companions = {};
  Object.values(state.extras).forEach(extras => {
    if (extras.visitedWith) {
      extras.visitedWith.split(',').forEach(companion => {
        const name = companion.trim();
        if (name) companions[name] = (companions[name] || 0) + 1;
      });
    }
  });

  const topCompanion = Object.entries(companions).reduce((a, b) => 
    a[1] >= b[1] ? a : b, ['None', 0]
  );

  return {
    visitsWithNotes,
    visitsWithCompanions,
    totalNotes: visitsWithNotes,
    avgNotesLength: visits
      .filter(v => v.notes)
      .reduce((sum, v) => sum + v.notes.length, 0) / Math.max(1, visitsWithNotes),
    topCompanion: topCompanion[0] !== 'None' ? topCompanion : null,
    totalCompanions: Object.keys(companions).length
  };
}

// ── Export enhanced render function ───────────────────────────────────────────
function renderEnhancedStats() {
  const el = document.getElementById("stats-content");
  if (!el) return;

  const travelAnalytics = calculateTravelAnalytics();
  const streakAnalytics = calculateStreakAnalytics();
  const performanceMetrics = calculatePerformanceMetrics();
  const difficultyMetrics = calculateDifficultyMetrics();
  const socialMetrics = calculateSocialMetrics();

  // Build enhanced stats HTML
  let enhancedHTML = '';

  if (travelAnalytics) {
    enhancedHTML += `
      <div class="stats-section">
        <div class="stats-section-title">🚗 Travel Analytics
          <button class="stats-expand-btn" onclick="toggleStatsDetails('travel')" data-section="travel">
            <span class="expand-icon">▶</span> Details
          </button>
        </div>
        <div class="stat-cards-grid">
          <div class="stat-card interactive" title="Click to see journey breakdown">
            <div class="stat-card-value">${travelAnalytics.totalDistanceFromHome.toLocaleString()} km</div>
            <div class="stat-card-label">Total distance from home</div>
          </div>
          <div class="stat-card interactive" title="Average distance per visit">
            <div class="stat-card-value">${travelAnalytics.averageDistanceFromHome} km</div>
            <div class="stat-card-label">Average distance per ground</div>
          </div>
          <div class="stat-card interactive" title="Total distance between grounds">
            <div class="stat-card-value">${travelAnalytics.totalJourneyDistance.toLocaleString()} km</div>
            <div class="stat-card-label">Total journey distance</div>
          </div>
          <div class="stat-card interactive" title="Days with multiple ground visits">
            <div class="stat-card-value">${travelAnalytics.multiGroundDays}</div>
            <div class="stat-card-label">Multi-ground days</div>
          </div>
        </div>
        <div class="stats-details" id="travel-details" style="display: none;">
          ${travelAnalytics.furthestFromHome ? `
            <div class="stat-detail-item">
              <strong>Furthest from home:</strong> ${travelAnalytics.furthestFromHome.name} 
              (${travelAnalytics.furthestHomeDist} km)
            </div>
          ` : ''}
          ${travelAnalytics.longestTripClubs.length > 0 ? `
            <div class="stat-detail-item">
              <strong>Longest single trip:</strong> ${travelAnalytics.longestSingleTrip} km visiting 
              ${travelAnalytics.longestTripClubs.map(c => c.name).join(' → ')}
            </div>
          ` : ''}
          <div class="stat-detail-item">
            <strong>Average trip distance:</strong> ${travelAnalytics.averageTripDistance} km
          </div>
        </div>
      </div>`;
  }

  if (streakAnalytics) {
    enhancedHTML += `
      <div class="stats-section">
        <div class="stats-section-title">🔥 Streaks & Consistency
          <button class="stats-expand-btn" onclick="toggleStatsDetails('streaks')" data-section="streaks">
            <span class="expand-icon">▶</span> Details
          </button>
        </div>
        <div class="stat-cards-grid">
          <div class="stat-card interactive ${streakAnalytics.currentStreak > 0 ? 'stat-card-good' : ''}" 
               title="Your current consecutive day streak">
            <div class="stat-card-value">${streakAnalytics.currentStreak}</div>
            <div class="stat-card-label">Current daily streak</div>
          </div>
          <div class="stat-card interactive" title="Your personal record for consecutive days">
            <div class="stat-card-value">${streakAnalytics.longestStreak}</div>
            <div class="stat-card-label">Longest daily streak</div>
          </div>
          <div class="stat-card interactive" title="Your most productive month">
            <div class="stat-card-value">${streakAnalytics.bestMonthCount}</div>
            <div class="stat-card-label">Best month (${streakAnalytics.bestMonth?.slice(5) || 'N/A'})</div>
          </div>
          <div class="stat-card interactive" title="Days since your last ground visit">
            <div class="stat-card-value">${streakAnalytics.daysSinceLastVisit}</div>
            <div class="stat-card-label">Days since last visit</div>
          </div>
        </div>
        <div class="stats-details" id="streaks-details" style="display: none;">
          <div class="stat-detail-item">
            <strong>Current monthly streak:</strong> ${streakAnalytics.currentMonthlyStreak} months
          </div>
          <div class="stat-detail-item">
            <strong>Longest monthly streak:</strong> ${streakAnalytics.longestMonthlyStreak} months
          </div>
          <div class="stat-detail-item">
            <strong>Best month details:</strong> ${streakAnalytics.bestMonth || 'N/A'} with ${streakAnalytics.bestMonthCount} visits
          </div>
        </div>
      </div>`;
  }

  if (performanceMetrics) {
    enhancedHTML += `
      <div class="stats-section">
        <div class="stats-section-title">📈 Performance Metrics
          <button class="stats-expand-btn" onclick="toggleStatsDetails('performance')" data-section="performance">
            <span class="expand-icon">▶</span> Details
          </button>
        </div>
        <div class="stat-cards-grid">
          <div class="stat-card interactive" title="Your average visiting pace">
            <div class="stat-card-value">${performanceMetrics.groundsPerMonth}</div>
            <div class="stat-card-label">Grounds per month</div>
          </div>
          <div class="stat-card interactive" title="How efficiently you're visiting grounds geographically">
            <div class="stat-card-value">${performanceMetrics.efficiencyScore}%</div>
            <div class="stat-card-label">Route efficiency score</div>
          </div>
          <div class="stat-card interactive" title="Estimated completion time at current rate">
            <div class="stat-card-value">${performanceMetrics.daysToComplete}</div>
            <div class="stat-card-label">Days to complete</div>
          </div>
          <div class="stat-card interactive" title="When you'll finish the 92 at current pace">
            <div class="stat-card-value">${performanceMetrics.projectedCompletion}</div>
            <div class="stat-card-label">Projected completion</div>
          </div>
        </div>
        <div class="stats-details" id="performance-details" style="display: none;">
          <div class="stat-detail-item">
            <strong>Grounds per week:</strong> ${performanceMetrics.groundsPerWeek} grounds
          </div>
          <div class="stat-detail-item">
            <strong>Days since you started:</strong> ${performanceMetrics.daysSinceStart} days
          </div>
          <div class="stat-detail-item">
            <strong>Daily visiting rate:</strong> ${performanceMetrics.groundsPerDay} grounds per day
          </div>
        </div>
      </div>`;
  }

  if (difficultyMetrics) {
    enhancedHTML += `
      <div class="stats-section">
        <div class="stats-section-title">⚡ Difficulty Breakdown
          <button class="stats-expand-btn" onclick="toggleStatsDetails('difficulty')" data-section="difficulty">
            <span class="expand-icon">▶</span> Details
          </button>
        </div>
        <div class="difficulty-bars">
          <div class="difficulty-bar">
            <span class="difficulty-label">Easy</span>
            <div class="difficulty-progress" title="Smaller grounds, usually available on matchday">
              <div class="difficulty-fill difficulty-easy" style="width: ${(difficultyMetrics.difficultyCategories.easy / (difficultyMetrics.difficultyCategories.easy + difficultyMetrics.remainingDifficulty.easy)) * 100}%"></div>
            </div>
            <span class="difficulty-count">${difficultyMetrics.difficultyCategories.easy}/${difficultyMetrics.difficultyCategories.easy + difficultyMetrics.remainingDifficulty.easy}</span>
          </div>
          <div class="difficulty-bar">
            <span class="difficulty-label">Medium</span>
            <div class="difficulty-progress" title="Popular grounds, book a few days ahead">
              <div class="difficulty-fill difficulty-medium" style="width: ${(difficultyMetrics.difficultyCategories.medium / (difficultyMetrics.difficultyCategories.medium + difficultyMetrics.remainingDifficulty.medium)) * 100}%"></div>
            </div>
            <span class="difficulty-count">${difficultyMetrics.difficultyCategories.medium}/${difficultyMetrics.difficultyCategories.medium + difficultyMetrics.remainingDifficulty.medium}</span>
          </div>
          <div class="difficulty-bar">
            <span class="difficulty-label">Hard</span>
            <div class="difficulty-progress" title="Premier League grounds, membership often required">
              <div class="difficulty-fill difficulty-hard" style="width: ${(difficultyMetrics.difficultyCategories.hard / (difficultyMetrics.difficultyCategories.hard + difficultyMetrics.remainingDifficulty.hard)) * 100}%"></div>
            </div>
            <span class="difficulty-count">${difficultyMetrics.difficultyCategories.hard}/${difficultyMetrics.difficultyCategories.hard + difficultyMetrics.remainingDifficulty.hard}</span>
          </div>
        </div>
        <div class="stats-details" id="difficulty-details" style="display: none;">
          <div class="stat-detail-item">
            <strong>Average stadium capacity visited:</strong> ${difficultyMetrics.avgCapacity.toLocaleString()}
          </div>
          ${difficultyMetrics.largestVisited ? `
            <div class="stat-detail-item">
              <strong>Largest stadium visited:</strong> ${difficultyMetrics.largestVisited.name} 
              (${difficultyMetrics.largestCapacity.toLocaleString()} capacity)
            </div>
          ` : ''}
        </div>
      </div>`;
  }

  if (socialMetrics) {
    enhancedHTML += `
      <div class="stats-section">
        <div class="stats-section-title">👥 Social & Memories
          <button class="stats-expand-btn" onclick="toggleStatsDetails('social')" data-section="social">
            <span class="expand-icon">▶</span> Details
          </button>
        </div>
        <div class="stat-cards-grid">
          <div class="stat-card interactive" title="Visits where you recorded notes or memories">
            <div class="stat-card-value">${socialMetrics.visitsWithNotes}</div>
            <div class="stat-card-label">Visits with notes</div>
          </div>
          <div class="stat-card interactive" title="Total number of companions">
            <div class="stat-card-value">${socialMetrics.totalCompanions}</div>
            <div class="stat-card-label">Different companions</div>
          </div>
          <div class="stat-card interactive" title="Average length of your visit notes">
            <div class="stat-card-value">${Math.round(socialMetrics.avgNotesLength)}</div>
            <div class="stat-card-label">Avg note length</div>
          </div>
          <div class="stat-card interactive" title="Visits where you went with someone">
            <div class="stat-card-value">${socialMetrics.visitsWithCompanions}</div>
            <div class="stat-card-label">Social visits</div>
          </div>
        </div>
        <div class="stats-details" id="social-details" style="display: none;">
          ${socialMetrics.topCompanion ? `
            <div class="stat-detail-item">
              <strong>Most frequent companion:</strong> ${socialMetrics.topCompanion[0]} 
              (${socialMetrics.topCompanion[1]} visits together)
            </div>
          ` : ''}
          <div class="stat-detail-item">
            <strong>Documentation rate:</strong> ${Math.round((socialMetrics.visitsWithNotes / Math.max(1, Object.keys(state.visits).length)) * 100)}% of visits have notes
          </div>
        </div>
      </div>`;
  }

  // Return the enhanced HTML to be integrated with existing stats
  return enhancedHTML;
}

// ── Global function for expanding/collapsing stats details ───────────────────
function toggleStatsDetails(sectionId) {
  const details = document.getElementById(`${sectionId}-details`);
  const button = document.querySelector(`[data-section="${sectionId}"]`);
  const icon = button.querySelector('.expand-icon');
  
  if (details.style.display === 'none') {
    details.style.display = 'block';
    icon.textContent = '▼';
    button.classList.add('expanded');
  } else {
    details.style.display = 'none';
    icon.textContent = '▶';
    button.classList.remove('expanded');
  }
}