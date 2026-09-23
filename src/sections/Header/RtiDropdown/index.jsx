import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ChevronDown } from 'lucide-react'
import { ROUTES } from '../../../constants/routes'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { common } from '../../../language/common'

// 4(1)A, 4(1)B, and the PIO notification are real PDFs on the reference
// site but aren't uploaded to this project yet — they'll live in the
// Downloads section (category "RTI") once that admin CRUD is built, so
// these three route there internally instead of a broken/external link.
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
  { key: 'pioNotification', href: ROUTES.DOWNLOADS, external: false },
]

export default function RtiDropdown() {
  const language = useSelector(selectLanguage)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        aria-expanded={isOpen}
        className="flex items-center gap-1 py-3 text-sm font-medium text-white/90 hover:text-white"
      >
        {common.nav.rti[language]}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 z-20 mt-0 w-72 rounded-lg border border-brand-divider bg-white py-2 shadow-lg">
          {RTI_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-page"
              >
                {common.rti[link.key][language]}
              </a>
            ) : (
              <Link
                key={link.key}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-page"
              >
                {common.rti[link.key][language]}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}
