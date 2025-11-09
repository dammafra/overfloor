import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema'
import {
  GameLoopPhase,
  GameSchema,
  getGridCoordinates,
  getPlayerInitialPosition,
  gridConfig,
  GridDimension,
  PlayerSchema,
  TileSchema,
} from '@schema'
import { v4 as uuid } from 'uuid'

const oneOf = <T>(array: T[]) => array[Math.floor(Math.random() * array.length)]
const maybe = () => Math.random() < 0.5

export class PlayerState extends Schema implements PlayerSchema {
  @type('string') username: string

  @type('boolean') walking: boolean
  @type({ array: 'float64' }) position = new ArraySchema<number>(0, 0, 0)
  @type({ array: 'float64' }) rotation = new ArraySchema<number>(0, 0, 0, 0)

  constructor(username: string, index: number, dimension: GridDimension) {
    super()

    this.username = username

    const [x, y, z] = getPlayerInitialPosition(index, dimension)
    this.position[0] = x
    this.position[1] = y
    this.position[2] = z
  }
}

export class TileState extends Schema implements TileSchema {
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

export class GameState extends Schema implements GameSchema {
  @type('int16') countdown: number
  @type('int16') time: number = 0

  @type('int8') width: number
  @type('int8') height: number

  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
  @type({ array: 'string' }) leaderboard = new ArraySchema<string>()
  @type({ array: TileState }) tiles = new ArraySchema<TileState>()

  #lastPattern: string

  _dimension: GridDimension

  get dimension() {
    return this._dimension
  }

  set dimension(value: GridDimension) {
    this._dimension = value
    this.width = gridConfig[this.dimension].width
    this.height = gridConfig[this.dimension].height
  }

  init(dimension: GridDimension) {
    this.dimension = dimension

    getGridCoordinates(this.width, this.height).forEach(([x, z]) => {
      this.tiles.push(new TileState(x, z))
    })
  }

  addPlayer(key: string, username: string) {
    this.players.set(key, new PlayerState(username, this.players.size, this.dimension))
  }

  randomPattern() {
    const config = oneOf(gridConfig[this.dimension].patterns.filter(p => p.key !== this.#lastPattern)) // prettier-ignore
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
    const pattern = shrink ? gridConfig[this.dimension].shrinkPattern.flat() : this.randomPattern()
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
