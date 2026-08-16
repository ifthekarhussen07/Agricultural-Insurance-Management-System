import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loading from '../components/Loading'

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * Props:
 *   allowedRoles — optional array of roles (e.g. ['Farmer'] or ['Admin']).
 *                  If omitted, any authenticated user can access.
 */
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth()

  // Wait for auth state to rehydrate from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading message="Checking authentication..." />
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'Admin' ? '/admin-dashboard' : '/farmer-dashboard'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
