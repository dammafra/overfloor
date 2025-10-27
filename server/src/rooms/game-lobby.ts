import { Client, Delayed, matchMaker, Room } from '@colyseus/core'
import { GameLobbyState } from '@schema'

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

  IDS_CHANNEL = '$IDS'
  USERNAMES_CHANNEL: string
  MIN_PLAYERS = 2
  COUNTDOWN = 60

  state = new GameLobbyState()
  #interval: Delayed
  #training: boolean

  async onCreate(options: CreateGameLobbyOptions) {
    await this.#checkRoomId(options.id)
    this.roomId = options.id
    this.USERNAMES_CHANNEL = options.id
    this.COUNTDOWN = options.countdown || this.COUNTDOWN

    if (options.training) {
      this.#training = true
      this.autoDispose = true
      this.MIN_PLAYERS = 1
      this.COUNTDOWN = 3
    }

    this.#checkMatchCanStart()

    this.#interval = this.clock.setInterval(async () => {
      if (!this.state.canStart) return

      if (this.state.countdown > 0) {
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
    await this.#checkUsername(options.username)
    this.state.players.set(client.sessionId, options.username)
    this.#updateOwner()
    this.#checkMatchCanStart()

    console.log(`[${this.roomName}] ✅ [${client.sessionId}] ${options.username} joined`)
  }

  async onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId)

    if (player) {
      await this.presence.srem(this.USERNAMES_CHANNEL, player)
      this.state.players.delete(client.sessionId)
      this.#updateOwner()
      this.#checkMatchCanStart()

      console.log(`[${this.roomName}] ❌ [${client.sessionId}] ${player} left`)
    }
  }

  onDispose() {
    this.presence.srem(this.IDS_CHANNEL, this.roomId)
    console.log(`[${this.roomName}] 🗑️ disposing room ${this.roomId}`)
  }

  #updateOwner() {
    if (this.state.players.size === 0) this.state.owner = undefined
    if (this.state.players.size === 1) this.state.owner = this.state.players.values().toArray().at(0) //prettier-ignore
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
      client.send('start', reservation)
    })
  }

  #checkMatchCanStart() {
    this.state.canStart = this.state.players.size >= this.MIN_PLAYERS
    if (!this.state.canStart) this.state.countdown = this.COUNTDOWN
  }

  #checkRoomId(roomId: string) {
    return this.#checkPresence(
      this.IDS_CHANNEL,
      roomId,
      'Room ID already exists, choose a new one or join the existing room',
    )
  }

  #checkUsername(username: string) {
    return this.#checkPresence(
      this.USERNAMES_CHANNEL,
      username,
      'Username already exists, choose a new one',
    )
  }

  async #checkPresence(channel: string, value: string, message: string) {
    if (!value) throw new Error(`Empty value provided for ${channel} presence`)

    const currentIds = await this.presence.smembers(channel)
    if (currentIds.includes(value)) throw new Error(message)
    return this.presence.sadd(channel, value)
  }
}
