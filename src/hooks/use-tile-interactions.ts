import { useSpring } from '@react-spring/three'
import { useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { BOUNCY_CONFIG } from '@utils'
import { useState } from 'react'
import { MathUtils } from 'three'

// hover state with pointer cursor, plus the handlers to spread on the hovered object
export function useHover(disabled = false) {
  const [hovered, setHovered] = useState(false)
  const active = hovered && !disabled
  useCursor(active)

  const handlers = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (disabled) return
      setHovered(true)
      e.stopPropagation()
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      if (disabled) return
      setHovered(false)
      e.stopPropagation()
    },
  }

  return [active, handlers] as const
}

// full turn animation triggered on demand, starting from `base` degrees
export function useSpin(base = 0, direction: 1 | -1 = 1) {
  const [spins, setSpins] = useState(0)

  const { rotation } = useSpring({
    rotation: MathUtils.degToRad(base + direction * spins * 360),
    config: BOUNCY_CONFIG,
  })

  const spin = () => setSpins(s => s + 1)

  return [rotation, spin] as const
}
