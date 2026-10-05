import { useMemo, useState } from 'react'
import { exporterCorner as t } from '../../language/exporterCorner'
import BarList from './BarList'
import DistrictDetail from './DistrictDetail'
import { fill, formatShare } from './format'
import { districtRows, districtsWithSectorData } from './derive'
import { EmptyNote, FilterSelect, ShowAllToggle, TabIntro } from './ui'

const mi = t.marketIntelligence
const DEFAULT_COUNT = 10

export default function DistrictsTab({ release, language }) {
  const [sector, setSector] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState(null)

  const sectorOptions = useMemo(
    () => [
      { value: '', label: mi.districts.allSectors[language] },
      ...districtsWithSectorData(release).map((name) => ({ value: name, label: name })),
    ],
    [release, language],
  )
  const hasSectorFilter = sectorOptions.length > 1

  const rows = useMemo(() => {
    const shareText = sector ? mi.districts.shareOfSector[language] : mi.districts.shareOfKarnataka[language]
    return districtRows(release, sector).map((row) => ({
      ...row,
      sub: row.share === null ? '' : fill(shareText, { value: formatShare(row.share) }),
    }))
  }, [release, sector, language])

  if (selectedDistrict) {
    return (
      <DistrictDetail
        key={selectedDistrict}
        release={release}
        language={language}
        name={selectedDistrict}
        onBack={() => setSelectedDistrict(null)}
      />
    )
  }

  const shown = showAll ? rows : rows.slice(0, DEFAULT_COUNT)

  function handleSectorChange(next) {
    setSector(next)
    setShowAll(false)
  }

  return (
    <div>
      <TabIntro
        title={sector ? fill(mi.districts.titleForSector[language], { sector }) : mi.districts.title[language]}
        hint={
          sector
            ? `${mi.districts.hintForSector[language]} ${mi.districts.hint[language]}`
            : mi.districts.hint[language]
        }
      />
      {hasSectorFilter && (
        <div className="mt-4 max-w-sm">
          <FilterSelect label={mi.districts.sectorFilter[language]} value={sector} onChange={handleSectorChange} options={sectorOptions} />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyNote>{mi.countries.none[language]}</EmptyNote>
      ) : (
        <>
          <div className="mt-6">
            <BarList
              rows={shown}
              previousLabel={release.previousLabel}
              onSelect={(row) => setSelectedDistrict(row.label)}
            />
          </div>
          <ShowAllToggle
            isExpanded={showAll}
            total={rows.length}
            limit={DEFAULT_COUNT}
            onToggle={() => setShowAll((value) => !value)}
            showAllLabel={fill(mi.showAll[language], { count: rows.length })}
            showTopLabel={fill(mi.showTop[language], { count: DEFAULT_COUNT })}
          />
        </>
      )}
    </div>
  )
}
