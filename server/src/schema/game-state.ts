import { MapSchema, Schema, type } from '@colyseus/schema'

export class Player extends Schema {
  @type('string') username: string
  @type('number') x: number
  @type('number') z: number

  constructor(username: string) {
    super()

    this.username = username
    this.x = 0
    this.z = 0
  }
}

export class GameState extends Schema {
  @type('string') id: string
  @type({ map: Player }) players = new MapSchema<Player>()
}
