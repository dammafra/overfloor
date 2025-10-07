import { Client, Room } from '@colyseus/core'
import { GameState, Player } from '@schema/game-state'

interface GameRoomOptions {
  id: string
  username: string
}

export class GameRoom extends Room<GameState> {
  IDS_CHANNEL = '$IDS'
  USERNAMES_CHANNEL = '$USERNAMES'

  state = new GameState()

  async onCreate(options: GameRoomOptions) {
    await this.#checkRoomId(options.id)
    this.roomId = options.id
    console.log(`✨ room ${this.roomId} created`)
  }

  async onJoin(client: Client, options: GameRoomOptions) {
    await this.#checkUsername(options.username)
    this.state.players.set(client.sessionId, new Player(options.username))
    console.log(`✅ [${client.sessionId}] ${options.username} joined`)
  }

  async onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId)

    if (player) {
      await this.presence.srem(this.USERNAMES_CHANNEL, player.username)
      this.state.players.delete(client.sessionId)
    }

    console.log(`❌ [${client.sessionId}] ${player.username} left`)
  }

  onDispose() {
    this.presence.srem(this.IDS_CHANNEL, this.roomId)
    console.log(`🗑️ disposing room ${this.roomId}`)
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
