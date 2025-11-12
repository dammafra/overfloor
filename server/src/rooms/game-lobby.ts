import { Client, Delayed, matchMaker, Room } from '@colyseus/core'
import { gridConfig } from '@schema'
import { ROOM_IDS_CHANNEL } from '../app.config'
import { GameLobbyState } from './game-lobby.state'

interface CreateGameLobbyOptions {
  id: string
  username: string
  countdown?: number
  training?: boolean
}

interface JoinGameLobbyOptions {
  username: string
}

export class GameLobby extends Room<GameLobbyState> {
  autoDispose = false
  maxClients = gridConfig.large.maxPlayers

  MIN_PLAYERS = 2
  COUNTDOWN = 60
  COUNTDOWN_END = 4

  state = new GameLobbyState()
  #interval: Delayed
  #training: boolean

  async onCreate(options: CreateGameLobbyOptions) {
    await this.#checkPresence(ROOM_IDS_CHANNEL, options.id, 'Room ID already exists')

    this.roomId = options.id
    this.COUNTDOWN = options.countdown || this.COUNTDOWN

    if (options.training) {
      this.#training = true
      this.autoDispose = true
      this.MIN_PLAYERS = 1
      this.COUNTDOWN = this.COUNTDOWN_END
    }

    this.#checkMatchCanStart()

    this.#interval = this.clock.setInterval(async () => {
      if (!this.state.canStart) return

      if (this.state.countdown > this.COUNTDOWN_END) {
        this.state.countdown--
        return
      }

      this.#startMatch()
    }, 1000)

    this.clock.setTimeout(
      () => {
        if (!this.clients.length) this.disconnect()
      },
      1000 * 60 * 15, //15 minutes
    )

    this.onMessage('start', this.#startMatch.bind(this))

    console.log(`[${this.roomName}] ✨ room ${this.roomId} created`)
  }

  async onJoin(client: Client, options: JoinGameLobbyOptions) {
    await this.#checkPresence(this.roomId, options.username, 'Username already exists')

    this.state.players.set(client.sessionId, options.username)
    this.#updateOwner()
    this.#checkMatchCanStart()

    console.log(`[${this.roomName}] ✅ [${client.sessionId}] ${options.username} joined`)
  }

  async onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId)

    if (player) {
      await this.presence.srem(this.roomId, player)

      this.state.players.delete(client.sessionId)
      this.#updateOwner()
      this.#checkMatchCanStart()

      console.log(`[${this.roomName}] ❌ [${client.sessionId}] ${player} left`)
    }
  }

  onDispose() {
    this.presence.srem(ROOM_IDS_CHANNEL, this.roomId)
    console.log(`[${this.roomName}] 🗑️ disposing room ${this.roomId}`)
  }

  #updateOwner() {
    if (this.state.players.size === 0) this.state.owner = undefined
    if (this.state.players.size === 1) this.state.owner = [...this.state.players.values()].at(0)
    this.setMetadata({ owner: this.state.owner })
  }

  async #startMatch() {
    this.#interval.clear()
    this.autoDispose = true

    const room = await matchMaker.createRoom('game-room', {
      id: `${this.roomId}-game`,
      playersCount: this.state.players.size,
      training: this.#training,
    })

    this.clients.forEach(async client => {
      const username = this.state.players.get(client.sessionId)
      const reservation = await matchMaker.reserveSeatFor(room, { username })
      client.send('start', { ...reservation, id: this.roomId, username })
    })
  }

  #checkMatchCanStart() {
    this.state.canStart = this.state.players.size >= this.MIN_PLAYERS
    if (!this.state.canStart) this.state.countdown = this.COUNTDOWN
  }

  async #checkPresence(channel: string, value: string, message: string) {
    if (!value) throw new Error(`Empty value provided for ${channel} presence`)

    const current = await this.presence.smembers(channel)
    if (current.includes(value)) throw new Error(message)
    return this.presence.sadd(channel, value)
  }
}
