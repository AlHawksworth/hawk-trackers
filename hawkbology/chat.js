// ─── Hawkbology Chatbot Engine ─────────────────────────────────────────────────
// Parses natural language questions and queries the matches array.

let chatInitialised = false;

function initChat() {
  if (chatInitialised) return;
  chatInitialised = true;
  addBotMessage("Hey! Ask me anything about your match history. Try one of the suggestions above, or type your own question.");
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

// ─── Query engine ─────────────────────────────────────────────────────────────
function answerQuestion(q) {
  const low = q.toLowerCase().trim().replace(/[?!.]+$/g, "");
  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));
  const sortedAsc = [...matches].sort((a, b) => a.date.localeCompare(b.date));

  // ── Score-specific queries: "last X-X", "first X-X", "how many X-X" ──
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
      const first = scoreGames[scoreGames.length - 1];
      return `Your first ${sh}–${sa} was:` + fmtMatch(first);
    }
    if (low.includes("how many") || low.includes("count") || low.includes("number")) {
      return `<div class="chat-stat">${scoreGames.length}</div>You've seen ${scoreGames.length} game${scoreGames.length !== 1 ? "s" : ""} finish ${sh}–${sa}.`;
    }
    // Default: show all
    if (scoreGames.length === 0) return `No ${sh}–${sa} games found in your history.`;
    return `Found ${scoreGames.length} game${scoreGames.length !== 1 ? "s" : ""} finishing ${sh}–${sa}:` + fmtMatchList(scoreGames, 5);
  }

  // ── "first ever game" / "first game" ──
  if ((low.includes("first") && (low.includes("game") || low.includes("match"))) && !low.includes("first time")) {
    // Check for year
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
    // Check for specific context
    const atMatch = low.match(/(?:at|in)\s+(.+)/);
    if (atMatch) {
      const place = atMatch[1].trim();
      const atGround = sorted.filter(m => m.stadium.toLowerCase().includes(place));
      if (atGround.length > 0) return `Your last game at a ground matching "${place}":` + fmtMatch(atGround[0]);
    }
    if (sorted.length === 0) return "No matches recorded yet.";
    return `Your most recent game was:` + fmtMatch(sorted[0]);
  }

  // ── "biggest win" / "biggest loss" / "highest scoring" ──
  if (low.includes("biggest win") || low.includes("largest win")) {
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
  if (low.includes("biggest loss") || low.includes("biggest defeat") || low.includes("worst")) {
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
  if (low.includes("highest scoring") || low.includes("most goals in a game") || low.includes("most goals in one")) {
    let best = null, bestGoals = -1;
    matches.forEach(m => {
      const total = (m.homeScore || 0) + (m.awayScore || 0);
      if (total > bestGoals) { bestGoals = total; best = m; }
    });
    if (!best) return "No matches with scores recorded.";
    return `The highest-scoring game you've seen (${bestGoals} goals):` + fmtMatch(best);
  }

  // ── "how many games" at a ground / for a team / in a year / in a competition ──
  if (low.includes("how many") || low.includes("count") || low.includes("number of")) {
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
    // Draws
    if (low.includes("draw")) {
      const draws = matches.filter(m => m.homeScore != null && m.homeScore === m.awayScore);
      return `<div class="chat-stat">${draws.length}</div>You've seen ${draws.length} draw${draws.length !== 1 ? "s" : ""}.`;
    }
    // Generic team/ground search
    const teamSearch = extractSearchTerm(low, ["how many", "games", "matches", "times", "have i", "been to", "seen", "watched", "did i", "go to", "went to", "at", "of", "count", "number"]);
    if (teamSearch) {
      const term = teamSearch.toLowerCase();
      const byTeam = matches.filter(m => m.home.toLowerCase().includes(term) || m.away.toLowerCase().includes(term));
      const byGround = matches.filter(m => m.stadium.toLowerCase().includes(term));
      const byComp = matches.filter(m => (m.competition || "").toLowerCase().includes(term));
      if (byTeam.length > 0) {
        return `<div class="chat-stat">${byTeam.length}</div>You've been to ${byTeam.length} game${byTeam.length !== 1 ? "s" : ""} involving "${teamSearch}".` + fmtMatchList(byTeam.sort((a,b) => b.date.localeCompare(a.date)), 3);
      }
      if (byGround.length > 0) {
        return `<div class="chat-stat">${byGround.length}</div>You've been to "${teamSearch}" ${byGround.length} time${byGround.length !== 1 ? "s" : ""}.` + fmtMatchList(byGround.sort((a,b) => b.date.localeCompare(a.date)), 3);
      }
      if (byComp.length > 0) {
        return `<div class="chat-stat">${byComp.length}</div>You've been to ${byComp.length} "${teamSearch}" game${byComp.length !== 1 ? "s" : ""}.`;
      }
      return `I couldn't find any matches related to "${teamSearch}".`;
    }
    return `<div class="chat-stat">${matches.length}</div>You've been to ${matches.length} games in total.`;
  }

  // ── "which ground" / "most visited" ──
  if (low.includes("most visited") || low.includes("which ground") || low.includes("favourite ground") || low.includes("favorite ground")) {
    const grounds = getUniqueGrounds();
    const top = Object.entries(grounds).sort((a, b) => b[1].length - a[1].length)[0];
    if (!top) return "No grounds data yet.";
    return `Your most visited ground is <strong>${escHtml(top[0])}</strong> with <span class="chat-stat" style="display:inline">${top[1].length}</span> visits.`;
  }

  // ── "most watched team" ──
  if (low.includes("most watched") || low.includes("which team") || low.includes("favourite team") || low.includes("favorite team")) {
    const teams = getUniqueTeams();
    const top = Object.entries(teams).sort((a, b) => b[1] - a[1])[0];
    if (!top) return "No data yet.";
    return `Your most watched team is <strong>${escHtml(top[0])}</strong> — you've seen them ${top[1]} time${top[1] !== 1 ? "s" : ""}.`;
  }

  // ── "have I been to [ground]" / "have I seen [team]" ──
  if (low.includes("have i been") || low.includes("have i seen") || low.includes("have i watched") || low.includes("did i go")) {
    const term = extractSearchTerm(low, ["have i", "been to", "seen", "watched", "did i", "go to", "ever"]);
    if (term) {
      const t = term.toLowerCase();
      const byGround = sorted.filter(m => m.stadium.toLowerCase().includes(t));
      const byTeam = sorted.filter(m => m.home.toLowerCase().includes(t) || m.away.toLowerCase().includes(t));
      if (byGround.length > 0) {
        return `Yes! You've been to "${term}" ${byGround.length} time${byGround.length !== 1 ? "s" : ""}. Last visit:` + fmtMatch(byGround[0]);
      }
      if (byTeam.length > 0) {
        return `Yes! You've seen "${term}" ${byTeam.length} time${byTeam.length !== 1 ? "s" : ""}. Last time:` + fmtMatch(byTeam[0]);
      }
      return `I can't find any matches related to "${term}" in your history.`;
    }
  }

  // ── Year queries: "games in 2024", "2019 matches" ──
  const yearOnly = low.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearOnly && (low.includes("game") || low.includes("match") || low.includes("in ") || low.includes("during"))) {
    const year = yearOnly[1];
    const inYear = sorted.filter(m => m.date.startsWith(year));
    if (inYear.length === 0) return `No games found in ${year}.`;
    return `You went to <span class="chat-stat" style="display:inline">${inYear.length}</span> game${inYear.length !== 1 ? "s" : ""} in ${year}:` + fmtMatchList(inYear, 5);
  }

  // ── Competition queries ──
  if (low.includes("premier league") || low.includes("champions league") || low.includes("fa cup") || low.includes("league one") || low.includes("league two") || low.includes("championship")) {
    const compTerms = ["premier league", "champions league", "fa cup", "league one", "league two", "championship", "europa league", "efl cup", "women's super league", "friendly"];
    let matchedComp = null;
    for (const ct of compTerms) {
      if (low.includes(ct)) { matchedComp = ct; break; }
    }
    if (matchedComp) {
      const compGames = sorted.filter(m => (m.competition || "").toLowerCase().includes(matchedComp));
      if (compGames.length === 0) return `No ${matchedComp} games found.`;
      return `You've been to <span class="chat-stat" style="display:inline">${compGames.length}</span> ${matchedComp} game${compGames.length !== 1 ? "s" : ""}:` + fmtMatchList(compGames, 5);
    }
  }

  // ── Countries ──
  if (low.includes("countr") || low.includes("abroad") || low.includes("international") || low.includes("overseas")) {
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
    };
    let lines = [];
    for (const [country, stadiums] of Object.entries(intl)) {
      const ms = matches.filter(m => stadiums.some(s => m.stadium.includes(s)));
      if (ms.length > 0) lines.push(`<strong>${country}</strong>: ${ms.length} game${ms.length !== 1 ? "s" : ""}`);
    }
    if (lines.length === 0) return "I couldn't identify any games outside England/Wales from your data.";
    return `You've been to games in ${lines.length} countries outside England:<br>${lines.join("<br>")}`;
  }

  // ── Fallback: try to find a team or ground name in the query ──
  const fallbackTerm = extractFallbackTerm(low);
  if (fallbackTerm) {
    const t = fallbackTerm.toLowerCase();
    const byTeam = sorted.filter(m => m.home.toLowerCase().includes(t) || m.away.toLowerCase().includes(t));
    const byGround = sorted.filter(m => m.stadium.toLowerCase().includes(t));
    if (byTeam.length > 0) {
      return `Found ${byTeam.length} game${byTeam.length !== 1 ? "s" : ""} involving "${fallbackTerm}":` + fmtMatchList(byTeam, 5);
    }
    if (byGround.length > 0) {
      return `Found ${byGround.length} game${byGround.length !== 1 ? "s" : ""} at "${fallbackTerm}":` + fmtMatchList(byGround, 5);
    }
  }

  return `I'm not sure how to answer that. Try asking things like:<br>
    • "When was the last 0-0?"<br>
    • "How many times have I been to Wembley?"<br>
    • "What was the biggest win I've seen?"<br>
    • "How many games in 2023?"<br>
    • "Have I ever seen Chelsea?"`;
}

