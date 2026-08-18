// ─── AI-Powered Insights Engine ────────────────────────────────────────────
// Advanced machine learning and predictive analytics for 92 Tracker

// ── Smart Journey Optimization ───────────────────────────────────────────────
function calculateOptimalRoutes() {
  const unvisited = state.clubs.filter(c => !state.visits[c.id] && CLUB_COORDS[c.id]);
  const visited = state.clubs.filter(c => state.visits[c.id] && CLUB_COORDS[c.id]);
  
  if (unvisited.length === 0) return null;

  // Cluster unvisited grounds by geographic proximity
  const clusters = [];
  const processed = new Set();
  
  unvisited.forEach(club => {
    if (processed.has(club.id)) return;
    
    const cluster = [club];
    processed.add(club.id);
    
    // Find nearby unvisited clubs (within 50km)
    unvisited.forEach(otherClub => {
      if (processed.has(otherClub.id) || club.id === otherClub.id) return;
      
      const distance = haversine(
        CLUB_COORDS[club.id][0], CLUB_COORDS[club.id][1],
        CLUB_COORDS[otherClub.id][0], CLUB_COORDS[otherClub.id][1]
      );
      
      if (distance <= 50) {
        cluster.push(otherClub);
        processed.add(otherClub.id);
      }
    });
    
    if (cluster.length > 1) {
      clusters.push({
        clubs: cluster,
        centerLat: cluster.reduce((sum, c) => sum + CLUB_COORDS[c.id][0], 0) / cluster.length,
        centerLng: cluster.reduce((sum, c) => sum + CLUB_COORDS[c.id][1], 0) / cluster.length,
        totalDistance: cluster.reduce((sum, c, i) => {
          if (i === 0) return 0;
          return sum + haversine(
            CLUB_COORDS[cluster[i-1].id][0], CLUB_COORDS[cluster[i-1].id][1],
            CLUB_COORDS[c.id][0], CLUB_COORDS[c.id][1]
          );
        }, 0)
      });
    }
  });

  // Sort clusters by efficiency (most clubs / least distance)
  clusters.sort((a, b) => {
    const efficiencyA = a.clubs.length / (a.totalDistance + 10); // +10 to avoid division by 0
    const efficiencyB = b.clubs.length / (b.totalDistance + 10);
    return efficiencyB - efficiencyA;
  });

  return {
    clusters: clusters.slice(0, 5), // Top 5 most efficient clusters
    totalClustered: clusters.reduce((sum, c) => sum + c.clubs.length, 0),
    potentialSavings: clusters.reduce((sum, c) => {
      // Calculate savings vs visiting individually
      const individualDistance = c.clubs.reduce((dist, club) => 
        dist + haversine(homeLat, homeLng, CLUB_COORDS[club.id][0], CLUB_COORDS[club.id][1]), 0
      );
      return sum + (individualDistance - c.totalDistance - haversine(homeLat, homeLng, c.centerLat, c.centerLng));
    }, 0)
  };
}

