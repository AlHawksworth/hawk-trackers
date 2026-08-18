// ─── Live Insights Dashboard ─────────────────────────────────────────────────
// Real-time analytics and dynamic metric tracking

// ── Live Statistics Calculator ───────────────────────────────────────────────
function calculateLiveMetrics() {
  const now = new Date();
  const visits = Object.entries(state.visits)
    .filter(([id, v]) => v?.date)
    .map(([id, v]) => ({
      id: parseInt(id),
      club: state.clubs.find(c => c.id === parseInt(id)),
      date: new Date(v.date)
    }))
    .sort((a, b) => a.date - b.date);

  if (!visits.length) return null;

  // Current momentum calculations
  const recentVisits = visits.filter(v => 
    (now - v.date) / (1000 * 60 * 60 * 24) <= 30
  );
  
  const veryRecentVisits = visits.filter(v => 
    (now - v.date) / (1000 * 60 * 60 * 24) <= 7
  );

  // Velocity tracking
  const daysSinceStart = (now - visits[0].date) / (1000 * 60 * 60 * 24);
  const currentVelocity = visits.length / Math.max(daysSinceStart, 1) * 30.44; // Per month
  
  // Acceleration calculation (last 3 months vs previous 3 months)
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  
  const recent3MonthVisits = visits.filter(v => v.date >= threeMonthsAgo).length;
  const previous3MonthVisits = visits.filter(v => 
    v.date >= sixMonthsAgo && v.date < threeMonthsAgo
  ).length;
  
  const acceleration = recent3MonthVisits - previous3MonthVisits;
  
  // Streak status
  const lastVisit = visits[visits.length - 1];
  const daysSinceLastVisit = (now - lastVisit.date) / (1000 * 60 * 60 * 24);
  
  // Completion prediction with confidence intervals
  const remaining = 92 - visits.length;
  const eta = remaining / Math.max(currentVelocity / 30.44, 0.01);
  const completionDate = new Date(now.getTime() + eta * 24 * 60 * 60 * 1000);
  
  // Momentum score (0-100)
  const momentumFactors = [
    Math.min(recentVisits.length * 10, 50), // Recent activity (up to 50 points)
    Math.min(Math.max(acceleration * 5, -20), 30), // Acceleration (up to 30 points)
    Math.max(0, 20 - daysSinceLastVisit), // Recency bonus (up to 20 points)
  ];
  const momentumScore = Math.max(0, Math.min(100, momentumFactors.reduce((sum, f) => sum + f, 0)));

  return {
    currentVelocity: Math.round(currentVelocity * 100) / 100,
    recentActivity: recentVisits.length,
    weeklyActivity: veryRecentVisits.length,
    acceleration,
    momentum: {
      score: Math.round(momentumScore),
      status: momentumScore >= 70 ? 'excellent' : 
              momentumScore >= 50 ? 'good' : 
              momentumScore >= 30 ? 'moderate' : 'low'
    },
    streakStatus: {
      daysSince: Math.round(daysSinceLastVisit),
      status: daysSinceLastVisit <= 7 ? 'hot' : 
              daysSinceLastVisit <= 14 ? 'warm' : 
              daysSinceLastVisit <= 30 ? 'cooling' : 'cold'
    },
    projection: {
      eta: Math.round(eta),
      completionDate: completionDate.toISOString().slice(0, 10),
      confidence: Math.min(95, visits.length * 2) // Higher confidence with more data
    }
  };
}

