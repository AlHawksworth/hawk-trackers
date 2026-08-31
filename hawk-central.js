// ─── Hawk Central: Unified Dashboard Application ─────────────────────────────
// Central hub for all tracker applications with cross-app features

class HawkCentral {
  constructor() {
    this.trackers = this.getAvailableTrackers();
    this.userProfile = HawkServices.userProfile;
    this.analytics = HawkServices.analytics;
    this.recommendations = HawkServices.recommendations;
    
    // Phase 2: ML Systems
    this.mlEngine = null;
    this.notificationSystem = null;
    this.achievementEngine = null;
    
    this.init();
  }

  async init() {
    this.renderOverviewStats();
    this.renderQuickActions();
    this.renderActivityFeed();
    this.renderTrackersGrid();
    this.renderRecommendations();
    this.renderAchievements();
    this.setupEventListeners();
    this.setupUnifiedSearch();
    
    // Track visit
    this.analytics.trackEvent('app', 'open', 'hawk-central');
    
    // Initialize ML systems
    await this.initializeMLSystems();
    
    // Update ML status periodically
    this.startMLStatusUpdates();
  }

  async initializeMLSystems() {
    try {
      if (window.MLEngine) {
        this.mlEngine = new MLEngine();
        await this.mlEngine.trainAllModels();
        console.log('✅ Hawk Central ML systems initialized');
        
        // Update ML status
        const statusEl = document.getElementById('ml-status');
        if (statusEl) {
          statusEl.textContent = 'Ready';
          statusEl.style.color = '#10b981';
        }
      }
      
      if (window.SmartNotificationSystem) {
        this.notificationSystem = new SmartNotificationSystem();
      }
      
      if (window.AchievementEngine) {
        this.achievementEngine = new AchievementEngine();
      }
    } catch (error) {
      console.log('ML systems initializing in background');
      const statusEl = document.getElementById('ml-status');
      if (statusEl) {
        statusEl.textContent = 'Loading...';
      }
    }
  }

  startMLStatusUpdates() {
    setInterval(() => {
      this.updateMLStatus();
    }, 10000); // Update every 10 seconds
  }

  updateMLStatus() {
    const statusEl = document.getElementById('ml-status');
    if (!statusEl) return;
    
    if (this.mlEngine) {
      const modelData = localStorage.getItem('hawk_ml_models');
      if (modelData) {
        try {
          const parsed = JSON.parse(modelData);
          const lastTrained = new Date(parsed.lastTrained);
          const now = new Date();
          const diff = now - lastTrained;
          
          if (diff < 60000) { // Less than 1 minute
            statusEl.textContent = 'Just Updated';
            statusEl.style.color = '#10b981';
          } else if (diff < 300000) { // Less than 5 minutes
            statusEl.textContent = 'Ready';
            statusEl.style.color = '#10b981';
          } else {
            statusEl.textContent = 'Needs Update';
            statusEl.style.color = '#f59e0b';
          }
        } catch (e) {
          statusEl.textContent = 'Ready';
        }
      } else {
        statusEl.textContent = 'Training...';
        statusEl.style.color = '#64748b';
      }
    }
  }

