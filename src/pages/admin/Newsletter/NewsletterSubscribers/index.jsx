import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Download, Send } from 'lucide-react'
import { getNewsletterSubscribers, setNewsletterSubscriberStatus } from '../../../../api/newsletterApi'
import { ROUTES } from '../../../../constants/routes'
import { SearchInput, DateRangeFilter, NoResults } from '../../../../components/ListFilters'
import ConfirmDialog from '../../../../components/ConfirmDialog'
import { matchesSearch, isWithinDates } from '../../../../lib/search'

const STATUS_TABS = [
  ['all', 'All'],
  ['active', 'Active'],
  ['blocked', 'Blocked'],
]

// Subscribers are active unless the backend says otherwise.
const isBlocked = (sub) => sub.status === 'blocked'

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// Exports exactly what is on screen (current search, status and date range).
function downloadCsv(rows) {
  const lines = [
    'email,status,subscribedAt',
    ...rows.map((r) => `${csvEscape(r.email)},${isBlocked(r) ? 'blocked' : 'active'},${csvEscape(r.createdAt || '')}`),
  ]
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'newsletter-subscribers.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [pendingBlock, setPendingBlock] = useState(null)
  const [updatingEmail, setUpdatingEmail] = useState(null)

  useEffect(() => {
    let isMounted = true
    getNewsletterSubscribers()
      .then((data) => {
        if (isMounted) setSubscribers(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load subscribers.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const counts = useMemo(() => {
    const blocked = subscribers.filter(isBlocked).length
    return { all: subscribers.length, active: subscribers.length - blocked, blocked }
  }, [subscribers])

  const hasDates = subscribers.some((sub) => sub.createdAt)
  const visibleSubscribers = useMemo(
    () =>
      subscribers.filter(
        (sub) =>
          (statusFilter === 'all' || (statusFilter === 'blocked') === isBlocked(sub)) &&
          matchesSearch({ email: sub.email }, search) &&
          isWithinDates(sub.createdAt, dateRange.from, dateRange.to),
      ),
    [subscribers, statusFilter, search, dateRange],
  )
  const isFiltered = Boolean(search.trim() || dateRange.from || dateRange.to || statusFilter !== 'all')

  async function changeStatus(sub, status) {
    setError('')
    setUpdatingEmail(sub.email)
    try {
      if (!sub.id) throw new Error('The server did not return an id for this subscriber, so it cannot be updated yet.')
      const updated = await setNewsletterSubscriberStatus(sub.id, status)
      setSubscribers((prev) =>
        prev.map((item) => (item.email === sub.email ? { ...item, ...updated, status: updated?.status || status } : item)),
      )
      setPendingBlock(null)
    } catch (err) {
      setError(err.message || 'Failed to update the subscriber.')
      setPendingBlock(null)
    } finally {
      setUpdatingEmail(null)
    }
  }

  function handleToggle(sub) {
    // Blocking needs confirmation; re-activating is harmless and immediate.
    if (isBlocked(sub)) changeStatus(sub, 'active')
    else setPendingBlock(sub)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Newsletter Subscribers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Everyone who signed up via the footer form. Blocked subscribers stay on the list but no longer receive
            newsletters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.ADMIN_NEWSLETTER_ISSUES}
            className="flex items-center gap-2 rounded-lg border border-brand-divider px-4 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-page"
          >
            <Send size={16} strokeWidth={2} />
            Send Newsletter
          </Link>
          <button
            type="button"
            onClick={() => downloadCsv(visibleSubscribers)}
            disabled={visibleSubscribers.length === 0}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-50"
          >
            <Download size={16} strokeWidth={2} />
            {isFiltered ? 'Export filtered CSV' : 'Export CSV'}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isLoading && subscribers.length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                aria-pressed={statusFilter === key}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === key
                    ? 'bg-brand-navy-dark text-white'
                    : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
                }`}
              >
                {label} ({counts[key]})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by email…" />
            {hasDates ? (
              <DateRangeFilter
                from={dateRange.from}
                to={dateRange.to}
                onChange={setDateRange}
                fromLabel="Subscribed from"
                toLabel="Subscribed to"
              />
            ) : (
              <p className="text-xs text-gray-500">Date filters appear once the server returns subscription dates.</p>
            )}
          </div>
        </div>
      )}

      <p className="mt-5 text-sm font-semibold text-brand-navy-dark">
        {isLoading
          ? 'Loading…'
          : isFiltered
            ? `${visibleSubscribers.length} of ${subscribers.length} subscribers`
            : `${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`}
      </p>

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading subscribers…</p>}

      {!isLoading && subscribers.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No subscribers yet.
        </p>
      )}

      {!isLoading && isFiltered && subscribers.length > 0 && visibleSubscribers.length === 0 && (
        <NoResults query={search} />
      )}

      {!isLoading && visibleSubscribers.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-divider bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-divider bg-brand-page">
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Subscribed on</th>
                <th className="px-4 py-3 text-right text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Receives newsletters
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {visibleSubscribers.map((sub) => {
                const blocked = isBlocked(sub)
                return (
                  <tr key={sub.id || sub.email} className="transition-colors hover:bg-brand-page/60">
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-2 font-medium ${blocked ? 'text-gray-400 line-through' : 'text-brand-dark'}`}
                      >
                        <Mail size={14} className="text-gray-400" aria-hidden="true" />
                        {sub.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            blocked ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {blocked ? 'Blocked' : 'Active'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!blocked}
                          aria-label={`${blocked ? 'Unblock' : 'Block'} ${sub.email}`}
                          disabled={updatingEmail === sub.email}
                          onClick={() => handleToggle(sub)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                            blocked ? 'bg-gray-300' : 'bg-green-500'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              blocked ? 'translate-x-0.5' : 'translate-x-[22px]'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingBlock)}
        title="Block this subscriber?"
        message={
          pendingBlock
            ? `${pendingBlock.email} will stay on the list but will no longer receive newsletters. You can unblock them at any time.`
            : ''
        }
        confirmLabel="Block subscriber"
        isBusy={Boolean(pendingBlock) && updatingEmail === pendingBlock.email}
        onConfirm={() => changeStatus(pendingBlock, 'blocked')}
        onCancel={() => setPendingBlock(null)}
      />
    </div>
  )
}
