// ─── Hawk Analytics Dashboard ─────────────────────────────────────────────────
// Advanced cross-app analytics and AI-powered insights

class HawkAnalyticsDashboard {
  constructor() {
    this.aiEngine = new AIInsightsEngine();
    this.analytics = HawkServices.analytics;
    this.userProfile = HawkServices.userProfile;
    
    this.init();
  }

  init() {
    this.renderPredictions();
    this.renderActivityOverview();
    this.renderTrackerUsage();
    this.renderTemporalPatterns();
    this.renderCrossAppInsights();
    this.renderProgressAnalytics();
    this.renderLocationInsights();
    
    // Track analytics view
    this.analytics.trackEvent('analytics', 'view', 'dashboard');
  }

  renderPredictions() {
    const container = document.getElementById('predictions-grid');
    const insights = this.aiEngine.analyzeUserBehavior();
    const predictions = insights.progressPredictions;
    
    if (Object.keys(predictions).length === 0) {
      container.innerHTML = '<div style="text-align: center; opacity: 0.7;">Start tracking to see AI predictions</div>';
      return;
    }

    container.innerHTML = Object.entries(predictions).map(([tracker, prediction]) => `
      <div class="prediction-item">
        <div class="prediction-tracker">${this.formatTrackerName(tracker)}</div>
        <div class="prediction-details">
          Progress: ${prediction.current}/${prediction.total}<br>
          Estimated completion: ${prediction.estimatedCompletion}<br>
          Confidence: ${Math.round(prediction.confidence * 100)}%
        </div>
      </div>
    `).join('');
  }

  renderActivityOverview() {
    const summary = this.analytics.getActivitySummary(30);
    const metricsContainer = document.getElementById('activity-metrics');
    
    // Calculate trends
    const previousSummary = this.analytics.getActivitySummary(60);
    const currentWeekly = summary.totalEvents;
    const previousWeekly = previousSummary.totalEvents - currentWeekly;
    const trend = currentWeekly > previousWeekly ? 'up' : 'down';
    const trendPercent = previousWeekly > 0 ? Math.round(((currentWeekly - previousWeekly) / previousWeekly) * 100) : 0;

    const metrics = [
      {
        value: currentWeekly,
        label: 'Monthly Events',
        trend: trend,
        change: `${trendPercent > 0 ? '+' : ''}${trendPercent}%`
      },
      {
        value: Object.keys(summary.trackerActivity).length,
        label: 'Active Trackers',
        trend: null
      },
      {
        value: Math.round(currentWeekly / 30),
        label: 'Daily Average',
        trend: null
      },
      {
        value: this.calculateStreak(),
        label: 'Day Streak',
        trend: null
      }
    ];

    metricsContainer.innerHTML = metrics.map(metric => `
      <div class="metric-item">
        <div class="metric-value">${metric.value}</div>
        <div class="metric-label">
          ${metric.label}
          ${metric.trend ? `<span class="trend-indicator trend-${metric.trend}">${metric.change}</span>` : ''}
        </div>
      </div>
    `).join('');

    // Activity chart
    this.createActivityChart(summary.dailyActivity);
  }

  renderTrackerUsage() {
    const summary = this.analytics.getActivitySummary(30);
    const usageData = summary.trackerActivity;
    
    // Usage chart
    this.createUsageChart(usageData);
    
    // Usage insights
    const insightsContainer = document.getElementById('usage-insights');
    const sortedUsage = Object.entries(usageData).sort((a, b) => b[1] - a[1]);
    
    const insights = [
      `Most used: ${this.formatTrackerName(sortedUsage[0]?.[0] || 'None')} (${sortedUsage[0]?.[1] || 0} events)`,
      `Total trackers used: ${Object.keys(usageData).length}`,
      `Average events per tracker: ${Math.round(Object.values(usageData).reduce((a, b) => a + b, 0) / Object.keys(usageData).length) || 0}`,
      sortedUsage.length > 1 ? `Usage ratio: ${Math.round((sortedUsage[0][1] / sortedUsage[1][1]) * 100)}% more than 2nd` : 'Single tracker focus'
    ];

    insightsContainer.innerHTML = insights.map(insight => `
      <li class="insight-item">${insight}</li>
    `).join('');
  }

