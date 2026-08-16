import apiClient from './apiClient'

// GET /api/weather?city={city}
export const getWeather = (city) => {
  return apiClient.get('/weather', { params: { city } })
}
