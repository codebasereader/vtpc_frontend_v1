import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { ExternalLink } from 'lucide-react'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { ROUTES } from '../../../constants/routes'
import { kalaloka as t } from '../../../language/kalaloka'

const VIDEO_SRC = '/assets/video/kala-loka%20video.mp4'
const ENQUIRY_EMAIL = 'ksdlkalaloka@gmail.com'

export default function KalalokaIntro() {
  const language = useSelector(selectLanguage)

  return (
    <>
      <Helmet>
        <title>{t.pageTitle[language]} — VTPC Karnataka</title>
        <meta name="description" content={t.intro2[language]} />
      </Helmet>

      <section className="bg-brand-surface px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <img src="/assets/kalaloka-logo.svg" alt="Kala Loka" className="h-16 w-auto md:h-20" />
          <h1 className="mt-6 text-3xl font-bold text-brand-navy-dark md:text-4xl">{t.pageTitle[language]}</h1>
          <p className="mt-2 text-base font-medium text-brand-primary md:text-lg">{t.tagline[language]}</p>
          <p className="mt-6 text-base leading-relaxed text-gray-700 md:text-lg">{t.intro1[language]}</p>
          <p className="mt-4 text-base font-semibold leading-relaxed text-brand-navy-dark md:text-lg">
            {t.intro2[language]}
          </p>
          <a
            href={ROUTES.KALALOKA}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primary-dark"
          >
            <ExternalLink size={16} aria-hidden="true" />
            {t.visit[language]}
          </a>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8 md:py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-brand-navy-dark md:text-3xl">
            {t.agenciesHeading[language]}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-gray-600">{t.agenciesSub[language]}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.agencies.map((agency) => (
              <li
                key={agency.en}
                className="flex items-center rounded-xl border border-brand-divider bg-white px-5 py-4 text-sm font-semibold leading-snug text-brand-navy-dark shadow-sm"
              >
                {agency[language]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-12 md:px-8 md:pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-brand-navy-dark md:text-3xl">
            {t.watchHeading[language]}
          </h2>
          <video
            src={VIDEO_SRC}
            controls
            playsInline
            preload="metadata"
            className="mt-6 aspect-video w-full rounded-xl bg-black shadow-md"
          />
          <p className="mt-8 border-t border-brand-divider pt-5 text-center text-sm text-gray-600">
            {t.enquiries[language]}{' '}
            <a href={`mailto:${ENQUIRY_EMAIL}`} className="font-semibold text-brand-primary hover:underline">
              {ENQUIRY_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
