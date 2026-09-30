import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Megaphone } from 'lucide-react'
import { getActiveForms } from '../../api/formsApi'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { forms } from '../../language/forms'
import { localText } from '../../lib/forms'

/**
 * Scrolling announcement bar shown under the header menu on the home page.
 * One entry per ACTIVE form: its heading + a "Click here to Register" link to
 * the form page. Renders nothing when there are no active forms.
 * Mirrors the live site's blue ticker (right-to-left, slow, linear, looping).
 */
export default function FormsMarquee() {
  const language = useSelector(selectLanguage)
  const [activeForms, setActiveForms] = useState([])

  useEffect(() => {
    let isMounted = true
    getActiveForms()
      .then((data) => {
        if (isMounted) setActiveForms(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (isMounted) setActiveForms([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (activeForms.length === 0) return null

  // Longer text scrolls for longer so the reading speed stays constant.
  const characters = activeForms.reduce((sum, form) => sum + localText(form.title, language).length, 0)
  const duration = Math.max(20, Math.round((characters + activeForms.length * 24) * 0.22))

  const renderItems = (ariaHidden) =>
    activeForms.map((form) => (
      <span key={form.id || form.slug} className="inline-flex items-center gap-3 pr-16">
        <Megaphone size={15} className="shrink-0 text-brand-gold" aria-hidden="true" />
        <span>{localText(form.title, language)}</span>
        <Link
          to={`/forms/${form.slug}`}
          tabIndex={ariaHidden ? -1 : undefined}
          className="rounded font-semibold text-brand-gold underline underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
        >
          {forms.registerLink[language] || forms.registerLink.en}
        </Link>
      </span>
    ))

  return (
    <div
      role="region"
      aria-label={forms.announcements[language] || forms.announcements.en}
      className="forms-marquee group flex h-12 shrink-0 items-center overflow-hidden bg-brand-navy text-sm text-white sm:text-base"
    >
      {/* Two identical halves; the track slides left by exactly one half for a seamless loop. */}
      <div
        className="forms-marquee-track flex w-max items-center whitespace-nowrap"
        style={{ '--marquee-duration': `${duration}s` }}
      >
        <div className="flex items-center">{renderItems(false)}</div>
        <div className="flex items-center" aria-hidden="true">
          {renderItems(true)}
        </div>
      </div>
    </div>
  )
}
