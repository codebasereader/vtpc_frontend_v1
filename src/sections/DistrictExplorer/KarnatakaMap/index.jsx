import { useEffect, useRef } from 'react'
import mapMarkup from '../../../assets/karnataka-districts-map.svg?raw'

const SELECTED_COLOR = '#c83744'

// Soft, brand-adjacent tints so the map reads as colorful without
// competing with the solid crimson used for the selected district.
const DISTRICT_COLORS = [
  '#f2b6bd',
  '#a7c4e6',
  '#f4cf8a',
  '#f0b592',
  '#a8d5cd',
  '#c9b8e8',
  '#b9dba0',
  '#f0a8c4',
]

// Below this area (in the SVG's own viewBox units) a district's shape is
// too small for an inline label to fit without spilling into neighbors —
// those districts still get a name via hover tooltip (native `title`) and
// the panel once selected.
const MIN_LABEL_AREA = 900

// The three Bengaluru-area districts are packed tightly (Urban sits inside Rural, South is
// directly below), so their labels use a shorter name, a smaller font and a nudge from the
// centre of the shape so they stay inside their own district and don't collide.
// dx / dy are in the SVG's own units.
const LABEL_OVERRIDES = {
  'bengaluru-rural': { text: 'Bengaluru Rural', dx: 0, dy: -12, fontSize: 5.5 },
  'bengaluru-urban': { text: 'Bengaluru Urban', dx: 0, dy: 2, fontSize: 5.5 },
  ramanagara: { text: 'Bangalore South\n(Ramanagara)', dx: 16, dy: 18, fontSize: 5.5 },
}

function fillableParts(anchor) {
  // Excludes <path> elements that live inside a <mask> definition — those
  // aren't visible geometry, they're cutout shapes the mask uses, and
  // recoloring them would corrupt the mask's cutout effect.
  return Array.from(anchor.querySelectorAll('path')).filter((path) => !path.closest('mask'))
}

export default function KarnatakaMap({ selectedId, onSelect }) {
  const containerRef = useRef(null)

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

  // Assign each district a base color and a name label, once on mount.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Start clean: React StrictMode (dev) runs this effect twice, which would stack a second
    // copy of every label on top of the first.
    container.querySelectorAll('text[data-map-label]').forEach((el) => el.remove())

    const anchors = container.querySelectorAll('[data-district]')
    anchors.forEach((anchor, index) => {
      const color = DISTRICT_COLORS[index % DISTRICT_COLORS.length]
      anchor.dataset.baseColor = color
      fillableParts(anchor).forEach((path) => {
        path.style.fill = color
      })

      const override = LABEL_OVERRIDES[anchor.getAttribute('data-district')]
      const name = override?.text ?? anchor.getAttribute('title')
      const svg = anchor.closest('svg')
      if (!name || !svg) return

      try {
        const box = anchor.getBBox()
        if (box.width * box.height < MIN_LABEL_AREA) return

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        // A line break in a name starts a new line (centred on the same point).
        const lines = name.split('\n')
        const fontSize = override?.fontSize ?? 7
        lines.forEach((line, i) => {
          const span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
          span.textContent = line
          span.setAttribute('x', String(box.x + box.width / 2 + (override?.dx ?? 0)))
          span.setAttribute('dy', i === 0 ? String(-((lines.length - 1) * fontSize * 0.55)) : String(fontSize * 1.1))
          label.appendChild(span)
        })
        label.setAttribute('x', String(box.x + box.width / 2 + (override?.dx ?? 0)))
        label.setAttribute('y', String(box.y + box.height / 2 + (override?.dy ?? 0)))
        label.setAttribute('text-anchor', 'middle')
        label.setAttribute('dominant-baseline', 'middle')
        label.setAttribute('font-size', String(override?.fontSize ?? 7))
        label.setAttribute('font-weight', '600')
        label.setAttribute('fill', '#2d2d2d')
        label.setAttribute('stroke', 'white')
        label.setAttribute('stroke-width', '2.5')
        label.setAttribute('paint-order', 'stroke')
        label.setAttribute('pointer-events', 'none')
        label.setAttribute('data-map-label', '')
        anchor.appendChild(label)
      } catch {
        // getBBox can throw if the element isn't rendered yet (e.g. hidden
        // ancestor) — skip the label for that district rather than crash.
      }
    })
  }, [])

  // Toggle the selected district's fill between its base color and the
  // solid highlight color.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.querySelectorAll('[data-district]').forEach((anchor) => {
      const isSelected = anchor.getAttribute('data-district') === selectedId
      anchor.classList.toggle('map-a-selected', isSelected)
      const color = isSelected ? SELECTED_COLOR : anchor.dataset.baseColor
      fillableParts(anchor).forEach((path) => {
        path.style.fill = color
      })
    })
  }, [selectedId])

  return (
    <div
      ref={containerRef}
      className="[&_.map-a]:cursor-pointer [&_.map-a]:outline-none [&_.map-a]:transition-[filter] [&_.map-a:hover]:brightness-95 [&_.map-a-selected]:brightness-100"
      role="img"
      aria-label="Map of Karnataka districts — select a district to view its export data"
      dangerouslySetInnerHTML={{ __html: mapMarkup }}
    />
  )
}
