import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ErrorBoundary from '../../components/ErrorBoundary'
import { logout } from '../../api/authApi'
import { clearUser, selectCurrentUser } from '../../redux/slices/authSlice'
import { ROUTES } from '../../constants/routes'
import { ADMIN_SECTIONS } from '../../constants/adminSections'

const navLinkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm ${isActive ? 'bg-brand-primary text-white' : 'text-gray-200 hover:bg-brand-navy-dark'}`

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // Clear local state regardless — a failed logout request shouldn't
      // leave the admin stuck unable to sign out.
    }
    dispatch(clearUser())
    navigate(ROUTES.ADMIN_LOGIN)
  }

  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-brand-page md:flex">
      <header className="flex items-center justify-between bg-brand-navy px-4 py-3 text-white md:hidden">
        <span className="font-semibold">VTPC Admin</span>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          className="flex flex-col gap-1.5 p-2"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>
      </header>

      <aside className={`${isSidebarOpen ? 'block' : 'hidden'} w-full bg-brand-navy text-white md:block md:w-64 md:shrink-0`}>
        <div className="hidden px-4 py-4 text-lg font-semibold md:block">VTPC Admin</div>
        <nav className="flex flex-col gap-1 p-3">
          <NavLink to={ROUTES.ADMIN_DASHBOARD} className={navLinkClass} onClick={closeSidebar}>
            Dashboard
          </NavLink>
          {ADMIN_SECTIONS.map((section) => (
            <NavLink key={section.key} to={section.path} className={navLinkClass} onClick={closeSidebar}>
              {section.title}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          {currentUser && <p className="px-3 py-1 text-xs text-white/60">Signed in as {currentUser.name}</p>}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-brand-navy-dark"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
