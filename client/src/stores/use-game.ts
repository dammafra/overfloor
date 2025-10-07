import { create } from 'zustand'

type MenuSection = 'main' | 'tutorial' | 'credits' | 'game-over' | 'pause'
type GamePhase = 'ready' | 'started' | 'paused' | 'ended'

type GameStore = {
  phase: GamePhase

  start: () => void
  pause: () => void
  resume: () => void
  end: () => void

  menu?: MenuSection
  setMenu: (menu?: MenuSection) => void
}

export const useGame = create<GameStore>()(set => ({
  phase: 'ready',

  start: () => {
    set(state => {
      if (state.phase === 'ready' || state.phase === 'ended') {
        return {
          phase: 'started',
          menu: undefined,
        }
      }

      return {}
    })
  },

  pause: () => set(() => ({ phase: 'paused' })),
  resume: () => set(() => ({ phase: 'started' })),

  end: () => {
    set(state => {
      if (state.phase !== 'ended') {
        return {
          phase: 'ended',
          menu: 'game-over',
        }
      }

      return {}
    })
  },

  menu: 'main',
  setMenu: menu => set(() => ({ menu })),
}))