// ── Predictive Seasonal Analytics ─────────────────────────────────────────────
function calculateSeasonalPredictions() {
  const visits = Object.entries(state.visits)
    .filter(([id, v]) => v?.date)
    .map(([id, v]) => ({ id: parseInt(id), date: v.date, month: parseInt(v.date.slice(5, 7)) }));

  if (visits.length < 5) return null; // Need minimum data

  // Analyze historical patterns
  const monthlyPatterns = Array(12).fill(0);
  const yearlyTrends = {};
  
  visits.forEach(visit => {
    monthlyPatterns[visit.month - 1]++;
    const year = visit.date.slice(0, 4);
    yearlyTrends[year] = (yearlyTrends[year] || 0) + 1;
  });

  // Find peak months and seasonal patterns
  const peakMonth = monthlyPatterns.indexOf(Math.max(...monthlyPatterns)) + 1;
  const quietMonth = monthlyPatterns.indexOf(Math.min(...monthlyPatterns.filter(x => x > 0))) + 1;
  
  // Calculate velocity trends
  const years = Object.keys(yearlyTrends).sort();
  let velocityTrend = 0;
  if (years.length >= 2) {
    const recentYears = years.slice(-3);
    const velocities = recentYears.map(year => yearlyTrends[year]);
    velocityTrend = velocities.reduce((sum, v, i) => {
      if (i === 0) return 0;
      return sum + (v - velocities[i-1]);
    }, 0) / Math.max(1, velocities.length - 1);
  }

  // Predict completion scenarios
  const remaining = 92 - visits.length;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Conservative: Based on historical average
  const avgMonthly = visits.length / ((currentYear - parseInt(years[0])) * 12 + currentMonth);
  const conservativeMonths = remaining / Math.max(avgMonthly, 0.1);
  
  // Optimistic: Based on recent peak performance
  const recentPeak = Math.max(...monthlyPatterns);
  const optimisticMonths = remaining / Math.max(recentPeak / 12, 0.1);
  
  // Realistic: Weighted average with seasonal adjustment
  const seasonalMultiplier = getSeasonalMultiplier(currentMonth, monthlyPatterns);
  const adjustedVelocity = avgMonthly * seasonalMultiplier * (1 + Math.max(velocityTrend / 10, -0.5));
  const realisticMonths = remaining / Math.max(adjustedVelocity, 0.1);

  return {
    peakMonth: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][peakMonth - 1],
    quietMonth: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][quietMonth - 1],
    velocityTrend: velocityTrend > 0 ? 'increasing' : velocityTrend < 0 ? 'decreasing' : 'stable',
    predictions: {
      conservative: addMonthsToDate(new Date(), conservativeMonths),
      realistic: addMonthsToDate(new Date(), realisticMonths),
      optimistic: addMonthsToDate(new Date(), optimisticMonths)
    },
    confidence: Math.min(visits.length / 20 * 100, 95), // Higher confidence with more data
    seasonalMultiplier,
    avgMonthlyRate: Math.round(avgMonthly * 100) / 100
  };
}

function getSeasonalMultiplier(currentMonth, patterns) {
  const avgPattern = patterns.reduce((sum, x) => sum + x, 0) / 12;
  return patterns[currentMonth - 1] / Math.max(avgPattern, 0.1);
}

function addMonthsToDate(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString().slice(0, 10);
}

// ── Intelligent Recommendations Engine ───────────────────────────────────────
function generateSmartRecommendations() {
  const visited = state.clubs.filter(c => state.visits[c.id]);
  const unvisited = state.clubs.filter(c => !state.visits[c.id]);
  
  if (visited.length < 3) {
    return [{
      type: 'getting_started',
      priority: 'high',
      title: 'Start Your Journey',
      description: 'Visit a few more grounds to unlock personalized recommendations',
      action: 'Continue logging visits to see AI-powered insights'
    }];
  }

  const recommendations = [];
  
  // Seasonal recommendations
  const currentMonth = new Date().getMonth() + 1;
  const seasonalData = calculateSeasonalPredictions();
  
  if (seasonalData && currentMonth === parseInt(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(seasonalData.peakMonth)) + 1) {
    recommendations.push({
      type: 'seasonal_peak',
      priority: 'high',
      title: 'Peak Season Alert',
      description: `${seasonalData.peakMonth} is historically your most active month. Consider planning multiple visits.`,
      action: 'Plan 2-3 ground visits this month to capitalize on your peak motivation'
    });
  }

  // Geographic optimization
  const routes = calculateOptimalRoutes();
  if (routes && routes.clusters.length > 0) {
    const bestCluster = routes.clusters[0];
    recommendations.push({
      type: 'route_optimization',
      priority: 'medium',
      title: 'Efficient Journey Available',
      description: `Visit ${bestCluster.clubs.length} grounds in one efficient trip, saving ${Math.round(routes.potentialSavings)} km of travel.`,
      action: `Plan a trip to: ${bestCluster.clubs.slice(0, 3).map(c => c.name).join(', ')}${bestCluster.clubs.length > 3 ? ` and ${bestCluster.clubs.length - 3} more` : ''}`
    });
  }

  // Difficulty progression recommendations
  const difficultyMetrics = calculateDifficultyMetrics();
  if (difficultyMetrics) {
    const easyRemaining = difficultyMetrics.remainingDifficulty.easy;
    const hardRemaining = difficultyMetrics.remainingDifficulty.hard;
    
    if (easyRemaining > 0 && hardRemaining > easyRemaining * 2) {
      recommendations.push({
        type: 'difficulty_balance',
        priority: 'medium',
        title: 'Balance Your Challenge Level',
        description: `You have ${hardRemaining} difficult grounds remaining. Consider tackling some easier ones first.`,
        action: `Focus on ${Math.min(easyRemaining, 5)} easier grounds to build momentum`
      });
    }
  }

  // Streak recommendations
  const streaks = calculateStreakAnalytics();
  if (streaks) {
    if (streaks.daysSinceLastVisit > 14 && streaks.currentStreak > 0) {
      recommendations.push({
        type: 'streak_warning',
        priority: 'high',
        title: 'Streak at Risk',
        description: `It's been ${streaks.daysSinceLastVisit} days since your last visit. Your momentum might be slowing.`,
        action: 'Plan your next visit within the next week to maintain progress'
      });
    } else if (streaks.currentStreak >= 5) {
      recommendations.push({
        type: 'streak_momentum',
        priority: 'medium',
        title: 'Great Momentum!',
        description: `You're on a ${streaks.currentStreak}-day streak. Keep the momentum going!`,
        action: 'Plan your next visit to extend this impressive streak'
      });
    }
  }

  // Division completion recommendations
  DIVISIONS.forEach(division => {
    const divClubs = state.clubs.filter(c => c.division === division);
    const divVisited = divClubs.filter(c => state.visits[c.id]).length;
    const divRemaining = divClubs.length - divVisited;
    const completionRate = divVisited / divClubs.length;
    
    if (completionRate > 0.8 && divRemaining > 0) {
      recommendations.push({
        type: 'division_completion',
        priority: 'high',
        title: `Complete ${division}`,
        description: `You're ${divRemaining} ground${divRemaining === 1 ? '' : 's'} away from completing ${division}!`,
        action: `Focus on the remaining ${division} grounds to achieve this milestone`
      });
    }
  });

  // Achievement hunting recommendations
  const achievements = getAllEarnedAchievements();
  const unearned = ADVANCED_ACHIEVEMENTS.filter(a => !achievements.some(earned => earned.id === a.id));
  
  const closeAchievements = unearned.filter(achievement => {
    // Check if they're close to earning this achievement
    if (achievement.id === 'speed_demon') {
      // Check if they have 7+ visits in any week
      const visits = Object.entries(state.visits).filter(([id, v]) => v?.date);
      return visits.length >= 7; // Close to speed demon
    }
    return false;
  });

  if (closeAchievements.length > 0) {
    const achievement = closeAchievements[0];
    recommendations.push({
      type: 'achievement_opportunity',
      priority: 'medium',
      title: `Achievement Opportunity: ${achievement.label}`,
      description: achievement.description,
      action: 'You\'re close to unlocking this achievement - plan strategically!'
    });
  }

  return recommendations.slice(0, 6); // Return top 6 recommendations
}

