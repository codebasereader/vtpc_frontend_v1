import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { ExternalLink } from 'lucide-react'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { ROUTES } from '../../../constants/routes'
import { kalaloka as t } from '../../../language/kalaloka'
import VerticalVideoPlayer from '../../../components/VerticalVideoPlayer'

const VIDEO_SRC = '/assets/video/kala-loka%20video.mp4'
const VIDEO_POSTER = '/assets/images/kalaloka/video-thumbnail.webp'
const WATCH_BG = '/assets/images/kalaloka/watch-bg.webp'
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

      <section className="relative overflow-hidden bg-brand-navy-dark px-4 py-14 md:px-8 md:py-20">
        <img
          src={WATCH_BG}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" aria-hidden="true" />

        <div className="relative mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] md:text-3xl">
            {t.watchHeading[language]}
          </h2>
          <div className="mt-8">
            <VerticalVideoPlayer
              src={VIDEO_SRC}
              poster={VIDEO_POSTER}
              backdrop={WATCH_BG}
              title={t.watchHeading[language]}
              playLabel={t.playVideo[language]}
              closeLabel={t.closeVideo[language]}
            />
          </div>
          <p className="mt-10 border-t border-white/25 pt-5 text-center text-sm text-white/90">
            {t.enquiries[language]}{' '}
            <a href={`mailto:${ENQUIRY_EMAIL}`} className="font-semibold text-white underline underline-offset-2 hover:text-brand-gold">
              {ENQUIRY_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
