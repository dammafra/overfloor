import { create } from 'zustand'

type GamePhase = 'ready' | 'lobby' | 'countdown' | 'started' | 'ended'

type GameStore = {
  phase: GamePhase
  setPhase: (phase: GamePhase) => void

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

  setPhase: phase => {
    set(() => {
      if (phase === 'ready') return { phase, playersCount: 0, time: 0, leaderboard: [] }
      else return { phase }
    })
  },

  playersCount: 0,
  incrementPlayersCount: () => set(state => ({ playersCount: state.playersCount + 1 })),
  decrementPlayersCount: () => set(state => ({ playersCount: state.playersCount - 1 })),

  time: 0,
  setTime: time => set(() => ({ time })),

  leaderboard: [],
  updateLeaderboard: player => set(state => ({ leaderboard: [player, ...state.leaderboard] })),
}))
