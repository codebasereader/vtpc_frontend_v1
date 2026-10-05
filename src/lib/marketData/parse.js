// Turns the DGCIS/RBI export-data workbooks (as raw sheet rows) into one
// "market release": a single period's worth of data for the Exporter Corner
// Market Intelligence section.
//
// Sheets are recognised by their layout (header text), never by sheet name,
// because staff rename tabs between quarters. The period (e.g. "Q1 FY
// 2026-27") is read from the sheets themselves, and every sheet is checked
// against it so two different quarters can't be mixed by accident.
//
// Input : [{ name, sheets: [{ sheet, data: unknown[][] }] }]   (read-excel-file output)
// Output: { release | null, report: { recognized, ignored, errors, warnings } }

import {
  cleanCountryName,
  cleanSectorName,
  cleanText,
  isNumber,
  isServicesSector,
  nameKey,
  parsePeriod,
  roundValue,
  titleCase,
} from './normalize.js'

export const RELEASE_UNIT = 'USD Mn'

const KIND_LABELS = {
  period: 'Period',
  districtComparison: 'District export comparison',
  countryDistrict: 'Country-wise exports by district',
  sectorDistrictMatrix: 'Sector-wise exports by district',
  sectorStateCompare: 'Sector-wise exports by state (two periods)',
  sectorStateSingle: 'Sector-wise exports by state',
  sectorIndiaCompare: 'Sector-wise India vs Karnataka comparison',
}

// Which sheets feed which part of the website.
export const RELEASE_SECTIONS = [
  { key: 'districts', label: 'Districts tab', kinds: ['districtComparison'], required: true },
  { key: 'sectorDistricts', label: 'Districts tab — filter by sector', kinds: ['sectorDistrictMatrix'] },
  { key: 'sectorStates', label: 'States & Sectors tabs', kinds: ['sectorStateCompare', 'sectorStateSingle', 'sectorIndiaCompare'] },
  { key: 'countries', label: 'Countries tab', kinds: ['countryDistrict'] },
]

const TOLERANCE_WARN = 0.01 // 1% difference between sheets that should agree

const strings = (row) => (row || []).map(cleanText)
const num = (value) => (isNumber(value) ? value : null)

// ---------------------------------------------------------------------------
// 1. Recognising a sheet
// ---------------------------------------------------------------------------

