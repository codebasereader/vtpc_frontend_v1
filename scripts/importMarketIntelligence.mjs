// Converts one period's export-data workbook(s) into the "market release" JSON
// that the backend stores (see docs/backend-requests/19-market-data-releases.md).
//
//   node scripts/importMarketIntelligence.mjs "<workbook.xlsx>" [more.xlsx ...] [--out <dir>]
//
// It uses the same parser as the admin "Market Data" upload page, so what you
// see here is exactly what staff will get when they upload the file.
// One run = one period; pass the workbook(s) for that period only.

import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import readXlsxFile from 'read-excel-file/node'
import { parseMarketWorkbooks, releaseCoverage } from '../src/lib/marketData/parse.js'

const DEFAULT_OUT = 'docs/backend-requests/data/market-intelligence/releases'

const args = process.argv.slice(2)
const outIndex = args.indexOf('--out')
const outDir = outIndex >= 0 ? args.splice(outIndex, 2)[1] : DEFAULT_OUT
const inputs = args

if (inputs.length === 0) {
  console.error('Usage: node scripts/importMarketIntelligence.mjs "<workbook.xlsx>" [more.xlsx ...] [--out <dir>]')
  process.exit(1)
}

const files = []
for (const input of inputs) {
  const sheets = await readXlsxFile(await readFile(input))
  files.push({ name: path.basename(input), sheets })
}

const { release, report } = parseMarketWorkbooks(files)

console.log('\nSheets')
report.recognized.forEach((r) => console.log(`  ✔ ${r.file} › ${r.sheet}  →  ${r.kindLabel}${r.period ? ` (${r.period})` : ''}`))
report.ignored.forEach((r) => console.log(`  – ${r.file} › ${r.sheet}  →  not recognised, ignored`))

if (report.warnings.length) {
  console.log('\nWarnings')
  report.warnings.forEach((w) => console.log(`  ⚠ ${w}`))
}
if (report.errors.length) {
  console.log('\nErrors')
  report.errors.forEach((e) => console.log(`  ✖ ${e}`))
}

if (!release || report.errors.length) {
  console.error('\nNo file written.')
  process.exit(1)
}

const coverage = releaseCoverage(release)
console.log(`\nPeriod        ${release.label}  (compared with ${release.previousLabel})`)
console.log(`Total         US$ ${release.totals.current.toFixed(1)} Mn  (was ${release.totals.previous.toFixed(1)})`)
console.log(`Districts     ${release.districts.length}`)
console.log(`Sectors       ${release.sectorStates.length}`)
console.log(`States        ${Object.keys(release.stateTotals).length}`)
console.log(`Country rows  ${release.countryDistricts.length}`)
console.log('Covers        ' + Object.entries(coverage).map(([k, v]) => `${k}:${v ? 'yes' : 'no'}`).join('  '))

await mkdir(outDir, { recursive: true })
const target = path.join(outDir, `${release.key}.json`)
await writeFile(target, `${JSON.stringify(release, null, 1)}\n`)
console.log(`\nWrote ${target}`)
