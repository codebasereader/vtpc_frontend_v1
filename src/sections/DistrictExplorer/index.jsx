import { lazy, Suspense, useState } from 'react'
import { useSelector } from 'react-redux'
import { getMarketRelease, getMarketReleases } from '../../api/marketIntelligenceApi'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { home } from '../../language/home'
import { useRemote } from '../../lib/useRemote'
import { KARNATAKA_DISTRICTS } from '../../constants/districts'
import DistrictPanel from './DistrictPanel'

const KarnatakaMap = lazy(() => import('./KarnatakaMap'))

// The district shown when the section first appears.
const DEFAULT_DISTRICT = 'bengaluru-urban'

export default function DistrictExplorer() {
  const language = useSelector(selectLanguage)
  const t = home.districtExplorer
  const [selectedId, setSelectedId] = useState(DEFAULT_DISTRICT)
  const [chosenKey, setChosenKey] = useState(null)

  // Export figures come only from the published Market Data releases (quarter-wise and year-wise).
  const { data: releases, error: listError, isLoading: isListLoading } = useRemote('releases', getMarketReleases)
  const activeKey = releases?.some((r) => r.key === chosenKey) ? chosenKey : releases?.[0]?.key
  const { data: release, error: releaseError, isLoading: isReleaseLoading } = useRemote(
    activeKey || 'none',
    () => (activeKey ? getMarketRelease(activeKey) : Promise.resolve(null)),
  )

  const selectedDistrict = KARNATAKA_DISTRICTS.find((d) => d.slug === selectedId) ?? null

  return (
    <section className="bg-brand-surface px-4 py-14 md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-brand-navy-dark md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t.title[language]}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            {t.description[language]}
          </p>
        </div>

        {isListLoading && <p className="mt-10 text-center">{t.loading[language]}</p>}
        {listError && <p className="mt-10 text-center text-red-600">{t.loadFailed[language]}</p>}

        {!isListLoading && !listError && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <Suspense fallback={<p className="text-center">{t.loadingMap[language]}</p>}>
              <KarnatakaMap selectedId={selectedId} onSelect={setSelectedId} />
            </Suspense>
            <DistrictPanel
              district={selectedDistrict}
              releases={releases || []}
              activeKey={activeKey}
              onChangePeriod={setChosenKey}
              release={release}
              isLoading={isReleaseLoading}
              hasError={Boolean(releaseError)}
            />
          </div>
        )}
      </div>
    </section>
  )
}
