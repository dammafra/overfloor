import { MapSchema, Schema, type } from '@colyseus/schema'

export class PlayerState extends Schema {
  @type('string') username: string
  @type('string') sessionId: string
  @type('number') x: number
  @type('number') z: number

  constructor(username: string, sessionId: string) {
    super()

    this.username = username
    this.sessionId = sessionId
    this.x = 0
    this.z = 0
  }
}

export class GameState extends Schema {
  @type('string') id: string
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}
