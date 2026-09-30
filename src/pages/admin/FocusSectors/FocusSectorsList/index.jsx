import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, Trash2, Check, X, ImageOff } from 'lucide-react'
import { getSectors, deleteSector } from '../../../../api/sectorsApi'
import { getSectorIcon, sortSectors } from '../../../../constants/sectorIcons'
import { ROUTES } from '../../../../constants/routes'
import RecordDrawer from '../../../../components/RecordDrawer'

export default function FocusSectorsList() {
  const [sectors, setSectors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    getSectors()
      .then((data) => {
        if (isMounted) setSectors(sortSectors(data))
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load focus sectors.')
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
      await deleteSector(id)
      setSectors(sectors.filter((sector) => sector.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete focus sector.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Focus Sectors</h1>
          <p className="mt-1 text-sm text-gray-600">
            Sectors shown under "Focus Sectors of Karnataka" on the Exporter Corner page.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_FOCUS_SECTORS}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add Focus Sector
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading focus sectors…</p>}

      {!isLoading && sectors.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No focus sectors yet. Add the first one above.
        </p>
      )}

      {!isLoading && sectors.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-divider bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-divider bg-brand-page">
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Order</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Stats</th>
                <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Top markets</th>
                <th className="px-4 py-3 text-right text-xs font-bold tracking-wide text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {sectors.map((sector) => (
                <tr key={sector.id} className="transition-colors hover:bg-brand-page/60">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-600">{sector.order ?? '—'}</td>
                  <td className="px-4 py-3">
                    {sector.image ? (
                      <img
                        src={sector.image}
                        alt=""
                        className="h-12 w-16 rounded-lg object-cover ring-1 ring-brand-divider"
                      />
                    ) : (
                      <span className="flex h-12 w-16 items-center justify-center rounded-lg bg-brand-page text-gray-400">
                        <ImageOff size={18} aria-hidden="true" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-2 font-semibold text-brand-dark">
                      {(() => {
                        const Icon = getSectorIcon(sector)
                        return <Icon size={16} className="text-brand-primary" aria-hidden="true" />
                      })()}
                      {sector.name?.en}
                    </p>
                    {sector.name?.kn && <p className="text-sm text-gray-500">{sector.name.kn}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sector.statBoxes?.length || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sector.topMarkets?.length || 0}</td>
                  <td className="px-4 py-3">
                    {pendingDeleteId === sector.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-gray-600">Delete?</span>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(sector.id)}
                          disabled={isDeleting}
                          aria-label={`Confirm delete ${sector.name?.en}`}
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
                        <button
                          type="button"
                          onClick={() => setViewing(sector)}
                          aria-label="View details"
                          className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                        >
                          <Eye size={16} />
                        </button>
                        <Link
                          to={`${ROUTES.ADMIN_FOCUS_SECTORS}/${sector.id}/edit`}
                          aria-label={`Edit ${sector.name?.en}`}
                          className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(sector.id)}
                          aria-label={`Delete ${sector.name?.en}`}
                          className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <RecordDrawer
        record={viewing}
        title={viewing ? viewing.name?.en : ''}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
