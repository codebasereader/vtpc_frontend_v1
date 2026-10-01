import { ADMIN_SECTIONS } from '../constants/adminSections'

// Static class strings so Tailwind keeps them.
const TONES = {
  green: 'bg-green-50 text-green-700',
  gray: 'bg-gray-100 text-gray-600',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  purple: 'bg-purple-50 text-purple-700',
  teal: 'bg-teal-50 text-teal-700',
  orange: 'bg-orange-50 text-orange-700',
}

export const AUDIT_ACTIONS = {
  login: { label: 'Signed in', tone: 'green' },
  logout: { label: 'Signed out', tone: 'gray' },
  session_expired: { label: 'Session ended', tone: 'amber' },
  login_failed: { label: 'Failed sign-in', tone: 'red' },
  access_denied: { label: 'Access denied', tone: 'red' },
  create: { label: 'Created', tone: 'blue' },
  update: { label: 'Updated', tone: 'indigo' },
  delete: { label: 'Deleted', tone: 'red' },
  status_change: { label: 'Status changed', tone: 'purple' },
  send: { label: 'Sent', tone: 'teal' },
  permissions_change: { label: 'Access changed', tone: 'orange' },
  password_change: { label: 'Password changed', tone: 'gray' },
  password_reset: { label: 'Password reset', tone: 'gray' },
}

export function actionLabel(action) {
  return AUDIT_ACTIONS[action]?.label || action
}

export function actionTone(action) {
  return TONES[AUDIT_ACTIONS[action]?.tone] || TONES.gray
}

const SECTION_TITLES = Object.fromEntries(ADMIN_SECTIONS.map((section) => [section.key, section.title]))

export function resourceLabel(resource) {
  if (!resource) return '—'
  return SECTION_TITLES[resource] || resource
}

export const ENDED_BY = {
  logout: 'Signed out',
  expired: 'Session expired',
  deactivated: 'Account deactivated',
  password_reset: 'Password reset',
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatDuration(from, to) {
  if (!from) return '—'
  const ms = Math.max(0, (to ? new Date(to) : new Date()) - new Date(from))
  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return 'under a minute'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return rest ? `${hours} h ${rest} min` : `${hours} h`
  const days = Math.floor(hours / 24)
  return `${days} d ${hours % 24} h`
}

// A change value (string, number, boolean, list, object or empty) as readable text.
export function formatChangeValue(value) {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    if (value.every((item) => item === null || typeof item !== 'object')) return value.join(', ')
    return JSON.stringify(value, null, 2)
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

// A short browser/OS label from a user-agent string.
export function browserLabel(userAgent = '') {
  if (!userAgent) return '—'
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'Browser'
  const os = /Windows/.test(userAgent)
    ? 'Windows'
    : /Android/.test(userAgent)
      ? 'Android'
      : /iPhone|iPad/.test(userAgent)
        ? 'iOS'
        : /Mac OS/.test(userAgent)
          ? 'macOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : ''
  return os ? `${browser} on ${os}` : browser
}
