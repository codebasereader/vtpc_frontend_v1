import axiosClient from './axiosClient'

export function getPageBySlug(slug) {
  return axiosClient.get(`/pages/${slug}`).then((res) => res.data)
}

// Admin list endpoint requested — see docs/backend-requests/09-footer-newsletter-visitors.md.
// Until it lands, the admin Pages screen shows a graceful empty state.
export function getPages() {
  return axiosClient.get('/admin/pages').then((res) => res.data)
}

function buildPagePayload({ titleEn, titleKn, bodyEn, bodyKn }) {
  return { title: { en: titleEn, kn: titleKn }, body: { en: bodyEn, kn: bodyKn } }
}

export function createPage(page) {
  return axiosClient.post('/admin/pages', buildPagePayload(page)).then((res) => res.data)
}

export function updatePage(id, page) {
  return axiosClient.put(`/admin/pages/${id}`, buildPagePayload(page)).then((res) => res.data)
}

export function deletePage(id) {
  return axiosClient.delete(`/admin/pages/${id}`).then((res) => res.data)
}
