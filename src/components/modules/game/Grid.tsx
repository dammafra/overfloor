import {
  gridTiles,
  menuTileIndex,
  menuTiles,
  Tile,
  type TileMotion,
} from '@components/modules/tiles'
import { useTransition } from '@react-spring/three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { GameLoopPhase, GRID_UNIT } from '@schema'
import { useRoomState } from '@stores'
import { BOUNCY_CONFIG, COLOR_CONFIG, COLORS, DROP_CONFIG, DROP_DEPTH } from '@utils'
import { useEffect, useRef, useState } from 'react'
import type { Vector3Tuple } from 'three'

// first entrance: delay of a tile after the previous one
const GATHER_STAGGER = 10 //ms
// the grid gathered from the menu tiles: the last tiles still landing, the players drop meanwhile
export const GATHER_DURATION = 1000 //ms

export function Grid() {
  const defaultColor = COLORS.tile

  //oxfmt-ignore
  const phaseColors = [
    defaultColor,   // IDLE
    COLORS.go,      // COUNTDOWN_3
    COLORS.ready,   // COUNTDOWN_2
    COLORS.danger,  // COUNTDOWN_1
    defaultColor,   // FALLING
  ]

  const phase = useRoomState(s => s.phase)
  const tiles = useRoomState(s => s.tiles)
  const safeTiles = tiles.filter(
    t => !t.disabled && (phase !== GameLoopPhase.FALLING || !t.targeted),
  )

  // first entrance: the menu tiles spread by the lobby gather into the grid, the rest disappear
  const introRef = useRef(true)
  // floating motion of the menu tiles, by tile id, read by the game tiles when mounting
  const [motions] = useState(() => new Map<string, TileMotion>())
  useEffect(() => {
    if (!tiles.length) return
    introRef.current = false
    motions.clear()
  }, [tiles.length, motions])

  // the menu takes the tiles back while rendering the exit from the game, before this cleanup
  useEffect(() => () => gridTiles.clear(), [])

  const transitions = useTransition(safeTiles, {
    keys: tile => tile.id,
    from: tile => {
      const snapshot = introRef.current
        ? menuTiles.snapshot(menuTileIndex(tile.position))
        : undefined
      if (snapshot?.motion) motions.set(tile.id, snapshot.motion)
      return {
        scale: 0,
        color: defaultColor,
        position: tile.position,
        ...snapshot?.springs,
      }
    },
    // back in place also when entering again while still dropping
    enter: (tile, index) => ({
      scale: GRID_UNIT,
      position: tile.position,
      delay: introRef.current ? index * GATHER_STAGGER : 0,
    }),
    leave: tile => ({
      scale: 0,
      position: tile.position.with(1, tile.position[1] - DROP_DEPTH) as Vector3Tuple,
      config: DROP_CONFIG,
    }),
    update: tile => ({
      color: tile.targeted ? phaseColors[phase] : defaultColor,
      config: COLOR_CONFIG,
    }),
    config: BOUNCY_CONFIG,
  })

  return (
    <>
      {/* meshes */}
      {transitions((spring, tile) => {
        const index = menuTileIndex(tile.position)
        gridTiles.register(index, spring)
        return (
          <Tile
            {...spring}
            motionFrom={motions.get(tile.id)}
            onMotion={gridTiles.motionHandler(index)}
            receiveShadow
          />
        )
      })}

      {/* bodies */}
      {safeTiles.map(tile => (
        <RigidBody key={`body-${tile.id}`} position={tile.position} type="fixed" colliders={false}>
          <CuboidCollider args={[GRID_UNIT * 0.5, 0.3, GRID_UNIT * 0.5]} />
        </RigidBody>
      ))}
    </>
  )
}
