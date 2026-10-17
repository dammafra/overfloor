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
  // positions of the match players, simulated by the host
  bodies: 'bodies',
  // bumped by the host, every player answers it: the ones not answering are gone
  rollCall: 'rollCall',
} as const

// Per-player state, written by each player on its own state
export const PLAYER = {
  // Playroom's profile: the username as `name`, and the look of the character (`CharacterLookSchema`)
  profile: 'profile',
  inLobby: 'inLobby',
  // page hidden: not picked as the next host
  away: 'away',
  // Playroom's joystick keys, written by `Controller`
  joystick: 'ctr-joystick',
  angle: 'ctr-angle',
  // last `STATE.rollCall` answered
  rollCall: 'rollCall',
} as const

export const RPC_EVENTS = {
  start: 'start',
} as const
