// ═══════════════════════════════════════════
// SQL Mimo — Main Application
// ═══════════════════════════════════════════

(function () {
  'use strict';

  const LS_KEY = 'sql_mimo';

  // ── State ──
  let state = {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    completedLessons: [],
    earnedBadges: [],
    practiceCompleted: 0,
    perfectLessons: 0,
    nightOwl: false,
    speedDemon: false,
    lessonStartTime: null
  };

  // ── Persistence ──
  function saveState() {
    FireSync.save(LS_KEY, state);
  }

  function loadState(callback) {
    FireSync.load(LS_KEY, function (data) {
      if (data) {
        state = Object.assign(state, data);
      }
      updateStreak();
      callback();
    });
  }

  // ── Streak Logic ──
  function getToday() {
    return new Date().toISOString().split('T')[0];
  }

  function updateStreak() {
    const today = getToday();
    if (!state.lastActiveDate) {
      state.streak = 0;
      return;
    }
    const last = new Date(state.lastActiveDate);
    const now = new Date(today);
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, streak unchanged
    } else if (diffDays === 1) {
      // Consecutive day — streak already incremented when they completed something
    } else {
      // Missed a day
      state.streak = 0;
    }
  }

  function recordActivity() {
    const today = getToday();
    if (state.lastActiveDate !== today) {
      if (state.lastActiveDate) {
        const last = new Date(state.lastActiveDate);
        const now = new Date(today);
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          state.streak++;
        } else if (diffDays > 1) {
          state.streak = 1;
        }
      } else {
        state.streak = 1;
      }
      state.lastActiveDate = today;
    }
  }

  // ── UI Updates ──
  function updateTopBar() {
    document.getElementById('streak-count').textContent = state.streak;
    document.getElementById('xp-count').textContent = state.xp;
  }

  // ── Navigation ──
  const navBtns = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.view;
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + target).classList.add('active');

      if (target === 'badges') renderBadges();
      if (target === 'profile') renderProfile();
      if (target === 'practice') renderPractice();
    });
  });

  // ── Render Lesson Path ──
  function renderLessonPath() {
    const container = document.getElementById('lesson-path');
    container.innerHTML = '';

    LESSONS.forEach((lesson, idx) => {
      const isCompleted = state.completedLessons.includes(lesson.id);
      const isLocked = idx > 0 && !state.completedLessons.includes(LESSONS[idx - 1].id);

      const node = document.createElement('div');
      node.className = 'lesson-node' + (isCompleted ? ' completed' : '') + (isLocked ? ' locked' : '');

      node.innerHTML = `
        <div class="lesson-node-icon">${lesson.icon}</div>
        <div class="lesson-node-info">
          <div class="lesson-node-title">${lesson.title}</div>
          <div class="lesson-node-desc">${lesson.description}</div>
        </div>
        <div class="lesson-node-status">
          ${isCompleted ? '✓ Done' : isLocked ? '🔒' : lesson.xp + ' XP'}
        </div>
      `;

      if (!isLocked) {
        node.addEventListener('click', () => startLesson(lesson));
      }

      container.appendChild(node);
    });
  }

  // ── Lesson Modal ──
  let currentLesson = null;
  let currentStepIdx = 0;
  let lessonMistakes = 0;

  function startLesson(lesson) {
    currentLesson = lesson;
    currentStepIdx = 0;
    lessonMistakes = 0;
    state.lessonStartTime = Date.now();

    document.getElementById('lesson-modal').classList.remove('hidden');
    renderStep();
  }

  function closeLesson() {
    document.getElementById('lesson-modal').classList.add('hidden');
    currentLesson = null;
    renderLessonPath();
    updateTopBar();
  }

  document.getElementById('modal-close').addEventListener('click', closeLesson);

  function renderStep() {
    const step = currentLesson.steps[currentStepIdx];
    const total = currentLesson.steps.length;
    const progress = ((currentStepIdx) / total) * 100;
    document.getElementById('lesson-progress-fill').style.width = progress + '%';

    const body = document.getElementById('lesson-body');

    if (!step) {
      // Lesson complete
      completeLesson();
      return;
    }

    let html = '<div class="lesson-step">';

    switch (step.type) {
      case 'info':
        html += renderInfoStep(step);
        break;
      case 'multiple-choice':
        html += renderChoiceStep(step);
        break;
      case 'fill-blank':
        html += renderFillBlankStep(step);
        break;
      case 'write-query':
        html += renderWriteQueryStep(step);
        break;
    }

    html += '</div>';
    html += '<div class="step-actions">';

    if (step.type === 'info') {
      html += '<button class="btn-primary" id="step-continue">Continue</button>';
    } else {
      html += '<button class="btn-primary" id="step-check" disabled>Check Answer</button>';
    }

    html += '</div>';
    body.innerHTML = html;

    // Bind events
    if (step.type === 'info') {
      document.getElementById('step-continue').addEventListener('click', nextStep);
    } else if (step.type === 'multiple-choice') {
      bindChoiceEvents(step);
    } else if (step.type === 'fill-blank') {
      bindFillBlankEvents(step);
    } else if (step.type === 'write-query') {
      bindWriteQueryEvents(step);
    }
  }

  function nextStep() {
    currentStepIdx++;
    renderStep();
  }

  // ── Info Step ──
  function renderInfoStep(step) {
    let html = '<div class="step-type-label">Concept</div>';
    html += '<div class="step-instruction">' + step.instruction + '</div>';
    if (step.code) {
      html += '<div class="code-display">' + highlightSQL(step.code) + '</div>';
    }
    if (step.hint) {
      html += '<div class="step-hint">' + step.hint + '</div>';
    }
    return html;
  }

  // ── Multiple Choice Step ──
  function renderChoiceStep(step) {
    let html = '<div class="step-type-label">Multiple Choice</div>';
    html += '<div class="step-instruction">' + step.instruction + '</div>';
    html += '<div class="choices-list">';
    step.choices.forEach((choice, i) => {
      html += `<button class="choice-btn" data-idx="${i}">${choice}</button>`;
    });
    html += '</div>';
    html += '<div id="step-feedback"></div>';
    return html;
  }

  function bindChoiceEvents(step) {
    let selected = -1;
    const btns = document.querySelectorAll('.choice-btn');
    const checkBtn = document.getElementById('step-check');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = parseInt(btn.dataset.idx);
        checkBtn.disabled = false;
      });
    });

    checkBtn.addEventListener('click', () => {
      if (selected === step.correct) {
        btns[selected].classList.add('correct');
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback correct">✓ Correct!</div>';
        checkBtn.textContent = 'Continue';
        checkBtn.onclick = nextStep;
      } else {
        btns[selected].classList.add('incorrect');
        btns[step.correct].classList.add('correct');
        lessonMistakes++;
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback incorrect">✗ Not quite. The correct answer is highlighted.</div>';
        checkBtn.textContent = 'Continue';
        checkBtn.onclick = nextStep;
      }
      btns.forEach(b => { b.style.pointerEvents = 'none'; });
    });
  }

  // ── Fill Blank Step ──
  function renderFillBlankStep(step) {
    let html = '<div class="step-type-label">Fill in the Blank</div>';
    html += '<div class="step-instruction">' + step.instruction + '</div>';
    html += '<div class="code-display">' + highlightSQL(step.template) + '</div>';
    html += '<div class="sql-input-wrap">';
    html += '<input type="text" class="sql-input" id="blank-input" placeholder="Type your answer..." autocomplete="off" autocapitalize="off" spellcheck="false" />';
    html += '</div>';
    html += '<div id="step-feedback"></div>';
    return html;
  }

  function bindFillBlankEvents(step) {
    const input = document.getElementById('blank-input');
    const checkBtn = document.getElementById('step-check');

    input.addEventListener('input', () => {
      checkBtn.disabled = input.value.trim().length === 0;
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !checkBtn.disabled) checkBtn.click();
    });

    checkBtn.addEventListener('click', () => {
      const answer = input.value.trim();
      const correct = step.caseSensitive
        ? answer === step.answer
        : answer.toLowerCase() === step.answer.toLowerCase();

      if (correct) {
        input.classList.add('correct');
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback correct">✓ Correct!</div>';
        checkBtn.textContent = 'Continue';
        checkBtn.onclick = nextStep;
      } else {
        input.classList.add('incorrect');
        lessonMistakes++;
        document.getElementById('step-feedback').innerHTML =
          `<div class="feedback incorrect">✗ The answer is: <strong>${step.answer}</strong></div>`;
        checkBtn.textContent = 'Continue';
        checkBtn.onclick = nextStep;
      }
      input.disabled = true;
    });

    setTimeout(() => input.focus(), 100);
  }

  // ── Write Query Step ──
  function renderWriteQueryStep(step) {
    let html = '<div class="step-type-label">Write a Query</div>';
    html += '<div class="step-instruction">' + step.instruction + '</div>';
    if (step.hint) {
      html += '<div class="step-hint">💡 ' + step.hint + '</div>';
    }
    html += '<div class="sql-input-wrap">';
    html += '<textarea class="sql-input" id="query-input" placeholder="Write your SQL query here..." rows="3" spellcheck="false"></textarea>';
    html += '</div>';
    html += '<div id="step-feedback"></div>';
    html += '<div id="step-result"></div>';
    return html;
  }

  function bindWriteQueryEvents(step) {
    const input = document.getElementById('query-input');
    const checkBtn = document.getElementById('step-check');

    input.addEventListener('input', () => {
      checkBtn.disabled = input.value.trim().length === 0;
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey && !checkBtn.disabled) checkBtn.click();
    });

    checkBtn.addEventListener('click', () => {
      const query = input.value.trim();
      const result = SQLEngine.validate(step.validate, query);

      if (result.correct) {
        input.classList.add('correct');
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback correct">✓ ' + result.message + '</div>';
        if (result.result) {
          document.getElementById('step-result').innerHTML = renderResultTable(result.result);
        }
        checkBtn.textContent = 'Continue';
        checkBtn.onclick = nextStep;
      } else {
        input.classList.remove('incorrect');
        void input.offsetWidth; // trigger reflow
        input.classList.add('incorrect');
        lessonMistakes++;
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback incorrect">✗ ' + result.message + '</div>';
        // Don't disable — let them try again
        setTimeout(() => input.classList.remove('incorrect'), 1000);
      }
    });

    setTimeout(() => input.focus(), 100);
  }

  // ── Result Table ──
  function renderResultTable(rows) {
    if (!rows || rows.length === 0) return '';
    const cols = Object.keys(rows[0]);
    let html = '<div class="result-table-wrap"><table class="result-table"><thead><tr>';
    cols.forEach(c => { html += '<th>' + c + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
      html += '<tr>';
      cols.forEach(c => { html += '<td>' + (row[c] !== undefined ? row[c] : 'NULL') + '</td>'; });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  // ── Lesson Complete ──
  function completeLesson() {
    const lesson = currentLesson;
    const elapsed = Date.now() - (state.lessonStartTime || Date.now());
    const elapsedMin = elapsed / 60000;

    // Award XP
    let xpEarned = lesson.xp;
    if (lessonMistakes === 0) xpEarned += 10; // bonus for perfect

    state.xp += xpEarned;

    // Mark completed
    if (!state.completedLessons.includes(lesson.id)) {
      state.completedLessons.push(lesson.id);
    }

    // Perfect lesson tracking
    if (lessonMistakes === 0) {
      state.perfectLessons = (state.perfectLessons || 0) + 1;
    }

    // Speed demon check
    if (elapsedMin < 2) {
      state.speedDemon = true;
    }

    // Night owl check
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) {
      state.nightOwl = true;
    }

    // Record activity for streak
    recordActivity();

    // Save
    saveState();

    // Check for new badges
    const newBadges = checkNewBadges();

    // Render complete screen
    const body = document.getElementById('lesson-body');
    let html = '<div class="lesson-complete">';
    html += '<div class="lesson-complete-icon">🎉</div>';
    html += '<h2>Lesson Complete!</h2>';
    html += '<p>' + lesson.title + '</p>';
    html += '<div class="xp-earned">+' + xpEarned + ' XP</div>';

    if (lessonMistakes === 0) {
      html += '<p style="color:var(--success)">⭐ Perfect — no mistakes!</p>';
    }

    html += '<button class="btn-primary" id="lesson-done-btn" style="max-width:200px">Done</button>';
    html += '</div>';
    body.innerHTML = html;

    // Remove step actions
    const actions = document.querySelector('.step-actions');
    if (actions) actions.remove();

    document.getElementById('lesson-progress-fill').style.width = '100%';
    document.getElementById('lesson-done-btn').addEventListener('click', closeLesson);

    // Show badge toasts
    if (newBadges.length > 0) {
      showBadgeToasts(newBadges);
    }

    updateTopBar();
  }

  // ── Badge Checking ──
  function checkNewBadges() {
    const newlyEarned = [];
    BADGES.forEach(badge => {
      if (!state.earnedBadges.includes(badge.id) && badge.condition(state)) {
        state.earnedBadges.push(badge.id);
        newlyEarned.push(badge);
      }
    });
    if (newlyEarned.length > 0) saveState();
    return newlyEarned;
  }

  function showBadgeToasts(badges) {
    let delay = 500;
    badges.forEach(badge => {
      setTimeout(() => {
        const toast = document.getElementById('badge-toast');
        document.getElementById('badge-toast-icon').textContent = badge.icon;
        document.getElementById('badge-toast-title').textContent = badge.name;
        document.getElementById('badge-toast-desc').textContent = badge.description;
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
      }, delay);
      delay += 3500;
    });
  }

  // ── Badges View ──
  function renderBadges() {
    const grid = document.getElementById('badges-grid');
    grid.innerHTML = '';

    BADGES.forEach(badge => {
      const earned = state.earnedBadges.includes(badge.id);
      const card = document.createElement('div');
      card.className = 'badge-card' + (earned ? ' earned' : ' locked');
      card.innerHTML = `
        <span class="badge-icon">${badge.icon}</span>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-desc">${earned ? badge.description : '???'}</div>
      `;
      grid.appendChild(card);
    });
  }

  // ── Profile View ──
  function renderProfile() {
    const container = document.getElementById('profile-content');
    const level = Math.floor(state.xp / 100) + 1;
    const xpInLevel = state.xp % 100;
    const xpForNext = 100;

    container.innerHTML = `
      <div class="profile-level">
        <div class="level-header">
          <span class="level-title">Level ${level}</span>
          <span class="level-number">${xpInLevel}/${xpForNext} XP</span>
        </div>
        <div class="level-bar">
          <div class="level-bar-fill" style="width:${(xpInLevel / xpForNext) * 100}%"></div>
        </div>
        <div class="level-xp-text">${xpForNext - xpInLevel} XP to next level</div>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat-value">${state.xp}</div>
          <div class="profile-stat-label">Total XP</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${state.streak}</div>
          <div class="profile-stat-label">Day Streak</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${state.completedLessons.length}/${LESSONS.length}</div>
          <div class="profile-stat-label">Lessons Done</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${state.earnedBadges.length}/${BADGES.length}</div>
          <div class="profile-stat-label">Badges</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${state.practiceCompleted}</div>
          <div class="profile-stat-label">Practice Done</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${state.perfectLessons || 0}</div>
          <div class="profile-stat-label">Perfect Lessons</div>
        </div>
      </div>
    `;
  }

  // ── Practice Mode ──
  function renderPractice() {
    const container = document.getElementById('practice-area');

    if (state.completedLessons.length === 0) {
      container.innerHTML = `
        <div class="practice-start">
          <div class="practice-start-icon">🔒</div>
          <div class="practice-start-text">Complete at least one lesson to unlock Practice Mode.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="practice-start">
        <div class="practice-start-icon">⚡</div>
        <div class="practice-start-text">
          Random challenges from lessons you've completed.<br>
          Each correct answer earns 10 XP.
        </div>
        <button class="btn-primary" id="start-practice" style="max-width:200px;margin:0 auto">Start Practice</button>
      </div>
    `;

    document.getElementById('start-practice').addEventListener('click', startPracticeRound);
  }

  function startPracticeRound() {
    // Pick a random step from completed lessons
    const completedLessonData = LESSONS.filter(l => state.completedLessons.includes(l.id));
    const lesson = completedLessonData[Math.floor(Math.random() * completedLessonData.length)];
    const practiceSteps = lesson.steps.filter(s => s.type !== 'info');

    if (practiceSteps.length === 0) {
      renderPractice();
      return;
    }

    const step = practiceSteps[Math.floor(Math.random() * practiceSteps.length)];
    const container = document.getElementById('practice-area');

    let html = '<div class="lesson-step" style="padding-bottom:20px">';

    switch (step.type) {
      case 'multiple-choice':
        html += renderChoiceStep(step);
        break;
      case 'fill-blank':
        html += renderFillBlankStep(step);
        break;
      case 'write-query':
        html += renderWriteQueryStep(step);
        break;
    }

    html += '</div>';
    html += '<div style="display:flex;gap:10px;margin-top:16px">';
    html += '<button class="btn-primary" id="practice-check" disabled>Check Answer</button>';
    html += '<button class="btn-secondary" id="practice-skip">Skip</button>';
    html += '</div>';

    container.innerHTML = html;

    // Bind events based on type
    if (step.type === 'multiple-choice') {
      bindPracticeChoice(step);
    } else if (step.type === 'fill-blank') {
      bindPracticeFillBlank(step);
    } else if (step.type === 'write-query') {
      bindPracticeWriteQuery(step);
    }

    document.getElementById('practice-skip').addEventListener('click', startPracticeRound);
  }

  function bindPracticeChoice(step) {
    let selected = -1;
    const btns = document.querySelectorAll('.choice-btn');
    const checkBtn = document.getElementById('practice-check');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = parseInt(btn.dataset.idx);
        checkBtn.disabled = false;
      });
    });

    checkBtn.addEventListener('click', () => {
      if (selected === step.correct) {
        btns[selected].classList.add('correct');
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback correct">✓ Correct! +10 XP</div>';
        state.xp += 10;
        state.practiceCompleted++;
        recordActivity();
        saveState();
        updateTopBar();
        checkNewBadges();
      } else {
        btns[selected].classList.add('incorrect');
        btns[step.correct].classList.add('correct');
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback incorrect">✗ Not quite.</div>';
      }
      btns.forEach(b => { b.style.pointerEvents = 'none'; });
      checkBtn.textContent = 'Next Challenge';
      checkBtn.onclick = startPracticeRound;
    });
  }

  function bindPracticeFillBlank(step) {
    const input = document.getElementById('blank-input');
    const checkBtn = document.getElementById('practice-check');

    input.addEventListener('input', () => {
      checkBtn.disabled = input.value.trim().length === 0;
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !checkBtn.disabled) checkBtn.click();
    });

    checkBtn.addEventListener('click', () => {
      const answer = input.value.trim();
      const correct = step.caseSensitive
        ? answer === step.answer
        : answer.toLowerCase() === step.answer.toLowerCase();

      if (correct) {
        input.classList.add('correct');
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback correct">✓ Correct! +10 XP</div>';
        state.xp += 10;
        state.practiceCompleted++;
        recordActivity();
        saveState();
        updateTopBar();
        checkNewBadges();
      } else {
        input.classList.add('incorrect');
        document.getElementById('step-feedback').innerHTML =
          `<div class="feedback incorrect">✗ The answer is: <strong>${step.answer}</strong></div>`;
      }
      input.disabled = true;
      checkBtn.textContent = 'Next Challenge';
      checkBtn.onclick = startPracticeRound;
    });

    setTimeout(() => input.focus(), 100);
  }

  function bindPracticeWriteQuery(step) {
    const input = document.getElementById('query-input');
    const checkBtn = document.getElementById('practice-check');

    input.addEventListener('input', () => {
      checkBtn.disabled = input.value.trim().length === 0;
    });

    checkBtn.addEventListener('click', () => {
      const query = input.value.trim();
      const result = SQLEngine.validate(step.validate, query);

      if (result.correct) {
        input.classList.add('correct');
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback correct">✓ ' + result.message + ' +10 XP</div>';
        if (result.result) {
          document.getElementById('step-result').innerHTML = renderResultTable(result.result);
        }
        state.xp += 10;
        state.practiceCompleted++;
        recordActivity();
        saveState();
        updateTopBar();
        checkNewBadges();
        checkBtn.textContent = 'Next Challenge';
        checkBtn.onclick = startPracticeRound;
      } else {
        input.classList.remove('incorrect');
        void input.offsetWidth;
        input.classList.add('incorrect');
        document.getElementById('step-feedback').innerHTML =
          '<div class="feedback incorrect">✗ ' + result.message + '</div>';
        setTimeout(() => input.classList.remove('incorrect'), 1000);
      }
    });

    setTimeout(() => input.focus(), 100);
  }

  // ── SQL Syntax Highlighting ──
  function highlightSQL(code) {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'IN', 'ORDER BY', 'GROUP BY',
      'HAVING', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'AS',
      'INSERT INTO', 'UPDATE', 'SET', 'DELETE FROM', 'VALUES', 'LIMIT',
      'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'LIKE',
      'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'NOT', 'NULL', 'IS', 'DESC', 'ASC'];

    let result = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight blanks
    result = result.replace(/_____/g, '<span class="code-blank">?????</span>');

    // Highlight strings
    result = result.replace(/'([^']*)'/g, '<span class="code-string">\'$1\'</span>');

    // Highlight comments
    result = result.replace(/--(.*)/g, '<span class="code-comment">--$1</span>');

    // Highlight numbers
    result = result.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

    // Highlight keywords (case insensitive)
    keywords.sort((a, b) => b.length - a.length); // longest first
    keywords.forEach(kw => {
      const regex = new RegExp('\\b(' + kw.replace(/ /g, '\\s+') + ')\\b', 'gi');
      result = result.replace(regex, '<span class="code-keyword">$1</span>');
    });

    return result;
  }

  // ── Init ──
  loadState(function () {
    updateTopBar();
    renderLessonPath();
  });

  // Listen for real-time sync
  FireSync.listen(LS_KEY, function (data) {
    if (data) {
      state = Object.assign(state, data);
      updateTopBar();
      renderLessonPath();
    }
  });

})();
