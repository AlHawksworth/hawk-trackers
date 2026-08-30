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
    
    // Create a simple embedded SVG map of London boroughs
    const svg = `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="london-map-svg">
        <style>
          .borough-area { 
            fill: #e0e0e0; 
            stroke: #999; 
            stroke-width: 1; 
            cursor: pointer;
            transition: fill 0.2s;
          }
          .borough-area:hover { fill: #d0d0d0; }
          .borough-area.visited { fill: #4CAF50; }
          .borough-label { 
            font-size: 8px; 
            fill: #333; 
            text-anchor: middle;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          }
        </style>
        
        <!-- Simplified London borough areas -->
        <!-- North London -->
        <rect class="borough-area" data-borough="Barnet" x="150" y="20" width="40" height="25"/>
        <text class="borough-label" x="170" y="35">Barnet</text>
        
        <rect class="borough-area" data-borough="Enfield" x="195" y="15" width="35" height="30"/>
        <text class="borough-label" x="212" y="32">Enfield</text>
        
        <rect class="borough-area" data-borough="Haringey" x="170" y="50" width="35" height="25"/>
        <text class="borough-label" x="187" y="65">Haringey</text>
        
        <!-- North West -->
        <rect class="borough-area" data-borough="Harrow" x="90" y="35" width="35" height="25"/>
        <text class="borough-label" x="107" y="50">Harrow</text>
        
        <rect class="borough-area" data-borough="Hillingdon" x="40" y="45" width="45" height="30"/>
        <text class="borough-label" x="62" y="62">Hillingdon</text>
        
        <rect class="borough-area" data-borough="Ealing" x="85" y="80" width="40" height="25"/>
        <text class="borough-label" x="105" y="95">Ealing</text>
        
        <rect class="borough-area" data-borough="Brent" x="125" y="65" width="35" height="25"/>
        <text class="borough-label" x="142" y="80">Brent</text>
        
        <!-- Central -->
        <rect class="borough-area" data-borough="Camden" x="160" y="80" width="30" height="25"/>
        <text class="borough-label" x="175" y="95">Camden</text>
        
        <rect class="borough-area" data-borough="Westminster" x="140" y="105" width="35" height="25"/>
        <text class="borough-label" x="157" y="120">Westminster</text>
        
        <rect class="borough-area" data-borough="Islington" x="190" y="75" width="30" height="25"/>
        <text class="borough-label" x="205" y="90">Islington</text>
        
        <rect class="borough-area" data-borough="Hackney" x="220" y="70" width="30" height="30"/>
        <text class="borough-label" x="235" y="87">Hackney</text>
        
        <!-- East -->
        <rect class="borough-area" data-borough="Waltham Forest" x="245" y="55" width="40" height="25"/>
        <text class="borough-label" x="265" y="70">Waltham Forest</text>
        
        <rect class="borough-area" data-borough="Redbridge" x="285" y="65" width="35" height="25"/>
        <text class="borough-label" x="302" y="80">Redbridge</text>
        
        <rect class="borough-area" data-borough="Havering" x="320" y="60" width="40" height="30"/>
        <text class="borough-label" x="340" y="77">Havering</text>
        
        <rect class="borough-area" data-borough="Barking and Dagenham" x="290" y="95" width="50" height="25"/>
        <text class="borough-label" x="315" y="110">Barking & Dagenham</text>
        
        <rect class="borough-area" data-borough="Newham" x="250" y="100" width="35" height="25"/>
        <text class="borough-label" x="267" y="115">Newham</text>
        
        <rect class="borough-area" data-borough="Tower Hamlets" x="205" y="105" width="40" height="20"/>
        <text class="borough-label" x="225" y="117">Tower Hamlets</text>
        
        <!-- Central/West -->
        <rect class="borough-area" data-borough="Kensington and Chelsea" x="110" y="115" width="45" height="20"/>
        <text class="borough-label" x="132" y="127">K&C</text>
        
        <rect class="borough-area" data-borough="Hammersmith and Fulham" x="100" y="135" width="50" height="25"/>
        <text class="borough-label" x="125" y="150">H&F</text>
        
        <!-- South West -->
        <rect class="borough-area" data-borough="Hounslow" x="60" y="140" width="35" height="30"/>
        <text class="borough-label" x="77" y="157">Hounslow</text>
        
        <rect class="borough-area" data-borough="Richmond upon Thames" x="85" y="170" width="45" height="25"/>
        <text class="borough-label" x="107" y="185">Richmond</text>
        
        <rect class="borough-area" data-borough="Kingston upon Thames" x="130" y="190" width="45" height="25"/>
        <text class="borough-label" x="152" y="205">Kingston</text>
        
        <rect class="borough-area" data-borough="Merton" x="145" y="165" width="35" height="25"/>
        <text class="borough-label" x="162" y="180">Merton</text>
        
        <rect class="borough-area" data-borough="Wandsworth" x="130" y="140" width="40" height="25"/>
        <text class="borough-label" x="150" y="155">Wandsworth</text>
        
        <!-- South -->
        <rect class="borough-area" data-borough="Lambeth" x="170" y="130" width="30" height="25"/>
        <text class="borough-label" x="185" y="145">Lambeth</text>
        
        <rect class="borough-area" data-borough="Southwark" x="200" y="125" width="35" height="25"/>
        <text class="borough-label" x="217" y="140">Southwark</text>
        
        <rect class="borough-area" data-borough="Lewisham" x="220" y="145" width="35" height="25"/>
        <text class="borough-label" x="237" y="160">Lewisham</text>
        
        <!-- South East -->
        <rect class="borough-area" data-borough="Greenwich" x="250" y="140" width="35" height="25"/>
        <text class="borough-label" x="267" y="155">Greenwich</text>
        
        <rect class="borough-area" data-borough="Bexley" x="285" y="155" width="35" height="25"/>
        <text class="borough-label" x="302" y="170">Bexley</text>
        
        <!-- South -->
        <rect class="borough-area" data-borough="Bromley" x="230" y="180" width="40" height="30"/>
        <text class="borough-label" x="250" y="197">Bromley</text>
        
        <rect class="borough-area" data-borough="Croydon" x="180" y="185" width="40" height="25"/>
        <text class="borough-label" x="200" y="200">Croydon</text>
        
        <rect class="borough-area" data-borough="Sutton" x="150" y="205" width="30" height="20"/>
        <text class="borough-label" x="165" y="217">Sutton</text>
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
