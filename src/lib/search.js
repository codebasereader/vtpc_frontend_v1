const HIDDEN_KEYS = new Set(['id', '_id', '__v', 'createdAt', 'updatedAt', 'depth'])

function collectText(value, out) {
  if (value == null) return
  if (typeof value === 'string' || typeof value === 'number') {
    out.push(String(value))
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, out))
  } else if (typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      if (!HIDDEN_KEYS.has(key)) collectText(item, out)
    })
  }
}

// Case-insensitive match against every text field of a record (bilingual
// text, nested lists, etc.), so a list search finds a record by any of its
// visible content — English or Kannada.
export function matchesSearch(record, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const parts = []
  collectText(record, parts)
  return parts.join(' ').toLowerCase().includes(needle)
}

export function filterBySearch(records, query) {
  return query.trim() ? records.filter((record) => matchesSearch(record, query)) : records
}

// yyyy-mm-dd (date input value) → Date at start/end of that local day.
export function startOfDay(value) {
  return value ? new Date(`${value}T00:00:00`) : null
}

export function endOfDay(value) {
  return value ? new Date(`${value}T23:59:59.999`) : null
}

export function isWithinDates(dateValue, from, to) {
  if (!from && !to) return true
  if (!dateValue) return false
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false
  if (from && date < startOfDay(from)) return false
  if (to && date > endOfDay(to)) return false
  return true
}
