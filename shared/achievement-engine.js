// ─── Advanced Achievement & Goal System ──────────────────────────────────────
// Gamification engine with smart goals and dynamic achievements

class AchievementEngine {
  constructor() {
    this.achievements = this.loadAchievements();
    this.goals = this.loadGoals();
    this.streaks = this.loadStreaks();
    this.badges = this.loadBadges();
    this.leaderboards = this.loadLeaderboards();
    
    this.achievementDefinitions = this.getAchievementDefinitions();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startStreakTracking();
    this.setupPeriodicChecks();
  }

  // Achievement System
  checkAndUnlockAchievements(trackerName, actionType, data) {
    const newAchievements = [];
    
    this.achievementDefinitions.forEach(achievement => {
      if (!this.isAchievementUnlocked(achievement.id) && 
          this.evaluateAchievement(achievement, trackerName, actionType, data)) {
        
        const unlockedAchievement = this.unlockAchievement(achievement);
        newAchievements.push(unlockedAchievement);
      }
    });

    if (newAchievements.length > 0) {
      this.celebrateAchievements(newAchievements);
    }

    return newAchievements;
  }

  evaluateAchievement(achievement, trackerName, actionType, data) {
    const context = {
      trackerName,
      actionType,
      data,
      allData: this.getAllTrackerData(),
      userStats: this.calculateUserStats()
    };

    try {
      return achievement.condition(context);
    } catch (error) {
      console.error('Error evaluating achievement:', achievement.id, error);
      return false;
    }
  }

  unlockAchievement(achievement) {
    const unlockedAchievement = {
      ...achievement,
      unlockedAt: new Date().toISOString(),
      id: achievement.id
    };

    this.achievements.push(unlockedAchievement);
    this.saveAchievements();

    // Award XP and update user level
    this.awardXP(achievement.xp || 100);

    // Trigger notifications
    this.triggerAchievementNotification(unlockedAchievement);

    return unlockedAchievement;
  }

  // Goal System
  createGoal(goalData) {
    const goal = {
      id: this.generateId(),
      ...goalData,
      createdAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
      milestones: goalData.milestones || []
    };

    this.goals.push(goal);
    this.saveGoals();
    
    return goal;
  }

  updateGoalProgress(goalId, progress) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return null;

    const oldProgress = goal.progress;
    goal.progress = Math.max(0, Math.min(100, progress));
    goal.updatedAt = new Date().toISOString();

    // Check for milestone completion
    goal.milestones.forEach(milestone => {
      if (!milestone.completed && goal.progress >= milestone.threshold) {
        milestone.completed = true;
        milestone.completedAt = new Date().toISOString();
        this.celebrateMilestone(goal, milestone);
      }
    });

    // Check for goal completion
    if (goal.progress >= 100 && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date().toISOString();
      this.celebrateGoalCompletion(goal);
    }

