const { getWeatherByCity } = require('../services/weatherService');

/**
 * GET /api/weather?city={city}
 */
const getWeather = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "city" is required',
      });
    }

    const data = await getWeatherByCity(city.trim());

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error('Weather controller error:', error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getWeather };
