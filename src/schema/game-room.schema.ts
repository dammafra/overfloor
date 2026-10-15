import type { Vector3Tuple } from 'three'

import { GRID_GAP, GRID_UNIT, gridConfig, type GridDimension } from './grid.schema'

export const GameLoopPhase = {
  IDLE: 0,
  COUNTDOWN_3: 1,
  COUNTDOWN_2: 2,
  COUNTDOWN_1: 3,
  FALLING: 4,
} as const

export type GameLoopPhase = (typeof GameLoopPhase)[keyof typeof GameLoopPhase]

export interface PlayerSchema {
  username: string
  walking: boolean
  position: Vector3Tuple
  rotation: Vector3Tuple
}

export interface TileSchema {
  id: string
  position: Vector3Tuple
  targeted: boolean
  disabled: boolean
}

export interface GameSchema {
  countdown: number
  time: number
  phase: GameLoopPhase

  width: number
  height: number

  players: Map<string, PlayerSchema>
  leaderboard: string[]
  tiles: Array<TileSchema>
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