  renderTemporalPatterns() {
    const events = this.analytics.events.slice(-1000); // Last 1000 events
    const hourlyData = this.analyzeHourlyPatterns(events);
    
    // Temporal chart
    this.createTemporalChart(hourlyData);
    
    // Temporal insights
    const insights = this.aiEngine.analyzeUserBehavior();
    const dayPrefs = insights.preferredDays;
    const seasonal = insights.seasonalPatterns;
    
    const insightsContainer = document.getElementById('temporal-insights');
    const temporalInsights = [
      dayPrefs.mostActive ? `Most active day: ${dayPrefs.mostActive}` : 'No clear day preference',
      dayPrefs.analysis || 'Building activity patterns...',
      seasonal ? `Peak season: ${seasonal.pattern}` : 'Analyzing seasonal patterns...',
      this.findPeakHour(hourlyData)
    ];

    insightsContainer.innerHTML = temporalInsights.map(insight => `
      <li class="insight-item">${insight}</li>
    `).join('');
  }

  renderCrossAppInsights() {
    const insights = this.aiEngine.analyzeUserBehavior();
    const correlations = insights.crossAppCorrelations;
    
    // Correlation metrics
    const metricsContainer = document.getElementById('correlation-metrics');
    const strongCorrelations = Object.keys(correlations.strongCorrelations || {}).length;
    
    const metrics = [
      { value: strongCorrelations, label: 'Strong Correlations' },
      { value: correlations.recommendations?.length || 0, label: 'Cross-App Opportunities' },
      { value: this.calculateSynergyScore(correlations), label: 'Synergy Score' }
    ];

    metricsContainer.innerHTML = metrics.map(metric => `
      <div class="metric-item">
        <div class="metric-value">${metric.value}</div>
        <div class="metric-label">${metric.label}</div>
      </div>
    `).join('');

    // Correlation insights
    const insightsContainer = document.getElementById('correlation-insights');
    const correlationInsights = correlations.insights || [];
    
    insightsContainer.innerHTML = correlationInsights.slice(0, 5).map(insight => `
      <li class="insight-item">${insight}</li>
    `).join('');
  }

  renderProgressAnalytics() {
    const progressData = this.getProgressData();
    
    // Progress chart
    this.createProgressChart(progressData);
    
    // Progress insights
    const insightsContainer = document.getElementById('progress-insights');
    const insights = this.generateProgressInsights(progressData);
    
    insightsContainer.innerHTML = insights.map(insight => `
      <li class="insight-item">${insight}</li>
    `).join('');
  }

  renderLocationInsights() {
    const insights = this.aiEngine.analyzeUserBehavior();
    const locationPrefs = insights.locationPreferences;
    
    // Location metrics
    const metricsContainer = document.getElementById('location-metrics');
    const metrics = [
      { 
        value: locationPrefs.favoriteStadiums?.length || 0, 
        label: 'Favorite Stadiums' 
      },
      { 
        value: locationPrefs.favoriteLines?.length || 0, 
        label: 'Favorite Tube Lines' 
      },
      { 
        value: this.calculateLocationDiversity(), 
        label: 'Location Diversity' 
      }
    ];

    metricsContainer.innerHTML = metrics.map(metric => `
      <div class="metric-item">
        <div class="metric-value">${metric.value}</div>
        <div class="metric-label">${metric.label}</div>
      </div>
    `).join('');

    // Location insights
    const insightsContainer = document.getElementById('location-insights');
    const locationInsights = [
      locationPrefs.favoriteStadiums?.[0] ? 
        `Most visited: ${locationPrefs.favoriteStadiums[0].stadium} (${locationPrefs.favoriteStadiums[0].visits} times)` :
        'No stadium preferences detected yet',
      locationPrefs.favoriteLines?.[0] ? 
        `Favorite tube line: ${locationPrefs.favoriteLines[0].line} (${locationPrefs.favoriteLines[0].visits} stations)` :
        'No tube line preferences detected',
      this.getLocationSpread(),
      this.getLocationTrends()
    ];

    insightsContainer.innerHTML = locationInsights.map(insight => `
      <li class="insight-item">${insight}</li>
    `).join('');
  }

