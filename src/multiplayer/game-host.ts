import {
  GameLoopPhase,
  gridConfig,
  STATE,
  type GameLoopSchema,
  type GridDimension,
  type PlayerProfileSchema,
} from '@schema'
import { getState, setState } from 'playroomkit'
import { GameState } from './game-state'

/**
 * Runs the match game loop on the host client (port of the old Colyseus `GameRoom`).
 */
const IDLE = 2000 //ms, gives clients time to load the game scene
const INITIAL_PHASE_DURATION = 800
const MIN_PHASE_DURATION = 300
const RESET_DURATION = 700

export class GameHost {
  #state: GameState
  #practice: boolean

  #timer?: number
  #loop?: number
  #countdown?: number
  #idle?: number

  #loopsCount = 0
  #phaseDuration = INITIAL_PHASE_DURATION

  #time = 0

  private constructor(state: GameState, practice: boolean) {
    this.#state = state
    this.#practice = practice
  }

  // `restart`: the scene is already loaded and the players know the drill, no countdown
  static start(players: PlayerProfileSchema[], practice: boolean, restart = false) {
    const dimension: GridDimension = players.length <= gridConfig.medium.maxPlayers ? 'medium' : 'large' //oxfmt-ignore

    const state = new GameState()
    state.init(dimension, players)
    state.syncAll()

    const host = new GameHost(state, practice)
    host.#syncLoop()
    setState(STATE.time, 0, true)

    if (restart) {
      // past the countdown already, as when resuming
      setState(STATE.countdown, -1, true)
      host.#start()
    } else {
      setState(STATE.countdown, null, true)
      host.#idle = window.setTimeout(() => host.#startCountdown(), IDLE)
    }
    return host
  }

  // take over a running match, e.g. after host migration
  static resume(practice: boolean) {
    const host = new GameHost(GameState.hydrate(), practice)

    const loop: GameLoopSchema | undefined = getState(STATE.loop)
    host.#loopsCount = loop?.loopsCount ?? host.#loopsCount
    host.#phaseDuration = loop?.phaseDuration ?? host.#phaseDuration
    host.#time = getState(STATE.time) ?? 0

    const countdown: number | null = getState(STATE.countdown)
    if (typeof countdown === 'number' && countdown < 0) host.#start()
    else host.#startCountdown()

    return host
  }

  dispose() {
    clearTimeout(this.#idle)
    clearInterval(this.#countdown)
    clearInterval(this.#loop)
    clearInterval(this.#timer)
  }

  fell(id: string) {
    const player = this.#state.removePlayer(id)
    if (!player) return

    this.#state.leaderboard.push(player.username)

    this.#state.syncPlayers()
    this.#state.syncLeaderboard()
  }

  quit(id: string) {
    if (!this.#state.removePlayer(id)) return
    this.#state.syncPlayers()
  }

  #startCountdown() {
    let countdown = 3
    setState(STATE.countdown, countdown, true)

    clearInterval(this.#countdown)
    this.#countdown = window.setInterval(() => {
      if (countdown >= 0) {
        countdown--
        setState(STATE.countdown, countdown, true)
        return
      }

      clearInterval(this.#countdown)
      this.#start()
    }, 1000)
  }

  #start() {
    this.#resetLoop()

    clearInterval(this.#timer)
    this.#timer = window.setInterval(() => setState(STATE.time, ++this.#time, true), 1000)
  }

  #gameLoop(shrink?: boolean) {
    this.#state.targetTiles(shrink)
    this.#state.syncGrid()
    this.#loopsCount++
    this.#syncLoop()

    clearInterval(this.#loop)
    this.#loop = window.setInterval(() => {
      if (this.#state.phase === GameLoopPhase.FALLING) {
        this.#resetLoop(shrink)
        return
      }

      this.#state.tick()
      this.#state.syncPhase()
    }, this.#phaseDuration)
  }

  #resetLoop(shrink?: boolean) {
    if (shrink) {
      this.#state.disableTiles()
      this.#state.syncGrid()
    }
    this.#decreasePhaseDuration()

    clearInterval(this.#loop)
    this.#loop = window.setInterval(() => {
      if (this.#state.phase === GameLoopPhase.IDLE) {
        if (this.#practice || this.#state.players.length > 1) {
          const shrink = this.#shrinkCheck()
          this.#gameLoop(shrink)
        } else {
          this.#end()
        }

        return
      }

      this.#state.tick()
      this.#state.syncPhase()
    }, RESET_DURATION)
  }

  #decreasePhaseDuration() {
    const { phaseDecrement } = gridConfig[this.#state.dimension]
    this.#phaseDuration = Math.max(MIN_PHASE_DURATION, this.#phaseDuration - phaseDecrement)
  }

  #shrinkCheck() {
    const { shrink } = gridConfig[this.#state.dimension]
    if (!shrink) return false

    return (
      this.#state.players.length <= gridConfig[shrink.to].maxPlayers &&
      this.#loopsCount >= shrink.afterLoops
    )
  }

  #syncLoop() {
    const loop: GameLoopSchema = {
      loopsCount: this.#loopsCount,
      phaseDuration: this.#phaseDuration,
    }
    setState(STATE.loop, loop, true)
  }

  #end() {
    const winner = this.#state.players.at(0)
    if (winner) this.#state.leaderboard.push(winner.username)
    this.#state.syncLeaderboard()

    this.dispose()
    setState(STATE.stage, 'ended', true)
  }
}
