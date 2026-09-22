import { useEffect, useRef } from 'react'
import mapMarkup from '../../../assets/karnataka-districts-map.svg?raw'

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

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.querySelectorAll('[data-district]').forEach((link) => {
      link.classList.toggle('map-a-selected', link.getAttribute('data-district') === selectedId)
    })
  }, [selectedId])

  return (
    <div
      ref={containerRef}
      className="[&_.map-a]:cursor-pointer [&_.map-a]:outline-none [&_.map-a-selected_path]:fill-brand-primary"
      role="img"
      aria-label="Map of Karnataka districts — select a district to view its export data"
      dangerouslySetInnerHTML={{ __html: mapMarkup }}
    />
  )
}
