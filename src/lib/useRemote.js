import { useEffect, useRef, useState } from 'react'

/**
 * Loads data whenever `key` changes. `isLoading` is derived (no setState in the
 * effect body) and the previous result stays available while the next loads,
 * so lists don't flash empty when filters or pages change.
 */
export function useRemote(key, fetcher) {
  const [result, setResult] = useState({ key: null, data: null, error: '' })
  const fetcherRef = useRef(fetcher)

  // Declared before the loading effect so the latest fetcher is in place when it runs.
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let isLive = true
    fetcherRef
      .current()
      .then((data) => {
        if (isLive) setResult({ key, data, error: '' })
      })
      .catch((err) => {
        if (isLive) setResult({ key, data: null, error: err?.message || 'Something went wrong.' })
      })
    return () => {
      isLive = false
    }
  }, [key])

  return { data: result.data, error: result.key === key ? result.error : '', isLoading: result.key !== key }
}