// ── Dynamic Achievement Progress ─────────────────────────────────────────────
function calculateAchievementProgress() {
  if (typeof ADVANCED_ACHIEVEMENTS === 'undefined') return [];
  
  const earnedAchievements = getAllEarnedAchievements();
  const earnedIds = new Set(earnedAchievements.map(a => a.id));
  
  return ADVANCED_ACHIEVEMENTS
    .filter(achievement => !earnedIds.has(achievement.id))
    .map(achievement => {
      let progress = 0;
      let description = achievement.description;
      
      // Calculate progress for specific achievements
      switch (achievement.id) {
        case 'speed_demon': {
          // Check max visits in any 7-day period
          const visits = Object.entries(state.visits)
            .filter(([id, v]) => v?.date)
            .sort(([,a], [,b]) => a.date.localeCompare(b.date));
          
          let maxWeeklyVisits = 0;
          for (let i = 0; i < visits.length - 6; i++) {
            const startDate = new Date(visits[i][1].date);
            const endDate = new Date(visits[i + 6][1].date);
            if ((endDate - startDate) / (1000 * 60 * 60 * 24) <= 7) {
              maxWeeklyVisits = Math.max(maxWeeklyVisits, 7);
            }
          }
          progress = Math.min(maxWeeklyVisits / 10 * 100, 100);
          description = `Visit 10 grounds in a week (current max: ${maxWeeklyVisits})`;
          break;
        }
        
        case 'weekend_warrior': {
          const weekendVisits = Object.entries(state.visits)
            .filter(([id, v]) => {
              if (!v?.date) return false;
              const day = new Date(v.date).getDay();
              return day === 0 || day === 6;
            }).length;
          progress = Math.min(weekendVisits / 20 * 100, 100);
          description = `Visit 20 grounds on weekends (${weekendVisits}/20)`;
          break;
        }
        
        case 'long_haul': {
          const analytics = calculateTravelAnalytics();
          if (analytics) {
            progress = Math.min(analytics.totalDistanceFromHome / 10000 * 100, 100);
            description = `Travel 10,000km total (${analytics.totalDistanceFromHome.toLocaleString()}/10,000)`;
          }
          break;
        }
        
        case 'monthly_machine': {
          const streaks = calculateStreakAnalytics();
          if (streaks) {
            progress = Math.min(streaks.longestMonthlyStreak / 12 * 100, 100);
            description = `12 consecutive months with visits (${streaks.longestMonthlyStreak}/12)`;
          }
          break;
        }
      }
      
      return {
        ...achievement,
        progress: Math.round(progress),
        customDescription: description
      };
    })
    .filter(a => a.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 6); // Top 6 achievements in progress
}

