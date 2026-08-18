// ─── Smart Recommendations Engine ──────────────────────────────────────────
// Machine learning-inspired recommendation system for 92 Tracker

// ── User Behavior Analytics ──────────────────────────────────────────────────
function analyzeUserBehavior() {
  const visits = Object.entries(state.visits)
    .filter(([id, v]) => v?.date)
    .map(([id, v]) => ({
      id: parseInt(id),
      club: state.clubs.find(c => c.id === parseInt(id)),
      date: new Date(v.date),
      dayOfWeek: new Date(v.date).getDay(),
      month: new Date(v.date).getMonth() + 1,
      hasNotes: v.notes && v.notes.trim().length > 0
    }))
    .sort((a, b) => a.date - b.date);

  if (visits.length < 5) return null;

  // Analyze temporal patterns
  const dayPreferences = [0,0,0,0,0,0,0]; // Sun-Sat
  const monthPreferences = Array(12).fill(0);
  
  visits.forEach(visit => {
    dayPreferences[visit.dayOfWeek]++;
    monthPreferences[visit.month - 1]++;
  });

  // Analyze geographic patterns
  const distancePreferences = { local: 0, regional: 0, national: 0 };
  const regionPreferences = {};
  
  visits.forEach(visit => {
    if (CLUB_COORDS[visit.id]) {
      const distance = haversine(homeLat, homeLng, CLUB_COORDS[visit.id][0], CLUB_COORDS[visit.id][1]);
      if (distance < 50) distancePreferences.local++;
      else if (distance < 150) distancePreferences.regional++;
      else distancePreferences.national++;
    }
    
    // Regional analysis (if REGIONS is available)
    if (typeof REGIONS !== 'undefined') {
      REGIONS.forEach(region => {
        if (region.ids.includes(visit.id)) {
          regionPreferences[region.name] = (regionPreferences[region.name] || 0) + 1;
        }
      });
    }
  });

  // Analyze division and difficulty patterns
  const divisionPreferences = {};
  const difficultyPreferences = { easy: 0, medium: 0, hard: 0 };
  
  visits.forEach(visit => {
    divisionPreferences[visit.club.division] = (divisionPreferences[visit.club.division] || 0) + 1;
    
    const difficulty = getDifficulty(visit.club);
    if (difficulty.label === 'Easy') difficultyPreferences.easy++;
    else if (difficulty.label === 'Medium') difficultyPreferences.medium++;
    else difficultyPreferences.hard++;
  });

  // Calculate user preferences (weights)
  const totalVisits = visits.length;
  
  return {
    temporal: {
      preferredDays: dayPreferences.map((count, i) => ({
        day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i],
        weight: count / totalVisits,
        count
      })).sort((a, b) => b.weight - a.weight),
      preferredMonths: monthPreferences.map((count, i) => ({
        month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
        weight: count / totalVisits,
        count
      })).sort((a, b) => b.weight - a.weight)
    },
    geographic: {
      distanceProfile: Object.entries(distancePreferences).map(([type, count]) => ({
        type,
        weight: count / totalVisits,
        count
      })).sort((a, b) => b.weight - a.weight),
      regionalProfile: Object.entries(regionPreferences).map(([region, count]) => ({
        region,
        weight: count / totalVisits,
        count
      })).sort((a, b) => b.weight - a.weight)
    },
    preferences: {
      divisions: Object.entries(divisionPreferences).map(([division, count]) => ({
        division,
        weight: count / totalVisits,
        count
      })).sort((a, b) => b.weight - a.weight),
      difficulty: Object.entries(difficultyPreferences).map(([difficulty, count]) => ({
        difficulty,
        weight: count / totalVisits,
        count
      })).sort((a, b) => b.weight - a.weight)
    },
    engagement: {
      notesTaking: visits.filter(v => v.hasNotes).length / totalVisits,
      averageVisitsPerMonth: totalVisits / Math.max(1, (new Date() - visits[0].date) / (1000 * 60 * 60 * 24 * 30))
    }
  };
}

