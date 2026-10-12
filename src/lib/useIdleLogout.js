import { useEffect, useRef, useState } from 'react'
import { getMe } from '../api/authApi'

// The server ends a login after 20 minutes without requests; the browser gets there first
// so people are signed out cleanly (with a warning) instead of on their next click.
const IDLE_LIMIT_MS = 15 * 60 * 1000
const WARNING_MS = 60 * 1000
// While someone is actively using the page, tell the server so their login does not lapse.
const KEEP_ALIVE_MS = 5 * 60 * 1000
const CHECK_MS = 1000
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel']

/**
 * Signs the admin out after a period with no mouse, keyboard or touch activity.
 * Returns the seconds left once the warning period starts, otherwise null.
 */
export function useIdleLogout(onTimeout, enabled = true) {
  const [secondsLeft, setSecondsLeft] = useState(null)
  const lastActivity = useRef(0)
  const lastKeepAlive = useRef(0)
  const onTimeoutRef = useRef(onTimeout)

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    if (!enabled) return undefined
    lastActivity.current = Date.now()
    lastKeepAlive.current = Date.now()

    const markActive = () => {
      lastActivity.current = Date.now()
    }
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, markActive, { passive: true }))

    const timer = setInterval(() => {
      const now = Date.now()
      const idle = now - lastActivity.current
      if (idle >= IDLE_LIMIT_MS) {
        clearInterval(timer)
        setSecondsLeft(null)
        onTimeoutRef.current()
        return
      }
      setSecondsLeft(idle >= IDLE_LIMIT_MS - WARNING_MS ? Math.ceil((IDLE_LIMIT_MS - idle) / 1000) : null)
      if (idle < KEEP_ALIVE_MS && now - lastKeepAlive.current >= KEEP_ALIVE_MS) {
        lastKeepAlive.current = now
        getMe().catch((err) => {
          // Session already gone (expired, or this account signed in somewhere else).
          if (err?.status === 401) onTimeoutRef.current()
        })
      }
    }, CHECK_MS)

    return () => {
      clearInterval(timer)
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, markActive))
    }
  }, [enabled])

  return secondsLeft
}
