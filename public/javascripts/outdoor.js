document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('outdoor-search-form');
    const input = document.getElementById('city-term');
    const status = document.getElementById('outdoor-status');

    const weatherBlock = document.getElementById('outdoor-weather');
    const locationName = document.getElementById('outdoor-location-name');
    const recommendationSummary = document.getElementById('outdoor-recommendation-summary');
    const recommendationReasons = document.getElementById('outdoor-recommendation-reasons');
    const tempEl = document.getElementById('outdoor-temp');
    const feelsLikeEl = document.getElementById('outdoor-feels-like');
    const conditionEl = document.getElementById('outdoor-condition');
    const humidityEl = document.getElementById('outdoor-humidity');
    const windEl = document.getElementById('outdoor-wind');

    const mapEl = document.getElementById('outdoor-map');
    const facilitiesList = document.getElementById('outdoor-facilities-list');

    if (!form) return;

    let leafletMap = null;
    let markersLayer = null;
    let latestRequestId = 0;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = input.value.trim();
        if (!city) return;
        runSearch(city);
    });
    const initialCity = new URLSearchParams(window.location.search).get('city');
    if (initialCity) {
        input.value = initialCity;
        runSearch(initialCity);
    }

    async function runSearch(city) {
        const requestId = ++latestRequestId;

        status.textContent = 'Checking conditions…';
        weatherBlock.hidden = true;
        mapEl.hidden = true;
        facilitiesList.innerHTML = '';

        try {
            const response = await fetch(`/api/outdoor-training?city=${encodeURIComponent(city)}`);
            const data = await response.json();

            if (requestId !== latestRequestId) return;

            if (!data.ok) {
                status.textContent = data.error || 'Something went wrong.';
                return;
            }

            status.textContent = '';
            renderWeather(data);
            await renderFacilities(data);
        } catch (err) {
            if (requestId !== latestRequestId) return;
            status.textContent = 'Could not reach the server. Please try again.';
        }
    }

    function renderWeather({ location, weather, recommendation }) {
        locationName.textContent = location.country
            ? `${location.name}, ${location.country}`
            : location.name;

        recommendationSummary.textContent = recommendation.summary;

        recommendationReasons.innerHTML = '';
        (recommendation.reasons || []).forEach((reason) => {
            const li = document.createElement('li');
            li.textContent = reason;
            recommendationReasons.appendChild(li);
        });

        tempEl.textContent = `${weather.tempC}°C`;
        feelsLikeEl.textContent = `${weather.feelsLikeC}°C`;
        conditionEl.textContent = weather.description || weather.condition;
        humidityEl.textContent = `${weather.humidity}%`;
        windEl.textContent = `${weather.windSpeedMs} m/s`;

        weatherBlock.hidden = false;
        weatherBlock.classList.toggle('suitable', recommendation.suitable);
        weatherBlock.classList.toggle('unsuitable', !recommendation.suitable);
    }

    async function renderFacilities({ location, facilities, facilitiesWarning }) {
        if (facilitiesWarning) {
            const warning = document.createElement('p');
            warning.className = 'status';
            warning.textContent = facilitiesWarning;
            facilitiesList.appendChild(warning);
        }

        if (!facilities || facilities.length === 0) {
            if (!facilitiesWarning) {
                const empty = document.createElement('p');
                empty.textContent = 'No sports facilities found nearby.';
                facilitiesList.appendChild(empty);
            }
            return;
        }

        facilities.forEach((facility) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
        <h3>${escapeHtml(facility.name)}</h3>
        <p class="brand">${escapeHtml(facility.type || '')}</p>
      `;
            facilitiesList.appendChild(card);
        });

        await showMap(location, facilities);
    }

    async function showMap(location, facilities) {
        try {
            await ensureLeaflet();
        } catch (err) {
            return;
        }

        mapEl.hidden = false;

        if (!leafletMap) {
            leafletMap = window.L.map(mapEl);
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(leafletMap);
            markersLayer = window.L.layerGroup().addTo(leafletMap);
        }

        markersLayer.clearLayers();

        const bounds = [[location.lat, location.lon]];
        window.L.marker([location.lat, location.lon])
            .addTo(markersLayer)
            .bindPopup(`<strong>${escapeHtml(location.name)}</strong><br>Search center`);

        facilities.forEach((facility) => {
            if (facility.lat == null || facility.lon == null) return;
            window.L.marker([facility.lat, facility.lon])
                .addTo(markersLayer)
                .bindPopup(`<strong>${escapeHtml(facility.name)}</strong><br>${escapeHtml(facility.type || '')}`);
            bounds.push([facility.lat, facility.lon]);
        });

        leafletMap.invalidateSize();
        leafletMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }

    function ensureLeaflet() {
        if (window.L) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(css);

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Leaflet from CDN'));
            document.head.appendChild(script);
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }
});