// ─── Smart Notification System ───────────────────────────────────────────────
// AI-powered intelligent notifications with context awareness

class SmartNotificationSystem {
  constructor() {
    this.mlEngine = new MLEngine();
    this.notificationQueue = [];
    this.userPreferences = this.loadPreferences();
    this.contextAnalyzer = new ContextAnalyzer();
    this.deliveryOptimizer = new NotificationDeliveryOptimizer();
    
    this.init();
  }

  init() {
    this.setupContextMonitoring();
    this.setupPeriodicAnalysis();
    this.setupLocationTracking();
    this.requestNotificationPermission();
  }

  async generateSmartNotifications() {
    const context = await this.contextAnalyzer.getCurrentContext();
    const predictions = await this.mlEngine.trainAllModels();
    
    const notifications = [
      ...this.generateActivityReminders(context),
      ...this.generateOpportunityAlerts(context),
      ...this.generateProgressMilestones(context),
      ...this.generateLocationBasedNotifications(context),
      ...this.generateTimeBasedRecommendations(context),
      ...this.generateAnomalyAlerts(context),
      ...this.generateCrossAppSuggestions(context)
    ];

    // Filter and prioritize notifications
    const prioritized = this.prioritizeNotifications(notifications, context);
    
    // Optimize delivery timing
    const optimized = this.deliveryOptimizer.optimizeDelivery(prioritized, context);
    
    return optimized;
  }

  generateActivityReminders(context) {
    const reminders = [];
    const lastActivity = this.getLastActivityDate();
    const daysSinceActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivity >= 7) {
      reminders.push({
        type: 'activity_reminder',
        priority: 'medium',
        title: 'Time to Track! 📱',
        message: `It's been ${daysSinceActivity} days since your last activity`,
        action: 'open_hawk_central',
        triggerConditions: ['user_active', 'weekend'],
        category: 'engagement'
      });
    }

    // Specific tracker reminders based on patterns
    const trackerActivity = this.analyzeTrackerActivity();
    Object.entries(trackerActivity).forEach(([tracker, info]) => {
      if (info.daysSinceLastUse >= 14 && info.averageWeeklyUse > 2) {
        reminders.push({
          type: 'tracker_specific_reminder',
          priority: 'low',
          title: `Miss ${this.getTrackerDisplayName(tracker)}? 🎯`,
          message: `You used to check ${tracker} regularly. Ready to get back?`,
          action: `open_${tracker}`,
          triggerConditions: ['user_active'],
          category: 'retention'
        });
      }
    });

