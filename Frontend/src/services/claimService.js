import apiClient from './apiClient'

// POST /api/claims (Farmer only)
export const createClaim = (claimData) => {
  return apiClient.post('/claims', claimData)
}

// GET /api/claims (Farmer sees own, Admin sees all)
export const getClaims = () => {
  return apiClient.get('/claims')
}

// PUT /api/claims/:id/status (Admin only — approve/reject)
export const updateClaimStatus = (id, statusData) => {
  return apiClient.put(`/claims/${id}/status`, statusData)
}
