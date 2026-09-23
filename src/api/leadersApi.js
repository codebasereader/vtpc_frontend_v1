import axiosClient from './axiosClient'

export function getLeaders() {
  return axiosClient.get('/leaders').then((res) => res.data)
}

function buildLeaderFormData({ nameEn, nameKn, designationEn, designationKn, order, photoFile }) {
  const formData = new FormData()
  formData.append('name[en]', nameEn)
  formData.append('name[kn]', nameKn)
  formData.append('designation[en]', designationEn)
  formData.append('designation[kn]', designationKn)
  formData.append('order', String(order))
  if (photoFile) {
    formData.append('photo', photoFile)
  }
  return formData
}

export function createLeader(leader) {
  return axiosClient.post('/admin/leaders', buildLeaderFormData(leader)).then((res) => res.data)
}

export function updateLeader(id, leader) {
  return axiosClient.put(`/admin/leaders/${id}`, buildLeaderFormData(leader)).then((res) => res.data)
}

export function deleteLeader(id) {
  return axiosClient.delete(`/admin/leaders/${id}`).then((res) => res.data)
}
