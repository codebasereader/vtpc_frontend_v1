// Turns a market release into the ranked lists the tabs draw. Pure functions —
// no React — so the numbers on screen are easy to check against the Excel.

const NOT_A_STATE = new Set(['All India', 'Other States'])
const isOthers = (name) => /^others?$/i.test(name)

const byValueDesc = (a, b) => b.value - a.value

export function merchandiseSectors(release) {
  return release.sectorStates.filter((row) => !row.isServices)
}

function indiaFigure(release, sector) {
  if (sector) return release.sectorStates.find((row) => row.sector === sector)?.values['All India']?.current ?? null
  return release.stateTotals['All India']?.current ?? null
}

/** Karnataka's share of India's merchandise exports, as a percentage (or null). */
export function karnatakaShareOfIndia(release) {
  const karnataka = release.stateTotals.Karnataka?.current
  const india = indiaFigure(release, null)
  return karnataka && india ? (karnataka / india) * 100 : null
}

/** Karnataka vs the other named states, optionally for a single sector. */
export function stateRows(release, sector) {
  const india = indiaFigure(release, sector)
  const sectorRow = sector ? release.sectorStates.find((row) => row.sector === sector) : null

  const rows = release.states
    .filter((name) => !NOT_A_STATE.has(name))
    .map((name) => {
      const figure = sectorRow ? sectorRow.values[name] : release.stateTotals[name]
      if (!figure || figure.current === null || figure.current === undefined) return null
      return {
        key: name,
        label: name,
        value: figure.current,
        previous: figure.previous,
        share: india ? (figure.current / india) * 100 : null,
        highlight: name === 'Karnataka',
      }
    })
    .filter(Boolean)
    .sort(byValueDesc)

  const other = sectorRow ? sectorRow.values['Other States'] : release.stateTotals['Other States']
  return { rows, otherStatesValue: other?.current ?? null }
}

/** Karnataka's merchandise sectors, largest first ("Others" always last). */
export function sectorRows(release) {
  const rows = merchandiseSectors(release)
    .map((row) => {
      const karnataka = row.values.Karnataka
      if (!karnataka || karnataka.current === null) return null
      const india = row.values['All India']?.current
      return {
        key: row.sector,
        label: row.sector,
        value: karnataka.current,
        previous: karnataka.previous,
        share: india ? (karnataka.current / india) * 100 : null,
      }
    })
    .filter(Boolean)
  const named = rows.filter((row) => !isOthers(row.label)).sort(byValueDesc)
  const others = rows.filter((row) => isOthers(row.label))
  return [...named, ...others]
}

/** Karnataka's software & services figure (RBI estimate), shown separately from goods. */
export function servicesFigure(release) {
  return release.sectorStates.find((row) => row.isServices)?.values.Karnataka ?? null
}

/** Districts, largest first. With a sector, only that sector's exports are counted. */
export function districtRows(release, sector) {
  if (!sector) {
    const total = release.totals.current
    return release.districts
      .map((d) => ({
        key: d.name,
        label: d.name,
        value: d.current,
        previous: d.previous,
        share: total ? (d.current / total) * 100 : null,
        details: d.majorProducts,
      }))
      .filter((row) => row.value > 0)
      .sort(byValueDesc)
  }
  const row = release.sectorDistricts.find((s) => s.sector === sector)
  if (!row) return []
  const entries = Object.entries(row.values)
  const total = entries.reduce((sum, [, value]) => sum + value, 0)
  return entries
    .map(([name, value]) => ({
      key: name,
      label: name,
      value,
      previous: null,
      share: total ? (value / total) * 100 : null,
    }))
    .sort(byValueDesc)
}

export function districtsWithSectorData(release) {
  return release.sectorDistricts.filter((row) => !row.isServices && Object.keys(row.values).length > 0).map((row) => row.sector)
}

export function countryOptions(release) {
  return [...new Set(release.countryDistricts.map((row) => row.country))].sort((a, b) => a.localeCompare(b))
}

export function countryDistrictOptions(release) {
  return [...new Set(release.countryDistricts.map((row) => row.district))].sort((a, b) => a.localeCompare(b))
}

/**
 * - no filters        → countries ranked across Karnataka
 * - district only     → countries ranked for that district
 * - country only      → districts ranked for that country
 * - both              → that one district → country figure
 */
export function countryRows(release, { district, country }) {
  let data = release.countryDistricts
  if (district) data = data.filter((row) => row.district === district)
  if (country) data = data.filter((row) => row.country === country)

  const groupBy = country ? 'district' : 'country'
  const groups = new Map()
  data.forEach((row) => {
    const label = row[groupBy]
    const group = groups.get(label) || { key: label, label, value: 0, previous: 0 }
    group.value += row.current
    group.previous += row.previous
    groups.set(label, group)
  })

  const rows = [...groups.values()].filter((row) => row.value > 0)
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  return rows.map((row) => ({ ...row, share: total ? (row.value / total) * 100 : null })).sort(byValueDesc)
}
