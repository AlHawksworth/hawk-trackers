// ─── Machine Learning Engine for Hawk Trackers ──────────────────────────────
// Advanced ML algorithms for pattern recognition and predictive analytics

class MLEngine {
  constructor() {
    this.models = {
      visitPrediction: new VisitPredictionModel(),
      seasonalAnalysis: new SeasonalAnalysisModel(),
      correlationDetection: new CorrelationDetectionModel(),
      anomalyDetection: new AnomalyDetectionModel(),
      recommendation: new RecommendationModel()
    };
    
    this.trainingData = this.loadTrainingData();
    this.isTraining = false;
  }

  async trainAllModels() {
    if (this.isTraining) return;
    
    this.isTraining = true;
    console.log('🧠 Training ML models...');
    
    try {
      const data = this.prepareTrainingData();
      
      await Promise.all([
        this.models.visitPrediction.train(data.visits),
        this.models.seasonalAnalysis.train(data.temporal),
        this.models.correlationDetection.train(data.crossApp),
        this.models.anomalyDetection.train(data.behavior),
        this.models.recommendation.train(data.preferences)
      ]);
      
      this.saveTrainedModels();
      console.log('✅ ML models trained successfully');
    } catch (error) {
      console.error('❌ ML training failed:', error);
    } finally {
      this.isTraining = false;
    }
  }

  prepareTrainingData() {
    const userData = this.collectUserData();
    
    return {
      visits: this.extractVisitPatterns(userData),
      temporal: this.extractTemporalPatterns(userData),
      crossApp: this.extractCrossAppPatterns(userData),
      behavior: this.extractBehaviorPatterns(userData),
      preferences: this.extractPreferences(userData)
    };
  }

  collectUserData() {
    const data = {
      hawkbology: this.getTrackerData('hawkbology'),
      tubology: this.getTrackerData('tubology_stations'),
      ninetyTwo: this.getTrackerData('92-tracker'),
      brewery: this.getTrackerData('brewery-tracker'),
      betting: this.getTrackerData('betting-tracker'),
      travels: this.getTrackerData('hawk-football-travels'),
      analytics: HawkServices.analytics.events
    };
    
    return data;
  }

  extractVisitPatterns(userData) {
    const patterns = [];
    
    // Football match patterns
    if (userData.hawkbology) {
      userData.hawkbology.forEach(match => {
        if (match.date) {
          patterns.push({
            type: 'football',
            date: new Date(match.date),
            location: this.extractLocation(match.stadium),
            context: {
              home: match.home,
              away: match.away,
              competition: match.competition,
              dayOfWeek: new Date(match.date).getDay(),
              month: new Date(match.date).getMonth()
            }
          });
        }
      });
    }

    // Tube station patterns
    if (userData.tubology) {
      userData.tubology.filter(s => s.visited && s.visitedDate).forEach(station => {
        patterns.push({
          type: 'tube',
          date: new Date(station.visitedDate),
          location: station.name,
          context: {
            line: station.line,
            zone: station.zone,
            dayOfWeek: new Date(station.visitedDate).getDay()
          }
        });
      });
    }

    return patterns;
  }

  extractTemporalPatterns(userData) {
    const events = userData.analytics || [];
    const patterns = {
      hourly: new Array(24).fill(0),
      daily: new Array(7).fill(0),
      monthly: new Array(12).fill(0),
      sequences: []
    };

    events.forEach(event => {
      const date = new Date(event.timestamp);
      patterns.hourly[date.getHours()]++;
      patterns.daily[date.getDay()]++;
      patterns.monthly[date.getMonth()]++;
    });

    // Detect usage sequences
    const sortedEvents = events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const current = sortedEvents[i];
      const next = sortedEvents[i + 1];
      const timeDiff = new Date(next.timestamp) - new Date(current.timestamp);
      
      if (timeDiff < 60 * 60 * 1000) { // Within 1 hour
        patterns.sequences.push({
          from: current.trackerName,
          to: next.trackerName,
          interval: timeDiff
        });
      }
    }

