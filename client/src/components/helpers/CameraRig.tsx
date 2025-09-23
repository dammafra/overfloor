import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Box3, Vector3, type Object3D } from 'three'
import useGrid from '../../stores/use-grid'

export default function CameraRig() {
  const { controls, size } = useThree()
  const { unit, width, height, gap } = useGrid()
  const target = useRef<Object3D>(null!)

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
  }, [controls, target, size])

  return <></>
}
