import axiosClient from './axiosClient'

export function getLeaders() {
  return axiosClient.get('/leaders').then((res) => res.data)
}
