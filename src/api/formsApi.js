import axiosClient from './axiosClient'

// ---- Public ----------------------------------------------------------

// Active forms only — feeds the home-page marquee.
export function getActiveForms() {
  return axiosClient.get('/forms/active').then((res) => res.data)
}

// One active form with its questions; 404 when inactive or unknown.
export function getPublicForm(slug) {
  return axiosClient.get(`/forms/${encodeURIComponent(slug)}`).then((res) => res.data)
}

// answers: [{ questionId, value }] — value is a string, an array (multiple choice) or a number (rating).
export function submitFormResponse(slug, answers) {
  return axiosClient.post(`/forms/${encodeURIComponent(slug)}/responses`, { answers }).then((res) => res.data)
}

// ---- Admin -----------------------------------------------------------

export function getAdminForms() {
  return axiosClient.get('/admin/forms').then((res) => res.data)
}

export function getAdminForm(id) {
  return axiosClient.get(`/admin/forms/${id}`).then((res) => res.data)
}

export function createForm(form) {
  return axiosClient.post('/admin/forms', form).then((res) => res.data)
}

export function updateForm(id, form) {
  return axiosClient.put(`/admin/forms/${id}`, form).then((res) => res.data)
}

export function setFormActive(id, isActive) {
  return axiosClient.patch(`/admin/forms/${id}`, { isActive }).then((res) => res.data)
}

export function deleteForm(id) {
  return axiosClient.delete(`/admin/forms/${id}`).then((res) => res.data)
}

export function getFormResponses(id) {
  return axiosClient.get(`/admin/forms/${id}/responses`).then((res) => res.data)
}

export function deleteFormResponse(formId, responseId) {
  return axiosClient.delete(`/admin/forms/${formId}/responses/${responseId}`).then((res) => res.data)
}