  getAvailableTrackers() {
    return [
      {
        id: 'hawkbology',
        name: 'Hawkbology',
        description: 'Football match tracker',
        icon: '⚽',
        url: 'hawkbology/index.html',
        color: '#3b82f6',
        getStats: () => this.getHawkbologyStats()
      },
      {
        id: 'tubology',
        name: 'Tubology',
        description: 'London Underground tracker',
        icon: '🚇',
        url: 'tubology/index.html',
        color: '#dc2626',
        getStats: () => this.getTubologyStats()
      },
      {
        id: '92-tracker',
        name: '92 Tracker',
        description: 'Football ground completion',
        icon: '🏟️',
        url: '92-tracker/index.html',
        color: '#059669',
        getStats: () => this.get92TrackerStats()
      },
      {
        id: 'brewery-tracker',
        name: 'Brewery Tracker',
        description: 'England brewery visits',
        icon: '🍺',
        url: 'brewery-tracker/index.html',
        color: '#f59e0b',
        getStats: () => this.getBreweryTrackerStats()
      },
      {
        id: 'betting-tracker',
        name: 'Betting Tracker',
        description: 'Betting analytics & P&L',
        icon: '💰',
        url: 'betting-tracker/index.html',
        color: '#10b981',
        getStats: () => this.getBettingTrackerStats()
      },
      {
        id: 'hawk-football-travels',
        name: 'Football Travels',
        description: 'Stadium reviews & ratings',
        icon: '✈️',
        url: 'hawk-football-travels/index.html',
        color: '#8b5cf6',
        getStats: () => this.getFootballTravelsStats()
      },
      {
        id: 'ive-been-there',
        name: "I've Been There",
        description: 'World travel completion',
        icon: '🌍',
        url: 'ive-been-there/index.html',
        color: '#06b6d4',
        getStats: () => this.getIveBeenThereStats()
      },
      {
        id: 'joind',
        name: 'JoinD',
        description: 'SQL learning platform',
        icon: '🎓',
        url: 'joind/index.html',
        color: '#f97316',
        getStats: () => this.getJoindStats()
      },
      {
        id: 'know-your-team',
        name: 'Know Your Team',
        description: 'Football team knowledge',
        icon: '🧠',
        url: 'know-your-team/index.html',
        color: '#ec4899',
        getStats: () => this.getKnowYourTeamStats()
      },
      {
        id: 'avant',
        name: 'Avant',
        description: 'Streaming tracker',
        icon: '📺',
        url: 'avant/index.html',
        color: '#6366f1',
        getStats: () => this.getAvantStats()
      },
      {
        id: 'greyhound-tracker',
        name: 'Greyhound Tracker',
        description: 'Greyhound betting analytics',
        icon: '🐕',
        url: 'greyhound-tracker/index.html',
        color: '#84cc16',
        getStats: () => this.getGreyhoundTrackerStats()
      }
    ];
  }

