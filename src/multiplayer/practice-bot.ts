import {
  GameLoopPhase,
  GRID_UNIT,
  PLAYER,
  STATE,
  type PlayerBodySchema,
  type PlayerSchema,
  type TileSchema,
} from '@schema'
import { usernameColor } from '@utils'
import { Bot, getState, Multiplayer, type PlayerState } from 'playroomkit'

const OCTANT = Math.PI / 4
const ARRIVE_DISTANCE = 0.4
const REACTION_MIN = 250 //ms
const REACTION_MAX = 650 //ms
const CONTACT_DISTANCE = 1.35 // player ball diameter plus a margin
const STOP_MIN = 500 //ms
const STOP_MAX = 900 //ms
const WANDER_MIN = 1500 //ms
const WANDER_MAX = 4000 //ms
const WANDER_DISTANCE = GRID_UNIT * 1.5 // adjacent tiles, diagonals included

const random = (min: number, max: number) => min + Math.random() * (max - min)

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
  #stopUntil = 0
  #wanderAt = 0
  // position of the bot bumped into, the next target is picked away from it
  #avoid?: number[]

  static add(username: string) {
    const player = Multiplayer().connection?.addProxyPlayer()
    return player && new PracticeBot({ player, username })
  }

  constructor({ username, ...params }: { player: PlayerState; username: string }) {
    super(params)
    this.setState(PLAYER.profile, { name: username, color: usernameColor(username) }, true)
    this.setState(PLAYER.inLobby, true, true)
  }

  get target() {
    return this.#target
  }

  // published body of the current spawn, none while the bot is not in the match
  get position() {
    const players: PlayerSchema[] = getState(STATE.players) ?? []
    const player = players.find(p => p.id === this.id)
    const body: PlayerBodySchema | undefined = this.getState(PLAYER.body)
    if (!player) return

    return body?.spawn === player.spawn ? body.position : player.position
  }

  // `taken`: tiles targeted by the other bots, avoided to not crowd the same one
  think(taken: Set<string>, bots: PracticeBot[]) {
    const position = this.position
    if (!position) return this.#move(null)

    const now = Date.now()
    const phase: GameLoopPhase = getState(STATE.phase) ?? GameLoopPhase.IDLE
    const tiles: TileSchema[] = getState(STATE.tiles) ?? []

    // a new pattern is shown: react after a human-like delay
    if (phase !== this.#phase && phase === GameLoopPhase.COUNTDOWN_3) {
      this.#reactAt = now + random(REACTION_MIN, REACTION_MAX)
    }
    this.#phase = phase

    // stopped after bumping into another bot
    if (now < this.#stopUntil) return this.#move(null)

    const safe = tiles.filter(t => !t.disabled && !(isWarning(phase) && t.targeted))
    const free = safe.filter(t => !taken.has(t.id))
    const reacting = now >= this.#reactAt
    if (reacting && !safe.some(t => t.id === this.#target)) {
      this.#retarget(nearest(this.#away(free.length ? free : safe, position), position))
    }

    const target = tiles.find(t => t.id === this.#target)
    if (!target) return this.#move(null)

    const x = target.position[0] - position[0]
    const z = target.position[2] - position[2]

    if (Math.hypot(x, z) < ARRIVE_DISTANCE) {
      // idle on a safe tile: move to a nearby one now and then, to look natural
      if (!this.#wanderAt) this.#wanderAt = now + random(WANDER_MIN, WANDER_MAX)
      else if (reacting && now >= this.#wanderAt) {
        const nearby = free.filter(
          t => t.id !== target.id && distance(t, position) < WANDER_DISTANCE,
        )
        this.#retarget(nearby[Math.floor(Math.random() * nearby.length)])
      }
      return this.#move(null)
    }

    // bumping into another bot: stop instead of pushing it
    const bumped = bots.find(bot => {
      const other = bot !== this && bot.position
      return (
        other &&
        Math.hypot(other[0] - position[0], other[2] - position[2]) < CONTACT_DISTANCE &&
        (other[0] - position[0]) * x + (other[2] - position[2]) * z > 0
      )
    })
    if (bumped) {
      this.#stopUntil = now + random(STOP_MIN, STOP_MAX)
      this.#avoid = bumped.position
      this.#target = undefined
      return this.#move(null)
    }

    this.#move(Math.atan2(x, z))
  }

  #retarget(tile?: TileSchema) {
    if (!tile) return
    this.#target = tile.id
    this.#wanderAt = 0
    this.#avoid = undefined
  }

  // after a bump, prefer the tiles on the opposite side of the bumped bot
  #away(tiles: TileSchema[], [x, , z]: number[]) {
    const avoid = this.#avoid
    if (!avoid) return tiles

    const away = tiles.filter(
      t => (t.position[0] - x) * (avoid[0] - x) + (t.position[2] - z) * (avoid[2] - z) <= 0,
    )
    return away.length ? away : tiles
  }

  // same state as the joystick of the human players (see `Controller`), snapped like the keyboard.
  // The angle first, so the host never reads the joystick pressed with the previous one
  #move(angle: number | null) {
    const pressed = angle != null
    if (pressed) {
      const snapped = Math.round(angle / OCTANT) * OCTANT
      if (snapped !== this.getState(PLAYER.angle)) this.setState(PLAYER.angle, snapped)
    }
    if (pressed !== !!this.getState(PLAYER.joystick)) this.setState(PLAYER.joystick, pressed)
  }
}

function distance(tile: TileSchema, [x, , z]: number[]) {
  return Math.hypot(tile.position[0] - x, tile.position[2] - z)
}

function nearest(tiles: TileSchema[], position: number[]) {
  return tiles.reduce<TileSchema | undefined>(
    (best, tile) => (!best || distance(tile, position) < distance(best, position) ? tile : best),
    undefined,
  )
}
