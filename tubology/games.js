// Tubology - Games Module

// ═══════════════════════════════════════════
// GAME SCORES SYNC
// ═══════════════════════════════════════════
const GAME_SCORES_KEY = 'tubology_game_scores';

function loadGameScores() {
  const local = localStorage.getItem(GAME_SCORES_KEY);
  if (local) {
    try { return JSON.parse(local); } catch(e) {}
  }
  return {};
}

function saveGameScores(scores) {
  localStorage.setItem(GAME_SCORES_KEY, JSON.stringify(scores));
  if (typeof FireSync !== 'undefined') {
    FireSync.save(GAME_SCORES_KEY, scores);
  }
}

function initGameScoresSync() {
  if (typeof FireSync !== 'undefined') {
    FireSync.load(GAME_SCORES_KEY, (cloudScores) => {
      if (cloudScores && typeof cloudScores === 'object') {
        // Merge: keep best scores
        const local = loadGameScores();
        const merged = { ...local };
        Object.keys(cloudScores).forEach(key => {
          if (key === 'speedrun_best') {
            // Lower time is better for speed run
            if (!merged[key] || cloudScores[key] < merged[key]) {
              merged[key] = cloudScores[key];
            }
          } else {
            // Higher score is better for other games
            if (!merged[key] || cloudScores[key] > merged[key]) {
              merged[key] = cloudScores[key];
            }
          }
        });
        localStorage.setItem(GAME_SCORES_KEY, JSON.stringify(merged));
        applyGameScores(merged);
      }
    });

    FireSync.listen(GAME_SCORES_KEY, (cloudScores) => {
      if (cloudScores && typeof cloudScores === 'object') {
        const local = loadGameScores();
        const merged = { ...local };
        Object.keys(cloudScores).forEach(key => {
          if (key === 'speedrun_best') {
            if (!merged[key] || cloudScores[key] < merged[key]) {
              merged[key] = cloudScores[key];
            }
          } else {
            if (!merged[key] || cloudScores[key] > merged[key]) {
              merged[key] = cloudScores[key];
            }
          }
        });
        localStorage.setItem(GAME_SCORES_KEY, JSON.stringify(merged));
        applyGameScores(merged);
      }
    });
  }
}

function applyGameScores(scores) {
  if (scores.guesser_best !== undefined) {
    guesserState.best = scores.guesser_best;
    const el = document.getElementById('guesser-best');
    if (el) el.textContent = guesserState.best;
  }
  if (scores.oddoneout_best !== undefined) {
    oddOneOutState.best = scores.oddoneout_best;
    const el = document.getElementById('oddoneout-best');
    if (el) el.textContent = oddOneOutState.best;
  }
  if (scores.speedrun_best !== undefined) {
    speedRunState.best = scores.speedrun_best;
    const el = document.getElementById('speedrun-best-time');
    if (el) el.textContent = scores.speedrun_best;
  }
  if (scores.recital_bests) {
    Object.assign(recitalBests, scores.recital_bests);
    localStorage.setItem('tubology_recital_bests', JSON.stringify(recitalBests));
  }
}

// ═══════════════════════════════════════════
// LINE RECITAL GAME
// ═══════════════════════════════════════════

let recitalState = {
  lineId: null,
  stations: [],
  guessed: [],
  remaining: [],
  score: 0
};

let recitalHintTimer = null;
let recitalBests = JSON.parse(localStorage.getItem('tubology_recital_bests') || '{}');

function initLineRecitalGame() {
  const lineSelect = document.getElementById('recital-line-select');
  const gameArea = document.getElementById('recital-game-area');
  const input = document.getElementById('recital-input');
  const backBtn = document.getElementById('btn-back-recital');
  const giveUpBtn = document.getElementById('recital-give-up');

  // Build line selection grid
  lineSelect.innerHTML = Object.entries(TUBE_LINES).map(([id, line]) => {
    const best = recitalBests[id];
    const total = line.uniqueStations.length;
    const bestStr = best !== undefined ? `Best: ${best}/${total}` : '';
    return `
      <button class="line-select-btn" data-line="${id}" style="--line-color:${line.color}">
        <span class="line-select-name">${line.name}</span>
        <span class="line-select-count">${total} stops</span>
        ${bestStr ? `<span class="line-select-best">${bestStr}</span>` : ''}
      </button>
    `;
  }).join('');

  // Line selection
  lineSelect.addEventListener('click', e => {
    const btn = e.target.closest('[data-line]');
    if (!btn) return;
    startRecital(btn.dataset.line);
  });

  // Input handling
  input.addEventListener('input', () => {
    checkRecitalGuess(input.value.trim());
    resetHintTimer();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      if (val) checkRecitalGuess(val, true);
    }
  });

  // Give up
  giveUpBtn.addEventListener('click', () => endRecital());

  // Back button
  backBtn.addEventListener('click', () => {
    clearTimeout(recitalHintTimer);
    document.getElementById('game-line-recital').classList.add('hidden');
    document.getElementById('games-menu').classList.remove('hidden');
  });
}

