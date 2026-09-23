import axiosClient from './axiosClient'

export function getDistricts() {
  return axiosClient.get('/districts').then((res) => res.data)
}

function buildDistrictPayload({ slug, name, taglineEn, taglineKn, totalExportValueCr, countries, products, sectors }) {
  return {
    // Sent explicitly rather than left for the backend to derive from
    // `name` — a couple of the map SVG's data-district values don't match
    // what auto-slugifying their display title would produce (e.g.
    // "chikkamangaluru" vs "Chikkamagaluru"), so map-click selection would
    // silently break for those districts if we let it guess.
    slug,
    name,
    tagline: { en: taglineEn, kn: taglineKn },
    totalExportValueCr: Number(totalExportValueCr) || 0,
    countries: countries.map((row) => ({ name: row.name, percentage: Number(row.percentage) || 0 })),
    products: products.map((row) => ({ name: row.name, percentage: Number(row.percentage) || 0 })),
    sectors: sectors.map((row) => ({ name: row.name, percentage: Number(row.percentage) || 0 })),
  }
}

export function createDistrict(district) {
  return axiosClient.post('/admin/districts', buildDistrictPayload(district)).then((res) => res.data)
}

export function updateDistrict(id, district) {
  return axiosClient.put(`/admin/districts/${id}`, buildDistrictPayload(district)).then((res) => res.data)
}

export function deleteDistrict(id) {
  return axiosClient.delete(`/admin/districts/${id}`).then((res) => res.data)
}
