import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getGiProducts, createGiProduct, updateGiProduct } from '../../../../api/giProductsApi'
import { ROUTES } from '../../../../constants/routes'
import { GI_CATEGORIES } from '../../../../constants/giCategories'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function GIProductForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [nameEn, setNameEn] = useState('')
  const [nameKn, setNameKn] = useState('')
  const [category, setCategory] = useState(GI_CATEGORIES[0].en)
  const [summaryEn, setSummaryEn] = useState('')
  const [summaryKn, setSummaryKn] = useState('')
  const [featured, setFeatured] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [existingImage, setExistingImage] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [existingVideo, setExistingVideo] = useState('')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getGiProducts()
      .then((products) => {
        const product = products.find((item) => item.id === id)
        if (!isMounted) return
        if (!product) {
          setError('GI product not found.')
          return
        }
        setNameEn(product.name?.en || '')
        setNameKn(product.name?.kn || '')
        setCategory(product.category || GI_CATEGORIES[0].en)
        setSummaryEn(product.summary?.en || '')
        setSummaryKn(product.summary?.kn || '')
        setFeatured(Boolean(product.featured))
        setExistingImage(product.image || '')
        setExistingVideo(product.video || '')
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load GI product.')
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
      const payload = { nameEn, nameKn, category, summaryEn, summaryKn, featured, imageFile, videoFile }
      if (isEditMode) {
        await updateGiProduct(id, payload)
      } else {
        await createGiProduct(payload)
      }
      navigate(ROUTES.ADMIN_GI_PRODUCTS)
    } catch (err) {
      setError(err.message || 'Failed to save GI product.')
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
        to={ROUTES.ADMIN_GI_PRODUCTS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to GI Products
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit GI Product' : 'Add GI Product'}</h1>

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
            placeholder="e.g. Mysore Silk"
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
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} required className={inputClass}>
            {GI_CATEGORIES.map((option) => (
              <option key={option.id} value={option.en}>
                {option.en}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center justify-between gap-3 rounded-lg border border-brand-divider px-3.5 py-3">
          <span className="flex flex-col">
            <span className="text-sm font-medium text-brand-dark">Featured</span>
            <span className="text-xs text-gray-500">Shown under the "Featured Products" tab on the public page.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={featured}
            onClick={() => setFeatured((prev) => !prev)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              featured ? 'bg-brand-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                featured ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Description (English)
          <textarea
            value={summaryEn}
            onChange={(e) => setSummaryEn(e.target.value)}
            required
            rows={3}
            placeholder="Short description shown on the public GI Treasures card."
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Description (Kannada)
          <textarea
            value={summaryKn}
            onChange={(e) => setSummaryKn(e.target.value)}
            required
            rows={3}
            placeholder="ಕನ್ನಡದಲ್ಲಿ ವಿವರಣೆ"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Image
          {existingImage && !imageFile && (
            <img src={existingImage} alt="" className="mb-2 h-20 w-20 rounded-lg object-cover" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            required={!isEditMode}
            className="text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Craft video (optional — shown in the Artisanal Stories section)
          {existingVideo && !videoFile && (
            <video src={existingVideo} controls className="mb-2 h-32 w-full rounded-lg object-cover" />
          )}
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="text-sm" />
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create GI Product'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_GI_PRODUCTS)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
