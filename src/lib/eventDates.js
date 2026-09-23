const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const MONTHS_KN = [
  'ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್',
  'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್',
]

function pad2(n) {
  return String(n).padStart(2, '0')
}

// { dayRange: "02-06" | "TBA", monthYear: "Apr 2026" | "Apr–May 2026" | "2027" }
export function describeEventDate(event, language = 'en') {
  const months = language === 'kn' ? MONTHS_KN : MONTHS_EN

  if (event.isDateTBA) {
    return { dayRange: 'TBA', monthYear: event.tbaYear ? String(event.tbaYear) : '' }
  }

  const start = event.startDate ? new Date(event.startDate) : null
  if (!start) return { dayRange: '', monthYear: '' }
  const end = event.endDate ? new Date(event.endDate) : start

  const dayRange = start.getDate() === end.getDate() && start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
    ? pad2(start.getDate())
    : `${pad2(start.getDate())}-${pad2(end.getDate())}`

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const monthYear = sameMonth
    ? `${months[start.getMonth()]} ${start.getFullYear()}`
    : start.getFullYear() === end.getFullYear()
      ? `${months[start.getMonth()]}–${months[end.getMonth()]} ${start.getFullYear()}`
      : `${months[start.getMonth()]} ${start.getFullYear()}–${months[end.getMonth()]} ${end.getFullYear()}`

  return { dayRange, monthYear }
}

// TBA events are always treated as upcoming — there's no known end date
// that could have already passed.
export function getEventStatus(event) {
  if (event.isDateTBA) return 'upcoming'
  const end = event.endDate || event.startDate
  if (!end) return 'upcoming'
  return new Date(end) < new Date() ? 'completed' : 'upcoming'
}

// Whether an event's date falls within [filterStart, filterEnd] (either
// may be omitted). Compares against the event's start date; TBA events
// with no real date never match a date-range filter.
export function matchesDateRange(event, filterStart, filterEnd) {
  if (event.isDateTBA || !event.startDate) return !filterStart && !filterEnd
  const start = new Date(event.startDate)
  if (filterStart && start < new Date(filterStart)) return false
  if (filterEnd && start > new Date(filterEnd)) return false
  return true
}
