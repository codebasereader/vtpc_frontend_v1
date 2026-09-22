import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { store } from './redux/store'
import i18n from './i18n'
import { LocaleProvider } from './context/LocaleContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <LocaleProvider>
          <HelmetProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </HelmetProvider>
        </LocaleProvider>
      </I18nextProvider>
    </Provider>
  )
}

export default App
