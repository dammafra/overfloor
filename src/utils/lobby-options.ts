// Lobby options travel base64-encoded in the lobby route (`/lobby/:options`)
export interface LobbyOptions {
  // none to create a new room, set once connected (see `Lobby`)
  id?: string
  username: string
  practice?: boolean
  countdown?: number
  rematch?: boolean
}

export function lobbyPath(options: LobbyOptions) {
  return `/lobby/${btoa(JSON.stringify(options))}`
}

export function decodeLobbyOptions(encoded?: string): LobbyOptions | undefined {
  if (!encoded) return
  try {
    return JSON.parse(atob(encoded))
  } catch {
    return
  }
}
