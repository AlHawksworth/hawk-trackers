// ─── Games Page Logic ─────────────────────────────────────────────────────────
// Two games: "Guess the Ground" (multiple choice quiz) and "Ground Pairs" (memory match)

let gamesInitialised = false;

function initGamesPage() {
  if (gamesInitialised) return;
  gamesInitialised = true;
  wireGamePicker();
  wireQuiz();
  wireMemory();
}

// ── Game picker tabs ──────────────────────────────────────────────────────────
function wireGamePicker() {
  document.querySelectorAll(".game-pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".game-pick-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const game = btn.dataset.game;
      document.getElementById("game-quiz").classList.toggle("hidden", game !== "quiz");
      document.getElementById("game-memory").classList.toggle("hidden", game !== "memory");
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME 1: GUESS THE GROUND (Multiple Choice Quiz)
// ═══════════════════════════════════════════════════════════════════════════════

let quizState = {
  questions: [],
  current: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  total: 10,
  answered: false,
};

function getQuizClubs() {
  // Use all clubs from state
  return (typeof state !== "undefined" && state.clubs) ? state.clubs : DEFAULT_CLUBS;
}

function generateQuizQuestions(count) {
  const clubs = getQuizClubs();
  const shuffled = [...clubs].sort(() => Math.random() - 0.5);
  const questions = [];

  for (let i = 0; i < Math.min(count, clubs.length); i++) {
    const correct = shuffled[i];
    // Pick 3 wrong answers from same division first, then any
    const sameDivWrong = clubs.filter(c => c.id !== correct.id && c.division === correct.division);
    const otherWrong = clubs.filter(c => c.id !== correct.id && c.division !== correct.division);
    const wrongPool = [...sameDivWrong.sort(() => Math.random() - 0.5), ...otherWrong.sort(() => Math.random() - 0.5)];
    const wrongs = wrongPool.slice(0, 3);

    const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);

    // Randomly pick question type
    const types = ["stadium_to_club", "club_to_stadium", "division_hint"];
    const type = types[Math.floor(Math.random() * types.length)];

    questions.push({ correct, options, type });
  }

  return questions;
}

function renderQuizQuestion() {
  const q = quizState.questions[quizState.current];
  if (!q) return;

  quizState.answered = false;

  document.getElementById("quiz-score").textContent = `Score: ${quizState.score}`;
  document.getElementById("quiz-streak").textContent = `🔥 Streak: ${quizState.streak}`;
  document.getElementById("quiz-round").textContent = `Round: ${quizState.current + 1} / ${quizState.total}`;

  const stadiumEl = document.getElementById("quiz-stadium");
  const promptEl = document.getElementById("quiz-prompt");
  const hintEl = document.getElementById("quiz-hint");
  const optionsEl = document.getElementById("quiz-options");
  const feedbackEl = document.getElementById("quiz-feedback");
  const nextBtn = document.getElementById("quiz-next");

  feedbackEl.classList.add("hidden");
  nextBtn.style.display = "none";

  if (q.type === "stadium_to_club") {
    promptEl.textContent = "Which club plays at this ground?";
    stadiumEl.textContent = `🏟 ${q.correct.stadium}`;
    hintEl.textContent = `Division: ${q.correct.division}`;
    optionsEl.innerHTML = q.options.map((opt, i) =>
      `<button class="quiz-option-btn" data-idx="${i}" data-id="${opt.id}">${opt.name}</button>`
    ).join("");
  } else if (q.type === "club_to_stadium") {
    promptEl.textContent = "What is this club's home ground?";
    stadiumEl.textContent = `⚽ ${q.correct.name}`;
    hintEl.textContent = `Division: ${q.correct.division}`;
    optionsEl.innerHTML = q.options.map((opt, i) =>
      `<button class="quiz-option-btn" data-idx="${i}" data-id="${opt.id}">${opt.stadium}</button>`
    ).join("");
  } else {
    // division_hint — show stadium, hide division
    promptEl.textContent = "Which club plays at this ground?";
    stadiumEl.textContent = `🏟 ${q.correct.stadium}`;
    hintEl.textContent = "";
    optionsEl.innerHTML = q.options.map((opt, i) =>
      `<button class="quiz-option-btn" data-idx="${i}" data-id="${opt.id}">${opt.name} (${opt.division})</button>`
    ).join("");
  }

  // Wire option clicks
  optionsEl.querySelectorAll(".quiz-option-btn").forEach(btn => {
    btn.addEventListener("click", () => handleQuizAnswer(btn));
  });
}

function handleQuizAnswer(btn) {
  if (quizState.answered) return;
  quizState.answered = true;

  const q = quizState.questions[quizState.current];
  const selectedId = parseInt(btn.dataset.id);
  const isCorrect = selectedId === q.correct.id;

  // Highlight correct/wrong
  const optionsEl = document.getElementById("quiz-options");
  optionsEl.querySelectorAll(".quiz-option-btn").forEach(b => {
    const bId = parseInt(b.dataset.id);
    if (bId === q.correct.id) b.classList.add("quiz-correct");
    else if (bId === selectedId) b.classList.add("quiz-wrong");
    b.disabled = true;
  });

  const feedbackEl = document.getElementById("quiz-feedback");
  if (isCorrect) {
    quizState.score++;
    quizState.streak++;
    if (quizState.streak > quizState.bestStreak) quizState.bestStreak = quizState.streak;
    feedbackEl.textContent = getCorrectMessage();
    feedbackEl.className = "quiz-feedback quiz-feedback-correct";
  } else {
    quizState.streak = 0;
    const correctAnswer = q.type === "club_to_stadium" ? q.correct.stadium : q.correct.name;
    feedbackEl.textContent = `✗ Wrong! The answer was ${correctAnswer}`;
    feedbackEl.className = "quiz-feedback quiz-feedback-wrong";
  }
  feedbackEl.classList.remove("hidden");

  document.getElementById("quiz-score").textContent = `Score: ${quizState.score}`;
  document.getElementById("quiz-streak").textContent = `🔥 Streak: ${quizState.streak}`;

  // Show next or finish
  if (quizState.current < quizState.total - 1) {
    document.getElementById("quiz-next").style.display = "";
  } else {
    showQuizResult();
  }
}

function getCorrectMessage() {
  const msgs = ["✓ Correct!", "✓ Spot on!", "✓ Get in!", "✓ Nailed it!", "✓ Easy!", "✓ You know your grounds!"];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function showQuizResult() {
  const resultEl = document.getElementById("quiz-result");
  const pct = Math.round((quizState.score / quizState.total) * 100);
  let grade, emoji;
  if (pct === 100) { grade = "Perfect!"; emoji = "🏆"; }
  else if (pct >= 80) { grade = "Excellent!"; emoji = "🌟"; }
  else if (pct >= 60) { grade = "Good effort!"; emoji = "👍"; }
  else if (pct >= 40) { grade = "Not bad!"; emoji = "😅"; }
  else { grade = "Keep practising!"; emoji = "📚"; }

  resultEl.innerHTML = `
    <div class="quiz-result-card">
      <div class="quiz-result-emoji">${emoji}</div>
      <div class="quiz-result-grade">${grade}</div>
      <div class="quiz-result-score">${quizState.score} / ${quizState.total} correct (${pct}%)</div>
      <div class="quiz-result-streak">Best streak: ${quizState.bestStreak} 🔥</div>
    </div>
  `;
  resultEl.classList.remove("hidden");
  document.getElementById("quiz-next").style.display = "none";
  document.getElementById("quiz-restart").style.display = "";
}

function startQuiz() {
  quizState = {
    questions: generateQuizQuestions(10),
    current: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    total: 10,
    answered: false,
  };
  document.getElementById("quiz-result").classList.add("hidden");
  document.getElementById("quiz-start").style.display = "none";
  document.getElementById("quiz-restart").style.display = "none";
  document.getElementById("quiz-next").style.display = "none";
  renderQuizQuestion();
}

function wireQuiz() {
  document.getElementById("quiz-start").addEventListener("click", startQuiz);
  document.getElementById("quiz-restart").addEventListener("click", startQuiz);
  document.getElementById("quiz-next").addEventListener("click", () => {
    quizState.current++;
    renderQuizQuestion();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME 2: GROUND PAIRS (Memory Match)
// ═══════════════════════════════════════════════════════════════════════════════

let memoryState = {
  cards: [],
  flipped: [],
  matched: new Set(),
  moves: 0,
  pairs: 0,
  totalPairs: 8,
  timer: null,
  seconds: 0,
  locked: false,
  started: false,
};

function generateMemoryCards() {
  const clubs = getQuizClubs();
  const shuffled = [...clubs].sort(() => Math.random() - 0.5).slice(0, 8);

  const cards = [];
  shuffled.forEach((club, i) => {
    // Club name card
    cards.push({ id: `club-${i}`, pairId: i, type: "club", text: club.name, division: club.division });
    // Stadium card
    cards.push({ id: `stad-${i}`, pairId: i, type: "stadium", text: club.stadium, division: club.division });
  });

  // Shuffle cards
  return cards.sort(() => Math.random() - 0.5);
}

function renderMemoryGrid() {
  const grid = document.getElementById("memory-grid");
  grid.innerHTML = memoryState.cards.map((card, i) => `
    <div class="memory-card" data-idx="${i}" data-pair="${card.pairId}">
      <div class="memory-card-inner">
        <div class="memory-card-front">
          <span class="memory-card-icon">${card.type === "club" ? "⚽" : "🏟"}</span>
        </div>
        <div class="memory-card-back">
          <span class="memory-card-type">${card.type === "club" ? "Club" : "Stadium"}</span>
          <span class="memory-card-text">${card.text}</span>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".memory-card").forEach(card => {
    card.addEventListener("click", () => handleMemoryFlip(card));
  });
}

function handleMemoryFlip(cardEl) {
  if (memoryState.locked) return;
  const idx = parseInt(cardEl.dataset.idx);
  if (memoryState.matched.has(idx)) return;
  if (memoryState.flipped.includes(idx)) return;
  if (memoryState.flipped.length >= 2) return;

  // Flip card
  cardEl.classList.add("memory-flipped");
  memoryState.flipped.push(idx);

  if (memoryState.flipped.length === 2) {
    memoryState.moves++;
    document.getElementById("memory-moves").textContent = `Moves: ${memoryState.moves}`;

    const [first, second] = memoryState.flipped;
    const card1 = memoryState.cards[first];
    const card2 = memoryState.cards[second];

    if (card1.pairId === card2.pairId && card1.type !== card2.type) {
      // Match!
      memoryState.matched.add(first);
      memoryState.matched.add(second);
      memoryState.pairs++;
      document.getElementById("memory-pairs").textContent = `Pairs: ${memoryState.pairs} / ${memoryState.totalPairs}`;

      // Mark as matched
      setTimeout(() => {
        const cards = document.querySelectorAll(".memory-card");
        cards[first].classList.add("memory-matched");
        cards[second].classList.add("memory-matched");
      }, 300);

      memoryState.flipped = [];

      // Check win
      if (memoryState.pairs === memoryState.totalPairs) {
        clearInterval(memoryState.timer);
        showMemoryResult();
      }
    } else {
      // No match — flip back
      memoryState.locked = true;
      setTimeout(() => {
        const cards = document.querySelectorAll(".memory-card");
        cards[first].classList.remove("memory-flipped");
        cards[second].classList.remove("memory-flipped");
        memoryState.flipped = [];
        memoryState.locked = false;
      }, 1000);
    }
  }
}

function startMemoryTimer() {
  memoryState.seconds = 0;
  clearInterval(memoryState.timer);
  memoryState.timer = setInterval(() => {
    memoryState.seconds++;
    const mins = Math.floor(memoryState.seconds / 60);
    const secs = memoryState.seconds % 60;
    document.getElementById("memory-timer").textContent = `⏱ ${mins}:${secs.toString().padStart(2, "0")}`;
  }, 1000);
}

function showMemoryResult() {
  const resultEl = document.getElementById("memory-result");
  const mins = Math.floor(memoryState.seconds / 60);
  const secs = memoryState.seconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  let grade, emoji;
  if (memoryState.moves <= 12) { grade = "Incredible memory!"; emoji = "🧠"; }
  else if (memoryState.moves <= 16) { grade = "Sharp!"; emoji = "🌟"; }
  else if (memoryState.moves <= 22) { grade = "Well done!"; emoji = "👍"; }
  else { grade = "Got there in the end!"; emoji = "😅"; }

  resultEl.innerHTML = `
    <div class="memory-result-card">
      <div class="memory-result-emoji">${emoji}</div>
      <div class="memory-result-grade">${grade}</div>
      <div class="memory-result-stats">
        <span>Moves: ${memoryState.moves}</span>
        <span>Time: ${timeStr}</span>
      </div>
    </div>
  `;
  resultEl.classList.remove("hidden");
  document.getElementById("memory-restart").style.display = "";
}

function startMemory() {
  memoryState = {
    cards: generateMemoryCards(),
    flipped: [],
    matched: new Set(),
    moves: 0,
    pairs: 0,
    totalPairs: 8,
    timer: null,
    seconds: 0,
    locked: false,
    started: true,
  };
  document.getElementById("memory-moves").textContent = "Moves: 0";
  document.getElementById("memory-pairs").textContent = "Pairs: 0 / 8";
  document.getElementById("memory-timer").textContent = "⏱ 0:00";
  document.getElementById("memory-result").classList.add("hidden");
  document.getElementById("memory-start").style.display = "none";
  document.getElementById("memory-restart").style.display = "none";
  renderMemoryGrid();
  startMemoryTimer();
}

function wireMemory() {
  document.getElementById("memory-start").addEventListener("click", startMemory);
  document.getElementById("memory-restart").addEventListener("click", startMemory);
}
