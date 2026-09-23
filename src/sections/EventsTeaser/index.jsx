import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getEvents } from '../../api/eventsApi'
import { getBilingualText } from '../../lib/bilingual'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { home } from '../../language/home'

export default function EventsTeaser() {
  const language = useSelector(selectLanguage)
  const t = home.eventsTeaser
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getEvents()
      .then((data) => {
        if (isMounted) setEvents(data)
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

  return (
    <section className="bg-brand-surface px-4 py-12 md:px-8">
      <h2 className="text-center text-2xl font-bold text-brand-dark md:text-3xl">{t.title[language]}</h2>
      {events.length === 0 ? (
        <p className="mt-8 text-center text-gray-600">{t.empty[language]}</p>
      ) : (
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <div key={event.id} className="rounded-[5px] bg-white p-6 shadow-[0_0_10px_rgba(0,0,0,0.05)]">
              <p className="text-sm text-brand-primary">{event.date}</p>
              <h3 className="mt-1 font-semibold">
                {getBilingualText(event.title, language) || getBilingualText(event.title, 'en')}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {getBilingualText(event.location, language) || getBilingualText(event.location, 'en')}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
