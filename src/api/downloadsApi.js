import axiosClient from './axiosClient'

export function getDownloads() {
  return axiosClient.get('/downloads').then((res) => res.data)
}

function buildDownloadFormData({ titleEn, titleKn, category, parent, order, file }) {
  const formData = new FormData()
  formData.append('title[en]', titleEn)
  formData.append('title[kn]', titleKn)
  formData.append('category', category)
  formData.append('parent', parent || '')
  formData.append('order', String(Number(order) || 0))
  if (file) formData.append('fileUrl', file)
  return formData
}

export function createDownload(download) {
  return axiosClient.post('/admin/downloads', buildDownloadFormData(download)).then((res) => res.data)
}

export function updateDownload(id, download) {
  return axiosClient.put(`/admin/downloads/${id}`, buildDownloadFormData(download)).then((res) => res.data)
}

export function deleteDownload(id) {
  return axiosClient.delete(`/admin/downloads/${id}`).then((res) => res.data)
}
