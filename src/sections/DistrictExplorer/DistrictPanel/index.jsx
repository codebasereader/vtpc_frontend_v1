import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { home } from '../../../language/home'
import { districtKey } from '../../../lib/marketData/normalize'
import { ChangeChip } from '../../MarketIntelligence/BarList'
import { districtDetail } from '../../MarketIntelligence/derive'
import { formatShare, formatUsd } from '../../MarketIntelligence/format'

const LIST_LENGTH = 5

function DataList({ title, items, suffix = '%' }) {
  return (
    <div className="border-t border-gray-100 pt-4 first:border-none first:pt-0">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-primary">{title}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item.name} className="flex justify-between text-base">
            <span className="text-gray-600">{item.name}</span>
            <span className="font-medium text-brand-dark">
              {item.percentage}
              {suffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TextBlock({ title, children }) {
  return (
    <div className="border-t border-gray-100 pt-4 first:border-none first:pt-0">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-primary">{title}</h4>
      <p className="mt-3 text-base leading-relaxed text-gray-600">{children}</p>
    </div>
  )
}

// Quarter-wise and year-wise: one pill per published period.
function PeriodPills({ releases, activeKey, onChange, label }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={label}>
      {releases.map((release) => (
        <button
          key={release.key}
          type="button"
          aria-pressed={release.key === activeKey}
          onClick={() => onChange(release.key)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors sm:text-sm ${
            release.key === activeKey
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

export default function DistrictPanel({ district, releases, activeKey, onChangePeriod, release, isLoading, hasError }) {
  const language = useSelector(selectLanguage)
  const t = home.districtExplorer

  // The release names this district as the Excel does (e.g. "Chikkamagaluru"), which can differ from the map's spelling.
  const detail = useMemo(() => {
    if (!district || !release) return null
    const wanted = districtKey(district.marketName || district.name)
    const match = release.districts.find((d) => districtKey(d.name) === wanted)
    return match ? districtDetail(release, match.name) : null
  }, [district, release])

  if (!district) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-white p-8 text-center text-gray-600 shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
        {t.selectPrompt[language]}
      </div>
    )
  }

  const sectors = (detail?.sectors ?? [])
    .filter((row) => !/^others?$/i.test(row.label))
    .slice(0, LIST_LENGTH)
    .map((row) => ({ name: row.label, percentage: formatShare(row.shareOfDistrict) }))
  const countries = (detail?.countries ?? [])
    .slice(0, LIST_LENGTH)
    .map((row) => ({ name: row.label, percentage: formatShare(row.share) }))
  const previousLabel = releases.find((r) => r.key === activeKey)?.previousLabel

  let body
  if (hasError || (!isLoading && releases.length === 0)) {
    body = (
      <p className="border-t border-gray-100 pt-4 text-base text-gray-600">
        {t.noDataFor[language].replace('{district}', district.name)}
      </p>
    )
  } else if (isLoading && !release) {
    body = <p className="border-t border-gray-100 pt-4 text-base text-gray-600">{t.loading[language]}</p>
  } else if (!detail) {
    body = (
      <p className="border-t border-gray-100 pt-4 text-base text-gray-600">
        {t.noDataFor[language].replace('{district}', district.name)}
      </p>
    )
  } else {
    body = (
      <>
        <div className="flex items-center justify-between rounded-xl bg-brand-page px-4 py-3">
          <span className="min-w-0 text-sm font-medium uppercase tracking-wide text-gray-500">
            {t.totalExportsValue[language]}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <ChangeChip previous={detail.previous} current={detail.current} previousLabel={previousLabel} />
            <span className="text-2xl font-bold whitespace-nowrap text-brand-primary">{formatUsd(detail.current)}</span>
          </span>
        </div>
        {countries.length > 0 ? (
          <DataList title={t.country[language]} items={countries} />
        ) : (
          <TextBlock title={t.country[language]}>{t.countryUnavailable[language]}</TextBlock>
        )}
        {detail.majorProducts && <TextBlock title={t.products[language]}>{detail.majorProducts}</TextBlock>}
        {sectors.length > 0 && <DataList title={t.sector[language]} items={sectors} />}
      </>
    )
  }

  return (
    <div
      className={`flex flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-5.75 shadow-[0_8px_24px_rgba(15,40,80,0.06)] transition-opacity md:p-6 ${
        isLoading && release ? 'opacity-60' : ''
      }`}
    >
      <div>
        <h3 className="text-2xl font-bold text-brand-navy-dark">{detail?.name ?? district.name}</h3>
        {releases.length > 0 && (
          <PeriodPills releases={releases} activeKey={activeKey} onChange={onChangePeriod} label={t.period[language]} />
        )}
      </div>
      {body}
    </div>
  )
}
