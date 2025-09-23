import { RoundedBoxGeometry } from '@react-three/drei'
import { InstancedRigidBodies, RapierRigidBody } from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import useGrid from '../stores/use-grid'

interface FloorTileInstance {
  key: string
  position: [number, number, number]
}

export default function Floor() {
  const { unit, width, height, gap } = useGrid()
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

  return (
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
  )
}
