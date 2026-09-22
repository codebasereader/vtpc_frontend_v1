import axiosClient from './axiosClient'

export function login({ email, password }) {
  return axiosClient.post('/auth/login', { email, password }).then((res) => res.data)
}
