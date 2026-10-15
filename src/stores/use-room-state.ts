import {
  GameLoopPhase,
  type GameStage,
  type GridDimension,
  type LobbySchema,
  type PlayerSchema,
  type TileSchema,
} from '@schema'
import { create } from 'zustand'

// Mirror of the Playroom room state, kept in sync by the multiplayer session
export type RoomState = {
  stage?: GameStage
  lobby?: LobbySchema
  countdown: number | null
  time: number
  phase: GameLoopPhase
  dimension?: GridDimension
  tiles: TileSchema[]
  players: PlayerSchema[]
  leaderboard: string[]
}

export const initialRoomState: RoomState = {
  stage: undefined,
  lobby: undefined,
  countdown: null,
  time: 0,
  phase: GameLoopPhase.IDLE,
  dimension: undefined,
  tiles: [],
  players: [],
  leaderboard: [],
}

export const useRoomState = create<RoomState>()(() => initialRoomState)
