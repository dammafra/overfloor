import { gridConfig, PLAYER, RPC_EVENTS, STATE, type GameConfigSchema } from '@schema'
import { initialRoomState, useRoomState, type RoomState } from '@stores'
import {
  getState,
  insertCoin,
  isHost,
  Multiplayer,
  myPlayer,
  onPlayerJoin,
  RPC,
  setState,
  type PlayerState,
} from 'playroomkit'
import { Host } from './host'

interface ConnectOptions extends GameConfigSchema {
  roomCode?: string
  username: string
}

const PENDING_NOTIFICATION_KEY = 'overfloor-notification'
const PLAYROOM_PLAYER_ID_KEY = 'myId'

const ERRORS: Record<string, string> = {
  ROOM_LIMIT_EXCEEDED: 'Room is full',
  PLAYER_KICKED: 'Username already exists',
}

// Playroom can be initialized only once per page load: leaving a room means reloading the page
let connection: Promise<void> | undefined
let host: Host | undefined
const players = new Map<string, PlayerState>()

export function hasSession() {
  return !!connection
}

export function connect({ roomCode, username, training, countdown }: ConnectOptions) {
  connection ??= insertCoin(
    {
      gameId: import.meta.env.VITE_PLAYROOM_GAME_ID,
      roomCode,
      skipLobby: true,
      maxPlayersPerRoom: training ? 1 : gridConfig.large.maxPlayers,
    },
    undefined,
    error => leave(ERRORS[error.message] ?? error.message ?? 'Connection lost'),
  ).then(() => {
    syncRoomState()
    myPlayer().setState(PLAYER.username, username, true)

    if (isHost() && !getState(STATE.stage)) {
      const config: GameConfigSchema = { training, countdown }
      setState(STATE.config, config, true)
      setState(STATE.stage, 'lobby', true)
    }

    onPlayerJoin(player => {
      players.set(player.id, player)
      host?.onPlayerJoin(player)

      player.onQuit(() => {
        players.delete(player.id)
        host?.onPlayerQuit(player)
      })
    })

    RPC.register(RPC_EVENTS.start, async () => host?.start())
    RPC.register(RPC_EVENTS.fell, async (_, sender) => host?.onPlayerFell(sender))

    electHost()
    window.setInterval(electHost, 250)
  })

  connection.catch(() => {}) // handled by the error callback
  return connection
}

export function leave(notification?: string) {
  if (notification) sessionStorage.setItem(PENDING_NOTIFICATION_KEY, notification)

  // Playroom persists the player id: rejoining with it restores the previous player state (e.g. a duplicated username)
  sessionStorage.removeItem(PLAYROOM_PLAYER_ID_KEY)
  window.location.assign('/')
}

export function consumePendingNotification() {
  const notification = sessionStorage.getItem(PENDING_NOTIFICATION_KEY)
  sessionStorage.removeItem(PENDING_NOTIFICATION_KEY)
  return notification
}

export function requestStart() {
  RPC.call(RPC_EVENTS.start, null, RPC.Mode.HOST)
}

export function notifyFell() {
  RPC.call(RPC_EVENTS.fell, null, RPC.Mode.HOST)
}

// A single room state listener: Playroom's `useMultiplayerState` adds one emitter listener per hook
function syncRoomState() {
  const keys = Object.keys(initialRoomState) as (keyof RoomState)[]
  const read = (key: keyof RoomState) => getState(key) ?? initialRoomState[key]

  useRoomState.setState(Object.fromEntries(keys.map(key => [key, read(key)])))

  Multiplayer().on('state', (_, key) => {
    if (key in initialRoomState) useRoomState.setState({ [key]: read(key as keyof RoomState) })
  })
}

// Playroom migrates the host when it leaves, the new one takes over the room logic
function electHost() {
  if (isHost() && !host) {
    host = new Host(() => [...players.values()])
  } else if (!isHost() && host) {
    host.dispose()
    host = undefined
  }
}
