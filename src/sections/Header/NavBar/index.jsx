import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Menu, X } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { common } from '../../../language/common'
import RtiDropdown from '../RtiDropdown'
import LanguageToggle from '../../LanguageToggle'

const NAV_ITEMS = [
  { key: 'home', to: ROUTES.HOME },
  { key: 'aboutUs', to: ROUTES.ABOUT_US },
  { key: 'exporterCorner', to: ROUTES.EXPORTER_CORNER },
  { key: 'geographicalIndications', to: ROUTES.GEOGRAPHICAL_INDICATIONS },
]

const navLinkClass = ({ isActive }) =>
  `py-3 text-sm font-medium ${isActive ? 'text-white' : 'text-white/90 hover:text-white'}`

export default function NavBar({ isMobileMenuOpen, onToggleMobileMenu }) {
  const language = useSelector(selectLanguage)

  return (
    <div className="flex items-center justify-between bg-brand-primary px-4 md:px-8">
      <div className="hidden items-center gap-8 md:mr-auto md:flex">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.key} to={item.to} className={navLinkClass}>
            {common.nav[item.key][language]}
          </NavLink>
        ))}
        <RtiDropdown />
        <NavLink to={ROUTES.DOWNLOADS} className={navLinkClass}>
          {common.nav.downloads[language]}
        </NavLink>
      </div>

      <LanguageToggle />

      <button
        type="button"
        onClick={onToggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? common.header.closeMenu[language] : common.header.openMenu[language]}
        className="p-3 text-white md:hidden"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </div>
  )
}
