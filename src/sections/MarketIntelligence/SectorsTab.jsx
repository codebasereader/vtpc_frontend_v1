import { useMemo } from 'react'
import { exporterCorner as t } from '../../language/exporterCorner'
import BarList, { ChangeChip } from './BarList'
import { fill, formatShare, formatUsd } from './format'
import { namedStates, sectorRows, servicesSummary } from './derive'
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
          badge: row.standing?.rank === 1 ? mi.sectors.leads[language] : '',
        }
      }),
    [release, language],
  )

  const leaders = rows.filter((row) => row.standing?.rank === 1 && !/^others?$/i.test(row.label))
  const services = useMemo(() => servicesSummary(release), [release])
  const otherStatesCount = Math.max(namedStates(release).length - 1, 0)

  return (
    <div>
      <TabIntro title={mi.sectors.title[language]} hint={mi.sectors.hint[language]} />

      {leaders.length > 0 && (
        <div className="mt-5 rounded-xl border border-brand-gold/50 bg-brand-gold/10 p-4">
          <p className="text-sm font-bold text-brand-navy-dark">{mi.sectors.leadsTitle[language]}</p>
          <p className="mt-1 text-sm text-gray-600">{fill(mi.sectors.leadsBody[language], { others: otherStatesCount })}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {leaders.map((row) => (
              <li key={row.key} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-navy-dark shadow-sm">
                {row.label}
              </li>
            ))}
          </ul>
        </div>
      )}

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
