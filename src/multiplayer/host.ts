import { PLAYER, STATE, type GameConfigSchema, type GameStage, type LobbySchema } from '@schema'
import { getState, setState, waitForPlayerState, type PlayerState } from 'playroomkit'
import { GameHost } from './game-host'

/**
 * Authoritative room logic, running only on the host client (port of the old Colyseus `GameLobby`).
 * When the host leaves, Playroom promotes another player and a new `Host` takes over from the room state.
 */
const MIN_PLAYERS = 2
const COUNTDOWN_START = 60
const COUNTDOWN_END = 4

export class Host {
  readonly #players: () => PlayerState[]
  readonly #training: boolean
  readonly #minPlayers: number
  readonly #countdownStart: number
  #interval: number
  #game?: GameHost

  constructor(players: () => PlayerState[]) {
    this.#players = players

    const config: GameConfigSchema = getState(STATE.config) ?? {}
    this.#training = !!config.training
    this.#minPlayers = this.#training ? 1 : MIN_PLAYERS
    this.#countdownStart = this.#training ? COUNTDOWN_END : config.countdown || COUNTDOWN_START

    if (!getState(STATE.lobby)) this.#setLobby(false, this.#countdownStart)
    if (getState(STATE.stage) === 'game') this.#game = GameHost.resume(this.#training)

    this.#interval = window.setInterval(() => this.#lobbyTick(), 1000)
  }

  dispose() {
    clearInterval(this.#interval)
    this.#game?.dispose()
  }

  async onPlayerJoin(player: PlayerState) {
    const username = await waitForPlayerState<string>(player, PLAYER.username)

    // players are listed in join order: the latest one with a duplicated username gets kicked
    const players = this.#players()
    const index = players.indexOf(player)
    const duplicated = players.slice(0, index).some(p => p.getState(PLAYER.username) === username)
    if (duplicated) player.kick()
  }

  onPlayerQuit(player: PlayerState) {
    this.#game?.quit(player.id)
  }

  onPlayerFell(id: string) {
    this.#game?.fell(id)
  }

  start() {
    const lobby: LobbySchema | undefined = getState(STATE.lobby)
    if (lobby?.canStart) this.#startMatch()
  }

  #lobbyPlayers() {
    return this.#players().filter(p => p.getState(PLAYER.inLobby))
  }

  #lobbyTick() {
    const stage: GameStage | undefined = getState(STATE.stage)
    if (stage === 'game') return

    const lobby: LobbySchema | undefined = getState(STATE.lobby)
    const canStart = this.#lobbyPlayers().length >= this.#minPlayers
    let countdown = lobby?.countdown ?? this.#countdownStart

    if (!canStart) countdown = this.#countdownStart
    else if (countdown > COUNTDOWN_END) countdown--
    else return this.#startMatch()

    this.#setLobby(canStart, countdown)
  }

  #setLobby(canStart: boolean, countdown: number) {
    const lobby: LobbySchema = { canStart, countdown }
    setState(STATE.lobby, lobby, true)
  }

  #startMatch() {
    const players = this.#lobbyPlayers().map(p => ({
      id: p.id,
      username: p.getState(PLAYER.username) as string,
    }))

    this.#game?.dispose()
    this.#game = GameHost.start(players, this.#training)

    this.#setLobby(false, this.#countdownStart)
    setState(STATE.stage, 'game', true)
  }
}
