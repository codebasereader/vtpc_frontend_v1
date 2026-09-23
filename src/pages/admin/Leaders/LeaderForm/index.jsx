import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getLeaders, createLeader, updateLeader } from '../../../../api/leadersApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function LeaderForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [designationEn, setDesignationEn] = useState('')
  const [designationKn, setDesignationKn] = useState('')
  const [order, setOrder] = useState(0)
  const [photoFile, setPhotoFile] = useState(null)
  const [existingPhoto, setExistingPhoto] = useState('')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getLeaders()
      .then((leaders) => {
        const leader = leaders.find((item) => item.id === id)
        if (!isMounted) return
        if (!leader) {
          setError('Leader not found.')
          return
        }
        setName(leader.name)
        setDesignationEn(leader.designation?.en || '')
        setDesignationKn(leader.designation?.kn || '')
        setOrder(leader.order ?? 0)
        setExistingPhoto(leader.photo || '')
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load leader.')
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
      const payload = { name, designationEn, designationKn, order, photoFile }
      if (isEditMode) {
        await updateLeader(id, payload)
      } else {
        await createLeader(payload)
      }
      navigate(ROUTES.ADMIN_LEADERS)
    } catch (err) {
      setError(err.message || 'Failed to save leader.')
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
        to={ROUTES.ADMIN_LEADERS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Leaders
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit Leader' : 'Add Leader'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Designation (English)
          <input
            type="text"
            value={designationEn}
            onChange={(e) => setDesignationEn(e.target.value)}
            required
            placeholder="e.g. Hon'ble Chief Minister of Karnataka"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Designation (Kannada)
          <input
            type="text"
            value={designationKn}
            onChange={(e) => setDesignationKn(e.target.value)}
            required
            placeholder="ಕನ್ನಡದಲ್ಲಿ ಪದನಾಮ"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Order
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Photo
          {existingPhoto && !photoFile && (
            <img src={existingPhoto} alt="" className="mb-2 h-16 w-16 rounded-full object-cover" />
          )}
          <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="text-sm" />
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Leader'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_LEADERS)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
