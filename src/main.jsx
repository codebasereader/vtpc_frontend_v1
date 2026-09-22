import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { SENTRY_DSN } from './config/config'
import App from './App.jsx'
import './index.css'

if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
