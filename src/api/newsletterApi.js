import axiosClient from './axiosClient'

export function subscribeToNewsletter(email) {
  return axiosClient.post('/newsletter/subscribe', { email }).then((res) => res.data)
}

export function getNewsletterSubscribers() {
  return axiosClient.get('/admin/newsletter/subscribers').then((res) => res.data)
}

export function getNewsletterSubscribersExportUrl() {
  return `${axiosClient.defaults.baseURL}/admin/newsletter/subscribers/export`
}

// ---- Monthly newsletter issues — new resource, see backend request doc ----

export function getNewsletterIssues() {
  return axiosClient.get('/admin/newsletter/issues').then((res) => res.data)
}

export function createNewsletterIssue({ subject, body, month, year }) {
  return axiosClient.post('/admin/newsletter/issues', { subject, body, month, year }).then((res) => res.data)
}

export function sendNewsletterIssue(id) {
  return axiosClient.post(`/admin/newsletter/issues/${id}/send`).then((res) => res.data)
}

export function deleteNewsletterIssue(id) {
  return axiosClient.delete(`/admin/newsletter/issues/${id}`).then((res) => res.data)
}
