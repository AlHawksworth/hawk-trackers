// ============================================================
// AFL Edge Analytics — Analysis Engine v2
// Enhanced with H2H, venue-specific, quarter patterns,
// player impact, line/totals, and model validation
// ============================================================

const AnalysisEngine = {

    // ── Probability Calculation (Enhanced 8-pillar model) ──

    calculateTrueProbability(fixture) {
        const homeStats = TEAM_STATS[fixture.home];
        const awayStats = TEAM_STATS[fixture.away];
        const venue = VENUE_DATA[fixture.venue];
        const homeTeam = LADDER.find(t => t.team === fixture.home);
        const awayTeam = LADDER.find(t => t.team === fixture.away);

        if (!homeStats || !awayStats || !venue || !homeTeam || !awayTeam) {
            return { homeProb: 0.5, awayProb: 0.5, confidence: 'low' };
        }

        // 1. Base probability from win/loss record (Laplace smoothing)
        const totalGames = homeTeam.w + homeTeam.d + homeTeam.l;
        const homeWinRate = (homeTeam.w + 0.5) / (totalGames + 1);
        const awayWinRate = (awayTeam.w + 0.5) / (totalGames + 1);
        let baseHomeProb = homeWinRate / (homeWinRate + awayWinRate);

        // 2. Venue adjustment (generic)
        const venueAdj = (venue.homeAdvantage - 0.5) * 0.3;
        baseHomeProb += venueAdj;

        // 3. Team-specific venue record
        const venueKey = `${fixture.home}_${fixture.venue}`;
        const venueRecord = typeof TEAM_VENUE_RECORDS !== 'undefined' ? TEAM_VENUE_RECORDS[venueKey] : null;
        if (venueRecord && venueRecord.played >= 10) {
            const venueSpecificAdj = (venueRecord.winPct - venue.homeAdvantage) * 0.15;
            baseHomeProb += venueSpecificAdj;
        }

        // 4. Inside-50 differential (highest correlation)
        const i50Diff = (homeStats.inside50 - awayStats.inside50) / 100;
        baseHomeProb += i50Diff * 0.15;

        // 5. Contested possession differential
        const cpDiff = (homeStats.contestedPoss - awayStats.contestedPoss) / 200;
        baseHomeProb += cpDiff * 0.12;

        // 6. Form momentum (weighted recent 5)
        const homeFormScore = this.calculateFormScore(homeTeam.form);
        const awayFormScore = this.calculateFormScore(awayTeam.form);
        baseHomeProb += (homeFormScore - awayFormScore) * 0.08;

        // 7. Head-to-head record
        const h2hKey = `${fixture.home}_${fixture.away}`;
        const h2h = typeof HEAD_TO_HEAD !== 'undefined' ? HEAD_TO_HEAD[h2hKey] : null;
        if (h2h) {
            const h2hTotal = h2h.homeWins + h2h.awayWins;
            if (h2hTotal > 0) {
                const h2hHomeRate = h2h.homeWins / h2hTotal;
                baseHomeProb += (h2hHomeRate - 0.5) * 0.06;
            }
        }

        // 8. Player impact-weighted selection adjustment
        const homeSelAdj = this.getWeightedSelectionAdjustment(fixture.home);
        const awaySelAdj = this.getWeightedSelectionAdjustment(fixture.away);
        baseHomeProb += (homeSelAdj - awaySelAdj) * 0.01;

        // Clamp
        baseHomeProb = Math.max(0.05, Math.min(0.95, baseHomeProb));

        // Confidence assessment
        let confidence = 'high';
        const selHome = SELECTION_NEWS[fixture.home];
        const selAway = SELECTION_NEWS[fixture.away];
        const totalChanges = (selHome?.outs?.length || 0) + (selAway?.outs?.length || 0);
        if (totalChanges >= 4) confidence = 'low';
        else if (Math.abs(baseHomeProb - 0.5) < 0.1) confidence = 'medium';

        return {
            homeProb: Math.round(baseHomeProb * 1000) / 1000,
            awayProb: Math.round((1 - baseHomeProb) * 1000) / 1000,
            confidence
        };
    },

    calculateFormScore(form) {
        const weights = [0.35, 0.25, 0.20, 0.12, 0.08];
        let score = 0;
        form.forEach((r, i) => {
            if (r === 'W') score += weights[i];
            else if (r === 'D') score += weights[i] * 0.5;
        });
        return score;
    },

    getWeightedSelectionAdjustment(teamCode) {
        const news = SELECTION_NEWS[teamCode];
        if (!news) return 0;
        let score = 0;
        const pi = typeof PLAYER_IMPACT !== 'undefined' ? PLAYER_IMPACT : {};
        (news.ins || []).forEach(name => {
            const clean = name.replace(/\s*\(.*\)/, '');
            const p = pi[clean];
            score += p ? p.impactRating : 5;
        });
        (news.outs || []).forEach(name => {
            const clean = name.replace(/\s*\(.*\)/, '');
            const p = pi[clean];
            score -= p ? p.impactRating : 5;
        });
        return score;
    },

    // ── Value Calculation ──

    impliedProbability(odds) { return 1 / odds; },

    calculateValue(trueProb, decimalOdds) {
        const value = trueProb * decimalOdds;
        const edge = (trueProb - this.impliedProbability(decimalOdds)) * 100;
        let rating = 'none';
        if (value > 1.10) rating = 'strong';
        else if (value > 1.05) rating = 'moderate';
        else if (value > 1.00) rating = 'marginal';
        return {
            value: Math.round(value * 1000) / 1000,
            edge: Math.round(edge * 10) / 10,
            rating,
            impliedProb: Math.round(this.impliedProbability(decimalOdds) * 1000) / 1000,
            trueProb: Math.round(trueProb * 1000) / 1000
        };
    },

    // ── Line & Totals Analysis ──

    calculateLineValue(fixture) {
        const ltm = typeof LINE_TOTALS_MARKETS !== 'undefined' ? LINE_TOTALS_MARKETS[fixture.id] : null;
        if (!ltm) return null;

        const homeStats = TEAM_STATS[fixture.home];
        const awayStats = TEAM_STATS[fixture.away];
        if (!homeStats || !awayStats) return null;

        const probs = this.calculateTrueProbability(fixture);
        const predictedMargin = Math.round((probs.homeProb - 0.5) * 80);
        const predictedTotal = Math.round(homeStats.avgScore + awayStats.avgScore);

        // Line value: compare predicted margin to market line
        const lineEdge = predictedMargin - ltm.line;
        let linePick = null, lineOdds = 0, lineEdgePct = 0;
        if (Math.abs(lineEdge) > 4) {
            if (lineEdge > 0) {
                linePick = `${AFL_TEAMS[fixture.home].name} ${ltm.line > 0 ? '+' : ''}${ltm.line}`;
                lineOdds = ltm.lineHome;
            } else {
                linePick = `${AFL_TEAMS[fixture.away].name} +${Math.abs(ltm.line)}`;
                lineOdds = ltm.lineAway;
            }
            lineEdgePct = Math.round(Math.abs(lineEdge) / Math.abs(ltm.line || 1) * 30 * 10) / 10;
            lineEdgePct = Math.min(lineEdgePct, 25);
        }

        // Total value: compare predicted total to market total
        const totalDiff = predictedTotal - ltm.total;
        let totalPick = null, totalOdds = 0, totalEdgePct = 0;
        if (Math.abs(totalDiff) > 5) {
            if (totalDiff > 0) {
                totalPick = `Over ${ltm.total}`;
                totalOdds = ltm.overOdds;
            } else {
                totalPick = `Under ${ltm.total}`;
                totalOdds = ltm.underOdds;
            }
            totalEdgePct = Math.round(Math.abs(totalDiff) / ltm.total * 100 * 10) / 10;
            totalEdgePct = Math.min(totalEdgePct, 20);
        }

        return {
            line: ltm.line,
            predictedMargin,
            linePick,
            lineOdds,
            lineEdge: Math.round(lineEdge * 10) / 10,
            lineEdgePct,
            total: ltm.total,
            predictedTotal,
            totalPick,
            totalOdds,
            totalDiff: Math.round(totalDiff * 10) / 10,
            totalEdgePct
        };
    },

    // ── Edge Finder (H2H + Line + Totals) ──

    findEdgeBets(fixtures) {
        const edges = [];
        fixtures.forEach(fixture => {
            const probs = this.calculateTrueProbability(fixture);

            // H2H edges
            const homeVal = this.calculateValue(probs.homeProb, fixture.homeOdds);
            if (homeVal.edge > 3) {
                edges.push({
                    fixture, selection: 'home', market: 'H2H',
                    team: AFL_TEAMS[fixture.home].name,
                    odds: fixture.homeOdds, ...homeVal,
                    confidence: probs.confidence,
                    reasoning: this.generateReasoning(fixture, 'home', probs, homeVal)
                });
            }
            const awayVal = this.calculateValue(probs.awayProb, fixture.awayOdds);
            if (awayVal.edge > 3) {
                edges.push({
                    fixture, selection: 'away', market: 'H2H',
                    team: AFL_TEAMS[fixture.away].name,
                    odds: fixture.awayOdds, ...awayVal,
                    confidence: probs.confidence,
                    reasoning: this.generateReasoning(fixture, 'away', probs, awayVal)
                });
            }

            // Line edges
            const lineAnalysis = this.calculateLineValue(fixture);
            if (lineAnalysis && lineAnalysis.linePick && lineAnalysis.lineEdgePct > 3) {
                edges.push({
                    fixture, selection: 'line', market: 'Line',
                    team: lineAnalysis.linePick,
                    odds: lineAnalysis.lineOdds,
                    edge: lineAnalysis.lineEdgePct,
                    value: lineAnalysis.lineEdgePct > 8 ? 1.12 : 1.06,
                    rating: lineAnalysis.lineEdgePct > 8 ? 'strong' : 'moderate',
                    trueProb: 0.55, impliedProb: 0.526,
                    confidence: 'medium',
                    reasoning: [`Predicted margin: ${lineAnalysis.predictedMargin} pts vs line of ${lineAnalysis.line}`, `${Math.abs(lineAnalysis.lineEdge)} point edge over the spread`]
                });
            }

            // Total edges
            if (lineAnalysis && lineAnalysis.totalPick && lineAnalysis.totalEdgePct > 3) {
                edges.push({
                    fixture, selection: 'total', market: 'Total',
                    team: lineAnalysis.totalPick,
                    odds: lineAnalysis.totalOdds,
                    edge: lineAnalysis.totalEdgePct,
                    value: lineAnalysis.totalEdgePct > 6 ? 1.10 : 1.05,
                    rating: lineAnalysis.totalEdgePct > 6 ? 'strong' : 'moderate',
                    trueProb: 0.54, impliedProb: 0.526,
                    confidence: 'medium',
                    reasoning: [`Predicted total: ${lineAnalysis.predictedTotal} pts vs market of ${lineAnalysis.total}`, `${Math.abs(lineAnalysis.totalDiff)} point differential`]
                });
            }
        });
        edges.sort((a, b) => b.edge - a.edge);
        return edges;
    },

    generateReasoning(fixture, side, probs, value) {
        const teamCode = side === 'home' ? fixture.home : fixture.away;
        const stats = TEAM_STATS[teamCode];
        const ladderEntry = LADDER.find(t => t.team === teamCode);
        const selection = SELECTION_NEWS[teamCode];
        const venue = VENUE_DATA[fixture.venue];
        const reasons = [];

        // Venue-specific record
        const venueKey = `${teamCode}_${fixture.venue}`;
        const vr = typeof TEAM_VENUE_RECORDS !== 'undefined' ? TEAM_VENUE_RECORDS[venueKey] : null;
        if (vr && vr.winPct > 0.65) {
            reasons.push(`${AFL_TEAMS[teamCode].name} win ${Math.round(vr.winPct * 100)}% at ${fixture.venue} (${vr.won}/${vr.played})`);
        } else if (side === 'home' && venue.homeAdvantage > 0.58) {
            reasons.push(`Strong home advantage at ${fixture.venue} (${Math.round(venue.homeAdvantage * 100)}%)`);
        }

        // H2H record
        const h2hKey = `${fixture.home}_${fixture.away}`;
        const h2h = typeof HEAD_TO_HEAD !== 'undefined' ? HEAD_TO_HEAD[h2hKey] : null;
        if (h2h) {
            const wins = side === 'home' ? h2h.homeWins : h2h.awayWins;
            if (wins >= 3) reasons.push(`Won ${wins} of last 5 H2H meetings (avg margin: ${h2h.avgMargin} pts)`);
        }

        if (stats.inside50 > 52) reasons.push(`Above-avg inside-50s (${stats.inside50}/game, L5)`);
        if (stats.contestedPoss > 148) reasons.push(`Elite contested possessions (${stats.contestedPoss}/game)`);

        const formScore = this.calculateFormScore(ladderEntry.form);
        if (formScore > 0.6) reasons.push(`Strong form (${ladderEntry.form.filter(f => f === 'W').length}/5 wins)`);

        // Player impact
        if (selection?.ins?.length > 0) {
            const pi = typeof PLAYER_IMPACT !== 'undefined' ? PLAYER_IMPACT : {};
            const starIns = selection.ins.filter(n => {
                const clean = n.replace(/\s*\(.*\)/, '');
                return pi[clean] && pi[clean].impactRating >= 7;
            });
            if (starIns.length > 0) reasons.push(`Key returns: ${starIns.join(', ')}`);
        }

        if (value.edge > 8) reasons.push(`Market significantly undervalues (${value.edge}% edge)`);
        return reasons;
    },

    // ── Staking ──

    kellyStake(trueProb, decimalOdds, bankroll, maxPct = 0.05) {
        const b = decimalOdds - 1;
        const kelly = (b * trueProb - (1 - trueProb)) / b;
        if (kelly <= 0) return 0;
        return Math.round(Math.min(kelly / 4, maxPct) * bankroll * 100) / 100;
    },

    flatStake(bankroll, unitPct = 0.02) {
        return Math.round(bankroll * unitPct * 100) / 100;
    },

    proportionalStake(edge, bankroll, maxPct = 0.05) {
        if (edge <= 0) return 0;
        return Math.round(Math.min(edge / 100 * 2, maxPct) * bankroll * 100) / 100;
    },

    calculateStakes(edges, bankroll, method = 'kelly', maxPct = 0.05) {
        return edges.map(edge => {
            let stake = 0;
            switch (method) {
                case 'kelly': stake = this.kellyStake(edge.trueProb, edge.odds, bankroll, maxPct); break;
                case 'flat': stake = this.flatStake(bankroll); break;
                case 'proportional': stake = this.proportionalStake(edge.edge, bankroll, maxPct); break;
            }
            return {
                ...edge,
                suggestedStake: stake,
                potentialReturn: Math.round(stake * edge.odds * 100) / 100,
                potentialProfit: Math.round(stake * (edge.odds - 1) * 100) / 100
            };
        }).filter(e => e.suggestedStake > 0);
    },

    // ── Model Validation ──

    calculateModelAccuracy() {
        if (typeof SEASON_RESULTS === 'undefined') return null;
        let correct = 0, total = 0, brierSum = 0;
        const roundAccuracy = [];

        SEASON_RESULTS.forEach(round => {
            let roundCorrect = 0, roundTotal = 0;
            round.fixtures.forEach(f => {
                const predicted = f.modelHomeProb >= 0.5 ? 'home' : 'away';
                const actual = f.actualWinner;
                if (predicted === actual) { correct++; roundCorrect++; }
                total++; roundTotal++;
                const outcome = actual === 'home' ? 1 : 0;
                brierSum += Math.pow(f.modelHomeProb - outcome, 2);
            });
            roundAccuracy.push({
                round: round.round,
                correct: roundCorrect,
                total: roundTotal,
                pct: Math.round(roundCorrect / roundTotal * 100)
            });
        });

        return {
            totalCorrect: correct,
            totalGames: total,
            accuracy: Math.round(correct / total * 1000) / 10,
            brierScore: Math.round(brierSum / total * 1000) / 1000,
            roundAccuracy,
            calibration: this.calculateCalibration()
        };
    },

    calculateCalibration() {
        if (typeof SEASON_RESULTS === 'undefined') return [];
        const buckets = {};
        SEASON_RESULTS.forEach(round => {
            round.fixtures.forEach(f => {
                const bucket = Math.round(f.modelHomeProb * 10) / 10;
                if (!buckets[bucket]) buckets[bucket] = { predicted: bucket, total: 0, homeWins: 0 };
                buckets[bucket].total++;
                if (f.actualWinner === 'home') buckets[bucket].homeWins++;
            });
        });
        return Object.values(buckets).map(b => ({
            ...b,
            actual: Math.round(b.homeWins / b.total * 100) / 100
        })).sort((a, b) => a.predicted - b.predicted);
    },

    // ── Match Analysis (Enhanced) ──

    generateMatchAnalysis(fixture) {
        const homeStats = TEAM_STATS[fixture.home];
        const awayStats = TEAM_STATS[fixture.away];
        const venue = VENUE_DATA[fixture.venue];
        const probs = this.calculateTrueProbability(fixture);
        const homeTeam = LADDER.find(t => t.team === fixture.home);
        const awayTeam = LADDER.find(t => t.team === fixture.away);

        const homeValue = this.calculateValue(probs.homeProb, fixture.homeOdds);
        const awayValue = this.calculateValue(probs.awayProb, fixture.awayOdds);
        const lineAnalysis = this.calculateLineValue(fixture);

        const statComparisons = [
            { label: 'Disposals (L5)', home: homeStats.disposals, away: awayStats.disposals },
            { label: 'Contested Poss (L5)', home: homeStats.contestedPoss, away: awayStats.contestedPoss },
            { label: 'Inside 50s (L5)', home: homeStats.inside50, away: awayStats.inside50 },
            { label: 'Clearances (L5)', home: homeStats.clearances, away: awayStats.clearances },
            { label: 'Tackles (L5)', home: homeStats.tackles, away: awayStats.tackles },
            { label: 'Avg Score (L5)', home: homeStats.avgScore, away: awayStats.avgScore }
        ];

        const factors = [];
        const venueKey = `${fixture.home}_${fixture.venue}`;
        const vr = typeof TEAM_VENUE_RECORDS !== 'undefined' ? TEAM_VENUE_RECORDS[venueKey] : null;
        if (vr && vr.winPct > 0.65) {
            factors.push({ text: `${AFL_TEAMS[fixture.home].name} win ${Math.round(vr.winPct * 100)}% at ${fixture.venue} (${vr.won}/${vr.played})`, impact: 'positive', team: 'home' });
        } else if (venue.homeAdvantage > 0.58) {
            factors.push({ text: `${fixture.venue} favours home (${Math.round(venue.homeAdvantage * 100)}%)`, impact: 'positive', team: 'home' });
        }

        // H2H
        const h2hKey = `${fixture.home}_${fixture.away}`;
        const h2h = typeof HEAD_TO_HEAD !== 'undefined' ? HEAD_TO_HEAD[h2hKey] : null;
        if (h2h) {
            factors.push({ text: `H2H last 5: ${AFL_TEAMS[fixture.home].name} ${h2h.homeWins} - ${h2h.awayWins} ${AFL_TEAMS[fixture.away].name} (avg margin: ${h2h.avgMargin} pts)`, impact: 'neutral', team: 'both' });
        }

        // Form
        [fixture.home, fixture.away].forEach(tc => {
            const entry = LADDER.find(t => t.team === tc);
            const wins = entry.form.filter(f => f === 'W').length;
            const side = tc === fixture.home ? 'home' : 'away';
            if (wins >= 4) factors.push({ text: `${AFL_TEAMS[tc].name} excellent form (${wins}/5)`, impact: 'positive', team: side });
            if (wins <= 1) factors.push({ text: `${AFL_TEAMS[tc].name} poor form (${wins}/5)`, impact: 'negative', team: side });
        });

        // Quarter patterns
        const homeQP = typeof QUARTER_PATTERNS !== 'undefined' ? QUARTER_PATTERNS[fixture.home] : null;
        const awayQP = typeof QUARTER_PATTERNS !== 'undefined' ? QUARTER_PATTERNS[fixture.away] : null;
        if (homeQP?.fastStarter) factors.push({ text: `${AFL_TEAMS[fixture.home].name} are fast starters (avg Q1 lead: +${homeQP.avgQ1Lead} pts)`, impact: 'positive', team: 'home' });
        if (awayQP?.fastStarter) factors.push({ text: `${AFL_TEAMS[fixture.away].name} are fast starters (avg Q1 lead: +${awayQP.avgQ1Lead} pts)`, impact: 'positive', team: 'away' });
        if (homeQP?.comebackRate > 0.30) factors.push({ text: `${AFL_TEAMS[fixture.home].name} comeback specialists (${Math.round(homeQP.comebackRate * 100)}% comeback rate)`, impact: 'positive', team: 'home' });
        if (awayQP?.comebackRate > 0.30) factors.push({ text: `${AFL_TEAMS[fixture.away].name} comeback specialists (${Math.round(awayQP.comebackRate * 100)}% comeback rate)`, impact: 'positive', team: 'away' });

        // Selection with player impact
        [fixture.home, fixture.away].forEach(tc => {
            const sel = SELECTION_NEWS[tc];
            const side = tc === fixture.home ? 'home' : 'away';
            if (sel?.outs?.length >= 3) factors.push({ text: `${AFL_TEAMS[tc].name}: ${sel.outs.length} outs — significant disruption`, impact: 'negative', team: side });
            if (sel?.ins?.length > 0) {
                const pi = typeof PLAYER_IMPACT !== 'undefined' ? PLAYER_IMPACT : {};
                const details = sel.ins.map(n => {
                    const clean = n.replace(/\s*\(.*\)/, '');
                    const p = pi[clean];
                    return p ? `${clean} (${p.role}, impact: ${p.impactRating}/10)` : n;
                });
                factors.push({ text: `${AFL_TEAMS[tc].name} returns: ${details.join(', ')}`, impact: 'positive', team: side });
            }
        });

        // I50 differential
        const i50Diff = homeStats.inside50 - awayStats.inside50;
        if (Math.abs(i50Diff) >= 5) {
            const better = i50Diff > 0 ? 'home' : 'away';
            const betterTeam = i50Diff > 0 ? fixture.home : fixture.away;
            factors.push({ text: `${AFL_TEAMS[betterTeam].name} +${Math.abs(i50Diff)} inside-50 differential`, impact: 'positive', team: better });
        }

        if (venue.weather) factors.push({ text: `Weather: ${venue.weather}`, impact: 'neutral', team: 'both' });
        if (fixture.notes) factors.push({ text: fixture.notes, impact: 'neutral', team: 'both' });

        return {
            fixture, probs, homeValue, awayValue, lineAnalysis,
            statComparisons, factors,
            predictedTotal: Math.round(homeStats.avgScore + awayStats.avgScore),
            venueAvgTotal: venue.avgTotal,
            quarterPatterns: { home: homeQP, away: awayQP },
            h2h
        };
    }
};
