import axiosClient from './axiosClient'

export function getCities() {
  return axiosClient.get('/cities').then((res) => res.data)
}

function buildCityPayload({ name, state, country }) {
  // No slug sent — the backend derives it from `name` (see makeCrud's
  // slugFrom: "name" for this resource), same as Districts without a
  // fixed external id to match.
  return { name, state, country }
}

export function createCity(city) {
  return axiosClient.post('/admin/cities', buildCityPayload(city)).then((res) => res.data)
}

export function updateCity(id, city) {
  return axiosClient.put(`/admin/cities/${id}`, buildCityPayload(city)).then((res) => res.data)
}

export function deleteCity(id) {
  return axiosClient.delete(`/admin/cities/${id}`).then((res) => res.data)
}
