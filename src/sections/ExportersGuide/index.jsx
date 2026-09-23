import { Download, BookOpen, Globe2, TrendingUp, Handshake } from 'lucide-react'

const GUIDE_PDF = '/assets/pdf/VTPC-BROCHURE.pdf'
const GUIDE_IMAGE = '/assets/guide.png'

const BENEFITS = [
  {
    icon: Globe2,
    title: 'EXPAND YOUR REACH',
    subtitle: 'New Markets',
  },
  {
    icon: TrendingUp,
    title: 'GROW YOUR BUSINESS',
    subtitle: 'More Opportunities',
  },
  {
    icon: Handshake,
    title: 'BE A PART OF GLOBAL TRADE',
    subtitle: 'A Stronger Tomorrow',
  },
]

export default function ExportersGuide() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-12 md:px-8 md:py-16">
        <div>
          {/* <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-brand-navy uppercase">
            <span className="inline-block h-0.5 w-8 bg-brand-primary" aria-hidden="true" />
            Export Resources
          </p> */}

          <h2 className="mt-4 text-3xl font-bold text-brand-navy-dark md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Gateway to Global Markets
          </h2>

          <p className="mt-4 text-base font-medium text-gray-700 md:text-lg">
            Your practical roadmap to exporting from Karnataka to the world.
          </p>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
            The Exporters Guide provides detailed steps, practical advice and key resources to help
            your business navigate the export process and unlock new global opportunities.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={GUIDE_PDF}
              download
              className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
            >
              <Download size={18} aria-hidden="true" />
              Download Guide
            </a>
            <a
              href={GUIDE_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-brand-primary bg-white px-5 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-surface"
            >
              <BookOpen size={18} aria-hidden="true" />
              View Guide Online
            </a>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-4">
            {BENEFITS.map(({ icon: Icon, title, subtitle }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-navy/30 text-brand-navy">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[11px] font-bold tracking-wide text-brand-navy uppercase">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-600">{subtitle}</span>
                </span>
              </li>
            ))}
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
