import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Building2, Globe2, Grid3x3, Layers, Map } from 'lucide-react'
import { getMarketRelease, getMarketReleases } from '../../api/marketIntelligenceApi'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { exporterCorner as t } from '../../language/exporterCorner'
import { useRemote } from '../../lib/useRemote'
import { ChangeChip } from './BarList'
import CountriesTab from './CountriesTab'
import DistrictsTab from './DistrictsTab'
import GridTab from './GridTab'
import SectorsTab from './SectorsTab'
import StatesTab from './StatesTab'
import { districtRows, karnatakaShareOfIndia, sectorRows, servicesSummary } from './derive'
import { fill, formatShare, formatUsd } from './format'
import { SummaryCard } from './ui'

const mi = t.marketIntelligence

function PeriodPills({ releases, active, onChange, label }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      {releases.map((release) => (
        <button
          key={release.key}
          type="button"
          aria-pressed={release.key === active}
          onClick={() => onChange(release.key)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            release.key === active
              ? 'bg-brand-primary text-white'
              : 'bg-white text-brand-dark ring-1 ring-brand-divider hover:bg-brand-page'
          }`}
        >
          {release.label}
        </button>
      ))}
    </div>
  )
}

function Summary({ release, language }) {
  const topDistrict = districtRows(release, '')[0]
  const topSector = sectorRows(release).find((row) => !/^others?$/i.test(row.label))
  const share = karnatakaShareOfIndia(release)
  const services = servicesSummary(release)

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title={mi.summary.total[language]} value={formatUsd(release.totals.current)}>
          <div className="mt-2">
            <ChangeChip previous={release.totals.previous} current={release.totals.current} previousLabel={release.previousLabel} />
          </div>
        </SummaryCard>
        {share !== null && (
          <SummaryCard title={mi.summary.share[language]} value={`${formatShare(share)}%`} />
        )}
        {topDistrict && (
          <SummaryCard title={mi.summary.topDistrict[language]} value={topDistrict.label} note={formatUsd(topDistrict.value)} />
        )}
        {topSector && (
          <SummaryCard title={mi.summary.topSector[language]} value={topSector.label} note={formatUsd(topSector.value)} />
        )}
      </div>
      {services?.value ? (
        <p className="mt-3 text-sm text-gray-500">
          {fill(mi.summary.services[language], { value: formatUsd(services.value) })}
        </p>
      ) : null}
    </div>
  )
}

function ReleaseView({ releaseKey, language }) {
  const { data: release, error, isLoading } = useRemote(releaseKey, () => getMarketRelease(releaseKey))
  const [requestedTab, setRequestedTab] = useState(null)

  const tabs = useMemo(() => {
    if (!release) return []
    return [
      { key: 'states', icon: Map, show: Object.keys(release.stateTotals).length > 1 },
      { key: 'sectors', icon: Layers, show: release.sectorStates.some((row) => !row.isServices) },
      { key: 'districts', icon: Building2, show: release.districts.length > 0 },
      { key: 'countries', icon: Globe2, show: release.countryDistricts.length > 0 },
      { key: 'grid', icon: Grid3x3, show: Object.keys(release.stateTotals).length > 1 && release.sectorStates.some((row) => !row.isServices) },
    ].filter((tab) => tab.show)
  }, [release])

  if (isLoading) return <p className="mt-10 text-center text-gray-600">{mi.loading[language]}</p>
  if (error || !release) {
    return <p className="mt-10 rounded-2xl bg-brand-page/60 p-8 text-center text-gray-600">{mi.loadError[language]}</p>
  }

  const activeTab = tabs.some((tab) => tab.key === requestedTab) ? requestedTab : tabs[0]?.key
  const tabProps = { release, language }

  return (
    <>
      <p className="mt-3 text-sm text-gray-600">
        {fill(mi.comparedWith[language], { previous: release.previousLabel })} {mi.howToRead[language]}
      </p>
      <Summary release={release} language={language} />

      <div className="mt-8 flex overflow-x-auto">
        <div className="inline-flex rounded-full bg-brand-page p-1" role="tablist">
          {tabs.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setRequestedTab(key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === key ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-dark hover:bg-white'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {mi.tabs[key][language]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-divider bg-white p-5 shadow-[0_8px_24px_rgba(15,40,80,0.06)] sm:p-6" role="tabpanel">
        {activeTab === 'states' && <StatesTab {...tabProps} />}
        {activeTab === 'sectors' && <SectorsTab {...tabProps} />}
        {activeTab === 'districts' && <DistrictsTab {...tabProps} />}
        {activeTab === 'countries' && <CountriesTab {...tabProps} />}
        {activeTab === 'grid' && <GridTab {...tabProps} />}
      </div>

      <p className="mt-4 text-xs text-gray-500">{fill(mi.source[language], { source: release.source })}</p>
    </>
  )
}

export default function MarketIntelligence() {
  const language = useSelector(selectLanguage)
  const [chosenKey, setChosenKey] = useState(null)
  const { data: releases, error, isLoading } = useRemote('list', getMarketReleases)

  const activeKey = releases?.some((r) => r.key === chosenKey) ? chosenKey : releases?.[0]?.key

  return (
    <section className="bg-white px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-brand-primary" />
          <h2 className="text-2xl font-bold text-brand-navy-dark md:text-3xl">{mi.heading[language]}</h2>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">{mi.description[language]}</p>

        {isLoading && <p className="mt-10 text-center text-gray-600">{mi.loading[language]}</p>}

        {!isLoading && error && (
          <p className="mt-10 rounded-2xl bg-brand-page/60 p-8 text-center text-gray-600">{mi.loadError[language]}</p>
        )}

        {!isLoading && !error && (!releases || releases.length === 0) && (
          <p className="mt-10 rounded-2xl border border-dashed border-brand-divider bg-brand-page/60 p-10 text-center text-gray-600">
            {mi.noData[language]}
          </p>
        )}

        {!isLoading && !error && releases?.length > 0 && (
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-500">{mi.periodLabel[language]}:</span>
              <PeriodPills releases={releases} active={activeKey} onChange={setChosenKey} label={mi.periodLabel[language]} />
            </div>
            <ReleaseView key={activeKey} releaseKey={activeKey} language={language} />
          </div>
        )}
      </div>
    </section>
  )
}
