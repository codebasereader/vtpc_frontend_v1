import { useEffect, useRef } from 'react'
import mapMarkup from '../../assets/karnataka-districts-map.svg?raw'

const BASE_COLOR = '#eef2f8'
const HAS_WAREHOUSE_COLOR = '#a7c4e6'
const SELECTED_COLOR = '#f2b6bd'
const BORDER_COLOR = '#6f86ab'
const SELECTED_BORDER_COLOR = '#c83744'
const PIN_COLOR = '#c83744'
const PIN_SELECTED_COLOR = '#163a6d'
const SVG_NS = 'http://www.w3.org/2000/svg'

// Districts smaller than this (SVG units squared) are too small to hold a name; they still get a pin.
const MIN_LABEL_AREA = 900
const LABEL_FONT_SIZE = 7

// Label nudges (SVG units). The three Bengaluru districts are packed tightly, so their names
// are stacked and spread out; Davangere is nudged up so it clears Chitradurga.
const LABEL_OVERRIDES = {
  'bengaluru-rural': { text: 'Bengaluru\nRural', dx: 0, dy: -14 },
  'bengaluru-urban': { text: 'Bengaluru\nUrban', dx: 0, dy: 2 },
  ramanagara: { text: 'Bengaluru South\n(Ramanagara)', dx: 24, dy: 12 },
  davangere: { dx: 1.5, dy: -12 },
}

// Pins are drawn just above each district's name. Districts in the crowded Bengaluru cluster
// get their pin beside the name instead, so it doesn't cover a neighbour. dx / dy in SVG units.
const PIN_BESIDE = {
  'bengaluru-rural': { dx: -26, dy: 4 },
  'bengaluru-urban': { dx: 20, dy: 8 },
  ramanagara: { dx: -22, dy: 4 },
}

function fillableParts(anchor) {
  return Array.from(anchor.querySelectorAll('path')).filter((path) => !path.closest('mask'))
}

function buildPin(count, x, y, isSelected) {
  const group = document.createElementNS(SVG_NS, 'g')
  group.setAttribute('data-warehouse-pin', '')
  group.setAttribute('transform', `translate(${x} ${y}) scale(0.8)`)
  group.setAttribute('pointer-events', 'none')

  const body = document.createElementNS(SVG_NS, 'path')
  body.setAttribute('d', 'M0 0 C-3 -6 -8 -8.5 -8 -14 a8 8 0 1 1 16 0 C8 -8.5 3 -6 0 0Z')
  body.setAttribute('fill', isSelected ? PIN_SELECTED_COLOR : PIN_COLOR)
  body.setAttribute('stroke', '#fff')
  body.setAttribute('stroke-width', '1.5')
  group.appendChild(body)

  const text = document.createElementNS(SVG_NS, 'text')
  text.textContent = String(count)
  text.setAttribute('x', '0')
  text.setAttribute('y', '-14')
  text.setAttribute('text-anchor', 'middle')
  text.setAttribute('dominant-baseline', 'central')
  text.setAttribute('font-size', '8')
  text.setAttribute('font-weight', '700')
  text.setAttribute('fill', '#fff')
  group.appendChild(text)
  return group
}

// Draws the district name once and returns where it sits, so pins can be placed against it.
function addLabel(anchor) {
  const id = anchor.getAttribute('data-district')
  const override = LABEL_OVERRIDES[id]
  const name = override?.text ?? anchor.getAttribute('title')
  if (!name) return null
  try {
    const box = anchor.getBBox()
    const cx = box.x + box.width / 2 + (override?.dx ?? 0)
    const cy = box.y + box.height / 2 + (override?.dy ?? 0)
    const lines = name.split('\n')
    const geometry = { cx, cy, halfHeight: (lines.length * LABEL_FONT_SIZE * 1.1) / 2 }
    if (box.width * box.height < MIN_LABEL_AREA) return geometry

    const label = document.createElementNS(SVG_NS, 'text')
    lines.forEach((line, i) => {
      const span = document.createElementNS(SVG_NS, 'tspan')
      span.textContent = line
      span.setAttribute('x', String(cx))
      span.setAttribute(
        'dy',
        i === 0 ? String(-((lines.length - 1) * LABEL_FONT_SIZE * 0.55)) : String(LABEL_FONT_SIZE * 1.1),
      )
      label.appendChild(span)
    })
    label.setAttribute('x', String(cx))
    label.setAttribute('y', String(cy))
    label.setAttribute('text-anchor', 'middle')
    label.setAttribute('dominant-baseline', 'middle')
    label.setAttribute('font-size', String(LABEL_FONT_SIZE))
    label.setAttribute('font-weight', '600')
    label.setAttribute('fill', '#2d2d2d')
    label.setAttribute('stroke', 'white')
    label.setAttribute('stroke-width', '2.5')
    label.setAttribute('paint-order', 'stroke')
    label.setAttribute('pointer-events', 'none')
    label.setAttribute('data-map-label', '')
    anchor.appendChild(label)
    return geometry
  } catch {
    // getBBox throws when the element isn't rendered yet — skip the label rather than crash.
    return null
  }
}

