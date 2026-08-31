// ─── Smart Recommendations Dashboard ──────────────────────────────────────────
// AI-powered recommendation engine with machine learning insights

class SmartRecommendationsDashboard {
  constructor() {
    this.mlEngine = new MLEngine();
    this.notificationSystem = new SmartNotificationSystem();
    this.currentFilter = 'all';
    this.recommendations = [];
    this.aiInsights = [];
    
    this.init();
  }

  async init() {
    this.showLoadingState();
    
    // Initialize ML models
    await this.trainMLModels();
    
    // Generate recommendations
    await this.generateRecommendations();
    
    // Generate AI insights
    await this.generateAIInsights();
    
    // Render dashboard
    this.renderDashboard();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Update ML status
    this.updateMLStatus();

    // Track page view
    HawkServices.analytics.trackEvent('recommendations', 'view', 'dashboard');
  }

  showLoadingState() {
    const grid = document.getElementById('recommendations-grid');
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🤖</div>
        <h3>AI is analyzing your data...</h3>
        <p>Generating personalized recommendations</p>
      </div>
    `;
  }

  async trainMLModels() {
    try {
      await this.mlEngine.trainAllModels();
      console.log('✅ ML models trained successfully');
    } catch (error) {
      console.error('❌ ML training failed:', error);
    }
  }

  async generateRecommendations() {
    try {
      // Get smart notifications (which include recommendations)
      const smartNotifications = await this.notificationSystem.generateSmartNotifications();
      
      // Generate ML-based recommendations
      const mlRecommendations = await this.generateMLRecommendations();
      
      // Generate location-based recommendations
      const locationRecs = this.generateLocationRecommendations();
      
      // Generate timing recommendations
      const timingRecs = this.generateTimingRecommendations();
      
      // Generate progress-based recommendations
      const progressRecs = this.generateProgressRecommendations();
      
      // Combine and enhance all recommendations
      this.recommendations = [
        ...smartNotifications.map(n => this.enhanceNotificationAsRecommendation(n)),
        ...mlRecommendations,
        ...locationRecs,
        ...timingRecs,
        ...progressRecs
      ];

      // Sort by priority and confidence
      this.recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return (b.confidence || 0.5) - (a.confidence || 0.5);
      });

      // Limit to top recommendations
      this.recommendations = this.recommendations.slice(0, 20);
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      this.recommendations = [];
    }
  }

  async generateMLRecommendations() {
    const mlRecs = [];
    
    try {
      // Get predictions from visit prediction model
      const visitPredictions = this.generateVisitPredictions();
      mlRecs.push(...visitPredictions);
      
      // Get seasonal insights
      const seasonalRecs = this.generateSeasonalRecommendations();
      mlRecs.push(...seasonalRecs);
      
      // Get correlation-based recommendations
      const correlationRecs = this.generateCorrelationRecommendations();
      mlRecs.push(...correlationRecs);
      
      // Get anomaly-based recommendations
      const anomalyRecs = this.generateAnomalyRecommendations();
      mlRecs.push(...anomalyRecs);
      
    } catch (error) {
      console.error('Error generating ML recommendations:', error);
    }
    
    return mlRecs;
  }

  generateVisitPredictions() {
    const predictions = [];
    const today = new Date();
    const context = {
      dayOfWeek: today.getDay(),
      month: today.getMonth(),
      hour: today.getHours()
    };

    try {
      const visitProbability = this.mlEngine.models.visitPrediction.predictNextVisit(context);
      
      if (visitProbability > 0.7) {
        predictions.push({
          type: 'ml_prediction',
          category: 'timing',
          priority: 'medium',
          title: '🎯 High Activity Probability',
          description: `AI predicts ${Math.round(visitProbability * 100)}% chance you'll be active today. Perfect time for tracking!`,
          confidence: visitProbability,
          actionText: 'Start Tracking',
          actionUrl: 'hawk-central.html',
          metadata: {
            predictionType: 'visit',
            probability: visitProbability,
            context: context
          }
        });
      }
    } catch (error) {
      console.error('Error generating visit predictions:', error);
    }

    return predictions;
  }

  generateSeasonalRecommendations() {
    const seasonalRecs = [];
    
    try {
      const insights = this.mlEngine.models.seasonalAnalysis.getSeasonalInsights();
      
      if (insights.peakMonth) {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        
        if (currentMonth === insights.peakMonth) {
          seasonalRecs.push({
            type: 'seasonal',
            category: 'timing',
            priority: 'medium',
            title: '📅 Peak Season Active',
            description: `${insights.peakMonth} is historically your most active month. Make the most of it!`,
            confidence: 0.8,
            actionText: 'View Opportunities',
            actionUrl: 'hawk-central.html#opportunities',
            metadata: {
              seasonalPattern: insights,
              currentMonth: currentMonth
            }
          });
        }
      }

      if (insights.trend === 'increasing') {
        seasonalRecs.push({
          type: 'seasonal',
          category: 'insight',
          priority: 'low',
          title: '📈 Activity Trending Up',
          description: 'Your tracking activity shows a positive upward trend over time.',
          confidence: 0.7,
          actionText: 'View Analytics',
          actionUrl: 'analytics-dashboard.html',
          metadata: {
            trend: insights.trend
          }
        });
      }
    } catch (error) {
      console.error('Error generating seasonal recommendations:', error);
    }

    return seasonalRecs;
  }

  generateCorrelationRecommendations() {
    const correlationRecs = [];
    
    try {
      const strongCorrelations = this.mlEngine.models.correlationDetection.getStrongCorrelations();
      
      strongCorrelations.forEach(correlation => {
        correlationRecs.push({
          type: 'correlation',
          category: 'cross-app',
          priority: 'medium',
          title: '🔗 Synergy Opportunity',
          description: correlation.description + '. Plan combined activities for efficiency!',
          confidence: correlation.strength,
          actionText: 'Plan Activities',
          actionUrl: 'hawk-central.html#planning',
          metadata: {
            correlation: correlation,
            activities: correlation.activities
          }
        });
      });
    } catch (error) {
      console.error('Error generating correlation recommendations:', error);
    }

    return correlationRecs.slice(0, 3); // Limit to top 3
  }

  generateAnomalyRecommendations() {
    const anomalyRecs = [];
    
    try {
      // This would use the anomaly detection model
      // For now, we'll create placeholder recommendations
      const recentActivity = this.getRecentActivityLevel();
      
      if (recentActivity < 0.3) {
        anomalyRecs.push({
          type: 'anomaly',
          category: 'engagement',
          priority: 'low',
          title: '📊 Activity Below Normal',
          description: 'Your tracking activity has been lower than usual. Ready to get back on track?',
          confidence: 0.6,
          actionText: 'Resume Tracking',
          actionUrl: 'hawk-central.html',
          metadata: {
            activityLevel: recentActivity,
            comparison: 'below_average'
          }
        });
      }
    } catch (error) {
      console.error('Error generating anomaly recommendations:', error);
    }

    return anomalyRecs;
  }

  generateLocationRecommendations() {
    const locationRecs = [];
    
    // Stadium opportunities
    const stadiumOpps = this.findStadiumOpportunities();
    locationRecs.push(...stadiumOpps);
    
    // Tube station opportunities
    const tubeOpps = this.findTubeOpportunities();
    locationRecs.push(...tubeOpps);
    
    // Brewery opportunities
    const breweryOpps = this.findBreweryOpportunities();
    locationRecs.push(...breweryOpps);

    return locationRecs;
  }

  findStadiumOpportunities() {
    const opportunities = [];
    
    try {
      const hawkbologyData = this.getTrackerData('hawkbology');
      const ninetyTwoData = this.getTrackerData('92-tracker');
      
      if (hawkbologyData && ninetyTwoData) {
        const visitedStadiums = new Set(hawkbologyData.map(m => m.stadium.toLowerCase()));
        const unvisitedGrounds = ninetyTwoData.filter(g => 
          !g.visited && !visitedStadiums.has(g.team.toLowerCase() + ' stadium')
        );

        if (unvisitedGrounds.length > 0) {
          // Find grounds in areas where user has been active
          const activeAreas = this.extractActiveAreas(hawkbologyData);
          const nearbyGrounds = unvisitedGrounds.filter(ground => 
            activeAreas.some(area => ground.team.includes(area))
          ).slice(0, 3);

          nearbyGrounds.forEach(ground => {
            opportunities.push({
              type: 'stadium_opportunity',
              category: 'location',
              priority: 'medium',
              title: '🏟️ Stadium in Familiar Area',
              description: `${ground.team}'s ground is in an area you've visited before. Perfect addition to your collection!`,
              confidence: 0.7,
              actionText: 'View Ground Details',
              actionUrl: '92-tracker/index.html',
              metadata: {
                ground: ground,
                reason: 'familiar_area'
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('Error finding stadium opportunities:', error);
    }

    return opportunities;
  }

  findTubeOpportunities() {
    const opportunities = [];
    
    try {
      const tubeData = this.getTrackerData('tubology_stations');
      
      if (tubeData) {
        const visited = tubeData.filter(s => s.visited);
        const unvisited = tubeData.filter(s => !s.visited);
        
        if (visited.length > 0 && unvisited.length > 0) {
          // Find unvisited stations on lines where user is active
          const activeLines = this.getActiveTubeLines(visited);
          const lineOpportunities = unvisited.filter(station => 
            activeLines.includes(station.line)
          ).slice(0, 5);

          if (lineOpportunities.length > 0) {
            opportunities.push({
              type: 'tube_opportunity',
              category: 'location',
              priority: 'low',
              title: '🚇 Complete Your Favorite Lines',
              description: `${lineOpportunities.length} unvisited stations on lines you're already exploring.`,
              confidence: 0.8,
              actionText: 'View Stations',
              actionUrl: 'tubology/index.html',
              metadata: {
                stations: lineOpportunities,
                activeLines: activeLines
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error finding tube opportunities:', error);
    }

    return opportunities;
  }

  findBreweryOpportunities() {
    const opportunities = [];
    
    try {
      const breweryData = this.getTrackerData('brewery-tracker');
      const hawkbologyData = this.getTrackerData('hawkbology');
      
      if (breweryData && hawkbologyData) {
        const unvisitedBreweries = breweryData.filter(b => !b.visited);
        const recentMatches = hawkbologyData
          .filter(m => m.date && new Date(m.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .slice(0, 5);

        recentMatches.forEach(match => {
          const nearbyBreweries = unvisitedBreweries.filter(brewery => 
            this.areInSameArea(match.stadium, brewery.name)
          );

          if (nearbyBreweries.length > 0) {
            opportunities.push({
              type: 'brewery_opportunity',
              category: 'location',
              priority: 'low',
              title: '🍺 Post-Match Brewery',
              description: `Breweries near ${match.stadium} perfect for celebrating your recent visit!`,
              confidence: 0.6,
              actionText: 'View Breweries',
              actionUrl: 'brewery-tracker/index.html',
              metadata: {
                match: match,
                breweries: nearbyBreweries
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error finding brewery opportunities:', error);
    }

    return opportunities.slice(0, 2);
  }

  generateTimingRecommendations() {
    const timingRecs = [];
    const now = new Date();
    
    // Weekend planning
    if (now.getDay() === 5 && now.getHours() >= 15) {
      timingRecs.push({
        type: 'weekend_planning',
        category: 'timing',
        priority: 'medium',
        title: '🎉 Plan Your Weekend',
        description: 'Friday afternoon is perfect for planning weekend tracking adventures!',
        confidence: 0.7,
        actionText: 'Make Plans',
        actionUrl: 'hawk-central.html#planning',
        metadata: {
          timeContext: 'friday_afternoon'
        }
      });
    }

    // Lunch break activities
    if (now.getDay() < 5 && now.getHours() >= 12 && now.getHours() <= 14) {
      timingRecs.push({
        type: 'lunch_break',
        category: 'timing',
        priority: 'low',
        title: '🍽️ Lunch Break Adventure',
        description: 'Perfect time for a quick tube station visit or nearby discovery!',
        confidence: 0.5,
        actionText: 'Find Nearby',
        actionUrl: 'tubology/index.html',
        metadata: {
          timeContext: 'lunch_break'
        }
      });
    }

    // Evening reflection
    if (now.getHours() >= 19 && now.getHours() <= 21) {
      timingRecs.push({
        type: 'evening_reflection',
        category: 'timing',
        priority: 'low',
        title: '🌅 Evening Review',
        description: 'Great time to review your progress and plan tomorrow\'s activities.',
        confidence: 0.6,
        actionText: 'View Progress',
        actionUrl: 'analytics-dashboard.html',
        metadata: {
          timeContext: 'evening'
        }
      });
    }

    return timingRecs;
  }

  generateProgressRecommendations() {
    const progressRecs = [];
    
    try {
      const progressData = this.getProgressData();
      
      Object.entries(progressData).forEach(([tracker, data]) => {
        if (data.percentage >= 80 && data.percentage < 95) {
          progressRecs.push({
            type: 'completion_push',
            category: 'achievement',
            priority: 'high',
            title: '🎯 So Close to Completion!',
            description: `Only ${data.remaining} items left to complete ${this.getTrackerDisplayName(tracker)}!`,
            confidence: 0.9,
            actionText: 'Finish Strong',
            actionUrl: this.getTrackerUrl(tracker),
            metadata: {
              tracker: tracker,
              progress: data
            }
          });
        } else if (data.percentage >= 25 && data.percentage < 50) {
          progressRecs.push({
            type: 'momentum_build',
            category: 'achievement',
            priority: 'medium',
            title: '📈 Build Momentum',
            description: `Great start on ${this.getTrackerDisplayName(tracker)}! Keep the momentum going.`,
            confidence: 0.7,
            actionText: 'Continue Progress',
            actionUrl: this.getTrackerUrl(tracker),
            metadata: {
              tracker: tracker,
              progress: data
            }
          });
        }
      });
    } catch (error) {
      console.error('Error generating progress recommendations:', error);
    }

    return progressRecs;
  }

  async generateAIInsights() {
    this.aiInsights = [
      {
        icon: '🧠',
        title: 'Pattern Recognition',
        description: 'AI has identified your peak activity patterns and can predict optimal tracking times.'
      },
      {
        icon: '🔮',
        title: 'Predictive Analytics',
        description: 'Machine learning models are analyzing your habits to suggest the best next activities.'
      },
      {
        icon: '🎯',
        title: 'Goal Optimization',
        description: 'Smart algorithms are finding the most efficient paths to complete your tracking goals.'
      },
      {
        icon: '🌐',
        title: 'Cross-App Intelligence',
        description: 'AI is discovering connections between your different tracking activities for better recommendations.'
      }
    ];
  }

  renderDashboard() {
    this.renderAIInsights();
    this.renderRecommendations();
  }

  renderAIInsights() {
    const container = document.getElementById('ai-insights');
    
    container.innerHTML = this.aiInsights.map(insight => `
      <div class="insight-item">
        <div class="insight-icon">${insight.icon}</div>
        <div class="insight-content">
          <div class="insight-title">${insight.title}</div>
          <div class="insight-description">${insight.description}</div>
        </div>
      </div>
    `).join('');
  }

  renderRecommendations() {
    const container = document.getElementById('recommendations-grid');
    const filteredRecs = this.getFilteredRecommendations();

    if (filteredRecs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🤖</div>
          <h3>No recommendations yet</h3>
          <p>Keep using your trackers and AI will learn your patterns to provide personalized suggestions.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredRecs.map(rec => this.renderRecommendationCard(rec)).join('');
  }

  renderRecommendationCard(rec) {
    return `
      <div class="recommendation-card card-type-${rec.category}" onclick="window.open('${rec.actionUrl}', '_blank')">
        <div class="rec-header">
          <div style="display: flex; align-items: center;">
            <div class="rec-icon">${this.getCategoryIcon(rec.category)}</div>
            <div class="rec-priority ${rec.priority}">${rec.priority}</div>
          </div>
        </div>
        
        <div class="rec-title">${rec.title}</div>
        <div class="rec-description">${rec.description}</div>
        
        <div class="rec-metadata">
          <span class="rec-tag">${rec.type.replace('_', ' ')}</span>
          <span class="rec-tag">${rec.category}</span>
        </div>
        
        <div class="rec-actions">
          <button class="rec-btn primary">${rec.actionText || 'Take Action'}</button>
          <div class="confidence-meter">
            <span>Confidence:</span>
            <div class="confidence-bar">
              <div class="confidence-fill" style="width: ${(rec.confidence || 0.5) * 100}%"></div>
            </div>
            <span>${Math.round((rec.confidence || 0.5) * 100)}%</span>
          </div>
        </div>
      </div>
    `;
  }

  getCategoryIcon(category) {
    const icons = {
      'location': '📍',
      'timing': '⏰',
      'cross-app': '🔗',
      'achievement': '🏆',
      'discovery': '🎯',
      'efficiency': '⚡',
      'engagement': '📱',
      'insight': '💡'
    };
    return icons[category] || '💡';
  }

  getFilteredRecommendations() {
    if (this.currentFilter === 'all') {
      return this.recommendations;
    }
    return this.recommendations.filter(rec => rec.category === this.currentFilter);
  }

  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active filter
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update filter and re-render
        this.currentFilter = btn.dataset.filter;
        this.renderRecommendations();
        
        // Track filter usage
        HawkServices.analytics.trackEvent('recommendations', 'filter', btn.dataset.filter);
      });
    });
  }

  updateMLStatus() {
    const statusText = document.getElementById('ml-status-text');
    const lastTraining = document.getElementById('last-training');
    
    const modelData = localStorage.getItem('hawk_ml_models');
    if (modelData) {
      const parsed = JSON.parse(modelData);
      const lastTrained = new Date(parsed.lastTrained);
      lastTraining.textContent = lastTrained.toLocaleDateString() + ' ' + lastTrained.toLocaleTimeString();
    } else {
      lastTraining.textContent = 'Never';
    }
  }

  // Helper Methods
  enhanceNotificationAsRecommendation(notification) {
    return {
      ...notification,
      actionText: 'Learn More',
      actionUrl: 'hawk-central.html',
      confidence: 0.8
    };
  }

  getTrackerData(trackerId) {
    const data = localStorage.getItem(trackerId);
    return data ? JSON.parse(data) : null;
  }

  getProgressData() {
    const data = {};
    
    // 92 Tracker
    const ninetyTwoData = this.getTrackerData('92-tracker');
    if (ninetyTwoData) {
      const visited = ninetyTwoData.filter(g => g.visited).length;
      data['92-tracker'] = {
        completed: visited,
        total: 92,
        remaining: 92 - visited,
        percentage: Math.round((visited / 92) * 100)
      };
    }

    // Tubology
    const tubeData = this.getTrackerData('tubology_stations');
    if (tubeData) {
      const visited = tubeData.filter(s => s.visited).length;
      data['tubology'] = {
        completed: visited,
        total: tubeData.length,
        remaining: tubeData.length - visited,
        percentage: Math.round((visited / tubeData.length) * 100)
      };
    }

    return data;
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

  getTrackerUrl(trackerId) {
    const urls = {
      'hawkbology': 'hawkbology/index.html',
      'tubology': 'tubology/index.html',
      '92-tracker': '92-tracker/index.html',
      'brewery-tracker': 'brewery-tracker/index.html'
    };
    return urls[trackerId] || 'hawk-central.html';
  }

  extractActiveAreas(hawkbologyData) {
    const areas = new Set();
    hawkbologyData.forEach(match => {
      if (match.stadium.includes('London')) areas.add('London');
      if (match.stadium.includes('Manchester')) areas.add('Manchester');
      if (match.stadium.includes('Liverpool')) areas.add('Liverpool');
      if (match.stadium.includes('Birmingham')) areas.add('Birmingham');
    });
    return Array.from(areas);
  }

  getActiveTubeLines(visitedStations) {
    const lineCounts = {};
    visitedStations.forEach(station => {
      if (station.line) {
        lineCounts[station.line] = (lineCounts[station.line] || 0) + 1;
      }
    });
    
    // Return lines with more than 3 visited stations
    return Object.entries(lineCounts)
      .filter(([line, count]) => count >= 3)
      .map(([line]) => line);
  }

  areInSameArea(stadium, breweryName) {
    // Simplified area matching
    const stadiumAreas = this.extractAreas(stadium);
    const breweryAreas = this.extractAreas(breweryName);
    
    return stadiumAreas.some(area => breweryAreas.includes(area));
  }

  extractAreas(text) {
    const areas = [];
    const londonAreas = ['Arsenal', 'Chelsea', 'Tottenham', 'West Ham', 'Crystal Palace', 'Bermondsey', 'Hackney'];
    londonAreas.forEach(area => {
      if (text.includes(area)) areas.push(area);
    });
    
    if (text.includes('London')) areas.push('London');
    if (text.includes('Manchester')) areas.push('Manchester');
    if (text.includes('Liverpool')) areas.push('Liverpool');
    
    return areas;
  }

  getRecentActivityLevel() {
    const events = HawkServices.analytics.events;
    const recentEvents = events.filter(e => {
      const eventDate = new Date(e.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return eventDate > weekAgo;
    });
    
    // Normalize activity level (0-1 scale)
    return Math.min(recentEvents.length / 20, 1); // Assume 20 events per week is "normal"
  }
}

// Initialize Smart Recommendations Dashboard
document.addEventListener('DOMContentLoaded', () => {
  new SmartRecommendationsDashboard();
});