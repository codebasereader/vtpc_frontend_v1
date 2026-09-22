import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import i18n from '../../i18n'
import { LocaleProvider } from '../../context/LocaleContext'
import Header from './index'

describe('Header', () => {
  it('renders the primary nav links', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LocaleProvider>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </LocaleProvider>
      </I18nextProvider>
    )
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Exporter Corner' })).toBeInTheDocument()
  })
})
