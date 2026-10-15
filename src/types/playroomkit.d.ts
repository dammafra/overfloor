import 'playroomkit'

declare module 'playroomkit' {
  // Exported by playroomkit but missing from its typings
  export function Multiplayer(): {
    on(event: 'state', callback: (state: Record<string, unknown>, key: string) => void): () => void
  }
}
