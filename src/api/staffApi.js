import axiosClient from './axiosClient'

export function getStaff() {
  return axiosClient.get('/staff').then((res) => res.data)
}

function buildStaffFormData({ name, role, group, order, photoFile }) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('role', role)
  formData.append('group', group)
  formData.append('order', String(order))
  if (photoFile) {
    formData.append('photo', photoFile)
  }
  return formData
}

export function createStaff(staff) {
  return axiosClient.post('/admin/staff', buildStaffFormData(staff)).then((res) => res.data)
}

export function updateStaff(id, staff) {
  return axiosClient.put(`/admin/staff/${id}`, buildStaffFormData(staff)).then((res) => res.data)
}

export function deleteStaff(id) {
  return axiosClient.delete(`/admin/staff/${id}`).then((res) => res.data)
}
