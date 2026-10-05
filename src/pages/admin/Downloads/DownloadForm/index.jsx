import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { getDownloads, createDownload, updateDownload } from '../../../../api/downloadsApi'
import { getDownloadCategories } from '../../../../api/downloadCategoriesApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'
import Button from '../../../../components/Button'
import { safeUrl } from '../../../../lib/safeUrl'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function DownloadForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [allDownloads, setAllDownloads] = useState([])

  const [titleEn, setTitleEn] = useState('')
  const [titleKn, setTitleKn] = useState('')
  const [category, setCategory] = useState('')
  const [parent, setParent] = useState('')
  const [order, setOrder] = useState(0)
  const [file, setFile] = useState(null)
  const [existingFileUrl, setExistingFileUrl] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    Promise.all([getDownloadCategories(), getDownloads()])
      .then(([categoriesData, downloadsData]) => {
        if (!isMounted) return
        const sortedCategories = [...categoriesData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        setCategories(sortedCategories)
        setAllDownloads(downloadsData)

        if (isEditMode) {
          const doc = downloadsData.find((item) => item.id === id)
          if (!doc) {
            setError('Document not found.')
            return
          }
          setTitleEn(getBilingualText(doc.title, 'en'))
          setTitleKn(getBilingualText(doc.title, 'kn'))
          setCategory(doc.category || sortedCategories[0]?.id || '')
          setParent(doc.parent || '')
          setOrder(doc.order ?? 0)
          setExistingFileUrl(doc.fileUrl || '')
        } else if (sortedCategories[0]) {
          setCategory(sortedCategories[0].id)
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load form data.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id, isEditMode])

  // Only top-level documents in the same category can be a parent — keeps
  // nesting to the two levels the public page renders (heading → expandable
  // sub-documents), and excludes the document being edited itself.
  const parentOptions = useMemo(
    () => allDownloads.filter((d) => d.category === category && !d.parent && d.id !== id),
    [allDownloads, category, id],
  )

  // If the selected parent no longer belongs to the current category
  // (e.g. the visitor just switched category), treat it as unset rather
  // than submitting a stale/invalid reference.
  const effectiveParent = parentOptions.some((option) => option.id === parent) ? parent : ''

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory)
    setParent('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const payload = { titleEn, titleKn, category, parent: effectiveParent, order, file }
      if (isEditMode) {
        await updateDownload(id, payload)
      } else {
        await createDownload(payload)
      }
      navigate(ROUTES.ADMIN_DOWNLOADS)
    } catch (err) {
      setError(err.message || 'Failed to save document.')
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
        to={ROUTES.ADMIN_DOWNLOADS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Downloads
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit Document' : 'Add Document'}</h1>

      {categories.length === 0 ? (
        <p className="mt-6 max-w-lg rounded-xl border border-dashed border-brand-divider p-6 text-center text-gray-600">
          No download categories yet.{' '}
          <Link to={ROUTES.ADMIN_DOWNLOAD_CATEGORIES} className="font-semibold text-brand-primary hover:underline">
            Create one first
          </Link>
          .
        </p>
      ) : (
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
              placeholder="e.g. Karnataka Export Promotion Policy 2020-25"
              className={inputClass}
            />
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
            Category
            <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} required className={inputClass}>
              {categories.map((option) => (
                <option key={option.id} value={option.id}>
                  {getBilingualText(option.name, 'en')}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Parent document (optional)
            <select value={effectiveParent} onChange={(e) => setParent(e.target.value)} className={inputClass}>
              <option value="">— None (top-level document) —</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {getBilingualText(option.title, 'en')}
                </option>
              ))}
            </select>
            <span className="text-xs font-normal text-gray-500">
              Set this to nest the document as an expandable sub-document under another one in the same category.
            </span>
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
            File (PDF/DOC/XLS)
            {existingFileUrl && !file && (
              <a
                href={safeUrl(existingFileUrl) || undefined}
                target="_blank"
                rel="noreferrer"
                className="mb-1 inline-flex w-fit items-center gap-1.5 text-sm text-brand-primary hover:underline"
              >
                <FileText size={14} aria-hidden="true" />
                View current file
              </a>
            )}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required={!isEditMode}
              className="text-sm"
            />
          </label>

          <div className="mt-2 flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Document'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_DOWNLOADS)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
