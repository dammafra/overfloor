import { useEffect } from 'react'
import { useLocation } from 'wouter'

// goes to `to` on Escape, while enabled
export function useEscape(to: string, enabled = true) {
  const [, navigate] = useLocation()

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(to)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [to, enabled, navigate])
}
