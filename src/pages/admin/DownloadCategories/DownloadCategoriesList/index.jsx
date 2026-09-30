import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, Trash2, Check, X, FolderTree } from 'lucide-react'
import { getDownloadCategories, deleteDownloadCategory } from '../../../../api/downloadCategoriesApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'
import RecordDrawer from '../../../../components/RecordDrawer'
import { SearchInput, NoResults } from '../../../../components/ListFilters'
import { filterBySearch } from '../../../../lib/search'

export default function DownloadCategoriesList() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [search, setSearch] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    getDownloadCategories()
      .then((data) => {
        if (isMounted) setCategories([...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load download categories.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  async function handleConfirmDelete(id) {
    setIsDeleting(true)
    try {
      await deleteDownloadCategory(id)
      setCategories(categories.filter((category) => category.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete download category.')
    } finally {
      setIsDeleting(false)
    }
  }

  const shown = filterBySearch(categories, search)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Download Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Groups shown on the public Downloads page (e.g. "State Promotional Policies"). Assign documents to a
            category in the Downloads section.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_DOWNLOAD_CATEGORIES}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add Category
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isLoading && categories.length > 0 && (
        <div className="mt-5">
          <SearchInput value={search} onChange={setSearch} placeholder="Search categories…" />
        </div>
      )}
      {!isLoading && search && categories.length > 0 && shown.length === 0 && <NoResults query={search} />}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading categories…</p>}

      {!isLoading && categories.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No download categories yet. Add the first one above.
        </p>
      )}

      {!isLoading && categories.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {shown.map((category) => {
            const nameEn = getBilingualText(category.name, 'en')
            const nameKn = getBilingualText(category.name, 'kn')
            return (
              <li
                key={category.id}
                className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-page text-brand-navy">
                  <FolderTree size={18} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-dark">{nameEn}</p>
                  {nameKn && <p className="truncate text-sm text-gray-600">{nameKn}</p>}
                </div>

                <span className="shrink-0 text-xs text-gray-400">Order {category.order ?? 0}</span>

                {pendingDeleteId === category.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-gray-600">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(category.id)}
                      disabled={isDeleting}
                      aria-label={`Confirm delete ${nameEn}`}
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
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewing(category)}
                      aria-label="View details"
                      className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                    >
                      <Eye size={16} />
                    </button>
                    <Link
                      to={`${ROUTES.ADMIN_DOWNLOAD_CATEGORIES}/${category.id}/edit`}
                      aria-label={`Edit ${nameEn}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(category.id)}
                      aria-label={`Delete ${nameEn}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <RecordDrawer
        record={viewing}
        title={viewing ? getBilingualText(viewing.name, 'en') : ''}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
