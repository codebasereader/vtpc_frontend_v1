import { render, screen, fireEvent } from '@testing-library/react'
import { LocaleProvider, useLocale } from './LocaleContext'

function LocaleProbe() {
  const { locale, setLocale } = useLocale()
  return (
    <div>
      <span>{locale}</span>
      <button onClick={() => setLocale('kn')}>switch</button>
    </div>
  )
}

describe('LocaleContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to English', () => {
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    )
    expect(screen.getByText('en')).toBeInTheDocument()
  })

  it('switches locale and persists it to localStorage', () => {
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    )
    fireEvent.click(screen.getByText('switch'))
    expect(screen.getByText('kn')).toBeInTheDocument()
    expect(localStorage.getItem('vtpc_locale')).toBe('kn')
  })

  it('reads a persisted locale on mount', () => {
    localStorage.setItem('vtpc_locale', 'kn')
    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>
    )
    expect(screen.getByText('kn')).toBeInTheDocument()
  })
})