  renderOverviewStats() {
    const container = document.getElementById('overview-stats');
    const activeTrackers = this.userProfile.getActiveTrackers();
    const activitySummary = this.analytics.getActivitySummary(7);
    
    let totalItems = 0;
    activeTrackers.forEach(trackerId => {
      const data = localStorage.getItem(trackerId);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          totalItems += Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
        } catch (e) {
          // Handle non-JSON data
          totalItems += 1;
        }
      }
    });

    const stats = [
      {
        value: activeTrackers.length,
        label: 'Active Trackers',
        change: null
      },
      {
        value: totalItems.toLocaleString(),
        label: 'Total Items Tracked',
        change: null
      },
      {
        value: activitySummary.totalEvents,
        label: 'Weekly Activity',
        change: 'positive'
      },
      {
        value: this.getDaysActive(),
        label: 'Days Active',
        change: null
      }
    ];

    container.innerHTML = stats.map(stat => `
      <div class="hawk-stat-card">
        <div class="hawk-stat-value">${stat.value}</div>
        <div class="hawk-stat-label">${stat.label}</div>
        ${stat.change ? `<div class="hawk-stat-change ${stat.change}">This week</div>` : ''}
      </div>
    `).join('');
  }

  renderQuickActions() {
    const container = document.getElementById('quick-actions');
    const actions = [
      { icon: '🔍', label: 'Search All', action: () => this.openUnifiedSearch() },
      { icon: '📊', label: 'View Analytics', action: () => this.showAnalytics() },
      { icon: '🎯', label: 'Set Goals', action: () => this.showGoals() },
      { icon: '📱', label: 'Add Quick Entry', action: () => this.quickAdd() },
      { icon: '📤', label: 'Export Data', action: () => this.exportAllData() },
      { icon: '⚙️', label: 'Settings', action: () => this.showSettings() }
    ];

    container.innerHTML = actions.map(action => `
      <div class="hawk-quick-action" onclick="hawkCentral.${action.action.name}()">
        <span class="hawk-quick-action-icon">${action.icon}</span>
        ${action.label}
      </div>
    `).join('');
  }
  renderActivityFeed() {
    const container = document.getElementById('activity-feed');
    const activities = HawkServices.sync.getRecentActivity(10);
    
    if (activities.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No recent activity</p>';
      return;
    }

    container.innerHTML = activities.map(activity => `
      <div class="hawk-activity-item">
        <div class="hawk-activity-icon ${activity.trackerName}">
          ${this.getTrackerIcon(activity.trackerName)}
        </div>
        <div class="hawk-activity-content">
          <div class="hawk-activity-title">${this.formatActivityTitle(activity)}</div>
          <div class="hawk-activity-meta">${this.formatTimeAgo(activity.timestamp)} • ${this.getTrackerName(activity.trackerName)}</div>
        </div>
      </div>
    `).join('');
  }

  renderTrackersGrid() {
    const container = document.getElementById('trackers-grid');
    const activeTrackerIds = this.userProfile.getActiveTrackers();
    
    container.innerHTML = this.trackers.map(tracker => {
      const isActive = activeTrackerIds.includes(tracker.id);
      const stats = isActive ? tracker.getStats() : null;
      
      return `
        <div class="tracker-card" style="--tracker-color: ${tracker.color}" onclick="window.open('${tracker.url}', '_blank')">
          <div class="tracker-header">
            <div class="tracker-icon" style="background: ${tracker.color}">
              ${tracker.icon}
            </div>
            <div class="tracker-title">${tracker.name}</div>
          </div>
          <div class="tracker-stats">
            ${stats ? this.renderTrackerStats(stats) : '<div class="tracker-stat"><span class="tracker-stat-label">Status</span><span class="tracker-stat-value">Not used yet</span></div>'}
          </div>
          <div class="tracker-last-used">
            ${isActive ? this.getLastUsed(tracker.id) : 'Click to start tracking'}
          </div>
        </div>
      `;
    }).join('');
  }

  renderTrackerStats(stats) {
    return Object.entries(stats).map(([label, value]) => `
      <div class="tracker-stat">
        <span class="tracker-stat-label">${label}</span>
        <span class="tracker-stat-value">${value}</span>
      </div>
    `).join('');
  }

  renderRecommendations() {
    const container = document.getElementById('recommendations');
    const recommendations = this.recommendations.generateRecommendations();
    
    if (recommendations.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Complete more activities to get personalized recommendations</p>';
      return;
    }

    container.innerHTML = recommendations.map(rec => `
      <div class="recommendation-card" onclick="hawkCentral.handleRecommendation('${rec.type}', '${rec.action}')">
        <div class="recommendation-icon">💡</div>
        <div class="recommendation-content">
          <div class="recommendation-title">${rec.title}</div>
          <div class="recommendation-message">${rec.message}</div>
        </div>
      </div>
    `).join('');
  }

  renderAchievements() {
    const container = document.getElementById('achievements');
    const achievements = this.userProfile.profile.achievements.slice(0, 6);
    
    if (achievements.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Start tracking to unlock achievements!</p>';
      return;
    }

    container.innerHTML = achievements.map(achievement => `
      <div class="achievement-card">
        <div class="achievement-badge-large">🏆</div>
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Listen for cross-app updates
    window.addEventListener('hawkSyncUpdate', (event) => {
      this.handleCrossAppUpdate(event.detail);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            this.openUnifiedSearch();
            break;
          case '/':
            e.preventDefault();
            this.openUnifiedSearch();
            break;
        }
      }
      
      if (e.key === 'Escape') {
        this.closeUnifiedSearch();
      }
    });

    // Refresh data every 5 minutes
    setInterval(() => {
      this.refreshData();
    }, 5 * 60 * 1000);
  }

  setupUnifiedSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      
      if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
      }

      searchTimeout = setTimeout(() => {
        this.performUnifiedSearch(query);
      }, 300);
    });

    // Close on backdrop click
    document.getElementById('unified-search').addEventListener('click', (e) => {
      if (e.target.id === 'unified-search') {
        this.closeUnifiedSearch();
      }
    });
  }

  performUnifiedSearch(query) {
    const results = {};
    const lowerQuery = query.toLowerCase();

    this.trackers.forEach(tracker => {
      const data = localStorage.getItem(tracker.id);
      if (!data) return;

      try {
        const parsed = JSON.parse(data);
        const trackerResults = [];

        if (Array.isArray(parsed)) {
          parsed.forEach((item, index) => {
            if (this.itemMatchesQuery(item, lowerQuery)) {
              trackerResults.push({
                title: this.getItemTitle(item, tracker.id),
                meta: this.getItemMeta(item, tracker.id),
                url: `${tracker.url}#item-${index}`,
                tracker: tracker.name
              });
            }
          });
        } else {
          Object.entries(parsed).forEach(([key, value]) => {
            if (key.toLowerCase().includes(lowerQuery) || 
                (typeof value === 'string' && value.toLowerCase().includes(lowerQuery))) {
              trackerResults.push({
                title: key,
                meta: typeof value === 'string' ? value : JSON.stringify(value),
                url: `${tracker.url}#${key}`,
                tracker: tracker.name
              });
            }
          });
        }

        if (trackerResults.length > 0) {
          results[tracker.name] = trackerResults.slice(0, 5);
        }
      } catch (e) {
        // Handle non-JSON data
      }
    });

    this.displaySearchResults(results);
  }
  displaySearchResults(results) {
    const container = document.getElementById('search-results');
    
    if (Object.keys(results).length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No results found</div>';
      return;
    }

    container.innerHTML = Object.entries(results).map(([trackerName, items]) => `
      <div class="hawk-search-group">
        <div class="hawk-search-group-title">${trackerName}</div>
        ${items.map(item => `
          <div class="hawk-search-item" onclick="window.open('${item.url}', '_blank')">
            <div class="hawk-search-item-title">${item.title}</div>
            <div class="hawk-search-item-meta">${item.meta}</div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  // Helper Methods
  getTrackerIcon(trackerId) {
    const tracker = this.trackers.find(t => t.id === trackerId);
    return tracker ? tracker.icon : '📱';
  }

  getTrackerName(trackerId) {
    const tracker = this.trackers.find(t => t.id === trackerId);
    return tracker ? tracker.name : 'Unknown Tracker';
  }

  formatActivityTitle(activity) {
    const actions = {
      create: 'Added new item',
      update: 'Updated item',
      delete: 'Removed item'
    };
    return actions[activity.operation] || activity.operation;
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  }

  getDaysActive() {
    const profile = this.userProfile.profile;
    const joinDate = new Date(profile.stats.joinDate);
    const now = new Date();
    return Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
  }

  getLastUsed(trackerId) {
    const lastUpdated = localStorage.getItem(`${trackerId}_last_updated`);
    if (lastUpdated) {
      return `Last used ${this.formatTimeAgo(parseInt(lastUpdated))}`;
    }
    return 'Never used';
  }

  itemMatchesQuery(item, query) {
    if (typeof item === 'string') {
      return item.toLowerCase().includes(query);
    }
    
    if (typeof item === 'object' && item !== null) {
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false;
      });
    }
    
    return false;
  }

  getItemTitle(item, trackerId) {
    if (typeof item === 'string') return item;
    
    // Tracker-specific title extraction
    switch (trackerId) {
      case 'hawkbology':
        return item.home && item.away ? `${item.home} vs ${item.away}` : 'Football Match';
      case 'tubology':
        return item.name || item.station || 'Station';
      case '92-tracker':
        return item.team || item.name || 'Ground';
      case 'brewery-tracker':
        return item.name || 'Brewery';
      default:
        return item.name || item.title || Object.keys(item)[0] || 'Item';
    }
  }

  getItemMeta(item, trackerId) {
    if (typeof item === 'string') return '';
    
    // Tracker-specific meta extraction
    switch (trackerId) {
      case 'hawkbology':
        return item.date ? `${item.stadium} • ${item.date}` : item.stadium || '';
      case 'tubology':
        return item.line || '';
      case '92-tracker':
        return item.location || item.league || '';
      case 'brewery-tracker':
        return item.area || item.location || '';
      default:
        return '';
    }
  }

  // Stats Methods for each tracker
  getHawkbologyStats() {
    const data = localStorage.getItem('hawkbology');
    if (!data) return null;
    
    try {
      const matches = JSON.parse(data);
      const grounds = new Set(matches.map(m => m.stadium)).size;
      return {
        'Matches': matches.length,
        'Grounds': grounds,
        'This Year': matches.filter(m => m.date && m.date.startsWith('2026')).length
      };
    } catch (e) {
      return null;
    }
  }

  getTubologyStats() {
    const data = localStorage.getItem('tubology_stations');
    if (!data) return null;
    
    try {
      const stations = JSON.parse(data);
      const visited = stations.filter(s => s.visited).length;
      return {
        'Visited': visited,
        'Remaining': stations.length - visited,
        'Progress': `${Math.round((visited / stations.length) * 100)}%`
      };
    } catch (e) {
      return null;
    }
  }

  get92TrackerStats() {
    const data = localStorage.getItem('92-tracker');
    if (!data) return null;
    
    try {
      const grounds = JSON.parse(data);
      const visited = grounds.filter(g => g.visited).length;
      return {
        'Visited': visited,
        'Remaining': 92 - visited,
        'Progress': `${Math.round((visited / 92) * 100)}%`
      };
    } catch (e) {
      return null;
    }
  }

  getBreweryTrackerStats() {
    const data = localStorage.getItem('brewery-tracker');
    if (!data) return null;
    
    try {
      const breweries = JSON.parse(data);
      const visited = breweries.filter(b => b.visited).length;
      return {
        'Visited': visited,
        'Remaining': breweries.length - visited,
        'Average Rating': this.calculateAverageRating(breweries)
      };
    } catch (e) {
      return null;
    }
  }

  getBettingTrackerStats() {
    const data = localStorage.getItem('betting-tracker');
    if (!data) return null;
    
    try {
      const bets = JSON.parse(data);
      const profit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
      return {
        'Total Bets': bets.length,
        'P&L': `£${profit.toFixed(2)}`,
        'Win Rate': `${Math.round((bets.filter(b => b.result === 'win').length / bets.length) * 100)}%`
      };
    } catch (e) {
      return null;
    }
  }

  getFootballTravelsStats() {
    const data = localStorage.getItem('hawk-football-travels');
    if (!data) return null;
    
    try {
      const travels = JSON.parse(data);
      const avgScore = travels.reduce((sum, t) => sum + (t.totalScore || 0), 0) / travels.length;
      return {
        'Stadiums': travels.length,
        'Average Score': `${avgScore.toFixed(1)}/100`,
        'Countries': new Set(travels.map(t => t.country)).size
      };
    } catch (e) {
      return null;
    }
  }

  getIveBeenThereStats() {
    const data = localStorage.getItem('ive-been-there');
    if (!data) return null;
    
    try {
      const places = JSON.parse(data);
      const visited = Object.values(places).filter(p => p.visited).length;
      return {
        'Places Visited': visited,
        'Countries': places.countries ? Object.values(places.countries).filter(c => c.visited).length : 0,
        'Progress': `${Math.round((visited / Object.keys(places).length) * 100)}%`
      };
    } catch (e) {
      return null;
    }
  }

  getJoindStats() {
    const data = localStorage.getItem('joind');
    if (!data) return null;
    
    try {
      const progress = JSON.parse(data);
      return {
        'Lessons Completed': progress.completedLessons || 0,
        'Current Streak': progress.streak || 0,
        'Total XP': progress.totalXP || 0
      };
    } catch (e) {
      return null;
    }
  }

  getKnowYourTeamStats() {
    const data = localStorage.getItem('know-your-team');
    if (!data) return null;
    
    try {
      const stats = JSON.parse(data);
      return {
        'Quiz Score': `${stats.correctAnswers || 0}/${stats.totalQuestions || 0}`,
        'Accuracy': `${Math.round(((stats.correctAnswers || 0) / (stats.totalQuestions || 1)) * 100)}%`,
        'Streak': stats.streak || 0
      };
    } catch (e) {
      return null;
    }
  }

  getAvantStats() {
    const data = localStorage.getItem('avant');
    if (!data) return null;
    
    try {
      const shows = JSON.parse(data);
      const watching = shows.filter(s => s.status === 'watching').length;
      const finished = shows.filter(s => s.status === 'finished').length;
      return {
        'Currently Watching': watching,
        'Finished': finished,
        'Total Shows': shows.length
      };
    } catch (e) {
      return null;
    }
  }

  getGreyhoundTrackerStats() {
    const data = localStorage.getItem('greyhound-tracker');
    if (!data) return null;
    
    try {
      const bets = JSON.parse(data);
      const nev = bets.reduce((sum, bet) => sum + (bet.nev || 0), 0);
      return {
        'Total Bets': bets.length,
        'NEV': `£${nev.toFixed(2)}`,
        'Win Rate': `${Math.round((bets.filter(b => b.result === 'win').length / bets.length) * 100)}%`
      };
    } catch (e) {
      return null;
    }
  }

  // Action Methods
  openUnifiedSearch() {
    document.getElementById('unified-search').classList.add('active');
    document.getElementById('search-input').focus();
  }

  closeUnifiedSearch() {
    document.getElementById('unified-search').classList.remove('active');
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
  }

  showAnalytics() {
    HawkServices.notifications.addNotification('info', 'Analytics', 'Advanced analytics coming soon!');
  }

  showGoals() {
    HawkServices.notifications.addNotification('info', 'Goals', 'Goal setting feature coming soon!');
  }

  quickAdd() {
    HawkServices.notifications.addNotification('info', 'Quick Add', 'Quick entry feature coming soon!');
  }

  exportAllData() {
    const allData = {};
    this.trackers.forEach(tracker => {
      const data = localStorage.getItem(tracker.id);
      if (data) {
        allData[tracker.id] = JSON.parse(data);
      }
    });

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hawk-trackers-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    HawkServices.notifications.addNotification('success', 'Export Complete', 'All tracker data has been exported');
  }

  showSettings() {
    HawkServices.notifications.addNotification('info', 'Settings', 'Settings panel coming soon!');
  }

  handleRecommendation(type, action) {
    HawkServices.notifications.addNotification('info', 'Recommendation', `${action} feature coming soon!`);
  }

  handleCrossAppUpdate(change) {
    // Refresh relevant sections when data changes
    this.refreshData();
  }

  refreshData() {
    this.renderOverviewStats();
    this.renderActivityFeed();
    this.renderTrackersGrid();
    this.renderRecommendations();
  }

  calculateAverageRating(items) {
    const rated = items.filter(item => item.rating);
    if (rated.length === 0) return 'N/A';
    const avg = rated.reduce((sum, item) => sum + item.rating, 0) / rated.length;
    return avg.toFixed(1);
  }
}

