import { NavLink, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../../../constants/routes'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { common } from '../../../language/common'

const NAV_ITEMS = [
  { key: 'home', to: ROUTES.HOME },
  { key: 'aboutUs', to: ROUTES.ABOUT_US },
  { key: 'exporterCorner', to: ROUTES.EXPORTER_CORNER },
  { key: 'geographicalIndications', to: ROUTES.GEOGRAPHICAL_INDICATIONS },
]

const RTI_LINKS = [
  { key: 'login', href: 'https://rtionline.karnataka.gov.in/index.php?lan=M', external: true },
  {
    key: 'manual',
    href: 'https://ceg.karnataka.gov.in/assets/front/pdf/rti%20manual/RTI%20Manual%20English.pdf',
    external: true,
  },
  { key: 'statistics', href: 'https://vtpc.karnataka.gov.in/rtistats/en', external: true },
  { key: 'online', href: 'https://rtionline.karnataka.gov.in/index.php?lan=E', external: true },
  { key: 'section4_1A', href: ROUTES.DOWNLOADS, external: false },
  { key: 'section4_1B', href: ROUTES.DOWNLOADS, external: false },
]

export default function MobileNavPanel({ onNavigate }) {
  const language = useSelector(selectLanguage)

  return (
    <nav className="flex flex-col gap-1 border-t border-brand-divider bg-white px-4 py-3 md:hidden">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.key}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-md px-2 py-2.5 text-sm font-medium ${isActive ? 'text-brand-primary' : 'text-brand-dark'}`
          }
        >
          {common.nav[item.key][language]}
        </NavLink>
      ))}

      <p className="mt-2 px-2 text-xs font-semibold tracking-wide text-gray-400">{common.nav.rti[language]}</p>
      {RTI_LINKS.map((link) =>
        link.external ? (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-2 py-2 pl-4 text-sm text-brand-dark"
          >
            {common.rti[link.key][language]}
          </a>
        ) : (
          <Link
            key={link.key}
            to={link.href}
            onClick={onNavigate}
            className="rounded-md px-2 py-2 pl-4 text-sm text-brand-dark"
          >
            {common.rti[link.key][language]}
          </Link>
        )
      )}

      <NavLink
        to={ROUTES.DOWNLOADS}
        onClick={onNavigate}
        className={({ isActive }) =>
          `mt-2 rounded-md px-2 py-2.5 text-sm font-medium ${isActive ? 'text-brand-primary' : 'text-brand-dark'}`
        }
      >
        {common.nav.downloads[language]}
      </NavLink>
    </nav>
  )
}
