import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'vtpc_locale'

function readPersistedLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'kn' ? 'kn' : 'en'
  } catch {
    return 'en'
  }
}

const localeSlice = createSlice({
  name: 'locale',
  initialState: {
    language: readPersistedLanguage(),
  },
  reducers: {
    setLanguage(state, action) {
      state.language = action.payload
      try {
        localStorage.setItem(STORAGE_KEY, action.payload)
      } catch {
        // localStorage unavailable (private browsing, etc.) — language
        // still works for this session via Redux state.
      }
    },
  },
})

export const { setLanguage } = localeSlice.actions
export const selectLanguage = (state) => state.locale.language
export default localeSlice.reducer
