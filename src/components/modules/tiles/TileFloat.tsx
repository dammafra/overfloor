import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef, type JSX } from 'react'
import { MathUtils, type Group } from 'three'

// state of the floating motion: a tile taking the place of another one carries on from it
export type TileMotion = {
  // rotation of the tile on itself, and floating up and down
  phase: number
  speed: number
  rotation: number
  float: number
  // rotation of the tile around the origin
  orbitPhase: number
  orbit: number
  // speed factor of the rotations, so the tiles do not move all alike
  pace: number
}

const FLOAT = { speed: 5, intensity: 0.5 }
const ROTATE = { speed: 0.8, intensity: 5 }
const ORBIT = { speed: 0.1, intensity: 5 }
const PACE = { min: 0.5, max: 1.5 }
// how fast the motion settles when `float` or `rotate` change: the rotation sets in slowly, along
// with the tiles spreading in the lobby, and stops quickly, as the tiles gather in the grid
const DAMPING = { rotateIn: 1, rotateOut: 4 }

export type TileFloatProps = JSX.IntrinsicElements['group'] & {
  float?: boolean
  // rotating on itself and around the origin
  rotate?: boolean
  // motion to carry on from, read when mounting
  motionFrom?: TileMotion
  // receives the live motion of this tile, to hand it over later
  onMotion?: (motion: TileMotion) => void
}

// same rotation as drei's `Float`
const setRotation = (group: Group, phase: number, intensity: number) => {
  const cos = Math.cos(phase)
  const sin = Math.sin(phase)
  group.rotation.set((cos / 8) * intensity, (sin / 8) * intensity, (sin / 20) * intensity)
}

/**
 * Same motion as drei's `Float` with the tiles settings, but changes of `float` and `rotate`
 * are eased instead of snapping. The tile rotates on itself, at its position, and around the
 * origin, each tile at its own pace.
 */
export function TileFloat({
  float = true,
  rotate = false,
  motionFrom,
  onMotion,
  children,
  ...props
}: TileFloatProps) {
  const orbitRef = useRef<Group>(null)
  const ref = useRef<Group>(null)

  const target = {
    speed: rotate ? ROTATE.speed : float ? FLOAT.speed : 0,
    rotation: rotate ? ROTATE.intensity : 0,
    float: rotate || float ? FLOAT.intensity : 0,
    orbit: rotate ? ORBIT.intensity : 0,
  }

  const stateRef = useRef<TileMotion>(null)
  stateRef.current ??= motionFrom
    ? { ...motionFrom }
    : {
        phase: Math.random() * 10000,
        speed: target.speed,
        rotation: 0,
        float: target.float,
        orbitPhase: Math.random() * 10000,
        orbit: 0,
        pace: MathUtils.randFloat(PACE.min, PACE.max),
      }

  useLayoutEffect(() => {
    if (stateRef.current) onMotion?.(stateRef.current)
  }, [onMotion])

  useFrame((_, delta) => {
    const state = stateRef.current
    const orbitGroup = orbitRef.current
    const group = ref.current
    if (!state || !orbitGroup || !group) return

    const speed = rotate ? target.speed * state.pace : target.speed
    const damping = rotate ? DAMPING.rotateIn : DAMPING.rotateOut
    state.speed = MathUtils.damp(state.speed, speed, damping, delta)
    state.rotation = MathUtils.damp(state.rotation, target.rotation, damping, delta)
    state.float = MathUtils.damp(state.float, target.float, damping, delta)
    state.orbit = MathUtils.damp(state.orbit, target.orbit, damping, delta)
    state.phase += (delta * state.speed) / 4
    state.orbitPhase += (delta * ORBIT.speed * state.pace) / 4

    setRotation(orbitGroup, state.orbitPhase, state.orbit)
    orbitGroup.updateMatrix()

    setRotation(group, state.phase, state.rotation)
    group.position.y = (Math.sin(state.phase) / 10) * state.float
    group.updateMatrix()
  })

  return (
    <group ref={orbitRef} matrixAutoUpdate={false}>
      <group {...props}>
        <group ref={ref} matrixAutoUpdate={false}>
          {children}
        </group>
      </group>
    </group>
  )
}
