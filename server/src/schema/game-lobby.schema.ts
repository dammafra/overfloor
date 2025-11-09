import { MapSchema } from '@colyseus/schema'

export class GameLobbySchema {
  id: string
  owner: string
  players: MapSchema<string>
  canStart: boolean
  countdown: number
}
