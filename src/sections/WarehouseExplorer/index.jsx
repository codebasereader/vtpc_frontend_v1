import { useMemo, useState } from 'react'
import { MapPin, Search, Warehouse as WarehouseIcon, X } from 'lucide-react'
import { exporterCorner } from '../../language/exporterCorner'
import { WAREHOUSE_TYPES, warehouseTypeLabel } from '../../constants/warehouseTypes'
import WarehouseDistrictMap from './WarehouseDistrictMap'

const t = exporterCorner.warehouses

const FIELD_CLASS =
  'w-full rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm text-brand-dark outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

// Same height for the map card and the details card; the list scrolls inside it.
const PANEL_HEIGHT = 'h-[40rem] lg:h-[46rem]'

function TypePill({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary ${
        active
          ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
          : 'border-brand-divider bg-white text-brand-dark hover:border-brand-primary/50 hover:bg-brand-surface'
      }`}
    >
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
          active ? 'bg-white/25 text-white' : 'bg-brand-page text-gray-600'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

export default function WarehouseExplorer({ warehouses, districts, taluks, language, isLoading }) {
  const [search, setSearch] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [talukFilter, setTalukFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('') // '' = all types (the default)
  const [activeId, setActiveId] = useState(null)

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

  const query = search.trim().toLowerCase()

  // Everything except the type filter — drives the count on each type pill.
  const beforeType = useMemo(
    () =>
      warehouses
        .filter((w) => !districtFilter || w.district === districtFilter)
        .filter((w) => !talukFilter || w.taluk === talukFilter)
        .filter((w) => !query || w.name.toLowerCase().includes(query)),
    [warehouses, districtFilter, talukFilter, query],
  )

  const filtered = useMemo(
    () => beforeType.filter((w) => !typeFilter || w.type === typeFilter),
    [beforeType, typeFilter],
  )

  const typeCounts = useMemo(() => {
    const counts = {}
    beforeType.forEach((w) => {
      counts[w.type] = (counts[w.type] || 0) + 1
    })
    return counts
  }, [beforeType])

  // Map pins follow the type + search filters but ignore the district/taluk filter, so the
  // whole state stays visible and the chosen district is simply highlighted.
  const countsByDistrict = useMemo(() => {
    const counts = {}
    warehouses
      .filter((w) => !typeFilter || w.type === typeFilter)
      .filter((w) => !query || w.name.toLowerCase().includes(query))
      .forEach((w) => {
        counts[w.district] = (counts[w.district] || 0) + 1
      })
    return counts
  }, [warehouses, typeFilter, query])

  const activeWarehouse = filtered.find((w) => w.id === activeId) || null
  const highlightedDistrict = activeWarehouse?.district || districtFilter

  function handleDistrictChange(value) {
    setDistrictFilter(value)
    setTalukFilter('')
    setActiveId(null)
  }

  function handleMapSelect(slug) {
    handleDistrictChange(slug === districtFilter ? '' : slug)
  }

  return (
    <section className="bg-brand-page px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-brand-primary" />
          <h2 className="text-2xl font-bold text-brand-navy-dark md:text-3xl">{t.heading[language]}</h2>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">{t.description[language]}</p>

        {isLoading ? (
          <p className="mt-8 text-center text-gray-500">{t.loading[language]}</p>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            {/* Map */}
            <div
              className={`flex flex-col rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,40,80,0.06)] ${PANEL_HEIGHT}`}
            >
              <div className="min-h-0 flex-1">
                <WarehouseDistrictMap
                  countsByDistrict={countsByDistrict}
                  selectedId={highlightedDistrict}
                  onSelect={handleMapSelect}
                  ariaLabel={t.mapLabel[language]}
                />
              </div>
              <p className="mt-3 shrink-0 text-center text-xs text-gray-500">{t.mapHint[language]}</p>
            </div>

            {/* Types + details */}
            <div
              className={`flex min-h-0 flex-col rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,40,80,0.06)] ${PANEL_HEIGHT}`}
            >
              <div className="shrink-0 space-y-3 border-b border-brand-divider p-4">
                <div
                  role="group"
                  aria-label={t.typesLabel[language]}
                  className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
                >
                  <TypePill
                    active={typeFilter === ''}
                    label={t.all[language]}
                    count={beforeType.length}
                    onClick={() => setTypeFilter('')}
                  />
                  {WAREHOUSE_TYPES.map((item) => (
                    <TypePill
                      key={item.id}
                      active={typeFilter === item.id}
                      label={language === 'kn' ? item.kn : item.label}
                      count={typeCounts[item.id] || 0}
                      onClick={() => setTypeFilter(item.id)}
                    />
                  ))}
                </div>

                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setActiveId(null)
                    }}
                    placeholder={t.search[language]}
                    aria-label={t.search[language]}
                    className={`${FIELD_CLASS} pl-9`}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select
                    value={districtFilter}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className={FIELD_CLASS}
                    aria-label={t.selectDistrict[language]}
                  >
                    <option value="">{t.allDistricts[language]}</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={talukFilter}
                    onChange={(e) => {
                      setTalukFilter(e.target.value)
                      setActiveId(null)
                    }}
                    className={FIELD_CLASS}
                    aria-label={t.selectTaluk[language]}
                  >
                    <option value="">{t.allTaluks[language]}</option>
                    {talukOptions.map((tk) => (
                      <option key={tk.id} value={tk.id}>
                        {tk.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                  <span>{t.resultsCount[language].replace('{count}', filtered.length)}</span>
                  {districtFilter && (
                    <button
                      type="button"
                      onClick={() => handleDistrictChange('')}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-primary hover:bg-brand-rose"
                    >
                      {districtName(districtFilter)}
                      <X size={12} aria-hidden="true" />
                      <span className="sr-only">{t.clearDistrict[language]}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {filtered.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
                    <WarehouseIcon size={28} className="text-gray-400" aria-hidden="true" />
                    <p>{t.noResults[language]}</p>
                  </div>
                ) : (
                  filtered.map((warehouse) => {
                    const isActive = warehouse.id === activeId
                    return (
                      <button
                        key={warehouse.id}
                        type="button"
                        onClick={() => setActiveId(isActive ? null : warehouse.id)}
                        aria-pressed={isActive}
                        className={`flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-brand-primary ${
                          isActive
                            ? 'border-brand-primary bg-brand-surface/50 shadow-[0_6px_18px_rgba(200,55,68,0.12)]'
                            : 'border-brand-divider bg-white hover:border-brand-primary/40 hover:shadow-[0_6px_18px_rgba(15,40,80,0.08)]'
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand-primary">
                            <WarehouseIcon size={18} aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            {warehouse.type && (
                              <span className="mb-1 inline-block rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                                {warehouseTypeLabel(warehouse.type, language)}
                              </span>
                            )}
                            <span className="block font-bold text-brand-navy-dark">{warehouse.name}</span>
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin size={13} className="shrink-0 text-brand-primary" aria-hidden="true" />
                              {[districtName(warehouse.district), talukName(warehouse.taluk)].filter(Boolean).join(', ')}
                            </span>
                          </span>
                        </span>
                        {warehouse.address && <span className="text-sm text-gray-600">{warehouse.address}</span>}
                        {warehouse.capacityMt > 0 && (
                          <span className="flex items-center justify-between rounded-lg bg-brand-page px-3 py-2 text-sm">
                            <span className="text-gray-600">{t.capacity[language]}</span>
                            <span className="font-bold text-brand-navy-dark">
                              {warehouse.capacityMt.toLocaleString('en-IN')} MT
                            </span>
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
