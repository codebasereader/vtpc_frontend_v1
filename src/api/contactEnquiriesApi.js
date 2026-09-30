import axiosClient from './axiosClient'

// Public "Contact Us" form (floating button).
export function submitContactEnquiry({ name, email, phone, message }) {
  return axiosClient
    .post('/contact-enquiries', { name, email, phone: phone || '', message })
    .then((res) => res.data)
}

export function getContactEnquiries() {
  return axiosClient.get('/admin/contact-enquiries').then((res) => res.data)
}

// Marks an enquiry as followed-up (or undoes it).
export function setContactEnquiryContacted(id, contacted) {
  return axiosClient.patch(`/admin/contact-enquiries/${id}`, { contacted }).then((res) => res.data)
}
