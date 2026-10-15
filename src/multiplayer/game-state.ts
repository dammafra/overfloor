import {
  GameLoopPhase,
  getGridCoordinates,
  getPlayerInitialPosition,
  gridConfig,
  STATE,
  type GridDimension,
  type PlayerSchema,
  type TileSchema,
} from '@schema'
import { getState, setState } from 'playroomkit'
import { v4 as uuid } from 'uuid'

const oneOf = <T>(array: T[]) => array[Math.floor(Math.random() * array.length)]
const maybe = () => Math.random() < 0.5

/**
 * Host-side game state. Mutated by the host only and pushed to the room state with `sync*` methods.
 */
export class GameState {
  phase: GameLoopPhase = GameLoopPhase.IDLE
  dimension: GridDimension = 'medium'

  players: PlayerSchema[] = []
  leaderboard: string[] = []
  tiles: TileSchema[] = []

  #lastPattern?: string

  // restore the state from the room, e.g. after host migration
  static hydrate() {
    const state = new GameState()

    state.phase = getState(STATE.phase) ?? state.phase
    state.dimension = getState(STATE.dimension) ?? state.dimension
    state.players = getState(STATE.players) ?? []
    state.leaderboard = getState(STATE.leaderboard) ?? []
    state.tiles = getState(STATE.tiles) ?? []

    return state
  }

  init(dimension: GridDimension, players: Pick<PlayerSchema, 'id' | 'username'>[]) {
    this.dimension = dimension
    this.phase = GameLoopPhase.IDLE
    this.leaderboard = []

    const { width, height } = gridConfig[dimension]
    this.tiles = getGridCoordinates(width, height).map(([x, z], i) => ({
      id: `tile-${i}`,
      position: [x, 0, z],
      targeted: false,
      disabled: false,
    }))

    this.players = []
    players.forEach(({ id, username }) => this.addPlayer(id, username))
  }

  addPlayer(id: string, username: string) {
    this.players.push({
      id,
      username,
      spawn: uuid(),
      position: getPlayerInitialPosition(this.players.length, this.dimension),
    })
  }

  removePlayer(id: string) {
    const player = this.players.find(p => p.id === id)
    this.players = this.players.filter(p => p.id !== id)
    return player
  }

  #randomPattern() {
    const config = oneOf(gridConfig[this.dimension].patterns.filter(p => p.key !== this.#lastPattern)) //oxfmt-ignore
    this.#lastPattern = config.key

    let pattern = config.value
    if (config.flipX && maybe()) {
      pattern = [...pattern].reverse()
    }
    if (config.flipY && maybe()) {
      pattern = pattern.map(row => [...row].reverse())
    }
    if (config.negate && maybe()) {
      pattern = pattern.map(row => row.map(x => 1 - x))
    }

    return pattern.flat()
  }

  targetTiles(shrink?: boolean) {
    const pattern = shrink ? gridConfig[this.dimension].shrinkPattern.flat() : this.#randomPattern()
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
    })
  }

  disableTiles() {
    this.tiles
      .filter(tile => !tile.disabled)
      .forEach(tile => {
        tile.disabled = tile.targeted
      })
  }

  tick() {
    const phasesCount = GameLoopPhase.FALLING + 1
    this.phase = ((this.phase + 1) % phasesCount) as GameLoopPhase
  }

  syncPhase() {
    setState(STATE.phase, this.phase, true)
  }

  syncGrid() {
    setState(STATE.dimension, this.dimension, true)
    setState(STATE.tiles, this.tiles, true)
  }

  syncPlayers() {
    setState(STATE.players, this.players, true)
  }

  syncLeaderboard() {
    setState(STATE.leaderboard, this.leaderboard, true)
  }

  syncAll() {
    this.syncPhase()
    this.syncGrid()
    this.syncPlayers()
    this.syncLeaderboard()
  }
}
