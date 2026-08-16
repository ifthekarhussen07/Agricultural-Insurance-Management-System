import apiClient from './apiClient'

// GET /api/admin/stats (Admin only)
export const getStats = () => {
  return apiClient.get('/admin/stats')
}