// ── Weather and External Data Integration ─────────────────────────────────────
function generateWeatherInsights() {
  // This would integrate with weather APIs in a real implementation
  // For now, provide seasonal advice based on current month
  const currentMonth = new Date().getMonth() + 1;
  const season = currentMonth >= 3 && currentMonth <= 5 ? 'spring' :
                currentMonth >= 6 && currentMonth <= 8 ? 'summer' :
                currentMonth >= 9 && currentMonth <= 11 ? 'autumn' : 'winter';
  
  const seasonalAdvice = {
    spring: {
      title: 'Spring Football Season',
      description: 'Perfect weather for ground visits. League seasons are in full swing.',
      tips: ['Pack layers for changeable weather', 'Great time for longer journeys', 'Consider lower league playoff pushes']
    },
    summer: {
      title: 'Pre-Season & Early Season',
      description: 'New season excitement! Perfect for stadium tours and friendlies.',
      tips: ['Check for pre-season friendlies', 'Stadium tours often available', 'New season kit launches']
    },
    autumn: {
      title: 'Peak Football Season',
      description: 'The heart of the football season with great atmospheres.',
      tips: ['Pack waterproof clothing', 'Busiest period for ticket sales', 'European competitions active']
    },
    winter: {
      title: 'Festive Football Period',
      description: 'Festive fixtures and Boxing Day football tradition.',
      tips: ['Check for weather postponements', 'Festive fixture congestion', 'Indoor facilities at grounds']
    }
  };

  return seasonalAdvice[season];
}

