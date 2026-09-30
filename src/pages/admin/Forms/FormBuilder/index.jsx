import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  X,
  Eye,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Star,
} from 'lucide-react'
import { createForm, getAdminForm, updateForm } from '../../../../api/formsApi'
import { ROUTES } from '../../../../constants/routes'
import Button from '../../../../components/Button'
import ToggleSwitch from '../../../../components/ToggleSwitch'
import FormRenderer from '../../../../components/FormRenderer'
import { useExitTransition } from '../../../../lib/useExitTransition'
import {
  INPUT_TYPES,
  QUESTION_TYPES,
  emptyValueFor,
  isChoiceType,
  localText,
  makeId,
  newQuestion,
  slugify,
  typeLabel,
  validateFormDefinition,
} from '../../../../lib/forms'

const inputClass =
  'w-full rounded-lg border border-brand-divider bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15'

const TYPE_ICONS = {
  text: Type,
  textarea: AlignLeft,
  radio: CircleDot,
  checkbox: CheckSquare,
  select: ChevronDown,
  rating: Star,
}

const bilingual = (value) => ({ en: value?.en || '', kn: value?.kn || '' })

// Normalise whatever the API returns into the builder's editable shape.
function toEditableQuestion(question) {
  return {
    id: question.id || makeId('q'),
    type: question.type || 'text',
    inputType: question.inputType || 'text',
    label: bilingual(question.label),
    helpText: bilingual(question.helpText),
    required: Boolean(question.required),
    options: (question.options || []).map((option) => ({ label: bilingual(option.label) })),
  }
}

// What we send to the API (options only for choice questions).
function toPayloadQuestion(question) {
  return {
    id: question.id,
    type: question.type,
    ...(question.type === 'text' ? { inputType: question.inputType } : {}),
    label: { en: question.label.en.trim(), kn: question.label.kn.trim() },
    helpText: { en: question.helpText.en.trim(), kn: question.helpText.kn.trim() },
    required: question.required,
    ...(isChoiceType(question.type)
      ? { options: question.options.map((option) => ({ label: { en: option.label.en.trim(), kn: option.label.kn.trim() } })) }
      : {}),
  }
}

