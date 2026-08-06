const { geocodeCity } = require('../services/geoService');
const { getCurrentWeather, assessOutdoorSuitability } = require('../services/weatherService');
const { findNearbyFacilities } = require('../services/facilitiesService');

async function resolveLocation(city) {
  if (!city || !city.trim()) {
    return { ok: false, status: 400, error: 'Please provide a "city" query parameter, e.g. ?city=Astana.' };
  }
  const geo = await geocodeCity(city.trim());
  if (!geo.ok) {
    return { ok: false, status: 502, error: geo.error };
  }
  return { ok: true, location: geo.location };
}

async function getWeather(req, res) {
  const resolved = await resolveLocation(req.query.city);
  if (!resolved.ok) {
    return res.status(resolved.status).json({ ok: false, error: resolved.error });
  }

  const { lat, lon, name, country } = resolved.location;
  const weatherResult = await getCurrentWeather(lat, lon);
  if (!weatherResult.ok) {
    return res.status(502).json({ ok: false, error: weatherResult.error });
  }

  return res.json({
    ok: true,
    location: { name, country, lat, lon },
    weather: weatherResult.weather
  });
}

/** GET /api/facilities?city=... -> normalized nearby sports facilities for one city */
async function getFacilities(req, res) {
  const resolved = await resolveLocation(req.query.city);
  if (!resolved.ok) {
    return res.status(resolved.status).json({ ok: false, error: resolved.error });
  }

  const { lat, lon, name, country } = resolved.location;
  const facilitiesResult = await findNearbyFacilities(lat, lon);
  if (!facilitiesResult.ok) {
    return res.status(502).json({ ok: false, error: facilitiesResult.error });
  }

  return res.json({
    ok: true,
    location: { name, country, lat, lon },
    count: facilitiesResult.facilities.length,
    facilities: facilitiesResult.facilities
  });
}

async function getOutdoorTraining(req, res) {
  const resolved = await resolveLocation(req.query.city);
  if (!resolved.ok) {
    return res.status(resolved.status).json({ ok: false, error: resolved.error });
  }
  const { lat, lon, name, country } = resolved.location;

  const [weatherResult, facilitiesResult] = await Promise.all([
    getCurrentWeather(lat, lon),
    findNearbyFacilities(lat, lon)
  ]);

  if (!weatherResult.ok) {
    return res.status(502).json({ ok: false, error: weatherResult.error });
  }

  const recommendation = assessOutdoorSuitability(weatherResult.weather);

  const facilities = facilitiesResult.ok ? facilitiesResult.facilities : [];
  const facilitiesWarning = facilitiesResult.ok ? null : facilitiesResult.error;

  return res.json({
    ok: true,
    location: { name, country, lat, lon },
    weather: weatherResult.weather,
    recommendation,
    facilities,
    facilitiesWarning
  });
}

module.exports = { getWeather, getFacilities, getOutdoorTraining };
