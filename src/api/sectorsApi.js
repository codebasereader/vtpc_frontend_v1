import axiosClient from './axiosClient'

export function getSectors() {
  return axiosClient.get('/focus-sectors').then((res) => res.data)
}

function buildSectorFormData({
  nameEn,
  nameKn,
  descriptionEn,
  descriptionKn,
  keyInsightsEn,
  keyInsightsKn,
  statBoxes,
  yearlyChart,
  topMarkets,
  icon,
  order,
  imageFile,
}) {
  const formData = new FormData()
  formData.append('name[en]', nameEn)
  formData.append('name[kn]', nameKn)
  formData.append('description[en]', descriptionEn)
  formData.append('description[kn]', descriptionKn)
  formData.append('keyInsights[en]', keyInsightsEn)
  formData.append('keyInsights[kn]', keyInsightsKn)
  // Nested arrays travel as JSON strings; the backend parses them.
  formData.append('statBoxes', JSON.stringify(statBoxes))
  formData.append('yearlyChart', JSON.stringify(yearlyChart))
  formData.append('topMarkets', JSON.stringify(topMarkets))
  formData.append('icon', icon)
  formData.append('order', String(order))
  if (imageFile) formData.append('image', imageFile)
  return formData
}

export function createSector(sector) {
  return axiosClient.post('/admin/focus-sectors', buildSectorFormData(sector)).then((res) => res.data)
}

export function updateSector(id, sector) {
  return axiosClient.put(`/admin/focus-sectors/${id}`, buildSectorFormData(sector)).then((res) => res.data)
}

export function deleteSector(id) {
  return axiosClient.delete(`/admin/focus-sectors/${id}`).then((res) => res.data)
}
