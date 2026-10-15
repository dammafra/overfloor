import type { PropsWithRoom } from '@hooks'
import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { GRID_GAP, GRID_UNIT, type GameSchema } from '@schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { Box3, Vector3 } from 'three'

export function CameraRig({ room }: PropsWithRoom<GameSchema>) {
  const { controls, size } = useThree()

  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('width', setWidth)
    $(room.state).listen('height', setHeight)
  }, [room])

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
