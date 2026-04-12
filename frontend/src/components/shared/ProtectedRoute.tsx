import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'photographer' | 'admin'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { token, role, onboardingStep } = useAuthStore()
  const loc = useLocation()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  if (role === 'photographer' && onboardingStep < 6 && !loc.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
