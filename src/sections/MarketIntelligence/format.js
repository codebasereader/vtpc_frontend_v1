// All market figures are in US$ million. These helpers turn them into short,
// human-readable text ("US$ 11.18 bn", "US$ 856 Mn").

const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function formatUsd(valueMn) {
  if (valueMn === null || valueMn === undefined || Number.isNaN(valueMn)) return '—'
  const abs = Math.abs(valueMn)
  if (abs >= 1000) return `US$ ${(valueMn / 1000).toFixed(2)} bn`
  if (abs >= 100) return `US$ ${grouped.format(valueMn)} Mn`
  if (abs >= 1) return `US$ ${valueMn.toFixed(1)} Mn`
  if (abs >= 0.01) return `US$ ${valueMn.toFixed(2)} Mn`
  if (abs > 0) return 'Under US$ 0.01 Mn'
  return 'US$ 0'
}

export function formatShare(percent) {
  if (percent === null || percent === undefined || Number.isNaN(percent)) return ''
  if (percent > 0 && percent < 0.1) return '<0.1'
  return percent >= 10 ? percent.toFixed(0) : percent.toFixed(1)
}

/** Percentage change, or null when there is nothing sensible to compare with. */
export function percentChange(previous, current) {
  if (previous === null || previous === undefined || current === null || current === undefined) return null
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}

/** Replaces {name} placeholders in a translated string. */
export function fill(text, values) {
  return Object.entries(values).reduce((out, [key, value]) => out.replaceAll(`{${key}}`, String(value)), text)
}
