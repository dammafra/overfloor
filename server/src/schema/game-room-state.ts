import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'

export enum GameLoopPhase {
  IDLE,
  COUNTDOWN_3,
  COUNTDOWN_2,
  COUNTDOWN_1,
  FALLING,
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomElements<T>(count: number, array: T[]) {
  return array.sort(() => Math.random() - 0.5).slice(0, count)
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
  @type('boolean') disabled: boolean

  constructor(x: number, z: number, index: number) {
    super()

    this.position[0] = x
    this.position[2] = z

    this.index = index
  }
}

export class GameState extends Schema {
  @type('int16') width: number
  @type('int16') height: number
  @type('float32') unit: number = 2
  @type('float32') gap: number = 0.1

  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
  @type({ array: TileState }) tiles = new ArraySchema<TileState>()

  init(playersCount: number) {
    // TODO test and improve
    if (playersCount <= 10) {
      this.width = 7
      this.height = 4
    } else if (playersCount <= 30) {
      this.width = 9
      this.height = 6
    } else if (playersCount <= 60) {
      this.width = 11
      this.height = 8
    }

    const offsetX = (this.width - 1) * (this.unit + this.gap) * 0.5
    const offsetZ = (this.height - 1) * (this.unit + this.gap) * 0.5

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const x = i * (this.unit + this.gap) - offsetX
        const z = j * (this.unit + this.gap) - offsetZ
        this.tiles.push(new TileState(x, z, this.tiles.length))
      }
    }
  }

  targetTiles() {
    // TODO patterns
    const availableTiles = this.tiles.filter(tile => !tile.disabled).map(tile => tile.index)
    const count = randomInt(1, availableTiles.length)
    const indexes = getRandomElements(count, availableTiles)

    this.tiles.forEach(tile => {
      if (tile.disabled) return
      tile.targeted = indexes.includes(tile.index)
    })
  }

  disableTiles() {
    this.tiles.forEach(tile => {
      if (tile.disabled) return
      tile.disabled = tile.targeted
    })
  }

  setPhase(phase: GameLoopPhase) {
    this.tiles.forEach(tile => {
      if (tile.disabled || !tile.targeted) return
      tile.phase = phase
      tile.falling = tile.phase === GameLoopPhase.FALLING
    })
  }
}
