import { useSyncExternalStore } from 'react'

const QUERY = '(pointer: coarse)'

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(QUERY)
  mediaQuery.addEventListener('change', callback)
  return () => mediaQuery.removeEventListener('change', callback)
}

const getSnapshot = () => window.matchMedia(QUERY).matches
const getServerSnapshot = () => false

export function useIsTouch() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
