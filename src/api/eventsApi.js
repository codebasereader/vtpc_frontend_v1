import axiosClient from './axiosClient'

export function getEvents() {
  return axiosClient.get('/events').then((res) => res.data)
}

function buildEventPayload({
  titleEn,
  titleKn,
  type,
  city,
  sector,
  isDateTBA,
  startDate,
  endDate,
  tbaYear,
  descriptionEn,
  descriptionKn,
  registrationLink,
}) {
  return {
    title: { en: titleEn, kn: titleKn },
    type,
    city,
    sector,
    isDateTBA: Boolean(isDateTBA),
    startDate: isDateTBA ? null : startDate || null,
    endDate: isDateTBA ? null : endDate || null,
    tbaYear: isDateTBA ? Number(tbaYear) || null : null,
    description: { en: descriptionEn, kn: descriptionKn },
    registrationLink: registrationLink || '',
  }
}

export function createEvent(event) {
  return axiosClient.post('/admin/events', buildEventPayload(event)).then((res) => res.data)
}

export function updateEvent(id, event) {
  return axiosClient.put(`/admin/events/${id}`, buildEventPayload(event)).then((res) => res.data)
}

export function deleteEvent(id) {
  return axiosClient.delete(`/admin/events/${id}`).then((res) => res.data)
}
