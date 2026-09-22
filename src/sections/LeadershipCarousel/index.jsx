import { useEffect, useState } from 'react'
import { getLeaders } from '../../api/leadersApi'

export default function LeadershipCarousel() {
  const [leaders, setLeaders] = useState([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let isMounted = true
    getLeaders()
      .then((data) => {
        if (isMounted) setLeaders(data)
      })
      .catch(() => {
        if (isMounted) setLeaders([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (leaders.length === 0) return null

  const current = leaders[index]

  function goNext() {
    setIndex((i) => (i + 1) % leaders.length)
  }

  function goPrev() {
    setIndex((i) => (i - 1 + leaders.length) % leaders.length)
  }

  return (
    <section className="bg-brand-navy px-4 py-6 text-center text-white md:px-8">
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-4">
        <button type="button" onClick={goPrev} aria-label="Previous" className="px-2 text-xl">
          ‹
        </button>
        <div>
          <h2 className="text-lg font-semibold">{current.name}</h2>
          <p className="text-sm text-white/80">{current.designation.en}</p>
        </div>
        <button type="button" onClick={goNext} aria-label="Next" className="px-2 text-xl">
          ›
        </button>
      </div>
    </section>
  )
}
