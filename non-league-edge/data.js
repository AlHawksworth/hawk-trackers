// Non-League Edge — Static Data & Mock API Layer
// In production: replace fetchFixtures(), fetchOdds(), fetchWeather() etc.
// with real API calls to API-Football / Sportmonks / OddsAPI.

// ── League Definitions ────────────────────────────────────────────────────────
const LEAGUES = {
  NL:  { id: 'NL',  name: 'National League',       tier: 5, color: '#e63946' },
  NLN: { id: 'NLN', name: 'National League North',  tier: 6, color: '#2a9d8f' },
  NLS: { id: 'NLS', name: 'National League South',  tier: 6, color: '#e9c46a' },
};

// ── Teams ─────────────────────────────────────────────────────────────────────
const TEAMS = {
  // National League
  'Barnet':            { id: 'barnet',         league: 'NL',  shortName: 'BAR' },
  'Boreham Wood':      { id: 'boreham-wood',   league: 'NL',  shortName: 'BWD' },
  'Bromley':           { id: 'bromley',        league: 'NL',  shortName: 'BRO' },
  'Chesterfield':      { id: 'chesterfield',   league: 'NL',  shortName: 'CHE' },
  'Dag & Red':         { id: 'dag-red',        league: 'NL',  shortName: 'DAG' },
  'Dover Athletic':    { id: 'dover',          league: 'NL',  shortName: 'DOV' },
  'Eastleigh':         { id: 'eastleigh',      league: 'NL',  shortName: 'EAS' },
  'FC Halifax Town':   { id: 'fc-halifax',     league: 'NL',  shortName: 'HAL' },
  'Gateshead':         { id: 'gateshead',      league: 'NL',  shortName: 'GAT' },
  'Hartlepool Utd':    { id: 'hartlepool',     league: 'NL',  shortName: 'HAR' },
  'Kidderminster':     { id: 'kidderminster',  league: 'NL',  shortName: 'KID' },
  'Maidenhead Utd':    { id: 'maidenhead',     league: 'NL',  shortName: 'MAI' },
  'Notts County':      { id: 'notts-county',   league: 'NL',  shortName: 'NOT' },
  'Oldham Athletic':   { id: 'oldham',         league: 'NL',  shortName: 'OLD' },
  'Scunthorpe Utd':    { id: 'scunthorpe',     league: 'NL',  shortName: 'SCU' },
  'Solihull Moors':    { id: 'solihull',       league: 'NL',  shortName: 'SOL' },
  'Southend Utd':      { id: 'southend',       league: 'NL',  shortName: 'SOU' },
  'Torquay Utd':       { id: 'torquay',        league: 'NL',  shortName: 'TOR' },
  'Wealdstone':        { id: 'wealdstone',     league: 'NL',  shortName: 'WEA' },
  'York City':         { id: 'york',           league: 'NL',  shortName: 'YOR' },
  // NL North
  'AFC Fylde':         { id: 'afc-fylde',      league: 'NLN', shortName: 'FYL' },
  'Altrincham':        { id: 'altrincham',     league: 'NLN', shortName: 'ALT' },
  'Brackley Town':     { id: 'brackley',       league: 'NLN', shortName: 'BRA' },
  'Bradford (Park A)': { id: 'bradford-pa',   league: 'NLN', shortName: 'BPA' },
  'Curzon Ashton':     { id: 'curzon',         league: 'NLN', shortName: 'CUR' },
  'Darlington':        { id: 'darlington',     league: 'NLN', shortName: 'DAR' },
  'Gloucester City':   { id: 'gloucester',     league: 'NLN', shortName: 'GLO' },
  'Guiseley':          { id: 'guiseley',       league: 'NLN', shortName: 'GUI' },
  'Hereford FC':       { id: 'hereford',       league: 'NLN', shortName: 'HER' },
  'Nantwich Town':     { id: 'nantwich',       league: 'NLN', shortName: 'NAN' },
  'Southport':         { id: 'southport',      league: 'NLN', shortName: 'SPT' },
  'Spennymoor Town':   { id: 'spennymoor',     league: 'NLN', shortName: 'SPM' },
  // NL South
  'Bath City':         { id: 'bath-city',      league: 'NLS', shortName: 'BAT' },
  'Braintree Town':    { id: 'braintree',      league: 'NLS', shortName: 'BRT' },
  'Chippenham Town':   { id: 'chippenham',     league: 'NLS', shortName: 'CHI' },
  'Concord Rangers':   { id: 'concord',        league: 'NLS', shortName: 'CON' },
  'Dartford':          { id: 'dartford',       league: 'NLS', shortName: 'DRT' },
  'Havant & W':        { id: 'havant',         league: 'NLS', shortName: 'HAV' },
  'Hungerford Town':   { id: 'hungerford',     league: 'NLS', shortName: 'HUN' },
  'Oxford City':       { id: 'oxford-city',    league: 'NLS', shortName: 'OXF' },
  'Slough Town':       { id: 'slough',         league: 'NLS', shortName: 'SLO' },
  'St Albans City':    { id: 'st-albans',      league: 'NLS', shortName: 'STA' },
  'Taunton Town':      { id: 'taunton',        league: 'NLS', shortName: 'TAU' },
  'Welling Utd':       { id: 'welling',        league: 'NLS', shortName: 'WEL' },
};

