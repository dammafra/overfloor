import {
  gridConfig,
  PLAYER,
  RPC_EVENTS,
  STATE,
  type CharacterLookSchema,
  type GameConfigSchema,
  type LobbySchema,
  type PlayerProfileSchema,
} from '@schema'
import { initialRoomState, useNotification, useRoomState, type RoomState } from '@stores'
import { isTouchDevice } from '@utils'
import {
  getState,
  insertCoin,
  isHost,
  Multiplayer,
  myPlayer,
  RPC,
  setState,
  transferHost,
  type InitOptions,
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
  // ids of the players known at the last tick
  playerIds: Set<string>
  // own player state, set again when a host sync overwrites it (e.g. the host lost it on a reconnection)
  myState: Record<string, unknown>
  // profiles of the players waiting in the lobby, latest first
  lobbyPlayers: PlayerProfileSchema[]
  // Playroom listeners outlive `Multiplayer.reset`: they subscribe again on every `insertCoin`
  unsubscribes: (() => void)[]
  tickInterval?: number
  // Playroom mounts its own (hidden, with `skipLobby`) React root in the body
  playroomRoot?: Element
}

const PLAYROOM_PLAYER_ID_KEY = 'myId'
const PLAYROOM_ROOM_HASH_KEY = 'r'
const NO_PLAYERS: PlayerProfileSchema[] = []
const TICK_INTERVAL = 250 //ms
// host syncs in a row (one every 3s) without this player before it joins again
const MISSING_SYNCS = 2
// closing the socket with a code Playroom does not handle makes it reconnect, i.e. join again with the same id
const REJOIN_CODE = 3000
// how long a hidden host keeps the room
const HAND_OVER_DELAY = { lobby: 5000, game: 1000 } //ms

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
    playerIds: new Set(),
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
      watchMyPlayer(current)
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

      const unsubscribeStart = RPC.register(RPC_EVENTS.start, async () => current.host?.start())

      let handOver: number | undefined
      const onVisibilityChange = () => {
        setMyState(PLAYER.away, document.hidden)
        clearTimeout(handOver)
        if (document.hidden) handOver = window.setTimeout(() => handOverHost(current), handOverDelay()) //oxfmt-ignore
      }
      document.addEventListener('visibilitychange', onVisibilityChange)

      current.unsubscribes.push(unsubscribeStart, () => {
        clearTimeout(handOver)
        document.removeEventListener('visibilitychange', onVisibilityChange)
      })

      tick(current)
      current.tickInterval = window.setInterval(() => tick(current), TICK_INTERVAL)
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
  clearInterval(current.tickInterval)
  current.unsubscribes.forEach(unsubscribe => unsubscribe())
  current.unsubscribes = []
  current.host?.dispose()
  current.host = undefined
  current.playerIds.clear()
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

// Keeps this player in the room, whatever the host lost
function watchMyPlayer(current: Session) {
  const me = myPlayer()
  const connection = Multiplayer().connection!

  const unsubscribeState = me.on('state', (key, value) => restoreMyState(current, key, value))

  // the host drops the players not answering its roll calls
  const answerRollCall = () => {
    if (!isHost()) me.setState(PLAYER.rollCall, getState(STATE.rollCall), true)
  }
  const unsubscribeRollCall = Multiplayer().on('state', (_, key) => {
    if (key === STATE.rollCall) answerRollCall()
  })
  answerRollCall()

  // Playroom loses the join of a player while the host changes (or the host dropped it): the host never syncs it
  let missingSyncs = 0
  const unsubscribeSync = connection.on('sync', sync => {
    const known = isHost() || !!sync.__players?.[me.id] || !!sync.waitingPlayers?.includes(me.id)
    missingSyncs = known ? 0 : missingSyncs + 1
    if (missingSyncs < MISSING_SYNCS) return

    missingSyncs = 0
    connection.ws?.close(REJOIN_CODE)
  })

  current.unsubscribes.push(unsubscribeState, unsubscribeRollCall, unsubscribeSync)
}

// the players known to this client, read from Playroom: a player quitting before its profile arrives never fires `onQuit`
function roster() {
  return Object.values(Multiplayer().connection?.playerStates ?? {})
}

function tick(current: Session) {
  electHost(current)

  // joins and quits since the last tick
  const players = roster()
  const ids = new Set(players.map(p => p.id))
  current.playerIds.forEach(id => !ids.has(id) && current.host?.onPlayerQuit(id))
  players.forEach(p => !current.playerIds.has(p.id) && current.host?.onPlayerJoin(p))
  current.playerIds = ids

  current.host?.refreshLobby()
  updateLobbyPlayers(current)
}

// the players counted by the host, so that everyone sees the same lobby
function updateLobbyPlayers(current: Session) {
  const lobby: LobbySchema | undefined = getState(STATE.lobby)
  const players = new Map(roster().map(p => [p.id, p]))
  const profiles = (lobby?.players ?? [])
    .map(id => players.get(id))
    .filter(p => !!p)
    .map(playerProfile)
    .filter(p => !!p.username)
    .reverse()

  if (JSON.stringify(profiles) === JSON.stringify(current.lobbyPlayers)) return

  current.lobbyPlayers = profiles
  notify()
}

function restoreMyState(current: Session, key: string, value: unknown) {
  if (!(key in current.myState) || value === current.myState[key]) return
  queueMicrotask(() => {
    if (session === current) myPlayer()?.setState(key, current.myState[key], true)
  })
}

// Every host change can lose a join or a quit: a hidden host keeps the room for a while, in case it comes back
function handOverDelay() {
  // a hidden mobile page is suspended, its timers do not run
  if (isTouchDevice()) return 0
  // the host simulates the match on animation frames, which stop on a hidden page
  return getState(STATE.stage) === 'game' ? HAND_OVER_DELAY.game : HAND_OVER_DELAY.lobby
}

// A hidden page throttles its timers (on mobile it is suspended): the host hands the room over to a visible player
function handOverHost(current: Session) {
  const { host } = current
  if (!host) return

  // the bots never set `away`
  const me = myPlayer()?.id
  const next = roster().find(p => p.id !== me && p.getState(PLAYER.away) === false && host.isResponsive(p.id)) //oxfmt-ignore
  if (!next) return

  transferHost(next.id)
    .then(() => session === current && electHost(current))
    .catch(() => {})
}

// Playroom migrates the host when it leaves, the new one takes over the room logic
function electHost(current: Session) {
  if (isHost() && !current.host) {
    current.host = new Host(roster)
  } else if (!isHost() && current.host) {
    current.host.dispose()
    current.host = undefined
  } else return

  notify()
}
