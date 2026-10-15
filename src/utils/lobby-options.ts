// Lobby options travel base64-encoded in the lobby route (`/:from/lobby/:options`)
export interface LobbyOptions {
  id?: string
  username: string
  training?: boolean
  countdown?: number
  rematch?: boolean
}

export function lobbyPath(from: 'new' | 'join', options: LobbyOptions) {
  return `/${from}/lobby/${btoa(JSON.stringify(options))}`
}

export function decodeLobbyOptions(encoded?: string): LobbyOptions | undefined {
  if (!encoded) return
  try {
    return JSON.parse(atob(encoded))
  } catch {
    return
  }
}
