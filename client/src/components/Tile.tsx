import { a } from '@react-spring/three'
import { Float, RoundedBoxGeometry } from '@react-three/drei'
import type { JSX } from 'react'
import type { ColorRepresentation } from 'three'

type TileProps = JSX.IntrinsicElements['mesh'] & {
  color?: ColorRepresentation
}

function _Tile({ color, ...props }: TileProps) {
  return (
    <Float floatIntensity={0.5} speed={5} rotationIntensity={0}>
      <a.mesh {...props}>
        <RoundedBoxGeometry args={[1, 0.25, 1]} radius={0.1} />
        <a.meshStandardMaterial color={color} transparent opacity={0.5} roughness={0} />
      </a.mesh>
    </Float>
  )
}

export const Tile = a(_Tile)
