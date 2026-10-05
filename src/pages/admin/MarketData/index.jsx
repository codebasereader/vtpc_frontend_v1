import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, CircleCheck, Download, FileSpreadsheet, Loader2, Minus, Trash2, TriangleAlert, Upload } from 'lucide-react'
import { deleteMarketRelease, getMarketReleases, publishMarketRelease } from '../../../api/marketIntelligenceApi'
import { parseMarketWorkbooks, releaseCoverage } from '../../../lib/marketData/parse'
import { TEMPLATE_FILE_NAME } from '../../../lib/marketData/template'
import ConfirmDialog from '../../../components/ConfirmDialog'

const cardClass = 'rounded-2xl border border-brand-divider bg-white p-5 sm:p-6'

function formatMn(value) {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString('en-IN', { maximumFractionDigits: 1 })
}

function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function readWorkbooks(fileList) {
  const { default: readXlsxFile } = await import('read-excel-file/browser')
  const files = []
  for (const file of fileList) {
    if (!/\.xlsx$/i.test(file.name)) {
      throw new Error(`"${file.name}" is not an .xlsx file. In Excel use File → Save As → Excel Workbook (.xlsx).`)
    }
    try {
      files.push({ name: file.name, sheets: await readXlsxFile(file) })
    } catch {
      throw new Error(`"${file.name}" could not be opened. Make sure it is a valid, un-protected Excel workbook.`)
    }
  }
  return parseMarketWorkbooks(files)
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-brand-page px-4 py-3">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="mt-1 text-lg font-bold text-brand-navy-dark">{value}</p>
    </div>
  )
}

function CoverageRow({ ok, label, missingNote }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {ok ? (
        <CircleCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
      ) : (
        <Minus size={16} className="mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
      )}
      <span className={ok ? 'text-brand-dark' : 'text-gray-500'}>
        {label}
        {!ok && missingNote ? ` — ${missingNote}` : ''}
      </span>
    </li>
  )
}