function resetHintTimer() {
  clearTimeout(recitalHintTimer);
  if (!recitalState.lineId || recitalState.remaining.length === 0) return;
  recitalHintTimer = setTimeout(showRecitalHint, 8000);
}

function showRecitalHint() {
  if (!recitalState.lineId || recitalState.remaining.length === 0) return;
  const feedback = document.getElementById('recital-feedback');
  // Find the next station in order that hasn't been guessed
  const nextIdx = recitalState.guessed.findIndex(g => g === null);
  if (nextIdx === -1) return;
  const station = recitalState.stations[nextIdx];
  const words = station.split(' ');
  const hint = words.length > 1
    ? `Hint: ${station[0]}... (${words.length} words, ${station.length} letters)`
    : `Hint: ${station[0]}... (${station.length} letters)`;
  feedback.textContent = hint;
  feedback.className = 'recital-feedback hint';
}

function startRecital(lineId) {
  const line = TUBE_LINES[lineId];
  const stations = line.uniqueStations;

  recitalState = {
    lineId,
    stations,
    guessed: new Array(stations.length).fill(null),
    remaining: [...stations],
    score: 0
  };

  document.getElementById('recital-line-select').classList.add('hidden');
  document.getElementById('recital-game-area').classList.remove('hidden');
  document.getElementById('recital-line-name').textContent = line.name;
  document.getElementById('recital-line-name').style.background = line.color;
  document.getElementById('recital-score').textContent = `0 / ${stations.length}`;
  document.getElementById('recital-input').value = '';
  document.getElementById('recital-input').focus();
  document.getElementById('recital-feedback').textContent = '';
  document.getElementById('recital-results').classList.add('hidden');

  renderRecitalProgress();
  resetHintTimer();
}

function checkRecitalGuess(guess, forceCheck = false) {
  if (!recitalState.lineId) return;

  const normalizedGuess = guess.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ');

  // Find matching station
  const matchIdx = recitalState.remaining.findIndex(s =>
    s.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ') === normalizedGuess ||
    s.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').replace(/st\./g, 'st') === normalizedGuess.replace(/st\./g, 'st') ||
    s.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').replace(/&/g, 'and') === normalizedGuess.replace(/&/g, 'and')
  );

  if (matchIdx !== -1) {
    const station = recitalState.remaining[matchIdx];
    const originalIdx = recitalState.stations.indexOf(station);
    recitalState.guessed[originalIdx] = station;
    recitalState.remaining.splice(matchIdx, 1);
    recitalState.score++;

    document.getElementById('recital-score').textContent = `${recitalState.score} / ${recitalState.stations.length}`;
    document.getElementById('recital-input').value = '';
    document.getElementById('recital-feedback').textContent = `✓ ${station}`;
    document.getElementById('recital-feedback').className = 'recital-feedback correct';

    renderRecitalProgress();
    resetHintTimer();

    // Check if complete
    if (recitalState.remaining.length === 0) {
      endRecital(true);
    }

    setTimeout(() => {
      const fb = document.getElementById('recital-feedback');
      if (fb && fb.classList.contains('correct')) {
        fb.textContent = '';
        fb.className = 'recital-feedback';
      }
    }, 1500);
  } else if (forceCheck) {
    document.getElementById('recital-feedback').textContent = '✗ Not on this line';
    document.getElementById('recital-feedback').className = 'recital-feedback incorrect';
    document.getElementById('recital-input').value = '';
    resetHintTimer();
    setTimeout(() => {
      const fb = document.getElementById('recital-feedback');
      if (fb && fb.classList.contains('incorrect')) {
        fb.textContent = '';
        fb.className = 'recital-feedback';
      }
    }, 1500);
  }
}