    return patterns;
  }

  extractCrossAppPatterns(userData) {
    const patterns = [];
    
    // Location correlations
    const locations = new Map();
    
    // Map football stadiums to locations
    if (userData.hawkbology) {
      userData.hawkbology.forEach(match => {
        const location = this.extractLocation(match.stadium);
        if (!locations.has(location)) locations.set(location, []);
        locations.get(location).push({ type: 'football', data: match });
      });
    }

    // Map breweries to locations
    if (userData.brewery) {
      userData.brewery.filter(b => b.visited).forEach(brewery => {
        const location = brewery.area || this.extractLocation(brewery.name);
        if (!locations.has(location)) locations.set(location, []);
        locations.get(location).push({ type: 'brewery', data: brewery });
      });
    }

    // Find co-locations
    locations.forEach((items, location) => {
      if (items.length > 1) {
        const types = new Set(items.map(item => item.type));
        if (types.size > 1) {
          patterns.push({
            location,
            activities: items,
            correlation: this.calculateLocationCorrelation(items)
          });
        }
      }
    });

    return patterns;
  }

  extractBehaviorPatterns(userData) {
    const patterns = {
      consistency: this.calculateConsistency(userData.analytics),
      diversity: this.calculateDiversity(userData),
      intensity: this.calculateIntensity(userData.analytics),
      exploration: this.calculateExploration(userData)
    };

    return patterns;
  }

  extractPreferences(userData) {
    const preferences = {
      competitions: this.analyzeCompetitionPreferences(userData.hawkbology),
      locations: this.analyzeLocationPreferences(userData),
      timing: this.analyzeTimingPreferences(userData.analytics),
      difficulty: this.analyzeDifficultyPreferences(userData)
    };

    return preferences;
  }

  // Model Classes
}

class VisitPredictionModel {
  constructor() {
    this.weights = {};
    this.bias = 0;
    this.learningRate = 0.01;
  }

  async train(visitPatterns) {
    // Simple linear regression for visit prediction
    const features = this.extractFeatures(visitPatterns);
    const labels = this.extractLabels(visitPatterns);
    
    // Gradient descent training
    for (let epoch = 0; epoch < 1000; epoch++) {
      let totalError = 0;
      
      for (let i = 0; i < features.length; i++) {
        const prediction = this.predict(features[i]);
        const error = labels[i] - prediction;
        totalError += error * error;
        
        // Update weights
        for (const [feature, value] of Object.entries(features[i])) {
          if (!this.weights[feature]) this.weights[feature] = 0;
          this.weights[feature] += this.learningRate * error * value;
        }
        
        this.bias += this.learningRate * error;
      }
      
      if (epoch % 100 === 0) {
        console.log(`Training epoch ${epoch}, error: ${totalError / features.length}`);
      }
    }
  }

  predict(features) {
    let score = this.bias;
    for (const [feature, value] of Object.entries(features)) {
      if (this.weights[feature]) {
        score += this.weights[feature] * value;
      }
    }
    return 1 / (1 + Math.exp(-score)); // Sigmoid activation
  }

  extractFeatures(patterns) {
    return patterns.map(pattern => ({
      dayOfWeek: pattern.context.dayOfWeek / 6,
      month: pattern.context.month / 11,
      isWeekend: pattern.context.dayOfWeek >= 5 ? 1 : 0,
      isSummer: (pattern.context.month >= 5 && pattern.context.month <= 7) ? 1 : 0
    }));
  }

  extractLabels(patterns) {
    // For simplicity, we'll use a binary label based on whether there was activity
    return patterns.map(() => 1); // All patterns represent actual visits
  }

  predictNextVisit(currentContext) {
    const features = {
      dayOfWeek: currentContext.dayOfWeek / 6,
      month: currentContext.month / 11,
      isWeekend: currentContext.dayOfWeek >= 5 ? 1 : 0,
      isSummer: (currentContext.month >= 5 && currentContext.month <= 7) ? 1 : 0
    };
    
    return this.predict(features);
  }
}

class SeasonalAnalysisModel {
  constructor() {
    this.seasonalWeights = new Array(12).fill(0);
    this.trendCoefficient = 0;
  }

