import axiosClient from './axiosClient'

export function login({ email, password, captchaToken, captchaAnswer }) {
  return axiosClient
    .post('/auth/login', { email, password, captchaToken, captchaAnswer })
    .then((res) => res.data)
}

// A simple question the login form asks after repeated failed attempts.
export function getCaptcha() {
  return axiosClient.get('/auth/captcha').then((res) => res.data)
}

export function getMe() {
  return axiosClient.get('/auth/me').then((res) => res.data)
}

export function logout() {
  return axiosClient.post('/auth/logout').then((res) => res.data)
}

export function changePassword({ currentPassword, newPassword }) {
  return axiosClient.post('/auth/change-password', { currentPassword, newPassword }).then((res) => res.data)
}
