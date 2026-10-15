import { useTransition } from '@react-spring/three'
import { Sparkles } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { aspects, BOUNCY_CONFIG, positions, ROUTES } from '@utils'
import { useRef } from 'react'
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

export function UI() {
  const [matchGame] = useRoute(ROUTES.game)
  const [matchLobby] = useRoute(ROUTES.lobby)
  const match = matchGame || matchLobby

  const { viewport } = useThree()

  const size = matchGame ? 0 : 11
  const tiles = [...Array(size * size).keys()]
  const firstRenderRef = useRef(true)

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
  const getTileType = (index: number) => (match ? 'base' : (roles.get(index)?.type ?? 'base'))
  const getTileIndex = (index: number) => (matchLobby ? undefined : roles.get(index)?.index)

  const transitions = useTransition<number, MenuTileSprings>(tiles, {
    from: (_, i) => ({
      position: getTilePosition(i),
      scale: 0,
    }),
    enter: (_, i) => ({
      scale: 1,
      delay: firstRenderRef.current ? i * 10 : 0,
    }),
    leave: {
      scale: 0,
    },
    update: (_, i) => ({
      position: getTilePosition(i),
      config: { friction: matchLobby ? 150 : 50 },
    }),
    onRest: () => {
      firstRenderRef.current = false
    },
    config: BOUNCY_CONFIG,
  })

  return (
    <>
      {transitions((spring, index) => (
        <MenuTile
          {...spring}
          type={getTileType(index)}
          index={getTileIndex(index)}
          rotate={match}
        />
      ))}

      {!match && <Backdrop />}
      {!match && <Cursor />}
      {!match && <CameraRig />}
      <Sparkles scale={100} count={1000} size={10} />
    </>
  )
}