// ── Venue coordinates (lat/lon for weather) ───────────────────────────────────
const VENUES = {
  'barnet':       { name: 'Underhill Stadium',   lat: 51.6492, lon: -0.1944 },
  'bromley':      { name: 'Hayes Lane',           lat: 51.3898, lon: -0.0177 },
  'chesterfield': { name: 'Technique Stadium',    lat: 53.2346, lon: -1.4398 },
  'notts-county': { name: 'Meadow Lane',          lat: 52.9437, lon: -1.1370 },
  'altrincham':   { name: 'J.Davidson Stadium',   lat: 53.3876, lon: -2.3517 },
  'bath-city':    { name: 'Twerton Park',         lat: 51.3737, lon: -2.3887 },
};

// ── Today's date helper ───────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ── Mock Data Generator ───────────────────────────────────────────────────────
// Generates realistic-looking fixture/stats data for demonstration.
// Replace this entire section with real API calls in production.

function seededRand(seed) {
  // Simple deterministic PRNG for consistent mock data
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate team stats (xG, form, etc.) seeded by team name for consistency
function generateTeamStats(teamName) {
  const seed = hashStr(teamName);
  const r = n => seededRand(seed + n);

  const xgFor = 0.8 + r(1) * 1.2;   // 0.8 – 2.0
  const xgAgainst = 0.7 + r(2) * 1.1;
  const possession = 38 + r(3) * 24; // 38–62%
  const shotConv = 0.10 + r(4) * 0.15;
  const cornersPerGame = 3.5 + r(5) * 5;
  const cardsPerGame = 1.5 + r(6) * 2.5;
  const pressIntensity = 20 + r(7) * 40; // PPDA proxy 20–60

  // Form: last 10 results
  const form10 = [];
  for (let i = 0; i < 10; i++) {
    const v = r(10 + i);
    form10.push(v > 0.55 ? 'W' : v > 0.30 ? 'D' : 'L');
  }
  const form5 = form10.slice(5);

  // Points from last 10
  const pts = form10.reduce((s, r) => s + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);

  return { xgFor, xgAgainst, possession, shotConv, cornersPerGame, cardsPerGame, pressIntensity, form5, form10, pts };
}

// League table data
function generateLeagueTable(leagueId) {
  const teams = Object.entries(TEAMS)
    .filter(([, t]) => t.league === leagueId)
    .map(([name]) => name);

  return teams.map(name => {
    const seed = hashStr(name + leagueId);
    const r = n => seededRand(seed + n);
    const played = 28 + Math.floor(r(1) * 8);
    const winRate = 0.25 + r(2) * 0.45;
    const drawRate = 0.15 + r(3) * 0.2;
    const won = Math.round(played * winRate);
    const drawn = Math.round(played * drawRate);
    const lost = played - won - drawn;
    const gf = won * 2 + drawn + Math.round(r(4) * played * 0.3);
    const ga = lost * 2 + drawn + Math.round(r(5) * played * 0.25);
    const pts = won * 3 + drawn;
    const stats = generateTeamStats(name);
    return { name, played, won, drawn, lost, gf, ga, gd: gf - ga, pts, ...stats };
  }).sort((a, b) => b.pts - a.pts || b.gd - a.gd);
}

// Generate fixtures for a date range
function generateFixtures(fromDate, toDate) {
  const fixtures = [];
  let current = new Date(fromDate);
  const end = new Date(toDate);
  let fixtureId = hashStr(fromDate) % 10000;

  while (current <= end) {
    const dow = current.getDay();
    // Fixtures mostly Saturday (6) and Tuesday (2)
    if (dow === 6 || dow === 2) {
      const dateStr = current.toISOString().split('T')[0];
      const ko = dow === 6 ? '15:00' : '19:45';

      Object.entries(LEAGUES).forEach(([leagueId]) => {
        const leagueTeams = Object.entries(TEAMS)
          .filter(([, t]) => t.league === leagueId)
          .map(([name]) => name);

        // Pick 3–5 fixtures per league per matchday
        const seed = hashStr(dateStr + leagueId);
        const shuffled = leagueTeams
          .map((t, i) => [t, seededRand(seed + i)])
          .sort((a, b) => a[1] - b[1])
          .map(p => p[0]);

        const count = 3 + Math.floor(seededRand(seed + 99) * 3);
        for (let i = 0; i < Math.min(count * 2, shuffled.length - 1); i += 2) {
          const home = shuffled[i];
          const away = shuffled[i + 1];
          if (!home || !away) continue;

          fixtureId++;
          const isToday = dateStr === todayStr();
          const isPast = new Date(dateStr) < new Date(todayStr());
          const kickoffParts = ko.split(':');
          const koDate = new Date(dateStr);
          koDate.setHours(+kickoffParts[0], +kickoffParts[1]);
          const isLive = isToday && Math.abs(Date.now() - koDate) < 105 * 60 * 1000 && Date.now() > koDate;

          let status = 'upcoming';
          let homeGoals = null, awayGoals = null, minute = null;
          if (isPast) {
            status = 'ft';
            const rs = seededRand(fixtureId);
            homeGoals = Math.floor(rs * 4);
            awayGoals = Math.floor(seededRand(fixtureId + 1) * 4);
          } else if (isLive) {
            status = 'live';
            minute = Math.floor((Date.now() - koDate) / 60000);
            homeGoals = Math.floor(seededRand(fixtureId) * 3);
            awayGoals = Math.floor(seededRand(fixtureId + 1) * 3);
          }

          fixtures.push({
            id: String(fixtureId),
            league: leagueId,
            date: dateStr,
            kickoff: ko,
            home,
            away,
            status,
            homeGoals,
            awayGoals,
            minute,
          });
        }
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return fixtures;
}

// Generate odds for a fixture
function generateOdds(fixture) {
  const seed = hashStr(fixture.id + 'odds');
  const r = n => seededRand(seed + n);

  const homeStrength = generateTeamStats(fixture.home).xgFor;
  const awayStrength = generateTeamStats(fixture.away).xgFor;
  const total = homeStrength + awayStrength + 0.5;

  const trueHome = (homeStrength + 0.2) / total;
  const trueAway = awayStrength / total;
  const trueDraw = 1 - trueHome - trueAway;

  // Add bookmaker margin ~5–8%
  const margin = 1.06 + r(1) * 0.03;
  const bookHome = 1 / (trueHome * margin) * (0.95 + r(2) * 0.1);
  const bookDraw = 1 / (trueDraw * margin) * (0.95 + r(3) * 0.1);
  const bookAway = 1 / (trueAway * margin) * (0.95 + r(4) * 0.1);

  const expGoals = homeStrength + awayStrength;
  const trueOver25 = 1 - Math.exp(-expGoals) * (1 + expGoals + expGoals * expGoals / 2);
  const trueUnder25 = 1 - trueOver25;
  const trueBttsY = (1 - Math.exp(-homeStrength)) * (1 - Math.exp(-awayStrength));

  return {
    '1x2': {
      home: { trueProb: trueHome, bestOdds: +bookHome.toFixed(2), book: 'Bet365' },
      draw: { trueProb: trueDraw, bestOdds: +bookDraw.toFixed(2), book: 'Betfair' },
      away: { trueProb: trueAway, bestOdds: +bookAway.toFixed(2), book: 'William Hill' },
    },
    'ou25': {
      over: { trueProb: trueOver25, bestOdds: +(1 / (trueOver25 * (1.07 + r(5) * 0.03))).toFixed(2), book: 'Bet365' },
      under: { trueProb: trueUnder25, bestOdds: +(1 / (trueUnder25 * (1.07 + r(6) * 0.03))).toFixed(2), book: 'Betfair' },
    },
    'ou15': {
      over: { trueProb: Math.min(0.92, trueOver25 + 0.22), bestOdds: +(1.15 + r(7) * 0.3).toFixed(2), book: 'Bet365' },
      under: { trueProb: Math.max(0.08, trueUnder25 - 0.22), bestOdds: +(3.5 + r(8) * 1.5).toFixed(2), book: 'William Hill' },
    },
    'ou35': {
      over: { trueProb: Math.max(0.05, trueOver25 - 0.28), bestOdds: +(2.5 + r(9) * 2).toFixed(2), book: 'Bet365' },
      under: { trueProb: Math.min(0.95, trueUnder25 + 0.28), bestOdds: +(1.25 + r(10) * 0.4).toFixed(2), book: 'Betfair' },
    },
    'btts': {
      yes: { trueProb: trueBttsY, bestOdds: +(1 / (trueBttsY * (1.08 + r(11) * 0.03))).toFixed(2), book: 'Betfair' },
      no: { trueProb: 1 - trueBttsY, bestOdds: +(1 / ((1 - trueBttsY) * (1.08 + r(12) * 0.03))).toFixed(2), book: 'Bet365' },
    },
    'corners': {
      over95: { trueProb: 0.42 + r(13) * 0.2, bestOdds: +(1.7 + r(14) * 0.6).toFixed(2), book: 'William Hill' },
      under95: { trueProb: 0.38 + r(15) * 0.2, bestOdds: +(1.8 + r(16) * 0.6).toFixed(2), book: 'Bet365' },
    },
    'ah': {
      hcp_minus05: { trueProb: trueHome - 0.07, bestOdds: +(1.85 + r(17) * 0.3).toFixed(2), book: 'Bet365' },
      hcp_minus1:  { trueProb: trueHome - 0.14, bestOdds: +(2.1 + r(18) * 0.5).toFixed(2), book: 'Betfair' },
    },
  };
}

// Generate weather for a fixture
function generateWeather(fixture) {
  const seed = hashStr(fixture.id + 'weather');
  const r = n => seededRand(seed + n);
  return {
    tempC: Math.round(6 + r(1) * 16),
    precipPct: Math.round(r(2) * 100),
    windMph: Math.round(5 + r(3) * 45),
    description: ['Clear', 'Partly cloudy', 'Overcast', 'Light rain', 'Heavy rain'][Math.floor(r(4) * 5)],
  };
}

// Generate H2H for two teams
function generateH2H(home, away) {
  const seed = hashStr(home + away);
  const r = n => seededRand(seed + n);
  const count = 3 + Math.floor(r(0) * 8); // 3–10 meetings
  const results = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - 3 * (i + 1));
    const hg = Math.floor(r(i * 3 + 1) * 4);
    const ag = Math.floor(r(i * 3 + 2) * 4);
    results.push({
      date: d.toISOString().split('T')[0],
      home: i % 2 === 0 ? home : away,
      away: i % 2 === 0 ? away : home,
      homeGoals: hg,
      awayGoals: ag,
    });
  }
  return results;
}

// Generate player availability
function generateAvailability(teamName) {
  const seed = hashStr(teamName + 'avail');
  const r = n => seededRand(seed + n);
  const injuryCount = Math.floor(r(0) * 3);
  const suspCount = Math.floor(r(1) * 2);
  const firstNames = ['Jake', 'Tom', 'Ryan', 'Lewis', 'Sam', 'Dan', 'Josh', 'Adam', 'Matt', 'Harry'];
  const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts'];
  const injuries = [];
  for (let i = 0; i < injuryCount; i++) {
    injuries.push({
      name: firstNames[Math.floor(r(10 + i) * firstNames.length)] + ' ' + lastNames[Math.floor(r(20 + i) * lastNames.length)],
      status: 'Injured',
      returnDate: addDays(todayStr(), 7 + Math.floor(r(30 + i) * 21)),
    });
  }
  for (let i = 0; i < suspCount; i++) {
    injuries.push({
      name: firstNames[Math.floor(r(40 + i) * firstNames.length)] + ' ' + lastNames[Math.floor(r(50 + i) * lastNames.length)],
      status: 'Suspended',
      returnDate: addDays(todayStr(), 3 + Math.floor(r(60 + i) * 14)),
    });
  }
  return injuries;
}

// ── Main data store ───────────────────────────────────────────────────────────
const DataStore = {
  fixtures: [],
  leagueTables: {},
  lastFetch: null,

  init() {
    const from = addDays(todayStr(), -90);
    const to = addDays(todayStr(), 14);
    this.fixtures = generateFixtures(from, to);
    Object.keys(LEAGUES).forEach(l => {
      this.leagueTables[l] = generateLeagueTable(l);
    });
    this.lastFetch = new Date();
  },

  getFixturesForDate(date) {
    return this.fixtures.filter(f => f.date === date);
  },

  getFixturesInRange(from, to) {
    return this.fixtures.filter(f => f.date >= from && f.date <= to);
  },

  getFixture(id) {
    return this.fixtures.find(f => f.id === id);
  },

  getOdds(fixtureId) {
    const fix = this.getFixture(fixtureId);
    return fix ? generateOdds(fix) : null;
  },

  getWeather(fixtureId) {
    const fix = this.getFixture(fixtureId);
    if (!fix) return null;
    const daysUntil = Math.ceil((new Date(fix.date) - new Date(todayStr())) / 86400000);
    if (daysUntil > 3) return null; // only show within 72h
    return generateWeather(fix);
  },

  getTeamStats(teamName) {
    return generateTeamStats(teamName);
  },

  getH2H(home, away) {
    return generateH2H(home, away);
  },

  getAvailability(teamName) {
    return generateAvailability(teamName);
  },

  getLeagueTable(leagueId) {
    return this.leagueTables[leagueId] || [];
  },

  searchTeams(q) {
    return Object.keys(TEAMS).filter(t => t.toLowerCase().includes(q.toLowerCase()));
  },

  searchFixtures(q) {
    const ql = q.toLowerCase();
    return this.fixtures.filter(f =>
      f.home.toLowerCase().includes(ql) || f.away.toLowerCase().includes(ql)
    ).slice(0, 10);
  },

  // Simulate a data refresh (in production this would re-fetch APIs)
  refresh() {
    this.lastFetch = new Date();
    // Re-generate live fixture statuses (minute updates etc.)
    return Promise.resolve();
  },
};
