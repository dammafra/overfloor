import type { Vector3Tuple } from 'three'

export const GameLoopPhase = {
  IDLE: 0,
  COUNTDOWN_3: 1,
  COUNTDOWN_2: 2,
  COUNTDOWN_1: 3,
  FALLING: 4,
} as const

export type GameLoopPhase = (typeof GameLoopPhase)[keyof typeof GameLoopPhase]

export type GameStage = 'lobby' | 'game' | 'ended'

export interface GameConfigSchema {
  practice?: boolean
  countdown?: number
}

export interface LobbySchema {
  canStart: boolean
  countdown: number
}

// from the Playroom profile of the player
export interface PlayerProfileSchema {
  id: string
  username: string
  color: string
}

export interface PlayerSchema extends PlayerProfileSchema {
  position: Vector3Tuple
  spawn: string
}

// player body simulated by the host
export interface PlayerBodySchema {
  spawn: string
  position: Vector3Tuple
}

export interface TileSchema {
  id: string
  position: Vector3Tuple
  targeted: boolean
  disabled: boolean
}

export interface GameLoopSchema {
  loopsCount: number
  phaseDuration: number
}
