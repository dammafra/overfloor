import { useDebug } from '@hooks'
import { RoundedBoxGeometry } from '@react-three/drei'
import { InstancedRigidBodies, RapierRigidBody } from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import { Boundaries } from './Boundaries'
import { CameraRig } from './CameraRig'

interface FloorTileInstance {
  key: string
  position: [number, number, number]
}

export interface FloorProps {
  unit: number
  width: number
  height: number
  gap: number
}

export function Floor({ unit, width, height, gap }: FloorProps) {
  const debug = useDebug()
  const instancedBodiesRef = useRef<RapierRigidBody[]>(null)

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

  return (
    <>
      <InstancedRigidBodies
        ref={instancedBodiesRef}
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
      <CameraRig {...{ unit, width, height, gap }} />
      {debug && <Boundaries {...{ unit, width, height, gap }} />}
    </>
  )
}
