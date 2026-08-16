import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loading from '../components/Loading'

/**
 * GuestRoute — wraps routes that should only be seen by unauthenticated users
 * (login, register). Authenticated users are redirected to their dashboard.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading message="Loading..." />
      </div>
    )
  }

  if (isAuthenticated) {
    const dest = user.role === 'Admin' ? '/admin-dashboard' : '/farmer-dashboard'
    return <Navigate to={dest} replace />
  }

  return children
}

export default GuestRoute
