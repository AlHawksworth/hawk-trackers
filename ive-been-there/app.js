// I've Been There - App Logic
(function() {
  'use strict';

  // Storage keys
  const STORAGE_KEYS = {
    countries: 'ibt-countries',
    states: 'ibt-us-states',
    counties: 'ibt-uk-counties'
  };

  // State
  let visitedCountries = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.countries) || '[]'));
  let visitedStates = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.states) || '[]'));
  let visitedCounties = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.counties) || '[]'));

  // Save helpers
  function saveCountries() {
    localStorage.setItem(STORAGE_KEYS.countries, JSON.stringify([...visitedCountries]));
  }
  function saveStates() {
    localStorage.setItem(STORAGE_KEYS.states, JSON.stringify([...visitedStates]));
  }
  function saveCounties() {
    localStorage.setItem(STORAGE_KEYS.counties, JSON.stringify([...visitedCounties]));
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
    const totalCountries = ALL_COUNTRIES.length;

    document.getElementById('stats-countries').textContent = countriesVisited;
    document.getElementById('stats-countries-pct').textContent = `${Math.round((countriesVisited / totalCountries) * 100)}% of ${totalCountries}`;
    document.getElementById('stats-states').textContent = statesVisited;
    document.getElementById('stats-states-pct').textContent = `${Math.round((statesVisited / 50) * 100)}% of 50`;
    document.getElementById('stats-counties').textContent = countiesVisited;
    document.getElementById('stats-counties-pct').textContent = `${Math.round((countiesVisited / UK_COUNTIES.length) * 100)}% of ${UK_COUNTIES.length}`;

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
      if (visitedCountries.has(path.dataset.code)) {
        path.classList.add('visited');
      } else {
        path.classList.remove('visited');
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

  // Update everything
  function updateAll() {
    updateHeaderStats();
    renderList('world');
    renderList('continent');
    renderList('us');
    renderList('uk');
    updateStatsPage();
    updateWorldMap();
    updateUSMap();
    updateUKMap();
  }

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
        // Fallback: render without map
        container.innerHTML = '<div class="map-placeholder">Map unavailable offline. Use the list below to track visits.</div>';
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
        container.innerHTML = '<div class="map-placeholder">Map unavailable offline. Use the list below to track visits.</div>';
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
        container.innerHTML = '<div class="map-placeholder">Map unavailable offline. Use the list below to track visits.</div>';
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
            toggleCountry(code);
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
    updateAll();
    initWorldMap();
    initUSMap();
    initUKMap();
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  init();
})();
