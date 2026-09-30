import axiosClient from './axiosClient'

export function getDownloadCategories() {
  return axiosClient.get('/download-categories').then((res) => res.data)
}

function buildDownloadCategoryPayload({ nameEn, nameKn, order }) {
  return { name: { en: nameEn, kn: nameKn }, order: Number(order) || 0 }
}

export function createDownloadCategory(category) {
  return axiosClient.post('/admin/download-categories', buildDownloadCategoryPayload(category)).then((res) => res.data)
}

export function updateDownloadCategory(id, category) {
  return axiosClient
    .put(`/admin/download-categories/${id}`, buildDownloadCategoryPayload(category))
    .then((res) => res.data)
}

export function deleteDownloadCategory(id) {
  return axiosClient.delete(`/admin/download-categories/${id}`).then((res) => res.data)
}
