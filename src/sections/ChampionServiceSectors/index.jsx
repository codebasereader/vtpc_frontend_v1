import { useState } from 'react'
import { SECTORS, PILLAR_META } from './data'

export default function ChampionServiceSectors() {
  const [activeId, setActiveId] = useState(SECTORS[0].id)
  const activeSector = SECTORS.find((sector) => sector.id === activeId) ?? SECTORS[0]

  return (
    <section className="bg-[#eef3f8] px-4 py-14 md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-brand-navy-dark md:text-3xl">
          Delve into the Champion Service Sectors
        </h2>
        <div className="mx-auto mt-4 max-w-3xl space-y-3 text-center text-sm leading-relaxed text-gray-600 md:text-base md:leading-7">
          <p className="text-pretty break-words">
            The Champion Services Sectors are the six key areas that have been identified by the
            government for focused development, with the goal of driving economic growth and
            enhancing the nation&apos;s global competitiveness.
          </p>
          <p className="text-pretty break-words">
            VTPC effects strategies for champion service sectors, boosting growth, investment and
            export opportunities, and further advancing Karnataka&apos;s economy.
          </p>
        </div>

        <div
          className="relative z-10 mt-8 rounded-xl border border-brand-divider bg-white shadow-[0_8px_24px_rgba(15,40,80,0.06)]"
          role="tablist"
          aria-label="Champion service sectors"
        >
          <div className="grid grid-cols-2 divide-x divide-y divide-brand-divider sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
            {SECTORS.map((sector) => {
              const Icon = sector.icon
              const isActive = sector.id === activeId
              return (
                <button
                  key={sector.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(sector.id)}
                  className={`relative flex min-h-[5.5rem] flex-col items-center justify-center gap-2 px-3 py-4 text-center text-xs font-semibold transition-colors sm:text-sm ${
                    isActive
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-brand-dark hover:bg-brand-page'
                  }`}
                >
                  <Icon
                    size={22}
                    className={isActive ? 'text-white' : 'text-brand-navy'}
                    aria-hidden="true"
                  />
                  <span className="leading-snug">{sector.label}</span>
                  {isActive ? (
                    <span
                      className="absolute -bottom-2 left-1/2 z-20 h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-brand-primary"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          className="mt-6 rounded-2xl border border-brand-divider bg-white p-4 shadow-[0_8px_24px_rgba(15,40,80,0.06)] sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
            {PILLAR_META.map((pillar, index) => {
              const content = activeSector.pillars[pillar.key]
              return (
                <article
                  key={pillar.key}
                  className={`flex flex-col rounded-xl border border-brand-divider bg-white p-4 lg:rounded-none lg:border-0 lg:px-4 lg:py-2 ${
                    index > 0 ? 'lg:border-l lg:border-brand-divider' : ''
                  }`}
                >
                  <span
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${pillar.badge}`}
                  >
                    <img src={pillar.image} alt="" className="h-7 w-7 object-contain" />
                  </span>
                  <h3 className="text-base font-bold text-brand-dark">{pillar.title}</h3>
                  {content.summary ? (
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-brand-dark">
                      {content.summary}
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-600">
                    {content.items.map((item) =>
                      typeof item === 'string' ? (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                          <span>{item}</span>
                        </li>
                      ) : (
                        <li key={item.text} className="flex flex-col gap-1.5">
                          <span className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                            <span>{item.text}</span>
                          </span>
                          <ul className="ml-4 space-y-1">
                            {item.children.map((child) => (
                              <li key={child} className="flex gap-2">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                                <span>{child}</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ),
                    )}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
