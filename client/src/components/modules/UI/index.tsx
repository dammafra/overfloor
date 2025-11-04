import { useTransition } from '@react-spring/three'
import { useThree } from '@react-three/fiber'
import { aspects, positions } from '@utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Vector3Tuple } from 'three'
import { useRoute } from 'wouter'
import { Backdrop } from './Backdrop'
import { CameraRig } from './CameraRig'
import { Cursor } from './Cursor'
import { MenuTile, type MenuTileProps } from './MenuTile'

interface UISpringProps {
  position: Vector3Tuple
  scale: number
}

export function UI() {
  const [matchGame] = useRoute(/game/)
  const [matchLobby] = useRoute(/lobby/)
  const match = matchGame || matchLobby
  const { viewport } = useThree()

  const [size] = useState(11)
  const [tiles, setTiles] = useState<MenuTileProps[]>([])
  const firstRenderRef = useRef(true)

  const buttonIndices = useMemo(
    () => aspects.ui.tile.button.indices(size, viewport.aspect),
    [size, viewport.aspect],
  )

  const lettersIndices = useMemo(
    () => aspects.ui.tile.letter.indices(size, viewport.aspect),
    [size, viewport.aspect],
  )

  const getTileProps = useCallback(
    (index: number): MenuTileProps => {
      if (matchLobby) return { type: 'base', rotate: true }
      if (buttonIndices.includes(index))
        return { type: 'button', index: buttonIndices.indexOf(index) }
      if (lettersIndices.includes(index))
        return { type: 'letter', index: lettersIndices.indexOf(index) }

      return { type: 'base' }
    },
    [buttonIndices, lettersIndices, matchLobby],
  )

  const getTilePosition = useCallback(
    (index: number) => (matchLobby ? positions.lobby.tile(index) : positions.ui.tile(index, size)),
    [size, matchLobby],
  )

  const initTiles = useCallback(
    () => Array.from({ length: size * size }, (_, index) => getTileProps(index)),
    [size, getTileProps],
  )

  const updateTiles = useCallback(
    (tiles: MenuTileProps[]) =>
      tiles.map((t, i) => {
        const { type, index, rotate } = getTileProps(i)
        t.type = type
        t.index = index
        t.rotate = rotate
        return t
      }),
    [getTileProps],
  )

  useEffect(() => {
    setTiles(tiles => {
      if (matchGame) return []
      return tiles.length ? updateTiles(tiles) : initTiles()
    })
  }, [matchGame, updateTiles, initTiles])

  const transitions = useTransition<MenuTileProps, UISpringProps>(tiles, {
    from: (_, i) => ({
      position: getTilePosition(i),
      scale: 0,
    }),
    enter: (_, i) => ({
      scale: 1,
      delay: firstRenderRef.current ? i * 10 : 0,
    }),
    leave: () => ({
      scale: 0,
      config: { tension: 0 },
    }),
    update: (_, i) => ({
      position: getTilePosition(i),
      config: { friction: matchLobby ? 150 : 50 },
    }),
    onRest: () => {
      firstRenderRef.current = false
    },
    config: { mass: 1, tension: 120, friction: 15 },
  })

  return (
    <>
      {transitions((spring, props, _, i) => (
        <MenuTile
          key={`menu-tile-${i}`}
          {...props}
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
