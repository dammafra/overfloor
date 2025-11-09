import { ArraySchema, MapSchema } from '@colyseus/schema'
import { GRID_GAP, GRID_UNIT, gridConfig, type GridDimension } from './grid.schema'

export enum GameLoopPhase {
  IDLE,
  COUNTDOWN_3,
  COUNTDOWN_2,
  COUNTDOWN_1,
  FALLING,
}

export interface PlayerSchema {
  username: string
  walking: boolean
  position: ArraySchema<number>
  rotation: ArraySchema<number>
}

export interface TileSchema {
  id: string
  position: ArraySchema<number>
  phase: GameLoopPhase
  targeted: boolean
  falling: boolean
  disabled: boolean
}

export class GameSchema {
  countdown: number
  time: number

  width: number
  height: number

  players: MapSchema<PlayerSchema>
  leaderboard: string[]
  tiles: ArraySchema<TileSchema>
}

export function getGridCoordinates(width: number, height: number): [number, number][] {
  const offsetX = (width - 1) * (GRID_UNIT + GRID_GAP) * 0.5
  const offsetZ = (height - 1) * (GRID_UNIT + GRID_GAP) * 0.5

  const coordinates: [number, number][] = []
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const x = i * (GRID_UNIT + GRID_GAP) - offsetX
      const z = j * (GRID_UNIT + GRID_GAP) - offsetZ
      coordinates.push([x, z])
    }
  }

  return coordinates
}

export function getPlayerInitialPosition(
  index: number,
  dimension: GridDimension,
): [number, number, number] {
  const spacingX = 2
  const spacingY = 1.5
  const rowSize = gridConfig[dimension].playersPerRow
  const row = Math.floor(index / rowSize)
  const positionInRow = index % rowSize

  // zig-zag placement in x
  let x = 0
  if (positionInRow > 0) {
    const n = Math.ceil(positionInRow / 2)
    x = n * spacingX * (positionInRow % 2 === 1 ? -1 : 1)
  }

  // alternate forward/backward along z
  const direction = row % 2 === 0 ? 1 : -1
  const offset = row % 2 === 0 ? 0 : 1
  const z = (row + offset) * spacingY * direction

  const y = 10
  return [x, y, z]
}
