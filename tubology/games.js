// Tubology - Games Module

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

function initLineRecitalGame() {
  const lineSelect = document.getElementById('recital-line-select');
  const gameArea = document.getElementById('recital-game-area');
  const input = document.getElementById('recital-input');
  const backBtn = document.getElementById('btn-back-recital');
  const giveUpBtn = document.getElementById('recital-give-up');

  // Build line selection grid
  lineSelect.innerHTML = Object.entries(TUBE_LINES).map(([id, line]) => `
    <button class="line-select-btn" data-line="${id}" style="--line-color:${line.color}">
      <span class="line-select-name">${line.name}</span>
      <span class="line-select-count">${[...new Set(line.stations)].length} stops</span>
    </button>
  `).join('');

  // Line selection
  lineSelect.addEventListener('click', e => {
    const btn = e.target.closest('[data-line]');
    if (!btn) return;
    startRecital(btn.dataset.line);
  });

  // Input handling
  input.addEventListener('input', () => {
    checkRecitalGuess(input.value.trim());
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      if (val) checkRecitalGuess(val, true);
    }
  });

  // Give up
  giveUpBtn.addEventListener('click', endRecital);

  // Back button
  backBtn.addEventListener('click', () => {
    document.getElementById('game-line-recital').classList.add('hidden');
    document.getElementById('games-menu').classList.remove('hidden');
  });
}

function startRecital(lineId) {
  const line = TUBE_LINES[lineId];
  const stations = [...new Set(line.stations)];

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

    // Check if complete
    if (recitalState.remaining.length === 0) {
      endRecital(true);
    }

    setTimeout(() => {
      document.getElementById('recital-feedback').textContent = '';
      document.getElementById('recital-feedback').className = 'recital-feedback';
    }, 1500);
  } else if (forceCheck) {
    document.getElementById('recital-feedback').textContent = '✗ Not on this line';
    document.getElementById('recital-feedback').className = 'recital-feedback incorrect';
    document.getElementById('recital-input').value = '';
    setTimeout(() => {
      document.getElementById('recital-feedback').textContent = '';
      document.getElementById('recital-feedback').className = 'recital-feedback';
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
  const results = document.getElementById('recital-results');
  const line = TUBE_LINES[recitalState.lineId];
  const pct = Math.round((recitalState.score / recitalState.stations.length) * 100);

  let html = `
    <div class="recital-result-header ${won ? 'won' : ''}">
      ${won ? '🎉 Perfect!' : `${pct}% Complete`}
    </div>
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
}


// ═══════════════════════════════════════════
// STATION GUESSER GAME (Surprise Game!)
// ═══════════════════════════════════════════
// Given a station name, guess which line(s) it belongs to

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
  // Pick a random station
  const station = ALL_STATIONS[Math.floor(Math.random() * ALL_STATIONS.length)];
  const correctLines = STATION_INDEX[station].lines;

  guesserState.currentStation = station;
  guesserState.correctLines = correctLines;

  document.getElementById('guesser-station-name').textContent = station;
  document.getElementById('guesser-feedback').textContent = '';
  document.getElementById('guesser-feedback').className = 'guesser-feedback';

  // Build options: correct lines + random wrong ones
  const allLineIds = Object.keys(TUBE_LINES);
  const wrongLines = allLineIds.filter(l => !correctLines.includes(l));
  const shuffledWrong = wrongLines.sort(() => Math.random() - 0.5);

  // Show 4-6 options
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

    // Show restart
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
// GAME NAVIGATION
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initLineRecitalGame();
  initStationGuesserGame();

  // Game menu buttons
  document.getElementById('btn-line-recital').addEventListener('click', () => {
    document.getElementById('games-menu').classList.add('hidden');
    document.getElementById('game-line-recital').classList.remove('hidden');
  });

  document.getElementById('btn-station-guesser').addEventListener('click', () => {
    document.getElementById('games-menu').classList.add('hidden');
    document.getElementById('game-station-guesser').classList.remove('hidden');
  });
});
