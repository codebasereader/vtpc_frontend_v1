import axiosClient from './axiosClient'

export function getOffices() {
  return axiosClient.get('/offices').then((res) => res.data)
}

function buildOfficePayload({ name, city, addressEn, addressKn, phone, email, mapLink }) {
  return {
    name,
    city,
    address: { en: addressEn, kn: addressKn },
    phone,
    email,
    mapLink,
  }
}

export function createOffice(office) {
  return axiosClient.post('/admin/offices', buildOfficePayload(office)).then((res) => res.data)
}

export function updateOffice(id, office) {
  return axiosClient.put(`/admin/offices/${id}`, buildOfficePayload(office)).then((res) => res.data)
}

export function deleteOffice(id) {
  return axiosClient.delete(`/admin/offices/${id}`).then((res) => res.data)
}
