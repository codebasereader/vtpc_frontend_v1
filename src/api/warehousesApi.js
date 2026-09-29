import axiosClient from './axiosClient'

export function getWarehouses() {
  return axiosClient.get('/warehouses').then((res) => res.data)
}

function buildWarehousePayload({ name, district, taluk, capacityMt, lat, lng, address }) {
  return {
    name,
    district,
    taluk,
    capacityMt: Number(capacityMt) || 0,
    lat: lat === '' || lat === null || lat === undefined ? null : Number(lat),
    lng: lng === '' || lng === null || lng === undefined ? null : Number(lng),
    address: address || '',
  }
}

export function createWarehouse(warehouse) {
  return axiosClient.post('/admin/warehouses', buildWarehousePayload(warehouse)).then((res) => res.data)
}

export function updateWarehouse(id, warehouse) {
  return axiosClient.put(`/admin/warehouses/${id}`, buildWarehousePayload(warehouse)).then((res) => res.data)
}

export function deleteWarehouse(id) {
  return axiosClient.delete(`/admin/warehouses/${id}`).then((res) => res.data)
}
