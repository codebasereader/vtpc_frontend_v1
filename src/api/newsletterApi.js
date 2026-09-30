import axiosClient from './axiosClient'

export function subscribeToNewsletter(email) {
  return axiosClient.post('/newsletter/subscribe', { email }).then((res) => res.data)
}

export function getNewsletterSubscribers() {
  return axiosClient.get('/admin/newsletter/subscribers').then((res) => res.data)
}

// status: 'active' | 'blocked'. Blocked subscribers are skipped when a
// newsletter is sent.
export function setNewsletterSubscriberStatus(id, status) {
  return axiosClient.patch(`/admin/newsletter/subscribers/${id}`, { status }).then((res) => res.data)
}

export function getNewsletterSubscribersExportUrl() {
  return `${axiosClient.defaults.baseURL}/admin/newsletter/subscribers/export`
}

// ---- Monthly newsletter issues — new resource, see backend request doc ----

export function getNewsletterIssues() {
  return axiosClient.get('/admin/newsletter/issues').then((res) => res.data)
}

// Multipart only when a PDF is attached; plain JSON otherwise so drafts
// keep working against a backend without attachment support.
export function createNewsletterIssue({ subject, body, month, year, attachmentFile }) {
  if (!attachmentFile) {
    return axiosClient.post('/admin/newsletter/issues', { subject, body, month, year }).then((res) => res.data)
  }
  const formData = new FormData()
  formData.append('subject', subject)
  formData.append('body', body)
  formData.append('month', String(month))
  formData.append('year', String(year))
  formData.append('attachment', attachmentFile)
  return axiosClient.post('/admin/newsletter/issues', formData).then((res) => res.data)
}

export function sendNewsletterIssue(id) {
  return axiosClient.post(`/admin/newsletter/issues/${id}/send`).then((res) => res.data)
}

export function deleteNewsletterIssue(id) {
  return axiosClient.delete(`/admin/newsletter/issues/${id}`).then((res) => res.data)
}
