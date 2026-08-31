// ─── AI-Powered Insights and Recommendations Engine ─────────────────────────
// Advanced analytics and intelligent recommendations across all trackers

class AIInsightsEngine {
  constructor() {
    this.userProfile = HawkServices.userProfile;
    this.analytics = HawkServices.analytics;
    this.patterns = this.loadPatterns();
  }

  loadPatterns() {
    const saved = localStorage.getItem('hawk_ai_patterns');
    return saved ? JSON.parse(saved) : {
      visitingPatterns: {},
      preferences: {},
      trends: {},
      correlations: {}
    };
  }

  savePatterns() {
    localStorage.setItem('hawk_ai_patterns', JSON.stringify(this.patterns));
  }

  analyzeUserBehavior() {
    const insights = {
      preferredDays: this.analyzePreferredDays(),
      seasonalPatterns: this.analyzeSeasonalPatterns(),
      locationPreferences: this.analyzeLocationPreferences(),
      crossAppCorrelations: this.analyzeCrossAppUsage(),
      progressPredictions: this.predictProgress(),
      recommendations: this.generateSmartRecommendations()
    };

    this.patterns = { ...this.patterns, ...insights };
    this.savePatterns();
    
    return insights;
  }

  analyzePreferredDays() {
    const activities = this.analytics.events;
    const dayCount = {};
    
    activities.forEach(event => {
      const day = new Date(event.timestamp).getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    const sortedDays = Object.entries(dayCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      mostActive: sortedDays[0] ? sortedDays[0][0] : null,
      topThree: sortedDays.map(([day]) => day),
      analysis: this.generateDayAnalysis(sortedDays)
    };
  }

  analyzeSeasonalPatterns() {
    const hawkbologyData = this.getTrackerData('hawkbology');
    if (!hawkbologyData) return null;

    const monthlyActivity = {};
    hawkbologyData.forEach(match => {
      if (match.date) {
        const month = parseInt(match.date.split('-')[1]);
        monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
      }
    });

    const peakMonths = Object.entries(monthlyActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      peakMonths: peakMonths.map(([month]) => this.getMonthName(parseInt(month))),
      pattern: this.identifySeasonalPattern(monthlyActivity),
      analysis: this.generateSeasonalAnalysis(peakMonths)
    };
  }

  analyzeLocationPreferences() {
    const insights = {};
    
    // Analyze Hawkbology stadium preferences
    const hawkbologyData = this.getTrackerData('hawkbology');
    if (hawkbologyData) {
      const stadiumFreq = {};
      hawkbologyData.forEach(match => {
        stadiumFreq[match.stadium] = (stadiumFreq[match.stadium] || 0) + 1;
      });
      
      insights.favoriteStadiums = Object.entries(stadiumFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([stadium, count]) => ({ stadium, visits: count }));
    }

    // Analyze Tubology line preferences
    const tubologyData = this.getTrackerData('tubology_stations');
    if (tubologyData) {
      const linePrefs = {};
      tubologyData.filter(s => s.visited).forEach(station => {
        if (station.line) {
          linePrefs[station.line] = (linePrefs[station.line] || 0) + 1;
        }
      });
      
      insights.favoriteLines = Object.entries(linePrefs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([line, count]) => ({ line, visits: count }));
    }

    return insights;
  }

  analyzeCrossAppUsage() {
    const correlations = {};
    const trackerActivity = this.analytics.getActivitySummary(30).trackerActivity;
    
    // Find usage patterns between trackers
    const trackerNames = Object.keys(trackerActivity);
    
    trackerNames.forEach(tracker1 => {
      trackerNames.forEach(tracker2 => {
        if (tracker1 !== tracker2) {
          const correlation = this.calculateCorrelation(tracker1, tracker2);
          if (correlation > 0.5) {
            correlations[`${tracker1}_${tracker2}`] = correlation;
          }
        }
      });
    });

    return {
      strongCorrelations: correlations,
      insights: this.generateCorrelationInsights(correlations),
      recommendations: this.generateCrossAppRecommendations(correlations)
    };
  }

  predictProgress() {
    const predictions = {};
    
    // Predict 92 Club completion
    const ninetyTwoData = this.getTrackerData('92-tracker');
    if (ninetyTwoData) {
      const visited = ninetyTwoData.filter(g => g.visited).length;
      const rate = this.calculateVisitingRate(ninetyTwoData);
      predictions.ninetyTwoClub = {
        current: visited,
        total: 92,
        estimatedCompletion: this.calculateCompletionDate(92 - visited, rate),
        confidence: this.calculateConfidence(rate)
      };
    }

    // Predict Tubology completion
    const tubologyData = this.getTrackerData('tubology_stations');
    if (tubologyData) {
      const visited = tubologyData.filter(s => s.visited).length;
      const rate = this.calculateVisitingRate(tubologyData);
      predictions.tubology = {
        current: visited,
        total: tubologyData.length,
        estimatedCompletion: this.calculateCompletionDate(tubologyData.length - visited, rate),
        confidence: this.calculateConfidence(rate)
      };
    }

    return predictions;
  }

  generateSmartRecommendations() {
    const recommendations = [];
    
    // Location-based recommendations
    const locationRecs = this.generateLocationRecommendations();
    recommendations.push(...locationRecs);
    
    // Timing-based recommendations
    const timingRecs = this.generateTimingRecommendations();
    recommendations.push(...timingRecs);
    
    // Cross-app recommendations
    const crossRecs = this.generateAdvancedCrossAppRecommendations();
    recommendations.push(...crossRecs);
    
    // Goal-based recommendations
    const goalRecs = this.generateGoalRecommendations();
    recommendations.push(...goalRecs);

    return recommendations.slice(0, 10); // Return top 10
  }

  generateLocationRecommendations() {
    const recommendations = [];
    const hawkbologyData = this.getTrackerData('hawkbology');
    const ninetyTwoData = this.getTrackerData('92-tracker');
    
    if (hawkbologyData && ninetyTwoData) {
      // Find stadiums visited near unvisited 92 grounds
      const visitedStadiums = new Set(hawkbologyData.map(m => m.stadium));
      const unvisitedGrounds = ninetyTwoData.filter(g => !g.visited);
      
      unvisitedGrounds.forEach(ground => {
        const nearbyStadiums = this.findNearbyStadiums(ground, hawkbologyData);
        if (nearbyStadiums.length > 0) {
          recommendations.push({
            type: 'location',
            priority: 'high',
            title: `Complete ${ground.team} Ground`,
            message: `You've been to ${nearbyStadiums[0].stadium} nearby`,
            action: 'Plan Visit',
            data: { ground, nearbyStadiums }
          });
        }
      });
    }

    return recommendations;
  }

  generateTimingRecommendations() {
    const recommendations = [];
    const dayPrefs = this.analyzePreferredDays();
    
    if (dayPrefs.mostActive) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        title: `Your ${dayPrefs.mostActive} Routine`,
        message: `You're most active on ${dayPrefs.mostActive}s - perfect for tracking!`,
        action: 'Set Reminder',
        data: { preferredDay: dayPrefs.mostActive }
      });
    }

