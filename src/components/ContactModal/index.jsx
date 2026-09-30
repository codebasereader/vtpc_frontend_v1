import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { X, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { common } from '../../language/common'
import { submitContactEnquiry } from '../../api/contactEnquiriesApi'
import { useExitTransition } from '../../lib/useExitTransition'

const t = common.contactModal
const MAX_MESSAGE = 2000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/

const inputClass =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-brand-dark outline-none transition-colors placeholder:text-gray-400 focus:ring-2'

function fieldClass(hasError) {
  return `${inputClass} ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
      : 'border-brand-divider focus:border-brand-primary focus:ring-brand-primary/15'
  }`
}

/**
 * "Contact Us" enquiry modal (name, email, phone, enquiry). Fades/scales in and
 * out; the form is unmounted after closing so it always reopens fresh.
 */
export default function ContactModal({ isOpen, onClose }) {
  const { mounted, visible } = useExitTransition(isOpen, 220)

  useEffect(() => {
    if (!isOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 transition-opacity duration-200 ease-out motion-reduce:transition-none sm:items-center sm:p-4 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <ContactForm visible={visible} isOpen={isOpen} onClose={onClose} />
    </div>
  )
}

function ContactForm({ visible, isOpen, onClose }) {
  const language = useSelector(selectLanguage)
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '', website: '' })
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const firstFieldRef = useRef(null)

  useEffect(() => {
    if (visible) firstFieldRef.current?.focus()
  }, [visible])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && status !== 'submitting') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, status, onClose])

  const errors = {}
  if (!values.name.trim()) errors.name = t.required[language]
  if (!values.email.trim()) errors.email = t.required[language]
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = t.invalidEmail[language]
  if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) errors.phone = t.invalidPhone[language]
  if (!values.message.trim()) errors.message = t.required[language]

  const showError = (field) => (touched[field] ? errors[field] : undefined)

  function update(field) {
    return (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function markTouched(field) {
    return () => setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched({ name: true, email: true, phone: true, message: true })
    if (Object.keys(errors).length > 0) return

    // Honeypot: real visitors never see or fill this field.
    if (values.website) {
      setStatus('success')
      return
    }

    setStatus('submitting')
    try {
      await submitContactEnquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const isSubmitting = status === 'submitting'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onClick={(event) => event.stopPropagation()}
      className={`relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.3)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:rounded-2xl sm:p-8 ${
        visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0'
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        aria-label={t.close[language]}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-brand-page hover:text-brand-navy-dark"
      >
        <X size={20} aria-hidden="true" />
      </button>

      {status === 'success' ? (
        <div className="flex flex-col items-center px-2 py-6 text-center">
          <span className="contact-success-pop flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={36} aria-hidden="true" />
          </span>
          <h2 id="contact-modal-title" className="mt-5 text-xl font-bold text-brand-navy-dark">
            {t.successTitle[language]}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-600">{t.successBody[language]}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-dark"
          >
            {t.close[language]}
          </button>
        </div>
      ) : (
        <>
          <h2 id="contact-modal-title" className="pr-10 text-xl font-bold text-brand-navy-dark">
            {t.title[language]}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{t.subtitle[language]}</p>

          <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
            {status === 'error' && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {t.error[language]}
              </p>
            )}

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-brand-dark">
              {t.name[language]}
              <input
                ref={firstFieldRef}
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={update('name')}
                onBlur={markTouched('name')}
                placeholder={t.namePlaceholder[language]}
                aria-invalid={Boolean(showError('name'))}
                className={fieldClass(showError('name'))}
              />
              {showError('name') && <span className="text-xs font-normal text-red-600">{showError('name')}</span>}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-brand-dark">
                {t.email[language]}
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={values.email}
                  onChange={update('email')}
                  onBlur={markTouched('email')}
                  placeholder={t.emailPlaceholder[language]}
                  aria-invalid={Boolean(showError('email'))}
                  className={fieldClass(showError('email'))}
                />
                {showError('email') && <span className="text-xs font-normal text-red-600">{showError('email')}</span>}
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-semibold text-brand-dark">
                <span>
                  {t.phone[language]}{' '}
                  <span className="text-xs font-normal text-gray-400">({t.optional[language]})</span>
                </span>
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={values.phone}
                  onChange={update('phone')}
                  onBlur={markTouched('phone')}
                  placeholder={t.phonePlaceholder[language]}
                  aria-invalid={Boolean(showError('phone'))}
                  className={fieldClass(showError('phone'))}
                />
                {showError('phone') && <span className="text-xs font-normal text-red-600">{showError('phone')}</span>}
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-brand-dark">
              {t.enquiry[language]}
              <textarea
                rows={4}
                maxLength={MAX_MESSAGE}
                value={values.message}
                onChange={update('message')}
                onBlur={markTouched('message')}
                placeholder={t.enquiryPlaceholder[language]}
                aria-invalid={Boolean(showError('message'))}
                className={`${fieldClass(showError('message'))} resize-none`}
              />
              <span className="flex items-center justify-between text-xs font-normal">
                <span className="text-red-600">{showError('message')}</span>
                <span className="text-gray-400">
                  {values.message.length}/{MAX_MESSAGE}
                </span>
              </span>
            </label>

            {/* Honeypot — hidden from people and assistive tech, bots fill it. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={values.website}
              onChange={update('website')}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Send size={15} aria-hidden="true" />
              )}
              {isSubmitting ? t.submitting[language] : t.submit[language]}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
