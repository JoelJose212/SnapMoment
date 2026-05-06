import { create } from 'zustand'

interface AuthState {
  token: string | null
  role: string | null
  userId: string | null
  fullName: string | null
  email: string | null
  onboardingStep: number
  subscriptionActive: boolean
  guestToken: string | null
  guestEventId: string | null
  lastActiveChatId: string | null
  setAuth: (token: string, role: string, userId: string, fullName: string, email: string, onboardingStep: number, subscriptionActive: boolean) => void
  setGuestAuth: (token: string, eventId: string) => void
  setLastActiveChatId: (id: string | null) => void
  logout: () => void
  logoutGuest: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('snapmoment_token'),
  role: localStorage.getItem('snapmoment_role'),
  userId: localStorage.getItem('snapmoment_user_id'),
  fullName: localStorage.getItem('snapmoment_full_name'),
  email: localStorage.getItem('snapmoment_email'),
  onboardingStep: (() => {
    const s = localStorage.getItem('snapmoment_onboarding_step')
    if (!s || s === 'true' || s === 'false') return 1
    const parsed = parseInt(s, 10)
    return isNaN(parsed) ? 1 : parsed
  })(),
  subscriptionActive: localStorage.getItem('snapmoment_subscription_active') !== 'false',
  guestToken: localStorage.getItem('snapmoment_guest_token'),
  guestEventId: localStorage.getItem('snapmoment_guest_event_id'),
  lastActiveChatId: localStorage.getItem('snapmoment_last_chat_id'),

  setAuth: (token, role, userId, fullName, email, onboardingStep, subscriptionActive) => {
    localStorage.setItem('snapmoment_token', token)
    localStorage.setItem('snapmoment_role', role)
    localStorage.setItem('snapmoment_user_id', userId)
    localStorage.setItem('snapmoment_full_name', fullName)
    localStorage.setItem('snapmoment_email', email)
    localStorage.setItem('snapmoment_onboarding_step', onboardingStep.toString())
    localStorage.setItem('snapmoment_subscription_active', subscriptionActive.toString())
    set({ token, role, userId, fullName, email, onboardingStep, subscriptionActive })
  },

  setGuestAuth: (token, eventId) => {
    localStorage.setItem('snapmoment_guest_token', token)
    localStorage.setItem('snapmoment_guest_event_id', eventId)
    set({ guestToken: token, guestEventId: eventId })
  },

  setLastActiveChatId: (id) => {
    if (id) {
      localStorage.setItem('snapmoment_last_chat_id', id)
    } else {
      localStorage.removeItem('snapmoment_last_chat_id')
    }
    set({ lastActiveChatId: id })
  },

  logout: () => {
    localStorage.removeItem('snapmoment_token')
    localStorage.removeItem('snapmoment_role')
    localStorage.removeItem('snapmoment_user_id')
    localStorage.removeItem('snapmoment_full_name')
    localStorage.removeItem('snapmoment_email')
    localStorage.removeItem('snapmoment_onboarding_step')
    localStorage.removeItem('snapmoment_subscription_active')
    localStorage.removeItem('snapmoment_last_chat_id')
    set({ token: null, role: null, userId: null, fullName: null, email: null, onboardingStep: 1, subscriptionActive: true, lastActiveChatId: null })
  },

  logoutGuest: () => {
    localStorage.removeItem('snapmoment_guest_token')
    localStorage.removeItem('snapmoment_guest_event_id')
    set({ guestToken: null, guestEventId: null })
  },
}))