// ── Smart Club Recommendations ───────────────────────────────────────────────
function generateSmartClubRecommendations() {
  const behavior = analyzeUserBehavior();
  if (!behavior) return [];

  const unvisited = state.clubs.filter(c => !state.visits[c.id]);
  if (unvisited.length === 0) return [];

  // Score each unvisited club based on user preferences
  const scoredClubs = unvisited.map(club => {
    let score = 0;
    let reasons = [];

    // Division preference scoring
    const divisionPref = behavior.preferences.divisions.find(d => d.division === club.division);
    if (divisionPref) {
      score += divisionPref.weight * 30;
      reasons.push(`You visit ${club.division} grounds often (${Math.round(divisionPref.weight * 100)}% of visits)`);
    }

    // Difficulty preference scoring
    const difficulty = getDifficulty(club);
    const difficultyPref = behavior.preferences.difficulty.find(d => d.difficulty.toLowerCase() === difficulty.label.toLowerCase());
    if (difficultyPref) {
      score += difficultyPref.weight * 25;
      reasons.push(`Matches your ${difficulty.label.toLowerCase()} ground preference`);
    }

    // Geographic preference scoring
    if (CLUB_COORDS[club.id]) {
      const distance = haversine(homeLat, homeLng, CLUB_COORDS[club.id][0], CLUB_COORDS[club.id][1]);
      
      let distanceType = distance < 50 ? 'local' : distance < 150 ? 'regional' : 'national';
      const distancePref = behavior.geographic.distanceProfile.find(d => d.type === distanceType);
      
      if (distancePref) {
        score += distancePref.weight * 20;
        reasons.push(`${distance}km away - fits your ${distanceType} travel pattern`);
      }

      // Regional preference scoring
      if (typeof REGIONS !== 'undefined') {
        REGIONS.forEach(region => {
          if (region.ids.includes(club.id)) {
            const regionPref = behavior.geographic.regionalProfile.find(r => r.region === region.name);
            if (regionPref) {
              score += regionPref.weight * 15;
              reasons.push(`Located in ${region.name} where you visit regularly`);
            }
          }
        });
      }
    }

    // Boost score based on current season context
    const currentMonth = new Date().getMonth() + 1;
    const monthPref = behavior.temporal.preferredMonths.find(m => m.month === 
      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][currentMonth - 1]);
    
    if (monthPref && monthPref.weight > 0.1) {
      score += 10;
      reasons.push(`Good time to visit based on your ${monthPref.month} activity pattern`);
    }

    // Efficiency scoring - clubs near recently visited ones
    const recentVisits = Object.entries(state.visits)
      .filter(([id, v]) => v?.date)
      .sort(([,a], [,b]) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map(([id]) => parseInt(id));

    if (CLUB_COORDS[club.id]) {
      recentVisits.forEach(recentId => {
        if (CLUB_COORDS[recentId]) {
          const distance = haversine(
            CLUB_COORDS[club.id][0], CLUB_COORDS[club.id][1],
            CLUB_COORDS[recentId][0], CLUB_COORDS[recentId][1]
          );
          
          if (distance < 30) {
            score += 15;
            const recentClub = state.clubs.find(c => c.id === recentId);
            reasons.push(`Only ${Math.round(distance)}km from recently visited ${recentClub.name}`);
          }
        }
      });
    }

    // Completion bonuses
    const divisionClubs = state.clubs.filter(c => c.division === club.division);
    const divisionVisited = divisionClubs.filter(c => state.visits[c.id]).length;
    const completionRate = divisionVisited / divisionClubs.length;
    
    if (completionRate > 0.75) {
      score += 20;
      reasons.push(`Help complete ${club.division} (${divisionClubs.length - divisionVisited} remaining)`);
    }

    return {
      club,
      score,
      reasons: reasons.slice(0, 3), // Top 3 reasons
      matchLevel: score > 70 ? 'excellent' : score > 50 ? 'good' : score > 30 ? 'fair' : 'low'
    };
  });

  // Return top recommendations, grouped by match level
  return scoredClubs
    .filter(item => item.score > 20) // Only decent matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 12); // Top 12 recommendations
}

