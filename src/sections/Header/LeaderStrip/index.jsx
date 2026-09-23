import { useEffect, useState } from 'react'
import { getLeaders } from '../../../api/leadersApi'
import { getBilingualText } from '../../../lib/bilingual'

export default function LeaderStrip() {
  const [leaders, setLeaders] = useState([])

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

  return (
    <div className="flex gap-4 overflow-x-auto sm:gap-6">
      {leaders.map((leader) => {
        const name = getBilingualText(leader.name, 'en')
        const designation = getBilingualText(leader.designation, 'en')
        return (
          <div key={leader.id} className="flex shrink-0 items-center gap-3">
            {leader.photo ? (
              <img
                src={leader.photo}
                alt={name}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-page text-sm font-semibold text-brand-navy">
                {name.charAt(0)}
              </span>
            )}
            <div className="max-w-[220px]">
              <p className="font-semibold text-brand-dark">{name}</p>
              <p className="text-sm text-gray-600">{designation}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
