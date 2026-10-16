import 'playroomkit'
import type { PlayerState } from 'playroomkit'

declare module 'playroomkit' {
  // Missing from the typings
  interface PlayerState {
    on(event: 'state', callback: (key: string, value: unknown) => void): () => void
    // internal: drops the player on this client only, as on its `quit`
    disconnect(): void
  }

  // full room state sent by the host
  interface RoomSync {
    __players?: Record<string, unknown>
    waitingPlayers?: string[]
  }

  // Exported by playroomkit but missing from its typings
  export const Multiplayer: {
    (): {
      connection?: {
        myId: string
        // the players known to this client: the host admits them, the others get them from its syncs
        playerStates: Record<string, PlayerState>
        ws?: WebSocket
        // host only: a player run by this client, what `addBot` adds
        addProxyPlayer(): PlayerState | undefined
        on(event: 'sync', callback: (sync: RoomSync) => void): () => void
      }
      on(
        event: 'state',
        callback: (state: Record<string, unknown>, key: string) => void,
      ): () => void
      leaveRoom(): void
    }
    // drops the singleton client, the next call creates a fresh one
    reset(): void
  }
}
