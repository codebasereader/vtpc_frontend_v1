// Warehouse facility kinds. Ids must match WAREHOUSE_TYPES in the backend Warehouse model.
export const WAREHOUSE_TYPES = [
  { id: 'air-cargo', label: 'Air Cargo', kn: 'ವಿಮಾನ ಸರಕು ಸಾಗಣೆ' },
  { id: 'port-terminal', label: 'Port Terminal', kn: 'ಬಂದರು ಟರ್ಮಿನಲ್' },
  { id: 'icd', label: 'Inland Container Depot (ICD)', kn: 'ಒಳನಾಡು ಕಂಟೇನರ್ ಡಿಪೋ (ICD)' },
  { id: 'cfs', label: 'Container Freight Station (CFS)', kn: 'ಕಂಟೇನರ್ ಸರಕು ಕೇಂದ್ರ (CFS)' },
  { id: 'afs', label: 'Air Freight Station (AFS)', kn: 'ವಿಮಾನ ಸರಕು ಕೇಂದ್ರ (AFS)' },
]

export function warehouseTypeLabel(id, language = 'en') {
  const type = WAREHOUSE_TYPES.find((item) => item.id === id)
  if (!type) return ''
  return language === 'kn' ? type.kn || type.label : type.label
}
