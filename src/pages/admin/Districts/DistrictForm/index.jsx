import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { getDistricts, createDistrict, updateDistrict } from '../../../../api/districtsApi'
import { ROUTES } from '../../../../constants/routes'
import { KARNATAKA_DISTRICTS } from '../../../../constants/districts'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

const EMPTY_ROW = { name: '', percentage: '' }

function RowsEditor({ label, rows, onChange }) {
  function updateRow(index, field, value) {
    onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-brand-dark">{label}</p>
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={row.name}
            onChange={(e) => updateRow(index, 'name', e.target.value)}
            placeholder="e.g. USA"
            className={`${inputClass} flex-1`}
          />
          <input
            type="number"
            step="0.01"
            value={row.percentage}
            onChange={(e) => updateRow(index, 'percentage', e.target.value)}
            placeholder="%"
            className={`${inputClass} w-24`}
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
            aria-label={`Remove ${label.toLowerCase()} row ${index + 1}`}
            className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { ...EMPTY_ROW }])}
        className="self-start text-sm font-medium text-brand-primary hover:text-brand-primary-dark"
      >
        + Add {label.toLowerCase()}
      </button>
    </div>
  )
}

export default function DistrictForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [taglineEn, setTaglineEn] = useState('')
  const [totalExportValueCr, setTotalExportValueCr] = useState('')
  const [countries, setCountries] = useState([])
  const [products, setProducts] = useState([])
  const [sectors, setSectors] = useState([])

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getDistricts()
      .then((districts) => {
        const district = districts.find((item) => item.id === id)
        if (!isMounted) return
        if (!district) {
          setError('District not found.')
          return
        }
        setSlug(district.id)
        setName(district.name || '')
        setTaglineEn(district.tagline?.en || '')
        setTotalExportValueCr(district.totalExportValueCr ?? '')
        setCountries(district.countries?.length ? district.countries : [])
        setProducts(district.products?.length ? district.products : [])
        setSectors(district.sectors?.length ? district.sectors : [])
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load district.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id, isEditMode])

  function handleDistrictPick(pickedSlug) {
    setSlug(pickedSlug)
    const match = KARNATAKA_DISTRICTS.find((d) => d.slug === pickedSlug)
    setName(match?.name || '')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const payload = { slug, name, taglineEn, totalExportValueCr, countries, products, sectors }
      if (isEditMode) {
        await updateDistrict(id, payload)
      } else {
        await createDistrict(payload)
      }
      navigate(ROUTES.ADMIN_DISTRICTS)
    } catch (err) {
      setError(err.message || 'Failed to save district.')
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
        to={ROUTES.ADMIN_DISTRICTS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Districts
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit District' : 'Add District'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-lg flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          District
          <select
            value={slug}
            onChange={(e) => handleDistrictPick(e.target.value)}
            required
            disabled={isEditMode}
            className={`${inputClass} disabled:bg-brand-page disabled:text-gray-500`}
          >
            <option value="" disabled>
              Select a district
            </option>
            {KARNATAKA_DISTRICTS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Tagline (English)
          <input
            type="text"
            value={taglineEn}
            onChange={(e) => setTaglineEn(e.target.value)}
            placeholder="e.g. Lime and heritage crafts"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Total Exports Value (INR, in Crores)
          <input
            type="number"
            step="0.01"
            value={totalExportValueCr}
            onChange={(e) => setTotalExportValueCr(e.target.value)}
            className={inputClass}
          />
        </label>

        <RowsEditor label="Country" rows={countries} onChange={setCountries} />
        <RowsEditor label="Product" rows={products} onChange={setProducts} />
        <RowsEditor label="Sector" rows={sectors} onChange={setSectors} />

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create District'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_DISTRICTS)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
