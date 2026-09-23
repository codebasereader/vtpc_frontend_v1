import { useSelector } from 'react-redux'
import { BarChart3, Settings, Factory, Leaf, TrendingUp } from 'lucide-react'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { home } from '../../language/home'
import { splitHighlight } from '../../lib/text'

const IMG = '/assets/images/key-drivers-for-growth'

const DRIVER_IMAGES = [
  `${IMG}/Layer%203.png`,
  `${IMG}/Skilled%20Manager.png`,
  `${IMG}/Technology%20(1).png`,
  `${IMG}/State.png`,
  `${IMG}/Technology.png`,
  `${IMG}/investment%20deal.png`,
  `${IMG}/Companies.png`,
]

const SECTOR_META = [
  { value: 65.4, color: 'bg-[#ecb044]', icon: Settings },
  { value: 20.9, color: 'bg-brand-primary', icon: Factory },
  { value: 13.7, color: 'bg-brand-navy', icon: Leaf },
]

const MAX_SECTOR = Math.max(...SECTOR_META.map((s) => s.value))

export default function KeyDriversGrowth() {
  const language = useSelector(selectLanguage)
  const t = home.keyDriversGrowth
  const panel = t.strengthPanel

  const [titleBefore, titleHighlight, titleAfter] = splitHighlight(
    t.title[language],
    t.titleHighlight[language]
  )

  return (
    <section className="bg-[#eef3f8] px-4 py-14 md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-brand-navy-dark md:text-4xl">
          {titleBefore}
          {titleHighlight && (
            <span className="bg-gradient-to-r from-brand-primary to-brand-orange bg-clip-text text-transparent">
              {titleHighlight}
            </span>
          )}
          {titleAfter}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base">
          {t.description[language]}
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] lg:items-stretch">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {t.drivers.map((driver, index) => (
              <article
                key={driver.title.en}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,40,80,0.06)]"
              >
                <img
                  src={DRIVER_IMAGES[index]}
                  alt=""
                  className="h-11 w-11 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-snug text-brand-navy-dark">
                    {driver.title[language]}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{driver.subtitle[language]}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
            <div className="flex flex-1 flex-col p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
                    {panel.label[language]}
                  </p>
                  <p className="mt-1 text-lg font-bold text-brand-dark md:text-xl">
                    {panel.gsdpLabel[language]} – <span className="text-brand-primary">{panel.gsdpValue[language]}</span>
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">
                  <BarChart3 size={18} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{panel.description[language]}</p>

              <div className="mt-8 flex flex-1 items-end justify-between gap-3 px-1 sm:gap-4">
                {panel.sectors.map((sector, index) => {
                  const { value, color, icon: Icon } = SECTOR_META[index]
                  const barHeight = `${Math.max((value / MAX_SECTOR) * 100, 18)}%`
                  return (
                    <div key={sector.label.en} className="flex min-w-0 flex-1 flex-col items-center">
                      <span className="mb-2 text-sm font-bold text-brand-dark">{value}%</span>
                      <div className="flex h-44 w-full items-end justify-center sm:h-52">
                        <div
                          className={`relative flex w-[72%] max-w-[4.5rem] items-end justify-center rounded-t-xl ${color}`}
                          style={{ height: barHeight }}
                        >
                          <span className="absolute bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                            <Icon size={16} aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-center text-[11px] leading-tight font-medium text-gray-600">
                        {sector.label[language]}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 bg-[#f7f8fa] px-5 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <p className="flex items-start gap-2 text-xs text-gray-600">
                <TrendingUp size={16} className="mt-0.5 shrink-0 text-brand-primary" aria-hidden="true" />
                <span>{panel.footerNote[language]}</span>
              </p>
              <p className="shrink-0 border-gray-200 text-xs font-medium text-gray-500 sm:border-l sm:pl-4">
                {panel.source[language]}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
