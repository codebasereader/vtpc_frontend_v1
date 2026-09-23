import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { MapPin, Search, ExternalLink, CalendarX } from 'lucide-react'
import { getEvents } from '../../../api/eventsApi'
import { getCities } from '../../../api/citiesApi'
import { getEventSectors } from '../../../api/eventSectorsApi'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { events as t } from '../../../language/events'
import { getBilingualText } from '../../../lib/bilingual'
import { describeEventDate, getEventStatus, matchesDateRange } from '../../../lib/eventDates'

const fieldClass =
  'w-full rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm text-brand-dark outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function Events() {
  const language = useSelector(selectLanguage)

  const [allEvents, setAllEvents] = useState([])
  const [cities, setCities] = useState([])
  const [sectors, setSectors] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [type, setType] = useState('domestic')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    Promise.all([getEvents(), getCities(), getEventSectors()])
      .then(([eventsData, citiesData, sectorsData]) => {
        if (!isMounted) return
        setAllEvents(eventsData)
        setCities(citiesData)
        setSectors(sectorsData)
      })
      .catch(() => {
        if (isMounted) setAllEvents([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  function cityLabel(slug) {
    const match = cities.find((c) => c.id === slug)
    if (!match) return slug
    const region = match.country && match.country !== 'India' ? match.country : match.state
    return [match.name, region].filter(Boolean).join(', ')
  }

  function sectorLabel(slug) {
    const match = sectors.find((s) => s.id === slug)
    if (!match) return slug
    return getBilingualText(match.name, language) || getBilingualText(match.name, 'en')
  }

  const typedEvents = useMemo(() => allEvents.filter((e) => e.type === type), [allEvents, type])

  const citiesForType = useMemo(() => {
    const slugs = new Set(typedEvents.map((e) => e.city))
    return cities.filter((c) => slugs.has(c.id))
  }, [typedEvents, cities])

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return typedEvents
      .filter((e) => !city || e.city === city)
      .filter((e) => status === 'all' || getEventStatus(e) === status)
      .filter((e) => matchesDateRange(e, startDate, endDate))
      .filter((e) => {
        if (!query) return true
        const title = getBilingualText(e.title, language) || getBilingualText(e.title, 'en')
        return title.toLowerCase().includes(query)
      })
      .sort((a, b) => new Date(a.startDate || `${a.tbaYear}-01-01`) - new Date(b.startDate || `${b.tbaYear}-01-01`))
  }, [typedEvents, city, status, startDate, endDate, search, language])

  function handleTypeChange(nextType) {
    setType(nextType)
    setCity('')
  }

  function clearFilters() {
    setCity('')
    setStatus('all')
    setStartDate('')
    setEndDate('')
    setSearch('')
  }

  return (
    <>
      <Helmet>
        <title>{t.pageTitle[language]} — VTPC Karnataka</title>
        <meta name="description" content={t.pageDescription[language]} />
      </Helmet>

      <section className="bg-brand-surface px-4 py-14 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-brand-navy-dark md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t.pageTitle[language]}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            {t.pageDescription[language]}
          </p>

          <div
            className="mt-8 inline-flex rounded-full bg-white p-1 shadow-[0_4px_12px_rgba(15,40,80,0.08)]"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={type === 'domestic'}
              onClick={() => handleTypeChange('domestic')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:text-base ${
                type === 'domestic' ? 'bg-brand-primary text-white' : 'text-brand-dark hover:bg-brand-page'
              }`}
            >
              {t.typeDomestic[language]}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={type === 'international'}
              onClick={() => handleTypeChange('international')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:text-base ${
                type === 'international' ? 'bg-brand-primary text-white' : 'text-brand-dark hover:bg-brand-page'
              }`}
            >
              {t.typeInternational[language]}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,40,80,0.06)] sm:grid-cols-2 lg:grid-cols-6">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={fieldClass}
              aria-label={t.filters.city[language]}
            >
              <option value="">{t.filters.allCities[language]}</option>
              {citiesForType.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              {t.filters.startDate[language]}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              {t.filters.endDate[language]}
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className={fieldClass}
              />
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={fieldClass}
              aria-label={t.filters.status[language]}
            >
              <option value="all">{t.filters.allStatus[language]}</option>
              <option value="upcoming">{t.filters.upcoming[language]}</option>
              <option value="completed">{t.filters.completed[language]}</option>
            </select>

            <div className="relative lg:col-span-2">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.filters.search[language]}
                className={`${fieldClass} pl-9`}
              />
            </div>
          </div>

          {(city || status !== 'all' || startDate || endDate || search) && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
            >
              {t.filters.clear[language]}
            </button>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {isLoading && <p className="text-center text-gray-600">{t.filters.search[language]}…</p>}

            {!isLoading && filteredEvents.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-divider bg-white/60 p-10 text-center text-gray-600">
                <CalendarX size={28} className="text-gray-400" aria-hidden="true" />
                <p>{t.noResults[language]}</p>
              </div>
            )}

            {!isLoading &&
              filteredEvents.map((event) => {
                const { dayRange, monthYear } = describeEventDate(event, language)
                const eventStatus = getEventStatus(event)
                const title = getBilingualText(event.title, language) || getBilingualText(event.title, 'en')
                const description =
                  getBilingualText(event.description, language) || getBilingualText(event.description, 'en')

                return (
                  <article
                    key={event.id}
                    className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,40,80,0.06)] transition-shadow hover:shadow-[0_10px_28px_rgba(15,40,80,0.1)] sm:flex-row sm:items-center sm:p-5"
                  >
                    <div
                      className={`flex h-16 w-20 shrink-0 flex-col items-center justify-center rounded-xl ${
                        event.isDateTBA
                          ? 'bg-gray-100 text-gray-500'
                          : eventStatus === 'completed'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-brand-surface text-brand-primary'
                      }`}
                    >
                      <span className="text-sm font-bold sm:text-base">{dayRange}</span>
                      <span className="text-[11px] leading-tight">{monthYear}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-brand-dark sm:text-lg">{title}</h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            eventStatus === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {eventStatus === 'completed' ? t.filters.completed[language] : t.filters.upcoming[language]}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} className="shrink-0 text-brand-primary" aria-hidden="true" />
                        {cityLabel(event.city)}
                      </p>
                      {description && <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>}
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      <span className="rounded-full bg-brand-page px-3 py-1 text-xs font-semibold text-brand-navy">
                        {t.sectorLabel[language]}: {sectorLabel(event.sector)}
                      </span>
                      {event.registrationLink && (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
                        >
                          {t.registerLink[language]}
                          <ExternalLink size={14} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </article>
                )
              })}
          </div>
        </div>
      </section>
    </>
  )
}
