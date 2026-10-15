import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useModalRoute } from '@hooks'
import { aspects } from '@utils'
import { useEffect } from 'react'
import { MathUtils } from 'three'

export function CameraRig() {
  const { controls, viewport } = useThree()

  const match = useModalRoute()

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    cameraControls.rotateAzimuthTo(MathUtils.degToRad(-135), true)
    cameraControls.rotatePolarTo(MathUtils.degToRad(match ? 0 : 10), true)
    cameraControls.dollyTo(aspects.ui.camera.distance(viewport.aspect), true)
  }, [controls, viewport.aspect, match])

  return null
}
