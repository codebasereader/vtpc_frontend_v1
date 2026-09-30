import { useEffect, useState } from 'react'

/**
 * Keeps an element mounted long enough to play its exit transition.
 * `mounted` → render the element; `visible` → apply the "open" classes.
 * `visible` flips one frame after mounting so the enter transition runs.
 */
export function useExitTransition(isOpen, duration = 250) {
  const [mounted, setMounted] = useState(isOpen)
  const [entered, setEntered] = useState(false)

  // Derived-state update during render (the sanctioned way to react to a prop change).
  if (isOpen && !mounted) setMounted(true)

  useEffect(() => {
    if (isOpen) {
      let inner
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setEntered(true))
      })
      return () => {
        cancelAnimationFrame(outer)
        cancelAnimationFrame(inner)
      }
    }
    const timer = setTimeout(() => {
      setMounted(false)
      setEntered(false)
    }, duration)
    return () => clearTimeout(timer)
  }, [isOpen, duration])

  return { mounted: mounted || isOpen, visible: isOpen && entered }
}
