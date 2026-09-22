import axiosClient from './axiosClient'

export function getDistricts() {
  return axiosClient.get('/districts').then((res) => res.data)
}