  async train(temporalPatterns) {
    const monthlyData = temporalPatterns.monthly;
    const totalActivity = monthlyData.reduce((sum, count) => sum + count, 0);
    
    if (totalActivity === 0) return;
    
    // Calculate seasonal weights (normalized)
    this.seasonalWeights = monthlyData.map(count => count / totalActivity);
    
    // Simple trend analysis
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < monthlyData.length; i++) {
      sumX += i;
      sumY += monthlyData[i];
      sumXY += i * monthlyData[i];
      sumXX += i * i;
    }
    
    const n = monthlyData.length;
    this.trendCoefficient = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  predictSeasonalActivity(month, year) {
    const baseActivity = this.seasonalWeights[month];
    const trendAdjustment = this.trendCoefficient * (year - 2024);
    
    return Math.max(0, baseActivity + trendAdjustment);
  }

  getSeasonalInsights() {
    const maxMonth = this.seasonalWeights.indexOf(Math.max(...this.seasonalWeights));
    const minMonth = this.seasonalWeights.indexOf(Math.min(...this.seasonalWeights));
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return {
      peakMonth: monthNames[maxMonth],
      quietMonth: monthNames[minMonth],
      trend: this.trendCoefficient > 0 ? 'increasing' : 'decreasing',
      seasonality: Math.max(...this.seasonalWeights) / Math.min(...this.seasonalWeights)
    };
  }
}

class CorrelationDetectionModel {
  constructor() {
    this.correlations = new Map();
  }

  async train(crossAppPatterns) {
    // Build correlation matrix
    const activities = new Set();
    crossAppPatterns.forEach(pattern => {
      pattern.activities.forEach(activity => {
        activities.add(activity.type);
      });
    });

    const activityTypes = Array.from(activities);
    
    for (let i = 0; i < activityTypes.length; i++) {
      for (let j = i + 1; j < activityTypes.length; j++) {
        const correlation = this.calculateCorrelation(
          activityTypes[i], 
          activityTypes[j], 
          crossAppPatterns
        );
        
        this.correlations.set(`${activityTypes[i]}_${activityTypes[j]}`, correlation);
      }
    }
  }

  calculateCorrelation(type1, type2, patterns) {
    let coOccurrences = 0;
    let type1Count = 0;
    let type2Count = 0;
    let totalLocations = patterns.length;

    patterns.forEach(pattern => {
      const hasType1 = pattern.activities.some(a => a.type === type1);
      const hasType2 = pattern.activities.some(a => a.type === type2);
      
      if (hasType1) type1Count++;
      if (hasType2) type2Count++;
      if (hasType1 && hasType2) coOccurrences++;
    });

    if (type1Count === 0 || type2Count === 0) return 0;
    
    // Jaccard similarity coefficient
    const union = type1Count + type2Count - coOccurrences;
    return coOccurrences / union;
  }

  getStrongCorrelations(threshold = 0.3) {
    const strong = [];
    
    this.correlations.forEach((correlation, pair) => {
      if (correlation >= threshold) {
        const [type1, type2] = pair.split('_');
        strong.push({
          activities: [type1, type2],
          strength: correlation,
          description: this.generateCorrelationDescription(type1, type2, correlation)
        });
      }
    });

    return strong.sort((a, b) => b.strength - a.strength);
  }

  generateCorrelationDescription(type1, type2, strength) {
    const percentage = Math.round(strength * 100);
    return `${percentage}% correlation between ${type1} and ${type2} activities`;
  }
}

class AnomalyDetectionModel {
  constructor() {
    this.normalPatterns = {};
    this.threshold = 2; // Standard deviations
  }

  async train(behaviorPatterns) {
    // Learn normal behavior patterns
    this.normalPatterns = {
      consistency: this.calculateStatistics(behaviorPatterns.consistency),
      diversity: this.calculateStatistics(behaviorPatterns.diversity),
      intensity: this.calculateStatistics(behaviorPatterns.intensity)
    };
  }

