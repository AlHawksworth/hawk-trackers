// ═══════════════════════════════════════════
// Joind — Badge System
// ═══════════════════════════════════════════

const BADGES = [
  // ── Lesson Completion Badges ──
  {
    id: 'first-query',
    name: 'First Query',
    icon: '🌱',
    description: 'Complete your first lesson',
    condition: (state) => state.completedLessons.length >= 1
  },
  {
    id: 'select-master',
    name: 'SELECT Master',
    icon: '📋',
    description: 'Complete the SELECT Basics lesson',
    condition: (state) => state.completedLessons.includes('select-basics')
  },
  {
    id: 'filter-pro',
    name: 'Filter Pro',
    icon: '🔍',
    description: 'Complete the WHERE Clause lesson',
    condition: (state) => state.completedLessons.includes('where-clause')
  },
  {
    id: 'data-sorter',
    name: 'Data Sorter',
    icon: '📊',
    description: 'Complete the ORDER BY lesson',
    condition: (state) => state.completedLessons.includes('order-by')
  },
  {
    id: 'logic-gate',
    name: 'Logic Gate',
    icon: '🔗',
    description: 'Complete the AND, OR & IN lesson',
    condition: (state) => state.completedLessons.includes('logical-operators')
  },
  {
    id: 'number-cruncher',
    name: 'Number Cruncher',
    icon: '🧮',
    description: 'Complete the Aggregates lesson',
    condition: (state) => state.completedLessons.includes('aggregates')
  },
  {
    id: 'group-thinker',
    name: 'Group Thinker',
    icon: '📦',
    description: 'Complete the GROUP BY lesson',
    condition: (state) => state.completedLessons.includes('group-by')
  },
  {
    id: 'table-joiner',
    name: 'Table Joiner',
    icon: '🔀',
    description: 'Complete the JOINs lesson',
    condition: (state) => state.completedLessons.includes('joins')
  },
  {
    id: 'inception',
    name: 'Inception',
    icon: '🪆',
    description: 'Complete the Subqueries lesson',
    condition: (state) => state.completedLessons.includes('subqueries')
  },
  {
    id: 'pattern-finder',
    name: 'Pattern Finder',
    icon: '🎯',
    description: 'Complete the LIKE & Wildcards lesson',
    condition: (state) => state.completedLessons.includes('like-wildcards')
  },
  {
    id: 'identity-expert',
    name: 'Identity Expert',
    icon: '🏷️',
    description: 'Complete the DISTINCT & Aliases lesson',
    condition: (state) => state.completedLessons.includes('distinct-aliases')
  },
  {
    id: 'data-surgeon',
    name: 'Data Surgeon',
    icon: '✏️',
    description: 'Complete the INSERT, UPDATE, DELETE lesson',
    condition: (state) => state.completedLessons.includes('data-modification')
  },

  // ── Milestone Badges ──
  {
    id: 'halfway-hero',
    name: 'Halfway Hero',
    icon: '⭐',
    description: 'Complete 6 lessons',
    condition: (state) => state.completedLessons.length >= 6
  },
  {
    id: 'sql-graduate',
    name: 'SQL Graduate',
    icon: '🎓',
    description: 'Complete all 12 lessons',
    condition: (state) => state.completedLessons.length >= 12
  },

  // ── XP Badges ──
  {
    id: 'xp-100',
    name: 'Century',
    icon: '💯',
    description: 'Earn 100 XP',
    condition: (state) => state.xp >= 100
  },
  {
    id: 'xp-250',
    name: 'Rising Star',
    icon: '🌟',
    description: 'Earn 250 XP',
    condition: (state) => state.xp >= 250
  },
  {
    id: 'xp-500',
    name: 'SQL Wizard',
    icon: '🧙',
    description: 'Earn 500 XP',
    condition: (state) => state.xp >= 500
  },

  // ── Streak Badges ──
  {
    id: 'streak-3',
    name: 'On Fire',
    icon: '🔥',
    description: 'Maintain a 3-day streak',
    condition: (state) => state.streak >= 3
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    icon: '⚔️',
    description: 'Maintain a 7-day streak',
    condition: (state) => state.streak >= 7
  },
  {
    id: 'streak-14',
    name: 'Fortnight Force',
    icon: '🛡️',
    description: 'Maintain a 14-day streak',
    condition: (state) => state.streak >= 14
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    icon: '👑',
    description: 'Maintain a 30-day streak',
    condition: (state) => state.streak >= 30
  },

  // ── Practice Badges ──
  {
    id: 'practice-5',
    name: 'Practitioner',
    icon: '⚡',
    description: 'Complete 5 practice challenges',
    condition: (state) => state.practiceCompleted >= 5
  },
  {
    id: 'practice-20',
    name: 'Drill Sergeant',
    icon: '🎖️',
    description: 'Complete 20 practice challenges',
    condition: (state) => state.practiceCompleted >= 20
  },
  {
    id: 'practice-50',
    name: 'Relentless',
    icon: '💎',
    description: 'Complete 50 practice challenges',
    condition: (state) => state.practiceCompleted >= 50
  },

  // ── Perfect Score Badges ──
  {
    id: 'no-mistakes',
    name: 'Flawless',
    icon: '✨',
    description: 'Complete a lesson with no wrong answers',
    condition: (state) => state.perfectLessons >= 1
  },
  {
    id: 'perfect-3',
    name: 'Perfectionist',
    icon: '🏅',
    description: 'Complete 3 lessons with no wrong answers',
    condition: (state) => state.perfectLessons >= 3
  },

  // ── Special Badges ──
  {
    id: 'night-owl',
    name: 'Night Owl',
    icon: '🦉',
    description: 'Complete a lesson between midnight and 5am',
    condition: (state) => state.nightOwl === true
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Complete a lesson in under 2 minutes',
    condition: (state) => state.speedDemon === true
  }
];
