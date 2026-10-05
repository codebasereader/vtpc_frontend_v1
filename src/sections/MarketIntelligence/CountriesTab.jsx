import { useMemo, useState } from 'react'
import { exporterCorner as t } from '../../language/exporterCorner'
import BarList from './BarList'
import { fill, formatShare } from './format'
import { countryDistrictOptions, countryOptions, countryRows } from './derive'
import { EmptyNote, FilterSelect, ShowAllToggle, TabIntro } from './ui'

const mi = t.marketIntelligence
const DEFAULT_COUNT = 10

export default function CountriesTab({ release, language }) {
  const [country, setCountry] = useState('')
  const [district, setDistrict] = useState('')
  const [showAll, setShowAll] = useState(false)

  const countrySelect = useMemo(
    () => [
      { value: '', label: mi.countries.allCountries[language] },
      ...countryOptions(release).map((name) => ({ value: name, label: name })),
    ],
    [release, language],
  )
  const districtSelect = useMemo(
    () => [
      { value: '', label: mi.countries.allDistricts[language] },
      ...countryDistrictOptions(release).map((name) => ({ value: name, label: name })),
    ],
    [release, language],
  )

  const rows = useMemo(
    () =>
      countryRows(release, { district, country }).map((row) => ({
        ...row,
        sub:
          row.share === null || (country && district)
            ? ''
            : fill(mi.countries.shareOfTotal[language], { value: formatShare(row.share) }),
      })),
    [release, district, country, language],
  )

  let title = mi.countries.title[language]
  if (country && district) title = fill(mi.countries.titleForBoth[language], { country, district })
  else if (country) title = fill(mi.countries.titleForCountry[language], { country })
  else if (district) title = fill(mi.countries.titleForDistrict[language], { district })

  function changeCountry(next) {
    setCountry(next)
    setShowAll(false)
  }
  function changeDistrict(next) {
    setDistrict(next)
    setShowAll(false)
  }

  // Clicking a country bar drills into the districts that export to it.
  const canDrill = !country
  const shown = showAll ? rows : rows.slice(0, DEFAULT_COUNT)

  return (
    <div>
      <TabIntro title={title} hint={canDrill ? mi.countries.hint[language] : undefined} />
      <div className="mt-4 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <FilterSelect label={mi.countries.country[language]} value={country} onChange={changeCountry} options={countrySelect} />
        <FilterSelect label={mi.countries.district[language]} value={district} onChange={changeDistrict} options={districtSelect} />
      </div>

      {rows.length === 0 ? (
        <EmptyNote>{mi.countries.none[language]}</EmptyNote>
      ) : (
        <>
          <div className="mt-6">
            <BarList
              rows={shown}
              previousLabel={release.previousLabel}
              onSelect={canDrill ? (row) => changeCountry(row.label) : undefined}
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
