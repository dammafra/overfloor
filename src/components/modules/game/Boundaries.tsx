import { useRoomState } from '@stores'
import { CuboidCollider } from '@react-three/rapier'
import { GRID_GAP, GRID_UNIT, gridConfig } from '@schema'
import { useEffect, useState } from 'react'

export function Boundaries() {
  const dimension = useRoomState(s => s.dimension)
  const width = dimension ? gridConfig[dimension].width : 0
  const height = dimension ? gridConfig[dimension].height : 0

  const wallHeight = 3
  const wallThickness = 0.1
  const [verticalWallWidth, setVerticalWallWidth] = useState(0)
  const [verticalWallPosition, setVerticalWallPosition] = useState(0)
  const [horizontalWallWidth, setHorizontalWallWidth] = useState(0)
  const [horizontalWallPosition, setHorizontalWallPosition] = useState(0)

  useEffect(() => {
    const horizontalWallWidth = width * (GRID_UNIT + GRID_GAP)
    const verticalWallWidth = height * (GRID_UNIT + GRID_GAP)

    setHorizontalWallWidth(horizontalWallWidth)
    setVerticalWallWidth(verticalWallWidth)

    setVerticalWallPosition(horizontalWallWidth * 0.5 + wallThickness)
    setHorizontalWallPosition(verticalWallWidth * 0.5 + wallThickness)
  }, [width, height])

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
