// Global room state, written by the host only
export const STATE = {
  config: 'config',
  stage: 'stage',
  lobby: 'lobby',
  countdown: 'countdown',
  time: 'time',
  phase: 'phase',
  dimension: 'dimension',
  tiles: 'tiles',
  players: 'players',
  leaderboard: 'leaderboard',
  loop: 'loop',
} as const

// Per-player state, written by each player on its own state (except `body`, written by the host)
export const PLAYER = {
  username: 'username',
  inLobby: 'inLobby',
  // page hidden: not picked as the next host
  away: 'away',
  input: 'input',
  body: 'body',
} as const

export const RPC_EVENTS = {
  start: 'start',
} as const
