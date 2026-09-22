import { createContext, useContext, useState, useCallback } from 'react'
import i18n from '../i18n'

const STORAGE_KEY = 'vtpc_locale'
const LocaleContext = createContext(null)

function readPersistedLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'kn' ? 'kn' : 'en'
  } catch {
    return 'en'
  }
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readPersistedLocale)

  const setLocale = useCallback((nextLocale) => {
    setLocaleState(nextLocale)
    i18n.changeLanguage(nextLocale)
    try {
      localStorage.setItem(STORAGE_KEY, nextLocale)
    } catch {
      // localStorage unavailable (private browsing, etc.) — locale still
      // works for this session via React state.
    }
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook co-located by convention
export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
