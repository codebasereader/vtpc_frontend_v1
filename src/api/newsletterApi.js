import axiosClient from './axiosClient'

export function subscribeToNewsletter({ email }) {
  return axiosClient.post('/newsletter/subscribe', { email }).then((res) => res.data)
}
