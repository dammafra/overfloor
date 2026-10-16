import {
  gridConfig,
  PLAYER,
  RPC_EVENTS,
  STATE,
  type CharacterLookSchema,
  type GameConfigSchema,
  type PlayerProfileSchema,
} from '@schema'
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
  transferHost,
  type InitOptions,
  type PlayerState,
} from 'playroomkit'
import { useSyncExternalStore } from 'react'
import { navigate } from 'wouter/use-browser-location'
import { Host, PRACTICE_BOTS } from './host'
import { playerProfile } from './player'

interface ConnectOptions extends GameConfigSchema, CharacterLookSchema {
  roomCode?: string
  username: string
}

interface Session {
  connection: Promise<void>
  connected: boolean
  host?: Host
  players: Map<string, PlayerState>
  // own player state, set again when a host sync overwrites it (e.g. the host lost it on a reconnection)
  myState: Record<string, unknown>
  // profiles of the players waiting in the lobby, latest first
  lobbyPlayers: PlayerProfileSchema[]
  // Playroom listeners outlive `Multiplayer.reset`: they subscribe again on every `insertCoin`
  unsubscribes: (() => void)[]
  electInterval?: number
  // Playroom mounts its own (hidden, with `skipLobby`) React root in the body
  playroomRoot?: Element
}

const PLAYROOM_PLAYER_ID_KEY = 'myId'
const PLAYROOM_ROOM_HASH_KEY = 'r'
const NO_PLAYERS: PlayerProfileSchema[] = []

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

export function connect({ roomCode, username, practice, countdown, ...look }: ConnectOptions) {
  if (session) return session.connection

  const current: Session = {
    connection: Promise.resolve(),
    connected: false,
    players: new Map(),
    myState: {},
    lobbyPlayers: NO_PLAYERS,
    unsubscribes: [],
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
          // practice: the player and the bots
          maxPlayersPerRoom: practice ? 1 + PRACTICE_BOTS : gridConfig.large.maxPlayers,
          // untyped: sent to the server as `profile_*` params (`profile_name` only, no `profile_photo`)
          profile: { name: username },
        } as InitOptions,
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

      syncRoomState(current)
      setMyState(PLAYER.profile, {
        ...myPlayer().getState(PLAYER.profile),
        name: username,
        ...look,
      })
      setMyState(PLAYER.away, document.hidden)

      if (isHost() && !getState(STATE.stage)) {
        const config: GameConfigSchema = { practice, countdown }
        setState(STATE.config, config, true)
        setState(STATE.stage, 'lobby', true)
      }

      const unsubscribeJoin = onPlayerJoin(player => {
        current.players.set(player.id, player)
        current.host?.onPlayerJoin(player)
        updateLobbyPlayers(current)

        const unsubscribeState = player.on('state', (key, value) => {
          if (player.id === myPlayer()?.id) restoreMyState(current, key, value)
          if (key === PLAYER.profile || key === PLAYER.inLobby) updateLobbyPlayers(current)
        })

        player.onQuit(() => {
          unsubscribeState()
          // a player reconnecting with the same id may have joined again already
          if (current.players.get(player.id) === player) current.players.delete(player.id)
          current.host?.onPlayerQuit(player)
          updateLobbyPlayers(current)
        })
      })

      const unsubscribeStart = RPC.register(RPC_EVENTS.start, async () => current.host?.start())

      const onVisibilityChange = () => {
        setMyState(PLAYER.away, document.hidden)
        if (document.hidden) handOverHost(current)
      }
      document.addEventListener('visibilitychange', onVisibilityChange)

      current.unsubscribes.push(unsubscribeJoin, unsubscribeStart, () =>
        document.removeEventListener('visibilitychange', onVisibilityChange),
      )

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

// own player state: kept in the session so a host sync cannot lose it
export function setMyState(key: string, value: unknown) {
  if (!session?.connected) return
  session.myState[key] = value
  myPlayer().setState(key, value, true)
}

export function requestStart() {
  RPC.call(RPC_EVENTS.start, null, RPC.Mode.HOST)
}

// host only: the host simulates every player and detects their falls
export function reportFell(id: string) {
  session?.host?.onPlayerFell(id)
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach(listener => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// whether this client is the host, i.e. simulates the players
export function useIsHost() {
  return useSyncExternalStore(subscribe, () => !!session?.host)
}

// players waiting in the lobby, latest first
export function useLobbyPlayers() {
  return useSyncExternalStore(subscribe, () => session?.lobbyPlayers ?? NO_PLAYERS)
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
  current.unsubscribes.forEach(unsubscribe => unsubscribe())
  current.unsubscribes = []
  current.host?.dispose()
  current.host = undefined
  current.players.clear()
  current.lobbyPlayers = NO_PLAYERS
  notify()

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
function syncRoomState(current: Session) {
  const keys = Object.keys(initialRoomState) as (keyof RoomState)[]
  const read = (key: keyof RoomState) => getState(key) ?? initialRoomState[key]

  useRoomState.setState(Object.fromEntries(keys.map(key => [key, read(key)])))

  const unsubscribe = Multiplayer().on('state', (_, key) => {
    if (key in initialRoomState) useRoomState.setState({ [key]: read(key as keyof RoomState) })
  })
  current.unsubscribes.push(unsubscribe)
}

function updateLobbyPlayers(current: Session) {
  const players = [...current.players.values()]
    .filter(p => p.getState(PLAYER.inLobby))
    .map(playerProfile)
    .filter(p => !!p.username)
    .reverse()

  if (JSON.stringify(players) === JSON.stringify(current.lobbyPlayers)) return

  current.lobbyPlayers = players
  notify()
}

function restoreMyState(current: Session, key: string, value: unknown) {
  if (!(key in current.myState) || value === current.myState[key]) return
  queueMicrotask(() => {
    if (session === current) myPlayer()?.setState(key, current.myState[key], true)
  })
}

// A hidden page throttles its timers (on mobile it is suspended): the host hands the room over to a visible player
function handOverHost(current: Session) {
  if (!current.host) return

  // the bots never set `away`
  const me = myPlayer()?.id
  const next = [...current.players.values()].find(p => p.id !== me && p.getState(PLAYER.away) === false) //oxfmt-ignore
  if (!next) return

  transferHost(next.id)
    .then(() => session === current && electHost(current))
    .catch(() => {})
}

// Playroom migrates the host when it leaves, the new one takes over the room logic
function electHost(current: Session) {
  if (isHost() && !current.host) {
    current.host = new Host(() => [...current.players.values()])
  } else if (!isHost() && current.host) {
    current.host.dispose()
    current.host = undefined
  } else return

  notify()
}