function renderRecitalProgress() {
  const container = document.getElementById('recital-progress');
  const line = TUBE_LINES[recitalState.lineId];

  container.innerHTML = recitalState.stations.map((station, idx) => {
    const guessed = recitalState.guessed[idx] !== null;
    return `<div class="recital-slot ${guessed ? 'revealed' : ''}" style="--line-color:${line.color}">
      ${guessed ? station : (idx + 1)}
    </div>`;
  }).join('');
}

function endRecital(won = false) {
  clearTimeout(recitalHintTimer);
  const results = document.getElementById('recital-results');
  const line = TUBE_LINES[recitalState.lineId];
  const pct = Math.round((recitalState.score / recitalState.stations.length) * 100);

  // Save personal best
  const prevBest = recitalBests[recitalState.lineId] || 0;
  if (recitalState.score > prevBest) {
    recitalBests[recitalState.lineId] = recitalState.score;
    localStorage.setItem('tubology_recital_bests', JSON.stringify(recitalBests));
    // Sync to cloud
    const scores = loadGameScores();
    scores.recital_bests = recitalBests;
    saveGameScores(scores);
  }
  const isNewBest = recitalState.score > prevBest;

  let html = `
    <div class="recital-result-header ${won ? 'won' : ''}">
      ${won ? '🎉 Perfect!' : `${pct}% Complete`}
    </div>
    ${isNewBest ? '<div class="recital-new-best">🏆 New Personal Best!</div>' : ''}
    <div class="recital-result-score">${recitalState.score} / ${recitalState.stations.length} stations</div>
    <div class="recital-result-list">
  `;

  recitalState.stations.forEach((station, idx) => {
    const guessed = recitalState.guessed[idx] !== null;
    html += `<div class="recital-result-item ${guessed ? 'got' : 'missed'}">
      <span class="recital-result-num">${idx + 1}</span>
      <span class="recital-result-name">${station}</span>
      <span class="recital-result-icon">${guessed ? '✓' : '✗'}</span>
    </div>`;
  });

  html += `</div>
    <button class="btn-primary" onclick="resetRecital()">Play Again</button>
  `;

  results.innerHTML = html;
  results.classList.remove('hidden');
  document.getElementById('recital-input').disabled = true;
}

function resetRecital() {
  recitalState = { lineId: null, stations: [], guessed: [], remaining: [], score: 0 };
  document.getElementById('recital-line-select').classList.remove('hidden');
  document.getElementById('recital-game-area').classList.add('hidden');
  document.getElementById('recital-input').disabled = false;
  // Refresh bests display
  initLineRecitalGame();
}


// ═══════════════════════════════════════════
// STATION GUESSER GAME
// ═══════════════════════════════════════════

let guesserState = {
  currentStation: null,
  correctLines: [],
  score: 0,
  streak: 0,
  best: parseInt(localStorage.getItem('tubology_guesser_best') || '0'),
  active: false
};

function initStationGuesserGame() {
  const startBtn = document.getElementById('guesser-start');
  const backBtn = document.getElementById('btn-back-guesser');
  const optionsContainer = document.getElementById('guesser-options');

  document.getElementById('guesser-best').textContent = guesserState.best;

  startBtn.addEventListener('click', () => {
    guesserState.score = 0;
    guesserState.streak = 0;
    guesserState.active = true;
    updateGuesserScore();
    startBtn.classList.add('hidden');
    nextGuesserRound();
  });

  optionsContainer.addEventListener('click', e => {
    const btn = e.target.closest('.guesser-option');
    if (!btn || !guesserState.active) return;
    checkGuesserAnswer(btn.dataset.line);
  });

  backBtn.addEventListener('click', () => {
    guesserState.active = false;
    document.getElementById('game-station-guesser').classList.add('hidden');
    document.getElementById('games-menu').classList.remove('hidden');
    document.getElementById('guesser-start').classList.remove('hidden');
  });
}

function nextGuesserRound() {
  const station = ALL_STATIONS[Math.floor(Math.random() * ALL_STATIONS.length)];
  const correctLines = STATION_INDEX[station].lines;

  guesserState.currentStation = station;
  guesserState.correctLines = correctLines;

  document.getElementById('guesser-station-name').textContent = station;
  document.getElementById('guesser-feedback').textContent = '';
  document.getElementById('guesser-feedback').className = 'guesser-feedback';

  const allLineIds = Object.keys(TUBE_LINES);
  const wrongLines = allLineIds.filter(l => !correctLines.includes(l));
  const shuffledWrong = wrongLines.sort(() => Math.random() - 0.5);

  const numOptions = Math.min(6, Math.max(4, correctLines.length + 2));
  const numWrong = numOptions - correctLines.length;
  const options = [...correctLines, ...shuffledWrong.slice(0, numWrong)].sort(() => Math.random() - 0.5);

  const optionsContainer = document.getElementById('guesser-options');
  optionsContainer.innerHTML = options.map(lineId => {
    const line = TUBE_LINES[lineId];
    return `<button class="guesser-option" data-line="${lineId}" style="--line-color:${line.color}">
      <span class="guesser-option-color" style="background:${line.color}"></span>
      ${line.name}
    </button>`;
  }).join('');
}

