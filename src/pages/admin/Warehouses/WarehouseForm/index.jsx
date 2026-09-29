import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getWarehouses, createWarehouse, updateWarehouse } from '../../../../api/warehousesApi'
import { getDistricts } from '../../../../api/districtsApi'
import { getTaluks } from '../../../../api/taluksApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

export default function WarehouseForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [district, setDistrict] = useState('')
  const [taluk, setTaluk] = useState('')
  const [capacityMt, setCapacityMt] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [address, setAddress] = useState('')

  const [districts, setDistricts] = useState([])
  const [allTaluks, setAllTaluks] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    Promise.all([getDistricts(), getTaluks(), isEditMode ? getWarehouses() : Promise.resolve(null)])
      .then(([districtsData, taluksData, warehousesData]) => {
        if (!isMounted) return
        const sortedDistricts = [...districtsData].sort((a, b) => a.name.localeCompare(b.name))
        setDistricts(sortedDistricts)
        setAllTaluks(taluksData)

        if (!isEditMode) {
          setDistrict(sortedDistricts[0]?.id || '')
          return
        }
        const warehouse = warehousesData.find((item) => item.id === id)
        if (!warehouse) {
          setError('Warehouse not found.')
          return
        }
        setName(warehouse.name || '')
        setDistrict(warehouse.district || '')
        setTaluk(warehouse.taluk || '')
        setCapacityMt(warehouse.capacityMt ?? '')
        setLat(warehouse.lat ?? '')
        setLng(warehouse.lng ?? '')
        setAddress(warehouse.address || '')
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load warehouse.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id, isEditMode])

  const talukOptions = useMemo(
    () => allTaluks.filter((t) => t.district === district),
    [allTaluks, district],
  )

  function handleDistrictChange(nextDistrict) {
    setDistrict(nextDistrict)
    setTaluk('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const payload = { name, district, taluk, capacityMt, lat, lng, address }
      if (isEditMode) {
        await updateWarehouse(id, payload)
      } else {
        await createWarehouse(payload)
      }
      navigate(ROUTES.ADMIN_WAREHOUSES)
    } catch (err) {
      setError(err.message || 'Failed to save warehouse.')
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
        to={ROUTES.ADMIN_WAREHOUSES}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Warehouses
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">
        {isEditMode ? 'Edit Warehouse' : 'Add Warehouse'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Warehouse name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. VTPC Export Warehouse - Kalaburagi"
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            District
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              required
              className={inputClass}
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Taluk
            <select value={taluk} onChange={(e) => setTaluk(e.target.value)} className={inputClass}>
              <option value="">— None —</option>
              {talukOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Capacity (MT)
          <input
            type="number"
            value={capacityMt}
            onChange={(e) => setCapacityMt(e.target.value)}
            required
            min={0}
            placeholder="e.g. 5000"
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Latitude (optional)
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 17.3297"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Longitude (optional)
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g. 76.8343"
              className={inputClass}
            />
          </label>
        </div>
        <p className="-mt-2 text-xs text-gray-500">
          Leave blank if the exact location isn't known yet — the warehouse still shows in search results, just not
          on the map.
        </p>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Address (optional)
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Warehouse'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_WAREHOUSES)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
