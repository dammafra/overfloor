import { create } from 'zustand'

type GamePhase = 'ready' | 'started' | 'ended'

type GameStore = {
  phase: GamePhase
  ready: () => void
  start: () => void
  end: () => void

  playersCount: number
  incrementPlayersCount: () => void
  decrementPlayersCount: () => void

  time: number
  setTime: (time?: number) => void

  leaderboard: string[]
  updateLeaderboard: (player: string) => void
}

export const useGame = create<GameStore>()(set => ({
  phase: 'ready',

  ready: () => set(() => ({ phase: 'ready', playersCount: 0, time: 0, leaderboard: [] })),
  start: () => set(() => ({ phase: 'started' })),
  end: () => set(() => ({ phase: 'ended' })),

  playersCount: 0,
  incrementPlayersCount: () => set(state => ({ playersCount: state.playersCount + 1 })),
  decrementPlayersCount: () => set(state => ({ playersCount: state.playersCount - 1 })),

  time: 0,
  setTime: time => set(() => ({ time })),

  leaderboard: [],
  updateLeaderboard: player => set(state => ({ leaderboard: [player, ...state.leaderboard] })),
}))