function checkGuesserAnswer(lineId) {
  const feedback = document.getElementById('guesser-feedback');
  const isCorrect = guesserState.correctLines.includes(lineId);

  if (isCorrect) {
    guesserState.score++;
    guesserState.streak++;
    if (guesserState.streak > guesserState.best) {
      guesserState.best = guesserState.streak;
      localStorage.setItem('tubology_guesser_best', guesserState.best.toString());
      const scores = loadGameScores();
      scores.guesser_best = guesserState.best;
      saveGameScores(scores);
    }
    feedback.textContent = '✓ Correct!';
    feedback.className = 'guesser-feedback correct';
    updateGuesserScore();

    setTimeout(() => nextGuesserRound(), 800);
  } else {
    const correctNames = guesserState.correctLines.map(l => TUBE_LINES[l].name).join(', ');
    feedback.textContent = `✗ Wrong! It's on the ${correctNames}`;
    feedback.className = 'guesser-feedback incorrect';
    guesserState.streak = 0;
    guesserState.active = false;
    updateGuesserScore();

    setTimeout(() => {
      document.getElementById('guesser-start').classList.remove('hidden');
      document.getElementById('guesser-start').textContent = `Play Again (Score: ${guesserState.score})`;
    }, 1500);
  }
}

function updateGuesserScore() {
  document.getElementById('guesser-score').textContent = guesserState.score;
  document.getElementById('guesser-streak').textContent = guesserState.streak;
  document.getElementById('guesser-best').textContent = guesserState.best;
}


// ═══════════════════════════════════════════
// ODD ONE OUT GAME
// ═══════════════════════════════════════════

let oddOneOutState = {
  correctStation: null,
  correctLine: null,
  options: [],
  score: 0,
  streak: 0,
  best: parseInt(localStorage.getItem('tubology_oddoneout_best') || '0'),
  active: false
};

function initOddOneOutGame() {
  const startBtn = document.getElementById('oddoneout-start');
  const backBtn = document.getElementById('btn-back-oddoneout');
  const optionsContainer = document.getElementById('oddoneout-options');

  document.getElementById('oddoneout-best').textContent = oddOneOutState.best;

  startBtn.addEventListener('click', () => {
    oddOneOutState.score = 0;
    oddOneOutState.streak = 0;
    oddOneOutState.active = true;
    updateOddOneOutScore();
    startBtn.classList.add('hidden');
    nextOddOneOutRound();
  });

  optionsContainer.addEventListener('click', e => {
    const btn = e.target.closest('.oddoneout-option');
    if (!btn || !oddOneOutState.active) return;
    checkOddOneOutAnswer(btn.dataset.station);
  });

  backBtn.addEventListener('click', () => {
    oddOneOutState.active = false;
    document.getElementById('game-odd-one-out').classList.add('hidden');
    document.getElementById('games-menu').classList.remove('hidden');
    document.getElementById('oddoneout-start').classList.remove('hidden');
  });
}

function nextOddOneOutRound() {
  // Pick a random line
  const lineIds = Object.keys(TUBE_LINES);
  const lineId = lineIds[Math.floor(Math.random() * lineIds.length)];
  const line = TUBE_LINES[lineId];
  const lineStations = line.uniqueStations;

  // Pick 3 stations from this line
  const shuffled = lineStations.sort(() => Math.random() - 0.5);
  const correctStations = shuffled.slice(0, 3);

  // Pick 1 station NOT on this line
  const otherStations = ALL_STATIONS.filter(s => !lineStations.includes(s));
  const oddStation = otherStations[Math.floor(Math.random() * otherStations.length)];

  const options = [...correctStations, oddStation].sort(() => Math.random() - 0.5);

  oddOneOutState.correctStation = oddStation;
  oddOneOutState.correctLine = lineId;
  oddOneOutState.options = options;

  document.getElementById('oddoneout-line-name').textContent = line.name;
  document.getElementById('oddoneout-line-name').style.background = line.color;
  document.getElementById('oddoneout-feedback').textContent = '';
  document.getElementById('oddoneout-feedback').className = 'guesser-feedback';

  const optionsContainer = document.getElementById('oddoneout-options');
  optionsContainer.innerHTML = options.map(station => `
    <button class="oddoneout-option" data-station="${station}">
      ${station}
    </button>
  `).join('');
}

