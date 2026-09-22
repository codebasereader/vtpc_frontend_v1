import { useTranslation } from 'react-i18next'
import { useLocale } from '../../context/LocaleContext'

export default function LanguageToggle() {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex gap-2" role="group" aria-label="Language">
      <button
        type="button"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
        className={`text-sm ${locale === 'en' ? 'font-semibold underline' : ''}`}
      >
        {t('language.english')}
      </button>
      <button
        type="button"
        aria-pressed={locale === 'kn'}
        onClick={() => setLocale('kn')}
        className={`text-sm ${locale === 'kn' ? 'font-semibold underline' : ''}`}
      >
        {t('language.kannada')}
      </button>
    </div>
  )
}
