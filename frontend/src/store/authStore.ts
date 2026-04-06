import { create } from 'zustand'

interface AuthState {
  token: string | null
  role: string | null
  userId: string | null
  fullName: string | null
  guestToken: string | null
  guestEventId: string | null
  setAuth: (token: string, role: string, userId: string, fullName: string) => void
  setGuestAuth: (token: string, eventId: string) => void
  logout: () => void
  logoutGuest: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('snapmoment_token'),
  role: localStorage.getItem('snapmoment_role'),
  userId: localStorage.getItem('snapmoment_user_id'),
  fullName: localStorage.getItem('snapmoment_full_name'),
  guestToken: localStorage.getItem('snapmoment_guest_token'),
  guestEventId: localStorage.getItem('snapmoment_guest_event_id'),

  setAuth: (token, role, userId, fullName) => {
    localStorage.setItem('snapmoment_token', token)
    localStorage.setItem('snapmoment_role', role)
    localStorage.setItem('snapmoment_user_id', userId)
    localStorage.setItem('snapmoment_full_name', fullName)
    set({ token, role, userId, fullName })
  },

  setGuestAuth: (token, eventId) => {
    localStorage.setItem('snapmoment_guest_token', token)
    localStorage.setItem('snapmoment_guest_event_id', eventId)
    set({ guestToken: token, guestEventId: eventId })
  },

  logout: () => {
    localStorage.removeItem('snapmoment_token')
    localStorage.removeItem('snapmoment_role')
    localStorage.removeItem('snapmoment_user_id')
    localStorage.removeItem('snapmoment_full_name')
    set({ token: null, role: null, userId: null, fullName: null })
  },

  logoutGuest: () => {
    localStorage.removeItem('snapmoment_guest_token')
    localStorage.removeItem('snapmoment_guest_event_id')
    set({ guestToken: null, guestEventId: null })
  },
}))
