import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getEvents, createEvent, updateEvent } from '../../../../api/eventsApi'
import { getCities } from '../../../../api/citiesApi'
import { getEventSectors } from '../../../../api/eventSectorsApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

function toDateInputValue(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default function EventForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [titleEn, setTitleEn] = useState('')
  const [titleKn, setTitleKn] = useState('')
  const [type, setType] = useState('domestic')
  const [city, setCity] = useState('')
  const [sector, setSector] = useState('')
  const [isDateTBA, setIsDateTBA] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tbaYear, setTbaYear] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionKn, setDescriptionKn] = useState('')
  const [registrationLink, setRegistrationLink] = useState('')

  const [cities, setCities] = useState([])
  const [sectors, setSectors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const requests = [getCities(), getEventSectors()]
    if (isEditMode) requests.push(getEvents())

    Promise.all(requests)
      .then(([citiesData, sectorsData, eventsData]) => {
        if (!isMounted) return
        setCities(citiesData)
        setSectors(sectorsData)

        if (isEditMode) {
          const event = eventsData.find((item) => item.id === id)
          if (!event) {
            setError('Event not found.')
            return
          }
          setTitleEn(getBilingualText(event.title, 'en'))
          setTitleKn(getBilingualText(event.title, 'kn'))
          setType(event.type || 'domestic')
          setCity(event.city || '')
          setSector(event.sector || '')
          setIsDateTBA(Boolean(event.isDateTBA))
          setStartDate(toDateInputValue(event.startDate))
          setEndDate(toDateInputValue(event.endDate))
          setTbaYear(event.tbaYear ? String(event.tbaYear) : '')
          setDescriptionEn(getBilingualText(event.description, 'en'))
          setDescriptionKn(getBilingualText(event.description, 'kn'))
          setRegistrationLink(event.registrationLink || '')
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load event.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id, isEditMode])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const payload = {
        titleEn,
        titleKn,
        type,
        city,
        sector,
        isDateTBA,
        startDate,
        endDate,
        tbaYear,
        descriptionEn,
        descriptionKn,
        registrationLink,
      }
      if (isEditMode) {
        await updateEvent(id, payload)
      } else {
        await createEvent(payload)
      }
      navigate(ROUTES.ADMIN_EVENTS)
    } catch (err) {
      setError(err.message || 'Failed to save event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading…</p>
  }

  return (
    <div>
      <Link
        to={ROUTES.ADMIN_EVENTS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Events
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit Event' : 'Add Event'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Title (English)
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
            placeholder="e.g. IMTEX 2027"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Title (Kannada)
          <input
            type="text"
            value={titleKn}
            onChange={(e) => setTitleKn(e.target.value)}
            placeholder="ಕನ್ನಡದಲ್ಲಿ ಶೀರ್ಷಿಕೆ"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Type
          <select value={type} onChange={(e) => setType(e.target.value)} required className={inputClass}>
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          City
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={`${inputClass} disabled:bg-brand-page disabled:text-gray-500`}
            disabled={cities.length === 0}
          >
            <option value="" disabled>
              {cities.length === 0 ? 'No cities yet — add one first' : 'Select a city'}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.country && c.country !== 'India' ? `, ${c.country}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Sector
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            required
            className={`${inputClass} disabled:bg-brand-page disabled:text-gray-500`}
            disabled={sectors.length === 0}
          >
            <option value="" disabled>
              {sectors.length === 0 ? 'No sectors yet — add one first' : 'Select a sector'}
            </option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {getBilingualText(s.name, 'en')}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2 rounded-lg border border-brand-divider p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-brand-dark">
            <input
              type="checkbox"
              checked={isDateTBA}
              onChange={(e) => setIsDateTBA(e.target.checked)}
              className="h-4 w-4 rounded border-brand-divider text-brand-primary focus:ring-brand-primary/30"
            />
            Date to be announced (TBA) — show only a year
          </label>

          {isDateTBA ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
              Year
              <input
                type="number"
                value={tbaYear}
                onChange={(e) => setTbaYear(e.target.value)}
                required
                placeholder="e.g. 2027"
                className={`${inputClass} max-w-[10rem]`}
              />
            </label>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-brand-dark">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className={inputClass}
                />
              </label>
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-brand-dark">
                End date (optional)
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  className={inputClass}
                />
              </label>
            </div>
          )}
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Description (English)
          <textarea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Description (Kannada)
          <textarea
            value={descriptionKn}
            onChange={(e) => setDescriptionKn(e.target.value)}
            rows={3}
            placeholder="ಕನ್ನಡದಲ್ಲಿ ವಿವರಣೆ"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Registration link (optional)
          <input
            type="url"
            value={registrationLink}
            onChange={(e) => setRegistrationLink(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Event'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_EVENTS)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
