import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LayoutDashboard, LogOut, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import ErrorBoundary from '../../components/ErrorBoundary'
import { logout } from '../../api/authApi'
import { clearUser, selectCurrentUser } from '../../redux/slices/authSlice'
import { ROUTES } from '../../constants/routes'
import { ADMIN_SECTIONS } from '../../constants/adminSections'

const SIDEBAR_COLLAPSED_KEY = 'vtpc_admin_sidebar_collapsed'

function readPersistedCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

function NavItem({ to, icon: Icon, label, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          collapsed ? 'md:justify-center md:px-2' : '',
          isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute top-1/2 left-0 h-5 -translate-y-1/2 rounded-r-full bg-brand-primary transition-all ${
              isActive ? 'w-1' : 'w-0'
            }`}
          />
          <Icon size={18} strokeWidth={1.75} className="shrink-0" />
          <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(readPersistedCollapsed)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  function toggleCollapsed() {
    const next = !isCollapsed
    setIsCollapsed(next)
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
    } catch {
      // localStorage unavailable (private browsing, etc.) — the toggle
      // still works for this session via React state.
    }
  }

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

  function closeMobileMenu() {
    setIsMobileOpen(false)
  }

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="font-admin min-h-screen bg-brand-page md:flex">
      <header className="flex items-center justify-between bg-brand-navy px-4 py-3 text-white md:hidden">
        <span className="text-lg font-bold tracking-tight">VTPC Admin</span>
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-expanded={isMobileOpen}
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          className="p-2 text-white"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <aside
        className={`${isMobileOpen ? 'flex' : 'hidden'} w-full shrink-0 flex-col bg-brand-navy transition-[width] duration-200 md:flex ${
          isCollapsed ? 'md:w-[72px]' : 'md:w-64'
        }`}
      >
        <div
          className={`hidden items-center border-b border-white/10 px-4 py-5 md:flex ${
            isCollapsed ? 'md:justify-center md:px-0' : 'justify-between'
          }`}
        >
          <span className={`text-lg font-bold tracking-tight text-white ${isCollapsed ? 'md:hidden' : ''}`}>
            VTPC Admin
          </span>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-md p-1.5 text-white/60 hover:bg-white/5 hover:text-white"
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <NavItem
            to={ROUTES.ADMIN_DASHBOARD}
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={isCollapsed}
            onClick={closeMobileMenu}
          />
          {ADMIN_SECTIONS.map((section) => (
            <NavItem
              key={section.key}
              to={section.path}
              icon={section.icon}
              label={section.title}
              collapsed={isCollapsed}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className={`flex items-center gap-3 rounded-lg p-2 ${isCollapsed ? 'md:justify-center' : ''}`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">
              {initials}
            </span>
            {currentUser && (
              <div className={`min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
                <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
                <p className="truncate text-xs text-white/50 capitalize">{currentUser.role}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? 'Log out' : undefined}
            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white ${
              isCollapsed ? 'md:justify-center md:px-2' : ''
            }`}
          >
            <LogOut size={18} strokeWidth={1.75} className="shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Log out</span>
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