  // Chart Creation Methods
  createActivityChart(dailyActivity) {
    const ctx = document.getElementById('activity-chart').getContext('2d');
    const labels = Object.keys(dailyActivity).slice(-14); // Last 14 days
    const data = labels.map(date => dailyActivity[date] || 0);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.map(date => new Date(date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Daily Activity',
          data: data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  createUsageChart(usageData) {
    const ctx = document.getElementById('usage-chart').getContext('2d');
    const labels = Object.keys(usageData).map(this.formatTrackerName);
    const data = Object.values(usageData);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 20 } }
        }
      }
    });
  }

  createTemporalChart(hourlyData) {
    const ctx = document.getElementById('temporal-chart').getContext('2d');
    const hours = Array.from({length: 24}, (_, i) => i);
    const data = hours.map(hour => hourlyData[hour] || 0);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hours.map(h => `${h}:00`),
        datasets: [{
          label: 'Activity by Hour',
          data: data,
          backgroundColor: 'rgba(102, 126, 234, 0.6)',
          borderColor: '#667eea',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { 
            ticks: { 
              callback: function(value, index) {
                return index % 4 === 0 ? this.getLabelForValue(value) : '';
              }
            }
          },
          y: { beginAtZero: true }
        }
      }
    });
  }

  createProgressChart(progressData) {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    const trackers = Object.keys(progressData);
    const completed = trackers.map(t => progressData[t].completed);
    const remaining = trackers.map(t => progressData[t].remaining);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: trackers.map(this.formatTrackerName),
        datasets: [
          {
            label: 'Completed',
            data: completed,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: '#22c55e',
            borderWidth: 1
          },
          {
            label: 'Remaining',
            data: remaining,
            backgroundColor: 'rgba(156, 163, 175, 0.4)',
            borderColor: '#9ca3af',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true }
        }
      }
    });
  }
  // Helper Methods
  formatTrackerName(trackerId) {
    const names = {
      'hawkbology': 'Hawkbology',
      'tubology': 'Tubology',
      '92-tracker': '92 Tracker',
      'brewery-tracker': 'Brewery Tracker',
      'betting-tracker': 'Betting Tracker',
      'hawk-football-travels': 'Football Travels',
      'ive-been-there': "I've Been There",
      'joind': 'JoinD',
      'know-your-team': 'Know Your Team',
      'avant': 'Avant',
      'greyhound-tracker': 'Greyhound Tracker'
    };
    return names[trackerId] || trackerId;
  }

  calculateStreak() {
    const events = this.analytics.events;
    if (events.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check consecutive days with activity
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasActivity = events.some(event => 
        event.timestamp.startsWith(dateStr)
      );
      
      if (hasActivity) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  analyzeHourlyPatterns(events) {
    const hourlyData = {};
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });
    
    return hourlyData;
  }

  findPeakHour(hourlyData) {
    const sortedHours = Object.entries(hourlyData)
      .sort((a, b) => b[1] - a[1]);
    
    if (sortedHours.length === 0) return 'No activity data';
    
    const peakHour = parseInt(sortedHours[0][0]);
    const timeOfDay = peakHour < 12 ? 'morning' : peakHour < 17 ? 'afternoon' : 'evening';
    
    return `Peak activity: ${peakHour}:00 (${timeOfDay})`;
  }

  calculateSynergyScore(correlations) {
    const strongCorrelations = Object.keys(correlations.strongCorrelations || {}).length;
    const totalPossiblePairs = this.userProfile.getActiveTrackers().length * 
                               (this.userProfile.getActiveTrackers().length - 1) / 2;
    
    if (totalPossiblePairs === 0) return 0;
    
    return Math.round((strongCorrelations / totalPossiblePairs) * 100);
  }

  getProgressData() {
    const progressData = {};
    
    // 92 Tracker
    const ninetyTwoData = this.getTrackerData('92-tracker');
    if (ninetyTwoData) {
      const visited = ninetyTwoData.filter(g => g.visited).length;
      progressData['92-tracker'] = {
        completed: visited,
        remaining: 92 - visited,
        total: 92
      };
    }

    // Tubology
    const tubologyData = this.getTrackerData('tubology_stations');
    if (tubologyData) {
      const visited = tubologyData.filter(s => s.visited).length;
      progressData['tubology'] = {
        completed: visited,
        remaining: tubologyData.length - visited,
        total: tubologyData.length
      };
    }

    // Brewery Tracker
    const breweryData = this.getTrackerData('brewery-tracker');
    if (breweryData) {
      const visited = breweryData.filter(b => b.visited).length;
      progressData['brewery-tracker'] = {
        completed: visited,
        remaining: breweryData.length - visited,
        total: breweryData.length
      };
    }

    // I've Been There
    const ibtData = this.getTrackerData('ive-been-there');
    if (ibtData && ibtData.countries) {
      const visited = Object.values(ibtData.countries).filter(c => c.visited).length;
      const total = Object.keys(ibtData.countries).length;
      progressData['ive-been-there'] = {
        completed: visited,
        remaining: total - visited,
        total: total
      };
    }

    return progressData;
  }

  generateProgressInsights(progressData) {
    const insights = [];
    
    Object.entries(progressData).forEach(([tracker, data]) => {
      const percentage = Math.round((data.completed / data.total) * 100);
      const trackerName = this.formatTrackerName(tracker);
      
      insights.push(`${trackerName}: ${percentage}% complete (${data.completed}/${data.total})`);
      
      if (percentage >= 90) {
        insights.push(`🎯 Almost finished with ${trackerName}!`);
      } else if (percentage >= 50) {
        insights.push(`📈 Halfway through ${trackerName}`);
      } else if (percentage < 10) {
        insights.push(`🚀 Just getting started with ${trackerName}`);
      }
    });

    // Find fastest progressing tracker
    const fastestTracker = Object.entries(progressData)
      .sort((a, b) => b[1].completed - a[1].completed)[0];
    
    if (fastestTracker) {
      insights.push(`⭐ Leading progress: ${this.formatTrackerName(fastestTracker[0])}`);
    }

    return insights.slice(0, 6);
  }

  calculateLocationDiversity() {
    const hawkbologyData = this.getTrackerData('hawkbology');
    if (!hawkbologyData) return 0;
    
    const uniqueStadiums = new Set(hawkbologyData.map(m => m.stadium));
    return uniqueStadiums.size;
  }

  getLocationSpread() {
    const hawkbologyData = this.getTrackerData('hawkbology');
    if (!hawkbologyData || hawkbologyData.length === 0) return 'No location data available';
    
    const cities = new Set();
    hawkbologyData.forEach(match => {
      // Extract city from stadium name (simplified)
      if (match.stadium.includes('London') || 
          match.stadium.includes('Arsenal') || 
          match.stadium.includes('Chelsea')) {
        cities.add('London');
      } else if (match.stadium.includes('Manchester')) {
        cities.add('Manchester');
      } else if (match.stadium.includes('Liverpool')) {
        cities.add('Liverpool');
      } else {
        cities.add('Other');
      }
    });
    
    return `Visited ${cities.size} different city areas`;
  }

  getLocationTrends() {
    const tubologyData = this.getTrackerData('tubology_stations');
    if (!tubologyData) return 'No tube data available';
    
    const visitedStations = tubologyData.filter(s => s.visited);
    if (visitedStations.length === 0) return 'No tube stations visited yet';
    
    const zones = visitedStations.map(s => s.zone || 1);
    const avgZone = zones.reduce((sum, zone) => sum + zone, 0) / zones.length;
    
    return `Average tube zone visited: ${avgZone.toFixed(1)}`;
  }

  getTrackerData(trackerId) {
    const data = localStorage.getItem(trackerId);
    return data ? JSON.parse(data) : null;
  }
}

// Initialize Analytics Dashboard
document.addEventListener('DOMContentLoaded', () => {
  new HawkAnalyticsDashboard();
});