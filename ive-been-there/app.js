// I've Been There - App Logic
(function() {
  'use strict';

  // Storage keys
  const STORAGE_KEYS = {
    countries: 'ibt-countries',
    states: 'ibt-us-states',
    counties: 'ibt-uk-counties',
    boroughs: 'ibt-london-boroughs'
  };

  // State
  let visitedCountries = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.countries) || '[]'));
  let visitedStates = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.states) || '[]'));
  let visitedCounties = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.counties) || '[]'));
  let visitedBoroughs = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.boroughs) || '[]'));

  // Save helpers
  function updateLastUpdated() {
    const lastUpdated = localStorage.getItem('ibt_last_updated');
    const element = document.getElementById('last-updated');
    if (!element) return;
    
    if (lastUpdated) {
      const date = new Date(parseInt(lastUpdated));
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo;
      if (diffMins < 1) timeAgo = 'Just now';
      else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
      else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
      else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
      else timeAgo = date.toLocaleDateString();
      
      element.textContent = `Last updated: ${timeAgo}`;
    } else {
      element.textContent = 'Last updated: Never';
    }
  }

  function updateTimestamp() {
    localStorage.setItem('ibt_last_updated', Date.now().toString());
    updateLastUpdated();
  }

  function saveCountries() {
    localStorage.setItem(STORAGE_KEYS.countries, JSON.stringify([...visitedCountries]));
    updateTimestamp();
  }
  function saveStates() {
    localStorage.setItem(STORAGE_KEYS.states, JSON.stringify([...visitedStates]));
    updateTimestamp();
  }
  function saveCounties() {
    localStorage.setItem(STORAGE_KEYS.counties, JSON.stringify([...visitedCounties]));
    updateTimestamp();
  }
  function saveBoroughs() {
    localStorage.setItem(STORAGE_KEYS.boroughs, JSON.stringify([...visitedBoroughs]));
    updateTimestamp();
  }

  // Toggle functions
  function toggleCountry(code) {
    if (visitedCountries.has(code)) {
      visitedCountries.delete(code);
    } else {
      visitedCountries.add(code);
    }
    saveCountries();
    updateAll();
  }

  function toggleState(code) {
    if (visitedStates.has(code)) {
      visitedStates.delete(code);
    } else {
      visitedStates.add(code);
    }
    saveStates();
    updateAll();
  }

  function toggleCounty(name) {
    if (visitedCounties.has(name)) {
      visitedCounties.delete(name);
    } else {
      visitedCounties.add(name);
    }
    saveCounties();
    updateAll();
  }

  function toggleBorough(name) {
    if (visitedBoroughs.has(name)) {
      visitedBoroughs.delete(name);
    } else {
      visitedBoroughs.add(name);
    }
    saveBoroughs();
    updateAll();
  }

  // UK constituent countries
  const UK_COUNTRIES = [
    { code: 'GB-ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { code: 'GB-SCT', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { code: 'GB-WLS', name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { code: 'GB-NIR', name: 'Northern Ireland', flag: '🇬🇧' }
  ];

  // Show UK country picker modal
  function showUKCountryPicker() {
    // Remove existing modal if any
    const existing = document.querySelector('.uk-picker-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'uk-picker-overlay';

    const modal = document.createElement('div');
    modal.className = 'uk-picker-modal';
    modal.innerHTML = `
      <h3>Select UK Countries</h3>
      <p class="uk-picker-sub">Choose which countries you've visited:</p>
      <div class="uk-picker-list">
        ${UK_COUNTRIES.map(c => `
          <div class="uk-picker-item ${visitedCountries.has(c.code) ? 'visited' : ''}" data-code="${c.code}">
            <span class="flag">${c.flag}</span>
            <span class="name">${c.name}</span>
            <span class="check">${visitedCountries.has(c.code) ? '✓' : ''}</span>
          </div>
        `).join('')}
      </div>
      <button class="uk-picker-done">Done</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Handle item clicks
    modal.querySelectorAll('.uk-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        const code = item.dataset.code;
        toggleCountry(code);
        // Update the modal UI
        const isVisited = visitedCountries.has(code);
        item.classList.toggle('visited', isVisited);
        item.querySelector('.check').textContent = isVisited ? '✓' : '';
      });
    });

    // Close on done button
    modal.querySelector('.uk-picker-done').addEventListener('click', () => {
      overlay.remove();
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  // Country code to flag emoji
  function codeToFlag(code) {
    if (!code || code.length < 2) return '🏳️';
    // Handle UK constituent countries
    const ukFlags = {
      'GB-ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'GB-SCT': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'GB-WLS': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      'GB-NIR': '🇬🇧'
    };
    if (ukFlags[code]) return ukFlags[code];
    if (code.length !== 2) return '🏳️';
    return String.fromCodePoint(
      ...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
    );
  }

  // Page navigation
  const pageTabs = document.querySelectorAll('.page-tab');
  const pages = document.querySelectorAll('.page');

  pageTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      pageTabs.forEach(t => t.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`page-${tab.dataset.page}`).classList.add('active');
    });
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scope = btn.dataset.scope;
      document.querySelectorAll(`.filter-btn[data-scope="${scope}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderList(scope);
    });
  });

  // Continent selector
  document.querySelectorAll('.continent-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.continent-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderList('continent');
    });
  });

  // Search inputs
  document.getElementById('search-world').addEventListener('input', () => renderList('world'));
  document.getElementById('search-continent').addEventListener('input', () => renderList('continent'));
  document.getElementById('search-us').addEventListener('input', () => renderList('us'));
  document.getElementById('search-uk').addEventListener('input', () => renderList('uk'));
  document.getElementById('search-london').addEventListener('input', () => renderList('london'));

  // Render country list
  function renderList(scope) {
    if (scope === 'world') {
      const search = document.getElementById('search-world').value.toLowerCase();
      const filter = document.querySelector('.filter-btn.active[data-scope="world"]').dataset.filter;
      let items = ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(search));
      if (filter === 'visited') items = items.filter(c => visitedCountries.has(c.code));
      if (filter === 'unvisited') items = items.filter(c => !visitedCountries.has(c.code));
      renderCountryCards(items, 'country-list');
    } else if (scope === 'continent') {
      const continent = document.querySelector('.continent-btn.active').dataset.continent;
      const search = document.getElementById('search-continent').value.toLowerCase();
      const filter = document.querySelector('.filter-btn.active[data-scope="continent"]').dataset.filter;
      let items = continent === 'all' ? ALL_COUNTRIES : ALL_COUNTRIES.filter(c => c.continent === continent);
      items = items.filter(c => c.name.toLowerCase().includes(search));
      if (filter === 'visited') items = items.filter(c => visitedCountries.has(c.code));
      if (filter === 'unvisited') items = items.filter(c => !visitedCountries.has(c.code));
      renderCountryCards(items, 'continent-list');
    } else if (scope === 'us') {
      const search = document.getElementById('search-us').value.toLowerCase();
      const filter = document.querySelector('.filter-btn.active[data-scope="us"]').dataset.filter;
      let items = US_STATES.filter(s => s.name.toLowerCase().includes(search));
      if (filter === 'visited') items = items.filter(s => visitedStates.has(s.code));
      if (filter === 'unvisited') items = items.filter(s => !visitedStates.has(s.code));
      renderStateCards(items);
    } else if (scope === 'uk') {
      const search = document.getElementById('search-uk').value.toLowerCase();
      const filter = document.querySelector('.filter-btn.active[data-scope="uk"]').dataset.filter;
      let items = UK_COUNTIES.filter(c => c.name.toLowerCase().includes(search));
      if (filter === 'visited') items = items.filter(c => visitedCounties.has(c.name));
      if (filter === 'unvisited') items = items.filter(c => !visitedCounties.has(c.name));
      renderCountyCards(items);
    } else if (scope === 'london') {
      const search = document.getElementById('search-london').value.toLowerCase();
      const filter = document.querySelector('.filter-btn.active[data-scope="london"]').dataset.filter;
      let items = LONDON_BOROUGHS.filter(b => b.name.toLowerCase().includes(search));
      if (filter === 'visited') items = items.filter(b => visitedBoroughs.has(b.name));
      if (filter === 'unvisited') items = items.filter(b => !visitedBoroughs.has(b.name));
      renderBoroughCards(items);
    }
  }

  function renderCountryCards(items, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map(c => `
      <div class="item-card ${visitedCountries.has(c.code) ? 'visited' : ''}" data-code="${c.code}" data-type="country">
        <span class="flag">${codeToFlag(c.code)}</span>
        <div class="info">
          <div class="name">${c.name}</div>
          <div class="sub">${c.continent}</div>
        </div>
        <div class="check">${visitedCountries.has(c.code) ? '✓' : ''}</div>
      </div>
    `).join('');

    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => {
        toggleCountry(card.dataset.code);
      });
    });
  }

  function renderStateCards(items) {
    const container = document.getElementById('us-list');
    container.innerHTML = items.map(s => `
      <div class="item-card ${visitedStates.has(s.code) ? 'visited' : ''}" data-code="${s.code}" data-type="state">
        <span class="flag">🇺🇸</span>
        <div class="info">
          <div class="name">${s.name}</div>
          <div class="sub">${s.code}</div>
        </div>
        <div class="check">${visitedStates.has(s.code) ? '✓' : ''}</div>
      </div>
    `).join('');

    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => {
        toggleState(card.dataset.code);
      });
    });
  }

  function renderCountyCards(items) {
    const container = document.getElementById('uk-list');
    container.innerHTML = items.map(c => `
      <div class="item-card ${visitedCounties.has(c.name) ? 'visited' : ''}" data-name="${c.name}" data-type="county">
        <span class="flag">🇬🇧</span>
        <div class="info">
          <div class="name">${c.name}</div>
          <div class="sub">${c.country}</div>
        </div>
        <div class="check">${visitedCounties.has(c.name) ? '✓' : ''}</div>
      </div>
    `).join('');

    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => {
        toggleCounty(card.dataset.name);
      });
    });
  }

  function renderBoroughCards(items) {
    const container = document.getElementById('london-list');
    container.innerHTML = items.map(b => `
      <div class="item-card ${visitedBoroughs.has(b.name) ? 'visited' : ''}" data-name="${b.name}" data-type="borough">
        <span class="flag">🏙️</span>
        <div class="info">
          <div class="name">${b.name}</div>
          <div class="sub">${b.type}</div>
        </div>
        <div class="check">${visitedBoroughs.has(b.name) ? '✓' : ''}</div>
      </div>
    `).join('');

    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => {
        toggleBorough(card.dataset.name);
      });
    });
  }

  // Update header stats
  function updateHeaderStats() {
    const total = ALL_COUNTRIES.length;
    const visited = visitedCountries.size;
    const remaining = total - visited;
    const pct = Math.round((visited / total) * 100);

    document.getElementById('stat-visited').textContent = `${visited} Visited`;
    document.getElementById('stat-remaining').textContent = `${remaining} Remaining`;
    document.getElementById('progress-bar').style.width = `${pct}%`;
    document.getElementById('progress-pct').textContent = `${pct}%`;
  }

  // Update stats page
  function updateStatsPage() {
    const countriesVisited = visitedCountries.size;
    const statesVisited = visitedStates.size;
    const countiesVisited = visitedCounties.size;
    const boroughsVisited = visitedBoroughs.size;
    const totalCountries = ALL_COUNTRIES.length;

    document.getElementById('stats-countries').textContent = countriesVisited;
    document.getElementById('stats-countries-pct').textContent = `${Math.round((countriesVisited / totalCountries) * 100)}% of ${totalCountries}`;
    document.getElementById('stats-states').textContent = statesVisited;
    document.getElementById('stats-states-pct').textContent = `${Math.round((statesVisited / 50) * 100)}% of 50`;
    document.getElementById('stats-counties').textContent = countiesVisited;
    document.getElementById('stats-counties-pct').textContent = `${Math.round((countiesVisited / UK_COUNTIES.length) * 100)}% of ${UK_COUNTIES.length}`;
    document.getElementById('stats-boroughs').textContent = boroughsVisited;
    document.getElementById('stats-boroughs-pct').textContent = `${Math.round((boroughsVisited / LONDON_BOROUGHS.length) * 100)}% of ${LONDON_BOROUGHS.length}`;

    // Continents reached
    const continents = new Set();
    ALL_COUNTRIES.forEach(c => {
      if (visitedCountries.has(c.code)) continents.add(c.continent);
    });
    document.getElementById('stats-continents').textContent = `${continents.size}/7`;

    // Top continent
    const continentCounts = {};
    ALL_COUNTRIES.forEach(c => {
      if (visitedCountries.has(c.code)) {
        continentCounts[c.continent] = (continentCounts[c.continent] || 0) + 1;
      }
    });
    const topContinent = Object.entries(continentCounts).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('stats-top-continent').textContent = topContinent ? `Most: ${topContinent[0]}` : '-';

    // Continent breakdown
    const breakdownEl = document.getElementById('continent-breakdown');
    const allContinents = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'];
    breakdownEl.innerHTML = allContinents.map(cont => {
      const total = ALL_COUNTRIES.filter(c => c.continent === cont).length;
      const visited = ALL_COUNTRIES.filter(c => c.continent === cont && visitedCountries.has(c.code)).length;
      const pct = total > 0 ? Math.round((visited / total) * 100) : 0;
      return `
        <div class="breakdown-row">
          <span class="label">${cont}</span>
          <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>
          <span class="count">${visited}/${total}</span>
        </div>
      `;
    }).join('');
  }

  // Update maps
  function updateWorldMap() {
    const container = document.getElementById('world-map');
    const paths = container.querySelectorAll('path[data-code]');
    paths.forEach(path => {
      if (path.dataset.code === 'GB') {
        // Highlight GB if any UK constituent country is visited
        const anyUKVisited = UK_COUNTRIES.some(c => visitedCountries.has(c.code));
        const allUKVisited = UK_COUNTRIES.every(c => visitedCountries.has(c.code));
        path.classList.toggle('visited', allUKVisited);
        path.classList.toggle('partial', anyUKVisited && !allUKVisited);
      } else if (visitedCountries.has(path.dataset.code)) {
        path.classList.add('visited');
        path.classList.remove('partial');
      } else {
        path.classList.remove('visited');
        path.classList.remove('partial');
      }
    });
  }

  function updateUSMap() {
    const container = document.getElementById('us-map');
    const paths = container.querySelectorAll('path[data-code]');
    paths.forEach(path => {
      if (visitedStates.has(path.dataset.code)) {
        path.classList.add('visited');
      } else {
        path.classList.remove('visited');
      }
    });
  }

  function updateUKMap() {
    const container = document.getElementById('uk-map');
    const paths = container.querySelectorAll('path[data-name]');
    paths.forEach(path => {
      if (visitedCounties.has(path.dataset.name)) {
        path.classList.add('visited');
      } else {
        path.classList.remove('visited');
      }
    });
  }

  function initLondonMap() {
    const container = document.getElementById('london-map');
    
    // Create a proper interconnected London boroughs map
    const svg = `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="london-map-svg">
        <style>
          .borough-area { 
            fill: #e5e5e5; 
            stroke: #666; 
            stroke-width: 0.5; 
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .borough-area:hover { 
            fill: #d0d0d0; 
            stroke-width: 1.5;
            stroke: #333;
          }
          .borough-area.visited { 
            fill: #4CAF50; 
            stroke: #2E7D32;
          }
          .borough-area.visited:hover { 
            fill: #66BB6A; 
          }
          .borough-label { 
            font-size: 6px; 
            fill: #333; 
            text-anchor: middle;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 500;
          }
          .river-thames {
            fill: none;
            stroke: #4A90E2;
            stroke-width: 2;
            opacity: 0.7;
          }
        </style>
        
        <!-- Thames River (realistic curve through London) -->
        <path class="river-thames" d="M 70,190 Q 120,185 160,192 Q 200,198 240,195 Q 280,192 320,185 Q 350,180 380,175"/>
        
        <!-- OUTER RING - North -->
        <path class="borough-area" data-borough="Enfield" 
              d="M 240,10 L 300,8 L 310,35 L 295,55 L 270,58 L 250,45 L 235,25 Z"/>
        <text class="borough-label" x="275" y="35">Enfield</text>
        
        <path class="borough-area" data-borough="Barnet" 
              d="M 180,15 L 240,10 L 235,25 L 220,45 L 195,50 L 170,40 L 175,25 Z"/>
        <text class="borough-label" x="205" y="32">Barnet</text>
        
        <path class="borough-area" data-borough="Harrow" 
              d="M 120,45 L 170,40 L 175,58 L 160,75 L 135,78 L 115,65 L 118,52 Z"/>
        <text class="borough-label" x="145" y="62">Harrow</text>
        
        <path class="borough-area" data-borough="Hillingdon" 
              d="M 20,70 L 115,65 L 118,85 L 100,110 L 75,115 L 45,105 L 25,85 Z"/>
        <text class="borough-label" x="70" y="90">Hillingdon</text>
        
        <!-- OUTER RING - East -->
        <path class="borough-area" data-borough="Waltham Forest" 
              d="M 295,55 L 340,50 L 350,75 L 335,95 L 310,98 L 285,85 L 290,68 Z"/>
        <text class="borough-label" x="318" y="75">Waltham Forest</text>
        
        <path class="borough-area" data-borough="Redbridge" 
              d="M 340,50 L 380,45 L 390,70 L 375,90 L 350,93 L 335,78 L 345,62 Z"/>
        <text class="borough-label" x="365" y="70">Redbridge</text>
        
        <path class="borough-area" data-borough="Havering" 
              d="M 380,45 L 395,42 L 398,85 L 385,115 L 360,118 L 345,95 L 365,75 Z"/>
        <text class="borough-label" x="375" y="80">Havering</text>
        
        <path class="borough-area" data-borough="Barking and Dagenham" 
              d="M 345,115 L 385,115 L 390,140 L 375,160 L 350,163 L 325,145 L 340,128 Z"/>
        <text class="borough-label" x="360" y="140">Barking & Dag.</text>
        
        <!-- OUTER RING - South East -->
        <path class="borough-area" data-borough="Bexley" 
              d="M 350,200 L 390,195 L 395,220 L 380,240 L 355,243 L 335,225 L 345,210 Z"/>
        <text class="borough-label" x="365" y="220">Bexley</text>
        
        <path class="borough-area" data-borough="Bromley" 
              d="M 290,250 L 355,245 L 365,275 L 340,290 L 315,288 L 285,270 L 295,258 Z"/>
        <text class="borough-label" x="325" y="270">Bromley</text>
        
        <!-- OUTER RING - South -->
        <path class="borough-area" data-borough="Croydon" 
              d="M 230,270 L 285,268 L 295,285 L 275,295 L 250,293 L 220,280 L 235,275 Z"/>
        <text class="borough-label" x="255" y="282">Croydon</text>
        
        <path class="borough-area" data-borough="Sutton" 
              d="M 170,285 L 220,282 L 230,295 L 215,305 L 190,303 L 165,290 L 175,287 Z"/>
        <text class="borough-label" x="195" y="295">Sutton</text>
        
        <!-- OUTER RING - South West -->
        <path class="borough-area" data-borough="Kingston upon Thames" 
              d="M 125,265 L 175,262 L 185,280 L 170,295 L 145,293 L 120,275 L 130,270 Z"/>
        <text class="borough-label" x="150" y="278">Kingston</text>
        
        <path class="borough-area" data-borough="Richmond upon Thames" 
              d="M 80,235 L 130,232 L 140,250 L 125,265 L 100,263 L 75,245 L 85,240 Z"/>
        <text class="borough-label" x="105" y="248">Richmond</text>
        
        <!-- OUTER RING - West -->
        <path class="borough-area" data-borough="Hounslow" 
              d="M 50,185 L 100,182 L 110,200 L 95,220 L 70,223 L 45,205 L 55,190 Z"/>
        <text class="borough-label" x="75" y="205">Hounslow</text>
        
        <path class="borough-area" data-borough="Ealing" 
              d="M 75,135 L 125,132 L 135,150 L 120,170 L 95,173 L 70,155 L 80,140 Z"/>
        <text class="borough-label" x="100" y="152">Ealing</text>
        
        <!-- MIDDLE RING -->
        <path class="borough-area" data-borough="Brent" 
              d="M 135,78 L 175,75 L 185,95 L 170,115 L 145,118 L 125,100 L 140,85 Z"/>
        <text class="borough-label" x="155" y="98">Brent</text>
        
        <path class="borough-area" data-borough="Haringey" 
              d="M 220,58 L 270,55 L 280,75 L 265,95 L 240,98 L 215,80 L 225,65 Z"/>
        <text class="borough-label" x="245" y="78">Haringey</text>
        
        <path class="borough-area" data-borough="Newham" 
              d="M 310,145 L 350,142 L 360,165 L 345,185 L 320,188 L 295,170 L 305,155 Z"/>
        <text class="borough-label" x="330" y="165">Newham</text>
        
        <path class="borough-area" data-borough="Greenwich" 
              d="M 295,215 L 335,212 L 345,235 L 330,255 L 305,258 L 280,240 L 290,225 Z"/>
        <text class="borough-label" x="315" y="235">Greenwich</text>
        
        <path class="borough-area" data-borough="Lewisham" 
              d="M 250,235 L 290,232 L 300,252 L 285,272 L 260,275 L 235,257 L 245,242 Z"/>
        <text class="borough-label" x="265" y="252">Lewisham</text>
        
        <path class="borough-area" data-borough="Merton" 
              d="M 185,250 L 225,247 L 235,265 L 220,285 L 195,288 L 170,270 L 180,255 Z"/>
        <text class="borough-label" x="205" y="268">Merton</text>
        
        <path class="borough-area" data-borough="Wandsworth" 
              d="M 140,215 L 180,212 L 190,232 L 175,252 L 150,255 L 125,237 L 135,222 Z"/>
        <text class="borough-label" x="160" y="235">Wandsworth</text>
        
        <path class="borough-area" data-borough="Hammersmith and Fulham" 
              d="M 95,175 L 135,172 L 145,195 L 130,215 L 105,218 L 80,200 L 90,182 Z"/>
        <text class="borough-label" x="115" y="195">H&F</text>
        
        <!-- INNER RING -->
        <path class="borough-area" data-borough="Camden" 
              d="M 170,115 L 215,112 L 225,132 L 210,152 L 185,155 L 160,137 L 175,122 Z"/>
        <text class="borough-label" x="190" y="135">Camden</text>
        
        <path class="borough-area" data-borough="Islington" 
              d="M 215,112 L 260,109 L 270,129 L 255,149 L 230,152 L 205,134 L 220,119 Z"/>
        <text class="borough-label" x="235" y="132">Islington</text>
        
        <path class="borough-area" data-borough="Hackney" 
              d="M 260,109 L 305,106 L 315,126 L 300,146 L 275,149 L 250,131 L 265,116 Z"/>
        <text class="borough-label" x="280" y="129">Hackney</text>
        
        <path class="borough-area" data-borough="Tower Hamlets" 
              d="M 250,165 L 295,162 L 305,182 L 290,202 L 265,205 L 240,187 L 255,172 Z"/>
        <text class="borough-label" x="270" y="185">Tower Hamlets</text>
        
        <path class="borough-area" data-borough="Southwark" 
              d="M 210,195 L 255,192 L 265,212 L 250,232 L 225,235 L 200,217 L 215,202 Z"/>
        <text class="borough-label" x="235" y="215">Southwark</text>
        
        <path class="borough-area" data-borough="Lambeth" 
              d="M 170,195 L 215,192 L 225,212 L 210,232 L 185,235 L 160,217 L 175,202 Z"/>
        <text class="borough-label" x="190" y="215">Lambeth</text>
        
        <path class="borough-area" data-borough="Kensington and Chelsea" 
              d="M 130,175 L 170,172 L 180,192 L 165,212 L 140,215 L 115,197 L 125,182 Z"/>
        <text class="borough-label" x="145" y="195">K&C</text>
        
        <path class="borough-area" data-borough="Westminster" 
              d="M 160,155 L 205,152 L 215,172 L 200,192 L 175,195 L 150,177 L 165,162 Z"/>
        <text class="borough-label" x="180" y="175">Westminster</text>
      </svg>
    `;
    
    container.innerHTML = svg;
    
    // Add click handlers to borough areas
    container.querySelectorAll('.borough-area').forEach(area => {
      const boroughName = area.dataset.borough;
      
      // Set initial state
      if (visitedBoroughs.has(boroughName)) {
        area.classList.add('visited');
      }
      
      // Add click handler
      area.addEventListener('click', () => {
        toggleBorough(boroughName);
      });
    });
  }

  function updateLondonMap() {
    // Update the embedded London map based on visited boroughs
    const container = document.getElementById('london-map');
    const areas = container.querySelectorAll('.borough-area');
    
    areas.forEach(area => {
      const boroughName = area.dataset.borough;
      if (visitedBoroughs.has(boroughName)) {
        area.classList.add('visited');
      } else {
        area.classList.remove('visited');
      }
    });
  }

  // Update everything
  function updateAll() {
    updateHeaderStats();
    renderList('world');
    renderList('continent');
    renderList('us');
    renderList('uk');
    renderList('london');
    updateStatsPage();
    updateWorldMap();
    updateUSMap();
    updateUKMap();
    updateLondonMap();
  }

  // Initialize SVG maps
  // Initialize SVG maps
  function initWorldMap() {
    const container = document.getElementById('world-map');
    container.innerHTML = '<div class="map-placeholder">Loading world map...</div>';
    
    // Load world map SVG from a simplified inline approach
    // Using a simplified world map with major countries
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then(r => r.json())
      .then(geojson => {
        renderGeoJSONMap(container, geojson, 'world');
      })
      .catch(() => {
        // Enhanced fallback with simple embedded world map
        container.innerHTML = `
          <div class="map-fallback">
            <div class="map-placeholder-title">🌍 Interactive World Map</div>
            <div class="map-placeholder-text">
              Map requires internet connection. Use the search and filters below to explore countries, 
              or check the <strong>Stats</strong> tab for a detailed breakdown by continent.
            </div>
            <div class="map-placeholder-stats">
              <div class="fallback-stat">
                <span class="fallback-stat-number">${ALL_COUNTRIES.length}</span>
                <span class="fallback-stat-label">Total Countries & Territories</span>
              </div>
              <div class="fallback-stat">
                <span class="fallback-stat-number">7</span>
                <span class="fallback-stat-label">Continents to Explore</span>
              </div>
            </div>
          </div>
        `;
      });
  }

  function initUSMap() {
    const container = document.getElementById('us-map');
    container.innerHTML = '<div class="map-placeholder">Loading US map...</div>';
    
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(r => r.json())
      .then(geojson => {
        renderUSGeoJSON(container, geojson);
      })
      .catch(() => {
        container.innerHTML = `
          <div class="map-fallback">
            <div class="map-placeholder-title">🇺🇸 US States Map</div>
            <div class="map-placeholder-text">
              Map requires internet connection. Use the search and filters below to track your US state visits.
            </div>
            <div class="map-placeholder-stats">
              <div class="fallback-stat">
                <span class="fallback-stat-number">50</span>
                <span class="fallback-stat-label">US States</span>
              </div>
              <div class="fallback-stat">
                <span class="fallback-stat-number">${visitedStates.size}</span>
                <span class="fallback-stat-label">States Visited</span>
              </div>
            </div>
          </div>
        `;
      });
  }

  function initUKMap() {
    const container = document.getElementById('uk-map');
    container.innerHTML = '<div class="map-placeholder">Loading UK map...</div>';

    fetch('https://raw.githubusercontent.com/evansd/uk-ceremonial-counties/master/uk-ceremonial-counties.geojson')
      .then(r => r.json())
      .then(geojson => {
        renderUKGeoJSON(container, geojson);
      })
      .catch(() => {
        container.innerHTML = `
          <div class="map-fallback">
            <div class="map-placeholder-title">🇬🇧 UK Counties Map</div>
            <div class="map-placeholder-text">
              Map requires internet connection. Use the search and filters below to track your UK county visits.
            </div>
            <div class="map-placeholder-stats">
              <div class="fallback-stat">
                <span class="fallback-stat-number">${UK_COUNTIES.length}</span>
                <span class="fallback-stat-label">UK Counties</span>
              </div>
              <div class="fallback-stat">
                <span class="fallback-stat-number">${visitedCounties.size}</span>
                <span class="fallback-stat-label">Counties Visited</span>
              </div>
            </div>
          </div>
        `;
      });
  }

  function renderUKGeoJSON(container, geojson) {
    const width = 600;
    const height = 900;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Build a mapping from GeoJSON county names to our UK_COUNTIES names
    const countyNameMap = {};
    UK_COUNTIES.forEach(c => { countyNameMap[c.name.toLowerCase()] = c.name; });

    geojson.features.forEach(feature => {
      const rawName = feature.properties.county || '';
      const matchedName = countyNameMap[rawName.toLowerCase()] || rawName;
      const paths = geoToPath(feature.geometry, width, height, 'uk');
      paths.forEach(d => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('data-name', matchedName);
        if (visitedCounties.has(matchedName)) path.classList.add('visited');

        path.addEventListener('click', () => {
          if (matchedName) toggleCounty(matchedName);
        });

        svg.appendChild(path);
      });
    });

    container.innerHTML = '';
    container.appendChild(svg);
  }

  // Simple GeoJSON to SVG renderer
  function renderGeoJSONMap(container, geojson, type) {
    const width = 900;
    const height = 500;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    geojson.features.forEach(feature => {
      const code = feature.properties.ISO_A2 || feature.properties.iso_a2 || '';
      const paths = geoToPath(feature.geometry, width, height);
      paths.forEach(d => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('data-code', code);
        path.setAttribute('data-name', feature.properties.NAME || feature.properties.name || '');
        if (visitedCountries.has(code)) path.classList.add('visited');
        
        path.addEventListener('click', () => {
          if (code && code !== '-99' && code !== '-1') {
            if (code === 'GB') {
              showUKCountryPicker();
            } else {
              toggleCountry(code);
            }
          }
        });

        // Tooltip
        path.addEventListener('mouseenter', (e) => {
          const name = feature.properties.NAME || feature.properties.name || 'Unknown';
          path.setAttribute('title', name);
        });

        svg.appendChild(path);
      });
    });

    container.innerHTML = '';
    container.appendChild(svg);
  }

  function renderUSGeoJSON(container, geojson) {
    const width = 900;
    const height = 600;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // State name to code mapping
    const stateNameToCode = {};
    US_STATES.forEach(s => { stateNameToCode[s.name] = s.code; });

    geojson.features.forEach(feature => {
      const name = feature.properties.name || feature.properties.NAME || '';
      const code = stateNameToCode[name] || '';
      const paths = geoToPath(feature.geometry, width, height, 'us');
      paths.forEach(d => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('data-code', code);
        path.setAttribute('data-name', name);
        if (visitedStates.has(code)) path.classList.add('visited');
        
        path.addEventListener('click', () => {
          if (code) toggleState(code);
        });

        svg.appendChild(path);
      });
    });

    container.innerHTML = '';
    container.appendChild(svg);
  }

  // Simple Mercator projection for GeoJSON to SVG path
  function geoToPath(geometry, width, height, projection) {
    const paths = [];
    
    function project(lon, lat) {
      if (projection === 'us') {
        // Albers-like for US
        const x = ((lon + 130) / 65) * width;
        const y = ((52 - lat) / 30) * height;
        return [x, y];
      }
      if (projection === 'uk') {
        // Simple projection centred on UK
        const x = ((lon + 8.5) / 14) * width;
        const y = ((59.5 - lat) / 10.5) * height;
        return [x, y];
      }
      // Simple equirectangular
      const x = ((lon + 180) / 360) * width;
      const latRad = lat * Math.PI / 180;
      const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
      const y = (height / 2) - (width * mercN / (2 * Math.PI));
      return [x, Math.max(0, Math.min(height, y))];
    }

    function coordsToPath(coords) {
      if (coords.length === 0) return '';
      let d = '';
      coords.forEach((ring, i) => {
        ring.forEach((point, j) => {
          const [x, y] = project(point[0], point[1]);
          d += (j === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        });
        d += 'Z';
      });
      return d;
    }

    if (geometry.type === 'Polygon') {
      const d = coordsToPath(geometry.coordinates);
      if (d) paths.push(d);
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach(polygon => {
        const d = coordsToPath(polygon);
        if (d) paths.push(d);
      });
    }

    return paths;
  }

  // Toast notification
  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // Initialize
  function init() {
    // Clean up any stale "GB" entry from before UK was split into individual countries
    if (visitedCountries.has('GB')) {
      visitedCountries.delete('GB');
      saveCountries();
    }
    updateLastUpdated();
    updateAll();
    initWorldMap();
    initUSMap();
    initUKMap();
    initLondonMap();
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  init();
})();