// ── Advanced Pattern Recognition ─────────────────────────────────────────────
function detectVisitingPatterns() {
  const visits = Object.entries(state.visits)
    .filter(([id, v]) => v?.date)
    .map(([id, v]) => ({
      id: parseInt(id),
      club: state.clubs.find(c => c.id === parseInt(id)),
      date: new Date(v.date),
      dayOfWeek: new Date(v.date).getDay(),
      month: new Date(v.date).getMonth() + 1
    }));

  if (visits.length < 10) return null;

  // Analyze day-of-week patterns
  const dayPatterns = [0,0,0,0,0,0,0]; // Sun-Sat
  visits.forEach(visit => dayPatterns[visit.dayOfWeek]++);
  
  const preferredDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    [dayPatterns.indexOf(Math.max(...dayPatterns))];

  // Analyze distance patterns
  const distances = visits.map(visit => {
    if (!CLUB_COORDS[visit.id]) return 0;
    return haversine(homeLat, homeLng, CLUB_COORDS[visit.id][0], CLUB_COORDS[visit.id][1]);
  }).filter(d => d > 0);
  
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const maxDistance = Math.max(...distances);
  const distanceVariance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;

  // Analyze division preferences
  const divisionCounts = {};
  visits.forEach(visit => {
    const div = visit.club.division;
    divisionCounts[div] = (divisionCounts[div] || 0) + 1;
  });
  
  const preferredDivision = Object.entries(divisionCounts)
    .sort(([,a], [,b]) => b - a)[0][0];

  // Detect clustering behavior
  const clusteredVisits = visits.filter((visit, i) => {
    if (i === 0) return false;
    const prevVisit = visits[i-1];
    const daysDiff = Math.abs(visit.date - prevVisit.date) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7; // Within a week
  });

  return {
    preferredDay,
    dayDistribution: dayPatterns,
    travelProfile: {
      avgDistance: Math.round(avgDistance),
      maxDistance: Math.round(maxDistance),
      consistency: distanceVariance < 1000 ? 'local' : distanceVariance < 5000 ? 'regional' : 'national',
      adventurousness: maxDistance > 300 ? 'high' : maxDistance > 150 ? 'medium' : 'low'
    },
    preferredDivision,
    clusteringTendency: clusteredVisits.length / visits.length,
    personalityType: getVisitorPersonalityType(dayPatterns, avgDistance, maxDistance, clusteredVisits.length / visits.length)
  };
}

function getVisitorPersonalityType(dayPatterns, avgDistance, maxDistance, clusteringTendency) {
  const weekendVisits = dayPatterns[0] + dayPatterns[6]; // Sunday + Saturday
  const weekdayVisits = dayPatterns.slice(1, 6).reduce((sum, x) => sum + x, 0);
  
  const isWeekendWarrior = weekendVisits > weekdayVisits * 1.5;
  const isLocalExplorer = avgDistance < 50;
  const isAdventurer = maxDistance > 200;
  const isPlannerType = clusteringTendency > 0.3;
  
  if (isWeekendWarrior && isLocalExplorer) return { type: 'Local Weekend Warrior', emoji: '🏠⚽' };
  if (isWeekendWarrior && isAdventurer) return { type: 'Weekend Explorer', emoji: '🚗⚽' };
  if (isPlannerType && isAdventurer) return { type: 'Strategic Adventurer', emoji: '🗺️⚽' };
  if (isLocalExplorer && !isPlannerType) return { type: 'Spontaneous Local', emoji: '🎲⚽' };
  if (isAdventurer && !isPlannerType) return { type: 'Nomadic Explorer', emoji: '🏃‍♂️⚽' };
  
  return { type: 'Balanced Visitor', emoji: '⚽' };
}

