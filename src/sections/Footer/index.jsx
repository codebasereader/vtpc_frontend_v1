import { useSelector } from 'react-redux'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { common } from '../../language/common'

export default function Footer() {
  const language = useSelector(selectLanguage)

  return (
    <footer className="mt-12 border-t bg-gray-50 px-4 py-8 text-sm text-gray-600 md:px-8">
      <p>&copy; {new Date().getFullYear()} {common.footer.copyright[language]}</p>
    </footer>
  )
}
