import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { getEvents } from '../../api/eventsApi'
import { getCities } from '../../api/citiesApi'
import { getBilingualText } from '../../lib/bilingual'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { home } from '../../language/home'
import { events as eventsText } from '../../language/events'
import { describeEventDate, getEventStatus } from '../../lib/eventDates'
import { ROUTES } from '../../constants/routes'

export default function EventsTeaser() {
  const language = useSelector(selectLanguage)
  const t = home.eventsTeaser
  const [events, setEvents] = useState([])
  const [cities, setCities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    Promise.all([getEvents(), getCities()])
      .then(([eventsData, citiesData]) => {
        if (!isMounted) return
        setEvents(eventsData)
        setCities(citiesData)
      })
      .catch(() => {
        if (isMounted) setEvents([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) return null

  const upcoming = events
    .filter((event) => getEventStatus(event) === 'upcoming')
    .sort((a, b) => new Date(a.startDate || `${a.tbaYear}-01-01`) - new Date(b.startDate || `${b.tbaYear}-01-01`))
    .slice(0, 3)

  function cityName(slug) {
    return cities.find((c) => c.id === slug)?.name || slug
  }

  return (
    <section className="bg-brand-surface px-4 py-14 md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold text-brand-navy-dark md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t.title[language]}
          </h2>
          <Link
            to={ROUTES.EVENTS}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark sm:text-base"
          >
            {eventsText.viewAll[language]}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-8 text-center text-gray-600">{eventsText.teaserEmpty[language]}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {upcoming.map((event) => {
              const { dayRange, monthYear } = describeEventDate(event, language)
              const title = getBilingualText(event.title, language) || getBilingualText(event.title, 'en')
              return (
                <Link
                  key={event.id}
                  to={ROUTES.EVENTS}
                  className="group flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(15,40,80,0.06)] transition-shadow hover:shadow-[0_10px_28px_rgba(15,40,80,0.1)]"
                >
                  <div className="flex h-14 w-16 flex-col items-center justify-center self-start rounded-xl bg-brand-surface text-brand-primary">
                    <span className="text-sm font-bold">{dayRange}</span>
                    <span className="text-[10px] leading-tight">{monthYear}</span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-primary">{title}</h3>
                  <p className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={14} className="shrink-0 text-brand-primary" aria-hidden="true" />
                    {cityName(event.city)}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
