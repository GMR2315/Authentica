import axios from 'axios'

// Backend API base URL (no trailing slash). Vite exposes env vars prefixed with VITE_
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance (no default Content-Type; set in interceptor per request)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// Request interceptor: auth token + Content-Type by body type
api.interceptors.request.use(
  (config) => {
    // Content-Type: JSON for non-FormData; FormData leaves Content-Type to axios/browser (multipart + boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }
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
      // Handle unauthorized access (admin routes)
      localStorage.removeItem('authToken')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// Product API (backend paths under /api/admin)
export const productAPI = {
  getAll: () => api.get('/api/admin/products'),
  getById: (id) => api.get(`/api/admin/products/${id}`),
  create: (data) => api.post('/api/admin/products', data),
  update: (id, data) => api.put(`/api/admin/products/${id}`, data),
  delete: (id) => api.delete(`/api/admin/products/${id}`)
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