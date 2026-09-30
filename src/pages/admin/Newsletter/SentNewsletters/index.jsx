import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Eye, Paperclip, Send } from 'lucide-react'
import { getNewsletterIssues } from '../../../../api/newsletterApi'
import { ROUTES } from '../../../../constants/routes'
import { SearchInput, DateRangeFilter, NoResults } from '../../../../components/ListFilters'
import RecordDrawer from '../../../../components/RecordDrawer'
import { matchesSearch, isWithinDates } from '../../../../lib/search'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function SentNewsletters() {
  const [issues, setIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [yearFilter, setYearFilter] = useState('all')
  const [viewing, setViewing] = useState(null)

  useEffect(() => {
    let isMounted = true
    getNewsletterIssues()
      .then((data) => {
        if (!isMounted) return
        const sent = data.filter((issue) => issue.sentAt)
        sent.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
        setIssues(sent)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load sent newsletters.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const years = useMemo(() => [...new Set(issues.map((issue) => issue.year))].sort((a, b) => b - a), [issues])

  const visibleIssues = useMemo(
    () =>
      issues.filter(
        (issue) =>
          (yearFilter === 'all' || String(issue.year) === yearFilter) &&
          isWithinDates(issue.sentAt, dateRange.from, dateRange.to) &&
          matchesSearch({ subject: issue.subject, month: MONTHS[(issue.month || 1) - 1], year: issue.year }, search),
      ),
    [issues, yearFilter, dateRange, search],
  )
  const isFiltered = Boolean(search.trim() || dateRange.from || dateRange.to || yearFilter !== 'all')

  return (
    <div>
      <Link
        to={ROUTES.ADMIN_NEWSLETTER_ISSUES}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Send Newsletter
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Sent Newsletters</h1>
          <p className="mt-1 text-sm text-gray-600">
            The archive of every newsletter that has been emailed to subscribers.
          </p>
        </div>
        <Link
          to={ROUTES.ADMIN_NEWSLETTER_ISSUES}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Send size={16} strokeWidth={2} />
          Send Newsletter
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isLoading && issues.length > 0 && (
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search sent newsletters…" />
          <label className="flex flex-col gap-1 text-[11px] font-bold tracking-wide text-gray-500 uppercase">
            Year
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-lg border border-brand-divider bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
            >
              <option value="all">All years</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <DateRangeFilter
            from={dateRange.from}
            to={dateRange.to}
            onChange={setDateRange}
            fromLabel="Sent from"
            toLabel="Sent to"
          />
        </div>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading sent newsletters…</p>}

      {!isLoading && issues.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          Nothing has been sent yet. Sent newsletters will be archived here.
        </p>
      )}

      {!isLoading && isFiltered && issues.length > 0 && visibleIssues.length === 0 && <NoResults query={search} />}

      {!isLoading && visibleIssues.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {visibleIssues.map((issue) => (
            <li key={issue.id} className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-dark">{issue.subject}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
                  <span>
                    {MONTHS[(issue.month || 1) - 1]} {issue.year}
                  </span>
                  <span>· Sent {new Date(issue.sentAt).toLocaleString()}</span>
                  <span>· {issue.recipientCount ?? '—'} recipients</span>
                  {issue.attachment && (
                    <span className="inline-flex items-center gap-1 text-brand-primary">
                      <Paperclip size={13} aria-hidden="true" />
                      PDF
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewing(issue)}
                aria-label="View details"
                className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
              >
                <Eye size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <RecordDrawer
        record={viewing}
        title={viewing ? viewing.subject : ''}
        htmlFields={['body']}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
