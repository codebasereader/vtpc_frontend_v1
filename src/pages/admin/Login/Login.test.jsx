import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import authReducer from '../../../redux/slices/authSlice'
import * as authApi from '../../../api/authApi'
import Login from './index'

vi.mock('../../../api/authApi')

function renderLogin() {
  const store = configureStore({ reducer: { auth: authReducer } })
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/login']}>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
  return store
}

describe('Login', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('logs in and navigates to the dashboard on success', async () => {
    authApi.login.mockResolvedValue({ id: '1', name: 'Editor', role: 'editor' })
    const store = renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'editor@vtpc.gov.in' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument())
    expect(store.getState().auth.isAuthenticated).toBe(true)
  })

  it('shows an error message on failed login', async () => {
    authApi.login.mockRejectedValue({ message: 'Invalid credentials', status: 401 })
    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'editor@vtpc.gov.in' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
  })
})
