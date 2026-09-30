import axiosClient from './axiosClient'

// New resource — see docs/backend-requests/09-footer-newsletter-visitors.md.
// All calls fail gracefully (caught by callers) until the backend adds it.

export function trackVisit() {
  return axiosClient.post('/visits/track').then((res) => res.data)
}

export function getVisitsSummary() {
  return axiosClient.get('/visits/summary').then((res) => res.data)
}

export function getVisitsDaily({ from, to } = {}) {
  const params = {}
  if (from) params.from = from
  if (to) params.to = to
  return axiosClient.get('/admin/visits/daily', { params }).then((res) => res.data)
}

export function getLastUpdated() {
  return axiosClient.get('/last-updated').then((res) => res.data)
}
