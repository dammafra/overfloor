import { Client, Room } from '@colyseus/core'
import { GameState, PlayerState } from '@schema'

interface CreateGameRoomOptions {
  id: string
  playersCount: number
}

interface JoinGameRoomOptions {
  username: string
}

export class GameRoom extends Room<GameState> {
  state = new GameState()

  async onCreate(options: CreateGameRoomOptions) {
    this.roomId = options.id
    this.maxClients = options.playersCount

    this.onMessage('set-position', (client, data) => {
      const player = this.state.players.get(client.sessionId)

      player.position[0] = data[0]
      player.position[1] = data[1]
      player.position[2] = data[2]
    })

    this.onMessage('set-rotation', (client, data) => {
      const player = this.state.players.get(client.sessionId)

      player.rotation[0] = data[0]
      player.rotation[1] = data[1]
      player.rotation[2] = data[2]
      player.rotation[3] = data[3]
    })

    this.onMessage('set-impulse', (client, data) => {
      const player = this.state.players.get(client.sessionId)

      player.impulse[0] = data[0]
      player.impulse[1] = data[1]
      player.impulse[2] = data[2]
    })

    console.log(`[${this.roomName}] ✨ room ${this.roomId} created`)
  }

  async onJoin(client: Client, options: JoinGameRoomOptions) {
    const player = new PlayerState(options.username, client.sessionId, this.state.players.size)
    this.state.players.set(client.sessionId, player)
    console.log(`[${this.roomName}] ✅ [${client.sessionId}] ${options.username} joined`)
  }

  async onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId)
    this.state.players.delete(client.sessionId)
    console.log(`[${this.roomName}] ❌ [${client.sessionId}] ${player} left`)
  }

  onDispose() {
    console.log(`[${this.roomName}] 🗑️ disposing room ${this.roomId}`)
  }
}
