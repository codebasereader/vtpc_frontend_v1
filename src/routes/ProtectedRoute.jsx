import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { selectIsAuthenticated, selectAuthStatus, selectCurrentUser } from '../redux/slices/authSlice'
import { ROUTES } from '../constants/routes'
import { sectionForPath } from '../constants/adminSections'
import { canAccessSection } from '../lib/access'
import NoAccess from '../pages/admin/NoAccess'

/**
 * Guards an admin page: must be logged in, must have set a real password if an
 * admin issued a temporary one, and must have the page enabled for their role.
 * The server enforces all of this too — this just gives a clear screen.
 */
export default function ProtectedRoute({ children }) {
  const status = useSelector(selectAuthStatus)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const { pathname } = useLocation()

  if (status === 'idle' || status === 'checking') {
    return <p className="p-8 text-center">Loading…</p>
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }

  if (user?.mustChangePassword && pathname !== ROUTES.ADMIN_CHANGE_PASSWORD) {
    return <Navigate to={ROUTES.ADMIN_CHANGE_PASSWORD} replace />
  }

  const section = sectionForPath(pathname)
  if (section && !canAccessSection(user, section)) {
    return <NoAccess title={section.title} />
  }

  return children
}
