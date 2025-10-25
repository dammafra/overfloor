import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'
import { maybe, oneOf } from '@utils'
import patterns from '../utils/patterns'

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
  @type('boolean') disabled: boolean

  constructor(x: number, z: number, index: number) {
    super()

    this.position[0] = x
    this.position[2] = z

    this.index = index
  }
}

export class GameState extends Schema {
  @type('string') dimension: 'small' | 'medium' | 'large'

  @type('int16') width: number
  @type('int16') height: number

  @type('float32') unit: number = 2
  @type('float32') gap: number = 0.1

  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
  @type({ array: TileState }) tiles = new ArraySchema<TileState>()

  #lastPattern: string

  init(playersCount: number) {
    // TODO test and improve
    this.setDimension(playersCount <= 10 ? 'small' : playersCount <= 30 ? 'medium' : 'small')

    const offsetX = (this.width - 1) * (this.unit + this.gap) * 0.5
    const offsetZ = (this.height - 1) * (this.unit + this.gap) * 0.5

    for (let j = 0; j < this.height; j++) {
      for (let i = 0; i < this.width; i++) {
        const x = i * (this.unit + this.gap) - offsetX
        const z = j * (this.unit + this.gap) - offsetZ
        this.tiles.push(new TileState(x, z, this.tiles.length))
      }
    }
  }

  setDimension(dimension: typeof this.dimension) {
    this.dimension = dimension

    this.width = this.dimension === 'large' ? 11 : this.dimension === 'medium' ? 9 : 7
    this.height = this.dimension === 'large' ? 8 : this.dimension === 'medium' ? 6 : 4
  }

  getPattern() {
    const config = oneOf(patterns[this.dimension].filter(p => !p.transition && p.key !== this.#lastPattern)) // prettier-ignore
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

  targetTiles() {
    const pattern = this.getPattern()

    this.tiles.forEach(tile => {
      if (tile.disabled) return
      tile.targeted = !!pattern.at(tile.index)
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
