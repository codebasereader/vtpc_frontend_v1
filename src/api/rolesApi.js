import axiosClient from './axiosClient'

export function getRoles() {
  return axiosClient.get('/admin/roles').then((res) => res.data)
}

export function createRole({ name, description }) {
  return axiosClient.post('/admin/roles', { name, description }).then((res) => res.data)
}

export function updateRole(id, { name, description }) {
  return axiosClient.put(`/admin/roles/${id}`, { name, description }).then((res) => res.data)
}

// Replaces the role's whole list of permitted pages.
export function setRolePermissions(id, permissions) {
  return axiosClient.put(`/admin/roles/${id}/permissions`, { permissions }).then((res) => res.data)
}

export function deleteRole(id) {
  return axiosClient.delete(`/admin/roles/${id}`).then((res) => res.data)
}
