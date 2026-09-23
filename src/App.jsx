import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider, useDispatch } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { store } from './redux/store'
import i18n from './i18n'
import { LocaleProvider } from './context/LocaleContext'
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
      <I18nextProvider i18n={i18n}>
        <LocaleProvider>
          <HelmetProvider>
            <BrowserRouter>
              <SessionBootstrap />
              <AppRoutes />
            </BrowserRouter>
          </HelmetProvider>
        </LocaleProvider>
      </I18nextProvider>
    </Provider>
  )
}

export default App
