import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Check, X, MapPin } from 'lucide-react'
import { getDistricts, deleteDistrict } from '../../../../api/districtsApi'
import { ROUTES } from '../../../../constants/routes'

export default function DistrictsList() {
  const [districts, setDistricts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    getDistricts()
      .then((data) => {
        if (isMounted) setDistricts(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load districts.')
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
      await deleteDistrict(id)
      setDistricts(districts.filter((district) => district.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete district.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Districts</h1>
        <Link
          to={`${ROUTES.ADMIN_DISTRICTS}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add District
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading districts…</p>}

      {!isLoading && districts.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No districts yet. Add the first one above.
        </p>
      )}

      {!isLoading && districts.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {districts.map((district) => (
            <li
              key={district.id}
              className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-page text-brand-navy">
                <MapPin size={20} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-dark">{district.name}</p>
                <p className="truncate text-sm text-gray-600">{district.tagline?.en}</p>
              </div>

              <span className="shrink-0 text-xs text-gray-400">
                ₹{district.totalExportValueCr ?? 0} Cr
              </span>

              {pendingDeleteId === district.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm text-gray-600">Delete?</span>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(district.id)}
                    disabled={isDeleting}
                    aria-label={`Confirm delete ${district.name}`}
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
                  <Link
                    to={`${ROUTES.ADMIN_DISTRICTS}/${district.id}/edit`}
                    aria-label={`Edit ${district.name}`}
                    className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(district.id)}
                    aria-label={`Delete ${district.name}`}
                    className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
