import { Client, Delayed, Room } from '@colyseus/core'
import { GameLoopPhase, GameState, PlayerState } from '@schema'

interface CreateGameRoomOptions {
  id: string
  playersCount: number
  training: boolean
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
  #training: boolean

  async onCreate(options: CreateGameRoomOptions) {
    this.roomId = options.id
    this.maxClients = options.playersCount
    this.#training = options.training

    this.state.init(options.playersCount)
    this.#resetLoop()

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
        if (this.#training) {
          // TODO reset dimension, improve code
          this.#loop.clear()
          this.#phaseDuration = 800
          this.#gameLoop()
          this.state.enableTiles()
          this.state.players.set(client.sessionId, new PlayerState(player.username, this.state.players.size)) //prettier-ignore
        }
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

  #gameLoop(shrink?: boolean) {
    this.state.targetTiles(shrink)

    this.#loop?.clear()
    this.#loop = this.clock.setInterval(() => {
      if (this.#phase === GameLoopPhase.FALLING) {
        this.#resetLoop(shrink)
        return
      }

      this.#tick()
      this.state.setPhase(this.#phase)
    }, this.#phaseDuration)
  }

  #resetLoop(shrink?: boolean) {
    this.#phaseDuration = Math.max(300, this.#phaseDuration - 50)
    if (shrink) this.state.disableTiles()

    this.#loop?.clear()
    this.#loop = this.clock.setInterval(() => {
      if (this.#phase === GameLoopPhase.IDLE) {
        if (this.#training || this.state.players.size > 1) {
          const shrink = this.state.shrinkCheck()
          this.#gameLoop(shrink)
        } else {
          this.#end()
        }

        return
      }

      this.#tick()
      this.state.setPhase(this.#phase)
    }, this.#resetDuration)
  }

  // TODO
  #end() {
    this.#loop.clear()
    this.clients.forEach(async client => {
      client.send('end')
    })
  }
}
