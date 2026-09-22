import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import { LocaleProvider } from '../../context/LocaleContext'
import LanguageToggle from './index'

function renderToggle() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LocaleProvider>
        <LanguageToggle />
      </LocaleProvider>
    </I18nextProvider>
  )
}

describe('LanguageToggle', () => {
  it('shows both language options', () => {
    renderToggle()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ಕನ್ನಡ' })).toBeInTheDocument()
  })

  it('switches the active language on click', () => {
    renderToggle()
    fireEvent.click(screen.getByRole('button', { name: 'ಕನ್ನಡ' }))
    expect(screen.getByRole('button', { name: 'ಕನ್ನಡ' })).toHaveAttribute('aria-pressed', 'true')
  })
})
