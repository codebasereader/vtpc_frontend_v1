import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { TrendingUp, Globe2 } from 'lucide-react'
import { getWarehouses } from '../../../api/warehousesApi'
import { getDistricts } from '../../../api/districtsApi'
import { getTaluks } from '../../../api/taluksApi'
import { getSectors } from '../../../api/sectorsApi'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { exporterCorner as t } from '../../../language/exporterCorner'
import { getSectorIcon, sortSectors } from '../../../constants/sectorIcons'
import { getBilingualTextOrEnglish } from '../../../lib/bilingual'
import MarketIntelligence from '../../../sections/MarketIntelligence'
import WarehouseExplorer from '../../../sections/WarehouseExplorer'

const HERO_IMAGE = '/assets/images/exporter-corner/exporter-hero.png'

export default function ExporterCorner() {
  const language = useSelector(selectLanguage)

  const [warehouses, setWarehouses] = useState([])
  const [districts, setDistricts] = useState([])
  const [taluks, setTaluks] = useState([])
  const [sectors, setSectors] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [activeSectorId, setActiveSectorId] = useState(null)

  useEffect(() => {
    let isMounted = true
    Promise.all([getWarehouses(), getDistricts(), getTaluks(), getSectors()])
      .then(([warehousesData, districtsData, taluksData, sectorsData]) => {
        if (!isMounted) return
        setWarehouses(warehousesData)
        setDistricts([...districtsData].sort((a, b) => a.name.localeCompare(b.name)))
        setTaluks(taluksData)
        const orderedSectors = sortSectors(sectorsData)
        setSectors(orderedSectors)
        setActiveSectorId(orderedSectors[0]?.id ?? null)
      })
      .catch(() => {
        if (isMounted) {
          setWarehouses([])
          setDistricts([])
          setTaluks([])
          setSectors([])
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const activeSector = useMemo(
    () => sectors.find((s) => s.id === activeSectorId) ?? null,
    [sectors, activeSectorId],
  )

  return (
    <>
      <Helmet>
        <title>{t.pageTitle[language]} — VTPC Karnataka</title>
        <meta name="description" content={t.hero.description[language]} />
      </Helmet>

      {/* Hero */}
      <section
        className="relative bg-cover bg-center px-4 py-16 md:px-8 md:py-24"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-dark/80 via-brand-navy-dark/45 to-transparent" />
        <div className="relative mx-auto max-w-6xl">
          <span className="text-xs font-bold tracking-[0.2em] text-brand-gold uppercase">
            {t.hero.eyebrow[language]}
          </span>
          <h1 className="mt-2 max-w-2xl text-3xl font-extrabold text-white md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t.hero.heading[language]}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
            {t.hero.description[language]}
          </p>
        </div>
      </section>

      <MarketIntelligence />

      {/* Warehouse Facilities */}
      <WarehouseExplorer
        warehouses={warehouses}
        districts={districts}
        taluks={taluks}
        language={language}
        isLoading={isLoading}
      />

      {/* Focus Sectors of Karnataka */}
      <section className="bg-white px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-brand-primary" />
            <h2 className="text-2xl font-bold text-brand-navy-dark md:text-3xl">
              {t.focusSectors.heading[language]}
            </h2>
          </div>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
            {t.focusSectors.description[language]}
          </p>

          {isLoading && <p className="mt-10 text-center text-gray-600">{t.focusSectors.loading[language]}</p>}

          {!isLoading && sectors.length > 0 && (
            <>
              <div
                className="mt-8 overflow-hidden rounded-2xl border border-brand-divider bg-brand-page"
                role="tablist"
                aria-label={t.focusSectors.heading[language]}
              >
                <div className="grid grid-cols-2 divide-x divide-y divide-brand-divider sm:grid-cols-4 sm:divide-y-0">
                  {sectors.map((sector) => {
                    const Icon = getSectorIcon(sector)
                    const isActive = sector.id === activeSectorId
                    return (
                      <button
                        key={sector.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveSectorId(sector.id)}
                        className={`flex min-h-[6rem] flex-col items-center justify-center gap-2 px-3 py-4 text-center text-sm font-semibold transition-colors ${
                          isActive ? 'bg-brand-primary text-white' : 'bg-white text-brand-dark hover:bg-brand-surface'
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isActive ? 'bg-white/15' : 'bg-brand-surface text-brand-primary'
                          }`}
                        >
                          <Icon size={20} className={isActive ? 'text-white' : ''} aria-hidden="true" />
                        </span>
                        <span className="leading-snug">{getBilingualTextOrEnglish(sector.name, language)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {activeSector && (
                <div
                  role="tabpanel"
                  className="mt-6 overflow-hidden rounded-2xl border border-brand-divider bg-white shadow-[0_8px_24px_rgba(15,40,80,0.06)]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
                    <div className="relative h-56 lg:h-full">
                      <img src={activeSector.image} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark/55 via-transparent to-transparent lg:bg-gradient-to-r" />
                    </div>

                    <div className="flex flex-col gap-5 p-6 md:p-8">
                      <p className="text-base leading-relaxed text-gray-600">
                        {getBilingualTextOrEnglish(activeSector.description, language)}
                      </p>

                      {activeSector.statBoxes?.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {activeSector.statBoxes.map((stat, index) => (
                            <div key={index} className="rounded-xl bg-brand-page p-3 text-center">
                              <p className="text-xl font-extrabold text-brand-primary">{stat.value}</p>
                              <p className="mt-1 text-xs leading-snug text-gray-600">
                                {getBilingualTextOrEnglish(stat.label, language)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSector.yearlyChart?.length > 0 && (
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-brand-navy-dark uppercase">
                            <TrendingUp size={14} className="text-brand-primary" aria-hidden="true" />
                            {t.focusSectors.exportTrend[language]}
                          </p>
                          <div className="mt-3 flex h-28 items-end gap-3">
                            {(() => {
                              const max = Math.max(...activeSector.yearlyChart.map((y) => y.valueUsdMn), 1)
                              return activeSector.yearlyChart.map((point) => (
                                <div key={point.year} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                                  <span className="text-[11px] font-semibold text-brand-navy-dark">
                                    {Math.round(point.valueUsdMn).toLocaleString()}
                                  </span>
                                  <div
                                    className="w-full rounded-t-md bg-brand-primary/85"
                                    style={{ height: `${Math.max((point.valueUsdMn / max) * 70, 4)}%` }}
                                  />
                                  <span className="text-[10px] text-gray-500">{point.year}</span>
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      )}

                      {activeSector.keyInsights && getBilingualTextOrEnglish(activeSector.keyInsights, language) && (
                        <div className="flex gap-3 rounded-xl border-l-4 border-brand-gold bg-brand-page/60 p-4">
                          <TrendingUp size={18} className="mt-0.5 shrink-0 text-brand-gold" aria-hidden="true" />
                          <div>
                            <p className="text-xs font-bold tracking-wide text-brand-navy-dark uppercase">
                              {t.focusSectors.keyInsights[language]}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-gray-600">
                              {getBilingualTextOrEnglish(activeSector.keyInsights, language)}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeSector.topMarkets?.length > 0 && (
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-brand-navy-dark uppercase">
                            <Globe2 size={14} className="text-brand-primary" aria-hidden="true" />
                            {t.focusSectors.topMarkets[language]}
                          </p>
                          <div className="mt-2 flex flex-col gap-2">
                            {activeSector.topMarkets.map((market) => (
                              <div key={market.country} className="flex items-center gap-3">
                                <span className="w-24 shrink-0 text-sm text-gray-600">{market.country}</span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-page">
                                  <div
                                    className="h-full rounded-full bg-brand-primary"
                                    style={{ width: `${Math.min(market.percentage, 100)}%` }}
                                  />
                                </div>
                                <span className="w-12 shrink-0 text-right text-sm font-semibold text-brand-navy-dark">
                                  {market.percentage}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
