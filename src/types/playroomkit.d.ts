import 'playroomkit'
import type { PlayerState } from 'playroomkit'

declare module 'playroomkit' {
  // Missing from the typings
  interface PlayerState {
    on(event: 'state', callback: (key: string, value: unknown) => void): () => void
  }

  // Exported by playroomkit but missing from its typings
  export const Multiplayer: {
    (): {
      connection?: {
        // host only: a player run by this client, what `addBot` adds
        addProxyPlayer(): PlayerState | undefined
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
