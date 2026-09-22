import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { LocaleProvider } from '../context/LocaleContext'
import authReducer from '../redux/slices/authSlice'
import * as homepageApi from '../api/homepageApi'
import AppRoutes from './AppRoutes'

vi.mock('../api/homepageApi')

function renderAt(path, isAuthenticated = false) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: null, isAuthenticated } },
  })
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <LocaleProvider>
          <MemoryRouter initialEntries={[path]}>
            <AppRoutes />
          </MemoryRouter>
        </LocaleProvider>
      </I18nextProvider>
    </Provider>
  )
}

describe('AppRoutes', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    homepageApi.getHomepageContent.mockResolvedValue({
      hero: { title: 'Gateway to Global Markets', subtitle: 'Sub' },
      highlights: [],
    })
  })

  it('renders Home at /', async () => {
    renderAt('/')
    await waitFor(() => expect(screen.getByText('Gateway to Global Markets')).toBeInTheDocument())
  })

  it('renders NotFound for an unknown public path', async () => {
    renderAt('/nope')
    await waitFor(() => expect(screen.getByText('Page not found')).toBeInTheDocument())
  })

  it('redirects /admin/dashboard to /admin/login when unauthenticated', async () => {
    renderAt('/admin/dashboard', false)
    await waitFor(() => expect(screen.getByText('Admin Login')).toBeInTheDocument())
  })

  it('renders the admin dashboard when authenticated', async () => {
    renderAt('/admin/dashboard', true)
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
  })
})
