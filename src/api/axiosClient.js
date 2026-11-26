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

const BLOCKED_MESSAGE =
  'The request was blocked before it reached the server, so nothing was saved. This is usually the website firewall — please contact the website security team.'

axiosClient.interceptors.response.use(
  (response) => {
    // The API only ever answers with JSON (or an empty body). A web page here means something in
    // between, such as a firewall's "Unauthorized Request Blocked" page sent with status 200,
    // answered instead — treat it as a failure, not as a successful save.
    if (String(response.headers['content-type'] || '').includes('text/html')) {
      return Promise.reject({ message: BLOCKED_MESSAGE, status: response.status, code: 'REQUEST_BLOCKED' })
    }
    return response
  },
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
