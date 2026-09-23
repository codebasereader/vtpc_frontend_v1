import { lazy, Suspense, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { MapPin } from 'lucide-react'
import { getDistricts } from '../../api/districtsApi'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { home } from '../../language/home'
import DistrictPanel from './DistrictPanel'

const KarnatakaMap = lazy(() => import('./KarnatakaMap'))

export default function DistrictExplorer() {
  const language = useSelector(selectLanguage)
  const t = home.districtExplorer
  const [districts, setDistricts] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true
    getDistricts()
      .then((data) => {
        if (!isMounted) return
        setDistricts(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch((err) => {
        if (!isMounted) return
        setErrorMessage(err.message || '')
        setHasError(true)
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
    <section className="bg-brand-surface px-4 py-14 md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-primary shadow-[0_4px_12px_rgba(200,55,68,0.15)]">
            <MapPin size={20} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-navy-dark md:text-4xl">{t.title[language]}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
            {t.description[language]}
          </p>
        </div>

        {isLoading && <p className="mt-10 text-center">{t.loading[language]}</p>}
        {hasError && (
          <p className="mt-10 text-center text-red-600">{errorMessage || t.loadFailed[language]}</p>
        )}

        {!isLoading && !hasError && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,40,80,0.06)] sm:p-6">
              <Suspense fallback={<p className="text-center">{t.loadingMap[language]}</p>}>
                <KarnatakaMap selectedId={selectedId} onSelect={setSelectedId} />
              </Suspense>
            </div>
            <DistrictPanel district={selectedDistrict} />
          </div>
        )}
      </div>
    </section>
  )
}
