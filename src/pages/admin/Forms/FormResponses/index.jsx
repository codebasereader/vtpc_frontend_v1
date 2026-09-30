import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  Inbox,
  CalendarDays,
  Trash2,
} from 'lucide-react'
import { getAdminForm, getFormResponses, deleteFormResponse } from '../../../../api/formsApi'
import { ROUTES } from '../../../../constants/routes'
import { SearchInput, DateRangeFilter, NoResults } from '../../../../components/ListFilters'
import RecordDrawer from '../../../../components/RecordDrawer'
import ConfirmDialog from '../../../../components/ConfirmDialog'
import { getBilingualText } from '../../../../lib/bilingual'
import { matchesSearch, isWithinDates, formatCsvDate } from '../../../../lib/search'
import { formatAnswer } from '../../../../lib/forms'

const PAGE_SIZES = [10, 25, 50, 100]

const selectClass =
  'rounded-lg border border-brand-divider bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

const pad = (n) => String(n).padStart(2, '0')
const toInputDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

function rangeFromToday(daysBack) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - daysBack)
  return { from: toInputDate(from), to: toInputDate(to) }
}

const QUICK_RANGES = [
  ['Today', 0],
  ['Last 7 days', 6],
  ['Last 30 days', 29],
]

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// A response's answers as { questionId: value }, whatever shape the API used.
function answerMap(response) {
  const answers = response.answers
  if (Array.isArray(answers)) return Object.fromEntries(answers.map((a) => [a.questionId, a.value]))
  return answers || {}
}

