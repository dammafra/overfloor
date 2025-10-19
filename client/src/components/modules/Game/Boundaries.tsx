import type { PropsWithRoom } from '@hooks'
import { CuboidCollider } from '@react-three/rapier'
import type { GameState } from '@server/schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'

export function Boundaries({ room }: PropsWithRoom<GameState>) {
  const wallHeight = 3
  const wallThickness = 0.1

  const [verticalWallWidth, setVerticalWallWidth] = useState(0)
  const [verticalWallPosition, setVerticalWallPosition] = useState(0)

  const [horizontalWallWidth, setHorizontalWallWidth] = useState(0)
  const [horizontalWallPosition, setHorizontalWallPosition] = useState(0)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('grid', grid => {
      setHorizontalWallWidth(grid.width * (grid.unit + grid.gap) * 0.5)
      setVerticalWallWidth(grid.height * (grid.unit + grid.gap) * 0.5)
    })
  }, [room])

  useEffect(() => {
    setVerticalWallPosition(horizontalWallWidth + wallThickness)
    setHorizontalWallPosition(verticalWallWidth + wallThickness)
  }, [horizontalWallWidth, verticalWallWidth])

  return (
    <>
      {/* Vertical Boundaries */}
      <CuboidCollider
        restitution={0}
        friction={0}
        args={[wallThickness, wallHeight, verticalWallWidth]}
        position={[verticalWallPosition, wallHeight, 0]}
      />
      <CuboidCollider
        restitution={0}
        friction={0}
        args={[wallThickness, wallHeight, verticalWallWidth]}
        position={[-verticalWallPosition, wallHeight, 0]}
      />

      {/* Horizontal Boundaries */}
      <CuboidCollider
        restitution={0}
        friction={0}
        args={[horizontalWallWidth, wallHeight, wallThickness]}
        position={[0, wallHeight, horizontalWallPosition]}
      />
      <CuboidCollider
        restitution={0}
        friction={0}
        args={[horizontalWallWidth, wallHeight, wallThickness]}
        position={[0, wallHeight, -horizontalWallPosition]}
      />
    </>
  )
}
