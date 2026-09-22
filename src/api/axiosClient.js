import axios from 'axios'
import { API_BASE_URL } from '../config/config'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message || 'Something went wrong. Please try again.'
    return Promise.reject({ message, status })
  }
)

export default axiosClient
