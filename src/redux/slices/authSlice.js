import { createSlice } from '@reduxjs/toolkit'

const initialState = { user: null, isAuthenticated: false }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setUser, clearUser } = authSlice.actions
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectCurrentUser = (state) => state.auth.user
export default authSlice.reducer
