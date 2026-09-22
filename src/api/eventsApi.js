import axiosClient from './axiosClient'

export function getEvents() {
  return axiosClient.get('/events').then((res) => res.data)
}