    return reminders;
  }

  generateOpportunityAlerts(context) {
    const opportunities = [];
    
    // Location-based opportunities
    if (context.location) {
      opportunities.push(...this.findLocationOpportunities(context.location));
    }

    // Weather-based opportunities
    if (context.weather) {
      opportunities.push(...this.findWeatherOpportunities(context.weather));
    }

    // Time-based opportunities
    opportunities.push(...this.findTimeOpportunities(context.time));

    // Event-based opportunities
    opportunities.push(...this.findEventOpportunities(context));

    return opportunities;
  }

  generateProgressMilestones(context) {
    const milestones = [];
    
    // Check each tracker for milestone proximity
    const trackers = ['92-tracker', 'tubology', 'brewery-tracker', 'hawkbology'];
    
    trackers.forEach(trackerId => {
      const progress = this.calculateProgress(trackerId);
      if (progress) {
        // Milestone notifications for significant progress points
        const milestonePoints = [10, 25, 50, 75, 90, 95, 99];
        
        milestonePoints.forEach(point => {
          if (Math.abs(progress.percentage - point) <= 2) {
            milestones.push({
              type: 'milestone_approaching',
              priority: point >= 90 ? 'high' : 'medium',
              title: `🎯 ${point}% Milestone Approaching!`,
              message: `You're ${progress.remaining} away from ${point}% in ${this.getTrackerDisplayName(trackerId)}`,
              action: `open_${trackerId}`,
              triggerConditions: ['user_active'],
              category: 'achievement',
              metadata: { tracker: trackerId, milestone: point }
            });
          }
        });

        // Completion notifications
        if (progress.percentage >= 100) {
          milestones.push({
            type: 'completion_celebration',
            priority: 'high',
            title: `🎉 ${this.getTrackerDisplayName(trackerId)} Complete!`,
            message: 'Incredible achievement! Time to celebrate and share your success.',
            action: 'open_achievements',
            triggerConditions: ['immediate'],
            category: 'celebration'
          });
        }
      }
    });

    return milestones;
  }

  generateLocationBasedNotifications(context) {
    const locationNotifications = [];
    
    if (!context.location) return locationNotifications;

    // Stadium proximity notifications
    const nearbyStadiums = this.findNearbyStadiums(context.location);
    nearbyStadiums.forEach(stadium => {
      if (!this.hasVisited(stadium, 'hawkbology')) {
        locationNotifications.push({
          type: 'location_opportunity',
          priority: 'medium',
          title: `🏟️ Stadium Nearby!`,
          message: `${stadium.name} is close to your location. Perfect for your collection!`,
          action: 'view_stadium_details',
          triggerConditions: ['location_stable'],
          category: 'discovery',
          metadata: { stadium }
        });
      }
    });

    // Tube station opportunities
    const nearbyStations = this.findNearbyTubeStations(context.location);
    const unvisitedNearby = nearbyStations.filter(station => !this.hasVisited(station, 'tubology'));
    
    if (unvisitedNearby.length > 0) {
      locationNotifications.push({
        type: 'tube_opportunity',
        priority: 'low',
        title: `🚇 ${unvisitedNearby.length} Unvisited Stations Nearby`,
        message: 'Perfect opportunity to add to your tube collection!',
        action: 'view_nearby_stations',
        triggerConditions: ['in_london', 'user_active'],
        category: 'discovery'
      });
    }

    // Brewery suggestions
    const nearbyBreweries = this.findNearbyBreweries(context.location);
    if (nearbyBreweries.length > 0 && context.time.hour >= 17) {
      locationNotifications.push({
        type: 'brewery_suggestion',
        priority: 'low',
        title: `🍺 Local Brewery Discovered`,
        message: `${nearbyBreweries[0].name} is nearby. Perfect for an evening visit!`,
        action: 'view_brewery_details',
        triggerConditions: ['evening', 'weekend'],
        category: 'social'
      });
    }

    return locationNotifications;
  }

  generateTimeBasedRecommendations(context) {
    const timeRecommendations = [];
    
    // Weekend planning
    if (context.time.dayOfWeek === 5 && context.time.hour >= 15) { // Friday afternoon
      const weekendSuggestions = this.generateWeekendSuggestions();
      if (weekendSuggestions.length > 0) {
        timeRecommendations.push({
          type: 'weekend_planning',
          priority: 'medium',
          title: '🎉 Weekend Plans Ready!',
          message: `${weekendSuggestions.length} opportunities await this weekend`,
          action: 'view_weekend_suggestions',
          triggerConditions: ['friday_afternoon'],
          category: 'planning',
          metadata: { suggestions: weekendSuggestions }
        });
      }
    }

    // Lunch break opportunities
    if (context.time.hour >= 12 && context.time.hour <= 14 && context.time.dayOfWeek < 5) {
      const lunchOpportunities = this.findLunchBreakActivities(context.location);
      if (lunchOpportunities.length > 0) {
        timeRecommendations.push({
          type: 'lunch_opportunity',
          priority: 'low',
          title: '🍽️ Lunch Break Adventure?',
          message: 'Quick tube station or nearby discovery opportunity!',
          action: 'view_lunch_activities',
          triggerConditions: ['weekday_lunch'],
          category: 'micro_adventure'
        });
      }
    }

    // Evening wind-down
    if (context.time.hour >= 19 && context.time.hour <= 21) {
      timeRecommendations.push({
        type: 'evening_reflection',
        priority: 'low',
        title: '🌅 Reflect on Your Journey',
        message: 'Perfect time to review your progress and plan tomorrow',
        action: 'open_analytics',
        triggerConditions: ['evening', 'user_active'],
        category: 'reflection'
      });
    }

    return timeRecommendations;
  }

  generateAnomalyAlerts(context) {
    const anomalies = [];
    
    // Detect unusual activity patterns
    const recentBehavior = this.analyzeRecentBehavior();
    const detectedAnomalies = this.mlEngine.models.anomalyDetection.detectAnomalies(recentBehavior);
    
    detectedAnomalies.forEach(anomaly => {
      if (anomaly.severity === 'high') {
        anomalies.push({
          type: 'behavior_anomaly',
          priority: 'low',
          title: '📊 Activity Pattern Changed',
          message: anomaly.description,
          action: 'view_analytics',
          triggerConditions: ['user_request_only'],
          category: 'insight'
        });
      }
    });

    // Detect streak breaks
    const currentStreaks = this.calculateActiveStreaks();
    Object.entries(currentStreaks).forEach(([tracker, streak]) => {
      if (streak.risk === 'high' && streak.days >= 7) {
        anomalies.push({
          type: 'streak_risk',
          priority: 'medium',
          title: `⚡ ${streak.days}-day streak at risk!`,
          message: `Your ${this.getTrackerDisplayName(tracker)} streak needs attention`,
          action: `open_${tracker}`,
          triggerConditions: ['user_active'],
          category: 'motivation'
        });
      }
    });

    return anomalies;
  }

  generateCrossAppSuggestions(context) {
    const suggestions = [];
    
    // Find synergy opportunities
    const correlations = this.mlEngine.models.correlationDetection.getStrongCorrelations();
    
    correlations.forEach(correlation => {
      const suggestion = this.createCrossAppSuggestion(correlation, context);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });

    // Activity clustering suggestions
    const clusters = this.findActivityClusters(context.location);
    if (clusters.length > 0) {
      suggestions.push({
        type: 'activity_cluster',
        priority: 'medium',
        title: '🎯 Multi-Activity Opportunity',
        message: `${clusters.length} different tracking opportunities in one area!`,
        action: 'view_activity_cluster',
        triggerConditions: ['location_stable'],
        category: 'efficiency',
        metadata: { clusters }
      });
    }

    return suggestions;
  }

  // Context Analysis and Optimization Methods
  prioritizeNotifications(notifications, context) {
    return notifications
      .filter(n => this.shouldDeliverNotification(n, context))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5); // Limit to 5 notifications at a time
  }

  shouldDeliverNotification(notification, context) {
    // Check user preferences
    if (!this.userPreferences.categories[notification.category]) {
      return false;
    }

    // Check trigger conditions
    return notification.triggerConditions.some(condition => {
      return this.evaluateCondition(condition, context);
    });
  }

  evaluateCondition(condition, context) {
    switch (condition) {
      case 'user_active':
        return context.userState === 'active';
      case 'weekend':
        return context.time.dayOfWeek >= 5;
      case 'weekday_lunch':
        return context.time.dayOfWeek < 5 && context.time.hour >= 12 && context.time.hour <= 14;
      case 'evening':
        return context.time.hour >= 18;
      case 'friday_afternoon':
        return context.time.dayOfWeek === 5 && context.time.hour >= 15;
      case 'in_london':
        return context.location && context.location.city === 'London';
      case 'location_stable':
        return context.location && context.location.stability > 0.8;
      case 'immediate':
        return true;
      case 'user_request_only':
        return false; // Only show when explicitly requested
      default:
        return false;
    }
  }

  // Delivery and Scheduling
  async scheduleNotification(notification, deliveryTime) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Use service worker for scheduled notifications
      const registration = await navigator.serviceWorker.ready;
      
      if (deliveryTime <= Date.now()) {
        // Immediate notification
        this.showNotification(notification);
      } else {
        // Schedule for future delivery
        registration.showNotification(notification.title, {
          body: notification.message,
          icon: this.getNotificationIcon(notification.type),
          badge: '/shared/badge-icon.png',
          tag: notification.type,
          data: notification,
          timestamp: deliveryTime,
          requireInteraction: notification.priority === 'high'
        });
      }
    } else {
      // Fallback to in-app notifications
      this.showInAppNotification(notification);
    }
  }

  showNotification(notification) {
    // Use the existing HawkServices notification system
    HawkServices.notifications.addNotification(
      notification.type,
      notification.title,
      notification.message,
      notification.metadata || {}
    );
  }

  showInAppNotification(notification) {
    this.showNotification(notification);
  }

  getNotificationIcon(type) {
    const icons = {
      'activity_reminder': '📱',
      'milestone_approaching': '🎯',
      'location_opportunity': '📍',
      'completion_celebration': '🎉',
      'weekend_planning': '🎉',
      'streak_risk': '⚡'
    };
    return icons[type] || '🦅';
  }

  // Setup and Configuration Methods
  setupContextMonitoring() {
    // Monitor user activity
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.contextAnalyzer.updateContext({ userState: 'active' });
        this.processQueue();
      }
    });

    // Monitor page navigation
    window.addEventListener('beforeunload', () => {
      this.contextAnalyzer.updateContext({ userState: 'leaving' });
    });
  }

  setupPeriodicAnalysis() {
    // Run analysis every hour
    setInterval(() => {
      this.runPeriodicAnalysis();
    }, 60 * 60 * 1000);

    // Initial analysis
    setTimeout(() => {
      this.runPeriodicAnalysis();
    }, 5000);
  }

  async runPeriodicAnalysis() {
    try {
      const notifications = await this.generateSmartNotifications();
      notifications.forEach(notification => {
        this.queueNotification(notification);
      });
      this.processQueue();
    } catch (error) {
      console.error('Error in periodic analysis:', error);
    }
  }

  queueNotification(notification) {
    this.notificationQueue.push({
      ...notification,
      queuedAt: Date.now(),
      id: this.generateNotificationId()
    });
  }

  async processQueue() {
    const context = await this.contextAnalyzer.getCurrentContext();
    const readyNotifications = this.notificationQueue.filter(n => 
      this.shouldDeliverNotification(n, context)
    );

    for (const notification of readyNotifications) {
      await this.scheduleNotification(notification, Date.now());
      
      // Remove from queue
      const index = this.notificationQueue.indexOf(notification);
      if (index > -1) {
        this.notificationQueue.splice(index, 1);
      }
    }
  }

  setupLocationTracking() {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          this.contextAnalyzer.updateLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
      );
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.userPreferences.notificationPermission = permission;
      this.savePreferences();
    }
  }

  // Helper Methods
  getLastActivityDate() {
    const events = HawkServices.analytics.events;
    if (events.length === 0) return Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const latest = events.reduce((latest, event) => {
      const eventDate = new Date(event.timestamp);
      return eventDate > latest ? eventDate : latest;
    }, new Date(0));

    return latest.getTime();
  }

  analyzeTrackerActivity() {
    const events = HawkServices.analytics.events;
    const trackers = {};

    events.forEach(event => {
      if (!trackers[event.trackerName]) {
        trackers[event.trackerName] = {
          lastUse: new Date(event.timestamp),
          totalUses: 0,
          weeklyUses: []
        };
      }
      
      trackers[event.trackerName].totalUses++;
      const eventDate = new Date(event.timestamp);
      if (eventDate > trackers[event.trackerName].lastUse) {
        trackers[event.trackerName].lastUse = eventDate;
      }
    });

    // Calculate days since last use and weekly averages
    Object.keys(trackers).forEach(tracker => {
      const daysSince = Math.floor((Date.now() - trackers[tracker].lastUse) / (1000 * 60 * 60 * 24));
      trackers[tracker].daysSinceLastUse = daysSince;
      trackers[tracker].averageWeeklyUse = trackers[tracker].totalUses / Math.max(1, daysSince / 7);
    });

    return trackers;
  }

  calculateProgress(trackerId) {
    const data = localStorage.getItem(trackerId);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      let completed = 0;
      let total = 0;

      if (trackerId === '92-tracker') {
        total = 92;
        completed = parsed.filter(g => g.visited).length;
      } else if (trackerId === 'tubology') {
        const stations = localStorage.getItem('tubology_stations');
        if (stations) {
          const stationData = JSON.parse(stations);
          total = stationData.length;
          completed = stationData.filter(s => s.visited).length;
        }
      } else if (Array.isArray(parsed)) {
        total = parsed.length;
        completed = parsed.filter(item => item.visited || item.completed).length;
      }

      if (total === 0) return null;

      return {
        completed,
        total,
        remaining: total - completed,
        percentage: Math.round((completed / total) * 100)
      };
    } catch (e) {
      return null;
    }
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

  loadPreferences() {
    const saved = localStorage.getItem('hawk_notification_preferences');
    return saved ? JSON.parse(saved) : {
      notificationPermission: 'default',
      categories: {
        engagement: true,
        achievement: true,
        discovery: true,
        planning: true,
        social: false,
        insight: true,
        motivation: true,
        celebration: true,
        retention: false,
        efficiency: true,
        micro_adventure: true,
        reflection: false
      },
      frequency: 'normal', // 'minimal', 'normal', 'frequent'
      quietHours: {
        enabled: true,
        start: 22,
        end: 8
      }
    };
  }

  savePreferences() {
    localStorage.setItem('hawk_notification_preferences', JSON.stringify(this.userPreferences));
  }

  generateNotificationId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Placeholder methods for complex operations
  findNearbyStadiums(location) { return []; }
  findNearbyTubeStations(location) { return []; }
  findNearbyBreweries(location) { return []; }
  hasVisited(item, tracker) { return false; }
  generateWeekendSuggestions() { return []; }
  findLunchBreakActivities(location) { return []; }
  analyzeRecentBehavior() { return { consistency: [0.5], diversity: 0.7, intensity: [0.3] }; }
  calculateActiveStreaks() { return {}; }
  createCrossAppSuggestion(correlation, context) { return null; }
  findActivityClusters(location) { return []; }
}

