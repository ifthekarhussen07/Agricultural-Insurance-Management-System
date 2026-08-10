const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');

// GET /api/weather?city={city}
router.get('/', getWeather);

module.exports = router;
