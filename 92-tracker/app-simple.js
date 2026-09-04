// Simple 92 Tracker - No complex features
console.log("🔥 SIMPLE 92 TRACKER LOADED");

const DEFAULT_CLUBS = [
  { id: 1, name: "Arsenal", stadium: "Emirates Stadium", division: "Premier League" },
  { id: 2, name: "Aston Villa", stadium: "Villa Park", division: "Premier League" },
  { id: 3, name: "Brighton & Hove Albion", stadium: "Falmer Stadium", division: "Premier League" },
  { id: 4, name: "Chelsea", stadium: "Stamford Bridge", division: "Premier League" },
  { id: 5, name: "Liverpool", stadium: "Anfield", division: "Premier League" },
  { id: 6, name: "Manchester City", stadium: "City of Manchester Stadium", division: "Premier League" },
  { id: 7, name: "Manchester United", stadium: "Old Trafford", division: "Premier League" },
  { id: 8, name: "Newcastle United", stadium: "St James' Park", division: "Premier League" },
  { id: 9, name: "Tottenham Hotspur", stadium: "Tottenham Hotspur Stadium", division: "Premier League" },
  { id: 10, name: "West Ham United", stadium: "London Stadium", division: "Premier League" }
];

let state = { clubs: DEFAULT_CLUBS, visits: {} };

function render() {
  console.log("RENDERING CLUBS");
  const grid = document.getElementById("main-grid");
  if (!grid) {
    console.error("No main-grid found");
    return;
  }

  let html = '<div style="padding: 20px;"><h2>Football Clubs</h2>';
  
  for (let i = 0; i < state.clubs.length; i++) {
    const club = state.clubs[i];
    html += '<div style="border: 2px solid #007bff; margin: 10px 0; padding: 15px; background: white; color: black; border-radius: 5px;">';
    html += '<h3 style="margin: 0 0 10px 0;">' + club.name + '</h3>';
    html += '<p style="margin: 5px 0;"><strong>Stadium:</strong> ' + club.stadium + '</p>';
    html += '<p style="margin: 5px 0;"><strong>Division:</strong> ' + club.division + '</p>';
    html += '</div>';
  }
  html += '</div>';
  
  grid.innerHTML = html;
  console.log("CLUBS DISPLAYED:", state.clubs.length);
}

// Simple initialization
function init() {
  console.log("INITIALIZING...");
  
  // Update header stats
  document.getElementById("stat-visited").textContent = "0 Visited";
  document.getElementById("stat-remaining").textContent = state.clubs.length + " Remaining";
  document.getElementById("progress-pct").textContent = "0%";
  
  render();
  console.log("INIT COMPLETE");
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}