import { PLAYER, STATE, type GameConfigSchema, type GameStage, type LobbySchema } from '@schema'
import { getState, myPlayer, setState, waitForPlayerState, type PlayerState } from 'playroomkit'
import { GameHost } from './game-host'
import { playerProfile } from './player'
import { PracticeBot } from './practice-bot'

/**
 * Authoritative room logic, running only on the host client (port of the old Colyseus `GameLobby`).
 * When the host leaves, Playroom promotes another player and a new `Host` takes over from the room state.
 */
const MIN_PLAYERS = 2
export const PRACTICE_BOTS = 3
const COUNTDOWN_START = 60
const COUNTDOWN_END = 4
const BOT_THINK_INTERVAL = 100 //ms
const ROLL_CALL_INTERVAL = 500 //ms
// without a new answer for this long, a player is dropped. Not a missed roll call: a slow
// connection answers each one later than the next is called, still alive
const ROLL_CALL_TIMEOUT = 3000 //ms
// answered this recently: responsive, e.g. to take over as host
const RESPONSIVE_TIMEOUT = 2 * ROLL_CALL_INTERVAL

export class Host {
  readonly #players: () => PlayerState[]
  readonly #practice: boolean
  readonly #minPlayers: number
  readonly #countdownStart: number
  #lobbyInterval: number
  #rollCallInterval: number
  #game?: GameHost
  #bots: PracticeBot[] = []
  #botInterval?: number
  #rollCall: number
  // last roll call answered by each player, and when the answer changed
  #answers = new Map<string, { rollCall: unknown; at: number }>()

  constructor(players: () => PlayerState[]) {
    this.#players = players

    const config: GameConfigSchema = getState(STATE.config) ?? {}
    this.#practice = !!config.practice
    // practice: the player against the bots
    this.#minPlayers = this.#practice ? 1 + PRACTICE_BOTS : MIN_PLAYERS
    this.#countdownStart = this.#practice ? COUNTDOWN_END : config.countdown || COUNTDOWN_START

    // a new host carries on the roll call of the previous one
    this.#rollCall = getState(STATE.rollCall) ?? 0

    if (!getState(STATE.lobby)) this.#setLobby(false, this.#countdownStart)
    if (getState(STATE.stage) === 'game') this.#game = GameHost.resume(this.#practice)

    if (this.#practice) this.#addBots()

    this.#lobbyInterval = window.setInterval(() => this.#updateLobby(true), 1000)
    this.#rollCallInterval = window.setInterval(() => this.#callRoll(), ROLL_CALL_INTERVAL)
  }

  dispose() {
    clearInterval(this.#lobbyInterval)
    clearInterval(this.#rollCallInterval)
    clearInterval(this.#botInterval)
    this.#game?.dispose()
  }

  async onPlayerJoin(player: PlayerState) {
    await waitForPlayerState(player, PLAYER.profile)
    const { username } = playerProfile(player)

    // players are listed in join order: the latest one with a duplicated username gets kicked
    const players = this.#players()
    const index = players.indexOf(player)
    const duplicated = players.slice(0, index).some(p => playerProfile(p).username === username)
    if (duplicated) player.kick()
  }

  onPlayerQuit(id: string) {
    this.#game?.quit(id)
  }

  onPlayerFell(id: string) {
    // practice: the fall of the player restarts the match, the bots are just eliminated
    if (this.#practice && !this.#bots.some(bot => bot.id === id)) this.#startMatch(this.#players(), true)
    else this.#game?.fell(id)
  }

  start() {
    const lobby: LobbySchema | undefined = getState(STATE.lobby)
    if (lobby?.canStart) this.#startMatch()
  }

  // publishes the lobby players right away, without waiting for the next countdown tick
  refreshLobby() {
    this.#updateLobby(false)
  }

  // answered a roll call lately: still connected
  isResponsive(id: string) {
    const answer = this.#answers.get(id)
    return !!answer && performance.now() - answer.at < RESPONSIVE_TIMEOUT
  }

  #addBots() {
    // the practice room has a single client: no host migration, the bots are added once
    for (let i = 1; i <= PRACTICE_BOTS; i++) {
      const bot = PracticeBot.add(`Bot ${i}`)
      if (bot) this.#bots.push(bot)
    }

    this.#botInterval = window.setInterval(() => {
      const taken = new Set<string>()
      this.#bots.forEach(bot => {
        bot.think(taken, this.#bots)
        if (bot.target) taken.add(bot.target)
      })
    }, BOT_THINK_INTERVAL)
  }

  #lobbyPlayers() {
    return this.#players().filter(p => p.getState(PLAYER.inLobby))
  }

  /**
   * Playroom loses the quit of a player while the host changes: the player would stay in the room forever.
   * A player missing too many roll calls is gone: dropped here, the next sync drops it everywhere.
   * One still connected (e.g. its page was suspended) finds itself missing from the syncs and joins again.
   */
  #callRoll() {
    const me = myPlayer()?.id
    const now = performance.now()
    const answers = new Map<string, { rollCall: unknown; at: number }>()

    this.#players().forEach(player => {
      // the bots run on this client
      if (player.id === me || player.getState('__proxyBy')) return

      const rollCall = player.getState(PLAYER.rollCall)
      // first seen (e.g. just joined, or a new host): given the whole timeout
      const last = this.#answers.get(player.id)
      const answer = !last || last.rollCall !== rollCall ? { rollCall, at: now } : last

      if (now - answer.at > ROLL_CALL_TIMEOUT) player.disconnect()
      else answers.set(player.id, answer)
    })

    this.#answers = answers
    setState(STATE.rollCall, ++this.#rollCall, true)
  }

  // `tick`: a second of the countdown elapsed
  #updateLobby(tick: boolean) {
    const stage: GameStage | undefined = getState(STATE.stage)
    if (stage === 'game') return

    const lobby: LobbySchema | undefined = getState(STATE.lobby)
    const canStart = this.#lobbyPlayers().length >= this.#minPlayers
    let countdown = lobby?.countdown ?? this.#countdownStart

    if (!canStart) countdown = this.#countdownStart
    else if (tick && countdown > COUNTDOWN_END) countdown--
    else if (tick) return this.#startMatch()

    this.#setLobby(canStart, countdown)
  }

  #setLobby(canStart: boolean, countdown: number) {
    const lobby: LobbySchema = { canStart, countdown, players: this.#lobbyPlayers().map(p => p.id) }
    setState(STATE.lobby, lobby, true)
  }

  // `players`: the lobby players by default, everyone in the room on a practice restart (the player is no longer in the lobby)
  #startMatch(players = this.#lobbyPlayers(), restart = false) {
    const match = players.map(playerProfile)

    this.#game?.dispose()
    this.#game = GameHost.start(match, this.#practice, restart)

    this.#setLobby(false, this.#countdownStart)
    setState(STATE.stage, 'game', true)
  }
}