/** Looks at the first rows of a sheet and says what kind of table it is. */
export function classifySheet(rows) {
  const limit = Math.min(rows.length, 10)
  for (let r = 0; r < limit; r += 1) {
    const cells = strings(rows[r])

    // The template's "Period" sheet: "Period | Q1 FY 2026-27" followed by "Compared with | Q1 FY 2025-26".
    if (/^period$/i.test(cells[0] || '') && rows.slice(r + 1, r + 4).some((next) => /^compared with$/i.test(cleanText(next?.[0])))) {
      return { kind: 'period', header: r }
    }
    if (/^districts?$/i.test(cells[1] || '') && cells.some((c) => /variation/i.test(c))) {
      return { kind: 'districtComparison', header: r }
    }
    if (/^district$/i.test(cells[0] || '') && /^country$/i.test(cells[1] || '')) {
      return { kind: 'countryDistrict', header: r }
    }
    if (/^brief description$/i.test(cells[0] || '')) {
      if (/^all india$/i.test(cells[1] || '')) return { kind: 'sectorStateSingle', header: r }
      if (cells.some((c) => /^karnataka$/i.test(c)) && cells.some((c) => /^bagalkot/i.test(c))) {
        return { kind: 'sectorDistrictMatrix', header: r }
      }
    }
    if (/^commodity$/i.test(cells[1] || '') && rows[r + 1]) {
      const groups = cells.slice(2).filter(Boolean).length
      return { kind: groups > 2 ? 'sectorStateCompare' : 'sectorIndiaCompare', header: r }
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// 2. Reading each kind of sheet
// ---------------------------------------------------------------------------

function cleanProducts(value) {
  return cleanText(value).replace(/[\s,.;]+$/, '')
}

function findSource(rows) {
  const row = rows.find((r) => /^source/i.test(cleanText(r?.[0])))
  if (!row) return ''
  return cleanText(row[0]).replace(/^source\s*:?\s*/i, '')
}

function parsePeriodSheet(rows) {
  const valueOf = (pattern) => {
    const row = rows.find((r) => pattern.test(cleanText(r?.[0])))
    return row ? cleanText(row[1]) : ''
  }
  const period = parsePeriod(valueOf(/^period$/i))
  const previousPeriod = parsePeriod(valueOf(/^compared with$/i))
  if (!period || !previousPeriod) {
    throw new Error('is missing the period. Fill in both yellow cells, for example "Q1 FY 2026-27" and "Q1 FY 2025-26".')
  }
  if (period.key === previousPeriod.key) throw new Error('has the same period in both cells — the second one must be the earlier period.')
  if (period.type !== previousPeriod.type) {
    throw new Error('compares a quarter with a full year. Both cells must be the same kind of period.')
  }
  return { period, previousPeriod }
}

function parseDistrictComparison(rows, header) {
  const cells = strings(rows[header])
  // Periods are optional here: the template keeps them on its "Period" sheet instead.
  const previousPeriod = parsePeriod(cells[2])
  const period = parsePeriod(cells[3])

  const districts = []
  let totals = null
  for (let r = header + 1; r < rows.length; r += 1) {
    const row = rows[r] || []
    const label = cleanText(row[0])
    if (/^total/i.test(label)) {
      totals = { previous: roundValue(num(row[2])), current: roundValue(num(row[3])) }
      break
    }
    const name = cleanText(row[1])
    if (!name) continue
    const previous = num(row[2])
    const current = num(row[3])
    if (previous === null || current === null) {
      throw new Error(`row for "${name}" has a missing or non-numeric value.`)
    }
    districts.push({
      name: titleCase(name),
      previous: roundValue(previous),
      current: roundValue(current),
      majorProducts: cleanProducts(row[5]),
    })
  }
  if (districts.length === 0) throw new Error('no district rows found.')

  return { period, previousPeriod, districts, totals, source: findSource(rows) }
}

function parseCountryDistrict(rows, header) {
  const cells = strings(rows[header])
  const previousPeriod = parsePeriod(cells[2])
  const period = parsePeriod(cells[3])

  const entries = []
  for (let r = header + 1; r < rows.length; r += 1) {
    const row = rows[r] || []
    if (/^total/i.test(cleanText(row[0]))) break
    const district = cleanText(row[0])
    const country = cleanCountryName(row[1])
    if (!district || !country) continue
    const previous = num(row[2])
    const current = num(row[3])
    if (previous === null && current === null) continue // a half-typed row with no figures
    if (previous === null || current === null) {
      throw new Error(`row ${r + 1} (${district} → ${country}) has a missing or non-numeric value.`)
    }
    entries.push({ district, country, previous, current })
  }
  // An empty country sheet is fine — it just means this period has no country data.
  return { period, previousPeriod, entries }
}

function findTitlePeriod(rows, header) {
  for (let r = 0; r < header; r += 1) {
    for (const cell of rows[r] || []) {
      const period = parsePeriod(cell)
      if (period) return period
    }
  }
  return null
}

function parseSectorDistrictMatrix(rows, header) {
  const cells = strings(rows[header])
  const hasHs = /^hs/i.test(cells[1] || '')
  const first = hasHs ? 2 : 1 // the "Karnataka" total column

  const districtCols = []
  for (let c = first + 1; c < cells.length; c += 1) {
    if (!cells[c] || /^total$/i.test(cells[c])) break
    districtCols.push({ col: c, name: cells[c] })
  }
  if (districtCols.length === 0) throw new Error('no district columns found.')

  const sectors = []
  for (let r = header + 1; r < rows.length; r += 1) {
    const row = rows[r] || []
    const label = cleanText(row[0])
    if (!label || /^total/i.test(label)) break
    const values = {}
    districtCols.forEach(({ col, name }) => {
      const value = num(row[col])
      if (value !== null) values[name] = value
    })
    sectors.push({
      sector: cleanSectorName(label),
      isServices: isServicesSector(label),
      hsCode: hasHs && !isServicesSector(label) ? cleanText(row[1]) : '',
      // The "Karnataka" column is a row total; if it is blank, add the districts up.
      total: num(row[first]) ?? Object.values(values).reduce((sum, value) => sum + value, 0),
      values,
    })
  }
  if (sectors.length === 0) throw new Error('no sector rows found.')
  return { period: findTitlePeriod(rows, header), sectors }
}

function parseSectorStateSingle(rows, header) {
  const cells = strings(rows[header])
  const states = []
  for (let c = 1; c < cells.length; c += 1) {
    if (cells[c]) states.push({ col: c, name: cells[c] })
  }

  const sectors = []
  for (let r = header + 1; r < rows.length; r += 1) {
    const row = rows[r] || []
    const label = cleanText(row[0])
    if (!label) break // the unlabeled totals rows end the table
    const values = {}
    states.forEach(({ col, name }) => {
      const value = num(row[col])
      if (value !== null) values[name] = { previous: null, current: value }
    })
    sectors.push({ sector: cleanSectorName(label), isServices: isServicesSector(label), values })
  }
  if (sectors.length === 0) throw new Error('no sector rows found.')
  return { period: null, states: states.map((s) => s.name), sectors }
}

/** Rows of a "No | Commodity | …" table: 'A' = services, 1..n = sectors, 'B' = merchandise total. */
function readCommodityRows(rows, start, readValues) {
  const sectors = []
  for (let r = start; r < rows.length; r += 1) {
    const row = rows[r] || []
    const marker = cleanText(row[0])
    const isSector = marker === 'A' || /^\d+$/.test(marker)
    if (isSector) {
      const label = cleanText(row[1])
      sectors.push({ sector: cleanSectorName(label), isServices: marker === 'A' || isServicesSector(label), values: readValues(row) })
    } else {
      break // 'B' (merchandise total) and everything after it is not a sector
    }
  }
  return sectors
}

function parseSectorStateCompare(rows, header) {
  const groupCells = strings(rows[header])
  const periodCells = rows[header + 1] || []

  const states = []
  for (let c = 2; c < groupCells.length; c += 1) {
    if (!groupCells[c]) continue
    const previousPeriod = parsePeriod(periodCells[c])
    const period = parsePeriod(periodCells[c + 1])
    states.push({ name: groupCells[c], col: c, previousPeriod, period })
  }
  if (states.length === 0) throw new Error('no state columns found.')

  const readValues = (row) => {
    const values = {}
    states.forEach(({ name, col }) => {
      const previous = num(row[col])
      const current = num(row[col + 1])
      if (previous !== null || current !== null) values[name] = { previous, current }
    })
    return values
  }

  const sectors = readCommodityRows(rows, header + 2, readValues)
  if (sectors.length === 0) throw new Error('no sector rows found.')
  return {
    period: states.find((state) => state.period)?.period ?? null,
    previousPeriod: states.find((state) => state.previousPeriod)?.previousPeriod ?? null,
    states: states.map((s) => s.name),
    sectors,
  }
}

function parseSectorIndiaCompare(rows, header) {
  const groupCells = strings(rows[header])
  const periodCells = rows[header + 1] || []

  // Column groups: "All India" and "Karnataka", each spanning until the next group name.
  const groups = []
  for (let c = 2; c < groupCells.length; c += 1) {
    if (groupCells[c]) groups.push({ name: groupCells[c], start: c })
  }
  groups.forEach((group, i) => {
    group.end = i + 1 < groups.length ? groups[i + 1].start : Math.max(groupCells.length, periodCells.length)
  })
  const india = groups.find((g) => /^all india$/i.test(g.name))
  const karnataka = groups.find((g) => /^karnataka$/i.test(g.name))
  if (!india || !karnataka) throw new Error('expected "All India" and "Karnataka" column groups.')

  const periodsIn = (group) => {
    const out = []
    for (let c = group.start; c < group.end; c += 1) {
      const period = parsePeriod(periodCells[c])
      if (period) out.push({ col: c, period })
    }
    return out
  }
  const indiaCols = periodsIn(india)
  if (indiaCols.length !== 2) throw new Error('expected two period columns under "All India".')
  const [indiaPrev, indiaCur] = indiaCols
  const karnatakaCols = periodsIn(karnataka)
  const kaPrev = karnatakaCols.find((c) => c.period.key === indiaPrev.period.key)
  const kaCur = karnatakaCols.find((c) => c.period.key === indiaCur.period.key)
  if (!kaPrev || !kaCur) throw new Error('the "Karnataka" columns do not match the "All India" periods.')

  const readValues = (row) => ({
    'All India': { previous: num(row[indiaPrev.col]), current: num(row[indiaCur.col]) },
    Karnataka: { previous: num(row[kaPrev.col]), current: num(row[kaCur.col]) },
  })
  const sectors = readCommodityRows(rows, header + 2, readValues)
  if (sectors.length === 0) throw new Error('no sector rows found.')

  // "Merchandise Exports - All India from Top 6 States" → per-state merchandise totals.
  const merchandiseTotals = {}
  const tableStart = rows.findIndex((row) => /^merchandise exports\s*-\s*all india/i.test(cleanText(row?.[0])))
  if (tableStart >= 0) {
    for (let r = tableStart + 1; r < rows.length; r += 1) {
      const row = rows[r] || []
      const marker = row[0]
      if (typeof marker === 'string' && cleanText(marker)) break
      const name = cleanText(row[1])
      if (!name) break
      merchandiseTotals[name] = { previous: num(row[kaPrev.col]), current: num(row[kaCur.col]) }
    }
  }

  return { period: indiaCur.period, previousPeriod: indiaPrev.period, sectors, merchandiseTotals }
}

const PARSERS = {
  period: parsePeriodSheet,
  districtComparison: parseDistrictComparison,
  countryDistrict: parseCountryDistrict,
  sectorDistrictMatrix: parseSectorDistrictMatrix,
  sectorStateCompare: parseSectorStateCompare,
  sectorStateSingle: parseSectorStateSingle,
  sectorIndiaCompare: parseSectorIndiaCompare,
}

// ---------------------------------------------------------------------------
// 3. Putting the sheets together
// ---------------------------------------------------------------------------

function differs(a, b, tolerance = TOLERANCE_WARN) {
  if (!isNumber(a) || !isNumber(b)) return false
  const base = Math.max(Math.abs(a), Math.abs(b), 1)
  return Math.abs(a - b) / base > tolerance
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0)
}

function variation(previous, current) {
  if (!isNumber(previous) || !isNumber(current) || previous <= 0) return null
  return Math.round(((current - previous) / previous) * 10000) / 100
}

function clampNoise(value) {
  if (value === null || value === undefined) return 0
  if (value < 0 && value > -0.01) return 0
  return roundValue(value)
}

/** Builds the release from the recognised sheets. Pushes problems onto `report`. */
function assemble(parsed, report) {
  const { errors, warnings } = report
  const byKind = (kind) => parsed.filter((p) => p.kind === kind)

  // Sheets from different periods (e.g. the annual and the quarterly workbook) must not be mixed.
  const periods = new Map()
  parsed.forEach((p) => {
    if (p.data.period) periods.set(p.data.period.key, p.data.period.label)
  })
  if (periods.size > 1) {
    errors.push(
      `These files are for different periods (${[...periods.values()].join(' and ')}). Upload one period's workbook at a time.`,
    )
    return null
  }

  // Each kind of sheet may appear once.
  Object.keys(KIND_LABELS).forEach((kind) => {
    const found = byKind(kind)
    if (found.length > 1) {
      errors.push(
        `More than one "${KIND_LABELS[kind]}" sheet was found (${found
          .map((f) => `${f.file} › ${f.sheet}`)
          .join('; ')}). Upload one period's workbook at a time.`,
      )
    }
  })

  const districtSheet = byKind('districtComparison')[0]
  if (!districtSheet) {
    // If the sheet was found but unreadable, its own error already explains the problem.
    if (report.failedKinds.has('districtComparison')) return null
    errors.push(
      'The district export comparison sheet is missing. It is the sheet with the columns "Districts", "% Variation" and "Major Product Exported". The website cannot be updated without it.',
    )
    return null
  }

  // The period comes from the template's "Period" sheet, or from the district sheet's own headers.
  const periodSheet = byKind('period')[0]
  const period = periodSheet?.data.period ?? districtSheet.data.period
  const previousPeriod = periodSheet?.data.previousPeriod ?? districtSheet.data.previousPeriod
  if (!period || !previousPeriod) {
    errors.push(
      'The period could not be found. Fill in the yellow cells on the "Period" sheet (for example "Q1 FY 2026-27" compared with "Q1 FY 2025-26").',
    )
    return null
  }

  // Every sheet must belong to that same period.
  parsed.forEach((p) => {
    const where = `${p.file} › ${p.sheet}`
    if (p.data.period && p.data.period.key !== period.key) {
      errors.push(`"${where}" is for ${p.data.period.label}, but the rest of the workbook is for ${period.label}. Upload one period's workbook at a time.`)
    }
    if (p.data.previousPeriod && p.data.previousPeriod.key !== previousPeriod.key) {
      errors.push(`"${where}" compares against ${p.data.previousPeriod.label}, but the rest of the workbook compares against ${previousPeriod.label}.`)
    }
  })
  if (errors.length > 0) return null

  // --- districts -----------------------------------------------------------
  const districts = districtSheet.data.districts.map((d) => ({
    name: d.name,
    previous: d.previous,
    current: d.current,
    variation: variation(d.previous, d.current),
    majorProducts: d.majorProducts,
  }))
  const districtNames = new Map(districts.map((d) => [nameKey(d.name), d.name]))
  if (districtNames.size !== districts.length) errors.push('The district sheet lists the same district twice.')

  const districtsCurrent = sum(districts.map((d) => d.current))
  const districtsPrevious = sum(districts.map((d) => d.previous))
  const sheetTotals = districtSheet.data.totals
  if (sheetTotals && differs(districtsCurrent, sheetTotals.current, 0.005)) {
    warnings.push(
      `District values add up to ${districtsCurrent.toFixed(1)} but the sheet's Total row says ${sheetTotals.current.toFixed(1)}.`,
    )
  }

  const mapDistrict = (rawName, where, missing) => {
    const name = districtNames.get(nameKey(rawName))
    if (!name && !missing.has(rawName)) {
      missing.add(rawName)
      warnings.push(`"${where}" has a district "${cleanText(rawName)}" that is not in the district sheet — it was skipped.`)
    }
    return name || null
  }

  // --- sectors × states ------------------------------------------------------
  const compareSheet = byKind('sectorStateCompare')[0]
  const singleSheet = byKind('sectorStateSingle')[0]
  const indiaSheet = byKind('sectorIndiaCompare')[0]

  const sectorNames = new Map() // key → { name, isServices }
  const rememberSector = (s) => {
    const key = nameKey(s.sector)
    if (!sectorNames.has(key)) sectorNames.set(key, { name: s.sector, isServices: s.isServices })
    return key
  }

  const stateNames = new Map() // key → display name, in sheet order
  const rememberState = (name) => {
    const key = nameKey(name)
    if (!stateNames.has(key)) stateNames.set(key, cleanText(name))
    return stateNames.get(key)
  }
  rememberState('All India')
  rememberState('Karnataka')

  const sectorStateRows = new Map() // sector key → values by state
  const mergeValues = (sheetSector, where = '') => {
    const key = rememberSector(sheetSector)
    const target = sectorStateRows.get(key) || {}
    Object.entries(sheetSector.values).forEach(([rawState, value]) => {
      const state = rememberState(rawState)
      const existing = target[state]
      if (!existing) {
        target[state] = { previous: roundValue(value.previous), current: roundValue(value.current) }
        return
      }
      if (existing.current !== null && differs(existing.current, value.current)) {
        warnings.push(`${where}: "${sheetSector.sector}" for ${state} differs between sheets (${existing.current.toFixed(1)} vs ${roundValue(value.current)?.toFixed(1)}).`)
      }
      if (value.current !== null) existing.current = roundValue(value.current)
      if (value.previous !== null) existing.previous = roundValue(value.previous)
    })
    sectorStateRows.set(key, target)
  }

  // Order matters: the first sheet to name a sector decides how it is spelled.
  if (indiaSheet) indiaSheet.data.sectors.forEach((s) => mergeValues(s))
  if (compareSheet) compareSheet.data.sectors.forEach((s) => mergeValues(s, compareSheet.sheet))
  if (singleSheet) {
    singleSheet.data.sectors.forEach((s) => mergeValues(s, singleSheet.sheet))
  }

  // --- sector × district -----------------------------------------------------
  const matrixSheet = byKind('sectorDistrictMatrix')[0]
  const missingDistricts = new Set()
  const sectorDistricts = []
  if (matrixSheet) {
    matrixSheet.data.sectors.forEach((s) => {
      const key = rememberSector(s)
      const values = {}
      Object.entries(s.values).forEach(([rawName, value]) => {
        const name = mapDistrict(rawName, matrixSheet.sheet, missingDistricts)
        const clean = clampNoise(value)
        if (name && clean > 0) values[name] = clean
      })
      sectorDistricts.push({
        sector: sectorNames.get(key).name,
        isServices: s.isServices,
        hsCode: s.hsCode,
        total: clampNoise(s.total),
        values,
      })
    })
    if (sectorDistricts.every((row) => Object.keys(row.values).length === 0)) sectorDistricts.length = 0 // sheet left blank
    const merchTotal = sum(matrixSheet.data.sectors.filter((s) => !s.isServices).map((s) => s.total || 0))
    if (sectorDistricts.length > 0 && differs(merchTotal, districtsCurrent)) {
      warnings.push(
        `The sector-by-district sheet adds up to ${merchTotal.toFixed(1)} but the district sheet adds up to ${districtsCurrent.toFixed(1)}.`,
      )
    }
  }

  // --- finish states ---------------------------------------------------------
  // A sector with no figures at all means that part of the sheet was left blank — treat it as absent.
  const hasFigures = (values) => Object.values(values).some((figure) => figure.current !== null)
  const sectorList = [...sectorNames.entries()]
    .filter(([key]) => sectorStateRows.has(key) && hasFigures(sectorStateRows.get(key)))
    .map(([key, s]) => ({ key, ...s }))

  const sectorStates = sectorList.map((s) => ({
    sector: s.name,
    isServices: s.isServices,
    values: sectorStateRows.get(s.key),
  }))

  const states = [...stateNames.values()]
  const stateTotals = {}
  if (sectorStates.length > 0) {
    const merchandise = sectorStates.filter((s) => !s.isServices)
    states.forEach((state) => {
      const rows = merchandise.map((s) => s.values[state])
      const missing = rows.filter((v) => !v || v.current === null).length
      if (missing > 0) {
        // Incomplete column — don't invent a total. Warn only when it was partly filled in.
        if (missing < rows.length) {
          warnings.push(`${state} is missing figures for ${missing} of ${rows.length} goods sectors, so its total was left out.`)
        }
        return
      }
      const current = roundValue(sum(rows.map((v) => v.current)))
      const hasPrevious = rows.every((v) => v.previous !== null)
      stateTotals[state] = { previous: hasPrevious ? roundValue(sum(rows.map((v) => v.previous))) : null, current }
    })
    // Last period's totals for states the sector table can't supply (Q1 workbooks list them separately).
    Object.entries(indiaSheet?.data.merchandiseTotals || {}).forEach(([rawState, value]) => {
      const key = nameKey(rawState)
      const state = [...stateNames.entries()].find(([k]) => k === key)?.[1]
      if (!state) return
      if (!stateTotals[state]) {
        if (value.current !== null) stateTotals[state] = { previous: roundValue(value.previous), current: roundValue(value.current) }
      } else if (stateTotals[state].previous === null && value.previous !== null) {
        stateTotals[state].previous = roundValue(value.previous)
      }
    })

    const karnataka = stateTotals.Karnataka
    if (karnataka && differs(karnataka.current, districtsCurrent)) {
      warnings.push(
        `Karnataka's merchandise total in the state sheets is ${karnataka.current.toFixed(1)} but the district sheet adds up to ${districtsCurrent.toFixed(1)}.`,
      )
    }
    if (!stateTotals.Karnataka) warnings.push('Karnataka was not found in the state sheets, so the States tab will be empty.')
  }

  // --- countries ---------------------------------------------------------------
  const countrySheet = byKind('countryDistrict')[0]
  const countryDistricts = []
  if (countrySheet) {
    const merged = new Map()
    const missing = new Set()
    countrySheet.data.entries.forEach((entry) => {
      const district = mapDistrict(entry.district, countrySheet.sheet, missing)
      if (!district) return
      const key = `${district}|${entry.country}`
      const existing = merged.get(key) || { district, country: entry.country, previous: 0, current: 0 }
      existing.previous += entry.previous
      existing.current += entry.current
      merged.set(key, existing)
    })
    merged.forEach((row) => {
      const previous = clampNoise(row.previous)
      const current = clampNoise(row.current)
      if (previous > 0 || current > 0) countryDistricts.push({ ...row, previous, current })
    })
    countryDistricts.sort((a, b) => a.district.localeCompare(b.district) || a.country.localeCompare(b.country))

    const countriesCurrent = sum(countryDistricts.map((r) => r.current))
    if (countryDistricts.length > 0 && differs(countriesCurrent, districtsCurrent)) {
      warnings.push(
        `The country sheet adds up to ${countriesCurrent.toFixed(1)} but the district sheet adds up to ${districtsCurrent.toFixed(1)}.`,
      )
    }
  }

  if (errors.length > 0) return null

  return {
    key: period.key,
    type: period.type,
    label: period.label,
    previousLabel: previousPeriod.label,
    unit: RELEASE_UNIT,
    source: districtSheet.data.source || 'DGCIS, Kolkata',
    totals: { previous: roundValue(districtsPrevious), current: roundValue(districtsCurrent) },
    districts,
    states: sectorStates.length > 0 ? states : [],
    stateTotals,
    sectorStates,
    sectorDistricts,
    countryDistricts,
  }
}

// ---------------------------------------------------------------------------
// 4. Public entry point
// ---------------------------------------------------------------------------

/**
 * @param {{ name: string, sheets: { sheet: string, data: unknown[][] }[] }[]} files
 */
export function parseMarketWorkbooks(files) {
  const report = { recognized: [], ignored: [], errors: [], warnings: [], failedKinds: new Set() }
  const parsed = []

  files.forEach((file) => {
    file.sheets.forEach(({ sheet, data }) => {
      const found = classifySheet(data)
      if (!found) {
        report.ignored.push({ file: file.name, sheet })
        return
      }
      try {
        const result = PARSERS[found.kind](data, found.header)
        parsed.push({ file: file.name, sheet, kind: found.kind, data: result })
        report.recognized.push({
          file: file.name,
          sheet,
          kind: found.kind,
          kindLabel: KIND_LABELS[found.kind],
          period: result.period?.label || null,
        })
      } catch (err) {
        report.failedKinds.add(found.kind)
        report.errors.push(`"${file.name} › ${sheet}" looks like "${KIND_LABELS[found.kind]}" but ${err.message}`)
      }
    })
  })

  if (parsed.length === 0 && report.errors.length === 0) {
    report.errors.push('None of the sheets in the selected file(s) look like export data. Check that you picked the right workbook.')
  }

  const release = parsed.length > 0 ? assemble(parsed, report) : null
  return { release, report }
}

/** What the website will be able to show for this release (used by the admin preview). */
export function releaseCoverage(release) {
  return {
    districts: release.districts.length > 0,
    sectorDistricts: release.sectorDistricts.length > 0,
    sectors: release.sectorStates.length > 0,
    states: Object.keys(release.stateTotals).length > 1,
    countries: release.countryDistricts.length > 0,
  }
}
