import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getStaff, createStaff, updateStaff } from '../../../../api/staffApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function OrgChartForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [order, setOrder] = useState(1)
  const [photoFile, setPhotoFile] = useState(null)
  const [existingPhoto, setExistingPhoto] = useState('')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getStaff()
      .then((staff) => {
        const member = staff.find((item) => item.id === id)
        if (!isMounted) return
        if (!member) {
          setError('Member not found.')
          return
        }
        setName(member.name || '')
        setRole(member.role || '')
        setOrder(member.order ?? 1)
        setExistingPhoto(member.photo || '')
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load member.')
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
      const payload = { name, role, group: 'org-chart', order, photoFile }
      if (isEditMode) {
        await updateStaff(id, payload)
      } else {
        await createStaff(payload)
      }
      navigate(ROUTES.ADMIN_ORG_CHART)
    } catch (err) {
      setError(err.message || 'Failed to save member.')
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
        to={ROUTES.ADMIN_ORG_CHART}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Org Chart
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">
        {isEditMode ? 'Edit Org Chart Member' : 'Add Org Chart Member'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Chairman"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Role / designation
          <textarea
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            rows={3}
            placeholder={'Industries Commissioner\nDepartment of Industries & Commerce\nGovernment of Karnataka'}
            className={inputClass}
          />
          <span className="text-xs font-normal text-gray-500">
            Use a new line per line of text — shown exactly as entered under the name.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Order
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            required
            min={1}
            className={inputClass}
          />
          <span className="text-xs font-normal text-gray-500">
            1 = Chairman, 2 = Managing Director, 3 = Joint Director, 4+ = siblings under the Joint Director.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Photo (optional)
          {existingPhoto && !photoFile && (
            <img src={existingPhoto} alt="" className="mb-2 h-16 w-16 rounded-full object-cover" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Member'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_ORG_CHART)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
