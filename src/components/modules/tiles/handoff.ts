import type { SpringValue } from '@react-spring/three'
import { GRID_STEP } from '@schema'
import type { Vector3Tuple } from 'three'
import type { TileMotion } from './TileFloat'

// side of the menu grid of tiles
export const MENU_GRID_SIZE = 13

type TileSprings = { position: SpringValue<Vector3Tuple>; scale: SpringValue<number> }

/**
 * Live state of a set of tiles, by menu index: the tiles taking their place carry on from where
 * they are. The game grid takes over the menu tiles spread by the lobby, the menu takes the game
 * tiles back when leaving the game.
 */
function createTileRegistry() {
  const springs = new Map<number, TileSprings>()
  const motions = new Map<number, TileMotion>()
  // stable by index: the motion is registered by the tile mounting, not again at every render by
  // a tile still leaving at the same index
  const motionHandlers = new Map<number, (motion: TileMotion) => void>()

  return {
    register(index: number, tileSprings: TileSprings) {
      springs.set(index, tileSprings)
    },
    // floating motion, also kept across the tiles mounted in turn at an index (e.g. a letter
    // replacing a plain tile)
    motion(index: number) {
      return motions.get(index)
    },
    motionHandler(index: number) {
      let handler = motionHandlers.get(index)
      if (!handler) {
        handler = motion => motions.set(index, motion)
        motionHandlers.set(index, handler)
      }
      return handler
    },
    clear() {
      springs.clear()
      motions.clear()
    },
    // current state of the tile at `index`, a copy: the tile taking over moves on its own
    snapshot(index: number) {
      const tileSprings = springs.get(index)
      if (!tileSprings) return

      const motion = motions.get(index)
      return {
        springs: {
          position: [...tileSprings.position.get()] as Vector3Tuple,
          scale: tileSprings.scale.get(),
        },
        motion: motion && { ...motion },
      }
    },
  }
}

export const menuTiles = createTileRegistry()

// only while the game grid is mounted
export const gridTiles = createTileRegistry()

// menu tile matching the game tile at `position`: the central block of the menu grid, row by row,
// same as the game grid
export function menuTileIndex([x, , z]: Vector3Tuple) {
  const center = (MENU_GRID_SIZE - 1) / 2
  const col = Math.round(x / GRID_STEP + center)
  const row = Math.round(z / GRID_STEP + center)
  return row * MENU_GRID_SIZE + col
}
