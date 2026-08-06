const { httpClient, safeRequest } = require('../utils/httpClient');
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const SEARCH_RADIUS_METERS = 5000;

async function findNearbyFacilities(lat, lon) {
  const query = `
    [out:json][timeout:8];
    (
      node["leisure"="fitness_centre"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["leisure"="sports_centre"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["leisure"="stadium"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["leisure"="pitch"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
      node["leisure"="track"](around:${SEARCH_RADIUS_METERS},${lat},${lon});
    );
    out center 20;
  `;

  const result = await safeRequest(
    () => httpClient.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
    'Nearby facilities service (OpenStreetMap/Overpass)'
  );

  if (!result.ok) {
    return { ok: false, error: result.error, facilities: [] };
  }

  const elements = result.data.elements || [];

  const facilities = elements
    .filter((el) => el.tags && (el.tags.name || el.tags.leisure))
    .slice(0, 20)
    .map((el) => ({
      id: el.id,
      name: el.tags.name || 'Unnamed facility',
      type: el.tags.leisure,
      lat: el.lat,
      lon: el.lon
    }));

  return { ok: true, facilities };
}

module.exports = { findNearbyFacilities };
