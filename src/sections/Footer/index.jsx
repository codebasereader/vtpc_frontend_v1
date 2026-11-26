import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Mail, MapPin, Phone, Eye, Clock } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { common } from '../../language/common'
import { getOffices } from '../../api/officesApi'
import { SOCIAL_LINKS } from '../../constants/socialLinks'
import { getVisitsSummary, getLastUpdated, trackVisit } from '../../api/visitsApi'


const WEBSITE_PAGES = [
  { key: 'home', to: ROUTES.HOME },
  { key: 'aboutUs', to: ROUTES.ABOUT_US },
  { key: 'exporterCorner', to: ROUTES.EXPORTER_CORNER },
  { key: 'geographicalIndications', to: ROUTES.GEOGRAPHICAL_INDICATIONS },
  { key: 'events', to: ROUTES.EVENTS },
  { key: 'downloads', to: ROUTES.DOWNLOADS },
]

const WEBSITE_POLICIES = [
  { en: 'Privacy Policy', kn: 'ಗೌಪ್ಯತಾ ನೀತಿ', to: '/privacy-policies' },
  { en: 'Terms & Conditions', kn: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು', to: '/terms-conditions' },
  { en: 'Hyperlinking Policy', kn: 'ಹೈಪರ್‌ಲಿಂಕಿಂಗ್ ನೀತಿ', to: '/hyperlinking-policy' },
  { en: 'Copyright Policy', kn: 'ಹಕ್ಕುಸ್ವಾಮ್ಯ ನೀತಿ', to: '/copyright-policy' },
  { en: 'Security Policy', kn: 'ಭದ್ರತಾ ನೀತಿ', to: '/security-policy' },
  { en: 'Screen Reader Access', kn: 'ಸ್ಕ್ರೀನ್ ರೀಡರ್ ಪ್ರವೇಶ', to: '/screen-reader-access' },
  { en: 'Help', kn: 'ಸಹಾಯ', to: '/help' },
  { en: 'WCAG 2.2', kn: 'WCAG 2.2', href: 'https://www.w3.org/TR/WCAG22/' },
  { en: 'HTTPS', kn: 'HTTPS', href: 'https://www.https.in/government-solutions' },
  { en: 'Guidelines', kn: 'ಮಾರ್ಗಸೂಚಿಗಳು', href: 'https://industries.karnataka.gov.in/guidelines/en' },
]

// Real logos, from `public/assets/images/footer-logos/` — real destination
// URLs taken verbatim from the reference site's footer.php.
const FOOTER_LOGOS = [
  { file: 'meity-1.jpg', alt: 'Ministry of Electronics and IT', href: 'https://www.meity.gov.in/' },
  { file: 'Digital-india-black.jpg', alt: 'Digital India', href: 'https://www.digitalindia.gov.in/' },
  { file: 'datagov.png', alt: 'Open Government Data Platform India', href: 'https://www.data.gov.in/' },
  { file: 'india-gov_logo.svg', alt: 'National Portal of India', href: 'https://www.india.gov.in/' },
  { file: 'PMO_India_Logo.svg', alt: 'PMO India', href: 'https://www.pmindia.gov.in/en/' },
  {
    file: 'Guidelines_for_Indian_Government_Websites_Logo.png',
    alt: 'Guidelines for Indian Government Websites',
    href: 'https://guidelines.india.gov.in/',
  },
  { file: 'kappec.png', alt: 'KAPPEC', href: 'https://kappec.karnataka.gov.in/english' },
  {
    file: 'DGCIS_Logo.png',
    alt: 'DGCIS — Directorate General of Commercial Intelligence & Statistics',
    href: 'https://www.dgciskol.gov.in/CI_Quarterly_Review.aspx',
  },
  { file: 'InvestKarnataka.jpg', alt: 'Invest Karnataka', href: 'https://investkarnataka.co.in/' },
  {
    file: 'KUM-logo-blue.png',
    alt: 'Karnataka Udyog Mitra',
    href: 'https://investkarnataka.co.in/karnataka-udyog-mitra/',
  },
]

export default function Footer() {
  const language = useSelector(selectLanguage)
  const [office, setOffice] = useState(null)
  const [visitsTotal, setVisitsTotal] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    getOffices()
      .then((offices) => setOffice(offices[0] || null))
      .catch(() => setOffice(null))
    getVisitsSummary()
      .then((data) => setVisitsTotal(data.total))
      .catch(() => setVisitsTotal(null))
    getLastUpdated()
      .then((data) => setLastUpdated(data.updatedAt))
      .catch(() => setLastUpdated(null))
    trackVisit().catch(() => {})
  }, [])

  return (
    <footer className="bg-brand-navy-dark text-white">
      <div className="border-t border-white/10 px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-brand-gold uppercase">
              {common.footer.officeAddress[language]}
            </h3>
            {office ? (
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/80">
                <p className="flex gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand-gold" aria-hidden="true" />
                  <span>
                    {office.name}
                    {office.address?.en ? `, ${office.address.en}` : ''}
                  </span>
                </p>
                {office.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="shrink-0 text-brand-gold" aria-hidden="true" />
                    {office.phone}
                  </p>
                )}
                {office.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="shrink-0 text-brand-gold" aria-hidden="true" />
                    {office.email}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/50">—</p>
            )}
          </div>

          <FooterLinkColumn title={common.footer.websitePages[language]}>
            {WEBSITE_PAGES.map((item) => (
              <Link key={item.key} to={item.to} className="text-sm text-white/75 transition-colors hover:text-white">
                {common.nav[item.key][language]}
              </Link>
            ))}
          </FooterLinkColumn>

          <FooterLinkColumn title={common.footer.websitePolicies[language]}>
            {WEBSITE_POLICIES.map((item) =>
              item.href ? (
                <a
                  key={item.en}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {item[language]}
                </a>
              ) : (
                <Link
                  key={item.en}
                  to={item.to}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {item[language]}
                </Link>
              ),
            )}
          </FooterLinkColumn>

          <div>
            <h3 className="text-sm font-bold tracking-wide text-brand-gold uppercase">
              {common.footer.visitors[language]}
            </h3>
            <p className="mt-4 flex items-center gap-2 text-2xl font-extrabold text-white">
              <Eye size={20} className="text-brand-gold" aria-hidden="true" />
              {visitsTotal != null ? visitsTotal.toLocaleString() : '—'}
            </p>
            <h3 className="mt-6 text-sm font-bold tracking-wide text-brand-gold uppercase">
              {common.footer.followUs[language]}
            </h3>
            <div className="mt-3 flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.name} — ${social.handle}`}
                  title={social.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 p-1.5 transition-transform hover:scale-110"
                >
                  <img src={social.icon} alt="" className="h-full w-full object-contain" />
                </a>
              ))}
            </div>
            {lastUpdated && (
              <p className="mt-4 flex items-center gap-2 text-xs text-white/60">
                <Clock size={13} className="shrink-0" aria-hidden="true" />
                {common.footer.lastUpdated[language]}:{' '}
                {new Date(lastUpdated).toLocaleString(undefined, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <FooterLogos />

      <div className="border-t border-white/10 px-4 py-5 md:px-8">
        <p className="mx-auto max-w-6xl text-xs leading-relaxed text-white/50">{common.footer.disclaimer[language]}</p>
      </div>

      <div className="border-t border-white/10 px-4 py-5 md:px-8">
        <p className="mx-auto max-w-6xl text-center text-xs text-white/60 sm:text-left">
          &copy; {new Date().getFullYear()} {common.footer.copyright[language]}
        </p>
      </div>
    </footer>
  )
}

function FooterLinkColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold tracking-wide text-brand-gold uppercase">{title}</h3>
      <div className="mt-4 flex flex-col gap-2.5">{children}</div>
    </div>
  )
}

function FooterLogos() {
  return (
    <div className="border-t border-white/10 px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6">
        {FOOTER_LOGOS.map((logo) => (
          <a
            key={logo.file}
            href={logo.href}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-24 items-center justify-center"
          >
            <img
              src={`/assets/images/footer-logos/${logo.file}`}
              alt={logo.alt}
              className="max-h-12 max-w-full object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  )
}