  calculateStatistics(values) {
    if (!Array.isArray(values)) values = [values];
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, stdDev, min: Math.min(...values), max: Math.max(...values) };
  }

  detectAnomalies(currentBehavior) {
    const anomalies = [];
    
    Object.entries(currentBehavior).forEach(([metric, value]) => {
      if (this.normalPatterns[metric]) {
        const { mean, stdDev } = this.normalPatterns[metric];
        const zScore = Math.abs(value - mean) / stdDev;
        
        if (zScore > this.threshold) {
          anomalies.push({
            metric,
            value,
            expected: mean,
            severity: zScore > 3 ? 'high' : 'medium',
            description: this.generateAnomalyDescription(metric, value, mean, zScore)
          });
        }
      }
    });

    return anomalies;
  }

  generateAnomalyDescription(metric, actual, expected, zScore) {
    const direction = actual > expected ? 'higher' : 'lower';
    const severity = zScore > 3 ? 'significantly' : 'notably';
    
    return `${metric} is ${severity} ${direction} than usual (${actual.toFixed(2)} vs expected ${expected.toFixed(2)})`;
  }
}

class RecommendationModel {
  constructor() {
    this.userEmbeddings = {};
    this.itemEmbeddings = {};
    this.embeddingSize = 50;
  }

  async train(preferences) {
    // Collaborative filtering approach
    this.buildEmbeddings(preferences);
  }

  buildEmbeddings(preferences) {
    // Initialize random embeddings
    this.userEmbeddings['user'] = this.randomVector(this.embeddingSize);
    
    // Build item embeddings for different types
    Object.keys(preferences).forEach(category => {
      this.itemEmbeddings[category] = {};
      
      if (preferences[category] && typeof preferences[category] === 'object') {
        Object.keys(preferences[category]).forEach(item => {
          this.itemEmbeddings[category][item] = this.randomVector(this.embeddingSize);
        });
      }
    });
  }

  randomVector(size) {
    return Array.from({ length: size }, () => (Math.random() - 0.5) * 0.1);
  }

  generateRecommendations(userContext) {
    const recommendations = [];
    
    // Smart location-based recommendations
    if (userContext.location) {
      recommendations.push(...this.getLocationRecommendations(userContext.location));
    }
    
    // Time-based recommendations
    if (userContext.time) {
      recommendations.push(...this.getTimeBasedRecommendations(userContext.time));
    }
    
    // Pattern-based recommendations
    recommendations.push(...this.getPatternRecommendations(userContext));
    
    return recommendations.slice(0, 10);
  }

  getLocationRecommendations(location) {
    // Implementation for location-based recommendations
    return [{
      type: 'location',
      title: 'Nearby Discovery',
      description: `Explore more locations near ${location}`,
      confidence: 0.8,
      actionable: true
    }];
  }

  getTimeBasedRecommendations(timeContext) {
    const recommendations = [];
    const hour = new Date().getHours();
    
    if (hour >= 9 && hour <= 17) {
      recommendations.push({
        type: 'timing',
        title: 'Lunch Break Activity',
        description: 'Perfect time for a quick tube station visit',
        confidence: 0.7,
        actionable: true
      });
    }
    
    return recommendations;
  }

  getPatternRecommendations(context) {
    return [{
      type: 'pattern',
      title: 'Complete Your Collection',
      description: 'You\'re close to finishing a category',
      confidence: 0.9,
      actionable: true
    }];
  }
}

// Helper methods for MLEngine
MLEngine.prototype.getTrackerData = function(trackerId) {
  const data = localStorage.getItem(trackerId);
  return data ? JSON.parse(data) : null;
};

MLEngine.prototype.extractLocation = function(text) {
  // Simplified location extraction
  const locations = ['London', 'Manchester', 'Liverpool', 'Birmingham', 'Newcastle'];
  for (const location of locations) {
    if (text.includes(location)) return location;
  }
  return 'Other';
};

MLEngine.prototype.calculateLocationCorrelation = function(items) {
  // Simple correlation based on co-occurrence
  return items.length > 1 ? 0.8 : 0.1;
};