export default function FormResponses() {
  const { id } = useParams()

  const [form, setForm] = useState(null)
  const [responses, setResponses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [newestFirst, setNewestFirst] = useState(true)
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)

  const [viewing, setViewing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    Promise.all([getAdminForm(id), getFormResponses(id)])
      .then(([formData, responsesData]) => {
        if (!isMounted) return
        setForm(formData)
        setResponses(Array.isArray(responsesData) ? responsesData : responsesData?.responses || [])
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load responses.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id])

  // Close the export menu on outside click / Escape.
  useEffect(() => {
    if (!isExportOpen) return undefined
    const onPointerDown = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) setIsExportOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsExportOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isExportOpen])

  // Columns: the form's current questions, plus any question that only exists in
  // older responses (it was edited or removed later) so no data is hidden.
  const columns = useMemo(() => {
    const cols = (form?.questions || []).map((q) => ({ id: q.id, label: getBilingualText(q.label, 'en') || 'Question' }))
    const known = new Set(cols.map((c) => c.id))
    responses.forEach((response) => {
      if (Array.isArray(response.answers)) {
        response.answers.forEach((answer) => {
          if (!known.has(answer.questionId)) {
            known.add(answer.questionId)
            cols.push({ id: answer.questionId, label: `${answer.question || 'Removed question'} (removed)` })
          }
        })
      }
    })
    return cols
  }, [form, responses])

  const rows = useMemo(() => responses.map((response) => ({ response, answers: answerMap(response) })), [responses])

  const filtered = useMemo(() => {
    const list = rows.filter(
      ({ response, answers }) =>
        isWithinDates(response.createdAt, dateRange.from, dateRange.to) &&
        matchesSearch(Object.values(answers).map(formatAnswer), search),
    )
    list.sort((a, b) => {
      const diff = new Date(a.response.createdAt) - new Date(b.response.createdAt)
      return newestFirst ? -diff : diff
    })
    return list
  }, [rows, dateRange, search, newestFirst])

  const isFiltered = Boolean(search.trim() || dateRange.from || dateRange.to)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const todayCount = useMemo(() => {
    const today = toInputDate(new Date())
    return responses.filter((r) => r.createdAt && toInputDate(new Date(r.createdAt)) === today).length
  }, [responses])

  // Any filter change goes back to the first page.
  const withReset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  function exportCsv(list, label) {
    const header = ['Submitted at', ...columns.map((c) => c.label)]
    const lines = [
      header.map(csvEscape).join(','),
      ...list.map(({ response, answers }) =>
        [formatCsvDate(response.createdAt), ...columns.map((c) => formatAnswer(answers[c.id]))].map(csvEscape).join(','),
      ),
    ]
    // BOM so Excel reads UTF-8 (Kannada answers) correctly.
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${form?.slug || 'form'}-responses-${label}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setIsExportOpen(false)
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteFormResponse(id, pendingDelete.response.id)
      setResponses((prev) => prev.filter((r) => r.id !== pendingDelete.response.id))
      setPendingDelete(null)
    } catch (err) {
      setError(err.message || 'Failed to delete the response.')
      setPendingDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const drawerRecord = viewing && {
    submitted: viewing.response.createdAt,
    ...Object.fromEntries(columns.map((c, index) => [`q${index}`, formatAnswer(viewing.answers[c.id]) || ''])),
  }
  const drawerLabels = {
    submitted: 'Submitted at',
    ...Object.fromEntries(columns.map((c, index) => [`q${index}`, c.label])),
  }

  const title = form ? getBilingualText(form.title, 'en') : 'Responses'
  const exportOptions = [{ key: 'all', label: 'All responses', hint: `${responses.length} rows`, rows, file: 'all' }]
  if (isFiltered) {
    exportOptions.push({
      key: 'filtered',
      label: 'Current results (with filters)',
      hint: `${filtered.length} rows`,
      rows: filtered,
      file: 'filtered',
    })
  }

  return (
    <div>
      <Link
        to={ROUTES.ADMIN_FORMS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Forms
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-brand-dark">{title}</h1>
            {form && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  form.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">Responses submitted through this form, newest first.</p>
        </div>

        <div className="flex items-center gap-2">
          {form?.isActive && (
            <a
              href={`/forms/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-divider px-4 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-page"
            >
              <ExternalLink size={15} aria-hidden="true" />
              Open form
            </a>
          )}
          <div ref={exportRef} className="relative">
            <button
              type="button"
              onClick={() => setIsExportOpen((open) => !open)}
              disabled={responses.length === 0}
              aria-haspopup="menu"
              aria-expanded={isExportOpen}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-50"
            >
              <Download size={16} strokeWidth={2} />
              Export CSV
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {isExportOpen && (
              <div
                role="menu"
                className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-brand-divider bg-white py-1 shadow-[0_12px_32px_rgba(15,40,80,0.15)]"
              >
                {exportOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="menuitem"
                    onClick={() => exportCsv(option.rows, option.file)}
                    disabled={option.rows.length === 0}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-brand-dark transition-colors hover:bg-brand-page disabled:opacity-50"
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="shrink-0 text-xs text-gray-500">{option.hint}</span>
                  </button>
                ))}
                {exportOptions.length === 1 && (
                  <p className="border-t border-brand-divider px-4 py-2 text-xs text-gray-500">
                    Set a date range or search to export just those.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading responses…</p>}

      {!isLoading && form && responses.length === 0 && !error && (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-brand-divider p-10 text-center text-gray-600">
          <Inbox size={28} className="text-gray-400" aria-hidden="true" />
          <p className="font-medium text-brand-dark">No responses yet</p>
          <p className="text-sm">Responses will appear here as soon as visitors submit this form.</p>
        </div>
      )}

      {!isLoading && form && responses.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['Total responses', responses.length, Inbox],
              ['Received today', todayCount, CalendarDays],
              [isFiltered ? 'Matching filters' : 'Showing', filtered.length, Eye],
            ].map(([label, value, Icon]) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-brand-divider bg-white p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-page text-brand-navy">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-2xl leading-none font-extrabold text-brand-dark">{value}</span>
                  <span className="mt-1 block text-xs font-semibold text-gray-500">{label}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-brand-divider bg-white p-4">
            <div className="flex flex-wrap items-end gap-4">
              <SearchInput
                value={search}
                onChange={withReset(setSearch)}
                placeholder="Search answers…"
                className="min-w-56 flex-1"
              />
              <button
                type="button"
                onClick={() => setNewestFirst((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-brand-divider px-3 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-page"
              >
                {newestFirst ? <ArrowDownWideNarrow size={16} aria-hidden="true" /> : <ArrowUpWideNarrow size={16} aria-hidden="true" />}
                {newestFirst ? 'Newest first' : 'Oldest first'}
              </button>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_RANGES.map(([label, daysBack]) => {
                  const range = rangeFromToday(daysBack)
                  const isActive = dateRange.from === range.from && dateRange.to === range.to
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => withReset(setDateRange)(range)}
                      aria-pressed={isActive}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        isActive ? 'bg-brand-navy-dark text-white' : 'bg-brand-page text-brand-dark hover:bg-brand-surface'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <DateRangeFilter
                from={dateRange.from}
                to={dateRange.to}
                onChange={withReset(setDateRange)}
                fromLabel="Submitted from"
                toLabel="Submitted to"
              />
            </div>
          </div>

          {filtered.length === 0 && <NoResults query={search} />}

          {filtered.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-divider bg-white">
              <table className="w-full min-w-max text-left">
                <thead>
                  <tr className="border-b border-brand-divider bg-brand-page">
                    <th className="px-4 py-3 text-xs font-bold tracking-wide whitespace-nowrap text-gray-500 uppercase">
                      Submitted at
                    </th>
                    {columns.map((column) => (
                      <th
                        key={column.id}
                        className="max-w-64 min-w-40 px-4 py-3 text-xs font-bold tracking-wide text-gray-500 uppercase"
                      >
                        <span className="line-clamp-2">{column.label}</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-bold tracking-wide text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-divider">
                  {pageRows.map((row) => (
                    <tr key={row.response.id} className="align-top transition-colors hover:bg-brand-page/60">
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                        {formatDateTime(row.response.createdAt)}
                      </td>
                      {columns.map((column) => {
                        const text = formatAnswer(row.answers[column.id])
                        return (
                          <td key={column.id} className="max-w-64 min-w-40 px-4 py-3 text-sm text-brand-dark">
                            {text ? <span className="line-clamp-3 whitespace-pre-wrap">{text}</span> : <span className="text-gray-300">—</span>}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewing(row)}
                            aria-label="View response"
                            className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(row)}
                            aria-label="Delete response"
                            className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of{' '}
                {filtered.length}
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  Rows
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setPage(1)
                    }}
                    className={selectClass}
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="rounded-md border border-brand-divider p-2 text-gray-600 hover:bg-brand-page disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 text-sm font-medium text-brand-dark">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    aria-label="Next page"
                    className="rounded-md border border-brand-divider p-2 text-gray-600 hover:bg-brand-page disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <RecordDrawer
        record={drawerRecord}
        title={viewing ? `Response · ${formatDateTime(viewing.response.createdAt)}` : ''}
        fieldLabels={drawerLabels}
        onClose={() => setViewing(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete this response?"
        message="This response will be permanently removed and will no longer appear in exports. This cannot be undone."
        confirmLabel="Delete response"
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => !isDeleting && setPendingDelete(null)}
      />
    </div>
  )
}
