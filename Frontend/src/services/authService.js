import apiClient from './apiClient'

// POST /api/auth/register
export const register = (userData) => {
  return apiClient.post('/auth/register', userData)
}

// POST /api/auth/login
export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials)
}
