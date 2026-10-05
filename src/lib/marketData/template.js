// Builds the blank "Market Data" Excel template that staff fill in each period.
// Returns plain sheet descriptions; scripts/buildMarketTemplate.mjs writes them to
// public/templates/. The sheets use exactly the layouts parse.js recognises, so a
// filled template and a DGCIS workbook go through the same code.
//
// Rules the template follows (keep them in step with parse.js):
//   - sheets are recognised by their header row, not their name
//   - "Previous period" / "Current period" columns carry no dates — the period
//     lives on the "Period" sheet
//   - a sheet (or sector row) left completely blank is treated as "not provided"

export const TEMPLATE_VERSION = 1
export const TEMPLATE_FILE_NAME = 'VTPC-Market-Data-Template.xlsx'

export const KARNATAKA_DISTRICTS = [
  'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar',
  'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada',
  'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
  'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada',
  'Vijayapura', 'Yadgir',
]

export const SERVICES_SECTOR = 'Software & Services Exports'

export const GOODS_SECTORS = [
  'Electronics & Semiconductor', 'Pharmaceuticals', 'Silk Product', 'Textiles, Garments, Wool & Woollen Products',
  'Aerospace', 'Petroleum', 'Engineering', 'Automobile', 'Iron Ore and Minerals', 'Coffee, Excl Instant Coffee',
  'Cashew & Cashew Kernels', 'Spices', 'Agriculture and Processed food including seeds and beverages',
  'Marine Products', 'Gems and Jewellery', 'Leather Products', 'Handicrafts', 'Chemicals & Allied Products',
  'Plastic Goods', 'Optical and Medical instrument', 'Others',
]

export const TEMPLATE_STATES = [
  'All India', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Gujarat', 'Andhra Pradesh', 'Telangana',
  'Uttar Pradesh', 'Other States',
]

const NAVY = '#163a6d'
const INPUT_FILL = '#FFF2CC'
const LABEL_FILL = '#F1F1F1'
const NUMBER_FORMAT = '#,##0.000000'
const TOTAL_FORMAT = '#,##0.00'

const title = (text) => ({ value: text, fontWeight: 'bold', fontSize: 14, textColor: NAVY })
const header = (text) => ({
  value: text, fontWeight: 'bold', textColor: '#ffffff', backgroundColor: NAVY, wrap: true, align: 'center', alignVertical: 'center',
})
const label = (text) => ({ value: text, backgroundColor: LABEL_FILL })
const input = (value = null) => ({ value, type: Number, format: NUMBER_FORMAT, backgroundColor: INPUT_FILL })
const textInput = (value = null) => ({ value, backgroundColor: INPUT_FILL, wrap: true })
const formula = (value) => ({ value, type: 'Formula', format: TOTAL_FORMAT, backgroundColor: LABEL_FILL, fontWeight: 'bold' })

