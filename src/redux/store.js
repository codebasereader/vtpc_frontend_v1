import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import localeReducer from './slices/localeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    locale: localeReducer,
  },
})
