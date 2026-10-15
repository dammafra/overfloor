import { useEffect, useState } from 'react'

const isDebug = () => import.meta.env.MODE === 'development' || window.location.hash === '#debug'

export function useDebug() {
  const [debug, setDebug] = useState(isDebug)

  useEffect(() => {
    const handler = () => setDebug(isDebug())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  return debug
}
