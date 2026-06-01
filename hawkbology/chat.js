// ─── Hawkbology Chatbot Engine ─────────────────────────────────────────────────
// Enhanced natural language query engine for match history.

let chatInitialised = false;

function initChat() {
  if (chatInitialised) return;
  chatInitialised = true;
  addBotMessage("Hey! Ask me anything about your match history. Try the suggestions above or type your own question — I can handle team lookups, stats, streaks, comparisons, and more.");
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function addUserMessage(text) {
  const el = document.getElementById("chat-messages");
  el.innerHTML += `<div class="chat-msg user">${escHtml(text)}</div>`;
  el.scrollTop = el.scrollHeight;
}

function addBotMessage(html) {
  const el = document.getElementById("chat-messages");
  el.innerHTML += `<div class="chat-msg bot">${html}</div>`;
  el.scrollTop = el.scrollHeight;
}

function escHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function fmtMatch(m) {
  return `<div class="chat-match-card">
    <div class="cm-teams">${escHtml(m.home)} ${m.homeScore ?? "?"}–${m.awayScore ?? "?"} ${escHtml(m.away)}</div>
    <div class="cm-meta">📅 ${formatDate(m.date)} · 🏟 ${escHtml(m.stadium)}${m.competition ? " · " + escHtml(m.competition) : ""}</div>
  </div>`;
}

function fmtMatchList(ms, limit) {
  const show = limit ? ms.slice(0, limit) : ms;
  let html = '<div class="chat-match-list">' + show.map(fmtMatch).join("") + '</div>';
  if (limit && ms.length > limit) {
    html += `<div style="font-size:0.75rem;color:var(--muted);margin-top:4px">…and ${ms.length - limit} more</div>`;
  }
  return html;
}

// ─── Known team aliases for better matching ───────────────────────────────────
const TEAM_ALIASES = {
  "newcastle": "Newcastle United", "nufc": "Newcastle United", "toon": "Newcastle United",
  "west ham": "West Ham United", "hammers": "West Ham United", "whu": "West Ham United",
  "arsenal": "Arsenal", "gunners": "Arsenal",
  "chelsea": "Chelsea", "blues": "Chelsea",
  "huddersfield": "Huddersfield Town", "htafc": "Huddersfield Town", "terriers": "Huddersfield Town",
  "chelmsford": "Chelmsford City", "clarets": "Chelmsford City",
  "haringey": "Haringey Borough", "boro": "Haringey Borough",
  "hanwell": "Hanwell Town",
  "leyton orient": "Leyton Orient", "orient": "Leyton Orient",
  "brentford": "Brentford",
  "fulham": "Fulham",
  "tottenham": "Tottenham", "spurs": "Tottenham",
  "bournemouth": "Bournemouth", "afcb": "AFC Bournemouth",
  "clapton": "Clapton", "ccfc": "Clapton CFC",
  "wimbledon": "AFC Wimbledon",
  "woodford": "Woodford Town",
  "buckhurst hill": "Buckhurst Hill",
  "wembley": "Wembley Stadium",
  "england": "England",
};

function resolveTeam(term) {
  const t = term.toLowerCase().trim();
  return TEAM_ALIASES[t] || term;
}

function matchesTeam(m, term) {
  const t = term.toLowerCase();
  return m.home.toLowerCase().includes(t) || m.away.toLowerCase().includes(t);
}

function matchesGround(m, term) {
  return m.stadium.toLowerCase().includes(term.toLowerCase());
}

function matchesComp(m, term) {
  return (m.competition || "").toLowerCase().includes(term.toLowerCase());
}

// ─── Query engine ─────────────────────────────────────────────────────────────
function answerQuestion(q) {
  const low = q.toLowerCase().trim().replace(/[?!.]+$/g, "");
  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));
  const sortedAsc = [...matches].sort((a, b) => a.date.localeCompare(b.date));

  // ── Greetings ──
  if (/^(hi|hello|hey|yo|sup|hiya|alright)\b/.test(low)) {
    return `Hey! 👋 I know all about your ${matches.length} matches across ${Object.keys(getUniqueGrounds()).length} grounds. What would you like to know?`;
  }

  // ── Help / what can you do ──
  if (low.includes("help") || low.includes("what can you") || low.includes("what do you")) {
    return `I can answer loads of questions about your match history! Try things like:<br>
      • <strong>Teams:</strong> "How many Newcastle games?" / "Last time I saw Arsenal"<br>
      • <strong>Grounds:</strong> "How many times at Wembley?" / "Have I been to Anfield?"<br>
      • <strong>Scores:</strong> "Last 0-0?" / "Any 5-0 games?" / "Biggest win?"<br>
      • <strong>Stats:</strong> "Total goals seen" / "Most visited ground" / "How many draws?"<br>
      • <strong>Seasons:</strong> "How was 2024/25?" / "Games in 2023"<br>
      • <strong>Streaks:</strong> "Longest streak without a draw"<br>
      • <strong>Comparisons:</strong> "More games at Wembley or St James Park?"<br>
      • <strong>Records:</strong> "Highest scoring game" / "First ever game"<br>
      • <strong>Countries:</strong> "Which countries have I been to?"`;
  }

  // ── Score-specific queries ──
  const scoreMatch = low.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (scoreMatch) {
    const sh = parseInt(scoreMatch[1]), sa = parseInt(scoreMatch[2]);
    const scoreGames = sorted.filter(m => m.homeScore === sh && m.awayScore === sa);
    if (low.includes("last") || low.includes("most recent") || low.includes("when was")) {
      if (scoreGames.length === 0) return `I couldn't find any ${sh}–${sa} games in your history.`;
      return `Your most recent ${sh}–${sa} was:` + fmtMatch(scoreGames[0]) +
        (scoreGames.length > 1 ? `<div style="margin-top:6px;font-size:0.82rem">You've seen ${scoreGames.length} games finish ${sh}–${sa} in total.</div>` : "");
    }
    if (low.includes("first")) {
      if (scoreGames.length === 0) return `No ${sh}–${sa} games found.`;
      return `Your first ${sh}–${sa} was:` + fmtMatch(scoreGames[scoreGames.length - 1]);
    }
    if (scoreGames.length === 0) return `No ${sh}–${sa} games found in your history.`;
    return `Found ${scoreGames.length} game${scoreGames.length !== 1 ? "s" : ""} finishing ${sh}–${sa}:` + fmtMatchList(scoreGames, 5);
  }

  // ── Season review queries: "how was 2024/25", "2024-25 season" ──
  const seasonMatch = low.match(/(\d{4})\s*[\/\-]\s*(\d{2,4})/);
  if (seasonMatch || (low.includes("season") && low.match(/\b(20\d{2})\b/))) {
    let seasonStart;
    if (seasonMatch) {
      seasonStart = parseInt(seasonMatch[1]);
    } else {
      const ym = low.match(/\b(20\d{2})\b/);
      seasonStart = parseInt(ym[1]);
      // If they say "2025 season" they probably mean 2024/25
      if (low.includes("season") && !low.includes("next")) seasonStart = seasonStart - 1;
    }
    const seasonMs = getMatchesInSeason(seasonStart);
    if (seasonMs.length === 0) return `No matches found for the ${seasonStart}/${(seasonStart+1).toString().slice(2)} season.`;
    let sw = 0, sd = 0, sl = 0, sg = 0;
    seasonMs.forEach(m => {
      const r = getResult(m);
      if (r === "H") sw++; else if (r === "D") sd++; else if (r === "A") sl++;
      sg += (m.homeScore || 0) + (m.awayScore || 0);
    });
    const grounds = new Set(seasonMs.map(m => m.stadium)).size;
    return `<strong>${seasonStart}/${(seasonStart+1).toString().slice(2)} Season:</strong><br>
      📊 ${seasonMs.length} matches · ${grounds} grounds · ${sg} goals (${(sg/seasonMs.length).toFixed(1)}/game)<br>
      ✅ ${sw} home wins · 🤝 ${sd} draws · ❌ ${sl} away wins<br>
      📅 First: ${formatDate(seasonMs.sort((a,b)=>a.date.localeCompare(b.date))[0].date)} · Last: ${formatDate(seasonMs.sort((a,b)=>b.date.localeCompare(a.date))[0].date)}`;
  }

  // ── "first ever game" / "first game" ──
  if ((low.includes("first") && (low.includes("game") || low.includes("match"))) && !low.includes("first time")) {
    const ym = low.match(/(in|of)\s*(\d{4})/);
    if (ym) {
      const year = ym[2];
      const inYear = sortedAsc.filter(m => m.date.startsWith(year));
      if (inYear.length === 0) return `No games found in ${year}.`;
      return `Your first game in ${year} was:` + fmtMatch(inYear[0]);
    }
    if (sortedAsc.length === 0) return "No matches recorded yet.";
    return `Your first ever recorded game was:` + fmtMatch(sortedAsc[0]);
  }

  // ── "last game" / "most recent" ──
  if ((low.includes("last") || low.includes("most recent") || low.includes("latest")) && (low.includes("game") || low.includes("match"))) {
    const atMatch = low.match(/(?:at|in)\s+(.+)/);
    if (atMatch) {
      const place = atMatch[1].trim();
      const resolved = resolveTeam(place);
      const atGround = sorted.filter(m => matchesGround(m, resolved) || matchesGround(m, place));
      if (atGround.length > 0) return `Your last game at "${place}":` + fmtMatch(atGround[0]);
      const atTeam = sorted.filter(m => matchesTeam(m, resolved) || matchesTeam(m, place));
      if (atTeam.length > 0) return `Your last game involving "${place}":` + fmtMatch(atTeam[0]);
    }
    if (sorted.length === 0) return "No matches recorded yet.";
    return `Your most recent game was:` + fmtMatch(sorted[0]);
  }

  // ── "last time I saw [team]" / "when did I last see [team]" ──
  if ((low.includes("last time") || low.includes("when did i last") || low.includes("last saw") || low.includes("last see")) && !low.includes("game")) {
    const term = extractSearchTerm(low, ["last time", "when did i last", "last saw", "last see", "i", "saw", "see", "watch", "watched"]);
    if (term) {
      const resolved = resolveTeam(term);
      const byTeam = sorted.filter(m => matchesTeam(m, resolved) || matchesTeam(m, term));
      if (byTeam.length > 0) return `Last time you saw "${term}":` + fmtMatch(byTeam[0]) + `<div style="font-size:0.82rem;margin-top:4px">You've seen them ${byTeam.length} time${byTeam.length !== 1 ? "s" : ""} in total.</div>`;
      const byGround = sorted.filter(m => matchesGround(m, resolved) || matchesGround(m, term));
      if (byGround.length > 0) return `Last time at "${term}":` + fmtMatch(byGround[0]);
      return `I couldn't find any matches related to "${term}".`;
    }
  }

  // ── "first time at [ground]" / "first time I saw [team]" ──
  if (low.includes("first time")) {
    const term = extractSearchTerm(low, ["first time", "i", "saw", "see", "watched", "went", "been", "at", "to", "the"]);
    if (term) {
      const resolved = resolveTeam(term);
      const byTeam = sortedAsc.filter(m => matchesTeam(m, resolved) || matchesTeam(m, term));
      if (byTeam.length > 0) return `First time you saw "${term}":` + fmtMatch(byTeam[0]);
      const byGround = sortedAsc.filter(m => matchesGround(m, resolved) || matchesGround(m, term));
      if (byGround.length > 0) return `First time at "${term}":` + fmtMatch(byGround[0]);
      return `I couldn't find any matches related to "${term}".`;
    }
  }

  // ── Biggest win / loss / highest scoring ──
  if (low.includes("biggest win") || low.includes("largest win") || low.includes("best win")) {
    let best = null, bestDiff = -Infinity;
    matches.forEach(m => {
      if (m.homeScore != null && m.awayScore != null) {
        const diff = m.homeScore - m.awayScore;
        if (diff > bestDiff) { bestDiff = diff; best = m; }
      }
    });
    if (!best) return "Not enough data to determine the biggest win.";
    return `The biggest home win you've seen (${bestDiff} goal margin):` + fmtMatch(best);
  }
  if (low.includes("biggest loss") || low.includes("biggest defeat") || low.includes("worst result") || low.includes("worst game")) {
    let worst = null, worstDiff = Infinity;
    matches.forEach(m => {
      if (m.homeScore != null && m.awayScore != null) {
        const diff = m.homeScore - m.awayScore;
        if (diff < worstDiff) { worstDiff = diff; worst = m; }
      }
    });
    if (!worst) return "Not enough data.";
    return `The biggest away win you've seen (${Math.abs(worstDiff)} goal margin):` + fmtMatch(worst);
  }
  if (low.includes("highest scoring") || low.includes("most goals in a game") || low.includes("most goals in one") || low.includes("goal fest") || low.includes("goalfest")) {
    let best = null, bestGoals = -1;
    matches.forEach(m => {
      const total = (m.homeScore || 0) + (m.awayScore || 0);
      if (total > bestGoals) { bestGoals = total; best = m; }
    });
    if (!best) return "No matches with scores recorded.";
    return `The highest-scoring game you've seen (${bestGoals} goals):` + fmtMatch(best);
  }

  // ── Streaks ──
  if (low.includes("streak") || low.includes("in a row") || low.includes("consecutive")) {
    if (low.includes("without") && (low.includes("draw") || low.includes("0-0"))) {
      let maxStreak = 0, current = 0;
      sorted.forEach(m => {
        const isDraw = m.homeScore != null && m.homeScore === m.awayScore;
        if (!isDraw) { current++; maxStreak = Math.max(maxStreak, current); }
        else { current = 0; }
      });
      return `<div class="chat-stat">${maxStreak}</div>Your longest streak without a draw was ${maxStreak} games.`;
    }
    if (low.includes("win") || low.includes("home win")) {
      let maxStreak = 0, current = 0;
      sorted.forEach(m => {
        if (getResult(m) === "H") { current++; maxStreak = Math.max(maxStreak, current); }
        else { current = 0; }
      });
      return `<div class="chat-stat">${maxStreak}</div>Your longest streak of consecutive home wins seen was ${maxStreak} games.`;
    }
    if (low.includes("draw")) {
      let maxStreak = 0, current = 0;
      sorted.forEach(m => {
        if (getResult(m) === "D") { current++; maxStreak = Math.max(maxStreak, current); }
        else { current = 0; }
      });
      return `<div class="chat-stat">${maxStreak}</div>Your longest streak of consecutive draws was ${maxStreak} games.`;
    }
    // Generic: games in a row
    return `Try asking about specific streaks like "longest streak without a draw" or "most wins in a row".`;
  }

  // ── Comparisons: "more games at X or Y" ──
  if (low.includes(" or ") && (low.includes("more") || low.includes("which"))) {
    const parts = low.split(" or ");
    if (parts.length === 2) {
      const termA = extractFallbackTerm(parts[0]);
      const termB = extractFallbackTerm(parts[1]);
      if (termA && termB) {
        const countA = matches.filter(m => matchesTeam(m, termA) || matchesGround(m, termA)).length;
        const countB = matches.filter(m => matchesTeam(m, termB) || matchesGround(m, termB)).length;
        const winner = countA >= countB ? termA : termB;
        const winCount = Math.max(countA, countB);
        const loseCount = Math.min(countA, countB);
        return `<strong>${winner}</strong> wins! ${termA}: ${countA} games vs ${termB}: ${countB} games.`;
      }
    }
  }

  // ── "how many games" queries ──
  if (low.includes("how many") || low.includes("count") || low.includes("number of") || low.includes("total")) {
    // Year
    const ym = low.match(/(?:in|during)\s*(\d{4})/);
    if (ym) {
      const year = ym[1];
      const count = matches.filter(m => m.date.startsWith(year)).length;
      return `<div class="chat-stat">${count}</div>You went to ${count} game${count !== 1 ? "s" : ""} in ${year}.`;
    }
    // Goals
    if (low.includes("goal")) {
      let total = 0;
      matches.forEach(m => { total += (m.homeScore || 0) + (m.awayScore || 0); });
      const avg = matches.length ? (total / matches.length).toFixed(1) : 0;
      return `<div class="chat-stat">${total}</div>You've seen ${total} goals across ${matches.length} games (${avg} per game).`;
    }
    // Grounds
    if (low.includes("ground") || low.includes("stadium") || low.includes("venue")) {
      const count = Object.keys(getUniqueGrounds()).length;
      return `<div class="chat-stat">${count}</div>You've been to ${count} different grounds.`;
    }
    // Draws / 0-0
    if (low.includes("draw") || low.includes("0-0") || low.includes("nil nil")) {
      if (low.includes("0-0") || low.includes("nil nil")) {
        const nilNil = matches.filter(m => m.homeScore === 0 && m.awayScore === 0);
        return `<div class="chat-stat">${nilNil.length}</div>You've seen ${nilNil.length} goalless draw${nilNil.length !== 1 ? "s" : ""}.`;
      }
      const draws = matches.filter(m => m.homeScore != null && m.homeScore === m.awayScore);
      return `<div class="chat-stat">${draws.length}</div>You've seen ${draws.length} draw${draws.length !== 1 ? "s" : ""}.`;
    }
    // Clean sheets
    if (low.includes("clean sheet") || low.includes("nil")) {
      const cs = matches.filter(m => m.homeScore === 0 || m.awayScore === 0);
      return `<div class="chat-stat">${cs.length}</div>You've seen ${cs.length} games with at least one clean sheet.`;
    }

    // Generic team/ground search
    const teamSearch = extractSearchTerm(low, ["how many", "games", "matches", "times", "have i", "been to", "seen", "watched", "did i", "go to", "went to", "at", "of", "count", "number", "total"]);
    if (teamSearch) {
      const resolved = resolveTeam(teamSearch);
      const term = resolved.toLowerCase();
      const byTeam = matches.filter(m => matchesTeam(m, term));
      const byGround = matches.filter(m => matchesGround(m, term));
      const byComp = matches.filter(m => matchesComp(m, term));
      if (byTeam.length > 0) {
        return `<div class="chat-stat">${byTeam.length}</div>You've been to ${byTeam.length} game${byTeam.length !== 1 ? "s" : ""} involving "${teamSearch}".` + fmtMatchList(byTeam.sort((a,b) => b.date.localeCompare(a.date)), 3);
      }
      if (byGround.length > 0) {
        return `<div class="chat-stat">${byGround.length}</div>You've been to "${teamSearch}" ${byGround.length} time${byGround.length !== 1 ? "s" : ""}.` + fmtMatchList(byGround.sort((a,b) => b.date.localeCompare(a.date)), 3);
      }
      if (byComp.length > 0) {
        return `<div class="chat-stat">${byComp.length}</div>You've been to ${byComp.length} "${teamSearch}" game${byComp.length !== 1 ? "s" : ""}.` + fmtMatchList(byComp.sort((a,b) => b.date.localeCompare(a.date)), 3);
      }
      return `I couldn't find any matches related to "${teamSearch}".`;
    }
    return `<div class="chat-stat">${matches.length}</div>You've been to ${matches.length} games in total.`;
  }

  // ── "which ground" / "most visited" ──
  if (low.includes("most visited") || low.includes("which ground") || low.includes("favourite ground") || low.includes("favorite ground") || low.includes("top ground")) {
    const grounds = getUniqueGrounds();
    const topEntries = Object.entries(grounds).sort((a, b) => b[1].length - a[1].length).slice(0, 5);
    if (!topEntries.length) return "No grounds data yet.";
    let html = `Your top grounds:<br>`;
    topEntries.forEach(([name, ms], i) => {
      html += `${i + 1}. <strong>${escHtml(name)}</strong> — ${ms.length} visit${ms.length !== 1 ? "s" : ""}<br>`;
    });
    return html;
  }

  // ── "most watched team" / "top teams" ──
  if (low.includes("most watched") || low.includes("which team") || low.includes("favourite team") || low.includes("favorite team") || low.includes("top team")) {
    const teams = getUniqueTeams();
    const topEntries = Object.entries(teams).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!topEntries.length) return "No data yet.";
    let html = `Your most watched teams:<br>`;
    topEntries.forEach(([name, count], i) => {
      html += `${i + 1}. <strong>${escHtml(name)}</strong> — ${count} game${count !== 1 ? "s" : ""}<br>`;
    });
    return html;
  }

  // ── "have I been to [ground]" / "have I seen [team]" ──
  if (low.includes("have i been") || low.includes("have i seen") || low.includes("have i watched") || low.includes("did i go") || low.includes("have i ever")) {
    const term = extractSearchTerm(low, ["have i", "been to", "seen", "watched", "did i", "go to", "ever", "the"]);
    if (term) {
      const resolved = resolveTeam(term);
      const t = resolved.toLowerCase();
      const byGround = sorted.filter(m => matchesGround(m, t) || matchesGround(m, term));
      const byTeam = sorted.filter(m => matchesTeam(m, t) || matchesTeam(m, term));
      if (byGround.length > 0) {
        return `Yes! You've been to "${term}" ${byGround.length} time${byGround.length !== 1 ? "s" : ""}. Last visit:` + fmtMatch(byGround[0]);
      }
      if (byTeam.length > 0) {
        return `Yes! You've seen "${term}" ${byTeam.length} time${byTeam.length !== 1 ? "s" : ""}. Last time:` + fmtMatch(byTeam[0]);
      }
      return `I can't find any matches related to "${term}" in your history. You haven't been there or seen them yet!`;
    }
  }

  // ── Year queries: "games in 2024", "2019 matches" ──
  const yearOnly = low.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearOnly && (low.includes("game") || low.includes("match") || low.includes("in ") || low.includes("during") || low.includes("year"))) {
    const year = yearOnly[1];
    const inYear = sorted.filter(m => m.date.startsWith(year));
    if (inYear.length === 0) return `No games found in ${year}.`;
    return `You went to <span class="chat-stat" style="display:inline">${inYear.length}</span> game${inYear.length !== 1 ? "s" : ""} in ${year}:` + fmtMatchList(inYear, 5);
  }

  // ── Competition queries ──
  const compTerms = ["premier league", "champions league", "fa cup", "league one", "league two", "championship", "europa league", "efl cup", "league cup", "women's super league", "wsl", "friendly", "national league", "isthmian", "spartan", "essex senior"];
  let matchedComp = null;
  for (const ct of compTerms) {
    if (low.includes(ct)) { matchedComp = ct; break; }
  }
  if (matchedComp) {
    const searchTerm = matchedComp === "wsl" ? "women's super league" : matchedComp === "league cup" ? "efl cup" : matchedComp;
    const compGames = sorted.filter(m => matchesComp(m, searchTerm));
    if (compGames.length === 0) return `No ${matchedComp} games found.`;
    // Check if they want a specific year
    const compYear = low.match(/\b(20\d{2})\b/);
    if (compYear) {
      const yearGames = compGames.filter(m => m.date.startsWith(compYear[1]));
      if (yearGames.length === 0) return `No ${matchedComp} games in ${compYear[1]}.`;
      return `You went to ${yearGames.length} ${matchedComp} game${yearGames.length !== 1 ? "s" : ""} in ${compYear[1]}:` + fmtMatchList(yearGames, 5);
    }
    return `You've been to <span class="chat-stat" style="display:inline">${compGames.length}</span> ${matchedComp} game${compGames.length !== 1 ? "s" : ""}:` + fmtMatchList(compGames, 5);
  }

  // ── Countries ──
  if (low.includes("countr") || low.includes("abroad") || low.includes("international") || low.includes("overseas") || low.includes("foreign")) {
    const intl = {
      "Switzerland": ["Stade de Genève", "Stadion Wankdorf", "Stockhorn Arena"],
      "Australia": ["AAMI Park"],
      "UAE": ["Mohammed Bin Zayed Stadium"],
      "USA": ["Gillette Stadium", "Geodis Park"],
      "Netherlands": ["Philips Stadion"],
      "Germany": ["BZA Gröpelingen Platz 4", "Volksparkstadion", "Grünwalder Stadion", "WWK ARENA"],
      "Italy": ["Stadio Arena Garibaldi"],
      "Spain": ["Estadio La Rosaleda"],
      "Scotland": ["The SMISA Stadium", "Celtic Park", "Galabank"],
      "Gibraltar": ["Europa Point Stadium"],
      "Wales": ["Cardiff City Stadium"],
    };
    let lines = [];
    let totalAbroad = 0;
    for (const [country, stadiums] of Object.entries(intl)) {
      const ms = matches.filter(m => stadiums.some(s => m.stadium.includes(s)));
      if (ms.length > 0) { lines.push(`🌍 <strong>${country}</strong>: ${ms.length} game${ms.length !== 1 ? "s" : ""}`); totalAbroad += ms.length; }
    }
    if (lines.length === 0) return "I couldn't identify any games outside England from your data.";
    return `You've been to games in <span class="chat-stat" style="display:inline">${lines.length}</span> countries outside England (${totalAbroad} games total):<br>${lines.join("<br>")}`;
  }

  // ── Day of week queries ──
  if (low.includes("saturday") || low.includes("sunday") || low.includes("midweek") || low.includes("tuesday") || low.includes("wednesday") || low.includes("day of the week") || low.includes("which day")) {
    const dayMap = { 0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
    const dayCount = {};
    matches.forEach(m => {
      if (!m.date) return;
      const day = new Date(m.date + "T12:00:00").getDay();
      const name = dayMap[day];
      dayCount[name] = (dayCount[name] || 0) + 1;
    });
    if (low.includes("which day") || low.includes("day of the week")) {
      const topDay = Object.entries(dayCount).sort((a,b) => b[1] - a[1])[0];
      let html = `Your most common matchday is <strong>${topDay[0]}</strong> (${topDay[1]} games).<br><br>`;
      Object.entries(dayCount).sort((a,b) => b[1] - a[1]).forEach(([d, c]) => { html += `${d}: ${c}<br>`; });
      return html;
    }
    // Specific day
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const targetDay = days.find(d => low.includes(d));
    if (targetDay) {
      const count = dayCount[targetDay.charAt(0).toUpperCase() + targetDay.slice(1)] || 0;
      return `<div class="chat-stat">${count}</div>You've been to ${count} game${count !== 1 ? "s" : ""} on a ${targetDay.charAt(0).toUpperCase() + targetDay.slice(1)}.`;
    }
    if (low.includes("midweek")) {
      const midweek = (dayCount["Tuesday"] || 0) + (dayCount["Wednesday"] || 0) + (dayCount["Thursday"] || 0);
      return `<div class="chat-stat">${midweek}</div>You've been to ${midweek} midweek games (Tue/Wed/Thu).`;
    }
  }

  // ── Average goals ──
  if (low.includes("average") && low.includes("goal")) {
    let total = 0;
    matches.forEach(m => { total += (m.homeScore || 0) + (m.awayScore || 0); });
    const avg = matches.length ? (total / matches.length).toFixed(2) : 0;
    return `<div class="chat-stat">${avg}</div>The average goals per game across your ${matches.length} matches is ${avg}.`;
  }

  // ── Women's football ──
  if (low.includes("women") || low.includes("wsl") || low.includes("women's")) {
    const womens = sorted.filter(m =>
      (m.competition || "").toLowerCase().includes("women") ||
      m.home.toLowerCase().includes("women") || m.away.toLowerCase().includes("women") ||
      m.home.includes("(W)") || m.away.includes("(W)")
    );
    if (womens.length === 0) return "No women's football matches found.";
    return `You've been to <span class="chat-stat" style="display:inline">${womens.length}</span> women's football game${womens.length !== 1 ? "s" : ""}:` + fmtMatchList(womens, 5);
  }

  // ── Non-league ──
  if (low.includes("non-league") || low.includes("non league") || low.includes("grassroots") || low.includes("lower league")) {
    const nlComps = ["isthmian", "spartan", "essex senior", "northern counties", "southern league", "eastern counties", "national league"];
    const nlGames = sorted.filter(m => nlComps.some(c => (m.competition || "").toLowerCase().includes(c)));
    if (nlGames.length === 0) return "No non-league games found.";
    return `You've been to <span class="chat-stat" style="display:inline">${nlGames.length}</span> non-league game${nlGames.length !== 1 ? "s" : ""}:` + fmtMatchList(nlGames, 5);
  }

  // ── Wembley specific ──
  if (low.includes("wembley")) {
    const wembley = sorted.filter(m => m.stadium.toLowerCase().includes("wembley"));
    if (wembley.length === 0) return "No Wembley games found.";
    return `You've been to Wembley <span class="chat-stat" style="display:inline">${wembley.length}</span> time${wembley.length !== 1 ? "s" : ""}:` + fmtMatchList(wembley, 5);
  }

  // ── This year / this month ──
  if (low.includes("this year")) {
    const year = new Date().getFullYear().toString();
    const inYear = sorted.filter(m => m.date.startsWith(year));
    if (inYear.length === 0) return `No games yet in ${year}.`;
    return `You've been to ${inYear.length} game${inYear.length !== 1 ? "s" : ""} so far in ${year}:` + fmtMatchList(inYear, 5);
  }
  if (low.includes("this month")) {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const inMonth = sorted.filter(m => m.date.startsWith(prefix));
    if (inMonth.length === 0) return "No games this month yet.";
    return `You've been to ${inMonth.length} game${inMonth.length !== 1 ? "s" : ""} this month:` + fmtMatchList(inMonth, 5);
  }

  // ── Busiest year / month ──
  if (low.includes("busiest year") || low.includes("most games in a year") || low.includes("best year")) {
    const yearMap = {};
    matches.forEach(m => { const y = m.date.slice(0, 4); yearMap[y] = (yearMap[y] || 0) + 1; });
    const top = Object.entries(yearMap).sort((a, b) => b[1] - a[1])[0];
    if (!top) return "No data.";
    return `Your busiest year was <strong>${top[0]}</strong> with <span class="chat-stat" style="display:inline">${top[1]}</span> games.`;
  }
  if (low.includes("busiest month") || low.includes("most games in a month")) {
    const monthMap = {};
    matches.forEach(m => { const ym = m.date.slice(0, 7); monthMap[ym] = (monthMap[ym] || 0) + 1; });
    const top = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0];
    if (!top) return "No data.";
    const [y, mo] = top[0].split("-");
    const monthName = new Date(y, parseInt(mo) - 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
    return `Your busiest month was <strong>${monthName}</strong> with <span class="chat-stat" style="display:inline">${top[1]}</span> games.`;
  }

  // ── Random fact / fun fact ──
  if (low.includes("random") || low.includes("fun fact") || low.includes("surprise") || low.includes("tell me something")) {
    const facts = [];
    // Longest gap
    if (sortedAsc.length > 1) {
      let maxGap = 0, gapStart = null, gapEnd = null;
      for (let i = 1; i < sortedAsc.length; i++) {
        const d1 = new Date(sortedAsc[i-1].date), d2 = new Date(sortedAsc[i].date);
        const gap = (d2 - d1) / (1000 * 60 * 60 * 24);
        if (gap > maxGap) { maxGap = gap; gapStart = sortedAsc[i-1]; gapEnd = sortedAsc[i]; }
      }
      if (gapStart) facts.push(`Your longest gap between games was ${Math.round(maxGap)} days (${formatDate(gapStart.date)} to ${formatDate(gapEnd.date)}).`);
    }
    // Most games in one day
    const dayMap = {};
    matches.forEach(m => { dayMap[m.date] = (dayMap[m.date] || 0) + 1; });
    const multiDays = Object.entries(dayMap).filter(([d, c]) => c > 1).sort((a, b) => b[1] - a[1]);
    if (multiDays.length > 0) facts.push(`You've done ${multiDays.length} double-header day${multiDays.length !== 1 ? "s" : ""} (most: ${multiDays[0][1]} games on ${formatDate(multiDays[0][0])}).`);
    // Total unique teams
    facts.push(`You've watched ${Object.keys(getUniqueTeams()).length} different teams play.`);
    // Pick a random fact
    const fact = facts[Math.floor(Math.random() * facts.length)];
    return `🎲 <strong>Fun fact:</strong> ${fact}`;
  }

  // ── Longest gap ──
  if (low.includes("longest gap") || low.includes("biggest gap") || low.includes("longest break")) {
    if (sortedAsc.length < 2) return "Not enough data.";
    let maxGap = 0, gapStart = null, gapEnd = null;
    for (let i = 1; i < sortedAsc.length; i++) {
      const d1 = new Date(sortedAsc[i-1].date), d2 = new Date(sortedAsc[i].date);
      const gap = (d2 - d1) / (1000 * 60 * 60 * 24);
      if (gap > maxGap) { maxGap = gap; gapStart = sortedAsc[i-1]; gapEnd = sortedAsc[i]; }
    }
    return `Your longest gap between games was <strong>${Math.round(maxGap)} days</strong> (${formatDate(gapStart.date)} to ${formatDate(gapEnd.date)}).` +
      `<br>Before the gap:` + fmtMatch(gapStart) + `After the gap:` + fmtMatch(gapEnd);
  }

  // ── Double headers ──
  if (low.includes("double header") || low.includes("two games") || low.includes("same day") || low.includes("double-header")) {
    const dayMap = {};
    matches.forEach(m => { if (!dayMap[m.date]) dayMap[m.date] = []; dayMap[m.date].push(m); });
    const doubles = Object.entries(dayMap).filter(([d, ms]) => ms.length > 1).sort((a, b) => b[0].localeCompare(a[0]));
    if (doubles.length === 0) return "You haven't done any double-headers (two games in one day).";
    let html = `You've done <span class="chat-stat" style="display:inline">${doubles.length}</span> double-header day${doubles.length !== 1 ? "s" : ""}:<br>`;
    doubles.slice(0, 5).forEach(([date, ms]) => {
      html += `<strong>${formatDate(date)}</strong>: ${ms.map(m => `${m.home} ${m.homeScore}–${m.awayScore} ${m.away}`).join(" & ")}<br>`;
    });
    return html;
  }

  // ── Fallback: try to find a team or ground name in the query ──
  const fallbackTerm = extractFallbackTerm(low);
  if (fallbackTerm) {
    const resolved = resolveTeam(fallbackTerm);
    const t = resolved.toLowerCase();
    const byTeam = sorted.filter(m => matchesTeam(m, t) || matchesTeam(m, fallbackTerm));
    const byGround = sorted.filter(m => matchesGround(m, t) || matchesGround(m, fallbackTerm));
    const byComp = sorted.filter(m => matchesComp(m, t) || matchesComp(m, fallbackTerm));
    if (byTeam.length > 0) {
      return `Found ${byTeam.length} game${byTeam.length !== 1 ? "s" : ""} involving "${fallbackTerm}":` + fmtMatchList(byTeam, 5);
    }
    if (byGround.length > 0) {
      return `Found ${byGround.length} game${byGround.length !== 1 ? "s" : ""} at "${fallbackTerm}":` + fmtMatchList(byGround, 5);
    }
    if (byComp.length > 0) {
      return `Found ${byComp.length} game${byComp.length !== 1 ? "s" : ""} in "${fallbackTerm}":` + fmtMatchList(byComp, 5);
    }
  }

  return `I'm not sure how to answer that one. Here are some things I can help with:<br>
    • <strong>Teams:</strong> "How many Newcastle games?" / "Last time I saw Chelsea"<br>
    • <strong>Grounds:</strong> "How many times at Wembley?" / "Have I been to Anfield?"<br>
    • <strong>Scores:</strong> "Last 0-0?" / "Any 5-0 games?" / "Biggest win?"<br>
    • <strong>Stats:</strong> "Total goals" / "Most visited ground" / "Busiest year"<br>
    • <strong>Seasons:</strong> "How was 2024/25?" / "Games in 2023"<br>
    • <strong>Fun:</strong> "Tell me something random" / "Longest gap between games"<br>
    • <strong>More:</strong> "Women's games" / "Non-league" / "Double headers" / "Which day?"`;
}

