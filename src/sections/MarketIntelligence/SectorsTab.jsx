import { useMemo } from 'react'
import { exporterCorner as t } from '../../language/exporterCorner'
import BarList, { ChangeChip } from './BarList'
import { fill, formatShare, formatUsd } from './format'
import { sectorRows, servicesSummary } from './derive'
import { EmptyNote, TabIntro } from './ui'

const mi = t.marketIntelligence

export default function SectorsTab({ release, language }) {
  const rows = useMemo(
    () =>
      sectorRows(release).map((row) => {
        const parts = []
        if (row.standing) {
          parts.push(fill(mi.sectors.standing[language], { rank: row.standing.rank, total: row.standing.total }))
        }
        if (row.share !== null) parts.push(fill(mi.sectors.shareOfIndia[language], { value: formatShare(row.share) }))
        return {
          ...row,
          sub: parts.join(' · '),
        }
      }),
    [release, language],
  )

  const services = useMemo(() => servicesSummary(release), [release])

  return (
    <div>
      <TabIntro title={mi.sectors.title[language]} hint={mi.sectors.hint[language]} />

      {rows.length === 0 ? (
        <EmptyNote>{mi.noData[language]}</EmptyNote>
      ) : (
        <div className="mt-6">
          <BarList rows={rows} previousLabel={release.previousLabel} />
        </div>
      )}

      {services && (
        <div className="mt-8 rounded-xl bg-brand-page p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-brand-navy-dark">{mi.sectors.servicesTitle[language]}</p>
            <span className="flex items-center gap-2">
              <span className="text-base font-bold text-brand-dark">{formatUsd(services.value)}</span>
              <ChangeChip previous={services.previous} current={services.value} previousLabel={release.previousLabel} />
            </span>
          </div>
          {services.standing && services.share !== null && (
            <p className="mt-1 text-sm text-gray-600">
              {fill(mi.sectors.servicesBody[language], {
                rank: services.standing.rank,
                total: services.standing.total,
                share: formatShare(services.share),
              })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
