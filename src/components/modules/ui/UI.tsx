import { useTransition } from '@react-spring/three'
import { Sparkles } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { aspects, BOUNCY_CONFIG, positions, ROUTES } from '@utils'
import { useEffect, useRef } from 'react'
import { type Vector3Tuple } from 'three'
import { useRoute } from 'wouter'
import { Backdrop } from './Backdrop'
import { CameraRig } from './CameraRig'
import { Cursor } from './Cursor'
import { MenuTile, type MenuTileProps } from './MenuTile'

type MenuTileSprings = {
  position: Vector3Tuple
  scale: number
  rotate: boolean
  type: MenuTileProps['type']
  index?: number
}

type TileRole = Pick<MenuTileSprings, 'type' | 'index'>

type MenuTileItem = { tile: number; role?: TileRole }

export function UI() {
  const [matchGame] = useRoute(ROUTES.game)
  const [matchLobby] = useRoute(ROUTES.lobby)
  const match = matchGame || matchLobby

  const { viewport } = useThree()

  const size = matchGame ? 0 : 13
  const firstRenderRef = useRef(true)
  const prevSizeRef = useRef(size)

  useEffect(() => {
    prevSizeRef.current = size
  }, [size])

  // menu role of each tile, by grid index
  const roles = new Map<number, TileRole>()
  aspects.ui.tile.letter
    .indices(size, viewport.aspect)
    .forEach((tile, index) => roles.set(tile, { type: 'letter', index }))
  aspects.ui.tile.button
    .indices(size, viewport.aspect)
    .forEach((tile, index) => roles.set(tile, { type: 'button', index }))

  const getTilePosition = (index: number) =>
    matchLobby ? positions.lobby.tile(index) : positions.ui.tile(index, size)
  const getTileType = (role?: TileRole) => (match ? 'base' : (role?.type ?? 'base'))
  const getTileIndex = (role?: TileRole) => (matchLobby ? undefined : role?.index)

  const items: MenuTileItem[] = [...Array(size * size).keys()].map(tile => ({
    tile,
    role: roles.get(tile),
  }))

  // keyed by role too: when a resize moves the letters and buttons, the old tile pops out
  // and the new one pops in, instead of switching on the spot
  const transitions = useTransition<MenuTileItem, MenuTileSprings>(items, {
    keys: ({ tile, role }) => (role ? `${tile}:${role.type}:${role.index}` : `${tile}`),
    from: ({ tile }) => ({
      position: getTilePosition(tile),
      scale: 0,
    }),
    enter: ({ tile }) => ({
      scale: 1,
      // same grid as before: it replaces a tile whose role changed, once that one is out
      delay: firstRenderRef.current ? tile * 10 : prevSizeRef.current === size ? 200 : 0,
    }),
    leave: {
      scale: 0,
    },
    update: ({ tile }) => ({
      position: getTilePosition(tile),
      config: { friction: matchLobby ? 150 : 50 },
    }),
    onRest: () => {
      firstRenderRef.current = false
    },
    config: BOUNCY_CONFIG,
  })

  return (
    <>
      {transitions((spring, { role }) => (
        <MenuTile {...spring} type={getTileType(role)} index={getTileIndex(role)} rotate={match} />
      ))}

      {!match && <Backdrop />}
      {!match && <Cursor />}
      {!match && <CameraRig />}
      <Sparkles scale={100} count={1000} size={10} />
    </>
  )
}
