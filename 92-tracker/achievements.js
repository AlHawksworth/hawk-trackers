// ─── Enhanced Achievements & Leaderboards System ─────────────────────────────

// ── Advanced Achievement Definitions ──────────────────────────────────────────
const ADVANCED_ACHIEVEMENTS = [
  // Speed achievements
  {
    id: "speed_demon",
    emoji: "⚡",
    label: "Speed Demon",
    color: "#e74c3c",
    description: "Visit 10 grounds in a single week",
    tier: "gold",
    check: () => {
      const visits = Object.entries(state.visits)
        .filter(([id, v]) => v?.date)
        .sort(([,a], [,b]) => a.date.localeCompare(b.date));
      
      // Check for any 7-day period with 10+ visits
      for (let i = 0; i <= visits.length - 10; i++) {
        const startDate = new Date(visits[i][1].date);
        const endDate = new Date(visits[i + 9][1].date);
        const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 7) return true;
      }
      return false;
    }
  },
  
  {
    id: "weekend_warrior",
    emoji: "🎯",
    label: "Weekend Warrior",
    color: "#8e44ad",
    description: "Visit 20 grounds on weekends only",
    tier: "silver",
    check: () => {
      const weekendVisits = Object.entries(state.visits)
        .filter(([id, v]) => {
          if (!v?.date) return false;
          const date = new Date(v.date);
          const day = date.getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        });
      return weekendVisits.length >= 20;
    }
  },
  
  // Distance achievements
  {
    id: "long_haul",
    emoji: "🚗",
    label: "Long Haul Trucker",
    color: "#2980b9",
    description: "Travel 10,000km in total distance",
    tier: "gold",
    check: () => {
      const analytics = calculateTravelAnalytics();
      return analytics && analytics.totalDistanceFromHome >= 10000;
    }
  },
  
  {
    id: "efficiency_expert",
    emoji: "🎯",
    label: "Efficiency Expert",
    color: "#27ae60",
    description: "Maintain 80%+ route efficiency score",
    tier: "platinum",
    check: () => {
      const metrics = calculatePerformanceMetrics();
      return metrics && metrics.efficiencyScore >= 80;
    }
  },
  
  // Consistency achievements
  {
    id: "monthly_machine",
    emoji: "📅",
    label: "Monthly Machine",
    color: "#f39c12",
    description: "Visit at least one ground every month for a year",
    tier: "platinum",
    check: () => {
      const streaks = calculateStreakAnalytics();
      return streaks && streaks.longestMonthlyStreak >= 12;
    }
  },
  
  {
    id: "streak_master",
    emoji: "🔥",
    label: "Streak Master",
    color: "#e67e22",
    description: "Achieve a 30-day consecutive visiting streak",
    tier: "gold",
    check: () => {
      const streaks = calculateStreakAnalytics();
      return streaks && streaks.longestStreak >= 30;
    }
  },
  
  // Social achievements
  {
    id: "storyteller",
    emoji: "📖",
    label: "Storyteller",
    color: "#9b59b6",
    description: "Add notes to 50 ground visits",
    tier: "silver",
    check: () => {
      const notesCount = Object.values(state.visits)
        .filter(v => v && v.notes && v.notes.trim()).length;
      return notesCount >= 50;
    }
  },
  
  {
    id: "social_butterfly",
    emoji: "👥",
    label: "Social Butterfly",
    color: "#e91e63",
    description: "Visit grounds with 10 different companions",
    tier: "gold",
    check: () => {
      const companions = new Set();
      Object.values(state.extras || {}).forEach(extra => {
        if (extra.visitedWith) {
          extra.visitedWith.split(',').forEach(comp => {
            const name = comp.trim();
            if (name) companions.add(name.toLowerCase());
          });
        }
      });
      return companions.size >= 10;
    }
  },
  
  // Difficulty achievements
  {
    id: "big_six_conqueror",
    emoji: "👑",
    label: "Big Six Conqueror",
    color: "#6c5ce7",
    description: "Visit all Big Six Premier League grounds",
    tier: "gold",
    check: () => {
      const bigSix = [1, 7, 12, 13, 14, 18]; // Arsenal, Chelsea, Liverpool, Man City, Man Utd, Spurs
      return bigSix.every(id => state.visits[id]);
    }
  },
  
  {
    id: "capacity_crusher",
    emoji: "🏟",
    label: "Capacity Crusher",
    color: "#00b894",
    description: "Visit 10 grounds with 40,000+ capacity",
    tier: "silver",
    check: () => {
      const largeGrounds = state.clubs.filter(c => 
        state.visits[c.id] && STADIUM_CAPACITY[c.id] >= 40000
      );
      return largeGrounds.length >= 10;
    }
  },
  
  // Geographic achievements
  {
    id: "coastal_explorer",
    emoji: "🌊",
    label: "Coastal Explorer",
    color: "#00cec9",
    description: "Visit all seaside grounds",
    tier: "silver",
    check: () => {
      const seasideGrounds = [3, 5, 34, 39, 47, 81]; // Bournemouth, Brighton, Portsmouth, Southampton, Blackpool, Gillingham
      return seasideGrounds.every(id => state.visits[id]);
    }
  },
  
  {
    id: "border_hopper",
    emoji: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    label: "Border Hopper",
    color: "#d63031",
    description: "Visit grounds in England, Wales, and Scotland (if applicable)",
    tier: "bronze",
    check: () => {
      const welshGrounds = [41, 44, 51, 85]; // Swansea, Wrexham, Cardiff, Newport
      return welshGrounds.some(id => state.visits[id]);
    }
  },
  
  // Seasonal achievements
  {
    id: "christmas_cracker",
    emoji: "🎄",
    label: "Christmas Cracker",
    color: "#00b894",
    description: "Visit a ground on Christmas Day or Boxing Day",
    tier: "rare",
    check: () => {
      return Object.values(state.visits).some(v => {
        if (!v?.date) return false;
        const date = v.date.slice(5); // Get MM-DD
        return date === '12-25' || date === '12-26';
      });
    }
  },
  
  {
    id: "new_year_starter",
    emoji: "🎊",
    label: "New Year Starter",
    color: "#fdcb6e",
    description: "Visit a ground on New Year's Day",
    tier: "rare",
    check: () => {
      return Object.values(state.visits).some(v => 
        v?.date && v.date.slice(5) === '01-01'
      );
    }
  },
  
  // Special achievements
  {
    id: "opening_day",
    emoji: "🎬",
    label: "Opening Day Hero",
    color: "#a29bfe",
    description: "Visit a newly built or renovated stadium in its first season",
    tier: "legendary",
    check: () => {
      // This would need manual tracking or external data
      // For now, return false - could be manually awarded
      return false;
    }
  },
  
  {
    id: "promotion_celebration",
    emoji: "🎉",
    label: "Promotion Party",
    color: "#fd79a8",
    description: "Visit a ground the same season the club got promoted",
    tier: "rare",
    check: () => {
      // Would need season/promotion data
      return false;
    }
  },
  
  // Meta achievements
  {
    id: "achievement_hunter",
    emoji: "🏆",
    label: "Achievement Hunter",
    color: "#f39c12",
    description: "Unlock 25 different achievements",
    tier: "platinum",
    check: () => {
      const earned = getAllEarnedAchievements();
      return earned.length >= 25;
    }
  }
];

