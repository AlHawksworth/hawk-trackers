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
    
    // Create a geographically accurate London boroughs map
    const svg = `
      <svg viewBox="0 0 500 360" xmlns="http://www.w3.org/2000/svg" class="london-map-svg">
        <style>
          .borough-area { 
            fill: #e5e5e5; 
            stroke: #888; 
            stroke-width: 1; 
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .borough-area:hover { 
            fill: #d0d0d0; 
            stroke-width: 2;
          }
          .borough-area.visited { 
            fill: #4CAF50; 
            stroke: #2E7D32;
          }
          .borough-area.visited:hover { 
            fill: #66BB6A; 
          }
          .borough-label { 
            font-size: 7px; 
            fill: #333; 
            text-anchor: middle;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 500;
          }
          .river-thames {
            fill: none;
            stroke: #4A90E2;
            stroke-width: 3;
            opacity: 0.6;
          }
        </style>
        
        <!-- Thames River (simplified curve through central London) -->
        <path class="river-thames" d="M 80,200 Q 150,190 200,200 Q 250,210 300,195 Q 350,180 400,190"/>
        
        <!-- OUTER LONDON BOROUGHS (arranged geographically) -->
        
        <!-- North -->
        <polygon class="borough-area" data-borough="Enfield" 
                 points="270,20 320,15 330,45 310,70 280,75 250,60 260,35"/>
        <text class="borough-label" x="290" y="50">Enfield</text>
        
        <polygon class="borough-area" data-borough="Barnet" 
                 points="200,30 260,25 250,60 220,75 180,70 170,45"/>
        <text class="borough-label" x="215" y="55">Barnet</text>
        
        <polygon class="borough-area" data-borough="Harrow" 
                 points="120,60 170,55 180,75 160,90 130,85 110,75"/>
        <text class="borough-label" x="145" y="75">Harrow</text>
        
        <polygon class="borough-area" data-borough="Hillingdon" 
                 points="30,80 110,75 120,105 90,130 60,125 40,110"/>
        <text class="borough-label" x="75" y="105">Hillingdon</text>
        
        <!-- North East -->
        <polygon class="borough-area" data-borough="Waltham Forest" 
                 points="310,70 360,65 370,90 350,110 320,105 300,85"/>
        <text class="borough-label" x="335" y="88">Waltham Forest</text>
        
        <polygon class="borough-area" data-borough="Redbridge" 
                 points="360,65 410,60 420,85 400,105 370,100 350,80"/>
        <text class="borough-label" x="385" y="83">Redbridge</text>
        
        <polygon class="borough-area" data-borough="Havering" 
                 points="410,60 470,55 480,90 460,120 430,115 400,95"/>
        <text class="borough-label" x="440" y="85">Havering</text>
        
        <!-- East -->
        <polygon class="borough-area" data-borough="Barking and Dagenham" 
                 points="400,120 460,115 470,140 450,160 420,155 380,145"/>
        <text class="borough-label" x="425" y="140">Barking & Dag.</text>
        
        <!-- South East -->
        <polygon class="borough-area" data-borough="Bexley" 
                 points="380,200 430,195 440,220 420,240 390,235 370,215"/>
        <text class="borough-label" x="405" y="218">Bexley</text>
        
        <polygon class="borough-area" data-borough="Bromley" 
                 points="320,250 390,245 400,280 370,310 340,305 300,285"/>
        <text class="borough-label" x="350" y="278">Bromley</text>
        
        <!-- South -->
        <polygon class="borough-area" data-borough="Croydon" 
                 points="250,280 320,275 330,305 300,330 270,325 240,305"/>
        <text class="borough-label" x="285" y="305">Croydon</text>
        
        <polygon class="borough-area" data-borough="Sutton" 
                 points="180,300 250,295 260,320 230,340 200,335 170,320"/>
        <text class="borough-label" x="215" y="318">Sutton</text>
        
        <!-- South West -->
        <polygon class="borough-area" data-borough="Kingston upon Thames" 
                 points="140,280 200,275 210,300 180,320 150,315 120,295"/>
        <text class="borough-label" x="165" y="298">Kingston</text>
        
        <polygon class="borough-area" data-borough="Richmond upon Thames" 
                 points="90,240 150,235 160,260 130,280 100,275 80,255"/>
        <text class="borough-label" x="120" y="258">Richmond</text>
        
        <polygon class="borough-area" data-borough="Hounslow" 
                 points="60,180 120,175 130,200 100,225 70,220 50,200"/>
        <text class="borough-label" x="90" y="200">Hounslow</text>
        
        <!-- West -->
        <polygon class="borough-area" data-borough="Ealing" 
                 points="90,130 150,125 160,155 130,175 100,170 80,150"/>
        <text class="borough-label" x="120" y="150">Ealing</text>
        
        <!-- INNER LONDON BOROUGHS -->
        
        <!-- Central North -->
        <polygon class="borough-area" data-borough="Brent" 
                 points="160,90 200,85 210,115 180,130 150,125 140,105"/>
        <text class="borough-label" x="175" y="110">Brent</text>
        
        <polygon class="borough-area" data-borough="Camden" 
                 points="200,115 240,110 250,140 220,155 190,150 180,130"/>
        <text class="borough-label" x="215" y="135">Camden</text>
        
        <polygon class="borough-area" data-borough="Haringey" 
                 points="240,85 280,80 290,110 260,125 230,120 220,100"/>
        <text class="borough-label" x="255" y="105">Haringey</text>
        
        <polygon class="borough-area" data-borough="Islington" 
                 points="240,110 280,105 290,135 260,150 230,145 220,125"/>
        <text class="borough-label" x="255" y="130">Islington</text>
        
        <polygon class="borough-area" data-borough="Hackney" 
                 points="280,105 320,100 330,130 300,145 270,140 260,120"/>
        <text class="borough-label" x="295" y="123">Hackney</text>
        
        <!-- Central East -->
        <polygon class="borough-area" data-borough="Newham" 
                 points="320,145 370,140 380,170 350,185 320,180 310,160"/>
        <text class="borough-label" x="345" y="163">Newham</text>
        
        <polygon class="borough-area" data-borough="Tower Hamlets" 
                 points="280,165 330,160 340,185 310,200 280,195 270,180"/>
        <text class="borough-label" x="305" y="180">Tower Hamlets</text>
        
        <!-- Central -->
        <polygon class="borough-area" data-borough="Westminster" 
                 points="180,155 220,150 230,180 200,195 170,190 160,170"/>
        <text class="borough-label" x="195" y="173">Westminster</text>
        
        <polygon class="borough-area" data-borough="Kensington and Chelsea" 
                 points="140,170 180,165 190,190 160,205 130,200 120,185"/>
        <text class="borough-label" x="155" y="183">K&C</text>
        
        <!-- Central South -->
        <polygon class="borough-area" data-borough="Lambeth" 
                 points="200,195 240,190 250,220 220,235 190,230 180,210"/>
        <text class="borough-label" x="215" y="213">Lambeth</text>
        
        <polygon class="borough-area" data-borough="Southwark" 
                 points="240,190 280,185 290,215 260,230 230,225 220,205"/>
        <text class="borough-label" x="255" y="208">Southwark</text>
        
        <!-- South Central -->
        <polygon class="borough-area" data-borough="Wandsworth" 
                 points="150,210 200,205 210,235 180,250 150,245 140,225"/>
        <text class="borough-label" x="175" y="228">Wandsworth</text>
        
        <polygon class="borough-area" data-borough="Merton" 
                 points="180,250 220,245 230,275 200,290 170,285 160,265"/>
        <text class="borough-label" x="195" y="268">Merton</text>
        
        <polygon class="borough-area" data-borough="Lewisham" 
                 points="280,215 320,210 330,240 300,255 270,250 260,230"/>
        <text class="borough-label" x="295" y="233">Lewisham</text>
        
        <polygon class="borough-area" data-borough="Greenwich" 
                 points="320,210 360,205 370,235 340,250 310,245 300,225"/>
        <text class="borough-label" x="335" y="228">Greenwich</text>
        
        <!-- West Central -->
        <polygon class="borough-area" data-borough="Hammersmith and Fulham" 
                 points="120,190 160,185 170,215 140,230 110,225 100,205"/>
        <text class="borough-label" x="135" y="208">H&F</text>
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