    return recommendations;
  }

  generateAdvancedCrossAppRecommendations() {
    const recommendations = [];
    const breweryData = this.getTrackerData('brewery-tracker');
    const hawkbologyData = this.getTrackerData('hawkbology');
    
    if (breweryData && hawkbologyData) {
      // Suggest breweries near upcoming matches
      const upcomingMatches = this.getTrackerData('hawkbology_upcoming') || [];
      const unvisitedBreweries = breweryData.filter(b => !b.visited);
      
      upcomingMatches.forEach(match => {
        const nearbyBreweries = this.findNearbyBreweries(match.stadium, unvisitedBreweries);
        if (nearbyBreweries.length > 0) {
          recommendations.push({
            type: 'cross-app',
            priority: 'high',
            title: 'Pre-Match Brewery',
            message: `Visit ${nearbyBreweries[0].name} before ${match.home} vs ${match.away}`,
            action: 'Add to Route',
            data: { match, breweries: nearbyBreweries }
          });
        }
      });
    }

    return recommendations;
  }

  generateGoalRecommendations() {
    const recommendations = [];
    const progress = this.predictProgress();
    
    Object.entries(progress).forEach(([tracker, prediction]) => {
      if (prediction.confidence > 0.7) {
        recommendations.push({
          type: 'goal',
          priority: 'medium',
          title: `${tracker} Completion Goal`,
          message: `At your current pace, you'll finish by ${prediction.estimatedCompletion}`,
          action: 'Set Target',
          data: prediction
        });
      }
    });

    return recommendations;
  }

  // Helper Methods
  getTrackerData(trackerId) {
    const data = localStorage.getItem(trackerId);
    return data ? JSON.parse(data) : null;
  }

  calculateCorrelation(tracker1, tracker2) {
    // Simplified correlation calculation
    const activity1 = this.analytics.events.filter(e => e.trackerName === tracker1).length;
    const activity2 = this.analytics.events.filter(e => e.trackerName === tracker2).length;
    
    if (activity1 === 0 || activity2 === 0) return 0;
    
    // Simple correlation based on usage frequency
    const total = activity1 + activity2;
    const ratio = Math.min(activity1, activity2) / Math.max(activity1, activity2);
    
    return ratio;
  }

  calculateVisitingRate(data) {
    const visited = data.filter(item => item.visited && item.visitedDate);
    if (visited.length < 2) return 0;
    
    const dates = visited.map(item => new Date(item.visitedDate)).sort();
    const daySpan = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
    
    return visited.length / daySpan; // items per day
  }

  calculateCompletionDate(remaining, rate) {
    if (rate === 0) return 'Unknown';
    
    const daysToComplete = remaining / rate;
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToComplete);
    
    return completionDate.toLocaleDateString();
  }

  calculateConfidence(rate) {
    // Simple confidence calculation based on rate consistency
    return Math.min(rate * 100, 0.95);
  }

  findNearbyStadiums(ground, stadiums) {
    // Simplified proximity check - in reality, would use actual coordinates
    const city = this.extractCity(ground.name || ground.team);
    return stadiums.filter(stadium => 
      this.extractCity(stadium.stadium).toLowerCase().includes(city.toLowerCase())
    ).slice(0, 3);
  }

  findNearbyBreweries(stadium, breweries) {
    // Simplified proximity check
    const area = this.extractArea(stadium);
    return breweries.filter(brewery => 
      brewery.area && brewery.area.toLowerCase().includes(area.toLowerCase())
    ).slice(0, 3);
  }

  extractCity(text) {
    // Simple city extraction - would be more sophisticated in production
    const cityKeywords = ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Newcastle'];
    for (const city of cityKeywords) {
      if (text.includes(city)) return city;
    }
    return text.split(' ')[0];
  }

  extractArea(stadium) {
    // Extract area from stadium name
    const londonAreas = ['Arsenal', 'Chelsea', 'Tottenham', 'West Ham', 'Crystal Palace'];
    for (const area of londonAreas) {
      if (stadium.includes(area)) return area;
    }
    return stadium.split(' ')[0];
  }

  getMonthName(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  generateDayAnalysis(sortedDays) {
    if (sortedDays.length === 0) return 'No activity pattern detected';
    
    const [topDay, topCount] = sortedDays[0];
    const totalActivity = sortedDays.reduce((sum, [, count]) => sum + count, 0);
    const percentage = Math.round((topCount / totalActivity) * 100);
    
    return `${percentage}% of your activity happens on ${topDay}s`;
  }

  generateSeasonalAnalysis(peakMonths) {
    if (peakMonths.length === 0) return 'No seasonal pattern detected';
    
    const seasons = {
      'Spring': ['Mar', 'Apr', 'May'],
      'Summer': ['Jun', 'Jul', 'Aug'],
      'Autumn': ['Sep', 'Oct', 'Nov'],
      'Winter': ['Dec', 'Jan', 'Feb']
    };
    
    for (const [season, months] of Object.entries(seasons)) {
      if (months.includes(peakMonths[0][0])) {
        return `Most active during ${season} months`;
      }
    }
    
    return 'Activity varies throughout the year';
  }

  generateCorrelationInsights(correlations) {
    const insights = [];
    
    Object.entries(correlations).forEach(([pair, correlation]) => {
      const [tracker1, tracker2] = pair.split('_');
      insights.push(`High usage correlation between ${tracker1} and ${tracker2} (${Math.round(correlation * 100)}%)`);
    });
    
    return insights;
  }

  generateCrossAppRecommendations(correlations) {
    const recommendations = [];
    
    Object.keys(correlations).forEach(pair => {
      const [tracker1, tracker2] = pair.split('_');
      recommendations.push({
        type: 'usage-pattern',
        title: 'Usage Synergy Detected',
        message: `You often use ${tracker1} and ${tracker2} together`,
        action: 'Explore Integration',
        data: { trackers: [tracker1, tracker2] }
      });
    });
    
    return recommendations;
  }

  identifySeasonalPattern(monthlyActivity) {
    const spring = (monthlyActivity[3] || 0) + (monthlyActivity[4] || 0) + (monthlyActivity[5] || 0);
    const summer = (monthlyActivity[6] || 0) + (monthlyActivity[7] || 0) + (monthlyActivity[8] || 0);
    const autumn = (monthlyActivity[9] || 0) + (monthlyActivity[10] || 0) + (monthlyActivity[11] || 0);
    const winter = (monthlyActivity[12] || 0) + (monthlyActivity[1] || 0) + (monthlyActivity[2] || 0);
    
    const seasons = { Spring: spring, Summer: summer, Autumn: autumn, Winter: winter };
    const peakSeason = Object.entries(seasons).reduce((a, b) => seasons[a[0]] > seasons[b[0]] ? a : b);
    
    return peakSeason[0];
  }
}

// Export the AI Insights Engine
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIInsightsEngine;
} else {
  window.AIInsightsEngine = AIInsightsEngine;
}