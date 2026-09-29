import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getOffices, createOffice, updateOffice } from '../../../../api/officesApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function OfficeForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [addressEn, setAddressEn] = useState('')
  const [addressKn, setAddressKn] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [mapLink, setMapLink] = useState('')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getOffices()
      .then((offices) => {
        const office = offices.find((item) => item.id === id)
        if (!isMounted) return
        if (!office) {
          setError('Office not found.')
          return
        }
        setName(office.name || '')
        setCity(office.city || '')
        setAddressEn(office.address?.en || '')
        setAddressKn(office.address?.kn || '')
        setPhone(office.phone || '')
        setEmail(office.email || '')
        setMapLink(office.mapLink || '')
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load office.')
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
      const payload = { name, city, addressEn, addressKn, phone, email, mapLink }
      if (isEditMode) {
        await updateOffice(id, payload)
      } else {
        await createOffice(payload)
      }
      navigate(ROUTES.ADMIN_OFFICES)
    } catch (err) {
      setError(err.message || 'Failed to save office.')
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
        to={ROUTES.ADMIN_OFFICES}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Offices
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit Office' : 'Add Office'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Office name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Bengaluru (Head Office)"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          City
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="e.g. Bengaluru"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Address (English)
          <textarea
            value={addressEn}
            onChange={(e) => setAddressEn(e.target.value)}
            required
            rows={3}
            placeholder="e.g. VTPC Building, Kasturba Road, Bengaluru - 560001"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Address (Kannada)
          <textarea
            value={addressKn}
            onChange={(e) => setAddressKn(e.target.value)}
            rows={3}
            placeholder="ಕನ್ನಡದಲ್ಲಿ ವಿಳಾಸ"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Phone
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 080 2226 0044"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. vtpcbengaluru@gmail.com"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Map link (optional)
          <input
            type="url"
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
            placeholder="https://maps.google.com/..."
            className={inputClass}
          />
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Office'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_OFFICES)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
