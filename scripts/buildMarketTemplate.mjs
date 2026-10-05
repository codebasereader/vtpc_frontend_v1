// Regenerates the downloadable Market Data template.
//
//   npm run build-market-template
//
// Output: public/templates/VTPC-Market-Data-Template.xlsx (linked from Admin → Market Data).
// Re-run it whenever src/lib/marketData/template.js changes, and commit the .xlsx.

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import writeExcelFile from 'write-excel-file/node'
import { buildTemplateSheets, TEMPLATE_FILE_NAME } from '../src/lib/marketData/template.js'

const outDir = path.resolve('public/templates')
await mkdir(outDir, { recursive: true })
const target = path.join(outDir, TEMPLATE_FILE_NAME)

await writeExcelFile(buildTemplateSheets()).toFile(target)
console.log(`Wrote ${target}`)
