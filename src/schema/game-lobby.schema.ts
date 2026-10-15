export interface GameLobbySchema {
  id: string
  owner: string
  players: Map<string, string>
  canStart: boolean
  countdown: number
}
