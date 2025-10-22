import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'

export enum GameLoopPhase {
  IDLE,
  COUNTDOWN_3,
  COUNTDOWN_2,
  COUNTDOWN_1,
  FALLING,
}

export class PlayerState extends Schema {
  @type('string') username: string
  @type('int16') index: number
  @type('boolean') active: boolean = true

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

  @type({ array: 'float64' }) position = new ArraySchema<number>(0, 0, 0)
  @type('int8') phase: GameLoopPhase
  @type('boolean') targeted: boolean
  @type('boolean') falling: boolean

  constructor(x: number, z: number, index: number) {
    super()

    this.position[0] = x
    this.position[2] = z

    this.index = index
  }

  target(indexes: Set<number>) {
    this.targeted = indexes.has(this.index)
  }

  setPhase(phase: GameLoopPhase) {
    if (!this.targeted) return
    this.phase = phase
    this.falling = this.phase === GameLoopPhase.FALLING
  }
}

export class GridState extends Schema {
  @type('int16') width: number = 9
  @type('int16') height: number = 6
  @type('float32') unit: number = 2
  @type('float32') gap: number = 0.1
}

export class GameState extends Schema {
  @type(GridState) grid = new GridState()
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
  @type({ array: TileState }) tiles = new ArraySchema<TileState>()

  constructor() {
    super()

    const { width, height, unit, gap } = this.grid
    const offsetX = (width - 1) * (unit + gap) * 0.5
    const offsetZ = (height - 1) * (unit + gap) * 0.5

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const x = i * (unit + gap) - offsetX
        const z = j * (unit + gap) - offsetZ
        this.tiles.push(new TileState(x, z, this.tiles.length))
      }
    }
  }

  targetTiles(indexes: Set<number>) {
    this.tiles.forEach(tile => tile.target(indexes))
  }

  setPhase(phase: GameLoopPhase) {
    this.tiles.forEach(tile => tile.setPhase(phase))
  }
}
