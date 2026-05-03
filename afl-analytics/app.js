// ============================================================
// AFL Edge Analytics — Application Controller v2
// Enhanced: line/totals, model validation, P/L chart,
// pre-populated bet form, confidence matrix
// ============================================================

(function () {
    'use strict';

    const state = {
        currentTab: 'daily-brief',
        currentRound: 8,
        bankroll: parseFloat(localStorage.getItem('afl_bankroll') || '1000'),
        stakingMethod: localStorage.getItem('afl_staking') || 'kelly',
        maxStakePct: parseFloat(localStorage.getItem('afl_maxstake') || '5') / 100,
        edgeThreshold: parseFloat(localStorage.getItem('afl_edge_threshold') || '5'),
        bets: JSON.parse(localStorage.getItem('afl_bets') || '[]'),
        selectedMatch: 0
    };

    function init() {
        renderAll();
        bindEvents();
        updateBankrollDisplay();
        // Cloud sync
        if (typeof FireSync !== "undefined") {
            FireSync.load("afl_bets", (d) => { if (d && Array.isArray(d)) { state.bets = d; renderTracker(); } });
            FireSync.load("afl_settings", (d) => {
                if (d) {
                    if (d.bankroll) { state.bankroll = d.bankroll; localStorage.setItem('afl_bankroll', d.bankroll); }
                    if (d.staking) { state.stakingMethod = d.staking; localStorage.setItem('afl_staking', d.staking); }
                    if (d.maxStake) { state.maxStakePct = d.maxStake / 100; localStorage.setItem('afl_maxstake', d.maxStake.toString()); }
                    if (d.edgeThreshold) { state.edgeThreshold = d.edgeThreshold; localStorage.setItem('afl_edge_threshold', d.edgeThreshold); }
                    updateBankrollDisplay(); renderStakes();
                }
            });
        }
    }

    function renderAll() {
        renderTimestamp();
        renderFixtures();
        renderInsights();
        renderEdgeReport();
        renderLadder();
        renderMatchSelector();
        renderMatchAnalysis();
        renderStakes();
        renderTracker();
        renderModelValidation();
    }

    // ── Timestamp ──
    function renderTimestamp() {
        const el = document.getElementById('lastUpdated');
        if (typeof DATA_META !== 'undefined' && DATA_META.updatedAt) {
            const d = new Date(DATA_META.updatedAt);
            const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            el.textContent = `${day}, ${time} BST`;
        } else {
            el.textContent = 'Unknown';
        }
    }

    // ── Events ──
    function bindEvents() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                document.getElementById(tab.dataset.tab).classList.add('active');
                state.currentTab = tab.dataset.tab;
            });
        });

        document.getElementById('prevRound').addEventListener('click', () => {
            if (state.currentRound > 1) { state.currentRound--; document.getElementById('roundLabel').textContent = `Round ${state.currentRound}, 2026`; }
        });
        document.getElementById('nextRound').addEventListener('click', () => {
            if (state.currentRound < 25) { state.currentRound++; document.getElementById('roundLabel').textContent = `Round ${state.currentRound}, 2026`; }
        });

        document.getElementById('matchSelect').addEventListener('change', (e) => { state.selectedMatch = parseInt(e.target.value); renderMatchAnalysis(); });

        document.getElementById('recalcStakes').addEventListener('click', () => {
            state.bankroll = parseFloat(document.getElementById('totalBankroll').value) || 1000;
            state.stakingMethod = document.getElementById('stakingMethod').value;
            state.maxStakePct = (parseFloat(document.getElementById('maxStake').value) || 5) / 100;
            localStorage.setItem('afl_bankroll', state.bankroll);
            localStorage.setItem('afl_staking', state.stakingMethod);
            localStorage.setItem('afl_maxstake', (state.maxStakePct * 100).toString());
            if (typeof FireSync !== "undefined") { FireSync.save("afl_settings", { bankroll: state.bankroll, staking: state.stakingMethod, maxStake: state.maxStakePct * 100, edgeThreshold: state.edgeThreshold }); }
            updateBankrollDisplay();
            renderStakes();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.add('active');
            document.getElementById('settingBankroll').value = state.bankroll;
            document.getElementById('settingEdgeThreshold').value = state.edgeThreshold;
        });
        document.getElementById('cancelSettings').addEventListener('click', () => document.getElementById('settingsModal').classList.remove('active'));
        document.getElementById('saveSettings').addEventListener('click', () => {
            state.bankroll = parseFloat(document.getElementById('settingBankroll').value) || 1000;
            state.edgeThreshold = parseFloat(document.getElementById('settingEdgeThreshold').value) || 5;
            localStorage.setItem('afl_bankroll', state.bankroll);
            localStorage.setItem('afl_edge_threshold', state.edgeThreshold);
            if (typeof FireSync !== "undefined") { FireSync.save("afl_settings", { bankroll: state.bankroll, staking: state.stakingMethod, maxStake: state.maxStakePct * 100, edgeThreshold: state.edgeThreshold }); }
            document.getElementById('totalBankroll').value = state.bankroll;
            updateBankrollDisplay(); renderStakes(); renderEdgeReport();
            document.getElementById('settingsModal').classList.remove('active');
        });

        document.getElementById('addBetBtn').addEventListener('click', openAddBetModal);
        document.getElementById('cancelBet').addEventListener('click', () => document.getElementById('addBetModal').classList.remove('active'));
        document.getElementById('saveBet').addEventListener('click', saveBet);
        document.getElementById('exportBtn').addEventListener('click', exportCSV);

        document.querySelectorAll('.modal-overlay').forEach(o => {
            o.addEventListener('click', (e) => { if (e.target === o) o.classList.remove('active'); });
        });
    }

    function updateBankrollDisplay() {
        document.getElementById('bankrollValue').textContent = `£${state.bankroll.toLocaleString()}`;
    }

    function switchToTab(tabName) {
        document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabBtn) { tabBtn.classList.add('active'); tabBtn.setAttribute('aria-selected', 'true'); }
        document.getElementById(tabName).classList.add('active');
    }

    // ── Fixtures ──
    function renderFixtures() {
        const grid = document.getElementById('fixturesGrid');
        const upcoming = ROUND8_FIXTURES.filter(f => f.status === 'upcoming');

        grid.innerHTML = upcoming.map(fixture => {
            const probs = AnalysisEngine.calculateTrueProbability(fixture);
            const hv = AnalysisEngine.calculateValue(probs.homeProb, fixture.homeOdds);
            const av = AnalysisEngine.calculateValue(probs.awayProb, fixture.awayOdds);
            const best = hv.edge > av.edge ? hv : av;
            const bestTeam = hv.edge > av.edge ? fixture.home : fixture.away;
            const lineData = AnalysisEngine.calculateLineValue(fixture);

            let edgeClass = 'edge-none', edgeLabel = 'No Edge';
            if (best.rating === 'strong') { edgeClass = 'edge-strong'; edgeLabel = 'Strong Value'; }
            else if (best.rating === 'moderate') { edgeClass = 'edge-moderate'; edgeLabel = 'Moderate Value'; }
            else if (best.edge > 0) { edgeClass = 'edge-low'; edgeLabel = 'Marginal'; }

            const lineInfo = lineData ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;padding-top:6px;border-top:1px solid var(--border);">Line: ${lineData.line > 0 ? '+' : ''}${lineData.line} · Total: ${lineData.total}</div>` : '';

            return `
                <div class="fixture-card" data-fixture="${fixture.id}">
                    <div class="fixture-header">
                        <span>${fixture.date} · ${fixture.time}</span>
                        <div class="fixture-venue">📍 ${fixture.venue}</div>
                    </div>
                    <div class="fixture-teams">
                        <div class="fixture-team">
                            <span class="team-name">${AFL_TEAMS[fixture.home].emoji} ${AFL_TEAMS[fixture.home].name}</span>
                            <span class="team-record">${getLadderRecord(fixture.home)}</span>
                            <span class="team-odds">${fixture.homeOdds.toFixed(2)}</span>
                        </div>
                        <span class="fixture-vs">vs</span>
                        <div class="fixture-team">
                            <span class="team-name">${AFL_TEAMS[fixture.away].emoji} ${AFL_TEAMS[fixture.away].name}</span>
                            <span class="team-record">${getLadderRecord(fixture.away)}</span>
                            <span class="team-odds">${fixture.awayOdds.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="fixture-edge">
                        <span>Best: ${AFL_TEAMS[bestTeam].name} (${best.edge > 0 ? '+' : ''}${best.edge}%)</span>
                        <span class="edge-badge ${edgeClass}">${edgeLabel}</span>
                    </div>
                    ${lineInfo}
                </div>`;
        }).join('');

        grid.querySelectorAll('.fixture-card').forEach(card => {
            card.addEventListener('click', () => {
                const idx = ROUND8_FIXTURES.findIndex(f => f.id === parseInt(card.dataset.fixture));
                if (idx >= 0) { state.selectedMatch = idx; document.getElementById('matchSelect').value = idx; renderMatchAnalysis(); switchToTab('match-analysis'); }
            });
        });
    }

    function getLadderRecord(tc) { const e = LADDER.find(t => t.team === tc); return e ? `${e.w}-${e.d}-${e.l}` : ''; }

    // ── Insights ──
    function renderInsights() {
        document.getElementById('insightsGrid').innerHTML = ROUND_INSIGHTS.map(i => `
            <div class="insight-item"><span class="insight-icon">${i.icon}</span><span>${i.text}</span></div>
        `).join('');
    }

    // ── Edge Report (now includes Line & Totals) ──
    function renderEdgeReport() {
        const container = document.getElementById('edgeCards');
        const upcoming = ROUND8_FIXTURES.filter(f => f.status === 'upcoming');
        const edges = AnalysisEngine.findEdgeBets(upcoming);

        if (edges.length === 0) {
            container.innerHTML = '<div class="no-edge-disclaimer"><p>No value bets identified for this round.</p></div>';
            return;
        }

        container.innerHTML = edges.map(edge => {
            const cardClass = edge.rating === 'strong' ? 'strong-value' : edge.rating === 'moderate' ? 'moderate-value' : 'low-confidence';
            const badgeClass = edge.rating === 'strong' ? 'edge-strong' : edge.rating === 'moderate' ? 'edge-moderate' : 'edge-low';
            const confLabel = edge.confidence === 'high' ? '🟢 High' : edge.confidence === 'medium' ? '🟡 Medium' : '🔴 Low';
            const marketTag = edge.market !== 'H2H' ? `<span style="background:var(--accent-purple);color:#fff;padding:2px 8px;border-radius:999px;font-size:0.7rem;margin-left:6px;">${edge.market}</span>` : '';

            return `
                <div class="edge-card ${cardClass}">
                    <div class="edge-match-info">
                        <h4>${AFL_TEAMS[edge.fixture.home].name} vs ${AFL_TEAMS[edge.fixture.away].name}${marketTag}</h4>
                        <div class="edge-match-meta">${edge.fixture.date} · ${edge.fixture.venue}</div>
                        <div class="edge-selection">📌 ${edge.team} @ ${edge.odds.toFixed(2)}</div>
                        <div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary);">${edge.reasoning.map(r => `• ${r}`).join('<br>')}</div>
                    </div>
                    <div class="edge-numbers">
                        <div class="edge-row"><span class="edge-row-label">True Prob</span><span class="edge-row-value">${(edge.trueProb * 100).toFixed(1)}%</span></div>
                        <div class="edge-row"><span class="edge-row-label">Market Implied</span><span class="edge-row-value">${(edge.impliedProb * 100).toFixed(1)}%</span></div>
                        <div class="edge-row"><span class="edge-row-label">Value Index</span><span class="edge-row-value">${edge.value.toFixed(3)}</span></div>
                        <div class="edge-row"><span class="edge-row-label">Market</span><span class="edge-row-value">${edge.market}</span></div>
                    </div>
                    <div class="edge-action">
                        <div class="edge-value-display ${edge.edge > 8 ? 'positive' : 'caution'}">+${edge.edge}%</div>
                        <span class="edge-badge ${badgeClass}">${edge.rating.toUpperCase()}</span>
                        <span style="color:var(--text-secondary);font-size:0.75rem;">${confLabel}</span>
                        <button class="btn-primary" style="margin-top:8px;padding:6px 14px;font-size:0.75rem;" onclick="window._addFromEdge(${JSON.stringify(edge.fixture.id)}, '${edge.market}', '${edge.team.replace(/'/g, "\\'")}', ${edge.odds}, ${edge.edge})">+ Track Bet</button>
                    </div>
                </div>`;
        }).join('');
    }

    // Expose for inline onclick
    window._addFromEdge = function(fixtureId, market, selection, odds, edge) {
        const idx = ROUND8_FIXTURES.findIndex(f => f.id === fixtureId);
        const fixture = ROUND8_FIXTURES[idx];
        document.getElementById('addBetModal').classList.add('active');
        document.getElementById('betDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('betMatch').value = idx;
        document.getElementById('betMarket').value = market === 'H2H' ? 'H2H' : market === 'Line' ? 'Line' : 'Total';
        document.getElementById('betSelection').value = selection;
        document.getElementById('betOdds').value = odds;
        document.getElementById('betEdge').value = edge;
        document.getElementById('betStake').value = '';
        document.getElementById('betResult').value = 'pending';

        // Auto-suggest stake
        const stakes = AnalysisEngine.calculateStakes([{ trueProb: 0.55, odds, edge }], state.bankroll, state.stakingMethod, state.maxStakePct);
        if (stakes.length > 0) document.getElementById('betStake').value = stakes[0].suggestedStake;
    };

    // ── Ladder (with percentage sparklines) ──
    function renderLadder() {
        const tbody = document.getElementById('ladderBody');
        tbody.innerHTML = LADDER.map((entry, i) => {
            let zoneClass = i < 6 ? 'finals-zone' : i < 10 ? 'wildcard-zone' : 'outside-zone';
            let dividerClass = (i === 5 || i === 9) ? 'zone-divider' : '';
            const team = AFL_TEAMS[entry.team];
            const formDots = entry.form.map(f => `<span class="form-dot ${f === 'W' ? 'win' : f === 'D' ? 'draw' : 'loss'}">${f}</span>`).join('');

            // Mini sparkline from season results
            let sparkline = '';
            if (typeof SEASON_RESULTS !== 'undefined') {
                const pctByRound = [];
                let w = 0, l = 0;
                SEASON_RESULTS.forEach(round => {
                    round.fixtures.forEach(f => {
                        if (f.home === entry.team) { if (f.actualWinner === 'home') w++; else l++; }
                        else if (f.away === entry.team) { if (f.actualWinner === 'away') w++; else l++; }
                    });
                    if (w + l > 0) pctByRound.push(Math.round(w / (w + l) * 100));
                });
                if (pctByRound.length > 0) {
                    const max = 100, h = 16, barW = 4;
                    const points = pctByRound.map((v, j) => `${j * (barW + 1)},${h - (v / max * h)}`).join(' ');
                    sparkline = `<svg width="${pctByRound.length * (barW + 1)}" height="${h}" style="vertical-align:middle;margin-left:6px;"><polyline points="${points}" fill="none" stroke="var(--accent-blue)" stroke-width="1.5"/></svg>`;
                }
            }

            return `
                <tr class="${zoneClass} ${dividerClass}">
                    <td>${i + 1}</td>
                    <td><div class="club-cell"><span class="club-emoji">${team.emoji}</span> ${team.name}</div></td>
                    <td>${entry.w}</td><td>${entry.d}</td><td>${entry.l}</td>
                    <td>${entry.pct.toFixed(1)}${sparkline}</td>
                    <td><strong>${entry.pts}</strong></td>
                    <td class="form-col"><div class="form-dots">${formDots}</div></td>
                </tr>`;
        }).join('');
    }

    // ── Match Selector ──
    function renderMatchSelector() {
        const select = document.getElementById('matchSelect');
        select.innerHTML = ROUND8_FIXTURES.map((f, i) => {
            const st = f.status === 'completed' ? ' ✅' : f.status === 'live' ? ' 🔴' : '';
            return `<option value="${i}">${AFL_TEAMS[f.home].name} vs ${AFL_TEAMS[f.away].name} — ${f.date}${st}</option>`;
        }).join('');
        const betSelect = document.getElementById('betMatch');
        betSelect.innerHTML = ROUND8_FIXTURES.map((f, i) => `<option value="${i}">${AFL_TEAMS[f.home].name} vs ${AFL_TEAMS[f.away].name}</option>`).join('');
    }

    // ── Match Analysis (Enhanced with H2H, quarters, line/totals) ──
    function renderMatchAnalysis() {
        const container = document.getElementById('analysisContainer');
        const fixture = ROUND8_FIXTURES[state.selectedMatch];
        if (!fixture) return;

        const a = AnalysisEngine.generateMatchAnalysis(fixture);
        const ht = AFL_TEAMS[fixture.home], at = AFL_TEAMS[fixture.away];

        const statBars = a.statComparisons.map(s => {
            const total = s.home + s.away;
            return `<div class="stat-row"><div class="stat-bar-container">
                <div class="stat-bar-left" style="width:${(s.home/total*100).toFixed(0)}%">${s.home}</div>
                <div class="stat-label-center">${s.label}</div>
                <div class="stat-bar-right" style="width:${(s.away/total*100).toFixed(0)}%">${s.away}</div>
            </div></div>`;
        }).join('');

        const hp = (a.probs.homeProb * 100).toFixed(1), ap = (a.probs.awayProb * 100).toFixed(1);
        const factors = a.factors.map(f => `<div class="factor-item"><span class="factor-impact ${f.impact}">${f.impact === 'positive' ? '▲' : f.impact === 'negative' ? '▼' : '●'}</span><span>${f.text}</span></div>`).join('');
        const hvc = a.homeValue.edge > 5 ? 'positive' : a.homeValue.edge > 0 ? 'caution' : '';
        const avc = a.awayValue.edge > 5 ? 'positive' : a.awayValue.edge > 0 ? 'caution' : '';

        // Quarter pattern bars
        let quarterHTML = '';
        if (a.quarterPatterns.home && a.quarterPatterns.away) {
            const hq = a.quarterPatterns.home, aq = a.quarterPatterns.away;
            quarterHTML = `<div class="analysis-card">
                <h3>📊 Quarter Scoring Patterns</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);">
                        <div style="font-weight:600;margin-bottom:8px;color:var(--accent-blue);">${ht.name}</div>
                        <div style="display:flex;gap:6px;align-items:flex-end;height:60px;">
                            ${[hq.q1Avg,hq.q2Avg,hq.q3Avg,hq.q4Avg].map((v,i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;"><span style="font-size:0.7rem;color:var(--text-muted);">${v}</span><div style="width:100%;height:${v/35*50}px;background:var(--accent-blue);border-radius:3px;"></div><span style="font-size:0.65rem;color:var(--text-muted);">Q${i+1}</span></div>`).join('')}
                        </div>
                        ${hq.fastStarter ? '<div style="margin-top:6px;font-size:0.75rem;color:var(--accent-green);">⚡ Fast starter</div>' : ''}
                        ${hq.comebackRate > 0.25 ? `<div style="margin-top:4px;font-size:0.75rem;color:var(--accent-yellow);">🔄 Comeback rate: ${Math.round(hq.comebackRate*100)}%</div>` : ''}
                    </div>
                    <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);">
                        <div style="font-weight:600;margin-bottom:8px;color:var(--accent-orange);">${at.name}</div>
                        <div style="display:flex;gap:6px;align-items:flex-end;height:60px;">
                            ${[aq.q1Avg,aq.q2Avg,aq.q3Avg,aq.q4Avg].map((v,i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;"><span style="font-size:0.7rem;color:var(--text-muted);">${v}</span><div style="width:100%;height:${v/35*50}px;background:var(--accent-orange);border-radius:3px;"></div><span style="font-size:0.65rem;color:var(--text-muted);">Q${i+1}</span></div>`).join('')}
                        </div>
                        ${aq.fastStarter ? '<div style="margin-top:6px;font-size:0.75rem;color:var(--accent-green);">⚡ Fast starter</div>' : ''}
                        ${aq.comebackRate > 0.25 ? `<div style="margin-top:4px;font-size:0.75rem;color:var(--accent-yellow);">🔄 Comeback rate: ${Math.round(aq.comebackRate*100)}%</div>` : ''}
                    </div>
                </div>
            </div>`;
        }

        // Line & Totals card
        let lineHTML = '';
        if (a.lineAnalysis) {
            const la = a.lineAnalysis;
            lineHTML = `<div class="analysis-card">
                <h3>📐 Line & Totals</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);">
                        <div style="font-size:0.75rem;color:var(--text-muted);">Spread</div>
                        <div style="font-weight:700;font-family:var(--font-mono);">${la.line > 0 ? '+' : ''}${la.line}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">Predicted margin: ${la.predictedMargin > 0 ? '+' : ''}${la.predictedMargin}</div>
                        ${la.linePick ? `<div style="margin-top:6px;font-size:0.8rem;color:var(--accent-green);">📌 ${la.linePick} (+${la.lineEdgePct}%)</div>` : ''}
                    </div>
                    <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);">
                        <div style="font-size:0.75rem;color:var(--text-muted);">Total Points</div>
                        <div style="font-weight:700;font-family:var(--font-mono);">${la.total}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">Predicted: ${la.predictedTotal}</div>
                        ${la.totalPick ? `<div style="margin-top:6px;font-size:0.8rem;color:var(--accent-green);">📌 ${la.totalPick} (+${la.totalEdgePct}%)</div>` : ''}
                    </div>
                </div>
            </div>`;
        }

        // H2H card
        let h2hHTML = '';
        if (a.h2h) {
            h2hHTML = `<div class="analysis-card">
                <h3>🤝 Head-to-Head (Last 5)</h3>
                <div style="display:flex;justify-content:space-around;margin-bottom:12px;">
                    <div style="text-align:center;"><div style="font-size:1.5rem;font-weight:800;color:var(--accent-blue);">${a.h2h.homeWins}</div><div style="font-size:0.75rem;color:var(--text-muted);">${ht.name}</div></div>
                    <div style="text-align:center;"><div style="font-size:1.5rem;font-weight:800;color:var(--text-muted);">—</div><div style="font-size:0.75rem;color:var(--text-muted);">Avg margin: ${a.h2h.avgMargin}pts</div></div>
                    <div style="text-align:center;"><div style="font-size:1.5rem;font-weight:800;color:var(--accent-orange);">${a.h2h.awayWins}</div><div style="font-size:0.75rem;color:var(--text-muted);">${at.name}</div></div>
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">${a.h2h.last5.map(m => `<div style="display:flex;justify-content:space-between;padding:4px 8px;background:var(--bg-input);border-radius:4px;font-size:0.8rem;"><span>${m.year}</span><span style="font-weight:600;color:${m.winner === fixture.home ? 'var(--accent-blue)' : 'var(--accent-orange)'};">${AFL_TEAMS[m.winner].name} by ${m.margin}</span></div>`).join('')}</div>
            </div>`;
        }

        container.innerHTML = `
            <div class="analysis-card">
                <h3>📊 Statistical Comparison (L5 Avg)</h3>
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-weight:600;">
                    <span style="color:var(--accent-blue);">${ht.emoji} ${ht.name}</span>
                    <span style="color:var(--accent-orange);">${at.name} ${at.emoji}</span>
                </div>
                <div class="stat-comparison">${statBars}</div>
            </div>
            <div class="analysis-card">
                <h3>🎯 Probability & Value</h3>
                <div class="probability-gauge">
                    <div class="gauge-bar">
                        <div class="gauge-fill-home" style="width:${hp}%">${hp}%</div>
                        <div class="gauge-fill-away" style="width:${ap}%">${ap}%</div>
                    </div>
                    <div class="gauge-labels"><span style="color:var(--accent-blue);">${ht.name}</span><span style="color:var(--accent-orange);">${at.name}</span></div>
                </div>
                <div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);">
                        <div style="font-size:0.75rem;color:var(--text-muted);">${ht.name} Value</div>
                        <div style="font-family:var(--font-mono);font-size:1.1rem;font-weight:700;"><span class="${hvc}">${a.homeValue.edge > 0 ? '+' : ''}${a.homeValue.edge}%</span> <span style="font-size:0.8rem;color:var(--text-muted);">@ ${fixture.homeOdds.toFixed(2)}</span></div>
                    </div>
                    <div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);">
                        <div style="font-size:0.75rem;color:var(--text-muted);">${at.name} Value</div>
                        <div style="font-family:var(--font-mono);font-size:1.1rem;font-weight:700;"><span class="${avc}">${a.awayValue.edge > 0 ? '+' : ''}${a.awayValue.edge}%</span> <span style="font-size:0.8rem;color:var(--text-muted);">@ ${fixture.awayOdds.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
            ${h2hHTML}
            ${quarterHTML}
            ${lineHTML}
            <div class="analysis-card">
                <h3>📋 Selection News</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    ${[fixture.home, fixture.away].map(tc => {
                        const sel = SELECTION_NEWS[tc]; const tm = AFL_TEAMS[tc];
                        return `<div style="padding:12px;background:var(--bg-input);border-radius:var(--radius-sm);">
                            <div style="font-weight:600;margin-bottom:8px;">${tm.emoji} ${tm.name}</div>
                            <div style="font-size:0.8rem;color:var(--accent-green);margin-bottom:4px;">IN: ${sel?.ins?.join(', ') || 'None'}</div>
                            <div style="font-size:0.8rem;color:var(--accent-red);margin-bottom:4px;">OUT: ${sel?.outs?.join(', ') || 'None'}</div>
                            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:6px;">${sel?.impact || ''}</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
            <div class="analysis-card full-width">
                <h3>⚡ Key Factors</h3>
                <div class="factors-list">${factors}</div>
            </div>`;
    }

    // ── Stakes ──
    function renderStakes() {
        const container = document.getElementById('stakesList');
        const upcoming = ROUND8_FIXTURES.filter(f => f.status === 'upcoming');
        const edges = AnalysisEngine.findEdgeBets(upcoming);
        const stakes = AnalysisEngine.calculateStakes(edges, state.bankroll, state.stakingMethod, state.maxStakePct);

        if (stakes.length === 0) {
            container.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center;">No qualifying bets.</div>';
            return;
        }
        container.innerHTML = stakes.map(s => `
            <div class="stake-item">
                <span class="stake-match">${s.team} @ ${s.odds.toFixed(2)} <span style="font-size:0.7rem;color:var(--accent-purple);">${s.market || 'H2H'}</span></span>
                <span class="stake-amount">£${s.suggestedStake.toFixed(2)}</span>
                <span class="stake-edge">+${s.edge}%</span>
            </div>`).join('');
    }

    // ── Tracker (with P/L chart) ──
    function renderTracker() {
        const tbody = document.getElementById('trackerBody');
        if (state.bets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--text-muted);">No bets tracked yet. Click "+ Add Bet" or use "Track Bet" from the Edge Report.</td></tr>';
        } else {
            tbody.innerHTML = state.bets.map((bet, i) => {
                const rc = bet.result === 'won' ? 'result-won' : bet.result === 'lost' ? 'result-lost' : bet.result === 'pending' ? 'result-pending' : 'result-void';
                let pl = 0;
                if (bet.result === 'won') pl = parseFloat(bet.stake) * (parseFloat(bet.odds) - 1);
                else if (bet.result === 'lost') pl = -parseFloat(bet.stake);
                const plc = pl >= 0 ? 'pl-positive' : 'pl-negative';
                return `<tr>
                    <td>${bet.date}</td><td>${bet.match}</td><td>${bet.market}</td><td>${bet.selection}</td>
                    <td style="font-family:var(--font-mono);">${parseFloat(bet.odds).toFixed(2)}</td>
                    <td style="font-family:var(--font-mono);">£${parseFloat(bet.stake).toFixed(2)}</td>
                    <td>${bet.edge}%</td>
                    <td class="${rc}">${bet.result.toUpperCase()}</td>
                    <td class="${plc}">${bet.result === 'pending' ? '—' : (pl >= 0 ? '+' : '') + '£' + Math.abs(pl).toFixed(2)}</td>
                    <td><button class="delete-btn" data-index="${i}">✕</button></td>
                </tr>`;
            }).join('');
            tbody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => { state.bets.splice(parseInt(btn.dataset.index), 1); saveBetsToStorage(); renderTracker(); });
            });
        }
        updateTrackerStats();
        renderPLChart();
    }

    function updateTrackerStats() {
        const bets = state.bets;
        const settled = bets.filter(b => b.result === 'won' || b.result === 'lost');
        const won = settled.filter(b => b.result === 'won');
        let totalPL = 0, totalStaked = 0;
        settled.forEach(b => {
            const s = parseFloat(b.stake); totalStaked += s;
            if (b.result === 'won') totalPL += s * (parseFloat(b.odds) - 1); else totalPL -= s;
        });
        document.getElementById('totalBets').textContent = bets.length;
        document.getElementById('winRate').textContent = settled.length > 0 ? `${Math.round(won.length / settled.length * 100)}%` : '0%';
        const plEl = document.getElementById('totalPL');
        plEl.textContent = `${totalPL >= 0 ? '+' : '-'}£${Math.abs(totalPL).toFixed(2)}`;
        plEl.style.color = totalPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
        document.getElementById('roi').textContent = totalStaked > 0 ? `${(totalPL / totalStaked * 100).toFixed(1)}%` : '0%';
        const avgEdge = bets.length > 0 ? bets.reduce((sum, b) => sum + parseFloat(b.edge || 0), 0) / bets.length : 0;
        document.getElementById('avgEdge').textContent = `${avgEdge.toFixed(1)}%`;
    }

    function renderPLChart() {
        const chartEl = document.getElementById('plChart');
        if (!chartEl) return;
        const settled = state.bets.filter(b => b.result === 'won' || b.result === 'lost');
        if (settled.length < 2) { chartEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Need at least 2 settled bets to show P/L chart.</div>'; return; }

        let cumPL = 0;
        const points = settled.map(b => {
            const s = parseFloat(b.stake);
            if (b.result === 'won') cumPL += s * (parseFloat(b.odds) - 1); else cumPL -= s;
            return cumPL;
        });

        const w = 600, h = 120, pad = 30;
        const maxY = Math.max(Math.abs(Math.max(...points)), Math.abs(Math.min(...points)), 10);
        const scaleX = (w - pad * 2) / (points.length - 1);
        const scaleY = (h - pad * 2) / (maxY * 2);
        const midY = h / 2;

        const pathPoints = points.map((v, i) => `${pad + i * scaleX},${midY - v * scaleY}`).join(' ');
        const lastPL = points[points.length - 1];
        const color = lastPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';

        chartEl.innerHTML = `
            <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px;">
                <line x1="${pad}" y1="${midY}" x2="${w-pad}" y2="${midY}" stroke="var(--border)" stroke-width="1" stroke-dasharray="4"/>
                <polyline points="${pathPoints}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
                ${points.map((v, i) => `<circle cx="${pad + i * scaleX}" cy="${midY - v * scaleY}" r="3" fill="${v >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}"/>`).join('')}
                <text x="${pad}" y="${midY - 4}" font-size="10" fill="var(--text-muted)">£0</text>
                <text x="${w - pad}" y="${midY - lastPL * scaleY - 8}" font-size="11" fill="${color}" font-weight="700">${lastPL >= 0 ? '+' : '-'}£${Math.abs(lastPL).toFixed(0)}</text>
            </svg>`;
    }

    // ── Model Validation ──
    function renderModelValidation() {
        const container = document.getElementById('modelValidation');
        if (!container) return;
        const accuracy = AnalysisEngine.calculateModelAccuracy();
        if (!accuracy) { container.innerHTML = '<p style="color:var(--text-muted);">No historical data available.</p>'; return; }

        const roundBars = accuracy.roundAccuracy.map(r =>
            `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                <span style="font-size:0.7rem;color:var(--text-muted);">${r.pct}%</span>
                <div style="width:28px;height:${r.pct * 0.6}px;background:${r.pct >= 70 ? 'var(--accent-green)' : r.pct >= 55 ? 'var(--accent-yellow)' : 'var(--accent-red)'};border-radius:3px;"></div>
                <span style="font-size:0.65rem;color:var(--text-muted);">R${r.round}</span>
            </div>`
        ).join('');

        // Calibration chart
        const calPoints = accuracy.calibration;
        const calBars = calPoints.map(c =>
            `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;">
                <div style="display:flex;gap:2px;align-items:flex-end;height:50px;">
                    <div style="width:10px;height:${c.predicted * 50}px;background:var(--accent-blue);border-radius:2px;" title="Predicted: ${(c.predicted*100).toFixed(0)}%"></div>
                    <div style="width:10px;height:${c.actual * 50}px;background:var(--accent-green);border-radius:2px;" title="Actual: ${(c.actual*100).toFixed(0)}%"></div>
                </div>
                <span style="font-size:0.6rem;color:var(--text-muted);">${(c.predicted*100).toFixed(0)}%</span>
            </div>`
        ).join('');

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
                <div class="stat-card"><span class="stat-value">${accuracy.accuracy}%</span><span class="stat-label">Accuracy</span></div>
                <div class="stat-card"><span class="stat-value">${accuracy.brierScore}</span><span class="stat-label">Brier Score</span></div>
                <div class="stat-card"><span class="stat-value">${accuracy.totalCorrect}/${accuracy.totalGames}</span><span class="stat-label">Correct</span></div>
                <div class="stat-card"><span class="stat-value">R1-R7</span><span class="stat-label">Sample</span></div>
            </div>
            <div class="analysis-card" style="margin-bottom:16px;">
                <h3>📊 Accuracy by Round</h3>
                <div style="display:flex;gap:8px;align-items:flex-end;justify-content:center;padding:12px 0;">${roundBars}</div>
            </div>
            <div class="analysis-card">
                <h3>🎯 Calibration (Predicted vs Actual)</h3>
                <div style="display:flex;gap:4px;align-items:flex-end;justify-content:center;padding:12px 0;">${calBars}</div>
                <div style="display:flex;gap:16px;justify-content:center;font-size:0.75rem;color:var(--text-muted);margin-top:8px;">
                    <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent-blue);border-radius:2px;vertical-align:middle;"></span> Predicted</span>
                    <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent-green);border-radius:2px;vertical-align:middle;"></span> Actual</span>
                </div>
                <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:12px;">A well-calibrated model has predicted and actual bars of similar height. Brier score closer to 0 is better (perfect = 0, coin flip = 0.25).</p>
            </div>`;
    }

    // ── Bet Modal ──
    function openAddBetModal() {
        document.getElementById('addBetModal').classList.add('active');
        document.getElementById('betDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('betSelection').value = '';
        document.getElementById('betOdds').value = '';
        document.getElementById('betStake').value = '';
        document.getElementById('betEdge').value = '';
        document.getElementById('betResult').value = 'pending';
    }

    function saveBet() {
        const idx = parseInt(document.getElementById('betMatch').value);
        const f = ROUND8_FIXTURES[idx];
        const bet = {
            date: document.getElementById('betDate').value,
            match: `${AFL_TEAMS[f.home].name} vs ${AFL_TEAMS[f.away].name}`,
            market: document.getElementById('betMarket').value,
            selection: document.getElementById('betSelection').value,
            odds: document.getElementById('betOdds').value,
            stake: document.getElementById('betStake').value,
            edge: document.getElementById('betEdge').value,
            result: document.getElementById('betResult').value
        };
        if (!bet.selection || !bet.odds || !bet.stake) return;
        state.bets.push(bet);
        saveBetsToStorage();
        renderTracker();
        document.getElementById('addBetModal').classList.remove('active');
    }

    function saveBetsToStorage() {
      if (typeof FireSync !== "undefined") { FireSync.save("afl_bets", state.bets); }
      else { localStorage.setItem('afl_bets', JSON.stringify(state.bets)); }
    }

    function exportCSV() {
        if (state.bets.length === 0) return;
        const headers = ['Date','Match','Market','Selection','Odds','Stake','Edge%','Result','P/L'];
        const rows = state.bets.map(b => {
            let pl = 0;
            if (b.result === 'won') pl = parseFloat(b.stake) * (parseFloat(b.odds) - 1);
            else if (b.result === 'lost') pl = -parseFloat(b.stake);
            return [b.date, `"${b.match}"`, b.market, `"${b.selection}"`, b.odds, b.stake, b.edge, b.result, pl.toFixed(2)];
        });
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `afl-bets-round${state.currentRound}.csv`; a.click();
        URL.revokeObjectURL(url);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
