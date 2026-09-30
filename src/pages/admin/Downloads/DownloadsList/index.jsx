import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Check, X, FileDown, CornerDownRight, ExternalLink } from 'lucide-react'
import { getDownloads, deleteDownload } from '../../../../api/downloadsApi'
import { getDownloadCategories } from '../../../../api/downloadCategoriesApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'

export default function DownloadsList() {
  const [downloads, setDownloads] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    let isMounted = true
    Promise.all([getDownloads(), getDownloadCategories()])
      .then(([downloadsData, categoriesData]) => {
        if (!isMounted) return
        setDownloads(downloadsData)
        setCategories([...categoriesData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load downloads.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, getBilingualText(c.name, 'en')]))
    return (id) => map.get(id) || id
  }, [categories])

  const documentTitle = useMemo(() => {
    const map = new Map(downloads.map((d) => [d.id, getBilingualText(d.title, 'en')]))
    return (id) => map.get(id) || '—'
  }, [downloads])

  // Rows ordered so each top-level document is immediately followed by its
  // sub-documents, filtered by category, and further filtered by the
  // category picker above the table.
  const rows = useMemo(() => {
    const filtered = categoryFilter === 'all' ? downloads : downloads.filter((d) => d.category === categoryFilter)
    const topLevel = filtered.filter((d) => !d.parent).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const children = filtered.filter((d) => d.parent)
    const out = []
    topLevel.forEach((doc) => {
      out.push({ ...doc, depth: 0 })
      children
        .filter((child) => child.parent === doc.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((child) => out.push({ ...child, depth: 1 }))
    })
    // Sub-documents whose parent got filtered out by the category picker
    // (shouldn't normally happen — parent/child share a category) still
    // show up so nothing silently disappears.
    const shown = new Set(out.map((d) => d.id))
    children.forEach((child) => {
      if (!shown.has(child.id)) out.push({ ...child, depth: 1 })
    })
    return out
  }, [downloads, categoryFilter])

  async function handleConfirmDelete(id) {
    setIsDeleting(true)
    try {
      await deleteDownload(id)
      setDownloads(downloads.filter((d) => d.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete download.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Downloads</h1>
          <p className="mt-1 text-sm text-gray-600">
            Documents shown on the public Downloads page. Set a "Parent document" to nest one under another as an
            expandable sub-document.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_DOWNLOADS}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add Document
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {categories.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              categoryFilter === 'all'
                ? 'bg-brand-navy-dark text-white'
                : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
            }`}
          >
            All ({downloads.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilter(category.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                categoryFilter === category.id
                  ? 'bg-brand-navy-dark text-white'
                  : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
              }`}
            >
              {getBilingualText(category.name, 'en')} ({downloads.filter((d) => d.category === category.id).length})
            </button>
          ))}
        </div>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading downloads…</p>}

      {!isLoading && categories.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No download categories yet.{' '}
          <Link to={ROUTES.ADMIN_DOWNLOAD_CATEGORIES} className="font-semibold text-brand-primary hover:underline">
            Create one first
          </Link>{' '}
          before adding documents.
        </p>
      )}

      {!isLoading && categories.length > 0 && rows.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No documents yet. Add the first one above.
        </p>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-divider bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-divider bg-brand-page">
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Document</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">File</th>
                <th className="px-4 py-3 text-right text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {rows.map((doc) => {
                const titleEn = getBilingualText(doc.title, 'en')
                const titleKn = getBilingualText(doc.title, 'kn')
                return (
                  <tr key={doc.id} className="transition-colors hover:bg-brand-page/60">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2" style={{ paddingLeft: doc.depth * 24 }}>
                        {doc.depth > 0 && (
                          <CornerDownRight size={14} className="mt-1 shrink-0 text-gray-400" aria-hidden="true" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-brand-dark">{titleEn}</p>
                          {titleKn && <p className="text-sm text-gray-500">{titleKn}</p>}
                          {doc.parent && (
                            <p className="mt-0.5 text-xs text-gray-400">Sub-document of {documentTitle(doc.parent)}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-primary">
                        {categoryName(doc.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-navy hover:underline"
                        >
                          <ExternalLink size={13} aria-hidden="true" />
                          View file
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <FileDown size={13} aria-hidden="true" />
                          No file
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {pendingDeleteId === doc.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm text-gray-600">Delete?</span>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(doc.id)}
                            disabled={isDeleting}
                            aria-label={`Confirm delete ${titleEn}`}
                            className="rounded-md bg-red-600 p-1.5 text-white hover:bg-red-700"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(null)}
                            disabled={isDeleting}
                            aria-label="Cancel delete"
                            className="rounded-md border border-brand-divider p-1.5 text-gray-600 hover:bg-gray-50"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`${ROUTES.ADMIN_DOWNLOADS}/${doc.id}/edit`}
                            aria-label={`Edit ${titleEn}`}
                            className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(doc.id)}
                            aria-label={`Delete ${titleEn}`}
                            className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
