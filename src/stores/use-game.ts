import { create } from 'zustand'

type GamePhase = 'ready' | 'lobby' | 'countdown' | 'started' | 'ended'

type GameStore = {
  phase: GamePhase
  setPhase: (phase: GamePhase) => void
}

export const useGame = create<GameStore>()(set => ({
  phase: 'ready',
  setPhase: phase => set(() => ({ phase })),
}))