function checkOddOneOutAnswer(station) {
  const feedback = document.getElementById('oddoneout-feedback');
  const isCorrect = station === oddOneOutState.correctStation;

  if (isCorrect) {
    oddOneOutState.score++;
    oddOneOutState.streak++;
    if (oddOneOutState.streak > oddOneOutState.best) {
      oddOneOutState.best = oddOneOutState.streak;
      localStorage.setItem('tubology_oddoneout_best', oddOneOutState.best.toString());
      const scores = loadGameScores();
      scores.oddoneout_best = oddOneOutState.best;
      saveGameScores(scores);
    }
    feedback.textContent = `✓ Correct! ${station} is not on the ${TUBE_LINES[oddOneOutState.correctLine].name} line`;
    feedback.className = 'guesser-feedback correct';
    updateOddOneOutScore();
    setTimeout(() => nextOddOneOutRound(), 1200);
  } else {
    feedback.textContent = `✗ Wrong! ${oddOneOutState.correctStation} was the odd one out`;
    feedback.className = 'guesser-feedback incorrect';
    oddOneOutState.streak = 0;
    oddOneOutState.active = false;
    updateOddOneOutScore();

    setTimeout(() => {
      document.getElementById('oddoneout-start').classList.remove('hidden');
      document.getElementById('oddoneout-start').textContent = `Play Again (Score: ${oddOneOutState.score})`;
    }, 1500);
  }
}

function updateOddOneOutScore() {
  document.getElementById('oddoneout-score').textContent = oddOneOutState.score;
  document.getElementById('oddoneout-streak').textContent = oddOneOutState.streak;
  document.getElementById('oddoneout-best').textContent = oddOneOutState.best;
}


// ═══════════════════════════════════════════
// SPEED RUN GAME (Name all Zone 1 stations)
// ═══════════════════════════════════════════

// Speed run uses the dynamic zone data
const ZONE1_STATIONS = Object.keys(STATION_ZONES).filter(s => STATION_ZONES[s] === 1).sort();

let speedRunState = {
  remaining: [],
  guessed: [],
  score: 0,
  startTime: null,
  timerInterval: null,
  active: false,
  best: localStorage.getItem('tubology_speedrun_best') || null
};

function initSpeedRunGame() {
  const startBtn = document.getElementById('speedrun-start');
  const backBtn = document.getElementById('btn-back-speedrun');
  const input = document.getElementById('speedrun-input');

  if (speedRunState.best) {
    document.getElementById('speedrun-best-time').textContent = speedRunState.best;
  }

  startBtn.addEventListener('click', startSpeedRun);

  input.addEventListener('input', () => {
    if (!speedRunState.active) return;
    checkSpeedRunGuess(input.value.trim());
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && speedRunState.active) {
      checkSpeedRunGuess(input.value.trim(), true);
    }
  });

  backBtn.addEventListener('click', () => {
    endSpeedRun(false);
    document.getElementById('game-speed-run').classList.add('hidden');
    document.getElementById('games-menu').classList.remove('hidden');
  });
}

function startSpeedRun() {
  speedRunState = {
    remaining: [...ZONE1_STATIONS],
    guessed: [],
    score: 0,
    startTime: Date.now(),
    timerInterval: null,
    active: true,
    best: speedRunState.best
  };

  document.getElementById('speedrun-start').classList.add('hidden');
  document.getElementById('speedrun-game-area').classList.remove('hidden');
  document.getElementById('speedrun-input').value = '';
  document.getElementById('speedrun-input').disabled = false;
  document.getElementById('speedrun-input').focus();
  document.getElementById('speedrun-count').textContent = `0 / ${ZONE1_STATIONS.length}`;
  document.getElementById('speedrun-feedback').textContent = '';
  document.getElementById('speedrun-results').classList.add('hidden');

  // Start timer
  speedRunState.timerInterval = setInterval(updateSpeedRunTimer, 100);
}

