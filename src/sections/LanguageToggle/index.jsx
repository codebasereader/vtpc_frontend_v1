import { useDispatch, useSelector } from 'react-redux'
import { selectLanguage, setLanguage } from '../../redux/slices/localeSlice'
import { common } from '../../language/common'

export default function LanguageToggle() {
  const dispatch = useDispatch()
  const language = useSelector(selectLanguage)

  return (
    <div className="flex items-center gap-2 text-base" role="group" aria-label="Language">
      <button
        type="button"
        aria-pressed={language === 'en'}
        onClick={() => dispatch(setLanguage('en'))}
        className={language === 'en' ? 'font-semibold text-white' : 'text-white/70 hover:text-white'}
      >
        {common.language.english[language]}
      </button>
      <span className="text-white/40">|</span>
      <button
        type="button"
        aria-pressed={language === 'kn'}
        onClick={() => dispatch(setLanguage('kn'))}
        className={language === 'kn' ? 'font-semibold text-white' : 'text-white/70 hover:text-white'}
      >
        {common.language.kannada[language]}
      </button>
    </div>
  )
}
