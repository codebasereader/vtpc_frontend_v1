import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, Trash2, Check, X, Tag } from 'lucide-react'
import { getEventSectors, deleteEventSector } from '../../../../api/eventSectorsApi'
import { ROUTES } from '../../../../constants/routes'
import { getBilingualText } from '../../../../lib/bilingual'
import RecordDrawer from '../../../../components/RecordDrawer'

export default function EventSectorsList() {
  const [sectors, setSectors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    getEventSectors()
      .then((data) => {
        if (isMounted) setSectors(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load event sectors.')
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
      await deleteEventSector(id)
      setSectors(sectors.filter((sector) => sector.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete event sector.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Event Sectors</h1>
          <p className="mt-1 text-sm text-gray-600">
            Master list of sector tags — used by the Events form and the public filters.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_EVENT_SECTORS}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add Sector
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading event sectors…</p>}

      {!isLoading && sectors.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No event sectors yet. Add the first one above.
        </p>
      )}

      {!isLoading && sectors.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {sectors.map((sector) => {
            const nameEn = getBilingualText(sector.name, 'en')
            const nameKn = getBilingualText(sector.name, 'kn')
            return (
              <li
                key={sector.id}
                className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-page text-brand-navy">
                  <Tag size={18} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-dark">{nameEn}</p>
                  {nameKn && <p className="truncate text-sm text-gray-600">{nameKn}</p>}
                </div>

                {pendingDeleteId === sector.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-gray-600">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(sector.id)}
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
                      onClick={() => setViewing(sector)}
                      aria-label="View details"
                      className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                    >
                      <Eye size={16} />
                    </button>
                    <Link
                      to={`${ROUTES.ADMIN_EVENT_SECTORS}/${sector.id}/edit`}
                      aria-label={`Edit ${nameEn}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(sector.id)}
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
