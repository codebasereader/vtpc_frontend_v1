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

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-2">
        Skip to content
      </a>
      <nav className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
        <NavLink to={ROUTES.HOME} className="text-lg font-bold text-brand-primary">
          VTPC
        </NavLink>
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
    </header>
  )
}
