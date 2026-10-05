import axiosClient from './axiosClient'

// Public: the list of published periods (newest first), without the heavy data.
export function getMarketReleases() {
  return axiosClient.get('/market-releases').then((res) => res.data)
}

// Public: one period's full data, by key (e.g. "q1-fy-2026-27").
export function getMarketRelease(key) {
  return axiosClient.get(`/market-releases/${encodeURIComponent(key)}`).then((res) => res.data)
}

// Admin: publish a period. Replaces the period if it already exists.
export function publishMarketRelease(release) {
  return axiosClient.put(`/admin/market-releases/${encodeURIComponent(release.key)}`, release).then((res) => res.data)
}

export function deleteMarketRelease(key) {
  return axiosClient.delete(`/admin/market-releases/${encodeURIComponent(key)}`).then((res) => res.data)
}
