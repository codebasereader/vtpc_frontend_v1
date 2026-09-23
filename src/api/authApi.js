import axiosClient from './axiosClient'

export function login({ email, password }) {
  return axiosClient.post('/auth/login', { email, password }).then((res) => res.data)
}

export function getMe() {
  return axiosClient.get('/auth/me').then((res) => res.data)
}

export function logout() {
  return axiosClient.post('/auth/logout').then((res) => res.data)
}
