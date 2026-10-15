export const FONT = '/fonts/audiowide.ttf'
export const FONT_3D = '/fonts/audiowide.json'

export const COLORS = {
  tile: 'dodgerblue',
  button: 'orange',
  go: 'limegreen',
  ready: 'orange',
  danger: 'brown',
} as const

export const ROUTES = {
  home: '/',
  create: '/new',
  join: '/join/:id?',
  credits: '/credits',
  lobby: '/:from/lobby/:options',
  game: '/game',
} as const