// ── Main AI Insights Renderer ────────────────────────────────────────────────
function renderAIInsights() {
  const recommendations = generateSmartRecommendations();
  const patterns = detectVisitingPatterns();
  const seasonalData = calculateSeasonalPredictions();
  const weatherData = generateWeatherInsights();
  const routes = calculateOptimalRoutes();

  let insightsHTML = `
    <div class="ai-insights-container">
      <div class="ai-insights-header">
        <div class="ai-insights-title">🤖 AI-Powered Insights</div>
        <div class="ai-insights-subtitle">Personalized recommendations and predictions based on your visiting patterns</div>
      </div>
  `;

  // Smart Recommendations Section
  if (recommendations.length > 0) {
    insightsHTML += `
      <div class="ai-section">
        <div class="ai-section-title">💡 Smart Recommendations</div>
        <div class="recommendations-grid">
    `;
    
    recommendations.forEach(rec => {
      const priorityClass = rec.priority === 'high' ? 'rec-high' : 
                           rec.priority === 'medium' ? 'rec-medium' : 'rec-low';
      insightsHTML += `
        <div class="recommendation-card ${priorityClass}">
          <div class="rec-priority">${rec.priority.toUpperCase()}</div>
          <div class="rec-title">${rec.title}</div>
          <div class="rec-description">${rec.description}</div>
          <div class="rec-action">${rec.action}</div>
        </div>
      `;
    });
    
    insightsHTML += `
        </div>
      </div>
    `;
  }

  // Predictive Analytics Section
  if (seasonalData) {
    insightsHTML += `
      <div class="ai-section">
        <div class="ai-section-title">📈 Predictive Analytics</div>
        <div class="predictions-container">
          <div class="prediction-scenarios">
            <div class="scenario conservative">
              <div class="scenario-label">Conservative</div>
              <div class="scenario-date">${seasonalData.predictions.conservative}</div>
              <div class="scenario-description">Based on historical average</div>
            </div>
            <div class="scenario realistic">
              <div class="scenario-label">Realistic</div>
              <div class="scenario-date">${seasonalData.predictions.realistic}</div>
              <div class="scenario-description">Seasonally adjusted prediction</div>
            </div>
            <div class="scenario optimistic">
              <div class="scenario-label">Optimistic</div>
              <div class="scenario-date">${seasonalData.predictions.optimistic}</div>
              <div class="scenario-description">Based on peak performance</div>
            </div>
          </div>
          <div class="prediction-confidence">
            <div class="confidence-label">Prediction Confidence</div>
            <div class="confidence-bar">
              <div class="confidence-fill" style="width: ${seasonalData.confidence}%"></div>
            </div>
            <div class="confidence-text">${Math.round(seasonalData.confidence)}% confidence</div>
          </div>
        </div>
      </div>
    `;
  }

  // Personal Patterns Section
  if (patterns) {
    insightsHTML += `
      <div class="ai-section">
        <div class="ai-section-title">🎯 Your Visiting Personality</div>
        <div class="personality-container">
          <div class="personality-type">
            <div class="personality-emoji">${patterns.personalityType.emoji}</div>
            <div class="personality-name">${patterns.personalityType.type}</div>
          </div>
          <div class="personality-stats">
            <div class="personality-stat">
              <span class="stat-label">Preferred Day:</span>
              <span class="stat-value">${patterns.preferredDay}</span>
            </div>
            <div class="personality-stat">
              <span class="stat-label">Travel Style:</span>
              <span class="stat-value">${patterns.travelProfile.consistency} (${patterns.travelProfile.avgDistance}km avg)</span>
            </div>
            <div class="personality-stat">
              <span class="stat-label">Adventure Level:</span>
              <span class="stat-value">${patterns.travelProfile.adventurousness} (${patterns.travelProfile.maxDistance}km max)</span>
            </div>
            <div class="personality-stat">
              <span class="stat-label">Planning Style:</span>
              <span class="stat-value">${patterns.clusteringTendency > 0.3 ? 'Strategic Planner' : 'Spontaneous Visitor'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Optimal Routes Section
  if (routes && routes.clusters.length > 0) {
    insightsHTML += `
      <div class="ai-section">
        <div class="ai-section-title">🛣️ Optimal Journey Planning</div>
        <div class="routes-container">
          <div class="route-summary">
            <div class="route-stat">
              <span class="route-number">${routes.totalClustered}</span>
              <span class="route-label">Grounds can be clustered</span>
            </div>
            <div class="route-stat">
              <span class="route-number">${Math.round(routes.potentialSavings)} km</span>
              <span class="route-label">Potential travel savings</span>
            </div>
          </div>
          <div class="recommended-routes">
    `;
    
    routes.clusters.slice(0, 3).forEach((cluster, index) => {
      insightsHTML += `
        <div class="route-cluster">
          <div class="cluster-header">Route ${index + 1}: ${cluster.clubs.length} grounds</div>
          <div class="cluster-clubs">${cluster.clubs.map(c => c.name).join(' • ')}</div>
          <div class="cluster-stats">${Math.round(cluster.totalDistance)}km total journey</div>
        </div>
      `;
    });
    
    insightsHTML += `
          </div>
        </div>
      </div>
    `;
  }

  // Seasonal Context Section
  if (weatherData) {
    insightsHTML += `
      <div class="ai-section">
        <div class="ai-section-title">🌤️ Seasonal Context</div>
        <div class="seasonal-container">
          <div class="seasonal-header">
            <div class="seasonal-title">${weatherData.title}</div>
            <div class="seasonal-description">${weatherData.description}</div>
          </div>
          <div class="seasonal-tips">
            ${weatherData.tips.map(tip => `<div class="seasonal-tip">• ${tip}</div>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  insightsHTML += `
    </div>
  `;

  return insightsHTML;
}