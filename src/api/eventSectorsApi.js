import axiosClient from './axiosClient'

export function getEventSectors() {
  return axiosClient.get('/event-sectors').then((res) => res.data)
}

function buildEventSectorPayload({ nameEn, nameKn }) {
  // No slug sent — the backend derives it from `name.en` (slugFrom: "name.en").
  return { name: { en: nameEn, kn: nameKn } }
}

export function createEventSector(sector) {
  return axiosClient.post('/admin/event-sectors', buildEventSectorPayload(sector)).then((res) => res.data)
}

export function updateEventSector(id, sector) {
  return axiosClient.put(`/admin/event-sectors/${id}`, buildEventSectorPayload(sector)).then((res) => res.data)
}

export function deleteEventSector(id) {
  return axiosClient.delete(`/admin/event-sectors/${id}`).then((res) => res.data)
}
