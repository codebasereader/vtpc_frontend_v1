import { getBilingualText } from './bilingual'

// Question types an admin can add to a form.
export const QUESTION_TYPES = [
  { key: 'text', label: 'Short answer', hint: 'One line — name, email, phone, number…' },
  { key: 'textarea', label: 'Long answer', hint: 'Descriptive answer in a larger box' },
  { key: 'radio', label: 'Single choice', hint: 'Pick exactly one option (MCQ)' },
  { key: 'checkbox', label: 'Multiple choice', hint: 'Pick one or more options' },
  { key: 'select', label: 'Dropdown', hint: 'Pick one option from a list' },
  { key: 'rating', label: 'Rating (1–5)', hint: 'Star rating, handy for feedback' },
]

// What a "Short answer" is expected to contain (validated on the public form).
export const INPUT_TYPES = [
  { key: 'text', label: 'Any text' },
  { key: 'email', label: 'Email address' },
  { key: 'tel', label: 'Phone number' },
  { key: 'number', label: 'Number' },
]

export const RATING_MAX = 5
export const MAX_TEXT = 300
export const MAX_TEXTAREA = 2000

export const isChoiceType = (type) => type === 'radio' || type === 'checkbox' || type === 'select'

export function typeLabel(type) {
  return QUESTION_TYPES.find((t) => t.key === type)?.label || type
}

export function makeId(prefix = 'q') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`
}

export function newQuestion(type = 'text') {
  return {
    id: makeId('q'),
    type,
    inputType: 'text',
    label: { en: '', kn: '' },
    helpText: { en: '', kn: '' },
    required: false,
    options: isChoiceType(type) ? [{ label: { en: '', kn: '' } }, { label: { en: '', kn: '' } }] : [],
  }
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Localised text with an English fallback (Kannada is optional in the admin).
export const localText = (value, language) => getBilingualText(value, language) || getBilingualText(value, 'en')

// Answers are stored/exported by the option's English label, so it is the value we submit.
export const optionValue = (option) => getBilingualText(option?.label, 'en')

export function emptyValueFor(question) {
  return question.type === 'checkbox' ? [] : ''
}

export function formatAnswer(value) {
  if (value == null || value === '') return ''
  if (Array.isArray(value)) return value.join('; ')
  return String(value)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/

export const isBlankAnswer = (value) =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0)

/**
 * Validates a visitor's answers against the form definition.
 * Returns { [questionId]: message } — empty when everything is valid.
 */
export function validateAnswers(form, values, messages) {
  const errors = {}
  for (const question of form.questions || []) {
    const value = values[question.id]
    if (isBlankAnswer(value)) {
      if (question.required) errors[question.id] = messages.required
      continue
    }
    if (question.type === 'text') {
      const text = String(value).trim()
      if (question.inputType === 'email' && !EMAIL_RE.test(text)) errors[question.id] = messages.invalidEmail
      else if (question.inputType === 'tel' && !PHONE_RE.test(text)) errors[question.id] = messages.invalidPhone
      else if (question.inputType === 'number' && Number.isNaN(Number(text))) errors[question.id] = messages.invalidNumber
    }
  }
  return errors
}

// Payload sent to the backend: only questions that were actually answered.
export function buildAnswers(form, values) {
  return (form.questions || [])
    .map((question) => {
      const raw = values[question.id]
      if (isBlankAnswer(raw)) return null
      const value = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.trim() : raw
      return isBlankAnswer(value) ? null : { questionId: question.id, value }
    })
    .filter(Boolean)
}

/** Validates the admin's form definition before saving. Returns a list of messages. */
export function validateFormDefinition({ title, slug, questions }) {
  const problems = []
  if (!title.en.trim()) problems.push('Enter a heading (English) for the form.')
  if (!slug.trim()) problems.push('Enter a link name (slug) for the form.')
  if (questions.length === 0) problems.push('Add at least one question.')
  questions.forEach((question, index) => {
    const n = index + 1
    if (!question.label.en.trim()) problems.push(`Question ${n}: enter the question text (English).`)
    if (isChoiceType(question.type)) {
      const labels = question.options.map((option) => option.label.en.trim())
      const filled = labels.filter(Boolean)
      if (filled.length < 2) problems.push(`Question ${n}: add at least two options.`)
      else if (filled.length !== labels.length) problems.push(`Question ${n}: fill in or remove the empty options.`)
      else if (new Set(filled.map((label) => label.toLowerCase())).size !== filled.length)
        problems.push(`Question ${n}: options must be different from each other.`)
    }
  })
  return problems
}
