import axiosClient from './axiosClient'

export function getTaluks() {
  return axiosClient.get('/taluks').then((res) => res.data)
}

function buildTalukPayload({ name, district }) {
  return { name, district }
}

export function createTaluk(taluk) {
  return axiosClient.post('/admin/taluks', buildTalukPayload(taluk)).then((res) => res.data)
}

export function updateTaluk(id, taluk) {
  return axiosClient.put(`/admin/taluks/${id}`, buildTalukPayload(taluk)).then((res) => res.data)
}

export function deleteTaluk(id) {
  return axiosClient.delete(`/admin/taluks/${id}`).then((res) => res.data)
}
