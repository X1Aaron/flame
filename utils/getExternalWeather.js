const Weather = require('../models/Weather');
const axios = require('axios');
const loadConfig = require('./loadConfig');

const getExternalWeather = async (providedLat, providedLong, providedZipCode) => {
  // Use provided coordinates or fall back to config
  let lat = providedLat;
  let long = providedLong;

  if (!lat || !long) {
    const config = await loadConfig();

    // Try to use ZIP code to get coordinates
    if (providedZipCode || config.zipCode) {
      const zipCode = providedZipCode || config.zipCode;
      try {
        // Use zippopotam.us API for ZIP code lookup (free, no key required)
        // This works specifically for US/CA/etc ZIP codes
        const geoRes = await axios.get(
          `https://api.zippopotam.us/us/${zipCode}`
        );

        if (geoRes.data && geoRes.data.places && geoRes.data.places.length > 0) {
          lat = parseFloat(geoRes.data.places[0].latitude);
          long = parseFloat(geoRes.data.places[0].longitude);
        }
      } catch (err) {
        // If US ZIP lookup fails, try Open-Meteo geocoding (works for city names)
        try {
          const geoRes = await axios.get(
            `https://geocoding-api.open-meteo.com/v1/search?name=${zipCode}&count=1&language=en&format=json`
          );

          if (geoRes.data.results && geoRes.data.results.length > 0) {
            lat = geoRes.data.results[0].latitude;
            long = geoRes.data.results[0].longitude;
          }
        } catch (err2) {
          // Fallback to config lat/long if both geocoding attempts fail
          lat = config.lat;
          long = config.long;
        }
      }
    } else {
      lat = config.lat;
      long = config.long;
    }
  }

  // Check if location is available
  if (!lat || !long) {
    throw new Error('Location (latitude/longitude) not configured');
  }

  // Fetch data from Open-Meteo API (free, no API key required)
  try {
    const res = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,is_day,cloud_cover,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`
    );

    const cursor = res.data.current;

    // Map Open-Meteo weather codes to condition text
    const getConditionText = (code) => {
      const conditions = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
        55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        66: 'Light freezing rain', 67: 'Heavy freezing rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
      };
      return conditions[code] || 'Unknown';
    };

    // Save weather data
    const weatherData = await Weather.create({
      externalLastUpdate: cursor.time,
      tempC: Math.round((cursor.temperature_2m - 32) * 5/9 * 10) / 10, // Convert F to C
      tempF: cursor.temperature_2m,
      isDay: cursor.is_day,
      cloud: cursor.cloud_cover,
      conditionText: getConditionText(cursor.weather_code),
      conditionCode: cursor.weather_code,
      humidity: cursor.relative_humidity_2m,
      windK: Math.round(cursor.wind_speed_10m * 1.60934 * 10) / 10, // Convert mph to kph
      windM: cursor.wind_speed_10m,
    });
    return weatherData;
  } catch (err) {
    throw new Error('External API request failed');
  }
};

module.exports = getExternalWeather;
