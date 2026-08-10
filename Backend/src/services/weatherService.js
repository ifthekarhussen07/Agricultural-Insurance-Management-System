const axios = require('axios');

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch weather data from OpenWeatherMap and return normalized result.
 * Throws descriptive errors for the controller to handle.
 */
const getWeatherByCity = async (city) => {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    const err = new Error('Weather API key is not configured on the server');
    err.statusCode = 500;
    throw err;
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
      },
      timeout: 10000, // 10-second timeout
    });

    const data = response.data;

    return {
      city: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      alerts: data.alerts || null,
    };
  } catch (error) {
    // Timeout
    if (error.code === 'ECONNABORTED') {
      const err = new Error('Weather service request timed out');
      err.statusCode = 504;
      throw err;
    }

    // OpenWeatherMap error responses
    if (error.response) {
      const { status, data } = error.response;

      if (status === 404) {
        const err = new Error(`City "${city}" not found`);
        err.statusCode = 404;
        throw err;
      }

      if (status === 401) {
        const err = new Error('Invalid weather API key');
        err.statusCode = 500;
        throw err;
      }

      if (status === 429) {
        const err = new Error('Weather API rate limit exceeded. Try again later.');
        err.statusCode = 429;
        throw err;
      }

      const err = new Error(data.message || 'External weather API error');
      err.statusCode = status;
      throw err;
    }

    // Network / unknown errors
    const err = new Error('Unable to reach weather service');
    err.statusCode = 502;
    throw err;
  }
};

module.exports = { getWeatherByCity };
