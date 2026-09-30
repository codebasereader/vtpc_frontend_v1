import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { CheckCircle2, FileX2, Loader2, Send } from 'lucide-react'
import { getPublicForm, submitFormResponse } from '../../../api/formsApi'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { forms } from '../../../language/forms'
import { validationMessages } from '../../../language/forms'
import { ROUTES } from '../../../constants/routes'
import FormRenderer from '../../../components/FormRenderer'
import { buildAnswers, emptyValueFor, localText, validateAnswers } from '../../../lib/forms'

const t = forms.page
const tr = (entry, language) => entry[language] || entry.en

function initialValues(form) {
  return Object.fromEntries((form.questions || []).map((question) => [question.id, emptyValueFor(question)]))
}

export default function FormPage() {
  const { slug } = useParams()
  // Keyed by slug so navigating between forms starts fresh in the loading state.
  return <FormPageContent key={slug} slug={slug} />
}

function FormPageContent({ slug }) {
  const language = useSelector(selectLanguage)

  const [form, setForm] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | closed | submitted
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const formRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    getPublicForm(slug)
      .then((data) => {
        if (!isMounted) return
        setForm(data)
        setValues(initialValues(data))
        setErrors({})
        setStatus('ready')
      })
      .catch(() => {
        if (isMounted) setStatus('closed')
      })
    return () => {
      isMounted = false
    }
  }, [slug])

  function handleChange(questionId, value) {
    setValues((prev) => ({ ...prev, [questionId]: value }))
    // Clear that question's error as soon as the visitor edits it.
    setErrors((prev) => {
      if (!prev[questionId]) return prev
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const nextErrors = validateAnswers(form, values, validationMessages(language))
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError(tr(t.checkErrors, language))
      const firstId = form.questions.find((question) => nextErrors[question.id])?.id
      const target = firstId ? formRef.current?.querySelector(`[id="q-${firstId}-label"]`) : null
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Honeypot: real visitors never see this field.
    if (honeypot) {
      setStatus('submitted')
      return
    }

    setIsSubmitting(true)
    try {
      await submitFormResponse(slug, buildAnswers(form, values))
      setStatus('submitted')
    } catch (err) {
      // The server can also refuse (e.g. the form was closed while it was open).
      if (err?.status === 404) setStatus('closed')
      else setSubmitError(err?.message && err.status === 400 ? err.message : tr(t.error, language))
    } finally {
      setIsSubmitting(false)
    }
  }

  function startAgain() {
    setValues(initialValues(form))
    setErrors({})
    setSubmitError('')
    setStatus('ready')
  }

  const title = form ? localText(form.title, language) : ''

  return (
    <section className="px-4 py-10 md:px-8 md:py-14">
      <Helmet>
        <title>{title ? `${title} — VTPC Karnataka` : 'Form — VTPC Karnataka'}</title>
      </Helmet>

      <div className="mx-auto max-w-2xl">
        {status === 'loading' && (
          <p className="flex items-center justify-center gap-2 py-20 text-gray-600" role="status">
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            {tr(t.loading, language)}
          </p>
        )}

        {status === 'closed' && (
          <div className="flex flex-col items-center rounded-2xl border border-brand-divider bg-white px-6 py-14 text-center shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-page text-gray-400">
              <FileX2 size={28} aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-xl font-bold text-brand-navy-dark">{tr(t.closedTitle, language)}</h1>
            <p className="mt-2 max-w-sm text-sm text-gray-600">{tr(t.closedBody, language)}</p>
            <Link
              to={ROUTES.HOME}
              className="mt-6 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-dark"
            >
              {tr(t.backHome, language)}
            </Link>
          </div>
        )}

        {status === 'submitted' && (
          <div className="flex flex-col items-center rounded-2xl border border-brand-divider bg-white px-6 py-14 text-center shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
            <span className="contact-success-pop flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={36} aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-2xl font-bold text-brand-navy-dark">{tr(t.thanksTitle, language)}</h1>
            <p className="mt-2 max-w-sm text-sm text-gray-600">{tr(t.thanksBody, language)}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={ROUTES.HOME}
                className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-dark"
              >
                {tr(t.backHome, language)}
              </Link>
              <button
                type="button"
                onClick={startAgain}
                className="rounded-lg border border-brand-divider px-5 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-page"
              >
                {tr(t.submitAnother, language)}
              </button>
            </div>
          </div>
        )}

        {status === 'ready' && form && (
          <>
            <header className="overflow-hidden rounded-2xl border border-brand-divider bg-white shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
              <div className="h-2 bg-gradient-to-r from-brand-navy via-brand-primary to-brand-gold" />
              <div className="px-6 py-6 md:px-8">
                <h1 className="text-2xl leading-tight font-extrabold text-brand-navy-dark md:text-3xl">{title}</h1>
                {localText(form.description, language) && (
                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-600 md:text-base">
                    {localText(form.description, language)}
                  </p>
                )}
                {form.questions?.some((question) => question.required) && (
                  <p className="mt-4 text-xs font-semibold text-red-600">{tr(t.requiredNote, language)}</p>
                )}
              </div>
            </header>

            <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-5">
              <FormRenderer
                form={form}
                language={language}
                values={values}
                errors={errors}
                onChange={handleChange}
              />

              {/* Honeypot — hidden from people and assistive tech, bots fill it. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {submitError && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={17} aria-hidden="true" />
                )}
                {isSubmitting ? tr(t.submitting, language) : tr(t.submit, language)}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}
