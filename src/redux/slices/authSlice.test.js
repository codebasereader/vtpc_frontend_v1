import authReducer, { setUser, clearUser, selectIsAuthenticated, selectCurrentUser } from './authSlice'

describe('authSlice', () => {
  const initialState = { user: null, isAuthenticated: false, status: 'idle' }

  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('setUser stores the user and flips isAuthenticated to true', () => {
    const user = { id: '1', name: 'Editor', role: 'editor' }
    const state = authReducer(initialState, setUser(user))
    expect(state).toEqual({ user, isAuthenticated: true, status: 'authenticated' })
  })

  it('clearUser resets to the initial state', () => {
    const loggedIn = { user: { id: '1', name: 'Editor', role: 'editor' }, isAuthenticated: true, status: 'authenticated' }
    expect(authReducer(loggedIn, clearUser())).toEqual({ user: null, isAuthenticated: false, status: 'unauthenticated' })
  })

  it('selectIsAuthenticated reads from state.auth', () => {
    const state = { auth: { user: null, isAuthenticated: true } }
    expect(selectIsAuthenticated(state)).toBe(true)
  })

  it('selectCurrentUser reads from state.auth', () => {
    const user = { id: '1', name: 'Editor', role: 'editor' }
    const state = { auth: { user, isAuthenticated: true } }
    expect(selectCurrentUser(state)).toEqual(user)
  })
})
