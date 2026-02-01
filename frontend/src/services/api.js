import axios from 'axios'

// Mock API base URL - replace with actual API endpoint
const API_BASE_URL = 'https://api.authentica.com'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Product API
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}

// Asset API
export const assetAPI = {
  upload: (formData) => api.post('/assets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/assets/${id}`)
}

// Passport API
export const passportAPI = {
  mint: (productId) => api.post('/passports/mint', { productId }),
  getByTagId: (tagId) => api.get(`/passports/${tagId}`),
  verify: (tagId) => api.post('/verify', { tagId })
}

// Verification API
export const verificationAPI = {
  verify: (tagId, method) => api.post('/verify', { tagId, method }),
  getHistory: (tagId) => api.get(`/verify/${tagId}/history`)
}

// Provenance API
export const provenanceAPI = {
  getTimeline: (productId) => api.get(`/provenance/${productId}/timeline`),
  addEvent: (productId, event) => api.post(`/provenance/${productId}/events`, event)
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentProducts: () => api.get('/dashboard/recent-products')
}

export default api