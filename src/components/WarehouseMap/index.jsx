import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const KARNATAKA_CENTER = [15.317, 75.7139]
const DEFAULT_ZOOM = 7

const pinIcon = L.divIcon({
  className: '',
  html: `<span style="
    display:block;width:30px;height:30px;border-radius:50% 50% 50% 0;
    background:#c83744;transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid #fff;
  "></span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
})

function FitToMarkers({ points }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) {
      map.setView(KARNATAKA_CENTER, DEFAULT_ZOOM)
      return
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 10)
      return
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [32, 32] })
  }, [points, map])

  return null
}

export default function WarehouseMap({ warehouses, renderPopup }) {
  const points = warehouses.filter((w) => typeof w.lat === 'number' && typeof w.lng === 'number')

  return (
    <MapContainer
      center={KARNATAKA_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers points={points} />
      {points.map((warehouse) => (
        <Marker key={warehouse.id} position={[warehouse.lat, warehouse.lng]} icon={pinIcon}>
          <Popup>{renderPopup ? renderPopup(warehouse) : warehouse.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
