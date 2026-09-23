import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsAuthenticated, selectAuthStatus } from '../redux/slices/authSlice'
import { ROUTES } from '../constants/routes'

export default function ProtectedRoute({ children }) {
  const status = useSelector(selectAuthStatus)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (status === 'idle' || status === 'checking') {
    return <p className="p-8 text-center">Loading…</p>
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }

  return children
}
