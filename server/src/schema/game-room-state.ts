import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'

export class PlayerState extends Schema {
  @type('string') username: string
  @type('int16') index: number

  @type('boolean') walking: boolean
  @type({ array: 'float64' }) position = new ArraySchema<number>(0, 0, 0)
  @type({ array: 'float64' }) rotation = new ArraySchema<number>(0, 0, 0, 0)

  constructor(username: string, index: number) {
    super()

    this.username = username
    this.index = index
  }
}

export class TileState extends Schema {
  @type('int16') index: number

  @type('boolean') target: boolean
  @type('boolean') falling: boolean
  @type({ array: 'float64' }) position = new ArraySchema<number>(0, 0, 0)

  constructor(x: number, z: number, index: number) {
    super()

    this.position[0] = x
    this.position[2] = z

    this.index = index
  }
}

export class GridState extends Schema {
  @type('int16') width: number = 9
  @type('int16') height: number = 7
  @type('float32') unit: number = 2
  @type('float32') gap: number = 0.1
}

export class GameState extends Schema {
  @type(GridState) grid = new GridState()
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
  @type({ array: TileState }) tiles = new ArraySchema<TileState>()

  constructor() {
    super()

    const halfWidth = Math.floor(this.grid.width / 2)
    const halfHeight = Math.floor(this.grid.height / 2)

    for (let i = 0; i < this.grid.width; i++) {
      for (let j = 0; j < this.grid.height; j++) {
        const x = (i - halfWidth) * (this.grid.unit + this.grid.gap)
        const z = (j - halfHeight) * (this.grid.unit + this.grid.gap)
        this.tiles.push(new TileState(x, z, this.tiles.length))
      }
    }
  }
}
