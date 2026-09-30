import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { Search, MapPin, Warehouse as WarehouseIcon, TrendingUp, Globe2 } from 'lucide-react'
import { getWarehouses } from '../../../api/warehousesApi'
import { getDistricts } from '../../../api/districtsApi'
import { getTaluks } from '../../../api/taluksApi'
import { getSectors } from '../../../api/sectorsApi'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { exporterCorner as t } from '../../../language/exporterCorner'
import { getSectorIcon, sortSectors } from '../../../constants/sectorIcons'
import { getBilingualText } from '../../../lib/bilingual'
import WarehouseMap from '../../../components/WarehouseMap'
import MarketIntelligence from '../../../sections/MarketIntelligence'

const HERO_IMAGE = '/assets/images/exporter-corner/exporter-hero.png'

export default function ExporterCorner() {
  const language = useSelector(selectLanguage)

  const [warehouses, setWarehouses] = useState([])
  const [districts, setDistricts] = useState([])
  const [taluks, setTaluks] = useState([])
  const [sectors, setSectors] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [talukFilter, setTalukFilter] = useState('')
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

  const districtName = useMemo(() => {
    const map = new Map(districts.map((d) => [d.id, d.name]))
    return (slug) => map.get(slug) || slug
  }, [districts])

  const talukName = useMemo(() => {
    const map = new Map(taluks.map((tk) => [tk.id, tk.name]))
    return (id) => map.get(id) || ''
  }, [taluks])

  const talukOptions = useMemo(
    () => (districtFilter ? taluks.filter((tk) => tk.district === districtFilter) : taluks),
    [taluks, districtFilter],
  )

  function handleDistrictFilterChange(value) {
    setDistrictFilter(value)
    setTalukFilter('')
  }

  const filteredWarehouses = useMemo(() => {
    const query = search.trim().toLowerCase()
    return warehouses
      .filter((w) => !districtFilter || w.district === districtFilter)
      .filter((w) => !talukFilter || w.taluk === talukFilter)
      .filter((w) => !query || w.name.toLowerCase().includes(query))
  }, [warehouses, search, districtFilter, talukFilter])

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
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-dark/92 via-brand-navy-dark/75 to-brand-navy-dark/35" />
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
      <section className="bg-brand-page px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-brand-primary" />
            <h2 className="text-2xl font-bold text-brand-navy-dark md:text-3xl">{t.warehouses.heading[language]}</h2>
          </div>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
            {t.warehouses.description[language]}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,40,80,0.06)] sm:grid-cols-3">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.warehouses.search[language]}
                className="w-full rounded-lg border border-brand-divider bg-white py-2.5 pr-3 pl-9 text-sm text-brand-dark outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              />
            </div>

            <select
              value={districtFilter}
              onChange={(e) => handleDistrictFilterChange(e.target.value)}
              className="rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm text-brand-dark outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              aria-label={t.warehouses.selectDistrict[language]}
            >
              <option value="">{t.warehouses.allDistricts[language]}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={talukFilter}
              onChange={(e) => setTalukFilter(e.target.value)}
              className="rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm text-brand-dark outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
              aria-label={t.warehouses.selectTaluk[language]}
            >
              <option value="">{t.warehouses.allTaluks[language]}</option>
              {talukOptions.map((tk) => (
                <option key={tk.id} value={tk.id}>
                  {tk.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 h-[420px] overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(15,40,80,0.08)]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center bg-white text-gray-500">
                {t.warehouses.loading[language]}
              </div>
            ) : (
              <WarehouseMap
                warehouses={filteredWarehouses}
                renderPopup={(w) => (
                  <div className="text-sm">
                    <p className="font-semibold">{w.name}</p>
                    <p className="text-gray-600">
                      {[districtName(w.district), talukName(w.taluk)].filter(Boolean).join(', ')}
                    </p>
                    <p className="mt-1 text-gray-600">
                      {t.warehouses.capacity[language]}: {w.capacityMt?.toLocaleString('en-IN')} MT
                    </p>
                  </div>
                )}
              />
            )}
          </div>

          {!isLoading && (
            <>
              <p className="mt-6 text-sm text-gray-500">
                {t.warehouses.resultsCount[language].replace('{count}', filteredWarehouses.length)}
              </p>

              {filteredWarehouses.length === 0 ? (
                <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-divider bg-white/60 p-10 text-center text-gray-600">
                  <WarehouseIcon size={28} className="text-gray-400" aria-hidden="true" />
                  <p>{t.warehouses.noResults[language]}</p>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredWarehouses.map((warehouse) => (
                    <article
                      key={warehouse.id}
                      className="flex flex-col gap-2 rounded-2xl border border-brand-divider bg-white p-5 shadow-[0_6px_18px_rgba(15,40,80,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,40,80,0.1)]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand-primary">
                          <WarehouseIcon size={18} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-brand-navy-dark">{warehouse.name}</h3>
                          <p className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin size={13} className="shrink-0 text-brand-primary" aria-hidden="true" />
                            {[districtName(warehouse.district), talukName(warehouse.taluk)]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between rounded-lg bg-brand-page px-3 py-2 text-sm">
                        <span className="text-gray-600">{t.warehouses.capacity[language]}</span>
                        <span className="font-bold text-brand-navy-dark">
                          {warehouse.capacityMt?.toLocaleString('en-IN')} MT
                        </span>
                      </div>
                      {(warehouse.lat == null || warehouse.lng == null) && (
                        <p className="text-xs text-amber-600">{t.warehouses.noLocation[language]}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
                        <span className="leading-snug">{getBilingualText(sector.name, language)}</span>
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
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark/70 via-transparent to-transparent lg:bg-gradient-to-r" />
                    </div>

                    <div className="flex flex-col gap-5 p-6 md:p-8">
                      <p className="text-base leading-relaxed text-gray-600">
                        {getBilingualText(activeSector.description, language)}
                      </p>

                      {activeSector.statBoxes?.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {activeSector.statBoxes.map((stat, index) => (
                            <div key={index} className="rounded-xl bg-brand-page p-3 text-center">
                              <p className="text-xl font-extrabold text-brand-primary">{stat.value}</p>
                              <p className="mt-1 text-xs leading-snug text-gray-600">
                                {getBilingualText(stat.label, language)}
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

                      {activeSector.keyInsights && getBilingualText(activeSector.keyInsights, language) && (
                        <div className="flex gap-3 rounded-xl border-l-4 border-brand-gold bg-brand-page/60 p-4">
                          <TrendingUp size={18} className="mt-0.5 shrink-0 text-brand-gold" aria-hidden="true" />
                          <div>
                            <p className="text-xs font-bold tracking-wide text-brand-navy-dark uppercase">
                              {t.focusSectors.keyInsights[language]}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-gray-600">
                              {getBilingualText(activeSector.keyInsights, language)}
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
