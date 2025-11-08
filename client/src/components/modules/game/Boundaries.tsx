import type { PropsWithRoom } from '@hooks'
import { CuboidCollider } from '@react-three/rapier'
import type { GameState } from '@schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'

export function Boundaries({ room }: PropsWithRoom<GameState>) {
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [unit, setUnit] = useState<number>(0)
  const [gap, setGap] = useState<number>(0)

  const wallHeight = 3
  const wallThickness = 0.1
  const [verticalWallWidth, setVerticalWallWidth] = useState(0)
  const [verticalWallPosition, setVerticalWallPosition] = useState(0)
  const [horizontalWallWidth, setHorizontalWallWidth] = useState(0)
  const [horizontalWallPosition, setHorizontalWallPosition] = useState(0)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('width', setWidth)
    $(room.state).listen('height', setHeight)
    $(room.state).listen('unit', setUnit)
    $(room.state).listen('gap', setGap)
  }, [room])

  useEffect(() => {
    const horizontalWallWidth = width * (unit + gap)
    const verticalWallWidth = height * (unit + gap)

    setHorizontalWallWidth(horizontalWallWidth)
    setVerticalWallWidth(verticalWallWidth)

    setVerticalWallPosition(horizontalWallWidth * 0.5 + wallThickness)
    setHorizontalWallPosition(verticalWallWidth * 0.5 + wallThickness)
  }, [width, height, unit, gap])

  return (
    <>
      {/* Vertical Boundaries */}
      <CuboidCollider
        restitution={0}
        friction={0}
        args={[wallThickness, wallHeight, verticalWallWidth * 0.5]}
        position={[verticalWallPosition, wallHeight, 0]}
      />
      <CuboidCollider
        restitution={0}
        friction={0}
        args={[wallThickness, wallHeight, verticalWallWidth * 0.5]}
        position={[-verticalWallPosition, wallHeight, 0]}
      />

      {/* Horizontal Boundaries */}
      <CuboidCollider
        restitution={0}
        friction={0}
        args={[horizontalWallWidth * 0.5, wallHeight, wallThickness]}
        position={[0, wallHeight, horizontalWallPosition]}
      />
      <CuboidCollider
        restitution={0}
        friction={0}
        args={[horizontalWallWidth * 0.5, wallHeight, wallThickness]}
        position={[0, wallHeight, -horizontalWallPosition]}
      />
    </>
  )
}
