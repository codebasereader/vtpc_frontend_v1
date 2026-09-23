import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getEventSectors, createEventSector, updateEventSector } from '../../../../api/eventSectorsApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function EventSectorForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [nameEn, setNameEn] = useState('')
  const [nameKn, setNameKn] = useState('')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getEventSectors()
      .then((sectors) => {
        const sector = sectors.find((item) => item.id === id)
        if (!isMounted) return
        if (!sector) {
          setError('Event sector not found.')
          return
        }
        setNameEn(getBilingualText(sector.name, 'en'))
        setNameKn(getBilingualText(sector.name, 'kn'))
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load event sector.')
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
      const payload = { nameEn, nameKn }
      if (isEditMode) {
        await updateEventSector(id, payload)
      } else {
        await createEventSector(payload)
      }
      navigate(ROUTES.ADMIN_EVENT_SECTORS)
    } catch (err) {
      setError(err.message || 'Failed to save event sector.')
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
        to={ROUTES.ADMIN_EVENT_SECTORS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Event Sectors
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">
        {isEditMode ? 'Edit Event Sector' : 'Add Event Sector'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Name (English)
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
            placeholder="e.g. Machine Tools / Manufacturing"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Name (Kannada)
          <input
            type="text"
            value={nameKn}
            onChange={(e) => setNameKn(e.target.value)}
            placeholder="ಕನ್ನಡದಲ್ಲಿ ಹೆಸರು"
            className={inputClass}
          />
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Sector'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_EVENT_SECTORS)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
