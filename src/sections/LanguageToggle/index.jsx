import { useDispatch, useSelector } from 'react-redux'
import { selectLanguage, setLanguage } from '../../redux/slices/localeSlice'
import { common } from '../../language/common'

export default function LanguageToggle() {
  const dispatch = useDispatch()
  const language = useSelector(selectLanguage)

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/15 p-1" role="group" aria-label="Language">
      <button
        type="button"
        aria-pressed={language === 'en'}
        onClick={() => dispatch(setLanguage('en'))}
        className={`rounded-full px-3 py-1 text-sm font-semibold transition-all duration-200 ${
          language === 'en' ? 'bg-white text-brand-primary shadow-sm' : 'text-white/80 hover:text-white'
        }`}
      >
        {common.language.english[language]}
      </button>
      <button
        type="button"
        aria-pressed={language === 'kn'}
        onClick={() => dispatch(setLanguage('kn'))}
        className={`rounded-full px-3 py-1 text-sm font-semibold transition-all duration-200 ${
          language === 'kn' ? 'bg-white text-brand-primary shadow-sm' : 'text-white/80 hover:text-white'
        }`}
      >
        {common.language.kannada[language]}
      </button>
    </div>
  )
}
