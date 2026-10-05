import { useMemo, useState } from 'react'
import { exporterCorner as t } from '../../language/exporterCorner'
import BarList from './BarList'
import { fill, formatShare, formatUsd } from './format'
import { merchandiseSectors, stateRows } from './derive'
import { EmptyNote, FilterSelect, TabIntro } from './ui'

const mi = t.marketIntelligence

export default function StatesTab({ release, language }) {
  const [sector, setSector] = useState('')

  const sectorOptions = useMemo(
    () => [
      { value: '', label: mi.states.allSectors[language] },
      ...merchandiseSectors(release).map((row) => ({ value: row.sector, label: row.sector })),
    ],
    [release, language],
  )

  const { rows, otherStatesValue } = useMemo(() => stateRows(release, sector), [release, sector])

  const barRows = rows.map((row) => ({
    ...row,
    sub: row.share === null ? '' : fill(mi.states.shareOfIndia[language], { value: formatShare(row.share) }),
  }))
  const karnatakaRank = rows.findIndex((row) => row.highlight) + 1

  return (
    <div>
      <TabIntro
        title={sector ? fill(mi.states.titleForSector[language], { sector }) : mi.states.title[language]}
        hint={mi.states.hint[language]}
      />
      <div className="mt-4 max-w-sm">
        <FilterSelect label={mi.states.sectorFilter[language]} value={sector} onChange={setSector} options={sectorOptions} />
      </div>

      {rows.length === 0 ? (
        <EmptyNote>{mi.countries.none[language]}</EmptyNote>
      ) : (
        <>
          {karnatakaRank > 0 && (
            <p className="mt-5 inline-block rounded-lg bg-brand-surface px-3 py-2 text-sm font-semibold text-brand-primary-dark">
              {fill(mi.states.rank[language], { rank: karnatakaRank, total: rows.length })}
            </p>
          )}
          <div className="mt-5">
            <BarList rows={barRows} previousLabel={release.previousLabel} />
          </div>
          {otherStatesValue !== null && (
            <p className="mt-5 text-sm text-gray-500">
              {fill(mi.states.otherStates[language], { value: formatUsd(otherStatesValue) })}
            </p>
          )}
        </>
      )}
    </div>
  )
}
