import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { getSectors, createSector, updateSector } from '../../../../api/sectorsApi'
import { ROUTES } from '../../../../constants/routes'
import { SECTOR_ICON_OPTIONS } from '../../../../constants/sectorIcons'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

const EMPTY_STAT = { value: '', labelEn: '', labelKn: '' }
const EMPTY_YEAR = { year: '', valueUsdMn: '' }
const EMPTY_MARKET = { country: '', percentage: '' }

export default function FocusSectorForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [nameEn, setNameEn] = useState('')
  const [nameKn, setNameKn] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionKn, setDescriptionKn] = useState('')
  const [keyInsightsEn, setKeyInsightsEn] = useState('')
  const [keyInsightsKn, setKeyInsightsKn] = useState('')
  const [statBoxes, setStatBoxes] = useState([])
  const [yearlyChart, setYearlyChart] = useState([])
  const [topMarkets, setTopMarkets] = useState([])
  const [icon, setIcon] = useState('layers')
  const [order, setOrder] = useState(0)
  const [imageFile, setImageFile] = useState(null)
  const [existingImage, setExistingImage] = useState('')

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getSectors()
      .then((sectors) => {
        const sector = sectors.find((item) => item.id === id)
        if (!isMounted) return
        if (!sector) {
          setError('Focus sector not found.')
          return
        }
        setNameEn(sector.name?.en || '')
        setNameKn(sector.name?.kn || '')
        setDescriptionEn(sector.description?.en || '')
        setDescriptionKn(sector.description?.kn || '')
        setKeyInsightsEn(sector.keyInsights?.en || '')
        setKeyInsightsKn(sector.keyInsights?.kn || '')
        setStatBoxes(
          (sector.statBoxes || []).map((s) => ({ value: s.value, labelEn: s.label?.en || '', labelKn: s.label?.kn || '' })),
        )
        setYearlyChart((sector.yearlyChart || []).map((y) => ({ year: y.year, valueUsdMn: String(y.valueUsdMn) })))
        setTopMarkets((sector.topMarkets || []).map((m) => ({ country: m.country, percentage: String(m.percentage) })))
        setIcon(sector.icon || 'layers')
        setOrder(sector.order ?? 0)
        setExistingImage(sector.image || '')
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load focus sector.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id, isEditMode])

  function updateRow(setter, index, field, value) {
    setter((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function removeRow(setter, index) {
    setter((rows) => rows.filter((_, i) => i !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const payload = {
        nameEn,
        nameKn,
        descriptionEn,
        descriptionKn,
        keyInsightsEn,
        keyInsightsKn,
        statBoxes: statBoxes.map((s) => ({ value: s.value, label: { en: s.labelEn, kn: s.labelKn } })),
        yearlyChart: yearlyChart.map((y) => ({ year: y.year, valueUsdMn: Number(y.valueUsdMn) })),
        topMarkets: topMarkets.map((m) => ({ country: m.country, percentage: Number(m.percentage) })),
        icon,
        order,
        imageFile,
      }
      if (isEditMode) {
        await updateSector(id, payload)
      } else {
        await createSector(payload)
      }
      navigate(ROUTES.ADMIN_FOCUS_SECTORS)
    } catch (err) {
      setError(err.message || 'Failed to save focus sector.')
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
        to={ROUTES.ADMIN_FOCUS_SECTORS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Focus Sectors
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-brand-dark">
        {isEditMode ? 'Edit Focus Sector' : 'Add Focus Sector'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-2xl flex-col gap-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Name (English)
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
              placeholder="e.g. Aerospace"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Name (Kannada)
            <input
              type="text"
              value={nameKn}
              onChange={(e) => setNameKn(e.target.value)}
              placeholder="ಕನ್ನಡದಲ್ಲಿ ಹೆಸರು"
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Description (English)
          <textarea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            required
            rows={4}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Description (Kannada)
          <textarea
            value={descriptionKn}
            onChange={(e) => setDescriptionKn(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-brand-dark">Icon (shown on the sector tab)</legend>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SECTOR_ICON_OPTIONS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                aria-pressed={icon === key}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center text-[11px] leading-tight transition-colors ${
                  icon === key
                    ? 'border-brand-primary bg-brand-surface text-brand-primary'
                    : 'border-brand-divider text-gray-600 hover:bg-brand-page'
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Display order
          <input
            type="number"
            min="0"
            value={order}
            onChange={(e) => setOrder(e.target.value === '' ? 0 : Number(e.target.value))}
            className={`${inputClass} w-32`}
          />
          <span className="text-xs font-normal text-gray-500">Lower numbers appear first on the public page.</span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Image
          {existingImage && !imageFile && (
            <img src={existingImage} alt="" className="mb-2 h-24 w-40 rounded-lg object-cover" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            required={!isEditMode}
            className="text-sm"
          />
        </label>

        <RowsEditor
          title="Stat boxes"
          hint="Highlighted figures, e.g. “40%” — “of Pharma products exported overseas”."
          rows={statBoxes}
          onAdd={() => setStatBoxes((rows) => [...rows, { ...EMPTY_STAT }])}
          onRemove={(i) => removeRow(setStatBoxes, i)}
          addLabel="Add stat box"
        >
          {(row, i) => (
            <div className="grid flex-1 gap-2 sm:grid-cols-[6rem_1fr_1fr]">
              <input
                aria-label="Value"
                placeholder="Value"
                value={row.value}
                onChange={(e) => updateRow(setStatBoxes, i, 'value', e.target.value)}
                required
                className={inputClass}
              />
              <input
                aria-label="Label (English)"
                placeholder="Label (English)"
                value={row.labelEn}
                onChange={(e) => updateRow(setStatBoxes, i, 'labelEn', e.target.value)}
                required
                className={inputClass}
              />
              <input
                aria-label="Label (Kannada)"
                placeholder="Label (Kannada)"
                value={row.labelKn}
                onChange={(e) => updateRow(setStatBoxes, i, 'labelKn', e.target.value)}
                className={inputClass}
              />
            </div>
          )}
        </RowsEditor>

        <RowsEditor
          title="Yearly exports (USD Mn)"
          hint="One row per financial year."
          rows={yearlyChart}
          onAdd={() => setYearlyChart((rows) => [...rows, { ...EMPTY_YEAR }])}
          onRemove={(i) => removeRow(setYearlyChart, i)}
          addLabel="Add year"
        >
          {(row, i) => (
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <input
                aria-label="Year"
                placeholder="e.g. FY-2023"
                value={row.year}
                onChange={(e) => updateRow(setYearlyChart, i, 'year', e.target.value)}
                required
                className={inputClass}
              />
              <input
                aria-label="Value in USD million"
                type="number"
                step="any"
                min="0"
                placeholder="Value (USD Mn)"
                value={row.valueUsdMn}
                onChange={(e) => updateRow(setYearlyChart, i, 'valueUsdMn', e.target.value)}
                required
                className={inputClass}
              />
            </div>
          )}
        </RowsEditor>

        <RowsEditor
          title="Top markets"
          hint="Destination countries with their share of exports."
          rows={topMarkets}
          onAdd={() => setTopMarkets((rows) => [...rows, { ...EMPTY_MARKET }])}
          onRemove={(i) => removeRow(setTopMarkets, i)}
          addLabel="Add market"
        >
          {(row, i) => (
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <input
                aria-label="Country"
                placeholder="Country"
                value={row.country}
                onChange={(e) => updateRow(setTopMarkets, i, 'country', e.target.value)}
                required
                className={inputClass}
              />
              <input
                aria-label="Percentage"
                type="number"
                step="any"
                min="0"
                max="100"
                placeholder="Share (%)"
                value={row.percentage}
                onChange={(e) => updateRow(setTopMarkets, i, 'percentage', e.target.value)}
                required
                className={inputClass}
              />
            </div>
          )}
        </RowsEditor>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Key insights (English)
          <textarea value={keyInsightsEn} onChange={(e) => setKeyInsightsEn(e.target.value)} rows={3} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Key insights (Kannada)
          <textarea value={keyInsightsKn} onChange={(e) => setKeyInsightsKn(e.target.value)} rows={3} className={inputClass} />
        </label>

        <div className="mt-2 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Focus Sector'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_FOCUS_SECTORS)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

function RowsEditor({ title, hint, rows, onAdd, onRemove, addLabel, children }) {
  return (
    <fieldset className="rounded-xl border border-brand-divider p-4">
      <legend className="px-1 text-sm font-semibold text-brand-dark">{title}</legend>
      <p className="-mt-1 mb-3 text-xs text-gray-500">{hint}</p>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={index} className="flex items-start gap-2">
            {children(row, index)}
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${title} row ${index + 1}`}
              className="mt-1.5 rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-divider px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-page"
      >
        <Plus size={15} aria-hidden="true" />
        {addLabel}
      </button>
    </fieldset>
  )
}
