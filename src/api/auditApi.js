import axiosClient from './axiosClient'
import { API_BASE_URL } from '../config/config'

// Drops empty filters so the query string stays clean.
function clean(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value != null))
}

export function getAuditLogs(params) {
  return axiosClient.get('/admin/audit/logs', { params: clean(params) }).then((res) => res.data)
}

export function getAuditSessions(params) {
  return axiosClient.get('/admin/audit/sessions', { params: clean(params) }).then((res) => res.data)
}

export function getAuditSession(id) {
  return axiosClient.get(`/admin/audit/sessions/${id}`).then((res) => res.data)
}

// A plain link (the browser sends the session cookie), so large exports stream.
export function auditLogsExportUrl(params) {
  const query = new URLSearchParams(clean(params)).toString()
  return `${API_BASE_URL}/admin/audit/logs/export${query ? `?${query}` : ''}`
}
