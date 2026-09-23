import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider, useDispatch } from 'react-redux'
import { store } from './redux/store'
import AppRoutes from './routes/AppRoutes'
import { getMe } from './api/authApi'
import { setCheckingSession, setUser, clearUser } from './redux/slices/authSlice'

function SessionBootstrap() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCheckingSession())
    getMe()
      .then((user) => dispatch(setUser(user)))
      .catch(() => dispatch(clearUser()))
  }, [dispatch])

  return null
}

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <SessionBootstrap />
          <AppRoutes />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  )
}

export default App
