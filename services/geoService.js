const { httpClient, safeRequest } = require('../utils/httpClient');
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

async function geocodeCity(city) {
  const result = await safeRequest(
      () => httpClient.get(GEO_URL, {
        params: { name: city, count: 1, language: 'en', format: 'json' }
      }),
      'Geocoding service (Open-Meteo)'
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const match = (result.data.results || [])[0];
  if (!match) {
    return {
      ok: false,
      error: `No location found for "${city}". Try a different spelling or add a country, e.g. "Almaty, Kazakhstan".`
    };
  }

  return {
    ok: true,
    location: {
      name: match.name,
      country: match.country || match.country_code || null,
      state: match.admin1 || null,
      lat: match.latitude,
      lon: match.longitude
    }
  };
}

module.exports = { geocodeCity };