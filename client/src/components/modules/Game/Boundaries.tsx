import { CuboidCollider } from '@react-three/rapier'
import type { FloorProps } from './Floor'

export function Boundaries({ unit, width, height, gap }: FloorProps) {
  const wallHeight = 3
  const horizontalWallWidth = width * (unit + gap) * 0.5
  const verticalWallWidth = height * (unit + gap) * 0.5

  const wallThickness = 0.1

  const verticalWallPosition = horizontalWallWidth + wallThickness
  const horizontalWallPosition = verticalWallWidth + wallThickness

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
