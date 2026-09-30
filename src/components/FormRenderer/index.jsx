import { Star } from 'lucide-react'
import { forms } from '../../language/forms'
import { RATING_MAX, MAX_TEXT, MAX_TEXTAREA, localText, optionValue } from '../../lib/forms'

const inputBase =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-brand-dark outline-none transition-colors placeholder:text-gray-400 focus:ring-2'

const fieldClass = (hasError) =>
  `${inputBase} ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
      : 'border-brand-divider focus:border-brand-primary focus:ring-brand-primary/15'
  }`

const INPUT_MODE = { email: 'email', tel: 'tel', number: 'decimal', text: undefined }

/**
 * Renders a form's questions. Used for the public form page and for the
 * admin's live preview. `values` maps questionId → answer
 * (string | string[] | number); `errors` maps questionId → message.
 */
export default function FormRenderer({ form, language, values, errors = {}, onChange, disabled = false }) {
  return (
    <div className="flex flex-col gap-5">
      {(form.questions || []).map((question) => (
        <Question
          key={question.id}
          question={question}
          language={language}
          value={values[question.id]}
          error={errors[question.id]}
          disabled={disabled}
          onChange={(value) => onChange(question.id, value)}
        />
      ))}
    </div>
  )
}

function Question({ question, language, value, error, disabled, onChange }) {
  const label = localText(question.label, language)
  const help = localText(question.helpText, language)
  const id = `q-${question.id}`
  const describedBy = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
  const options = question.options || []

  let control = null

  if (question.type === 'text') {
    control = (
      <input
        id={id}
        type={question.inputType === 'number' ? 'text' : question.inputType || 'text'}
        inputMode={INPUT_MODE[question.inputType]}
        value={value ?? ''}
        maxLength={MAX_TEXT}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass(error)}
      />
    )
  } else if (question.type === 'textarea') {
    control = (
      <textarea
        id={id}
        rows={4}
        value={value ?? ''}
        maxLength={MAX_TEXTAREA}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClass(error)} resize-y`}
      />
    )
  } else if (question.type === 'select') {
    control = (
      <select
        id={id}
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass(error)}
      >
        <option value="">{forms.page.selectPlaceholder[language] || forms.page.selectPlaceholder.en}</option>
        {options.map((option) => (
          <option key={optionValue(option)} value={optionValue(option)}>
            {localText(option.label, language)}
          </option>
        ))}
      </select>
    )
  } else if (question.type === 'radio' || question.type === 'checkbox') {
    const isMulti = question.type === 'checkbox'
    const selected = isMulti ? value || [] : value
    control = (
      <div
        role={isMulti ? 'group' : 'radiogroup'}
        aria-labelledby={`${id}-label`}
        aria-describedby={describedBy}
        className="flex flex-col gap-2"
      >
        {options.map((option) => {
          const optValue = optionValue(option)
          const checked = isMulti ? selected.includes(optValue) : selected === optValue
          return (
            <label
              key={optValue}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                checked
                  ? 'border-brand-primary bg-brand-surface/60 text-brand-dark'
                  : 'border-brand-divider bg-white text-gray-700 hover:bg-brand-page'
              } ${disabled ? 'cursor-default opacity-80' : ''}`}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={id}
                checked={checked}
                disabled={disabled}
                onChange={() => {
                  if (isMulti) {
                    onChange(checked ? selected.filter((item) => item !== optValue) : [...selected, optValue])
                  } else {
                    onChange(optValue)
                  }
                }}
                className="h-4 w-4 shrink-0 accent-[var(--color-brand-primary)]"
              />
              <span>{localText(option.label, language)}</span>
            </label>
          )
        })}
      </div>
    )
  } else if (question.type === 'rating') {
    const current = Number(value) || 0
    control = (
      <div className="flex items-center gap-1" role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={describedBy}>
        {Array.from({ length: RATING_MAX }, (_, index) => index + 1).map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={current === star}
            aria-label={`${star} / ${RATING_MAX}`}
            disabled={disabled}
            onClick={() => onChange(current === star ? '' : star)}
            className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-brand-primary disabled:hover:scale-100"
          >
            <Star
              size={30}
              aria-hidden="true"
              className={`transition-colors ${
                star <= current ? 'fill-brand-gold text-brand-gold' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {current > 0 && (
          <span className="ml-2 text-sm font-semibold text-gray-600">
            {current} {forms.page.rateOutOf[language] || forms.page.rateOutOf.en}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-[0_2px_10px_rgba(15,40,80,0.04)] transition-colors ${
        error ? 'border-red-300' : 'border-brand-divider'
      }`}
    >
      <label
        id={`${id}-label`}
        htmlFor={question.type === 'text' || question.type === 'textarea' || question.type === 'select' ? id : undefined}
        className="block text-[0.95rem] font-semibold text-brand-navy-dark"
      >
        {label}
        {question.required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {help && (
        <p id={`${id}-help`} className="mt-1 text-xs text-gray-500">
          {help}
        </p>
      )}
      <div className="mt-3">{control}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
