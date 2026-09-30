import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getVisitsDaily, getVisitsSummary } from '../../../api/visitsApi'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

function isoDaysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export default function VisitorAnalytics() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [from, setFrom] = useState(isoDaysAgo(29))
  const [to, setTo] = useState(isoDaysAgo(0))

  function fetchData() {
    Promise.all([getVisitsDaily({ from, to }), getVisitsSummary()])
      .then(([daily, summary]) => {
        setRows(daily)
        setTotal(summary.total)
      })
      .catch((err) => setError(err.message || 'Visitor analytics aren’t available yet.'))
      .finally(() => setIsLoading(false))
  }

  function load() {
    setIsLoading(true)
    setError('')
    fetchData()
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only; "Apply" re-runs it explicitly
  useEffect(fetchData, [])

  const chartData = useMemo(
    () => rows.map((row) => ({ date: row.date?.slice(5), count: row.count })),
    [rows],
  )
  const rangeTotal = useMemo(() => rows.reduce((sum, row) => sum + (row.count || 0), 0), [rows])

  function applyPreset(days) {
    setFrom(isoDaysAgo(days - 1))
    setTo(isoDaysAgo(0))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Visitor Analytics</h1>
      <p className="mt-1 text-sm text-gray-600">
        Daily site visits, filterable by date range. The homepage footer shows the running total shown below.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-brand-divider bg-white p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-surface text-brand-primary">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-extrabold text-brand-navy-dark">{total != null ? total.toLocaleString() : '—'}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total visits (all-time)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-brand-divider bg-white p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-surface text-brand-primary">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-extrabold text-brand-navy-dark">{rangeTotal.toLocaleString()}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase">Visits in selected range</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-divider bg-white p-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
        </label>
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
        >
          Apply
        </button>
        <div className="ml-auto flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => applyPreset(days)}
              className="rounded-full bg-brand-page px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand-surface"
            >
              Last {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-80 rounded-2xl border border-brand-divider bg-white p-5">
        {isLoading ? (
          <p className="pt-10 text-center text-gray-600">Loading…</p>
        ) : chartData.length === 0 ? (
          <p className="pt-10 text-center text-gray-500">No visit data for this range yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7dbdb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#c83744" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
