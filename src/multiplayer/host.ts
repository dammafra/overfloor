import { PLAYER, STATE, type GameConfigSchema, type GameStage, type LobbySchema } from '@schema'
import { getState, setState, waitForPlayerState, type PlayerState } from 'playroomkit'
import { GameHost } from './game-host'

/**
 * Authoritative room logic, running only on the host client (port of the old Colyseus `GameLobby`).
 * When the host leaves, Playroom promotes another player and a new `Host` takes over from the room state.
 */
export class Host {
  MIN_PLAYERS = 2
  COUNTDOWN_START = 60
  COUNTDOWN_END = 4

  #players: () => PlayerState[]
  #training: boolean
  #interval: number
  #game?: GameHost

  constructor(players: () => PlayerState[]) {
    this.#players = players

    const config: GameConfigSchema = getState(STATE.config) ?? {}
    this.#training = !!config.training
    this.COUNTDOWN_START = config.countdown || this.COUNTDOWN_START

    if (this.#training) {
      this.MIN_PLAYERS = 1
      this.COUNTDOWN_START = this.COUNTDOWN_END
    }

    if (!getState(STATE.lobby)) this.#setLobby(false, this.COUNTDOWN_START)
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

  onPlayerFell(player: PlayerState) {
    this.#game?.fell(player.id)
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
    const canStart = this.#lobbyPlayers().length >= this.MIN_PLAYERS
    let countdown = lobby?.countdown ?? this.COUNTDOWN_START

    if (!canStart) countdown = this.COUNTDOWN_START
    else if (countdown > this.COUNTDOWN_END) countdown--
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

    this.#setLobby(false, this.COUNTDOWN_START)
    setState(STATE.stage, 'game', true)
  }
}
