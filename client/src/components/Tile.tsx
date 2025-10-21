import { a } from '@react-spring/three'
import { RoundedBoxGeometry } from '@react-three/drei'
import type { JSX } from 'react'
import { forwardRef } from 'react'
import type { ColorRepresentation, Mesh } from 'three'

type TileProps = JSX.IntrinsicElements['mesh'] & {
  unit?: number
  color?: ColorRepresentation
}

export const Tile = a(
  forwardRef<Mesh, TileProps>(({ unit = 1, color, ...props }, ref) => {
    return (
      <mesh ref={ref} {...props}>
        <RoundedBoxGeometry args={[unit, 0.25, unit]} radius={0.1} />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>
    )
  }),
)
