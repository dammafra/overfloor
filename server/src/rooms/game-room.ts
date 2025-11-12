import { Client, Delayed, Room } from '@colyseus/core'
import { GameLoopPhase } from '@schema'
import { gridConfig } from '../schema/grid.schema'
import { GameState } from './game-room.state'

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

  IDLE = 1000 //ms
  COUNTDOWN: number //s

  #timer: Delayed
  #loop: Delayed
  #loopsCount = 0
  #phase = GameLoopPhase.IDLE
  #phaseDuration = 800 // min 300ms
  #resetDuration = 700
  #totalPhases = Object.keys(GameLoopPhase).filter(k => isNaN(Number(k))).length

  #training: boolean

  async onCreate(options: CreateGameRoomOptions) {
    this.roomId = options.id
    this.maxClients = options.playersCount
    this.#training = options.training

    this.state.init(options.playersCount <= gridConfig.medium.maxPlayers ? 'medium' : 'large')

    this.onMessage('set-walking', (client, data) => {
      const player = this.state.players.get(client.sessionId)
      if (!player) return

      player.walking = data
    })

    this.onMessage('set-position', (client, data) => {
      const player = this.state.players.get(client.sessionId)
      if (!player) return

      if (data[1] < -50) {
        this.state.leaderboard.push(player.username)
        this.state.players.delete(client.sessionId)

        if (this.#training) {
          // TODO improve
          this.state.dimension = 'medium'
          this.#loopsCount = 0
          this.#phaseDuration = 800
          this.state.resetTiles()
          this.state.addPlayer(client.sessionId, player.username)
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
    this.state.addPlayer(client.sessionId, options.username)
    console.log(`[${this.roomName}] ✅ [${client.sessionId}] ${options.username} joined`)

    // TODO can this possibly always be false?
    if (this.clients.length < this.maxClients) return

    this.clock.setTimeout(() => {
      this.state.countdown = 3
      const interval = this.clock.setInterval(async () => {
        if (this.state.countdown >= 0) {
          this.state.countdown--
          return
        }

        this.#resetLoop()
        this.#timer = this.clock.setInterval(() => this.state.time++, 1000)
        interval.clear()
      }, 1000)
    }, this.IDLE)
  }

  async onLeave(client: Client) {
    this.state.players.delete(client.sessionId)
    console.log(`[${this.roomName}] ❌ [${client.sessionId}] left`)
  }

  onDispose() {
    console.log(`[${this.roomName}] 🗑️ disposing room ${this.roomId}`)
  }

  #tick() {
    this.#phase = (this.#phase + 1) % this.#totalPhases
  }

  #gameLoop(shrink?: boolean) {
    this.state.targetTiles(shrink)
    this.#loopsCount++

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
    this.#decreasePhaseDuration()
    if (shrink) this.state.disableTiles()

    this.#loop?.clear()
    this.#loop = this.clock.setInterval(() => {
      if (this.#phase === GameLoopPhase.IDLE) {
        if (this.#training || this.state.players.size > 1) {
          const shrink = this.#shrinkCheck()
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

  #decreasePhaseDuration() {
    switch (this.state.dimension) {
      case 'large':
        this.#phaseDuration -= 10
        break
      case 'medium':
        this.#phaseDuration -= 30
        break
      case 'small':
        this.#phaseDuration -= 50
        break
    }

    this.#phaseDuration = Math.max(300, this.#phaseDuration)
  }

  #shrinkCheck() {
    switch (this.state.dimension) {
      case 'large':
        return this.state.players.size <= gridConfig.medium.maxPlayers
      case 'medium':
        return this.state.players.size <= gridConfig.small.maxPlayers && this.#loopsCount > 4
      case 'small':
        return false
    }
  }

  #end() {
    const winner = [...this.state.players.values()].at(0)
    if (winner) this.state.leaderboard.push(winner.username)

    this.#loop.clear()
    this.#timer.clear()
    this.clients.forEach(async client => {
      client.send('end')
    })
  }
}
