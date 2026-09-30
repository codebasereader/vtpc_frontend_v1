import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Menu } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { common } from '../../../language/common'
import RtiDropdown from '../RtiDropdown'
import LanguageToggle from '../../LanguageToggle'

const DGCIS_URL = 'https://ftddp.dgciskol.gov.in/dgcis/'

// Ordered left-to-right: Home, About Us, Events, Exporter Corner, DGCIS,
// Geographical Indications, then RTI/Downloads/Kalagoodu rendered after.
const NAV_ITEMS = [
  { key: 'home', to: ROUTES.HOME },
  { key: 'aboutUs', to: ROUTES.ABOUT_US },
  { key: 'events', to: ROUTES.EVENTS },
  { key: 'exporterCorner', to: ROUTES.EXPORTER_CORNER },
  { key: 'dgcis', href: DGCIS_URL },
  { key: 'geographicalIndications', to: ROUTES.GEOGRAPHICAL_INDICATIONS },
]

const navLinkClass = ({ isActive }) =>
  `py-3 text-base font-medium ${isActive ? 'text-white' : 'text-white/90 hover:text-white'}`

export default function NavBar({ isMobileMenuOpen, onToggleMobileMenu }) {
  const language = useSelector(selectLanguage)

  return (
    <div className="flex items-center justify-between gap-4 bg-brand-primary px-4 md:px-8">
      <div className="hidden items-center gap-5 md:mr-auto md:flex lg:gap-6">
        {NAV_ITEMS.map((item) =>
          item.href ? (
            <a
              key={item.key}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="py-3 text-base font-medium text-white/90 hover:text-white"
            >
              {common.nav[item.key][language]}
            </a>
          ) : (
            <NavLink key={item.key} to={item.to} className={navLinkClass}>
              {common.nav[item.key][language]}
            </NavLink>
          ),
        )}
        <RtiDropdown />
        <NavLink to={ROUTES.DOWNLOADS} className={navLinkClass}>
          {common.nav.downloads[language]}
        </NavLink>
        {/* Kalagoodu — nav label reserved, destination not provided yet. */}
        <span className="py-3 text-base font-medium text-white/50" aria-disabled="true">
          {common.nav.kalagoodu[language]}
        </span>
      </div>

      <div className="shrink-0">
        <LanguageToggle />
      </div>

      <button
        type="button"
        onClick={onToggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-label={common.header.openMenu[language]}
        className="p-3 text-white md:hidden"
      >
        <Menu size={22} />
      </button>
    </div>
  )
}
