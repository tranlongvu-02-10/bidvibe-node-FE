import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />

  return <>{children}</>
}