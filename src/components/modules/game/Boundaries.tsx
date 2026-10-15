import { CuboidCollider } from '@react-three/rapier'
import { useRoomState } from '@stores'
import { getGridSize } from '@utils'
import type { Vector3Tuple } from 'three'

const WALL_HEIGHT = 3
const WALL_THICKNESS = 0.1

export function Boundaries() {
  const dimension = useRoomState(s => s.dimension)
  const size = getGridSize(dimension)

  const x = size.x * 0.5 + WALL_THICKNESS
  const z = size.z * 0.5 + WALL_THICKNESS

  const walls: { args: Vector3Tuple; position: Vector3Tuple }[] = [
    { args: [WALL_THICKNESS, WALL_HEIGHT, size.z * 0.5], position: [x, WALL_HEIGHT, 0] },
    { args: [WALL_THICKNESS, WALL_HEIGHT, size.z * 0.5], position: [-x, WALL_HEIGHT, 0] },
    { args: [size.x * 0.5, WALL_HEIGHT, WALL_THICKNESS], position: [0, WALL_HEIGHT, z] },
    { args: [size.x * 0.5, WALL_HEIGHT, WALL_THICKNESS], position: [0, WALL_HEIGHT, -z] },
  ]

  return walls.map((wall, i) => <CuboidCollider key={i} restitution={0} friction={0} {...wall} />)
}
