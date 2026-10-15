import { PLAYER, STATE, type GameConfigSchema, type GameStage, type LobbySchema } from '@schema'
import { getState, setState, waitForPlayerState, type PlayerState } from 'playroomkit'
import { GameHost } from './game-host'
import { PracticeBot } from './practice-bot'

/**
 * Authoritative room logic, running only on the host client (port of the old Colyseus `GameLobby`).
 * When the host leaves, Playroom promotes another player and a new `Host` takes over from the room state.
 */
// practice: the player against the bot
const MIN_PLAYERS = 2
const COUNTDOWN_START = 60
const COUNTDOWN_END = 4
const BOT_THINK_INTERVAL = 100 //ms

export class Host {
  readonly #players: () => PlayerState[]
  readonly #practice: boolean
  readonly #countdownStart: number
  #interval: number
  #game?: GameHost
  #bot?: PracticeBot
  #botInterval?: number

  constructor(players: () => PlayerState[]) {
    this.#players = players

    const config: GameConfigSchema = getState(STATE.config) ?? {}
    this.#practice = !!config.practice
    this.#countdownStart = this.#practice ? COUNTDOWN_END : config.countdown || COUNTDOWN_START

    if (!getState(STATE.lobby)) this.#setLobby(false, this.#countdownStart)
    if (getState(STATE.stage) === 'game') this.#game = GameHost.resume(this.#practice)

    if (this.#practice) this.#addBot()

    this.#interval = window.setInterval(() => this.#lobbyTick(), 1000)
  }

  dispose() {
    clearInterval(this.#interval)
    clearInterval(this.#botInterval)
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

  #addBot() {
    // the practice room has a single client: no host migration, the bot is added once
    this.#bot = PracticeBot.add()
    this.#botInterval = window.setInterval(() => this.#bot?.think(), BOT_THINK_INTERVAL)
  }

  #lobbyPlayers() {
    return this.#players().filter(p => p.getState(PLAYER.inLobby))
  }

  #lobbyTick() {
    const stage: GameStage | undefined = getState(STATE.stage)
    if (stage === 'game') return

    const lobby: LobbySchema | undefined = getState(STATE.lobby)
    const canStart = this.#lobbyPlayers().length >= MIN_PLAYERS
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
    this.#game = GameHost.start(players, this.#practice)

    this.#setLobby(false, this.#countdownStart)
    setState(STATE.stage, 'game', true)
  }
}
