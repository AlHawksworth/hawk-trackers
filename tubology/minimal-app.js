// Minimal Tubology App - Debug Version
console.log('🚇 Loading Tubology minimal app...');

const STORAGE_KEY = 'tubology_visited';
const DATES_STORAGE_KEY = 'tubology_visit_dates';

// State
let visited = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
let visitDates = JSON.parse(localStorage.getItem(DATES_STORAGE_KEY) || '{}');

console.log('📊 Visited stations loaded:', visited.size);

function updateHeaderStats() {
    console.log('📈 Updating header stats...');
    
    if (typeof TUBE_ONLY_STATIONS === 'undefined') {
        console.error('❌ TUBE_ONLY_STATIONS not defined');
        return;
    }
    
    const tubeVisited = TUBE_ONLY_STATIONS.filter(s => visited.has(s)).length;
    const tubeRemaining = TUBE_ONLY_STATIONS.length - tubeVisited;
    const tubePct = TUBE_ONLY_STATIONS.length ? Math.round((tubeVisited / TUBE_ONLY_STATIONS.length) * 100) : 0;

    console.log('📊 Stats:', { tubeVisited, tubeRemaining, tubePct });

    const visitedEl = document.getElementById('stat-visited');
    const remainingEl = document.getElementById('stat-remaining');
    const pctEl = document.getElementById('progress-pct');
    const barEl = document.getElementById('progress-bar');

    if (visitedEl) visitedEl.textContent = tubeVisited + ' Visited';
    if (remainingEl) remainingEl.textContent = tubeRemaining + ' Remaining';
    if (pctEl) pctEl.textContent = tubePct + '%';
    if (barEl) barEl.style.width = tubePct + '%';
    
    console.log('✅ Header stats updated');
}

function renderSimpleStationList() {
    console.log('🏗️ Rendering station list...');
    
    const container = document.getElementById('station-list');
    if (!container) {
        console.error('❌ station-list container not found');
        return;
    }
    
    if (typeof TUBE_ONLY_STATIONS === 'undefined') {
        console.error('❌ TUBE_ONLY_STATIONS not defined');
        return;
    }
    
    console.log('📝 Rendering', TUBE_ONLY_STATIONS.length, 'stations');
    
    // Clear container
    container.innerHTML = '';
    
    // Create a simple list (first 20 stations for testing)
    const stationsToShow = TUBE_ONLY_STATIONS.slice(0, 20);
    
    stationsToShow.forEach(station => {
        const isVisited = visited.has(station);
        const item = document.createElement('div');
        item.className = 'station-item' + (isVisited ? ' visited' : '');
        item.innerHTML = `
            <button class="station-check" onclick="toggleStation('${station}')" style="
                width: 24px; 
                height: 24px; 
                border-radius: 50%; 
                border: 2px solid #ccc; 
                background: ${isVisited ? '#0098D4' : 'transparent'};
                color: white;
                cursor: pointer;
                margin-right: 12px;
            ">
                ${isVisited ? '✓' : ''}
            </button>
            <span style="color: #f0f2f5;">${station}</span>
        `;
        item.style.cssText = 'display: flex; align-items: center; padding: 8px; margin: 4px 0; background: #1a1d2e; border-radius: 8px;';
        container.appendChild(item);
    });
    
    console.log('✅ Station list rendered with', stationsToShow.length, 'stations');
}

function toggleStation(station) {
    console.log('🔄 Toggling station:', station);
    
    if (visited.has(station)) {
        visited.delete(station);
        delete visitDates[station];
    } else {
        visited.add(station);
        visitDates[station] = new Date().toISOString().split('T')[0];
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
    localStorage.setItem(DATES_STORAGE_KEY, JSON.stringify(visitDates));
    
    // Update UI
    updateHeaderStats();
    renderSimpleStationList();
    
    console.log('✅ Station toggled, now have', visited.size, 'visited stations');
}

// Make toggleStation global for onclick
window.toggleStation = toggleStation;

function initApp() {
    console.log('🚀 Initializing Tubology app...');
    
    // Check required data
    if (typeof TUBE_LINES === 'undefined') {
        console.error('❌ TUBE_LINES not loaded');
        return;
    }
    
    if (typeof TUBE_ONLY_STATIONS === 'undefined') {
        console.error('❌ TUBE_ONLY_STATIONS not loaded');
        return;
    }
    
    console.log('📦 Data loaded successfully');
    console.log('🚇 Found', Object.keys(TUBE_LINES).length, 'tube lines');
    console.log('🚉 Found', TUBE_ONLY_STATIONS.length, 'tube stations');
    
    // Update UI
    updateHeaderStats();
    renderSimpleStationList();
    
    console.log('✅ App initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('📝 Minimal Tubology script loaded');