// ── Contextual Recommendations ────────────────────────────────────────────────
function generateContextualRecommendations() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDay();
  const isWeekend = currentDay === 0 || currentDay === 6;
  
  const recommendations = [];
  const unvisited = state.clubs.filter(c => !state.visits[c.id]);
  
  // Weather-based recommendations
  const season = currentMonth >= 3 && currentMonth <= 5 ? 'spring' :
                currentMonth >= 6 && currentMonth <= 8 ? 'summer' :
                currentMonth >= 9 && currentMonth <= 11 ? 'autumn' : 'winter';
  
  if (season === 'summer') {
    const outdoorClubs = unvisited.filter(c => {
      // Prefer clubs with nice stadiums/locations in summer
      const capacity = STADIUM_CAPACITY[c.id] || 15000;
      return capacity < 25000; // Smaller, more intimate grounds
    });
    
    if (outdoorClubs.length > 0) {
      recommendations.push({
        type: 'seasonal',
        title: 'Summer Stadium Tours',
        description: 'Perfect weather for visiting smaller, more intimate grounds with better atmosphere',
        clubs: outdoorClubs.slice(0, 4),
        priority: 'medium',
        icon: '☀️'
      });
    }
  }

  // Distance-optimized recommendations
  if (isWeekend) {
    const clusters = calculateOptimalRoutes();
    if (clusters && clusters.clusters.length > 0) {
      const bestCluster = clusters.clusters[0];
      recommendations.push({
        type: 'efficiency',
        title: 'Weekend Multi-Ground Trip',
        description: `Visit ${bestCluster.clubs.length} grounds in one efficient journey, perfect for a weekend adventure`,
        clubs: bestCluster.clubs.slice(0, 4),
        priority: 'high',
        icon: '🛣️',
        distance: Math.round(bestCluster.totalDistance),
        savings: Math.round((bestCluster.clubs.length * 100) - bestCluster.totalDistance) // Rough savings estimate
      });
    }
  }

  // Achievement-focused recommendations
  const achievementProgress = calculateAchievementProgress();
  if (achievementProgress.length > 0) {
    const topAchievement = achievementProgress[0];
    if (topAchievement.progress > 60) {
      let relevantClubs = [];
      
      // Suggest clubs that help with specific achievements
      if (topAchievement.id === 'weekend_warrior') {
        relevantClubs = unvisited.slice(0, 4); // Any clubs work for weekend visits
      } else if (topAchievement.id === 'long_haul') {
        relevantClubs = unvisited
          .filter(c => CLUB_COORDS[c.id])
          .sort((a, b) => {
            const distA = haversine(homeLat, homeLng, CLUB_COORDS[a.id][0], CLUB_COORDS[a.id][1]);
            const distB = haversine(homeLat, homeLng, CLUB_COORDS[b.id][0], CLUB_COORDS[b.id][1]);
            return distB - distA; // Furthest first
          })
          .slice(0, 4);
      }
      
      if (relevantClubs.length > 0) {
        recommendations.push({
          type: 'achievement',
          title: `${topAchievement.emoji} ${topAchievement.label}`,
          description: `You're ${topAchievement.progress}% complete! These clubs will help you unlock this achievement`,
          clubs: relevantClubs,
          priority: 'medium',
          icon: topAchievement.emoji,
          progress: topAchievement.progress
        });
      }
    }
  }

  // Division completion recommendations
  DIVISIONS.forEach(division => {
    const divisionClubs = state.clubs.filter(c => c.division === division);
    const divisionVisited = divisionClubs.filter(c => state.visits[c.id]).length;
    const divisionRemaining = divisionClubs.filter(c => !state.visits[c.id]);
    const completionRate = divisionVisited / divisionClubs.length;
    
    if (completionRate > 0.6 && completionRate < 1.0 && divisionRemaining.length <= 8) {
      recommendations.push({
        type: 'completion',
        title: `Complete ${division}`,
        description: `Only ${divisionRemaining.length} grounds left to complete this division!`,
        clubs: divisionRemaining.slice(0, 4),
        priority: divisionRemaining.length <= 3 ? 'high' : 'medium',
        icon: '🏆',
        remaining: divisionRemaining.length,
        completionRate: Math.round(completionRate * 100)
      });
    }
  });

  // Trending recommendations based on recent activity
  const recentVisits = Object.entries(state.visits)
    .filter(([id, v]) => v?.date && (now - new Date(v.date)) / (1000 * 60 * 60 * 24) <= 30)
    .map(([id]) => parseInt(id));

  if (recentVisits.length >= 3) {
    // Find clubs in similar regions to recent visits
    const trendingClubs = unvisited.filter(club => {
      if (!CLUB_COORDS[club.id]) return false;
      
      return recentVisits.some(recentId => {
        if (!CLUB_COORDS[recentId]) return false;
        const distance = haversine(
          CLUB_COORDS[club.id][0], CLUB_COORDS[club.id][1],
          CLUB_COORDS[recentId][0], CLUB_COORDS[recentId][1]
        );
        return distance < 75; // Within 75km of recent visits
      });
    });

    if (trendingClubs.length > 0) {
      recommendations.push({
        type: 'trending',
        title: 'Trending in Your Area',
        description: `Based on your recent activity, these grounds are in regions you\'ve been exploring`,
        clubs: trendingClubs.slice(0, 4),
        priority: 'medium',
        icon: '📈'
      });
    }
  }

  return recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 6); // Top 6 contextual recommendations
}

