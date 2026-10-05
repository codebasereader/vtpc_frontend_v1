import { useMemo, useState } from 'react'
import { exporterCorner as t } from '../../language/exporterCorner'
import BarList from './BarList'
import { fill, formatShare, formatUsd } from './format'
import { hasServices, merchandiseSectors, servicesRow, stateRows } from './derive'
import { EmptyNote, FilterSelect, SegmentedControl, TabIntro } from './ui'

const mi = t.marketIntelligence

export default function StatesTab({ release, language }) {
  const [sector, setSector] = useState('')
  const [includeServices, setIncludeServices] = useState(false)

  const services = hasServices(release) ? servicesRow(release) : null

  const sectorOptions = useMemo(
    () => [
      { value: '', label: mi.states.allSectors[language] },
      ...merchandiseSectors(release).map((row) => ({ value: row.sector, label: row.sector })),
      ...(services
        ? [{ value: services.sector, label: fill(mi.states.servicesOption[language], { sector: services.sector }) }]
        : []),
    ],
    [release, services, language],
  )

  // The goods/services switch only means something when no single sector is picked.
  const showServicesSwitch = Boolean(services) && !sector
  const withServices = showServicesSwitch && includeServices
  const isServicesSelected = Boolean(services) && sector === services?.sector

  const { rows, otherStatesValue } = useMemo(
    () => stateRows(release, sector, withServices),
    [release, sector, withServices],
  )

  const barRows = rows.map((row) => ({
    ...row,
    sub: row.share === null ? '' : fill(mi.states.shareOfIndia[language], { value: formatShare(row.share) }),
  }))
  const karnatakaRank = rows.findIndex((row) => row.highlight) + 1

  let title = mi.states.title[language]
  if (sector) title = fill(mi.states.titleForSector[language], { sector })
  else if (withServices) title = mi.states.titleWithServices[language]

  const hint = withServices || isServicesSelected
    ? `${mi.states.hint[language]} ${mi.states.servicesHint[language]}`
    : mi.states.hint[language]

  return (
    <div>
      <TabIntro title={title} hint={hint} />

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="w-full max-w-sm">
          <FilterSelect label={mi.states.sectorFilter[language]} value={sector} onChange={setSector} options={sectorOptions} />
        </div>
        {showServicesSwitch && (
          <SegmentedControl
            label={mi.states.viewLabel[language]}
            value={includeServices ? 'both' : 'goods'}
            onChange={(value) => setIncludeServices(value === 'both')}
            options={[
              { value: 'goods', label: mi.states.goodsOnly[language] },
              { value: 'both', label: mi.states.goodsAndServices[language] },
            ]}
          />
        )}
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
