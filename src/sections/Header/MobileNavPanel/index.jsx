import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../../constants/routes'

const NAV_ITEMS = [
  { key: 'home', to: ROUTES.HOME },
  { key: 'aboutUs', to: ROUTES.ABOUT_US },
  { key: 'exporterCorner', to: ROUTES.EXPORTER_CORNER },
  { key: 'geographicalIndications', to: ROUTES.GEOGRAPHICAL_INDICATIONS },
]

const RTI_LINKS = [
  { label: 'RTI Login', href: 'https://rtionline.karnataka.gov.in/index.php?lan=M', external: true },
  {
    label: 'RTI Manual',
    href: 'https://ceg.karnataka.gov.in/assets/front/pdf/rti%20manual/RTI%20Manual%20English.pdf',
    external: true,
  },
  { label: 'RTI Statistics', href: 'https://vtpc.karnataka.gov.in/rtistats/en', external: true },
  { label: 'Online RTI', href: 'https://rtionline.karnataka.gov.in/index.php?lan=E', external: true },
  { label: '4(1) A', href: ROUTES.DOWNLOADS, external: false },
  { label: '4(1) B', href: ROUTES.DOWNLOADS, external: false },
]

export default function MobileNavPanel({ onNavigate }) {
  const { t } = useTranslation()

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
          {t(`nav.${item.key}`)}
        </NavLink>
      ))}

      <p className="mt-2 px-2 text-xs font-semibold tracking-wide text-gray-400">{t('nav.rti')}</p>
      {RTI_LINKS.map((link) =>
        link.external ? (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-2 py-2 pl-4 text-sm text-brand-dark"
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.label}
            to={link.href}
            onClick={onNavigate}
            className="rounded-md px-2 py-2 pl-4 text-sm text-brand-dark"
          >
            {link.label}
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
        {t('nav.downloads')}
      </NavLink>
    </nav>
  )
}
