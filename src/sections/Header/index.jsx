import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../constants/routes'
import LanguageToggle from '../LanguageToggle'

const NAV_ITEMS = [
  { key: 'home', to: ROUTES.HOME },
  { key: 'aboutUs', to: ROUTES.ABOUT_US },
  { key: 'exporterCorner', to: ROUTES.EXPORTER_CORNER },
  { key: 'geographicalIndications', to: ROUTES.GEOGRAPHICAL_INDICATIONS },
  { key: 'downloads', to: ROUTES.DOWNLOADS },
  { key: 'events', to: ROUTES.EVENTS },
  { key: 'contact', to: ROUTES.CONTACT },
]

export default function Header() {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-2">
        Skip to content
      </a>
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <NavLink to={ROUTES.HOME} className="text-lg font-bold text-brand-primary">
          VTPC
        </NavLink>

        <nav className="hidden items-center gap-4 md:flex">
          <ul className="flex flex-wrap gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'font-semibold text-brand-primary' : 'text-gray-700')}
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
          <LanguageToggle />
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="flex flex-col gap-1.5 p-2 md:hidden"
        >
          <span className={`h-0.5 w-6 bg-brand-dark transition-transform ${isMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-brand-dark transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-brand-dark transition-transform ${isMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {isMenuOpen && (
        <nav className="border-t px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-3 pt-3 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <NavLink
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => (isActive ? 'font-semibold text-brand-primary' : 'text-gray-700')}
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3">
            <LanguageToggle />
          </div>
        </nav>
      )}
    </header>
  )
}
