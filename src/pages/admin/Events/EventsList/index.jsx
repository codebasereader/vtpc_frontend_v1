import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, Trash2, Check, X, Calendar } from 'lucide-react'
import { getEvents, deleteEvent } from '../../../../api/eventsApi'
import { getCities } from '../../../../api/citiesApi'
import { getEventSectors } from '../../../../api/eventSectorsApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'
import { describeEventDate, getEventStatus, matchesDateRange } from '../../../../lib/eventDates'
import RecordDrawer from '../../../../components/RecordDrawer'
import { SearchInput, DateRangeFilter, NoResults } from '../../../../components/ListFilters'
import { matchesSearch, startOfDay, endOfDay } from '../../../../lib/search'

const TYPE_BADGE = {
  domestic: 'bg-blue-50 text-blue-700',
  international: 'bg-purple-50 text-purple-700',
}

export default function EventsList() {
  const [events, setEvents] = useState([])
  const [cities, setCities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    Promise.all([getEvents(), getCities(), getEventSectors()])
      .then(([eventsData, citiesData]) => {
        if (!isMounted) return
        setEvents(eventsData)
        setCities(citiesData)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load events.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  function cityName(slug) {
    return cities.find((c) => c.id === slug)?.name || slug
  }

  const statusCounts = {
    all: events.length,
    upcoming: events.filter((e) => getEventStatus(e) === 'upcoming').length,
    completed: events.filter((e) => getEventStatus(e) === 'completed').length,
  }

  const visibleEvents = events.filter((event) => {
    if (statusFilter !== 'all' && getEventStatus(event) !== statusFilter) return false
    if (!matchesDateRange(event, startOfDay(dateRange.from), endOfDay(dateRange.to))) return false
    if (!search.trim()) return true
    return matchesSearch(event, search) || cityName(event.city).toLowerCase().includes(search.trim().toLowerCase())
  })
  const hasActiveFilters = Boolean(search.trim() || dateRange.from || dateRange.to || statusFilter !== 'all')

  async function handleConfirmDelete(id) {
    setIsDeleting(true)
    try {
      await deleteEvent(id)
      setEvents(events.filter((event) => event.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete event.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Events</h1>
        <Link
          to={`${ROUTES.ADMIN_EVENTS}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add Event
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isLoading && events.length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              ['all', 'All'],
              ['upcoming', 'Upcoming'],
              ['completed', 'Completed'],
            ].map(([key, label]) => (
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
                {label} ({statusCounts[key]})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search events…" />
            <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
          </div>
          {(dateRange.from || dateRange.to) && (
            <p className="text-xs text-gray-500">
              Dates are matched against each event&apos;s start date. Events with a date still to be announced (TBA)
              are hidden while a date range is set.
            </p>
          )}
        </div>
      )}

      {!isLoading && events.length > 0 && hasActiveFilters && visibleEvents.length === 0 && (
        <NoResults query={search} />
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading events…</p>}

      {!isLoading && events.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No events yet. Add the first one above.
        </p>
      )}

      {!isLoading && visibleEvents.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {visibleEvents.map((event) => {
            const titleEn = getBilingualText(event.title, 'en')
            const { dayRange, monthYear } = describeEventDate(event, 'en')
            const status = getEventStatus(event)

            return (
              <li
                key={event.id}
                className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4"
              >
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-page text-brand-navy">
                  <Calendar size={16} aria-hidden="true" />
                  <span className="mt-1 text-[10px] leading-none font-semibold">{dayRange}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-brand-dark">{titleEn}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TYPE_BADGE[event.type] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {event.type}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {status === 'completed' ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                  <p className="truncate text-sm text-gray-600">
                    {monthYear} · {cityName(event.city)}
                  </p>
                </div>

                {pendingDeleteId === event.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-gray-600">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(event.id)}
                      disabled={isDeleting}
                      aria-label={`Confirm delete ${titleEn}`}
                      className="rounded-md bg-red-600 p-1.5 text-white hover:bg-red-700"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(null)}
                      disabled={isDeleting}
                      aria-label="Cancel delete"
                      className="rounded-md border border-brand-divider p-1.5 text-gray-600 hover:bg-gray-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewing(event)}
                      aria-label="View details"
                      className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                    >
                      <Eye size={16} />
                    </button>
                    <Link
                      to={`${ROUTES.ADMIN_EVENTS}/${event.id}/edit`}
                      aria-label={`Edit ${titleEn}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(event.id)}
                      aria-label={`Delete ${titleEn}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <RecordDrawer
        record={viewing}
        title={viewing ? getBilingualText(viewing.title, 'en') : ''}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