export default function FormBuilder() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [title, setTitle] = useState({ en: '', kn: '' })
  const [description, setDescription] = useState({ en: '', kn: '' })
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [questions, setQuestions] = useState([])

  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSaving, setIsSaving] = useState(false)
  // Shown after the first failed save, then kept in step with the edits.
  const [hasTriedSave, setHasTriedSave] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [scrollToId, setScrollToId] = useState(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!isEditMode) return
    let isMounted = true
    getAdminForm(id)
      .then((form) => {
        if (!isMounted) return
        setTitle(bilingual(form.title))
        setDescription(bilingual(form.description))
        setSlug(form.slug || '')
        setIsActive(Boolean(form.isActive))
        setQuestions((form.questions || []).map(toEditableQuestion))
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load the form.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [id, isEditMode])

  // Bring a freshly added / duplicated question into view.
  useEffect(() => {
    if (!scrollToId) return
    const node = listRef.current?.querySelector(`[data-question-id="${scrollToId}"]`)
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [scrollToId, questions.length])

  function handleTitleChange(value) {
    setTitle((prev) => ({ ...prev, en: value }))
    if (!isEditMode && !slugTouched) setSlug(slugify(value))
  }

  function updateQuestion(questionId, patch) {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, ...patch } : q)))
  }

  function changeType(question, type) {
    const patch = { type }
    if (isChoiceType(type) && question.options.length < 2) {
      patch.options = [...question.options, ...Array.from({ length: 2 - question.options.length }, () => ({ label: { en: '', kn: '' } }))]
    }
    updateQuestion(question.id, patch)
  }

  function addQuestion(type) {
    const question = newQuestion(type)
    setQuestions((prev) => [...prev, question])
    setScrollToId(question.id)
  }

  function duplicateQuestion(question) {
    const copy = {
      ...question,
      id: makeId('q'),
      label: { ...question.label },
      helpText: { ...question.helpText },
      options: question.options.map((option) => ({ label: { ...option.label } })),
    }
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === question.id)
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]
    })
    setScrollToId(copy.id)
  }

  function moveQuestion(questionId, direction) {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === questionId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setScrollToId(questionId)
  }

  function removeQuestion(questionId) {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setHasTriedSave(true)
    const found = validateFormDefinition({ title, slug, questions })
    if (found.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSaving(true)
    const payload = {
      title: { en: title.en.trim(), kn: title.kn.trim() },
      description: { en: description.en.trim(), kn: description.kn.trim() },
      slug: slug.trim(),
      isActive,
      questions: questions.map(toPayloadQuestion),
    }
    try {
      if (isEditMode) await updateForm(id, payload)
      else await createForm(payload)
      navigate(ROUTES.ADMIN_FORMS)
    } catch (err) {
      setError(err.message || 'Failed to save the form.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSaving(false)
    }
  }

  const problems = hasTriedSave ? validateFormDefinition({ title, slug, questions }) : []

  if (isLoading) return <p className="text-center text-gray-600">Loading…</p>

  return (
    <div>
      <Link
        to={ROUTES.ADMIN_FORMS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Back to Forms
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark">{isEditMode ? 'Edit Form' : 'Create Form'}</h1>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-divider px-4 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-page"
        >
          <Eye size={16} aria-hidden="true" />
          Preview
        </button>
      </div>

      {(error || problems.length > 0) && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error && <p>{error}</p>}
          {problems.length > 0 && (
            <>
              <p className="font-semibold">Please fix the following before saving:</p>
              <ul className="mt-1 list-disc pl-5">
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-3xl flex-col gap-6">
        {/* ---- Form details ---- */}
        <section className="flex flex-col gap-4 rounded-2xl border border-brand-divider bg-white p-5">
          <h2 className="text-sm font-bold text-brand-dark">Form details</h2>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Heading (English)
            <input
              type="text"
              value={title.en}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Export Management Training Programme — Mangaluru"
              className={inputClass}
            />
            <span className="text-xs font-normal text-gray-500">
              Shown in the scrolling bar on the home page and as the form&apos;s title.
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Heading (Kannada) <span className="text-xs font-normal text-gray-400">optional</span>
            <input
              type="text"
              value={title.kn}
              onChange={(e) => setTitle((prev) => ({ ...prev, kn: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Description (English) <span className="text-xs font-normal text-gray-400">optional</span>
            <textarea
              rows={3}
              value={description.en}
              onChange={(e) => setDescription((prev) => ({ ...prev, en: e.target.value }))}
              placeholder="A short introduction shown above the questions."
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Description (Kannada) <span className="text-xs font-normal text-gray-400">optional</span>
            <textarea
              rows={3}
              value={description.kn}
              onChange={(e) => setDescription((prev) => ({ ...prev, kn: e.target.value }))}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Link name (slug)
            <div className="flex items-center overflow-hidden rounded-lg border border-brand-divider bg-white focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/15">
              <span className="border-r border-brand-divider bg-brand-page px-3 py-2.5 text-sm text-gray-500">/forms/</span>
              <input
                type="text"
                value={slug}
                readOnly={isEditMode}
                onChange={(e) => {
                  setSlug(slugify(e.target.value))
                  setSlugTouched(true)
                }}
                className="w-full bg-transparent px-3 py-2.5 font-mono text-sm outline-none read-only:text-gray-500"
              />
            </div>
            <span className="text-xs font-normal text-gray-500">
              {isEditMode
                ? 'The link cannot be changed after creation, so links you have already shared keep working.'
                : 'Created from the heading — lowercase letters, numbers and dashes only.'}
            </span>
          </label>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-divider px-3.5 py-3">
            <span className="flex flex-col">
              <span className="text-sm font-medium text-brand-dark">{isActive ? 'Active' : 'Inactive'}</span>
              <span className="text-xs text-gray-500">
                Only active forms appear in the home-page bar and accept responses.
              </span>
            </span>
            <ToggleSwitch checked={isActive} label="Form is active" onChange={() => setIsActive((prev) => !prev)} />
          </div>
        </section>

        {/* ---- Questions ---- */}
        <section className="flex flex-col gap-4" ref={listRef}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-brand-dark">Questions</h2>
              <p className="text-xs text-gray-500">
                {questions.length} question{questions.length === 1 ? '' : 's'} · answers are collected from visitors
                without them needing to log in.
              </p>
            </div>
          </div>

          {questions.length === 0 && (
            <p className="rounded-xl border border-dashed border-brand-divider p-8 text-center text-sm text-gray-600">
              No questions yet. Choose a question type below to add the first one.
            </p>
          )}

          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              total={questions.length}
              onChange={(patch) => updateQuestion(question.id, patch)}
              onChangeType={(type) => changeType(question, type)}
              onMove={(direction) => moveQuestion(question.id, direction)}
              onDuplicate={() => duplicateQuestion(question)}
              onDelete={() => removeQuestion(question.id)}
            />
          ))}

          <div className="rounded-2xl border border-dashed border-brand-divider bg-white p-4">
            <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">Add a question</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {QUESTION_TYPES.map((type) => {
                const Icon = TYPE_ICONS[type.key]
                return (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => addQuestion(type.key)}
                    className="flex items-start gap-2.5 rounded-lg border border-brand-divider p-3 text-left transition-all hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-surface/40"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-surface text-brand-primary">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-brand-dark">{type.label}</span>
                      <span className="block text-[11px] leading-snug text-gray-500">{type.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Form'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_FORMS)}>
            Cancel
          </Button>
        </div>
      </form>

      <PreviewDrawer
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        form={{ title, description, questions: questions.map(toPayloadQuestionForPreview) }}
      />
    </div>
  )
}

// The preview shows questions as visitors will see them, even while unfinished.
function toPayloadQuestionForPreview(question) {
  return {
    ...question,
    options: isChoiceType(question.type)
      ? question.options.filter((option) => option.label.en.trim()).map((option) => ({ label: option.label }))
      : [],
  }
}

function QuestionCard({ question, index, total, onChange, onChangeType, onMove, onDuplicate, onDelete }) {
  const Icon = TYPE_ICONS[question.type] || Type

  function updateOption(optionIndex, lang, value) {
    onChange({
      options: question.options.map((option, i) =>
        i === optionIndex ? { label: { ...option.label, [lang]: value } } : option,
      ),
    })
  }

  return (
    <div
      data-question-id={question.id}
      className="rounded-2xl border border-brand-divider bg-white p-5 shadow-[0_2px_10px_rgba(15,40,80,0.04)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-surface text-sm font-bold text-brand-primary">
            {index + 1}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <Icon size={14} aria-hidden="true" />
            {typeLabel(question.type)}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Move question ${index + 1} up`}
            className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy disabled:opacity-30"
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Move question ${index + 1} down`}
            className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy disabled:opacity-30"
          >
            <ArrowDown size={16} />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            aria-label={`Duplicate question ${index + 1}`}
            className="rounded-md p-2 text-gray-500 hover:bg-brand-page hover:text-brand-navy"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete question ${index + 1}`}
            className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark sm:col-span-2">
          Question (English)
          <input
            type="text"
            value={question.label.en}
            onChange={(e) => onChange({ label: { ...question.label, en: e.target.value } })}
            placeholder="e.g. How would you rate the session?"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark sm:col-span-2">
          Question (Kannada) <span className="text-xs font-normal text-gray-400">optional</span>
          <input
            type="text"
            value={question.label.kn}
            onChange={(e) => onChange({ label: { ...question.label, kn: e.target.value } })}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Answer type
          <select value={question.type} onChange={(e) => onChangeType(e.target.value)} className={inputClass}>
            {QUESTION_TYPES.map((type) => (
              <option key={type.key} value={type.key}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        {question.type === 'text' && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
            Expected input
            <select
              value={question.inputType}
              onChange={(e) => onChange({ inputType: e.target.value })}
              className={inputClass}
            >
              {INPUT_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Help text (English) <span className="text-xs font-normal text-gray-400">optional, shown under the question</span>
          <input
            type="text"
            value={question.helpText.en}
            onChange={(e) => onChange({ helpText: { ...question.helpText, en: e.target.value } })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-dark">
          Help text (Kannada) <span className="text-xs font-normal text-gray-400">optional</span>
          <input
            type="text"
            value={question.helpText.kn}
            onChange={(e) => onChange({ helpText: { ...question.helpText, kn: e.target.value } })}
            className={inputClass}
          />
        </label>
      </div>

      {isChoiceType(question.type) && (
        <fieldset className="mt-4 rounded-xl border border-brand-divider p-4">
          <legend className="px-1 text-sm font-semibold text-brand-dark">
            Options{' '}
            <span className="text-xs font-normal text-gray-500">
              {question.type === 'checkbox' ? '(visitors can pick several)' : '(visitors pick one)'}
            </span>
          </legend>
          <div className="mt-1 flex flex-col gap-2">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-center text-xs font-semibold text-gray-400">{optionIndex + 1}</span>
                <input
                  type="text"
                  aria-label={`Option ${optionIndex + 1} (English)`}
                  value={option.label.en}
                  onChange={(e) => updateOption(optionIndex, 'en', e.target.value)}
                  placeholder="Option (English)"
                  className={inputClass}
                />
                <input
                  type="text"
                  aria-label={`Option ${optionIndex + 1} (Kannada)`}
                  value={option.label.kn}
                  onChange={(e) => updateOption(optionIndex, 'kn', e.target.value)}
                  placeholder="Kannada (optional)"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => onChange({ options: question.options.filter((_, i) => i !== optionIndex) })}
                  disabled={question.options.length <= 2}
                  aria-label={`Remove option ${optionIndex + 1}`}
                  className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange({ options: [...question.options, { label: { en: '', kn: '' } }] })}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-divider px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-page"
          >
            <Plus size={15} aria-hidden="true" />
            Add option
          </button>
        </fieldset>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-brand-page/60 px-3.5 py-2.5">
        <span className="text-sm font-medium text-brand-dark">Required</span>
        <ToggleSwitch
          checked={question.required}
          label={`Question ${index + 1} is required`}
          onChange={() => onChange({ required: !question.required })}
        />
      </div>
    </div>
  )
}

function PreviewDrawer({ isOpen, onClose, form }) {
  const { mounted, visible } = useExitTransition(isOpen, 300)
  const [language, setLanguage] = useState('en')
  const [values, setValues] = useState({})

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Form preview"
        className={`absolute inset-y-0 right-0 flex h-dvh w-full max-w-xl flex-col bg-brand-page shadow-[-12px_0_40px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-brand-divider bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase">Preview</p>
            <p className="text-sm text-gray-600">How visitors will see this form</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-brand-page p-0.5 text-xs font-semibold">
              {['en', 'kn'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  aria-pressed={language === lang}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    language === lang ? 'bg-white text-brand-navy-dark shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {lang === 'en' ? 'English' : 'ಕನ್ನಡ'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-full p-2 text-gray-600 hover:bg-brand-page"
            >
              <X size={22} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="overflow-hidden rounded-2xl border border-brand-divider bg-white">
            <div className="h-2 bg-gradient-to-r from-brand-navy via-brand-primary to-brand-gold" />
            <div className="px-5 py-5">
              <h2 className="text-xl font-extrabold text-brand-navy-dark">
                {localText(form.title, language) || 'Untitled form'}
              </h2>
              {localText(form.description, language) && (
                <p className="mt-2 text-sm whitespace-pre-wrap text-gray-600">{localText(form.description, language)}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            {form.questions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-brand-divider p-6 text-center text-sm text-gray-500">
                Add a question to see it here.
              </p>
            ) : (
              <FormRenderer
                form={form}
                language={language}
                values={Object.fromEntries(form.questions.map((q) => [q.id, values[q.id] ?? emptyValueFor(q)]))}
                onChange={(questionId, value) => setValues((prev) => ({ ...prev, [questionId]: value }))}
              />
            )}
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">Preview only — nothing you enter here is saved.</p>
        </div>
      </aside>
    </div>
  )
}
