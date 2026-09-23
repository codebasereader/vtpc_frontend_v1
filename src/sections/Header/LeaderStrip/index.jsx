import { useEffect, useState } from 'react'
import { getLeaders } from '../../../api/leadersApi'
import { getBilingualText } from '../../../lib/bilingual'
import { useLocale } from '../../../context/LocaleContext'

export default function LeaderStrip() {
  const [leaders, setLeaders] = useState([])
  const { locale } = useLocale()

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
    <div className="flex gap-4 overflow-x-auto sm:gap-8">
      {leaders.map((leader) => {
        // Falls back to English whenever a record's Kannada text hasn't
        // been filled in yet, rather than showing blank.
        const name = getBilingualText(leader.name, locale) || getBilingualText(leader.name, 'en')
        const designation =
          getBilingualText(leader.designation, locale) || getBilingualText(leader.designation, 'en')
        return (
          <div key={leader.id} className="flex shrink-0 items-center gap-3 sm:gap-4">
            {leader.photo ? (
              <img
                src={leader.photo}
                alt={name}
                className="h-16 w-16 shrink-0 rounded-full object-cover sm:h-20 sm:w-20"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-page text-base font-semibold text-brand-navy sm:h-20 sm:w-20 sm:text-lg">
                {name.charAt(0)}
              </span>
            )}
            <div className="max-w-[240px]">
              <p className="text-sm font-semibold text-brand-dark sm:text-base">{name}</p>
              <p className="text-xs text-gray-600 sm:text-sm">{designation}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
