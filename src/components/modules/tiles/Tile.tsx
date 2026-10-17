import { animatable, COLORS } from '@utils'
import { a } from '@react-spring/three'
import type { JSX } from 'react'
import type { ColorRepresentation } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { TileFloat, type TileFloatProps } from './TileFloat'

// shared by every tile, never disposed: built once rather than on every mount (as drei's
// `RoundedBoxGeometry` component does), and the grid tiles mount again at every loop of the match
const TILE_GEOMETRY = new RoundedBoxGeometry(1, 0.25, 1, 4, 0.1)

export type TileProps = JSX.IntrinsicElements['object3D'] &
  Pick<TileFloatProps, 'float' | 'rotate' | 'motionFrom' | 'onMotion'> & {
    color?: ColorRepresentation
    opacity?: number
  }

function _Tile({
  color = COLORS.tile,
  opacity = 0.9,
  float,
  rotate,
  motionFrom,
  onMotion,
  position,
  children,
  ...props
}: TileProps) {
  return (
    <TileFloat
      position={position}
      float={float}
      rotate={rotate}
      motionFrom={motionFrom}
      onMotion={onMotion}
    >
      <a.mesh geometry={TILE_GEOMETRY} {...props}>
        <a.meshStandardMaterial color={color} transparent opacity={opacity} roughness={0} />
        {children}
      </a.mesh>
    </TileFloat>
  )
}

export const Tile = animatable(_Tile)
