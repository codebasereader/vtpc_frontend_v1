import axiosClient from './axiosClient'
import { normalizeRelease } from '../lib/marketData/normalize'

// Public: the list of published periods (newest first), without the heavy data.
export function getMarketReleases() {
  return axiosClient.get('/market-releases').then((res) => res.data)
}

// Public: one period's full data, by key (e.g. "q1-fy-2026-27"). Kept for the page
// visit so switching periods or districts doesn't download a release twice.
const releaseCache = new Map()

export function getMarketRelease(key) {
  if (!releaseCache.has(key)) {
    const request = axiosClient
      .get(`/market-releases/${encodeURIComponent(key)}`)
      .then((res) => normalizeRelease(res.data))
      .catch((err) => {
        releaseCache.delete(key)
        throw err
      })
    releaseCache.set(key, request)
  }
  return releaseCache.get(key)
}

// Admin: publish a period. Replaces the period if it already exists.
export function publishMarketRelease(release) {
  return axiosClient.put(`/admin/market-releases/${encodeURIComponent(release.key)}`, release).then((res) => res.data)
}

export function deleteMarketRelease(key) {
  return axiosClient.delete(`/admin/market-releases/${encodeURIComponent(key)}`).then((res) => res.data)
}
