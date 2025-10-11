import { Client, Room } from '@colyseus/core'
import { GameLobbyState } from '@schema'

interface GameLobbyOptions {
  id?: string
  username: string
}

export class GameLobby extends Room<GameLobbyState> {
  IDS_CHANNEL = '$IDS'
  USERNAMES_CHANNEL: string

  state = new GameLobbyState()

  async onCreate(options: GameLobbyOptions) {
    await this.#checkRoomId(options.id)
    this.roomId = options.id
    this.USERNAMES_CHANNEL = options.id

    this.clock.setInterval(() => {
      if (!this.state.canStart) return

      if (this.state.countdown > 0) {
        this.state.countdown--
        return
      }

      // TODO start
    }, 1000)

    console.log(`✨ room ${this.roomId} created`)
  }

  async onJoin(client: Client, options: GameLobbyOptions) {
    await this.#checkUsername(options.username)
    this.state.players.set(client.sessionId, options.username)
    this.#checkMatchCanStart()
    console.log(`✅ [${client.sessionId}] ${options.username} joined`)
  }

  async onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId)

    if (player) {
      await this.presence.srem(this.USERNAMES_CHANNEL, player)
      this.state.players.delete(client.sessionId)
      console.log(`❌ [${client.sessionId}] ${player} left`)
      this.#checkMatchCanStart()
    }
  }

  onDispose() {
    this.presence.srem(this.IDS_CHANNEL, this.roomId)
    console.log(`🗑️ disposing room ${this.roomId}`)
  }

  #checkMatchCanStart() {
    this.state.canStart = this.state.players.size > 1
    if (!this.state.canStart) this.state.countdown = 60
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
