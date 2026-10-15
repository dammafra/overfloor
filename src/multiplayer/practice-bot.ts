import {
  GameLoopPhase,
  PLAYER,
  STATE,
  type PlayerBodySchema,
  type PlayerSchema,
  type TileSchema,
} from '@schema'
import { Bot, getState, Multiplayer, type PlayerState } from 'playroomkit'

const OCTANT = Math.PI / 4
const ARRIVE_DISTANCE = 0.4
const REACTION_MIN = 250 //ms
const REACTION_MAX = 650 //ms

const isWarning = (phase: GameLoopPhase) =>
  phase >= GameLoopPhase.COUNTDOWN_3 && phase <= GameLoopPhase.COUNTDOWN_1

/**
 * Opponent of the practice mode, simulated by the host like any other player: it only drives its input.
 * Added through Playroom internals since `addBot` keeps the first client, which `teardown` resets.
 */
export class PracticeBot extends Bot {
  #phase?: GameLoopPhase
  #reactAt = 0
  #target?: string

  static add(username: string) {
    const player = Multiplayer().connection?.addProxyPlayer()
    return player && new PracticeBot({ player, username })
  }

  constructor({ username, ...params }: { player: PlayerState; username: string }) {
    super(params)
    this.setState(PLAYER.username, username, true)
    this.setState(PLAYER.inLobby, true, true)
  }

  get target() {
    return this.#target
  }

  // `taken`: tiles targeted by the other bots, avoided to not crowd the same one
  think(taken: Set<string>) {
    const position = this.#position()
    if (!position) return this.#move(null)

    const phase: GameLoopPhase = getState(STATE.phase) ?? GameLoopPhase.IDLE
    const tiles: TileSchema[] = getState(STATE.tiles) ?? []

    // a new pattern is shown: react after a human-like delay
    if (phase !== this.#phase && phase === GameLoopPhase.COUNTDOWN_3) {
      this.#reactAt = Date.now() + REACTION_MIN + Math.random() * (REACTION_MAX - REACTION_MIN)
    }
    this.#phase = phase

    const safe = tiles.filter(t => !t.disabled && !(isWarning(phase) && t.targeted))
    const reacting = Date.now() >= this.#reactAt
    if (reacting && !safe.some(t => t.id === this.#target)) {
      const free = safe.filter(t => !taken.has(t.id))
      this.#target = nearest(free.length ? free : safe, position)?.id
    }

    const target = tiles.find(t => t.id === this.#target)
    if (!target) return this.#move(null)

    const x = target.position[0] - position[0]
    const z = target.position[2] - position[2]
    this.#move(Math.hypot(x, z) < ARRIVE_DISTANCE ? null : Math.atan2(x, z))
  }

  // same input as the human players (see `Controller`)
  #move(angle: number | null) {
    const snapped = angle == null ? null : Math.round(angle / OCTANT) * OCTANT
    if (snapped !== this.getState(PLAYER.input)) this.setState(PLAYER.input, snapped, true)
  }

  // published body of the current spawn, none while the bot is not in the match
  #position() {
    const players: PlayerSchema[] = getState(STATE.players) ?? []
    const player = players.find(p => p.id === this.id)
    const body: PlayerBodySchema | undefined = this.getState(PLAYER.body)
    if (!player) return

    return body?.spawn === player.spawn ? body.position : player.position
  }
}

function nearest(tiles: TileSchema[], [x, , z]: number[]) {
  const distance = (tile: TileSchema) => Math.hypot(tile.position[0] - x, tile.position[2] - z)
  return tiles.reduce<TileSchema | undefined>(
    (best, tile) => (!best || distance(tile) < distance(best) ? tile : best),
    undefined,
  )
}
