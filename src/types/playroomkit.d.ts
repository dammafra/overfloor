import 'playroomkit'

declare module 'playroomkit' {
  // Exported by playroomkit but missing from its typings
  export const Multiplayer: {
    (): {
      connection?: unknown
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
