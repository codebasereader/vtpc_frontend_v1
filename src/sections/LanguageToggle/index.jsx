import { useTranslation } from 'react-i18next'
import { useLocale } from '../../context/LocaleContext'

export default function LanguageToggle() {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center gap-2 text-sm" role="group" aria-label="Language">
      <button
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
        className={locale === 'en' ? 'font-semibold text-white' : 'text-white/70 hover:text-white'}
      >
        {t('language.english')}
      </button>
      <span className="text-white/40">|</span>
      <button
        type="button"
        aria-pressed={locale === 'kn'}
        onClick={() => setLocale('kn')}
        className={locale === 'kn' ? 'font-semibold text-white' : 'text-white/70 hover:text-white'}
      >
        {t('language.kannada')}
      </button>
    </div>
  )
}