// Initialize Hawk Central
let hawkCentral;
document.addEventListener('DOMContentLoaded', () => {
  hawkCentral = new HawkCentral();
});
// Phase 2: ML Insights Function
function showMLInsights() {
  const insights = [];
  
  if (window.MLEngine) {
    const mlEngine = new MLEngine();
    
    // Get seasonal insights
    try {
      const seasonalInsights = mlEngine.models.seasonalAnalysis.getSeasonalInsights();
      insights.push(`Peak activity month: ${seasonalInsights.peakMonth}`);
      insights.push(`Activity trend: ${seasonalInsights.trend}`);
    } catch (e) {
      insights.push('Seasonal analysis: Training...');
    }
    
    // Get correlation insights
    try {
      const correlations = mlEngine.models.correlationDetection.getStrongCorrelations();
      if (correlations.length > 0) {
        insights.push(`Found ${correlations.length} activity correlations`);
        correlations.slice(0, 2).forEach(corr => {
          insights.push(`• ${corr.description}`);
        });
      }
    } catch (e) {
      insights.push('Correlation analysis: Training...');
    }
  }
  
  if (insights.length === 0) {
    insights.push('ML models are training...');
    insights.push('Check back in a few minutes for insights');
  }
  
  alert('🧠 ML Insights:\n\n' + insights.join('\n'));
}