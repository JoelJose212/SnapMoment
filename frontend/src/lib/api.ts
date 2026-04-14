/// <reference types="vite/client" />
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach photographer/admin token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snapmoment_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401: clears stale/expired tokens and redirects to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth state from localStorage
      localStorage.removeItem('snapmoment_token')
      localStorage.removeItem('snapmoment_role')
      localStorage.removeItem('snapmoment_user_id')
      localStorage.removeItem('snapmoment_full_name')
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const guestApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

guestApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('snapmoment_guest_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth endpoints
export const authApi = {
  signup: (data: any) => api.post('/api/auth/signup', data),
  login: (data: any) => api.post('/api/auth/login', data),
  adminLogin: (data: any) => api.post('/api/auth/admin/login', data),
  me: () => api.get('/api/auth/me'),
}

// Onboarding endpoints
export const onboardingApi = {
  step2: (data: any) => api.post('/api/onboarding/step2', data),
  step3: (data: any) => api.post('/api/onboarding/step3', data),
  step4: () => api.post('/api/onboarding/step4'),
  createOrder: () => api.post('/api/onboarding/create-order'),
  verifyPayment: (data: any) => api.post('/api/onboarding/verify-payment', data),
  uploadLogo: (formData: FormData) => api.post('/api/onboarding/studio-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Event endpoints
export const eventsApi = {
  list: () => api.get('/api/events'),
  create: (data: any) => api.post('/api/events', data),
  get: (id: string) => api.get(`/api/events/${id}`),
  update: (id: string, data: any) => api.patch(`/api/events/${id}`, data),
  delete: (id: string) => api.delete(`/api/events/${id}`),
  getPublic: (token: string) => api.get(`/api/events/public/${token}`),
}

// Photo endpoints
export const photosApi = {
  upload: (eventId: string, formData: FormData, onProgress?: (p: number) => void) =>
    api.post(`/api/events/${eventId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / (e.total || 1))),
    }),
  list: (eventId: string) => api.get(`/api/events/${eventId}/photos`),
  delete: (eventId: string, photoId: string) => api.delete(`/api/events/${eventId}/photos/${photoId}`),
  deleteAll: (eventId: string) => api.delete(`/api/events/${eventId}/photos`),
  process: (eventId: string) => api.post(`/api/events/${eventId}/process`),
  processStatus: (eventId: string) => api.get(`/api/events/${eventId}/process/status`),
}

// Guest endpoints
export const guestApiEndpoints = {
  sendOtp: (data: any) => api.post('/api/guest/otp/send', data),
  verifyOtp: (data: any) => api.post('/api/guest/otp/verify', data),
  uploadSelfie: (formData: FormData) =>
    guestApi.post('/api/guest/selfie', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  gallery: () => guestApi.get('/api/guest/gallery'),
  report: (photoId: string) => guestApi.post(`/api/guest/gallery/${photoId}/report`),
  downloadAll: () => guestApi.get('/api/guest/gallery/download-all', { responseType: 'blob' }),
}

// Admin endpoints
export const adminApi = {
  photographers: (params?: any) => api.get('/api/admin/photographers', { params }),
  updatePhotographer: (id: string, data: any) => api.patch(`/api/admin/photographers/${id}`, data),
  deletePhotographer: (id: string) => api.delete(`/api/admin/photographers/${id}`),
  suspendPhotographer: (id: string) => api.post(`/api/admin/photographers/${id}/suspend`),
  events: (params?: any) => api.get('/api/admin/events', { params }),
  deleteEvent: (id: string) => api.delete(`/api/admin/events/${id}`),
  stats: () => api.get('/api/admin/stats'),
  invoices: () => api.get('/api/admin/invoices'),
  messages: () => api.get('/api/admin/messages'),
  resolveMessage: (id: string) => api.patch(`/api/admin/messages/${id}/resolve`),
  deleteMessage: (id: string) => api.delete(`/api/admin/messages/${id}`),
}

// Analytics & contact
export const analyticsApi = {
  photographer: () => api.get('/api/analytics/photographer'),
}

export const contactApi = {
  submit: (data: any) => api.post('/api/contact', data),
}
