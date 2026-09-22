import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSectors } from '../../api/sectorsApi'
import { ROUTES } from '../../constants/routes'

export default function SectorsTeaser() {
  const [sectors, setSectors] = useState([])

  useEffect(() => {
    let isMounted = true
    getSectors()
      .then((data) => {
        if (isMounted) setSectors(data)
      })
      .catch(() => {
        if (isMounted) setSectors([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (sectors.length === 0) return null

  return (
    <section className="bg-white px-4 py-12 md:px-8">
      <h2 className="text-center text-2xl font-bold text-brand-dark md:text-3xl">
        Delve into the Champion Service Sectors
      </h2>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        {sectors.slice(0, 3).map((sector) => (
          <Link
            key={sector.id}
            to={ROUTES.EXPORTER_CORNER}
            className="rounded-[5px] bg-white p-6 text-center font-semibold text-brand-primary shadow-[0_0_10px_rgba(0,0,0,0.05)] hover:bg-brand-surface"
          >
            {sector.name.en}
          </Link>
        ))}
      </div>
    </section>
  )
}