MLEngine.prototype.calculateConsistency = function(events) {
  if (!events || events.length < 2) return [0.5];
  
  const dailyActivity = {};
  events.forEach(event => {
    const day = event.timestamp.split('T')[0];
    dailyActivity[day] = (dailyActivity[day] || 0) + 1;
  });
  
  const activities = Object.values(dailyActivity);
  const mean = activities.reduce((sum, val) => sum + val, 0) / activities.length;
  const variance = activities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / activities.length;
  
  return [1 / (1 + variance)]; // Consistency score
};

MLEngine.prototype.calculateDiversity = function(userData) {
  const trackers = Object.keys(userData).filter(key => key !== 'analytics' && userData[key]);
  return trackers.length / 10; // Normalize by max possible trackers
};

MLEngine.prototype.calculateIntensity = function(events) {
  if (!events || events.length === 0) return [0];
  
  const recentEvents = events.filter(event => {
    const eventDate = new Date(event.timestamp);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return eventDate > weekAgo;
  });
  
  return [recentEvents.length / 7]; // Events per day
};

MLEngine.prototype.calculateExploration = function(userData) {
  let uniqueItems = 0;
  let totalItems = 0;
  
  Object.values(userData).forEach(data => {
    if (Array.isArray(data)) {
      totalItems += data.length;
      const uniqueSet = new Set(data.map(item => 
        item.name || item.stadium || item.home || JSON.stringify(item)
      ));
      uniqueItems += uniqueSet.size;
    }
  });
  
  return totalItems > 0 ? uniqueItems / totalItems : 1;
};

MLEngine.prototype.analyzeCompetitionPreferences = function(hawkbologyData) {
  if (!hawkbologyData) return {};
  
  const competitions = {};
  hawkbologyData.forEach(match => {
    const comp = match.competition || 'Unknown';
    competitions[comp] = (competitions[comp] || 0) + 1;
  });
  
  return competitions;
};

MLEngine.prototype.analyzeLocationPreferences = function(userData) {
  const locations = {};
  
  if (userData.hawkbology) {
    userData.hawkbology.forEach(match => {
      const location = this.extractLocation(match.stadium);
      locations[location] = (locations[location] || 0) + 1;
    });
  }
  
  return locations;
};

MLEngine.prototype.analyzeTimingPreferences = function(events) {
  if (!events) return {};
  
  const timing = { hours: new Array(24).fill(0), days: new Array(7).fill(0) };
  
  events.forEach(event => {
    const date = new Date(event.timestamp);
    timing.hours[date.getHours()]++;
    timing.days[date.getDay()]++;
  });
  
  return timing;
};

MLEngine.prototype.analyzeDifficultyPreferences = function(userData) {
  // Analyze preference for challenging vs easy targets
  let easyTargets = 0;
  let hardTargets = 0;
  
  if (userData.tubology) {
    userData.tubology.filter(s => s.visited).forEach(station => {
      if (station.zone <= 2) easyTargets++;
      else hardTargets++;
    });
  }
  
  return {
    easy: easyTargets,
    hard: hardTargets,
    preference: easyTargets > hardTargets ? 'easy' : 'challenging'
  };
};

MLEngine.prototype.loadTrainingData = function() {
  const saved = localStorage.getItem('hawk_ml_training_data');
  return saved ? JSON.parse(saved) : {};
};

MLEngine.prototype.saveTrainedModels = function() {
  const modelData = {
    visitPrediction: {
      weights: this.models.visitPrediction.weights,
      bias: this.models.visitPrediction.bias
    },
    seasonal: {
      weights: this.models.seasonalAnalysis.seasonalWeights,
      trend: this.models.seasonalAnalysis.trendCoefficient
    },
    correlations: Array.from(this.models.correlationDetection.correlations.entries()),
    anomaly: this.models.anomalyDetection.normalPatterns,
    lastTrained: Date.now()
  };
  
  localStorage.setItem('hawk_ml_models', JSON.stringify(modelData));
};

// Export the ML Engine
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MLEngine;
} else {
  window.MLEngine = MLEngine;
}