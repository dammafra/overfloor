import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Box3, Vector3 } from 'three'
import type { FloorProps } from './Floor'

export function CameraRig({ unit, width, height, gap }: FloorProps) {
  const { controls, size } = useThree()

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    const center = new Vector3()

    const padding = 1
    const xDimension = width * (unit + gap) + padding
    const zDimension = height * (unit + gap) + padding
    const size = new Vector3(xDimension, 1, zDimension)

    const boundingBox = new Box3().setFromCenterAndSize(center, size)

    cameraControls.fitToBox(boundingBox, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
  }, [gap, height, unit, width, controls, size])

  return <></>
}
