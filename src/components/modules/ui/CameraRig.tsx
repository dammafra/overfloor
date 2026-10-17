import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEnteringSmoothTime, useModalRoute } from '@hooks'
import { aspects } from '@utils'
import { useEffect } from 'react'
import { MathUtils } from 'three'

type CameraRigProps = {
  // moving to the menu slower: when loading the app and from the lobby, the tiles moving along
  slow?: boolean
}

export function CameraRig({ slow }: CameraRigProps) {
  const { controls, viewport } = useThree()

  const match = useModalRoute()
  // quick for the menu pages
  const setSmoothTime = useEnteringSmoothTime(slow)

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    setSmoothTime(cameraControls)
    cameraControls.rotateAzimuthTo(MathUtils.degToRad(-135), true)
    cameraControls.rotatePolarTo(MathUtils.degToRad(match ? 0 : 10), true)
    cameraControls.dollyTo(aspects.ui.camera.distance(viewport.aspect), true)
  }, [controls, viewport.aspect, match, setSmoothTime])

  return null
}
