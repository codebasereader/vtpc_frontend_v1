import axiosClient from './axiosClient'

export function getHomepageContent() {
  return axiosClient.get('/homepage-content').then((res) => res.data)
}
