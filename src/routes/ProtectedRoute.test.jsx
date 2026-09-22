import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import authReducer from '../redux/slices/authSlice'
import ProtectedRoute from './ProtectedRoute'

function renderWithAuth(isAuthenticated) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: isAuthenticated ? { id: '1', name: 'Editor', role: 'editor' } : null, isAuthenticated },
    },
  })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/admin/login" element={<div>Login Page</div>} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('ProtectedRoute', () => {
  it('renders the protected content when authenticated', () => {
    renderWithAuth(true)
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
  })

  it('redirects to the login route when not authenticated', () => {
    renderWithAuth(false)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument()
  })
})
