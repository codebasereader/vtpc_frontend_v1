import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { ROUTES } from '../../../constants/routes'

const TEXT = {
  title: { en: 'Kala Loka is not available right now', kn: 'ಕಲಾಲೋಕ ಈಗ ಲಭ್ಯವಿಲ್ಲ' },
  body: {
    en: 'This page is served separately from the main site. Please try again in a little while.',
    kn: 'ಈ ಪುಟವನ್ನು ಮುಖ್ಯ ಸೈಟ್‌ನಿಂದ ಪ್ರತ್ಯೇಕವಾಗಿ ಒದಗಿಸಲಾಗುತ್ತದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  },
  home: { en: 'Back to home', kn: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' },
}

// Kala Loka lives in static files under /kalaloka, served by the web server before
// this app ever loads. Only if that is not set up (or not running in development)
// does the request fall through to here, so show a clear message instead of the
// generic "page not found" or a redirect loop.
export default function KalalokaUnavailable() {
  const language = useSelector(selectLanguage)

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold">{TEXT.title[language]}</h1>
      <p className="max-w-md text-gray-600">{TEXT.body[language]}</p>
      <Link
        to={ROUTES.HOME}
        className="mt-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-dark"
      >
        {TEXT.home[language]}
      </Link>
    </div>
  )
}
