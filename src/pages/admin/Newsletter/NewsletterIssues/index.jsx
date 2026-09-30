import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Trash2, Clock, ArrowLeft, Paperclip, X, Eye, Check, FileText } from 'lucide-react'
import {
  getNewsletterIssues,
  createNewsletterIssue,
  sendNewsletterIssue,
  deleteNewsletterIssue,
  getNewsletterSubscribers,
} from '../../../../api/newsletterApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'
import RecordDrawer from '../../../../components/RecordDrawer'

const inputClass =
  'rounded-lg border border-brand-divider px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MAX_PDF_BYTES = 10 * 1024 * 1024

const now = new Date()

function defaultSubject(month, year) {
  return `VTPC Newsletter — ${MONTHS[month - 1]} ${year}`
}

// Pre-filled, email-safe (inline styles, table-free) body. Editors just
// adjust the highlights and attach the PDF.
function defaultBody(month, year) {
  const period = `${MONTHS[month - 1]} ${year}`
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;line-height:1.6">
  <div style="background:#0f2850;color:#ffffff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">VTPC Newsletter</h1>
    <p style="margin:4px 0 0;font-size:13px;opacity:.85">${period}</p>
  </div>
  <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
    <p>Dear Subscriber,</p>
    <p>Greetings from the Visvesvaraya Trade Promotion Centre (VTPC), Karnataka. Please find our <strong>${period}</strong> newsletter attached to this email.</p>
    <p><strong>Highlights this month</strong></p>
    <ul>
      <li>Upcoming trade fairs and events</li>
      <li>New export opportunities and market insights</li>
      <li>Updates on Geographical Indication (GI) products</li>
    </ul>
    <p>Visit <a href="https://vtpc.karnataka.gov.in" style="color:#c83744">our website</a> for the latest events, downloads and exporter resources.</p>
    <p>Warm regards,<br /><strong>VTPC Karnataka</strong></p>
  </div>
  <p style="font-size:11px;color:#6b7280;text-align:center;margin-top:16px">You are receiving this because you subscribed to the VTPC newsletter.</p>
</div>`
}

export default function NewsletterIssues() {
  const [drafts, setDrafts] = useState([])
  const [subscriberCount, setSubscriberCount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [subject, setSubject] = useState(defaultSubject(now.getMonth() + 1, now.getFullYear()))
  const [body, setBody] = useState(defaultBody(now.getMonth() + 1, now.getFullYear()))
  const [subjectTouched, setSubjectTouched] = useState(false)
  const [bodyTouched, setBodyTouched] = useState(false)
  const [attachment, setAttachment] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmSendId, setConfirmSendId] = useState(null)
  const [sendingId, setSendingId] = useState(null)
  const [viewing, setViewing] = useState(null)
  const fileInputRef = useRef(null)

  function loadDrafts() {
    Promise.all([getNewsletterIssues(), getNewsletterSubscribers()])
      .then(([issuesData, subsData]) => {
        setDrafts(issuesData.filter((issue) => !issue.sentAt && issue.status !== 'sent'))
        setSubscriberCount(subsData.filter((sub) => sub.status !== 'blocked').length)
      })
      .catch((err) => setError(err.message || 'Failed to load newsletter drafts.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(loadDrafts, [])

  // Large sends run in the background on the server; keep refreshing until
  // they finish (they then move to Sent Newsletters).
  const hasSending = drafts.some((draft) => draft.status === 'sending')
  useEffect(() => {
    if (!hasSending) return undefined
    const timer = setInterval(loadDrafts, 4000)
    return () => clearInterval(timer)
  }, [hasSending])

  // Keep the pre-filled text in step with the chosen month/year until the
  // editor starts customising it.
  function handlePeriodChange(nextMonth, nextYear) {
    setMonth(nextMonth)
    setYear(nextYear)
    if (!subjectTouched) setSubject(defaultSubject(nextMonth, nextYear))
    if (!bodyTouched) setBody(defaultBody(nextMonth, nextYear))
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null
    setError('')
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files can be attached.')
        event.target.value = ''
        return
      }
      if (file.size > MAX_PDF_BYTES) {
        setError('The PDF is larger than 10 MB. Please compress it and try again.')
        event.target.value = ''
        return
      }
    }
    setAttachment(file)
  }

  function clearAttachment() {
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function resetForm() {
    const m = now.getMonth() + 1
    const y = now.getFullYear()
    setMonth(m)
    setYear(y)
    setSubject(defaultSubject(m, y))
    setBody(defaultBody(m, y))
    setSubjectTouched(false)
    setBodyTouched(false)
    clearAttachment()
    setShowPreview(false)
  }

  async function handleCreate(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)
    try {
      await createNewsletterIssue({ subject, body, month, year, attachmentFile: attachment })
      resetForm()
      setNotice('Draft saved. Review it below and press “Send now” when you are ready.')
      setIsLoading(true)
      loadDrafts()
    } catch (err) {
      setError(err.message || 'Failed to save the draft.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSend(id) {
    setSendingId(id)
    setError('')
    setNotice('')
    try {
      const result = await sendNewsletterIssue(id)
      setConfirmSendId(null)
      setNotice(
        result?.sentAt
          ? 'Newsletter sent. You can find it under Sent Newsletters.'
          : 'Sending has started in the background. It will move to Sent Newsletters when it finishes.',
      )
      setIsLoading(true)
      loadDrafts()
    } catch (err) {
      setError(err.message || 'Failed to send the newsletter.')
    } finally {
      setSendingId(null)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNewsletterIssue(id)
      setDrafts(drafts.filter((draft) => draft.id !== id))
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
            The subject and message are pre-filled — adjust if needed, attach the newsletter PDF and send it to every
            subscriber{' '}
            {subscriberCount != null && <span className="font-semibold">({subscriberCount} active)</span>}. Blocked subscribers are skipped.
          </p>
        </div>
        <Link
          to={ROUTES.ADMIN_NEWSLETTERS_SENT}
          className="flex items-center gap-2 rounded-lg border border-brand-divider px-4 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-page"
        >
          <Check size={16} strokeWidth={2} />
          Sent Newsletters
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {notice}{' '}
          {(notice.startsWith('Newsletter sent') || notice.startsWith('Sending has started')) && (
            <Link to={ROUTES.ADMIN_NEWSLETTERS_SENT} className="font-semibold underline">
              View sent newsletters
            </Link>
          )}
        </p>
      )}

      <form
        onSubmit={handleCreate}
        className="mt-6 flex max-w-2xl flex-col gap-4 rounded-2xl border border-brand-divider bg-white p-5"
      >
        <h2 className="text-sm font-bold text-brand-dark">New newsletter</h2>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Month
            <select
              value={month}
              onChange={(e) => handlePeriodChange(Number(e.target.value), year)}
              className={inputClass}
            >
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
              onChange={(e) => handlePeriodChange(month, Number(e.target.value))}
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
            onChange={(e) => {
              setSubject(e.target.value)
              setSubjectTouched(true)
            }}
            required
            className={inputClass}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="newsletter-body" className="text-sm font-medium text-brand-dark">
              Message (HTML)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
            >
              <Eye size={14} aria-hidden="true" />
              {showPreview ? 'Edit HTML' : 'Preview'}
            </button>
          </div>
          {showPreview ? (
            <iframe
              title="Newsletter preview"
              sandbox=""
              srcDoc={body}
              className="h-96 w-full rounded-lg border border-brand-divider bg-white"
            />
          ) : (
            <textarea
              id="newsletter-body"
              value={body}
              onChange={(e) => {
                setBody(e.target.value)
                setBodyTouched(true)
              }}
              required
              rows={12}
              className={`${inputClass} font-mono text-xs`}
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Newsletter PDF
          {attachment ? (
            <div className="flex items-center gap-3 rounded-lg border border-brand-divider bg-brand-page/60 px-3 py-2.5">
              <FileText size={18} className="shrink-0 text-brand-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-brand-dark">{attachment.name}</p>
                <p className="text-xs font-normal text-gray-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={clearAttachment}
                aria-label="Remove attachment"
                className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-brand-divider px-4 py-4 text-sm font-medium text-gray-600 transition-colors hover:border-brand-primary hover:bg-brand-surface/40">
              <Paperclip size={16} aria-hidden="true" />
              Attach a PDF (max 10 MB)
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          )}
          <span className="text-xs font-normal text-gray-500">
            The PDF is attached to the email that every subscriber receives.
          </span>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? 'Saving…' : 'Save Draft'}
        </Button>
      </form>

      <h2 className="mt-10 text-lg font-bold text-brand-dark">Drafts ready to send</h2>

      {isLoading && <p className="mt-6 text-center text-gray-600">Loading drafts…</p>}

      {!isLoading && drafts.length === 0 && !error && (
        <p className="mt-4 rounded-xl border border-dashed border-brand-divider p-8 text-center text-gray-600">
          No drafts. Save a newsletter above and it will appear here.
        </p>
      )}

      {!isLoading && drafts.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {drafts.map((draft) => (
            <li key={draft.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-brand-divider bg-white p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-page text-gray-400">
                <Clock size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-dark">{draft.subject}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
                  <span>
                    {MONTHS[(draft.month || 1) - 1]} {draft.year} ·{' '}
                    {draft.status === 'sending' ? (
                      <span className="font-semibold text-amber-600">Sending…</span>
                    ) : draft.status === 'failed' ? (
                      <span className="font-semibold text-red-600">Sending failed — you can retry</span>
                    ) : (
                      'Draft'
                    )}
                  </span>
                  {draft.attachment && (
                    <span className="inline-flex items-center gap-1 text-brand-primary">
                      <Paperclip size={13} aria-hidden="true" />
                      {draft.attachmentName || 'PDF attached'}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {draft.status === 'sending' ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                    Sending in progress…
                  </span>
                ) : confirmSendId === draft.id ? (
                  <>
                    <span className="text-sm text-gray-600">
                      Send to {subscriberCount ?? 'all'} subscribers?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSend(draft.id)}
                      disabled={sendingId === draft.id}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-60"
                    >
                      <Send size={14} aria-hidden="true" />
                      {sendingId === draft.id ? 'Sending…' : 'Yes, send'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSendId(null)}
                      disabled={sendingId === draft.id}
                      className="rounded-lg border border-brand-divider px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setViewing(draft)}
                      aria-label="View details"
                      className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmSendId(draft.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
                    >
                      <Send size={14} aria-hidden="true" />
                      {draft.status === 'failed' ? 'Retry send' : 'Send now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(draft.id)}
                      aria-label={`Delete ${draft.subject}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <RecordDrawer
        record={viewing}
        title={viewing ? viewing.subject : ''}
        htmlFields={['body']}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
