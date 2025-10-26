import { MapSchema, Schema, type } from '@colyseus/schema'

export class GameLobbyState extends Schema {
  @type('string') id: string
  @type('string') owner: string
  @type({ map: 'string' }) players = new MapSchema<string>()
  @type('boolean') canStart: boolean
  @type('int16') countdown: number
}
