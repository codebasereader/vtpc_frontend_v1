import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getPages, createPage, updatePage } from '../../../../api/pagesApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function PageForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [titleEn, setTitleEn] = useState('')
  const [titleKn, setTitleKn] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [bodyKn, setBodyKn] = useState('')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getPages()
      .then((pages) => {
        const page = pages.find((item) => item.id === id)
        if (!isMounted) return
        if (!page) {
          setError('Page not found.')
          return
        }
        setTitleEn(getBilingualText(page.title, 'en'))
        setTitleKn(getBilingualText(page.title, 'kn'))
        setBodyEn(getBilingualText(page.body, 'en'))
        setBodyKn(getBilingualText(page.body, 'kn'))
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load page.')
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
      const payload = { titleEn, titleKn, bodyEn, bodyKn }
      if (isEditMode) {
        await updatePage(id, payload)
      } else {
        await createPage(payload)
      }
      navigate(ROUTES.ADMIN_PAGES)
    } catch (err) {
      setError(err.message || 'Failed to save page.')
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
        to={ROUTES.ADMIN_PAGES}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Pages
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit Page' : 'Add Page'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-2xl flex-col gap-4">
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
            placeholder="e.g. Privacy Policy"
            className={inputClass}
          />
          <span className="text-xs font-normal text-gray-500">
            URL: /{titleEn ? titleEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '...'}
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Title (Kannada)
          <input
            type="text"
            value={titleKn}
            onChange={(e) => setTitleKn(e.target.value)}
            required
            placeholder="ಕನ್ನಡದಲ್ಲಿ ಶೀರ್ಷಿಕೆ"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Body (English) — HTML
          <textarea
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
            required
            rows={14}
            placeholder="<p>...</p>"
            className={`${inputClass} font-mono text-xs`}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Body (Kannada) — HTML
          <textarea
            value={bodyKn}
            onChange={(e) => setBodyKn(e.target.value)}
            rows={14}
            placeholder="<p>...</p>"
            className={`${inputClass} font-mono text-xs`}
          />
          <span className="text-xs font-normal text-gray-500">
            Optional — the public page falls back to English if this is left blank.
          </span>
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Page'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_PAGES)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
