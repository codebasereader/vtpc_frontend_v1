import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Check, X, Warehouse as WarehouseIcon } from 'lucide-react'
import { getWarehouses, deleteWarehouse } from '../../../../api/warehousesApi'
import { getDistricts } from '../../../../api/districtsApi'
import { getTaluks } from '../../../../api/taluksApi'
import { ROUTES } from '../../../../constants/routes'

export default function WarehousesList() {
  const [warehouses, setWarehouses] = useState([])
  const [districts, setDistricts] = useState([])
  const [taluks, setTaluks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    Promise.all([getWarehouses(), getDistricts(), getTaluks()])
      .then(([warehousesData, districtsData, taluksData]) => {
        if (!isMounted) return
        setWarehouses(warehousesData)
        setDistricts(districtsData)
        setTaluks(taluksData)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load warehouses.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const districtName = useMemo(() => {
    const map = new Map(districts.map((d) => [d.id, d.name]))
    return (slug) => map.get(slug) || slug
  }, [districts])

  const talukName = useMemo(() => {
    const map = new Map(taluks.map((t) => [t.id, t.name]))
    return (id) => map.get(id) || ''
  }, [taluks])

  async function handleConfirmDelete(id) {
    setIsDeleting(true)
    try {
      await deleteWarehouse(id)
      setWarehouses(warehouses.filter((warehouse) => warehouse.id !== id))
      setPendingDeleteId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete warehouse.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Warehouses</h1>
          <p className="mt-1 text-sm text-gray-600">
            Shown on the Exporter Corner "Warehouse Facilities" map and filters. Add latitude/longitude to place a
            pin on the map.
          </p>
        </div>
        <Link
          to={`${ROUTES.ADMIN_WAREHOUSES}/new`}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark"
        >
          <Plus size={18} strokeWidth={2} />
          Add Warehouse
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading warehouses…</p>}

      {!isLoading && warehouses.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No warehouses yet. Add the first one above.
        </p>
      )}

      {!isLoading && warehouses.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {warehouses.map((warehouse) => (
            <li
              key={warehouse.id}
              className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-page text-brand-navy">
                <WarehouseIcon size={18} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-dark">{warehouse.name}</p>
                <p className="truncate text-sm text-gray-600">
                  {[districtName(warehouse.district), talukName(warehouse.taluk)].filter(Boolean).join(' · ')}
                  {' · '}
                  {warehouse.capacityMt?.toLocaleString('en-IN')} MT
                  {(warehouse.lat == null || warehouse.lng == null) && (
                    <span className="ml-1 text-amber-600">(no map pin)</span>
                  )}
                </p>
              </div>

              {pendingDeleteId === warehouse.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm text-gray-600">Delete?</span>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(warehouse.id)}
                    disabled={isDeleting}
                    aria-label={`Confirm delete ${warehouse.name}`}
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
                    to={`${ROUTES.ADMIN_WAREHOUSES}/${warehouse.id}/edit`}
                    aria-label={`Edit ${warehouse.name}`}
                    className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(warehouse.id)}
                    aria-label={`Delete ${warehouse.name}`}
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
