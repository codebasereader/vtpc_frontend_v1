import { lazy, Suspense, useEffect, useState } from 'react'
import { getDistricts } from '../../api/districtsApi'
import DistrictPanel from './DistrictPanel'

const KarnatakaMap = lazy(() => import('./KarnatakaMap'))

export default function DistrictExplorer() {
  const [districts, setDistricts] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getDistricts()
      .then((data) => {
        if (!isMounted) return
        setDistricts(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load district data.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const selectedDistrict = districts.find((d) => d.id === selectedId) ?? null

  return (
    <section className="bg-brand-surface px-4 py-12 md:px-8">
      <h2 className="text-center text-2xl font-bold text-brand-dark md:text-3xl">
        Spotlight on Karnataka's District Exports
      </h2>

      {isLoading && <p className="mt-8 text-center">Loading district data…</p>}
      {error && <p className="mt-8 text-center text-red-600">{error}</p>}

      {!isLoading && !error && (
        <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-8 md:flex-row">
          <div className="md:w-1/2">
            <Suspense fallback={<p className="text-center">Loading map…</p>}>
              <KarnatakaMap selectedId={selectedId} onSelect={setSelectedId} />
            </Suspense>
          </div>
          <div className="md:w-1/2">
            <DistrictPanel district={selectedDistrict} />
          </div>
        </div>
      )}
    </section>
  )
}