    this.saveGoals();
    return goal;
  }

  // Smart Goal Suggestions
  suggestGoals() {
    const suggestions = [];
    const userStats = this.calculateUserStats();
    const progress = this.getProgressData();

    // Progress-based goals
    Object.entries(progress).forEach(([tracker, data]) => {
      if (data.percentage > 70 && data.percentage < 95) {
        suggestions.push({
          type: 'completion',
          tracker,
          title: `Complete ${this.getTrackerDisplayName(tracker)}`,
          description: `You're ${data.remaining} items away from completion!`,
          target: data.total,
          current: data.completed,
          difficulty: 'medium',
          estimatedDays: this.estimateCompletionTime(tracker, data.remaining),
          category: 'completion'
        });
      }
    });

    // Streak-based goals
    Object.entries(this.streaks).forEach(([tracker, streak]) => {
      if (streak.current > 3 && streak.current < 30) {
        suggestions.push({
          type: 'streak',
          tracker,
          title: `${streak.current + 7}-day ${this.getTrackerDisplayName(tracker)} streak`,
          description: 'Build on your current momentum!',
          target: streak.current + 7,
          current: streak.current,
          difficulty: 'easy',
          category: 'consistency'
        });
      }
    });

    // Discovery goals
    const discoveryOpportunities = this.findDiscoveryOpportunities();
    discoveryOpportunities.forEach(opp => {
      suggestions.push({
        type: 'discovery',
        tracker: opp.tracker,
        title: opp.title,
        description: opp.description,
        target: opp.target,
        current: opp.current,
        difficulty: opp.difficulty,
        category: 'exploration'
      });
    });

    // Cross-app goals
    const crossAppGoals = this.suggestCrossAppGoals();
    suggestions.push(...crossAppGoals);

    return suggestions.sort((a, b) => {
      const difficultyOrder = { easy: 3, medium: 2, hard: 1 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
  }

  suggestCrossAppGoals() {
    const crossGoals = [];
    const userStats = this.calculateUserStats();

    // Location-based cross goals
    if (userStats.hawkbology?.matches > 10 && userStats.brewery?.visited > 5) {
      crossGoals.push({
        type: 'cross_app',
        trackers: ['hawkbology', 'brewery-tracker'],
        title: 'Football & Brewery Explorer',
        description: 'Visit a brewery in every city where you\'ve seen a match',
        target: Math.min(userStats.hawkbology.cities, 10),
        current: 0, // Would need to calculate actual overlap
        difficulty: 'hard',
        category: 'exploration'
      });
    }

    // Transport goals
    if (userStats.tubology?.visited > 50 && userStats.ninetyTwo?.visited > 20) {
      crossGoals.push({
        type: 'cross_app',
        trackers: ['tubology', '92-tracker'],
        title: 'Public Transport Master',
        description: 'Use public transport to reach football grounds',
        target: 15,
        current: 0,
        difficulty: 'medium',
        category: 'efficiency'
      });
    }

    return crossGoals;
  }

  // Streak System
  updateStreak(trackerName, activity) {
    if (!this.streaks[trackerName]) {
      this.streaks[trackerName] = {
        current: 0,
        longest: 0,
        lastActivity: null,
        startDate: null
      };
    }

    const streak = this.streaks[trackerName];
    const today = new Date().toDateString();
    const lastActivityDate = streak.lastActivity ? new Date(streak.lastActivity).toDateString() : null;

    if (lastActivityDate === today) {
      // Already logged today, no change
      return streak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastActivityDate === yesterdayStr || streak.current === 0) {
      // Continue or start streak
      streak.current++;
      if (streak.current === 1) {
        streak.startDate = today;
      }
    } else {
      // Streak broken, restart
      streak.current = 1;
      streak.startDate = today;
    }

    streak.lastActivity = new Date().toISOString();
    streak.longest = Math.max(streak.longest, streak.current);

    this.saveStreaks();
    
    // Check for streak achievements
    this.checkStreakAchievements(trackerName, streak);
    
    return streak;
  }

  checkStreakAchievements(trackerName, streak) {
    const milestones = [3, 7, 14, 30, 50, 100];
    
    milestones.forEach(days => {
      if (streak.current === days) {
        this.checkAndUnlockAchievements(trackerName, 'streak_milestone', {
          streakDays: days,
          trackerName
        });
      }
    });
  }

  // Badge System
  awardBadge(badgeData) {
    const badge = {
      id: this.generateId(),
      ...badgeData,
      awardedAt: new Date().toISOString()
    };

    this.badges.push(badge);
    this.saveBadges();
    
    return badge;
  }

  // XP and Leveling System
  awardXP(amount, reason = 'achievement') {
    const profile = HawkServices.userProfile.profile;
    
    if (!profile.xp) {
      profile.xp = {
        total: 0,
        level: 1,
        currentLevelXP: 0
      };
    }

    const oldLevel = profile.xp.level;
    profile.xp.total += amount;
    
    // Calculate new level
    const newLevel = this.calculateLevel(profile.xp.total);
    const levelXPRequired = this.getXPForLevel(newLevel);
    const previousLevelXP = newLevel > 1 ? this.getXPForLevel(newLevel - 1) : 0;
    
    profile.xp.level = newLevel;
    profile.xp.currentLevelXP = profile.xp.total - previousLevelXP;
    profile.xp.nextLevelXP = levelXPRequired - previousLevelXP;

    HawkServices.userProfile.saveProfile();

    // Check for level up
    if (newLevel > oldLevel) {
      this.celebrateLevelUp(oldLevel, newLevel);
    }

    return profile.xp;
  }

  calculateLevel(totalXP) {
    // Level formula: level = floor(sqrt(totalXP / 100))
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  getXPForLevel(level) {
    // XP required for level: (level - 1)^2 * 100
    return Math.pow(level - 1, 2) * 100;
  }

  // Achievement Definitions
  getAchievementDefinitions() {
    return [
      // First Steps
      {
        id: 'first_match',
        title: 'First Match',
        description: 'Log your first football match',
        icon: '⚽',
        category: 'first_steps',
        xp: 50,
        condition: (ctx) => ctx.trackerName === 'hawkbology' && ctx.actionType === 'create'
      },
      {
        id: 'first_tube',
        title: 'Underground Explorer',
        description: 'Visit your first tube station',
        icon: '🚇',
        category: 'first_steps',
        xp: 50,
        condition: (ctx) => ctx.trackerName === 'tubology' && ctx.actionType === 'visit'
      },

      // Progress Milestones
      {
        id: 'football_10',
        title: 'Football Fan',
        description: 'Attend 10 football matches',
        icon: '🏟️',
        category: 'progress',
        xp: 200,
        condition: (ctx) => {
          const matches = ctx.allData.hawkbology || [];
          return matches.length >= 10;
        }
      },
      {
        id: 'football_50',
        title: 'Football Enthusiast',
        description: 'Attend 50 football matches',
        icon: '🎯',
        category: 'progress',
        xp: 500,
        condition: (ctx) => {
          const matches = ctx.allData.hawkbology || [];
          return matches.length >= 50;
        }
      },
      {
        id: 'tube_quarter',
        title: 'Quarter Master',
        description: 'Visit 25% of all tube stations',
        icon: '🎯',
        category: 'progress',
        xp: 300,
        condition: (ctx) => {
          const stations = ctx.allData.tubology_stations || [];
          const visited = stations.filter(s => s.visited).length;
          return visited >= Math.floor(stations.length * 0.25);
        }
      },

      // Streak Achievements
      {
        id: 'streak_week',
        title: 'Weekly Warrior',
        description: 'Maintain a 7-day activity streak',
        icon: '🔥',
        category: 'consistency',
        xp: 250,
        condition: (ctx) => ctx.actionType === 'streak_milestone' && ctx.data.streakDays >= 7
      },
      {
        id: 'streak_month',
        title: 'Monthly Master',
        description: 'Maintain a 30-day activity streak',
        icon: '💎',
        category: 'consistency',
        xp: 1000,
        condition: (ctx) => ctx.actionType === 'streak_milestone' && ctx.data.streakDays >= 30
      },

      // Special Achievements
      {
        id: 'wembley_visitor',
        title: 'Wembley Pilgrim',
        description: 'Visit the home of football',
        icon: '🏆',
        category: 'special',
        xp: 300,
        condition: (ctx) => {
          const matches = ctx.allData.hawkbology || [];
          return matches.some(m => m.stadium && m.stadium.includes('Wembley'));
        }
      },
      {
        id: 'all_zones',
        title: 'Zone Master',
        description: 'Visit stations in all tube zones',
        icon: '🎭',
        category: 'special',
        xp: 500,
        condition: (ctx) => {
          const stations = ctx.allData.tubology_stations || [];
          const visitedZones = new Set(
            stations.filter(s => s.visited).map(s => s.zone)
          );
          return visitedZones.size >= 6; // Assuming 6 zones
        }
      },

      // Cross-App Achievements
      {
        id: 'local_explorer',
        title: 'Local Explorer',
        description: 'Visit a brewery and stadium in the same area',
        icon: '🗺️',
        category: 'cross_app',
        xp: 400,
        condition: (ctx) => {
          // This would need more sophisticated location matching
          const matches = ctx.allData.hawkbology || [];
          const breweries = ctx.allData.brewery || [];
          return matches.length > 0 && breweries.some(b => b.visited);
        }
      },

      // Seasonal Achievements
      {
        id: 'winter_warrior',
        title: 'Winter Warrior',
        description: 'Stay active during winter months',
        icon: '❄️',
        category: 'seasonal',
        xp: 300,
        condition: (ctx) => {
          const winterMonths = [11, 0, 1]; // Dec, Jan, Feb
          const currentMonth = new Date().getMonth();
          return winterMonths.includes(currentMonth) && 
                 ctx.actionType === 'create';
        }
      },

      // Completion Achievements
      {
        id: 'ninety_two_complete',
        title: '92 Club Member',
        description: 'Visit all 92 football league grounds',
        icon: '👑',
        category: 'completion',
        xp: 2000,
        condition: (ctx) => {
          const grounds = ctx.allData['92-tracker'] || [];
          const visited = grounds.filter(g => g.visited).length;
          return visited >= 92;
        }
      },
      {
        id: 'tube_complete',
        title: 'Underground Master',
        description: 'Visit every tube station in London',
        icon: '🏅',
        category: 'completion',
        xp: 1500,
        condition: (ctx) => {
          const stations = ctx.allData.tubology_stations || [];
          const visited = stations.filter(s => s.visited).length;
          return visited >= stations.length && stations.length > 250;
        }
      }
    ];
  }

  // Celebration and Notifications
  celebrateAchievements(achievements) {
    achievements.forEach(achievement => {
      // Visual celebration
      this.showAchievementCelebration(achievement);
      
      // Sound effect (if enabled)
      this.playAchievementSound();
      
      // Share options
      this.offerSocialShare(achievement);
    });
  }

  showAchievementCelebration(achievement) {
    // Create achievement popup
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
        <div class="achievement-xp">+${achievement.xp} XP</div>
      </div>
    `;

    document.body.appendChild(popup);

    // Animate in
    setTimeout(() => popup.classList.add('show'), 100);

    // Remove after delay
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => document.body.removeChild(popup), 500);
    }, 4000);
  }

  celebrateGoalCompletion(goal) {
    HawkServices.notifications.addNotification(
      'goal_complete',
      '🎯 Goal Completed!',
      `Congratulations on completing "${goal.title}"!`
    );
  }

  celebrateLevelUp(oldLevel, newLevel) {
    HawkServices.notifications.addNotification(
      'level_up',
      '⬆️ Level Up!',
      `You've reached level ${newLevel}! Keep up the great work!`
    );
  }

  // Data Management
  saveAchievements() {
    localStorage.setItem('hawk_achievements', JSON.stringify(this.achievements));
  }

  loadAchievements() {
    const saved = localStorage.getItem('hawk_achievements');
    return saved ? JSON.parse(saved) : [];
  }

  saveGoals() {
    localStorage.setItem('hawk_goals', JSON.stringify(this.goals));
  }

  loadGoals() {
    const saved = localStorage.getItem('hawk_goals');
    return saved ? JSON.parse(saved) : [];
  }

  saveStreaks() {
    localStorage.setItem('hawk_streaks', JSON.stringify(this.streaks));
  }

  loadStreaks() {
    const saved = localStorage.getItem('hawk_streaks');
    return saved ? JSON.parse(saved) : {};
  }

  saveBadges() {
    localStorage.setItem('hawk_badges', JSON.stringify(this.badges));
  }

  loadBadges() {
    const saved = localStorage.getItem('hawk_badges');
    return saved ? JSON.parse(saved) : [];
  }

  loadLeaderboards() {
    const saved = localStorage.getItem('hawk_leaderboards');
    return saved ? JSON.parse(saved) : {};
  }

  // Helper Methods
  getAllTrackerData() {
    const trackerIds = [
      'hawkbology', 'tubology_stations', '92-tracker', 'brewery-tracker',
      'betting-tracker', 'hawk-football-travels', 'ive-been-there'
    ];

    const data = {};
    trackerIds.forEach(id => {
      const trackerData = localStorage.getItem(id);
      if (trackerData) {
        try {
          data[id] = JSON.parse(trackerData);
        } catch (e) {
          data[id] = null;
        }
      }
    });

    return data;
  }

  calculateUserStats() {
    const allData = this.getAllTrackerData();
    const stats = {};

    if (allData.hawkbology) {
      const stadiums = new Set(allData.hawkbology.map(m => m.stadium));
      const cities = new Set(allData.hawkbology.map(m => this.extractCity(m.stadium)));
      stats.hawkbology = {
        matches: allData.hawkbology.length,
        stadiums: stadiums.size,
        cities: cities.size
      };
    }

    if (allData.tubology_stations) {
      const visited = allData.tubology_stations.filter(s => s.visited);
      stats.tubology = {
        visited: visited.length,
        total: allData.tubology_stations.length,
        percentage: Math.round((visited.length / allData.tubology_stations.length) * 100)
      };
    }

    return stats;
  }

  getProgressData() {
    const data = {};
    
    // 92 Tracker progress
    const ninetyTwoData = localStorage.getItem('92-tracker');
    if (ninetyTwoData) {
      const parsed = JSON.parse(ninetyTwoData);
      const visited = parsed.filter(g => g.visited).length;
      data['92-tracker'] = {
        completed: visited,
        total: 92,
        remaining: 92 - visited,
        percentage: Math.round((visited / 92) * 100)
      };
    }

    return data;
  }

  isAchievementUnlocked(achievementId) {
    return this.achievements.some(a => a.id === achievementId);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  extractCity(stadium) {
    const cities = ['London', 'Manchester', 'Liverpool', 'Birmingham', 'Newcastle'];
    for (const city of cities) {
      if (stadium.includes(city)) return city;
    }
    return 'Other';
  }

  getTrackerDisplayName(trackerId) {
    const names = {
      'hawkbology': 'Hawkbology',
      'tubology': 'Tubology',
      '92-tracker': '92 Tracker',
      'brewery-tracker': 'Brewery Tracker'
    };
    return names[trackerId] || trackerId;
  }

  setupEventListeners() {
    // Listen for tracker updates
    window.addEventListener('hawkSyncUpdate', (event) => {
      this.handleTrackerUpdate(event.detail);
    });
  }

  handleTrackerUpdate(updateData) {
    this.checkAndUnlockAchievements(
      updateData.trackerName,
      updateData.operation,
      updateData.data
    );

    if (updateData.operation === 'create' || updateData.operation === 'update') {
      this.updateStreak(updateData.trackerName, updateData);
    }
  }

  startStreakTracking() {
    // Check streaks daily
    setInterval(() => {
      this.checkDailyStreaks();
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Initial check
    this.checkDailyStreaks();
  }

  checkDailyStreaks() {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    Object.keys(this.streaks).forEach(trackerName => {
      const streak = this.streaks[trackerName];
      const lastActivity = streak.lastActivity ? new Date(streak.lastActivity).toDateString() : null;

      // Break streak if no activity yesterday or today
      if (lastActivity !== today && lastActivity !== yesterdayStr && streak.current > 0) {
        streak.current = 0;
        streak.startDate = null;
      }
    });

    this.saveStreaks();
  }

  setupPeriodicChecks() {
    // Check for time-based achievements every hour
    setInterval(() => {
      this.checkTimeBasedAchievements();
    }, 60 * 60 * 1000);
  }

  checkTimeBasedAchievements() {
    // Check seasonal achievements, etc.
    this.checkAndUnlockAchievements('system', 'periodic_check', {
      timestamp: new Date().toISOString()
    });
  }

  // Placeholder methods
  findDiscoveryOpportunities() {
    return [];
  }

  estimateCompletionTime(tracker, remaining) {
    // Simple estimation based on recent activity
    const events = HawkServices.analytics.events.filter(e => e.trackerName === tracker);
    if (events.length < 5) return 'Unknown';

    const recentEvents = events.slice(-10);
    const timeSpan = new Date(recentEvents[recentEvents.length - 1].timestamp) - 
                     new Date(recentEvents[0].timestamp);
    const rate = recentEvents.length / (timeSpan / (1000 * 60 * 60 * 24)); // per day

    if (rate > 0) {
      return Math.ceil(remaining / rate);
    }

    return 'Unknown';
  }

  triggerAchievementNotification(achievement) {
    HawkServices.notifications.addNotification(
      'achievement_unlocked',
      '🏆 Achievement Unlocked!',
      `${achievement.title}: ${achievement.description}`
    );
  }

  celebrateMilestone(goal, milestone) {
    HawkServices.notifications.addNotification(
      'milestone_reached',
      '🎯 Milestone Reached!',
      `${milestone.title || 'Milestone'} completed in "${goal.title}"`
    );
  }

  playAchievementSound() {
    // Placeholder for sound effect
    if ('AudioContext' in window) {
      // Could add achievement sound here
    }
  }

  offerSocialShare(achievement) {
    // Placeholder for social sharing
    console.log('Achievement unlocked:', achievement.title);
  }
}

// Export the Achievement Engine
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AchievementEngine;
} else {
  window.AchievementEngine = AchievementEngine;
}