function Preview({ result, existing, isPublishing, onPublish, onCancel }) {
  const { release, report } = result
  const hasErrors = report.errors.length > 0
  const coverage = release ? releaseCoverage(release) : null
  const topDistricts = release ? [...release.districts].sort((a, b) => b.current - a.current).slice(0, 5) : []

  return (
    <div className="mt-6 space-y-6">
      {release && (
        <div className="rounded-xl border border-brand-divider p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Period found in the file</p>
              <p className="mt-1 text-xl font-bold text-brand-navy-dark">{release.label}</p>
              <p className="text-sm text-gray-600">compared with {release.previousLabel}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                existing ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {existing ? 'Replaces the existing data for this period' : 'New period'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Karnataka total (US$ Mn)" value={formatMn(release.totals.current)} />
            <Stat label="Districts" value={release.districts.length} />
            <Stat label="Sectors" value={release.sectorStates.length} />
            <Stat label="Country rows" value={release.countryDistricts.length.toLocaleString('en-IN')} />
          </div>

          <h3 className="mt-5 text-sm font-bold text-brand-dark">What will appear on the website</h3>
          <ul className="mt-2 space-y-1.5">
            <CoverageRow ok={coverage.districts} label="By district" />
            <CoverageRow ok={coverage.sectorDistricts} label="By district — filter by sector" missingNote="no sector-by-district sheet in this file" />
            <CoverageRow ok={coverage.sectors} label="By sector" missingNote="no sector sheet in this file" />
            <CoverageRow ok={coverage.states} label="Karnataka vs other states" missingNote="no state sheet in this file" />
            <CoverageRow ok={coverage.countries} label="By country" missingNote="no country sheet in this file (this tab is hidden for the period)" />
          </ul>

          <h3 className="mt-5 text-sm font-bold text-brand-dark">Check a few numbers against your Excel</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-divider text-xs tracking-wide text-gray-500 uppercase">
                  <th className="py-2 pr-3">District</th>
                  <th className="py-2 pr-3 text-right">{release.previousLabel}</th>
                  <th className="py-2 pr-3 text-right">{release.label}</th>
                  <th className="py-2 text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-divider">
                {topDistricts.map((district) => (
                  <tr key={district.name}>
                    <td className="py-2 pr-3 font-medium">{district.name}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatMn(district.previous)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatMn(district.current)}</td>
                    <td className="py-2 text-right tabular-nums">{district.variation === null ? '—' : `${district.variation}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-xs text-gray-500">Values in US$ million.</p>
        </div>
      )}

      {report.errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-red-700">
            <CircleAlert size={16} aria-hidden="true" /> This file can’t be published yet
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {report.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
            <TriangleAlert size={16} aria-hidden="true" /> Please double-check
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
            {report.warnings.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-brand-dark">Sheets in the file</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {report.recognized.map((sheet) => (
            <li key={`${sheet.file}-${sheet.sheet}`} className="flex items-start gap-2">
              <CircleCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                <span className="font-medium">{sheet.sheet}</span>
                <span className="text-gray-600"> — {sheet.kindLabel}</span>
              </span>
            </li>
          ))}
          {report.ignored.map((sheet) => (
            <li key={`${sheet.file}-${sheet.sheet}`} className="flex items-start gap-2 text-gray-500">
              <Minus size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-medium">{sheet.sheet}</span> — not an export-data sheet, ignored
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPublish}
          disabled={hasErrors || !release || isPublishing}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPublishing && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {isPublishing ? 'Publishing…' : 'Publish to website'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPublishing}
          className="rounded-lg border border-brand-divider px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function MarketData() {
  const [releases, setReleases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [isReading, setIsReading] = useState(false)
  const [result, setResult] = useState(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [confirmReplace, setConfirmReplace] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadReleases = useCallback(() => {
    return getMarketReleases()
      .then(setReleases)
      .catch((err) => setError(err.message || 'Failed to load the published periods.'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadReleases()
  }, [loadReleases])

  const existing = result?.release ? releases.find((r) => r.key === result.release.key) : null

  async function handleFilesChosen(event) {
    const chosen = [...(event.target.files || [])]
    event.target.value = ''
    if (chosen.length === 0) return
    setError('')
    setNotice('')
    setResult(null)
    setIsReading(true)
    try {
      setResult(await readWorkbooks(chosen))
    } catch (err) {
      setError(err.message || 'The file could not be read.')
    } finally {
      setIsReading(false)
    }
  }

  function resetUpload() {
    setResult(null)
    setConfirmReplace(false)
  }

  async function publish() {
    setIsPublishing(true)
    setError('')
    try {
      await publishMarketRelease(result.release)
      setNotice(`${result.release.label} is now live on the website.`)
      resetUpload()
      await loadReleases()
    } catch (err) {
      setError(err.message || 'Publishing failed. Nothing was changed.')
      setConfirmReplace(false)
    } finally {
      setIsPublishing(false)
    }
  }

  function handlePublishClick() {
    if (existing) setConfirmReplace(true)
    else publish()
  }

  async function handleDelete() {
    setIsDeleting(true)
    setError('')
    try {
      await deleteMarketRelease(pendingDelete.key)
      setNotice(`${pendingDelete.label} was removed from the website.`)
      setPendingDelete(null)
      await loadReleases()
    } catch (err) {
      setError(err.message || 'Failed to remove this period.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Market Data</h1>
      <p className="mt-1 text-sm text-gray-600">
        The figures behind “Market Intelligence” in Exporter Corner. Each quarter, upload that period’s export-data Excel
        workbook — the website updates as soon as you publish.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <section className={`${cardClass} mt-6`}>
        <h2 className="text-lg font-bold text-brand-dark">Upload a new period</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-600">
          <li>
            Download the template, fill in the yellow cells for <strong>one</strong> period (a quarter or a full year)
            and save it as .xlsx. The “Read me” sheet inside explains every sheet.
          </li>
          <li>Choose the filled file below and check the preview. The period is read from the file itself.</li>
          <li>Click “Publish to website”. Uploading a period that already exists replaces it.</li>
        </ol>
        <p className="mt-2 text-xs text-gray-500">
          The original DGCIS export workbooks are also accepted as they are — use the template when you are typing the
          figures in yourself.
        </p>

        <a
          href={`/templates/${TEMPLATE_FILE_NAME}`}
          download={TEMPLATE_FILE_NAME}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-divider px-4 py-2.5 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-page"
        >
          <Download size={16} aria-hidden="true" />
          Download Excel template
        </a>

        <input
          type="file"
          accept=".xlsx"
          multiple
          onChange={handleFilesChosen}
          className="sr-only"
          id="market-data-file"
        />
        <label
          htmlFor="market-data-file"
          className={`mt-4 ml-0 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed sm:ml-3 border-brand-primary px-5 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-surface ${
            isReading || isPublishing ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {isReading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Upload size={18} aria-hidden="true" />}
          {isReading ? 'Reading the file…' : result ? 'Choose a different file' : 'Choose Excel file'}
        </label>

        {result && (
          <Preview
            result={result}
            existing={existing}
            isPublishing={isPublishing}
            onPublish={handlePublishClick}
            onCancel={resetUpload}
          />
        )}
      </section>

      <section className={`${cardClass} mt-6`}>
        <h2 className="text-lg font-bold text-brand-dark">Published periods</h2>
        {isLoading && <p className="mt-4 text-sm text-gray-600">Loading…</p>}
        {!isLoading && releases.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-brand-divider p-6 text-center text-sm text-gray-600">
            Nothing published yet. Upload the first workbook above and the Market Intelligence section will appear on the
            Exporter Corner page.
          </p>
        )}
        {releases.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-divider bg-brand-page">
                  <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Compared with</th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Contains</th>
                  <th className="px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase">Last updated</th>
                  <th className="px-4 py-3 text-right text-xs font-bold tracking-wide text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-divider">
                {releases.map((release) => (
                  <tr key={release.key} className="transition-colors hover:bg-brand-page/60">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-semibold text-brand-dark">
                        <FileSpreadsheet size={16} className="text-gray-400" aria-hidden="true" />
                        {release.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{release.previousLabel}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {release.counts?.districts ?? 0} districts · {release.counts?.sectors ?? 0} sectors
                      {release.counts?.countryRows ? ` · ${release.counts.countryRows.toLocaleString('en-IN')} country rows` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(release.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setPendingDelete(release)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={confirmReplace}
        title="Replace existing data?"
        message={`${result?.release?.label || 'This period'} is already on the website. Publishing will replace all of its figures with the ones in this file.`}
        confirmLabel="Replace and publish"
        tone="primary"
        isBusy={isPublishing}
        onConfirm={publish}
        onCancel={() => setConfirmReplace(false)}
      />
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Remove this period?"
        message={`${pendingDelete?.label || 'This period'} will disappear from the website. You can bring it back by uploading its workbook again.`}
        confirmLabel="Remove"
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
