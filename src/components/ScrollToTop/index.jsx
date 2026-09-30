import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Resets the scroll position on every route change; hash links (#section)
// are left alone so in-page anchors still work.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
