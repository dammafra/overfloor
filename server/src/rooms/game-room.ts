import { Client, Delayed, Room } from '@colyseus/core'
import { GameLoopPhase, GameState, PlayerState } from '@schema'

interface CreateGameRoomOptions {
  id: string
  playersCount: number
  phaseDuration?: number // optional config
}

interface JoinGameRoomOptions {
  username: string
}

export class GameRoom extends Room<GameState> {
  state = new GameState()

  #loop: Delayed
  #phase = GameLoopPhase.IDLE
  #phaseDuration = 800 // min 300ms
  #resetDuration = 700
  #totalPhases = Object.keys(GameLoopPhase).filter(k => isNaN(Number(k))).length

  async onCreate(options: CreateGameRoomOptions) {
    this.roomId = options.id
    this.maxClients = options.playersCount

    this.state.init(options.playersCount)
    this.resetLoop()

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

  #tick() {
    this.#phase = (this.#phase + 1) % this.#totalPhases
  }

  #gameLoop() {
    this.state.targetTiles()

    this.#loop?.clear()
    this.#loop = this.clock.setInterval(() => {
      if (this.#phase === GameLoopPhase.FALLING) {
        this.resetLoop()
        return
      }

      this.#tick()
      this.state.setPhase(this.#phase)
    }, this.#phaseDuration)
  }

  resetLoop() {
    this.#phaseDuration = Math.max(300, this.#phaseDuration - 50)

    // TODO condition
    // this.state.disableTiles()

    this.#loop?.clear()
    this.#loop = this.clock.setInterval(() => {
      if (this.#phase === GameLoopPhase.IDLE) {
        this.#gameLoop()
        return
      }

      this.#tick()
      this.state.setPhase(this.#phase)
    }, this.#resetDuration)
  }
}
