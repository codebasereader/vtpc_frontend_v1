import { useMemo } from 'react'
import { exporterCorner as t } from '../../language/exporterCorner'
import BarList from './BarList'
import { fill, formatShare } from './format'
import { sectorRows } from './derive'
import { EmptyNote, TabIntro } from './ui'

const mi = t.marketIntelligence

export default function SectorsTab({ release, language }) {
  const rows = useMemo(
    () =>
      sectorRows(release).map((row) => ({
        ...row,
        sub: row.share === null ? '' : fill(mi.sectors.shareOfIndia[language], { value: formatShare(row.share) }),
      })),
    [release, language],
  )

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
    </div>
  )
}
