import axiosClient from './axiosClient'

export function submitEnquiry({ productId, name, email, phone, message }) {
  return axiosClient
    .post('/enquiries', { productId, name, email, phone: phone || '', message })
    .then((res) => res.data)
}

export function getEnquiries() {
  return axiosClient.get('/admin/enquiries').then((res) => res.data)
}

// Marks an enquiry as followed-up (or undoes it).
export function setEnquiryContacted(id, contacted) {
  return axiosClient.patch(`/admin/enquiries/${id}`, { contacted }).then((res) => res.data)
}
