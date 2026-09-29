import axiosClient from './axiosClient'

export function getStateExports() {
  return axiosClient.get('/state-exports').then((res) => res.data)
}

export function getTopProducts() {
  return axiosClient.get('/top-products').then((res) => res.data)
}

export function getCountryProducts() {
  return axiosClient.get('/country-products').then((res) => res.data)
}
