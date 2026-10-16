import {
  GameLoopPhase,
  gridConfig,
  STATE,
  type GridDimension,
  type PlayerProfileSchema,
  type PlayerSchema,
  type TileSchema,
} from '@schema'
import { getGridCoordinates, getPlayersInitialPositions } from '@utils'
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
  // dimension applied once the shrink tiles fall, so the walls do not shrink before
  #shrinkTo?: GridDimension

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

  init(dimension: GridDimension, players: PlayerProfileSchema[]) {
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

    const positions = getPlayersInitialPositions(players.length, dimension)
    this.players = players.map((player, i) => ({
      ...player,
      spawn: uuid(),
      position: positions[i],
    }))
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
    const shrinkConfig = shrink ? gridConfig[this.dimension].shrink : undefined
    const pattern = shrinkConfig ? shrinkConfig.pattern.flat() : this.#randomPattern()
    this.#shrinkTo = shrinkConfig?.to

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

    if (this.#shrinkTo) this.dimension = this.#shrinkTo
    this.#shrinkTo = undefined
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
