import { isTouchDevice, TOUCH_QUERY } from '@utils'
import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(TOUCH_QUERY)
  mediaQuery.addEventListener('change', callback)
  return () => mediaQuery.removeEventListener('change', callback)
}

const getSnapshot = isTouchDevice
const getServerSnapshot = () => false

export function useIsTouch() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