// ─── Text extraction helpers ──────────────────────────────────────────────────
function extractSearchTerm(text, stopWords) {
  let cleaned = text.toLowerCase();
  for (const sw of stopWords) {
    cleaned = cleaned.replace(new RegExp("\\b" + sw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "gi"), " ");
  }
  cleaned = cleaned.replace(/[?!.,]/g, "").replace(/\s+/g, " ").trim();
  return cleaned.length > 1 ? cleaned : null;
}

function extractFallbackTerm(text) {
  const noise = ["what", "when", "where", "which", "who", "how", "many", "much", "the", "a", "an", "is", "was", "were", "are", "my", "i", "me", "have", "has", "had", "did", "do", "does", "been", "to", "at", "in", "of", "for", "and", "or", "but", "not", "no", "any", "all", "some", "this", "that", "it", "its", "about", "from", "with", "on", "by", "up", "out", "if", "so", "than", "then", "there", "here", "just", "also", "very", "can", "will", "would", "could", "should", "shall", "may", "might", "ever", "seen", "game", "games", "match", "matches", "tell", "show", "give", "find", "get", "go", "went", "going", "last", "first", "most", "least", "time", "times", "more", "less"];
  let words = text.toLowerCase().replace(/[?!.,]/g, "").split(/\s+/);
  words = words.filter(w => !noise.includes(w) && w.length > 1);
  return words.length > 0 ? words.join(" ") : null;
}

// ─── Event wiring ─────────────────────────────────────────────────────────────
document.getElementById("chat-send").addEventListener("click", handleChatSend);
document.getElementById("chat-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleChatSend();
});

document.querySelectorAll(".chat-suggestion").forEach(btn => {
  btn.addEventListener("click", () => {
    const q = btn.dataset.q;
    document.getElementById("chat-input").value = q;
    handleChatSend();
  });
});

function handleChatSend() {
  const input = document.getElementById("chat-input");
  const q = input.value.trim();
  if (!q) return;
  input.value = "";
  addUserMessage(q);
  setTimeout(() => {
    const answer = answerQuestion(q);
    addBotMessage(answer);
  }, 150);
}