// Context Analyzer Class
class ContextAnalyzer {
  constructor() {
    this.currentContext = {
      time: this.getTimeContext(),
      location: null,
      weather: null,
      userState: 'unknown',
      device: this.getDeviceContext()
    };
  }

  async getCurrentContext() {
    this.currentContext.time = this.getTimeContext();
    return { ...this.currentContext };
  }

  getTimeContext() {
    const now = new Date();
    return {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      month: now.getMonth(),
      isWeekend: now.getDay() >= 5,
      timeOfDay: this.getTimeOfDay(now.getHours())
    };
  }

  getTimeOfDay(hour) {
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  getDeviceContext() {
    return {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isOnline: navigator.onLine,
      hasNotificationSupport: 'Notification' in window
    };
  }

  updateContext(updates) {
    this.currentContext = { ...this.currentContext, ...updates };
  }

  updateLocation(locationData) {
    this.currentContext.location = {
      ...locationData,
      city: this.getCityFromCoordinates(locationData.latitude, locationData.longitude),
      stability: this.calculateLocationStability(locationData)
    };
  }

  getCityFromCoordinates(lat, lon) {
    // Simplified city detection - in production, use proper geocoding
    if (lat >= 51.4 && lat <= 51.7 && lon >= -0.5 && lon <= 0.2) {
      return 'London';
    }
    return 'Unknown';
  }

  calculateLocationStability(locationData) {
    // Simple stability calculation based on accuracy
    return Math.max(0, Math.min(1, (100 - locationData.accuracy) / 100));
  }
}

// Notification Delivery Optimizer Class
class NotificationDeliveryOptimizer {
  constructor() {
    this.deliveryHistory = this.loadDeliveryHistory();
  }

