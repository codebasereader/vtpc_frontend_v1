import axiosClient from './axiosClient'

export function getUsers() {
  return axiosClient.get('/admin/users').then((res) => res.data)
}

export function createUser({ name, email, roleId, password }) {
  return axiosClient.post('/admin/users', { name, email, roleId, password }).then((res) => res.data)
}

export function updateUser(id, { name, email, roleId }) {
  return axiosClient.put(`/admin/users/${id}`, { name, email, roleId }).then((res) => res.data)
}

export function setUserActive(id, isActive) {
  return axiosClient.patch(`/admin/users/${id}`, { isActive }).then((res) => res.data)
}

export function resetUserPassword(id, newPassword) {
  return axiosClient.post(`/admin/users/${id}/reset-password`, { newPassword }).then((res) => res.data)
}

export function deleteUser(id) {
  return axiosClient.delete(`/admin/users/${id}`).then((res) => res.data)
}
