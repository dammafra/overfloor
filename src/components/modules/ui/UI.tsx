import { gridTiles, MENU_GRID_SIZE, menuTileIndex, menuTiles } from '@components/modules/tiles'
import { useTransition } from '@react-spring/three'
import { Sparkles } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRoomState } from '@stores'
import { aspects, BOUNCY_CONFIG, positions, ROUTES, SPREAD_CONFIG } from '@utils'
import { useEffect, useRef, useState } from 'react'
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

  const size = matchGame ? 0 : MENU_GRID_SIZE
  const firstRenderRef = useRef(true)
  const prevSizeRef = useRef(size)

  useEffect(() => {
    prevSizeRef.current = size
  }, [size])

  // page shown and the one before, for the transitions between them
  const page = matchGame ? 'game' : matchLobby ? 'lobby' : 'menu'
  const [pages, setPages] = useState<{ current: typeof page; previous?: typeof page }>({
    current: page,
  })
  // new tiles at every exit from the game, never the old ones still leaving: they take the
  // place of the game tiles, or pop in
  const [generation, setGeneration] = useState(0)
  if (pages.current !== page) {
    setPages({ current: page, previous: pages.current })
    if (pages.current === 'game') setGeneration(g => g + 1)
  }

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
  const getPositionConfig = () => (matchLobby ? SPREAD_CONFIG : { friction: 50 })

  const items: MenuTileItem[] = [...Array(size * size).keys()].map(tile => ({
    tile,
    role: roles.get(tile),
  }))

  // keyed by role too: when a resize moves the letters and buttons, the old tile pops out
  // and the new one pops in, instead of switching on the spot
  const transitions = useTransition<MenuTileItem, MenuTileSprings>(items, {
    keys: ({ tile, role }) =>
      role ? `${generation}:${tile}:${role.type}:${role.index}` : `${generation}:${tile}`,
    // from the game tile at the same place when leaving the game
    from: ({ tile }) =>
      gridTiles.snapshot(tile)?.springs ?? { position: getTilePosition(tile), scale: 0 },
    enter: ({ tile }) => ({
      scale: 1,
      position: getTilePosition(tile),
      // same grid as before: it replaces a tile whose role changed, once that one is out
      delay: firstRenderRef.current ? tile * 10 : prevSizeRef.current === size ? 200 : 0,
      // popping in, moving to its place as in the updates
      config: (key: string) => (key === 'position' ? getPositionConfig() : BOUNCY_CONFIG),
    }),
    // the tiles taken over by the game grid go at once, it moves them from here; the rest shrink
    leave: ({ tile }) => {
      const grid = useRoomState.getState().tiles
      const handedOver = matchGame && grid.some(t => menuTileIndex(t.position) === tile)
      return { scale: 0, immediate: handedOver }
    },
    update: ({ tile }) => ({
      position: getTilePosition(tile),
      config: getPositionConfig(),
    }),
    onRest: () => {
      firstRenderRef.current = false
    },
    config: BOUNCY_CONFIG,
  })

  return (
    <>
      {transitions((spring, { tile, role }) => {
        menuTiles.register(tile, spring)
        return (
          <MenuTile
            {...spring}
            type={getTileType(role)}
            index={getTileIndex(role)}
            rotate={match}
            motionFrom={gridTiles.motion(tile) ?? menuTiles.motion(tile)}
            onMotion={menuTiles.motionHandler(tile)}
          />
        )
      })}

      {!match && <Backdrop />}
      {!match && <Cursor />}
      {!match && <CameraRig slow={pages.previous !== 'game'} />}
      <Sparkles scale={100} count={1000} size={10} />
    </>
  )
}
