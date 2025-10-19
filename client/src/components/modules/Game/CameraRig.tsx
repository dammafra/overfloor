import type { PropsWithRoom } from '@hooks'
import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { GameState } from '@server/schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { Box3, Vector3 } from 'three'

export function CameraRig({ room }: PropsWithRoom<GameState>) {
  const { controls, size } = useThree()

  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [unit, setUnit] = useState<number>(0)
  const [gap, setGap] = useState<number>(0)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('grid', grid => {
      setWidth(grid.width)
      setHeight(grid.height)
      setUnit(grid.unit)
      setGap(grid.gap)
    })
  }, [room])

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
