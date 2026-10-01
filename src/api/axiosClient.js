import axios from 'axios'
import { API_BASE_URL } from '../config/config'
import { store } from '../redux/store'
import { clearUser, setUser } from '../redux/slices/authSlice'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Calls where a 401 just means "wrong credentials / not logged in yet".
const AUTH_PROBES = ['/auth/login', '/auth/me']

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const code = error.response?.data?.code
    const url = error.config?.url || ''
    const message =
      error.response?.data?.message || 'Something went wrong. Please try again.'

    // Session ended (expired, logged out elsewhere, or the account was deactivated).
    if (status === 401 && !AUTH_PROBES.some((probe) => url.startsWith(probe))) {
      store.dispatch(clearUser())
    }
    // The server is asking this user to set a new password before doing anything else.
    if (status === 403 && code === 'PASSWORD_CHANGE_REQUIRED') {
      const user = store.getState().auth.user
      if (user && !user.mustChangePassword) store.dispatch(setUser({ ...user, mustChangePassword: true }))
    }

    return Promise.reject({ message, status, code })
  }
)

export default axiosClient