  optimizeDelivery(notifications, context) {
    return notifications.map(notification => {
      const optimalTime = this.calculateOptimalDeliveryTime(notification, context);
      return {
        ...notification,
        scheduledDelivery: optimalTime,
        deliveryOptimized: true
      };
    });
  }

  calculateOptimalDeliveryTime(notification, context) {
    const now = Date.now();
    
    // Immediate delivery for high priority
    if (notification.priority === 'high') {
      return now;
    }

    // Respect quiet hours
    const preferences = JSON.parse(localStorage.getItem('hawk_notification_preferences') || '{}');
    if (preferences.quietHours?.enabled) {
      const currentHour = new Date().getHours();
      if (currentHour >= preferences.quietHours.start || currentHour <= preferences.quietHours.end) {
        // Schedule for after quiet hours
        const tomorrow = new Date();
        tomorrow.setHours(preferences.quietHours.end + 1, 0, 0, 0);
        return tomorrow.getTime();
      }
    }

    // Optimize based on user activity patterns
    const optimalHour = this.findOptimalHour(notification.category);
    if (optimalHour !== null) {
      const nextOptimalTime = this.getNextOccurrenceOfHour(optimalHour);
      if (nextOptimalTime - now < 24 * 60 * 60 * 1000) { // Within 24 hours
        return nextOptimalTime;
      }
    }

    return now;
  }

  findOptimalHour(category) {
    // Category-specific optimal hours
    const categoryOptimalHours = {
      'planning': 9,      // Morning planning
      'discovery': 14,    // Afternoon exploration
      'social': 18,       // Evening social time
      'reflection': 20,   // Evening reflection
      'micro_adventure': 12, // Lunch time
      'achievement': 10   // Morning motivation
    };

    return categoryOptimalHours[category] || null;
  }

  getNextOccurrenceOfHour(hour) {
    const now = new Date();
    const target = new Date();
    target.setHours(hour, 0, 0, 0);
    
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    return target.getTime();
  }

  loadDeliveryHistory() {
    const saved = localStorage.getItem('hawk_notification_delivery_history');
    return saved ? JSON.parse(saved) : [];
  }

  saveDeliveryHistory() {
    localStorage.setItem('hawk_notification_delivery_history', JSON.stringify(this.deliveryHistory));
  }
}

// Export the Smart Notification System
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartNotificationSystem;
} else {
  window.SmartNotificationSystem = SmartNotificationSystem;
}