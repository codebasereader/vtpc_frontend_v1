import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Phone } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { common } from '../../language/common'

export default function FloatingContactButton() {
  const language = useSelector(selectLanguage)

  return (
    <Link
      to={ROUTES.CONTACT}
      className="fixed right-4 bottom-4 z-20 flex items-center gap-2 rounded-full bg-brand-navy px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-brand-navy-dark sm:right-6 sm:bottom-6"
    >
      <Phone size={16} />
      {common.contactButton[language]}
    </Link>
  )
}
