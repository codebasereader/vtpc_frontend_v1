import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getCities, createCity, updateCity } from '../../../../api/citiesApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function CityForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('India')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getCities()
      .then((cities) => {
        const city = cities.find((item) => item.id === id)
        if (!isMounted) return
        if (!city) {
          setError('City not found.')
          return
        }
        setName(city.name || '')
        setState(city.state || '')
        setCountry(city.country || 'India')
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load city.')
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
      const payload = { name, state, country }
      if (isEditMode) {
        await updateCity(id, payload)
      } else {
        await createCity(payload)
      }
      navigate(ROUTES.ADMIN_CITIES)
    } catch (err) {
      setError(err.message || 'Failed to save city.')
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
        to={ROUTES.ADMIN_CITIES}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Cities
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit City' : 'Add City'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          City name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Chennai"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          State (optional)
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Tamil Nadu"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Country
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            placeholder="e.g. India"
            className={inputClass}
          />
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create City'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_CITIES)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
