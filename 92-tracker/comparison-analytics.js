// ─── Comparison & Advanced Analytics System ──────────────────────────────────

// ── Seasonal Comparison Analytics ─────────────────────────────────────────────
function generateSeasonalAnalytics() {
  const visits = Object.entries(state.visits)
    .filter(([id, v]) => v?.date)
    .map(([id, v]) => ({ id: parseInt(id), ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!visits.length) return null;

  // Group by football season (Aug-May)
  const seasonalData = {};
  visits.forEach(visit => {
    const date = new Date(visit.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    
    // Football season runs Aug-May, so Aug-Dec is current year, Jan-May is next year's season
    const seasonYear = month >= 8 ? year : year - 1;
    const seasonKey = `${seasonYear}-${seasonYear + 1}`;
    
    if (!seasonalData[seasonKey]) {
      seasonalData[seasonKey] = {
        visits: [],
        divisions: { 'Premier League': 0, 'Championship': 0, 'League One': 0, 'League Two': 0 },
        months: Array(12).fill(0)
      };
    }
    
    seasonalData[seasonKey].visits.push(visit);
    
    const club = state.clubs.find(c => c.id === visit.id);
    if (club) {
      seasonalData[seasonKey].divisions[club.division]++;
    }
    
    seasonalData[seasonKey].months[month - 1]++;
  });

  return seasonalData;
}

// ── Division Performance Analytics ────────────────────────────────────────────
function analyzeDivisionPerformance() {
  const divisions = ['Premier League', 'Championship', 'League One', 'League Two'];
  const analysis = {};
  
  divisions.forEach(division => {
    const divisionClubs = state.clubs.filter(c => c.division === division);
    const visitedClubs = divisionClubs.filter(c => state.visits[c.id]);
    const totalClubs = divisionClubs.length;
    const visitedCount = visitedClubs.length;
    const completionRate = totalClubs > 0 ? (visitedCount / totalClubs) * 100 : 0;
    
    // Calculate average days to visit clubs in this division
    const visitDates = visitedClubs
      .map(c => state.visits[c.id].date)
      .filter(Boolean)
      .sort();
    
    let averageDaysBetweenVisits = 0;
    if (visitDates.length > 1) {
      const totalDays = visitDates.reduce((total, date, index) => {
        if (index === 0) return 0;
        const current = new Date(date);
        const previous = new Date(visitDates[index - 1]);
        return total + (current - previous) / (1000 * 60 * 60 * 24);
      }, 0);
      averageDaysBetweenVisits = Math.round(totalDays / (visitDates.length - 1));
    }
    
    // Find most difficult remaining grounds
    const remaining = divisionClubs.filter(c => !state.visits[c.id]);
    const difficultRemaining = remaining
      .map(c => ({ ...c, difficulty: getDifficulty(c) }))
      .sort((a, b) => {
        const scoreA = a.difficulty.label === 'Hard' ? 3 : a.difficulty.label === 'Medium' ? 2 : 1;
        const scoreB = b.difficulty.label === 'Hard' ? 3 : b.difficulty.label === 'Medium' ? 2 : 1;
        return scoreB - scoreA;
      })
      .slice(0, 3);
    
    analysis[division] = {
      totalClubs,
      visitedCount,
      remainingCount: totalClubs - visitedCount,
      completionRate: Math.round(completionRate),
      averageDaysBetweenVisits,
      difficultRemaining,
      firstVisit: visitDates[0] || null,
      lastVisit: visitDates[visitDates.length - 1] || null
    };
  });
  
  return analysis;
}

// ── Regional Performance Analytics ────────────────────────────────────────────
function analyzeRegionalPerformance() {
  if (typeof REGIONS === 'undefined') return null;
  
  const analysis = REGIONS.map(region => {
    const regionClubs = state.clubs.filter(c => region.ids.includes(Number(c.id)));
    const visitedClubs = regionClubs.filter(c => state.visits[c.id]);
    const totalClubs = regionClubs.length;
    const visitedCount = visitedClubs.length;
    const completionRate = totalClubs > 0 ? (visitedCount / totalClubs) * 100 : 0;
    
    // Calculate travel efficiency for this region
    let totalRegionDistance = 0;
    let regionVisitCount = 0;
    
    if (visitedClubs.length > 0 && typeof CLUB_COORDS !== 'undefined') {
      visitedClubs.forEach(club => {
        if (CLUB_COORDS[club.id]) {
          const distance = haversine(
            homeLat, homeLng,
            CLUB_COORDS[club.id][0], CLUB_COORDS[club.id][1]
          );
          totalRegionDistance += distance;
          regionVisitCount++;
        }
      });
    }
    
    const averageDistance = regionVisitCount > 0 ? Math.round(totalRegionDistance / regionVisitCount) : 0;
    
    // Find the most recent visit in this region
    const regionVisitDates = visitedClubs
      .map(c => state.visits[c.id].date)
      .filter(Boolean)
      .sort();
    
    return {
      name: region.name,
      emoji: region.emoji,
      totalClubs,
      visitedCount,
      remainingCount: totalClubs - visitedCount,
      completionRate: Math.round(completionRate),
      averageDistance,
      lastVisit: regionVisitDates[regionVisitDates.length - 1] || null,
      remaining: regionClubs.filter(c => !state.visits[c.id])
    };
  }).sort((a, b) => b.completionRate - a.completionRate);
  
  return analysis;
}

// ── Temporal Pattern Analysis ────────────────────────────────────────────────
function analyzeTemporalPatterns() {
  const visits = Object.values(state.visits)
    .filter(v => v && v.date)
    .map(v => ({ ...v, date: new Date(v.date) }))
    .sort((a, b) => a.date - b.date);
  
  if (!visits.length) return null;
  
  // Day of week analysis
  const dayOfWeekCounts = Array(7).fill(0);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Month analysis
  const monthCounts = Array(12).fill(0);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Hour analysis (if time data available)
  const hourCounts = Array(24).fill(0);
  
  visits.forEach(visit => {
    dayOfWeekCounts[visit.date.getDay()]++;
    monthCounts[visit.date.getMonth()]++;
    
    // Extract hour if time is in the date string (ISO format)
    if (visit.date.getHours) {
      hourCounts[visit.date.getHours()]++;
    } else if (typeof visit.time === 'string') {
      const hour = parseInt(visit.time.split(':')[0]);
      if (!isNaN(hour)) hourCounts[hour]++;
    }
  });
  
  // Find peak patterns
  const peakDay = dayNames[dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts))];
  const peakMonth = monthNames[monthCounts.indexOf(Math.max(...monthCounts))];
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  
  // Calculate visit velocity over time
  const velocityPeriods = [];
  const periodLength = 30; // days
  
  for (let i = 0; i < visits.length - 1; i += 10) {
    const periodStart = visits[i].date;
    const periodEnd = new Date(periodStart.getTime() + (periodLength * 24 * 60 * 60 * 1000));
    
    const visitsInPeriod = visits.filter(v => v.date >= periodStart && v.date < periodEnd).length;
    const velocity = visitsInPeriod / periodLength * 30; // visits per 30 days
    
    velocityPeriods.push({
      startDate: periodStart.toISOString().slice(0, 10),
      velocity: Math.round(velocity * 10) / 10
    });
  }
  
  return {
    dayOfWeek: {
      counts: dayOfWeekCounts,
      labels: dayNames,
      peak: peakDay,
      peakCount: Math.max(...dayOfWeekCounts)
    },
    month: {
      counts: monthCounts,
      labels: monthNames,
      peak: peakMonth,
      peakCount: Math.max(...monthCounts)
    },
    hour: {
      counts: hourCounts,
      peak: peakHour,
      peakCount: Math.max(...hourCounts)
    },
    velocity: velocityPeriods
  };
}

// ── Predictive Analytics ──────────────────────────────────────────────────────
function generatePredictions() {
  const visits = Object.values(state.visits)
    .filter(v => v && v.date)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  if (visits.length < 5) return null; // Need minimum data for predictions
  
  const remaining = 92 - visits.length;
  if (remaining <= 0) return { message: "Congratulations! You've completed the 92!" };
  
  // Calculate recent velocity (last 90 days)
  const recentDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recentVisits = visits.filter(v => new Date(v.date) >= recentDate);
  const recentVelocity = recentVisits.length / 90; // visits per day
  
  // Calculate overall velocity
  const firstVisit = new Date(visits[0].date);
  const daysSinceStart = (Date.now() - firstVisit.getTime()) / (1000 * 60 * 60 * 24);
  const overallVelocity = visits.length / daysSinceStart;
  
  // Use weighted average of recent and overall velocity
  const predictedVelocity = (recentVelocity * 0.7) + (overallVelocity * 0.3);
  const daysToComplete = remaining / Math.max(predictedVelocity, 0.001);
  
  const completionDate = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);
  
  // Seasonal adjustment
  const currentMonth = new Date().getMonth();
  const seasonalMultiplier = [0.8, 0.9, 1.1, 1.2, 1.1, 0.9, 0.8, 1.0, 1.2, 1.1, 1.0, 0.7][currentMonth];
  const seasonallyAdjustedDate = new Date(completionDate.getTime() * seasonalMultiplier);
  
  // Difficulty adjustment
  const remainingClubs = state.clubs.filter(c => !state.visits[c.id]);
  const difficultyScore = remainingClubs.reduce((score, club) => {
    const difficulty = getDifficulty(club);
    return score + (difficulty.label === 'Hard' ? 3 : difficulty.label === 'Medium' ? 2 : 1);
  }, 0) / remainingClubs.length;
  
  const difficultyMultiplier = 1 + (difficultyScore - 1.5) * 0.2; // Adjust based on average difficulty
  const finalPrediction = new Date(seasonallyAdjustedDate.getTime() * difficultyMultiplier);
  
  return {
    remainingGrounds: remaining,
    predictedDays: Math.round(daysToComplete),
    completionDate: finalPrediction.toISOString().slice(0, 10),
    recentVelocity: Math.round(recentVelocity * 30 * 10) / 10, // per month
    overallVelocity: Math.round(overallVelocity * 30 * 10) / 10, // per month
    difficultyScore: Math.round(difficultyScore * 10) / 10,
    seasonalFactor: seasonalMultiplier,
    confidence: Math.min(100, Math.max(20, visits.length * 2)) // Based on data points
  };
}

