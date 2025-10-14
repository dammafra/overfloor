import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'

export class PlayerState extends Schema {
  @type('string') username: string
  @type('int16') index: number

  @type('boolean') walking: boolean = false
  @type({ array: 'float64' }) position = new ArraySchema<number>(0, 0, 0)
  @type({ array: 'float64' }) rotation = new ArraySchema<number>(0, 0, 0, 0)

  constructor(username: string, index: number) {
    super()

    this.username = username
    this.index = index
  }
}

export class GameState extends Schema {
  @type('string') id: string
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}