// ── Achievement Tiers ─────────────────────────────────────────────────────────
const ACHIEVEMENT_TIERS = {
  bronze: { color: '#cd7f32', points: 10, gradient: 'linear-gradient(135deg, #cd7f32, #b8860b)' },
  silver: { color: '#c0c0c0', points: 25, gradient: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)' },
  gold: { color: '#ffd700', points: 50, gradient: 'linear-gradient(135deg, #ffd700, #ffb347)' },
  platinum: { color: '#e5e4e2', points: 100, gradient: 'linear-gradient(135deg, #e5e4e2, #d3d3d3)' },
  rare: { color: '#9d4edd', points: 75, gradient: 'linear-gradient(135deg, #9d4edd, #7209b7)' },
  legendary: { color: '#ff6b35', points: 200, gradient: 'linear-gradient(135deg, #ff6b35, #f18701)' }
};

// ── Achievement Functions ─────────────────────────────────────────────────────
function getAllEarnedAchievements() {
  const basicBadges = renderBadges(); // Get existing badges
  const advancedEarned = ADVANCED_ACHIEVEMENTS.filter(achievement => {
    try {
      return achievement.check();
    } catch (error) {
      console.warn(`Error checking achievement ${achievement.id}:`, error);
      return false;
    }
  });
  
  return advancedEarned;
}

function calculateAchievementScore() {
  const earned = getAllEarnedAchievements();
  return earned.reduce((total, achievement) => {
    const tier = ACHIEVEMENT_TIERS[achievement.tier] || ACHIEVEMENT_TIERS.bronze;
    return total + tier.points;
  }, 0);
}

function getRecentAchievements(days = 30) {
  // This would need achievement unlock dates to be stored
  // For now, return empty array
  return [];
}

