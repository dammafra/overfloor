import { Client, Room } from '@colyseus/core'
import { GameLoopPhase, GameState, PlayerState } from '@schema'

interface CreateGameRoomOptions {
  id: string
  playersCount: number
  phaseDuration?: number // optional config
}

interface JoinGameRoomOptions {
  username: string
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class GameRoom extends Room<GameState> {
  state = new GameState()

  #lastPhase: GameLoopPhase
  #phaseDuration = 0.8
  #totalPhases = Object.keys(GameLoopPhase).filter(k => isNaN(Number(k))).length

  async onCreate(options: CreateGameRoomOptions) {
    this.roomId = options.id
    this.maxClients = options.playersCount

    this.onMessage('set-walking', (client, data) => {
      const player = this.state.players.get(client.sessionId)
      if (!player) return

      player.walking = data
    })

    this.onMessage('set-position', (client, data) => {
      const player = this.state.players.get(client.sessionId)
      if (!player) return

      if (data[1] < -50) {
        this.state.players.delete(client.sessionId)
        return
      }

      player.position[0] = data[0]
      player.position[1] = data[1]
      player.position[2] = data[2]
    })

    this.onMessage('set-rotation', (client, data) => {
      const player = this.state.players.get(client.sessionId)
      if (!player) return

      player.rotation[0] = data[0]
      player.rotation[1] = data[1]
      player.rotation[2] = data[2]
      player.rotation[3] = data[3]
    })

    this.clock.setInterval(this.#gameLoop.bind(this), 100)

    console.log(`[${this.roomName}] ✨ room ${this.roomId} created`)
  }

  async onJoin(client: Client, options: JoinGameRoomOptions) {
    const player = new PlayerState(options.username, this.state.players.size)
    this.state.players.set(client.sessionId, player)
    console.log(`[${this.roomName}] ✅ [${client.sessionId}] ${options.username} joined`)
  }

  async onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId)
    this.state.players.delete(client.sessionId)
    console.log(`[${this.roomName}] ❌ [${client.sessionId}] ${player.username} left`)
  }

  onDispose() {
    console.log(`[${this.roomName}] 🗑️ disposing room ${this.roomId}`)
  }

  #gameLoop() {
    const elapsedSeconds = this.clock.elapsedTime / 1000
    const phase = Math.floor(elapsedSeconds / this.#phaseDuration) % this.#totalPhases

    if (phase === this.#lastPhase) return
    this.#lastPhase = phase

    if (phase === GameLoopPhase.TARGETING) {
      // TODO patterns
      const randomCount = randomInt(5, 30)
      const randomIndexes = new Set(Array.from({ length: randomCount }, () => randomInt(0, this.state.tiles.length - 1))) //prettier-ignore
      this.state.targetTiles(randomIndexes)
      return
    }

    this.state.setPhase(phase)
  }
}
