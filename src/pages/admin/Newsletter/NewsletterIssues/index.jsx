import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Trash2, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'
import {
  getNewsletterIssues,
  createNewsletterIssue,
  sendNewsletterIssue,
  deleteNewsletterIssue,
  getNewsletterSubscribers,
} from '../../../../api/newsletterApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const now = new Date()

export default function NewsletterIssues() {
  const [issues, setIssues] = useState([])
  const [subscriberCount, setSubscriberCount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendingId, setSendingId] = useState(null)

  function loadIssues() {
    Promise.all([getNewsletterIssues(), getNewsletterSubscribers()])
      .then(([issuesData, subsData]) => {
        setIssues(issuesData)
        setSubscriberCount(subsData.length)
      })
      .catch((err) => setError(err.message || 'Failed to load newsletter issues.'))
      .finally(() => setIsLoading(false))
  }

  function reloadIssues() {
    setIsLoading(true)
    loadIssues()
  }

  useEffect(loadIssues, [])

  async function handleCreate(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await createNewsletterIssue({ subject, body, month, year })
      setSubject('')
      setBody('')
      reloadIssues()
    } catch (err) {
      setError(err.message || 'Failed to save the draft.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSend(id) {
    setSendingId(id)
    setError('')
    try {
      await sendNewsletterIssue(id)
      reloadIssues()
    } catch (err) {
      setError(err.message || 'Failed to send the newsletter.')
    } finally {
      setSendingId(null)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNewsletterIssue(id)
      setIssues(issues.filter((issue) => issue.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete the draft.')
    }
  }

  return (
    <div>
      <Link
        to={ROUTES.ADMIN_NEWSLETTER_SUBSCRIBERS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Subscribers
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Send Newsletter</h1>
          <p className="mt-1 text-sm text-gray-600">
            Write one issue per month and send it to every subscriber{' '}
            {subscriberCount != null && <span className="font-semibold">({subscriberCount} currently)</span>}. Past
            issues stay archived below, grouped by month.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleCreate} className="mt-6 flex max-w-xl flex-col gap-4 rounded-2xl border border-brand-divider bg-white p-5">
        <h2 className="text-sm font-bold text-brand-dark">New draft</h2>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Month
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputClass}>
              {MONTHS.map((m, index) => (
                <option key={m} value={index + 1}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Year
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
              className={inputClass}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Subject
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="e.g. VTPC Newsletter — October 2026"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Body (HTML)
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={8}
            placeholder="<p>This month at VTPC...</p>"
            className={`${inputClass} font-mono text-xs`}
          />
        </label>

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? 'Saving…' : 'Save Draft'}
        </Button>
      </form>

      {isLoading && <p className="mt-8 text-center text-gray-600">Loading issues…</p>}

      {!isLoading && issues.length === 0 && !error && (
        <p className="mt-8 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No newsletter issues yet.
        </p>
      )}

      {!isLoading && issues.length > 0 && (
        <ul className="mt-8 flex flex-col gap-3">
          {issues.map((issue) => (
            <li key={issue.id} className="flex items-center gap-4 rounded-xl border border-brand-divider bg-white p-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  issue.sentAt ? 'bg-green-50 text-green-600' : 'bg-brand-page text-gray-400'
                }`}
              >
                {issue.sentAt ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-dark">{issue.subject}</p>
                <p className="text-sm text-gray-500">
                  {MONTHS[(issue.month || 1) - 1]} {issue.year}
                  {issue.sentAt
                    ? ` · Sent ${new Date(issue.sentAt).toLocaleDateString()} to ${issue.recipientCount ?? '—'} subscribers`
                    : ' · Draft, not sent yet'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!issue.sentAt && (
                  <button
                    type="button"
                    onClick={() => handleSend(issue.id)}
                    disabled={sendingId === issue.id}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-60"
                  >
                    <Send size={14} aria-hidden="true" />
                    {sendingId === issue.id ? 'Sending…' : 'Send now'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(issue.id)}
                  aria-label={`Delete ${issue.subject}`}
                  className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
