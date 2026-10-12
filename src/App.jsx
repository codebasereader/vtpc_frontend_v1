import { useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { store } from './redux/store'
import ScrollToTop from './components/ScrollToTop'
import AppRoutes from './routes/AppRoutes'
import { getMe } from './api/authApi'
import { setCheckingSession, setUser, clearUser, selectAuthStatus, selectIsAuthenticated } from './redux/slices/authSlice'
import { hasSessionHint, setSessionHint } from './lib/sessionHint'

// Only the admin area has a login, so only there do we ask the server who is logged in.
// Doing it on every public page just produced a 401 on each visit.
function SessionBootstrap() {
  const dispatch = useDispatch()
  const status = useSelector(selectAuthStatus)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { pathname } = useLocation()
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/')

  useEffect(() => {
    if (!isAdminArea || status !== 'idle') return
    // No marker = this browser never logged in, so there is nothing to restore: skip the request.
    if (!hasSessionHint()) {
      dispatch(clearUser())
      return
    }
    dispatch(setCheckingSession())
    getMe()
      .then((user) => dispatch(setUser(user)))
      .catch(() => dispatch(clearUser()))
  }, [dispatch, isAdminArea, status])

  // Keep the marker in step with whether someone is logged in.
  useEffect(() => {
    if (isAuthenticated) setSessionHint(true)
    else if (status === 'unauthenticated') setSessionHint(false)
  }, [isAuthenticated, status])

  return null
}

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <SessionBootstrap />
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  )
}

export default App
