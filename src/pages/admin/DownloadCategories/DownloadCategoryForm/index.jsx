import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  getDownloadCategories,
  createDownloadCategory,
  updateDownloadCategory,
} from '../../../../api/downloadCategoriesApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function DownloadCategoryForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [nameEn, setNameEn] = useState('')
  const [nameKn, setNameKn] = useState('')
  const [order, setOrder] = useState(0)

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getDownloadCategories()
      .then((categories) => {
        const category = categories.find((item) => item.id === id)
        if (!isMounted) return
        if (!category) {
          setError('Download category not found.')
          return
        }
        setNameEn(getBilingualText(category.name, 'en'))
        setNameKn(getBilingualText(category.name, 'kn'))
        setOrder(category.order ?? 0)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load download category.')
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
      const payload = { nameEn, nameKn, order }
      if (isEditMode) {
        await updateDownloadCategory(id, payload)
      } else {
        await createDownloadCategory(payload)
      }
      navigate(ROUTES.ADMIN_DOWNLOAD_CATEGORIES)
    } catch (err) {
      setError(err.message || 'Failed to save download category.')
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
        to={ROUTES.ADMIN_DOWNLOAD_CATEGORIES}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Download Categories
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">
        {isEditMode ? 'Edit Download Category' : 'Add Download Category'}
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
            placeholder="e.g. State Promotional Policies"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Name (Kannada)
          <input
            type="text"
            value={nameKn}
            onChange={(e) => setNameKn(e.target.value)}
            required
            placeholder="ಕನ್ನಡದಲ್ಲಿ ಹೆಸರು"
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

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Category'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_DOWNLOAD_CATEGORIES)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
