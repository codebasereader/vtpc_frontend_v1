import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, Trash2, Check, X, Building } from 'lucide-react'
import { getOffices, deleteOffice } from '../../../../api/officesApi'
import { ROUTES } from '../../../../constants/routes'
import RecordDrawer from '../../../../components/RecordDrawer'

export default function OfficesList() {
  const [offices, setOffices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    getOffices()
      .then((data) => {
        if (isMounted) setOffices(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load offices.')
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
      await deleteOffice(id)
      setOffices(offices.filter((office) => office.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete office.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Offices</h1>
          <p className="mt-1 text-sm text-gray-600">
            Regional offices shown on the About Us "Where to Find Us" section.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_OFFICES}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add Office
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading offices…</p>}

      {!isLoading && offices.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No offices yet. Add the first one above.
        </p>
      )}

      {!isLoading && offices.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {offices.map((office) => (
            <li
              key={office.id}
              className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-page text-brand-navy">
                <Building size={18} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-dark">
                  {office.name} <span className="font-normal text-gray-500">— {office.city}</span>
                </p>
                <p className="truncate text-sm text-gray-600">{office.address?.en}</p>
                <p className="text-sm text-gray-500">
                  {[office.phone, office.email].filter(Boolean).join(' · ')}
                </p>
              </div>

              {pendingDeleteId === office.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm text-gray-600">Delete?</span>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(office.id)}
                    disabled={isDeleting}
                    aria-label={`Confirm delete ${office.name}`}
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
                    onClick={() => setViewing(office)}
                    aria-label="View details"
                    className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                  >
                    <Eye size={16} />
                  </button>
                  <Link
                    to={`${ROUTES.ADMIN_OFFICES}/${office.id}/edit`}
                    aria-label={`Edit ${office.name}`}
                    className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(office.id)}
                    aria-label={`Delete ${office.name}`}
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
      <RecordDrawer
        record={viewing}
        title={viewing ? viewing.name : ''}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