// ── Weekly Challenge Generator ───────────────────────────────────────────────
function generateWeeklyChallenge() {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const visits = Object.entries(state.visits).filter(([id, v]) => v?.date);
  
  // Seed random with week number for consistency
  const seed = currentWeek + new Date().getFullYear() * 100;
  const random = () => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const challenges = [
    {
      id: 'geographic_explorer',
      title: 'Geographic Explorer',
      description: 'Visit a ground in a region you haven\'t been to recently',
      points: 50,
      difficulty: 'medium',
      icon: '🗺️'
    },
    {
      id: 'division_diversity',
      title: 'Division Diversity', 
      description: 'Visit grounds from 2 different divisions this week',
      points: 75,
      difficulty: 'medium',
      icon: '⚽'
    },
    {
      id: 'weekend_double',
      title: 'Weekend Double',
      description: 'Visit 2 grounds over the weekend',
      points: 100,
      difficulty: 'hard',
      icon: '🎯'
    },
    {
      id: 'efficiency_master',
      title: 'Efficiency Master',
      description: 'Visit 3 grounds within 100km of each other',
      points: 80,
      difficulty: 'hard',
      icon: '🛣️'
    },
    {
      id: 'history_hunter',
      title: 'History Hunter',
      description: 'Visit a ground with over 100 years of history',
      points: 60,
      difficulty: 'medium',
      icon: '🏛️'
    },
    {
      id: 'capacity_climber',
      title: 'Capacity Climber',
      description: 'Visit a ground with 30,000+ capacity',
      points: 70,
      difficulty: 'medium',
      icon: '🏟️'
    }
  ];
  
  const weeklyChallenge = challenges[Math.floor(random() * challenges.length)];
  
  // Check if already completed this week
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const thisWeekVisits = visits.filter(([id, v]) => new Date(v.date) >= weekStart);
  let completed = false;
  
  // Simple completion check (could be made more sophisticated)
  if (weeklyChallenge.id === 'weekend_double') {
    const weekendVisits = thisWeekVisits.filter(([id, v]) => {
      const day = new Date(v.date).getDay();
      return day === 0 || day === 6;
    });
    completed = weekendVisits.length >= 2;
  } else {
    completed = thisWeekVisits.length > 0; // Basic completion for demo
  }
  
  return {
    ...weeklyChallenge,
    completed,
    endsIn: 7 - now.getDay(), // Days until week ends
    weekNumber: currentWeek
  };
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// ── Real-time Comparisons ────────────────────────────────────────────────────
function calculatePeerComparisons() {
  const visits = Object.keys(state.visits).length;
  const totalDays = state.visits && Object.values(state.visits).filter(v => v?.date).length > 0 
    ? Math.ceil((new Date() - new Date(Object.values(state.visits).filter(v => v?.date).sort((a,b) => a.date.localeCompare(b.date))[0].date)) / (1000 * 60 * 60 * 24))
    : 1;
  
  const velocity = visits / totalDays * 365; // Visits per year
  
  // Simulated peer data (in reality this would come from a database)
  const peerBenchmarks = {
    beginner: { visits: 15, velocity: 8, label: 'Casual Explorer' },
    intermediate: { visits: 35, velocity: 18, label: 'Weekend Warrior' },
    advanced: { visits: 60, velocity: 35, label: 'Dedicated Traveler' },
    expert: { visits: 85, velocity: 50, label: 'Ground-hopping Legend' }
  };
  
  // Find user's tier
  let currentTier = 'beginner';
  let nextTier = 'intermediate';
  
  if (visits >= peerBenchmarks.expert.visits) {
    currentTier = 'expert';
    nextTier = null;
  } else if (visits >= peerBenchmarks.advanced.visits) {
    currentTier = 'advanced';
    nextTier = 'expert';
  } else if (visits >= peerBenchmarks.intermediate.visits) {
    currentTier = 'intermediate';
    nextTier = 'advanced';
  }
  
  const progressToNext = nextTier ? 
    ((visits - peerBenchmarks[currentTier].visits) / 
     (peerBenchmarks[nextTier].visits - peerBenchmarks[currentTier].visits)) * 100 : 100;
  
  return {
    currentTier: {
      name: currentTier,
      label: peerBenchmarks[currentTier].label,
      visits: peerBenchmarks[currentTier].visits,
      velocity: peerBenchmarks[currentTier].velocity
    },
    nextTier: nextTier ? {
      name: nextTier,
      label: peerBenchmarks[nextTier].label,
      visits: peerBenchmarks[nextTier].visits,
      velocity: peerBenchmarks[nextTier].velocity,
      visitsNeeded: peerBenchmarks[nextTier].visits - visits
    } : null,
    userStats: {
      visits,
      velocity: Math.round(velocity * 10) / 10
    },
    progressToNext: Math.round(progressToNext),
    percentile: Math.min(95, (visits / 92) * 100) // Rough percentile
  };
}

// ── Main Live Dashboard Renderer ─────────────────────────────────────────────
function renderLiveDashboard() {
  const liveMetrics = calculateLiveMetrics();
  const achievementProgress = calculateAchievementProgress();
  const weeklyChallenge = generateWeeklyChallenge();
  const peerComparisons = calculatePeerComparisons();
  
  if (!liveMetrics) {
    return `
      <div class="live-dashboard-container">
        <div class="live-dashboard-empty">
          <div class="live-empty-icon">📊</div>
          <div class="live-empty-title">Live Dashboard</div>
          <div class="live-empty-subtitle">Visit a few grounds to unlock real-time analytics</div>
        </div>
      </div>
    `;
  }
  
  let dashboardHTML = `
    <div class="live-dashboard-container">
      <div class="live-dashboard-header">
        <div class="live-dashboard-title">📈 Live Dashboard</div>
        <div class="live-dashboard-subtitle">Real-time insights and progress tracking</div>
        <div class="live-update-indicator">
          <div class="pulse-dot"></div>
          <span>Live</span>
        </div>
      </div>
  `;
  
  // Current Momentum Section
  const momentumClass = liveMetrics.momentum.status === 'excellent' ? 'momentum-excellent' :
                        liveMetrics.momentum.status === 'good' ? 'momentum-good' :
                        liveMetrics.momentum.status === 'moderate' ? 'momentum-moderate' : 'momentum-low';
  
  dashboardHTML += `
    <div class="live-section momentum-section">
      <div class="live-section-title">🔥 Current Momentum</div>
      <div class="momentum-display ${momentumClass}">
        <div class="momentum-score">${liveMetrics.momentum.score}</div>
        <div class="momentum-label">${liveMetrics.momentum.status.toUpperCase()}</div>
        <div class="momentum-ring">
          <svg viewBox="0 0 36 36">
            <path class="momentum-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="momentum-ring-progress" stroke-dasharray="${liveMetrics.momentum.score}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
        </div>
      </div>
      <div class="momentum-details">
        <div class="momentum-stat">
          <span class="stat-label">Recent Activity:</span>
          <span class="stat-value">${liveMetrics.recentActivity} visits (30 days)</span>
        </div>
        <div class="momentum-stat">
          <span class="stat-label">Current Velocity:</span>
          <span class="stat-value">${liveMetrics.currentVelocity} grounds/month</span>
        </div>
        <div class="momentum-stat">
          <span class="stat-label">Streak Status:</span>
          <span class="stat-value streak-${liveMetrics.streakStatus.status}">
            ${liveMetrics.streakStatus.status.toUpperCase()} (${liveMetrics.streakStatus.daysSince} days)
          </span>
        </div>
      </div>
    </div>
  `;
  
  // Weekly Challenge Section
  dashboardHTML += `
    <div class="live-section challenge-section">
      <div class="live-section-title">🎯 Weekly Challenge</div>
      <div class="weekly-challenge ${weeklyChallenge.completed ? 'challenge-completed' : ''}">
        <div class="challenge-header">
          <div class="challenge-icon">${weeklyChallenge.icon}</div>
          <div class="challenge-info">
            <div class="challenge-title">${weeklyChallenge.title}</div>
            <div class="challenge-difficulty difficulty-${weeklyChallenge.difficulty}">${weeklyChallenge.difficulty.toUpperCase()}</div>
          </div>
          <div class="challenge-points">+${weeklyChallenge.points} pts</div>
        </div>
        <div class="challenge-description">${weeklyChallenge.description}</div>
        <div class="challenge-status">
          ${weeklyChallenge.completed ? 
            '<div class="challenge-complete">✅ Completed!</div>' :
            `<div class="challenge-timer">⏰ ${weeklyChallenge.endsIn} days remaining</div>`
          }
        </div>
      </div>
    </div>
  `;
  
  // Achievement Progress Section
  if (achievementProgress.length > 0) {
    dashboardHTML += `
      <div class="live-section achievements-progress-section">
        <div class="live-section-title">🏆 Achievement Progress</div>
        <div class="achievements-progress-grid">
    `;
    
    achievementProgress.slice(0, 3).forEach(achievement => {
      dashboardHTML += `
        <div class="achievement-progress-card tier-${achievement.tier}">
          <div class="achievement-progress-header">
            <span class="achievement-emoji">${achievement.emoji}</span>
            <span class="achievement-name">${achievement.label}</span>
          </div>
          <div class="achievement-progress-bar">
            <div class="achievement-progress-fill" style="width: ${achievement.progress}%"></div>
          </div>
          <div class="achievement-progress-text">${achievement.progress}% complete</div>
          <div class="achievement-progress-desc">${achievement.customDescription}</div>
        </div>
      `;
    });
    
    dashboardHTML += `
        </div>
      </div>
    `;
  }
  
  // Peer Comparison Section
  dashboardHTML += `
    <div class="live-section peer-comparison-section">
      <div class="live-section-title">👥 Community Standing</div>
      <div class="peer-comparison-container">
        <div class="current-tier">
          <div class="tier-badge tier-${peerComparisons.currentTier.name}">
            ${peerComparisons.currentTier.label}
          </div>
          <div class="tier-stats">
            <div class="tier-stat">
              <span>${peerComparisons.userStats.visits} visits</span>
              <span>${peerComparisons.userStats.velocity}/year</span>
            </div>
          </div>
        </div>
        ${peerComparisons.nextTier ? `
          <div class="tier-progression">
            <div class="progression-bar">
              <div class="progression-fill" style="width: ${peerComparisons.progressToNext}%"></div>
            </div>
            <div class="next-tier-info">
              <span>Next: ${peerComparisons.nextTier.label}</span>
              <span>${peerComparisons.nextTier.visitsNeeded} visits needed</span>
            </div>
          </div>
        ` : `
          <div class="tier-maxed">
            <div class="maxed-icon">👑</div>
            <div class="maxed-text">Maximum tier achieved!</div>
          </div>
        `}
      </div>
    </div>
  `;
  
  // Projection Section
  dashboardHTML += `
    <div class="live-section projection-section">
      <div class="live-section-title">🎯 Completion Projection</div>
      <div class="projection-container">
        <div class="projection-main">
          <div class="projection-date">${liveMetrics.projection.completionDate}</div>
          <div class="projection-label">Estimated completion</div>
          <div class="projection-confidence">${liveMetrics.projection.confidence}% confidence</div>
        </div>
        <div class="projection-details">
          <div class="projection-stat">
            <span class="proj-label">Days remaining:</span>
            <span class="proj-value">${liveMetrics.projection.eta}</span>
          </div>
          <div class="projection-stat">
            <span class="proj-label">At current pace:</span>
            <span class="proj-value">${liveMetrics.currentVelocity} grounds/month</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  dashboardHTML += `
    </div>
  `;
  
  return dashboardHTML;
}

// Auto-refresh functionality (optional)
function initializeLiveDashboard() {
  // Refresh every 5 minutes when the stats page is active
  setInterval(() => {
    if (document.getElementById('page-stats') && !document.getElementById('page-stats').classList.contains('hidden')) {
      const dashboardContainer = document.querySelector('.live-dashboard-container');
      if (dashboardContainer) {
        dashboardContainer.innerHTML = renderLiveDashboard().replace('<div class="live-dashboard-container">', '').replace('</div>', '');
      }
    }
  }, 300000); // 5 minutes
}

// Initialize when the page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', initializeLiveDashboard);
}