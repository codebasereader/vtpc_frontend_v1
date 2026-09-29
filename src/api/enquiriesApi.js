import axiosClient from './axiosClient'

export function submitEnquiry({ productId, name, email, phone, message }) {
  return axiosClient
    .post('/enquiries', { productId, name, email, phone: phone || '', message })
    .then((res) => res.data)
}