function updateSpeedRunTimer() {
  if (!speedRunState.active) return;
  const elapsed = Math.floor((Date.now() - speedRunState.startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  document.getElementById('speedrun-timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function checkSpeedRunGuess(guess, forceCheck = false) {
  if (!speedRunState.active) return;
  const normalizedGuess = guess.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ');

  const matchIdx = speedRunState.remaining.findIndex(s =>
    s.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ') === normalizedGuess ||
    s.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').replace(/st\./g, 'st') === normalizedGuess.replace(/st\./g, 'st') ||
    s.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').replace(/&/g, 'and') === normalizedGuess.replace(/&/g, 'and')
  );

  if (matchIdx !== -1) {
    const station = speedRunState.remaining[matchIdx];
    speedRunState.remaining.splice(matchIdx, 1);
    speedRunState.guessed.push(station);
    speedRunState.score++;

    document.getElementById('speedrun-input').value = '';
    document.getElementById('speedrun-count').textContent = `${speedRunState.score} / ${ZONE1_STATIONS.length}`;
    document.getElementById('speedrun-feedback').textContent = `✓ ${station}`;
    document.getElementById('speedrun-feedback').className = 'recital-feedback correct';

    setTimeout(() => {
      const fb = document.getElementById('speedrun-feedback');
      if (fb) { fb.textContent = ''; fb.className = 'recital-feedback'; }
    }, 1000);

    if (speedRunState.remaining.length === 0) {
      endSpeedRun(true);
    }
  } else if (forceCheck) {
    document.getElementById('speedrun-feedback').textContent = '✗ Not a Zone 1 station';
    document.getElementById('speedrun-feedback').className = 'recital-feedback incorrect';
    document.getElementById('speedrun-input').value = '';
    setTimeout(() => {
      const fb = document.getElementById('speedrun-feedback');
      if (fb) { fb.textContent = ''; fb.className = 'recital-feedback'; }
    }, 1000);
  }
}

function endSpeedRun(completed) {
  speedRunState.active = false;
  clearInterval(speedRunState.timerInterval);

  if (!completed) return;

  const elapsed = Math.floor((Date.now() - speedRunState.startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  const isNewBest = !speedRunState.best || timeStr < speedRunState.best;
  if (isNewBest) {
    speedRunState.best = timeStr;
    localStorage.setItem('tubology_speedrun_best', timeStr);
    document.getElementById('speedrun-best-time').textContent = timeStr;
    const scores = loadGameScores();
    scores.speedrun_best = timeStr;
    saveGameScores(scores);
  }

  document.getElementById('speedrun-input').disabled = true;
  const results = document.getElementById('speedrun-results');
  results.innerHTML = `
    <div class="recital-result-header won">
      ${speedRunState.score === ZONE1_STATIONS.length ? '🎉 All Zone 1 stations!' : `${speedRunState.score} / ${ZONE1_STATIONS.length}`}
    </div>
    <div class="recital-result-score">Time: ${timeStr} ${isNewBest ? '🏆 New Best!' : ''}</div>
    <button class="btn-primary" onclick="resetSpeedRun()">Play Again</button>
  `;
  results.classList.remove('hidden');
}

function resetSpeedRun() {
  document.getElementById('speedrun-start').classList.remove('hidden');
  document.getElementById('speedrun-game-area').classList.add('hidden');
  document.getElementById('speedrun-results').classList.add('hidden');
}


// ═══════════════════════════════════════════
// GAME NAVIGATION
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initLineRecitalGame();
  initStationGuesserGame();
  initOddOneOutGame();
  initSpeedRunGame();
  initGameScoresSync();

  // Game menu buttons
  document.getElementById('btn-line-recital').addEventListener('click', () => {
    document.getElementById('games-menu').classList.add('hidden');
    document.getElementById('game-line-recital').classList.remove('hidden');
  });

  document.getElementById('btn-station-guesser').addEventListener('click', () => {
    document.getElementById('games-menu').classList.add('hidden');
    document.getElementById('game-station-guesser').classList.remove('hidden');
  });

  document.getElementById('btn-odd-one-out').addEventListener('click', () => {
    document.getElementById('games-menu').classList.add('hidden');
    document.getElementById('game-odd-one-out').classList.remove('hidden');
  });

  document.getElementById('btn-speed-run').addEventListener('click', () => {
    document.getElementById('games-menu').classList.add('hidden');
    document.getElementById('game-speed-run').classList.remove('hidden');
  });
});
