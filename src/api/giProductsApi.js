import axiosClient from './axiosClient'

export function getGiProducts() {
  return axiosClient.get('/gi-products').then((res) => res.data)
}

function buildGiProductFormData({
  nameEn,
  nameKn,
  category,
  summaryEn,
  summaryKn,
  featured,
  imageFile,
  videoFile,
}) {
  const formData = new FormData()
  formData.append('name[en]', nameEn)
  formData.append('name[kn]', nameKn)
  formData.append('category', category)
  formData.append('summary[en]', summaryEn)
  formData.append('summary[kn]', summaryKn)
  formData.append('featured', featured ? 'true' : 'false')
  if (imageFile) formData.append('image', imageFile)
  if (videoFile) formData.append('video', videoFile)
  return formData
}

export function createGiProduct(product) {
  return axiosClient.post('/admin/gi-products', buildGiProductFormData(product)).then((res) => res.data)
}

export function updateGiProduct(id, product) {
  return axiosClient.put(`/admin/gi-products/${id}`, buildGiProductFormData(product)).then((res) => res.data)
}

export function deleteGiProduct(id) {
  return axiosClient.delete(`/admin/gi-products/${id}`).then((res) => res.data)
}
