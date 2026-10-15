import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { aspects } from '@utils'
import { useEffect } from 'react'
import { MathUtils } from 'three'
import { useRoute } from 'wouter'

export function CameraRig() {
  const { controls, viewport } = useThree()

  const [matchNew] = useRoute('/new')
  const [matchJoin] = useRoute('/join/:id?')
  const [matchCredits] = useRoute('/credits')
  const match = matchNew || matchJoin || matchCredits

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    cameraControls.rotateAzimuthTo(MathUtils.degToRad(-135), true)
    cameraControls.rotatePolarTo(MathUtils.degToRad(match ? 0 : 10), true)
    cameraControls.dollyTo(aspects.ui.camera.distance(viewport.aspect), true)
  }, [controls, viewport.aspect, match])

  return <></>
}
