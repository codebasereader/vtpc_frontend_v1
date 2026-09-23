import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../../constants/routes'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { common } from '../../language/common'
import LeaderStrip from './LeaderStrip'
import NavBar from './NavBar'
import MobileNavPanel from './MobileNavPanel'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const language = useSelector(selectLanguage)

  return (
    <header className="bg-white shadow-sm">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-2">
        {common.header.skipToContent[language]}
      </a>

      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8 sm:py-5">
        <Link to={ROUTES.HOME} className="flex shrink-0 items-center gap-3 sm:gap-4">
          <img src="/assets/GOK%20LOGO%201.png" alt="Government of Karnataka" className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" />
          <img src="/assets/Logo.png" alt="VTPC Karnataka" className="h-14 sm:h-16" />
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
