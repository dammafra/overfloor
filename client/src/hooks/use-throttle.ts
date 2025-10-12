import { useCallback, useRef } from 'react'

export function useThrottle<F extends (...args: any[]) => any>(fn: F, delay: number) {
  const lastCall = useRef(0)

  return useCallback(
    (...args: Parameters<F>): ReturnType<F> | undefined => {
      const now = Date.now()
      if (now - lastCall.current >= delay) {
        lastCall.current = now
        return fn(...args)
      }
    },
    [fn, delay],
  ) as F
}
