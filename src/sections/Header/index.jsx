import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import LeaderStrip from './LeaderStrip'
import NavBar from './NavBar'
import MobileNavPanel from './MobileNavPanel'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-2">
        Skip to content
      </a>

      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <Link to={ROUTES.HOME} className="flex shrink-0 items-center gap-3">
          <img src="/assets/GOK%20LOGO%201.png" alt="Government of Karnataka" className="h-12 w-12" />
          <img src="/assets/Logo.png" alt="VTPC Karnataka" className="h-10 sm:h-12" />
        </Link>

        <div className="flex justify-end sm:justify-normal">
          <LeaderStrip />
        </div>
      </div>

      <NavBar isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      {isMobileMenuOpen && <MobileNavPanel onNavigate={() => setIsMobileMenuOpen(false)} />}
    </header>
  )
}
