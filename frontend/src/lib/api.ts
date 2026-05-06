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
  clientSignup: (data: any) => api.post('/api/auth/client/signup', data),
  login: (data: any) => api.post('/api/auth/login', data),
  adminLogin: (data: any) => api.post('/api/auth/admin/login', data),
  me: () => api.get('/api/auth/me'),
}

export const bookingsApi = {
  states: () => api.get('/api/bookings/locations/states'),
  districts: (state: string) => api.get(`/api/bookings/locations/districts/${state}`),
  searchPhotographers: (params: any) => api.get('/api/bookings/photographers/search', { params }),
  cancelBooking: (id: string) => api.delete(`/api/bookings/photographer/bookings/${id}`),
  getPhotographer: (id: string) => api.get(`/api/bookings/photographers/${id}`),
  getPackages: (id: string) => api.get(`/api/bookings/photographers/${id}/packages`),
  createEvent: (data: any) => api.post('/api/bookings/events', data),
  myEvents: () => api.get('/api/bookings/events'),
  getEvent: (id: string) => api.get(`/api/bookings/events/${id}`),
  book: (eventId: string, data: any) => api.post(`/api/bookings/events/${eventId}/book`, data),
  updateAvailability: (data: any) => api.put('/api/bookings/photographer/availability', data),
  getPhotographerBookings: () => api.get('/api/bookings/photographer/bookings'),
  getClientDetails: (id: string) => api.get(`/api/bookings/photographer/clients/${id}`),
  respondToBooking: (bookingId: string, action: 'accept' | 'reject') => 
    api.patch(`/api/bookings/photographer/bookings/${bookingId}/respond`, null, { params: { action } }),
  disputeBooking: (id: string) => api.post(`/api/bookings/events/${id}/dispute`),
  adminPending: () => api.get('/api/bookings/admin/pending'),
  adminVerify: (id: string) => api.post(`/api/bookings/admin/verify/${id}`),
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
  downloadInvoice: (id: string) => api.get(`/api/admin/invoices/${id}/download`, { responseType: 'blob' }),
  messages: () => api.get('/api/admin/messages'),
  resolveMessage: (id: string) => api.patch(`/api/admin/messages/${id}/resolve`),
  deleteMessage: (id: string) => api.delete(`/api/admin/messages/${id}`),
}

export const photographerApi = {
  getProfile: () => api.get('/api/photographer/profile'),
  updateProfile: (data: any) => api.patch('/api/photographer/profile', data),
  uploadPortfolio: (formData: FormData) => api.post('/api/photographer/portfolio/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePortfolio: (url: string) => api.delete(`/api/photographer/portfolio?url=${encodeURIComponent(url)}`),
  getSpecializations: () => api.get('/api/photographer/specializations'),
  addSpecialization: (data: any) => api.post('/api/photographer/specializations', data),
  updateSpecialization: (id: string, data: any) => api.put(`/api/photographer/specializations/${id}`, data),
  removeSpecialization: (id: string) => api.delete(`/api/photographer/specializations/${id}`),
}

// Analytics & contact
export const analyticsApi = {
  photographer: () => api.get('/api/analytics/photographer'),
}

export const contactApi = {
  submit: (data: any) => api.post('/api/contact', data),
}

export const chatApi = {
  getConversations: () => api.get('/api/chat/conversations'),
  getHistory: (otherUserId: string) => api.get(`/api/chat/history/${otherUserId}`),
  sendMessage: (data: { receiver_id: string, content: string, booking_id?: string }) => 
    api.post('/api/chat/send', data),
}

export const shortlistApi = {
  get: () => api.get('/api/shortlist'),
  add: (photographerId: string) => api.post(`/api/shortlist/${photographerId}`),
  remove: (photographerId: string) => api.delete(`/api/shortlist/${photographerId}`),
}

export const notificationApi = {
  get: () => api.get('/api/notifications'),
  markRead: (id: string, is_read: boolean) => api.patch(`/api/notifications/${id}`, { is_read }),
  readAll: () => api.post('/api/notifications/read-all'),
  remove: (id: string) => api.delete(`/api/notifications/${id}`),
}

export const clientApi = {
  getProfile: () => api.get('/api/client/profile'),
  updateProfile: (data: any) => api.patch('/api/client/profile', data),
}
