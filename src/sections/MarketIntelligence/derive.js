// Turns a market release into the ranked lists and tables the tabs draw.
// Pure functions — no React — so the numbers on screen are easy to check
// against the Excel.

const NOT_A_STATE = new Set(['All India', 'Other States'])
const isOthers = (name) => /^others?$/i.test(name)
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

const byValueDesc = (a, b) => b.value - a.value

// ---------------------------------------------------------------------------
// Sectors & states
// ---------------------------------------------------------------------------

export function merchandiseSectors(release) {
  return release.sectorStates.filter((row) => !row.isServices)
}

export function servicesRow(release) {
  return release.sectorStates.find((row) => row.isServices) ?? null
}

/** The named states (everything except "All India" and the combined "Other States"). */
export function namedStates(release) {
  return release.states.filter((name) => !NOT_A_STATE.has(name))
}

function indiaFigure(release, sector, includeServices) {
  if (sector) return release.sectorStates.find((row) => row.sector === sector)?.values['All India']?.current ?? null
  return totalFigure(release, 'All India', includeServices)?.current ?? null
}

/** A state's total exports: goods only, or goods + software & services. */
function totalFigure(release, state, includeServices) {
  const goods = release.stateTotals[state]
  if (!goods || !isNumber(goods.current)) return null
  if (!includeServices) return goods
  const services = servicesRow(release)?.values[state]
  if (!services || !isNumber(services.current)) return null
  return {
    current: goods.current + services.current,
    previous: isNumber(goods.previous) && isNumber(services.previous) ? goods.previous + services.previous : null,
  }
}

export function hasServices(release) {
  const services = servicesRow(release)
  return Boolean(services && isNumber(services.values.Karnataka?.current))
}

/** Karnataka's share of India's goods exports, as a percentage (or null). */
export function karnatakaShareOfIndia(release) {
  const karnataka = release.stateTotals.Karnataka?.current
  const india = indiaFigure(release, null, false)
  return karnataka && india ? (karnataka / india) * 100 : null
}

/**
 * Karnataka vs the other named states.
 * - `sector`: one sector's exports (may be the services row); empty = everything
 * - `includeServices`: when no sector is chosen, add software & services to each state's total
 */
export function stateRows(release, sector, includeServices = false) {
  const india = indiaFigure(release, sector, includeServices)
  const sectorRow = sector ? release.sectorStates.find((row) => row.sector === sector) : null
  const figureOf = (state) => (sectorRow ? sectorRow.values[state] : totalFigure(release, state, includeServices))

  const rows = namedStates(release)
    .map((name) => {
      const figure = figureOf(name)
      if (!figure || !isNumber(figure.current)) return null
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

  return { rows, otherStatesValue: figureOf('Other States')?.current ?? null }
}

/** Karnataka's rank among the named states for one sector row, e.g. { rank: 1, total: 7 }. */
function rankInRow(release, row) {
  const karnataka = row.values.Karnataka?.current
  if (!isNumber(karnataka)) return null
  const values = namedStates(release)
    .map((state) => row.values[state]?.current)
    .filter(isNumber)
  return { rank: 1 + values.filter((value) => value > karnataka).length, total: values.length }
}

/** Karnataka's goods sectors, largest first ("Others" always last), with its rank among the states. */
export function sectorRows(release) {
  const rows = merchandiseSectors(release)
    .map((row) => {
      const karnataka = row.values.Karnataka
      if (!karnataka || !isNumber(karnataka.current)) return null
      const india = row.values['All India']?.current
      return {
        key: row.sector,
        label: row.sector,
        value: karnataka.current,
        previous: karnataka.previous,
        share: india ? (karnataka.current / india) * 100 : null,
        standing: rankInRow(release, row),
      }
    })
    .filter(Boolean)
  const named = rows.filter((row) => !isOthers(row.label)).sort(byValueDesc)
  const others = rows.filter((row) => isOthers(row.label))
  return [...named, ...others]
}

/** Karnataka's software & services figure (RBI estimate) with its standing, shown apart from goods. */
export function servicesSummary(release) {
  const row = servicesRow(release)
  const karnataka = row?.values.Karnataka
  if (!row || !karnataka || !isNumber(karnataka.current)) return null
  const india = row.values['All India']?.current
  return {
    sector: row.sector,
    value: karnataka.current,
    previous: karnataka.previous,
    share: india ? (karnataka.current / india) * 100 : null,
    standing: rankInRow(release, row),
  }
}

/**
 * Every sector against every named state — the "compare all" table.
 * Karnataka first, then the other states by total goods exports.
 */
export function gridData(release) {
  const states = namedStates(release)
    .filter((state) => state === 'Karnataka' || release.stateTotals[state])
    .sort((a, b) => {
      if (a === 'Karnataka') return -1
      if (b === 'Karnataka') return 1
      return (release.stateTotals[b]?.current ?? 0) - (release.stateTotals[a]?.current ?? 0)
    })

  const order = new Map(sectorRows(release).map((row, index) => [row.key, index]))
  const toRow = (row) => ({
    sector: row.sector,
    india: row.values['All India'] ?? null,
    cells: Object.fromEntries(states.map((state) => [state, row.values[state] ?? null])),
  })

  const goods = merchandiseSectors(release)
    .filter((row) => order.has(row.sector))
    .sort((a, b) => order.get(a.sector) - order.get(b.sector))
    .map(toRow)

  const totals = {
    sector: null,
    india: release.stateTotals['All India'] ?? null,
    cells: Object.fromEntries(states.map((state) => [state, release.stateTotals[state] ?? null])),
  }
  const services = servicesRow(release)

  return { states, goods, totals, services: services ? toRow(services) : null }
}

// ---------------------------------------------------------------------------
// Districts
// ---------------------------------------------------------------------------

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

/** Everything the district detail page shows for one district. */
export function districtDetail(release, name) {
  const district = release.districts.find((d) => d.name === name)
  if (!district) return null

  const ranked = [...release.districts].sort((a, b) => b.current - a.current)
  const rank = ranked.findIndex((d) => d.name === name) + 1

  const sectorEntries = release.sectorDistricts
    .filter((row) => !row.isServices && row.values[name] > 0)
    .map((row) => ({ sector: row.sector, value: row.values[name], stateTotal: row.total }))
  const sectorsTotal = sectorEntries.reduce((sum, entry) => sum + entry.value, 0)
  const named = sectorEntries.filter((entry) => !isOthers(entry.sector)).sort((a, b) => b.value - a.value)
  const others = sectorEntries.filter((entry) => isOthers(entry.sector))
  const sectors = [...named, ...others].map((entry) => ({
    key: entry.sector,
    label: entry.sector,
    value: entry.value,
    previous: null,
    shareOfDistrict: sectorsTotal ? (entry.value / sectorsTotal) * 100 : null,
    shareOfState: entry.stateTotal ? (entry.value / entry.stateTotal) * 100 : null,
  }))

  return {
    name,
    current: district.current,
    previous: district.previous,
    majorProducts: district.majorProducts,
    rank,
    total: ranked.length,
    shareOfKarnataka: release.totals.current ? (district.current / release.totals.current) * 100 : null,
    sectors,
    countries: countryRows(release, { district: name }),
  }
}

// ---------------------------------------------------------------------------
// Countries
// ---------------------------------------------------------------------------

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
