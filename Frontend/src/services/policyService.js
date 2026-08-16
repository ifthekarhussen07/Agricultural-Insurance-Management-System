import apiClient from './apiClient'

// GET /api/policies
export const getPolicies = () => {
  return apiClient.get('/policies')
}

// POST /api/policies (Admin only)
export const createPolicy = (policyData) => {
  return apiClient.post('/policies', policyData)
}

// PUT /api/policies/:id (Admin only)
export const updatePolicy = (id, policyData) => {
  return apiClient.put(`/policies/${id}`, policyData)
}

// DELETE /api/policies/:id (Admin only, soft-delete)
export const deletePolicy = (id) => {
  return apiClient.delete(`/policies/${id}`)
}
