import { Dynamic } from '@components/helpers'
import { Tile } from '@components/Tile'
import { useMenuTiles, type MenuTileProps } from '@hooks'
import { useTransition } from '@react-spring/three'
import { useRef } from 'react'
import type { Vector3Tuple } from 'three'
import { useRoute } from 'wouter'
import { Backdrop } from './Backdrop'
import { ButtonTile } from './ButtonTile'
import { CameraRig } from './CameraRig'
import { Cursor } from './Cursor'
import { LetterTile } from './LetterTile'

interface UISpringProps {
  position: Vector3Tuple
  scale: number
}

export function UI() {
  const [match] = useRoute(/game|lobby/)
  const tiles = useMenuTiles()
  const firstRenderRef = useRef(true)

  const transitions = useTransition<MenuTileProps, UISpringProps>(tiles, {
    from: tile => ({
      position: tile.position,
      scale: 0,
    }),
    enter: (_, i) => ({
      scale: 1,
      delay: firstRenderRef.current ? i * 10 : 0,
    }),
    leave: () => ({
      scale: 0,
    }),
    onRest: () => {
      firstRenderRef.current = false
    },
    config: { mass: 1, tension: 120, friction: 14 },
  })

  return (
    <>
      {transitions((spring, { type, index }) => (
        <Dynamic
          key={`menu-tile-${type}-${index}`}
          component={type === 'button' ? ButtonTile : type === 'letter' ? LetterTile : Tile}
          index={index}
          position={spring.position}
          scale={spring.scale}
        />
      ))}

      {!match && <Backdrop />}
      {!match && <Cursor />}
      {!match && <CameraRig />}
    </>
  )
}
