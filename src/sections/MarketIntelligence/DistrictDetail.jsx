import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { exporterCorner as t } from '../../language/exporterCorner'
import BarList, { ChangeChip } from './BarList'
import { fill, formatShare, formatUsd } from './format'
import { districtDetail } from './derive'
import { EmptyNote, ShowAllToggle, SummaryCard } from './ui'

const mi = t.marketIntelligence
const SHOWN = 8

function Section({ title, hint, children }) {
  return (
    <section className="mt-8">
      <h4 className="text-base font-bold text-brand-navy-dark md:text-lg">{title}</h4>
      {hint && <p className="mt-1 text-sm text-gray-600">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function DistrictDetail({ release, language, name, onBack }) {
  const [showAllSectors, setShowAllSectors] = useState(false)
  const [showAllCountries, setShowAllCountries] = useState(false)

  const topRef = useRef(null)

  // Opening a district from far down the list: bring its page into view.
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const detail = useMemo(() => districtDetail(release, name), [release, name])

  const sectorRows = useMemo(
    () =>
      (detail?.sectors ?? []).map((row) => ({
        ...row,
        sub: fill(mi.districts.sectorSub[language], {
          district: formatShare(row.shareOfDistrict),
          state: formatShare(row.shareOfState),
        }),
      })),
    [detail, language],
  )
  const countryRows = useMemo(
    () =>
      (detail?.countries ?? []).map((row) => ({
        ...row,
        sub: fill(mi.countries.shareOfTotal[language], { value: formatShare(row.share) }),
      })),
    [detail, language],
  )

  if (!detail) return null

  const hasSectors = sectorRows.length > 0
  const hasCountries = countryRows.length > 0

  const toggle = (shownAll, setShownAll, total) => (
    <ShowAllToggle
      isExpanded={shownAll}
      total={total}
      limit={SHOWN}
      onToggle={() => setShownAll((value) => !value)}
      showAllLabel={fill(mi.showAll[language], { count: total })}
      showTopLabel={fill(mi.showTop[language], { count: SHOWN })}
    />
  )

  return (
    <div ref={topRef} className="scroll-mt-28">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-full border border-brand-divider px-3.5 py-1.5 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-page"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        {mi.districts.back[language]}
      </button>

      <h3 className="mt-4 text-2xl font-bold text-brand-navy-dark md:text-3xl">{detail.name}</h3>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard title={mi.districts.detailExports[language]} value={formatUsd(detail.current)}>
          <div className="mt-2">
            <ChangeChip previous={detail.previous} current={detail.current} previousLabel={release.previousLabel} />
          </div>
        </SummaryCard>
        <SummaryCard
          title={mi.districts.detailRank[language]}
          value={fill(mi.districts.detailRankValue[language], { rank: detail.rank, total: detail.total })}
        />
        {detail.shareOfKarnataka !== null && (
          <SummaryCard title={mi.districts.detailShare[language]} value={`${formatShare(detail.shareOfKarnataka)}%`} />
        )}
      </div>

      {detail.majorProducts && (
        <Section title={mi.districts.mainProducts[language]}>
          <p className="rounded-xl bg-brand-page p-4 text-sm leading-relaxed text-gray-700">{detail.majorProducts}</p>
        </Section>
      )}

      {hasSectors && (
        <Section title={mi.districts.whatItExports[language]} hint={mi.districts.whatItExportsHint[language]}>
          <BarList rows={showAllSectors ? sectorRows : sectorRows.slice(0, SHOWN)} previousLabel={release.previousLabel} />
          {toggle(showAllSectors, setShowAllSectors, sectorRows.length)}
        </Section>
      )}

      {hasCountries && (
        <Section title={mi.districts.whereItExports[language]} hint={mi.districts.whereItExportsHint[language]}>
          <BarList rows={showAllCountries ? countryRows : countryRows.slice(0, SHOWN)} previousLabel={release.previousLabel} />
          {toggle(showAllCountries, setShowAllCountries, countryRows.length)}
        </Section>
      )}

      {!hasSectors && !hasCountries && <EmptyNote>{mi.districts.noDetail[language]}</EmptyNote>}
    </div>
  )
}
