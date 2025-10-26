import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'
import { v4 as uuid } from 'uuid'
import { patterns, shrinkPatterns } from './patterns'

const oneOf = <T>(array: T[]) => array[Math.floor(Math.random() * array.length)]
const maybe = () => Math.random() < 0.5

export enum GameLoopPhase {
  IDLE,
  COUNTDOWN_3,
  COUNTDOWN_2,
  COUNTDOWN_1,
  FALLING,
}

export class PlayerState extends Schema {
  @type('string') username: string
  @type('int16') index: number // TODO can I remove index as in TileState?

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
  @type('string') id: string

  @type({ array: 'float64' }) position = new ArraySchema<number>(0, 0, 0)
  @type('int8') phase = GameLoopPhase.IDLE
  @type('boolean') targeted: boolean
  @type('boolean') falling: boolean
  @type('boolean') disabled: boolean

  constructor(x: number, z: number) {
    super()

    this.id = uuid()

    this.position[0] = x
    this.position[2] = z
  }
}

export class GameState extends Schema {
  @type('int8') width: number
  @type('int8') height: number

  @type('float32') unit: number = 2.5
  @type('float32') gap: number = 0.2

  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
  @type({ array: TileState }) tiles = new ArraySchema<TileState>()

  #lastPattern: string

  _dimension: 'small' | 'medium' | 'large'

  get dimension() {
    return this._dimension
  }

  set dimension(value: typeof this._dimension) {
    this._dimension = value
    this.width = this.dimension === 'large' ? 11 : this.dimension === 'medium' ? 9 : 7
    this.height = this.dimension === 'large' ? 8 : this.dimension === 'medium' ? 6 : 4
  }

  dimensionByPlayers = (playersCount: number) =>
    playersCount <= 10 ? 'small' : playersCount <= 30 ? 'medium' : 'large'

  init(playersCount: number) {
    // TODO test and improve
    this.dimension = this.dimensionByPlayers(playersCount)

    const offsetX = (this.width - 1) * (this.unit + this.gap) * 0.5
    const offsetZ = (this.height - 1) * (this.unit + this.gap) * 0.5

    for (let j = 0; j < this.height; j++) {
      for (let i = 0; i < this.width; i++) {
        const x = i * (this.unit + this.gap) - offsetX
        const z = j * (this.unit + this.gap) - offsetZ
        this.tiles.push(new TileState(x, z))
      }
    }
  }

  shrinkCheck() {
    const nextDimension = this.dimensionByPlayers(this.players.size)
    return this.dimension !== nextDimension
  }

  randomPattern() {
    const config = oneOf(patterns[this.dimension].filter(p => p.key !== this.#lastPattern))
    this.#lastPattern = config.key

    let pattern = config.value
    if (config.flipX && maybe()) {
      pattern = pattern.reverse()
    }
    if (config.flipY && maybe()) {
      pattern = pattern.map(row => row.reverse())
    }
    if (config.negate && maybe()) {
      pattern = pattern.map(row => row.map(x => 1 - x))
    }

    return pattern.flat()
  }

  targetTiles(shrink?: boolean) {
    const pattern = shrink ? shrinkPatterns[this.dimension].flat() : this.randomPattern()
    if (shrink) this.dimension = this.dimensionByPlayers(this.players.size)

    this.tiles
      .filter(tile => !tile.disabled)
      .forEach((tile, index) => {
        tile.targeted = !!pattern.at(index)
      })
  }

  enableTiles() {
    this.tiles.forEach(tile => {
      tile.disabled = false
    })
  }

  disableTiles() {
    this.tiles
      .filter(tile => !tile.disabled)
      .forEach(tile => {
        tile.disabled = tile.targeted
      })
  }

  setPhase(phase: GameLoopPhase) {
    this.tiles
      .filter(tile => !tile.disabled)
      .forEach(tile => {
        if (!tile.targeted) return
        tile.phase = phase
        tile.falling = tile.phase === GameLoopPhase.FALLING
      })
  }
}
