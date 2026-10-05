// Text, name and period helpers for the Market Data workbook parser.
// Plain JS with no browser/Node APIs so the admin upload page and the CLI
// script can share it.

/** Collapse whitespace/newlines (the sheets have "Q1 \r\nFY 2025-26"-style headers). */
export function cleanText(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

/** Letters-only lowercase key — matches "Chamaraja nagara" with "CHAMARAJANAGARA". */
export function nameKey(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z]/g, '')
}

// Districts whose public name differs from the name in the DGCIS sheets.
const DISTRICT_DISPLAY_NAMES = { ramanagara: 'Bangalore South (Ramanagara)' }

/** Letters-only key that ignores the display rename, so "Ramanagara" and "Bangalore South (Ramanagara)" match. */
export function districtKey(value) {
  const key = nameKey(value)
  return key.endsWith('ramanagara') ? 'ramanagara' : key
}

export function districtDisplayName(value) {
  return DISTRICT_DISPLAY_NAMES[districtKey(value)] ?? cleanText(value)
}

/**
 * Applies the district rename to a release that was published before the rename
 * existed (district names are also keys inside the release, so all are updated).
 */
export function normalizeRelease(release) {
  if (!release || typeof release !== 'object') return release
  const rename = districtDisplayName
  return {
    ...release,
    districts: (release.districts || []).map((d) => ({ ...d, name: rename(d.name) })),
    sectorDistricts: (release.sectorDistricts || []).map((row) => ({
      ...row,
      values: Object.fromEntries(Object.entries(row.values || {}).map(([name, value]) => [rename(name), value])),
    })),
    countryDistricts: (release.countryDistricts || []).map((row) => ({ ...row, district: rename(row.district) })),
  }
}

export function titleCase(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/(^|[\s(-])([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase())
}

const SECTOR_TYPOS = [
  [/bevarages/i, 'beverages'],
  [/kernals/i, 'kernels'],
]

export function cleanSectorName(value) {
  let name = cleanText(value)
  SECTOR_TYPOS.forEach(([pattern, fix]) => {
    name = name.replace(pattern, fix)
  })
  return name
}

export function isServicesSector(name) {
  return /^software/i.test(cleanText(name))
}

export function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Round to 6 decimals (US$ 1) and flatten floating-point noise like -2.8e-14 to 0. */
export function roundValue(value) {
  if (!isNumber(value)) return null
  const rounded = Math.round(value * 1e6) / 1e6
  return rounded === 0 ? 0 : rounded
}

const ORDINALS = {
  1: 1, first: 1, '1st': 1,
  2: 2, second: 2, '2nd': 2,
  3: 3, third: 3, '3rd': 3,
  4: 4, fourth: 4, '4th': 4,
}

/**
 * Reads a period out of header/title text.
 *   "2025-26"                          → FY 2025-26
 *   "Q1 \r\nFY 2026-27"                → Q1 FY 2026-27
 *   "First Quarter of FY 2026-27"      → Q1 FY 2026-27
 * Returns null when there is no financial year in the text.
 */
export function parsePeriod(text) {
  const raw = cleanText(text)
  const years = [...raw.matchAll(/(\d{4})\s*[-–—]\s*(\d{2,4})/g)]
  if (years.length === 0) return null
  const startYear = years[years.length - 1][1]
  const endYear = years[years.length - 1][2].slice(-2)
  const fy = `${startYear}-${endYear}`

  let quarter = null
  const qMatch = raw.match(/\bQ([1-4])\b/i)
  if (qMatch) quarter = Number(qMatch[1])
  else {
    const wordMatch = raw.match(/\b(first|second|third|fourth|1st|2nd|3rd|4th)\s+(?:quarter|qtr)\b/i)
    if (wordMatch) quarter = ORDINALS[wordMatch[1].toLowerCase()]
  }

  return {
    fy,
    quarter,
    type: quarter ? 'quarter' : 'year',
    label: quarter ? `Q${quarter} FY ${fy}` : `FY ${fy}`,
    key: quarter ? `q${quarter}-fy-${fy}` : `fy-${fy}`,
  }
}

/** DGCIS abbreviations used in the sheets → names a visitor recognises. */
const COUNTRY_ALIASES = {
  'ameri samoa': 'American Samoa',
  antartica: 'Antarctica',
  antigua: 'Antigua and Barbuda',
  'baharain is': 'Bahrain',
  'bangladesh pr': 'Bangladesh',
  'bosnia-hrzgovin': 'Bosnia and Herzegovina',
  'br virgn is': 'British Virgin Islands',
  'c afri rep': 'Central African Republic',
  'cape verde is': 'Cape Verde',
  'cayman is': 'Cayman Islands',
  'china p rp': 'China',
  'congo d. rep.': 'DR Congo',
  'congo p rep': 'Congo',
  'cook is': 'Cook Islands',
  "cote d' ivoire": "Côte d'Ivoire",
  'dominic rep': 'Dominican Republic',
  'egypt a rp': 'Egypt',
  'equtl guinea': 'Equatorial Guinea',
  'fiji is': 'Fiji',
  'fr guiana': 'French Guiana',
  'fr polynesia': 'French Polynesia',
  'guinea bissau': 'Guinea-Bissau',
  'kiribati rep': 'Kiribati',
  'korea dp rp': 'North Korea',
  'korea rp': 'South Korea',
  kyrghyzstan: 'Kyrgyzstan',
  'lao pd rp': 'Laos',
  macedonia: 'North Macedonia',
  'marshall island': 'Marshall Islands',
  'n. mariana is.': 'Northern Mariana Islands',
  'nauru rp': 'Nauru',
  netherland: 'Netherlands',
  netherlandantil: 'Netherlands Antilles',
  'norfolk is': 'Norfolk Island',
  'pakistan ir': 'Pakistan',
  'panama republic': 'Panama',
  'papua n gna': 'Papua New Guinea',
  'pitcairn is.': 'Pitcairn Islands',
  'saharwi a.dm rp': 'Western Sahara',
  'sao tome': 'Sao Tome and Principe',
  'saudi arab': 'Saudi Arabia',
  'sint maarten (dutch part)': 'Sint Maarten',
  'slovak rep': 'Slovakia',
  'solomon is': 'Solomon Islands',
  'sri lanka dsr': 'Sri Lanka',
  'st helena': 'Saint Helena',
  'st kitt n a': 'Saint Kitts and Nevis',
  'st lucia': 'Saint Lucia',
  'st vincent': 'Saint Vincent and the Grenadines',
  'state of palestine': 'Palestine',
  swaziland: 'Eswatini',
  'tanzania rep': 'Tanzania',
  trinidad: 'Trinidad and Tobago',
  'turks c is': 'Turks and Caicos Islands',
  'u arab emts': 'United Arab Emirates',
  'u k': 'United Kingdom',
  'u s a': 'United States',
  ug: 'Uganda',
  'us minor outlying islands': 'US Minor Outlying Islands',
  'vanuatu rep': 'Vanuatu',
  'vietnam soc rep': 'Vietnam',
  'virgin is us': 'US Virgin Islands',
  'yemen republc': 'Yemen',
  reunion: 'Reunion',
}

export function cleanCountryName(value) {
  const name = cleanText(value)
  return COUNTRY_ALIASES[name.toLowerCase()] || name
}
