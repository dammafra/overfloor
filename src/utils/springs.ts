import { easings } from '@react-spring/web'

// Spring presets shared by the 3D scene and the HTML overlays

export const BOUNCY_CONFIG = { mass: 1, tension: 120, friction: 15 }

// fast enough to show every countdown color even at the shortest phase duration
export const COLOR_CONFIG = { duration: 100 }

export const POP_CONFIG = { tension: 300, friction: 20 }

// the menu tiles spreading in the lobby: slow at first, to see them leave their place
export const SPREAD_CONFIG = { duration: 2500, easing: easings.easeInOutCubic }

// falling tiles drop out of sight, gone before the next loop brings them back
export const DROP_DEPTH = 8

export const DROP_CONFIG = { duration: 450, easing: easings.easeInCubic }

export const POP_TRANSITION = {
  from: { scale: 0, opacity: 0 },
  enter: { scale: 1, opacity: 1 },
  leave: { scale: 0, opacity: 0 },
  config: POP_CONFIG,
}
