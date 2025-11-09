import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'
import { v4 as uuid } from 'uuid'
import { gridConfig, type GridDimension } from './grid-config'
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

  @type('boolean') walking: boolean
  @type({ array: 'float64' }) position = new ArraySchema<number>(0, 0, 0)
  @type({ array: 'float64' }) rotation = new ArraySchema<number>(0, 0, 0, 0)

  constructor(username: string, index: number, dimension: GridDimension) {
    super()

    this.username = username

    const [x, y, z] = this.getInitialPosition(index, dimension)
    this.position[0] = x
    this.position[1] = y
    this.position[2] = z
  }

  getInitialPosition(index: number, dimension: GridDimension) {
    const spacingX = 2
    const spacingY = 1.5
    const rowSize = gridConfig[dimension].playersPerRow
    const row = Math.floor(index / rowSize)
    const positionInRow = index % rowSize

    // zig-zag placement in x
    let x = 0
    if (positionInRow > 0) {
      const n = Math.ceil(positionInRow / 2)
      x = n * spacingX * (positionInRow % 2 === 1 ? -1 : 1)
    }

    // alternate forward/backward along z
    const direction = row % 2 === 0 ? 1 : -1
    const offset = row % 2 === 0 ? 0 : 1
    const z = (row + offset) * spacingY * direction

    const y = 20
    return [x, y, z]
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
  @type('int16') countdown: number
  @type('int16') time: number = 0

  @type('int8') width: number
  @type('int8') height: number

  @type('float32') unit: number = 2.5
  @type('float32') gap: number = 0.15

  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
  @type({ array: 'string' }) leaderboard = new ArraySchema<string>()
  @type({ array: TileState }) tiles = new ArraySchema<TileState>()

  #lastPattern: string

  _dimension: GridDimension

  get dimension() {
    return this._dimension
  }

  set dimension(value: typeof this._dimension) {
    this._dimension = value
    this.width = gridConfig[this.dimension].width
    this.height = gridConfig[this.dimension].height
  }

  init(dimension: typeof this._dimension) {
    this.dimension = dimension

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

  addPlayer(key: string, username: string) {
    this.players.set(key, new PlayerState(username, this.players.size, this.dimension))
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
    if (shrink) this.dimension = this.dimension === 'large' ? 'medium' : 'small'

    this.tiles
      .filter(tile => !tile.disabled)
      .forEach((tile, index) => {
        tile.targeted = !!pattern.at(index)
      })
  }

  resetTiles() {
    this.tiles.forEach(tile => {
      tile.disabled = false
      tile.falling = false
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
