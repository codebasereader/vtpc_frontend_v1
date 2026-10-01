import { createSlice } from '@reduxjs/toolkit'

const initialState = { user: null, isAuthenticated: false, status: 'idle' }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCheckingSession: (state) => {
      state.status = 'checking'
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.status = 'authenticated'
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.status = 'unauthenticated'
    },
  },
})

export const { setCheckingSession, setUser, clearUser } = authSlice.actions
export const selectIsSuperAdmin = (state) => Boolean(state.auth.user?.isSuperAdmin)
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectCurrentUser = (state) => state.auth.user
export const selectAuthStatus = (state) => state.auth.status
export default authSlice.reducer
