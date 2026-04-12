import { create } from 'zustand'

interface AuthState {
  token: string | null
  role: string | null
  userId: string | null
  fullName: string | null
  onboardingStep: number
  subscriptionActive: boolean
  guestToken: string | null
  guestEventId: string | null
  setAuth: (token: string, role: string, userId: string, fullName: string, onboardingStep: number, subscriptionActive: boolean) => void
  setGuestAuth: (token: string, eventId: string) => void
  logout: () => void
  logoutGuest: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('snapmoment_token'),
  role: localStorage.getItem('snapmoment_role'),
  userId: localStorage.getItem('snapmoment_user_id'),
  fullName: localStorage.getItem('snapmoment_full_name'),
  onboardingStep: parseInt(localStorage.getItem('snapmoment_onboarding_step') || '1', 10),
  subscriptionActive: localStorage.getItem('snapmoment_subscription_active') !== 'false',
  guestToken: localStorage.getItem('snapmoment_guest_token'),
  guestEventId: localStorage.getItem('snapmoment_guest_event_id'),

  setAuth: (token, role, userId, fullName, onboardingStep, subscriptionActive) => {
    localStorage.setItem('snapmoment_token', token)
    localStorage.setItem('snapmoment_role', role)
    localStorage.setItem('snapmoment_user_id', userId)
    localStorage.setItem('snapmoment_full_name', fullName)
    localStorage.setItem('snapmoment_onboarding_step', onboardingStep.toString())
    localStorage.setItem('snapmoment_subscription_active', subscriptionActive.toString())
    set({ token, role, userId, fullName, onboardingStep, subscriptionActive })
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
    localStorage.removeItem('snapmoment_onboarding_step')
    localStorage.removeItem('snapmoment_subscription_active')
    set({ token: null, role: null, userId: null, fullName: null, onboardingStep: 1, subscriptionActive: true })
  },

  logoutGuest: () => {
    localStorage.removeItem('snapmoment_guest_token')
    localStorage.removeItem('snapmoment_guest_event_id')
    set({ guestToken: null, guestEventId: null })
  },
}))
