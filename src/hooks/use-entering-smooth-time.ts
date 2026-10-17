import type { CameraControls } from '@react-three/drei'
import { setCameraSmoothTime } from '@utils'
import { useCallback, useRef } from 'react'

/**
 * Sets the camera speed before a camera rig moves it: slower for its first move, entering its
 * page, if `slow`, quick for the next ones.
 */
export function useEnteringSmoothTime(slow = false) {
  const enteringRef = useRef(true)

  return useCallback(
    (controls: CameraControls) => {
      setCameraSmoothTime(controls, enteringRef.current && slow)
      enteringRef.current = false
    },
    [slow],
  )
}
