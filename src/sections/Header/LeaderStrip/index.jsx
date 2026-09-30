import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getLeaders } from '../../../api/leadersApi'
import { getBilingualText } from '../../../lib/bilingual'
import { selectLanguage } from '../../../redux/slices/localeSlice'

export default function LeaderStrip() {
  const [leaders, setLeaders] = useState([])
  const locale = useSelector(selectLanguage)

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
    <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:gap-8 sm:overflow-x-auto">
      {leaders.map((leader) => {
        // Falls back to English whenever a record's Kannada text hasn't
        // been filled in yet, rather than showing blank.
        const name = getBilingualText(leader.name, locale) || getBilingualText(leader.name, 'en')
        const designation =
          getBilingualText(leader.designation, locale) || getBilingualText(leader.designation, 'en')
        return (
          <div
            key={leader.id}
            className="flex w-full shrink-0 items-center gap-3 rounded-xl border border-brand-divider bg-brand-page/50 p-3 sm:gap-4 sm:w-auto sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0"
          >
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
            <div className="min-w-0 sm:max-w-[240px]">
              <p className="text-sm font-semibold text-brand-dark sm:text-base">{name}</p>
              <p className="text-xs text-gray-600 sm:text-sm">{designation}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
