// ─── Shared Services for All Hawk Trackers ───────────────────────────────────
// Central service layer providing common functionality across all tracker apps

class UserProfileService {
  constructor() {
    this.profile = this.loadProfile();
  }

  loadProfile() {
    const saved = localStorage.getItem('hawk_user_profile');
    return saved ? JSON.parse(saved) : {
      id: this.generateUserId(),
      name: '',
      email: '',
      preferences: {
        theme: 'auto',
        notifications: true,
        dataSync: true,
        shareData: false
      },
      stats: {
        totalTrackers: 0,
        totalItems: 0,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      achievements: []
    };
  }

  saveProfile() {
    localStorage.setItem('hawk_user_profile', JSON.stringify(this.profile));
    this.profile.stats.lastActive = new Date().toISOString();
  }

  generateUserId() {
    return 'hawk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  updateStats(trackerName, itemCount) {
    this.profile.stats.totalTrackers = this.getActiveTrackers().length;
    this.profile.stats.totalItems += itemCount;
    this.saveProfile();
  }

  getActiveTrackers() {
    const trackers = [];
    const trackerKeys = [
      'hawkbology', 'tubology', '92-tracker', 'hawk-football-travels',
      'ive-been-there', 'joind', 'know-your-team', 'betting-tracker',
      'brewery-tracker', 'avant', 'greyhound-tracker'
    ];
    
    trackerKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        trackers.push(key);
      }
    });
    
    return trackers;
  }
}

class NotificationService {
  constructor() {
    this.notifications = this.loadNotifications();
  }

  loadNotifications() {
    const saved = localStorage.getItem('hawk_notifications');
    return saved ? JSON.parse(saved) : [];
  }

  saveNotifications() {
    localStorage.setItem('hawk_notifications', JSON.stringify(this.notifications));
  }

  addNotification(type, title, message, data = {}) {
    const notification = {
      id: Date.now().toString(),
      type, // 'achievement', 'recommendation', 'update', 'social'
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    this.notifications.unshift(notification);
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    this.saveNotifications();
    this.showToast(title, message);
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  showToast(title, message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'hawk-toast';
    toast.innerHTML = `
      <div class="hawk-toast-content">
        <strong>${title}</strong>
        <p>${message}</p>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 4000);
  }
}

class AnalyticsService {
  constructor() {
    this.events = this.loadEvents();
  }

  loadEvents() {
    const saved = localStorage.getItem('hawk_analytics');
    return saved ? JSON.parse(saved) : [];
  }

  saveEvents() {
    localStorage.setItem('hawk_analytics', JSON.stringify(this.events));
  }

  trackEvent(category, action, label = '', value = 0, trackerName = '') {
    const event = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      category,
      action,
      label,
      value,
      trackerName,
      sessionId: this.getSessionId()
    };
    
    this.events.push(event);
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    this.saveEvents();
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('hawk_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now();
      sessionStorage.setItem('hawk_session_id', sessionId);
    }
    return sessionId;
  }

  getActivitySummary(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEvents = this.events.filter(e => 
      new Date(e.timestamp) > cutoffDate
    );
    
    const summary = {
      totalEvents: recentEvents.length,
      trackerActivity: {},
      topActions: {},
      dailyActivity: {}
    };
    
    recentEvents.forEach(event => {
      // Tracker activity
      if (!summary.trackerActivity[event.trackerName]) {
        summary.trackerActivity[event.trackerName] = 0;
      }
      summary.trackerActivity[event.trackerName]++;
      
      // Top actions
      if (!summary.topActions[event.action]) {
        summary.topActions[event.action] = 0;
      }
      summary.topActions[event.action]++;
      
      // Daily activity
      const day = event.timestamp.split('T')[0];
      if (!summary.dailyActivity[day]) {
        summary.dailyActivity[day] = 0;
      }
      summary.dailyActivity[day]++;
    });
    
    return summary;
  }
}

class CrossAppSyncService {
  constructor() {
    this.syncQueue = [];
    this.lastSync = localStorage.getItem('hawk_last_sync') || new Date(0).toISOString();
  }

  queueSync(trackerName, operation, data) {
    this.syncQueue.push({
      id: Date.now().toString(),
      trackerName,
      operation, // 'create', 'update', 'delete'
      data,
      timestamp: new Date().toISOString()
    });
    
    this.processSyncQueue();
  }

  processSyncQueue() {
    if (this.syncQueue.length === 0) return;
    
    // Process sync operations
    this.syncQueue.forEach(item => {
      this.broadcastChange(item);
    });
    
    this.syncQueue = [];
    this.lastSync = new Date().toISOString();
    localStorage.setItem('hawk_last_sync', this.lastSync);
  }

  broadcastChange(change) {
    // Broadcast to other open tracker tabs
    const event = new CustomEvent('hawkSyncUpdate', {
      detail: change
    });
    window.dispatchEvent(event);
    
    // Store in cross-app activity feed
    this.addToActivityFeed(change);
  }

  addToActivityFeed(change) {
    const feed = this.getActivityFeed();
    feed.unshift(change);
    
    // Keep only last 50 activities
    if (feed.length > 50) {
      feed.splice(50);
    }
    
    localStorage.setItem('hawk_activity_feed', JSON.stringify(feed));
  }

  getActivityFeed() {
    const saved = localStorage.getItem('hawk_activity_feed');
    return saved ? JSON.parse(saved) : [];
  }

  getRecentActivity(limit = 10) {
    return this.getActivityFeed().slice(0, limit);
  }
}

class RecommendationService {
  constructor() {
    this.userProfile = new UserProfileService();
    this.analytics = new AnalyticsService();
  }

  generateRecommendations() {
    const recommendations = [];
    const trackers = this.userProfile.getActiveTrackers();
    
    // Cross-app recommendations
    if (trackers.includes('hawkbology') && trackers.includes('92-tracker')) {
      recommendations.push(...this.getFootballCrossRecommendations());
    }
    
    if (trackers.includes('brewery-tracker') && trackers.includes('hawkbology')) {
      recommendations.push(...this.getBreweryFootballRecommendations());
    }
    
    if (trackers.includes('tubology') && trackers.includes('ive-been-there')) {
      recommendations.push(...this.getLocationRecommendations());
    }
    
    return recommendations.slice(0, 5); // Return top 5
  }

  getFootballCrossRecommendations() {
    // Logic to find football grounds near stadiums visited
    return [{
      type: 'cross-app',
      title: 'Complete Your Football Journey',
      message: 'You\'ve visited stadiums near these 92 Club grounds',
      action: 'View Nearby Grounds',
      data: { trackers: ['hawkbology', '92-tracker'] }
    }];
  }

  getBreweryFootballRecommendations() {
    return [{
      type: 'cross-app',
      title: 'Pre-Match Brewery Visit',
      message: 'Great breweries near your upcoming matches',
      action: 'Plan Brewery Route',
      data: { trackers: ['brewery-tracker', 'hawkbology'] }
    }];
  }

  getLocationRecommendations() {
    return [{
      type: 'cross-app',
      title: 'Underground Adventures',
      message: 'Explore tube stations in areas you\'ve visited',
      action: 'Discover Stations',
      data: { trackers: ['tubology', 'ive-been-there'] }
    }];
  }
}

// Global Services Instance
const HawkServices = {
  userProfile: new UserProfileService(),
  notifications: new NotificationService(),
  analytics: new AnalyticsService(),
  sync: new CrossAppSyncService(),
  recommendations: new RecommendationService()
};

// Export for use in tracker apps
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HawkServices;
} else {
  window.HawkServices = HawkServices;
}