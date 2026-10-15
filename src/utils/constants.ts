export const FONT = '/fonts/audiowide.ttf'
export const FONT_3D = '/fonts/audiowide.json'

export const CAMERA_FOV = 45

export const COLORS = {
  tile: 'dodgerblue',
  button: 'orange',
  go: 'limegreen',
  ready: 'orange',
  danger: 'brown',
} as const

export const ROUTES = {
  home: '/',
  room: '/room/:id?',
  credits: '/credits',
  lobby: '/lobby/:options',
  game: '/game',
} as const
