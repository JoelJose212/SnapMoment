import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'photographer' | 'admin'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { token, role } = useAuthStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
