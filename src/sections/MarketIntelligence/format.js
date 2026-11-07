// All market figures are in US$ million. Every amount is shown in US$ million with two decimals
// ("US$ 11,184.37 Mn") so the numbers are directly comparable across districts, sectors and states.

const million = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** A plain US$ million figure with two decimals and thousands separators ("11,184.37"). */
export function formatMillion(valueMn) {
  if (valueMn === null || valueMn === undefined || Number.isNaN(valueMn)) return '—'
  return million.format(valueMn)
}

export function formatUsd(valueMn) {
  if (valueMn === null || valueMn === undefined || Number.isNaN(valueMn)) return '—'
  return `US$ ${million.format(valueMn)} Mn`
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