/** 0 → A, 25 → Z, 26 → AA … (for SUM formulas). */
function columnLetter(index) {
  let n = index
  let out = ''
  do {
    out = String.fromCharCode(65 + (n % 26)) + out
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return out
}

function readMeSheet() {
  const heading = (text) => [{ value: text, fontWeight: 'bold', textColor: NAVY, fontSize: 12 }]
  const line = (text) => [{ value: text, wrap: true, alignVertical: 'top' }]
  return {
    sheet: 'Read me',
    columns: [{ width: 120 }],
    data: [
      [title('VTPC Market Data — upload template')],
      line(`Template version ${TEMPLATE_VERSION}. Fill this workbook for ONE period (a quarter, or a full financial year), then upload it at Admin → Exporter Corner → Market Data.`),
      line(''),
      heading('How to fill it'),
      line('1.  Period sheet — type the period you are reporting and the earlier period it is compared with, e.g. "Q1 FY 2026-27" and "Q1 FY 2025-26" (or "FY 2025-26" and "FY 2024-25").'),
      line('2.  Districts sheet (required) — for every district enter the previous-period and current-period exports, and the main products exported.'),
      line('3.  Sector by District — the exports of each sector from each district for the CURRENT period. Optional.'),
      line('4.  Sector by State — for each sector, the previous and current figures for All India, Karnataka and the other states. Optional. Leave "Previous" blank where you do not have it.'),
      line('5.  Countries (optional) — one row per district and destination country. Usually only for the full financial year; leave it empty for a quarter.'),
      line('6.  Save as .xlsx and upload. The admin page shows a preview and any problems before anything goes live.'),
      line(''),
      heading('Rules'),
      line('•  All values are in US$ MILLION (not rupees, not crore). Yellow cells are the ones to fill.'),
      line('•  Type 0 where there were no exports. Leave a cell BLANK only when you do not have the figure.'),
      line('•  Do not rename sheets, change header rows, or add, delete or re-order columns. District, sector and state names must stay as printed.'),
      line('•  Grey cells are formulas that add things up for you — do not type over them.'),
      line('•  A sheet you leave completely empty is simply skipped; the matching tab on the website is hidden or reduced.'),
      line('•  Software & Services (RBI estimate) goes on the "Sector by State" sheet only. It is shown separately from goods exports on the website.'),
      line('•  Uploading a period that is already on the website replaces it.'),
      line(''),
      heading('Which sheet feeds what on the website'),
      line('Districts → "By district" tab and the headline numbers'),
      line('Sector by District → the sector filter on the "By district" tab'),
      line('Sector by State → "Karnataka vs other states" and "By sector" tabs'),
      line('Countries → "By country" tab'),
    ],
  }
}

function periodSheet(sample) {
  return {
    sheet: 'Period',
    columns: [{ width: 20 }, { width: 24 }, { width: 70 }],
    data: [
      [label('Period'), textInput(sample ? 'Q1 FY 2026-27' : null), { value: 'The period you are reporting, e.g. Q1 FY 2026-27  or  FY 2025-26' }],
      [label('Compared with'), textInput(sample ? 'Q1 FY 2025-26' : null), { value: 'The earlier period to compare against, e.g. Q1 FY 2025-26  or  FY 2024-25' }],
    ],
  }
}

function districtsSheet(sample) {
  const first = 3 // Excel row of the first district
  const last = first + KARNATAKA_DISTRICTS.length - 1
  const rows = KARNATAKA_DISTRICTS.map((name, i) => {
    const r = first + i
    return [
      label(i + 1),
      label(name),
      input(sample ? i : null),
      input(sample ? i + 1 : null),
      formula(`=IF(C${r}>0,(D${r}-C${r})/C${r}*100,"")`),
      textInput(sample ? 'Sample product' : null),
    ]
  })
  return {
    sheet: 'Districts',
    columns: [{ width: 6 }, { width: 24 }, { width: 18 }, { width: 18 }, { width: 16 }, { width: 70 }],
    stickyRowsCount: 2,
    data: [
      [title('Districtwise goods exports of Karnataka (US$ million)')],
      ['No', 'Districts', 'Previous period', 'Current period', '% Variation (auto)', 'Major Product Exported (optional)'].map(header),
      ...rows,
      [label('Total'), label(null), formula(`=SUM(C${first}:C${last})`), formula(`=SUM(D${first}:D${last})`), label(null), label(null)],
    ],
  }
}

function sectorDistrictSheet(sample) {
  const first = 3
  const last = first + GOODS_SECTORS.length - 1
  const lastCol = columnLetter(1 + KARNATAKA_DISTRICTS.length) // Karnataka col is B; districts C…
  const rows = GOODS_SECTORS.map((sector, i) => {
    const r = first + i
    return [label(sector), formula(`=SUM(C${r}:${lastCol}${r})`), ...KARNATAKA_DISTRICTS.map(() => input(sample ? 0.5 : null))]
  })
  const totals = ['Karnataka', ...KARNATAKA_DISTRICTS].map((_, c) => {
    const col = columnLetter(1 + c)
    return formula(`=SUM(${col}${first}:${col}${last})`)
  })
  return {
    sheet: 'Sector by District',
    columns: [{ width: 46 }, { width: 16 }, ...KARNATAKA_DISTRICTS.map(() => ({ width: 15 }))],
    stickyRowsCount: 2,
    stickyColumnsCount: 1,
    data: [
      [title('Sector-wise goods exports by district — CURRENT period (US$ million)')],
      ['Brief Description', 'Karnataka', ...KARNATAKA_DISTRICTS].map(header),
      ...rows,
      [label('Total'), ...totals],
    ],
  }
}

function sectorStateSheet(sample) {
  const first = 4 // Excel row of the first goods sector (row 3 is the services row)
  const last = first + GOODS_SECTORS.length - 1
  const stateHeader = [header('No'), header('Commodity')]
  const periodHeader = [header(''), header('')]
  TEMPLATE_STATES.forEach((state) => {
    stateHeader.push({ ...header(state), columnSpan: 2 }, null)
    periodHeader.push(header('Previous'), header('Current'))
  })
  const inputs = () => TEMPLATE_STATES.flatMap(() => [input(sample ? 2 : null), input(sample ? 3 : null)])
  const totals = TEMPLATE_STATES.flatMap((_, s) => {
    const prev = columnLetter(2 + s * 2)
    const cur = columnLetter(3 + s * 2)
    return [formula(`=SUM(${prev}${first}:${prev}${last})`), formula(`=SUM(${cur}${first}:${cur}${last})`)]
  })
  return {
    sheet: 'Sector by State',
    columns: [{ width: 6 }, { width: 50 }, ...TEMPLATE_STATES.flatMap(() => [{ width: 15 }, { width: 15 }])],
    stickyRowsCount: 3,
    stickyColumnsCount: 2,
    data: [
      [title('Sector-wise exports by state (US$ million)')],
      stateHeader,
      periodHeader,
      [label('A'), label(SERVICES_SECTOR), ...inputs()],
      ...GOODS_SECTORS.map((sector, i) => [label(i + 1), label(sector), ...inputs()]),
      [label('B'), label('Total goods exports (auto)'), ...totals],
    ],
  }
}

function countriesSheet(sample) {
  const rows = sample
    ? [['Bengaluru Urban', 'United States', 10, 12], ['Kolar', 'United Arab Emirates', 5, 4]].map(([d, c, p, n]) => [d, c, input(p), input(n)])
    : []
  return {
    sheet: 'Countries (optional)',
    columns: [{ width: 24 }, { width: 28 }, { width: 18 }, { width: 18 }, { width: 4 }, { width: 80 }],
    stickyRowsCount: 1,
    data: [
      [...['District', 'Country', 'Previous period', 'Current period'].map(header), null, { value: 'One row per district and country, US$ million. Paste your rows below the header. Leave empty if this period has no country data.', wrap: true }],
      ...rows,
    ],
  }
}

/** `sample: true` fills every input with dummy numbers — used only to test the round trip. */
export function buildTemplateSheets({ sample = false } = {}) {
  return [readMeSheet(), periodSheet(sample), districtsSheet(sample), sectorDistrictSheet(sample), sectorStateSheet(sample), countriesSheet(sample)]
}
