import {
  GameLoopPhase,
  gridConfig,
  STATE,
  type GameLoopSchema,
  type GridDimension,
  type PlayerSchema,
} from '@schema'
import { getState, setState } from 'playroomkit'
import { GameState } from './game-state'

/**
 * Runs the match game loop on the host client (port of the old Colyseus `GameRoom`).
 */
export class GameHost {
  IDLE = 2000 //ms, gives clients time to load the game scene

  #state: GameState
  #training: boolean

  #timer?: number
  #loop?: number
  #countdown?: number
  #idle?: number

  #loopsCount = 0
  #phaseDuration = 800 // min 300ms
  #resetDuration = 700

  #time = 0

  private constructor(state: GameState, training: boolean) {
    this.#state = state
    this.#training = training
  }

  static start(players: Pick<PlayerSchema, 'id' | 'username'>[], training: boolean) {
    const dimension: GridDimension = players.length <= gridConfig.medium.maxPlayers ? 'medium' : 'large' //oxfmt-ignore

    const state = new GameState()
    state.init(dimension, players)
    state.syncAll()

    const host = new GameHost(state, training)
    host.#syncLoop()
    setState(STATE.time, 0, true)
    setState(STATE.countdown, null, true)

    host.#idle = window.setTimeout(() => host.#startCountdown(), host.IDLE)
    return host
  }

  // take over a running match, e.g. after host migration
  static resume(training: boolean) {
    const host = new GameHost(GameState.hydrate(), training)

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

    if (this.#training) {
      // TODO improve
      this.#state.dimension = 'medium'
      this.#loopsCount = 0
      this.#phaseDuration = 800
      this.#state.resetTiles()
      this.#state.addPlayer(player.id, player.username)
      this.#state.syncGrid()
      this.#syncLoop()
    }

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
    this.#decreasePhaseDuration()
    if (shrink) {
      this.#state.disableTiles()
      this.#state.syncGrid()
    }

    clearInterval(this.#loop)
    this.#loop = window.setInterval(() => {
      if (this.#state.phase === GameLoopPhase.IDLE) {
        if (this.#training || this.#state.players.length > 1) {
          const shrink = this.#shrinkCheck()
          this.#gameLoop(shrink)
        } else {
          this.#end()
        }

        return
      }

      this.#state.tick()
      this.#state.syncPhase()
    }, this.#resetDuration)
  }

  #decreasePhaseDuration() {
    switch (this.#state.dimension) {
      case 'large':
        this.#phaseDuration -= 10
        break
      case 'medium':
        this.#phaseDuration -= 30
        break
      case 'small':
        this.#phaseDuration -= 50
        break
    }

    this.#phaseDuration = Math.max(300, this.#phaseDuration)
  }

  #shrinkCheck() {
    switch (this.#state.dimension) {
      case 'large':
        return this.#state.players.length <= gridConfig.medium.maxPlayers
      case 'medium':
        return this.#state.players.length <= gridConfig.small.maxPlayers && this.#loopsCount > 4
      case 'small':
        return false
    }
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
