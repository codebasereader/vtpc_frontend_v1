// Warehouse facility kinds. Ids must match WAREHOUSE_TYPES in the backend Warehouse model.
export const WAREHOUSE_TYPES = [
  { id: 'air-cargo', label: 'Air Cargo' },
  { id: 'port-terminal', label: 'Port Terminal' },
  { id: 'icd', label: 'Inland Container Depot (ICD)' },
  { id: 'cfs', label: 'Container Freight Station (CFS)' },
  { id: 'afs', label: 'Air Freight Station (AFS)' },
]

export function warehouseTypeLabel(id) {
  return WAREHOUSE_TYPES.find((type) => type.id === id)?.label || ''
}
