import { useRoomState } from '@stores'

export type GamePhase = 'ready' | 'lobby' | 'countdown' | 'started' | 'ended'

// Derived from the Playroom room state
export function useGamePhase(): GamePhase {
  return useRoomState(({ stage, countdown }) => {
    if (stage === 'lobby' || stage === 'ended') return stage
    if (stage === 'game') return countdown !== null && countdown <= 0 ? 'started' : 'countdown'
    return 'ready'
  })
}
