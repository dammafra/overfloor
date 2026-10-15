// Spring presets shared by the 3D scene and the HTML overlays

export const BOUNCY_CONFIG = { mass: 1, tension: 120, friction: 15 }

export const POP_CONFIG = { tension: 300, friction: 20 }

export const POP_TRANSITION = {
  from: { scale: 0, opacity: 0 },
  enter: { scale: 1, opacity: 1 },
  leave: { scale: 0, opacity: 0 },
  config: POP_CONFIG,
}
