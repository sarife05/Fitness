const { httpClient, safeRequest } = require('../utils/httpClient');
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const WMO_CONDITIONS = {
  0: ['Clear', 'clear sky'],
  1: ['Clear', 'mainly clear'],
  2: ['Clouds', 'partly cloudy'],
  3: ['Clouds', 'overcast'],
  45: ['Fog', 'fog'],
  48: ['Fog', 'depositing rime fog'],
  51: ['Drizzle', 'light drizzle'],
  53: ['Drizzle', 'moderate drizzle'],
  55: ['Drizzle', 'dense drizzle'],
  56: ['Drizzle', 'light freezing drizzle'],
  57: ['Drizzle', 'dense freezing drizzle'],
  61: ['Rain', 'slight rain'],
  63: ['Rain', 'moderate rain'],
  65: ['Rain', 'heavy rain'],
  66: ['Rain', 'light freezing rain'],
  67: ['Rain', 'heavy freezing rain'],
  71: ['Snow', 'slight snow fall'],
  73: ['Snow', 'moderate snow fall'],
  75: ['Snow', 'heavy snow fall'],
  77: ['Snow', 'snow grains'],
  80: ['Rain', 'slight rain showers'],
  81: ['Rain', 'moderate rain showers'],
  82: ['Rain', 'violent rain showers'],
  85: ['Snow', 'slight snow showers'],
  86: ['Snow', 'heavy snow showers'],
  95: ['Thunderstorm', 'thunderstorm'],
  96: ['Thunderstorm', 'thunderstorm with slight hail'],
  99: ['Thunderstorm', 'thunderstorm with heavy hail']
};

function describeWeatherCode(code) {
  return WMO_CONDITIONS[code] || ['Unknown', 'unknown conditions'];
}

async function getCurrentWeather(lat, lon) {
  const result = await safeRequest(
      () => httpClient.get(WEATHER_URL, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
          wind_speed_unit: 'ms',
          timezone: 'auto'
        }
      }),
      'Weather service (Open-Meteo)'
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const current = result.data.current || {};
  const [condition, description] = describeWeatherCode(current.weather_code);

  const weather = {
    tempC: Math.round(current.temperature_2m),
    feelsLikeC: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windSpeedMs: current.wind_speed_10m,
    condition,
    description,
    icon: null // Open-Meteo doesn't provide icon codes like OpenWeatherMap did
  };

  return { ok: true, weather };
}

function assessOutdoorSuitability(weather) {
  const badConditions = ['Thunderstorm', 'Rain', 'Snow', 'Drizzle'];
  const reasons = [];

  if (badConditions.includes(weather.condition)) {
    reasons.push(`Current conditions (${weather.description}) make outdoor training unsafe.`);
  }
  if (weather.tempC <= 0) {
    reasons.push('Temperature is at or below freezing.');
  }
  if (weather.tempC >= 35) {
    reasons.push('Temperature is dangerously high for sustained outdoor exercise.');
  }
  if (weather.windSpeedMs >= 12) {
    reasons.push('Wind speed is high enough to affect safety and performance.');
  }

  const suitable = reasons.length === 0;
  return {
    suitable,
    summary: suitable
        ? 'Conditions look good for outdoor training.'
        : 'Outdoor training is not recommended right now — consider an indoor session.',
    reasons
  };
}

module.exports = { getCurrentWeather, assessOutdoorSuitability };