/**
 * Karnataka district map for the warehouse section. Districts that have a (currently listed)
 * warehouse are tinted and carry a pin with the count; every district is named and outlined;
 * `selectedId` is drawn in rose with a crimson border.
 */
export default function WarehouseDistrictMap({ countsByDistrict, selectedId, onSelect, ariaLabel }) {
  const containerRef = useRef(null)
  const labelPositions = useRef({})

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    function handleClick(event) {
      const link = event.target.closest('[data-district]')
      if (!link) return
      event.preventDefault()
      onSelect(link.getAttribute('data-district'))
    }
    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [onSelect])

  // Names: drawn once. Remember each district's label position for placing pins.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    // Start clean so React StrictMode's double effect can't stack a second set of names.
    container.querySelectorAll('text[data-map-label]').forEach((el) => el.remove())
    const positions = {}
    container.querySelectorAll('[data-district]').forEach((anchor) => {
      const geometry = addLabel(anchor)
      if (geometry) positions[anchor.getAttribute('data-district')] = geometry
    })
    labelPositions.current = positions
  }, [])

  // Colours, borders and pins: redrawn whenever the counts or the selection change.
  useEffect(() => {
    const container = containerRef.current
    const svg = container?.querySelector('svg')
    if (!svg) return

    svg.querySelectorAll('[data-warehouse-pin]').forEach((el) => el.remove())
    const pins = []
    let selectedAnchor = null

    container.querySelectorAll('[data-district]').forEach((anchor) => {
      const id = anchor.getAttribute('data-district')
      const count = countsByDistrict[id] || 0
      const isSelected = id === selectedId
      const color = isSelected ? SELECTED_COLOR : count > 0 ? HAS_WAREHOUSE_COLOR : BASE_COLOR
      fillableParts(anchor).forEach((path) => {
        path.style.fill = color
        path.style.stroke = isSelected ? SELECTED_BORDER_COLOR : BORDER_COLOR
        path.style.strokeWidth = isSelected ? '1.6' : '0.9'
        path.style.strokeLinejoin = 'round'
      })
      anchor.classList.toggle('map-a-selected', isSelected)
      if (isSelected) selectedAnchor = anchor

      if (count === 0) return
      const place = labelPositions.current[id]
      if (!place) return
      const beside = PIN_BESIDE[id]
      pins.push({
        count,
        isSelected,
        x: beside ? place.cx + beside.dx : place.cx,
        y: beside ? place.cy + beside.dy : place.cy - place.halfHeight - 1,
      })
    })

    // Draw the selected district last so its border isn't covered by its neighbours.
    if (selectedAnchor) svg.appendChild(selectedAnchor)
    pins
      .sort((a, b) => Number(a.isSelected) - Number(b.isSelected))
      .forEach((pin) => svg.appendChild(buildPin(pin.count, pin.x, pin.y, pin.isSelected)))
  }, [countsByDistrict, selectedId])

  return (
    <div
      ref={containerRef}
      className="h-full w-full [&_.map-a]:cursor-pointer [&_.map-a]:outline-none [&_.map-a]:transition-[filter] [&_.map-a:hover]:brightness-95 [&_svg]:h-full [&_svg]:w-full"
      role="img"
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: mapMarkup }}
    />
  )
}
