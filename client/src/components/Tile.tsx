import { a } from '@react-spring/three'
import { Float, RoundedBoxGeometry } from '@react-three/drei'
import type { JSX } from 'react'
import type { ColorRepresentation } from 'three'

export type TileProps = JSX.IntrinsicElements['object3D'] & {
  color?: ColorRepresentation
  opacity?: number
  float?: boolean
}

function _Tile({
  color = 'dodgerblue',
  opacity = 0.9,
  float = true,
  children,
  ...props
}: TileProps) {
  return (
    <Float floatIntensity={0.5} speed={float ? 5 : 0} rotationIntensity={0}>
      <a.mesh {...props} receiveShadow>
        <RoundedBoxGeometry args={[1, 0.25, 1]} radius={0.1} />
        <a.meshStandardMaterial color={color} transparent opacity={opacity} roughness={0} />
        {children}
      </a.mesh>
    </Float>
  )
}

export const Tile = a(_Tile)
