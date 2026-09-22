import axiosClient from './axiosClient'

export function getSectors() {
  return axiosClient.get('/focus-sectors').then((res) => res.data)
}
