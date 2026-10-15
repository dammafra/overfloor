import { useRoomState } from '@stores'
import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { GRID_GAP, GRID_UNIT, gridConfig } from '@schema'
import { useEffect } from 'react'
import { Box3, Vector3 } from 'three'

export function CameraRig() {
  const { controls, size } = useThree()

  const dimension = useRoomState(s => s.dimension)
  const width = dimension ? gridConfig[dimension].width : 0
  const height = dimension ? gridConfig[dimension].height : 0

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    const center = new Vector3()

    const padding = 1
    const xDimension = width * (GRID_UNIT + GRID_GAP) + padding
    const zDimension = height * (GRID_UNIT + GRID_GAP) + padding
    const size = new Vector3(xDimension, 1, zDimension)

    const boundingBox = new Box3().setFromCenterAndSize(center, size)

    cameraControls.fitToBox(boundingBox, true)
    cameraControls.rotateAzimuthTo(0, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
  }, [height, width, controls, size])

  return <></>
}