// ── Smart Recommendation Renderer ─────────────────────────────────────────────
function renderSmartRecommendations() {
  const smartClubs = generateSmartClubRecommendations();
  const contextualRecs = generateContextualRecommendations();
  
  if (smartClubs.length === 0 && contextualRecs.length === 0) {
    return `
      <div class="smart-recommendations-container">
        <div class="smart-recs-empty">
          <div class="smart-empty-icon">🤖</div>
          <div class="smart-empty-title">Smart Recommendations</div>
          <div class="smart-empty-subtitle">Visit more grounds to unlock personalized AI recommendations</div>
        </div>
      </div>
    `;
  }

  let recsHTML = `
    <div class="smart-recommendations-container">
      <div class="smart-recs-header">
        <div class="smart-recs-title">🧠 Smart Recommendations</div>
        <div class="smart-recs-subtitle">AI-powered suggestions based on your visiting patterns and preferences</div>
      </div>
  `;

  // Contextual recommendations first (higher priority)
  if (contextualRecs.length > 0) {
    recsHTML += `
      <div class="recs-section">
        <div class="recs-section-title">🎯 Contextual Suggestions</div>
        <div class="contextual-recs-grid">
    `;
    
    contextualRecs.forEach(rec => {
      const priorityClass = rec.priority === 'high' ? 'ctx-rec-high' : 
                           rec.priority === 'medium' ? 'ctx-rec-medium' : 'ctx-rec-low';
      
      recsHTML += `
        <div class="contextual-rec-card ${priorityClass}">
          <div class="ctx-rec-header">
            <div class="ctx-rec-icon">${rec.icon}</div>
            <div class="ctx-rec-info">
              <div class="ctx-rec-title">${rec.title}</div>
              <div class="ctx-rec-type">${rec.type.toUpperCase()}</div>
            </div>
            <div class="ctx-rec-priority">${rec.priority.toUpperCase()}</div>
          </div>
          <div class="ctx-rec-description">${rec.description}</div>
          <div class="ctx-rec-clubs">
            ${rec.clubs.map(club => `
              <div class="ctx-rec-club" onclick="openClubModal(${club.id})">
                <span class="ctx-club-name">${club.name}</span>
                <span class="ctx-club-division">${club.division}</span>
              </div>
            `).join('')}
          </div>
          ${rec.distance ? `
            <div class="ctx-rec-stats">
              <span>📍 ${rec.distance}km total journey</span>
              ${rec.savings ? `<span>💰 ${rec.savings}km savings</span>` : ''}
            </div>
          ` : ''}
          ${rec.progress ? `
            <div class="ctx-rec-progress">
              <div class="ctx-progress-bar">
                <div class="ctx-progress-fill" style="width: ${rec.progress}%"></div>
              </div>
              <span>${rec.progress}% complete</span>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    recsHTML += `
        </div>
      </div>
    `;
  }

  // Smart club recommendations
  if (smartClubs.length > 0) {
    recsHTML += `
      <div class="recs-section">
        <div class="recs-section-title">⚡ Personalized Matches</div>
        <div class="smart-clubs-grid">
    `;
    
    smartClubs.slice(0, 8).forEach(item => {
      const matchClass = item.matchLevel === 'excellent' ? 'match-excellent' :
                        item.matchLevel === 'good' ? 'match-good' :
                        item.matchLevel === 'fair' ? 'match-fair' : 'match-low';
      
      recsHTML += `
        <div class="smart-club-card ${matchClass}" onclick="openClubModal(${item.club.id})">
          <div class="smart-club-header">
            <div class="smart-club-name">${item.club.name}</div>
            <div class="smart-club-division">${item.club.division}</div>
            <div class="smart-match-score">${Math.round(item.score)}%</div>
          </div>
          <div class="smart-club-stadium">${item.club.stadium}</div>
          <div class="smart-match-level">
            <span class="match-indicator"></span>
            ${item.matchLevel.toUpperCase()} MATCH
          </div>
          <div class="smart-reasons">
            ${item.reasons.slice(0, 2).map(reason => `
              <div class="smart-reason">• ${reason}</div>
            `).join('')}
          </div>
        </div>
      `;
    });
    
    recsHTML += `
        </div>
      </div>
    `;
  }

  recsHTML += `
    </div>
  `;

  return recsHTML;
}