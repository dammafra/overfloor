import { useDebug } from '@hooks'
import { CameraControls, RoundedBoxGeometry } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { CuboidCollider, InstancedRigidBodies, RapierRigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import { Box3, Vector3 } from 'three'

interface FloorTileInstance {
  key: string
  position: [number, number, number]
}

interface FloorProps {
  unit: number
  width: number
  height: number
  gap: number
}

export function Floor({ unit, width, height, gap }: FloorProps) {
  const debug = useDebug()
  const { controls, size } = useThree()
  const instancedBodies = useRef<RapierRigidBody[]>(null)

  const instances = useMemo(() => {
    const tiles: FloorTileInstance[] = []

    const halfWidth = Math.floor(width / 2)
    const halfHeight = Math.floor(height / 2)

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        tiles.push({
          key: `${i}-${j}`,
          position: [(i - halfWidth) * (unit + gap), 0, (j - halfHeight) * (unit + gap)],
        })
      }
    }

    return tiles
  }, [height, width, unit, gap])

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

  return (
    <>
      <InstancedRigidBodies
        ref={instancedBodies}
        colliders="cuboid"
        type="kinematicVelocity"
        instances={instances}
      >
        <instancedMesh
          receiveShadow
          userData={{ name: 'floor' }}
          args={[undefined, undefined, width * height]}
        >
          <RoundedBoxGeometry args={[unit, 0.25, unit]} radius={0.1} />
          <meshStandardMaterial color="dodgerblue" />
        </instancedMesh>
      </InstancedRigidBodies>
      {debug && <Boundaries {...{ unit, width, height, gap }} />}
    </>
  )
}

function Boundaries({ unit, width, height, gap }: FloorProps) {
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
