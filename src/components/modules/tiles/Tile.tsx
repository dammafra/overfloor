import { animatable, COLORS } from '@utils'
import { a } from '@react-spring/three'
import { Float } from '@react-three/drei'
import type { JSX } from 'react'
import type { ColorRepresentation } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// shared by every tile, never disposed: built once rather than on every mount (as drei's
// `RoundedBoxGeometry` component does), and the grid tiles mount again at every loop of the match
const TILE_GEOMETRY = new RoundedBoxGeometry(1, 0.25, 1, 4, 0.1)

export type TileProps = JSX.IntrinsicElements['object3D'] & {
  color?: ColorRepresentation
  opacity?: number
  float?: boolean
  rotate?: boolean
}

function _Tile({
  color = COLORS.tile,
  opacity = 0.9,
  float = true,
  rotate = false,
  children,
  ...props
}: TileProps) {
  return (
    <Float
      floatIntensity={0.5}
      speed={rotate ? 0.1 : float ? 5 : 0}
      rotationIntensity={rotate ? 5 : 0}
    >
      <a.mesh geometry={TILE_GEOMETRY} {...props}>
        <a.meshStandardMaterial color={color} transparent opacity={opacity} roughness={0} />
        {children}
      </a.mesh>
    </Float>
  )
}

export const Tile = animatable(_Tile)
