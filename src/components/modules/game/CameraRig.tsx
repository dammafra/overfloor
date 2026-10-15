import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRoomState } from '@stores'
import { getGridSize } from '@utils'
import { useEffect } from 'react'
import { Box3, Vector3 } from 'three'

const PADDING = 1

export function CameraRig() {
  const { controls, size } = useThree()

  const dimension = useRoomState(s => s.dimension)
  const { x, z } = getGridSize(dimension)

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    const boundingBox = new Box3().setFromCenterAndSize(
      new Vector3(),
      new Vector3(x + PADDING, 1, z + PADDING),
    )

    cameraControls.fitToBox(boundingBox, true)
    cameraControls.rotateAzimuthTo(0, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
  }, [x, z, controls, size])

  return null
}
