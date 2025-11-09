import { MapSchema, Schema, type } from '@colyseus/schema'
import { GameLobbySchema } from '@schema'

export class GameLobbyState extends Schema implements GameLobbySchema {
  @type('string') id: string
  @type('string') owner: string
  @type({ map: 'string' }) players = new MapSchema<string>()
  @type('boolean') canStart: boolean
  @type('int16') countdown: number
}
