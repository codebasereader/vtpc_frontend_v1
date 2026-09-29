import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getTaluks, createTaluk, updateTaluk } from '../../../../api/taluksApi'
import { getDistricts } from '../../../../api/districtsApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function TalukForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [district, setDistrict] = useState('')
  const [districts, setDistricts] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    Promise.all([getDistricts(), isEditMode ? getTaluks() : Promise.resolve(null)])
      .then(([districtsData, taluksData]) => {
        if (!isMounted) return
        const sorted = [...districtsData].sort((a, b) => a.name.localeCompare(b.name))
        setDistricts(sorted)
        if (!isEditMode) {
          setDistrict(sorted[0]?.id || '')
          return
        }
        const taluk = taluksData.find((item) => item.id === id)
        if (!taluk) {
          setError('Taluk not found.')
          return
        }
        setName(taluk.name || '')
        setDistrict(taluk.district || '')
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load taluk.')
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
      const payload = { name, district }
      if (isEditMode) {
        await updateTaluk(id, payload)
      } else {
        await createTaluk(payload)
      }
      navigate(ROUTES.ADMIN_TALUKS)
    } catch (err) {
      setError(err.message || 'Failed to save taluk.')
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
        to={ROUTES.ADMIN_TALUKS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Taluks
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit Taluk' : 'Add Taluk'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Taluk name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Chincholi"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          District
          <select value={district} onChange={(e) => setDistrict(e.target.value)} required className={inputClass}>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Taluk'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_TALUKS)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
