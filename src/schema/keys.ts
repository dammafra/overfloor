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

// Per-player state, written by each player on its own state
export const PLAYER = {
  username: 'username',
  inLobby: 'inLobby',
  walking: 'walking',
  position: 'position',
  rotation: 'rotation',
} as const

export const RPC_EVENTS = {
  start: 'start',
  fell: 'fell',
} as const
