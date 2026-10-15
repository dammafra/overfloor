import { a, type FrameValue } from '@react-spring/three'
import type { ComponentType } from 'react'

type AnimatableProps<P> = {
  [K in keyof P]: K extends 'ref' | 'key' ? P[K] : P[K] | FrameValue<Exclude<P[K], void>>
}

/**
 * Same as `a(Component)`, with looser prop types: react-spring's `AnimatedProps`
 * rejects springs of array values (e.g. `SpringValue<Vector3Tuple>` for `position`)
 * even though they work at runtime.
 */
export function animatable<P extends object>(component: ComponentType<P>) {
  return a(component) as unknown as ComponentType<AnimatableProps<P>>
}