// ── Render Comparison Analytics ───────────────────────────────────────────────
function renderComparisonAnalytics() {
  const seasonal = generateSeasonalAnalytics();
  const divisional = analyzeDivisionPerformance();
  const regional = analyzeRegionalPerformance();
  const temporal = analyzeTemporalPatterns();
  const predictions = generatePredictions();
  
  let html = '';
  
  // Seasonal Comparison
  if (seasonal && Object.keys(seasonal).length > 1) {
    const seasons = Object.keys(seasonal).sort();
    const currentSeason = seasons[seasons.length - 1];
    const previousSeason = seasons[seasons.length - 2];
    
    if (previousSeason) {
      const currentCount = seasonal[currentSeason].visits.length;
      const previousCount = seasonal[previousSeason].visits.length;
      const improvement = currentCount - previousCount;
      
      html += `
        <div class="stats-section">
          <div class="stats-section-title">📊 Season Comparison</div>
          <div class="season-comparison">
            <div class="season-card current-season">
              <div class="season-label">Current (${currentSeason})</div>
              <div class="season-value">${currentCount} visits</div>
            </div>
            <div class="season-comparison-arrow ${improvement >= 0 ? 'positive' : 'negative'}">
              ${improvement >= 0 ? '↗' : '↘'} ${Math.abs(improvement)}
            </div>
            <div class="season-card previous-season">
              <div class="season-label">Previous (${previousSeason})</div>
              <div class="season-value">${previousCount} visits</div>
            </div>
          </div>
        </div>`;
    }
  }
  
  // Division Performance
  if (divisional) {
    html += `
      <div class="stats-section">
        <div class="stats-section-title">🏆 Division Performance</div>
        <div class="division-performance-grid">
          ${Object.entries(divisional).map(([division, data]) => `
            <div class="division-performance-card">
              <div class="division-performance-header">
                <span class="division-name ${DIV_COLORS[division]}">${division.replace(' League', '').replace('Premier', 'PL')}</span>
                <span class="completion-rate">${data.completionRate}%</span>
              </div>
              <div class="progress-bar-thin">
                <div class="progress-fill-thin" style="width: ${data.completionRate}%; background: var(--${division.toLowerCase().replace(' ', '-')})"></div>
              </div>
              <div class="division-stats-mini">
                <span>${data.visitedCount}/${data.totalClubs}</span>
                ${data.averageDaysBetweenVisits > 0 ? `<span>${data.averageDaysBetweenVisits}d avg</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }
  
  // Temporal Patterns
  if (temporal) {
    const maxDayCount = Math.max(...temporal.dayOfWeek.counts);
    const maxMonthCount = Math.max(...temporal.month.counts);
    
    html += `
      <div class="stats-section">
        <div class="stats-section-title">📅 Visiting Patterns</div>
        <div class="pattern-analysis-grid">
          <div class="pattern-card">
            <h4>By Day of Week</h4>
            <div class="pattern-bars">
              ${temporal.dayOfWeek.counts.map((count, i) => `
                <div class="pattern-bar-container">
                  <div class="pattern-bar" style="height: ${(count/maxDayCount) * 60}px"></div>
                  <div class="pattern-label">${temporal.dayOfWeek.labels[i].slice(0,3)}</div>
                </div>
              `).join('')}
            </div>
            <div class="pattern-insight">Peak: ${temporal.dayOfWeek.peak} (${temporal.dayOfWeek.peakCount} visits)</div>
          </div>
          
          <div class="pattern-card">
            <h4>By Month</h4>
            <div class="pattern-bars">
              ${temporal.month.counts.map((count, i) => `
                <div class="pattern-bar-container">
                  <div class="pattern-bar" style="height: ${(count/maxMonthCount) * 60}px"></div>
                  <div class="pattern-label">${temporal.month.labels[i]}</div>
                </div>
              `).join('')}
            </div>
            <div class="pattern-insight">Peak: ${temporal.month.peak} (${temporal.month.peakCount} visits)</div>
          </div>
        </div>
      </div>`;
  }
  
  // Predictions
  if (predictions && predictions.remainingGrounds > 0) {
    html += `
      <div class="stats-section">
        <div class="stats-section-title">🔮 Predictions</div>
        <div class="prediction-dashboard">
          <div class="prediction-main">
            <div class="prediction-date">${predictions.completionDate}</div>
            <div class="prediction-label">Predicted completion date</div>
            <div class="prediction-confidence">Confidence: ${predictions.confidence}%</div>
          </div>
          <div class="prediction-factors">
            <div class="prediction-factor">
              <span class="factor-label">Recent pace</span>
              <span class="factor-value">${predictions.recentVelocity}/month</span>
            </div>
            <div class="prediction-factor">
              <span class="factor-label">Overall pace</span>
              <span class="factor-value">${predictions.overallVelocity}/month</span>
            </div>
            <div class="prediction-factor">
              <span class="factor-label">Difficulty</span>
              <span class="factor-value">${predictions.difficultyScore}/3</span>
            </div>
          </div>
        </div>
      </div>`;
  }
  
  return html;
}

// ── Export functions ──────────────────────────────────────────────────────────
window.generateSeasonalAnalytics = generateSeasonalAnalytics;
window.analyzeDivisionPerformance = analyzeDivisionPerformance;
window.analyzeRegionalPerformance = analyzeRegionalPerformance;
window.analyzeTemporalPatterns = analyzeTemporalPatterns;
window.generatePredictions = generatePredictions;
window.renderComparisonAnalytics = renderComparisonAnalytics;