function renderAchievementShowcase() {
  const earned = getAllEarnedAchievements();
  const totalScore = calculateAchievementScore();
  const completionRate = Math.round((earned.length / ADVANCED_ACHIEVEMENTS.length) * 100);

  const tierCounts = {};
  Object.keys(ACHIEVEMENT_TIERS).forEach(tier => tierCounts[tier] = 0);
  earned.forEach(achievement => {
    tierCounts[achievement.tier]++;
  });

  return `
    <div class="achievement-showcase">
      <div class="achievement-header">
        <div class="achievement-score">
          <div class="score-value">${totalScore}</div>
          <div class="score-label">Achievement Points</div>
        </div>
        <div class="achievement-progress">
          <div class="progress-circle">
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0f0f0" stroke-width="3"/>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6c5ce7" stroke-width="3"
                stroke-dasharray="${completionRate} ${100 - completionRate}"
                stroke-dashoffset="25" transform="rotate(-90 18 18)"/>
            </svg>
            <div class="progress-text">${completionRate}%</div>
          </div>
          <div class="progress-label">${earned.length}/${ADVANCED_ACHIEVEMENTS.length} Unlocked</div>
        </div>
      </div>
      
      <div class="tier-summary">
        ${Object.entries(ACHIEVEMENT_TIERS).map(([tier, config]) => `
          <div class="tier-badge" style="background: ${config.gradient}">
            <div class="tier-count">${tierCounts[tier]}</div>
            <div class="tier-name">${tier.charAt(0).toUpperCase() + tier.slice(1)}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function renderAdvancedAchievements() {
  const earned = getAllEarnedAchievements();
  const earnedIds = new Set(earned.map(a => a.id));
  
  const groupedByTier = {};
  Object.keys(ACHIEVEMENT_TIERS).forEach(tier => groupedByTier[tier] = []);
  
  ADVANCED_ACHIEVEMENTS.forEach(achievement => {
    groupedByTier[achievement.tier].push(achievement);
  });

  let html = renderAchievementShowcase();
  
  Object.entries(groupedByTier).forEach(([tier, achievements]) => {
    if (achievements.length === 0) return;
    
    const tierConfig = ACHIEVEMENT_TIERS[tier];
    const earnedInTier = achievements.filter(a => earnedIds.has(a.id)).length;
    
    html += `
      <div class="achievement-tier-section">
        <div class="tier-header" style="background: ${tierConfig.gradient}">
          <h3>${tier.charAt(0).toUpperCase() + tier.slice(1)} Achievements</h3>
          <span class="tier-progress">${earnedInTier}/${achievements.length}</span>
        </div>
        
        <div class="achievements-grid">
          ${achievements.map(achievement => `
            <div class="achievement-card ${earnedIds.has(achievement.id) ? 'earned' : 'locked'}">
              <div class="achievement-icon" style="background: ${earnedIds.has(achievement.id) ? achievement.color : '#ccc'}">
                ${achievement.emoji}
              </div>
              <div class="achievement-info">
                <div class="achievement-name">${achievement.label}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${earnedIds.has(achievement.id) ? 
                  `<div class="achievement-points">+${tierConfig.points} points</div>` : 
                  '<div class="achievement-locked">🔒 Locked</div>'
                }
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  });
  
  return html;
}

// ── Leaderboard System (for future multi-user features) ──────────────────────
function generatePersonalLeaderboard() {
  const stats = {
    totalVisits: Object.keys(state.visits).length,
    achievementScore: calculateAchievementScore(),
    achievementCount: getAllEarnedAchievements().length,
    completionRate: Math.round((Object.keys(state.visits).length / 92) * 100)
  };
  
  // Generate comparison with hypothetical averages
  const averages = {
    totalVisits: 23,
    achievementScore: 450,
    achievementCount: 12,
    completionRate: 25
  };
  
  return {
    stats,
    averages,
    rankings: {
      visits: stats.totalVisits > averages.totalVisits ? 'above' : 'below',
      achievements: stats.achievementScore > averages.achievementScore ? 'above' : 'below',
      completion: stats.completionRate > averages.completionRate ? 'above' : 'below'
    }
  };
}

// ── Milestone Notifications ──────────────────────────────────────────────────
function checkForNewAchievements(previousState = null) {
  if (!previousState) return [];
  
  const currentEarned = new Set(getAllEarnedAchievements().map(a => a.id));
  const previousEarned = new Set(); // Would need to be stored
  
  const newAchievements = ADVANCED_ACHIEVEMENTS.filter(a => 
    currentEarned.has(a.id) && !previousEarned.has(a.id)
  );
  
  return newAchievements;
}

function showAchievementNotification(achievement) {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-notification-content">
      <div class="achievement-notification-icon">${achievement.emoji}</div>
      <div class="achievement-notification-text">
        <div class="achievement-notification-title">Achievement Unlocked!</div>
        <div class="achievement-notification-name">${achievement.label}</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Remove after delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 4000);
}

// ── Export functions ──────────────────────────────────────────────────────────
window.ADVANCED_ACHIEVEMENTS = ADVANCED_ACHIEVEMENTS;
window.getAllEarnedAchievements = getAllEarnedAchievements;
window.calculateAchievementScore = calculateAchievementScore;
window.renderAdvancedAchievements = renderAdvancedAchievements;
window.generatePersonalLeaderboard = generatePersonalLeaderboard;