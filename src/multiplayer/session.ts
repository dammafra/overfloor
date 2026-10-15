import { gridConfig, PLAYER, RPC_EVENTS, STATE, type GameConfigSchema } from '@schema'
import { initialRoomState, useNotification, useRoomState, type RoomState } from '@stores'
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
import { useSyncExternalStore } from 'react'
import { navigate } from 'wouter/use-browser-location'
import { Host } from './host'

interface ConnectOptions extends GameConfigSchema {
  roomCode?: string
  username: string
}

interface Session {
  connection: Promise<void>
  connected: boolean
  host?: Host
  players: Map<string, PlayerState>
  electInterval?: number
  // Playroom mounts its own (hidden, with `skipLobby`) React root in the body
  playroomRoot?: Element
}

const PLAYROOM_PLAYER_ID_KEY = 'myId'
const PLAYROOM_ROOM_HASH_KEY = 'r'

const ERRORS: Record<string, string> = {
  ROOM_LIMIT_EXCEEDED: 'Room is full',
  PLAYER_KICKED: 'Username already exists',
}

let session: Session | undefined
// teardown of a session left while still connecting, the next one waits for it
let pendingTeardown: Promise<void> = Promise.resolve()

export function hasSession() {
  return !!session
}

export function connect({ roomCode, username, practice, countdown }: ConnectOptions) {
  if (session) return session.connection

  const current: Session = {
    connection: Promise.resolve(),
    connected: false,
    players: new Map(),
  }
  session = current

  current.connection = pendingTeardown
    .then(() => {
      const before = new Set(document.body.children)
      const coin = insertCoin(
        {
          gameId: import.meta.env.VITE_PLAYROOM_GAME_ID,
          roomCode,
          skipLobby: true,
          // practice: the player and the bot
          maxPlayersPerRoom: practice ? 2 : gridConfig.large.maxPlayers,
        },
        undefined,
        error => fail(current, ERRORS[error.message] ?? error.message ?? 'Connection lost'),
      )
      current.playroomRoot = [...document.body.children].find(el => !before.has(el))
      return coin
    })
    .then(() => {
      current.connected = true

      // left while connecting
      if (session !== current) return teardown(current)

      syncRoomState()
      myPlayer().setState(PLAYER.username, username, true)

      if (isHost() && !getState(STATE.stage)) {
        const config: GameConfigSchema = { practice, countdown }
        setState(STATE.config, config, true)
        setState(STATE.stage, 'lobby', true)
      }

      onPlayerJoin(player => {
        current.players.set(player.id, player)
        current.host?.onPlayerJoin(player)

        player.onQuit(() => {
          current.players.delete(player.id)
          current.host?.onPlayerQuit(player)
        })
      })

      RPC.register(RPC_EVENTS.start, async () => current.host?.start())

      electHost(current)
      current.electInterval = window.setInterval(() => electHost(current), 250)
    })

  current.connection.catch(() => {}) // handled by the error callback
  return current.connection
}

export function leave() {
  const current = session
  if (!current) return
  session = undefined

  // still connecting: torn down as soon as the connection settles
  if (!current.connected) {
    pendingTeardown = current.connection.catch(() => {})
    return
  }

  teardown(current)
}

export function requestStart() {
  RPC.call(RPC_EVENTS.start, null, RPC.Mode.HOST)
}

// host only: the host simulates every player and detects their falls
export function reportFell(id: string) {
  session?.host?.onPlayerFell(id)
}

const hostListeners = new Set<() => void>()
const notifyHostChange = () => hostListeners.forEach(listener => listener())

// whether this client is the host, i.e. simulates the players
export function useIsHost() {
  return useSyncExternalStore(
    listener => {
      hostListeners.add(listener)
      return () => hostListeners.delete(listener)
    },
    () => !!session?.host,
  )
}

function fail(current: Session, message: string) {
  if (session === current) session = undefined
  teardown(current)

  useNotification.getState().notify({ message, type: 'error' })
  navigate('/', { replace: true })
}

/**
 * Playroom is meant to be initialized once per page load: this resets its client
 * so `insertCoin` can join another room without reloading the page.
 */
function teardown(current: Session) {
  clearInterval(current.electInterval)
  current.host?.dispose()
  current.host = undefined
  current.players.clear()
  notifyHostChange()

  const client = Multiplayer()
  if (client.connection) client.leaveRoom()
  Multiplayer.reset()

  // `insertCoin` bails out while this flag is set
  delete (window as { __playroomjs_mounted?: boolean }).__playroomjs_mounted
  current.playroomRoot?.remove()

  // Playroom persists the player id: rejoining with it restores the previous player state (e.g. a duplicated username)
  sessionStorage.removeItem(PLAYROOM_PLAYER_ID_KEY)
  clearRoomHash()

  useRoomState.setState(initialRoomState, true)
}

// Playroom stores the room code in the URL hash and prefers it over `roomCode` when joining
function clearRoomHash() {
  const params = new URLSearchParams(window.location.hash.slice(1))
  if (!params.has(PLAYROOM_ROOM_HASH_KEY)) return

  params.delete(PLAYROOM_ROOM_HASH_KEY)
  const hash = params.toString()
  const { pathname, search } = window.location
  history.replaceState(history.state, '', pathname + search + (hash ? `#${hash}` : ''))
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
function electHost(current: Session) {
  if (isHost() && !current.host) {
    current.host = new Host(() => [...current.players.values()])
  } else if (!isHost() && current.host) {
    current.host.dispose()
    current.host = undefined
  } else return

  notifyHostChange()
}
