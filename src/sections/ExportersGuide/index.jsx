import { useSelector } from 'react-redux'
import { Download, BookOpen, Globe2, TrendingUp, Handshake } from 'lucide-react'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { home } from '../../language/home'

const GUIDE_PDF = '/assets/pdf/VTPC-BROCHURE.pdf'
const GUIDE_IMAGE = '/assets/guide.png'

const BENEFIT_ICONS = [Globe2, TrendingUp, Handshake]

export default function ExportersGuide() {
  const language = useSelector(selectLanguage)
  const t = home.exportersGuide

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-12 md:px-8 md:py-16">
        <div>
          <h2 className="mt-4 text-3xl font-bold text-brand-navy-dark md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t.title[language]}
          </h2>

          <p className="mt-4 text-base font-medium text-gray-700 md:text-lg">{t.tagline[language]}</p>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
            {t.description[language]}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={GUIDE_PDF}
              download
              className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
            >
              <Download size={18} aria-hidden="true" />
              {t.downloadGuide[language]}
            </a>
            <a
              href={GUIDE_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-brand-primary bg-white px-5 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-surface"
            >
              <BookOpen size={18} aria-hidden="true" />
              {t.viewGuideOnline[language]}
            </a>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-4">
            {t.benefits.map((benefit, index) => {
              const Icon = BENEFIT_ICONS[index]
              return (
                <li key={benefit.title.en} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-navy/30 text-brand-navy">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold tracking-wide text-brand-navy uppercase">
                      {benefit.title[language]}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-600">{benefit.subtitle[language]}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex items-center justify-center md:justify-end">
          <img
            src={GUIDE_IMAGE}
            alt="VTPC Exporters Guide"
            className="w-full max-w-[260px] object-contain drop-shadow-xl sm:max-w-[300px] md:max-w-[340px]"
          />
        </div>
      </div>
    </section>
  )
}
