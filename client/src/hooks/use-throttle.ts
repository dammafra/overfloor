import { useCallback, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottle<F extends (...args: any[]) => any>(fn: F, delay: number = 0) {
  const lastCallRef = useRef(0)

  return useCallback(
    (...args: Parameters<F>): ReturnType<F> | undefined => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        return fn(...args)
      }
    },
    [fn, delay],
  ) as F
}
