import { useCallback, useState } from 'react'
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
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  return (
    <header className="bg-white shadow-sm">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-2">
        {common.header.skipToContent[language]}
      </a>

      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8 sm:py-5">
        <Link to={ROUTES.HOME} className="flex w-full shrink-0 items-center justify-between sm:w-auto sm:justify-start sm:gap-4">
          <img src="/assets/GOK%20LOGO%201.png" alt="Government of Karnataka" className="h-20 w-20 object-contain sm:h-[4.5rem] sm:w-[4.5rem]" />
          <img src="/assets/Logo.png" alt="VTPC Karnataka" className="h-16 object-contain sm:h-16" />
        </Link>

        <LeaderStrip />
      </div>

      <NavBar isMobileMenuOpen={isMobileMenuOpen} onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />

      <MobileNavPanel isOpen={isMobileMenuOpen} onNavigate={closeMobileMenu} />
    </header>
  )
}