// ─── Text extraction helpers ──────────────────────────────────────────────────
function extractSearchTerm(text, stopWords) {
  let cleaned = text.toLowerCase();
  // Remove common stop words
  for (const sw of stopWords) {
    cleaned = cleaned.replace(new RegExp("\\b" + sw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "gi"), " ");
  }
  cleaned = cleaned.replace(/[?!.,]/g, "").replace(/\s+/g, " ").trim();
  return cleaned.length > 1 ? cleaned : null;
}

function extractFallbackTerm(text) {
  // Remove very common words and see if anything meaningful remains
  const noise = ["what", "when", "where", "which", "who", "how", "many", "much", "the", "a", "an", "is", "was", "were", "are", "my", "i", "me", "have", "has", "had", "did", "do", "does", "been", "to", "at", "in", "of", "for", "and", "or", "but", "not", "no", "any", "all", "some", "this", "that", "it", "its", "about", "from", "with", "on", "by", "up", "out", "if", "so", "than", "then", "there", "here", "just", "also", "very", "can", "will", "would", "could", "should", "shall", "may", "might", "ever", "seen", "game", "games", "match", "matches", "tell", "show", "give", "find", "get", "go", "went", "going", "last", "first", "most", "least", "time", "times"];
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
  // Small delay for natural feel
  setTimeout(() => {
    const answer = answerQuestion(q);
    addBotMessage(answer);
  }, 150);
}
